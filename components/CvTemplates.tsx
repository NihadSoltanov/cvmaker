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
    { id: "compact", name: "Compact Pro", description: "Dense single-column fitting maximum content.", tag: "Compact", isPro: false, hasPhoto: false, accentColor: "#1e293b" },
    { id: "timeline", name: "Timeline Flow", description: "Left-side timeline with a clean serif aesthetic.", tag: "Unique", isPro: true, hasPhoto: false, accentColor: "#92400e" },
    { id: "clean", name: "Clean Air", description: "Generous white space, big name, apple-style minimal.", tag: "Minimal", isPro: false, hasPhoto: false, accentColor: "#000000" },
    { id: "teal", name: "Teal Professional", description: "Teal sidebar with structured main content area.", tag: "Corporate", isPro: true, hasPhoto: true, accentColor: "#0d9488" },
    { id: "rose", name: "Rose Studio", description: "Rose accent — ideal for creative and design fields.", tag: "Creative", isPro: true, hasPhoto: true, accentColor: "#e11d48" },
    { id: "navy-gold", name: "Navy & Gold", description: "Dark navy header with gold accents — bold executive.", tag: "Executive", isPro: true, hasPhoto: false, accentColor: "#1e3a5f" },
    { id: "emerald", name: "Emerald Tech", description: "Emerald green accents for tech and startup roles.", tag: "Tech", isPro: true, hasPhoto: false, accentColor: "#059669" },
    { id: "academic", name: "Academic", description: "Traditional serif layout for academia and research.", tag: "Academic", isPro: true, hasPhoto: false, accentColor: "#1a202c" },
    { id: "startup", name: "Startup Bold", description: "Vivid gradient header — great for product and startup roles.", tag: "Bold", isPro: true, hasPhoto: true, accentColor: "#6d28d9" },
    { id: "terra", name: "Terra Warm", description: "Warm terracotta — earthy, welcoming, hospitality/HR roles.", tag: "Warm", isPro: true, hasPhoto: true, accentColor: "#c2410c" },
    { id: "cobalt", name: "Cobalt Modern", description: "Cobalt blue sidebar, crisp and modern.", tag: "Modern", isPro: true, hasPhoto: false, accentColor: "#1d4ed8" },
    { id: "forest", name: "Forest Elite", description: "Deep forest green — stands out in sustainability or finance.", tag: "Premium", isPro: true, hasPhoto: false, accentColor: "#14532d" },
    { id: "copper", name: "Copper Elegant", description: "Warm copper tones — sophisticated and memorable.", tag: "Elegant", isPro: true, hasPhoto: false, accentColor: "#b45309" },
    { id: "slate", name: "Slate Edge", description: "Slate-blue accents with bold section markers.", tag: "Modern", isPro: true, hasPhoto: false, accentColor: "#475569" },
    { id: "ats-pro", name: "ATS Pro Strict", description: "Zero color, Arial, single-column. Highest possible ATS parse rate.", tag: "ATS Pure", isPro: true, isRecommended: false, hasPhoto: false, accentColor: "#111111" },
    { id: "ats-harvard", name: "Harvard Format", description: "Centered header, Times New Roman — career-services gold standard.", tag: "ATS Classic", isPro: true, hasPhoto: false, accentColor: "#000000" },
    { id: "ats-impact", name: "ATS Impact", description: "Structured header bar + navy accent lines. ATS-safe with visual clarity.", tag: "ATS Pro", isPro: true, hasPhoto: false, accentColor: "#1e40af" },
    { id: "ats-federal", name: "Federal / Gov", description: "US USAJOBS-style with shaded section headers. Ideal for public sector.", tag: "ATS Gov", isPro: true, hasPhoto: false, accentColor: "#374151" },
    { id: "ats-consult", name: "Consulting", description: "McKinsey / Bain style — impact bullets, left accent strip, navy.", tag: "ATS Consulting", isPro: true, hasPhoto: false, accentColor: "#0f4c81" },
    { id: "ats-finance", name: "Finance / Banking", description: "Serif double-line headings. Conservative and ATS-safe for finance roles.", tag: "ATS Finance", isPro: true, hasPhoto: false, accentColor: "#111111" },
    { id: "ats-medical", name: "Medical / Healthcare", description: "Teal accent, credential-first layout for clinical and healthcare CVs.", tag: "ATS Medical", isPro: true, hasPhoto: false, accentColor: "#0e7490" },
    { id: "ats-it", name: "IT / Engineering", description: "Monospace font, skills-first layout. Ideal for developers and sysadmins.", tag: "ATS IT", isPro: true, hasPhoto: false, accentColor: "#111111" },
    { id: "ats-legal", name: "Legal", description: "Numbered Roman sections, formal serif. Best for law firms and courts.", tag: "ATS Legal", isPro: true, hasPhoto: false, accentColor: "#1a1a1a" },
    { id: "ats-sales", name: "Sales / BD", description: "Green accent, metrics-front bullets. Perfect for sales and BD roles.", tag: "ATS Sales", isPro: true, hasPhoto: false, accentColor: "#16a34a" },
    { id: "ats-stem", name: "STEM / Research", description: "Publication-style serif layout for scientists, engineers and researchers.", tag: "ATS STEM", isPro: true, hasPhoto: false, accentColor: "#1a1a1a" },
    { id: "ats-corporate", name: "Corporate Blue", description: "Dark navy header, clean single-column. Ideal for corporate/admin roles.", tag: "ATS Corporate", isPro: true, hasPhoto: false, accentColor: "#1e3a5f" },
    { id: "ats-exec-pro", name: "Executive Pro", description: "Large serif name, blockquote summary. For C-suite and senior leaders.", tag: "ATS Executive", isPro: true, hasPhoto: false, accentColor: "#000000" },
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

// ─── clickable link helpers ───────────────────────
function Lnk({ href, children, style }: { href?: string; children?: React.ReactNode; style?: React.CSSProperties }) {
    if (!href) return null;
    const url = href.startsWith("http://") || href.startsWith("https://") ? href : `https://${href}`;
    return <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 2, ...style }}>{children ?? href}</a>;
}
function CvLinksLine({ d, style }: { d: CvData; style?: React.CSSProperties }) {
    const links = [d.basicInfo?.linkedin, d.basicInfo?.portfolio].filter(Boolean) as string[];
    if (!links.length) return null;
    return (
        <div style={style}>
            {links.map((lnk, i) => (
                <React.Fragment key={i}>
                    {i > 0 && "  •  "}
                    <Lnk href={lnk}>{lnk}</Lnk>
                </React.Fragment>
            ))}
        </div>
    );
}

// ═══════════════════════════════════════════════════
// TEMPLATE 1: CLASSIC ATS
// ═══════════════════════════════════════════════════
function TemplateClassic({ d }: { d: CvData }) {
    const S = {
        page: { fontFamily: "'Times New Roman', Times, serif", color: "#1a1a1a", background: "#fff", padding: "42px 52px", fontSize: 11.5, lineHeight: 1.62 } as React.CSSProperties,
        name: { fontSize: 24, fontWeight: 700, textAlign: "center" as const, letterSpacing: 2.5, textTransform: "uppercase" as const, marginBottom: 7, color: "#000" },
        contact: { textAlign: "center" as const, fontSize: 10, color: "#444", marginBottom: 3 },
        hr: { borderTop: "1.5px solid #222", margin: "10px 0 14px" },
        secTitle: { fontSize: 11.5, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 2.5, borderBottom: "1.5px solid #222", paddingBottom: 3, marginBottom: 9, marginTop: 16, color: "#000" },
        sec: { marginBottom: 18 },
        expRow: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 } as React.CSSProperties,
        role: { fontWeight: 700, fontSize: 12.5, color: "#000" },
        dates: { fontSize: 10, color: "#666", fontStyle: "italic" as const },
        company: { fontStyle: "italic", fontSize: 11.5, marginBottom: 5, color: "#333" },
        bullet: { fontSize: 11, lineHeight: 1.62, paddingLeft: 14, marginBottom: 3 },
    };
    return (
        <div style={S.page}>
            <div style={S.name}>{d.basicInfo?.fullName || "Your Name"}</div>
            {contactStr(d) && <div style={S.contact}>{contactStr(d)}</div>}
            <CvLinksLine d={d} style={S.contact} />
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
                {d.basicInfo?.phone && <p style={{ fontSize: 10.5, marginBottom: 5, color: "rgba(255,255,255,.9)" }}><Lnk href={`tel:${d.basicInfo.phone}`}>{d.basicInfo.phone}</Lnk></p>}
                {d.basicInfo?.email && <p style={{ fontSize: 10.5, marginBottom: 5, wordBreak: "break-all", color: "rgba(255,255,255,.9)" }}><Lnk href={`mailto:${d.basicInfo.email}`}>{d.basicInfo.email}</Lnk></p>}
                {d.basicInfo?.location && <p style={{ fontSize: 10.5, marginBottom: 5, color: "rgba(255,255,255,.9)" }}>{d.basicInfo.location}</p>}
                {d.basicInfo?.linkedin && <p style={{ fontSize: 9.5, marginBottom: 5, wordBreak: "break-all", color: "rgba(255,255,255,.75)" }}><Lnk href={d.basicInfo.linkedin}>{d.basicInfo.linkedin}</Lnk></p>}
                {d.basicInfo?.portfolio && <p style={{ fontSize: 9.5, wordBreak: "break-all", color: "rgba(255,255,255,.75)" }}><Lnk href={d.basicInfo.portfolio}>{d.basicInfo.portfolio}</Lnk></p>}

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
                <CvLinksLine d={d} style={{ fontSize: 10.5, color: "#888", marginTop: 3 }} />
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
                    {d.basicInfo?.phone && <span><Lnk href={`tel:${d.basicInfo.phone}`}>{d.basicInfo.phone}</Lnk></span>}
                    {d.basicInfo?.email && <span><Lnk href={`mailto:${d.basicInfo.email}`}>{d.basicInfo.email}</Lnk></span>}
                    {d.basicInfo?.location && <span>{d.basicInfo.location}</span>}
                    {d.basicInfo?.linkedin && <span><Lnk href={d.basicInfo.linkedin}>{d.basicInfo.linkedin}</Lnk></span>}
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
                    {linksStr(d) && <CvLinksLine d={d} style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 4 }} />}
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
                            {d.basicInfo?.linkedin && <tr><td style={{ color: "#888", paddingRight: 18, paddingBottom: 3, verticalAlign: "top" }}>LinkedIn</td><td><Lnk href={d.basicInfo.linkedin}>{d.basicInfo.linkedin}</Lnk></td></tr>}
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

// ═══════════════════════════════════════════════════
// TEMPLATE 7: COMPACT PRO
// ═══════════════════════════════════════════════════
function TemplateCompact({ d }: { d: CvData }) {
    const S: Record<string, React.CSSProperties> = {
        page: { fontFamily: "Arial, Helvetica, sans-serif", color: "#111", background: "#fff", padding: "36px 44px", fontSize: 11, lineHeight: 1.5 },
        name: { fontSize: 20, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 3 },
        contact: { fontSize: 10, color: "#555", marginBottom: 10 },
        secTitle: { fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2.5, color: "#1e293b", borderBottom: "1.5px solid #1e293b", paddingBottom: 2, marginBottom: 6, marginTop: 12 },
        role: { fontWeight: 700, fontSize: 11 },
        dates: { fontSize: 9.5, color: "#777" },
        company: { fontSize: 10.5, color: "#444", fontStyle: "italic", marginBottom: 2 },
    };
    return (
        <div style={S.page}>
            <div style={S.name}>{d.basicInfo?.fullName || "Your Name"}</div>
            <div style={S.contact}>{[d.basicInfo?.phone, d.basicInfo?.email, d.basicInfo?.location, d.basicInfo?.linkedin].filter(Boolean).join("  |  ")}</div>
            {d.summary && <><div style={S.secTitle}>Summary</div><div style={{ fontSize: 10.5, lineHeight: 1.55, marginBottom: 4 }}>{d.summary}</div></>}
            {d.experience?.some(e => e.company) && <><div style={S.secTitle}>Experience</div>{d.experience!.map((e, i) => <div key={i} style={{ marginBottom: 8 }}><div style={{ display: "flex", justifyContent: "space-between" }}><span style={S.role}>{e.role}</span><span style={S.dates}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : e.startDate ? " – Present" : ""}</span></div><div style={S.company}>{e.company}</div><div style={{ fontSize: 10, lineHeight: 1.5 }}>{bullets(e.description)}</div></div>)}</>}
            {d.education?.some(e => e.institution) && <><div style={S.secTitle}>Education</div>{d.education!.map((e, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}><div><div style={{ fontWeight: 700, fontSize: 11 }}>{e.institution}</div><div style={{ fontSize: 10, color: "#555" }}>{e.degree}</div></div><span style={S.dates}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</span></div>)}</>}
            {(d.skills?.length || d.languages?.length) ? <><div style={S.secTitle}>Skills & Languages</div>{d.skills && d.skills.length > 0 && <div style={{ fontSize: 10.5, marginBottom: 3 }}><strong>Skills:</strong> {d.skills.join(" · ")}</div>}{d.languages && d.languages.length > 0 && <div style={{ fontSize: 10.5 }}><strong>Languages:</strong> {d.languages.join(" · ")}</div>}</> : null}
        </div>
    );
}

