"use client";

import { FileText, ArrowRight, Clock, X, ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { GuideButton } from "@/components/GuideButton";
import { ResultsTabs } from "@/components/ResultsTabs";
import { CvTemplateRenderer, type CvData } from "@/components/CvTemplates";

export default function HistoryPage() {
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedResult, setSelectedResult] = useState<any | null>(null);
    const [isLoadingResult, setIsLoadingResult] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from("tailored_outputs")
                    .select("id, created_at, output_language, cover_letter, motivation_letter, application_text, linkedin_messages, ats_score, ats_keywords_used, missing_requirements, suggestions, tailored_resume_json, job_posts(job_title, company)")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false });


                if (data) {
                    setHistory(data.map(item => ({
                        id: item.id,
                        title: (item.job_posts as any)?.job_title && (item.job_posts as any)?.company
                            ? `${(item.job_posts as any).job_title} at ${(item.job_posts as any).company}`
                            : "Optimized Profile",
                        date: new Date(item.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
                        lang: item.output_language === "en" ? "English" : item.output_language === "tr" ? "Turkish" : item.output_language === "az" ? "Azerbaijani" : item.output_language || "English",
                        // Full result data for ResultsTabs
                        result: {
                            cover_letter: item.cover_letter || "",
                            motivation_letter: (item as any).motivation_letter || "",
                            application_text: item.application_text || "",
                            linkedin_messages: item.linkedin_messages || {},
                            ats_score: (item as any).ats_score,

                            ats_keywords_used: item.ats_keywords_used || [],
                            missing_requirements: item.missing_requirements || [],
                            suggestions: item.suggestions || {},
                            tailored_resume_json: item.tailored_resume_json || {},
                        }
                    })));
                }
            }
            setIsLoading(false);
        };
        fetchHistory();
    }, []);

    const handleViewResult = (item: any) => {
        setSelectedResult(item);
    };

    if (selectedResult) {
        // Build CvData from tailored_resume_json for preview
        const tr = selectedResult.result.tailored_resume_json || {};
        const cvData: CvData = {
            basicInfo: tr.header || tr.basicInfo || { fullName: selectedResult.title, email: "", phone: "", location: "", linkedin: "", portfolio: "" },
            summary: tr.summary || "",
            experience: tr.experience || [],
            education: tr.education || [],
            projects: tr.projects || [],
            skills: tr.skills || [],
            languages: tr.languages || [],
        };

        return (
            <div className="space-y-6 relative z-10 pb-20">
                {/* Back button */}
                <button onClick={() => setSelectedResult(null)}
                    className="flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition">
                    <ChevronLeft className="w-4 h-4" /> Back to History
                </button>

                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-black text-neutral-900 dark:text-white">{selectedResult.title}</h1>
                        <p className="text-sm text-neutral-500">Optimized on {selectedResult.date} · {selectedResult.lang}</p>
                    </div>
                </div>

                {/* 2-column: ResultsTabs left, optimized CV preview right */}
                <div className="grid lg:grid-cols-2 gap-6 items-start">
                    <ResultsTabs parsedOutput={selectedResult.result} />

                    <div className="sticky top-6">
                        <div className="bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden">
                            <div className="px-5 py-3 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-400" />
                                <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Optimized CV Preview</span>
                            </div>
                            <div className="p-4 bg-neutral-100 dark:bg-neutral-950 overflow-auto max-h-[700px]">
                                <div style={{ zoom: 0.65 }} className="bg-white shadow-xl rounded">
                                    <CvTemplateRenderer templateId="classic" data={cvData} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 relative z-10 w-full mb-20">
            <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center shadow-inner">
                        <Clock className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-neutral-900 dark:text-white">Application History</h1>
                        <p className="text-neutral-500 dark:text-neutral-400 font-medium">Access and review your past AI optimization packages.</p>
                    </div>
                </div>
                <GuideButton guide={{
                    title: "Application History Guide",
                    steps: [
                        "Every time you click 'Optimize Now', the result is saved here automatically.",
                        "Click 'View Result' to review Cover Letter, Motivation Letter, LinkedIn messages, and the optimized CV.",
                        "Results are sorted newest-first.",
                    ],
                    tips: [
                        "Each optimization is linked to the Job Description and your resume at the time.",
                        "Results are kept indefinitely on paid plans.",
                    ]
                }} />
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-center text-neutral-500 py-10">Loading history...</div>
                ) : history.length === 0 ? (
                    <div className="text-center text-neutral-500 py-10">
                        No optimizations yet. Go to the <strong>Optimize</strong> page to create one!
                    </div>
                ) : history.map(item => (
                    <div key={item.id} className="bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 group">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">{item.title}</h3>
                                <p className="text-sm font-medium text-neutral-500">Optimized on <strong className="text-neutral-700 dark:text-neutral-300">{item.date}</strong> · Language: {item.lang}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleViewResult(item)}
                            className="text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white h-10 px-6 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-indigo-600/20 mt-4 sm:mt-0 w-full sm:w-auto justify-center">
                            View Result <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
