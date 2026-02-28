"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    Bell, UserPlus, MessageSquare, Crown, Zap,
    CheckCheck, RefreshCw, Inbox,
} from "lucide-react";

type NotifType = "new_user" | "new_message" | "pro_upgrade" | "new_optimization";

interface Notif {
    id: string;
    type: NotifType;
    title: string;
    desc: string;
    time: string;
    avatar?: string;
    read: boolean;
}

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
}

const TYPE_META: Record<NotifType, { icon: React.ElementType; color: string; bg: string }> = {
    new_user:        { icon: UserPlus,      color: "text-blue-400",   bg: "bg-blue-500/10" },
    new_message:     { icon: MessageSquare, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    pro_upgrade:     { icon: Crown,         color: "text-yellow-400", bg: "bg-yellow-500/10" },
    new_optimization:{ icon: Zap,           color: "text-purple-400", bg: "bg-purple-500/10" },
};

const TABS = [
    { key: "all",          label: "All" },
    { key: "new_message",  label: "Support" },
    { key: "new_user",     label: "New Users" },
    { key: "pro_upgrade",  label: "Pro Upgrades" },
    { key: "new_optimization", label: "Optimizations" },
] as const;

export default function AdminNotificationsPage() {
    const [notifs, setNotifs] = useState<Notif[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"all" | NotifType>("all");
    const [readSet, setReadSet] = useState<Set<string>>(new Set());

    const fetchAll = async () => {
        setLoading(true);
        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            if (!token) return;

            // Fetch in parallel
            const [msgRes, usersRes, proRes, optRes] = await Promise.all([
                supabase
                    .from("support_messages")
                    .select("id, content, created_at, user_id")
                    .neq("sender", "admin")
                    .neq("sender", "ai")
                    .order("created_at", { ascending: false })
                    .limit(30),
                supabase
                    .from("profiles")
                    .select("id, full_name, email, created_at")
                    .order("created_at", { ascending: false })
                    .limit(20),
                supabase
                    .from("profiles")
                    .select("id, full_name, email, updated_at")
                    .eq("is_paid", true)
                    .order("updated_at", { ascending: false })
                    .limit(20),
                supabase
                    .from("tailored_outputs")
                    .select("id, created_at, output_language, tone")
                    .order("created_at", { ascending: false })
                    .limit(20),
            ]);

            const combined: Notif[] = [];

            (msgRes.data || []).forEach(m => {
                combined.push({
                    id: `msg-${m.id}`,
                    type: "new_message",
                    title: "New Support Message",
                    desc: (m.content as string)?.slice(0, 100) || "(empty)",
                    time: m.created_at,
                    read: readSet.has(`msg-${m.id}`),
                });
            });

            (usersRes.data || []).forEach(u => {
                combined.push({
                    id: `user-${u.id}`,
                    type: "new_user",
                    title: "New User Signed Up",
                    desc: `${u.full_name || "Anonymous"} · ${u.email || ""}`,
                    time: u.created_at,
                    read: readSet.has(`user-${u.id}`),
                });
            });

            (proRes.data || []).forEach(u => {
                combined.push({
                    id: `pro-${u.id}`,
                    type: "pro_upgrade",
                    title: "User Upgraded to Pro",
                    desc: `${u.full_name || "User"} is now on Pro plan`,
                    time: u.updated_at,
                    read: readSet.has(`pro-${u.id}`),
                });
            });

            (optRes.data || []).forEach(o => {
                combined.push({
                    id: `opt-${o.id}`,
                    type: "new_optimization",
                    title: "CV Optimization Run",
                    desc: `Language: ${o.output_language?.toUpperCase() || "EN"} · Tone: ${o.tone || "professional"}`,
                    time: o.created_at,
                    read: readSet.has(`opt-${o.id}`),
                });
            });

            combined.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
            setNotifs(combined);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const markAllRead = () => {
        const ids = new Set(notifs.map(n => n.id));
        setReadSet(ids);
        setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    };

    const markRead = (id: string) => {
        setReadSet(prev => new Set([...prev, id]));
        setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const filtered = activeTab === "all" ? notifs : notifs.filter(n => n.type === activeTab);
    const unread = notifs.filter(n => !n.read).length;

    return (
        <div className="p-6 sm:p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-100">Notifications</h1>
                        <p className="text-xs text-gray-500 font-medium">
                            {unread > 0 ? `${unread} unread` : "All caught up"}
                        </p>
                    </div>
                    {unread > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
                            {unread}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={fetchAll}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800 text-gray-400 hover:text-gray-100 hover:bg-gray-700 text-sm font-semibold transition">
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                    {unread > 0 && (
                        <button onClick={markAllRead}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 text-sm font-semibold transition">
                            <CheckCheck className="w-4 h-4" />
                            Mark all read
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-gray-900 rounded-2xl p-1 overflow-x-auto">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as "all" | NotifType)}
                        className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab.key
                            ? "bg-indigo-600 text-white shadow"
                            : "text-gray-400 hover:text-gray-200"}`}
                    >
                        {tab.label}
                        {tab.key !== "all" && (
                            <span className="ml-1.5 text-[10px] font-black opacity-60">
                                {notifs.filter(n => n.type === tab.key).length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Notification list */}
            {loading ? (
                <div className="flex items-center justify-center py-24 text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mr-3" />
                    Loading…
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-600">
                    <Inbox className="w-12 h-12 mb-4 opacity-30" />
                    <p className="font-semibold">No notifications here</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map(n => {
                        const meta = TYPE_META[n.type];
                        const Icon = meta.icon;
                        return (
                            <div
                                key={n.id}
                                onClick={() => markRead(n.id)}
                                className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all group ${n.read
                                    ? "bg-gray-900/40 border-gray-800/50 opacity-60 hover:opacity-80"
                                    : "bg-gray-900 border-gray-700 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5"}`}
                            >
                                {/* Icon */}
                                <div className={`w-10 h-10 rounded-2xl ${meta.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                    <Icon className={`w-5 h-5 ${meta.color}`} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <p className="text-sm font-bold text-gray-100">{n.title}</p>
                                        {!n.read && (
                                            <span className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400 truncate">{n.desc}</p>
                                </div>

                                {/* Time */}
                                <div className="text-right flex-shrink-0">
                                    <p className="text-xs text-gray-500 font-medium">{timeAgo(n.time)}</p>
                                    <p className="text-[10px] text-gray-600 mt-0.5">
                                        {new Date(n.time).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
