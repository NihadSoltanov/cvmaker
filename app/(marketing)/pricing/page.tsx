"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { PricingCards } from "@/components/PricingCards";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { useLang } from "@/lib/langContext";
import { ArrowLeft } from "lucide-react";

export default function PricingPage() {
    const { t } = useLang();
    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden bg-white dark:bg-black font-sans">
            <BackgroundBeams />

            <header className="flex items-center justify-between px-6 py-4 z-50 sticky top-0 bg-white/5 dark:bg-black/5 backdrop-blur-md border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex flex-col leading-tight">
                        <span className="font-black text-xl tracking-tight text-neutral-900 dark:text-neutral-100">Nexora <span className="text-teal-600 dark:text-teal-400">AI</span></span>
                        <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 tracking-wider uppercase">AI Resume Optimizer</span>
                    </Link>
                </div>

                <nav className="flex items-center gap-4">
                    <LanguageSwitcher inline />
                    <Link href="/" className="text-sm font-semibold text-neutral-500 hover:text-indigo-500 transition flex items-center gap-1">
                        <ArrowLeft className="w-4 h-4" /> Home
                    </Link>
                </nav>
            </header>

            <main className="flex-1 px-4 py-24 z-10">
                <div className="text-center max-w-4xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-6">
                        {t("pricingBadge")}
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-neutral-900 dark:text-white">
                        {t("pricingTitle")} <br className="sm:hidden" /> <span className="text-indigo-500">{t("pricingTitleAccent")}</span>
                    </h1>
                    <p className="text-xl font-medium text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">{t("pricingSubtitle")}</p>
                </div>

                <PricingCards />
            </main>
        </div>
    );
}
