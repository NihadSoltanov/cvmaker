import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@supabase/supabase-js";

// Verify caller is an admin
async function verifyAdmin(req: NextRequest) {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return null;

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return null;

    const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") return null;
    return user;
}

// GET /api/admin/messages?type=conversations
// GET /api/admin/messages?type=thread&userId=xxx
// GET /api/admin/messages?type=users  (all users)
export async function GET(req: NextRequest) {
    const admin = await verifyAdmin(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "conversations";
    const userId = searchParams.get("userId");

    if (type === "users") {
        // All users (for sidebar)
        const { data, error } = await supabaseAdmin
            .from("profiles")
            .select("id, email, full_name, created_at, role, is_paid")
            .order("created_at", { ascending: false });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ users: data });
    }

    if (type === "thread" && userId) {
        const { data, error } = await supabaseAdmin
            .from("support_messages")
            .select("*")
            .eq("user_id", userId)
            .neq("sender", "ai")          // never show AI-bot replies in admin thread
            .or("chat_mode.is.null,chat_mode.neq.ai")  // hide AI-mode messages; null = pre-migration (show)
            .order("created_at", { ascending: true });

        // If chat_mode column doesn't exist, fall back without that filter
        let resolvedData = data;
        if (error) {
            const fallback = await supabaseAdmin
                .from("support_messages")
                .select("*")
                .eq("user_id", userId)
                .neq("sender", "ai")
                .order("created_at", { ascending: true });
            if (fallback.error) return NextResponse.json({ error: fallback.error.message }, { status: 500 });
            resolvedData = fallback.data;
        }

        // Mark all as read by admin
        await supabaseAdmin
            .from("support_messages")
            .update({ read_by_admin: true })
            .eq("user_id", userId)
            .eq("sender", "user")
            .eq("read_by_admin", false);

        return NextResponse.json({ messages: resolvedData });
    }

    if (type === "conversations") {
        // Only human-mode messages appear in admin inbox.
        // Use .or() so rows with null chat_mode (pre-migration) are included.
        // If the column doesn't exist yet, fall back to an unfiltered query.
        let { data: messages, error } = await supabaseAdmin
            .from("support_messages")
            .select("user_id, message, created_at, read_by_admin, sender, chat_mode")
            .or("chat_mode.is.null,chat_mode.neq.ai")
            .order("created_at", { ascending: false });

        if (error) {
            // chat_mode column may not exist — run migration to add it.
            // Fall back: fetch without the filter so admin can still see messages.
            const fallback = await supabaseAdmin
                .from("support_messages")
                .select("user_id, message, created_at, read_by_admin, sender")
                .order("created_at", { ascending: false });
            if (fallback.error) return NextResponse.json({ error: fallback.error.message }, { status: 500 });
            messages = fallback.data as any[];
        }

        // Get all unique user ids
        const userIds = [...new Set((messages || []).map((m: any) => m.user_id))];
        const { data: profiles } = await supabaseAdmin
            .from("profiles")
            .select("id, email, full_name, is_paid, role")
            .in("id", userIds.length > 0 ? userIds : ["none"]);

        const profileMap: Record<string, any> = {};
        (profiles || []).forEach((p: any) => { profileMap[p.id] = p; });

        const byUser: Record<string, any> = {};
        (messages || []).forEach((m: any) => {
            const isRelevant = m.sender === "user" || m.sender === "admin";
            if (!byUser[m.user_id]) {
                byUser[m.user_id] = {
                    user_id: m.user_id,
                    email: profileMap[m.user_id]?.email || "",
                    full_name: profileMap[m.user_id]?.full_name || "",
                    is_paid: profileMap[m.user_id]?.is_paid ?? false,
                    role: profileMap[m.user_id]?.role || "user",
                    last_message: isRelevant ? m.message : null,
                    last_at: m.created_at,
                    unread: 0,
                };
            } else if (isRelevant && !byUser[m.user_id].last_message) {
                byUser[m.user_id].last_message = m.message;
            }
            if (!m.read_by_admin && m.sender === "user") byUser[m.user_id].unread++;
        });
        // Only include users who have at least one visible message
        Object.keys(byUser).forEach(uid => {
            if (!byUser[uid].last_message) delete byUser[uid];
        });

        const conversations = Object.values(byUser).sort((a: any, b: any) => +new Date(b.last_at) - +new Date(a.last_at));
        return NextResponse.json({ conversations });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

// POST /api/admin/messages — send admin reply
export async function POST(req: NextRequest) {
    const admin = await verifyAdmin(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { userId, message } = await req.json();
    if (!userId || !message?.trim()) return NextResponse.json({ error: "userId and message required" }, { status: 400 });

    const { error } = await supabaseAdmin.from("support_messages").insert({
        user_id: userId,
        sender: "admin",
        message: message.trim(),
        read_by_admin: true,
        read_by_user: false,
        chat_mode: "human",
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Send notification to user
    await supabaseAdmin.from("notifications").insert({
        user_id: userId,
        type: "message",
        title: "New reply from Support Team",
        body: message.trim().slice(0, 120),
        link: "/dashboard",
    });

    return NextResponse.json({ ok: true });
}

// DELETE /api/admin/messages?messageId=xxx   — delete single message
// DELETE /api/admin/messages?userId=xxx&clear=true — wipe entire conversation
export async function DELETE(req: NextRequest) {
    const admin = await verifyAdmin(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get("messageId");
    const userId = searchParams.get("userId");
    const clear = searchParams.get("clear") === "true";

    if (messageId) {
        const { error } = await supabaseAdmin.from("support_messages").delete().eq("id", messageId);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ ok: true });
    }

    if (userId && clear) {
        await supabaseAdmin.from("support_messages").delete().eq("user_id", userId);
        return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "messageId or userId+clear required" }, { status: 400 });
}