// ═══════════════════════════════════════════════════
// TEMPLATE 8: TIMELINE FLOW
// ═══════════════════════════════════════════════════
function TemplateTimeline({ d }: { d: CvData }) {
    const accent = "#92400e";
    return (
        <div style={{ background: "#fff", fontFamily: "Georgia, serif", color: "#1a1a1a", padding: "40px 48px", fontSize: 12 }}>
            <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: `3px solid ${accent}` }}>
                <div style={{ fontSize: 30, fontWeight: 700 }}>{d.basicInfo?.fullName || "Your Name"}</div>
                <div style={{ fontSize: 11.5, color: "#666", marginTop: 6 }}>{[d.basicInfo?.email, d.basicInfo?.phone, d.basicInfo?.location].filter(Boolean).join("  ·  ")}</div>
                <CvLinksLine d={d} style={{ fontSize: 10.5, color: "#999", marginTop: 3 }} />
            </div>
            {d.summary && <p style={{ fontSize: 12.5, color: "#444", lineHeight: 1.7, marginBottom: 24, fontStyle: "italic" }}>{d.summary}</p>}
            {d.experience?.some(e => e.company) && <>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2.5, color: accent, marginBottom: 12 }}>Experience</div>
                {d.experience!.map((e, i) => (
                    <div key={i} style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 24, flexShrink: 0 }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: accent, flexShrink: 0, marginTop: 4 }} />
                            {i < (d.experience!.length - 1) && <div style={{ flex: 1, width: 2, background: `${accent}30`, marginTop: 4 }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                <span style={{ fontWeight: 700, fontSize: 13 }}>{e.role}</span>
                                <span style={{ fontSize: 10.5, color: "#999" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : e.startDate ? " – Present" : ""}</span>
                            </div>
                            <div style={{ fontSize: 12, color: accent, fontStyle: "italic", marginBottom: 4 }}>{e.company}</div>
                            <p style={{ fontSize: 11.5, color: "#555", lineHeight: 1.65 }}>{e.description}</p>
                        </div>
                    </div>
                ))}
            </>}
            {d.education?.some(e => e.institution) && <>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2.5, color: accent, marginBottom: 12, marginTop: 18 }}>Education</div>
                {d.education!.map((e, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><div><div style={{ fontWeight: 700, fontSize: 13 }}>{e.institution}</div><div style={{ fontSize: 11.5, color: "#666" }}>{e.degree}</div></div><span style={{ fontSize: 10.5, color: "#999" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</span></div>)}
            </>}
            {(d.skills?.length || d.languages?.length) ? <><div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2.5, color: accent, marginBottom: 8, marginTop: 18 }}>Skills</div>{d.skills && d.skills.length > 0 && <p style={{ fontSize: 11.5 }}>{d.skills.join("  ·  ")}</p>}{d.languages && d.languages.length > 0 && <p style={{ fontSize: 11.5, marginTop: 6, color: "#555" }}><strong>Languages:</strong> {d.languages.join("  ·  ")}</p>}</> : null}
        </div>
    );
}

// ═══════════════════════════════════════════════════
// TEMPLATE 9: CLEAN AIR
// ═══════════════════════════════════════════════════
function TemplateClean({ d }: { d: CvData }) {
    return (
        <div style={{ background: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#000", padding: "56px 60px", fontSize: 12, lineHeight: 1.7 }}>
            <div style={{ marginBottom: 40 }}>
                <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: -1, marginBottom: 10 }}>{d.basicInfo?.fullName || "Your Name"}</div>
                <div style={{ fontSize: 13, color: "#666", display: "flex", flexWrap: "wrap", gap: "0 20px" }}>
                    {d.basicInfo?.email && <span>{d.basicInfo.email}</span>}
                    {d.basicInfo?.phone && <span>{d.basicInfo.phone}</span>}
                    {d.basicInfo?.location && <span>{d.basicInfo.location}</span>}
                </div>
                <CvLinksLine d={d} style={{ fontSize: 12, color: "#999", marginTop: 6 }} />
            </div>
            {d.summary && <><div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 3, color: "#000", marginBottom: 8 }}>About</div><p style={{ fontSize: 13.5, color: "#444", lineHeight: 1.75, maxWidth: 650, marginBottom: 32 }}>{d.summary}</p></>}
            {d.experience?.some(e => e.company) && <>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 3, color: "#000", marginBottom: 14 }}>Experience</div>
                {d.experience!.map((e, i) => <div key={i} style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "0 24px", marginBottom: 20 }}>
                    <div style={{ fontSize: 11, color: "#999", paddingTop: 2 }}>{fmtDate(e.startDate)}{e.endDate ? `\n${fmtDate(e.endDate)}` : e.startDate ? "\nPresent" : ""}</div>
                    <div><div style={{ fontWeight: 700, fontSize: 14 }}>{e.role}</div><div style={{ fontSize: 12, color: "#777", marginBottom: 4 }}>{e.company}</div><p style={{ fontSize: 12, color: "#555", lineHeight: 1.65 }}>{e.description}</p></div>
                </div>)}
            </>}
            {d.education?.some(e => e.institution) && <>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 3, color: "#000", marginBottom: 14, marginTop: 24 }}>Education</div>
                {d.education!.map((e, i) => <div key={i} style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "0 24px", marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: "#999" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</div>
                    <div><div style={{ fontWeight: 700, fontSize: 14 }}>{e.institution}</div><div style={{ fontSize: 12, color: "#777" }}>{e.degree}</div></div>
                </div>)}
            </>}
            {(d.skills?.length || d.languages?.length) ? <>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 3, color: "#000", marginBottom: 12, marginTop: 24 }}>Skills & Languages</div>
                {d.skills && d.skills.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>{d.skills.map((sk, i) => <span key={i} style={{ fontSize: 12, background: "#f3f4f6", color: "#374151", padding: "4px 14px", borderRadius: 20 }}>{sk}</span>)}</div>}
                {d.languages && d.languages.length > 0 && <p style={{ fontSize: 12, color: "#555" }}><strong>Languages:</strong> {d.languages.join("  ·  ")}</p>}
            </> : null}
        </div>
    );
}

// ═══════════════════════════════════════════════════
// TEMPLATE 10: TEAL PROFESSIONAL
// ═══════════════════════════════════════════════════
function TemplateTeal({ d }: { d: CvData }) {
    const accent = "#0d9488";
    return (
        <div style={{ display: "flex", fontFamily: "Arial, Helvetica, sans-serif", background: "#fff", color: "#111" }}>
            <div style={{ width: 205, flexShrink: 0, background: accent, color: "#fff", padding: "32px 18px 32px 22px" }}>
                {d.photo && <img src={d.photo} alt="" style={{ width: 88, height: 88, borderRadius: "50%", objectFit: "cover", border: "2.5px solid rgba(255,255,255,0.35)", alignSelf: "center", marginBottom: 14, display: "block", margin: "0 auto 14px" }} />}
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, lineHeight: 1.3 }}>{d.basicInfo?.fullName || "Your Name"}</div>
                <div style={{ fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,0.6)", borderBottom: "1px solid rgba(255,255,255,0.25)", paddingBottom: 4, marginBottom: 8 }}>Contact</div>
                {d.basicInfo?.phone && <p style={{ fontSize: 10.5, marginBottom: 4, color: "rgba(255,255,255,.9)" }}>{d.basicInfo.phone}</p>}
                {d.basicInfo?.email && <p style={{ fontSize: 10, marginBottom: 4, wordBreak: "break-all", color: "rgba(255,255,255,.9)" }}>{d.basicInfo.email}</p>}
                {d.basicInfo?.location && <p style={{ fontSize: 10.5, marginBottom: 4, color: "rgba(255,255,255,.9)" }}>{d.basicInfo.location}</p>}
                {d.basicInfo?.linkedin && <p style={{ fontSize: 9, marginBottom: 4, wordBreak: "break-all", color: "rgba(255,255,255,.7)" }}><Lnk href={d.basicInfo.linkedin}>{d.basicInfo.linkedin}</Lnk></p>}
                {d.skills && d.skills.length > 0 && <>
                    <div style={{ fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,0.6)", borderBottom: "1px solid rgba(255,255,255,0.25)", paddingBottom: 4, marginBottom: 8, marginTop: 16 }}>Skills</div>
                    {d.skills.slice(0, 10).map((sk, i) => <div key={i} style={{ marginBottom: 5 }}><p style={{ fontSize: 10.5, color: "rgba(255,255,255,.9)", marginBottom: 2 }}>{sk}</p><div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.2)" }}><div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.75)", width: `${65 + (i * 13 % 32)}%` }} /></div></div>)}
                </>}
                {d.languages && d.languages.length > 0 && <>
                    <div style={{ fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,0.6)", borderBottom: "1px solid rgba(255,255,255,0.25)", paddingBottom: 4, marginBottom: 8, marginTop: 16 }}>Languages</div>
                    {d.languages.map((l, i) => <p key={i} style={{ fontSize: 10.5, color: "rgba(255,255,255,.9)", marginBottom: 3 }}>{l}</p>)}
                </>}
            </div>
            <div style={{ flex: 1, padding: "32px 28px 32px 26px" }}>
                {d.summary && <><ModSec title="Profile" accent={accent} /><p style={{ fontSize: 11.5, color: "#444", lineHeight: 1.65, marginBottom: 18 }}>{d.summary}</p></>}
                {d.experience?.some(e => e.company) && <><ModSec title="Experience" accent={accent} />{d.experience!.map((e, i) => <div key={i} style={{ marginBottom: 14 }}><div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontWeight: 700, fontSize: 13 }}>{e.role}</span><span style={{ fontSize: 10, color: "#999" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : e.startDate ? " – Present" : ""}</span></div><div style={{ fontSize: 11.5, color: accent, fontWeight: 700, marginBottom: 4 }}>{e.company}</div><p style={{ fontSize: 11, color: "#555", lineHeight: 1.6 }}>{e.description}</p></div>)}</>}
                {d.education?.some(e => e.institution) && <><ModSec title="Education" accent={accent} />{d.education!.map((e, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}><div><div style={{ fontWeight: 700, fontSize: 13 }}>{e.institution}</div><div style={{ fontSize: 11, color: "#666" }}>{e.degree}</div></div><span style={{ fontSize: 10, color: "#999" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</span></div>)}</>}
                {d.projects?.some(p => p.title) && <><ModSec title="Projects" accent={accent} />{d.projects!.map((p, i) => <div key={i} style={{ marginBottom: 10 }}><div style={{ fontWeight: 700, fontSize: 13 }}>{p.title}</div><p style={{ fontSize: 11, color: "#555" }}>{p.description}</p></div>)}</>}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════
// TEMPLATE 11: ROSE STUDIO
// ═══════════════════════════════════════════════════
function TemplateRose({ d }: { d: CvData }) {
    const accent = "#e11d48";
    return (
        <div style={{ background: "#fff", fontFamily: "Georgia, serif", color: "#111" }}>
            <div style={{ background: `linear-gradient(135deg, ${accent}, #fb7185)`, color: "#fff", padding: "30px 38px", display: "flex", alignItems: "center", gap: 24 }}>
                {d.photo && <img src={d.photo} alt="" style={{ width: 88, height: 88, borderRadius: "50%", objectFit: "cover", border: "2.5px solid rgba(255,255,255,0.4)", flexShrink: 0 }} />}
                <div>
                    <div style={{ fontSize: 30, fontWeight: 700, marginBottom: 8 }}>{d.basicInfo?.fullName || "Your Name"}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", display: "flex", flexWrap: "wrap", gap: "0 18px" }}>
                        {d.basicInfo?.phone && <span>{d.basicInfo.phone}</span>}
                        {d.basicInfo?.email && <span>{d.basicInfo.email}</span>}
                        {d.basicInfo?.location && <span>{d.basicInfo.location}</span>}
                    </div>
                    {linksStr(d) && <CvLinksLine d={d} style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 4 }} />}
                </div>
            </div>
            <div style={{ padding: "24px 38px" }}>
                {d.summary && <p style={{ fontSize: 12.5, color: "#555", lineHeight: 1.7, marginBottom: 20 }}>{d.summary}</p>}
                {d.experience?.some(e => e.company) && <><CreSec title="Experience" accent={accent}>{d.experience!.map((e, i) => <div key={i} style={{ marginBottom: 14, paddingLeft: 14, borderLeft: `3px solid ${accent}30` }}><div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontWeight: 700, fontSize: 13.5 }}>{e.role}</span><span style={{ fontSize: 11, color: "#999" }}>{fmtDate(e.startDate)}{e.endDate ? `–${fmtDate(e.endDate)}` : e.startDate ? "–Present" : ""}</span></div><div style={{ fontSize: 12, color: accent, fontWeight: 700, marginBottom: 4 }}>{e.company}</div><p style={{ fontSize: 11.5, color: "#666", lineHeight: 1.6 }}>{e.description}</p></div>)}</CreSec></>}
                {d.education?.some(e => e.institution) && <CreSec title="Education" accent={accent}>{d.education!.map((e, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}><div><div style={{ fontWeight: 700, fontSize: 13.5 }}>{e.institution}</div><div style={{ fontSize: 12, color: "#666" }}>{e.degree}</div></div><span style={{ fontSize: 11, color: "#999" }}>{fmtDate(e.startDate)}{e.endDate ? `–${fmtDate(e.endDate)}` : ""}</span></div>)}</CreSec>}
                {d.skills && d.skills.length > 0 && <CreSec title="Skills" accent={accent}><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{d.skills.map((sk, i) => <span key={i} style={{ fontSize: 12, background: `${accent}12`, color: accent, padding: "4px 14px", borderRadius: 20, border: `1px solid ${accent}30` }}>{sk}</span>)}</div></CreSec>}
                {d.languages && d.languages.length > 0 && <p style={{ fontSize: 12, color: "#555", marginTop: 14 }}><strong>Languages:</strong> {d.languages.join(" · ")}</p>}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════
