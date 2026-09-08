"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Address {
    city: string;
    state: string;
    country?: string;
}

interface RouteVisualProps {
    addressFrom: Address;
    addressTo: Address;
    progress: number; // 0-100 representing shipment progress
}

export default function RouteVisual({ addressFrom, addressTo, progress }: RouteVisualProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // Calculate the position along the path based on progress
    const pathProgress = Math.max(0, Math.min(100, progress)) / 100;

    return (
        <div style={{
            background: "#fff",
            border: "1px solid #e5e5e5",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "24px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
        }}>
            <div style={{ marginBottom: "20px" }}>
                <h3 style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "#000",
                    marginBottom: "8px",
                    fontFamily: "'DM Sans', sans-serif"
                }}>
                    Shipment Route
                </h3>
                <p style={{
                    fontSize: "14px",
                    color: "#666",
                    fontFamily: "'DM Sans', sans-serif"
                }}>
                    {addressFrom.city} → {addressTo.city}
                </p>
            </div>

            {/* Route SVG */}
            <div style={{
                width: "100%",
                height: "200px",
                position: "relative",
                background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                borderRadius: "8px",
                overflow: "hidden"
            }}>
                <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 400 200"
                    style={{ position: "absolute", top: 0, left: 0 }}
                >
                    {/* Background grid */}
                    <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5" opacity="0.3" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />

                    {/* Route path */}
                    <motion.path
                        d="M 50 100 Q 200 50 350 100"
                        fill="none"
                        stroke="#e5e5e5"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />

                    {/* Active route path */}
                    <motion.path
                        d="M 50 100 Q 200 50 350 100"
                        fill="none"
                        stroke="var(--color-brand-primary, #7F0E12)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray="100%"
                        initial={{ strokeDashoffset: "100%" }}
                        animate={{ strokeDashoffset: `${100 - (pathProgress * 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    />

                    {/* Origin point */}
                    <motion.circle
                        cx="50"
                        cy="100"
                        r="8"
                        fill="var(--color-brand-primary, #7F0E12)"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                    />

                    {/* Destination point */}
                    <motion.circle
                        cx="350"
                        cy="100"
                        r="8"
                        fill={progress >= 100 ? "var(--color-brand-primary, #7F0E12)" : "#e5e5e5"}
                        stroke={progress >= 100 ? "none" : "var(--color-brand-primary, #7F0E12)"}
                        strokeWidth="2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4, type: "spring" }}
                    />

                    {/* Moving package icon */}
                    <motion.g
                        initial={{ x: 50, y: 100 }}
                        animate={{
                            x: 50 + (pathProgress * 300),
                            y: 100 - (Math.sin(pathProgress * Math.PI) * 50)
                        }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        <motion.circle
                            r="12"
                            fill="#fff"
                            stroke="var(--color-brand-primary, #7F0E12)"
                            strokeWidth="2"
                            animate={{
                                scale: [1, 1.1, 1]
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 2,
                                ease: "easeInOut"
                            }}
                        />
                        <text
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="12"
                            fill="var(--color-brand-primary, #7F0E12)"
                        >
                            📦
                        </text>
                    </motion.g>

                    {/* Origin label */}
                    <text
                        x="50"
                        y="130"
                        textAnchor="middle"
                        fontSize="12"
                        fill="#374151"
                        fontFamily="'DM Sans', sans-serif"
                        fontWeight="500"
                    >
                        {addressFrom.city}
                    </text>

                    {/* Destination label */}
                    <text
                        x="350"
                        y="130"
                        textAnchor="middle"
                        fontSize="12"
                        fill="#374151"
                        fontFamily="'DM Sans', sans-serif"
                        fontWeight="500"
                    >
                        {addressTo.city}
                    </text>
                </svg>

                {/* Progress percentage overlay */}
                <div style={{
                    position: "absolute",
                    top: "16px",
                    right: "16px",
                    background: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(8px)",
                    padding: "8px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--color-brand-primary, #7F0E12)",
                    fontFamily: "'DM Sans', sans-serif"
                }}>
                    {Math.round(progress)}% Complete
                </div>
            </div>

            {/* Address details */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginTop: "16px",
                fontSize: "12px"
            }}>
                <div>
                    <p style={{
                        fontWeight: 600,
                        color: "#374151",
                        marginBottom: "4px",
                        fontFamily: "'DM Sans', sans-serif"
                    }}>
                        FROM
                    </p>
                    <p style={{
                        color: "#6b7280",
                        fontFamily: "'DM Sans', sans-serif"
                    }}>
                        {addressFrom.city}, {addressFrom.state}
                        {addressFrom.country && `, ${addressFrom.country}`}
                    </p>
                </div>
                <div>
                    <p style={{
                        fontWeight: 600,
                        color: "#374141",
                        marginBottom: "4px",
                        fontFamily: "'DM Sans', sans-serif"
                    }}>
                        TO
                    </p>
                    <p style={{
                        color: "#6b7280",
                        fontFamily: "'DM Sans', sans-serif"
                    }}>
                        {addressTo.city}, {addressTo.state}
                        {addressTo.country && `, ${addressTo.country}`}
                    </p>
                </div>
            </div>
        </div>
    );
}