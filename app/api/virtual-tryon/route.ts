import { NextRequest, NextResponse } from 'next/server';
import { generateVirtualTryOn } from '@/lib/virtual-tryon';

// Simple in-memory rate limiting (resets on server restart)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const limit = rateLimitMap.get(ip);

    // Reset every 24 hours
    if (!limit || now > limit.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + 24 * 60 * 60 * 1000 });
        return { allowed: true, remaining: 4 }; // 5 per day, 4 remaining
    }

    // Check if limit exceeded (5 per day for free tier)
    if (limit.count >= 5) {
        return { allowed: false, remaining: 0 };
    }

    limit.count++;
    return { allowed: true, remaining: 5 - limit.count };
}

export async function POST(request: NextRequest) {
    try {
        // Rate limiting to preserve free credit
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const rateLimit = checkRateLimit(ip);

        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    error: 'Daily limit reached. You can try 5 times per day during our free beta.',
                    remaining: 0
                },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { userImageUrl, garmentImageUrl, category } = body;

        if (!userImageUrl || !garmentImageUrl) {
            return NextResponse.json(
                { error: 'Missing required images' },
                { status: 400 }
            );
        }

        // Log usage for monitoring
        console.log(`[Virtual Try-On] Request from ${ip}, remaining today: ${rateLimit.remaining}`);

        const result = await generateVirtualTryOn({
            userImageUrl,
            garmentImageUrl,
            category
        });

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            imageUrl: result.imageUrl,
            processingTime: result.processingTime,
            remaining: rateLimit.remaining
        });

    } catch (error) {
        console.error('Virtual try-on API error:', error);
        return NextResponse.json(
            { error: 'Failed to process virtual try-on' },
            { status: 500 }
        );
    }
}
