// Virtual Try-On using Google Gemini AI
// FREE tier: 15 requests per minute, 1500 per day

import { GoogleGenerativeAI } from "@google/generative-ai";

export interface GeminiTryOnRequest {
    userImageBase64: string;
    garmentImageBase64: string;
    productName: string;
}

export interface GeminiTryOnResult {
    success: boolean;
    description?: string;
    recommendations?: string[];
    error?: string;
}

/**
 * Analyze how a garment would look on a user using Gemini Vision
 * Note: Gemini can't gen