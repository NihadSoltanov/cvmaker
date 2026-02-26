"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { FileText, Search, Eye, Trash2, ChevronDown, ChevronRight } from "lucide-react";

interface ResumeRow {
    id: string;
    user_id: string;
    title: string;
    created_at: string;
    profiles: { email: string; full_name: string } | null;
    resume_json: any;
}

export default function AdminResumesPage() {
    const [resumes, setResumes] = useState<ResumeRow[]>([]);
    const [filtered, setFiltered] = useState<ResumeRow[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);

    useEffect(() => {
        const fetch = async () => {
            const { data } = await supabase
                .from("resumes")
                .select("id, user_id, title, created_at, resume_json, profiles(email, full_name)")
                .order("created_at", { ascending: false });
            setResumes((data as any) || []);
            setFiltered((data as any) || []);
            setLoading(false);
        };
        fetch();
    }, []);

    useEffect(() => {
        const q = search.toLowerCase();
        setFiltered(!q ? resumes : resumes.filter(r =>
            r.title?.toLowerCase().includes(q) ||
            (r.profiles as any)?.email?.toLowerCase().includes(q) ||
            (r.profiles as any)?.full_name?.toLowerCase().includes(q)
        ));
    }, [search, resumes]);

    const deleteResume = async (id: string) => {
        if (!confirm("Delete this resume?")) return;
        await supabase.from("resumes").delete().eq("id", id);
        setResumes(prev => prev.filter(r => r.id !== id));
    };

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white">Resumes</h1>
                    <p className="text-gray-400 mt-1">{resumes.length} saved CVs</p>
                </div>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name, email or title…"
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition"
                />
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-800">
                            <th className="text-left text-xs font-bold uppercase tracking-wider text-gray-500 px-5 py-4">Resume</th>
                            <th className="text-left text-xs font-bold uppercase tracking-wider text-gray-500 px-4 py-4 hidden md:table-cell">Owner</th>
                            <th className="text-left text-xs font-bold uppercase tracking-wider text-gray-500 px-4 py-4 hidden lg:table-cell">Created</th>
                            <th className="text-right text-xs font-bold uppercase tracking-wider text-gray-500 px-5 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {loading && (
                            <tr><td colSpan={4} className="text-center py-12">
                                <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
                            </td></tr>
                        )}
                        {!loading && filtered.length === 0 && (
                            <tr><td colSpan={4} className="text-center py-12 text-gray-600">No resumes found</td></tr>
                        )}
                        {filtered.map(r => (
                            <>
                                <tr key={r.id} className="hover:bg-gray-800/30 transition">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-green-900/30 text-green-400 rounded-lg flex items-center justify-center shrink-0">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-200">{r.title || "Untitled"}</p>
                                                <p className="text-xs text-gray-600 font-mono">{r.id.slice(0, 8)}…</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 hidden md:table-cell">
                                        <p className="text-sm text-gray-300">{(r.profiles as any)?.full_name || "—"}</p>
                                        <p className="text-xs text-gray-600">{(r.profiles as any)?.email}</p>
                                    </td>
                                    <td className="px-4 py-4 hidden lg:table-cell text-sm text-gray-500">
                                        {new Date(r.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                                                className="p-1.5 rounded-lg text-gray-600 hover:text-indigo-400 hover:bg-indigo-900/20 transition"
                                                title="Preview JSON">
                                                {expanded === r.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => deleteResume(r.id)}
                                                className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-900/20 transition"
                                                title="Delete">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {expanded === r.id && (
                                    <tr key={r.id + "_exp"} className="bg-gray-950">
                                        <td colSpan={4} className="px-5 py-4">
                                            <pre className="text-xs text-gray-400 overflow-auto max-h-64 font-mono bg-gray-900 rounded-xl p-4 border border-gray-800">
                                                {JSON.stringify(r.resume_json, null, 2)}
                                            </pre>
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
