"use client";

import React from "react";
import {
    Document, Page, Text, View, StyleSheet, Font, Svg, Path, Link,
} from "@react-pdf/renderer";
import type { CvData } from "./CvTemplates";

// Register a clean sans-serif font
Font.register({
    family: "Inter",
    fonts: [
        { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2" },
        { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2", fontWeight: 700 },
    ],
});

function fmtDate(d?: string) {
    if (!d) return "";
    if (d.length === 7 && d.includes("-")) {
        const [y, m] = d.split("-");
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${months[+m - 1]} ${y}`;
    }
    return d;
}

// Ensure URL has proper protocol for PDF links
function ensureHttps(url: string): string {
    if (!url) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
}

// ──────────────────────────────────────────────
// CLASSIC ATS PDF (B&W, single column, high ATS)
// ──────────────────────────────────────────────
const classicStyles = StyleSheet.create({
    page: { fontFamily: "Times-Roman", fontSize: 10.5, color: "#1a1a1a", padding: "40 50", lineHeight: 1.6, backgroundColor: "#fff" },
    name: { fontSize: 20, fontFamily: "Times-Bold", textAlign: "center", letterSpacing: 2, textTransform: "uppercase", marginBottom: 5, color: "#000" },
    contactRow: { textAlign: "center", fontSize: 9, color: "#444", marginBottom: 2 },
    contactLink: { color: "#1a1a1a", textDecoration: "none" },
    divider: { borderBottom: "1pt solid #222", marginTop: 8, marginBottom: 12 },
    sectionTitle: { fontFamily: "Times-Bold", fontSize: 11, textTransform: "uppercase", letterSpacing: 2, borderBottom: "1pt solid #222", paddingBottom: 3, marginBottom: 8, marginTop: 14, color: "#000" },
    expRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
    expRole: { fontFamily: "Times-Bold", fontSize: 11, color: "#000" },
    expDates: { fontSize: 9, color: "#555", fontFamily: "Times-Italic" },
    expCompany: { fontFamily: "Times-Italic", fontSize: 10, marginBottom: 4, color: "#333" },
    bullet: { fontSize: 10, marginBottom: 2, paddingLeft: 10, lineHeight: 1.6 },
    skillsRow: { fontSize: 10, marginBottom: 3, lineHeight: 1.5 },
});

function ClassicPDF({ d, watermark = false }: { d: CvData; watermark?: boolean }) {
    const contacts = [d.basicInfo?.phone, d.basicInfo?.email, d.basicInfo?.location].filter(Boolean);
    const links = [d.basicInfo?.linkedin, d.basicInfo?.portfolio].filter(Boolean);

    const renderBullets = (desc?: string) => {
        if (!desc) return null;
        return desc.split("\n").map((line, i) => {
            const clean = line.trim().replace(/^[•\-*]\s*/, "");
            if (!clean) return null;
            return <Text key={i} style={classicStyles.bullet}>• {clean}</Text>;
        });
    };

    return (
        <Document title={`CV – ${d.basicInfo?.fullName || "Resume"}`}>
            <Page size="A4" style={classicStyles.page}>
                {watermark && <WatermarkLayer />}
                <Text style={classicStyles.name}>{d.basicInfo?.fullName || "Your Name"}</Text>
                {contacts.length > 0 && (
                    <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 2 }}>
                        {d.basicInfo?.phone && (
                            <Link src={`tel:${d.basicInfo.phone}`} style={classicStyles.contactLink}>
                                <Text style={classicStyles.contactRow}>{d.basicInfo.phone}</Text>
                            </Link>
                        )}
                        {d.basicInfo?.phone && d.basicInfo?.email && <Text style={classicStyles.contactRow}>  •  </Text>}
                        {d.basicInfo?.email && (
                            <Link src={`mailto:${d.basicInfo.email}`} style={classicStyles.contactLink}>
                                <Text style={classicStyles.contactRow}>{d.basicInfo.email}</Text>
                            </Link>
                        )}
                        {d.basicInfo?.location && (d.basicInfo?.email || d.basicInfo?.phone) && <Text style={classicStyles.contactRow}>  •  </Text>}
                        {d.basicInfo?.location && <Text style={classicStyles.contactRow}>{d.basicInfo.location}</Text>}
                    </View>
                )}
                {links.length > 0 && (
                    <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 2 }}>
                        {d.basicInfo?.linkedin && (
                            <Link src={ensureHttps(d.basicInfo.linkedin)} style={classicStyles.contactLink}>
                                <Text style={classicStyles.contactRow}>{d.basicInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</Text>
                            </Link>
                        )}
                        {d.basicInfo?.linkedin && d.basicInfo?.portfolio && <Text style={classicStyles.contactRow}>  •  </Text>}
                        {d.basicInfo?.portfolio && (
                            <Link src={ensureHttps(d.basicInfo.portfolio)} style={classicStyles.contactLink}>
                                <Text style={classicStyles.contactRow}>{d.basicInfo.portfolio.replace(/^https?:\/\/(www\.)?/, '')}</Text>
                            </Link>
                        )}
                    </View>
                )}
                <View style={classicStyles.divider} />

                {d.summary && (
                    <View>
                        <Text style={classicStyles.sectionTitle}>Professional Summary</Text>
                        <Text style={{ fontSize: 10.5, lineHeight: 1.55 }}>{d.summary}</Text>
                    </View>
                )}

                {d.experience?.some(e => e.company || e.role) && (
                    <View>
                        <Text style={classicStyles.sectionTitle}>Experience</Text>
                        {d.experience!.map((e, i) => (
                            <View key={i} style={{ marginBottom: 8 }}>
                                <View style={classicStyles.expRow}>
                                    <Text style={classicStyles.expRole}>{e.role}</Text>
                                    <Text style={classicStyles.expDates}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : e.startDate ? " – Present" : ""}</Text>
                                </View>
                                <Text style={classicStyles.expCompany}>{e.company}</Text>
                                {renderBullets(e.description)}
                            </View>
                        ))}
                    </View>
                )}

                {d.education?.some(e => e.institution) && (
                    <View>
                        <Text style={classicStyles.sectionTitle}>Education</Text>
                        {d.education!.map((e, i) => (
                            <View key={i} style={{ ...classicStyles.expRow, marginBottom: 6 }}>
                                <View>
                                    <Text style={{ fontFamily: "Times-Bold", fontSize: 10.5 }}>{e.institution}</Text>
                                    <Text style={{ fontSize: 10, color: "#444" }}>{e.degree}</Text>
                                </View>
                                <Text style={classicStyles.expDates}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {d.projects?.some(p => p.title) && (
                    <View>
                        <Text style={classicStyles.sectionTitle}>Projects</Text>
                        {d.projects!.map((p, i) => (
                            <View key={i} style={{ marginBottom: 6 }}>
                                <Text style={{ fontFamily: "Times-Bold", fontSize: 10.5 }}>{p.title}{p.link ? `  |  ${p.link}` : ""}</Text>
                                {p.description && <Text style={{ fontSize: 10, color: "#444", marginTop: 1 }}>{p.description}</Text>}
                            </View>
                        ))}
                    </View>
                )}

                {(d.skills?.length || d.languages?.length) ? (
                    <View>
                        <Text style={classicStyles.sectionTitle}>Skills & Languages</Text>
                        {d.skills && d.skills.length > 0 && <Text style={classicStyles.skillsRow}><Text style={{ fontFamily: "Times-Bold" }}>Skills: </Text>{d.skills.join(" · ")}</Text>}
                        {d.languages && d.languages.length > 0 && <Text style={classicStyles.skillsRow}><Text style={{ fontFamily: "Times-Bold" }}>Languages: </Text>{d.languages.join(" · ")}</Text>}
                    </View>
                ) : null}
            </Page>
        </Document>
    );
}

// ──────────────────────────────────────────────
// MODERN PRO PDF (Two-column, indigo sidebar)
// ──────────────────────────────────────────────
const modernStyles = StyleSheet.create({
    page: { flexDirection: "row", backgroundColor: "#fff", fontFamily: "Helvetica", fontSize: 10 },
    sidebar: { width: 175, backgroundColor: "#4338ca", color: "#fff", padding: "32 16 32 20" },
    main: { flex: 1, padding: "32 28 32 24" },
    sidebarName: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#fff", marginBottom: 6, lineHeight: 1.3 },
    sidebarSectionTitle: { fontSize: 7.5, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(255,255,255,0.65)", borderBottom: "0.5pt solid rgba(255,255,255,0.25)", paddingBottom: 3, marginBottom: 7, marginTop: 12 },
    sidebarText: { fontSize: 9, color: "rgba(255,255,255,0.88)", marginBottom: 3 },
    mainSecTitle: { fontSize: 8.5, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 1.5, color: "#4338ca", borderBottom: "1pt solid #c7d2fe", paddingBottom: 2, marginBottom: 8, marginTop: 12 },
    expHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 1 },
    role: { fontFamily: "Helvetica-Bold", fontSize: 10.5 },
    dates: { fontSize: 8.5, color: "#888" },
    company: { fontSize: 9.5, color: "#4338ca", fontFamily: "Helvetica-Bold", marginBottom: 3 },
    desc: { fontSize: 9.5, color: "#555", lineHeight: 1.5 },
    skillBar: { height: 2.5, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 2, marginTop: 2, marginBottom: 5 },
    skillBarFill: { height: 2.5, backgroundColor: "rgba(255,255,255,0.7)", borderRadius: 2 },
});

function ModernPDF({ d, watermark = false, accent = "#4338ca" }: { d: CvData; watermark?: boolean; accent?: string }) {
    return (
        <Document title={`CV – ${d.basicInfo?.fullName || "Resume"}`}>
            <Page size="A4" style={modernStyles.page}>
                {watermark && <WatermarkLayer />}
                {/* Sidebar */}
                <View style={[modernStyles.sidebar, { backgroundColor: accent }]}>
                    <Text style={modernStyles.sidebarName}>{d.basicInfo?.fullName || "Your Name"}</Text>

                    <Text style={modernStyles.sidebarSectionTitle}>Contact</Text>
                    {d.basicInfo?.phone && (
                        <Link src={`tel:${d.basicInfo.phone}`} style={{ textDecoration: "none", color: "rgba(255,255,255,0.88)" }}>
                            <Text style={modernStyles.sidebarText}>📞 {d.basicInfo.phone}</Text>
                        </Link>
                    )}
                    {d.basicInfo?.email && (
                        <Link src={`mailto:${d.basicInfo.email}`} style={{ textDecoration: "none", color: "rgba(255,255,255,0.88)" }}>
                            <Text style={modernStyles.sidebarText}>✉ {d.basicInfo.email}</Text>
                        </Link>
                    )}
                    {d.basicInfo?.location && <Text style={modernStyles.sidebarText}>📍 {d.basicInfo.location}</Text>}
                    {d.basicInfo?.linkedin && (
                        <Link src={ensureHttps(d.basicInfo.linkedin)} style={{ textDecoration: "none", color: "rgba(255,255,255,0.88)" }}>
                            <Text style={{ ...modernStyles.sidebarText, fontSize: 8 }}>{d.basicInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</Text>
                        </Link>
                    )}
                    {d.basicInfo?.portfolio && (
                        <Link src={ensureHttps(d.basicInfo.portfolio)} style={{ textDecoration: "none", color: "rgba(255,255,255,0.88)" }}>
                            <Text style={{ ...modernStyles.sidebarText, fontSize: 8 }}>{d.basicInfo.portfolio.replace(/^https?:\/\/(www\.)?/, '')}</Text>
                        </Link>
                    )}

                    {d.skills && d.skills.length > 0 && (
                        <View>
                            <Text style={modernStyles.sidebarSectionTitle}>Skills</Text>
                            {d.skills.map((sk, i) => (
                                <View key={i} style={{ marginBottom: 4 }}>
                                    <Text style={modernStyles.sidebarText}>{sk}</Text>
                                    <View style={modernStyles.skillBar}>
                                        <View style={{ ...modernStyles.skillBarFill, width: `${68 + (i * 11 % 30)}%` }} />
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {d.languages && d.languages.length > 0 && (
                        <View>
                            <Text style={modernStyles.sidebarSectionTitle}>Languages</Text>
                            {d.languages.map((l, i) => <Text key={i} style={modernStyles.sidebarText}>{l}</Text>)}
                        </View>
                    )}
                </View>

                {/* Main content */}
                <View style={modernStyles.main}>
                    {d.summary && (
                        <View>
                            <Text style={modernStyles.mainSecTitle}>About Me</Text>
                            <Text style={{ fontSize: 10, color: "#444", lineHeight: 1.55 }}>{d.summary}</Text>
                        </View>
                    )}

                    {d.experience?.some(e => e.company) && (
                        <View>
                            <Text style={modernStyles.mainSecTitle}>Experience</Text>
                            {d.experience!.map((e, i) => (
                                <View key={i} style={{ marginBottom: 10 }}>
                                    <View style={modernStyles.expHeader}>
                                        <Text style={modernStyles.role}>{e.role}</Text>
                                        <Text style={modernStyles.dates}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : e.startDate ? " – Present" : ""}</Text>
                                    </View>
                                    <Text style={modernStyles.company}>{e.company}</Text>
                                    <Text style={modernStyles.desc}>{e.description}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {d.education?.some(e => e.institution) && (
                        <View>
                            <Text style={modernStyles.mainSecTitle}>Education</Text>
                            {d.education!.map((e, i) => (
                                <View key={i} style={{ ...modernStyles.expHeader, marginBottom: 7 }}>
                                    <View>
                                        <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 10.5 }}>{e.institution}</Text>
                                        <Text style={{ fontSize: 9.5, color: "#555" }}>{e.degree}</Text>
                                    </View>
                                    <Text style={modernStyles.dates}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {d.projects?.some(p => p.title) && (
                        <View>
                            <Text style={modernStyles.mainSecTitle}>Projects</Text>
                            {d.projects!.map((p, i) => (
                                <View key={i} style={{ marginBottom: 6 }}>
                                    <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 10.5 }}>{p.title}</Text>
                                    {p.description && <Text style={modernStyles.desc}>{p.description}</Text>}
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </Page>
        </Document>
    );
}

// ──────────────────────────────────────────────
// HEADER PDF (colored top banner, any accent)
// ──────────────────────────────────────────────
function HeaderPDF({ d, watermark = false, accent = "#7c3aed" }: { d: CvData; watermark?: boolean; accent?: string }) {
    const contacts = [d.basicInfo?.phone, d.basicInfo?.email, d.basicInfo?.location].filter(Boolean);
    return (
        <Document title={`CV – ${d.basicInfo?.fullName || "Resume"}`}>
            <Page size="A4" style={{ fontFamily: "Helvetica", fontSize: 10, backgroundColor: "#fff", color: "#111" }}>
                {watermark && <WatermarkLayer />}
                {/* Header banner */}
                <View style={{ backgroundColor: accent, padding: "32 40 24", color: "#fff" }}>
                    <Text style={{ fontSize: 22, fontFamily: "Helvetica-Bold", color: "#fff", marginBottom: 10 }}>{d.basicInfo?.fullName || "Your Name"}</Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 3 }}>
                        {d.basicInfo?.phone && (
                            <Link src={`tel:${d.basicInfo.phone}`} style={{ textDecoration: "none", color: "rgba(255,255,255,0.9)" }}>
                                <Text style={{ fontSize: 9, color: "rgba(255,255,255,0.9)", marginRight: 8 }}>{d.basicInfo.phone}</Text>
                            </Link>
                        )}
                        {d.basicInfo?.email && (
                            <Link src={`mailto:${d.basicInfo.email}`} style={{ textDecoration: "none", color: "rgba(255,255,255,0.9)" }}>
                                <Text style={{ fontSize: 9, color: "rgba(255,255,255,0.9)", marginRight: 8 }}>{d.basicInfo.email}</Text>
                            </Link>
                        )}
                        {d.basicInfo?.location && <Text style={{ fontSize: 9, color: "rgba(255,255,255,0.75)" }}>{d.basicInfo.location}</Text>}
                    </View>
                    {(d.basicInfo?.linkedin || d.basicInfo?.portfolio) && (
                        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                            {d.basicInfo?.linkedin && (
                                <Link src={ensureHttps(d.basicInfo.linkedin)} style={{ textDecoration: "none", color: "rgba(255,255,255,0.75)" }}>
                                    <Text style={{ fontSize: 8, color: "rgba(255,255,255,0.75)", marginRight: 8 }}>{d.basicInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</Text>
                                </Link>
                            )}
                            {d.basicInfo?.portfolio && (
                                <Link src={ensureHttps(d.basicInfo.portfolio)} style={{ textDecoration: "none", color: "rgba(255,255,255,0.75)" }}>
                                    <Text style={{ fontSize: 8, color: "rgba(255,255,255,0.75)" }}>{d.basicInfo.portfolio.replace(/^https?:\/\/(www\.)?/, '')}</Text>
                                </Link>
                            )}
                        </View>
                    )}
                </View>
                {/* Main content */}
                <View style={{ padding: "24 40 32" }}>
                    {d.summary && (
                        <View style={{ marginBottom: 14 }}>
                            <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 1.5, color: accent, borderBottom: `1pt solid ${accent}40`, paddingBottom: 2, marginBottom: 7 }}>About</Text>
                            <Text style={{ fontSize: 10, color: "#444", lineHeight: 1.55 }}>{d.summary}</Text>
                        </View>
                    )}
                    {d.experience?.some(e => e.company) && (
                        <View style={{ marginBottom: 14 }}>
                            <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 1.5, color: accent, borderBottom: `1pt solid ${accent}40`, paddingBottom: 2, marginBottom: 8 }}>Experience</Text>
                            {d.experience!.map((e, i) => (
                                <View key={i} style={{ marginBottom: 10 }}>
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 1 }}>
                                        <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 10.5 }}>{e.role}</Text>
                                        <Text style={{ fontSize: 8.5, color: "#888" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : e.startDate ? " – Present" : ""}</Text>
                                    </View>
                                    <Text style={{ fontSize: 9.5, color: accent, fontFamily: "Helvetica-Bold", marginBottom: 3 }}>{e.company}</Text>
                                    <Text style={{ fontSize: 9.5, color: "#555", lineHeight: 1.5 }}>{e.description}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                    {d.education?.some(e => e.institution) && (
                        <View style={{ marginBottom: 14 }}>
                            <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 1.5, color: accent, borderBottom: `1pt solid ${accent}40`, paddingBottom: 2, marginBottom: 8 }}>Education</Text>
                            {d.education!.map((e, i) => (
                                <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 7 }}>
                                    <View>
                                        <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 10.5 }}>{e.institution}</Text>
                                        <Text style={{ fontSize: 9.5, color: "#555" }}>{e.degree}</Text>
                                    </View>
                                    <Text style={{ fontSize: 8.5, color: "#888" }}>{fmtDate(e.startDate)}{e.endDate ? ` – ${fmtDate(e.endDate)}` : ""}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                    {(d.skills?.length || d.languages?.length) ? (
                        <View>
                            <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 1.5, color: accent, borderBottom: `1pt solid ${accent}40`, paddingBottom: 2, marginBottom: 8 }}>Skills & Languages</Text>
                            {d.skills && d.skills.length > 0 && <Text style={{ fontSize: 10, marginBottom: 3 }}><Text style={{ fontFamily: "Helvetica-Bold" }}>Skills: </Text>{d.skills.join(" · ")}</Text>}
                            {d.languages && d.languages.length > 0 && <Text style={{ fontSize: 10 }}><Text style={{ fontFamily: "Helvetica-Bold" }}>Languages: </Text>{d.languages.join(" · ")}</Text>}
                        </View>
                    ) : null}
                </View>
            </Page>
        </Document>
    );
}

// ──────────────────────────────────────────────
// WATERMARK overlay — Text watermark in bottom right corner (free versions only)
// ──────────────────────────────────────────────
function WatermarkLayer() {
    return (
        <View style={{
            position: "absolute",
            bottom: 8, right: 8,
            flexDirection: "column",
            alignItems: "flex-end",
        }}>
            {/* Text watermark */}
            <View style={{ flexDirection: "row" }}>
                <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 14, color: "#15254A", opacity: 0.5 }}>Nexora </Text>
                <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 14, color: "#35848A", opacity: 0.5 }}>AI</Text>
            </View>
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 6, color: "#15254A", opacity: 0.5, letterSpacing: 0.5, textTransform: "uppercase" }}>
                AI Resume Optimizer
            </Text>
        </View>
    );
}

// Dispatcher
export function getPdfDocument(templateId: string, data: CvData, watermark = false): React.ReactElement {
    // Sidebar-layout templates (different accent colors)
    const sidebarAccents: Record<string, string> = {
        modern: "#4338ca", teal: "#0d9488", cobalt: "#1d4ed8",
    };
    // Header-layout templates
    const headerAccents: Record<string, string> = {
        creative: "#7c3aed", rose: "#e11d48", startup: "#6d28d9",
        terra: "#c2410c", forest: "#14532d", "navy-gold": "#1e3a5f",
    };
    if (sidebarAccents[templateId]) {
        return <ModernPDF d={data} watermark={watermark} accent={sidebarAccents[templateId]} />;
    }
    if (headerAccents[templateId]) {
        return <HeaderPDF d={data} watermark={watermark} accent={headerAccents[templateId]} />;
    }
    // Single-column templates map to ClassicPDF
    return <ClassicPDF d={data} watermark={watermark} />;
}

// Download Button Component — uses programmatic blob approach for proper filename
export function PdfDownloadButton({ data, templateId, fileName, watermark = false }: {
    data: CvData;
    templateId: string;
    fileName?: string;
    watermark?: boolean;
}) {
    const [loading, setLoading] = React.useState(false);

    const handleClick = async () => {
        setLoading(true);
        try {
            const { pdf } = await import("@react-pdf/renderer");
            const doc = getPdfDocument(templateId, data, watermark);
            const blob = await pdf(doc as any).toBlob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName || `CV_${data.basicInfo?.fullName?.replace(/\s+/g, "_") || "Resume"}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (err) {
            console.error("PDF error:", err);
            alert("PDF generation failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button onClick={handleClick} disabled={loading}
            className="flex items-center gap-2 bg-green-600 text-white rounded-xl px-4 py-2.5 font-bold hover:bg-green-700 transition disabled:opacity-60 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 8l-3-3m3 3l3-3M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
            </svg>
            {loading ? "Generating PDF…" : "Download PDF"}
        </button>
    );
}

