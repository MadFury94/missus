// This is a SNIPPET showing where gift card redemption plugs into your
// existing Paystack callback — not a full replacement file, since I don't
// have your actual callback implementation. Drop the marked section into
// the right place in your real handler.

import { redeemGiftCard } from "@/lib/giftCards";

// ...inside your existing callback handler, AFTER Paystack confirms the
// transaction was successful AND after you've created the WooCommerce
// order (you need the order ID for the note it attaches)...

async function afterOrderCreated(order: { id: number }, metadata: any) {
  // Your metadata should already carry these from /api/payment/initiate,
  // same way it presumably already carries promo/coupon info today.
  const giftCardCode: string | undefined = metadata.giftCardCode;
  const giftCardAmount: number | undefined = metadata.giftCardAmount;

  if (giftCardCode && giftCardAmount && giftCardAmount > 0) {
    try {
      await redeemGiftCard(giftCardCode, giftCardAmount, order.id);
    } catch (err) {
      // IMPORTANT: payment has ALREADY succeeded at this point. The customer
      // paid, the order exists — you cannot silently fail the order here.
      // Two realistic causes:
      //   1. Balance changed between checkout and callback (rare, but the
      //      atomic decrement on the WP side means this ONLY happens if the
      //      balance was genuinely insufficient at redemption time).
      //   2. A transient network/API error talking to WordPress.
      //
      // Don't let this throw and break order creation. Log it loudly and
      // flag the order for manual review — a human needs to reconcile this,
      // not the code.
      console.error(
        `[gift-card] Redeem failed for order #${order.id}, code ${giftCardCode}:`,
        err
      );

      // Example: tag the order so it's visible in wp-admin that this needs
      // a human look — adapt to however you already add order notes/meta.
      // await addOrderNote(order.id, `⚠️ Gift card ${giftCardCode} redemption FAILED after payment — needs manual reconciliation.`);

      // Optional: alert yourself (email, Slack webhook, etc.) — this should
      // be rare enough that a direct ping is worth it rather than relying
      // on someone spotting it in logs.
    }
  }
}
