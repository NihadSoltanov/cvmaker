"use client";

import Link from "next/link";
import { ArrowRight, FileText, Share2, Sparkles, CheckCircle } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { ShinyButton } from "@/components/ui/shiny-button";
import { motion } from "framer-motion";
import { useLang } from "@/lib/langContext";

export default function MarketingPage() {
    const { t } = useLang();

    const features = [
        { icon: <FileText className="w-6 h-6" />, title: t("feat1Title"), desc: t("feat1Desc") },
        { icon: <Share2 className="w-6 h-6" />,   title: t("feat2Title"), desc: t("feat2Desc") },
        { icon: <Sparkles className="w-6 h-6" />,  title: t("feat3Title"), desc: t("feat3Desc") },
    ];

    return (
        <div className="min-h-screen relative flex flex-col antialiased bg-white dark:bg-black font-sans selection:bg-indigo-500/30">
            <BackgroundBeams />

            <header className="flex items-center justify-between px-6 py-4 z-50 sticky top-0 bg-white/5 dark:bg-black/5 backdrop-blur-xl border-b border-black/5 dark:border-white/5">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col leading-tight">
                    <span className="font-black text-xl tracking-tight text-neutral-900 dark:text-neutral-100">Nexora <span className="text-teal-600 dark:text-teal-400">AI</span></span>
                    <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 tracking-wider uppercase">AI Resume Optimizer</span>
                </motion.div>

                <nav className="flex items-center gap-6">
                    <Link href="/pricing" className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">{t("navPricing")}</Link>
                    <LanguageSwitcher inline />
                    <Link href="/login" className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">{t("navSignIn")}</Link>
                </nav>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center px-4 z-10 text-center relative py-24 sm:py-32">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-8"
                >
                    <Sparkles className="w-4 h-4" />
                    {t("heroBadge")}
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-6 max-w-5xl leading-[1.1] text-neutral-900 dark:text-white"
                >
                    {t("heroTitle")} <br className="hidden md:block" /> <AnimatedGradientText>Nexora AI</AnimatedGradientText>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-lg md:text-xl font-medium text-neutral-600 dark:text-neutral-400 max-w-2xl mb-12"
                >
                    {t("heroSubtitle")}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 w-full justify-center"
                >
                    <Link href="/signup">
                        <ShinyButton className="w-full sm:w-auto text-base">
                            {t("heroBtn")} <ArrowRight className="ml-2 w-5 h-5" />
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

                {/* Trusted section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-32 border-t border-neutral-200 dark:border-neutral-800 w-full pt-16"
                >
                    <p className="text-sm font-bold uppercase tracking-widest text-neutral-400 mb-8">Everything Nexora generates for you</p>
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
