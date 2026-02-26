"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Users, Zap, Star, Globe, MessageSquare } from "lucide-react";

export default function AdminStatsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const res = await fetch("/api/admin/analytics", {
                headers: { authorization: `Bearer ${session.access_token}` },
            });
            if (!res.ok) return;
            const json = await res.json();
            setData(json);
            setLoading(false);
        })();
    }, []);

    if (loading) return (
        <div className="p-8 flex items-center justify-center h-64">
            <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
    );

    const maxBar = Math.max(...data.daily30.map((d: any) => d.opts), 1);

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-black text-white">Analytics</h1>
                <p className="text-gray-400 mt-1">Platform usage — last 30 days</p>
            </div>

            {/* Summary numbers */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
                    <Users className="w-8 h-8 text-indigo-400 shrink-0" />
                    <div>
                        <p className="text-2xl font-black text-white">{data.totalUsers}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Total users</p>
                    </div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
                    <Star className="w-8 h-8 text-amber-400 shrink-0" />
                    <div>
                        <p className="text-2xl font-black text-white">{data.proUsers}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Pro subscribers</p>
                    </div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
                    <MessageSquare className="w-8 h-8 text-orange-400 shrink-0" />
                    <div>
                        <p className="text-2xl font-black text-white">{data.totalMessages}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Support messages</p>
                    </div>
                </div>
            </div>

            {/* 30-day activity chart */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-6">Daily Optimizations — Last 30 Days</h3>
                <div className="flex items-end gap-1 h-40">
                    {data.daily30.map((d: any) => (
                        <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer">
                            <div className="relative flex-1 w-full flex items-end">
                                <div
                                    className="w-full rounded-t bg-indigo-500/60 hover:bg-indigo-400 transition"
                                    style={{ height: `${(d.opts / maxBar) * 100}%`, minHeight: d.opts ? 4 : 1 }}
                                    title={`${d.date}: ${d.opts} optimizations, ${d.signups} signups`}
                                />
                            </div>
                            {/* only show label every 5 days */}
                            <span className={`text-[9px] text-gray-700 ${data.daily30.indexOf(d) % 5 === 0 ? "text-gray-600" : "opacity-0"}`}>
                                {d.date.slice(5)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Language breakdown */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-indigo-400" /> Output Languages
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(data.langMap)
                            .sort(([, a], [, b]) => (b as number) - (a as number))
                            .map(([lang, count]) => {
                                const total = Object.values(data.langMap).reduce((s: any, v) => s + v, 0) as number;
                                return (
                                    <div key={lang}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-bold text-gray-300 uppercase">{lang}</span>
                                            <span className="text-gray-500">{count as number} ({total ? (((count as number) / total) * 100).toFixed(0) : 0}%)</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-800 rounded-full">
                                            <div className="h-full bg-indigo-500 rounded-full"
                                                style={{ width: total ? `${((count as number) / total) * 100}%` : "0%" }} />
                                        </div>
                                    </div>
                                );
                            })}
                        {Object.keys(data.langMap).length === 0 && <p className="text-sm text-gray-600">No data yet</p>}
                    </div>
                </div>

                {/* Tone breakdown */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-purple-400" /> Popular Tones
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(data.toneMap)
                            .sort(([, a], [, b]) => (b as number) - (a as number))
                            .map(([tone, count]) => {
                                const total = Object.values(data.toneMap).reduce((s: any, v) => s + v, 0) as number;
                                return (
                                    <div key={tone}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-bold text-gray-300 capitalize">{tone}</span>
                                            <span className="text-gray-500">{count as number}</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-800 rounded-full">
                                            <div className="h-full bg-purple-500 rounded-full"
                                                style={{ width: total ? `${((count as number) / total) * 100}%` : "0%" }} />
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>

                {/* Top ATS scores */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-400" /> Top ATS Scores
                    </h3>
                    <div className="space-y-2">
                        {data.topAts?.slice(0, 8).map((r: any, i: number) => (
                            <div key={r.id || i} className="flex items-center justify-between">
                                <p className="text-xs text-gray-400 truncate flex-1">
                                    {(r.profiles as any)?.full_name || (r.profiles as any)?.email || "Unknown"}
                                </p>
                                <span className={`text-xs font-black ml-2 shrink-0 ${r.ats_score >= 75 ? "text-green-400" : r.ats_score >= 50 ? "text-amber-400" : "text-red-400"}`}>
                                    {r.ats_score}
                                </span>
                            </div>
                        ))}
                        {(!data.topAts || data.topAts.length === 0) && <p className="text-sm text-gray-600">No ATS data yet</p>}
                    </div>
                </div>
            </div>

            {/* Support stats */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-orange-400" /> Support Overview
                </h3>
                <p className="text-4xl font-black text-white">{data.totalMessages}</p>
                <p className="text-sm text-gray-500 mt-1">Total support messages exchanged</p>
            </div>
        </div>
    );
}
