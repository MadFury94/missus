import { NextRequest, NextResponse } from "next/server";
import { IS_DEMO_STORE } from "./lib/store-config";

export function proxy(request: NextRequest) {
    if (!IS_DEMO_STORE) return NextResponse.next();
    const url = request.nextUrl.clone();
    // Old payment links must never show Missus bank details in the demo.
    if (url.pathname.startsWith("/checkout/bank-transfer") || url.pathname.startsWith("/checkout/callback")) {
        return NextResponse.redirect(new URL("/checkout", request.url));
    }
    // Every API request stays local, including legacy admin/payment/debug routes.
    if (url.pathname.startsWith("/api/") && !url.pathname.startsWith("/api/demo/")) {
        url.pathname = `/api/demo${url.pathname.slice(4)}`;
        return NextResponse.rewrite(url);
    }
    return NextResponse.next();
}

export const config = { matcher: ["/api/:path*", "/checkout/bank-transfer/:path*", "/checkout/callback/:path*"] };
