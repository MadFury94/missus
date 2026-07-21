"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import { validateTryOnImage } from "@/lib/virtual-tryon";

interface Props {
    productImage: string;
    productName: string;
    category?: "upper_body" | "lower_body" | "dresses";
}

/**
 * Upload a File to WordPress media library via the WP REST API and return the URL.
 * This avoids sending raw base64 in the JSON body which exceeds Next.js 4 MB limits.
 */
async function uploadToWordPress(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file, file.name);

    const res = await fetch("https://missusoutfits.com/wp-json/wp/v2/media", {
        method: "POST",
        body: formData,
        // WordPress requires auth for media upload; users must be logged in via JWT
        headers: {
            Accept: "application/json",
        },
        // Credentials included so cookie-based WP auth works if present
        credentials: "include",
    });

    if (!res.ok) {
        // Fall back: convert to data URL and hope it's small enough
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    const data = await res.json();
    return data.source_url as string;
}

export default function VirtualTryOn({ productImage, productName, category }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [userImageUrl, setUserImageUrl] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [remaining, setRemaining] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        const validation = validateTryOnImage(file);
        if (!validation.valid) {
            setError(validation.error ?? "Invalid image");
            return;
        }

        setError(null);
        setUploading(true);

        // Show local preview immediately
        const localUrl = URL.createObjectURL(file);
        setPreviewUrl(localUrl);

        try {
            const url = await uploadToWordPress(file);
            setUserImageUrl(url);
        } catch {
            setError("Failed to upload image. Please try again.");
            setPreviewUrl(null);
        } finally {
            setUploading(false);
        }
    }

    async function handleTryOn() {
        if (!userImageUrl) return;
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/virtual-tryon", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userImageUrl, garmentImageUrl: productImage, category }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Failed to generate try-on");
            setResultImage(data.imageUrl);
            setRemaining(data.remaining);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    function reset() {
        setUserImageUrl(null);
        setPreviewUrl(null);
        setResultImage(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "#fff", border: "none", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "15px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", cursor: "pointer", marginTop: "12px", transition: "opacity .2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
                ✨ Try It On Virtually
            </button>
        );
    }

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Virtual Try-On"
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
        >
            <div style={{ background: "#fff", borderRadius: "12px", maxWidth: "900px", width: "100%", maxHeight: "90vh", overflow: "auto", position: "relative" }}>
                {/* Close */}
                <button
                    onClick={() => { setIsOpen(false); reset(); }}
                    aria-label="Close virtual try-on"
                    style={{ position: "absolute", top: "16px", right: "16px", background: "#000", color: "#fff", border: "none", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                    ×
                </button>

                <div style={{ padding: "32px" }}>
                    <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "28px", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>
                        Virtual Try-On
                    </h2>
                    <p style={{ fontSize: "13px", color: "#666", marginBottom: remaining !== null ? "4px" : "20px" }}>
                        Upload your photo to see how <strong>{productName}</strong> looks on you.
                    </p>
                    {remaining !== null && (
                        <p style={{ fontSize: "12px", color: "#667eea", fontWeight: 600, marginBottom: "20px" }}>
                            ✨ {remaining} free tries remaining today
                        </p>
                    )}

                    {!resultImage ? (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                            {/* Upload */}
                            <div>
                                <h3 style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "12px" }}>Your Photo</h3>
                                {!previewUrl ? (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{ width: "100%", border: "2px dashed #ddd", background: "#f9f9f9", padding: "40px 20px", textAlign: "center", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}
                                        aria-label="Upload your photo"
                                    >
                                        <span style={{ fontSize: "40px" }}>📸</span>
                                        <span style={{ fontSize: "13px", color: "#666" }}>Click to upload your photo</span>
                                        <span style={{ fontSize: "11px", color: "#aaa" }}>Best results: full body, good lighting, max 10 MB</span>
                                    </button>
                                ) : (
                                    <div style={{ position: "relative" }}>
                                        <div style={{ position: "relative", width: "100%", aspectRatio: "3/4", overflow: "hidden", background: "#f5f5f5" }}>
                                            {/* Using next/image for uploaded preview once it's a URL; data URLs use regular img */}
                                            {userImageUrl && !userImageUrl.startsWith("data:") ? (
                                                <Image src={userImageUrl} alt="Your uploaded photo" fill style={{ objectFit: "cover" }} sizes="300px" />
                                            ) : (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={previewUrl} alt="Your uploaded photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            )}
                                        </div>
                                        {uploading && (
                                            <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,.7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", color: "#333" }}>
                                                Uploading…
                                            </div>
                                        )}
                                        <button
                                            onClick={reset}
                                            style={{ position: "absolute", top: "8px", right: "8px", background: "#000", color: "#fff", border: "none", padding: "6px 12px", cursor: "pointer", fontSize: "12px" }}
                                        >
                                            Change
                                        </button>
                                    </div>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} style={{ display: "none" }} aria-hidden="true" tabIndex={-1} />
                            </div>

                            {/* Product */}
                            <div>
                                <h3 style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "12px" }}>Product</h3>
                                <div style={{ position: "relative", width: "100%", aspectRatio: "3/4", overflow: "hidden", background: "#f5f5f5" }}>
                                    <Image src={productImage} alt={productName} fill style={{ objectFit: "cover" }} sizes="300px" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: "center" }}>
                            <div style={{ position: "relative", maxWidth: "500px", margin: "0 auto 20px", aspectRatio: "3/4", overflow: "hidden", background: "#f5f5f5" }}>
                                <Image src={resultImage} alt="Virtual try-on result" fill style={{ objectFit: "contain" }} sizes="500px" />
                            </div>
                            <button
                                onClick={reset}
                                style={{ background: "#000", color: "#fff", border: "none", padding: "12px 28px", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em" }}
                            >
                                Try Another Photo
                            </button>
                        </div>
                    )}

                    {error && (
                        <div role="alert" style={{ marginTop: "16px", padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "13px" }}>
                            {error}
                        </div>
                    )}

                    {previewUrl && !resultImage && userImageUrl && !uploading && (
                        <button
                            onClick={handleTryOn}
                            disabled={loading}
                            style={{ width: "100%", marginTop: "24px", padding: "16px", background: loading ? "#aaa" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "#fff", border: "none", borderRadius: "4px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "16px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", cursor: loading ? "not-allowed" : "pointer" }}
                        >
                            {loading ? "Generating… (30–60 seconds)" : "Generate Try-On"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
