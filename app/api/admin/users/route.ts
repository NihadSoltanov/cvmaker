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

// GET /api/admin/users — all profiles with enriched counts
export async function GET(req: NextRequest) {
    const admin = await verifyAdmin(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profiles, error } = await supabaseAdmin
        .from("profiles")
        .select("id, email, full_name, role, is_paid, created_at")
        .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Enrich with counts
    const enriched = await Promise.all((profiles || []).map(async (p: any) => {
        const [{ count: rc }, { count: oc }] = await Promise.all([
            supabaseAdmin.from("resumes").select("*", { count: "exact", head: true }).eq("user_id", p.id),
            supabaseAdmin.from("tailored_outputs").select("*", { count: "exact", head: true }).eq("user_id", p.id),
        ]);
        return { ...p, resume_count: rc || 0, optimization_count: oc || 0 };
    }));

    return NextResponse.json({ users: enriched });
}

// PATCH /api/admin/users?userId=xxx — update role or is_paid
export async function PATCH(req: NextRequest) {
    const admin = await verifyAdmin(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { userId, role, is_paid } = await req.json();
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const update: Record<string, any> = {};
    if (role !== undefined) update.role = role;
    if (is_paid !== undefined) update.is_paid = is_paid;

    const { error } = await supabaseAdmin.from("profiles").update(update).eq("id", userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}

// DELETE /api/admin/users?userId=xxx
export async function DELETE(req: NextRequest) {
    const admin = await verifyAdmin(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    await supabaseAdmin.from("profiles").delete().eq("id", userId);
    return NextResponse.json({ ok: true });
}
