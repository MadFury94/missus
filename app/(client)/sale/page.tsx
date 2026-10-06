import type { Metadata } from "next";
import { getSaleProducts } from "@/lib/woocommerce";
import CountdownTimer from "@/components/ui/CountdownTimer";
import SaleClient from "./SaleClient";

export const metadata: Metadata = {
    title: "Adire Fashion Sale | Yoanne Couture Lagos",
    description: "Shop limited-time offers on Yoanne Couture Adire ready-to-wear, kaftans and contemporary African fashion. Discover handcrafted Lagos style at special prices.",
    keywords: ["Adire sale Nigeria", "African fashion sale Lagos", "kaftan sale", "designer fashion deals Nigeria"],
};export const revalidate = 60;

export default async function SalePage() {
    const products = await getSaleProducts(60);

    return (
        <>
            {/* Sale hero */}
            <div
                style={{
                    background: "#7F0E12",
                    padding: "36px 20px",
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage:
                            "repeating-linear-gradient(-45deg,transparent,transparent 10px,rgba(255,255,255,.03) 10px,rgba(255,255,255,.03) 20px)",
                    }}
                />
                <h1
                    style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: "clamp(60px,10vw,120px)",
                        fontWeight: 900,
                        textTransform: "uppercase",
                        color: "#fff",
                        letterSpacing: "-.02em",
                        lineHeight: 0.9,
                        position: "relative",
                        zIndex: 2,
                    }}
                >
                    MISSUS
                    <br />
                    DEALS
                </h1>
                <p
                    style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: "18px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,.8)",
                        letterSpacing: ".2em",
                        marginTop: "12px",
                        position: "relative",
                        zIndex: 2,
                    }}
                >
                    Up to 60% OFF · Prices As Marked
                </p>
                <div style={{ position: "relative", zIndex: 2, marginTop: "20px" }}>
                    <CountdownTimer targetHours={8} />
                </div>
            </div>

            {/* Client section — tabs, sort, grid */}
            <SaleClient initialProducts={products} />
        </>
    );
}
