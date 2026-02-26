import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function verifyAdmin(req: NextRequest) {
    const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
    if (!token) return null;
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return null;
    const { data: p } = await supabaseAdmin.from("profiles").select("role").eq("id", user.id).single();
    return p?.role === "admin" ? user : null;
}

// GET /api/admin/analytics — analytics data for admin stats page
export async function GET(req: NextRequest) {
    const admin = await verifyAdmin(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const since30d = new Date(Date.now() - 30 * 86400000).toISOString();

    const [
        { data: byLang },
        { data: byTone },
        { data: topAts },
        { data: weekOptimizations },
        { data: weekSignups },
        { count: totalMessages },
        { count: totalUsers },
        { count: proUsers },
    ] = await Promise.all([
        supabaseAdmin.from("tailored_outputs").select("output_language"),
        supabaseAdmin.from("tailored_outputs").select("tone"),
        supabaseAdmin
            .from("tailored_outputs")
            .select("ats_score, profiles(full_name,email)")
            .not("ats_score", "is", null)
            .order("ats_score", { ascending: false })
            .limit(10),
        supabaseAdmin
            .from("tailored_outputs")
            .select("created_at")
            .gte("created_at", since30d),
        supabaseAdmin
            .from("profiles")
            .select("created_at")
            .gte("created_at", since30d),
        supabaseAdmin.from("support_messages").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }).eq("is_paid", true),
    ]);

    // Aggregate by language
    const langMap: Record<string, number> = {};
    byLang?.forEach((r: any) => { langMap[r.output_language] = (langMap[r.output_language] || 0) + 1; });

    // Aggregate by tone
    const toneMap: Record<string, number> = {};
    byTone?.forEach((r: any) => { toneMap[r.tone] = (toneMap[r.tone] || 0) + 1; });

    // 30-day daily chart
    const daily30: Record<string, { opts: number; signups: number }> = {};
    for (let i = 29; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
        daily30[d] = { opts: 0, signups: 0 };
    }
    weekOptimizations?.forEach((r: any) => {
        const d = r.created_at.slice(0, 10);
        if (daily30[d]) daily30[d].opts++;
    });
    weekSignups?.forEach((r: any) => {
        const d = r.created_at.slice(0, 10);
        if (daily30[d]) daily30[d].signups++;
    });

    return NextResponse.json({
        langMap,
        toneMap,
        topAts,
        daily30: Object.entries(daily30).map(([date, v]) => ({ date, ...v })),
        totalMessages: totalMessages || 0,
        totalUsers: totalUsers || 0,
        proUsers: proUsers || 0,
    });
}