// TEMPLATE 12: NAVY & GOLD
// ═══════════════════════════════════════════════════
function TemplateNavyGold({ d }: { d: CvData }) {
    const navy = "#1e3a5f"; const gold = "#b7913a";
    return (
        <div style={{ background: "#fff", fontFamily: "Georgia, serif", color: "#111" }}>
            <div style={{ background: navy, padding: "36px 52px 28px" }}>
                <div style={{ fontSize: 34, fontWeight: 700, color: "#fff", letterSpacing: -0.5, marginBottom: 10 }}>{d.basicInfo?.fullName || "Your Name"}</div>
                <div style={{ height: 2.5, background: gold, width: 64, marginBottom: 12 }} />
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0 28px", fontSize: 12, color: "#94a3b8" }}>
                    {d.basicInfo?.phone && <span>{d.basicInfo.phone}</span>}
                    {d.basicInfo?.email && <span>{d.basicInfo.email}</span>}
                    {d.basicInfo?.location && <span>{d.basicInfo.location}</span>}
                    {d.basicInfo?.linkedin && <span><Lnk href={d.basicInfo.linkedin}>{d.basicInfo.linkedin}</Lnk></span>}
                </div>
            </div>
            <div style={{ padding: "28px 52px" }}>
                {d.summary && <div style={{ marginBottom: 22, paddingLeft: 18, borderLeft: `3.5px solid ${gold}`, fontStyle: "italic", fontSize: 13, color: "#444", lineHeight: 1.7 }}>{d.summary}</div>}
                {d.experience?.some(e => e.company) && <>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: navy, marginBottom: 4 }}>Professional Experience</div>
                    <div style={{ height: 2.5, background: gold, width: 48, marginBottom: 14 }} />
                    {d.experience!.map((e, i) => <div key={i} style={{ marginBottom: 16 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><span style={{ fontWeight: 700, fontSize: 14 }}>{e.role}</span><span style={{ fontSize: 11, color: "#9ca3af" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : e.startDate ? " – Present" : ""}</span></div><div style={{ fontSize: 12, fontStyle: "italic", color: gold, marginBottom: 4 }}>{e.company}</div><p style={{ fontSize: 12, lineHeight: 1.65, color: "#555" }}>{e.description}</p></div>)}
                </>}
                {d.education?.some(e => e.institution) && <>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: navy, marginBottom: 4, marginTop: 20 }}>Education</div>
                    <div style={{ height: 2.5, background: gold, width: 48, marginBottom: 14 }} />
                    {d.education!.map((e, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}><div><div style={{ fontWeight: 700, fontSize: 14 }}>{e.institution}</div><div style={{ fontSize: 12, color: "#64748b" }}>{e.degree}</div></div><span style={{ fontSize: 11, color: "#9ca3af" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</span></div>)}
                </>}
                {(d.skills?.length || d.languages?.length) ? <>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: navy, marginBottom: 4, marginTop: 20 }}>Core Competencies</div>
                    <div style={{ height: 2.5, background: gold, width: 48, marginBottom: 14 }} />
                    {d.skills && d.skills.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>{d.skills.map((sk, i) => <span key={i} style={{ fontSize: 11.5, background: "#f8f9fa", color: "#334155", padding: "4px 12px", borderRadius: 4, border: "1px solid #e2e8f0" }}>{sk}</span>)}</div>}
                    {d.languages && d.languages.length > 0 && <p style={{ fontSize: 12, color: "#555" }}><strong>Languages:</strong> {d.languages.join(" · ")}</p>}
                </> : null}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════
// TEMPLATE 13: EMERALD TECH
// ═══════════════════════════════════════════════════
function TemplateEmerald({ d }: { d: CvData }) {
    const accent = "#059669";
    return (
        <div style={{ background: "#fff", fontFamily: "'Courier New', monospace", color: "#111", padding: "40px 48px", fontSize: 11.5 }}>
            <div style={{ background: accent, color: "#fff", padding: "22px 28px", borderRadius: 8, marginBottom: 28 }}>
                <div style={{ fontSize: 26, fontWeight: 700 }}>{d.basicInfo?.fullName || "Your Name"}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", marginTop: 8, display: "flex", flexWrap: "wrap", gap: "0 16px" }}>
                    {d.basicInfo?.email && <span>{d.basicInfo.email}</span>}
                    {d.basicInfo?.phone && <span>{d.basicInfo.phone}</span>}
                    {d.basicInfo?.location && <span>{d.basicInfo.location}</span>}
                    {d.basicInfo?.linkedin && <span><Lnk href={d.basicInfo.linkedin}>{d.basicInfo.linkedin}</Lnk></span>}
                </div>
            </div>
            {d.summary && <p style={{ fontSize: 12, color: "#444", lineHeight: 1.7, marginBottom: 24, paddingLeft: 12, borderLeft: `3px solid ${accent}` }}>{d.summary}</p>}
            {d.experience?.some(e => e.company) && <>
                <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 3.5, color: accent, marginBottom: 12 }}>// EXPERIENCE</div>
                {d.experience!.map((e, i) => <div key={i} style={{ marginBottom: 16, paddingLeft: 14, borderLeft: `2px solid ${accent}20` }}><div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontWeight: 700, fontSize: 13 }}>{e.role}</span><span style={{ fontSize: 10, color: "#999" }}>{fmtDate(e.startDate)}{e.endDate ? `–${fmtDate(e.endDate)}` : ""}</span></div><div style={{ fontSize: 11.5, color: accent, fontWeight: 700, marginBottom: 4 }}>{e.company}</div><p style={{ fontSize: 11, color: "#555", lineHeight: 1.65 }}>{e.description}</p></div>)}
            </>}
            {d.education?.some(e => e.institution) && <>
                <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 3.5, color: accent, marginBottom: 12, marginTop: 20 }}>// EDUCATION</div>
                {d.education!.map((e, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><div><div style={{ fontWeight: 700, fontSize: 13 }}>{e.institution}</div><div style={{ fontSize: 11, color: "#666" }}>{e.degree}</div></div><span style={{ fontSize: 10, color: "#999" }}>{fmtDate(e.startDate)}{e.endDate ? `–${fmtDate(e.endDate)}` : ""}</span></div>)}
            </>}
            {(d.skills?.length || d.languages?.length) ? <>
                <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 3.5, color: accent, marginBottom: 12, marginTop: 20 }}>// SKILLS</div>
                {d.skills && d.skills.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>{d.skills.map((sk, i) => <span key={i} style={{ fontSize: 11, background: `${accent}12`, color: accent, padding: "3px 12px", borderRadius: 4, border: `1px solid ${accent}30` }}>{sk}</span>)}</div>}
                {d.languages && d.languages.length > 0 && <p style={{ fontSize: 11, color: "#555", marginTop: 6 }}><strong>Languages:</strong> {d.languages.join(" · ")}</p>}
            </> : null}
        </div>
    );
}

// ═══════════════════════════════════════════════════
// TEMPLATE 14: ACADEMIC
// ═══════════════════════════════════════════════════
function TemplateAcademic({ d }: { d: CvData }) {
    return (
        <div style={{ background: "#fff", fontFamily: "'Times New Roman', Times, serif", color: "#000", padding: "52px 60px", fontSize: 12, lineHeight: 1.6 }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 0.5, marginBottom: 8 }}>{d.basicInfo?.fullName || "Your Name"}</div>
                <div style={{ fontSize: 11.5, color: "#333", marginBottom: 3 }}>{[d.basicInfo?.email, d.basicInfo?.phone, d.basicInfo?.location].filter(Boolean).join(" | ")}</div>
                <CvLinksLine d={d} style={{ fontSize: 11, color: "#666" }} />
                <div style={{ borderBottom: "2px solid #000", marginTop: 14 }} />
            </div>
            {d.summary && <><div style={{ fontWeight: 700, textTransform: "uppercase", fontSize: 10.5, letterSpacing: 2, marginBottom: 6 }}>Research / Professional Profile</div><p style={{ fontSize: 12, lineHeight: 1.7, marginBottom: 20, textAlign: "justify" }}>{d.summary}</p></>}
            {d.experience?.some(e => e.company) && <>
                <div style={{ fontWeight: 700, textTransform: "uppercase", fontSize: 10.5, letterSpacing: 2, marginBottom: 6, borderBottom: "1px solid #aaa", paddingBottom: 3 }}>Academic & Professional Experience</div>
                {d.experience!.map((e, i) => <div key={i} style={{ marginBottom: 14, marginTop: 10 }}><div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontWeight: 700, fontSize: 13 }}>{e.role}</span><span style={{ fontSize: 11, fontStyle: "italic" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : e.startDate ? " – Present" : ""}</span></div><div style={{ fontStyle: "italic", fontSize: 12, marginBottom: 4, color: "#333" }}>{e.company}</div><p style={{ fontSize: 12, lineHeight: 1.65, color: "#333", textAlign: "justify" }}>{e.description}</p></div>)}
            </>}
            {d.education?.some(e => e.institution) && <>
                <div style={{ fontWeight: 700, textTransform: "uppercase", fontSize: 10.5, letterSpacing: 2, marginBottom: 6, borderBottom: "1px solid #aaa", paddingBottom: 3, marginTop: 18 }}>Education</div>
                {d.education!.map((e, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, marginTop: 8 }}><div><div style={{ fontWeight: 700, fontSize: 13 }}>{e.institution}</div><div style={{ fontStyle: "italic", fontSize: 12 }}>{e.degree}</div></div><span style={{ fontSize: 11 }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</span></div>)}
            </>}
            {(d.skills?.length || d.languages?.length) ? <>
                <div style={{ fontWeight: 700, textTransform: "uppercase", fontSize: 10.5, letterSpacing: 2, marginBottom: 6, borderBottom: "1px solid #aaa", paddingBottom: 3, marginTop: 18 }}>Skills & Languages</div>
                {d.skills && d.skills.length > 0 && <p style={{ fontSize: 12, marginBottom: 4 }}><strong>Technical Skills:</strong> {d.skills.join(", ")}</p>}
                {d.languages && d.languages.length > 0 && <p style={{ fontSize: 12 }}><strong>Languages:</strong> {d.languages.join(", ")}</p>}
            </> : null}
        </div>
    );
}

// ═══════════════════════════════════════════════════
// TEMPLATE 15: STARTUP BOLD
// ═══════════════════════════════════════════════════
function TemplateStartup({ d }: { d: CvData }) {
    const accent = "#6d28d9";
    return (
        <div style={{ background: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#111" }}>
            <div style={{ background: "linear-gradient(135deg, #6d28d9 0%, #ec4899 100%)", padding: "32px 40px", color: "#fff" }}>
                {d.photo && <img src={d.photo} alt="" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "2.5px solid rgba(255,255,255,0.5)", marginBottom: 14, display: "block" }} />}
                <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -0.5, marginBottom: 8 }}>{d.basicInfo?.fullName || "Your Name"}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0 20px", fontSize: 12, color: "rgba(255,255,255,0.85)" }}>
                    {d.basicInfo?.email && <span>{d.basicInfo.email}</span>}
                    {d.basicInfo?.phone && <span>{d.basicInfo.phone}</span>}
                    {d.basicInfo?.location && <span>{d.basicInfo.location}</span>}
                    {d.basicInfo?.linkedin && <span><Lnk href={d.basicInfo.linkedin}>{d.basicInfo.linkedin}</Lnk></span>}
                </div>
            </div>
            <div style={{ padding: "28px 40px" }}>
                {d.summary && <p style={{ fontSize: 13, color: "#555", lineHeight: 1.7, marginBottom: 22 }}>{d.summary}</p>}
                {d.experience?.some(e => e.company) && <>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: accent, marginBottom: 14 }}>Experience</div>
                    {d.experience!.map((e, i) => <div key={i} style={{ marginBottom: 16, padding: "14px 16px", background: "#f9fafb", borderRadius: 10, borderLeft: `4px solid ${accent}` }}><div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontWeight: 700, fontSize: 14 }}>{e.role}</span><span style={{ fontSize: 11, color: "#888", background: "#e5e7eb", padding: "2px 10px", borderRadius: 20 }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</span></div><div style={{ fontSize: 12, color: accent, fontWeight: 600, marginBottom: 6, marginTop: 3 }}>{e.company}</div><p style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>{e.description}</p></div>)}
                </>}
                {d.education?.some(e => e.institution) && <>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: accent, marginBottom: 12, marginTop: 20 }}>Education</div>
                    {d.education!.map((e, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}><div><div style={{ fontWeight: 700, fontSize: 14 }}>{e.institution}</div><div style={{ fontSize: 12, color: "#555" }}>{e.degree}</div></div><span style={{ fontSize: 11, color: "#888" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</span></div>)}
                </>}
                {d.skills && d.skills.length > 0 && <>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: accent, marginBottom: 12, marginTop: 20 }}>Skills</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{d.skills.map((sk, i) => <span key={i} style={{ fontSize: 12, background: `${accent}15`, color: accent, padding: "5px 14px", borderRadius: 20, fontWeight: 600 }}>{sk}</span>)}</div>
                </>}
                {d.languages && d.languages.length > 0 && <p style={{ fontSize: 12, color: "#555", marginTop: 14 }}><strong>Languages:</strong> {d.languages.join(" · ")}</p>}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════
