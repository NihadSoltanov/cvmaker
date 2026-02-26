import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function verifyAdmin(req: NextRequest) {
    const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
    if (!token) return null;
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    if (!user) return null;
    const { data: p } = await supabaseAdmin.from("profiles").select("role").eq("id", user.id).single();
    return p?.role === "admin" ? user : null;
}

export async function GET(req: NextRequest) {
    const admin = await verifyAdmin(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const today = new Date().toISOString().slice(0, 10);

    const [
        { count: totalUsers },
        { count: proUsers },
        { count: totalResumes },
        { count: totalOptimizations },
        { count: todaySignups },
        { count: todayOptimizations },
        { count: openTickets },
        { data: recentUsers },
        { data: recentMsgsRaw },
        { data: weekData },
    ] = await Promise.all([
        supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }).eq("is_paid", true),
        supabaseAdmin.from("resumes").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("tailored_outputs").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", today),
        supabaseAdmin.from("tailored_outputs").select("*", { count: "exact", head: true }).gte("created_at", today),
        supabaseAdmin.from("support_messages").select("*", { count: "exact", head: true }).eq("read_by_admin", false).eq("sender", "user"),
        supabaseAdmin.from("profiles").select("id,email,full_name,role,is_paid,created_at").order("created_at", { ascending: false }).limit(5),
        supabaseAdmin.from("support_messages").select("id,user_id,message,sender,created_at,read_by_admin").order("created_at", { ascending: false }).limit(5),
        supabaseAdmin.from("tailored_outputs").select("created_at").gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString()),
    ]);

    // Enrich messages with profile info
    const msgUserIds = [...new Set((recentMsgsRaw || []).map((m: any) => m.user_id))];
    const { data: msgProfiles } = msgUserIds.length > 0
        ? await supabaseAdmin.from("profiles").select("id,email,full_name").in("id", msgUserIds)
        : { data: [] };
    const profileMap: Record<string, any> = {};
    (msgProfiles || []).forEach((p: any) => { profileMap[p.id] = p; });
    const recentMessages = (recentMsgsRaw || []).map((m: any) => ({
        ...m,
        profiles: profileMap[m.user_id] || null,
    }));

    // 7-day chart
    const byDay: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
        byDay[d] = 0;
    }
    (weekData || []).forEach((r: any) => {
        const d = r.created_at.slice(0, 10);
        if (byDay[d] !== undefined) byDay[d]++;
    });

    return NextResponse.json({
        totalUsers: totalUsers || 0,
        proUsers: proUsers || 0,
        freeUsers: (totalUsers || 0) - (proUsers || 0),
        totalResumes: totalResumes || 0,
        totalOptimizations: totalOptimizations || 0,
        todaySignups: todaySignups || 0,
        todayOptimizations: todayOptimizations || 0,
        openTickets: openTickets || 0,
        recentUsers: recentUsers || [],
        recentMessages,
        optimizationsByDay: Object.entries(byDay).map(([date, count]) => ({ date, count })),
    });
}
