"use client";
import { motion } from "framer-motion";
import { Clock, MapPin } from "lucide-react";

interface TrackingEvent {
    status: string;
    description: string;
    timestamp: string;
    location?: string;
}

interface LatestEventCardProps {
    event: TrackingEvent;
}

export default function LatestEventCard({ event }: LatestEventCardProps) {
    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        return {
            date: date.toLocaleDateString("en-NG", {
                weekday: "long",
                day: "numeric",
                month: "short",
                year: "numeric"
            }),
            time: date.toLocaleTimeString("en-NG", {
                hour: "2-digit",
                minute: "2-digit"
            })
        };
    };

    const { date, time } = formatDate(event.timestamp);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
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
                    Latest Update
                </h3>

                <motion.div
                    animate={{
                        scale: [1, 1.1, 1]
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: "easeInOut"
                    }}
                    style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#10b981"
                    }}
                />
            </div>

            <div style={{
                background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                borderRadius: "8px",
                padding: "20px",
                border: "1px solid #bae6fd"
            }}>
                <div style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    marginBottom: "16px"
                }}>
                    <div style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "8px",
                        background: "#0284c7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0
                    }}>
                        <span style={{ fontSize: "18px" }}>📦</span>
                    </div>

                    <div style={{ flex: 1 }}>
                        <p style={{
                            fontSize: "16px",
                            fontWeight: 600,
                            color: "#0c4a6e",
                            marginBottom: "4px",
                            fontFamily: "'DM Sans', sans-serif"
                        }}>
                            {event.description}
                        </p>
                        <p style={{
                            fontSize: "14px",
                            color: "#075985",
                            fontFamily: "'DM Sans', sans-serif"
                        }}>
                            Status: {event.status}
                        </p>
                    </div>
                </div>

                {/* Time and Location */}
                <div style={{
                    display: "flex",
                    gap: "24px",
                    fontSize: "14px",
                    color: "#075985"
                }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                    }}>
                        <Clock size={16} />
                        <div>
                            <p style={{
                                fontWeight: 500,
                                fontFamily: "'DM Sans', sans-serif"
                            }}>
                                {date}
                            </p>
                            <p style={{
                                fontSize: "12px",
                                opacity: 0.8,
                                fontFamily: "'DM Sans', sans-serif"
                            }}>
                                {time}
                            </p>
                        </div>
                    </div>

                    {event.location && (
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
                        }}>
                            <MapPin size={16} />
                            <p style={{
                                fontWeight: 500,
                                fontFamily: "'DM Sans', sans-serif"
                            }}>
                                {event.location}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}