// TEMPLATE 16: TERRA WARM
// ═══════════════════════════════════════════════════
function TemplateTerra({ d }: { d: CvData }) {
    const accent = "#c2410c"; const warm = "#fef3c7";
    return (
        <div style={{ background: warm, fontFamily: "Georgia, serif", color: "#1a1a1a", padding: "44px 52px", fontSize: 12 }}>
            <div style={{ marginBottom: 28 }}>
                {d.photo && <img src={d.photo} alt="" style={{ width: 84, height: 84, borderRadius: "50%", objectFit: "cover", border: `3px solid ${accent}`, float: "right", marginLeft: 20, marginBottom: 10 }} />}
                <div style={{ fontSize: 32, fontWeight: 700, color: accent }}>{d.basicInfo?.fullName || "Your Name"}</div>
                <div style={{ fontSize: 12, color: "#78350f", marginTop: 6 }}>{[d.basicInfo?.email, d.basicInfo?.phone, d.basicInfo?.location].filter(Boolean).join("  ·  ")}</div>
                <CvLinksLine d={d} style={{ fontSize: 11, color: "#92400e", marginTop: 3 }} />
                <div style={{ clear: "both" }} />
            </div>
            {d.summary && <><div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2.5, color: accent, marginBottom: 8 }}>About</div><p style={{ fontSize: 12.5, color: "#44403c", lineHeight: 1.7, marginBottom: 20 }}>{d.summary}</p></>}
            {d.experience?.some(e => e.company) && <>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2.5, color: accent, marginBottom: 6, borderBottom: `2px solid ${accent}40`, paddingBottom: 4 }}>Experience</div>
                {d.experience!.map((e, i) => <div key={i} style={{ marginBottom: 16, marginTop: 12 }}><div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontWeight: 700, fontSize: 14 }}>{e.role}</span><span style={{ fontSize: 11, color: "#92400e" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : e.startDate ? " – Present" : ""}</span></div><div style={{ fontSize: 12.5, color: accent, fontStyle: "italic", marginBottom: 4 }}>{e.company}</div><p style={{ fontSize: 12, color: "#57534e", lineHeight: 1.65 }}>{e.description}</p></div>)}
            </>}
            {d.education?.some(e => e.institution) && <>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2.5, color: accent, marginBottom: 6, borderBottom: `2px solid ${accent}40`, paddingBottom: 4, marginTop: 20 }}>Education</div>
                {d.education!.map((e, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, marginTop: 10 }}><div><div style={{ fontWeight: 700, fontSize: 14 }}>{e.institution}</div><div style={{ fontSize: 12, color: "#78350f" }}>{e.degree}</div></div><span style={{ fontSize: 11, color: "#92400e" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</span></div>)}
            </>}
            {(d.skills?.length || d.languages?.length) ? <>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2.5, color: accent, marginBottom: 10, borderBottom: `2px solid ${accent}40`, paddingBottom: 4, marginTop: 20 }}>Skills & Languages</div>
                {d.skills && d.skills.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>{d.skills.map((sk, i) => <span key={i} style={{ fontSize: 12, background: `${accent}18`, color: "#78350f", padding: "4px 14px", borderRadius: 20, border: `1px solid ${accent}30` }}>{sk}</span>)}</div>}
                {d.languages && d.languages.length > 0 && <p style={{ fontSize: 12, color: "#57534e" }}><strong>Languages:</strong> {d.languages.join(" · ")}</p>}
            </> : null}
        </div>
    );
}

// ═══════════════════════════════════════════════════
// TEMPLATE 17: COBALT MODERN
// ═══════════════════════════════════════════════════
function TemplateCobalt({ d }: { d: CvData }) {
    const accent = "#1d4ed8";
    return (
        <div style={{ display: "flex", fontFamily: "Arial, Helvetica, sans-serif", background: "#fff", color: "#111", minHeight: 1080 }}>
            <div style={{ width: 210, flexShrink: 0, background: accent, color: "#fff", padding: "32px 18px 32px 22px" }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 18, lineHeight: 1.3 }}>{d.basicInfo?.fullName || "Your Name"}</div>
                <SideLabel>Contact</SideLabel>
                {d.basicInfo?.phone && <p style={{ fontSize: 10.5, marginBottom: 5, color: "rgba(255,255,255,.9)" }}>{d.basicInfo.phone}</p>}
                {d.basicInfo?.email && <p style={{ fontSize: 10, marginBottom: 5, wordBreak: "break-all", color: "rgba(255,255,255,.9)" }}>{d.basicInfo.email}</p>}
                {d.basicInfo?.location && <p style={{ fontSize: 10.5, marginBottom: 5, color: "rgba(255,255,255,.9)" }}>{d.basicInfo.location}</p>}
                {d.basicInfo?.linkedin && <p style={{ fontSize: 9, marginBottom: 5, wordBreak: "break-all", color: "rgba(255,255,255,.7)" }}><Lnk href={d.basicInfo.linkedin}>{d.basicInfo.linkedin}</Lnk></p>}
                {d.skills && d.skills.length > 0 && <><SideLabel top>Skills</SideLabel>{d.skills.slice(0, 10).map((sk, i) => <div key={i} style={{ marginBottom: 6 }}><p style={{ fontSize: 10.5, color: "rgba(255,255,255,.9)", marginBottom: 2 }}>{sk}</p><div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.2)" }}><div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.72)", width: `${65 + (i * 13 % 32)}%` }} /></div></div>)}</>}
                {d.languages && d.languages.length > 0 && <><SideLabel top>Languages</SideLabel>{d.languages.map((l, i) => <p key={i} style={{ fontSize: 10.5, color: "rgba(255,255,255,.9)", marginBottom: 3 }}>{l}</p>)}</>}
            </div>
            <div style={{ flex: 1, padding: "32px 28px" }}>
                {d.summary && <><ModSec title="About Me" accent={accent} /><p style={{ fontSize: 11.5, color: "#444", lineHeight: 1.65, marginBottom: 18 }}>{d.summary}</p></>}
                {d.experience?.some(e => e.company) && <><ModSec title="Experience" accent={accent} />{d.experience!.map((e, i) => <div key={i} style={{ marginBottom: 14 }}><div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontWeight: 700, fontSize: 13 }}>{e.role}</span><span style={{ fontSize: 10, color: "#999" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : e.startDate ? " – Present" : ""}</span></div><div style={{ fontSize: 11.5, color: accent, fontWeight: 700, marginBottom: 4 }}>{e.company}</div><p style={{ fontSize: 11, color: "#555", lineHeight: 1.6 }}>{e.description}</p></div>)}</>}
                {d.education?.some(e => e.institution) && <><ModSec title="Education" accent={accent} />{d.education!.map((e, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}><div><div style={{ fontWeight: 700, fontSize: 13 }}>{e.institution}</div><div style={{ fontSize: 11, color: "#666" }}>{e.degree}</div></div><span style={{ fontSize: 10, color: "#999" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</span></div>)}</>}
                {d.projects?.some(p => p.title) && <><ModSec title="Projects" accent={accent} />{d.projects!.map((p, i) => <div key={i} style={{ marginBottom: 10 }}><div style={{ fontWeight: 700, fontSize: 13 }}>{p.title}</div><p style={{ fontSize: 11, color: "#555" }}>{p.description}</p></div>)}</>}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════
// TEMPLATE 18: FOREST ELITE
// ═══════════════════════════════════════════════════
function TemplateForest({ d }: { d: CvData }) {
    const accent = "#14532d"; const light = "#dcfce7";
    return (
        <div style={{ background: "#fff", fontFamily: "Georgia, 'Times New Roman', serif", color: "#111" }}>
            <div style={{ background: accent, color: "#fff", padding: "36px 52px 28px" }}>
                <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 10 }}>{d.basicInfo?.fullName || "Your Name"}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0 24px", fontSize: 12, color: "#86efac" }}>
                    {d.basicInfo?.phone && <span>{d.basicInfo.phone}</span>}
                    {d.basicInfo?.email && <span>{d.basicInfo.email}</span>}
                    {d.basicInfo?.location && <span>{d.basicInfo.location}</span>}
                    {d.basicInfo?.linkedin && <span><Lnk href={d.basicInfo.linkedin}>{d.basicInfo.linkedin}</Lnk></span>}
                </div>
            </div>
            <div style={{ padding: "28px 52px" }}>
                {d.summary && <div style={{ marginBottom: 22, padding: "14px 18px", background: light, borderLeft: `4px solid ${accent}`, borderRadius: "0 8px 8px 0", fontSize: 13, color: "#14532d", lineHeight: 1.7 }}>{d.summary}</div>}
                {d.experience?.some(e => e.company) && <>
                    <ExecSec title="Experience">{d.experience!.map((e, i) => <div key={i} style={{ marginBottom: 16 }}><div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontWeight: 700, fontSize: 14 }}>{e.role}</span><span style={{ fontSize: 11, color: "#9ca3af" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : e.startDate ? " – Present" : ""}</span></div><div style={{ fontSize: 12.5, fontStyle: "italic", color: accent, marginBottom: 4 }}>{e.company}</div><p style={{ fontSize: 12, lineHeight: 1.65, color: "#555" }}>{e.description}</p></div>)}</ExecSec>
                </>}
                {d.education?.some(e => e.institution) && <ExecSec title="Education">{d.education!.map((e, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}><div><div style={{ fontWeight: 700, fontSize: 14 }}>{e.institution}</div><div style={{ fontSize: 12, color: "#64748b" }}>{e.degree}</div></div><span style={{ fontSize: 11, color: "#9ca3af" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</span></div>)}</ExecSec>}
                {(d.skills?.length || d.languages?.length) ? <ExecSec title="Core Skills">{d.skills && d.skills.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>{d.skills.map((sk, i) => <span key={i} style={{ fontSize: 11.5, background: light, color: accent, padding: "4px 12px", borderRadius: 4, border: `1px solid ${accent}40` }}>{sk}</span>)}</div>}{d.languages && d.languages.length > 0 && <p style={{ fontSize: 12, color: "#555" }}><strong>Languages:</strong> {d.languages.join(" · ")}</p>}</ExecSec> : null}
            </div>
        </div>
    );
}
function ExecSecForest({ title, children }: { title: string; children: React.ReactNode }) {
    const accent = "#14532d";
    return (
        <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: accent, marginBottom: 4 }}>{title}</div>
            <div style={{ height: 2.5, background: accent, width: 48, marginBottom: 14 }} />
            {children}
        </div>
    );
}

// ═══════════════════════════════════════════════════
// TEMPLATE 19: COPPER ELEGANT
// ═══════════════════════════════════════════════════
function TemplateCopper({ d }: { d: CvData }) {
    const accent = "#b45309"; const bg = "#fffbf5";
    return (
        <div style={{ background: bg, fontFamily: "Georgia, serif", color: "#1a1a1a", padding: "48px 56px", fontSize: 12 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 28, marginBottom: 28, paddingBottom: 22, borderBottom: `2px solid ${accent}` }}>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 34, fontWeight: 700, color: accent, letterSpacing: -0.3 }}>{d.basicInfo?.fullName || "Your Name"}</div>
                    <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: "6px 20px", fontSize: 12, color: "#78350f" }}>
                        {d.basicInfo?.email && <span>{d.basicInfo.email}</span>}
                        {d.basicInfo?.phone && <span>{d.basicInfo.phone}</span>}
                        {d.basicInfo?.location && <span>{d.basicInfo.location}</span>}
                    </div>
                    <CvLinksLine d={d} style={{ fontSize: 11, color: "#92400e", marginTop: 4 }} />
                </div>
            </div>
            {d.summary && <p style={{ fontSize: 13, color: "#44403c", lineHeight: 1.75, marginBottom: 26, fontStyle: "italic" }}>{d.summary}</p>}
            {d.experience?.some(e => e.company) && <>
                <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2.5, color: accent, borderBottom: `1.5px solid ${accent}50`, paddingBottom: 5, marginBottom: 14 }}>Experience</div>
                {d.experience!.map((e, i) => <div key={i} style={{ marginBottom: 18 }}><div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontWeight: 700, fontSize: 14 }}>{e.role}</span><span style={{ fontSize: 11, color: "#92400e" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : e.startDate ? " – Present" : ""}</span></div><div style={{ fontSize: 12.5, color: accent, fontStyle: "italic", marginBottom: 4 }}>{e.company}</div><p style={{ fontSize: 12, color: "#57534e", lineHeight: 1.65 }}>{e.description}</p></div>)}
            </>}
            {d.education?.some(e => e.institution) && <>
                <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2.5, color: accent, borderBottom: `1.5px solid ${accent}50`, paddingBottom: 5, marginBottom: 14, marginTop: 22 }}>Education</div>
                {d.education!.map((e, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}><div><div style={{ fontWeight: 700, fontSize: 14 }}>{e.institution}</div><div style={{ fontStyle: "italic", fontSize: 12, color: "#78350f" }}>{e.degree}</div></div><span style={{ fontSize: 11, color: "#92400e" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</span></div>)}
            </>}
            {(d.skills?.length || d.languages?.length) ? <>
                <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2.5, color: accent, borderBottom: `1.5px solid ${accent}50`, paddingBottom: 5, marginBottom: 14, marginTop: 22 }}>Skills & Languages</div>
                {d.skills && d.skills.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>{d.skills.map((sk, i) => <span key={i} style={{ fontSize: 12, background: `${accent}14`, color: "#78350f", padding: "5px 14px", borderRadius: 20, border: `1px solid ${accent}30` }}>{sk}</span>)}</div>}
                {d.languages && d.languages.length > 0 && <p style={{ fontSize: 12, color: "#57534e" }}><strong>Languages:</strong> {d.languages.join(" · ")}</p>}
            </> : null}
        </div>
    );
}

