"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Zap, Clock, Settings, LogOut } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const navItems = [
        { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
        { href: "/resume", label: "My CV", icon: FileText },
        { href: "/optimize", label: "Optimize", icon: Zap },
        { href: "/history", label: "History", icon: Clock },
        { href: "/settings", label: "Settings", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-neutral-100/30 dark:bg-black font-sans flex text-neutral-900 dark:text-neutral-50 relative overflow-hidden selection:bg-indigo-500/30">
            {/* Sidebar */}
            <aside className="w-64 border-r border-neutral-200/50 dark:border-neutral-800/50 bg-white/60 dark:bg-black/40 backdrop-blur-3xl flex flex-col p-6 fixed h-full z-40 transition-all shadow-xl shadow-black/5">
                <Link href="/dashboard" className="flex items-center gap-3 mb-10 group mt-2">
                    <div className="w-10 h-10 rounded-full bg-black dark:bg-white flex items-center justify-center border border-neutral-200 dark:border-neutral-800 shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white dark:text-black">
                            <path d="M12 4L20 18H4L12 4Z" fill="currentColor" />
                        </svg>
                    </div>
                    <span className="font-extrabold text-lg tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">AI CV Optimizer</span>
                </Link>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${isActive
                                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 scale-[1.02]'
                                    : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-neutral-100 hover:scale-[1.02]'
                                    }`}
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="mt-auto border-t border-neutral-200/50 dark:border-neutral-800/50 pt-6 space-y-4">
                    <LanguageSwitcher />
                    <button className="flex items-center gap-4 px-4 py-3 w-full text-left rounded-2xl text-sm font-bold transition-all duration-300 text-neutral-500 dark:text-neutral-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 hover:scale-[1.02]">
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        Log out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-6 sm:p-10 relative">
                {/* Subtle background flair */}
                <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-5xl mx-auto h-full relative z-10 w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
