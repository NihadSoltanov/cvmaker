import React from 'react';

// Simplified for MVP, real usage uses massive JSON.
export function ResumeEditor({ resume, setResume }: any) {
    return (
        <div className="glass-card rounded-3xl p-6 relative overflow-hidden h-full flex flex-col">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-200 dark:border-neutral-800">
                <h2 className="text-2xl font-bold tracking-tight">CV Blueprint</h2>
                <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-semibold">Editable</span>
            </div>

            <div className="flex-1 overflow-auto space-y-6 lg:pr-4 custom-scrollbar">
                <div className="space-y-3">
                    <label className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">FullName / Summary</label>
                    <input className="input-styled" defaultValue="John Doe" />
                    <textarea className="input-styled h-24" defaultValue="Experienced developer with 5+ years building scalable web apps..." />
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Experience (Raw JSON Outline)</label>
                    <textarea className="input-styled h-32 font-mono text-xs" defaultValue="[ { Company: 'Google', Role: 'SWE', ... } ]" />
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Skills</label>
                    <textarea className="input-styled h-20 font-mono text-xs" defaultValue="React, Next.js, Node.js, Postgres..." />
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button className="w-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl py-3 font-semibold hover:opacity-90 transition">
                    Import New PDF
                </button>
            </div>
        </div>
    );
}