// ═══════════════════════════════════════════════════
// TEMPLATE 20: SLATE EDGE
// ═══════════════════════════════════════════════════
function TemplateSlate({ d }: { d: CvData }) {
    const accent = "#475569";
    return (
        <div style={{ background: "#fff", fontFamily: "Arial, Helvetica, sans-serif", color: "#111", fontSize: 12 }}>
            <div style={{ background: "#1e293b", padding: "32px 48px 22px", position: "relative" }}>
                <div style={{ fontSize: 30, fontWeight: 700, color: "#f1f5f9", letterSpacing: -0.3, marginBottom: 8 }}>{d.basicInfo?.fullName || "Your Name"}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0 22px", fontSize: 12, color: "#94a3b8" }}>
                    {d.basicInfo?.phone && <span>{d.basicInfo.phone}</span>}
                    {d.basicInfo?.email && <span>{d.basicInfo.email}</span>}
                    {d.basicInfo?.location && <span>{d.basicInfo.location}</span>}
                    {d.basicInfo?.linkedin && <span><Lnk href={d.basicInfo.linkedin}>{d.basicInfo.linkedin}</Lnk></span>}
                </div>
                <div style={{ position: "absolute", bottom: 0, left: 48, right: 0, height: 4, background: "linear-gradient(90deg, #6366f1, #8b5cf6, #475569)" }} />
            </div>
            <div style={{ padding: "28px 48px" }}>
                {d.summary && <><div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 3, color: accent, marginBottom: 8 }}>Profile</div><p style={{ fontSize: 12.5, color: "#444", lineHeight: 1.7, marginBottom: 22, paddingBottom: 18, borderBottom: "1px solid #e2e8f0" }}>{d.summary}</p></>}
                {d.experience?.some(e => e.company) && <>
                    <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 3, color: accent, marginBottom: 12 }}>Experience</div>
                    {d.experience!.map((e, i) => <div key={i} style={{ marginBottom: 16, paddingLeft: 16, borderLeft: "2px solid #e2e8f0" }}><div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontWeight: 700, fontSize: 13.5 }}>{e.role}</span><span style={{ fontSize: 11, background: "#f1f5f9", color: "#64748b", padding: "2px 10px", borderRadius: 4 }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : e.startDate ? " – Present" : ""}</span></div><div style={{ fontSize: 12.5, color: accent, fontWeight: 600, marginBottom: 5, marginTop: 2 }}>{e.company}</div><p style={{ fontSize: 11.5, color: "#555", lineHeight: 1.65 }}>{e.description}</p></div>)}
                </>}
                {d.education?.some(e => e.institution) && <>
                    <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 3, color: accent, marginBottom: 12, marginTop: 20 }}>Education</div>
                    {d.education!.map((e, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}><div><div style={{ fontWeight: 700, fontSize: 13.5 }}>{e.institution}</div><div style={{ fontSize: 12, color: "#64748b" }}>{e.degree}</div></div><span style={{ fontSize: 11, color: "#94a3b8" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</span></div>)}
                </>}
                {(d.skills?.length || d.languages?.length) ? <>
                    <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 3, color: accent, marginBottom: 12, marginTop: 20 }}>Skills & Languages</div>
                    {d.skills && d.skills.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>{d.skills.map((sk, i) => <span key={i} style={{ fontSize: 12, background: "#f8fafc", color: "#334155", padding: "4px 14px", borderRadius: 6, border: "1px solid #e2e8f0" }}>{sk}</span>)}</div>}
                    {d.languages && d.languages.length > 0 && <p style={{ fontSize: 12, color: "#555" }}><strong>Languages:</strong> {d.languages.join(" · ")}</p>}
                </> : null}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════
