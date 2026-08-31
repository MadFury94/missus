"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import AdminLayout from "@/components/admin/AdminLayout";

interface ProductRow {
    name: string;
    regular_price: string;
    sale_price: string;
    sku: string;
    description: string;
    categories: string; // comma-separated slugs
    images: string;     // comma-separated URLs
    sizes: string;      // comma-separated e.g. S,M,L,XL
    stock_status: string;
    status: string;
}

const CSV_TEMPLATE = [
    "name,regular_price,sale_price,sku,description,categories,images,sizes,stock_status,status",
    "Lorraine Pant Set,59000,49000,LPS-001,Elegant pant set perfect for any occasion,matching-sets,https://example.com/img1.jpg,S|M|L|XL,instock,publish",
    "Maybelline Bubble Mini,55000,,MBM-001,Cute bubble mini dress,dresses,https://example.com/img2.jpg,XS|S|M|L,instock,publish",
].join("\n");

function parseCSV(text: string): ProductRow[] {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map((h) => h.trim());
    return lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((h, i) => { row[h] = values[i] ?? ""; });
        return row as unknown as ProductRow;
    });
}

function rowToWCProduct(row: ProductRow) {
    const categories = row.categories
        ? row.categories.split("|").map((slug) => ({ slug: slug.trim() }))
        : [];
    const images = row.images
        ? row.images.split("|").map((src) => ({ src: src.trim() }))
        : [];
    const sizes = row.sizes
        ? row.sizes.split("|").map((s) => ({ name: s.trim(), slug: s.trim().toLowerCase() }))
        : [];

    return {
        name: row.name,
        type: sizes.length > 0 ? "variable" : "simple",
        status: row.status || "publish",
        regular_price: row.regular_price,
        sale_price: row.sale_price || "",
        sku: row.sku || "",
        description: row.description || "",
        stock_status: row.stock_status || "instock",
        categories,
        images,
        attributes: sizes.length > 0 ? [{
            name: "Size",
            visible: true,
            variation: true,
            options: sizes.map((s) => s.name),
        }] : [],
    };
}

