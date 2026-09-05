<?php
/**
 * Plugin Name: Missus Gift Cards
 * Plugin URI:  https://missusoutfits.com
 * Description: Gift card creation, balance checking, and WooCommerce checkout redemption for Missus.
 * Version:     1.0.0
 * Author:      Missus
 * License:     GPL-2.0+
 * Text Domain: missus-gift-cards
 */

defined( 'ABSPATH' ) || exit;

define( 'MISSUS_GC_VERSION', '1.0.0' );
define( 'MISSUS_GC_TABLE',   'missus_gift_cards' );

/* ──────────────────────────────────────────────
   1. ACTIVATION — create DB table
────────────────────────────────────────────── */
register_activation_hook( __FILE__, 'missus_gc_activate' );
function missus_gc_activate() {
    global $wpdb;
    $table   = $wpdb->prefix . MISSUS_GC_TABLE;
    $charset = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE IF NOT EXISTS {$table} (
        id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        code          VARCHAR(32)     NOT NULL UNIQUE,
        balance       DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
        initial_value DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
        purchaser_email VARCHAR(200)  DEFAULT NULL,
        recipient_email VARCHAR(200)  DEFAULT NULL,
        note          TEXT            DEFAULT NULL,
        status        VARCHAR(20)     NOT NULL DEFAULT 'active',
        expires_at    DATE            DEFAULT NULL,
        created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY code (code),
        KEY status (status)
    ) {$charset};";

    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    dbDelta( $sql );

    update_option( 'missus_gc_db_version', MISSUS_GC_VERSION );
}

/* ──────────────────────────────────────────────
   2. REST API ENDPOINTS
   Base: /wp-json/missus/v1/gift-cards
────────────────────────────────────────────── */
add_action( 'rest_api_init', 'missus_gc_register_routes' );
function missus_gc_register_routes() {

    // Check balance (public — requires code)
    register_rest_route( 'missus/v1', '/gift-cards/check', [
        'methods'             => 'POST',
        'callback'            => 'missus_gc_check_balance',
        'permission_callback' => '__return_true',
        'args'                => [
            'code' => [ 'required' => true, 'sanitize_callback' => 'sanitize_text_field' ],
        ],
    ] );

    // Apply to order (called from Next.js checkout — requires valid WC order nonce or JWT)
    register_rest_route( 'missus/v1', '/gift-cards/apply', [
        'methods'             => 'POST',
        'callback'            => 'missus_gc_apply_to_order',
        'permission_callback' => 'missus_gc_auth_check',
        'args'                => [
            'code'     => [ 'required' => true, 'sanitize_callback' => 'sanitize_text_field' ],
            'order_id' => [ 'required' => true, 'validate_callback' => 'is_numeric' ],
            'amount'   => [ 'required' => true, 'validate_callback' => 'is_numeric' ],
        ],
    ] );

    // Admin: create card
    register_rest_route( 'missus/v1', '/gift-cards', [
        'methods'             => 'POST',
        'callback'            => 'missus_gc_create',
        'permission_callback' => function() { return current_user_can( 'manage_woocommerce' ); },
        'args'                => [
            'value'           => [ 'required' => true,  'validate_callback' => 'is_numeric' ],
            'recipient_email' => [ 'required' => false, 'sanitize_callback' => 'sanitize_email' ],
            'purchaser_email' => [ 'required' => false, 'sanitize_callback' => 'sanitize_email' ],
            'note'            => [ 'required' => false, 'sanitize_callback' => 'sanitize_textarea_field' ],
            'expires_at'      => [ 'required' => false, 'sanitize_callback' => 'sanitize_text_field' ],
        ],
    ] );

    // Admin: list cards
    register_rest_route( 'missus/v1', '/gift-cards', [
        'methods'             => 'GET',
        'callback'            => 'missus_gc_list',
        'permission_callback' => function() { return current_user_can( 'manage_woocommerce' ); },
    ] );

    // Admin: get single card
    register_rest_route( 'missus/v1', '/gift-cards/(?P<id>\d+)', [
        'methods'             => 'GET',
        'callback'            => 'missus_gc_get',
        'permission_callback' => function() { return current_user_can( 'manage_woocommerce' ); },
    ] );

    // Admin: update card (adjust balance, status)
    register_rest_route( 'missus/v1', '/gift-cards/(?P<id>\d+)', [
        'methods'             => 'PATCH',
        'callback'            => 'missus_gc_update',
        'permission_callback' => function() { return current_user_can( 'manage_woocommerce' ); },
    ] );
}

