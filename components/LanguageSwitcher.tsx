"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const languages = [
    { code: 'en', label: 'English' },
    { code: 'tr', label: 'Türkçe' },
    { code: 'az', label: 'Azərbaycanca' },
    { code: 'ru', label: 'Русский' }
];

export function LanguageSwitcher() {
    const [isOpen, setIsOpen] = useState(false);
    const [current, setCurrent] = useState('en');

    // Typically, you would handle cookie/localStorage and routing updates here.
    // For UI sake, we just mock the change visually.

    const handleSelect = (code: string) => {
        setCurrent(code);
        setIsOpen(false);
        // TODO: implement actual language context change + persistance
    };

    return (
        <div className="relative inline-block text-left z-50">
            <button
                type="button"
                className="inline-flex items-center gap-2 justify-center w-full rounded-full border border-neutral-200 dark:border-neutral-800 shadow-sm px-4 py-2 bg-white/50 dark:bg-black/50 backdrop-blur-md text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition focus:outline-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Globe className="w-4 h-4 text-indigo-500" />
                {languages.find(l => l.code === current)?.label}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="origin-top-right absolute right-0 mt-2 w-40 rounded-xl shadow-lg bg-white dark:bg-neutral-900 ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 focus:outline-none overflow-hidden"
                    >
                        <div className="py-1">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleSelect(lang.code)}
                                    className={`block px-4 py-2 text-sm w-full text-left transition-colors ${current === lang.code
                                            ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold'
                                            : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                        }`}
                                >
                                    {lang.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
