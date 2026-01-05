import { NextRequest, NextResponse } from 'next/server';
import { generateContentWithFallback } from '@/lib/gemini';
import { Layout, LayoutElement } from '@/lib/types';

interface GenerateLayoutRequest {
    prompt: string;
    productName?: string;
    offer?: string;
    targetAudience?: string;
    format?: {
        width: number;
        height: number;
    };
    brandColors?: string[];
    style?: 'minimal' | 'premium' | 'bold' | 'elegant';
    includeBackground?: boolean;
}

// Demo layout generator for fallback
function createDemoLayout(
    width: number,
    height: number,
    productName?: string,
    offer?: string
): Layout {
    return {
        id: `layout-${Date.now()}`,
        name: `Luxury Layout - ${productName || 'Product'}`,
        width,
        height,
        backgroundColor: '#0a0a1a',
        elements: [
            {
                id: 'bg-gradient',
                type: 'shape',
                x: 0,
                y: 0,
                width: width,
                height: height,
                fill: '#0f172a', // Dark slate background
            },
            {
                id: 'brand-logo',
                type: 'image',
                x: width / 2 - 50,
                y: 40,
                width: 100,
                height: 100,
                imagePrompt: `Luxury gold logo for ${productName || 'Brand'}`,
                imageStyle: 'logo',
            },
            {
                id: 'tagline',
                type: 'text',
                x: width / 2 - 250,
                y: 160,
                width: 500,
                height: 50,
                content: 'TIMELESS ELEGANCE',
                fill: '#D4AF37', // Gold
                fontSize: 36,
                fontFamily: 'Playfair Display',
                fontWeight: 'normal',
                charSpacing: 200, // Stylish wide spacing
                textAlign: 'center',
            },
            {
                id: 'product-image',
                type: 'image',
                x: width / 2 - 200,
                y: height / 2 - 150,
                width: 400,
                height: 400,
                imagePrompt: `${productName || 'Luxury Watch'} cinematic product shot, dramatic lighting`,
                imageStyle: 'photorealistic',
            },
            {
                id: 'features-list',
                type: 'text',
                x: 60,
                y: height / 2 - 50,
                width: 250,
                height: 200,
                content: 'PERPETUAL ROTOR\nCHRONOMETER\nSAPPHIRE CRYSTAL',
                fill: '#e2e8f0',
                fontSize: 16,
                fontFamily: 'Cinzel',
                charSpacing: 50,
                textAlign: 'left',
            },
            {
                id: 'cta-btn',
                type: 'shape',
                x: width / 2 - 100,
                y: height - 160,
                width: 200,
                height: 50,
                fill: '#D4AF37',
                borderRadius: 4,
            },
            {
                id: 'cta-text',
                type: 'text',
                x: width / 2 - 90,
                y: height - 148,
                width: 180,
                height: 30,
                content: 'DISCOVER MORE',
                fill: '#000000',
                fontSize: 16,
                fontFamily: 'Cinzel',
                fontWeight: 'bold',
                charSpacing: 100,
                textAlign: 'center',
            },
            // Fallback Contact Info
            {
                id: 'contact-info',
                type: 'text',
                x: width / 2 - 300,
                y: height - 100,
                width: 600,
                height: 80,
                content: 'GURGAON: G-69, AMBIENCE MALL\nNEW DELHI: D-10, SOUTH EXTENSION - II\n+91 9910555111 | contact@luxurybrand.com | www.luxurybrand.com',
                fill: '#94a3b8',
                fontSize: 14,
                fontFamily: 'Cinzel',
                charSpacing: 50,
                textAlign: 'center',
            },
        ],
    };
}

