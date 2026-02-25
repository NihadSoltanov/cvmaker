"use client";

import React from "react";
import { Lock, Star, Check } from "lucide-react";

interface CvTemplateData {
    basicInfo: any;
    summary: string;
    experience: any[];
    education: any[];
    projects: any[];
    skills: string[];
    languages: string[];
    photo?: string | null;
}

interface Template {
    id: string;
    name: string;
    description: string;
    tag: string;
    isPro: boolean;
    isRecommended?: boolean;
    hasPhoto: boolean;
    accentColor: string;
}

export const CV_TEMPLATES: Template[] = [
    {
        id: "classic",
        name: "Classic ATS",
        description: "Clean black & white, single-column layout. Highest ATS pass rate guaranteed.",
        tag: "Most Popular",
        isPro: false,
        isRecommended: true,
        hasPhoto: false,
        accentColor: "#000000"
    },
    {
        id: "modern",
        name: "Modern Pro",
        description: "Two-column with sidebar, skill bars, clean typography.",
        tag: "Modern",
        isPro: false,
        hasPhoto: true,
        accentColor: "#4f46e5"
    },
    {
        id: "executive",
        name: "Executive",
        description: "Premium layout for senior roles with accented header and clean sections.",
        tag: "Professional",
        isPro: true,
        hasPhoto: false,
        accentColor: "#0f172a"
    },
    {
        id: "creative",
        name: "Creative",
        description: "Bold typography, colored accents — great for designers & marketers.",
        tag: "Creative",
        isPro: true,
        isRecommended: false,
        hasPhoto: true,
        accentColor: "#7c3aed"
    },
    {
        id: "minimal",
        name: "Minimal Clean",
        description: "Ultra-minimal: only text, compact spacing. Perfect for tech profiles.",
        tag: "Tech",
        isPro: false,
        hasPhoto: false,
        accentColor: "#374151"
    },
    {
        id: "euro",
        name: "Euro CV",
        description: "Europass-inspired format. Preferred for European job markets.",
        tag: "International",
        isPro: true,
        hasPhoto: true,
        accentColor: "#0055a4"
    }
];

interface TemplatePickerProps {
    selectedTemplate: string;
    onSelect: (id: string) => void;
    isPaidUser?: boolean;
}

