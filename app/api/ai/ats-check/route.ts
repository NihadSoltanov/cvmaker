import { NextResponse } from 'next/server';

/**
 * Simple PDF text extractor — works on text-layer PDFs (covers 90%+ of modern CVs).
 * Reads BT...ET blocks and extracts parenthesis-encoded strings.
 */
function extractTextFromPdfBuffer(buffer: Buffer): string {
    const str = buffer.toString('latin1');
    const parts: string[] = [];
    const seen = new Set<string>();

    const addPart = (t: string) => {
        const clean = t.replace(/\\n/g, ' ').replace(/\\r/g, ' ').replace(/\\\\/g, '\\').replace(/\\'/g, "'").trim();
        if (clean.length > 1 && !seen.has(clean)) { seen.add(clean); parts.push(clean); }
    };

    // Primary: extract BT...ET content stream blocks
    const btEt = /BT([\s\S]*?)ET/g;
    let m: RegExpExecArray | null;
    while ((m = btEt.exec(str)) !== null) {
        const block = m[1];
        // Parenthesised strings
        const paren = /\(([^)]{1,300})\)/g;
        let pm: RegExpExecArray | null;
        while ((pm = paren.exec(block)) !== null) addPart(pm[1]);
        // Hex strings (UTF-16 encoded text)
        const hex = /<([0-9A-Fa-f]{4,})>/g;
        let hm: RegExpExecArray | null;
        while ((hm = hex.exec(block)) !== null) {
            const h = hm[1];
            let decoded = '';
            // Try UTF-16 BE first (common in Word-generated PDFs)
            if (h.length % 4 === 0) {
                for (let i = 0; i + 3 < h.length; i += 4) {
                    const code = parseInt(h.slice(i, i + 4), 16);
                    if (code > 31 && code < 0xFFFE) decoded += String.fromCharCode(code);
                }
            }
            // Fall back to single-byte
            if (!decoded) {
                for (let i = 0; i + 1 < h.length; i += 2) {
                    const code = parseInt(h.slice(i, i + 2), 16);
                    if (code > 31 && code < 127) decoded += String.fromCharCode(code);
                }
            }
            if (decoded.length > 2) addPart(decoded);
        }
        // TJ array strings
        const tj = /\[([^\]]{1,500})\]\s*TJ/g;
        let tj_m: RegExpExecArray | null;
        while ((tj_m = tj.exec(block)) !== null) {
            const inner = tj_m[1];
            const pTJ = /\(([^)]{1,200})\)/g;
            let pm3: RegExpExecArray | null;
            while ((pm3 = pTJ.exec(inner)) !== null) addPart(pm3[1]);
        }
    }

    // Fallback: extract plain readable strings from binary if BT/ET got little
    if (parts.join(' ').length < 200) {
        const plain = /\(([A-Za-z0-9 ,.\-@:\/+#&'"!?|<>~`_;=\[\]]{4,})\)/g;
        let pm2: RegExpExecArray | null;
        while ((pm2 = plain.exec(str)) !== null) addPart(pm2[1]);
    }

    return parts.join(' ').replace(/\s+/g, ' ').trim().slice(0, 8000);
}

export async function POST(req: Request) {
    try {
        // Support both JSON (paste) and FormData (file upload)
        const contentType = req.headers.get('content-type') || '';
        let resumeText = '';
        let jdText = '';

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            const file = formData.get('file') as File | null;
            const cvText = (formData.get('cvText') as string) || '';
            jdText = (formData.get('jdText') as string) || '';

            if (file && file.size > 0) {
                const buffer = Buffer.from(await file.arrayBuffer());
                const extracted = extractTextFromPdfBuffer(buffer);
                // Use extracted text if we got anything meaningful, otherwise fall back to pasted text
                resumeText = extracted.trim().length > 20 ? extracted : cvText;
                // If extraction was poor, prepend a note for the AI so it knows
                if (extracted.trim().length > 0 && extracted.trim().length <= 20 && cvText.trim()) {
                    resumeText = cvText;
                } else if (extracted.trim().length <= 20 && !cvText.trim()) {
                    // PDF might be image-based or have non-standard encoding; send whatever we extracted
                    resumeText = extracted.trim().length > 0 ? extracted : '';
                }
            } else {
                resumeText = cvText;
            }
        } else {
            const body = await req.json();
            resumeText = body.cvText || '';
            jdText = body.jdText || '';
        }

        if (!resumeText.trim() || !jdText.trim()) {
            const missing = [];
            if (!resumeText.trim()) missing.push('CV text (the uploaded PDF appears to have no extractable text — try copy-pasting your CV instead)');
            if (!jdText.trim()) missing.push('job description');
            return NextResponse.json({ error: `Please provide: ${missing.join(' and ')}.` }, { status: 400 });
        }

        const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
        if (!NVIDIA_API_KEY) return NextResponse.json({ error: 'NVIDIA_API_KEY not configured.' }, { status: 500 });

        const systemPrompt = `You are an expert ATS (Applicant Tracking System) analyzer with deep knowledge of HR systems including Taleo, Workday, Greenhouse, Lever, and iCIMS.

Analyze the provided CV against the job description and return ONLY a raw JSON object (no markdown, no code blocks, no text before or after) with this exact schema:

{
  "ats_score": 72,
  "ats_score_explanation": "2-3 sentence honest explanation of this score — what matched, what didn't, and what would increase it most.",
  "job_fit_level": "high",
  "job_fit_explanation": "Honest assessment of whether the candidate's actual background (not just keywords) fits this role. Mention years of experience fit, seniority match, industry alignment. Be direct.",
  "keywords_found": ["keyword1 from JD that appears in CV"],
  "keywords_missing": ["keyword2 from JD that is missing or implied but not stated"],
  "section_scores": {
    "skills_match": 65,
    "experience_relevance": 40,
    "education_fit": 80,
    "formatting_quality": 90
  },
  "critical_issues": ["Specific issue that would cause ATS rejection — e.g. 'Skills section uses image/table format which ATS cannot parse'"],
  "quick_wins": ["Specific, immediate change — e.g. 'Add Python to Skills section — it appears 7 times in the JD'"],
  "missing_requirements": ["JD requires 5+ years in Kubernetes, CV shows only Docker experience — specific gap"],
  "suggestions": {
    "skills_to_add": ["specific real skill from JD that candidate should add if they have it"],
    "courses": ["Course Title — Platform (e.g. 'AWS Solutions Architect — A Cloud Guru')"],
    "rewrite_tip": "One specific suggestion to rewrite a section for better ATS performance"
  },
  "overall_recommendation": "apply_now",
  "recommendation_reason": "Why this recommendation — specific to this candidate and this role"
}

Rules:
- ats_score: 0-100, honest keyword + experience match. Do NOT inflate.
- job_fit_level: "high" (strong match), "medium" (partial match), "low" (significant gaps)
- job_fit_level is about REAL experience fit, not just keyword presence
- overall_recommendation: "apply_now" | "apply_with_tweaks" | "build_skills_first" | "not_recommended"
- Be specific — name actual tools, frameworks, years of experience from the JD
- section_scores: percentages 0-100
- Raw JSON ONLY — no text outside the JSON object`;

        const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${NVIDIA_API_KEY}` },
            body: JSON.stringify({
                model: 'meta/llama-3.3-70b-instruct',
                messages: [
                    { role: 'system', content: systemPrompt },
                    {
                        role: 'user',
                        content: `CANDIDATE CV/RESUME:\n${resumeText.slice(0, 6000)}\n\n---\n\nJOB DESCRIPTION:\n${jdText.slice(0, 3000)}\n\nReturn the JSON object only. No explanation, no markdown \u2014 just the raw JSON.`
                    }
                ],
                temperature: 0.4,
                top_p: 0.9,
                max_tokens: 4096,
                stream: false,
            }),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            return NextResponse.json({ error: err?.error?.message || `API Error ${response.status}` }, { status: 500 });
        }

        const data = await response.json();
        let content: string = data.choices?.[0]?.message?.content?.trim() || '';

        // Strip <think>...</think> reasoning blocks emitted by thinking models (kimi-k2, deepseek-r1, etc.)
        content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        // Strip markdown code fences
        content = content.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/g, '').trim();
        // Extract JSON object boundaries
        const jsonStart = content.indexOf('{');
        const jsonEnd = content.lastIndexOf('}');
        if (jsonStart === -1 || jsonEnd === -1) {
            console.error('ATS: No JSON object found. Raw content (first 500):', content.slice(0, 500));
            return NextResponse.json({ error: 'AI returned an unexpected response. Please try again.' }, { status: 500 });
        }
        content = content.slice(jsonStart, jsonEnd + 1);

        let result;
        try {
            result = JSON.parse(content);
        } catch {
            console.error('ATS: JSON parse failed. Content (first 500):', content.slice(0, 500));
            return NextResponse.json({ error: 'Failed to parse AI response. Please try again.' }, { status: 500 });
        }
        return NextResponse.json(result);
    } catch (error: any) {
        console.error('ATS check error:', error);
        return NextResponse.json({ error: error.message || 'ATS check failed' }, { status: 500 });
    }
}
