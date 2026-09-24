"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check, CheckCircle, Copy, Landmark, MapPin, ShieldCheck } from "lucide-react";
import styles from "./transfer.module.css";
import { STORE_CONFIG, BANK_TRANSFER_ENABLED, IS_DEMO_STORE } from "@/lib/store-config";

interface PendingOrder {
    cart: Array<{ productId: number; name: string; price: number; quantity: number; size?: string; color?: string; image: string }>;
    shipping: { firstName: string; lastName: string; email: string; phone: string; address: string; apartment?: string; city: string; state: string; postalCode?: string };
    promoCode?: string;
    promoDiscount: number;
    selectedRate: { carrier_name: string; amount: number; delivery_time?: string };
    total: number;
}

const BANK_DETAILS = STORE_CONFIG.bankTransfer;
// Checkout totals are in naira; shipping rates are in kobo.
const money = (naira: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 }).format(naira);

export default function BankTransferPage() {
    const [order, setOrder] = useState<PendingOrder | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [copied, setCopied] = useState("");
    const [error, setError] = useState("");
    const [receipt, setReceipt] = useState<{ orderId: number; orderNumber: string } | null>(null);
    const [confirming, setConfirming] = useState(false);
    const submitting = useRef(false);

    useEffect(() => {
        try {
            const pending = localStorage.getItem("wearlux_pending_bank_order");
            if (pending) setOrder(JSON.parse(pending));
            else {
                const saved = sessionStorage.getItem("wearlux_bank_transfer_receipt");
                if (saved) { const data = JSON.parse(saved); setOrder(data.order); setReceipt(data.receipt); }
            }
        } catch { setError("Your checkout details could not be loaded. Please return to checkout."); }
        finally { setLoaded(true); }
    }, []);

    async function copyAccount() {
        try {
            await navigator.clipboard.writeText(BANK_DETAILS.accountNumber);
            setCopied("account");
            setTimeout(() => setCopied(""), 2000);
        } catch { setError("Copy is unavailable. Please select and copy the account number manually."); }
    }

    async function confirmPayment() {
        if (!order || submitting.current || receipt || IS_DEMO_STORE || !BANK_TRANSFER_ENABLED) return;
        submitting.current = true;
        setConfirming(true);
        setError("");
        try {
            const response = await fetch("/api/orders", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...order, paymentMethod: "bank_transfer", paymentStatus: "pending" }),
            });
            const result = await response.json();
            if (!response.ok || !result.orderId) throw new Error(result.error || "We could not submit your payment confirmation. Please try again.");
            const savedReceipt = { orderId: result.orderId, orderNumber: String(result.orderNumber || result.orderId) };
            setReceipt(savedReceipt);
            // Notification failures must not invite a second order submission.
            try {
                sessionStorage.setItem("wearlux_bank_transfer_receipt", JSON.stringify({ order, receipt: savedReceipt }));
                localStorage.removeItem("wearlux_pending_bank_order");
            } catch { /* The receipt remains visible in this tab. */ }
            try {
                await fetch("/api/admin/notifications", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: "bank_transfer_payment_claimed", orderId: result.orderId,
                        customerEmail: order.shipping.email, customerName: `${order.shipping.firstName} ${order.shipping.lastName}`,
                        amount: order.total, message: `Customer has reported a bank transfer for order #${result.orderId}`
                    }),
                });
            } catch { /* The on-hold order already records the payment claim. */ }
        } catch (err) { setError(err instanceof Error ? err.message : "Please try again or contact support."); }
        finally { setConfirming(false); submitting.current = false; }
    }

    if (IS_DEMO_STORE || !BANK_TRANSFER_ENABLED) return <main className={styles.empty}>
        <h1>Bank transfer is not available yet</h1><Link href="/checkout">Back to checkout</Link>
    </main>;

    if (!loaded || !order) return <main className={styles.empty}>
        <Landmark size={28} /><h1>{loaded ? "No pending transfer" : "Loading your checkout…"}</h1>
        {loaded && <><p>{error || "Return to checkout to choose bank transfer for your order."}</p><Link className={styles.primary} href="/checkout">Back to checkout</Link></>}
    </main>;

    const address = [order.shipping.address, order.shipping.apartment, order.shipping.city, order.shipping.state, order.shipping.postalCode, "Nigeria"].filter(Boolean).join(", ");
    const subtotal = order.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return <main className={styles.page}>
        <header className={styles.header}><div className={styles.headerInner}>
            <span className={styles.headerIcon}>{receipt ? <Check size={20} /> : <Landmark size={20} />}</span>
            <div><p className={styles.eyebrow}>{receipt ? `Order #${receipt.orderNumber}` : "Complete your payment"}</p><h1>Thank you, {order.shipping.firstName}!</h1></div>
            <span className={styles.status}>{receipt ? "Awaiting verification" : "Awaiting transfer"}</span>
        </div></header>
        <div className={styles.grid}>
            <div className={styles.mainColumn}>
                <section className={`${styles.card} ${styles.payment}`} aria-labelledby="payment-title">
                    {receipt ? <div className={styles.receipt} role="status">
                        <CheckCircle size={36} /><p className={styles.eyebrow}>Transfer reported</p><h2 id="payment-title">We’re checking your payment</h2>
                        <p>Your payment confirmation for order #{receipt.orderNumber} has been submitted. Your order is on hold until our team verifies the transfer.</p>
                        <p>Please do not send another payment.</p>
                        <Link className={styles.primary} href={`/account/orders/${receipt.orderId}?email=${encodeURIComponent(order.shipping.email.toLowerCase())}`}>View my order <ArrowRight size={17} /></Link>
                    </div> : <>
                        <div className={styles.sectionHeading}><Landmark size={22} /><div><h2 id="payment-title">Pay by bank transfer</h2><p>Transfer the exact amount to the account below.</p></div></div>
                        <div className={styles.amount}><span>Amount to transfer</span><strong>{money(order.total)}</strong><span>NGN · Includes shipping and discounts</span></div>
                        <dl className={styles.bankDetails}>
                            <div><dt>Bank</dt><dd>{BANK_DETAILS.bankName}</dd></div>
                            <div><dt>Account name</dt><dd>{BANK_DETAILS.accountName}</dd></div>
                            <div className={styles.accountRow}><div><dt>Account number</dt><dd className={styles.accountNumber}>{BANK_DETAILS.accountNumber}</dd></div>
                                <button type="button" className={styles.copy} onClick={copyAccount} aria-label="Copy account number">{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? "Copied" : "Copy"}</button>
                            </div>
                        </dl>
                        <div className={styles.instructions}><ShieldCheck size={18} /><p>Check that the account name matches before sending. After completing your transfer, use the button below to let us know.</p></div>
                        <button type="button" className={styles.primary} disabled={confirming} onClick={confirmPayment}>{confirming ? "Submitting confirmation…" : "I’ve made the transfer"}{!confirming && <ArrowRight size={18} />}</button>
                        <p className={styles.caption}>Your order will be processed after we verify receipt of your payment.</p>
                    </>}
                    {error && <p className={styles.error} role="alert">{error}</p>}
                </section>
                <section className={`${styles.card} ${styles.map}`} aria-label="Delivery location">
                    <iframe title="Delivery location" loading="lazy" src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed&z=14`} />
                    <div><MapPin size={16} /><p>{address}</p></div>
                </section>
                <section className={`${styles.card} ${styles.details}`} aria-labelledby="details-title">
                    <h2 id="details-title" className={styles.eyebrow}>Order details</h2>
                    <div className={styles.detailsGrid}>
                        <div><h3>Contact</h3><p>{order.shipping.email}</p><p>{order.shipping.phone}</p></div>
                        <div><h3>Payment</h3><p>Bank transfer</p><p>{receipt ? "Awaiting verification" : "Awaiting transfer"}</p></div>
                        <div><h3>Shipping address</h3><p>{order.shipping.firstName} {order.shipping.lastName}</p><p>{address}</p></div>
                        <div><h3>Shipping method</h3><p>{order.selectedRate.carrier_name}</p>{order.selectedRate.delivery_time && <p>{order.selectedRate.delivery_time}</p>}</div>
                    </div>
                </section>
                <div className={styles.footer}><Link href={receipt ? "/shop" : "/checkout"}><ArrowLeft size={14} />{receipt ? "Continue shopping" : "Return to checkout"}</Link><span>Need help? <Link href="/contact">Contact us</Link></span></div>
            </div>
            <aside className={`${styles.card} ${styles.summary}`} aria-labelledby="summary-title">
                <h2 id="summary-title" className={styles.eyebrow}>Order summary</h2>
                <div className={styles.items}>{order.cart.map((item, index) => <div className={styles.item} key={`${item.productId}-${index}`}>
                    <div className={styles.image}>{item.image && <Image src={item.image} alt={item.name} fill sizes="56px" style={{ objectFit: "cover", objectPosition: "top" }} />}<span>{item.quantity}</span></div>
                    <div className={styles.itemInfo}><h3>{item.name}</h3><p>{[item.color, item.size].filter(Boolean).join(" / ")}</p><p>Qty: {item.quantity}</p></div><strong>{money(item.price * item.quantity)}</strong>
                </div>)}</div>
                <dl className={styles.totals}>
                    <div><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div>
                    {order.promoDiscount > 0 && <div><dt>Discount{order.promoCode ? ` (${order.promoCode})` : ""}</dt><dd className={styles.discount}>−{money(order.promoDiscount)}</dd></div>}
                    <div><dt>Shipping</dt><dd>{order.selectedRate.amount === 0 ? "FREE" : money(order.selectedRate.amount / 100)}</dd></div>
                    <div className={styles.total}><dt>Total <small>NGN</small></dt><dd>{money(order.total)}</dd></div>
                </dl>
                <p className={styles.summaryNote}><ShieldCheck size={15} />{receipt ? "Payment verification in progress" : "Complete your payment to finish checkout"}</p>
            </aside>
        </div>
    </main>;
}
