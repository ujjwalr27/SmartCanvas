import { supabase } from './supabase';

export interface AuthUser {
    id: string;
    email: string;
    created_at: string;
}

export async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) throw error;
    return data;
}

export async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
    return data;
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    return {
        id: user.id,
        email: user.email!,
        created_at: user.created_at,
    };
}

export async function getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}