export default function BulkImportPage() {
    const router = useRouter();
    const [csvText, setCsvText] = useState("");
    const [preview, setPreview] = useState<ProductRow[]>([]);
    const [results, setResults] = useState<{ name: string; status: "success" | "error"; message: string }[]>([]);
    const [importing, setImporting] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const user = getCurrentUser();
        if (!user || !isAdmin(user)) router.push("/admin/login");
    }, [router]);

    function handleCSVChange(text: string) {
        setCsvText(text);
        setPreview(parseCSV(text));
        setResults([]);
    }

    function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => handleCSVChange(ev.target?.result as string);
        reader.readAsText(file);
    }

    async function runImport() {
        if (!preview.length) return;
        setImporting(true);
        setResults([]);
        setProgress(0);

        const newResults: typeof results = [];

        for (let i = 0; i < preview.length; i++) {
            const row = preview[i];
            try {
                const payload = rowToWCProduct(row);
                const res = await fetch("/api/admin/products", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) {
                    const err = await res.json();
                    newResults.push({ name: row.name, status: "error", message: err.error || "Failed" });
                } else {
                    newResults.push({ name: row.name, status: "success", message: "Created" });
                }
            } catch (err: any) {
                newResults.push({ name: row.name, status: "error", message: err.message });
            }
            setProgress(Math.round(((i + 1) / preview.length) * 100));
            setResults([...newResults]);
        }

        setImporting(false);
    }

    const successCount = results.filter((r) => r.status === "success").length;
    const errorCount = results.filter((r) => r.status === "error").length;

    return (
        <AdminLayout>
            <div style={{ background: "#fff", border: "1px solid #ccd0d4" }}>
                <div style={{ padding: "12px 20px", borderBottom: "1px solid #ccd0d4", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h1 style={{ fontSize: "23px", fontWeight: 400, margin: 0, color: "#23282d" }}>Bulk Import Products</h1>
                    <button
                        onClick={() => router.push("/admin/products")}
                        style={{ background: "none", border: "1px solid #ccd0d4", padding: "6px 14px", fontSize: "13px", cursor: "pointer", color: "#555" }}
                    >
                        ← Back to Products
                    </button>
                </div>

                <div style={{ padding: "24px" }}>
                    {/* Instructions */}
                    <div style={{ background: "#f0f6fc", border: "1px solid #c3d9f0", padding: "16px 20px", marginBottom: "24px" }}>
                        <p style={{ fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: "#1d2327" }}>How to use bulk import:</p>
                        <ol style={{ paddingLeft: "18px", fontSize: "13px", color: "#444", lineHeight: 1.8 }}>
                            <li>Download the CSV template below and fill in your products</li>
                            <li>Separate multiple values (sizes, images, categories) with a pipe <code style={{ background: "#e8e8e8", padding: "1px 5px" }}>|</code></li>
                            <li>Upload your CSV or paste it directly</li>
                            <li>Preview the rows, then click Import</li>
                        </ol>
                    </div>

                    {/* Template download */}
                    <div style={{ marginBottom: "24px" }}>
                        <button
                            onClick={() => {
                                const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = "missus-products-template.csv";
                                a.click();
                            }}
                            style={{ background: "#2271b1", color: "#fff", border: "none", padding: "8px 16px", fontSize: "13px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
                        >
                            ↓ Download CSV Template
                        </button>
                    </div>

                    {/* File upload */}
                    <div style={{ marginBottom: "16px" }}>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: "#1d2327" }}>
                            Upload CSV File
                        </label>
                        <input
                            type="file"
                            accept=".csv,text/csv"
                            onChange={handleFileUpload}
                            style={{ fontSize: "13px" }}
                        />
                    </div>

                    {/* Or paste */}
                    <div style={{ marginBottom: "24px" }}>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: "#1d2327" }}>
                            Or Paste CSV Content
                        </label>
                        <textarea
                            value={csvText}
                            onChange={(e) => handleCSVChange(e.target.value)}
                            rows={8}
                            placeholder={CSV_TEMPLATE}
                            style={{ width: "100%", border: "1px solid #8c8f94", padding: "10px 12px", fontSize: "12px", fontFamily: "monospace", outline: "none", resize: "vertical" }}
                        />
                    </div>

                    {/* Preview */}
                    {preview.length > 0 && (
                        <div style={{ marginBottom: "24px" }}>
                            <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px", color: "#1d2327" }}>
                                Preview — {preview.length} product{preview.length !== 1 ? "s" : ""} ready to import
                            </h3>
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                                    <thead>
                                        <tr style={{ background: "#f0f0f1", borderBottom: "1px solid #c3c4c7" }}>
                                            {["Name", "Price", "Sale Price", "SKU", "Categories", "Sizes", "Status"].map((h) => (
                                                <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "#1d2327", whiteSpace: "nowrap" }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {preview.map((row, i) => (
                                            <tr key={i} style={{ borderBottom: "1px solid #f0f0f1", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                                                <td style={{ padding: "8px 12px", fontWeight: 600 }}>{row.name || <span style={{ color: "#630D13" }}>Missing!</span>}</td>
                                                <td style={{ padding: "8px 12px" }}>₦{row.regular_price}</td>
                                                <td style={{ padding: "8px 12px", color: "#630D13" }}>{row.sale_price ? `₦${row.sale_price}` : "—"}</td>
                                                <td style={{ padding: "8px 12px", color: "#767676" }}>{row.sku || "—"}</td>
                                                <td style={{ padding: "8px 12px" }}>{row.categories || "—"}</td>
                                                <td style={{ padding: "8px 12px" }}>{row.sizes || "—"}</td>
                                                <td style={{ padding: "8px 12px" }}>
                                                    <span style={{ background: row.status === "publish" ? "#d7f0d7" : "#f0f0f0", color: row.status === "publish" ? "#007a3d" : "#555", padding: "2px 8px", fontSize: "11px", fontWeight: 600 }}>
                                                        {row.status || "publish"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Import button */}
                            {results.length === 0 && (
                                <button
                                    onClick={runImport}
                                    disabled={importing}
                                    style={{ marginTop: "16px", background: importing ? "#8c8f94" : "#007a3d", color: "#fff", border: "none", padding: "10px 24px", fontSize: "14px", fontWeight: 600, cursor: importing ? "not-allowed" : "pointer" }}
                                >
                                    {importing ? `Importing... ${progress}%` : `Import ${preview.length} Products`}
                                </button>
                            )}

                            {/* Progress bar */}
                            {importing && (
                                <div style={{ marginTop: "12px", height: "6px", background: "#e0e0e0" }}>
                                    <div style={{ height: "100%", background: "#007a3d", width: `${progress}%`, transition: "width .3s" }} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Results */}
                    {results.length > 0 && (
                        <div>
                            <div style={{ display: "flex", gap: "16px", marginBottom: "16px", flexWrap: "wrap" }}>
                                <span style={{ background: "#d7f0d7", color: "#007a3d", padding: "6px 14px", fontSize: "13px", fontWeight: 600 }}>
                                    ✓ {successCount} imported successfully
                                </span>
                                {errorCount > 0 && (
                                    <span style={{ background: "#fde8e8", color: "#630D13", padding: "6px 14px", fontSize: "13px", fontWeight: 600 }}>
                                        ✗ {errorCount} failed
                                    </span>
                                )}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                {results.map((r, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", background: r.status === "success" ? "#f0faf4" : "#fef2f2", fontSize: "13px" }}>
                                        <span style={{ color: r.status === "success" ? "#007a3d" : "#630D13", fontWeight: 700 }}>
                                            {r.status === "success" ? "✓" : "✗"}
                                        </span>
                                        <span style={{ fontWeight: 600 }}>{r.name}</span>
                                        <span style={{ color: "#767676" }}>{r.message}</span>
                                    </div>
                                ))}
                            </div>
                            {!importing && (
                                <button
                                    onClick={() => { setCsvText(""); setPreview([]); setResults([]); setProgress(0); }}
                                    style={{ marginTop: "16px", background: "#2271b1", color: "#fff", border: "none", padding: "8px 16px", fontSize: "13px", cursor: "pointer" }}
                                >
                                    Import More Products
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
