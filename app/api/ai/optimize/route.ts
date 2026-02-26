import { NextResponse } from 'next/server';
import { optimizeCV } from '@/lib/ai';
import { getCache, setCache } from '@/lib/cache';
import crypto from 'crypto';

/** Strip large fields and convert resume JSON to compact readable text for the AI */
function resumeToText(json: any): string {
    if (!json) return "No resume data provided.";

    // Deep clone and remove base64 photo (massive string, not useful for AI)
    const r = { ...json };
    delete r.photo;
    delete r.photoUrl;

    const lines: string[] = [];

    // Basic info
    const bi = r.basicInfo || {};
    lines.push(`NAME: ${r.name || bi.fullName || "Unknown"}`);
    if (bi.email) lines.push(`EMAIL: ${bi.email}`);
    if (bi.phone) lines.push(`PHONE: ${bi.phone}`);
    if (bi.location) lines.push(`LOCATION: ${bi.location}`);
    if (bi.linkedin) lines.push(`LINKEDIN: ${bi.linkedin}`);
    if (bi.portfolio) lines.push(`PORTFOLIO: ${bi.portfolio}`);

    // Summary
    if (r.summary) lines.push(`\nSUMMARY:\n${r.summary}`);

    // Experience
    if (Array.isArray(r.experience) && r.experience.length) {
        lines.push("\nWORK EXPERIENCE:");
        for (const e of r.experience) {
            lines.push(`  ${e.role || ""} @ ${e.company || ""} (${e.startDate || ""}–${e.endDate || "Present"})`);
            if (e.description) lines.push(`    ${e.description.slice(0, 600)}`);
        }
    }

    // Education
    if (Array.isArray(r.education) && r.education.length) {
        lines.push("\nEDUCATION:");
        for (const e of r.education) {
            lines.push(`  ${e.degree || ""} — ${e.institution || ""} (${e.startDate || ""}–${e.endDate || ""})`);
        }
    }

    // Projects
    if (Array.isArray(r.projects) && r.projects.length) {
        lines.push("\nPROJECTS:");
        for (const p of r.projects) {
            lines.push(`  ${p.title || ""}: ${(p.description || "").slice(0, 300)}`);
        }
    }

    // Skills & Languages
    const skills = Array.isArray(r.skills) ? r.skills : (r.skills || "").toString().split(",").map((s: string) => s.trim()).filter(Boolean);
    if (skills.length) lines.push(`\nSKILLS: ${skills.join(", ")}`);

    const langs = Array.isArray(r.languages) ? r.languages : (r.languages || "").toString().split(",").map((s: string) => s.trim()).filter(Boolean);
    if (langs.length) lines.push(`LANGUAGES: ${langs.join(", ")}`);

    if (Array.isArray(r.certifications) && r.certifications.length) {
        lines.push(`\nCERTIFICATIONS: ${r.certifications.map((c: any) => c.name).join(", ")}`);
    }

    const text = lines.join("\n");
    // Hard cap: 8000 chars max (~2000 tokens) for resume
    return text.slice(0, 8000);
}

export async function POST(req: Request) {
    try {
        const { resumeJson, jdText, language, tone } = await req.json();

        // Convert resume JSON to clean text (removes base64 photo etc.)
        const resumeText = resumeToText(resumeJson);

        // Cap JD at 4000 chars (~1000 tokens) — anything longer is boilerplate
        const jdTruncated = (jdText || "").slice(0, 4000);

        if (!resumeText || !jdTruncated) {
            return NextResponse.json({ error: "Resume or job description is missing." }, { status: 400 });
        }

        // Hash for caching (use truncated versions)
        const hash = crypto.createHash('sha256')
            .update(resumeText + jdTruncated + (language || "en") + (tone || "professional"))
            .digest('hex');

        const cached = getCache(hash);
        if (cached) return NextResponse.json(cached);

        const result = await optimizeCV(resumeText, jdTruncated, language || "en", tone || "professional");

        setCache(hash, result);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error("AI Generation error:", error);
        return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 });
    }
}
