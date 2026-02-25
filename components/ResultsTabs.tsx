"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Link as LinkIcon, Copy } from 'lucide-react';

interface Outputs {
    coverLetter: string;
    applicationText: string;
    linkedinMessages: { recruiter: string; hiring_manager: string; referral: string; };
    missingRequirements: string[];
}

export function ResultsTabs({ parsedOutput }: { parsedOutput: any }) {
    const [activeTab, setActiveTab] = useState('coverLetter');

    if (!parsedOutput) return null;

    const tabs = [
        { id: 'coverLetter', label: 'Cover Letter' },
        { id: 'appText', label: 'Email Text' },
        { id: 'linkedin', label: 'LinkedIn' },
        { id: 'missing', label: 'Gaps' }
    ];

    return (
        <div className="glass-card rounded-3xl p-6 mt-8 flex flex-col min-h-[400px]">
            <div className="flex flex-wrap gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-4 mb-4">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab.id
                            ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300'
                            : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-auto">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed space-y-4"
                >
                    {activeTab === 'coverLetter' && <p>{parsedOutput.coverLetter}</p>}
                    {activeTab === 'appText' && <p>{parsedOutput.applicationText}</p>}
                    {activeTab === 'linkedin' && (
                        <div className="space-y-4">
                            <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800"><p className="font-semibold text-xs mb-2 text-indigo-500 uppercase tracking-widest">To Recruiter</p>{parsedOutput.linkedinMessages.recruiter}</div>
                            <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800"><p className="font-semibold text-xs mb-2 text-indigo-500 uppercase tracking-widest">To Hiring Mgr</p>{parsedOutput.linkedinMessages.hiring_manager}</div>
                            <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800"><p className="font-semibold text-xs mb-2 text-indigo-500 uppercase tracking-widest">For Referral</p>{parsedOutput.linkedinMessages.referral}</div>
                        </div>
                    )}
                    {activeTab === 'missing' && (
                        <ul className="list-disc pl-5 space-y-2 text-red-500 dark:text-red-400">
                            {parsedOutput.missingRequirements?.map((r: string, i: number) => <li key={i}>{r}</li>)}
                        </ul>
                    )}
                </motion.div>
            </div>

            <div className="mt-6 flex flex-wrap gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 justify-end">
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
                    <Copy className="w-4 h-4" /> Copy Text
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
                    <LinkIcon className="w-4 h-4" /> Share Link
                </button>
                <button className="btn-primary rounded-xl">
                    <Download className="w-4 h-4 mr-2" /> PDF Export
                </button>
            </div>
        </div>
    );
}