export function TemplatePicker({ selectedTemplate, onSelect, isPaidUser = false }: TemplatePickerProps) {
    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CV_TEMPLATES.map(tpl => {
                const isLocked = tpl.isPro && !isPaidUser;
                return (
                    <button
                        key={tpl.id}
                        onClick={() => !isLocked && onSelect(tpl.id)}
                        className={`relative rounded-2xl p-5 text-left border-2 transition-all group ${selectedTemplate === tpl.id
                                ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 shadow-lg shadow-indigo-500/10"
                                : "border-neutral-200 dark:border-neutral-800 bg-white/40 dark:bg-neutral-900/40 hover:border-neutral-400 dark:hover:border-neutral-600"
                            } ${isLocked ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                        {/* Pro badge */}
                        {tpl.isPro && (
                            <span className="absolute top-3 right-3 flex items-center gap-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                                {isLocked ? <Lock className="w-3 h-3" /> : <Star className="w-3 h-3" />}
                                Pro
                            </span>
                        )}

                        {/* Recommended badge */}
                        {tpl.isRecommended && (
                            <span className="absolute top-3 left-3 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                                ✓ Recommended
                            </span>
                        )}

                        {/* Template preview chip */}
                        <div className="h-24 mb-3 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 flex items-center justify-center mt-4"
                            style={{ background: `${tpl.accentColor}15` }}>
                            <div className="space-y-1.5 px-4 py-3 w-full text-left">
                                <div className="h-2.5 rounded w-2/3" style={{ background: tpl.accentColor, opacity: 0.9 }}></div>
                                <div className="h-1.5 rounded w-1/2 bg-neutral-300 dark:bg-neutral-600"></div>
                                <div className="h-1 rounded w-full bg-neutral-200 dark:bg-neutral-700 mt-2"></div>
                                <div className="h-1 rounded w-5/6 bg-neutral-200 dark:bg-neutral-700"></div>
                                <div className="h-1 rounded w-4/5 bg-neutral-200 dark:bg-neutral-700"></div>
                            </div>
                        </div>

                        <div className="flex items-start justify-between mb-1">
                            <h4 className="font-bold text-sm text-neutral-900 dark:text-white">{tpl.name}</h4>
                            {selectedTemplate === tpl.id && (
                                <Check className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                            )}
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">{tpl.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wide text-neutral-400 border border-neutral-200 dark:border-neutral-700 px-2 py-0.5 rounded-full">{tpl.tag}</span>
                            {tpl.hasPhoto && <span className="text-[10px] font-bold uppercase tracking-wide text-blue-400 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full">📷 Photo</span>}
                        </div>

                        {isLocked && (
                            <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-sm">
                                <div className="text-center">
                                    <Lock className="w-5 h-5 mx-auto text-neutral-500 mb-1" />
                                    <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400">Upgrade to Pro</p>
                                </div>
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

// =================== TEMPLATE RENDERERS ===================

function TemplateClassic({ d }: { d: CvTemplateData }) {
    return (
        <div className="font-serif text-black bg-white p-12" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
            <div className="text-center border-b-2 border-black pb-4 mb-6">
                <h1 className="text-3xl font-bold uppercase tracking-widest">{d.basicInfo?.fullName || "YOUR NAME"}</h1>
                <div className="flex flex-wrap justify-center gap-x-4 text-sm mt-2">
                    {d.basicInfo?.phone && <span>{d.basicInfo.phone}</span>}
                    {d.basicInfo?.email && <span>{d.basicInfo.email}</span>}
                    {d.basicInfo?.location && <span>{d.basicInfo.location}</span>}
                </div>
                <div className="flex flex-wrap justify-center gap-x-4 text-sm mt-1">
                    {d.basicInfo?.linkedin && <span>{d.basicInfo.linkedin}</span>}
                    {d.basicInfo?.portfolio && <span>{d.basicInfo.portfolio}</span>}
                </div>
            </div>
            {d.summary && (
                <SectionClassic title="Summary">
                    <p className="text-[13px] leading-relaxed">{d.summary}</p>
                </SectionClassic>
            )}
            {d.experience?.some((e: any) => e.company || e.role) && (
                <SectionClassic title="Experience">
                    {d.experience.map((e: any, i: number) => (
                        <div key={i} className="mb-4">
                            <div className="flex justify-between"><span className="font-bold text-[14px]">{e.role}</span><span className="text-[13px]">{e.startDate}{e.endDate ? ` – ${e.endDate}` : ''}</span></div>
                            <div className="italic text-[13px] mb-1">{e.company}</div>
                            <div className="text-[13px] leading-relaxed pl-4">
                                {e.description?.split('\n').map((line: string, li: number) => {
                                    const c = line.trim().replace(/^[-•]\s*/, '');
                                    return c ? <ul key={li}><li className="list-disc">{c}</li></ul> : null;
                                })}
                            </div>
                        </div>
                    ))}
                </SectionClassic>
            )}
            {d.education?.some((e: any) => e.institution) && (
                <SectionClassic title="Education">
                    {d.education.map((e: any, i: number) => (
                        <div key={i} className="flex justify-between mb-2">
                            <div><div className="font-bold text-[14px]">{e.institution}</div><div className="text-[13px]">{e.degree}</div></div>
                            <span className="text-[13px] text-right">{e.startDate}{e.endDate ? ` – ${e.endDate}` : ''}</span>
                        </div>
                    ))}
                </SectionClassic>
            )}
            {(d.skills?.length > 0 || d.languages?.length > 0) && (
                <SectionClassic title="Skills & Languages">
                    {d.skills?.length > 0 && <p className="text-[13px]"><strong>Skills:</strong> {d.skills.join(', ')}</p>}
                    {d.languages?.length > 0 && <p className="text-[13px] mt-1"><strong>Languages:</strong> {d.languages.join(', ')}</p>}
                </SectionClassic>
            )}
        </div>
    );
}

function SectionClassic({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mb-5">
            <h2 className="text-base font-bold uppercase tracking-widest border-b border-black mb-2 pb-0.5">{title}</h2>
            {children}
        </div>
    );
}

function TemplateModern({ d }: { d: CvTemplateData }) {
    return (
        <div className="flex text-black bg-white font-sans" style={{ fontFamily: "Arial, Helvetica, sans-serif", minHeight: 1100 }}>
            {/* Sidebar */}
            <div className="w-[200px] flex-shrink-0 bg-indigo-700 text-white p-6 flex flex-col gap-5">
                {d.photo && <img src={d.photo} alt="Profile" className="w-28 h-28 rounded-full object-cover mx-auto border-2 border-white/30 mb-2" />}
                <div>
                    <h1 className="text-lg font-extrabold leading-tight">{d.basicInfo?.fullName || "YOUR NAME"}</h1>
                </div>
                <div className="space-y-1 text-[11px]">
                    {d.basicInfo?.phone && <p>📞 {d.basicInfo.phone}</p>}
                    {d.basicInfo?.email && <p>✉ {d.basicInfo.email}</p>}
                    {d.basicInfo?.location && <p>📍 {d.basicInfo.location}</p>}
                    {d.basicInfo?.linkedin && <p>🔗 {d.basicInfo.linkedin}</p>}
                </div>
                {d.skills?.length > 0 && (
                    <div>
                        <h3 className="font-bold text-[11px] uppercase tracking-widest mb-2 border-b border-white/30 pb-1">Skills</h3>
                        <div className="space-y-2">
                            {d.skills.map((s: string, i: number) => (
                                <div key={i}>
                                    <span className="text-[11px]">{s}</span>
                                    <div className="h-1 mt-0.5 bg-white/20 rounded-full"><div className="h-1 bg-white/70 rounded-full" style={{ width: `${75 + Math.random() * 20}%` }}></div></div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {d.languages?.length > 0 && (
                    <div>
                        <h3 className="font-bold text-[11px] uppercase tracking-widest mb-2 border-b border-white/30 pb-1">Languages</h3>
                        {d.languages.map((l: string, i: number) => <p key={i} className="text-[11px]">{l}</p>)}
                    </div>
                )}
            </div>
            {/* Main */}
            <div className="flex-1 p-8">
                {d.summary && <div className="mb-6"><h2 className="text-sm font-bold uppercase text-indigo-700 mb-1">About Me</h2><p className="text-[12px] leading-relaxed text-gray-700">{d.summary}</p></div>}
                {d.experience?.some((e: any) => e.company) && (
                    <div className="mb-6">
                        <h2 className="text-sm font-bold uppercase text-indigo-700 border-b border-indigo-200 pb-1 mb-3">Experience</h2>
                        {d.experience.map((e: any, i: number) => (
                            <div key={i} className="mb-3">
                                <div className="flex justify-between"><span className="font-bold text-[13px]">{e.role}</span><span className="text-[11px] text-gray-500">{e.startDate}{e.endDate ? ` – ${e.endDate}` : ''}</span></div>
                                <div className="text-[12px] text-indigo-600 font-medium mb-1">{e.company}</div>
                                <p className="text-[12px] text-gray-600 leading-relaxed">{e.description}</p>
                            </div>
                        ))}
                    </div>
                )}
                {d.education?.some((e: any) => e.institution) && (
                    <div className="mb-6">
                        <h2 className="text-sm font-bold uppercase text-indigo-700 border-b border-indigo-200 pb-1 mb-3">Education</h2>
                        {d.education.map((e: any, i: number) => (
                            <div key={i} className="flex justify-between mb-2">
                                <div><div className="font-bold text-[13px]">{e.institution}</div><div className="text-[12px] text-gray-500">{e.degree}</div></div>
                                <span className="text-[11px] text-gray-400">{e.startDate}{e.endDate ? ` – ${e.endDate}` : ''}</span>
                            </div>
                        ))}
                    </div>
                )}
                {d.projects?.some((p: any) => p.title) && (
                    <div>
                        <h2 className="text-sm font-bold uppercase text-indigo-700 border-b border-indigo-200 pb-1 mb-3">Projects</h2>
                        {d.projects.map((p: any, i: number) => (
                            <div key={i} className="mb-2">
                                <div className="font-bold text-[13px]">{p.title} {p.link && <span className="font-normal text-[11px] text-gray-400">| {p.link}</span>}</div>
                                <p className="text-[12px] text-gray-600">{p.description}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function TemplateMinimal({ d }: { d: CvTemplateData }) {
    return (
        <div className="bg-white text-gray-800 p-10 font-mono" style={{ fontFamily: "'Courier New', monospace" }}>
            <div className="border-l-4 border-gray-800 pl-4 mb-8">
                <h1 className="text-2xl font-bold text-gray-900">{d.basicInfo?.fullName || "YOUR NAME"}</h1>
                <p className="text-sm text-gray-500 mt-1">
                    {[d.basicInfo?.email, d.basicInfo?.phone, d.basicInfo?.location].filter(Boolean).join(" · ")}
                </p>
            </div>
            {d.summary && <div className="mb-6"><p className="text-sm leading-relaxed text-gray-600">{d.summary}</p></div>}
            {d.experience?.some((e: any) => e.company) && (
                <div className="mb-6">
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">// EXPERIENCE</h2>
                    {d.experience.map((e: any, i: number) => (
                        <div key={i} className="mb-4">
                            <div className="flex gap-2 items-baseline">
                                <span className="font-bold text-sm text-gray-900">{e.role}</span>
                                <span className="text-gray-400 text-xs">at {e.company}</span>
                                <span className="ml-auto text-xs text-gray-400">{e.startDate}{e.endDate ? `–${e.endDate}` : ''}</span>
                            </div>
                            <p className="text-xs mt-1 leading-relaxed text-gray-600 pl-2 border-l border-gray-200">{e.description}</p>
                        </div>
                    ))}
                </div>
            )}
            {d.education?.some((e: any) => e.institution) && (
                <div className="mb-6">
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">// EDUCATION</h2>
                    {d.education.map((e: any, i: number) => (
                        <div key={i} className="flex justify-between text-sm mb-1">
                            <span className="font-bold">{e.institution}</span>
                            <span className="text-gray-400 text-xs">{e.degree} · {e.startDate}{e.endDate ? `–${e.endDate}` : ''}</span>
                        </div>
                    ))}
                </div>
            )}
            {d.skills?.length > 0 && (
                <div>
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">// SKILLS</h2>
                    <p className="text-xs text-gray-600">{d.skills.join(' · ')}</p>
                </div>
            )}
        </div>
    );
}

function TemplateExecutive({ d }: { d: CvTemplateData }) {
    return (
        <div className="bg-white text-black font-sans p-12">
            <div className="bg-gray-900 text-white -mx-12 -mt-12 mb-8 px-12 py-8">
                <h1 className="text-4xl font-bold tracking-tight mb-1">{d.basicInfo?.fullName || "Your Name"}</h1>
                <div className="flex flex-wrap gap-x-6 text-sm text-gray-300 mt-2">
                    {d.basicInfo?.phone && <span>{d.basicInfo.phone}</span>}
                    {d.basicInfo?.email && <span>{d.basicInfo.email}</span>}
                    {d.basicInfo?.location && <span>{d.basicInfo.location}</span>}
                    {d.basicInfo?.linkedin && <span>{d.basicInfo.linkedin}</span>}
                </div>
            </div>
            {d.summary && (<div className="mb-6"><p className="text-sm leading-relaxed text-gray-700 border-l-2 border-gray-900 pl-4 italic">{d.summary}</p></div>)}
            {d.experience?.some((e: any) => e.company) && (
                <div className="mb-6">
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-4 text-gray-900 after:content-[''] after:block after:mt-1 after:h-[2px] after:w-12 after:bg-gray-900">Professional Experience</h2>
                    {d.experience.map((e: any, i: number) => (
                        <div key={i} className="mb-4">
                            <div className="flex justify-between items-baseline mb-0.5">
                                <span className="font-bold">{e.role}</span><span className="text-xs text-gray-400">{e.startDate}{e.endDate ? ` – ${e.endDate}` : ''}</span>
                            </div>
                            <div className="text-sm text-gray-500 italic mb-1">{e.company}</div>
                            <p className="text-[13px] leading-relaxed text-gray-600">{e.description}</p>
                        </div>
                    ))}
                </div>
            )}
            {d.education?.some((e: any) => e.institution) && (
                <div className="mb-6">
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-4 text-gray-900 after:content-[''] after:block after:mt-1 after:h-[2px] after:w-12 after:bg-gray-900">Education</h2>
                    {d.education.map((e: any, i: number) => (
                        <div key={i} className="flex justify-between text-sm mb-2">
                            <div><div className="font-bold">{e.institution}</div><div className="text-gray-500">{e.degree}</div></div>
                            <span className="text-gray-400 text-xs">{e.startDate}{e.endDate ? ` – ${e.endDate}` : ''}</span>
                        </div>
                    ))}
                </div>
            )}
            {(d.skills?.length > 0 || d.languages?.length > 0) && (
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-2 text-gray-900">Core Competencies</h2>
                    {d.skills?.length > 0 && <div className="flex flex-wrap gap-2">{d.skills.map((s: string, i: number) => <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{s}</span>)}</div>}
                </div>
            )}
        </div>
    );
}

function TemplateCreative({ d }: { d: CvTemplateData }) {
    return (
        <div className="bg-white text-black" style={{ fontFamily: "Georgia, serif" }}>
            <div className="bg-violet-700 text-white px-10 py-8 flex items-center gap-6">
                {d.photo && <img src={d.photo} alt="" className="w-24 h-24 rounded-full border-2 border-white/40 object-cover flex-shrink-0" />}
                <div>
                    <h1 className="text-3xl font-bold">{d.basicInfo?.fullName || "Your Name"}</h1>
                    <div className="text-sm text-violet-200 flex flex-wrap gap-x-4 mt-2">
                        {d.basicInfo?.phone && <span>{d.basicInfo.phone}</span>}
                        {d.basicInfo?.email && <span>{d.basicInfo.email}</span>}
                        {d.basicInfo?.location && <span>{d.basicInfo.location}</span>}
                    </div>
                </div>
            </div>
            <div className="p-10">
                {d.summary && <div className="mb-6"><p className="text-[13px] leading-relaxed text-gray-700">{d.summary}</p></div>}
                {d.experience?.some((e: any) => e.company) && (
                    <div className="mb-6">
                        <h2 className="text-base font-bold text-violet-700 border-b-2 border-violet-100 pb-1 mb-3 uppercase tracking-wider">Experience</h2>
                        {d.experience.map((e: any, i: number) => (
                            <div key={i} className="mb-4 pl-3 border-l-2 border-violet-100">
                                <div className="flex justify-between"><span className="font-bold text-[14px]">{e.role}</span><span className="text-[12px] text-gray-400">{e.startDate}{e.endDate ? `–${e.endDate}` : ''}</span></div>
                                <div className="text-[13px] text-violet-600 mb-1">{e.company}</div>
                                <p className="text-[12px] text-gray-600 leading-relaxed">{e.description}</p>
                            </div>
                        ))}
                    </div>
                )}
                {d.education?.some((e: any) => e.institution) && (
                    <div className="mb-6">
                        <h2 className="text-base font-bold text-violet-700 border-b-2 border-violet-100 pb-1 mb-3 uppercase tracking-wider">Education</h2>
                        {d.education.map((e: any, i: number) => (
                            <div key={i} className="flex justify-between mb-2">
                                <div><div className="font-bold text-[14px]">{e.institution}</div><div className="text-[13px] text-gray-500">{e.degree}</div></div>
                                <span className="text-[12px] text-gray-400">{e.startDate}{e.endDate ? `–${e.endDate}` : ''}</span>
                            </div>
                        ))}
                    </div>
                )}
                {d.skills?.length > 0 && (
                    <div>
                        <h2 className="text-base font-bold text-violet-700 border-b-2 border-violet-100 pb-1 mb-3 uppercase tracking-wider">Skills</h2>
                        <div className="flex flex-wrap gap-2">
                            {d.skills.map((s: string, i: number) => <span key={i} className="bg-violet-50 text-violet-700 text-[12px] px-3 py-1 rounded-full border border-violet-100">{s}</span>)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function TemplateEuro({ d }: { d: CvTemplateData }) {
    return (
        <div className="bg-white text-black p-10" style={{ fontFamily: "Arial, sans-serif" }}>
            {/* Euro Header */}
            <div className="flex items-start gap-6 mb-6 border-b-2 border-blue-700 pb-4">
                {d.photo && <img src={d.photo} alt="" className="w-28 h-28 object-cover border border-gray-300 flex-shrink-0" />}
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-blue-800">{(d.basicInfo?.fullName || "Your Name").toUpperCase()}</h1>
                    <table className="w-full mt-3 text-[12px]">
                        <tbody>
                            {d.basicInfo?.phone && <tr><td className="text-gray-500 w-32 pb-1">Telephone</td><td>{d.basicInfo.phone}</td></tr>}
                            {d.basicInfo?.email && <tr><td className="text-gray-500 pb-1">E-mail</td><td>{d.basicInfo.email}</td></tr>}
                            {d.basicInfo?.location && <tr><td className="text-gray-500 pb-1">Address</td><td>{d.basicInfo.location}</td></tr>}
                            {d.basicInfo?.linkedin && <tr><td className="text-gray-500 pb-1">LinkedIn</td><td>{d.basicInfo.linkedin}</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
            {d.summary && (<div className="mb-6"><h2 className="text-[13px] font-bold text-blue-800 uppercase border-b border-blue-100 mb-2 pb-1">Personal Statement</h2><p className="text-[12px] leading-relaxed">{d.summary}</p></div>)}
            {d.experience?.some((e: any) => e.company) && (
                <div className="mb-6">
                    <h2 className="text-[13px] font-bold text-blue-800 uppercase border-b border-blue-100 mb-3 pb-1">Work Experience</h2>
                    {d.experience.map((e: any, i: number) => (
                        <div key={i} className="flex gap-4 mb-4">
                            <div className="w-32 text-[11px] text-gray-500 flex-shrink-0">{e.startDate}{e.endDate ? <><br />–<br />{e.endDate}</> : ''}</div>
                            <div className="flex-1">
                                <div className="font-bold text-[13px]">{e.role}</div>
                                <div className="text-[12px] italic mb-1">{e.company}</div>
                                <p className="text-[12px] leading-relaxed">{e.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {d.education?.some((e: any) => e.institution) && (
                <div className="mb-6">
                    <h2 className="text-[13px] font-bold text-blue-800 uppercase border-b border-blue-100 mb-3 pb-1">Education and Training</h2>
                    {d.education.map((e: any, i: number) => (
                        <div key={i} className="flex gap-4 mb-3">
                            <div className="w-32 text-[11px] text-gray-500 flex-shrink-0">{e.startDate}{e.endDate ? ` – ${e.endDate}` : ''}</div>
                            <div><div className="font-bold text-[13px]">{e.degree}</div><div className="text-[12px]">{e.institution}</div></div>
                        </div>
                    ))}
                </div>
            )}
            {(d.skills?.length > 0 || d.languages?.length > 0) && (
                <div>
                    <h2 className="text-[13px] font-bold text-blue-800 uppercase border-b border-blue-100 mb-2 pb-1">Skills</h2>
                    {d.skills?.length > 0 && <p className="text-[12px] mb-1"><strong>Technical:</strong> {d.skills.join(', ')}</p>}
                    {d.languages?.length > 0 && <p className="text-[12px]"><strong>Languages:</strong> {d.languages.join(', ')}</p>}
                </div>
            )}
        </div>
    );
}

export function CvTemplateRenderer({ templateId, data }: { templateId: string; data: CvTemplateData }) {
    switch (templateId) {
        case "modern": return <TemplateModern d={data} />;
        case "executive": return <TemplateExecutive d={data} />;
        case "creative": return <TemplateCreative d={data} />;
        case "minimal": return <TemplateMinimal d={data} />;
        case "euro": return <TemplateEuro d={data} />;
        default: return <TemplateClassic d={data} />;
    }
}
