"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Crown, User, Mail, Calendar, FileText, Zap, Trash2, ShieldCheck, ShieldOff, RefreshCw, MessageSquare } from "lucide-react";
import Link from "next/link";

interface UserRow {
    id: string;
    email: string;
    full_name: string;
    role: string;
    is_paid: boolean;
    created_at: string;
    resume_count?: number;
    optimization_count?: number;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserRow[]>([]);
    const [filtered, setFiltered] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "pro" | "free" | "admin">("all");
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.access_token) setToken(session.access_token);
        });
    }, []);

    const fetchUsers = useCallback(async (tk: string) => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/users", {
                headers: { authorization: `Bearer ${tk}` },
            });
            if (!res.ok) throw new Error("Failed");
            const json = await res.json();
            setUsers(json.users || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (token) fetchUsers(token);
    }, [token, fetchUsers]);

    useEffect(() => {
        let list = users;
        if (filter === "pro") list = list.filter(u => u.is_paid);
        if (filter === "free") list = list.filter(u => !u.is_paid);
        if (filter === "admin") list = list.filter(u => u.role === "admin");
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(u => (u.email || "").toLowerCase().includes(q) || (u.full_name || "").toLowerCase().includes(q));
        }
        setFiltered(list);
    }, [users, search, filter]);

    const togglePro = async (userId: string, current: boolean) => {
        if (!token) return;
        setActionLoading(userId + "_pro");
        await fetch("/api/admin/users", {
            method: "PATCH",
            headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
            body: JSON.stringify({ userId, is_paid: !current }),
        });
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_paid: !current } : u));
        setActionLoading(null);
    };

    const toggleRole = async (userId: string, current: string) => {
        if (!token) return;
        const newRole = current === "admin" ? "user" : "admin";
        setActionLoading(userId + "_role");
        await fetch("/api/admin/users", {
            method: "PATCH",
            headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
            body: JSON.stringify({ userId, role: newRole }),
        });
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        setActionLoading(null);
    };

    const deleteUser = async (userId: string) => {
        if (!token) return;
        if (!confirm("Delete this user and all their data? This cannot be undone.")) return;
        setActionLoading(userId + "_del");
        await fetch(`/api/admin/users?userId=${userId}`, {
            method: "DELETE",
            headers: { authorization: `Bearer ${token}` },
        });
        setUsers(prev => prev.filter(u => u.id !== userId));
        setActionLoading(null);
    };

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white">Users</h1>
                    <p className="text-gray-400 mt-1">{users.length} total accounts</p>
                </div>
                <button onClick={() => token && fetchUsers(token)} className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-semibold text-gray-300 transition">
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name or email"
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition"
                    />
                </div>
                <div className="flex bg-gray-900 border border-gray-700 rounded-xl p-1 gap-1">
                    {(["all", "pro", "free", "admin"] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${filter === f ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-gray-200"}`}>
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-20 text-gray-500">
                    <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mr-3" /> Loading all users
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-gray-800">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-900 border-b border-gray-800">
                                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Plan</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Activity</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/60">
                            {filtered.map(u => (
                                <tr key={u.id} className="hover:bg-gray-800/30 transition">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-900/50 flex items-center justify-center text-xs font-black text-indigo-300 shrink-0">
                                                {(u.full_name || u.email || "?")[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-200">{u.full_name || ""}</p>
                                                <p className="text-xs text-gray-500">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col gap-1">
                                            {u.is_paid ? (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full w-fit">
                                                    <Crown className="w-3 h-3" /> Pro
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-gray-700/50 text-gray-400 px-2 py-0.5 rounded-full w-fit">
                                                    <User className="w-3 h-3" /> Free
                                                </span>
                                            )}
                                            {u.role === "admin" && (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full w-fit">
                                                    <ShieldCheck className="w-3 h-3" /> Admin
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                            <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {u.resume_count ?? ""} CVs</span>
                                            <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {u.optimization_count ?? ""} opts</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="flex items-center gap-1 text-xs text-gray-500">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(u.created_at).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                            <Link href={`/admin/messages?user=${u.id}`}
                                                className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-indigo-900/20 transition" title="View messages">
                                                <MessageSquare className="w-4 h-4" />
                                            </Link>
                                            <button onClick={() => togglePro(u.id, u.is_paid)} disabled={!!actionLoading}
                                                className={`p-1.5 rounded-lg transition ${u.is_paid ? "text-yellow-400 hover:bg-yellow-900/20" : "text-gray-500 hover:text-yellow-400 hover:bg-yellow-900/20"}`}
                                                title={u.is_paid ? "Remove Pro" : "Grant Pro"}>
                                                <Crown className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => toggleRole(u.id, u.role)} disabled={!!actionLoading}
                                                className={`p-1.5 rounded-lg transition ${u.role === "admin" ? "text-red-400 hover:bg-red-900/20" : "text-gray-500 hover:text-red-400 hover:bg-red-900/20"}`}
                                                title={u.role === "admin" ? "Remove Admin" : "Make Admin"}>
                                                {u.role === "admin" ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                                            </button>
                                            <button onClick={() => deleteUser(u.id)} disabled={!!actionLoading}
                                                className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition" title="Delete user">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div className="text-center py-10 text-gray-600 text-sm">No users match your filter</div>
                    )}
                </div>
            )}
        </div>
    );
}
