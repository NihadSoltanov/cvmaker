import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET /api/support/messages
// Returns the authenticated user's full message thread (bypasses RLS)
export async function GET(req: NextRequest) {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error: fetchError } = await supabaseAdmin
        .from("support_messages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

    if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });

    // Mark admin/ai messages as read_by_user
    await supabaseAdmin
        .from("support_messages")
        .update({ read_by_user: true })
        .eq("user_id", user.id)
        .neq("sender", "user")
        .eq("read_by_user", false);

    const messages = data || [];
    const hasHumanAgent = messages.some((m: any) => m.sender === "admin");

    return NextResponse.json({ messages, hasHumanAgent });
}

// DELETE /api/support/messages?messageId=xxx  — delete own message
// DELETE /api/support/messages?clear=true      — clear entire chat
export async function DELETE(req: NextRequest) {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get("messageId");
    const clear = searchParams.get("clear") === "true";

    if (messageId) {
        // Only allow deleting own messages
        await supabaseAdmin.from("support_messages").delete()
            .eq("id", messageId).eq("user_id", user.id).eq("sender", "user");
        return NextResponse.json({ ok: true });
    }

    if (clear) {
        await supabaseAdmin.from("support_messages").delete().eq("user_id", user.id);
        return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "messageId or clear required" }, { status: 400 });
}
