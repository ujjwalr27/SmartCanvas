import { NextRequest, NextResponse } from 'next/server';

interface GenerateImageRequest {
    prompt: string;
    style?: 'photorealistic' | 'illustration' | 'logo' | 'icon' | 'abstract';
    width?: number;
    height?: number;
}

// Hugging Face Stable Diffusion for image generation
async function generateWithHuggingFace(prompt: string): Promise<string | null> {
    const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;

    if (!HF_TOKEN) {
        console.log('No Hugging Face token configured');
        return null;
    }

    try {
        console.log('Generating image with Hugging Face...');

        const response = await fetch(
            'https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${HF_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        negative_prompt: 'low quality, blurry, distorted, watermark, text overlay',
                        num_inference_steps: 20,
                        guidance_scale: 7.5,
                    },
                }),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.log('HF API error:', error);
            return null;
        }

        const blob = await response.blob();
        const buffer = await blob.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const dataUrl = `data:image/png;base64,${base64}`;

        console.log('Image generated successfully with Hugging Face');
        return dataUrl;
    } catch (error: any) {
        console.error('Hugging Face generation failed:', error.message);
        return null;
    }
}

// Create styled placeholder image
function createPlaceholder(
    prompt: string,
    style: string,
    width: number = 400,
    height: number = 400
): string {
    // Color schemes based on style
    const colorSchemes: Record<string, { bg: string; accent: string; text: string }> = {
        logo: { bg: '#1a1a2e', accent: '#9333ea', text: '#ffffff' },
        icon: { bg: '#0f172a', accent: '#3b82f6', text: '#ffffff' },
        photorealistic: { bg: '#f97316', accent: '#ffffff', text: '#1a1a1a' },
        illustration: { bg: '#22c55e', accent: '#ffffff', text: '#1a1a1a' },
        abstract: { bg: '#ec4899', accent: '#9333ea', text: '#ffffff' },
    };

    const colors = colorSchemes[style] || colorSchemes.photorealistic;
    const shortPrompt = prompt.length > 30 ? prompt.substring(0, 30) + '...' : prompt;

    // SVG with gradient background and icon
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <defs>
            <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:${colors.bg};stop-opacity:1" />
                <stop offset="100%" style="stop-color:${colors.accent};stop-opacity:1" />
            </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#bg-gradient)"/>
        <g transform="translate(${width / 2}, ${height / 2 - 30})">
            <circle cx="0" cy="0" r="50" fill="${colors.accent}" opacity="0.3"/>
            <rect x="-25" y="-25" width="50" height="50" rx="8" fill="${colors.text}" opacity="0.9"/>
            <path d="M-10,-10 L10,-10 L10,10 L-10,10 Z" fill="${colors.accent}"/>
        </g>
        <text x="${width / 2}" y="${height / 2 + 50}" 
              font-family="Arial, sans-serif" 
              font-size="14" 
              fill="${colors.text}" 
              text-anchor="middle" 
              opacity="0.8">
            ${style.toUpperCase()}
        </text>
        <text x="${width / 2}" y="${height / 2 + 75}" 
              font-family="Arial, sans-serif" 
              font-size="12" 
              fill="${colors.text}" 
              text-anchor="middle" 
              opacity="0.6">
            ${shortPrompt}
        </text>
    </svg>`;

    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

export async function POST(request: NextRequest) {
    try {
        const body: GenerateImageRequest = await request.json();
        const {
            prompt,
            style = 'photorealistic',
            width = 400,
            height = 400,
        } = body;

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        // Enhanced prompt based on style
        let enhancedPrompt = prompt;
        switch (style) {
            case 'logo':
                enhancedPrompt = `Modern minimalist logo design: ${prompt}. Clean vector style, simple geometric shapes, professional brand identity, single color on white background`;
                break;
            case 'icon':
                enhancedPrompt = `App icon style: ${prompt}. Flat design, vibrant colors, simple and recognizable, square format with rounded corners`;
                break;
            case 'illustration':
                enhancedPrompt = `Digital illustration: ${prompt}. Modern flat style, vibrant colors, suitable for marketing materials`;
                break;
            case 'abstract':
                enhancedPrompt = `Abstract artistic: ${prompt}. Gradient colors, geometric shapes, modern design`;
                break;
            default:
                enhancedPrompt = `Professional product photography: ${prompt}. Studio lighting, clean white background, high quality commercial photo`;
        }

        console.log(`Generating ${style} image:`, enhancedPrompt.substring(0, 50) + '...');

        // Try Hugging Face first
        const hfImage = await generateWithHuggingFace(enhancedPrompt);

        if (hfImage) {
            return NextResponse.json({
                imageUrl: hfImage,
                isPlaceholder: false,
                source: 'huggingface',
            });
        }

        // Fallback to styled placeholder
        console.log('Using styled placeholder');
        const placeholder = createPlaceholder(prompt, style, width, height);

        return NextResponse.json({
            imageUrl: placeholder,
            isPlaceholder: true,
            message: 'Using styled placeholder. Add HUGGINGFACE_API_TOKEN for real images.',
        });
    } catch (error: any) {
        console.error('Error generating image:', error);

        // Return a simple colored placeholder on error
        const errorPlaceholder = createPlaceholder('Error', 'abstract', 400, 400);

        return NextResponse.json({
            imageUrl: errorPlaceholder,
            isPlaceholder: true,
            error: error.message,
        });
    }
}