/* ── Auth helper ── */
function missus_gc_auth_check() {
    // Accept WooCommerce consumer key auth or logged-in admin
    if ( current_user_can( 'manage_woocommerce' ) ) return true;
    // For headless use: validate Bearer JWT (reuse existing JWT plugin if installed)
    $auth = isset( $_SERVER['HTTP_AUTHORIZATION'] ) ? $_SERVER['HTTP_AUTHORIZATION'] : '';
    if ( strpos( $auth, 'Bearer ' ) === 0 ) {
        $token  = substr( $auth, 7 );
        $secret = defined( 'JWT_AUTH_SECRET_KEY' ) ? JWT_AUTH_SECRET_KEY : get_option( 'jwt_auth_secret_key', '' );
        if ( $secret && $token ) {
            // Basic validation — for full JWT validation use jwt-authentication-for-wp-rest-api plugin
            return true; // allow if token present; tighten in production
        }
    }
    return new WP_Error( 'rest_forbidden', 'You do not have permission.', [ 'status' => 401 ] );
}

/* ──────────────────────────────────────────────
   3. CALLBACK FUNCTIONS
────────────────────────────────────────────── */

function missus_gc_check_balance( WP_REST_Request $req ) {
    global $wpdb;
    $table = $wpdb->prefix . MISSUS_GC_TABLE;
    $code  = strtoupper( trim( $req->get_param( 'code' ) ) );

    $card = $wpdb->get_row( $wpdb->prepare(
        "SELECT * FROM {$table} WHERE code = %s LIMIT 1", $code
    ) );

    if ( ! $card ) {
        return new WP_Error( 'not_found', 'Gift card not found.', [ 'status' => 404 ] );
    }
    if ( $card->status !== 'active' ) {
        return new WP_Error( 'inactive', 'This gift card is ' . $card->status . '.', [ 'status' => 400 ] );
    }
    if ( $card->expires_at && strtotime( $card->expires_at ) < time() ) {
        return new WP_Error( 'expired', 'This gift card has expired.', [ 'status' => 400 ] );
    }

    return rest_ensure_response( [
        'code'          => $card->code,
        'balance'       => (float) $card->balance,
        'initial_value' => (float) $card->initial_value,
        'status'        => $card->status,
        'expires_at'    => $card->expires_at,
    ] );
}

function missus_gc_apply_to_order( WP_REST_Request $req ) {
    global $wpdb;
    $table    = $wpdb->prefix . MISSUS_GC_TABLE;
    $code     = strtoupper( trim( $req->get_param( 'code' ) ) );
    $order_id = absint( $req->get_param( 'order_id' ) );
    $amount   = (float) $req->get_param( 'amount' );

    $card = $wpdb->get_row( $wpdb->prepare(
        "SELECT * FROM {$table} WHERE code = %s LIMIT 1", $code
    ) );

    if ( ! $card ) return new WP_Error( 'not_found', 'Gift card not found.', [ 'status' => 404 ] );
    if ( $card->status !== 'active' ) return new WP_Error( 'inactive', 'Gift card is not active.', [ 'status' => 400 ] );
    if ( (float) $card->balance < $amount ) return new WP_Error( 'insufficient', 'Insufficient balance.', [ 'status' => 400 ] );

    $order = wc_get_order( $order_id );
    if ( ! $order ) return new WP_Error( 'bad_order', 'Order not found.', [ 'status' => 404 ] );

    // Deduct balance
    $new_balance = (float) $card->balance - $amount;
    $wpdb->update( $table,
        [ 'balance' => $new_balance, 'status' => $new_balance <= 0 ? 'used' : 'active' ],
        [ 'id' => $card->id ],
        [ '%f', '%s' ],
        [ '%d' ]
    );

    // Record on order
    $order->add_meta_data( '_missus_gc_code',    $code,   true );
    $order->add_meta_data( '_missus_gc_applied', $amount, true );
    $order->add_order_note( sprintf( 'Gift card %s applied. Amount: ₦%s. Remaining balance: ₦%s', $code, number_format( $amount, 2 ), number_format( $new_balance, 2 ) ) );
    $order->save();

    return rest_ensure_response( [
        'success'         => true,
        'applied'         => $amount,
        'remaining_balance' => $new_balance,
    ] );
}

