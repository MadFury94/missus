import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, orderId, customerEmail, customerName, amount, message } = body;

        // For now, we'll send an email notification to admin
        // You can later integrate with your preferred notification system

        try {
            const resendKey = process.env.RESEND_API_KEY;
            if (resendKey) {
                const adminEmails = [
                    "admin@missusoutfits.com",
                    "orders@missusoutfits.com"
                ];

                const html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h2 style="color: #dc3545; margin: 0 0 10px;">🔔 Bank Transfer Payment Notification</h2>
                        <p style="margin: 0; color: #666;">A customer has claimed to complete a bank transfer payment</p>
                    </div>
                    
                    <div style="background: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px;">
                        <h3 style="margin: 0 0 15px; color: #333;">Order Details</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Order ID:</td>
                                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${orderId}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Customer:</td>
                                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${customerName}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
                                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${customerEmail}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Amount:</td>
                                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">₦${amount?.toLocaleString('en-NG')}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold;">Claimed At:</td>
                                <td style="padding: 8px 0;">${new Date().toLocaleString('en-NG', {
                    timeZone: 'Africa/Lagos',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <h4 style="margin: 0 0 10px; color: #856404;">⚠️ Action Required</h4>
                        <p style="margin: 0; color: #856404;">
                            Please verify this bank transfer payment and update the order status in WooCommerce admin.
                            Check your bank account for the transfer and confirm the payment if received.
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders" 
                           style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                            View Order in Admin
                        </a>
                    </div>
                </div>
                `;

                for (const email of adminEmails) {
                    await fetch("https://api.resend.com/emails", {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${resendKey}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            from: "Missus Orders <orders@missusoutfits.com>",
                            to: [email],
                            subject: `🔔 Bank Transfer Payment Claim - Order #${orderId}`,
                            html,
                        }),
                    });
                }
            }
        } catch (emailError) {
            console.error("Failed to send admin notification email:", emailError);
            // Continue anyway, the order was created successfully
        }

        return NextResponse.json({
            success: true,
            message: "Admin notification sent successfully"
        });

    } catch (error) {
        console.error("Admin notification error:", error);
        return NextResponse.json(
            { error: "Failed to send admin notification" },
            { status: 500 }
        );
    }
}

// Simple GET endpoint to acknowledge the route exists
// You can expand this later to fetch notifications from your preferred system
export async function GET(request: NextRequest) {
    return NextResponse.json({
        message: "Admin notifications endpoint active",
        timestamp: new Date().toISOString()
    });
}