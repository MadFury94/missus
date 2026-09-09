<?php
/**
 * Plugin Name: Missus Restock Alerts
 * Description: Private restock subscriptions for the headless storefront, delivered using WordPress mail.
 */
defined('ABSPATH') || exit;

function missus_restock_schedule($id, $delay = 10) {
    $args = array((int) $id);
    if (!wp_next_scheduled('missus_restock_notify', $args)) {
        wp_schedule_single_event(time() + $delay, 'missus_restock_notify', $args);
    }
}

add_action('rest_api_init', function () {
    register_rest_route('missus/v1', '/restock', array(
        'methods' => 'POST',
        'permission_callback' => function () { return current_user_can('manage_woocommerce'); },
        'callback' => function ($request) {
            $email = strtolower(trim((string) $request->get_param('email')));
            $parent_id = absint($request->get_param('productId'));
            $id = absint($request->get_param('variationId')) ?: $parent_id;
            if (!is_email($email) || strlen($email) > 254) return new WP_Error('invalid_email', 'Enter a valid email address.', array('status' => 400));
            $product = wc_get_product($id);
            $parent = wc_get_product($parent_id);
            if (!$product || !$parent || $parent->get_status() !== 'publish' ||
                ($id !== $parent_id && $product->get_parent_id() !== $parent_id) ||
                $product->is_type('variable')) {
                return new WP_Error('invalid_product', 'Choose a product size and colour.', array('status' => 400));
            }
            if ($product->is_in_stock()) return new WP_Error('already_available', 'This option is available again. Refresh the product page.', array('status' => 409));
            $key = 'missus_restock_' . $id . '_' . hash('sha256', $email);
            // Atomic insertion prevents repeated signups from creating duplicate alerts.
            add_option($key, array('email' => $email, 'product_id' => $id, 'created' => time()), '', false);
            if (!get_option($key)) return new WP_Error('storage_failed', 'Could not save your request. Please retry.', array('status' => 503));
            missus_restock_schedule($id, HOUR_IN_SECONDS);
            return rest_ensure_response(array('ok' => true));
        },
    ));
});

function missus_restock_stock_changed($id) {
    wp_clear_scheduled_hook('missus_restock_notify', array((int) $id));
    missus_restock_schedule($id);
    $product = wc_get_product($id);
    if ($product && $product->is_type('variable')) {
        foreach ($product->get_children() as $child) {
            wp_clear_scheduled_hook('missus_restock_notify', array((int) $child));
            missus_restock_schedule($child);
        }
    }
}
add_action('woocommerce_product_set_stock_status', 'missus_restock_stock_changed', 10, 1);
add_action('woocommerce_variation_set_stock_status', 'missus_restock_stock_changed', 10, 1);
add_action('woocommerce_product_set_stock', function ($product) { missus_restock_stock_changed($product->get_id()); });
add_action('woocommerce_variation_set_stock', function ($product) { missus_restock_stock_changed($product->get_id()); });

add_action('missus_restock_notify', function ($id) {
    global $wpdb;
    $id = absint($id);
    $prefix = $wpdb->esc_like('missus_restock_' . $id . '_') . '%';
    $keys = $wpdb->get_col($wpdb->prepare("SELECT option_name FROM {$wpdb->options} WHERE option_name LIKE %s LIMIT 50", $prefix));
    if (!$keys) return;
    $product = wc_get_product($id);
    if (!$product || !$product->is_in_stock() || !$product->is_purchasable()) {
        missus_restock_schedule($id, HOUR_IN_SECONDS);
        return;
    }
    $lock = 'missus_restock_lock_' . $id;
    if (!add_option($lock, time(), '', false)) {
        if ((int) get_option($lock) < time() - 600) delete_option($lock);
        missus_restock_schedule($id, 600);
        return;
    }
    try {
        $parent = $product->get_parent_id() ? wc_get_product($product->get_parent_id()) : $product;
        if (!$parent || $parent->get_status() !== 'publish') return;
        $storefront = untrailingslashit((string) get_option('missus_restock_storefront_url', home_url()));
        $url = $storefront . '/product/' . $parent->get_slug();
        $name = html_entity_decode(wp_strip_all_tags($product->get_name()), ENT_QUOTES, 'UTF-8');
        foreach ($keys as $key) {
            $subscription = get_option($key);
            if (!$subscription || !is_email($subscription['email'])) continue;
            $subject = 'Back in stock: ' . $name;
            $message = "Good news! " . $name . " is available again at Missus.\n\nShop now: " . $url . "\n\nAvailability is limited and stock is not reserved.\n\nYou requested this one-time restock alert. You have not been subscribed to a newsletter.";
            if (wp_mail($subscription['email'], $subject, $message)) delete_option($key);
        }
    } finally {
        delete_option($lock);
    }
    // Process remaining subscribers and retry failed mail deliveries.
    if ($wpdb->get_var($wpdb->prepare("SELECT option_name FROM {$wpdb->options} WHERE option_name LIKE %s LIMIT 1", $prefix))) missus_restock_schedule($id, HOUR_IN_SECONDS);
});