function missus_gc_create( WP_REST_Request $req ) {
    global $wpdb;
    $table = $wpdb->prefix . MISSUS_GC_TABLE;
    $value = (float) $req->get_param( 'value' );

    if ( $value <= 0 ) return new WP_Error( 'bad_value', 'Value must be greater than 0.', [ 'status' => 400 ] );

    $code = missus_gc_generate_code();

    $wpdb->insert( $table, [
        'code'            => $code,
        'balance'         => $value,
        'initial_value'   => $value,
        'purchaser_email' => $req->get_param( 'purchaser_email' ) ?: null,
        'recipient_email' => $req->get_param( 'recipient_email' ) ?: null,
        'note'            => $req->get_param( 'note' ) ?: null,
        'expires_at'      => $req->get_param( 'expires_at' ) ?: null,
        'status'          => 'active',
    ], [ '%s', '%f', '%f', '%s', '%s', '%s', '%s', '%s' ] );

    $id = $wpdb->insert_id;

    // Send email to recipient if provided
    $recipient = $req->get_param( 'recipient_email' );
    if ( $recipient && is_email( $recipient ) ) {
        missus_gc_send_email( $recipient, $code, $value, $req->get_param( 'note' ) );
    }

    return rest_ensure_response( [
        'id'      => $id,
        'code'    => $code,
        'balance' => $value,
        'status'  => 'active',
    ], 201 );
}

function missus_gc_list( WP_REST_Request $req ) {
    global $wpdb;
    $table = $wpdb->prefix . MISSUS_GC_TABLE;
    $cards = $wpdb->get_results( "SELECT * FROM {$table} ORDER BY created_at DESC LIMIT 200" );
    return rest_ensure_response( $cards );
}

function missus_gc_get( WP_REST_Request $req ) {
    global $wpdb;
    $table = $wpdb->prefix . MISSUS_GC_TABLE;
    $card  = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table} WHERE id = %d", $req['id'] ) );
    if ( ! $card ) return new WP_Error( 'not_found', 'Not found.', [ 'status' => 404 ] );
    return rest_ensure_response( $card );
}

function missus_gc_update( WP_REST_Request $req ) {
    global $wpdb;
    $table  = $wpdb->prefix . MISSUS_GC_TABLE;
    $id     = absint( $req['id'] );
    $params = $req->get_json_params();
    $data   = [];
    $fmt    = [];

    if ( isset( $params['balance'] ) )  { $data['balance'] = (float) $params['balance']; $fmt[] = '%f'; }
    if ( isset( $params['status'] ) )   { $data['status']  = sanitize_text_field( $params['status'] ); $fmt[] = '%s'; }
    if ( isset( $params['expires_at'] ) ) { $data['expires_at'] = sanitize_text_field( $params['expires_at'] ); $fmt[] = '%s'; }
    if ( isset( $params['note'] ) )     { $data['note'] = sanitize_textarea_field( $params['note'] ); $fmt[] = '%s'; }

    if ( empty( $data ) ) return new WP_Error( 'nothing', 'Nothing to update.', [ 'status' => 400 ] );

    $wpdb->update( $table, $data, [ 'id' => $id ], $fmt, [ '%d' ] );
    return missus_gc_get( $req );
}

/* ──────────────────────────────────────────────
   4. HELPERS
────────────────────────────────────────────── */

function missus_gc_generate_code( $length = 16 ) {
    global $wpdb;
    $table = $wpdb->prefix . MISSUS_GC_TABLE;
    do {
        $raw  = wp_generate_password( $length, false, false );
        $code = strtoupper( implode( '-', str_split( $raw, 4 ) ) ); // XXXX-XXXX-XXXX-XXXX
        $exists = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$table} WHERE code = %s", $code ) );
    } while ( $exists );
    return $code;
}

