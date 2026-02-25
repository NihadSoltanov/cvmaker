"use client";

import { useState } from "react";
import { ResumeEditor } from "@/components/ResumeEditor";
import { FileText } from "lucide-react";

export default function ResumePage() {
    const [resume, setResume] = useState(null); // Simulated state

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col space-y-8 relative z-10 w-full mb-20">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center shadow-inner">
                    <FileText className="w-7 h-7" />
                </div>
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-neutral-900 dark:text-white">Master Profile</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 font-medium">This serves as the sole source of truth for all your AI optimizations.</p>
                </div>
            </div>

            <div className="flex-1 min-h-[600px] w-full bg-white/40 dark:bg-black/40 backdrop-blur-2xl border border-neutral-200 dark:border-neutral-800 rounded-[2rem] shadow-2xl shadow-indigo-500/5 overflow-hidden">
                <ResumeEditor resume={resume} setResume={setResume} />
            </div>
        </div>
    );
}
