import { NextRequest, NextResponse } from 'next/server';
import { geminiFlash } from '@/lib/gemini';
import { Layout, DesignFormat, FORMAT_SPECS } from '@/lib/types';

interface AdaptLayoutRequest {
    layout: Layout;
    targetFormat: DesignFormat;
}

export async function POST(request: NextRequest) {
    try {
        const body: AdaptLayoutRequest = await request.json();
        const { layout, targetFormat } = body;

        const targetSpec = FORMAT_SPECS[targetFormat];
        const scaleX = targetSpec.width / layout.width;
        const scaleY = targetSpec.height / layout.height;

        // Use Gemini for intelligent adaptation
        const prompt = `Adapt this ad layout to a new format intelligently.

Original layout (${layout.width}x${layout.height}):
${JSON.stringify(layout, null, 2)}

Target format: ${targetSpec.name} (${targetSpec.width}x${targetSpec.height})
Safe zone: ${targetSpec.safeZone}px from edges

Requirements:
1. Scale and reposition elements to fit new dimensions
2. Preserve visual hierarchy
3. Ensure all elements are within safe zones
4. Adjust font sizes proportionally
5. Maintain element relationships

Return adapted layout as JSON with same schema as input.`;

        const result = await geminiFlash.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.4,
                responseMimeType: 'application/json',
            },
        });

        const response = await result.response;
        const text = response.text();
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        const adaptedLayout = JSON.parse(cleanText);

        // Update dimensions
        adaptedLayout.width = targetSpec.width;
        adaptedLayout.height = targetSpec.height;
        adaptedLayout.id = `layout-${Date.now()}`;
        adaptedLayout.name = `${layout.name} - ${targetSpec.name}`;

        return NextResponse.json({ layout: adaptedLayout });
    } catch (error: any) {
        console.error('Error adapting layout:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to adapt layout' },
            { status: 500 }
        );
    }
}
