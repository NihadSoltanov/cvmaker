"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Edit3, LayoutTemplate, Save, Camera, X, AlertCircle, Link2, Eye } from "lucide-react";
import { TemplatePicker, CvTemplateRenderer, CV_TEMPLATES, type CvData } from "@/components/CvTemplates";
import { PdfDownloadButton } from "@/components/PdfGenerator";
import { GuideButton } from "@/components/GuideButton";
import { supabase } from "@/lib/supabase";

export function ResumeEditor({ resume, onSave, isSaving }: {
    resume: any;
    onSave: (data: any) => void;
    isSaving: boolean;
}) {
    // Tabs only for the left pane (edit form vs template picker)
    const [leftTab, setLeftTab] = useState<"edit" | "templates">("edit");
    const [selectedTemplate, setSelectedTemplate] = useState("classic");
    const [isPaidUser, setIsPaidUser] = useState(false);
    const [downloadCount, setDownloadCount] = useState(0);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [shareUrl, setShareUrl] = useState<string | null>(null);
    const [isSharing, setIsSharing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // CV form state
    const [basicInfo, setBasicInfo] = useState({
        fullName: "", email: "", phone: "", location: "", linkedin: "", portfolio: ""
    });
    const [summary, setSummary] = useState("");
    const [experience, setExperience] = useState<any[]>([
        { company: "", role: "", startDate: "", endDate: "", description: "" }
    ]);
    const [education, setEducation] = useState<any[]>([
        { institution: "", degree: "", startDate: "", endDate: "" }
    ]);
    const [projects, setProjects] = useState<any[]>([]);
    const [skills, setSkills] = useState("");
    const [languages, setLanguages] = useState("");
    const [certifications, setCertifications] = useState<any[]>([]);
    const [volunteerWork, setVolunteerWork] = useState<any[]>([]);

    // Check subscription
    useEffect(() => {
        const check = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: sub } = await supabase
                .from("subscriptions").select("plan,status").eq("user_id", user.id).maybeSingle();
            if (sub && sub.plan !== "free" && sub.status === "active") setIsPaidUser(true);
            const start = new Date(); start.setDate(1); start.setHours(0, 0, 0, 0);
            const { count } = await supabase.from("usage_events")
                .select("id", { count: "exact" })
                .eq("user_id", user.id).eq("feature", "pdf_download")
                .gte("created_at", start.toISOString());
            setDownloadCount(count || 0);
        };
        check();
    }, []);

    // Hydrate from saved resume
    useEffect(() => {
        if (!resume) return;
        setBasicInfo({
            fullName: resume.name || resume.basicInfo?.fullName || "",
            email: resume.basicInfo?.email || "",
            phone: resume.basicInfo?.phone || "",
            location: resume.basicInfo?.location || "",
            linkedin: resume.basicInfo?.linkedin || "",
            portfolio: resume.basicInfo?.portfolio || "",
        });
        setSummary(resume.summary || "");
        if (Array.isArray(resume.experience) && resume.experience.length) setExperience(resume.experience);
        if (Array.isArray(resume.education) && resume.education.length) setEducation(resume.education);
        setProjects(Array.isArray(resume.projects) ? resume.projects : []);
        setSkills(Array.isArray(resume.skills) ? resume.skills.join(", ") : resume.skills || "");
        setLanguages(Array.isArray(resume.languages) ? resume.languages.join(", ") : resume.languages || "");
        if (resume.photo) setPhotoPreview(resume.photo);
        if (Array.isArray(resume.certifications)) setCertifications(resume.certifications);
        if (Array.isArray(resume.volunteerWork)) setVolunteerWork(resume.volunteerWork);
    }, [resume]);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setPhotoPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        onSave({
            name: basicInfo.fullName, basicInfo, summary, experience, education, projects,
            skills: skills.split(",").map(s => s.trim()).filter(Boolean),
            languages: languages.split(",").map(s => s.trim()).filter(Boolean),
            photo: photoPreview, certifications, volunteerWork,
        });
    };

    const handleShareLink = async () => {
        setIsSharing(true);
        try {
            const token = Math.random().toString(36).slice(2, 12);
            const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
            localStorage.setItem(`share_preview_${token}`, JSON.stringify({
                data: resumeData, templateId: selectedTemplate, expiresAt
            }));
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await supabase.from("share_links").insert([{
                        user_id: user.id, token, template_id: selectedTemplate,
                        resume_snapshot: JSON.stringify(resumeData), expires_at: expiresAt,
                    }]);
                }
            } catch { /* localStorage fallback is enough */ }
            const url = `${window.location.origin}/s/${token}`;
            setShareUrl(url);
            try { await navigator.clipboard.writeText(url); } catch { /* ignore */ }
        } finally { setIsSharing(false); }
    };

    const upd = (setter: any, idx: number, field: string, val: string) =>
        setter((p: any[]) => p.map((item, i) => i === idx ? { ...item, [field]: val } : item));
    const add = (setter: any, def: any) => setter((p: any[]) => [...p, def]);
    const rem = (setter: any, idx: number) => setter((p: any[]) => p.filter((_: any, i: number) => i !== idx));

    const currentTemplateDef = CV_TEMPLATES.find(t => t.id === selectedTemplate);
    const resumeData: CvData = {
        basicInfo, summary, experience, education, projects,
        skills: skills.split(",").map(s => s.trim()).filter(Boolean),
        languages: languages.split(",").map(s => s.trim()).filter(Boolean),
        photo: photoPreview, certifications, volunteerWork,
    };

    return (
        <div className="flex flex-col h-full">

            {/* ─── Top action bar ─── */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-sm">
                <div className="flex bg-neutral-100 dark:bg-neutral-900 rounded-xl p-1 gap-1">
                    <button onClick={() => setLeftTab("edit")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${leftTab === "edit" ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"}`}>
                        <Edit3 className="w-3.5 h-3.5" /> Edit CV
                    </button>
                    <button onClick={() => setLeftTab("templates")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${leftTab === "templates" ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"}`}>
                        <LayoutTemplate className="w-3.5 h-3.5" /> Templates
                    </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {!isPaidUser && (
                        <span className="text-xs font-semibold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-xl">
                            {Math.max(0, 2 - downloadCount)} free downloads left
                        </span>
                    )}
                    <button onClick={handleShareLink} disabled={isSharing}
                        className="flex items-center gap-2 bg-blue-600 text-white rounded-xl px-3 py-2 font-bold hover:bg-blue-700 transition disabled:opacity-50 text-xs">
                        <Link2 className="w-3.5 h-3.5" />
                        {isSharing ? "Creating…" : shareUrl ? "✓ Copied!" : "Share Link"}
                    </button>
                    <PdfDownloadButton data={resumeData} templateId={selectedTemplate} />
                    <button onClick={handleSave} disabled={isSaving}
                        className="flex items-center gap-2 bg-indigo-600 text-white rounded-xl px-3 py-2 font-bold hover:bg-indigo-700 transition disabled:opacity-50 text-xs">
                        <Save className="w-3.5 h-3.5" />
                        {isSaving ? "Saving…" : "Save CV"}
                    </button>
                </div>
            </div>

            {shareUrl && (
                <div className="px-5 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-700 text-xs text-blue-700 dark:text-blue-300 flex items-center gap-3">
                    <span>🔗 Share Link (30 days):</span>
                    <a href={shareUrl} target="_blank" className="underline font-mono font-bold break-all flex-1">{shareUrl}</a>
                    <button onClick={() => navigator.clipboard.writeText(shareUrl || "")} className="font-bold hover:underline flex-shrink-0">Copy</button>
                </div>
            )}

            {/* ─── Main 2-column layout: form LEFT | preview RIGHT ─── */}
            <div className="flex-1 flex overflow-hidden min-h-0">

                {/* LEFT: Edit form or Template picker */}
                <div className="flex-1 overflow-y-auto min-w-0">
                    {leftTab === "edit" ? (
                        <div className="p-6 max-w-2xl mx-auto space-y-10 pb-20">

                            {/* Personal Info */}
                            <section>
                                <SH title="Personal Details" subtitle="Contact info — fields marked * are required." />
                                {/* Photo */}
                                <div className="mb-5 flex items-start gap-4">
                                    <div onClick={() => fileInputRef.current?.click()}
                                        className="w-16 h-16 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 transition overflow-hidden flex-shrink-0 group relative">
                                        {photoPreview ? (
                                            <>
                                                <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                                    <Camera className="w-4 h-4 text-white" />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <Camera className="w-4 h-4 text-neutral-400 mb-1" />
                                                <span className="text-[9px] text-neutral-400 text-center px-0.5">Photo</span>
                                            </>
                                        )}
                                    </div>
                                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                                    <div className="text-xs text-neutral-500 pt-1">
                                        <p className="font-semibold text-neutral-700 dark:text-neutral-300 mb-0.5">Profile Photo (Optional)</p>
                                        <p>Used in Modern / Creative / Euro templates. Classic ATS has no photo.</p>
                                        {photoPreview && (
                                            <button onClick={() => setPhotoPreview(null)} className="mt-1 text-red-500 flex items-center gap-1 hover:underline">
                                                <X className="w-3 h-3" /> Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <FF label="Full Name" required span><input className="input-styled" value={basicInfo.fullName} onChange={e => setBasicInfo({ ...basicInfo, fullName: e.target.value })} placeholder="John Smith" /></FF>
                                    <FF label="Email" required><input type="email" className="input-styled" value={basicInfo.email} onChange={e => setBasicInfo({ ...basicInfo, email: e.target.value })} placeholder="john@example.com" /></FF>
                                    <FF label="Phone" required><input className="input-styled" value={basicInfo.phone} onChange={e => setBasicInfo({ ...basicInfo, phone: e.target.value })} placeholder="+1 (555) 000-0000" /></FF>
                                    <FF label="City, Country" required><input className="input-styled" value={basicInfo.location} onChange={e => setBasicInfo({ ...basicInfo, location: e.target.value })} placeholder="New York, USA" /></FF>
                                    <FF label="LinkedIn"><input className="input-styled" value={basicInfo.linkedin} onChange={e => setBasicInfo({ ...basicInfo, linkedin: e.target.value })} placeholder="linkedin.com/in/yourname" /></FF>
                                    <FF label="Portfolio / GitHub"><input className="input-styled" value={basicInfo.portfolio} onChange={e => setBasicInfo({ ...basicInfo, portfolio: e.target.value })} placeholder="github.com/yourname" /></FF>
                                </div>
                            </section>

                            {/* Summary */}
                            <section>
                                <SH title="Professional Summary" required subtitle="2–4 sentences. Mention your role, experience, and a top achievement." />
                                <textarea className="input-styled h-24" value={summary} onChange={e => setSummary(e.target.value)} placeholder="Results-driven Software Engineer with 5+ years..." />
                            </section>

                            {/* Experience */}
                            <section>
                                <SH title="Work Experience" required subtitle="Use bullet points (•) — one achievement per line for ATS." />
                                <div className="space-y-4">
                                    {experience.map((exp, idx) => (
                                        <div key={idx} className="p-4 bg-neutral-50 dark:bg-neutral-900/60 rounded-2xl border border-neutral-200 dark:border-neutral-800 relative group">
                                            <button onClick={() => rem(setExperience, idx)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition p-1 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                            <div className="grid grid-cols-2 gap-3 mb-3">
                                                <FF label="Company" required><input className="input-styled" value={exp.company} onChange={e => upd(setExperience, idx, "company", e.target.value)} placeholder="Google" /></FF>
                                                <FF label="Job Title" required><input className="input-styled" value={exp.role} onChange={e => upd(setExperience, idx, "role", e.target.value)} placeholder="Senior Engineer" /></FF>
                                                <FF label="Start Date"><input type="month" className="input-styled" value={exp.startDate} onChange={e => upd(setExperience, idx, "startDate", e.target.value)} /></FF>
                                                <FF label="End Date (blank = current)"><input type="month" className="input-styled" value={exp.endDate} onChange={e => upd(setExperience, idx, "endDate", e.target.value)} /></FF>
                                            </div>
                                            <FF label="Achievements (use • bullets)">
                                                <textarea className="input-styled h-20" value={exp.description} onChange={e => upd(setExperience, idx, "description", e.target.value)} placeholder={"• Reduced latency by 40%\n• Mentored 3 junior engineers"} />
                                            </FF>
                                        </div>
                                    ))}
                                    <AddBtn onClick={() => add(setExperience, { company: "", role: "", startDate: "", endDate: "", description: "" })} label="Add Experience" />
                                </div>
                            </section>

                            {/* Education */}
                            <section>
                                <SH title="Education" required subtitle="Most recent first." />
                                <div className="space-y-4">
                                    {education.map((edu, idx) => (
                                        <div key={idx} className="p-4 bg-neutral-50 dark:bg-neutral-900/60 rounded-2xl border border-neutral-200 dark:border-neutral-800 relative group">
                                            <button onClick={() => rem(setEducation, idx)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition p-1 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                            <div className="grid grid-cols-2 gap-3">
                                                <FF label="Institution" required><input className="input-styled" value={edu.institution} onChange={e => upd(setEducation, idx, "institution", e.target.value)} placeholder="MIT" /></FF>
                                                <FF label="Degree" required><input className="input-styled" value={edu.degree} onChange={e => upd(setEducation, idx, "degree", e.target.value)} placeholder="BSc Computer Science" /></FF>
                                                <FF label="Start Date"><input type="month" className="input-styled" value={edu.startDate} onChange={e => upd(setEducation, idx, "startDate", e.target.value)} /></FF>
                                                <FF label="End Date"><input type="month" className="input-styled" value={edu.endDate} onChange={e => upd(setEducation, idx, "endDate", e.target.value)} /></FF>
                                            </div>
                                        </div>
                                    ))}
                                    <AddBtn onClick={() => add(setEducation, { institution: "", degree: "", startDate: "", endDate: "" })} label="Add Education" />
                                </div>
                            </section>

                            {/* Projects */}
                            <section>
                                <SH title="Projects (Optional)" subtitle="Personal or open-source projects." />
                                <div className="space-y-4">
                                    {projects.map((proj, idx) => (
                                        <div key={idx} className="p-4 bg-neutral-50 dark:bg-neutral-900/60 rounded-2xl border border-neutral-200 dark:border-neutral-800 relative group">
                                            <button onClick={() => rem(setProjects, idx)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition p-1 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                            <div className="grid grid-cols-2 gap-3 mb-3">
                                                <FF label="Project Name"><input className="input-styled" value={proj.title} onChange={e => upd(setProjects, idx, "title", e.target.value)} placeholder="AI Chat App" /></FF>
                                                <FF label="Link"><input className="input-styled" value={proj.link} onChange={e => upd(setProjects, idx, "link", e.target.value)} placeholder="github.com/…" /></FF>
                                            </div>
                                            <FF label="Description">
                                                <textarea className="input-styled h-16" value={proj.description} onChange={e => upd(setProjects, idx, "description", e.target.value)} placeholder="Built with React + OpenAI API…" />
                                            </FF>
                                        </div>
                                    ))}
                                    <AddBtn onClick={() => add(setProjects, { title: "", description: "", link: "" })} label="Add Project" />
                                </div>
                            </section>

                            {/* Skills & Languages */}
                            <section className="grid grid-cols-2 gap-5">
                                <div>
                                    <SH title="Skills" required subtitle="Comma separated." />
                                    <textarea className="input-styled h-24" value={skills} onChange={e => setSkills(e.target.value)} placeholder="React, TypeScript, Node.js, AWS…" />
                                </div>
                                <div>
                                    <SH title="Languages" subtitle="Include proficiency level." />
                                    <textarea className="input-styled h-24" value={languages} onChange={e => setLanguages(e.target.value)} placeholder="English (Fluent), Turkish (Native)…" />
                                </div>
                            </section>

                        </div>
                    ) : (
                        /* Template picker */
                        <div className="p-6 pb-20">
                            <div className="mb-5">
                                <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">Choose Template</h2>
                                <p className="text-xs text-neutral-500">The preview on the right updates live as you select.</p>
                            </div>
                            {!isPaidUser && (
                                <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-2xl flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm">
                                        <span className="font-bold text-amber-800 dark:text-amber-300">Free Plan: </span>
                                        <span className="text-amber-700 dark:text-amber-400">3 templates included. <a href="/pricing" className="underline font-bold">Upgrade to Pro</a> for all premium templates.</span>
                                    </div>
                                </div>
                            )}
                            <TemplatePicker selectedTemplate={selectedTemplate} onSelect={setSelectedTemplate} isPaidUser={isPaidUser} />
                        </div>
                    )}
                </div>

                {/* RIGHT: Live CV preview — always visible, always updating */}
                <div className="w-[480px] flex-shrink-0 bg-neutral-200/80 dark:bg-neutral-950 border-l border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden">
                    {/* Preview header */}
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-300 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                Live Preview
                            </span>
                            <span className="text-xs text-neutral-400">·</span>
                            <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                                {currentTemplateDef?.name || selectedTemplate}
                            </span>
                        </div>
                        <button onClick={() => setLeftTab("templates")}
                            className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 transition flex items-center gap-1">
                            <LayoutTemplate className="w-3 h-3" /> Change
                        </button>
                    </div>

                    {/* Scrollable preview canvas */}
                    <div className="flex-1 overflow-y-auto p-3">
                        <div className="w-full shadow-xl overflow-hidden bg-white rounded origin-top-left" style={{ zoom: 0.55 }}>
                            <CvTemplateRenderer templateId={selectedTemplate} data={resumeData} />
                        </div>
                    </div>

                    {/* Preview footer with download */}
                    <div className="px-4 py-3 border-t border-neutral-300 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 flex items-center justify-between gap-3">
                        <p className="text-[10px] text-neutral-400 font-medium">Updates in real‑time as you edit</p>
                        <PdfDownloadButton data={resumeData} templateId={selectedTemplate} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function SH({ title, subtitle, required }: { title: string; subtitle?: string; required?: boolean }) {
    return (
        <div className="mb-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
            <h2 className="text-sm font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-1">
                {title}{required && <span className="text-red-500 ml-0.5">*</span>}
            </h2>
            {subtitle && <p className="text-[11px] text-neutral-500 mt-0.5">{subtitle}</p>}
        </div>
    );
}

function FF({ label, required, span, children }: { label: string; required?: boolean; span?: boolean; children: React.ReactNode }) {
    return (
        <div className={span ? "col-span-2" : ""}>
            <label className="text-[10px] font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-1 block">
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
        </div>
    );
}

function AddBtn({ onClick, label }: { onClick: () => void; label: string }) {
    return (
        <button onClick={onClick}
            className="w-full py-2.5 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-500 text-xs font-bold hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition flex items-center justify-center gap-2">
            <Plus className="w-3.5 h-3.5" /> {label}
        </button>
    );
}
