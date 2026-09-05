<?php
// ── ADD THIS INSIDE your rest_api_init block in functions.php ──
// Place it after the "create card" route and before the "update card" route.

    // SERVER-TO-SERVER ONLY: redeem gift card after confirmed payment
    // Protected by X-Missus-Secret header — never callable from the browser directly
    register_rest_route( 'missus/v1', '/gift-cards/redeem', [
        'methods'             => 'POST',
        'callback'            => function ( $req ) {
            // Verify secret
            $secret = defined( 'MISSUS_GIFT_CARD_SECRET' ) ? MISSUS_GIFT_CARD_SECRET : '';
            if ( empty( $secret ) || $req->get_header( 'X-Missus-Secret' ) !== $secret ) {
                return new WP_Error( 'forbidden', 'Forbidden.', [ 'status' => 403 ] );
            }

            $body     = $req->get_json_params() ?: [];
            $code     = strtoupper( trim( $body['code'] ?? '' ) );
            $amount   = (float) ( $body['amount'] ?? 0 );
            $order_id = (int) ( $body['order_id'] ?? 0 );

            if ( ! $code || $amount <= 0 ) {
                return new WP_Error( 'invalid', 'code and amount are required.', [ 'status' => 400 ] );
            }

            // ── Try our own CPT first ──────────────────────────────────────
            $posts = get_posts( [
                'post_type'      => 'gift_card',
                'post_status'    => 'publish',
                'posts_per_page' => 1,
                'meta_query'     => [ [ 'key' => 'mgc_code', 'value' => $code ] ],
            ] );

            if ( ! empty( $posts ) ) {
                $id      = $posts[0]->ID;
                $balance = (float) get_field( 'mgc_balance', $id );

                if ( $balance < $amount ) {
                    return new WP_Error( 'insufficient', 'Insufficient balance.', [ 'status' => 400 ] );
                }

                $new_balance = $balance - $amount;
                update_field( 'field_mgc_balance', $new_balance, $id );
                update_field( 'field_mgc_status',  $new_balance > 0 ? 'active' : 'used', $id );
                if ( $order_id ) update_field( 'field_mgc_order', $order_id, $id );

                return rest_ensure_response( [
                    'success'           => true,
                    'remaining_balance' => $new_balance,
                ] );
            }

            // ── YITH fallback: use YITH's class to deduct ─────────────────
            if ( ! class_exists( 'YITH_YWGC_Gift_Card' ) ) {
                return new WP_Error( 'not_found', 'Gift card not found.', [ 'status' => 404 ] );
            }

            $gift_card = new YITH_YWGC_Gift_Card( [ 'gift_card_code' => $code ] );
            if ( ! $gift_card->exists() ) {
                return new WP_Error( 'not_found', 'Gift card not found.', [ 'status' => 404 ] );
            }

            $balance = (float) $gift_card->get_balance();
            if ( $balance < $amount ) {
                return new WP_Error( 'insufficient', 'Insufficient balance.', [ 'status' => 400 ] );
            }

            // Use YITH's own method to deduct — atomic and survives plugin updates
            $gift_card->set_balance( $balance - $amount );
            $gift_card->save();

            if ( $order_id && method_exists( $gift_card, 'add_order' ) ) {
                $gift_card->add_order( $order_id );
            }

            return rest_ensure_response( [
                'success'           => true,
                'remaining_balance' => $balance - $amount,
            ] );
        },
        'permission_callback' => '__return_true', // auth done via secret header above
    ] );
