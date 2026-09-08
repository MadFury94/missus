"use client";
import { motion } from "framer-motion";
import { Package, Clock } from "lucide-react";

export default function TrackingEmptyState() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                background: "#fff",
                border: "1px solid #e5e5e5",
                borderRadius: "12px",
                padding: "48px 24px",
                textAlign: "center",
                marginBottom: "24px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
            }}
        >
            {/* Animated Icon */}
            <motion.div
                style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "#f8f9fa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 24px",
                    border: "2px solid #e5e5e5"
                }}
                animate={{
                    scale: [1, 1.05, 1],
                    borderColor: ["#e5e5e5", "#d1d5db", "#e5e5e5"]
                }}
                transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut"
                }}
            >
                <Package size={32} color="#9ca3af" />
            </motion.div>

            {/* Title */}
            <h3 style={{
                fontSize: "20px",
                fontWeight: 600,
                color: "#000",
                marginBottom: "12px",
                fontFamily: "'DM Sans', sans-serif"
            }}>
                Awaiting Pickup
            </h3>

            {/* Description */}
            <p style={{
                fontSize: "16px",
                color: "#6b7280",
                marginBottom: "20px",
                lineHeight: 1.6,
                maxWidth: "400px",
                margin: "0 auto 20px",
                fontFamily: "'DM Sans', sans-serif"
            }}>
                Your order is being prepared for shipment. We'll notify you as soon as it's picked up by our carrier.
            </p>

            {/* Status indicator */}
            <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 20px",
                background: "#fef3c7",
                borderRadius: "24px",
                fontSize: "14px",
                fontWeight: 500,
                color: "#92400e",
                fontFamily: "'DM Sans', sans-serif"
            }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: "linear"
                    }}
                >
                    <Clock size={16} />
                </motion.div>
                Processing Order
            </div>

            {/* Timeline preview */}
            <div style={{
                marginTop: "32px",
                padding: "20px",
                background: "#f8f9fa",
                borderRadius: "8px",
                maxWidth: "300px",
                margin: "32px auto 0"
            }}>
                <p style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#6b7280",
                    marginBottom: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontFamily: "'DM Sans', sans-serif"
                }}>
                    Next Steps
                </p>

                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "10px",
                    color: "#9ca3af",
                    fontFamily: "'DM Sans', sans-serif"
                }}>
                    <div style={{ textAlign: "center" }}>
                        <div style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            background: "var(--color-brand-primary, #7F0E12)",
                            margin: "0 auto 4px"
                        }} />
                        <span>Order Placed</span>
                    </div>

                    <div style={{
                        flex: 1,
                        height: "1px",
                        background: "#e5e5e5",
                        margin: "0 8px"
                    }} />

                    <div style={{ textAlign: "center" }}>
                        <div style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            background: "#e5e5e5",
                            margin: "0 auto 4px"
                        }} />
                        <span>Pickup</span>
                    </div>

                    <div style={{
                        flex: 1,
                        height: "1px",
                        background: "#e5e5e5",
                        margin: "0 8px"
                    }} />

                    <div style={{ textAlign: "center" }}>
                        <div style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            background: "#e5e5e5",
                            margin: "0 auto 4px"
                        }} />
                        <span>Delivery</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}