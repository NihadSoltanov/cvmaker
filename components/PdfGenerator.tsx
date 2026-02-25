"use client";

import React from "react";
import {
    Document, Page, Text, View, StyleSheet, Font, PDFDownloadLink,
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

// ──────────────────────────────────────────────
// CLASSIC ATS PDF (B&W, single column, high ATS)
// ──────────────────────────────────────────────
const classicStyles = StyleSheet.create({
    page: { fontFamily: "Times-Roman", fontSize: 10.5, color: "#111", padding: "48 56", lineHeight: 1.5, backgroundColor: "#fff" },
    name: { fontSize: 22, fontFamily: "Times-Bold", textAlign: "center", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 },
    contactRow: { textAlign: "center", fontSize: 9.5, color: "#333", marginBottom: 2 },
    divider: { borderBottom: "1.5pt solid #000", marginTop: 6, marginBottom: 10 },
    sectionTitle: { fontFamily: "Times-Bold", fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, borderBottom: "0.75pt solid #000", paddingBottom: 2, marginBottom: 6, marginTop: 12 },
    expRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 1 },
    expRole: { fontFamily: "Times-Bold", fontSize: 10.5 },
    expDates: { fontSize: 9.5, color: "#444" },
    expCompany: { fontFamily: "Times-Italic", fontSize: 10, marginBottom: 3, color: "#333" },
    bullet: { fontSize: 10, marginBottom: 1.5, paddingLeft: 8 },
    skillsRow: { fontSize: 10, marginBottom: 2 },
});

function ClassicPDF({ d }: { d: CvData }) {
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
                <Text style={classicStyles.name}>{d.basicInfo?.fullName || "Your Name"}</Text>
                {contacts.length > 0 && <Text style={classicStyles.contactRow}>{contacts.join("  •  ")}</Text>}
                {links.length > 0 && <Text style={classicStyles.contactRow}>{links.join("  •  ")}</Text>}
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

function ModernPDF({ d }: { d: CvData }) {
    return (
        <Document title={`CV – ${d.basicInfo?.fullName || "Resume"}`}>
            <Page size="A4" style={modernStyles.page}>
                {/* Sidebar */}
                <View style={modernStyles.sidebar}>
                    <Text style={modernStyles.sidebarName}>{d.basicInfo?.fullName || "Your Name"}</Text>

                    <Text style={modernStyles.sidebarSectionTitle}>Contact</Text>
                    {d.basicInfo?.phone && <Text style={modernStyles.sidebarText}>📞 {d.basicInfo.phone}</Text>}
                    {d.basicInfo?.email && <Text style={modernStyles.sidebarText}>✉ {d.basicInfo.email}</Text>}
                    {d.basicInfo?.location && <Text style={modernStyles.sidebarText}>📍 {d.basicInfo.location}</Text>}
                    {d.basicInfo?.linkedin && <Text style={{ ...modernStyles.sidebarText, fontSize: 8 }}>{d.basicInfo.linkedin}</Text>}
                    {d.basicInfo?.portfolio && <Text style={{ ...modernStyles.sidebarText, fontSize: 8 }}>{d.basicInfo.portfolio}</Text>}

                    {d.skills && d.skills.length > 0 && (
                        <View>
                            <Text style={modernStyles.sidebarSectionTitle}>Skills</Text>
                            {d.skills.slice(0, 10).map((sk, i) => (
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

// Dispatcher
export function getPdfDocument(templateId: string, data: CvData): React.ReactElement {
    switch (templateId) {
        case "modern": return <ModernPDF d={data} />;
        default: return <ClassicPDF d={data} />;
    }
}

// Download Button Component
export function PdfDownloadButton({ data, templateId, fileName }: {
    data: CvData;
    templateId: string;
    fileName?: string;
}) {
    const name = fileName || `CV_${data.basicInfo?.fullName?.replace(/\s/g, "_") || "resume"}.pdf`;
    const doc = getPdfDocument(templateId, data);

    return (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <PDFDownloadLink document={doc as any} fileName={name}>
            {({ loading, error }: { loading: boolean; error: Error | null }) => (
                <span className={`flex items-center gap-2 bg-green-600 text-white rounded-xl px-4 py-2.5 font-bold hover:bg-green-700 transition text-sm cursor-pointer ${loading ? "opacity-60" : ""}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 8l-3-3m3 3l3-3M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                    </svg>
                    {loading ? "Building PDF..." : error ? "Error – Retry" : "Download PDF"}
                </span>
            )}
        </PDFDownloadLink>
    );
}
