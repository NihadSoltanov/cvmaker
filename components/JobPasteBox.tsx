import React from 'react';

export function JobPasteBox({ value, onChange }: { value: string, onChange: (val: string) => void }) {
    return (
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500 group-hover:w-2 transition-all duration-300" />
            <h3 className="text-xl font-semibold mb-2">Target Job Description</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">Paste the job description matching your application.</p>

            <textarea
                className="w-full h-48 input-styled resize-none bg-white/50 dark:bg-black/20 backdrop-blur-md rounded-xl p-4 text-sm font-medium leading-relaxed"
                placeholder="e.g. We are looking for a Senior Software Engineer with Next.js and Tailwind experience..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}
