export interface LayoutElement {
    id: string;
    type: 'text' | 'image' | 'shape' | 'logo';
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
    content?: string;
    fill?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    textAlign?: string;
    charSpacing?: number;
    opacity?: number;
    imageUrl?: string;
    // AI image generation fields
    imagePrompt?: string;
    imageStyle?: 'photorealistic' | 'logo' | 'icon' | 'illustration' | 'abstract';
    src?: string;
    borderRadius?: number;
}

export interface Layout {
    id: string;
    name: string;
    width: number;
    height: number;
    elements: LayoutElement[];
    backgroundColor?: string;
}

export interface BrandKit {
    id: string;
    userId: string;
    name: string;
    logoUrl?: string;
    colors: string[];
    fonts: {
        family: string;
        weights: number[];
    }[];
    guidelines?: string;
    createdAt: string;
}

export interface Design {
    id: string;
    userId: string;
    brandKitId?: string;
    name: string;
    canvasJson: any;
    format: DesignFormat;
    status: 'draft' | 'approved' | 'published';
    version: number;
    createdAt: string;
    updatedAt: string;
}

export type DesignFormat =
    | 'facebook-feed'
    | 'facebook-story'
    | 'instagram-post'
    | 'instagram-story'
    | 'twitter-post'
    | 'linkedin-post'
    | 'custom';

export interface FormatSpec {
    width: number;
    height: number;
    safeZone: number;
    name: string;
}

export const FORMAT_SPECS: Record<DesignFormat, FormatSpec> = {
    'facebook-feed': { width: 1200, height: 630, safeZone: 40, name: 'Facebook Feed' },
    'facebook-story': { width: 1080, height: 1920, safeZone: 250, name: 'Facebook Story' },
    'instagram-post': { width: 1080, height: 1080, safeZone: 40, name: 'Instagram Post' },
    'instagram-story': { width: 1080, height: 1920, safeZone: 250, name: 'Instagram Story' },
    'twitter-post': { width: 1200, height: 675, safeZone: 40, name: 'Twitter Post' },
    'linkedin-post': { width: 1200, height: 627, safeZone: 40, name: 'LinkedIn Post' },
    'custom': { width: 1920, height: 1080, safeZone: 60, name: 'Custom Size' },
};

export interface ComplianceRule {
    id: string;
    brandKitId?: string;
    name: string;
    description: string;
    ruleType: 'spacing' | 'color' | 'text' | 'required-element';
    configuration: any;
    severity: 'error' | 'warning';
    isActive: boolean;
}

export interface ComplianceViolation {
    ruleId: string;
    severity: 'error' | 'warning';
    issue: string;
    suggestion: string;
    elementId?: string;
}