// TEMPLATE 21: ATS PRO STRICT
// ═══════════════════════════════════════════════════
function TemplateATSPro({ d }: { d: CvData }) {
    return (
        <div style={{ background: "#fff", fontFamily: "Arial, Helvetica, sans-serif", color: "#111", padding: "40px 52px", fontSize: 11.5, lineHeight: 1.55 }}>
            <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 22, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5 }}>{d.basicInfo?.fullName || "Your Name"}</div>
                <div style={{ fontSize: 10.5, color: "#444", marginTop: 5, display: "flex", flexWrap: "wrap", gap: "0 14px" }}>
                    {d.basicInfo?.phone && <span>{d.basicInfo.phone}</span>}
                    {d.basicInfo?.email && <Lnk href={`mailto:${d.basicInfo.email}`}>{d.basicInfo.email}</Lnk>}
                    {d.basicInfo?.location && <span>{d.basicInfo.location}</span>}
                    {d.basicInfo?.linkedin && <Lnk href={d.basicInfo.linkedin}>{d.basicInfo.linkedin}</Lnk>}
                    {d.basicInfo?.portfolio && <Lnk href={d.basicInfo.portfolio}>{d.basicInfo.portfolio}</Lnk>}
                </div>
            </div>
            <div style={{ borderTop: "2px solid #111", marginBottom: 14 }} />
            {d.summary && <><AtsProSec title="PROFESSIONAL SUMMARY" /><div style={{ fontSize: 11.5, lineHeight: 1.65, marginBottom: 14 }}>{d.summary}</div></>}
            {d.experience?.some(e => e.company) && (
                <div style={{ marginBottom: 14 }}>
                    <AtsProSec title="WORK EXPERIENCE" />
                    {d.experience!.map((e, i) => (
                        <div key={i} style={{ marginBottom: 12 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                <span style={{ fontWeight: 700, fontSize: 12 }}>{e.role}</span>
                                <span style={{ fontSize: 10.5, color: "#666" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : e.startDate ? " – Present" : ""}</span>
                            </div>
                            <div style={{ fontSize: 11, fontStyle: "italic", color: "#444", marginBottom: 3 }}>{e.company}</div>
                            <div style={{ fontSize: 11, lineHeight: 1.5 }}>{bullets(e.description)}</div>
                        </div>
                    ))}
                </div>
            )}
            {d.education?.some(e => e.institution) && (
                <div style={{ marginBottom: 14 }}>
                    <AtsProSec title="EDUCATION" />
                    {d.education!.map((e, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <div><div style={{ fontWeight: 700, fontSize: 12 }}>{e.institution}</div><div style={{ fontSize: 11, color: "#555" }}>{e.degree}</div></div>
                            <div style={{ fontSize: 10.5, color: "#666" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</div>
                        </div>
                    ))}
                </div>
            )}
            {d.skills && d.skills.length > 0 && <><AtsProSec title="SKILLS" /><div style={{ fontSize: 11.5, marginBottom: 14 }}>{d.skills.join("  ·  ")}</div></>}
            {d.languages && d.languages.length > 0 && <><AtsProSec title="LANGUAGES" /><div style={{ fontSize: 11.5 }}>{d.languages.join("  ·  ")}</div></>}
        </div>
    );
}
function AtsProSec({ title }: { title: string }) {
    return <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase" as const, borderBottom: "1.5px solid #111", paddingBottom: 2, marginBottom: 8, color: "#111" }}>{title}</div>;
}

// ═══════════════════════════════════════════════════
// TEMPLATE 22: ATS HARVARD FORMAT
// ═══════════════════════════════════════════════════
function TemplateATSHarvard({ d }: { d: CvData }) {
    return (
        <div style={{ background: "#fff", fontFamily: "'Times New Roman', Times, serif", color: "#000", padding: "46px 56px", fontSize: 12, lineHeight: 1.6 }}>
            <div style={{ textAlign: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 0.5, marginBottom: 6 }}>{d.basicInfo?.fullName || "Your Name"}</div>
                <div style={{ fontSize: 11.5, color: "#333" }}>
                    {[d.basicInfo?.phone, d.basicInfo?.email, d.basicInfo?.location].filter(Boolean).map((item, i, arr) => (
                        <React.Fragment key={i}>{item}{i < arr.length - 1 && "  |  "}</React.Fragment>
                    ))}
                </div>
                {(d.basicInfo?.linkedin || d.basicInfo?.portfolio) && (
                    <div style={{ fontSize: 11, color: "#555", marginTop: 3 }}>
                        {[d.basicInfo?.linkedin, d.basicInfo?.portfolio].filter(Boolean).map((lnk, i, arr) => (
                            <React.Fragment key={i}><Lnk href={lnk!}>{lnk}</Lnk>{i < arr.length - 1 && "  |  "}</React.Fragment>
                        ))}
                    </div>
                )}
                <div style={{ borderBottom: "2px solid #000", marginTop: 10 }} />
            </div>
            {d.summary && <HarvSec title="OBJECTIVE / SUMMARY"><p style={{ fontSize: 12, lineHeight: 1.65, textAlign: "justify" as const }}>{d.summary}</p></HarvSec>}
            {d.education?.some(e => e.institution) && (
                <HarvSec title="EDUCATION">
                    {d.education!.map((e, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <div><div style={{ fontWeight: 700, fontSize: 13 }}>{e.institution}</div><div style={{ fontStyle: "italic", fontSize: 12 }}>{e.degree}</div></div>
                            <div style={{ fontSize: 11, textAlign: "right" as const, paddingTop: 2 }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</div>
                        </div>
                    ))}
                </HarvSec>
            )}
            {d.experience?.some(e => e.company) && (
                <HarvSec title="EXPERIENCE">
                    {d.experience!.map((e, i) => (
                        <div key={i} style={{ marginBottom: 14 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" as const }}>
                                <span style={{ fontWeight: 700, fontSize: 13 }}>{e.company}</span>
                                <span style={{ fontSize: 11 }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : e.startDate ? " – Present" : ""}</span>
                            </div>
                            <div style={{ fontStyle: "italic", fontSize: 12, marginBottom: 4 }}>{e.role}</div>
                            <div style={{ fontSize: 11.5, paddingLeft: 16, lineHeight: 1.6 }}>{bullets(e.description)}</div>
                        </div>
                    ))}
                </HarvSec>
            )}
            {d.skills && d.skills.length > 0 && <HarvSec title="SKILLS"><p style={{ fontSize: 12 }}>{d.skills.join(", ")}</p></HarvSec>}
            {d.languages && d.languages.length > 0 && <HarvSec title="LANGUAGES"><p style={{ fontSize: 12 }}>{d.languages.join(", ")}</p></HarvSec>}
        </div>
    );
}
function HarvSec({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1.5, borderBottom: "1px solid #000", paddingBottom: 2, marginBottom: 8 }}>{title}</div>
            {children}
        </div>
    );
}

// ═══════════════════════════════════════════════════
// TEMPLATE 23: ATS IMPACT
// ═══════════════════════════════════════════════════
function TemplateATSImpact({ d }: { d: CvData }) {
    const accent = "#1e40af";
    return (
        <div style={{ background: "#fff", fontFamily: "Arial, Helvetica, sans-serif", color: "#111", fontSize: 11.5 }}>
            <div style={{ background: "#f8fafc", borderBottom: "3px solid " + accent, padding: "26px 48px 20px" }}>
                <div style={{ fontSize: 23, fontWeight: 700, color: accent, marginBottom: 6 }}>{d.basicInfo?.fullName || "Your Name"}</div>
                <div style={{ fontSize: 10.5, color: "#555", display: "flex", flexWrap: "wrap", gap: "0 16px" }}>
                    {d.basicInfo?.phone && <span>{d.basicInfo.phone}</span>}
                    {d.basicInfo?.email && <Lnk href={`mailto:${d.basicInfo.email}`}>{d.basicInfo.email}</Lnk>}
                    {d.basicInfo?.location && <span>{d.basicInfo.location}</span>}
                    {d.basicInfo?.linkedin && <Lnk href={d.basicInfo.linkedin}>{d.basicInfo.linkedin}</Lnk>}
                    {d.basicInfo?.portfolio && <Lnk href={d.basicInfo.portfolio}>{d.basicInfo.portfolio}</Lnk>}
                </div>
            </div>
            <div style={{ padding: "22px 48px" }}>
                {d.summary && <ImpactSec title="Professional Summary" accent={accent}><p style={{ fontSize: 12, lineHeight: 1.65, color: "#444" }}>{d.summary}</p></ImpactSec>}
                {d.experience?.some(e => e.company) && (
                    <ImpactSec title="Work Experience" accent={accent}>
                        {d.experience!.map((e, i) => (
                            <div key={i} style={{ marginBottom: 14 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" as const }}>
                                    <span style={{ fontWeight: 700, fontSize: 13 }}>{e.role}</span>
                                    <span style={{ fontSize: 10, color: "#777", background: "#f1f5f9", padding: "2px 8px", borderRadius: 3 }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : e.startDate ? " – Present" : ""}</span>
                                </div>
                                <div style={{ fontSize: 11.5, color: accent, fontWeight: 600, marginBottom: 4 }}>{e.company}</div>
                                <div style={{ fontSize: 11, lineHeight: 1.55 }}>{bullets(e.description)}</div>
                            </div>
                        ))}
                    </ImpactSec>
                )}
                {d.education?.some(e => e.institution) && (
                    <ImpactSec title="Education" accent={accent}>
                        {d.education!.map((e, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                <div><div style={{ fontWeight: 700, fontSize: 12 }}>{e.institution}</div><div style={{ fontSize: 11, color: "#555" }}>{e.degree}</div></div>
                                <div style={{ fontSize: 10.5, color: "#777" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</div>
                            </div>
                        ))}
                    </ImpactSec>
                )}
                {d.skills && d.skills.length > 0 && (
                    <ImpactSec title="Core Skills" accent={accent}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {d.skills.map((sk, i) => <span key={i} style={{ fontSize: 11, background: "#eff6ff", color: accent, padding: "3px 12px", borderRadius: 4, border: `1px solid ${accent}30` }}>{sk}</span>)}
                        </div>
                    </ImpactSec>
                )}
                {d.languages && d.languages.length > 0 && <ImpactSec title="Languages" accent={accent}><p style={{ fontSize: 11.5 }}>{d.languages.join("  ·  ")}</p></ImpactSec>}
            </div>
        </div>
    );
}
function ImpactSec({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 2, color: accent, borderBottom: `2px solid ${accent}`, paddingBottom: 3, marginBottom: 10 }}>{title}</div>
            {children}
        </div>
    );
}

// ═══════════════════════════════════════════════════
// TEMPLATE 24: ATS FEDERAL (US Gov / USAJOBS)
// ═══════════════════════════════════════════════════
function TemplateATSFederal({ d }: { d: CvData }) {
    return (
        <div style={{ background: "#fff", fontFamily: "Arial, Helvetica, sans-serif", color: "#000", padding: "44px 56px", fontSize: 11.5, lineHeight: 1.6 }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 20, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{d.basicInfo?.fullName || "Your Name"}</div>
                <div style={{ fontSize: 11, color: "#333", marginTop: 5 }}>{[d.basicInfo?.phone, d.basicInfo?.email, d.basicInfo?.location].filter(Boolean).join("  |  ")}</div>
                {(d.basicInfo?.linkedin || d.basicInfo?.portfolio) && (
                    <div style={{ fontSize: 10.5, color: "#555", marginTop: 3 }}>
                        {[d.basicInfo?.linkedin, d.basicInfo?.portfolio].filter(Boolean).map((l, i, a) => <React.Fragment key={i}><Lnk href={l!}>{l}</Lnk>{i < a.length - 1 && "  |  "}</React.Fragment>)}
                    </div>
                )}
            </div>
            <div style={{ borderTop: "3px double #000", borderBottom: "1px solid #000", padding: "2px 0", marginBottom: 16 }} />
            {d.summary && <FedSec title="Objective / Profile Summary"><p style={{ lineHeight: 1.7 }}>{d.summary}</p></FedSec>}
            {d.experience?.some(e => e.company) && (
                <FedSec title="Professional Experience">
                    {d.experience!.map((e, i) => (
                        <div key={i} style={{ marginBottom: 16, borderLeft: "3px solid #ddd", paddingLeft: 14 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                <span style={{ fontWeight: 700, fontSize: 12 }}>{e.role}</span>
                                <span style={{ fontSize: 10.5, color: "#555" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : e.startDate ? " – Present" : ""}</span>
                            </div>
                            <div style={{ fontSize: 11.5, fontWeight: 700, color: "#444", marginBottom: 4 }}>{e.company}</div>
                            <div style={{ fontSize: 11, lineHeight: 1.55 }}>{bullets(e.description)}</div>
                        </div>
                    ))}
                </FedSec>
            )}
            {d.education?.some(e => e.institution) && (
                <FedSec title="Education">
                    {d.education!.map((e, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <div><div style={{ fontWeight: 700 }}>{e.institution}</div><div style={{ fontSize: 11, color: "#444" }}>{e.degree}</div></div>
                            <div style={{ fontSize: 10.5, color: "#555" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</div>
                        </div>
                    ))}
                </FedSec>
            )}
            {d.skills && d.skills.length > 0 && <FedSec title="Knowledge, Skills & Abilities (KSAs)"><p style={{ fontSize: 11.5 }}>{d.skills.join("  ·  ")}</p></FedSec>}
            {d.languages && d.languages.length > 0 && <FedSec title="Languages"><p style={{ fontSize: 11.5 }}>{d.languages.join("  ·  ")}</p></FedSec>}
        </div>
    );
}
function FedSec({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 2, background: "#f3f4f6", padding: "4px 10px", marginBottom: 10 }}>{title}</div>
            {children}
        </div>
    );
}

// ═══════════════════════════════════════════════════
// TEMPLATE 25: ATS CONSULTING
// ═══════════════════════════════════════════════════
function TemplateATSConsulting({ d }: { d: CvData }) {
    const accent = "#0f4c81";
    return (
        <div style={{ background: "#fff", fontFamily: "Arial, Helvetica, sans-serif", color: "#111", padding: "42px 52px", fontSize: 12, lineHeight: 1.6 }}>
            <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.3 }}>{d.basicInfo?.fullName || "Your Name"}</div>
                <div style={{ height: 3, background: accent, width: 60, marginTop: 6, marginBottom: 10 }} />
                <div style={{ fontSize: 11, color: "#555", display: "flex", flexWrap: "wrap", gap: "0 16px" }}>
                    {d.basicInfo?.phone && <span>{d.basicInfo.phone}</span>}
                    {d.basicInfo?.email && <Lnk href={`mailto:${d.basicInfo.email}`}>{d.basicInfo.email}</Lnk>}
                    {d.basicInfo?.location && <span>{d.basicInfo.location}</span>}
                    {d.basicInfo?.linkedin && <Lnk href={d.basicInfo.linkedin}>{d.basicInfo.linkedin}</Lnk>}
                    {d.basicInfo?.portfolio && <Lnk href={d.basicInfo.portfolio}>{d.basicInfo.portfolio}</Lnk>}
                </div>
            </div>
            {d.summary && <ConsultSec title="Executive Profile" accent={accent}><p style={{ fontSize: 12, lineHeight: 1.7, color: "#333" }}>{d.summary}</p></ConsultSec>}
            {d.experience?.some(e => e.company) && (
                <ConsultSec title="Professional Experience" accent={accent}>
                    {d.experience!.map((e, i) => (
                        <div key={i} style={{ marginBottom: 16, paddingLeft: 14, borderLeft: `3px solid ${accent}` }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ fontWeight: 700, fontSize: 13 }}>{e.role}</span>
                                <span style={{ fontSize: 10.5, color: "#777" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : e.startDate ? " – Present" : ""}</span>
                            </div>
                            <div style={{ fontSize: 11.5, color: accent, fontStyle: "italic", marginBottom: 5 }}>{e.company}</div>
                            <div style={{ fontSize: 11, lineHeight: 1.55 }}>{bullets(e.description)}</div>
                        </div>
                    ))}
                </ConsultSec>
            )}
            {d.education?.some(e => e.institution) && (
                <ConsultSec title="Education" accent={accent}>
                    {d.education!.map((e, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <div><div style={{ fontWeight: 700 }}>{e.institution}</div><div style={{ fontSize: 11, color: "#555" }}>{e.degree}</div></div>
                            <div style={{ fontSize: 10.5, color: "#777" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</div>
                        </div>
                    ))}
                </ConsultSec>
            )}
            {d.skills && d.skills.length > 0 && <ConsultSec title="Core Competencies" accent={accent}><div style={{ columns: 2, columnGap: 24 }}>{d.skills.map((sk, i) => <div key={i} style={{ fontSize: 11.5, marginBottom: 3, breakInside: "avoid" }}>› {sk}</div>)}</div></ConsultSec>}
            {d.languages && d.languages.length > 0 && <ConsultSec title="Languages" accent={accent}><p style={{ fontSize: 11.5 }}>{d.languages.join("  ·  ")}</p></ConsultSec>}
        </div>
    );
}
function ConsultSec({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 2.5, color: accent, paddingBottom: 4, borderBottom: `1.5px solid ${accent}`, marginBottom: 10 }}>{title}</div>
            {children}
        </div>
    );
}

// ═══════════════════════════════════════════════════
// TEMPLATE 26: ATS FINANCE
// ═══════════════════════════════════════════════════
function TemplateATSFinance({ d }: { d: CvData }) {
    return (
        <div style={{ background: "#fff", fontFamily: "'Times New Roman', Times, serif", color: "#111", padding: "44px 56px", fontSize: 12, lineHeight: 1.6 }}>
            <div style={{ marginBottom: 16, borderBottom: "0.5px solid #aaa", paddingBottom: 14 }}>
                <div style={{ fontSize: 22, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>{d.basicInfo?.fullName || "Your Name"}</div>
                <div style={{ fontSize: 11, color: "#444", marginTop: 6, display: "flex", flexWrap: "wrap", gap: "0 16px" }}>
                    {d.basicInfo?.phone && <span>{d.basicInfo.phone}</span>}
                    {d.basicInfo?.email && <Lnk href={`mailto:${d.basicInfo.email}`}>{d.basicInfo.email}</Lnk>}
                    {d.basicInfo?.location && <span>{d.basicInfo.location}</span>}
                    {d.basicInfo?.linkedin && <Lnk href={d.basicInfo.linkedin}>{d.basicInfo.linkedin}</Lnk>}
                </div>
            </div>
            {d.summary && <FinSec title="Profile"><p style={{ lineHeight: 1.7, textAlign: "justify" as const }}>{d.summary}</p></FinSec>}
            {d.experience?.some(e => e.company) && (
                <FinSec title="Professional Experience">
                    {d.experience!.map((e, i) => (
                        <div key={i} style={{ marginBottom: 14 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                <span style={{ fontWeight: 700, fontSize: 12.5 }}>{e.company}</span>
                                <span style={{ fontSize: 10.5, color: "#666", fontStyle: "italic" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : e.startDate ? " – Present" : ""}</span>
                            </div>
                            <div style={{ fontStyle: "italic", fontSize: 12, color: "#333", marginBottom: 4 }}>{e.role}</div>
                            <div style={{ fontSize: 11.5, paddingLeft: 14, lineHeight: 1.6 }}>{bullets(e.description)}</div>
                        </div>
                    ))}
                </FinSec>
            )}
            {d.education?.some(e => e.institution) && (
                <FinSec title="Education">
                    {d.education!.map((e, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <div><div style={{ fontWeight: 700, fontSize: 12.5 }}>{e.institution}</div><div style={{ fontStyle: "italic", fontSize: 11.5 }}>{e.degree}</div></div>
                            <div style={{ fontSize: 11, color: "#666" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</div>
                        </div>
                    ))}
                </FinSec>
            )}
            {(d.skills?.length || d.languages?.length) ? (
                <FinSec title="Skills & Languages">
                    {d.skills && d.skills.length > 0 && <p style={{ fontSize: 12, marginBottom: 4 }}><strong>Technical/Financial:</strong> {d.skills.join(", ")}</p>}
                    {d.languages && d.languages.length > 0 && <p style={{ fontSize: 12 }}><strong>Languages:</strong> {d.languages.join(", ")}</p>}
                </FinSec>
            ) : null}
        </div>
    );
}
function FinSec({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1.5, borderTop: "1.5px solid #000", borderBottom: "0.5px solid #000", padding: "3px 0", marginBottom: 10 }}>{title}</div>
            {children}
        </div>
    );
}

// ═══════════════════════════════════════════════════
// TEMPLATE 27: ATS MEDICAL / HEALTHCARE
// ═══════════════════════════════════════════════════
function TemplateATSMedical({ d }: { d: CvData }) {
    const accent = "#0e7490";
    return (
        <div style={{ background: "#fff", fontFamily: "Arial, Helvetica, sans-serif", color: "#111", padding: "40px 52px", fontSize: 12, lineHeight: 1.6 }}>
            <div style={{ borderBottom: `3px solid ${accent}`, paddingBottom: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: accent }}>{d.basicInfo?.fullName || "Your Name"}</div>
                <div style={{ fontSize: 11, color: "#555", marginTop: 6, display: "flex", flexWrap: "wrap", gap: "0 16px" }}>
                    {d.basicInfo?.phone && <span>{d.basicInfo.phone}</span>}
                    {d.basicInfo?.email && <Lnk href={`mailto:${d.basicInfo.email}`}>{d.basicInfo.email}</Lnk>}
                    {d.basicInfo?.location && <span>{d.basicInfo.location}</span>}
                    {d.basicInfo?.linkedin && <Lnk href={d.basicInfo.linkedin}>{d.basicInfo.linkedin}</Lnk>}
                </div>
            </div>
            {d.summary && <MedSec title="Professional Summary" accent={accent}><p style={{ lineHeight: 1.7 }}>{d.summary}</p></MedSec>}
            {d.experience?.some(e => e.company) && (
                <MedSec title="Clinical / Professional Experience" accent={accent}>
                    {d.experience!.map((e, i) => (
                        <div key={i} style={{ marginBottom: 14 }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ fontWeight: 700, fontSize: 12.5 }}>{e.role}</span>
                                <span style={{ fontSize: 10.5, color: "#666" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : e.startDate ? " – Present" : ""}</span>
                            </div>
                            <div style={{ fontSize: 12, color: accent, fontWeight: 600, marginBottom: 4 }}>{e.company}</div>
                            <div style={{ fontSize: 11.5, lineHeight: 1.55 }}>{bullets(e.description)}</div>
                        </div>
                    ))}
                </MedSec>
            )}
            {d.education?.some(e => e.institution) && (
                <MedSec title="Education & Credentials" accent={accent}>
                    {d.education!.map((e, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <div><div style={{ fontWeight: 700, fontSize: 12.5 }}>{e.institution}</div><div style={{ fontSize: 11.5, color: "#555" }}>{e.degree}</div></div>
                            <div style={{ fontSize: 11, color: "#666" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</div>
                        </div>
                    ))}
                </MedSec>
            )}
            {d.skills && d.skills.length > 0 && <MedSec title="Clinical Skills & Technologies" accent={accent}><div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{d.skills.map((sk, i) => <span key={i} style={{ fontSize: 11, background: "#ecfeff", color: accent, padding: "3px 12px", border: `1px solid ${accent}30`, borderRadius: 4 }}>{sk}</span>)}</div></MedSec>}
            {d.languages && d.languages.length > 0 && <MedSec title="Languages" accent={accent}><p style={{ fontSize: 12 }}>{d.languages.join("  ·  ")}</p></MedSec>}
        </div>
    );
}
function MedSec({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 2, color: accent, borderBottom: `1.5px solid ${accent}40`, paddingBottom: 4, marginBottom: 10 }}>{title}</div>
            {children}
        </div>
    );
}

// ═══════════════════════════════════════════════════
// TEMPLATE 28: ATS IT / ENGINEERING
// ═══════════════════════════════════════════════════
function TemplateATSIT({ d }: { d: CvData }) {
    return (
        <div style={{ background: "#fff", fontFamily: "'Courier New', Courier, monospace", color: "#111", padding: "38px 50px", fontSize: 11.5, lineHeight: 1.55 }}>
            <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>{d.basicInfo?.fullName || "Your Name"}</div>
                <div style={{ fontSize: 10.5, color: "#555", marginTop: 5, display: "flex", flexWrap: "wrap", gap: "0 12px" }}>
                    {d.basicInfo?.phone && <span>{d.basicInfo.phone}</span>}
                    {d.basicInfo?.email && <Lnk href={`mailto:${d.basicInfo.email}`}>{d.basicInfo.email}</Lnk>}
                    {d.basicInfo?.location && <span>{d.basicInfo.location}</span>}
                    {d.basicInfo?.linkedin && <Lnk href={d.basicInfo.linkedin}>{d.basicInfo.linkedin}</Lnk>}
                    {d.basicInfo?.portfolio && <Lnk href={d.basicInfo.portfolio}>{d.basicInfo.portfolio}</Lnk>}
                </div>
            </div>
            {d.skills && d.skills.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 3, color: "#111", borderBottom: "2px solid #111", paddingBottom: 2, marginBottom: 8 }}>// TECHNICAL SKILLS</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{d.skills.map((sk, i) => <span key={i} style={{ fontSize: 11, background: "#f3f4f6", color: "#111", padding: "2px 10px", border: "1px solid #d1d5db", borderRadius: 3 }}>{sk}</span>)}</div>
                </div>
            )}
            {d.summary && <><div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 3, color: "#111", borderBottom: "2px solid #111", paddingBottom: 2, marginBottom: 8 }}>// SUMMARY</div><p style={{ fontSize: 11.5, lineHeight: 1.65, marginBottom: 16 }}>{d.summary}</p></>}
            {d.experience?.some(e => e.company) && <>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 3, color: "#111", borderBottom: "2px solid #111", paddingBottom: 2, marginBottom: 10 }}>// EXPERIENCE</div>
                {d.experience!.map((e, i) => (
                    <div key={i} style={{ marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontWeight: 700, fontSize: 12 }}>{e.role}</span>
                            <span style={{ fontSize: 10.5, color: "#888" }}>{fmtDate(e.startDate)}{e.endDate ? `–${fmtDate(e.endDate)}` : e.startDate ? "–present" : ""}</span>
                        </div>
                        <div style={{ fontSize: 11, color: "#555", marginBottom: 4 }}>{e.company}</div>
                        <div style={{ fontSize: 11, lineHeight: 1.55 }}>{bullets(e.description)}</div>
                    </div>
                ))}
            </>}
            {d.education?.some(e => e.institution) && <>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 3, color: "#111", borderBottom: "2px solid #111", paddingBottom: 2, marginBottom: 10 }}>// EDUCATION</div>
                {d.education!.map((e, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}><div><div style={{ fontWeight: 700 }}>{e.institution}</div><div style={{ fontSize: 11, color: "#555" }}>{e.degree}</div></div><span style={{ fontSize: 10.5, color: "#888" }}>{fmtDate(e.startDate)}{e.endDate ? `–${fmtDate(e.endDate)}` : ""}</span></div>)}
            </>}
            {d.languages && d.languages.length > 0 && <><div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 3, color: "#111", borderBottom: "2px solid #111", paddingBottom: 2, marginBottom: 8, marginTop: 14 }}>// LANGUAGES</div><p style={{ fontSize: 11.5 }}>{d.languages.join("  |  ")}</p></>}
        </div>
    );
}

// ═══════════════════════════════════════════════════
// TEMPLATE 29: ATS LEGAL
// ═══════════════════════════════════════════════════
function TemplateATSLegal({ d }: { d: CvData }) {
    return (
        <div style={{ background: "#fff", fontFamily: "'Times New Roman', Times, serif", color: "#000", padding: "50px 62px", fontSize: 12, lineHeight: 1.65 }}>
            <div style={{ textAlign: "center", marginBottom: 18 }}>
                <div style={{ fontSize: 20, fontWeight: 700, textTransform: "uppercase", letterSpacing: 3 }}>{d.basicInfo?.fullName || "Your Name"}</div>
                <div style={{ fontSize: 11, color: "#333", marginTop: 5 }}>{[d.basicInfo?.phone, d.basicInfo?.email, d.basicInfo?.location].filter(Boolean).join("   |   ")}</div>
                {(d.basicInfo?.linkedin || d.basicInfo?.portfolio) && (
                    <div style={{ fontSize: 11, color: "#555", marginTop: 3 }}>
                        {[d.basicInfo?.linkedin, d.basicInfo?.portfolio].filter(Boolean).map((l, i, a) => <React.Fragment key={i}><Lnk href={l!}>{l}</Lnk>{i < a.length - 1 && "   |   "}</React.Fragment>)}
                    </div>
                )}
                <div style={{ margin: "12px auto 0", borderTop: "2px solid #000", borderBottom: "0.5px solid #000", paddingBottom: 4 }} />
            </div>
            {d.summary && <LegalSec num="I." title="Professional Summary"><p style={{ textAlign: "justify" as const, lineHeight: 1.75 }}>{d.summary}</p></LegalSec>}
            {d.experience?.some(e => e.company) && (
                <LegalSec num="II." title="Professional Experience">
                    {d.experience!.map((e, i) => (
                        <div key={i} style={{ marginBottom: 14 }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ fontWeight: 700, fontSize: 12.5 }}>{e.role}</span>
                                <span style={{ fontSize: 11, fontStyle: "italic" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : e.startDate ? " – Present" : ""}</span>
                            </div>
                            <div style={{ fontStyle: "italic", fontSize: 12, marginBottom: 5 }}>{e.company}</div>
                            <div style={{ fontSize: 12, paddingLeft: 16, lineHeight: 1.7 }}>{bullets(e.description)}</div>
                        </div>
                    ))}
                </LegalSec>
            )}
            {d.education?.some(e => e.institution) && (
                <LegalSec num="III." title="Education">
                    {d.education!.map((e, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <div><div style={{ fontWeight: 700, fontSize: 12.5 }}>{e.institution}</div><div style={{ fontStyle: "italic", fontSize: 12 }}>{e.degree}</div></div>
                            <div style={{ fontSize: 11 }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</div>
                        </div>
                    ))}
                </LegalSec>
            )}
            {(d.skills?.length || d.languages?.length) ? (
                <LegalSec num="IV." title="Skills & Languages">
                    {d.skills && d.skills.length > 0 && <p style={{ fontSize: 12, marginBottom: 5 }}><strong>Practice Areas / Skills:</strong> {d.skills.join(", ")}</p>}
                    {d.languages && d.languages.length > 0 && <p style={{ fontSize: 12 }}><strong>Languages:</strong> {d.languages.join(", ")}</p>}
                </LegalSec>
            ) : null}
        </div>
    );
}
function LegalSec({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "baseline", marginBottom: 8 }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, fontFamily: "Times New Roman", minWidth: 24 }}>{num}</span>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1.5, borderBottom: "0.75px solid #333", flex: 1, paddingBottom: 2 }}>{title}</span>
            </div>
            <div style={{ paddingLeft: 28 }}>{children}</div>
        </div>
    );
}

