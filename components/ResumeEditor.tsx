"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Edit3, LayoutTemplate, Save, Camera, X, AlertCircle, Link2, Columns, Eye } from "lucide-react";
import { TemplatePicker, CvTemplateRenderer, CV_TEMPLATES, type CvData } from "@/components/CvTemplates";
import { PdfDownloadButton } from "@/components/PdfGenerator";
import { GuideButton } from "@/components/GuideButton";
import { supabase } from "@/lib/supabase";

export function ResumeEditor({ resume, onSave, isSaving }: { resume: any; onSave: (data: any) => void; isSaving: boolean }) {
    const [activeTab, setActiveTab] = useState<"edit" | "preview" | "templates">("edit");
    const [selectedTemplate, setSelectedTemplate] = useState("classic");
    const [isPaidUser, setIsPaidUser] = useState(false);
    const [downloadCount, setDownloadCount] = useState(0);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [shareUrl, setShareUrl] = useState<string | null>(null);
    const [splitView, setSplitView] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);

    const [basicInfo, setBasicInfo] = useState({ fullName: "", email: "", phone: "", location: "", linkedin: "", portfolio: "" });
    const [summary, setSummary] = useState("");
    const [experience, setExperience] = useState<any[]>([{ company: "", role: "", startDate: "", endDate: "", description: "" }]);
    const [education, setEducation] = useState<any[]>([{ institution: "", degree: "", startDate: "", endDate: "" }]);
    const [projects, setProjects] = useState<any[]>([]);
    const [skills, setSkills] = useState("");
    const [certifications, setCertifications] = useState<any[]>([]);
    const [volunteerWork, setVolunteerWork] = useState<any[]>([]);
    const [languages, setLanguages] = useState("");

    useEffect(() => {
        const checkPlan = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: sub } = await supabase.from("subscriptions").select("plan, status").eq("user_id", user.id).maybeSingle();
                if (sub && sub.plan !== "free" && sub.status === "active") setIsPaidUser(true);
                const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
                const { count } = await supabase.from("usage_events").select("id", { count: "exact" }).eq("user_id", user.id).eq("feature", "pdf_download").gte("created_at", startOfMonth.toISOString());
                setDownloadCount(count || 0);
            }
        };
        checkPlan();
    }, []);

    useEffect(() => {
        if (resume) {
            setBasicInfo({
                fullName: resume.name || resume.basicInfo?.fullName || "",
                email: resume.basicInfo?.email || "",
                phone: resume.basicInfo?.phone || "",
                location: resume.basicInfo?.location || "",
                linkedin: resume.basicInfo?.linkedin || "",
                portfolio: resume.basicInfo?.portfolio || "",
            });
            setSummary(resume.summary || "");
            if (Array.isArray(resume.experience) && resume.experience.length > 0) setExperience(resume.experience);
            if (Array.isArray(resume.education) && resume.education.length > 0) setEducation(resume.education);
            setProjects(Array.isArray(resume.projects) ? resume.projects : []);
            setSkills(Array.isArray(resume.skills) ? resume.skills.join(", ") : resume.skills || "");
            setLanguages(Array.isArray(resume.languages) ? resume.languages.join(", ") : resume.languages || "");
            if (resume.photo) setPhotoPreview(resume.photo);
            if (Array.isArray(resume.certifications)) setCertifications(resume.certifications);
            if (Array.isArray(resume.volunteerWork)) setVolunteerWork(resume.volunteerWork);
        }
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
            name: basicInfo.fullName,
            basicInfo,
            summary,
            experience,
            education,
            projects,
            skills: skills.split(",").map(s => s.trim()).filter(Boolean),
            languages: languages.split(",").map(s => s.trim()).filter(Boolean),
            photo: photoPreview,
            certifications,
            volunteerWork,
        });
    };

    const handleShareLink = async () => {
        setIsSharing(true);
        try {
            const token = Math.random().toString(36).slice(2, 12);
            const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
            const payload = { data: resumeDataForPreview, templateId: selectedTemplate, expiresAt };
            localStorage.setItem(`share_preview_${token}`, JSON.stringify(payload));
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await supabase.from("share_links").insert([{
                        user_id: user.id, token, template_id: selectedTemplate,
                        resume_snapshot: JSON.stringify(resumeDataForPreview), expires_at: expiresAt,
                    }]);
                }
            } catch { /* ignore — localStorage fallback is enough */ }
            const url = `${window.location.origin}/s/${token}`;
            setShareUrl(url);
            try { await navigator.clipboard.writeText(url); } catch { /* ignore */ }
        } finally {
            setIsSharing(false);
        }
    };

    const updateArrayItem = (setter: React.Dispatch<React.SetStateAction<any[]>>, idx: number, field: string, val: string) =>
        setter(prev => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item));
    const addArrayItem = (setter: React.Dispatch<React.SetStateAction<any[]>>, def: any) => setter(prev => [...prev, def]);
    const removeArrayItem = (setter: React.Dispatch<React.SetStateAction<any[]>>, idx: number) => setter(prev => prev.filter((_, i) => i !== idx));

    const currentTemplateDef = CV_TEMPLATES.find(t => t.id === selectedTemplate);
    const resumeDataForPreview: CvData = {
        basicInfo, summary, experience, education, projects,
        skills: skills.split(",").map(s => s.trim()).filter(Boolean),
        languages: languages.split(",").map(s => s.trim()).filter(Boolean),
        photo: photoPreview,
        certifications,
        volunteerWork,
    };

    const FREE_LIMIT = 2;

    // Edit form JSX (shared between single-tab and split-view)
    const editFormJSX = (
        <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-10 pb-16">
            {/* Personal Details */}
            <section>
                <SectionHeader title="Personal Details" subtitle="Your contact info is the first thing ATS systems scan." />
                <div className="mb-5 flex items-start gap-4">
                    <div onClick={() => fileInputRef.current?.click()}
                        className="w-20 h-20 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 transition-colors overflow-hidden flex-shrink-0 group relative">
                        {photoPreview ? (
                            <>
                                <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Camera className="w-5 h-5 text-white" />
                                </div>
                            </>
                        ) : (
                            <>
                                <Camera className="w-5 h-5 text-neutral-400 mb-1" />
                                <span className="text-[10px] text-neutral-400 text-center leading-tight px-1">Add Photo</span>
                            </>
                        )}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    <div className="text-sm">
                        <p className="font-semibold text-neutral-700 dark:text-neutral-300">Profile Photo (Optional)</p>
                        <p className="text-neutral-500 text-xs mt-1">Only for Modern, Creative, Euro templates. Classic ATS doesn&apos;t use a photo.</p>
                        {photoPreview && <button onClick={() => setPhotoPreview(null)} className="mt-2 text-red-500 text-xs flex items-center gap-1 hover:underline"><X className="w-3 h-3" /> Remove</button>}
                    </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                    <FF label="Full Name" required><input className="input-styled" value={basicInfo.fullName} onChange={e => setBasicInfo({ ...basicInfo, fullName: e.target.value })} placeholder="e.g. John Smith" /></FF>
                    <FF label="Email" required><input type="email" className="input-styled" value={basicInfo.email} onChange={e => setBasicInfo({ ...basicInfo, email: e.target.value })} placeholder="john@example.com" /></FF>
                    <FF label="Phone" required><input className="input-styled" value={basicInfo.phone} onChange={e => setBasicInfo({ ...basicInfo, phone: e.target.value })} placeholder="+1 (555) 000-0000" /></FF>
                    <FF label="City, Country" required><input className="input-styled" value={basicInfo.location} onChange={e => setBasicInfo({ ...basicInfo, location: e.target.value })} placeholder="New York, USA" /></FF>
                    <FF label="LinkedIn URL"><input className="input-styled" value={basicInfo.linkedin} onChange={e => setBasicInfo({ ...basicInfo, linkedin: e.target.value })} placeholder="linkedin.com/in/yourname" /></FF>
                    <FF label="Portfolio / GitHub"><input className="input-styled" value={basicInfo.portfolio} onChange={e => setBasicInfo({ ...basicInfo, portfolio: e.target.value })} placeholder="github.com/yourname" /></FF>
                </div>
            </section>

            {/* Summary */}
            <section>
                <SectionHeader title="Professional Summary" required subtitle="2–4 sentences. Mention your role, years of experience, and a top achievement." />
                <textarea className="input-styled h-28" value={summary} onChange={e => setSummary(e.target.value)} placeholder="Results-driven Software Engineer with 5+ years..." />
            </section>

            {/* Experience */}
            <section>
                <SectionHeader title="Work Experience" required subtitle="Use bullet points (•) per achievement for best ATS compatibility." />
                <div className="space-y-5">
                    {experience.map((exp, idx) => (
                        <div key={idx} className="p-5 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-200 dark:border-neutral-800 relative group">
                            <button onClick={() => removeArrayItem(setExperience, idx)} className="absolute top-4 right-4 text-neutral-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1.5 bg-white dark:bg-neutral-900 rounded-lg shadow"><Trash2 className="w-4 h-4" /></button>
                            <div className="grid sm:grid-cols-2 gap-3 mb-3">
                                <FF label="Company" required><input className="input-styled bg-white dark:bg-neutral-950" value={exp.company} onChange={e => updateArrayItem(setExperience, idx, "company", e.target.value)} placeholder="Google" /></FF>
                                <FF label="Job Title" required><input className="input-styled bg-white dark:bg-neutral-950" value={exp.role} onChange={e => updateArrayItem(setExperience, idx, "role", e.target.value)} placeholder="Senior Engineer" /></FF>
                                <FF label="Start Date"><input type="month" className="input-styled bg-white dark:bg-neutral-950" value={exp.startDate} onChange={e => updateArrayItem(setExperience, idx, "startDate", e.target.value)} /></FF>
                                <FF label="End Date (blank = current)"><input type="month" className="input-styled bg-white dark:bg-neutral-950" value={exp.endDate} onChange={e => updateArrayItem(setExperience, idx, "endDate", e.target.value)} /></FF>
                            </div>
                            <FF label="Description & Achievements"><textarea className="input-styled bg-white dark:bg-neutral-950 h-24" value={exp.description} onChange={e => updateArrayItem(setExperience, idx, "description", e.target.value)} placeholder={"• Led migration reducing latency by 40%\n• Mentored 3 junior engineers"} /></FF>
                        </div>
                    ))}
                    <AddBtn onClick={() => addArrayItem(setExperience, { company: "", role: "", startDate: "", endDate: "", description: "" })} label="Add Experience" />
                </div>
            </section>

            {/* Education */}
            <section>
                <SectionHeader title="Education" required subtitle="Most recent first." />
                <div className="space-y-5">
                    {education.map((edu, idx) => (
                        <div key={idx} className="p-5 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-200 dark:border-neutral-800 relative group">
                            <button onClick={() => removeArrayItem(setEducation, idx)} className="absolute top-4 right-4 text-neutral-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1.5 bg-white dark:bg-neutral-900 rounded-lg shadow"><Trash2 className="w-4 h-4" /></button>
                            <div className="grid sm:grid-cols-2 gap-3">
                                <FF label="Institution" required><input className="input-styled bg-white dark:bg-neutral-950" value={edu.institution} onChange={e => updateArrayItem(setEducation, idx, "institution", e.target.value)} placeholder="MIT" /></FF>
                                <FF label="Degree" required><input className="input-styled bg-white dark:bg-neutral-950" value={edu.degree} onChange={e => updateArrayItem(setEducation, idx, "degree", e.target.value)} placeholder="BSc Computer Science" /></FF>
                                <FF label="Start Date"><input type="month" className="input-styled bg-white dark:bg-neutral-950" value={edu.startDate} onChange={e => updateArrayItem(setEducation, idx, "startDate", e.target.value)} /></FF>
                                <FF label="End Date"><input type="month" className="input-styled bg-white dark:bg-neutral-950" value={edu.endDate} onChange={e => updateArrayItem(setEducation, idx, "endDate", e.target.value)} /></FF>
                            </div>
                        </div>
                    ))}
                    <AddBtn onClick={() => addArrayItem(setEducation, { institution: "", degree: "", startDate: "", endDate: "" })} label="Add Education" />
                </div>
            </section>

            {/* Projects */}
            <section>
                <SectionHeader title="Projects (Optional)" subtitle="Personal or open-source projects. Great for entry-level candidates." />
                <div className="space-y-5">
                    {projects.map((proj, idx) => (
                        <div key={idx} className="p-5 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-200 dark:border-neutral-800 relative group">
                            <button onClick={() => removeArrayItem(setProjects, idx)} className="absolute top-4 right-4 text-neutral-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1.5 bg-white dark:bg-neutral-900 rounded-lg shadow"><Trash2 className="w-4 h-4" /></button>
                            <div className="grid sm:grid-cols-2 gap-3 mb-3">
                                <FF label="Project Name"><input className="input-styled bg-white dark:bg-neutral-950" value={proj.title} onChange={e => updateArrayItem(setProjects, idx, "title", e.target.value)} placeholder="AI Chat App" /></FF>
                                <FF label="Link"><input className="input-styled bg-white dark:bg-neutral-950" value={proj.link} onChange={e => updateArrayItem(setProjects, idx, "link", e.target.value)} placeholder="github.com/username/project" /></FF>
                            </div>
                            <FF label="Description"><textarea className="input-styled bg-white dark:bg-neutral-950 h-20" value={proj.description} onChange={e => updateArrayItem(setProjects, idx, "description", e.target.value)} placeholder="Built with React and OpenAI API..." /></FF>
                        </div>
                    ))}
                    <AddBtn onClick={() => addArrayItem(setProjects, { title: "", description: "", link: "" })} label="Add Project" />
                </div>
            </section>

            {/* Skills & Languages */}
            <section className="grid md:grid-cols-2 gap-6 pb-4">
                <div>
                    <SectionHeader title="Skills" required subtitle="Comma separated — tools, languages, frameworks, soft skills." />
                    <textarea className="input-styled h-28" value={skills} onChange={e => setSkills(e.target.value)} placeholder="JavaScript, React, TypeScript, Node.js, AWS, Docker..." />
                </div>
                <div>
                    <SectionHeader title="Languages" subtitle="Include proficiency level (e.g. English – Fluent)." />
                    <textarea className="input-styled h-28" value={languages} onChange={e => setLanguages(e.target.value)} placeholder="English (Fluent), Turkish (Native)..." />
                </div>
            </section>
        </div>
    );

    return (
        <div className="flex flex-col h-full">
            {/* ── Toolbar ── */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50">
                <div className="flex bg-neutral-100 dark:bg-neutral-900 rounded-xl p-1 gap-1">
                    {(["edit", "templates", "preview"] as const).map(tab => (
                        <button key={tab} onClick={() => { setActiveTab(tab); setSplitView(false); }}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold capitalize transition-all ${activeTab === tab && !splitView ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"}`}>
                            {tab === "edit" && <Edit3 className="w-3.5 h-3.5" />}
                            {tab === "templates" && <LayoutTemplate className="w-3.5 h-3.5" />}
                            {tab === "preview" && <Eye className="w-3.5 h-3.5" />}
                            {tab === "edit" ? "CV Details" : tab === "templates" ? "Templates" : "Preview"}
                        </button>
                    ))}
                    <button onClick={() => setSplitView(v => !v)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${splitView ? "bg-indigo-600 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"}`}>
                        <Columns className="w-3.5 h-3.5" />Live Edit
                    </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {!isPaidUser && (
                        <span className="text-xs font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-3 py-2 rounded-xl">
                            {FREE_LIMIT - downloadCount} of {FREE_LIMIT} downloads left
                        </span>
                    )}
                    <button onClick={handleShareLink} disabled={isSharing}
                        className="flex items-center gap-2 bg-blue-600 text-white rounded-xl px-4 py-2.5 font-bold hover:bg-blue-700 transition disabled:opacity-50 text-sm">
                        <Link2 className="w-4 h-4" />
                        {isSharing ? "Creating..." : shareUrl ? "✓ Link Copied!" : "Share Link"}
                    </button>
                    <PdfDownloadButton data={resumeDataForPreview} templateId={selectedTemplate} />
                    <button onClick={handleSave} disabled={isSaving}
                        className="flex items-center gap-2 bg-indigo-600 text-white rounded-xl px-4 py-2.5 font-bold hover:bg-indigo-700 transition disabled:opacity-50 text-sm">
                        <Save className="w-4 h-4" />
                        {isSaving ? "Saving..." : "Save Master CV"}
                    </button>
                </div>
            </div>

            {shareUrl && (
                <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-700 text-xs text-blue-700 dark:text-blue-300 flex items-center gap-3">
                    <span>🔗 Share Link (30 days):</span>
                    <a href={shareUrl} target="_blank" className="underline font-mono font-bold break-all">{shareUrl}</a>
                    <button onClick={() => navigator.clipboard.writeText(shareUrl)} className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex-shrink-0">Copy</button>
                </div>
            )}

            {/* ── Content ── */}
            <div className={`flex-1 overflow-auto flex ${splitView ? "flex-row" : "flex-col"}`}>

                {/* EDIT TAB or split-view left pane */}
                {(activeTab === "edit" || splitView) && (
                    <div className={splitView ? "flex-1 overflow-auto border-r border-neutral-200 dark:border-neutral-800" : "w-full"}>
                        {editFormJSX}
                    </div>
                )}

                {/* TEMPLATES TAB */}
                {!splitView && activeTab === "templates" && (
                    <div className="p-6 md:p-8 max-w-5xl mx-auto pb-16">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">Choose Your CV Template</h2>
                            <p className="text-sm text-neutral-500">Pro templates are unlocked with a paid subscription. We recommend <strong>Classic ATS</strong> for maximum ATS compatibility.</p>
                        </div>
                        {!isPaidUser && (
                            <div className="mb-5 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <span className="font-bold text-amber-800 dark:text-amber-300">Free Plan: </span>
                                    <span className="text-amber-700 dark:text-amber-400">Use 3 free templates. <a href="/pricing" className="underline font-bold">Upgrade to Pro</a> to unlock all premium templates.</span>
                                </div>
                            </div>
                        )}
                        <TemplatePicker selectedTemplate={selectedTemplate} onSelect={setSelectedTemplate} isPaidUser={isPaidUser} />
                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setActiveTab("preview")} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition">
                                Preview Selected Template →
                            </button>
                        </div>
                    </div>
                )}

                {/* PREVIEW TAB */}
                {!splitView && activeTab === "preview" && (
                    <div className="bg-neutral-200 dark:bg-neutral-950 min-h-full flex flex-col items-center py-8 px-4">
                        <div className="mb-4 flex items-center gap-4 flex-wrap">
                            <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                                Template: <span className="text-neutral-800 dark:text-white font-bold">{currentTemplateDef?.name}</span>
                                {currentTemplateDef?.hasPhoto && <span className="ml-2 text-blue-500 text-xs">(photo template)</span>}
                            </p>
                            <button onClick={() => setActiveTab("templates")} className="text-xs text-indigo-600 dark:text-indigo-400 underline font-bold">Change template</button>
                            <PdfDownloadButton data={resumeDataForPreview} templateId={selectedTemplate} />
                        </div>
                        <div ref={previewRef} className="w-full max-w-[800px] shadow-2xl overflow-hidden" style={{ zoom: 0.85 }}>
                            <CvTemplateRenderer templateId={selectedTemplate} data={resumeDataForPreview} />
                        </div>
                    </div>
                )}

                {/* SPLIT VIEW — live preview right pane */}
                {splitView && (
                    <div className="w-[45%] min-w-[320px] flex-shrink-0 overflow-auto bg-neutral-200 dark:bg-neutral-950 flex flex-col items-center py-6 px-3">
                        <div className="text-xs font-bold text-neutral-400 text-center mb-3 uppercase tracking-widest flex items-center justify-center gap-2 w-full">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
                            Live Preview · {currentTemplateDef?.name}
                        </div>
                        <div ref={previewRef} className="w-full max-w-[640px] shadow-2xl overflow-hidden bg-white" style={{ zoom: 0.62 }}>
                            <CvTemplateRenderer templateId={selectedTemplate} data={resumeDataForPreview} />
                        </div>
                        <div className="mt-4 flex gap-2">
                            <button onClick={() => { setSplitView(false); setActiveTab("templates"); }}
                                className="text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 px-3 py-1.5 rounded-lg font-bold hover:border-indigo-400 transition">
                                Change Template
                            </button>
                            <PdfDownloadButton data={resumeDataForPreview} templateId={selectedTemplate} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle, required }: { title: string; subtitle?: string; required?: boolean }) {
    return (
        <div className="mb-4 border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-1.5">
                {title}{required && <span className="text-red-500 text-base">*</span>}
            </h2>
            {subtitle && <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>}
        </div>
    );
}

function FF({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div>
            <label className="text-xs font-bold uppercase text-neutral-500 dark:text-neutral-400 mb-1.5 block">
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
        </div>
    );
}

function AddBtn({ onClick, label }: { onClick: () => void; label: string }) {
    return (
        <button onClick={onClick}
            className="w-full py-3 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl text-neutral-500 font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:border-indigo-400 transition-all flex justify-center items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> {label}
        </button>
    );
}
