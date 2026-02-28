"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Shield, Send, Megaphone, Trash2, AlertTriangle } from "lucide-react";

export default function AdminSettingsPage() {
    const [broadcastMsg, setBroadcastMsg] = useState("");
    const [broadcastType, setBroadcastType] = useState<"info" | "success" | "warning">("info");
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const sendBroadcast = async () => {
        if (!broadcastMsg.trim()) return;
        setSending(true);

        // Get all user IDs
        const { data: users } = await supabase.from("profiles").select("id").eq("role", "user");

        if (users && users.length > 0) {
            const notifications = users.map(u => ({
                user_id: u.id,
                type: broadcastType,
                title: "Announcement from Nexora",
                body: broadcastMsg.trim(),
                link: "/dashboard",
            }));
            await supabase.from("notifications").insert(notifications);
        }

        setBroadcastMsg("");
        setSent(true);
        setSending(false);
        setTimeout(() => setSent(false), 3000);
    };

    const purgeOldNotifications = async () => {
        if (!confirm("Delete all notifications older than 30 days?")) return;
        const cutoff = new Date(Date.now() - 30 * 86400000).toISOString();
        await supabase.from("notifications").delete().lt("created_at", cutoff);
        alert("Done.");
    };

    const purgeOldMessages = async () => {
        if (!confirm("Delete all support messages older than 90 days?")) return;
        const cutoff = new Date(Date.now() - 90 * 86400000).toISOString();
        await supabase.from("support_messages").delete().lt("created_at", cutoff);
        alert("Done.");
    };

    return (
        <div className="p-8 space-y-8 max-w-2xl">
            <div>
                <h1 className="text-3xl font-black text-white">Admin Settings</h1>
                <p className="text-gray-400 mt-1">Platform management tools</p>
            </div>

            {/* Broadcast notification */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <Megaphone className="w-5 h-5 text-orange-400" />
                    <h2 className="text-base font-bold text-white">Broadcast Notification</h2>
                </div>
                <p className="text-sm text-gray-500">Send a notification to all users simultaneously.</p>

                <div className="flex bg-gray-800 rounded-xl p-1 gap-1">
                    {(["info", "success", "warning"] as const).map(t => (
                        <button key={t} onClick={() => setBroadcastType(t)}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition ${broadcastType === t ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-gray-200"}`}>
                            {t}
                        </button>
                    ))}
                </div>

                <textarea
                    value={broadcastMsg}
                    onChange={e => setBroadcastMsg(e.target.value)}
                    placeholder="Type your announcement here…"
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 resize-none transition"
                />

                <button
                    onClick={sendBroadcast}
                    disabled={!broadcastMsg.trim() || sending}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none rounded-xl text-sm font-bold text-white transition">
                    <Send className="w-4 h-4" />
                    {sending ? "Sending…" : sent ? "✓ Sent!" : "Send to All Users"}
                </button>
            </div>

            {/* Make self admin instructions */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-3">
                <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-base font-bold text-white">Grant Admin Access</h2>
                </div>
                <p className="text-sm text-gray-500">To make another user an admin, run this in Supabase SQL editor:</p>
                <pre className="bg-gray-950 border border-gray-800 rounded-xl p-4 text-xs text-indigo-300 font-mono overflow-x-auto">
                    {`UPDATE profiles\nSET role = 'admin'\nWHERE email = 'user@example.com';`}
                </pre>
                <p className="text-xs text-gray-600">Or use the Users page — click the shield icon next to any user.</p>
            </div>

            {/* Danger Zone */}
            <div className="bg-gray-900 border border-red-900/40 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <h2 className="text-base font-bold text-red-400">Danger Zone</h2>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-950 rounded-xl">
                        <div>
                            <p className="text-sm font-semibold text-gray-300">Purge old notifications</p>
                            <p className="text-xs text-gray-600">Delete all notifications older than 30 days</p>
                        </div>
                        <button onClick={purgeOldNotifications}
                            className="flex items-center gap-2 px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg text-sm font-bold transition">
                            <Trash2 className="w-4 h-4" /> Purge
                        </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-950 rounded-xl">
                        <div>
                            <p className="text-sm font-semibold text-gray-300">Purge old support messages</p>
                            <p className="text-xs text-gray-600">Delete support messages older than 90 days</p>
                        </div>
                        <button onClick={purgeOldMessages}
                            className="flex items-center gap-2 px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg text-sm font-bold transition">
                            <Trash2 className="w-4 h-4" /> Purge
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
