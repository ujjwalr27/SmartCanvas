import { supabase } from './supabase';
import { BrandKit, Design } from './types';

// ===== BRAND KITS =====

export async function getBrandKits(userId: string): Promise<BrandKit[]> {
    const { data, error } = await supabase
        .from('brand_kits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function createBrandKit(brandKit: Omit<BrandKit, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
        .from('brand_kits')
        .insert({
            user_id: brandKit.userId,
            name: brandKit.name,
            logo_url: brandKit.logoUrl,
            colors: brandKit.colors,
            fonts: brandKit.fonts,
            guidelines: brandKit.guidelines,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateBrandKit(id: string, updates: Partial<BrandKit>) {
    const { data, error } = await supabase
        .from('brand_kits')
        .update({
            name: updates.name,
            logo_url: updates.logoUrl,
            colors: updates.colors,
            fonts: updates.fonts,
            guidelines: updates.guidelines,
        })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteBrandKit(id: string) {
    const { error } = await supabase.from('brand_kits').delete().eq('id', id);
    if (error) throw error;
}

// ===== DESIGNS =====

export async function getDesigns(userId: string): Promise<Design[]> {
    const { data, error } = await supabase
        .from('designs')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

    if (error) throw error;

    // Map snake_case to camelCase
    return (data || []).map(d => ({
        id: d.id,
        userId: d.user_id,
        brandKitId: d.brand_kit_id,
        name: d.name,
        canvasJson: d.canvas_json,
        format: d.format,
        status: d.status,
        version: d.version,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
    }));
}

export async function getDesign(id: string): Promise<Design | null> {
    const { data, error } = await supabase
        .from('designs')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
    }

    if (!data) return null;

    // Map snake_case to camelCase
    return {
        id: data.id,
        userId: data.user_id,
        brandKitId: data.brand_kit_id,
        name: data.name,
        canvasJson: data.canvas_json,
        format: data.format,
        status: data.status,
        version: data.version,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    };
}

export async function createDesign(design: Omit<Design, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
        .from('designs')
        .insert({
            user_id: design.userId,
            brand_kit_id: design.brandKitId,
            name: design.name,
            canvas_json: design.canvasJson,
            format: design.format,
            status: design.status,
            version: design.version,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateDesign(id: string, updates: Partial<Design>) {
    const { data, error } = await supabase
        .from('designs')
        .update({
            name: updates.name,
            canvas_json: updates.canvasJson,
            format: updates.format,
            status: updates.status,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteDesign(id: string) {
    const { error } = await supabase.from('designs').delete().eq('id', id);
    if (error) throw error;
}

// ===== FILE UPLOAD =====

export async function uploadFile(file: File, bucket: string = 'assets'): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file);

    if (error) throw error;

    const {
        data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return publicUrl;
}

export async function deleteFile(url: string, bucket: string = 'assets') {
    const path = url.split(`/${bucket}/`)[1];
    if (!path) return;

    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
}
