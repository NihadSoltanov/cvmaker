import Link from "next/link";
import { ArrowRight, FileText, Zap, Clock, Star } from "lucide-react";
import { BackgroundBeams } from "@/components/ui/background-beams";

export default function DashboardOverview() {
    return (
        <div className="space-y-12 relative z-10 w-full h-full pb-20">
            <BackgroundBeams className="opacity-50" />

            <div className="relative">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-200/20 bg-white/50 dark:bg-black/50 backdrop-blur-md text-neutral-600 dark:text-neutral-400 text-xs font-bold tracking-widest uppercase mb-4 shadow-sm">
                    Overview
                </div>
                <h1 className="text-4xl sm:text-5xl font-black mb-3 text-neutral-900 dark:text-white tracking-tighter">Welcome back, Nihad.</h1>
                <p className="text-lg font-medium text-neutral-500 dark:text-neutral-400 max-w-2xl">Your personalized command center. Edit your base resume, generate tailored applications for specific roles, and track your history here.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8 perspective-1000 relative">
                <Link href="/resume" className="group rounded-[2rem] p-8 flex flex-col transition-all duration-300 bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 shadow-xl shadow-black/5 hover:border-indigo-500 hover:shadow-indigo-500/10 cursor-pointer block h-full">
                    <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                        <FileText className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-neutral-900 dark:text-white tracking-tight">Main CV Profile</h3>
                    <p className="text-neutral-500 dark:text-neutral-400 font-medium text-sm mb-6 flex-1">Keep your master experience, skills, and summary up to date for better AI tailoring.</p>
                    <div className="text-indigo-600 dark:text-indigo-400 text-sm font-bold flex items-center pt-6 border-t border-neutral-200 dark:border-neutral-800/80">
                        Edit CV Data <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>

                <Link href="/optimize" className="group rounded-[2rem] p-8 flex flex-col transition-all duration-300 bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 shadow-xl shadow-black/5 hover:border-purple-500 hover:shadow-purple-500/10 cursor-pointer block h-full">
                    <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/30 text-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300">
                        <Zap className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-neutral-900 dark:text-white tracking-tight">Quick Optimize</h3>
                    <p className="text-neutral-500 dark:text-neutral-400 font-medium text-sm mb-6 flex-1">Paste a job description to instantly align your CV, write emails, and prepare LinkedIn drafts.</p>
                    <div className="text-purple-600 dark:text-purple-400 text-sm font-bold flex items-center pt-6 border-t border-neutral-200 dark:border-neutral-800/80">
                        Start Generation <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>

                <Link href="/history" className="group rounded-[2rem] p-8 flex flex-col transition-all duration-300 bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 shadow-xl shadow-black/5 hover:border-blue-500 hover:shadow-blue-500/10 cursor-pointer block h-full">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                        <Clock className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-neutral-900 dark:text-white tracking-tight">App History</h3>
                    <p className="text-neutral-500 dark:text-neutral-400 font-medium text-sm mb-6 flex-1">Access past tailored resumes, download PDFs, or manage share links.</p>
                    <div className="text-blue-600 dark:text-blue-400 text-sm font-bold flex items-center pt-6 border-t border-neutral-200 dark:border-neutral-800/80">
                        View Generations <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>
            </div>

            <div className="mt-12 w-full p-8 rounded-[2rem] border border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-900/50 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-l-[2rem]" />
                <div>
                    <h4 className="font-extrabold text-xl mb-1 flex items-center gap-2"><Star className="w-5 h-5 text-indigo-500 fill-indigo-500" /> Current Plan: Free Trial</h4>
                    <p className="text-neutral-500 dark:text-neutral-400 font-medium">You have <strong className="text-indigo-600 dark:text-indigo-400">3 of 3</strong> generations remaining this month.</p>
                </div>
                <Link href="/pricing" className="whitespace-nowrap inline-flex items-center justify-center rounded-xl font-bold transition-all disabled:pointer-events-none disabled:opacity-50 h-12 px-6 hover:scale-105 active:scale-95 bg-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                    Upgrade to Pro
                </Link>
            </div>
        </div>
    );
}
