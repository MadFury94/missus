import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { email, name } = await request.json();

        if (!email || typeof email !== "string" || !email.includes("@")) {
            return NextResponse.json({ ok: false, error: "Valid email required." }, { status: 400 });
        }

        const mailchimpKey = process.env.MAILCHIMP_API_KEY;
        const mailchimpListId = process.env.MAILCHIMP_LIST_ID;
        const mailchimpServer = process.env.MAILCHIMP_SERVER_PREFIX; // e.g. "us21"

        const klaviyoKey = process.env.KLAVIYO_PRIVATE_KEY;
        const klaviyoListId = process.env.KLAVIYO_LIST_ID;

        if (mailchimpKey && mailchimpListId && mailchimpServer) {
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
            // Klaviyo v3 API
            const res = await fetch(`https://a.klaviyo.com/api/profile-subscriptions-bulk-create-jobs`, {
                method: "POST",
                headers: {
                    Authorization: `Klaviyo-API-Key ${klaviyoKey}`,
                    "Content-Type": "application/json",
                    revision: "2024-02-15",
                },
                body: JSON.stringify({
                    data: {
                        type: "profile-subscription-bulk-create-job",
                        attributes: {
                            profiles: {
                                data: [
                                    {
                                        type: "profile",
                                        attributes: {
                                            email,
                                            first_name: name || "",
                                        },
                                    },
                                ],
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
                const err = await res.text();
                console.error("Klaviyo error:", err);
                return NextResponse.json({ ok: false, error: "Could not subscribe. Please try again." }, { status: 500 });
            }

            return NextResponse.json({ ok: true });
        }

        // No ESP configured — log and return success (dev/staging)
        console.log("[Newsletter] New subscriber (no ESP configured):", { email, name });
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("Newsletter API error:", err);
        return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
    }
}
