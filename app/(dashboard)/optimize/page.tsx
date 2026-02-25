"use client";

import { useState, useEffect } from "react";
import { JobPasteBox } from "@/components/JobPasteBox";
import { ResultsTabs } from "@/components/ResultsTabs";
import { Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { GuideButton } from "@/components/GuideButton";

export default function OptimizePage() {
    const [jdText, setJdText] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [results, setResults] = useState<unknown>(null);

    const [resumeData, setResumeData] = useState<any>(null);
    const [resumeId, setResumeId] = useState<string | null>(null);

    useEffect(() => {
        const fetchResume = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from("resumes").select("id, resume_json").eq("user_id", user.id).single();
                if (data) {
                    setResumeData(data.resume_json);
                    setResumeId(data.id);
                }
            }
        };
        fetchResume();
    }, []);

    const handleOptimize = async () => {
        if (!resumeData) {
            alert("Please save a Master CV first in the My CV page.");
            return;
        }
        setIsGenerating(true);

        try {
            const res = await fetch("/api/ai/optimize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resumeJson: resumeData,
                    jdText,
                    language: "en",
                    tone: "professional"
                })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Generation failed");

            // Save to tailored_outputs
            const { data: { user } } = await supabase.auth.getUser();
            if (user && resumeId) {
                await supabase.from("tailored_outputs").insert([{
                    user_id: user.id,
                    resume_id: resumeId,
                    output_language: "en",
                    tone: "professional",
                    tailored_resume_json: data.tailored_resume_json || {},
                    cover_letter: data.cover_letter || "",
                    application_text: data.application_text || "",
                    linkedin_messages: data.linkedin_messages || {},
                    ats_keywords_used: data.ats_keywords_used || [],
                    missing_requirements: data.missing_requirements || [],
                    suggestions: data.suggestions || {}
                }]);
            }

            setResults(data);
        } catch (error: any) {
            console.error("Optimize error:", error);
            alert("Error during optimization: " + (error.message || "Please try again."));
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-8 relative z-10 pb-20">
            <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center shadow-inner">
                        <Zap className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-neutral-900 dark:text-white">Tailor Application</h1>
                        <p className="text-neutral-500 dark:text-neutral-400 font-medium">We'll use your Master CV and the Job Description to create a perfect match.</p>
                    </div>
                </div>
                <GuideButton guide={{
                    title: "How to Optimize Your Application",
                    steps: [
                        "First, make sure you've saved your Master CV in the 'My CV' page. The AI uses this as the base.",
                        "Find a job posting you want to apply to and copy everything: job title, company, requirements, responsibilities.",
                        "Paste the full job description in the left text box.",
                        "Click 'Optimize Now' and wait — the AI generates a tailored Cover Letter, LinkedIn messages, and more.",
                        "Review the results in the tabs on the right: Cover Letter, LinkedIn Messages, Application Text, Missing Requirements.",
                    ],
                    tips: [
                        "The more detailed your Master CV, the better the AI output.",
                        "Always copy the full JD including qualification requirements, not just the summary.",
                        "Results are saved to your History page automatically."
                    ]
                }} />
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <JobPasteBox value={jdText} onChange={setJdText} />

                    <button
                        onClick={handleOptimize}
                        disabled={isGenerating || !jdText}
                        className="w-full h-16 text-lg rounded-2xl shadow-2xl shadow-purple-500/20 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center"
                    >
                        {isGenerating ? (
                            <span className="flex items-center gap-3">
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Generating...
                            </span>
                        ) : "🚀 Optimize Now"}
                    </button>
                </div>

                <div>
                    {results ? (
                        <ResultsTabs parsedOutput={results} />
                    ) : (
                        <div className="h-full bg-white/40 dark:bg-black/40 backdrop-blur-2xl rounded-[2rem] p-8 flex flex-col items-center justify-center text-center border-dashed border-2 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/20 text-neutral-500 min-h-[500px]">
                            <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800/50 rounded-full flex items-center justify-center mb-6 border border-neutral-200 dark:border-neutral-700/50">
                                <svg className="w-10 h-10 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-neutral-700 dark:text-neutral-300">Awaiting Input</h3>
                            <p className="text-neutral-500 max-w-sm mt-3 leading-relaxed">Paste a job description on the left and click Optimize. We'll generate a custom Cover Letter, LinkedIn messages, and a tailored resume.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
