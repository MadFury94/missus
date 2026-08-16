import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { name, email, subject, message } = await request.json();

        if (!name || !email || !message) {
            return NextResponse.json({ ok: false, error: "Missing required fields." }, { status: 400 });
        }

        const subjectLabels: Record<string, string> = {
            general: "General Enquiry",
            order: "Order Issue",
            returns: "Returns & Refunds",
            collab: "Collaboration / PR",
            other: "Other",
            careers: "Careers",
        };
        const subjectLine = subjectLabels[subject] ?? subject ?? "General Enquiry";

        const toEmail = process.env.CONTACT_EMAIL || "hello@missusoutfits.com";
        const resendKey = process.env.RESEND_API_KEY;

        if (resendKey) {
            // Send via Resend (https://resend.com)
            const res = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${resendKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    from: "Missus Website <noreply@missusoutfits.com>",
                    to: [toEmail],
                    reply_to: email,
                    subject: `[Contact] ${subjectLine} — ${name}`,
                    html: `
                        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
                            <h2 style="background:#000;color:#fff;padding:20px 24px;margin:0;font-size:18px">
                                New Contact Form Submission
                            </h2>
                            <div style="padding:24px;border:1px solid #e0e0e0;border-top:none">
                                <table style="width:100%;border-collapse:collapse">
                                    <tr><td style="padding:8px 0;color:#888;width:100px;vertical-align:top">Name</td><td style="padding:8px 0;font-weight:600">${name}</td></tr>
                                    <tr><td style="padding:8px 0;color:#888;vertical-align:top">Email</td><td style="padding:8px 0"><a href="mailto:${email}">${email}</a></td></tr>
                                    <tr><td style="padding:8px 0;color:#888;vertical-align:top">Subject</td><td style="padding:8px 0">${subjectLine}</td></tr>
                                    <tr><td style="padding:8px 0;color:#888;vertical-align:top">Message</td><td style="padding:8px 0;white-space:pre-wrap">${message}</td></tr>
                                </table>
                            </div>
                            <p style="padding:0 24px;font-size:11px;color:#aaa">Sent from missusoutfits.com contact form</p>
                        </div>
                    `,
                }),
            });

            if (!res.ok) {
                const err = await res.text();
                console.error("Resend error:", err);
                return NextResponse.json({ ok: false, error: "Failed to send." }, { status: 500 });
            }
        } else {
            // Fallback: log to server console (dev mode)
            console.log("[Contact Form]", { name, email, subject: subjectLine, message });
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("Contact API error:", err);
        return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
    }
}
