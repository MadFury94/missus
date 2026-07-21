import { Suspense } from "react";
import CallbackContent from "./CallbackContent";

export default function CheckoutCallbackPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ fontSize: "14px", color: "#767676" }}>Verifying your payment…</p>
            </div>
        }>
            <CallbackContent />
        </Suspense>
    );
}
