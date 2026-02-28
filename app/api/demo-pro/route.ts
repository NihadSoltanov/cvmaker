import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// POST /api/demo-pro — lets any authenticated user toggle their own is_paid for demo testing
export async function POST(req: NextRequest) {
    const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { activate } = await req.json();

    const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ is_paid: activate === true })
        .eq("id", user.id);

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

    return NextResponse.json({ ok: true, is_paid: activate === true });
}
