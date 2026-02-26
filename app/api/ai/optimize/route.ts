import { NextResponse } from 'next/server';
import { optimizeCV } from '@/lib/ai';
import { getCache, setCache } from '@/lib/cache';
import crypto from 'crypto';

/** Extract text from a PDF buffer — handles BT/ET streams, hex (UTF-16BE), TJ arrays */
function extractTextFromPdfBuffer(buffer: Buffer): string {
    const str = buffer.toString('latin1');
    const parts: string[] = [];
    const seen = new Set<string>();
    const addPart = (t: string) => {
        const clean = t.replace(/\\n/g, ' ').replace(/\\r/g, ' ').replace(/\\\\/g, '\\').replace(/\\'/g, "'").trim();
        if (clean.length > 1 && !seen.has(clean)) { seen.add(clean); parts.push(clean); }
    };
    const btEt = /BT([\s\S]*?)ET/g;
    let m: RegExpExecArray | null;
    while ((m = btEt.exec(str)) !== null) {
        const block = m[1];
        const paren = /\(([^)]{1,300})\)/g;
        let pm: RegExpExecArray | null;
        while ((pm = paren.exec(block)) !== null) addPart(pm[1]);
        const hex = /<([0-9A-Fa-f]{4,})>/g;
        let hm: RegExpExecArray | null;
        while ((hm = hex.exec(block)) !== null) {
            const h = hm[1];
            let decoded = '';
            if (h.length % 4 === 0) {
                for (let i = 0; i + 3 < h.length; i += 4) {
                    const code = parseInt(h.slice(i, i + 4), 16);
                    if (code > 31 && code < 0xFFFE) decoded += String.fromCharCode(code);
                }
            }
            if (!decoded) {
                for (let i = 0; i + 1 < h.length; i += 2) {
                    const code = parseInt(h.slice(i, i + 2), 16);
                    if (code > 31 && code < 127) decoded += String.fromCharCode(code);
                }
            }
            if (decoded.length > 2) addPart(decoded);
        }
        const tj = /\[([^\]]{1,500})\]\s*TJ/g;
        let tj_m: RegExpExecArray | null;
        while ((tj_m = tj.exec(block)) !== null) {
            const inner = tj_m[1];
            const pTJ = /\(([^)]{1,200})\)/g;
            let pm3: RegExpExecArray | null;
            while ((pm3 = pTJ.exec(inner)) !== null) addPart(pm3[1]);
        }
    }
    if (parts.join(' ').length < 200) {
        const plain = /\(([A-Za-z0-9 ,.\-@:\/+#&'"!?|<>~`_;=\[\]]{4,})\)/g;
        let pm2: RegExpExecArray | null;
        while ((pm2 = plain.exec(str)) !== null) addPart(pm2[1]);
    }
    return parts.join(' ').replace(/\s+/g, ' ').trim().slice(0, 8000);
}

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
        let resumeText = '';
        let jdText = '';
        let language = 'en';
        let tone = 'professional';

        const contentType = req.headers.get('content-type') || '';

        if (contentType.includes('multipart/form-data')) {
            // PDF upload path
            const formData = await req.formData();
            const file = formData.get('file') as File | null;
            jdText = (formData.get('jdText') as string) || '';
            language = (formData.get('language') as string) || 'en';
            tone = (formData.get('tone') as string) || 'professional';

            if (file && file.size > 0) {
                const buffer = Buffer.from(await file.arrayBuffer());
                resumeText = extractTextFromPdfBuffer(buffer);
            }
            if (!resumeText.trim()) {
                return NextResponse.json({ error: 'Could not extract text from the uploaded PDF. Try a different file or paste your CV text.' }, { status: 400 });
            }
        } else {
            // JSON path (existing saved CV)
            const body = await req.json();
            resumeText = resumeToText(body.resumeJson);
            jdText = body.jdText || '';
            language = body.language || 'en';
            tone = body.tone || 'professional';
        }

        // Cap JD at 4000 chars
        const jdTruncated = jdText.slice(0, 4000);

        if (!resumeText || !jdTruncated) {
            return NextResponse.json({ error: 'Resume or job description is missing.' }, { status: 400 });
        }

        const hash = crypto.createHash('sha256')
            .update(resumeText + jdTruncated + language + tone)
            .digest('hex');

        const cached = getCache(hash);
        if (cached) return NextResponse.json(cached);

        const result = await optimizeCV(resumeText, jdTruncated, language, tone);

        setCache(hash, result);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error('AI Generation error:', error);
        return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 });
    }
}
