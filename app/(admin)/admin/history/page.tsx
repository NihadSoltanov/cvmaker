"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Zap, Search, ChevronDown, ChevronRight, Star, Trash2 } from "lucide-react";

interface OutputRow {
    id: string;
    user_id: string;
    output_language: string;
    tone: string;
    ats_score: number | null;
    cover_letter: string;
    created_at: string;
    profiles: { email: string; full_name: string } | null;
}

export default function AdminHistoryPage() {
    const [rows, setRows] = useState<OutputRow[]>([]);
    const [filtered, setFiltered] = useState<OutputRow[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            setToken(session.access_token);
            const res = await fetch("/api/admin/history", {
                headers: { authorization: `Bearer ${session.access_token}` },
            });
            if (!res.ok) return;
            const json = await res.json();
            setRows(json.rows || []);
            setFiltered(json.rows || []);
            setLoading(false);
        })();
    }, []);

    useEffect(() => {
        const q = search.toLowerCase();
        setFiltered(!q ? rows : rows.filter(r =>
            (r.profiles as any)?.email?.toLowerCase().includes(q) ||
            (r.profiles as any)?.full_name?.toLowerCase().includes(q)
        ));
    }, [search, rows]);

    const deleteRow = async (id: string) => {
        if (!token) return;
        if (!confirm("Delete this optimization?")) return;
        await fetch(`/api/admin/history?id=${id}`, {
            method: "DELETE",
            headers: { authorization: `Bearer ${token}` },
        });
        setRows(prev => prev.filter(r => r.id !== id));
    };

    const atsColor = (score: number | null) => {
        if (!score) return "text-gray-600";
        if (score >= 75) return "text-green-400";
        if (score >= 50) return "text-amber-400";
        return "text-red-400";
    };

    return (
        <div className="p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-black text-white">Optimizations</h1>
                <p className="text-gray-400 mt-1">{rows.length} records (latest 200)</p>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by user…"
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition"
                />
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-800">
                            <th className="text-left text-xs font-bold uppercase tracking-wider text-gray-500 px-5 py-4">ID</th>
                            <th className="text-left text-xs font-bold uppercase tracking-wider text-gray-500 px-4 py-4">User</th>
                            <th className="text-left text-xs font-bold uppercase tracking-wider text-gray-500 px-4 py-4 hidden md:table-cell">ATS</th>
                            <th className="text-left text-xs font-bold uppercase tracking-wider text-gray-500 px-4 py-4 hidden md:table-cell">Lang</th>
                            <th className="text-left text-xs font-bold uppercase tracking-wider text-gray-500 px-4 py-4 hidden lg:table-cell">Date</th>
                            <th className="text-right text-xs font-bold uppercase tracking-wider text-gray-500 px-5 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {loading && (
                            <tr><td colSpan={6} className="text-center py-12">
                                <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
                            </td></tr>
                        )}
                        {!loading && filtered.length === 0 && (
                            <tr><td colSpan={6} className="text-center py-12 text-gray-600">No optimizations found</td></tr>
                        )}
                        {filtered.map(r => (
                            <>
                                <tr key={r.id} className="hover:bg-gray-800/30 transition">
                                    <td className="px-5 py-4 text-xs text-gray-600 font-mono">{r.id.slice(0, 8)}…</td>
                                    <td className="px-4 py-4">
                                        <p className="text-sm text-gray-300">{(r.profiles as any)?.full_name || "—"}</p>
                                        <p className="text-xs text-gray-600">{(r.profiles as any)?.email}</p>
                                    </td>
                                    <td className="px-4 py-4 hidden md:table-cell">
                                        <span className={`text-sm font-black flex items-center gap-1 ${atsColor(r.ats_score)}`}>
                                            <Star className="w-3 h-3" />
                                            {r.ats_score ?? "—"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 hidden md:table-cell">
                                        <span className="text-xs font-bold bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{r.output_language?.toUpperCase()}</span>
                                    </td>
                                    <td className="px-4 py-4 hidden lg:table-cell text-sm text-gray-500">
                                        {new Date(r.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                                                className="p-1.5 rounded-lg text-gray-600 hover:text-indigo-400 hover:bg-indigo-900/20 transition">
                                                {expanded === r.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => deleteRow(r.id)}
                                                className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-900/20 transition">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {expanded === r.id && (
                                    <tr key={r.id + "_exp"} className="bg-gray-950">
                                        <td colSpan={6} className="px-5 py-4">
                                            <div className="text-xs text-gray-300 bg-gray-900 rounded-xl p-4 border border-gray-800 max-h-48 overflow-auto">
                                                <p className="font-bold text-gray-500 mb-2 uppercase tracking-wider text-[10px]">Cover Letter Preview</p>
                                                <p className="whitespace-pre-wrap">{r.cover_letter?.slice(0, 600) || "—"}{r.cover_letter?.length > 600 ? "…" : ""}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
