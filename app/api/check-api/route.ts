import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET(request: NextRequest) {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

    // Check if API key exists
    if (!apiKey) {
        return NextResponse.json({
            status: 'error',
            message: 'GOOGLE_GEMINI_API_KEY is not set in .env.local',
            keyPresent: false,
        });
    }

    // Check API key format
    const keyInfo = {
        length: apiKey.length,
        prefix: apiKey.substring(0, 7),
        isValidFormat: apiKey.startsWith('AIzaSy') && apiKey.length === 39,
    };

    try {
        const genAI = new GoogleGenerativeAI(apiKey);

        // Try to list models
        const models: string[] = [];
        const modelsToTest = [
            'gemini-pro',
            'gemini-1.0-pro',
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemini-2.0-flash-exp',
            'models/gemini-pro',
            'models/gemini-1.5-flash',
        ];

        const results: { model: string; status: string; error?: string }[] = [];

        for (const modelName of modelsToTest) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: 'Say "OK"' }] }],
                });
                const response = await result.response;
                results.push({
                    model: modelName,
                    status: 'working',
                });
                break; // Found a working model
            } catch (error: any) {
                results.push({
                    model: modelName,
                    status: 'failed',
                    error: error.message?.substring(0, 100),
                });
            }
        }

        const workingModel = results.find(r => r.status === 'working');

        return NextResponse.json({
            status: workingModel ? 'ok' : 'error',
            message: workingModel
                ? `API key is valid! Working model: ${workingModel.model}`
                : 'No working models found. Your API key may be invalid.',
            keyInfo,
            modelTests: results,
            suggestion: workingModel
                ? 'Your Gemini API is working correctly.'
                : 'Please get a new API key from https://aistudio.google.com/app/apikey',
        });
    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            message: 'Failed to initialize Gemini API',
            error: error.message,
            keyInfo,
            suggestion: 'Your API key format may be invalid. Get a new key from https://aistudio.google.com/app/apikey',
        });
    }
}
