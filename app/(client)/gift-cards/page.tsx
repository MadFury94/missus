import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Gift Cards | Missus Outfits",
    description: "Give the perfect gift with Missus Outfits gift cards. Available in multiple denominations for fashion lovers.",
};

export default function GiftCardsPage() {
    return (
        <div style={{ minHeight: "60vh", padding: "60px 20px" }}>
            <div style={{ maxWidth: "1000px", margin: "0 auto", textAlign: "center" }}>
                <h1 style={{
                    fontSize: "32px",
                    fontWeight: 700,
                    marginBottom: "16px",
                    fontFamily: "var(--font-display, 'DM Sans', sans-serif)"
                }}>
                    Gift Cards
                </h1>
                <p style={{
                    fontSize: "16px",
                    color: "#666",
                    marginBottom: "40px",
                    maxWidth: "600px",
                    margin: "0 auto 40px"
                }}>
                    Give the perfect gift of fashion choice. Our digital gift cards are delivered instantly and never expire.
                </p>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "20px",
                    marginBottom: "40px"
                }}>
                    {[
                        { amount: "₦10,000", popular: false },
                        { amount: "₦25,000", popular: true },
                        { amount: "₦50,000", popular: false },
                        { amount: "₦100,000", popular: false },
                    ].map((card) => (
                        <div
                            key={card.amount}
                            style={{
                                border: card.popular ? "2px solid #7F0E12" : "1px solid #e8e8e8",
                                borderRadius: "8px",
                                padding: "30px 20px",
                                textAlign: "center",
                                position: "relative",
                                background: "#fff",
                                cursor: "pointer",
                                transition: "transform 0.2s, box-shadow 0.2s"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.1)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "none";
                            }}
                        >
                            {card.popular && (
                                <div style={{
                                    position: "absolute",
                                    top: "-10px",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    background: "#7F0E12",
                                    color: "#fff",
                                    padding: "4px 12px",
                                    borderRadius: "12px",
                                    fontSize: "11px",
                                    fontWeight: 600,
                                    textTransform: "uppercase"
                                }}>
                                    Most Popular
                                </div>
                            )}
                            <h3 style={{
                                fontSize: "28px",
                                fontWeight: 700,
                                marginBottom: "12px",
                                color: "#000"
                            }}>
                                {card.amount}
                            </h3>
                            <p style={{
                                fontSize: "14px",
                                color: "#666",
                                marginBottom: "20px"
                            }}>
                                Perfect for any fashion lover
                            </p>
                            <button
                                style={{
                                    background: card.popular ? "#7F0E12" : "#000",
                                    color: "#fff",
                                    border: "none",
                                    padding: "12px 24px",
                                    borderRadius: "25px",
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    width: "100%",
                                    transition: "opacity 0.2s"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                                onClick={() => {
                                    // Add to cart logic here
                                    alert(`Adding ${card.amount} gift card to cart...`);
                                }}
                            >
                                Add to Cart
                            </button>
                        </div>
                    ))}
                </div>

                <div style={{
                    background: "#f8f8f8",
                    padding: "30px",
                    borderRadius: "8px",
                    textAlign: "left",
                    maxWidth: "700px",
                    margin: "0 auto"
                }}>
                    <h3 style={{
                        fontSize: "18px",
                        fontWeight: 600,
                        marginBottom: "16px",
                        color: "#000"
                    }}>
                        How Gift Cards Work
                    </h3>
                    <ul style={{
                        fontSize: "14px",
                        color: "#555",
                        listStyle: "none",
                        padding: 0
                    }}>
                        <li style={{ marginBottom: "8px", paddingLeft: "20px", position: "relative" }}>
                            <span style={{ position: "absolute", left: "0", color: "#7F0E12", fontWeight: 600 }}>✓</span>
                            Digital delivery - sent instantly to your email
                        </li>
                        <li style={{ marginBottom: "8px", paddingLeft: "20px", position: "relative" }}>
                            <span style={{ position: "absolute", left: "0", color: "#7F0E12", fontWeight: 600 }}>✓</span>
                            Never expire - use anytime you want
                        </li>
                        <li style={{ marginBottom: "8px", paddingLeft: "20px", position: "relative" }}>
                            <span style={{ position: "absolute", left: "0", color: "#7F0E12", fontWeight: 600 }}>✓</span>
                            Can be used for any items on the website
                        </li>
                        <li style={{ marginBottom: "8px", paddingLeft: "20px", position: "relative" }}>
                            <span style={{ position: "absolute", left: "0", color: "#7F0E12", fontWeight: 600 }}>✓</span>
                            Balance can be checked anytime online
                        </li>
                        <li style={{ paddingLeft: "20px", position: "relative" }}>
                            <span style={{ position: "absolute", left: "0", color: "#7F0E12", fontWeight: 600 }}>✓</span>
                            Perfect for gifting to friends and family
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}