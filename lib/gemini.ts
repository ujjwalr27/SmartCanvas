import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

if (!apiKey) {
    console.warn('GOOGLE_GEMINI_API_KEY is not set. AI features will use demo mode.');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Use Gemini 2.0 Flash - best free tier quota
const MODEL_NAME = "models/gemini-2.0-flash";

// Fallback models in order of preference (for free tier)
const FALLBACK_MODELS = [
    "models/gemini-2.0-flash",
    "models/gemini-2.0-flash-lite",
    "models/gemini-2.5-flash-lite",
];

// Create model with the specified model name
function createModel(modelName: string) {
    if (!genAI) return null;
    return genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
        },
    });
}

// Primary model
export const geminiFlash = createModel(MODEL_NAME);
export const geminiVision = createModel(MODEL_NAME);
export const geminiPro = createModel(MODEL_NAME);

// Generate content with fallback to other models if quota exceeded
export async function generateContentWithFallback(
    prompt: string,
    options?: any
): Promise<string> {
    if (!genAI) {
        throw new Error('Gemini API not configured');
    }

    let lastError: any;

    for (const modelName of FALLBACK_MODELS) {
        try {
            console.log(`Trying model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });

            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                ...options,
            });

            const response = await result.response;
            console.log(`Success with model: ${modelName}`);
            return response.text();
        } catch (error: any) {
            console.log(`Model ${modelName} failed:`, error.message?.substring(0, 100));
            lastError = error;

            // If not a quota error, throw immediately
            if (error.status !== 429 && !error.message?.includes('quota')) {
                throw error;
            }
            // Continue to next model for quota errors
        }
    }

    throw lastError || new Error('All models failed');
}

// Simple retry wrapper for existing code
export async function generateWithRetry(
    model: any,
    prompt: string,
    options?: any
) {
    const maxRetries = 3;
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
        try {
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                ...options,
            });
            const response = await result.response;
            return response.text();
        } catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    }

    throw lastError;
}
