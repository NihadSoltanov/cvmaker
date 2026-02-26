import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function getUser(req: NextRequest) {
    const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
    if (!token) return null;
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    return error ? null : user;
}

// GET /api/support/notifications  — fetch notifications via service role
export async function GET(req: NextRequest) {
    const user = await getUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabaseAdmin
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ notifications: data || [] });
}

// PATCH /api/support/notifications  — mark all read
export async function PATCH(req: NextRequest) {
    const user = await getUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await supabaseAdmin.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    return NextResponse.json({ ok: true });
}
