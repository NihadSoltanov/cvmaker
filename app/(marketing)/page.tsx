"use client";

import Link from "next/link";
import { ArrowRight, FileText, Share2, Sparkles, CheckCircle } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { ShinyButton } from "@/components/ui/shiny-button";
import { motion } from "framer-motion";

export default function MarketingPage() {
    const features = [
        {
            icon: <FileText className="w-6 h-6" />,
            title: "ATS-Friendly Resumes",
            desc: "Generate clean, optimised PDF resumes that pass strict AI and ATS filters without losing your truthful experience."
        },
        {
            icon: <Share2 className="w-6 h-6" />,
            title: "Instant Share Links",
            desc: "Don\u2019t want to send attachments? Create tracked, unlisted web links for your tailored application."
        },
        {
            icon: <Sparkles className="w-6 h-6" />,
            title: "Full Application Pack",
            desc: "Not just a CV. Get customised cover letters, email text, and 3 variants of LinkedIn messages instantly."
        }
    ];

    return (
        <div className="min-h-screen relative flex flex-col antialiased bg-white dark:bg-black font-sans selection:bg-indigo-500/30">
            <BackgroundBeams />

            <header className="flex items-center justify-between px-6 py-4 z-50 sticky top-0 bg-white/5 dark:bg-black/5 backdrop-blur-xl border-b border-black/5 dark:border-white/5">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg flex-shrink-0">
                        <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
                            <path d="M10.5 4C8 4 5.5 6.2 5.5 10C5.5 13.8 8 16 10.5 16C11.8 16 12.7 15.6 13.2 15.1" stroke="white" strokeWidth="2.1" strokeLinecap="round" fill="none"/>
                            <path d="M13 4.5L15.5 13.5L18 4.5" stroke="white" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                            <circle cx="16.5" cy="2.5" r="2" fill="#fbbf24"/>
                            <circle cx="16.5" cy="2.5" r="0.9" fill="white" opacity="0.9"/>
                        </svg>
                    </div>
                    <span className="font-black text-xl hidden sm:block tracking-tight text-neutral-900 dark:text-neutral-100">CV<span className="text-indigo-500">iq</span></span>
                </motion.div>

                <nav className="flex items-center gap-6">
                    <Link href="/pricing" className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">Pricing</Link>
                    <LanguageSwitcher />
                    <Link href="/login" className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">Sign in</Link>
                </nav>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center px-4 z-10 text-center relative py-24 sm:py-32">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-8"
                >
                    <Sparkles className="w-4 h-4" />
                    Now with Full Multi-Language Support
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-6 max-w-5xl leading-[1.1] text-neutral-900 dark:text-white"
                >
                    Land your dream <br className="hidden md:block" /> job with <AnimatedGradientText>CViq AI</AnimatedGradientText>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-lg md:text-xl font-medium text-neutral-600 dark:text-neutral-400 max-w-2xl mb-12"
                >
                    Upload your base resume, paste the job description, and let our engine instantly align your profile. No hallucinations, purely you.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 w-full justify-center"
                >
                    <Link href="/signup">
                        <ShinyButton className="w-full sm:w-auto text-base">
                            Optimize My CV <ArrowRight className="ml-2 w-5 h-5" />
                        </ShinyButton>
                    </Link>
                </motion.div>

                {/* Feature Grid */}
                <div className="mt-32 grid md:grid-cols-3 gap-6 max-w-6xl w-full text-left perspective-1000">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                            whileHover={{ scale: 1.02, rotateY: 5, rotateX: 5 }}
                            className="bg-white/40 dark:bg-neutral-900/40 border border-neutral-200/50 dark:border-neutral-800/50 backdrop-blur-xl p-8 rounded-3xl shadow-xl shadow-black/5 hover:shadow-indigo-500/10 transition-all cursor-default"
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 shadow-sm">
                                {f.icon}
                            </div>
                            <h3 className="font-bold text-xl mb-3 text-neutral-900 dark:text-neutral-100">{f.title}</h3>
                            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 leading-relaxed">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Trusted section or quick peek */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-32 border-t border-neutral-200 dark:border-neutral-800 w-full pt-16"
                >
                    <p className="text-sm font-bold uppercase tracking-widest text-neutral-400 mb-8">Everything CViq generates for you</p>
                    <div className="flex flex-wrap justify-center gap-8 px-4">
                        {['ATS Score & Analysis', 'ATS CV Scanner', 'Cover Letters', 'Motivation Letters', 'Email & Subject Line', 'LinkedIn Messages', 'AI Career Coach'].map((tag, i) => (
                            <span key={i} className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300 font-medium">
                                <CheckCircle className="w-5 h-5 text-indigo-500" /> {tag}
                            </span>
                        ))}
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
