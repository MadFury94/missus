"use client";
/**
 * Dynamically imports both popups after mount so they don't appear in
 * server-rendered HTML and don't affect LCP.
 *
 * Popup A shows first. If dismissed without subscribing, Popup B is armed.
 * ClientShell renders <PopupOrchestrator /> once.
 */
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const PopupA = dynamic(() => import("./PopupA"), { ssr: false });
const PopupB = dynamic(() => import("./PopupB"), { ssr: false });

export default function PopupOrchestrator() {
    const [mounted, setMounted] = useState(false);
    const [armB, setArmB] = useState(false);

    useEffect(() => {
        // Defer any popup logic until after first paint
        const t = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(t);
    }, []);

    if (!mounted) return null;

    return (
        <>
            <PopupA onDismissedWithoutSubscribe={() => setArmB(true)} />
            {armB && <PopupB />}
        </>
    );
}
