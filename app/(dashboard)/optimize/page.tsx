"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { JobPasteBox } from "@/components/JobPasteBox";
import { ResultsTabs } from "@/components/ResultsTabs";
import { CvTemplateRenderer, type CvData } from "@/components/CvTemplates";
import { PdfDownloadButton } from "@/components/PdfGenerator";
import { Zap, FileText, RefreshCw, Upload, X, Edit2, Code2 } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { GuideButton } from "@/components/GuideButton";
import { useIsPaid } from "@/lib/useIsPaid";

const FREE_OPTIMIZE_LIMIT = 1; // per day

export default function OptimizePage() {
    const router = useRouter();
    const [jdText, setJdText] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [resumeData, setResumeData] = useState<any>(null);
    const [resumeId, setResumeId] = useState<string | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState("classic");
    const [rightTab, setRightTab] = useState<"documents" | "cv">("documents");
    const [cvVersionTab, setCvVersionTab] = useState<"real" | "demo">("real");
    const [isSavingCv, setIsSavingCv] = useState(false);

    // PDF upload state
    const [cvSource, setCvSource] = useState<"saved" | "upload">("saved");
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchResume = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { console.warn("fetchResume: no user"); return; }

            const { data, error } = await supabase
                .from("resumes")
                .select("id, resume_json")   // template_id column doesn't exist in schema
                .eq("user_id", user.id)
                .maybeSingle();

            if (error) { console.error("fetchResume error:", error); return; }
            if (data?.resume_json) {
                setResumeData(data.resume_json);
                setResumeId(data.id);
                // Read template preference from resume_json if saved there
                if (data.resume_json?.template_id) setSelectedTemplate(data.resume_json.template_id);
            } else {
                console.log("fetchResume: no resume row found");
                setResumeData(null);
            }
        } catch (e) {
            console.error("fetchResume threw:", e);
        }
    };

    const { isPaid } = useIsPaid();
    const [optimizeCount, setOptimizeCount] = useState(0);

    useEffect(() => { fetchResume(); }, []);

    // Load daily optimize count
    useEffect(() => {
        const today = new Date().toISOString().slice(0, 10);
        try {
            const stored = localStorage.getItem("optimize_count");
            if (stored) {
                const p = JSON.parse(stored);
                if (p.date === today) setOptimizeCount(p.count);
            }
        } catch { /* ignore */ }
    }, []);

    const reachedOptimizeLimit = !isPaid && optimizeCount >= FREE_OPTIMIZE_LIMIT;
    const handleDownloadJson = () => {
        if (!results) return;
        const jsonStr = JSON.stringify(results, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `AI_Output_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
    const handleEditCv = async (cvData: CvData) => {
        setIsSavingCv(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert("Please log in to edit your CV.");
                return;
            }

            // Convert CvData back to resume format
            const resumeJson = {
                basicInfo: cvData.basicInfo,
                summary: cvData.summary,
                experience: cvData.experience,
                education: cvData.education,
                projects: cvData.projects,
                skills: cvData.skills,
                languages: cvData.languages,
                photo: cvData.photo,
                template_id: selectedTemplate,
            };

            // Check if resume exists
            const { data: existing, error: fetchErr } = await supabase
                .from("resumes")
                .select("id")
                .eq("user_id", user.id)
                .maybeSingle();

            if (fetchErr) {
                console.error("Fetch error:", fetchErr);
                alert("Failed to save CV. Please try again.");
                return;
            }

            // Update or insert
            if (existing) {
                const { error } = await supabase
                    .from("resumes")
                    .update({ resume_json: resumeJson })
                    .eq("id", existing.id);
                if (error) {
                    console.error("Update error:", error);
                    alert("Failed to save CV. Please try again.");
                    return;
                }
            } else {
                const { error } = await supabase
                    .from("resumes")
                    .insert([{ user_id: user.id, title: "Main CV", resume_json: resumeJson }]);
                if (error) {
                    console.error("Insert error:", error);
                    alert("Failed to save CV. Please try again.");
                    return;
                }
            }

            // Redirect to resume editor
            router.push("/resume");
        } catch (e: any) {
            console.error("handleEditCv error:", e);
            alert("An error occurred. Please try again.");
        } finally {
            setIsSavingCv(false);
        }
    };

    const handleOptimize = async () => {
        if (cvSource === "saved" && !resumeData) { alert("Please save a Master CV first in the 'My CV' page."); return; }
        if (cvSource === "upload" && !uploadedFile) { alert("Please upload a PDF CV file first."); return; }
        if (!jdText.trim()) { alert("Please paste a job description first."); return; }
        if (reachedOptimizeLimit) { alert(`Free plan: ${FREE_OPTIMIZE_LIMIT} optimization/day. Upgrade to Pro for unlimited optimizations.`); return; }
        setIsGenerating(true);
        setResults(null);

        // Track usage
        if (!isPaid) {
            const today = new Date().toISOString().slice(0, 10);
            const newCount = optimizeCount + 1;
            setOptimizeCount(newCount);
            localStorage.setItem("optimize_count", JSON.stringify({ date: today, count: newCount }));
        }

        try {
            let res: Response;
            if (cvSource === "upload" && uploadedFile) {
                const formData = new FormData();
                formData.append("file", uploadedFile);
                formData.append("jdText", jdText);
                formData.append("language", "en");
                formData.append("tone", "professional");
                res = await fetch("/api/ai/optimize", { method: "POST", body: formData });
            } else {
                res = await fetch("/api/ai/optimize", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ resumeJson: resumeData, jdText, language: "en", tone: "professional" }),
                });
            }

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

    // Build demo 100% CvData
    const demoCv = results?.demo_100_cv;
    const demoCvData: CvData | null = demoCv && tailoredCvData ? (() => {
        const base = resumeData || {};
        return {
            basicInfo: tailoredCvData.basicInfo,
            summary: typeof demoCv.summary === "string" ? demoCv.summary : (tailoredCvData.summary || ""),
            experience: Array.isArray(demoCv.experience) && demoCv.experience.length ? demoCv.experience : tailoredCvData.experience,
            education: Array.isArray(demoCv.education) && demoCv.education.length ? demoCv.education : tailoredCvData.education,
            projects: Array.isArray(demoCv.projects) && demoCv.projects.length ? demoCv.projects : tailoredCvData.projects,
            skills: Array.isArray(demoCv.skills) && demoCv.skills.length ? demoCv.skills : tailoredCvData.skills,
            languages: Array.isArray(demoCv.languages) ? demoCv.languages : tailoredCvData.languages,
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
                        <p className="text-neutral-500 dark:text-neutral-400 font-medium">AI analyzes your CV against the job description, then generates optimized documents and an ATS-perfect version.</p>
                    </div>
                </div>
                <GuideButton guide={{
                    title: "How to Optimize",
                    steps: [
                        "Your CV is automatically loaded from 'My CV' or you can upload a PDF.",
                        "Paste the complete job description in the text area below.",
                        "Click 'Optimize with AI' — the system will create two versions: Your optimized CV + a 100% ATS-optimized demo.",
                        "Review all documents in the tabs on the right. Download both CV versions separately.",
                        "Use the 'Your Optimized CV' for real applications. The '100% ATS Demo' shows the perfect keyword coverage to aim for.",
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

                {/* LEFT: CV source + JD paste + optimize button */}
                <div className="space-y-4">

                    {/* CV source toggle + card */}
                    <div className="p-4 bg-white/50 dark:bg-black/30 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">CV Source</p>

                        {/* Toggle */}
                        <div className="flex bg-neutral-100 dark:bg-neutral-900 rounded-xl p-1 gap-1">
                            <button
                                onClick={() => setCvSource("saved")}
                                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${cvSource === "saved" ? "bg-white dark:bg-neutral-800 shadow text-neutral-900 dark:text-white" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"}`}
                            >
                                📋 My Saved CV
                            </button>
                            <button
                                onClick={() => setCvSource("upload")}
                                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${cvSource === "upload" ? "bg-white dark:bg-neutral-800 shadow text-neutral-900 dark:text-white" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"}`}
                            >
                                📄 Upload PDF
                            </button>
                        </div>

                        {/* Saved CV info */}
                        {cvSource === "saved" && (
                            resumeData ? (
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
                                <div className="flex flex-col gap-2">
                                    <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                                        ⚠️ No CV saved yet — <a href="/resume" className="underline font-bold">go to My CV</a> to create one.
                                    </p>
                                    <button onClick={fetchResume} className="text-xs text-indigo-600 dark:text-indigo-400 underline font-bold text-left hover:opacity-80 transition">
                                        ↻ I already saved it — reload
                                    </button>
                                </div>
                            )
                        )}

                        {/* PDF upload drop zone */}
                        {cvSource === "upload" && (
                            <div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf"
                                    className="hidden"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f && f.type === "application/pdf") setUploadedFile(f);
                                    }}
                                />
                                {uploadedFile ? (
                                    <div className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700/40 rounded-xl">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center shrink-0">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 truncate">{uploadedFile.name}</p>
                                            <p className="text-xs text-neutral-500">{(uploadedFile.size / 1024).toFixed(0)} KB · PDF</p>
                                        </div>
                                        <button
                                            onClick={() => { setUploadedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                                            className="text-neutral-400 hover:text-red-500 transition shrink-0"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            setIsDragging(false);
                                            const f = e.dataTransfer.files?.[0];
                                            if (f && f.type === "application/pdf") setUploadedFile(f);
                                        }}
                                        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${isDragging ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : "border-neutral-300 dark:border-neutral-700 hover:border-indigo-400 dark:hover:border-indigo-600"}`}
                                    >
                                        <Upload className="w-6 h-6 mx-auto mb-2 text-neutral-400" />
                                        <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">Drop your CV PDF here</p>
                                        <p className="text-xs text-neutral-400 mt-1">or click to browse</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <JobPasteBox value={jdText} onChange={setJdText} />
                    <button
                        onClick={handleOptimize}
                        disabled={isGenerating || !jdText.trim() || reachedOptimizeLimit || (cvSource === "saved" && !resumeData) || (cvSource === "upload" && !uploadedFile)}
                        className="w-full h-14 text-lg rounded-2xl shadow-xl shadow-purple-500/20 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3"
                    >
                        {reachedOptimizeLimit ? (
                            <>🔒 Daily Limit Reached — Upgrade to Pro</>
                        ) : isGenerating ? (
                            <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Generating… (this may take 30–60s)
                            </>
                        ) : `🚀 Optimize with AI${!isPaid ? ` (${FREE_OPTIMIZE_LIMIT - optimizeCount} left today)` : ""}`}
                    </button>
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
                                    {/* Version toggle */}
                                    <div className="px-5 py-3 border-b border-neutral-100 dark:border-neutral-800 space-y-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="flex-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl p-1 flex gap-1">
                                                <button
                                                    onClick={() => setCvVersionTab("real")}
                                                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${cvVersionTab === "real" ? "bg-white dark:bg-neutral-800 shadow text-neutral-900 dark:text-white" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"}`}
                                                >
                                                    ✅ Your Optimized CV
                                                    <span className="ml-1.5 text-[10px] bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full">
                                                        ATS: {results?.ats_score ?? "–"}/100
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() => setCvVersionTab("demo")}
                                                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${cvVersionTab === "demo" ? "bg-white dark:bg-neutral-800 shadow text-neutral-900 dark:text-white" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"}`}
                                                >
                                                    🏆 100% ATS Demo
                                                    <span className="ml-1.5 text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full">Preview</span>
                                                </button>
                                            </div>
                                            <button
                                                onClick={handleDownloadJson}
                                                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg transition-all border border-neutral-200 dark:border-neutral-700"
                                                title="Download AI JSON for debugging"
                                            >
                                                <Code2 className="w-3.5 h-3.5" />
                                                Debug
                                            </button>
                                        </div>

                                        {/* Demo warning / experience fit */}
                                        {cvVersionTab === "demo" && demoCv && (
                                            <div className="space-y-2">
                                                <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-xl text-xs">
                                                    <span className="text-base flex-shrink-0">⚠️</span>
                                                    <div>
                                                        <p className="font-bold text-amber-800 dark:text-amber-300">DEMO — Do not submit as-is</p>
                                                        <p className="text-amber-700 dark:text-amber-400 mt-0.5">This version shows the maximum ATS-keyword coverage possible for this job. It may include skills you don&apos;t actually have.</p>
                                                    </div>
                                                </div>
                                                {demoCv._experience_fit && (
                                                    <div className={`flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs border ${
                                                        demoCv._is_qualified === false
                                                            ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/40"
                                                            : "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/40"
                                                    }`}>
                                                        <span className="text-base flex-shrink-0">{demoCv._is_qualified === false ? "🚫" : "🎯"}</span>
                                                        <p className={`font-medium ${
                                                            demoCv._is_qualified === false
                                                                ? "text-red-700 dark:text-red-400"
                                                                : "text-green-700 dark:text-green-400"
                                                        }`}>{demoCv._experience_fit}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Header row for the real CV */}
                                        {cvVersionTab === "real" && (
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-green-400" />
                                                <span className="text-xs font-bold text-neutral-500">Your keywords have been aligned to this job description</span>
                                                {tailoredCvData && (
                                                    <div className="ml-auto flex gap-2">
                                                        <button
                                                            onClick={() => handleEditCv(tailoredCvData)}
                                                            disabled={isSavingCv}
                                                            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                            {isSavingCv ? "Saving..." : "Edit CV"}
                                                        </button>
                                                        <PdfDownloadButton
                                                            data={tailoredCvData}
                                                            templateId={selectedTemplate}
                                                            fileName={`Tailored_CV_${tailoredCvData?.basicInfo?.fullName?.replace(/\s+/g, "_") || "Resume"}.pdf`}
                                                            watermark={!isPaid}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Header row for the ATS demo CV */}
                                        {cvVersionTab === "demo" && demoCvData && (
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-amber-400" />
                                                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">ATS-Optimized Version — for reference only</span>
                                                <div className="ml-auto flex gap-2">
                                                    <button
                                                        onClick={() => handleEditCv(demoCvData)}
                                                        disabled={isSavingCv}
                                                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                        {isSavingCv ? "Saving..." : "Edit Demo CV"}
                                                    </button>
                                                    <PdfDownloadButton
                                                        data={demoCvData}
                                                        templateId="classic"
                                                        fileName={`ATS_Demo_${demoCvData?.basicInfo?.fullName?.replace(/\s+/g, "_") || "Resume"}.pdf`}
                                                        watermark={!isPaid}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* CV render */}
                                    <div className="p-3 bg-neutral-100 dark:bg-neutral-950 overflow-auto max-h-[700px]">
                                        {cvVersionTab === "real" && tailoredCvData && (
                                            <div style={{ zoom: 0.65 }} className="bg-white shadow-xl rounded">
                                                <CvTemplateRenderer templateId={selectedTemplate} data={tailoredCvData} />
                                            </div>
                                        )}
                                        {cvVersionTab === "demo" && demoCvData && (
                                            <div style={{ zoom: 0.65 }} className="bg-white shadow-xl rounded">
                                                <CvTemplateRenderer templateId={selectedTemplate} data={demoCvData} />
                                            </div>
                                        )}
                                        {cvVersionTab === "demo" && !demoCvData && (
                                            <p className="text-center text-neutral-400 py-12">Demo CV not available for this result.</p>
                                        )}
                                    </div>
                                    <div className="px-5 py-3 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-400 text-center">
                                        {cvVersionTab === "real" ? "Bullet points and summary rewritten by AI to match this JD" : "Demo shows 100% keyword coverage — review carefully before use"}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Empty state */
                        <div className="h-full bg-white/40 dark:bg-black/40 backdrop-blur-2xl rounded-[2rem] p-8 flex flex-col items-center justify-center text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 min-h-[520px]">
                            <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-6 border border-purple-200 dark:border-purple-700/50">
                                <Zap className="w-9 h-9 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">Ready to Tailor Your Application</h3>
                            <p className="text-neutral-600 dark:text-neutral-400 max-w-md mt-3 leading-relaxed text-sm">
                                Paste a job description on the left and click <span className="font-bold text-purple-600 dark:text-purple-400">Optimize with AI</span>. 
                                The system will create:
                            </p>
                            <div className="mt-5 space-y-2 text-left max-w-md">
                                <div className="flex items-start gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                                    <span className="text-green-500 font-bold">✓</span>
                                    <span><span className="font-bold text-neutral-800 dark:text-neutral-200">Your Optimized CV</span> — with your real info, keywords matched to the job</span>
                                </div>
                                <div className="flex items-start gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                                    <span className="text-amber-500 font-bold">★</span>
                                    <span><span className="font-bold text-neutral-800 dark:text-neutral-200">100% ATS Demo CV</span> — shows perfect keyword coverage (for reference only)</span>
                                </div>
                                <div className="flex items-start gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                                    <span className="text-indigo-500 font-bold">+</span>
                                    <span><span className="font-bold text-neutral-800 dark:text-neutral-200">Cover letter, motivation letter, email, LinkedIn messages</span></span>
                                </div>
                            </div>
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
