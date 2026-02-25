"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export async function createProfile(userId: string, email: string, fullName: string) {
    if (!userId || !email) return { success: false, error: "Missing required fields" };

    // Using supabaseAdmin to bypass row level security since user doesn't have an insert policy
    const { error } = await supabaseAdmin.from("profiles").insert([{
        id: userId,
        email: email,
        full_name: fullName
    }]);

    if (error) {
        console.error("Failed to create profile:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
