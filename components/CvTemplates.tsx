"use client";

import React from "react";
import { Lock, Star, Check } from "lucide-react";

// ─────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────
export interface CvData {
    basicInfo?: {
        fullName?: string; email?: string; phone?: string;
        location?: string; linkedin?: string; portfolio?: string;
    };
    summary?: string;
    experience?: { company?: string; role?: string; startDate?: string; endDate?: string; description?: string }[];
    education?: { institution?: string; degree?: string; startDate?: string; endDate?: string }[];
    projects?: { title?: string; description?: string; link?: string }[];
    skills?: string[];
    languages?: string[];
    photo?: string | null;
    certifications?: { name?: string; issuer?: string; date?: string }[];
    volunteerWork?: { organization?: string; role?: string; startDate?: string; endDate?: string; description?: string }[];
}

export interface TemplateInfo {
    id: string; name: string; description: string; tag: string;
    isPro: boolean; isRecommended?: boolean; hasPhoto: boolean; accentColor: string;
}

export const CV_TEMPLATES: TemplateInfo[] = [
    { id: "classic", name: "Classic ATS", description: "Clean single-column, black & white. Highest ATS pass rate.", tag: "Most Popular", isPro: false, isRecommended: true, hasPhoto: false, accentColor: "#111111" },
    { id: "modern", name: "Modern Sidebar", description: "Two-column with indigo sidebar and skill bars.", tag: "Modern", isPro: false, hasPhoto: true, accentColor: "#4338ca" },
    { id: "minimal", name: "Minimal Tech", description: "Ultra-clean monospace, preferred by engineers.", tag: "Tech", isPro: false, hasPhoto: false, accentColor: "#374151" },
    { id: "executive", name: "Executive Dark", description: "Dramatic dark header — ideal for C-suite and directors.", tag: "Senior", isPro: true, hasPhoto: false, accentColor: "#0f172a" },
    { id: "creative", name: "Creative Accent", description: "Bold color accents — great for designers, marketers.", tag: "Creative", isPro: true, hasPhoto: true, accentColor: "#7c3aed" },
    { id: "euro", name: "Euro CV", description: "Europass-inspired layout for European job markets.", tag: "International", isPro: true, hasPhoto: true, accentColor: "#0055a4" },
];

