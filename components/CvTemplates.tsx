"use client";

import React from "react";
import { Lock, Star, Check } from "lucide-react";

export interface CvData {
    basicInfo?: {
        fullName?: string;
        email?: string;
        phone?: string;
        location?: string;
        linkedin?: string;
        portfolio?: string;
    };
    summary?: string;
    experience?: { company?: string; role?: string; startDate?: string; endDate?: string; description?: string }[];
    education?: { institution?: string; degree?: string; startDate?: string; endDate?: string }[];
    projects?: { title?: string; description?: string; link?: string }[];
    skills?: string[];
    languages?: string[];
    photo?: string | null;
    certifications?: { name?: string; issuer?: string; date?: string }[];
    awards?: { name?: string; issuer?: string; date?: string }[];
    volunteerWork?: { organization?: string; role?: string; startDate?: string; endDate?: string; description?: string }[];
}

// ==========================================================
// TEMPLATE METADATA
// ==========================================================
export interface TemplateInfo {
    id: string;
    name: string;
    description: string;
    tag: string;
    isPro: boolean;
    isRecommended?: boolean;
    hasPhoto: boolean;
    accentColor: string;
}

export const CV_TEMPLATES: TemplateInfo[] = [
    { id: "classic", name: "Classic ATS", description: "Clean black & white, single-column. Highest ATS pass rate guaranteed.", tag: "Most Popular", isPro: false, isRecommended: true, hasPhoto: false, accentColor: "#000000" },
    { id: "modern", name: "Modern Pro", description: "Two-column with sidebar, skill bars, accent theme.", tag: "Modern", isPro: false, hasPhoto: true, accentColor: "#4f46e5" },
    { id: "minimal", name: "Minimal Clean", description: "Ultra-minimal, compact monospace. Perfect for tech profiles.", tag: "Tech", isPro: false, hasPhoto: false, accentColor: "#374151" },
    { id: "executive", name: "Executive", description: "Premium dark header layout for senior leadership roles.", tag: "Senior", isPro: true, hasPhoto: false, accentColor: "#0f172a" },
    { id: "creative", name: "Creative", description: "Bold typography with color accents — great for designers & marketers.", tag: "Creative", isPro: true, hasPhoto: true, accentColor: "#7c3aed" },
    { id: "euro", name: "Euro CV", description: "Europass-inspired. Preferred for European & international job markets.", tag: "International", isPro: true, hasPhoto: true, accentColor: "#0055a4" },
];

