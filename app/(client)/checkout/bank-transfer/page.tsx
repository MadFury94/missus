"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Copy, CheckCircle } from "lucide-react";
import { formatPrice } from "@/lib/woocommerce";

interface PendingOrder {
    cart: Array<{
        productId: number;
        name: string;
        price: number;
        quantity: number;
        size?: string;
        image: string;
    }>;
    shipping: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        address: string;
        apartment?: string;
        city: string;
        state: string;
        postalCode?: string;
    };
    promoCode?: string;
    promoDiscount: number;
    selectedRate: {
        carrier_name: string;
        amount: number;
    };
    total: number;
}

const BANK_DETAILS = {
    bankName: "Access Bank",
    accountName: "Missus Outfits Limited",
    accountNumber: "1234567890"
};

export default function BankTransferPage() {
    const [order, setOrder] = useState<PendingOrder | null>(null);
    const [copied, setCopied] = useState<string>("");
    const [paymentConfirmed, setPaymentConfirmed] = useState(false);
    const [confirmingPayment, setConfirmingPayment] = useState(false);

    useEffect(() => {
        const orderData = localStorage.getItem("pending_bank_order");
        if (orderData) {
            setOrder(JSON.parse(orderData));
        }
    }, []);

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopied(field);
        setTimeout(() => setCopied(""), 2000);
    };

    const handlePaymentConfirmation = async () => {
        if (!order) return;

        setConfirmingPayment(true);

        try {
            // Create the order in the system
            const response = await fetch("/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    cart: order.cart,
                    shipping: order.shipping,
                    promoCode: order.promoCode,
                    promoDiscount: order.promoDiscount,
                    selectedRate: order.selectedRate,
                    total: order.total,
                    paymentMethod: "bank_transfer",
                    paymentStatus: "pending",
                }),
            });

            if (response.ok) {
                const result = await response.json();

                // Notify admin of pending bank transfer payment
                await fetch("/api/admin/notifications", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        type: "bank_transfer_payment_claimed",
                        orderId: result.orderId,
                        customerEmail: order.shipping.email,
                        customerName: `${order.shipping.firstName} ${order.shipping.lastName}`,
                        amount: order.total,
                        message: `Customer has confirmed bank transfer payment for order #${result.orderId}`
                    }),
                });

                setPaymentConfirmed(true);

                // Clear the pending order from localStorage
                localStorage.removeItem("pending_bank_order");
            } else {
                alert("There was an error processing your confirmation. Please try again or contact support.");
            }
        } catch (error) {
            console.error("Error confirming payment:", error);
            alert("There was an error processing your confirmation. Please try again or contact support.");
        } finally {
            setConfirmingPayment(false);
        }
    };

    if (!order) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9f9f9" }}>
                <div style={{ textAlign: "center", padding: "40px" }}>
                    <p style={{ fontSize: "18px", color: "#666", marginBottom: "20px" }}>No pending order found</p>
                    <Link href="/checkout" style={{ background: "#000", color: "#fff", padding: "12px 24px", borderRadius: "6px", textDecoration: "none", fontSize: "14px", fontWeight: 600 }}>
                        Back to Checkout
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: "#f9f9f9", minHeight: "100vh" }}>
            {/* Header */}
            <div style={{ background: "#fff", borderBottom: "1px solid #e5e5e5", padding: "20px 0" }}>
                <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
                    <Link href="/" style={{ display: "inline-block", fontFamily: "'Cormorant', serif", fontSize: "28px", fontWeight: 600, color: "#000", textDecoration: "none", letterSpacing: ".02em", marginBottom: "16px" }}>
                        MISSUS
                    </Link>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "12px" }}>
                        <CheckCircle size={20} style={{ color: "#10b981" }} />
                        <span style={{ fontSize: "16px", fontWeight: 500, color: "#000" }}>Order Confirmed</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ maxWidth: "600px", margin: "0 auto", padding: "32px 24px" }}>

                {/* Thank You Message */}
                <div style={{ background: "#fff", borderRadius: "8px", padding: "32px", marginBottom: "24px", textAlign: "center", border: "1px solid #e5e5e5" }}>
                    <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#000", marginBottom: "8px" }}>
                        Thank you, {order.shipping.firstName}!
                    </h1>
                    <p style={{ fontSize: "16px", color: "#666", marginBottom: "20px" }}>
                        Your order has been confirmed. Complete your payment using the bank details below.
                    </p>
                    <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "6px", padding: "16px" }}>
                        <p style={{ fontSize: "14px", color: "#0369a1", margin: 0, fontWeight: 500 }}>
                            📧 A confirmation email with these details has been sent to {order.shipping.email}
                        </p>
                    </div>
                </div>

                {/* Bank Details */}
                <div style={{ background: "#fff", borderRadius: "8px", padding: "32px", marginBottom: "24px", border: "1px solid #e5e5e5" }}>
                    <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#000", marginBottom: "20px" }}>Bank Transfer Details</h2>

                    <div style={{ background: "#fef7ff", border: "1px solid #e9d5ff", borderRadius: "6px", padding: "16px", marginBottom: "24px" }}>
                        <p style={{ fontSize: "14px", color: "#7c3aed", fontWeight: 500, marginBottom: "8px" }}>Important Payment Instructions:</p>
                        <ul style={{ fontSize: "13px", color: "#7c3aed", margin: 0, paddingLeft: "20px" }}>
                            <li>Transfer the exact amount: <strong>{formatPrice(order.total)}</strong></li>
                            <li>Use your order reference as the transfer description</li>
                            <li>Your order will be processed within 24 hours of payment confirmation</li>
                        </ul>
                    </div>

                    <div style={{ display: "grid", gap: "16px" }}>
                        {Object.entries({
                            "Bank Name": BANK_DETAILS.bankName,
                            "Account Name": BANK_DETAILS.accountName,
                            "Account Number": BANK_DETAILS.accountNumber,
                        }).map(([label, value]) => (
                            <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", background: "#f9f9f9", border: "1px solid #e5e5e5", borderRadius: "6px" }}>
                                <div>
                                    <p style={{ fontSize: "12px", color: "#666", marginBottom: "4px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</p>
                                    <p style={{ fontSize: "16px", color: "#000", fontWeight: 600, margin: 0, fontFamily: "monospace" }}>{value}</p>
                                </div>
                                <button
                                    onClick={() => copyToClipboard(value, label)}
                                    style={{ background: "none", border: "1px solid #d1d5db", borderRadius: "4px", padding: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                                >
                                    <Copy size={14} />
                                    {copied === label ? (
                                        <span style={{ fontSize: "12px", color: "#10b981" }}>Copied!</span>
                                    ) : (
                                        <span style={{ fontSize: "12px", color: "#666" }}>Copy</span>
                                    )}
                                </button>
                            </div>
                        ))}

                        {/* Amount to Transfer */}
                        <div style={{ padding: "20px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "#fff", borderRadius: "8px", textAlign: "center" }}>
                            <p style={{ fontSize: "14px", marginBottom: "8px", opacity: 0.9 }}>Amount to Transfer</p>
                            <p style={{ fontSize: "28px", fontWeight: 700, margin: 0 }}>{formatPrice(order.total)}</p>
                        </div>
                    </div>
                </div>
                {/* Order Summary */}
                <div style={{ background: "#fff", borderRadius: "8px", padding: "32px", marginBottom: "24px", border: "1px solid #e5e5e5" }}>
                    <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#000", marginBottom: "20px" }}>Order Summary</h2>

                    {/* Items */}
                    <div style={{ marginBottom: "20px" }}>
                        {order.cart.map((item, index) => (
                            <div key={index} style={{ display: "flex", gap: "16px", marginBottom: "16px", paddingBottom: "16px", borderBottom: index < order.cart.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                                <div style={{ width: "60px", height: "60px", background: "#f5f5f5", borderRadius: "6px", overflow: "hidden", flexShrink: 0, position: "relative" }}>
                                    <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} sizes="60px" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: "14px", fontWeight: 500, color: "#000", marginBottom: "4px" }}>{item.name}</p>
                                    {item.size && <p style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>Size: {item.size}</p>}
                                    <p style={{ fontSize: "12px", color: "#666" }}>Qty: {item.quantity}</p>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#000" }}>{formatPrice(item.price * item.quantity)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Totals */}
                    <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                            <span style={{ color: "#666" }}>Subtotal</span>
                            <span>{formatPrice(order.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0))}</span>
                        </div>
                        {order.promoDiscount > 0 && (
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                                <span style={{ color: "#10b981" }}>Discount</span>
                                <span style={{ color: "#10b981" }}>-{formatPrice(order.promoDiscount)}</span>
                            </div>
                        )}
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "14px" }}>
                            <span style={{ color: "#666" }}>Shipping ({order.selectedRate.carrier_name})</span>
                            <span>{formatPrice(order.selectedRate.amount)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid #e5e5e5", fontSize: "18px", fontWeight: 600 }}>
                            <span>Total</span>
                            <span>{formatPrice(order.total)}</span>
                        </div>
                    </div>
                </div>

                {/* Delivery Information */}
                <div style={{ background: "#fff", borderRadius: "8px", padding: "32px", marginBottom: "24px", border: "1px solid #e5e5e5" }}>
                    <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#000", marginBottom: "20px" }}>Delivery Information</h2>
                    <div style={{ fontSize: "14px", lineHeight: 1.6, color: "#000" }}>
                        <p><strong>{order.shipping.firstName} {order.shipping.lastName}</strong></p>
                        <p>{order.shipping.address}</p>
                        {order.shipping.apartment && <p>{order.shipping.apartment}</p>}
                        <p>{order.shipping.city}, {order.shipping.state} {order.shipping.postalCode}</p>
                        <p>Nigeria</p>
                        <br />
                        <p><strong>Contact:</strong></p>
                        <p>📧 {order.shipping.email}</p>
                        <p>📱 {order.shipping.phone}</p>
                    </div>
                </div>

                {/* Actions */}
                {!paymentConfirmed ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {/* Payment Confirmation Section */}
                        <div style={{ background: "#fff", borderRadius: "8px", padding: "24px", marginBottom: "12px", border: "2px solid #f59e0b", textAlign: "center" }}>
                            <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#000", marginBottom: "12px" }}>Have you completed the transfer?</h3>
                            <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>
                                Click the button below after you have successfully transferred the money to our account.
                                Our team will verify your payment and process your order within 24 hours.
                            </p>
                            <button
                                onClick={handlePaymentConfirmation}
                                disabled={confirmingPayment}
                                style={{
                                    background: confirmingPayment ? "#9ca3af" : "#10b981",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    padding: "16px 32px",
                                    fontSize: "16px",
                                    fontWeight: 600,
                                    cursor: confirmingPayment ? "not-allowed" : "pointer",
                                    transition: "background-color 0.2s",
                                    marginBottom: "16px"
                                }}
                            >
                                {confirmingPayment ? "Confirming..." : "✓ I have made the payment"}
                            </button>
                            <p style={{ fontSize: "12px", color: "#666", fontStyle: "italic" }}>
                                Only click this button after you have successfully completed the bank transfer
                            </p>
                        </div>

                        <Link
                            href="/shop"
                            style={{
                                display: "block",
                                textAlign: "center",
                                background: "#fff",
                                color: "#000",
                                border: "1px solid #d1d5db",
                                padding: "16px",
                                borderRadius: "6px",
                                textDecoration: "none",
                                fontSize: "16px",
                                fontWeight: 600
                            }}
                        >
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div style={{ textAlign: "center" }}>
                        {/* Payment Confirmed Message */}
                        <div style={{ background: "#f0f9ff", border: "2px solid #10b981", borderRadius: "8px", padding: "24px", marginBottom: "20px" }}>
                            <CheckCircle size={32} style={{ color: "#10b981", margin: "0 auto 12px" }} />
                            <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#000", marginBottom: "12px" }}>Payment Confirmation Received!</h3>
                            <p style={{ fontSize: "14px", color: "#666", marginBottom: "16px" }}>
                                Thank you for confirming your payment. Our team has been notified and will verify your
                                bank transfer within 24 hours. You will receive an email update once your payment is confirmed.
                            </p>
                            <div style={{ background: "#e0f2fe", border: "1px solid #0891b2", borderRadius: "6px", padding: "12px" }}>
                                <p style={{ fontSize: "13px", color: "#0891b2", margin: 0, fontWeight: 500 }}>
                                    💌 Keep an eye on your email for order updates and tracking information
                                </p>
                            </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <Link
                                href="/account"
                                style={{
                                    display: "block",
                                    textAlign: "center",
                                    background: "#000",
                                    color: "#fff",
                                    padding: "16px",
                                    borderRadius: "6px",
                                    textDecoration: "none",
                                    fontSize: "16px",
                                    fontWeight: 600
                                }}
                            >
                                View My Orders
                            </Link>
                            <Link
                                href="/shop"
                                style={{
                                    display: "block",
                                    textAlign: "center",
                                    background: "#fff",
                                    color: "#000",
                                    border: "1px solid #d1d5db",
                                    padding: "16px",
                                    borderRadius: "6px",
                                    textDecoration: "none",
                                    fontSize: "16px",
                                    fontWeight: 600
                                }}
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                )}

                {/* Help */}
                <div style={{ background: "#fff", borderRadius: "8px", padding: "24px", marginTop: "24px", border: "1px solid #e5e5e5", textAlign: "center" }}>
                    <p style={{ fontSize: "14px", color: "#666", marginBottom: "12px" }}>Need help with your payment?</p>
                    <Link
                        href="/contact"
                        style={{ fontSize: "14px", color: "#6366f1", textDecoration: "underline", fontWeight: 500 }}
                    >
                        Contact our support team
                    </Link>
                </div>
            </div>
        </div>
    );
}