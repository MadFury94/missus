"use client";
import { motion } from "framer-motion";

interface TrackingEvent {
    status: string;
    description: string;
    timestamp: string;
    location?: string;
}

interface ShipmentTimelineProps {
    events: TrackingEvent[];
    currentStatus: string;
}

const TIMELINE_STAGES = [
    { key: "order_placed", label: "Order Placed", icon: "📝" },
    { key: "picked_up", label: "Picked Up", icon: "📦" },
    { key: "in_transit", label: "In Transit", icon: "🚛" },
    { key: "out_for_delivery", label: "Out for Delivery", icon: "🚚" },
    { key: "delivered", label: "Delivered", icon: "✅" },
];

export default function ShipmentTimeline({ events, currentStatus }: ShipmentTimelineProps) {
    const getStageStatus = (stageKey: string, index: number) => {
        // Determine status based on events and current status
        const eventStatuses = events.map(e => e.status.toLowerCase());
        const isCompleted = eventStatuses.some(status =>
            status.includes(stageKey) ||
            (stageKey === "order_placed") ||
            (stageKey === "picked_up" && (status.includes("picked") || status.includes("collected"))) ||
            (stageKey === "in_transit" && (status.includes("transit") || status.includes("shipped"))) ||
            (stageKey === "out_for_delivery" && status.includes("delivery")) ||
            (stageKey === "delivered" && status.includes("delivered"))
        );

        const isCurrent = currentStatus.toLowerCase().includes(stageKey) ||
            (stageKey === "in_transit" && currentStatus.toLowerCase().includes("transit"));

        if (isCompleted) return "completed";
        if (isCurrent) return "current";
        return "pending";
    };

    return (
        <div style={{
            background: "#fff",
            border: "1px solid #e5e5e5",
            borderRadius: "12px",
            padding: "32px",
            marginBottom: "24px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
        }}>
            <div style={{ marginBottom: "24px" }}>
                <h3 style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "#000",
                    marginBottom: "8px",
                    fontFamily: "'DM Sans', sans-serif"
                }}>
                    Shipment Progress
                </h3>
                <p style={{
                    fontSize: "14px",
                    color: "#666",
                    fontFamily: "'DM Sans', sans-serif"
                }}>
                    Track your package journey
                </p>
            </div>

            {/* Desktop Timeline */}
            <div style={{ display: "none" }} className="md:block">
                <div style={{ position: "relative", padding: "20px 0" }}>
                    {/* Progress Line */}
                    <div style={{
                        position: "absolute",
                        top: "50%",
                        left: "0",
                        right: "0",
                        height: "2px",
                        background: "#e5e5e5",
                        transform: "translateY(-50%)"
                    }} />

                    <motion.div
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "0",
                            height: "2px",
                            background: "var(--color-brand-primary, #7F0E12)",
                            transform: "translateY(-50%)"
                        }}
                        initial={{ width: "0%" }}
                        animate={{
                            width: `${(TIMELINE_STAGES.filter((_, i) => getStageStatus(TIMELINE_STAGES[i].key, i) === "completed").length / (TIMELINE_STAGES.length - 1)) * 100}%`
                        }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    />

                    {/* Timeline Steps */}
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        position: "relative"
                    }}>
                        {TIMELINE_STAGES.map((stage, index) => {
                            const status = getStageStatus(stage.key, index);
                            return (
                                <motion.div
                                    key={stage.key}
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        position: "relative"
                                    }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    {/* Stage Circle */}
                                    <motion.div
                                        style={{
                                            width: "48px",
                                            height: "48px",
                                            borderRadius: "50%",
                                            background: status === "completed" ? "var(--color-brand-primary, #7F0E12)" :
                                                status === "current" ? "#fff" : "#f3f4f6",
                                            border: status === "current" ? "3px solid var(--color-brand-primary, #7F0E12)" :
                                                status === "completed" ? "none" : "2px solid #e5e5e5",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "18px",
                                            color: status === "completed" ? "#fff" :
                                                status === "current" ? "var(--color-brand-primary, #7F0E12)" : "#9ca3af",
                                            marginBottom: "12px",
                                            position: "relative",
                                            zIndex: 2
                                        }}
                                        animate={status === "current" ? {
                                            scale: [1, 1.1, 1],
                                            boxShadow: [
                                                "0 0 0 0 rgba(127, 14, 18, 0.4)",
                                                "0 0 0 10px rgba(127, 14, 18, 0)",
                                                "0 0 0 0 rgba(127, 14, 18, 0)"
                                            ]
                                        } : {}}
                                        transition={status === "current" ? {
                                            repeat: Infinity,
                                            duration: 2
                                        } : {}}
                                    >
                                        {status === "completed" ? "✓" : stage.icon}
                                    </motion.div>

                                    {/* Stage Label */}
                                    <p style={{
                                        fontSize: "12px",
                                        fontWeight: status === "current" ? 600 : 500,
                                        color: status === "completed" || status === "current" ? "#000" : "#9ca3af",
                                        textAlign: "center",
                                        whiteSpace: "nowrap",
                                        fontFamily: "'DM Sans', sans-serif"
                                    }}>
                                        {stage.label}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Mobile Timeline */}
            <div className="md:hidden">
                <div style={{ position: "relative", paddingLeft: "32px" }}>
                    {/* Vertical Line */}
                    <div style={{
                        position: "absolute",
                        left: "16px",
                        top: "0",
                        bottom: "0",
                        width: "2px",
                        background: "#e5e5e5"
                    }} />

                    {TIMELINE_STAGES.map((stage, index) => {
                        const status = getStageStatus(stage.key, index);
                        return (
                            <motion.div
                                key={stage.key}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: index < TIMELINE_STAGES.length - 1 ? "24px" : "0",
                                    position: "relative"
                                }}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                {/* Stage Circle */}
                                <motion.div
                                    style={{
                                        width: "32px",
                                        height: "32px",
                                        borderRadius: "50%",
                                        background: status === "completed" ? "var(--color-brand-primary, #7F0E12)" :
                                            status === "current" ? "#fff" : "#f3f4f6",
                                        border: status === "current" ? "2px solid var(--color-brand-primary, #7F0E12)" :
                                            status === "completed" ? "none" : "2px solid #e5e5e5",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "14px",
                                        color: status === "completed" ? "#fff" :
                                            status === "current" ? "var(--color-brand-primary, #7F0E12)" : "#9ca3af",
                                        position: "absolute",
                                        left: "-48px",
                                        zIndex: 2
                                    }}
                                    animate={status === "current" ? {
                                        scale: [1, 1.1, 1],
                                    } : {}}
                                    transition={status === "current" ? {
                                        repeat: Infinity,
                                        duration: 2
                                    } : {}}
                                >
                                    {status === "completed" ? "✓" : stage.icon}
                                </motion.div>

                                {/* Stage Content */}
                                <div style={{ marginLeft: "8px" }}>
                                    <p style={{
                                        fontSize: "14px",
                                        fontWeight: status === "current" ? 600 : 500,
                                        color: status === "completed" || status === "current" ? "#000" : "#9ca3af",
                                        fontFamily: "'DM Sans', sans-serif"
                                    }}>
                                        {stage.label}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}