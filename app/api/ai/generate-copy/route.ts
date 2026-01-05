import { NextRequest, NextResponse } from 'next/server';
import { geminiFlash } from '@/lib/gemini';

interface GenerateCopyRequest {
    productName: string;
    offer?: string;
    targetAudience?: string;
    tone?: 'professional' | 'playful' | 'urgent' | 'casual';
    copyType?: 'headline' | 'cta' | 'body';
}

export async function POST(request: NextRequest) {
    try {
        const body: GenerateCopyRequest = await request.json();
        const { productName, offer, targetAudience, tone = 'professional', copyType = 'headline' } = body;

        let prompt = '';

        if (copyType === 'headline') {
            prompt = `Generate 5 compelling ad headlines for this product:
Product: ${productName}
${offer ? `Offer: ${offer}` : ''}
${targetAudience ? `Target audience: ${targetAudience}` : ''}
Tone: ${tone}

Requirements:
- Maximum 10 words each
- Attention-grabbing and benefit-focused
- Varied approaches
- No hashtags

Return as JSON array of strings: ["headline1", "headline2", ...]`;
        } else if (copyType === 'cta') {
            prompt = `Generate 5 call-to-action button texts:
Product: ${productName}
${offer ? `Offer: ${offer}` : ''}
Tone: ${tone}

Requirements:
- Maximum 4 words each
- Action-oriented
- Urgent and compelling
- No punctuation

Return as JSON array of strings: ["cta1", "cta2", ...]`;
        } else if (copyType === 'body') {
            prompt = `Generate 3 short ad body copy variations:
Product: ${productName}  
${offer ? `Offer: ${offer}` : ''}
${targetAudience ? `Target audience: ${targetAudience}` : ''}
Tone: ${tone}

Requirements:
- 2-3 sentences each
- Focus on benefits
- Include a sense of urgency

Return as JSON array of strings.`;
        }

        // Check if Gemini is available
        if (!geminiFlash) {
            // Return demo suggestions when AI is not configured
            const demoSuggestions = copyType === 'headline'
                ? [`Discover ${productName} Today`, `Transform Your Life with ${productName}`, `Unlock ${offer || 'Amazing Savings'}`, `The Smart Choice: ${productName}`, `Experience ${productName} Now`]
                : copyType === 'cta'
                    ? ['Shop Now', 'Get Started', 'Learn More', 'Try Free', 'Buy Now']
                    : [`Experience the power of ${productName}. ${offer || 'Limited time offer available.'}`, `${productName} is designed for your success. Start your journey today.`, `Join thousands who trust ${productName}. See the difference now.`];

            return NextResponse.json({ suggestions: demoSuggestions });
        }

        const result = await geminiFlash.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.9,
                responseMimeType: 'application/json',
            },
        });

        const response = await result.response;
        const text = response.text();
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        const suggestions = JSON.parse(cleanText);

        return NextResponse.json({ suggestions: Array.isArray(suggestions) ? suggestions : [] });
    } catch (error: any) {
        console.error('Error generating copy:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate copy' },
            { status: 500 }
        );
    }
}