// ═══════════════════════════════════════════════════
// TEMPLATE 30: ATS SALES / BD
// ═══════════════════════════════════════════════════
function TemplateATSSales({ d }: { d: CvData }) {
    const accent = "#16a34a";
    return (
        <div style={{ background: "#fff", fontFamily: "Arial, Helvetica, sans-serif", color: "#111", padding: "40px 52px", fontSize: 12, lineHeight: 1.55 }}>
            <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{d.basicInfo?.fullName || "Your Name"}</div>
                <div style={{ height: 2, background: accent, width: "100%", marginTop: 4, marginBottom: 8 }} />
                <div style={{ fontSize: 11, color: "#444", display: "flex", flexWrap: "wrap", gap: "0 14px" }}>
                    {d.basicInfo?.phone && <span>{d.basicInfo.phone}</span>}
                    {d.basicInfo?.email && <Lnk href={`mailto:${d.basicInfo.email}`}>{d.basicInfo.email}</Lnk>}
                    {d.basicInfo?.location && <span>{d.basicInfo.location}</span>}
                    {d.basicInfo?.linkedin && <Lnk href={d.basicInfo.linkedin}>{d.basicInfo.linkedin}</Lnk>}
                </div>
            </div>
            {d.summary && <SalesSec title="Value Proposition" accent={accent}><p style={{ fontSize: 12.5, lineHeight: 1.7 }}>{d.summary}</p></SalesSec>}
            {d.experience?.some(e => e.company) && (
                <SalesSec title="Sales Experience & Achievements" accent={accent}>
                    {d.experience!.map((e, i) => (
                        <div key={i} style={{ marginBottom: 14 }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ fontWeight: 700, fontSize: 13 }}>{e.role}</span>
                                <span style={{ fontSize: 10.5, color: "#777" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : e.startDate ? " – Present" : ""}</span>
                            </div>
                            <div style={{ fontSize: 12, color: accent, fontWeight: 600, marginBottom: 5 }}>{e.company}</div>
                            <div style={{ fontSize: 11.5, lineHeight: 1.55 }}>{bullets(e.description)}</div>
                        </div>
                    ))}
                </SalesSec>
            )}
            {d.education?.some(e => e.institution) && (
                <SalesSec title="Education" accent={accent}>
                    {d.education!.map((e, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <div><div style={{ fontWeight: 700 }}>{e.institution}</div><div style={{ fontSize: 11, color: "#555" }}>{e.degree}</div></div>
                            <div style={{ fontSize: 10.5, color: "#777" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</div>
                        </div>
                    ))}
                </SalesSec>
            )}
            {d.skills && d.skills.length > 0 && <SalesSec title="Tools & Skills" accent={accent}><div style={{ columns: 2, columnGap: 24 }}>{d.skills.map((sk, i) => <div key={i} style={{ fontSize: 11.5, marginBottom: 3, breakInside: "avoid" }}>▸ {sk}</div>)}</div></SalesSec>}
            {d.languages && d.languages.length > 0 && <SalesSec title="Languages" accent={accent}><p style={{ fontSize: 12 }}>{d.languages.join("  ·  ")}</p></SalesSec>}
        </div>
    );
}
function SalesSec({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 2, color: "#fff", background: accent, padding: "3px 10px", marginBottom: 10, display: "inline-block" }}>{title}</div>
            {children}
        </div>
    );
}

