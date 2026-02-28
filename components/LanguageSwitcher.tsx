"use client";

import { Globe } from "lucide-react";
import { useState } from "react";
import { useLang } from "@/lib/langContext";
import { motion, AnimatePresence } from "framer-motion";

const LANGS = [
    { code: "en" as const, label: "English",      short: "EN" },
    { code: "tr" as const, label: "Turkce",        short: "TR" },
    { code: "az" as const, label: "Azerbaycanca",  short: "AZ" },
    { code: "ru" as const, label: "Russky",        short: "RU" },
];

interface Props {
    inline?: boolean;
}

export function LanguageSwitcher({ inline = false }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const { lang, setLang } = useLang();
    const current = LANGS.find(l => l.code === lang) ?? LANGS[0];

    if (inline) {
        return (
            <div className="relative inline-block text-left z-50">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 px-3 py-1.5 bg-white/60 dark:bg-black/40 text-sm font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition backdrop-blur-sm"
                >
                    <Globe className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                    <span className="text-xs font-black text-indigo-500">{current.short}</span>
                    <span className="hidden sm:inline">{current.label}</span>
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 8 }}
                                transition={{ duration: 0.15 }}
                                className="absolute top-full mt-2 right-0 min-w-[160px] rounded-2xl shadow-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden z-50"
                            >
                                {LANGS.map(l => (
                                    <button key={l.code}
                                        onClick={() => { setLang(l.code); setIsOpen(false); }}
                                        className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm font-semibold transition-colors ${lang === l.code ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>
                                        <span className="text-xs font-black w-6 text-center opacity-70">{l.short}</span>
                                        {l.label}
                                    </button>
                                ))}
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="relative inline-block text-left z-50 w-full">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center gap-2 justify-start w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 px-4 py-3 bg-white/50 dark:bg-black/50 text-sm font-bold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition"
            >
                <Globe className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span className="text-xs font-black text-indigo-500 w-6">{current.short}</span>
                {current.label}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full mb-2 left-0 right-0 rounded-2xl shadow-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden"
                    >
                        {LANGS.map(l => (
                            <button key={l.code}
                                onClick={() => { setLang(l.code); setIsOpen(false); }}
                                className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm font-semibold transition-colors ${lang === l.code ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>
                                <span className="text-xs font-black w-6 text-center opacity-60">{l.short}</span>
                                {l.label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}