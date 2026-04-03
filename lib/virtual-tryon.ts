// Virtual Try-On API Integration
// Using Replicate API with IDM-VTON model

export interface TryOnRequest {
    userImageUrl: string;
    garmentImageUrl: string;
    category?: 'upper_body' | 'lower_body' | 'dresses';
}

export interface TryOnResult {
    success: boolean;
    imageUrl?: string;
    error?: string;
    processingTime?: number;
}

/**
 * Generate virtual try-on using Replicate API
 */
export async function generateVirtualTryOn(
    request: TryOnRequest
): Promise<TryOnResult> {
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

    if (!REPLICATE_API_TOKEN) {
        return {
            success: false,
            error: 'Virtual try-on service not configured'
        };
    }

    try {
        const startTime = Date.now();

        // Call Replicate API
        const response = await fetch('https://api.replicate.com/v1/predictions', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${REPLICATE_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                version: 'c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4', // IDM-VTON
                input: {
                    human_img: request.userImageUrl,
                    garm_img: request.garmentImageUrl,
                    garment_des: 'A fashionable garment',
                    category: request.category || 'upper_body',
                    n_samples: 1,
                    n_steps: 20,
                    image_scale: 1.0,
                    seed: -1
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Replicate API error: ${response.statusText}`);
        }

        const prediction = await response.json();

        // Poll for result
        let result = prediction;
        while (result.status === 'starting' || result.status === 'processing') {
            await new Promise(resolve => setTimeout(resolve, 1000));

            const pollResponse = await fetch(
                `https://api.replicate.com/v1/predictions/${prediction.id}`,
                {
                    headers: {
                        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
                    }
                }
            );

            result = await pollResponse.json();
        }

        if (result.status === 'succeeded' && result.output) {
            return {
                success: true,
                imageUrl: Array.isArray(result.output) ? result.output[0] : result.output,
                processingTime: Date.now() - startTime
            };
        }

        return {
            success: false,
            error: result.error || 'Failed to generate try-on image'
        };

    } catch (error) {
        console.error('Virtual try-on error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Validate image for virtual try-on
 */
export function validateTryOnImage(file: File): { valid: boolean; error?: string } {
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        return { valid: false, error: 'Image must be less than 10MB' };
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
        return { valid: false, error: 'File must be an image' };
    }

    return { valid: true };
}

/**
 * Get category from product data
 */
export function getGarmentCategory(productName: string, categories: string[]): 'upper_body' | 'lower_body' | 'dresses' {
    const name = productName.toLowerCase();
    const cats = categories.map(c => c.toLowerCase()).join(' ');

    if (name.includes('dress') || cats.includes('dress')) {
        return 'dresses';
    }

    if (name.includes('pant') || name.includes('skirt') || name.includes('short') ||
        cats.includes('bottom')) {
        return 'lower_body';
    }

    return 'upper_body';
}