// ─────────────────────────────────────────────────
// TEMPLATE PICKER
// ─────────────────────────────────────────────────
export function TemplatePicker({ selectedTemplate, onSelect, isPaidUser = false }: {
    selectedTemplate: string; onSelect: (id: string) => void; isPaidUser?: boolean;
}) {
    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CV_TEMPLATES.map(tpl => {
                const isLocked = tpl.isPro && !isPaidUser;
                const isSelected = selectedTemplate === tpl.id;
                return (
                    <button key={tpl.id} onClick={() => !isLocked && onSelect(tpl.id)}
                        className={`relative rounded-2xl p-4 text-left border-2 transition-all ${isSelected ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-900/25 shadow-md shadow-indigo-500/10" : "border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/40 hover:border-neutral-400"} ${isLocked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}>
                        {tpl.isPro && (
                            <span className="absolute top-2 right-2 flex items-center gap-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                                {isLocked ? <Lock className="w-3 h-3" /> : <Star className="w-3 h-3" />} Pro
                            </span>
                        )}
                        {tpl.isRecommended && <span className="absolute top-2 left-2 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">✓ ATS Best</span>}
                        {/* Mini preview */}
                        <div className="mt-4 mb-3 h-20 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700" style={{ background: `${tpl.accentColor}14` }}>
                            <div style={{ padding: "8px 12px" }}>
                                <div style={{ height: 9, borderRadius: 3, background: tpl.accentColor, width: "58%", marginBottom: 5 }} />
                                <div style={{ height: 4, borderRadius: 2, background: "#d1d5db", width: "42%", marginBottom: 4 }} />
                                <div style={{ height: 3, borderRadius: 2, background: "#e5e7eb", width: "95%", marginBottom: 3 }} />
                                <div style={{ height: 3, borderRadius: 2, background: "#e5e7eb", width: "78%", marginBottom: 3 }} />
                                <div style={{ height: 3, borderRadius: 2, background: "#e5e7eb", width: "85%" }} />
                            </div>
                        </div>
                        <div className="flex items-start justify-between mb-1">
                            <h4 className="font-bold text-sm text-neutral-900 dark:text-white">{tpl.name}</h4>
                            {isSelected && <Check className="w-4 h-4 text-indigo-500 flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{tpl.description}</p>
                        <div className="mt-2 flex gap-1 flex-wrap">
                            <span className="text-[10px] font-semibold text-neutral-400 border border-neutral-200 dark:border-neutral-700 px-2 py-0.5 rounded-full">{tpl.tag}</span>
                            {tpl.hasPhoto && <span className="text-[10px] font-semibold text-blue-400 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full">📷 Photo</span>}
                        </div>
                        {isLocked && (
                            <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-white/75 dark:bg-black/75 backdrop-blur-sm">
                                <div className="text-center"><Lock className="w-5 h-5 mx-auto text-neutral-400 mb-1" /><p className="text-xs font-bold text-neutral-500">Upgrade to Pro</p></div>
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

// ─────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────
function fmtDate(d?: string) {
    if (!d) return "";
    if (d.length === 7 && d.includes("-")) {
        const [y, m] = d.split("-");
        return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][+m - 1] + " " + y;
    }
    return d;
}

function contactStr(d: CvData) {
    return [d.basicInfo?.phone, d.basicInfo?.email, d.basicInfo?.location].filter(Boolean).join("  •  ");
}
function linksStr(d: CvData) {
    return [d.basicInfo?.linkedin, d.basicInfo?.portfolio].filter(Boolean).join("  •  ");
}

function bullets(desc?: string) {
    if (!desc) return null;
    return desc.split("\n").map((line, i) => {
        const c = line.trim().replace(/^[•\-*]\s*/, "");
        return c ? <div key={i} style={{ display: "flex", gap: 6, marginBottom: 2 }}><span style={{ flexShrink: 0, marginTop: 1 }}>•</span><span>{c}</span></div> : null;
    });
}

// ═══════════════════════════════════════════════════
// TEMPLATE 1: CLASSIC ATS
// ═══════════════════════════════════════════════════
function TemplateClassic({ d }: { d: CvData }) {
    const S = {
        page: { fontFamily: "'Times New Roman', Times, serif", color: "#000", background: "#fff", padding: "52px 56px", fontSize: 12, lineHeight: 1.55 } as React.CSSProperties,
        name: { fontSize: 26, fontWeight: 700, textAlign: "center" as const, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 6 },
        contact: { textAlign: "center" as const, fontSize: 11, color: "#333", marginBottom: 3 },
        hr: { borderTop: "2px solid #000", margin: "12px 0 16px" },
        secTitle: { fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 2, borderBottom: "1px solid #000", paddingBottom: 2, marginBottom: 8, marginTop: 0 },
        sec: { marginBottom: 16 },
        expRow: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 1 } as React.CSSProperties,
        role: { fontWeight: 700, fontSize: 12 },
        dates: { fontSize: 10.5, color: "#555" },
        company: { fontStyle: "italic", fontSize: 11, marginBottom: 4, color: "#444" },
        bullet: { fontSize: 11, lineHeight: 1.5, paddingLeft: 12 },
    };
    return (
        <div style={S.page}>
            <div style={S.name}>{d.basicInfo?.fullName || "Your Name"}</div>
            {contactStr(d) && <div style={S.contact}>{contactStr(d)}</div>}
            {linksStr(d) && <div style={S.contact}>{linksStr(d)}</div>}
            <div style={S.hr} />

            {d.summary && (
                <div style={S.sec}>
                    <div style={S.secTitle}>Professional Summary</div>
                    <div style={{ fontSize: 11, lineHeight: 1.6 }}>{d.summary}</div>
                </div>
            )}
            {d.experience?.some(e => e.company || e.role) && (
                <div style={S.sec}>
                    <div style={S.secTitle}>Work Experience</div>
                    {d.experience!.map((e, i) => (
                        <div key={i} style={{ marginBottom: 12 }}>
                            <div style={S.expRow}>
                                <span style={S.role}>{e.role}</span>
                                <span style={S.dates}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : e.startDate ? " – Present" : ""}</span>
                            </div>
                            <div style={S.company}>{e.company}</div>
                            <div style={S.bullet}>{bullets(e.description)}</div>
                        </div>
                    ))}
                </div>
            )}
            {d.education?.some(e => e.institution) && (
                <div style={S.sec}>
                    <div style={S.secTitle}>Education</div>
                    {d.education!.map((e, i) => (
                        <div key={i} style={{ ...S.expRow as any, marginBottom: 8 }}>
                            <div><div style={{ fontWeight: 700, fontSize: 12 }}>{e.institution}</div><div style={{ fontSize: 11, color: "#444" }}>{e.degree}</div></div>
                            <div style={{ ...S.dates, textAlign: "right" as const }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</div>
                        </div>
                    ))}
                </div>
            )}
            {d.projects?.some(p => p.title) && (
                <div style={S.sec}>
                    <div style={S.secTitle}>Projects</div>
                    {d.projects!.map((p, i) => (
                        <div key={i} style={{ marginBottom: 8 }}>
                            <span style={{ fontWeight: 700, fontSize: 12 }}>{p.title}</span>
                            {p.link && <span style={{ fontSize: 10.5, color: "#666", marginLeft: 8 }}>| {p.link}</span>}
                            {p.description && <div style={{ fontSize: 11, lineHeight: 1.5, marginTop: 2 }}>{p.description}</div>}
                        </div>
                    ))}
                </div>
            )}
            {(d.skills?.length || d.languages?.length) ? (
                <div style={S.sec}>
                    <div style={S.secTitle}>Skills & Languages</div>
                    {d.skills && d.skills.length > 0 && <div style={{ fontSize: 11, marginBottom: 3 }}><strong>Skills:</strong> {d.skills.join(" · ")}</div>}
                    {d.languages && d.languages.length > 0 && <div style={{ fontSize: 11 }}><strong>Languages:</strong> {d.languages.join(" · ")}</div>}
                </div>
            ) : null}
        </div>
    );
}

// ═══════════════════════════════════════════════════
// TEMPLATE 2: MODERN SIDEBAR
// ═══════════════════════════════════════════════════
function TemplateModern({ d }: { d: CvData }) {
    const accent = "#4338ca";
    return (
        <div style={{ display: "flex", fontFamily: "Arial, Helvetica, sans-serif", minHeight: 1080, background: "#fff", color: "#111" }}>
            <div style={{ width: 215, flexShrink: 0, background: accent, color: "#fff", padding: "32px 18px 32px 22px", display: "flex", flexDirection: "column", gap: 0 }}>
                {d.photo && <img src={d.photo} alt="" style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", border: "2.5px solid rgba(255,255,255,0.35)", alignSelf: "center", marginBottom: 14 }} />}
                <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.3, marginBottom: 16 }}>{d.basicInfo?.fullName || "Your Name"}</div>
                <SideLabel>Contact</SideLabel>
                {d.basicInfo?.phone && <p style={{ fontSize: 10.5, marginBottom: 5, color: "rgba(255,255,255,.9)" }}>{d.basicInfo.phone}</p>}
                {d.basicInfo?.email && <p style={{ fontSize: 10.5, marginBottom: 5, wordBreak: "break-all", color: "rgba(255,255,255,.9)" }}>{d.basicInfo.email}</p>}
                {d.basicInfo?.location && <p style={{ fontSize: 10.5, marginBottom: 5, color: "rgba(255,255,255,.9)" }}>{d.basicInfo.location}</p>}
                {d.basicInfo?.linkedin && <p style={{ fontSize: 9.5, marginBottom: 5, wordBreak: "break-all", color: "rgba(255,255,255,.75)" }}>{d.basicInfo.linkedin}</p>}
                {d.basicInfo?.portfolio && <p style={{ fontSize: 9.5, wordBreak: "break-all", color: "rgba(255,255,255,.75)" }}>{d.basicInfo.portfolio}</p>}

                {d.skills && d.skills.length > 0 && <>
                    <SideLabel top>Skills</SideLabel>
                    {d.skills.slice(0, 10).map((sk, i) => (
                        <div key={i} style={{ marginBottom: 6 }}>
                            <p style={{ fontSize: 10.5, color: "rgba(255,255,255,.9)", marginBottom: 2 }}>{sk}</p>
                            <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.2)" }}>
                                <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.72)", width: `${65 + (i * 13 % 32)}%` }} />
                            </div>
                        </div>
                    ))}
                </>}
                {d.languages && d.languages.length > 0 && <>
                    <SideLabel top>Languages</SideLabel>
                    {d.languages.map((l, i) => <p key={i} style={{ fontSize: 10.5, color: "rgba(255,255,255,.9)", marginBottom: 3 }}>{l}</p>)}
                </>}
            </div>
            <div style={{ flex: 1, padding: "32px 28px 32px 26px" }}>
                {d.summary && <>
                    <ModSec title="About Me" accent={accent} />
                    <p style={{ fontSize: 11.5, color: "#444", lineHeight: 1.65, marginBottom: 18 }}>{d.summary}</p>
                </>}
                {d.experience?.some(e => e.company) && <>
                    <ModSec title="Experience" accent={accent} />
                    {d.experience!.map((e, i) => (
                        <div key={i} style={{ marginBottom: 14 }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ fontWeight: 700, fontSize: 13 }}>{e.role}</span>
                                <span style={{ fontSize: 10, color: "#999" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : e.startDate ? " – Present" : ""}</span>
                            </div>
                            <div style={{ fontSize: 11.5, color: accent, fontWeight: 700, marginBottom: 4 }}>{e.company}</div>
                            <p style={{ fontSize: 11, color: "#555", lineHeight: 1.6 }}>{e.description}</p>
                        </div>
                    ))}
                </>}
                {d.education?.some(e => e.institution) && <>
                    <ModSec title="Education" accent={accent} />
                    {d.education!.map((e, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                            <div><div style={{ fontWeight: 700, fontSize: 13 }}>{e.institution}</div><div style={{ fontSize: 11, color: "#666" }}>{e.degree}</div></div>
                            <span style={{ fontSize: 10, color: "#999" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</span>
                        </div>
                    ))}
                </>}
                {d.projects?.some(p => p.title) && <>
                    <ModSec title="Projects" accent={accent} />
                    {d.projects!.map((p, i) => (
                        <div key={i} style={{ marginBottom: 10 }}>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{p.title}{p.link && <span style={{ fontWeight: 400, fontSize: 10, color: "#888", marginLeft: 6 }}>| {p.link}</span>}</div>
                            <p style={{ fontSize: 11, color: "#555" }}>{p.description}</p>
                        </div>
                    ))}
                </>}
            </div>
        </div>
    );
}

function SideLabel({ children, top }: { children: React.ReactNode; top?: boolean }) {
    return <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,0.55)", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: 4, marginBottom: 8, marginTop: top ? 16 : 0 }}>{children}</div>;
}
function ModSec({ title, accent }: { title: string; accent: string }) {
    return <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.8, color: accent, borderBottom: `2px solid ${accent}40`, paddingBottom: 3, marginBottom: 10, marginTop: 0 }}>{title}</div>;
}

// ═══════════════════════════════════════════════════
// TEMPLATE 3: MINIMAL TECH
// ═══════════════════════════════════════════════════
function TemplateMinimal({ d }: { d: CvData }) {
    return (
        <div style={{ background: "#fff", color: "#111", fontFamily: "'Courier New', monospace", padding: "44px 50px", fontSize: 12, lineHeight: 1.65 }}>
            <div style={{ borderLeft: "4px solid #111", paddingLeft: 18, marginBottom: 30 }}>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{d.basicInfo?.fullName || "Your Name"}</div>
                <div style={{ fontSize: 11.5, color: "#555", marginTop: 5 }}>{contactStr(d)}</div>
                {linksStr(d) && <div style={{ fontSize: 10.5, color: "#888", marginTop: 3 }}>{linksStr(d)}</div>}
            </div>
            {d.summary && <p style={{ fontSize: 11.5, color: "#444", marginBottom: 26, lineHeight: 1.7, maxWidth: 620 }}>{d.summary}</p>}

            {d.experience?.some(e => e.company) && (
                <MinSec title="// EXPERIENCE">
                    {d.experience!.map((e, i) => (
                        <div key={i} style={{ marginBottom: 16 }}>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0 6px", alignItems: "baseline" }}>
                                <span style={{ fontWeight: 700, fontSize: 13 }}>{e.role}</span>
                                <span style={{ color: "#777" }}>@</span>
                                <span style={{ fontWeight: 600, color: "#333" }}>{e.company}</span>
                                <span style={{ marginLeft: "auto", fontSize: 10.5, color: "#999" }}>{fmtDate(e.startDate)}{e.endDate ? `–${fmtDate(e.endDate)}` : e.startDate ? "–Present" : ""}</span>
                            </div>
                            <p style={{ fontSize: 11, color: "#555", marginTop: 5, paddingLeft: 14, borderLeft: "2px solid #ddd", lineHeight: 1.65 }}>{e.description}</p>
                        </div>
                    ))}
                </MinSec>
            )}
            {d.education?.some(e => e.institution) && (
                <MinSec title="// EDUCATION">
                    {d.education!.map((e, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                            <span style={{ fontWeight: 700, fontSize: 12.5 }}>{e.institution}</span>
                            <span style={{ color: "#888", fontSize: 11 }}>{e.degree} · {fmtDate(e.startDate)}{e.endDate ? `–${fmtDate(e.endDate)}` : ""}</span>
                        </div>
                    ))}
                </MinSec>
            )}
            {d.skills && d.skills.length > 0 && (
                <MinSec title="// SKILLS">
                    <p style={{ fontSize: 11, color: "#555" }}>{d.skills.join(" · ")}</p>
                </MinSec>
            )}
            {d.languages && d.languages.length > 0 && (
                <MinSec title="// LANGUAGES">
                    <p style={{ fontSize: 11, color: "#555" }}>{d.languages.join(" · ")}</p>
                </MinSec>
            )}
        </div>
    );
}
function MinSec({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 3.5, color: "#aaa", marginBottom: 12 }}>{title}</div>
            {children}
        </div>
    );
}

// ═══════════════════════════════════════════════════
// TEMPLATE 4: EXECUTIVE DARK HEADER
// ═══════════════════════════════════════════════════
function TemplateExecutive({ d }: { d: CvData }) {
    return (
        <div style={{ background: "#fff", fontFamily: "Georgia, 'Times New Roman', serif", color: "#111" }}>
            <div style={{ background: "#0f172a", color: "#fff", padding: "38px 52px 30px" }}>
                <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5, marginBottom: 10 }}>{d.basicInfo?.fullName || "Your Name"}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0 28px", fontSize: 12.5, color: "#94a3b8" }}>
                    {d.basicInfo?.phone && <span>{d.basicInfo.phone}</span>}
                    {d.basicInfo?.email && <span>{d.basicInfo.email}</span>}
                    {d.basicInfo?.location && <span>{d.basicInfo.location}</span>}
                    {d.basicInfo?.linkedin && <span>{d.basicInfo.linkedin}</span>}
                </div>
            </div>
            <div style={{ padding: "30px 52px" }}>
                {d.summary && <div style={{ marginBottom: 22, paddingLeft: 18, borderLeft: "3.5px solid #0f172a", fontStyle: "italic", fontSize: 13, color: "#444", lineHeight: 1.7 }}>{d.summary}</div>}
                {d.experience?.some(e => e.company) && (
                    <ExecSec title="Professional Experience">
                        {d.experience!.map((e, i) => (
                            <div key={i} style={{ marginBottom: 16 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                    <span style={{ fontWeight: 700, fontSize: 14 }}>{e.role}</span>
                                    <span style={{ fontSize: 11, color: "#9ca3af" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : e.startDate ? " – Present" : ""}</span>
                                </div>
                                <div style={{ fontSize: 12.5, fontStyle: "italic", color: "#64748b", marginBottom: 4 }}>{e.company}</div>
                                <p style={{ fontSize: 12, lineHeight: 1.65, color: "#555" }}>{e.description}</p>
                            </div>
                        ))}
                    </ExecSec>
                )}
                {d.education?.some(e => e.institution) && (
                    <ExecSec title="Education">
                        {d.education!.map((e, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                                <div><div style={{ fontWeight: 700, fontSize: 14 }}>{e.institution}</div><div style={{ fontSize: 12, color: "#64748b" }}>{e.degree}</div></div>
                                <span style={{ fontSize: 11, color: "#9ca3af" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</span>
                            </div>
                        ))}
                    </ExecSec>
                )}
                {(d.skills?.length || d.languages?.length) ? (
                    <ExecSec title="Core Competencies">
                        {d.skills && d.skills.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                                {d.skills.map((sk, i) => <span key={i} style={{ fontSize: 11.5, background: "#f1f5f9", color: "#334155", padding: "4px 12px", borderRadius: 4, border: "1px solid #e2e8f0" }}>{sk}</span>)}
                            </div>
                        )}
                        {d.languages && d.languages.length > 0 && <p style={{ fontSize: 12, color: "#555" }}><strong>Languages:</strong> {d.languages.join(" · ")}</p>}
                    </ExecSec>
                ) : null}
            </div>
        </div>
    );
}
function ExecSec({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "#0f172a", marginBottom: 4 }}>{title}</div>
            <div style={{ height: 2.5, background: "#0f172a", width: 48, marginBottom: 14 }} />
            {children}
        </div>
    );
}

// ═══════════════════════════════════════════════════
// TEMPLATE 5: CREATIVE ACCENT
// ═══════════════════════════════════════════════════
function TemplateCreative({ d }: { d: CvData }) {
    const accent = "#7c3aed";
    return (
        <div style={{ background: "#fff", fontFamily: "Georgia, serif", color: "#111" }}>
            <div style={{ background: `linear-gradient(135deg, ${accent}, #a855f7)`, color: "#fff", padding: "30px 38px", display: "flex", alignItems: "center", gap: 24 }}>
                {d.photo && <img src={d.photo} alt="" style={{ width: 94, height: 94, borderRadius: "50%", objectFit: "cover", border: "2.5px solid rgba(255,255,255,0.4)", flexShrink: 0 }} />}
                <div>
                    <div style={{ fontSize: 30, fontWeight: 700, marginBottom: 8 }}>{d.basicInfo?.fullName || "Your Name"}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", display: "flex", flexWrap: "wrap", gap: "0 18px" }}>
                        {d.basicInfo?.phone && <span>{d.basicInfo.phone}</span>}
                        {d.basicInfo?.email && <span>{d.basicInfo.email}</span>}
                        {d.basicInfo?.location && <span>{d.basicInfo.location}</span>}
                    </div>
                    {linksStr(d) && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>{linksStr(d)}</div>}
                </div>
            </div>
            <div style={{ padding: "26px 38px" }}>
                {d.summary && <p style={{ fontSize: 12.5, color: "#555", lineHeight: 1.7, marginBottom: 22 }}>{d.summary}</p>}
                {d.experience?.some(e => e.company) && (
                    <CreSec title="Experience" accent={accent}>
                        {d.experience!.map((e, i) => (
                            <div key={i} style={{ marginBottom: 14, paddingLeft: 14, borderLeft: `3px solid ${accent}30` }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ fontWeight: 700, fontSize: 14 }}>{e.role}</span>
                                    <span style={{ fontSize: 11, color: "#999" }}>{fmtDate(e.startDate)}{e.endDate ? `–${fmtDate(e.endDate)}` : e.startDate ? "–Present" : ""}</span>
                                </div>
                                <div style={{ fontSize: 12.5, color: accent, fontWeight: 700, marginBottom: 5 }}>{e.company}</div>
                                <p style={{ fontSize: 12, color: "#666", lineHeight: 1.6 }}>{e.description}</p>
                            </div>
                        ))}
                    </CreSec>
                )}
                {d.education?.some(e => e.institution) && (
                    <CreSec title="Education" accent={accent}>
                        {d.education!.map((e, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                                <div><div style={{ fontWeight: 700, fontSize: 14 }}>{e.institution}</div><div style={{ fontSize: 12, color: "#666" }}>{e.degree}</div></div>
                                <span style={{ fontSize: 11, color: "#999" }}>{fmtDate(e.startDate)}{e.endDate ? `–${fmtDate(e.endDate)}` : ""}</span>
                            </div>
                        ))}
                    </CreSec>
                )}
                {d.skills && d.skills.length > 0 && (
                    <CreSec title="Skills" accent={accent}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {d.skills.map((sk, i) => <span key={i} style={{ fontSize: 12, background: `${accent}12`, color: accent, padding: "4px 14px", borderRadius: 20, border: `1px solid ${accent}30` }}>{sk}</span>)}
                        </div>
                    </CreSec>
                )}
                {d.languages && d.languages.length > 0 && (
                    <p style={{ fontSize: 12, color: "#555", marginTop: 16 }}><strong>Languages:</strong> {d.languages.join(" · ")}</p>
                )}
            </div>
        </div>
    );
}
function CreSec({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", color: accent, borderBottom: `2px solid ${accent}30`, paddingBottom: 5, marginBottom: 12, letterSpacing: 1.5 }}>{title}</div>
            {children}
        </div>
    );
}

// ═══════════════════════════════════════════════════
// TEMPLATE 6: EURO CV
// ═══════════════════════════════════════════════════
function TemplateEuro({ d }: { d: CvData }) {
    const accent = "#0055a4";
    return (
        <div style={{ background: "#fff", fontFamily: "Arial, Helvetica, sans-serif", color: "#111", padding: "38px 46px", fontSize: 12 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 22, borderBottom: `3.5px solid ${accent}`, paddingBottom: 18, marginBottom: 18 }}>
                {d.photo && <img src={d.photo} alt="" style={{ width: 104, height: 126, objectFit: "cover", border: "1px solid #ddd", flexShrink: 0 }} />}
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: accent, letterSpacing: 0.5, marginBottom: 8, textTransform: "uppercase" }}>{d.basicInfo?.fullName || "Your Name"}</div>
                    <table style={{ fontSize: 12, borderCollapse: "collapse" }}>
                        <tbody>
                            {d.basicInfo?.phone && <tr><td style={{ color: "#888", paddingRight: 18, paddingBottom: 3, width: 120, verticalAlign: "top" }}>Telephone</td><td>{d.basicInfo.phone}</td></tr>}
                            {d.basicInfo?.email && <tr><td style={{ color: "#888", paddingRight: 18, paddingBottom: 3, verticalAlign: "top" }}>E-mail</td><td>{d.basicInfo.email}</td></tr>}
                            {d.basicInfo?.location && <tr><td style={{ color: "#888", paddingRight: 18, paddingBottom: 3, verticalAlign: "top" }}>Address</td><td>{d.basicInfo.location}</td></tr>}
                            {d.basicInfo?.linkedin && <tr><td style={{ color: "#888", paddingRight: 18, paddingBottom: 3, verticalAlign: "top" }}>LinkedIn</td><td>{d.basicInfo.linkedin}</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
            {d.summary && <EuroSec title="Personal Statement" accent={accent}><p style={{ lineHeight: 1.7 }}>{d.summary}</p></EuroSec>}
            {d.experience?.some(e => e.company) && (
                <EuroSec title="Work Experience" accent={accent}>
                    {d.experience!.map((e, i) => (
                        <div key={i} style={{ display: "flex", gap: 18, marginBottom: 16 }}>
                            <div style={{ width: 112, flexShrink: 0, fontSize: 11, color: "#777", lineHeight: 1.4 }}>{fmtDate(e.startDate)}<br />—<br />{e.endDate ? fmtDate(e.endDate) : e.startDate ? "Present" : ""}</div>
                            <div><div style={{ fontWeight: 700, fontSize: 13 }}>{e.role}</div><div style={{ fontStyle: "italic", color: accent, marginBottom: 4 }}>{e.company}</div><p style={{ lineHeight: 1.65, color: "#444" }}>{e.description}</p></div>
                        </div>
                    ))}
                </EuroSec>
            )}
            {d.education?.some(e => e.institution) && (
                <EuroSec title="Education & Training" accent={accent}>
                    {d.education!.map((e, i) => (
                        <div key={i} style={{ display: "flex", gap: 18, marginBottom: 10 }}>
                            <div style={{ width: 112, flexShrink: 0, fontSize: 11, color: "#777" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</div>
                            <div><div style={{ fontWeight: 700, fontSize: 13 }}>{e.degree}</div><div style={{ color: "#444" }}>{e.institution}</div></div>
                        </div>
                    ))}
                </EuroSec>
            )}
            {(d.skills?.length || d.languages?.length) ? (
                <EuroSec title="Skills & Competencies" accent={accent}>
                    {d.skills && d.skills.length > 0 && <p style={{ marginBottom: 5 }}><strong>Technical:</strong> {d.skills.join(", ")}</p>}
                    {d.languages && d.languages.length > 0 && <p><strong>Languages:</strong> {d.languages.join(", ")}</p>}
                </EuroSec>
            ) : null}
        </div>
    );
}
function EuroSec({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", color: accent, borderBottom: `1.5px solid ${accent}45`, paddingBottom: 4, marginBottom: 12, letterSpacing: 1.2 }}>{title}</div>
            {children}
        </div>
    );
}

// ─────────────────────────────────────────────────
// RENDERER DISPATCHER
// ─────────────────────────────────────────────────
export function CvTemplateRenderer({ templateId, data }: { templateId: string; data: CvData }) {
    switch (templateId) {
        case "modern": return <TemplateModern d={data} />;
        case "executive": return <TemplateExecutive d={data} />;
        case "creative": return <TemplateCreative d={data} />;
        case "minimal": return <TemplateMinimal d={data} />;
        case "euro": return <TemplateEuro d={data} />;
        default: return <TemplateClassic d={data} />;
    }
}