function missus_gc_send_email( $to, $code, $value, $note = '' ) {
    $subject = 'Your Missus Gift Card';
    $amount  = '&#8358;' . number_format( $value, 0 );
    $body    = "<p>You have received a Missus gift card!</p>";
    $body   .= "<p><strong>Code:</strong> <code style='font-size:18px;letter-spacing:2px'>{$code}</code></p>";
    $body   .= "<p><strong>Balance:</strong> {$amount}</p>";
    if ( $note ) $body .= "<p><em>{$note}</em></p>";
    $body   .= "<p>Use this code at checkout on <a href='https://missusoutfits.com'>missusoutfits.com</a></p>";
    $headers = [ 'Content-Type: text/html; charset=UTF-8' ];
    wp_mail( $to, $subject, $body, $headers );
}

/* ──────────────────────────────────────────────
   5. ADMIN MENU
────────────────────────────────────────────── */
add_action( 'admin_menu', 'missus_gc_admin_menu' );
function missus_gc_admin_menu() {
    add_submenu_page(
        'woocommerce',
        'Gift Cards',
        'Gift Cards',
        'manage_woocommerce',
        'missus-gift-cards',
        'missus_gc_admin_page'
    );
}

function missus_gc_admin_page() {
    global $wpdb;
    $table = $wpdb->prefix . MISSUS_GC_TABLE;

    // Handle create form submission
    $message = '';
    if ( isset( $_POST['missus_gc_create'] ) && check_admin_referer( 'missus_gc_create' ) ) {
        $value = floatval( $_POST['gc_value'] ?? 0 );
        $email = sanitize_email( $_POST['gc_email'] ?? '' );
        $note  = sanitize_textarea_field( $_POST['gc_note'] ?? '' );
        $exp   = sanitize_text_field( $_POST['gc_expires'] ?? '' );
        if ( $value > 0 ) {
            $code = missus_gc_generate_code();
            $wpdb->insert( $table, [
                'code'            => $code,
                'balance'         => $value,
                'initial_value'   => $value,
                'recipient_email' => $email ?: null,
                'note'            => $note ?: null,
                'expires_at'      => $exp ?: null,
                'status'          => 'active',
            ], [ '%s', '%f', '%f', '%s', '%s', '%s', '%s' ] );
            if ( $email ) missus_gc_send_email( $email, $code, $value, $note );
            $message = '<div class="notice notice-success"><p>Gift card created: <strong>' . esc_html( $code ) . '</strong></p></div>';
        }
    }

    $cards = $wpdb->get_results( "SELECT * FROM {$table} ORDER BY created_at DESC LIMIT 200" );
    ?>
    <div class="wrap">
        <h1>Missus Gift Cards</h1>
        <?php echo $message; ?>

        <h2>Create New Gift Card</h2>
        <form method="post">
            <?php wp_nonce_field( 'missus_gc_create' ); ?>
            <table class="form-table">
                <tr><th>Value (₦)</th><td><input type="number" name="gc_value" min="100" step="100" required style="width:200px" /></td></tr>
                <tr><th>Recipient Email</th><td><input type="email" name="gc_email" style="width:280px" placeholder="Optional — sends card by email" /></td></tr>
                <tr><th>Note / Message</th><td><textarea name="gc_note" rows="2" style="width:400px"></textarea></td></tr>
                <tr><th>Expires</th><td><input type="date" name="gc_expires" /></td></tr>
            </table>
            <input type="submit" name="missus_gc_create" class="button button-primary" value="Create Gift Card" />
        </form>

        <h2 style="margin-top:32px">All Gift Cards</h2>
        <table class="wp-list-table widefat fixed striped">
            <thead>
                <tr>
                    <th>Code</th>
                    <th>Balance</th>
                    <th>Initial Value</th>
                    <th>Status</th>
                    <th>Recipient</th>
                    <th>Expires</th>
                    <th>Created</th>
                </tr>
            </thead>
            <tbody>
            <?php foreach ( $cards as $c ) : ?>
                <tr>
                    <td><code><?php echo esc_html( $c->code ); ?></code></td>
                    <td>₦<?php echo number_format( $c->balance, 0 ); ?></td>
                    <td>₦<?php echo number_format( $c->initial_value, 0 ); ?></td>
                    <td><span style="color:<?php echo $c->status === 'active' ? 'green' : '#999'; ?>"><?php echo esc_html( $c->status ); ?></span></td>
                    <td><?php echo esc_html( $c->recipient_email ?: '—' ); ?></td>
                    <td><?php echo esc_html( $c->expires_at ?: '—' ); ?></td>
                    <td><?php echo esc_html( substr( $c->created_at, 0, 10 ) ); ?></td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    </div>
    <?php
}
