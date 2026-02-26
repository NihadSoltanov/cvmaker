"use client";

import { useState, useRef, useCallback } from "react";
import { ScanSearch, Upload, FileText, X, Zap, CheckCircle, AlertTriangle, XCircle, ArrowRight, Lock, BarChart3, Target, Lightbulb, TrendingUp } from "lucide-react";
import Link from "next/link";
import { GuideButton } from "@/components/GuideButton";
import { useIsPaid } from "@/lib/useIsPaid";

const FREE_DAILY_LIMIT = 3;

interface AtsCheckResult {
    ats_score: number;
    ats_score_explanation: string;
    job_fit_level: "high" | "medium" | "low";
    job_fit_explanation: string;
    keywords_found: string[];
    keywords_missing: string[];
    section_scores: {
        skills_match: number;
        experience_relevance: number;
        education_fit: number;
        formatting_quality: number;
    };
    critical_issues: string[];
    quick_wins: string[];
    missing_requirements: string[];
    suggestions: {
        skills_to_add: string[];
        courses: string[];
        rewrite_tip: string;
    };
    overall_recommendation: "apply_now" | "apply_with_tweaks" | "build_skills_first" | "not_recommended";
    recommendation_reason: string;
}

function ScoreCircle({ score, size = "lg" }: { score: number; size?: "sm" | "lg" }) {
    const pct = Math.min(100, Math.max(0, score));
    const color = pct >= 80 ? "#16a34a" : pct >= 60 ? "#d97706" : pct >= 40 ? "#ea580c" : "#dc2626";
    const dim = size === "lg" ? 120 : 64;
    const r = size === "lg" ? 48 : 25;
    const sw = size === "lg" ? 6 : 4;
    const fs = size === "lg" ? "text-3xl" : "text-base";
    const circ = 2 * Math.PI * r;
    const filled = (pct / 100) * circ;

    return (
        <div className="relative flex-shrink-0" style={{ width: dim, height: dim }}>
            <svg className="-rotate-90" width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
                <circle cx={dim / 2} cy={dim / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={sw} />
                <circle cx={dim / 2} cy={dim / 2} r={r} fill="none"
                    stroke={color} strokeWidth={sw + 1}
                    strokeDasharray={`${filled} ${circ}`}
                    strokeLinecap="round" />
            </svg>
            <span className={`absolute inset-0 flex items-center justify-center font-black ${fs}`} style={{ color }}>{pct}</span>
        </div>
    );
}

function SectionBar({ label, value }: { label: string; value: number }) {
    const color = value >= 80 ? "bg-green-500" : value >= 60 ? "bg-amber-500" : value >= 40 ? "bg-orange-500" : "bg-red-500";
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{label}</span>
                <span className="text-sm font-black text-neutral-900 dark:text-white">{value}%</span>
            </div>
            <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${value}%` }} />
            </div>
        </div>
    );
}

const RecommendationConfig = {
    apply_now: {
        icon: "🚀",
        label: "Apply Now",
        className: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300",
    },
    apply_with_tweaks: {
        icon: "✏️",
        label: "Apply After Tweaks",
        className: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300",
    },
    build_skills_first: {
        icon: "📚",
        label: "Build Skills First",
        className: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-300",
    },
    not_recommended: {
        icon: "⛔",
        label: "Not Recommended",
        className: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300",
    },
};

function AtsResults({ result }: { result: AtsCheckResult }) {
    const fitColor = result.job_fit_level === "high" ? "text-green-600 dark:text-green-400" : result.job_fit_level === "medium" ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400";
    const rec = RecommendationConfig[result.overall_recommendation] || RecommendationConfig.apply_with_tweaks;

    return (
        <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            {/* Top row: Score + Recommendation */}
            <div className="grid sm:grid-cols-2 gap-5">
                {/* ATS Score */}
                <div className="bg-white/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 flex items-center gap-5 shadow-lg">
                    <ScoreCircle score={result.ats_score} size="lg" />
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-1">ATS Score</p>
                        <p className="text-xl font-black text-neutral-900 dark:text-white">{result.ats_score}/100</p>
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">{result.ats_score_explanation}</p>
                    </div>
                </div>

                {/* Job Fit + Recommendation */}
                <div className="bg-white/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-lg space-y-4">
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-1">Job Fit Level</p>
                        <p className={`text-xl font-black capitalize ${fitColor}`}>{result.job_fit_level} Match</p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">{result.job_fit_explanation}</p>
                    </div>
                    <div className={`p-3 rounded-xl border text-sm font-semibold flex items-center gap-2 ${rec.className}`}>
                        <span className="text-base">{rec.icon}</span>
                        <div>
                            <p className="font-black">{rec.label}</p>
                            <p className="font-medium opacity-80 text-xs mt-0.5">{result.recommendation_reason}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section scores */}
            <div className="bg-white/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-lg">
                <p className="text-sm font-black uppercase tracking-widest text-neutral-500 mb-5 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" /> Section Breakdown
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                    <SectionBar label="Skills Match" value={result.section_scores?.skills_match ?? 0} />
                    <SectionBar label="Experience Relevance" value={result.section_scores?.experience_relevance ?? 0} />
                    <SectionBar label="Education Fit" value={result.section_scores?.education_fit ?? 0} />
                    <SectionBar label="Formatting Quality" value={result.section_scores?.formatting_quality ?? 0} />
                </div>
            </div>

            {/* Keywords */}
            <div className="grid sm:grid-cols-2 gap-5">
                {result.keywords_found?.length > 0 && (
                    <div className="bg-white/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-lg">
                        <p className="text-sm font-black uppercase tracking-widest text-green-600 dark:text-green-400 mb-4 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> Found Keywords ({result.keywords_found.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {result.keywords_found.map((kw, i) => (
                                <span key={i} className="px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs font-semibold rounded-full border border-green-200 dark:border-green-800">
                                    {kw}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {result.keywords_missing?.length > 0 && (
                    <div className="bg-white/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-lg">
                        <p className="text-sm font-black uppercase tracking-widest text-red-500 mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> Missing Keywords ({result.keywords_missing.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {result.keywords_missing.map((kw, i) => (
                                <span key={i} className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 text-xs font-semibold rounded-full border border-red-200 dark:border-red-800">
                                    {kw}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Critical issues + Quick wins */}
            <div className="grid sm:grid-cols-2 gap-5">
                {result.critical_issues?.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/40 rounded-3xl p-6 shadow-lg">
                        <p className="text-sm font-black uppercase tracking-widest text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                            <XCircle className="w-4 h-4" /> Critical Issues
                        </p>
                        <ul className="space-y-3">
                            {result.critical_issues.map((issue, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-sm text-red-800 dark:text-red-300">
                                    <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>
                                    {issue}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {result.quick_wins?.length > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/40 rounded-3xl p-6 shadow-lg">
                        <p className="text-sm font-black uppercase tracking-widest text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                            <Zap className="w-4 h-4" /> Quick Wins
                        </p>
                        <ul className="space-y-3">
                            {result.quick_wins.map((win, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-sm text-green-800 dark:text-green-300">
                                    <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                                    {win}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Missing requirements */}
            {result.missing_requirements?.length > 0 && (
                <div className="bg-white/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-lg">
                    <p className="text-sm font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 mb-4 flex items-center gap-2">
                        <Target className="w-4 h-4" /> Experience Gaps
                    </p>
                    <div className="space-y-3">
                        {result.missing_requirements.map((req, i) => {
                            const searchQ = encodeURIComponent(req.slice(0, 80));
                            return (
                                <div key={i} className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-800/30">
                                    <p className="text-sm text-neutral-800 dark:text-neutral-200 mb-2">{req}</p>
                                    <div className="flex gap-2 flex-wrap">
                                        <a href={`https://www.udemy.com/courses/search/?q=${searchQ}`} target="_blank" rel="noopener noreferrer"
                                            className="text-xs font-bold px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full hover:bg-purple-200 transition">
                                            🎓 Udemy
                                        </a>
                                        <a href={`https://www.coursera.org/search?query=${searchQ}`} target="_blank" rel="noopener noreferrer"
                                            className="text-xs font-bold px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 transition">
                                            📘 Coursera
                                        </a>
                                        <a href={`https://www.youtube.com/results?search_query=${searchQ}+tutorial`} target="_blank" rel="noopener noreferrer"
                                            className="text-xs font-bold px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-full hover:bg-red-200 transition">
                                            ▶ YouTube
                                        </a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Suggestions */}
            {result.suggestions && (
                <div className="grid sm:grid-cols-2 gap-5">
                    {result.suggestions.skills_to_add?.length > 0 && (
                        <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800/40 rounded-3xl p-6 shadow-lg">
                            <p className="text-sm font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-400 mb-3 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" /> Skills to Add
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {result.suggestions.skills_to_add.map((sk, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 text-xs font-semibold rounded-full">
                                        {sk}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {result.suggestions.courses?.length > 0 && (
                        <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800/40 rounded-3xl p-6 shadow-lg">
                            <p className="text-sm font-black uppercase tracking-widest text-purple-700 dark:text-purple-400 mb-3 flex items-center gap-2">
                                <Lightbulb className="w-4 h-4" /> Recommended Courses
                            </p>
                            <ul className="space-y-2">
                                {result.suggestions.courses.map((c, i) => (
                                    <li key={i} className="text-sm text-purple-800 dark:text-purple-300 flex items-start gap-2">
                                        <span className="mt-0.5 flex-shrink-0">•</span>{c}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {result.suggestions.rewrite_tip && (
                        <div className="sm:col-span-2 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 border border-indigo-200 dark:border-indigo-700/40 rounded-3xl p-6 shadow-lg flex gap-4">
                            <span className="text-2xl flex-shrink-0">✍️</span>
                            <div>
                                <p className="text-sm font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">Rewrite Tip</p>
                                <p className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed">{result.suggestions.rewrite_tip}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* CTA to full optimize */}
            <div className="p-6 rounded-3xl border border-indigo-200 dark:border-indigo-800/50 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 flex items-center justify-between gap-4 flex-wrap shadow-lg">
                <div>
                    <p className="font-black text-neutral-900 dark:text-white text-lg">Ready to fix these gaps?</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Go to Optimize to generate a fully-tailored CV, cover letter, and LinkedIn messages for this role.</p>
                </div>
                <Link href="/optimize"
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-500/25 whitespace-nowrap">
                    Full Optimize <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}

export default function AtsCheckPage() {
    const { isPaid, loading: isPaidLoading } = useIsPaid();
    const [cvText, setCvText] = useState("");
    const [jdText, setJdText] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AtsCheckResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [scanCount, setScanCount] = useState(() => {
        if (typeof window === "undefined") return 0;
        try {
            const stored = localStorage.getItem("ats_scan_count");
            if (stored) {
                const p = JSON.parse(stored);
                const today = new Date().toISOString().slice(0, 10);
                if (p.date === today) return p.count;
            }
        } catch { /* ignore */ }
        return 0;
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const reachedLimit = !isPaidLoading && !isPaid && scanCount >= FREE_DAILY_LIMIT;

    const handleFileDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const f = e.dataTransfer.files[0];
        if (f && f.type === "application/pdf") setFile(f);
    }, []);

    const handleAnalyze = async () => {
        if (!jdText.trim()) { setError("Please paste the job description."); return; }
        if (!cvText.trim() && !file) { setError("Please paste your CV text or upload a PDF file."); return; }
        if (reachedLimit) return;

        setIsAnalyzing(true);
        setError(null);
        setResult(null);

        // Track usage for free users
        if (!isPaid) {
            const today = new Date().toISOString().slice(0, 10);
            const newCount = scanCount + 1;
            setScanCount(newCount);
            localStorage.setItem("ats_scan_count", JSON.stringify({ date: today, count: newCount }));
        }

        try {
            let response: Response;

            if (file) {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("cvText", cvText);
                formData.append("jdText", jdText);
                response = await fetch("/api/ai/ats-check", { method: "POST", body: formData });
            } else {
                response = await fetch("/api/ai/ats-check", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ cvText, jdText }),
                });
            }

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "ATS analysis failed");
            setResult(data as AtsCheckResult);
        } catch (e: any) {
            setError(e.message || "Something went wrong. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="space-y-8 relative z-10 pb-20">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center shadow-inner">
                        <ScanSearch className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
                            ATS Scanner
                            <span className="text-xs font-bold bg-gradient-to-r from-indigo-500 to-violet-500 text-white px-2 py-0.5 rounded-full">AI</span>
                        </h1>
                        <p className="text-neutral-500 dark:text-neutral-400 font-medium text-sm">
                            Upload any CV and a job description — get an instant ATS compatibility score with actionable gaps.
                            {!isPaid && !isPaidLoading && (
                                <span className="ml-2 text-amber-600 dark:text-amber-400 font-bold">{FREE_DAILY_LIMIT - scanCount} free scans left today.</span>
                            )}
                        </p>
                    </div>
                </div>
                <GuideButton guide={{
                    title: "How to use ATS Scanner",
                    steps: [
                        "Upload your CV as a PDF or paste the plain text below.",
                        "Paste the job description you are targeting.",
                        "Click 'Run ATS Analysis' — takes 15–30 seconds.",
                        "Review your score, missing keywords, critical issues, and quick fixes.",
                        "Use the 'Full Optimize' button to generate a tailored CV for this specific role.",
                    ],
                    tips: [
                        "ATS score measures keyword + experience alignment — not your actual quality as a candidate.",
                        "Score below 60 means most ATS filters would not forward your CV automatically.",
                        "PDF upload works best for text-layer PDFs (Word-to-PDF, Google Docs export, etc.).",
                        `Free plan: ${FREE_DAILY_LIMIT} scans/day. Pro: unlimited.`,
                    ]
                }} />
            </div>

            {reachedLimit ? (
                <div className="p-8 rounded-3xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 flex flex-col items-center text-center gap-4">
                    <Lock className="w-10 h-10 text-amber-500" />
                    <div>
                        <p className="text-xl font-black text-neutral-900 dark:text-white">Daily limit reached</p>
                        <p className="text-neutral-500 dark:text-neutral-400 mt-1">Free plan allows {FREE_DAILY_LIMIT} ATS scans per day. Upgrade to Pro for unlimited scans.</p>
                    </div>
                    <Link href="/settings" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition">
                        Upgrade to Pro
                    </Link>
                </div>
            ) : (
                <>
                    {/* Input section */}
                    <div className="grid lg:grid-cols-2 gap-5">
                        {/* CV Input */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-black uppercase tracking-widest text-neutral-500">Your CV</label>
                                {file && (
                                    <button onClick={() => setFile(null)} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-semibold">
                                        <X className="w-4 h-4" /> Remove file
                                    </button>
                                )}
                            </div>

                            {/* File upload zone */}
                            <div
                                onDragOver={e => e.preventDefault()}
                                onDrop={handleFileDrop}
                                onClick={() => !file && fileInputRef.current?.click()}
                                className={`relative border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${file ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20" : "border-neutral-300 dark:border-neutral-700 hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10"}`}
                            >
                                <input ref={fileInputRef} type="file" accept=".pdf" className="hidden"
                                    onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f); }} />
                                {file ? (
                                    <div className="flex items-center gap-3 justify-center text-indigo-700 dark:text-indigo-300">
                                        <FileText className="w-8 h-8" />
                                        <div className="text-left">
                                            <p className="font-bold text-sm">{file.name}</p>
                                            <p className="text-xs opacity-70">{(file.size / 1024).toFixed(0)} KB • Will extract text automatically</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-4">
                                        <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                                        <p className="text-sm font-bold text-neutral-600 dark:text-neutral-400">Drop your CV PDF here or click to upload</p>
                                        <p className="text-xs text-neutral-400 mt-1">Supports text-layer PDFs (Word→PDF, Google Docs)</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
                                <span className="text-xs font-bold text-neutral-400">OR PASTE TEXT</span>
                                <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
                            </div>

                            <textarea
                                value={cvText}
                                onChange={e => setCvText(e.target.value)}
                                placeholder="Paste your CV/resume text here... (name, experience, skills, education)"
                                rows={10}
                                className="w-full bg-white/60 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-4 py-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-indigo-400 transition resize-none font-mono placeholder:font-sans placeholder:text-neutral-400"
                            />
                        </div>

                        {/* JD Input */}
                        <div className="space-y-3">
                            <label className="text-sm font-black uppercase tracking-widest text-neutral-500 block">Job Description</label>
                            <textarea
                                value={jdText}
                                onChange={e => setJdText(e.target.value)}
                                placeholder="Paste the full job description here — including requirements, responsibilities, and qualifications..."
                                rows={21}
                                className="w-full bg-white/60 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-4 py-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-indigo-400 transition resize-none placeholder:text-neutral-400"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-2xl text-sm text-red-800 dark:text-red-300">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Smart nudge: file uploaded but JD empty */}
                    {(file || cvText.trim()) && !jdText.trim() && !isAnalyzing && (
                        <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-2xl text-sm text-amber-800 dark:text-amber-300 animate-pulse">
                            <span className="text-xl">👉</span>
                            <span className="font-semibold">Almost there — paste the <strong>job description</strong> on the right to enable analysis.</span>
                        </div>
                    )}

                    {/* Analyze button */}
                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || (!cvText.trim() && !file) || !jdText.trim()}
                        className={`w-full py-4 font-black text-lg rounded-2xl transition shadow-xl flex items-center justify-center gap-3 ${
                            isAnalyzing
                                ? "bg-indigo-500 text-white cursor-wait shadow-indigo-500/25"
                                : (!cvText.trim() && !file) || !jdText.trim()
                                ? "bg-neutral-300 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500 cursor-not-allowed shadow-none"
                                : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white shadow-indigo-500/25 cursor-pointer"
                        }`}
                    >
                        {isAnalyzing ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Analyzing with AI…
                            </>
                        ) : (!cvText.trim() && !file) ? (
                            <>
                                <ScanSearch className="w-5 h-5" />
                                Upload a CV or paste text to start
                            </>
                        ) : !jdText.trim() ? (
                            <>
                                <ScanSearch className="w-5 h-5" />
                                Paste a job description to start
                            </>
                        ) : (
                            <>
                                <ScanSearch className="w-5 h-5" />
                                Run ATS Analysis
                            </>
                        )}
                    </button>
                </>
            )}

            {/* Results */}
            {result && <AtsResults result={result} />}
        </div>
    );
}
