"use client";

import { useState, useEffect } from "react";
import { JobPasteBox } from "@/components/JobPasteBox";
import { ResultsTabs } from "@/components/ResultsTabs";
import { CvTemplateRenderer, type CvData } from "@/components/CvTemplates";
import { Zap, FileText, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { GuideButton } from "@/components/GuideButton";

export default function OptimizePage() {
    const [jdText, setJdText] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [resumeData, setResumeData] = useState<any>(null);
    const [resumeId, setResumeId] = useState<string | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState("classic");
    // Which right-pane tab: "documents" (cover letter etc.) vs "cv" (tailored CV preview)
    const [rightTab, setRightTab] = useState<"documents" | "cv">("documents");

    useEffect(() => {
        const fetchResume = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from("resumes").select("id, resume_json, template_id")
                    .eq("user_id", user.id).single();
                if (data) {
                    setResumeData(data.resume_json);
                    setResumeId(data.id);
                    if (data.template_id) setSelectedTemplate(data.template_id);
                }
            }
        };
        fetchResume();
    }, []);

    const handleOptimize = async () => {
        if (!resumeData) { alert("Please save a Master CV first in the 'My CV' page."); return; }
        if (!jdText.trim()) { alert("Please paste a job description first."); return; }
        setIsGenerating(true);
        setResults(null);

        try {
            const res = await fetch("/api/ai/optimize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resumeJson: resumeData, jdText, language: "en", tone: "professional" }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Generation failed");

            // Save to history
            const { data: { user } } = await supabase.auth.getUser();
            if (user && resumeId) {
                await supabase.from("tailored_outputs").insert([{
                    user_id: user.id,
                    resume_id: resumeId,
                    output_language: "en",
                    tone: "professional",
                    tailored_resume_json: data.tailored_resume_json || {},
                    cover_letter: data.cover_letter || "",
                    motivation_letter: data.motivation_letter || "",
                    application_text: data.application_text || "",
                    linkedin_messages: data.linkedin_messages || {},
                    ats_score: data.ats_score,
                    ats_keywords_used: data.ats_keywords_used || [],
                    missing_requirements: data.missing_requirements || [],
                    suggestions: data.suggestions || {},
                }]);
            }

            setResults(data);
            setRightTab("documents");
        } catch (error: any) {
            console.error("Optimize error:", error);
            alert("Error: " + (error.message || "Please try again."));
        } finally {
            setIsGenerating(false);
        }
    };

    // Build CvData from tailored_resume_json for live preview
    const tailoredCvData: CvData | null = results?.tailored_resume_json ? (() => {
        const tr = results.tailored_resume_json;
        const base = resumeData || {};
        return {
            basicInfo: tr.header || tr.basicInfo || base.basicInfo || { fullName: "", email: "", phone: "", location: "", linkedin: "", portfolio: "" },
            summary: tr.summary || base.summary || "",
            experience: tr.experience?.length ? tr.experience : (base.experience || []),
            education: tr.education?.length ? tr.education : (base.education || []),
            projects: tr.projects?.length ? tr.projects : (base.projects || []),
            skills: tr.skills?.length ? tr.skills : (Array.isArray(base.skills) ? base.skills : (base.skills || "").split(",").map((s: string) => s.trim()).filter(Boolean)),
            languages: tr.languages?.length ? tr.languages : (Array.isArray(base.languages) ? base.languages : (base.languages || "").split(",").map((s: string) => s.trim()).filter(Boolean)),
            photo: base.photo || null,
        };
    })() : null;

    return (
        <div className="space-y-6 relative z-10 pb-20">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center shadow-inner">
                        <Zap className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-neutral-900 dark:text-white">Tailor Application</h1>
                        <p className="text-neutral-500 dark:text-neutral-400 font-medium">AI optimizes your CV, then generates a cover letter, motivation letter, email, and LinkedIn messages.</p>
                    </div>
                </div>
                <GuideButton guide={{
                    title: "How to Optimize",
                    steps: [
                        "Save your Master CV in 'My CV' first.",
                        "Paste the full job description below.",
                        "Click 'Optimize Now' — AI tailors everything.",
                        "Review documents on the right. Switch to 'CV Preview' to see the tailored CV.",
                    ],
                    tips: [
                        "The more detailed your CV, the better the output.",
                        "Include the full JD including requirements — not just the summary.",
                        "Results are automatically saved to History.",
                    ]
                }} />
            </div>

            {/* Main grid: JD input left | results right */}
            <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6 items-start">

                {/* LEFT: JD paste + optimize button */}
                <div className="space-y-4">
                    <JobPasteBox value={jdText} onChange={setJdText} />
                    <button
                        onClick={handleOptimize}
                        disabled={isGenerating || !jdText.trim()}
                        className="w-full h-14 text-lg rounded-2xl shadow-xl shadow-purple-500/20 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3"
                    >
                        {isGenerating ? (
                            <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Kimi K2 Thinking… (this may take 30–60s)
                            </>
                        ) : "🚀 Optimize with AI"}
                    </button>

                    {/* Master CV info card */}
                    <div className="p-4 bg-white/50 dark:bg-black/30 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
                        <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Master CV loaded</p>
                        {resumeData ? (
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                                        {resumeData.name || resumeData.basicInfo?.fullName || "Your CV"}
                                    </p>
                                    <p className="text-xs text-neutral-500">
                                        {Array.isArray(resumeData.experience) ? resumeData.experience.length : 0} jobs · {Array.isArray(resumeData.education) ? resumeData.education.length : 0} education entries
                                    </p>
                                </div>
                                <span className="ml-auto text-[10px] font-bold bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">Ready</span>
                            </div>
                        ) : (
                            <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                                ⚠️ No CV saved yet — <a href="/cv" className="underline font-bold">go to My CV</a> first.
                            </p>
                        )}
                    </div>
                </div>

                {/* RIGHT: Results pane */}
                <div>
                    {results ? (
                        <div className="space-y-4">
                            {/* Tab switcher: Documents vs CV Preview */}
                            <div className="flex bg-neutral-100 dark:bg-neutral-900 rounded-2xl p-1 gap-1">
                                <button onClick={() => setRightTab("documents")}
                                    className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${rightTab === "documents" ? "bg-white dark:bg-neutral-800 shadow text-neutral-900 dark:text-white" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"}`}>
                                    📄 Documents & Analysis
                                </button>
                                <button onClick={() => setRightTab("cv")}
                                    className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${rightTab === "cv" ? "bg-white dark:bg-neutral-800 shadow text-neutral-900 dark:text-white" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"}`}>
                                    👤 Tailored CV Preview
                                </button>
                            </div>

                            {rightTab === "documents" ? (
                                <ResultsTabs parsedOutput={results} />
                            ) : (
                                /* Live tailored CV preview */
                                <div className="bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden">
                                    <div className="px-5 py-3 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-400" />
                                        <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">AI-Tailored CV</span>
                                        <span className="ml-2 text-[10px] bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold">Optimized for this JD</span>
                                    </div>
                                    <div className="p-3 bg-neutral-100 dark:bg-neutral-950 overflow-auto max-h-[700px]">
                                        {tailoredCvData && (
                                            <div style={{ zoom: 0.65 }} className="bg-white shadow-xl rounded">
                                                <CvTemplateRenderer templateId={selectedTemplate} data={tailoredCvData} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="px-5 py-3 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-400 text-center">
                                        Summary and bullet points have been rewritten by AI to match the job description
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Empty state */
                        <div className="h-full bg-white/40 dark:bg-black/40 backdrop-blur-2xl rounded-[2rem] p-8 flex flex-col items-center justify-center text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 min-h-[520px]">
                            <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800/50 rounded-full flex items-center justify-center mb-6 border border-neutral-200 dark:border-neutral-700/50">
                                <Zap className="w-9 h-9 text-neutral-400" />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-700 dark:text-neutral-300">Ready to Optimize</h3>
                            <p className="text-neutral-500 max-w-sm mt-3 leading-relaxed text-sm">
                                Paste a job description on the left and click Optimize. AI will generate a tailored cover letter, motivation letter, email, LinkedIn messages, and a rewritten CV — all in one shot.
                            </p>
                            <div className="mt-6 flex flex-wrap justify-center gap-2">
                                {["Cover Letter", "Motivation Letter", "Email", "LinkedIn Msgs", "CV Rewrite", "ATS Score"].map(tag => (
                                    <span key={tag} className="text-xs font-bold bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-700/50">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
