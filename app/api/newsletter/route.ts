import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => null);
        const email = typeof body?.email === "string" ? body.email.trim() : "";
        const name = typeof body?.name === "string" ? body.name.trim().slice(0, 100) : "";
        const tags: string[] = Array.isArray(body?.tags) ? body.tags.filter((t: unknown) => typeof t === "string").slice(0, 10) : [];
        const popupVariant: string = typeof body?.popupVariant === "string" ? body.popupVariant : "";
        const sources: Record<string, string> = {
            homepage: "Missus homepage",
            newsletter: "Missus newsletter page",
            footer: "Missus newsletter form",
            "popup-a": "Missus popup A",
            "popup-b": "Missus popup B",
        };
        const source = typeof body?.source === "string" && Object.hasOwn(sources, body.source)
            ? sources[body.source] : "Missus website";

        if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ ok: false, error: "Valid email required." }, { status: 400 });
        }

        const mailchimpKey = process.env.MAILCHIMP_API_KEY;
        const mailchimpListId = process.env.MAILCHIMP_LIST_ID;
        const mailchimpServer = process.env.MAILCHIMP_SERVER_PREFIX; // e.g. "us21"

        const klaviyoKey = process.env.KLAVIYO_PRIVATE_KEY;
        const klaviyoListId = process.env.KLAVIYO_LIST_ID;

        if (!klaviyoKey && !klaviyoListId && mailchimpKey && mailchimpListId && mailchimpServer) {
            // Mailchimp
            const res = await fetch(
                `https://${mailchimpServer}.api.mailchimp.com/3.0/lists/${mailchimpListId}/members`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `apikey ${mailchimpKey}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email_address: email,
                        status: "subscribed",
                        merge_fields: name ? { FNAME: name } : {},
                    }),
                }
            );

            const data = await res.json();

            // 400 with title "Member Exists" is not a real error
            if (!res.ok && data.title !== "Member Exists") {
                console.error("Mailchimp error:", data);
                return NextResponse.json({ ok: false, error: "Could not subscribe. Please try again." }, { status: 500 });
            }

            return NextResponse.json({ ok: true });
        }

        if (klaviyoKey && klaviyoListId) {
            const profileAttributes: Record<string, unknown> = {
                email,
                subscriptions: {
                    email: { marketing: { consent: "SUBSCRIBED" } },
                },
            };
            if (name) profileAttributes.first_name = name;
            if (tags.length > 0) profileAttributes.preferences = tags.join(", ");
            if (popupVariant) profileAttributes.signup_popup = popupVariant;

            const res = await fetch("https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs", {
                method: "POST",
                signal: AbortSignal.timeout(10000),
                headers: {
                    Authorization: `Klaviyo-API-Key ${klaviyoKey}`,
                    "Content-Type": "application/vnd.api+json",
                    revision: "2026-10-15",
                },
                body: JSON.stringify({
                    data: {
                        type: "profile-subscription-bulk-create-job",
                        attributes: {
                            custom_source: source,
                            profiles: {
                                data: [{ type: "profile", attributes: profileAttributes }],
                            },
                            historical_import: false,
                        },
                        relationships: {
                            list: { data: { type: "list", id: klaviyoListId } },
                        },
                    },
                }),
            });

            if (!res.ok && res.status !== 202) {
                console.error("Klaviyo subscription failed:", res.status);
                return NextResponse.json({ ok: false, error: "Could not subscribe. Please try again." }, { status: 500 });
            }

            return NextResponse.json({ ok: true });
        }

        return NextResponse.json({ ok: false, error: "Newsletter signup is temporarily unavailable. Please try again later." }, { status: 503 });
    } catch (err) {
        console.error("Newsletter API error:", err);
        return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
    }
}