// ==========================================================
// TEMPLATE PICKER
// ==========================================================
export function TemplatePicker({ selectedTemplate, onSelect, isPaidUser = false }: { selectedTemplate: string; onSelect: (id: string) => void; isPaidUser?: boolean }) {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {CV_TEMPLATES.map(tpl => {
                const isLocked = tpl.isPro && !isPaidUser;
                const isSelected = selectedTemplate === tpl.id;
                return (
                    <button
                        key={tpl.id}
                        onClick={() => !isLocked && onSelect(tpl.id)}
                        className={`relative rounded-2xl p-4 text-left border-2 transition-all group ${isSelected ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 shadow-lg shadow-indigo-500/10" : "border-neutral-200 dark:border-neutral-800 bg-white/40 dark:bg-neutral-900/40 hover:border-neutral-400 dark:hover:border-neutral-600"} ${isLocked ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                        {tpl.isPro && (
                            <span className="absolute top-2 right-2 flex items-center gap-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                                {isLocked ? <Lock className="w-3 h-3" /> : <Star className="w-3 h-3" />} Pro
                            </span>
                        )}
                        {tpl.isRecommended && (
                            <span className="absolute top-2 left-2 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">✓ Best</span>
                        )}
                        <div className="h-20 mb-3 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden mt-4" style={{ background: `${tpl.accentColor}18` }}>
                            <div style={{ padding: "10px 14px" }}>
                                <div style={{ height: 10, borderRadius: 4, background: tpl.accentColor, opacity: 0.9, width: "60%", marginBottom: 6 }}></div>
                                <div style={{ height: 5, borderRadius: 3, background: "#d1d5db", width: "45%", marginBottom: 4 }}></div>
                                <div style={{ height: 4, borderRadius: 3, background: "#e5e7eb", width: "100%", marginBottom: 3 }}></div>
                                <div style={{ height: 4, borderRadius: 3, background: "#e5e7eb", width: "80%" }}></div>
                            </div>
                        </div>
                        <div className="flex items-start justify-between mb-1">
                            <h4 className="font-bold text-sm text-neutral-900 dark:text-white">{tpl.name}</h4>
                            {isSelected && <Check className="w-4 h-4 text-indigo-500 flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">{tpl.description}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-wide text-neutral-400 border border-neutral-200 dark:border-neutral-700 px-2 py-0.5 rounded-full">{tpl.tag}</span>
                            {tpl.hasPhoto && <span className="text-[10px] font-bold text-blue-400 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full">📷 Photo</span>}
                        </div>
                        {isLocked && (
                            <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-white/70 dark:bg-black/70 backdrop-blur-sm">
                                <div className="text-center">
                                    <Lock className="w-5 h-5 mx-auto text-neutral-400 mb-1" />
                                    <p className="text-xs font-bold text-neutral-500">Upgrade to Pro</p>
                                </div>
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

// ==========================================================
// HELPER: Format month value (2026-02 → Feb 2026)
// ==========================================================
function fmtDate(d?: string) {
    if (!d) return "";
    if (d.includes("-") && d.length === 7) {
        const [year, month] = d.split("-");
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${months[parseInt(month, 10) - 1]} ${year}`;
    }
    return d;
}

function contactLine(d: CvData) {
    const parts = [d.basicInfo?.phone, d.basicInfo?.email, d.basicInfo?.location].filter(Boolean);
    return parts.join("  •  ");
}

function linksLine(d: CvData) {
    const parts = [d.basicInfo?.linkedin, d.basicInfo?.portfolio].filter(Boolean);
    return parts.join("  •  ");
}

// ==========================================================
// TEMPLATE 1: CLASSIC ATS (No Tailwind, pure inline CSS)
// ==========================================================
function TemplateClassic({ d }: { d: CvData }) {
    const s = {
        page: { fontFamily: "'Times New Roman', Times, serif", color: "#000", background: "#fff", padding: "48px 52px", fontSize: 13, lineHeight: 1.5 } as React.CSSProperties,
        headerName: { fontSize: 26, fontWeight: 700, textAlign: "center" as const, letterSpacing: 2, marginBottom: 4, textTransform: "uppercase" as const },
        headerContact: { textAlign: "center" as const, fontSize: 12, color: "#333", marginBottom: 3 },
        divider: { borderTop: "2px solid #000", margin: "10px 0 14px" },
        sectionTitle: { fontSize: 13, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1.5, borderBottom: "1px solid #000", paddingBottom: 2, marginBottom: 8, marginTop: 0 },
        section: { marginBottom: 16 },
        expHeader: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 1 },
        expRole: { fontWeight: 700, fontSize: 13 },
        expDates: { fontSize: 12, color: "#444" },
        expCompany: { fontStyle: "italic", fontSize: 12, marginBottom: 4 },
        bullet: { fontSize: 12, marginBottom: 2, paddingLeft: 12 },
        eduRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 },
        tag: { fontSize: 12 },
    };

    const renderBullets = (description?: string) => {
        if (!description) return null;
        return description.split("\n").map((line, li) => {
            const clean = line.trim().replace(/^[•\-*]\s*/, "");
            if (!clean) return null;
            return <div key={li} style={s.bullet}>• {clean}</div>;
        });
    };

    return (
        <div id="cv-print-area" style={s.page}>
            <div style={s.headerName}>{d.basicInfo?.fullName || "Your Name"}</div>
            {contactLine(d) && <div style={s.headerContact}>{contactLine(d)}</div>}
            {linksLine(d) && <div style={s.headerContact}>{linksLine(d)}</div>}
            <div style={s.divider} />

            {d.summary && (
                <div style={s.section}>
                    <div style={s.sectionTitle}>Professional Summary</div>
                    <div style={{ fontSize: 12, lineHeight: 1.6 }}>{d.summary}</div>
                </div>
            )}

            {d.experience && d.experience.some(e => e.company || e.role) && (
                <div style={s.section}>
                    <div style={s.sectionTitle}>Experience</div>
                    {d.experience.map((exp, i) => (
                        <div key={i} style={{ marginBottom: 10 }}>
                            <div style={s.expHeader}>
                                <div style={s.expRole}>{exp.role || "Role"}</div>
                                <div style={s.expDates}>{fmtDate(exp.startDate)}{exp.endDate ? ` – ${fmtDate(exp.endDate)}` : exp.startDate ? " – Present" : ""}</div>
                            </div>
                            <div style={s.expCompany}>{exp.company}</div>
                            {renderBullets(exp.description)}
                        </div>
                    ))}
                </div>
            )}

            {d.education && d.education.some(e => e.institution) && (
                <div style={s.section}>
                    <div style={s.sectionTitle}>Education</div>
                    {d.education.map((edu, i) => (
                        <div key={i} style={s.eduRow}>
                            <div><div style={{ fontWeight: 700, fontSize: 13 }}>{edu.institution}</div><div style={{ fontSize: 12, color: "#444" }}>{edu.degree}</div></div>
                            <div style={{ fontSize: 12, textAlign: "right" as const }}>{fmtDate(edu.startDate)}{edu.endDate ? ` – ${fmtDate(edu.endDate)}` : ""}</div>
                        </div>
                    ))}
                </div>
            )}

            {d.projects && d.projects.some(p => p.title) && (
                <div style={s.section}>
                    <div style={s.sectionTitle}>Projects</div>
                    {d.projects.map((p, i) => (
                        <div key={i} style={{ marginBottom: 8 }}>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{p.title}{p.link ? <span style={{ fontWeight: 400, fontSize: 11, color: "#555", marginLeft: 6 }}>| {p.link}</span> : ""}</div>
                            {p.description && <div style={{ fontSize: 12, lineHeight: 1.5 }}>{p.description}</div>}
                        </div>
                    ))}
                </div>
            )}

            {d.certifications && d.certifications.some(c => c.name) && (
                <div style={s.section}>
                    <div style={s.sectionTitle}>Certifications</div>
                    {d.certifications.map((c, i) => (
                        <div key={i} style={{ fontSize: 12, marginBottom: 3 }}>
                            <strong>{c.name}</strong>{c.issuer ? ` — ${c.issuer}` : ""}{c.date ? `, ${fmtDate(c.date)}` : ""}
                        </div>
                    ))}
                </div>
            )}

            {d.volunteerWork && d.volunteerWork.some(v => v.organization) && (
                <div style={s.section}>
                    <div style={s.sectionTitle}>Volunteer Work</div>
                    {d.volunteerWork.map((v, i) => (
                        <div key={i} style={{ marginBottom: 6 }}>
                            <div style={s.expHeader}>
                                <div style={s.expRole}>{v.role} @ {v.organization}</div>
                                <div style={s.expDates}>{fmtDate(v.startDate)}{v.endDate ? ` – ${fmtDate(v.endDate)}` : ""}</div>
                            </div>
                            {v.description && <div style={{ fontSize: 12 }}>{v.description}</div>}
                        </div>
                    ))}
                </div>
            )}

            {(d.skills?.length || d.languages?.length) ? (
                <div style={s.section}>
                    <div style={s.sectionTitle}>Skills & Languages</div>
                    {d.skills && d.skills.length > 0 && <div style={{ fontSize: 12, marginBottom: 3 }}><strong>Skills:</strong> {d.skills.join(" · ")}</div>}
                    {d.languages && d.languages.length > 0 && <div style={{ fontSize: 12 }}><strong>Languages:</strong> {d.languages.join(" · ")}</div>}
                </div>
            ) : null}
        </div>
    );
}

// ==========================================================
// TEMPLATE 2: MODERN PRO
// ==========================================================
function TemplateModern({ d }: { d: CvData }) {
    const accent = "#4f46e5";
    return (
        <div style={{ display: "flex", fontFamily: "Arial, Helvetica, sans-serif", minHeight: 1050, background: "#fff", color: "#000" }}>
            {/* Sidebar */}
            <div style={{ width: 210, flexShrink: 0, background: accent, color: "#fff", padding: "28px 18px", display: "flex", flexDirection: "column", gap: 20 }}>
                {d.photo && <img src={d.photo} alt="Profile" style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.3)", alignSelf: "center", marginBottom: 8 }} />}
                <div>
                    <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.3, marginBottom: 4 }}>{d.basicInfo?.fullName || "Your Name"}</div>
                </div>
                <div>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, borderBottom: "1px solid rgba(255,255,255,0.3)", paddingBottom: 4, marginBottom: 8 }}>Contact</div>
                    {d.basicInfo?.phone && <div style={{ fontSize: 11, marginBottom: 4 }}>📞 {d.basicInfo.phone}</div>}
                    {d.basicInfo?.email && <div style={{ fontSize: 11, marginBottom: 4, wordBreak: "break-all" }}>✉ {d.basicInfo.email}</div>}
                    {d.basicInfo?.location && <div style={{ fontSize: 11, marginBottom: 4 }}>📍 {d.basicInfo.location}</div>}
                    {d.basicInfo?.linkedin && <div style={{ fontSize: 11, marginBottom: 4, wordBreak: "break-all" }}>🔗 {d.basicInfo.linkedin}</div>}
                    {d.basicInfo?.portfolio && <div style={{ fontSize: 11, wordBreak: "break-all" }}>🌐 {d.basicInfo.portfolio}</div>}
                </div>
                {d.skills && d.skills.length > 0 && (
                    <div>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, borderBottom: "1px solid rgba(255,255,255,0.3)", paddingBottom: 4, marginBottom: 8 }}>Skills</div>
                        {d.skills.map((sk, i) => (
                            <div key={i} style={{ marginBottom: 6 }}>
                                <div style={{ fontSize: 11, marginBottom: 3 }}>{sk}</div>
                                <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.2)" }}>
                                    <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.75)", width: `${70 + (i * 7) % 25}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {d.languages && d.languages.length > 0 && (
                    <div>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, borderBottom: "1px solid rgba(255,255,255,0.3)", paddingBottom: 4, marginBottom: 8 }}>Languages</div>
                        {d.languages.map((l, i) => <div key={i} style={{ fontSize: 11, marginBottom: 3 }}>{l}</div>)}
                    </div>
                )}
            </div>
            {/* Main */}
            <div style={{ flex: 1, padding: "28px 28px" }}>
                {d.summary && (
                    <div style={{ marginBottom: 18 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: accent, borderBottom: `2px solid ${accent}`, paddingBottom: 3, marginBottom: 6 }}>About Me</div>
                        <p style={{ fontSize: 12, lineHeight: 1.6, color: "#444" }}>{d.summary}</p>
                    </div>
                )}
                {d.experience && d.experience.some(e => e.company) && (
                    <div style={{ marginBottom: 18 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: accent, borderBottom: `2px solid ${accent}`, paddingBottom: 3, marginBottom: 10 }}>Experience</div>
                        {d.experience.map((e, i) => (
                            <div key={i} style={{ marginBottom: 12 }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ fontWeight: 700, fontSize: 13 }}>{e.role}</span>
                                    <span style={{ fontSize: 11, color: "#888" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : e.startDate ? " – Present" : ""}</span>
                                </div>
                                <div style={{ fontSize: 12, color: accent, fontWeight: 600, marginBottom: 4 }}>{e.company}</div>
                                <p style={{ fontSize: 12, color: "#555", lineHeight: 1.55 }}>{e.description}</p>
                            </div>
                        ))}
                    </div>
                )}
                {d.education && d.education.some(e => e.institution) && (
                    <div style={{ marginBottom: 18 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: accent, borderBottom: `2px solid ${accent}`, paddingBottom: 3, marginBottom: 10 }}>Education</div>
                        {d.education.map((e, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                <div><div style={{ fontWeight: 700, fontSize: 13 }}>{e.institution}</div><div style={{ fontSize: 12, color: "#666" }}>{e.degree}</div></div>
                                <span style={{ fontSize: 11, color: "#888" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</span>
                            </div>
                        ))}
                    </div>
                )}
                {d.projects && d.projects.some(p => p.title) && (
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: accent, borderBottom: `2px solid ${accent}`, paddingBottom: 3, marginBottom: 10 }}>Projects</div>
                        {d.projects.map((p, i) => (
                            <div key={i} style={{ marginBottom: 8 }}>
                                <div style={{ fontWeight: 700, fontSize: 13 }}>{p.title} {p.link && <span style={{ fontWeight: 400, fontSize: 11, color: "#888" }}>| {p.link}</span>}</div>
                                <p style={{ fontSize: 12, color: "#555" }}>{p.description}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ==========================================================
// TEMPLATE 3: MINIMAL CLEAN
// ==========================================================
function TemplateMinimal({ d }: { d: CvData }) {
    return (
        <div style={{ background: "#fff", color: "#111", fontFamily: "'Courier New', monospace", padding: "40px 48px", fontSize: 12, lineHeight: 1.6 }}>
            <div style={{ borderLeft: "4px solid #111", paddingLeft: 16, marginBottom: 28 }}>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{d.basicInfo?.fullName || "Your Name"}</div>
                <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>{contactLine(d)}</div>
                {linksLine(d) && <div style={{ fontSize: 11, color: "#777", marginTop: 2 }}>{linksLine(d)}</div>}
            </div>
            {d.summary && <p style={{ fontSize: 12, color: "#444", marginBottom: 24, lineHeight: 1.7 }}>{d.summary}</p>}
            {d.experience && d.experience.some(e => e.company) && (
                <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 3, color: "#999", marginBottom: 12 }}>// EXPERIENCE</div>
                    {d.experience.map((e, i) => (
                        <div key={i} style={{ marginBottom: 14 }}>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0 8px", alignItems: "baseline" }}>
                                <span style={{ fontWeight: 700, fontSize: 13 }}>{e.role}</span>
                                <span style={{ color: "#888" }}>at</span>
                                <span style={{ fontWeight: 600, color: "#444" }}>{e.company}</span>
                                <span style={{ marginLeft: "auto", fontSize: 11, color: "#999" }}>{fmtDate(e.startDate)}{e.endDate ? `–${fmtDate(e.endDate)}` : e.startDate ? "–Present" : ""}</span>
                            </div>
                            <p style={{ fontSize: 12, color: "#555", marginTop: 4, paddingLeft: 12, borderLeft: "2px solid #e5e7eb", lineHeight: 1.6 }}>{e.description}</p>
                        </div>
                    ))}
                </div>
            )}
            {d.education && d.education.some(e => e.institution) && (
                <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 3, color: "#999", marginBottom: 12 }}>// EDUCATION</div>
                    {d.education.map((e, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span style={{ fontWeight: 700 }}>{e.institution}</span>
                            <span style={{ color: "#777", fontSize: 11 }}>{e.degree} · {fmtDate(e.startDate)}{e.endDate ? `–${fmtDate(e.endDate)}` : ""}</span>
                        </div>
                    ))}
                </div>
            )}
            {d.skills && d.skills.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 3, color: "#999", marginBottom: 8 }}>// SKILLS</div>
                    <p style={{ fontSize: 12, color: "#555" }}>{d.skills.join(" · ")}</p>
                </div>
            )}
        </div>
    );
}