export async function POST(request: NextRequest) {
    let body: GenerateLayoutRequest;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const {
        prompt,
        productName,
        offer,
        targetAudience,
        format,
        brandColors,
        style = 'premium',
        includeBackground = true,
    } = body;

    const width = format?.width || 1200;
    const height = format?.height || 630;

    try {
        // Comprehensive prompt for creating premium, creative ad layouts
        const fullPrompt = `You are a world-class advertising creative director. Create a PREMIUM, visually stunning advertisement layout.

CANVAS: ${width}x${height} pixels
SAFE ZONES: Keep critical elements 40px from edges

CAMPAIGN BRIEF:
- Campaign: ${prompt}
${productName ? `- Product/Brand: ${productName}` : ''}
${offer ? `- Offer: ${offer}` : ''}
${targetAudience ? `- Target Audience: ${targetAudience}` : ''}
${brandColors?.length ? `- Brand Colors: ${brandColors.join(', ')}` : ''}
- Design Style: ${style.toUpperCase()} - Make it look like a high-end luxury ad (e.g. Rolex style)

REQUIRED ELEMENTS (create ALL of these):

1. **BACKGROUND** (type: "image")
   - Create an atmospheric, premium background (gradient, studio lighting, or luxury texture)
   - imagePrompt: abstract luxury background, soft lighting, premium texture, professional studio
   - imageStyle: "abstract" or "illustration"
   - Full canvas size, position at x:0, y:0
   - Layer: BOTTOM (render first)

2. **BRAND LOGO** (type: "image")
   - Professional brand logo
   - imagePrompt: "Luxury minimalist logo for ${productName || 'Brand'}, vector style, white or gold"
   - imageStyle: "logo"
   - Size: 80-120px
   - Position: Top Center (highly recommended) or Top Left
   - Layer: TOP

3. **HERO PRODUCT IMAGE** (type: "image")  
   - The star of the ad - make it dramatic!
   - imagePrompt: detailed product photography, dramatic lighting, 8k resolution, photorealistic
   - imageStyle: "photorealistic"
   - Size: 350-500px, centered or slightly offset
   - Layer: MIDDLE

4. **HEADLINE/TAGLINE** (type: "text")
   - Powerful, memorable tagline
   - Bold, elegant font (32-48px)
   - Position: Below Logo or Above Product
   - Color: Gold (#D4AF37) or White (#FFFFFF) or High Contrast

5. **PRODUCT FEATURES** (type: "text")
   - 3-4 bullet points or short features about the product
   - Font size: 16-20px
   - Position: Left or Right side, aligned vertically
   - Color: readable on background

6. **CONTACT INFO SECTION** (type: "text")
   - MUST INCLUDE: Store Address, Email, Phone Number, Website
   - Format: Multi-line or pipe separated
   - Example: "New Delhi: D-10 South Ext | +91 9999999999\ncontact@brand.com | www.brand.com"
   - Font size: 12-14px, clean sans-serif (Inter) or serif (Cinzel)
   - Position: VERY BOTTOM CENTER
   - Color: soft white or light gray

7. **CTA BUTTON** (type: "shape" + "text")
   - "SHOP NOW" or "DISCOVER MORE"
   - Position: Above Contact Info
   - Elegant button shape

OUTPUT FORMAT (JSON only):
{
  "name": "Luxury Ad Layout",
  "backgroundColor": "#hexcolor",
  "elements": [
    {
      "id": "unique-id",
      "type": "text|image|shape",
      "x": number (0 to ${width}),
      "y": number (0 to ${height}),
      "width": number,
      "height": number,
      "content": "text content (for text)",
      "fill": "#hexcolor",
      "fontSize": number (for text, 14-60),
      "fontFamily": "Inter|Playfair Display|Cinzel",
      "fontWeight": "normal|bold",
      "textAlign": "left|center|right",
      "charSpacing": number (0-500, use 100-200 for luxury headers),
      "imagePrompt": "AI image generation prompt (for images)",
      "imageStyle": "photorealistic|logo|abstract|illustration",
      "borderRadius": number (for shapes),
      "opacity": 0-1
    }
  ]
}

CRITICAL DESIGN PRINCIPLES:
- **VISUAL HIERARCHY**: Logo (Top) -> Tagline -> Product -> Features -> CTA -> Contact (Bottom)
- **TYPOGRAPHY**: Use 'Playfair Display' or 'Cinzel' for Headings/Taglines. Use 'Inter' for body text.
- **LETTER SPACING**: Use wide spacing (100-200) for all caps luxury text.
- **TEXT COLORS MUST BE WHITE (#ffffff) or GOLD (#D4AF37) on dark backgrounds**
- Use CONTRAST for text readability
- Make it look PREMIUM, CLEAN, and SOPHISTICATED
- Background should be subtle
- Return ONLY valid JSON, no markdown`;

        // Generate layout with Gemini
        const text = await generateContentWithFallback(fullPrompt);
        let layoutData;

        try {
            // Clean and parse response
            let cleanText = text.trim();
            cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

            // Find JSON object in response
            const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                cleanText = jsonMatch[0];
            }

            layoutData = JSON.parse(cleanText);
        } catch (parseError) {
            console.error('Failed to parse Gemini response:', text.substring(0, 500));
            throw new Error('Invalid layout data from AI');
        }

        // Process elements and add IDs, ensure proper ordering
        const elementsWithIds = layoutData.elements.map((el: any, idx: number) => ({
            id: el.id || `element-${Date.now()}-${idx}`,
            ...el,
        }));

        // Sort elements: images first (background), then shapes, then text (for proper layering)
        const sortedElements = [...elementsWithIds].sort((a, b) => {
            const typeOrder: Record<string, number> = {
                'image': a.id?.includes('background') || a.id?.includes('bg') ? 0 : 1,
                'shape': 2,
                'text': 3
            };
            return (typeOrder[a.type] || 2) - (typeOrder[b.type] || 2);
        });

        const layout: Layout = {
            id: `layout-${Date.now()}`,
            name: layoutData.name || 'AI Generated Premium Ad',
            width,
            height,
            backgroundColor: layoutData.backgroundColor || '#0a0a1a',
            elements: sortedElements,
        };

        // Log summary
        const imageElements = sortedElements.filter((el: any) => el.type === 'image');
        const textElements = sortedElements.filter((el: any) => el.type === 'text');
        console.log(`Generated premium layout: ${sortedElements.length} elements (${imageElements.length} images, ${textElements.length} text)`);

        return NextResponse.json({
            layout,
            hasImages: imageElements.length > 0,
            imagePrompts: imageElements.map((el: any) => ({
                id: el.id,
                prompt: el.imagePrompt,
                style: el.imageStyle,
            })),
        });
    } catch (error: any) {
        console.error('Error generating layout:', error);

        // Return enhanced demo layout
        console.log('Returning demo layout as fallback');
        const demoLayout = createDemoLayout(width, height, productName, offer);

        return NextResponse.json({
            layout: demoLayout,
            isDemo: true,
            message: 'Using demo layout. You can still edit and export!'
        });
    }
}
