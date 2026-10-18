# Klaviyo for Missus

The Next.js storefront needs its own Klaviyo script; the WordPress plugin's frontend script does not appear automatically on this separate storefront. Keep the existing WooCommerce integration connected to the same Klaviyo account for its backend data sync.

## Activate

1. In the Klaviyo account connected to WordPress, find the public API key / Site ID in Settings > API keys. Set `NEXT_PUBLIC_KLAVIYO_SITE_ID` in `.env.local` and the storefront hosting environment.
2. Set `KLAVIYO_LIST_ID` to the email list that should receive website signups. Use that same list in your Klaviyo popup.
3. Create a private key with `lists:write`, `profiles:write`, and `subscriptions:write`; store it as `KLAVIYO_PRIVATE_KEY` in the server environment. Never put it in a `NEXT_PUBLIC_` variable or commit it.
4. Restart locally or rebuild/redeploy after changing the public Site ID.
5. Create and publish an email popup in Klaviyo Sign-up forms. Set targeting for the public storefront domain, including www/non-www as applicable. Exclude `/checkout`, `/admin`, and any other pages where popups should not show. The script remains loaded during client navigation, so use Klaviyo targeting for these exclusions.
6. Test in a fresh browser session with a consenting test email: check the popup, homepage form, and `/newsletter`; confirm any double opt-in email and verify list membership and source in Klaviyo. Check mobile and navigation to checkout too.

## Signup behavior

- Homepage and reusable newsletter forms now call `/api/newsletter` and report provider errors.
- Klaviyo takes precedence over Mailchimp when configured. Partial Klaviyo settings return an unavailable error rather than silently sending to another provider.
- The endpoint records email marketing consent and distinguishes homepage, newsletter page, and reusable form sources. It honors list double opt-in and does not use historical import.
- This subscription endpoint collects email only for Klaviyo; the existing optional name is used only by the Mailchimp fallback. Klaviyo-managed forms can collect additional profile fields.
- No provider configured returns HTTP 503; it does not claim the subscriber was saved.
- Checkout subscriptions, SMS, WhatsApp, and product/cart event tracking are separate integrations and are not connected by this change.

## Other avenues

The `/newsletter` page can be linked from social profiles, WhatsApp, and QR codes. Native lead-form syncing or channel messaging requires configuring the relevant integration in the same Klaviyo account. Confirm which channels are wanted before setting those up; social links alone do not sync their audiences.

## References

- [Klaviyo onsite script](https://help.klaviyo.com/hc/en-us/articles/115005076767)
- [Subscription API and required scopes](https://developers.klaviyo.com/en/reference/bulk_subscribe_profiles)

Live activation and verification remain pending until account settings are supplied and a popup is published.
