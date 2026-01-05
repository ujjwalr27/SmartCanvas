export async function generateImageWithHF(prompt: string): Promise<string> {
    const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
    if (!HF_TOKEN) {
        throw new Error('Hugging Face API token not configured');
    }

    const response = await fetch(
        'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1',
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    negative_prompt: 'text, watermark, low quality, blurry',
                    num_inference_steps: 25,
                    guidance_scale: 7.5,
                },
            }),
        }
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`HF API error: ${error}`);
    }

    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;

    return dataUrl;
}

export function canvasToBlob(canvas: HTMLCanvasElement, quality: number = 1): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Failed to convert canvas to blob'));
                }
            },
            'image/png',
            quality
        );
    });
}

export function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

export async function canvasToPNG(
    canvas: any,
    options: {
        quality?: number;
        multiplier?: number;
        filename?: string;
    } = {}
): Promise<void> {
    const { quality = 1, multiplier = 2, filename = `design-${Date.now()}.png` } = options;

    const dataURL = canvas.toDataURL({
        format: 'png',
        quality,
        multiplier,
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataURL;
    link.click();
}

export async function canvasToJPEG(
    canvas: any,
    options: {
        quality?: number;
        multiplier?: number;
        filename?: string;
    } = {}
): Promise<void> {
    const { quality = 0.9, multiplier = 2, filename = `design-${Date.now()}.jpg` } = options;

    const dataURL = canvas.toDataURL({
        format: 'jpeg',
        quality,
        multiplier,
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataURL;
    link.click();
}

export async function canvasToSVG(canvas: any, filename: string = `design-${Date.now()}.svg`) {
    const svg = canvas.toSVG();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    downloadBlob(blob, filename);
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null;
}

export function getContrastRatio(hex1: string, hex2: string): number {
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);

    if (!rgb1 || !rgb2) return 0;

    const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
}

function getRelativeLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map((c) => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function isTextReadable(textColor: string, backgroundColor: string): boolean {
    const ratio = getContrastRatio(textColor, backgroundColor);
    return ratio >= 4.5; // WCAG AA standard
}
