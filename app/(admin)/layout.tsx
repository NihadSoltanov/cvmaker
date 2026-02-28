"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
    LayoutDashboard, Users, MessageSquare, FileText, Clock,
    Settings, LogOut, Shield, Bell, ChevronRight, BarChart3,
} from "lucide-react";

const NAV = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/notifications", label: "Notifications", icon: Bell, badge: "notif" },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/messages", label: "Support Inbox", icon: MessageSquare, badge: "live" },
    { href: "/admin/resumes", label: "Resumes", icon: FileText },
    { href: "/admin/history", label: "Optimizations", icon: Clock },
    { href: "/admin/stats", label: "Analytics", icon: BarChart3 },
    { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [adminEmail, setAdminEmail] = useState("");
    const [unread, setUnread] = useState(0);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/login"); return; }

            const { data: profile } = await supabase
                .from("profiles")
                .select("role, email")
                .eq("id", user.id)
                .maybeSingle();

            if (!profile || profile.role !== "admin") {
                router.push("/dashboard");
                return;
            }
            setAdminEmail(profile.email || user.email || "");
            setLoading(false);

            // Count unread support messages
            const { count } = await supabase
                .from("support_messages")
                .select("*", { count: "exact", head: true })
                .eq("read_by_admin", false)
                .neq("sender", "admin");
            setUnread(count || 0);

            // Subscribe to new messages
            const ch = supabase.channel("admin-unread")
                .on("postgres_changes", {
                    event: "INSERT",
                    schema: "public",
                    table: "support_messages",
                    filter: "sender=eq.user",
                }, () => setUnread(n => n + 1))
                .subscribe();
            return () => { supabase.removeChannel(ch); };
        };
        init();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="flex items-center gap-3 text-gray-400">
                    <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    Verifying admin access…
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 font-sans flex">
            {/* Sidebar */}
            <aside className="w-60 bg-gray-900 border-r border-gray-800 fixed h-full flex flex-col z-40">
                {/* Logo */}
                <div className="px-5 py-5 border-b border-gray-800">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                            <Shield className="w-4 h-4 text-red-400" />
                        </div>
                        <div>
                            <p className="text-sm font-black tracking-tight">Nexora <span className="text-red-400">Admin</span></p>
                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Control Panel</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                    {NAV.map(({ href, label, icon: Icon, exact, badge }) => {
                        const active = exact ? pathname === href : pathname.startsWith(href);
                        return (
                            <Link key={href} href={href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${active
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
                                }`}>
                                <Icon className="w-4 h-4 shrink-0" />
                                <span className="flex-1">{label}</span>
                                {badge === "notif" && (
                                    <span className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                                    </span>
                                )}
                                {badge === "live" && (
                                    <span className="flex items-center gap-1">
                                        {unread > 0 && (
                                            <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                                {unread > 99 ? "99+" : unread}
                                            </span>
                                        )}
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                    </span>
                                )}
                                {active && <ChevronRight className="w-3 h-3 opacity-60" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-3 border-t border-gray-800 space-y-1">
                    <Link href="/dashboard"
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition font-semibold">
                        ← Back to App
                    </Link>
                    <div className="px-3 py-2 rounded-xl bg-gray-800/50">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Signed in as</p>
                        <p className="text-xs text-gray-300 font-semibold truncate mt-0.5">{adminEmail}</p>
                    </div>
                    <button onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-gray-400 hover:bg-red-900/20 hover:text-red-400 transition w-full">
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className={`flex-1 ml-60 ${pathname === "/admin/messages" ? "h-screen overflow-hidden" : "min-h-screen overflow-auto"}`}>
                {children}
            </main>
        </div>
    );
}
