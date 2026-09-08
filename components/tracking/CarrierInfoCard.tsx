"use client";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

interface CarrierInfoCardProps {
    carrierName: string;
    carrierTrackingNumber: string;
    carrierTrackingUrl?: string;
}

export default function CarrierInfoCard({
    carrierName,
    carrierTrackingNumber,
    carrierTrackingUrl
}: CarrierInfoCardProps) {
    // Get carrier logo/icon based on name
    const getCarrierIcon = (name: string) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('dhl')) return '📦';
        if (lowerName.includes('ups')) return '🚛';
        if (lowerName.includes('gig')) return '🚚';
        if (lowerName.includes('kwik')) return '⚡';
        return '📮';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                background: "#fff",
                border: "1px solid #e5e5e5",
                borderRadius: "12px",
                padding: "24px",
                marginBottom: "24px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
            }}
        >
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px"
            }}>
                <h3 style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "#000",
                    fontFamily: "'DM Sans', sans-serif"
                }}>
                    Carrier Information
                </h3>

                {carrierTrackingUrl && (
                    <motion.a
                        href={carrierTrackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "8px 12px",
                            background: "var(--color-brand-primary, #7F0E12)",
                            color: "#fff",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 600,
                            textDecoration: "none",
                            fontFamily: "'DM Sans', sans-serif"
                        }}
                    >
                        Track on Carrier
                        <ExternalLink size={14} />
                    </motion.a>
                )}
            </div>

            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "16px",
                background: "#f8f9fa",
                borderRadius: "8px"
            }}>
                {/* Carrier Icon */}
                <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "8px",
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    border: "1px solid #e5e5e5"
                }}>
                    {getCarrierIcon(carrierName)}
                </div>

                <div style={{ flex: 1 }}>
                    <p style={{
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "#000",
                        marginBottom: "4px",
                        fontFamily: "'DM Sans', sans-serif"
                    }}>
                        {carrierName}
                    </p>
                    <p style={{
                        fontSize: "14px",
                        color: "#6b7280",
                        fontFamily: "'DM Sans', sans-serif"
                    }}>
                        Tracking Number: <span style={{ fontWeight: 500, color: "#374151" }}>{carrierTrackingNumber}</span>
                    </p>
                </div>

                {/* Copy button for tracking number */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                        navigator.clipboard.writeText(carrierTrackingNumber);
                        // You could add a toast notification here
                    }}
                    style={{
                        padding: "8px 12px",
                        background: "#fff",
                        border: "1px solid #e5e5e5",
                        borderRadius: "6px",
                        fontSize: "12px",
                        color: "#6b7280",
                        cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif"
                    }}
                >
                    Copy
                </motion.button>
            </div>
        </motion.div>
    );
}