// ==========================================================
// TEMPLATE 4: EXECUTIVE
// ==========================================================
function TemplateExecutive({ d }: { d: CvData }) {
    return (
        <div style={{ background: "#fff", fontFamily: "Georgia, 'Times New Roman', serif", color: "#111" }}>
            <div style={{ background: "#0f172a", color: "#fff", padding: "36px 48px 28px" }}>
                <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.5, marginBottom: 8 }}>{d.basicInfo?.fullName || "Your Name"}</div>
                <div style={{ fontSize: 13, color: "#94a3b8", display: "flex", flexWrap: "wrap", gap: "0 24px" }}>
                    {d.basicInfo?.phone && <span>{d.basicInfo.phone}</span>}
                    {d.basicInfo?.email && <span>{d.basicInfo.email}</span>}
                    {d.basicInfo?.location && <span>{d.basicInfo.location}</span>}
                    {d.basicInfo?.linkedin && <span>{d.basicInfo.linkedin}</span>}
                </div>
            </div>
            <div style={{ padding: "28px 48px" }}>
                {d.summary && <div style={{ marginBottom: 20, paddingLeft: 16, borderLeft: "3px solid #0f172a", fontStyle: "italic", fontSize: 13, color: "#444", lineHeight: 1.65 }}>{d.summary}</div>}

                <Sec title="Professional Experience">
                    {d.experience?.filter(e => e.company || e.role).map((e, i) => (
                        <div key={i} style={{ marginBottom: 14 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                <span style={{ fontWeight: 700, fontSize: 14 }}>{e.role}</span>
                                <span style={{ fontSize: 12, color: "#999" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : e.startDate ? " – Present" : ""}</span>
                            </div>
                            <div style={{ fontSize: 13, fontStyle: "italic", color: "#666", marginBottom: 4 }}>{e.company}</div>
                            <p style={{ fontSize: 12, lineHeight: 1.6, color: "#555" }}>{e.description}</p>
                        </div>
                    ))}
                </Sec>

                <Sec title="Education">
                    {d.education?.filter(e => e.institution).map((e, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <div><div style={{ fontWeight: 700, fontSize: 14 }}>{e.institution}</div><div style={{ fontSize: 13, color: "#666" }}>{e.degree}</div></div>
                            <span style={{ fontSize: 12, color: "#999" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</span>
                        </div>
                    ))}
                </Sec>

                {(d.skills?.length || 0) + (d.languages?.length || 0) > 0 && (
                    <Sec title="Core Competencies">
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {d.skills?.map((s, i) => (
                                <span key={i} style={{ fontSize: 12, background: "#f1f5f9", color: "#334155", padding: "3px 10px", borderRadius: 4 }}>{s}</span>
                            ))}
                        </div>
                        {d.languages && d.languages.length > 0 && <p style={{ fontSize: 12, marginTop: 8, color: "#555" }}><strong>Languages:</strong> {d.languages.join(" · ")}</p>}
                    </Sec>
                )}
            </div>
        </div>
    );
}

function Sec({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: "#0f172a", marginBottom: 4 }}>{title}</div>
            <div style={{ height: 2, background: "#0f172a", width: 40, marginBottom: 12 }}></div>
            {children}
        </div>
    );
}

// ==========================================================
// TEMPLATE 5: CREATIVE
// ==========================================================
function TemplateCreative({ d }: { d: CvData }) {
    const accent = "#7c3aed";
    return (
        <div style={{ background: "#fff", fontFamily: "Georgia, serif", color: "#111" }}>
            <div style={{ background: accent, color: "#fff", padding: "28px 36px", display: "flex", alignItems: "center", gap: 20 }}>
                {d.photo && <img src={d.photo} alt="" style={{ width: 90, height: 90, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.4)", flexShrink: 0 }} />}
                <div>
                    <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>{d.basicInfo?.fullName || "Your Name"}</div>
                    <div style={{ fontSize: 12, color: "#ddd6fe", display: "flex", flexWrap: "wrap", gap: "0 16px" }}>
                        {d.basicInfo?.phone && <span>{d.basicInfo.phone}</span>}
                        {d.basicInfo?.email && <span>{d.basicInfo.email}</span>}
                        {d.basicInfo?.location && <span>{d.basicInfo.location}</span>}
                    </div>
                    {linksLine(d) && <div style={{ fontSize: 11, color: "#c4b5fd", marginTop: 3 }}>{linksLine(d)}</div>}
                </div>
            </div>
            <div style={{ padding: "24px 36px" }}>
                {d.summary && <p style={{ fontSize: 13, color: "#555", lineHeight: 1.65, marginBottom: 20 }}>{d.summary}</p>}

                {d.experience?.some(e => e.company) && (
                    <CSection title="Experience" accent={accent}>
                        {d.experience!.map((e, i) => (
                            <div key={i} style={{ marginBottom: 12, paddingLeft: 12, borderLeft: `3px solid ${accent}2a` }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ fontWeight: 700, fontSize: 14 }}>{e.role}</span>
                                    <span style={{ fontSize: 12, color: "#999" }}>{fmtDate(e.startDate)}{e.endDate ? `–${fmtDate(e.endDate)}` : e.startDate ? "–Present" : ""}</span>
                                </div>
                                <div style={{ fontSize: 13, color: accent, fontWeight: 600, marginBottom: 3 }}>{e.company}</div>
                                <p style={{ fontSize: 12, color: "#666", lineHeight: 1.55 }}>{e.description}</p>
                            </div>
                        ))}
                    </CSection>
                )}

                {d.education?.some(e => e.institution) && (
                    <CSection title="Education" accent={accent}>
                        {d.education!.map((e, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                <div><div style={{ fontWeight: 700, fontSize: 14 }}>{e.institution}</div><div style={{ fontSize: 12, color: "#666" }}>{e.degree}</div></div>
                                <span style={{ fontSize: 11, color: "#999" }}>{fmtDate(e.startDate)}{e.endDate ? `–${fmtDate(e.endDate)}` : ""}</span>
                            </div>
                        ))}
                    </CSection>
                )}

                {d.skills && d.skills.length > 0 && (
                    <CSection title="Skills" accent={accent}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {d.skills.map((sk, i) => <span key={i} style={{ fontSize: 12, background: `${accent}15`, color: accent, padding: "3px 12px", borderRadius: 20, border: `1px solid ${accent}30` }}>{sk}</span>)}
                        </div>
                    </CSection>
                )}
            </div>
        </div>
    );
}

function CSection({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: accent, borderBottom: `2px solid ${accent}30`, paddingBottom: 4, marginBottom: 10, letterSpacing: 1.2 }}>{title}</div>
            {children}
        </div>
    );
}

