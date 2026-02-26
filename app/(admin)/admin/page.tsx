"use client";

import { useEffect, useState } from "react";
import {
    Users, FileText, Zap, TrendingUp, Crown, UserCheck,
    MessageSquare, Clock, Activity, ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

interface Stats {
    totalUsers: number;
    proUsers: number;
    freeUsers: number;
    totalResumes: number;
    totalOptimizations: number;
    todaySignups: number;
    todayOptimizations: number;
    openTickets: number;
    recentUsers: any[];
    recentMessages: any[];
    optimizationsByDay: { date: string; count: number }[];
}

function StatCard({ label, value, icon: Icon, color, sub, href }: { label: string; value: number | string; icon: any; color: string; sub?: string; href?: string }) {
    const content = (
        <div className={`bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition group`}>
            <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="w-5 h-5" />
                </div>
                {href && <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition" />}
            </div>
            <p className="text-3xl font-black text-white">{value}</p>
            <p className="text-sm font-semibold text-gray-400 mt-1">{label}</p>
            {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
        </div>
    );
    return href ? <Link href={href}>{content}</Link> : content;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data: { session } } = await (await import("@/lib/supabase")).supabase.auth.getSession();
                if (!session) return;
                const res = await fetch("/api/admin/stats", {
                    headers: { authorization: `Bearer ${session.access_token}` },
                });
                if (!res.ok) throw new Error("Failed to fetch stats");
                const data = await res.json();
                setStats(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="p-8 space-y-6">
                <div className="h-8 bg-gray-800 rounded-xl w-64 animate-pulse" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-28 bg-gray-800 rounded-2xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    const maxBar = Math.max(...(stats?.optimizationsByDay.map(d => d.count) || [1]), 1);

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
                <p className="text-gray-400 mt-1">Platform overview — real-time data</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Users" value={stats!.totalUsers} icon={Users} color="bg-indigo-500/20 text-indigo-400" href="/admin/users" />
                <StatCard label="Pro Users" value={stats!.proUsers} icon={Crown} color="bg-amber-500/20 text-amber-400"
                    sub={`${stats!.freeUsers} on Free plan`} href="/admin/users" />
                <StatCard label="Total Resumes" value={stats!.totalResumes} icon={FileText} color="bg-green-500/20 text-green-400" href="/admin/resumes" />
                <StatCard label="Optimizations" value={stats!.totalOptimizations} icon={Zap} color="bg-purple-500/20 text-purple-400" href="/admin/history" />
                <StatCard label="Today's Signups" value={stats!.todaySignups} icon={UserCheck} color="bg-blue-500/20 text-blue-400" />
                <StatCard label="Today's Optimizations" value={stats!.todayOptimizations} icon={TrendingUp} color="bg-rose-500/20 text-rose-400" />
                <StatCard label="Open Support Tickets" value={stats!.openTickets} icon={MessageSquare} color="bg-orange-500/20 text-orange-400" href="/admin/messages" />
                <StatCard label="Conversion Rate" value={`${stats!.totalUsers ? ((stats!.proUsers / stats!.totalUsers) * 100).toFixed(1) : 0}%`}
                    icon={Activity} color="bg-teal-500/20 text-teal-400" sub="Free → Pro" />
            </div>

            {/* Charts + Recent */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* 7-day bar chart */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">Optimizations — Last 7 Days</h3>
                    <div className="flex items-end gap-3 h-36">
                        {stats!.optimizationsByDay.map(({ date, count }) => (
                            <div key={date} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-xs font-bold text-gray-500">{count || ""}</span>
                                <div
                                    className="w-full rounded-t-lg bg-indigo-500/70 hover:bg-indigo-400 transition"
                                    style={{ height: `${maxBar ? (count / maxBar) * 100 : 4}%`, minHeight: count ? 6 : 2 }}
                                />
                                <span className="text-[9px] text-gray-600 font-bold">
                                    {new Date(date).toLocaleDateString("en", { weekday: "short" })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Plan split */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">Plan Distribution</h3>
                    <div className="space-y-3">
                        {[
                            { label: "Free Plan", count: stats!.freeUsers, total: stats!.totalUsers, color: "bg-gray-600" },
                            { label: "Pro Plan", count: stats!.proUsers, total: stats!.totalUsers, color: "bg-amber-500" },
                        ].map(({ label, count, total, color }) => (
                            <div key={label}>
                                <div className="flex justify-between text-sm mb-1.5">
                                    <span className="font-semibold text-gray-300">{label}</span>
                                    <span className="font-bold text-gray-400">{count} ({total ? ((count / total) * 100).toFixed(0) : 0}%)</span>
                                </div>
                                <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${color} transition-all`}
                                        style={{ width: total ? `${(count / total) * 100}%` : "0%" }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Recent Signups</h3>
                        <Link href="/admin/users" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition">View all →</Link>
                    </div>
                    <div className="space-y-3">
                        {stats!.recentUsers.length === 0 && <p className="text-sm text-gray-600">No users yet</p>}
                        {stats!.recentUsers.map(u => (
                            <div key={u.id} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-900/50 flex items-center justify-center text-xs font-black text-indigo-400 shrink-0">
                                    {(u.full_name || u.email || "?")[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-200 truncate">{u.full_name || u.email}</p>
                                    <p className="text-xs text-gray-600">{new Date(u.created_at).toLocaleDateString()}</p>
                                </div>
                                {u.is_paid && (
                                    <span className="text-[10px] font-black bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">PRO</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Support Messages */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Recent Support</h3>
                        <Link href="/admin/messages" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition">Open inbox →</Link>
                    </div>
                    <div className="space-y-3">
                        {stats!.recentMessages.length === 0 && <p className="text-sm text-gray-600">No messages yet</p>}
                        {stats!.recentMessages.map((m: any) => (
                            <Link key={m.id} href={`/admin/messages?user=${m.user_id}`}
                                className="flex items-start gap-3 hover:bg-gray-800/50 rounded-xl p-2 -mx-2 transition block">
                                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${m.sender === "user" ? "bg-orange-400" : "bg-green-400"}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-gray-400 mb-0.5">
                                        {(m.profiles as any)?.full_name || (m.profiles as any)?.email || "Unknown"} · {m.sender}
                                    </p>
                                    <p className="text-sm text-gray-300 truncate">{m.message}</p>
                                </div>
                                {!m.read_by_admin && m.sender === "user" && (
                                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1.5" />
                                )}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
