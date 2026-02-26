import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { PricingCards } from "@/components/PricingCards";
import { BackgroundBeams } from "@/components/ui/background-beams";

export default function PricingPage() {
    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden bg-white dark:bg-black font-sans">
            <BackgroundBeams />

            <header className="flex items-center justify-between px-6 py-4 z-50 sticky top-0 bg-white/5 dark:bg-black/5 backdrop-blur-md border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg flex-shrink-0">
                            <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
                                <path d="M10.5 4C8 4 5.5 6.2 5.5 10C5.5 13.8 8 16 10.5 16C11.8 16 12.7 15.6 13.2 15.1" stroke="white" strokeWidth="2.1" strokeLinecap="round" fill="none"/>
                                <path d="M13 4.5L15.5 13.5L18 4.5" stroke="white" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                                <circle cx="16.5" cy="2.5" r="2" fill="#fbbf24"/>
                                <circle cx="16.5" cy="2.5" r="0.9" fill="white" opacity="0.9"/>
                            </svg>
                        </div>
                        <span className="font-black text-xl hidden sm:block tracking-tight text-neutral-900 dark:text-neutral-100">CV<span className="text-indigo-500">iq</span></span>
                    </Link>
                </div>

                <nav className="flex items-center gap-4">
                    <LanguageSwitcher />
                </nav>
            </header>

            <main className="flex-1 px-4 py-24 z-10">
                <div className="text-center max-w-4xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-6">
                        Transparent & Simple
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-neutral-900 dark:text-white">One plan, <br className="sm:hidden" /> infinite power.</h1>
                    <p className="text-xl font-medium text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">Only pay when you need unlimited optimizations. A single low yearly payment guarantees access to all Pro features with priority API access.</p>
                </div>

                <PricingCards />
            </main>
        </div>
    );
}