// ═══════════════════════════════════════════════════
// TEMPLATE 31: ATS STEM / RESEARCH
// ═══════════════════════════════════════════════════
function TemplateATSSTEM({ d }: { d: CvData }) {
    return (
        <div style={{ background: "#fff", fontFamily: "'Times New Roman', Times, serif", color: "#000", padding: "46px 60px", fontSize: 11.5, lineHeight: 1.65 }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 0.5 }}>{d.basicInfo?.fullName || "Your Name"}</div>
                <div style={{ fontSize: 11, color: "#333", marginTop: 6 }}>{[d.basicInfo?.phone, d.basicInfo?.email, d.basicInfo?.location].filter(Boolean).join("  ·  ")}</div>
                {(d.basicInfo?.linkedin || d.basicInfo?.portfolio) && (
                    <div style={{ fontSize: 11, color: "#555", marginTop: 3 }}>
                        {[d.basicInfo?.linkedin, d.basicInfo?.portfolio].filter(Boolean).map((l, i, a) => <React.Fragment key={i}><Lnk href={l!}>{l}</Lnk>{i < a.length - 1 && "  ·  "}</React.Fragment>)}
                    </div>
                )}
                <div style={{ border: "none", borderBottom: "1px solid #000", marginTop: 10 }} />
            </div>
            {d.summary && <STEMSec title="Research Interests / Summary"><p style={{ textAlign: "justify" as const, lineHeight: 1.75 }}>{d.summary}</p></STEMSec>}
            {d.education?.some(e => e.institution) && (
                <STEMSec title="Education">
                    {d.education!.map((e, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <div><div style={{ fontWeight: 700, fontSize: 12.5 }}>{e.institution}</div><div style={{ fontStyle: "italic" }}>{e.degree}</div></div>
                            <div style={{ fontSize: 11 }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</div>
                        </div>
                    ))}
                </STEMSec>
            )}
            {d.experience?.some(e => e.company) && (
                <STEMSec title="Research & Professional Experience">
                    {d.experience!.map((e, i) => (
                        <div key={i} style={{ marginBottom: 14 }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ fontWeight: 700 }}>{e.role}</span>
                                <span style={{ fontSize: 11, fontStyle: "italic" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : e.startDate ? " – Present" : ""}</span>
                            </div>
                            <div style={{ fontStyle: "italic", color: "#333", marginBottom: 4 }}>{e.company}</div>
                            <div style={{ paddingLeft: 16, lineHeight: 1.65 }}>{bullets(e.description)}</div>
                        </div>
                    ))}
                </STEMSec>
            )}
            {d.skills && d.skills.length > 0 && <STEMSec title="Technical Skills & Methods"><p style={{ fontSize: 12 }}>{d.skills.join("  ·  ")}</p></STEMSec>}
            {d.languages && d.languages.length > 0 && <STEMSec title="Languages"><p style={{ fontSize: 12 }}>{d.languages.join("  ·  ")}</p></STEMSec>}
        </div>
    );
}
function STEMSec({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1.5, marginBottom: 8, borderBottom: "0.75px solid #555", paddingBottom: 2 }}>{title}</div>
            {children}
        </div>
    );
}

// ═══════════════════════════════════════════════════
// TEMPLATE 32: ATS CORPORATE BLUE
// ═══════════════════════════════════════════════════
function TemplateATSCorporate({ d }: { d: CvData }) {
    const accent = "#1e3a5f";
    return (
        <div style={{ background: "#fff", fontFamily: "Arial, Helvetica, sans-serif", color: "#111", fontSize: 12 }}>
            <div style={{ background: accent, color: "#fff", padding: "28px 50px 22px" }}>
                <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 0.5 }}>{d.basicInfo?.fullName || "Your Name"}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 8, display: "flex", flexWrap: "wrap", gap: "0 18px" }}>
                    {d.basicInfo?.phone && <span>{d.basicInfo.phone}</span>}
                    {d.basicInfo?.email && <span>{d.basicInfo.email}</span>}
                    {d.basicInfo?.location && <span>{d.basicInfo.location}</span>}
                    {d.basicInfo?.linkedin && <Lnk href={d.basicInfo.linkedin} style={{ color: "#94a3b8" }}>{d.basicInfo.linkedin}</Lnk>}
                </div>
            </div>
            <div style={{ padding: "26px 50px" }}>
                {d.summary && <CorpSec title="Professional Summary" accent={accent}><p style={{ fontSize: 12.5, lineHeight: 1.7 }}>{d.summary}</p></CorpSec>}
                {d.experience?.some(e => e.company) && (
                    <CorpSec title="Work Experience" accent={accent}>
                        {d.experience!.map((e, i) => (
                            <div key={i} style={{ marginBottom: 14 }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ fontWeight: 700, fontSize: 13 }}>{e.role}</span>
                                    <span style={{ fontSize: 10.5, color: "#6b7280" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : e.startDate ? " – Present" : ""}</span>
                                </div>
                                <div style={{ fontSize: 12, color: accent, fontWeight: 600, marginBottom: 5 }}>{e.company}</div>
                                <div style={{ fontSize: 11.5, lineHeight: 1.55 }}>{bullets(e.description)}</div>
                            </div>
                        ))}
                    </CorpSec>
                )}
                {d.education?.some(e => e.institution) && (
                    <CorpSec title="Education" accent={accent}>
                        {d.education!.map((e, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                <div><div style={{ fontWeight: 700, fontSize: 13 }}>{e.institution}</div><div style={{ fontSize: 11.5, color: "#555" }}>{e.degree}</div></div>
                                <div style={{ fontSize: 11, color: "#6b7280" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</div>
                            </div>
                        ))}
                    </CorpSec>
                )}
                {(d.skills?.length || d.languages?.length) ? (
                    <CorpSec title="Skills & Languages" accent={accent}>
                        {d.skills && d.skills.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 10 }}>{d.skills.map((sk, i) => <span key={i} style={{ fontSize: 11.5, background: "#f0f4f8", color: accent, padding: "4px 12px", borderRadius: 4, border: `1px solid ${accent}30` }}>{sk}</span>)}</div>}
                        {d.languages && d.languages.length > 0 && <p style={{ fontSize: 12 }}><strong>Languages:</strong> {d.languages.join(", ")}</p>}
                    </CorpSec>
                ) : null}
            </div>
        </div>
    );
}
function CorpSec({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 2, color: accent, borderLeft: `4px solid ${accent}`, paddingLeft: 10, marginBottom: 10, lineHeight: 1 }}>{title}</div>
            {children}
        </div>
    );
}

// ═══════════════════════════════════════════════════
// TEMPLATE 33: ATS EXECUTIVE PRO
// ═══════════════════════════════════════════════════
function TemplateATSExecPro({ d }: { d: CvData }) {
    return (
        <div style={{ background: "#fff", fontFamily: "Georgia, 'Times New Roman', serif", color: "#000", padding: "52px 62px", fontSize: 12.5, lineHeight: 1.65 }}>
            <div style={{ borderBottom: "2px solid #000", paddingBottom: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>{d.basicInfo?.fullName || "Your Name"}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 22px", fontSize: 12, color: "#555", marginTop: 8 }}>
                    {d.basicInfo?.phone && <span>{d.basicInfo.phone}</span>}
                    {d.basicInfo?.email && <Lnk href={`mailto:${d.basicInfo.email}`}>{d.basicInfo.email}</Lnk>}
                    {d.basicInfo?.location && <span>{d.basicInfo.location}</span>}
                    {d.basicInfo?.linkedin && <Lnk href={d.basicInfo.linkedin}>{d.basicInfo.linkedin}</Lnk>}
                </div>
            </div>
            {d.summary && <><div style={{ fontStyle: "italic", fontSize: 13, lineHeight: 1.75, marginBottom: 22, paddingLeft: 20, borderLeft: "3px solid #000", color: "#333" }}>{d.summary}</div></>}
            {d.experience?.some(e => e.company) && (
                <ExecProSec title="Executive Experience">
                    {d.experience!.map((e, i) => (
                        <div key={i} style={{ marginBottom: 18 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                <span style={{ fontWeight: 700, fontSize: 14 }}>{e.role}</span>
                                <span style={{ fontSize: 11, color: "#888" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : e.startDate ? " – Present" : ""}</span>
                            </div>
                            <div style={{ fontSize: 12.5, fontStyle: "italic", color: "#444", marginBottom: 6 }}>{e.company}</div>
                            <div style={{ fontSize: 12, lineHeight: 1.65, paddingLeft: 16 }}>{bullets(e.description)}</div>
                        </div>
                    ))}
                </ExecProSec>
            )}
            {d.education?.some(e => e.institution) && (
                <ExecProSec title="Education">
                    {d.education!.map((e, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                            <div><div style={{ fontWeight: 700, fontSize: 14 }}>{e.institution}</div><div style={{ fontStyle: "italic", fontSize: 12 }}>{e.degree}</div></div>
                            <span style={{ fontSize: 11, color: "#888" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</span>
                        </div>
                    ))}
                </ExecProSec>
            )}
            {(d.skills?.length || d.languages?.length) ? (
                <ExecProSec title="Leadership Skills & Languages">
                    {d.skills && d.skills.length > 0 && <p style={{ fontSize: 12.5, marginBottom: 4 }}><strong>Competencies:</strong> {d.skills.join("  ·  ")}</p>}
                    {d.languages && d.languages.length > 0 && <p style={{ fontSize: 12.5 }}><strong>Languages:</strong> {d.languages.join("  ·  ")}</p>}
                </ExecProSec>
            ) : null}
        </div>
    );
}
function ExecProSec({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 2.5, marginBottom: 4 }}>{title}</div>
            <div style={{ height: 0.75, background: "#000", marginBottom: 12 }} />
            {children}
        </div>
    );
}

// ─────────────────────────────────────────────────
// RENDERER DISPATCHER
export function CvTemplateRenderer({
    templateId, data, isPaidUser = true
}: {
    templateId: string;
    data: CvData;
    isPaidUser?: boolean;
}) {
    let template: React.ReactNode;
    switch (templateId) {
        case "modern": template = <TemplateModern d={data} />; break;
        case "executive": template = <TemplateExecutive d={data} />; break;
        case "creative": template = <TemplateCreative d={data} />; break;
        case "minimal": template = <TemplateMinimal d={data} />; break;
        case "euro": template = <TemplateEuro d={data} />; break;
        case "compact": template = <TemplateCompact d={data} />; break;
        case "timeline": template = <TemplateTimeline d={data} />; break;
        case "clean": template = <TemplateClean d={data} />; break;
        case "teal": template = <TemplateTeal d={data} />; break;
        case "rose": template = <TemplateRose d={data} />; break;
        case "navy-gold": template = <TemplateNavyGold d={data} />; break;
        case "emerald": template = <TemplateEmerald d={data} />; break;
        case "academic": template = <TemplateAcademic d={data} />; break;
        case "startup": template = <TemplateStartup d={data} />; break;
        case "terra": template = <TemplateTerra d={data} />; break;
        case "cobalt": template = <TemplateCobalt d={data} />; break;
        case "forest": template = <TemplateForest d={data} />; break;
        case "copper": template = <TemplateCopper d={data} />; break;
        case "slate": template = <TemplateSlate d={data} />; break;
        case "ats-pro": template = <TemplateATSPro d={data} />; break;
        case "ats-harvard": template = <TemplateATSHarvard d={data} />; break;
        case "ats-impact": template = <TemplateATSImpact d={data} />; break;
        case "ats-federal": template = <TemplateATSFederal d={data} />; break;
        case "ats-consult": template = <TemplateATSConsulting d={data} />; break;
        case "ats-finance": template = <TemplateATSFinance d={data} />; break;
        case "ats-medical": template = <TemplateATSMedical d={data} />; break;
        case "ats-it": template = <TemplateATSIT d={data} />; break;
        case "ats-legal": template = <TemplateATSLegal d={data} />; break;
        case "ats-sales": template = <TemplateATSSales d={data} />; break;
        case "ats-stem": template = <TemplateATSSTEM d={data} />; break;
        case "ats-corporate": template = <TemplateATSCorporate d={data} />; break;
        case "ats-exec-pro": template = <TemplateATSExecPro d={data} />; break;
        default: template = <TemplateClassic d={data} />;
    }

    return (
        <div style={{ position: "relative" }}>
            {template}
            {!isPaidUser && (
                <div style={{
                    position: "absolute", bottom: 12, right: 12,
                    pointerEvents: "none", userSelect: "none"
                }}>
                    {/* Text watermark — bottom right corner */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                        <span style={{ fontWeight: 900, fontSize: "20px", color: "#15254A", opacity: 0.5 }}>
                            Nexora <span style={{ color: "#35848A" }}>AI</span>
                        </span>
                        <span style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "1px", color: "#15254A", opacity: 0.5, textTransform: "uppercase" }}>
                            AI Resume Optimizer
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
