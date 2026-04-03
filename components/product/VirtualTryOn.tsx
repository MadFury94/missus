"use client";
import { useState, useRef } from "react";
import { validateTryOnImage } from "@/lib/virtual-tryon";

interface VirtualTryOnProps {
    productImage: string;
    productName: string;
    category?: 'upper_body' | 'lower_body' | 'dresses';
}

export default function VirtualTryOn({ productImage, productName, category }: VirtualTryOnProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [userImage, setUserImage] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [remaining, setRemaining] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validation = validateTryOnImage(file);
        if (!validation.valid) {
            setError(validation.error || 'Invalid image');
            return;
        }

        // Convert to base64 for preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setUserImage(e.target?.result as string);
            setError(null);
        };
        reader.readAsDataURL(file);
    };

    const handleTryOn = async () => {
        if (!userImage) return;

        setLoading(true);
        setError(null);

        try {
            // In production, you'd upload to cloud storage first
            // For now, we'll send base64 (not recommended for production)
            const response = await fetch('/api/virtual-tryon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userImageUrl: userImage,
                    garmentImageUrl: productImage,
                    category
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate try-on');
            }

            setResultImage(data.imageUrl);
            setRemaining(data.remaining);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    width: "100%",
                    padding: "14px",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "#fff",
                    border: "none",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: "15px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: ".08em",
                    cursor: "pointer",
                    transition: "transform .2s",
                    marginTop: "12px"
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
                ✨ Try It On Virtually
            </button>
        );
    }

    return (
        <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.8)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
        }}>
            <div style={{
                background: "#fff",
                borderRadius: "12px",
                maxWidth: "900px",
                width: "100%",
                maxHeight: "90vh",
                overflow: "auto",
                position: "relative"
            }}>
                <button
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: "absolute",
                        top: "16px",
                        right: "16px",
                        background: "#000",
                        color: "#fff",
                        border: "none",
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        cursor: "pointer",
                        fontSize: "18px"
                    }}
                >
                    ×
                </button>

                <div style={{ padding: "32px" }}>
                    <h2 style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: "28px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        marginBottom: "8px"
                    }}>
                        Virtual Try-On
                    </h2>
                    <p style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>
                        Upload your photo to see how {productName} looks on you
                    </p>
                    {remaining !== null && (
                        <p style={{ fontSize: "12px", color: "#667eea", fontWeight: 600, marginBottom: "16px" }}>
                            ✨ {remaining} free tries remaining today
                        </p>
                    )}

                    {!resultImage ? (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                            {/* Upload Section */}
                            <div>
                                <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px" }}>
                                    Your Photo
                                </h3>
                                {!userImage ? (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{
                                            border: "2px dashed #ddd",
                                            borderRadius: "8px",
                                            padding: "40px 20px",
                                            textAlign: "center",
                                            cursor: "pointer",
                                            background: "#f9f9f9"
                                        }}
                                    >
                                        <div style={{ fontSize: "48px", marginBottom: "12px" }}>📸</div>
                                        <p style={{ fontSize: "14px", color: "#666" }}>
                                            Click to upload your photo
                                        </p>
                                        <p style={{ fontSize: "12px", color: "#999", marginTop: "8px" }}>
                                            Best results: full body, good lighting
                                        </p>
                                    </div>
                                ) : (
                                    <div style={{ position: "relative" }}>
                                        <img
                                            src={userImage}
                                            alt="Your photo"
                                            style={{ width: "100%", borderRadius: "8px" }}
                                        />
                                        <button
                                            onClick={() => setUserImage(null)}
                                            style={{
                                                position: "absolute",
                                                top: "8px",
                                                right: "8px",
                                                background: "#000",
                                                color: "#fff",
                                                border: "none",
                                                padding: "6px 12px",
                                                borderRadius: "4px",
                                                cursor: "pointer",
                                                fontSize: "12px"
                                            }}
                                        >
                                            Change
                                        </button>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    style={{ display: "none" }}
                                />
                            </div>

                            {/* Product Section */}
                            <div>
                                <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px" }}>
                                    Product
                                </h3>
                                <img
                                    src={productImage}
                                    alt={productName}
                                    style={{ width: "100%", borderRadius: "8px" }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: "center" }}>
                            <img
                                src={resultImage}
                                alt="Try-on result"
                                style={{ maxWidth: "100%", borderRadius: "8px", marginBottom: "16px" }}
                            />
                            <button
                                onClick={() => {
                                    setResultImage(null);
                                    setUserImage(null);
                                }}
                                style={{
                                    padding: "12px 24px",
                                    background: "#000",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    fontWeight: 600
                                }}
                            >
                                Try Another Photo
                            </button>
                        </div>
                    )}

                    {error && (
                        <div style={{
                            marginTop: "16px",
                            padding: "12px",
                            background: "#fee",
                            color: "#c00",
                            borderRadius: "6px",
                            fontSize: "14px"
                        }}>
                            {error}
                        </div>
                    )}

                    {userImage && !resultImage && (
                        <button
                            onClick={handleTryOn}
                            disabled={loading}
                            style={{
                                width: "100%",
                                marginTop: "24px",
                                padding: "16px",
                                background: loading ? "#ccc" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                                fontFamily: "'Barlow Condensed', sans-serif",
                                fontSize: "16px",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: ".08em",
                                cursor: loading ? "not-allowed" : "pointer"
                            }}
                        >
                            {loading ? "Generating... (30-60s)" : "Generate Try-On"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