// ==========================================================
// TEMPLATE 6: EURO CV
// ==========================================================
function TemplateEuro({ d }: { d: CvData }) {
    const accent = "#0055a4";
    return (
        <div style={{ background: "#fff", fontFamily: "Arial, sans-serif", color: "#111", padding: "36px 44px", fontSize: 12 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 20, borderBottom: `3px solid ${accent}`, paddingBottom: 16, marginBottom: 16 }}>
                {d.photo && <img src={d.photo} alt="" style={{ width: 100, height: 120, objectFit: "cover", border: "1px solid #ccc", flexShrink: 0 }} />}
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: accent, letterSpacing: 0.5, marginBottom: 6 }}>{(d.basicInfo?.fullName || "Your Name").toUpperCase()}</div>
                    <table style={{ fontSize: 12, borderCollapse: "collapse" }}>
                        <tbody>
                            {d.basicInfo?.phone && <tr><td style={{ color: "#888", paddingRight: 16, paddingBottom: 3, width: 120 }}>Telephone</td><td>{d.basicInfo.phone}</td></tr>}
                            {d.basicInfo?.email && <tr><td style={{ color: "#888", paddingRight: 16, paddingBottom: 3 }}>E-mail</td><td>{d.basicInfo.email}</td></tr>}
                            {d.basicInfo?.location && <tr><td style={{ color: "#888", paddingRight: 16, paddingBottom: 3 }}>Address</td><td>{d.basicInfo.location}</td></tr>}
                            {d.basicInfo?.linkedin && <tr><td style={{ color: "#888", paddingRight: 16, paddingBottom: 3 }}>LinkedIn</td><td>{d.basicInfo.linkedin}</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {d.summary && <EuroSec title="Personal Statement" accent={accent}><p style={{ lineHeight: 1.65 }}>{d.summary}</p></EuroSec>}

            {d.experience?.some(e => e.company) && (
                <EuroSec title="Work Experience" accent={accent}>
                    {d.experience!.map((e, i) => (
                        <div key={i} style={{ display: "flex", gap: 16, marginBottom: 14 }}>
                            <div style={{ width: 110, flexShrink: 0, fontSize: 11, color: "#666", lineHeight: 1.4 }}>
                                {fmtDate(e.startDate)}<br />–<br />{e.endDate ? fmtDate(e.endDate) : e.startDate ? "Present" : ""}
                            </div>
                            <div>
                                <div style={{ fontWeight: 700 }}>{e.role}</div>
                                <div style={{ fontStyle: "italic", color: accent, marginBottom: 3 }}>{e.company}</div>
                                <p style={{ lineHeight: 1.6, color: "#444" }}>{e.description}</p>
                            </div>
                        </div>
                    ))}
                </EuroSec>
            )}

            {d.education?.some(e => e.institution) && (
                <EuroSec title="Education and Training" accent={accent}>
                    {d.education!.map((e, i) => (
                        <div key={i} style={{ display: "flex", gap: 16, marginBottom: 10 }}>
                            <div style={{ width: 110, flexShrink: 0, fontSize: 11, color: "#666" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</div>
                            <div><div style={{ fontWeight: 700 }}>{e.degree}</div><div style={{ color: "#444" }}>{e.institution}</div></div>
                        </div>
                    ))}
                </EuroSec>
            )}

            {(d.skills?.length || d.languages?.length) ? (
                <EuroSec title="Skills" accent={accent}>
                    {d.skills && d.skills.length > 0 && <p style={{ marginBottom: 4 }}><strong>Technical:</strong> {d.skills.join(", ")}</p>}
                    {d.languages && d.languages.length > 0 && <p><strong>Languages:</strong> {d.languages.join(", ")}</p>}
                </EuroSec>
            ) : null}
        </div>
    );
}

function EuroSec({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: accent, borderBottom: `1px solid ${accent}40`, paddingBottom: 3, marginBottom: 10, letterSpacing: 1 }}>{title}</div>
            {children}
        </div>
    );
}

// ==========================================================
// RENDERER DISPATCHER
// ==========================================================
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
