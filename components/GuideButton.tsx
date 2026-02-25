"use client";

import { useState } from "react";
import { BookOpen, X } from "lucide-react";

interface Guide {
    title: string;
    steps: string[];
    tips?: string[];
}

export function GuideButton({ guide }: { guide: Guide }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/20 px-4 py-2 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
            >
                <BookOpen className="w-4 h-4" />
                How to use this page?
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in-0">
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-3xl shadow-2xl w-full max-w-lg p-8 relative">
                        <button onClick={() => setOpen(false)} className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 rounded-xl p-2 transition-colors"><X className="w-5 h-5" /></button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white">{guide.title}</h3>
                        </div>

                        <ol className="space-y-3 mb-5">
                            {guide.steps.map((step, i) => (
                                <li key={i} className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                                    <span className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{step}</span>
                                </li>
                            ))}
                        </ol>

                        {guide.tips && guide.tips.length > 0 && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-2xl p-4">
                                <p className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-2">💡 Pro Tips</p>
                                <ul className="space-y-1.5">
                                    {guide.tips.map((tip, i) => (
                                        <li key={i} className="text-sm text-amber-800 dark:text-amber-300">• {tip}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
