import { NextResponse } from 'next/server';
import { parsePdfWithNemotron } from '@/lib/ai';

/**
 * Improved PDF text extractor — handles text-layer PDFs and various encodings.
 * Extracts from BT...ET blocks, hex strings, and parenthesis-encoded strings.
 */
function extractTextFromPdfBuffer(buffer: Buffer): string {
    const str = buffer.toString('latin1');
    const parts: string[] = [];
    const seen = new Set<string>();

    const addPart = (t: string) => {
        const clean = t
            .replace(/\\n/g, ' ')
            .replace(/\\r/g, ' ')
            .replace(/\\\\/g, '\\')
            .replace(/\\'/g, "'")
            .replace(/\\"/g, '"')
            .trim();
        if (clean.length > 1 && !seen.has(clean)) { 
            seen.add(clean); 
            parts.push(clean); 
        }
    };

    // Primary: extract BT...ET content stream blocks (text rendering operators)
    const btEt = /BT([\s\S]*?)ET/g;
    let m: RegExpExecArray | null;
    while ((m = btEt.exec(str)) !== null) {
        const block = m[1];
        
        // Extract parenthesised strings: (text here)
        const paren = /\(([^)]{1,300})\)/g;
        let pm: RegExpExecArray | null;
        while ((pm = paren.exec(block)) !== null) addPart(pm[1]);
        
        // Extract hex-encoded strings: <1F2A3B42...>
        const hex = /<([0-9A-Fa-f]{4,})>/g;
        let hm: RegExpExecArray | null;
        while ((hm = hex.exec(block)) !== null) {
            const h = hm[1];
            let decoded = '';
            
            // Try UTF-16 BE (common in modern PDFs)
            if (h.length % 4 === 0) {
                for (let i = 0; i + 3 < h.length; i += 4) {
                    const code = parseInt(h.slice(i, i + 4), 16);
                    if (code > 31 && code < 0xFFFE) decoded += String.fromCharCode(code);
                }
            }
            
            // Fall back to 2-byte chunks
            if (!decoded || decoded.length < 2) {
                decoded = '';
                for (let i = 0; i + 1 < h.length; i += 2) {
                    const code = parseInt(h.slice(i, i + 2), 16);
                    if (code > 31 && code < 127) decoded += String.fromCharCode(code);
                }
            }
            
            if (decoded.length > 2) addPart(decoded);
        }
        
        // Extract from TJ (text position adjustment) arrays
        const tj = /\[([^\]]{1,500})\]\s*TJ/g;
        let tj_m: RegExpExecArray | null;
        while ((tj_m = tj.exec(block)) !== null) {
            const inner = tj_m[1];
            const pTJ = /\(([^)]{1,200})\)/g;
            let pm3: RegExpExecArray | null;
            while ((pm3 = pTJ.exec(inner)) !== null) addPart(pm3[1]);
        }
    }

    // Secondary: extract from stream contents directly (for PDFs without BT/ET)
    const streamMatch = /stream\s*([\s\S]{0,50000})\s*endstream/;
    const sm = streamMatch.exec(str);
    if (sm && parts.join(' ').length < 200) {
        const streamContent = sm[1];
        const paren2 = /\(([A-Za-z0-9 ,.\-@:\/+#&'"!?|<>~`_;=()\[\]]{4,})\)/g;
        let pm2: RegExpExecArray | null;
        while ((pm2 = paren2.exec(streamContent)) !== null) addPart(pm2[1]);
    }

    // Fallback: extract plain readable strings if extraction is weak
    if (parts.join(' ').length < 200) {
        const plain = /\(([A-Za-z0-9 ,.\-@:\/+#&'"!?|<>~`_;=\[\]]{4,})\)/g;
        let pm2: RegExpExecArray | null;
        while ((pm2 = plain.exec(str)) !== null) addPart(pm2[1]);
    }

    const final = parts.join(' ').replace(/\s+/g, ' ').trim();
    return final.slice(0, 8000);
}

/**
 * Clean up extracted PDF text:
 * - Collapse spaced-out headings like "P R O F E S S I O N A L" → "PROFESSIONAL"
 * - Remove page separator noise like "-- 1 of 2 --"
 * - Normalize whitespace
 */
function cleanExtractedText(raw: string): string {
    let text = raw;
    // Remove page separators from pdf-parse
    text = text.replace(/--\s*\d+\s*of\s*\d+\s*--/g, '');
    
    // Collapse known spaced-out section headings from react-pdf generated PDFs
    const spacedHeadings: Record<string, string> = {
        'P R O F E S S I O N A L S U M M A R Y': 'PROFESSIONAL SUMMARY',
        'P R O F E S S I O N A L  S U M M A R Y': 'PROFESSIONAL SUMMARY',
        'W O R K E X P E R I E N C E': 'WORK EXPERIENCE',
        'W O R K  E X P E R I E N C E': 'WORK EXPERIENCE',
        'E X P E R I E N C E': 'EXPERIENCE',
        'E D U C A T I O N': 'EDUCATION',
        'E D U C A T  I O N': 'EDUCATION',
        'S K I L L S': 'SKILLS',
        'S K I L L S & L A N G U A G E S': 'SKILLS & LANGUAGES',
        'S K I L L S  &  L A N G U A G E S': 'SKILLS & LANGUAGES',
        'L A N G U A G E S': 'LANGUAGES',
        'P R O J E C T S': 'PROJECTS',
        'C E R T I F I C A T I O N S': 'CERTIFICATIONS',
        'S U M M A R Y': 'SUMMARY',
        'T E C H N I C A L S K I L L S': 'TECHNICAL SKILLS',
        'T E C H N I C A L  S K I L L S': 'TECHNICAL SKILLS',
    };
    for (const [spaced, collapsed] of Object.entries(spacedHeadings)) {
        text = text.replace(new RegExp(spaced.replace(/\s+/g, '\\s+'), 'gi'), collapsed);
    }
    
    // Generic fallback: collapse any remaining single-letter-spaced sequences (4+ chars)
    text = text.replace(/(?<![a-z])([A-Z])\s+([A-Z])\s+([A-Z])\s+([A-Z])(?:\s+([A-Z]))*/g, (match) => {
        return match.replace(/\s+/g, '');
    });
    
    // Normalize whitespace
    text = text.replace(/\s+/g, ' ').trim();
    return text;
}

async function extractTextWithPdfParse(buffer: Buffer): Promise<string> {
    try {
        // Import lib/pdf-parse directly to bypass index.js test-mode bug
        // (index.js checks !module.parent and tries to read test/data/05-versions-space.pdf)
        const pdfParse = require('pdf-parse/lib/pdf-parse');
        const parsed = await pdfParse(buffer);
        const rawText = String(parsed?.text || '');
        const text = cleanExtractedText(rawText);
        console.log(`[PDF-Parse] Extracted ${text.length} chars from buffer`);
        return text.slice(0, 12000);
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.warn(`[PDF-Parse] Failed: ${msg.slice(0, 200)}`);
        return '';
    }
}

function normalizeForMatch(text: string): string {
    const deSpaced = (text || '').replace(/\b(?:[A-Za-z]\s+){2,}[A-Za-z]\b/g, (m) => m.replace(/\s+/g, ''));
    return deSpaced
        .toLowerCase()
        .replace(/[‐‑‒–—]/g, '-')
        .replace(/[’']/g, "'")
        .replace(/[^a-z0-9+#./\-\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function escapeRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function canonicalKeywordVariants(keyword: string): string[] {
    const k = normalizeForMatch(keyword);
    const variants = new Set<string>([k]);

    if (k.includes('restful api')) variants.add('rest api');
    if (k === 'rest') variants.add('restful api');
    if (k.includes('web api')) variants.add(k.replace('web api', 'webapi'));
    if (k.includes('webapi')) variants.add(k.replace('webapi', 'web api'));
    if (k === 'google cloud') variants.add('gcp');
    if (k === 'gcp') variants.add('google cloud');
    if (k === '.net core') variants.add('net core');
    if (k === '.net 8') { variants.add('net 8'); variants.add('.net8'); }
    if (k === '.net') { variants.add('net'); variants.add('.net core'); variants.add('.net 8'); }
    if (k === 'ci/cd') {
        variants.add('ci cd');
        variants.add('continuous integration');
        variants.add('continuous delivery');
    }
    if (k === 'angular 18') { variants.add('angular'); variants.add('angular18'); }
    if (k === 'angular') variants.add('angular 18');
    if (k === 'microsoft azure') variants.add('azure');
    if (k === 'azure') variants.add('microsoft azure');
    if (k === 'entity framework') variants.add('ef');
    if (k === 'nosql') { variants.add('no sql'); variants.add('no-sql'); }
    if (k === 'rdbms') { variants.add('relational database'); variants.add('mysql'); variants.add('postgresql'); }
    if (k === 'tailwindcss') { variants.add('tailwind css'); variants.add('tailwind'); }
    if (k === 'pm2') variants.add('pm 2');
    if (k === 'docker') { variants.add('containerization'); variants.add('containerized'); variants.add('docker compose'); }
    if (k === 'containerization') { variants.add('docker'); variants.add('containerized'); variants.add('containerisation'); }
    if (k === 'nestjs') { variants.add('nest.js'); variants.add('nest js'); }
    if (k === 'typeorm') { variants.add('type orm'); variants.add('type-orm'); }
    if (k === 'kubernetes') { variants.add('k8s'); variants.add('kubernetes orchestration'); }
    if (k === 'event-driven') { variants.add('event driven'); variants.add('event-driven architectures'); variants.add('event driven architecture'); }
    if (k === 'infrastructure as code') { variants.add('iac'); variants.add('terraform'); variants.add('cloudformation'); variants.add('arm templates'); }
    if (k === 'terraform') { variants.add('infrastructure as code'); variants.add('iac'); }
    if (k === 'message queuing') { variants.add('message queue'); variants.add('messaging'); variants.add('rabbitmq'); variants.add('kafka'); }
    if (k === 'agile') { variants.add('scrum'); variants.add('agile methodology'); variants.add('agile methodologies'); }
    if (k === 'cross-functional') { variants.add('cross functional'); variants.add('crossfunctional'); }
    if (k === 'mentoring') { variants.add('mentor'); variants.add('mentoring junior'); variants.add('coaching'); }
    if (k === 'sonarqube') { variants.add('sonar qube'); variants.add('sonar'); variants.add('code quality'); }
    if (k === 'power bi') { variants.add('powerbi'); }
    if (k === 'azure devops') { variants.add('azure pipelines'); variants.add('devops'); }
    if (k === 'ansible') { variants.add('configuration management'); }
    if (k === 'data integration') { variants.add('data integration workflows'); }
    if (k === 'real-time') { variants.add('real time'); variants.add('realtime'); }
    if (k === 'batch processing') { variants.add('batch data integration'); variants.add('batch integration'); }

    return Array.from(variants).filter(Boolean);
}

function containsKeyword(resumeNorm: string, keyword: string): boolean {
    const variants = canonicalKeywordVariants(keyword);
    return variants.some((variant) => {
        if (!variant) return false;
        const pattern = new RegExp(`(^|\\s)${escapeRegExp(variant)}(\\s|$)`, 'i');
        return pattern.test(resumeNorm);
    });
}

function scoreFormattingQuality(resumeText: string): number {
    const text = resumeText || '';
    const lower = text.toLowerCase();

    let score = 35;
    if (text.length > 1200) score += 20;
    else if (text.length > 700) score += 14;
    else if (text.length > 400) score += 8;

    // Detect headings (including spaced-out variants like "E X P E R I E N C E")
    const headings = ['summary', 'experience', 'education', 'skills', 'projects', 'languages', 'professional'];
    const foundHeadings = headings.filter((h) => {
        if (lower.includes(h)) return true;
        // Check for spaced version: "s u m m a r y"
        const spaced = h.split('').join(' ');
        if (lower.includes(spaced)) return true;
        // Check uppercase spaced: "S K I L L S"
        const upperSpaced = h.toUpperCase().split('').join(' ');
        if (text.includes(upperSpaced)) return true;
        return false;
    }).length;
    score += foundHeadings * 6;

    const bulletCount = (text.match(/[•\-]\s/g) || []).length;
    if (bulletCount >= 8) score += 10;
    else if (bulletCount >= 4) score += 6;
    else if (bulletCount >= 1) score += 3;

    const hasContacts = /@|linkedin|portfolio|phone|location/i.test(text);
    if (hasContacts) score += 6;

    return Math.max(0, Math.min(100, score));
}

function recomputeKeywordBuckets(result: any, resumeText: string) {
    const resumeNorm = normalizeForMatch(resumeText);
    const sourceKeywords = Array.from(new Set([
        ...(Array.isArray(result?.keywords_found) ? result.keywords_found : []),
        ...(Array.isArray(result?.keywords_missing) ? result.keywords_missing : []),
    ].map((k: string) => String(k || '').trim()).filter(Boolean)));

    const keywords_found: string[] = [];
    const keywords_missing: string[] = [];

    for (const kw of sourceKeywords) {
        if (containsKeyword(resumeNorm, kw)) keywords_found.push(kw);
        else keywords_missing.push(kw);
    }

    return { keywords_found, keywords_missing };
}

function extractKeywordsFromJd(jdText: string): string[] {
    const raw = jdText || '';
    const candidates = new Set<string>();

    const known = [
        // Cloud & Infrastructure
        'azure', 'microsoft azure', 'aws', 'google cloud', 'gcp', 'docker', 'kubernetes',
        'openshift', 'ibm cloud', 'terraform', 'cloudformation', 'arm templates',
        'ansible', 'puppet', 'chef', 'infrastructure as code',
        // Backend & Languages
        '.net', '.net 8', '.net core', 'c#', 'nestjs', 'node.js', 'java', 'python', 'go', 'rust',
        'entity framework', 'typeorm', 'spring boot',
        // Frontend & JS
        'angular', 'angular 18', 'react', 'vue', 'typescript', 'javascript', 'tailwindcss',
        // Databases
        'sql', 'nosql', 'mysql', 'postgresql', 'mongodb', 'redis', 'rdbms',
        // Messaging & APIs
        'rabbitmq', 'kafka', 'rest', 'restful api', 'web api', 'graphql', 'soap',
        'message queuing', 'event-driven', 'publish-subscribe',
        // DevOps & Tools
        'ci/cd', 'git', 'jenkins', 'pm2', 'nginx', 'sonarqube', 'azure devops',
        // Integration & Architecture
        'microservices', 'containerization', 'integration patterns', 'data integration',
        'real-time', 'batch processing', 'power bi',
        // AI/ML & Specialized
        'genesys cloud', 'microsoft teams', 'avaya', 'session border controllers', 'sbc',
        'conversational ai', 'intent identification', 'llm development', 'nlu', 'nlp',
        'sip', 'tdm', 'blackchair', 'call flows', 'call routing', 'data tables',
        // General
        'agile', 'scrum', 'jira', 'confluence',
        'performance optimization', 'unit testing', 'code refactoring',
        'cross-functional', 'mentoring',
    ];

    const rawNorm = normalizeForMatch(raw);
    for (const term of known) {
        if (containsKeyword(rawNorm, term)) candidates.add(term);
    }

    // Generic English words / JD filler that should NEVER be treated as technical keywords
    const nonSkillWords = new Set([
        'introduction', 'analyze', 'proactive', 'innovative', 'motivated', 'passionate',
        'driven', 'creative', 'dynamic', 'dedicated', 'committed', 'responsible', 'reliable',
        'flexible', 'adaptable', 'enthusiastic', 'collaborative', 'detail-oriented',
        'self-starter', 'team player', 'problem solver', 'strong', 'excellent', 'good',
        'preferred', 'required', 'desired', 'mandatory', 'optional', 'ideal', 'minimum',
        'education', 'preferred education', 'soft skills', 'hard skills', 'nice to have',
        'must have', 'requirements', 'overview', 'description', 'summary', 'purpose',
        'location', 'department', 'reports to', 'position', 'role', 'title', 'apply',
        'submit', 'deadline', 'compensation', 'equal opportunity', 'diversity',
        'what you will do', 'what we offer', 'who you are', 'who we are',
        'key responsibilities', 'main responsibilities', 'your responsibilities',
        'your profile', 'your skills', 'your experience', 'what you bring',
        'ability to', 'capable of', 'familiarity with', 'understanding of',
        'proficiency in', 'proficient in', 'hands-on', 'working knowledge',
    ]);

    const chunks = raw
        .split(/[\n,;•|]/)
        .map((s) => s.trim().replace(/^[\-–•\d.\s]+/, '').replace(/[.:]+$/, ''))
        .filter(Boolean);

    for (const chunk of chunks) {
        if (chunk.length < 2 || chunk.length > 40) continue;
        if (/\d+\s*(years?|months?)/i.test(chunk)) continue;
        // Filter out JD section headers and UI labels
        if (/\b(about the job|responsibilities|qualifications|benefits|salary|why us|we are|our purpose|company offers|tech stack|backend|frontend|cloud|preferably|run ats|ats score|job fit|section breakdown|missing keywords|critical issues|quick wins|experience gaps|skills to add|recommended courses|rewrite tip|introduction|overview|description|requirements|what you|who you|who we|your profile|your skills|your experience|nice to have|must have|preferred education|soft skills|hard skills|key contributor|you will|you'll)\b/i.test(chunk)) continue;
        // Filter out phrases starting with "experience with/in", "knowledge of", etc.
        if (/^(experience\s+(with|in|of)|knowledge\s+(of|in)|familiarity\s+with|understanding\s+of|ability\s+to|capable\s+of|proficien\w+\s+in|strong\s+\w+\s+(of|in|with))\b/i.test(chunk)) continue;
        // Skip single generic words that aren't technical
        if (nonSkillWords.has(chunk.toLowerCase())) continue;

        const words = chunk.split(/\s+/).filter(Boolean);
        if (words.length > 3) continue; // Tighter limit: max 3-word terms

        const looksLikeSkill =
            /[+#./]/.test(chunk) ||
            /\b(ai|ml|nlp|nlu|sql|nosql|cloud|devops|telephony|routing|sbc|sip|tdm|llm|api|framework|protocol|docker|kubernetes|azure|aws|gcp|terraform|ansible|puppet|chef|jenkins|sonarqube|redis|kafka|rabbitmq|graphql|microservices|containerization)\b/i.test(chunk);

        if (looksLikeSkill) candidates.add(chunk);
    }

    return Array.from(candidates)
        .map((k) => k.replace(/\s+/g, ' ').trim())
        .filter((k) => k.length >= 2 && k.length <= 40)
        .filter((k) => !nonSkillWords.has(k.toLowerCase()))
        .slice(0, 40);
}

function extractRoleFromJd(jdText: string): string {
    const lines = (jdText || '').split('\n').map((l) => l.trim()).filter(Boolean);
    const roleLine = lines.find((l) => /\b(engineer|developer|manager|specialist|architect|analyst|lead|consultant)\b/i.test(l));
    if (!roleLine) return '';
    return roleLine.replace(/[:|\-–].*$/, '').trim().slice(0, 80);
}

function computeDeterministicRubric(resumeText: string, jdText: string, keywordsFound: string[], keywordsMissing: string[], formattingQuality: number) {
    const resumeNorm = normalizeForMatch(resumeText);
    const totalKeywords = keywordsFound.length + keywordsMissing.length;
    const keywordRate = totalKeywords > 0 ? keywordsFound.length / totalKeywords : 0;
    const keywordPoints = Math.round(keywordRate * 40);

    const role = extractRoleFromJd(jdText);
    const roleNorm = normalizeForMatch(role);
    let titlePoints = 0;
    if (roleNorm && containsKeyword(resumeNorm, roleNorm)) titlePoints = 15;
    else if (roleNorm && roleNorm.split(' ').some((w) => w.length > 3 && containsKeyword(resumeNorm, w))) titlePoints = 8;

    const quantCount = (resumeText.match(/(?:[$€£¥]?\s*)?\b\d[\d,.']*\+?\s*(%|k|m|x|years?|months?|users?|clients?|projects?|tickets?|ms|seconds?|hours?|daily|monthly|per\s+\w+)\b/gi) || []).length
        + (resumeText.match(/\b\d[\d,.']*\+?\s*(active\s+users|defects|updates|pipelines)\b/gi) || []).length
        + (resumeText.match(/[$€£¥]\s*\d[\d,.']*\+?/g) || []).length
        + (resumeText.match(/\bredu\w+\s+\w+\s+by\s+\d+/gi) || []).length
        + (resumeText.match(/\b\d+\s*%/g) || []).length;
    // Deduplicate by counting unique matches
    const allMetricMatches = new Set([
        ...(resumeText.match(/(?:[$€£¥]?\s*)?\b\d[\d,.']*\+?\s*(%|k|m|x|years?|months?|users?|daily|monthly)\b/gi) || []),
        ...(resumeText.match(/\b\d[\d,.']*\+?\s*(active\s+users|defects|updates|pipelines)\b/gi) || []),
        ...(resumeText.match(/[$€£¥]\s*\d[\d,.']*\+?/g) || []),
        ...(resumeText.match(/\bredu\w+\s+\w+\s+by\s+\d+/gi) || []),
        ...(resumeText.match(/\b\d+\s*%/g) || []),
    ]);
    const uniqueQuantCount = allMetricMatches.size;
    const quantifiedPoints = uniqueQuantCount >= 5 ? 15 : uniqueQuantCount >= 3 ? 10 : uniqueQuantCount >= 1 ? 5 : 0;

    const hasEdu = /\b(bachelor|master|phd|degree|university|college|certif|education)\b/i.test(resumeText);
    const jdNeedsEdu = /\b(bachelor|master|phd|degree|certif)\b/i.test(jdText);
    const educationPoints = hasEdu ? (jdNeedsEdu ? 10 : 8) : (jdNeedsEdu ? 0 : 5);

    const reqYears = /\b(\d{1,2})\+?\s*years?\b/i.exec(jdText)?.[1];
    const cvYears = /\b(\d{1,2})\+?\s*years?\b/i.exec(resumeText)?.[1];
    let experiencePoints = 7;
    if (reqYears && cvYears) {
        const need = Number(reqYears);
        const have = Number(cvYears);
        if (have >= need) experiencePoints = 10;
        else if (have >= need - 1) experiencePoints = 7;
        else if (have >= need - 2) experiencePoints = 3;
        else experiencePoints = 0;
    } else if (reqYears && !cvYears) {
        experiencePoints = 3;
    }

    const skillsCompleteness = Math.round(keywordRate * 100);
    const skillsPoints = skillsCompleteness >= 80 ? 10 : skillsCompleteness >= 50 ? 6 : 2;
    const formattingPoints = Math.round((formattingQuality / 100) * 10);

    const total = Math.max(0, Math.min(100, keywordPoints + titlePoints + quantifiedPoints + educationPoints + experiencePoints + skillsPoints));
    const explanation =
        `Score breakdown per rubric: Keyword match: ${keywordPoints}/40 (found ${keywordsFound.length} of ${totalKeywords} JD keywords). ` +
        `Title alignment: ${titlePoints}/15${role ? ` (target role: ${role})` : ''}. ` +
        `Quantified achievements: ${quantifiedPoints}/15 (${uniqueQuantCount} metric signals found). ` +
        `Education/cert: ${educationPoints}/10. Experience level: ${experiencePoints}/10. ` +
        `Skills completeness: ${skillsPoints}/10 (${skillsCompleteness}%). Formatting quality: ${formattingQuality}% (${formattingPoints}/10). ` +
        `Total: ${total}/100.`;

    return {
        total,
        explanation,
        keywordRatePct: skillsCompleteness,
    };
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
                console.log(`[ATS] File upload: ${file.name} (${buffer.length} bytes)`);

                // TRY PDF-PARSE FIRST (better for app-generated PDFs from react-pdf/renderer)
                let bestExtracted = '';
                try {
                    bestExtracted = await extractTextWithPdfParse(buffer);
                    console.log(`[ATS] pdf-parse result: ${bestExtracted.trim().length} chars (first 80: "${bestExtracted.trim().slice(0, 80)}...")`);
                } catch (e) {
                    console.warn(`[ATS] pdf-parse failed:`, e instanceof Error ? e.message.slice(0, 80) : String(e).slice(0, 80));
                }

                // FALLBACK: Regex extraction for scanned/image PDFs
                if (bestExtracted.trim().length < 300) {
                    const regexExtracted = extractTextFromPdfBuffer(buffer);
                    console.log(`[ATS] regex fallback: ${regexExtracted.trim().length} chars`);
                    if (regexExtracted && regexExtracted.trim().length > bestExtracted.trim().length) {
                        bestExtracted = regexExtracted.trim();
                        console.log(`[ATS] regex provided better extraction`);
                    }
                }

                const weakExtraction = bestExtracted.trim().length < 350 || !/(summary|experience|skills|education|projects)/i.test(bestExtracted);
                const isImageUpload = (file.type || '').startsWith('image/');
                if (weakExtraction && isImageUpload) {
                    try {
                        const nemotronText = await parsePdfWithNemotron(buffer, file.type || 'image/png');
                        if (nemotronText && nemotronText.trim().length > bestExtracted.trim().length) {
                            bestExtracted = nemotronText.trim();
                        }
                    } catch (e) {
                        const msg = e instanceof Error ? e.message : String(e);
                        console.warn('ATS check: nemotron fallback skipped/failed:', msg.slice(0, 180));
                    }
                }

                // Use best extracted text if meaningful, else fallback to pasted text
                resumeText = bestExtracted.trim().length > 20 ? bestExtracted : cvText;
                if (bestExtracted.trim().length <= 20 && !cvText.trim()) {
                    resumeText = bestExtracted.trim().length > 0 ? bestExtracted : '';
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

═══════════════════════════════════════════════════
SCORING RUBRIC — 100-point scale (use this EXACT rubric every time)
═══════════════════════════════════════════════════
- Keyword match rate (40 pts): (# of JD keywords found in CV ÷ total JD keywords extracted) × 40
- Title alignment (15 pts): exact job title or close variant in CV summary/header = 15, partial = 8, none = 0
- Quantified achievements (15 pts): ≥5 metrics in CV = 15, 3-4 = 10, 1-2 = 5, none = 0
- Education/cert match (10 pts): meets JD requirement = 10, partial = 5, none = 0
- Experience level match (10 pts): meets required years = 10, within 1 yr = 7, gap >2 yrs = 3, major gap = 0
- Skills section completeness (10 pts): ≥80% of JD-listed skills present = 10, 50-79% = 6, <50% = 2

Apply this rubric strictly. Show your per-category math in ats_score_explanation.

Analyze the provided CV against the job description and return ONLY a raw JSON object (no markdown, no code blocks, no text before or after) with this exact schema:

{
  "ats_score": 72,
  "ats_score_explanation": "Score breakdown per rubric: Keyword match: X/40 (found N of M JD keywords). Title alignment: X/15. Quantified achievements: X/15. Education/cert: X/10. Experience level: X/10. Skills completeness: X/10. Total: X/100. Main reasons score isn't higher: [specific gaps].",
  "job_fit_level": "high",
  "job_fit_explanation": "Honest assessment of whether the candidate's actual background (not just keywords) fits this role. Mention years of experience fit, seniority match, industry alignment. Be direct.",
  "keywords_found": ["exact keyword from JD that appears in CV"],
  "keywords_missing": ["exact keyword from JD that is absent from CV"],
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
- ats_score: calculated strictly from the 100-point rubric above. Show the math.
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
                model: 'moonshotai/kimi-k2-instruct',
                messages: [
                    { role: 'system', content: systemPrompt },
                    {
                        role: 'user',
                        content: `CANDIDATE CV/RESUME:\n${resumeText.slice(0, 6000)}\n\n${'═'.repeat(60)}\n\nJOB DESCRIPTION:\n${jdText.slice(0, 3000)}\n\nApply the 100-point rubric carefully. Return ONLY the raw JSON object.`
                    }
                ],
                temperature: 0.3,
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

        // Deterministic post-processing to avoid AI keyword hallucination mismatches.
        const aiBuckets = recomputeKeywordBuckets(result, resumeText);
        const jdKeywords = extractKeywordsFromJd(jdText);
        const resumeNorm = normalizeForMatch(resumeText);

        const deterministicFound: string[] = [];
        const deterministicMissing: string[] = [];
        for (const kw of jdKeywords) {
            if (containsKeyword(resumeNorm, kw)) deterministicFound.push(kw);
            else deterministicMissing.push(kw);
        }

        const keywords_found = deterministicFound.length > 0 || deterministicMissing.length > 0
            ? deterministicFound
            : aiBuckets.keywords_found;
        const keywords_missing = deterministicFound.length > 0 || deterministicMissing.length > 0
            ? deterministicMissing
            : aiBuckets.keywords_missing;

        result.keywords_found = keywords_found;
        result.keywords_missing = keywords_missing;

        // Make skills match reflect deterministic keyword coverage.
        const totalKeywords = keywords_found.length + keywords_missing.length;
        const skillsMatchPct = totalKeywords > 0 ? Math.round((keywords_found.length / totalKeywords) * 100) : 0;
        result.section_scores = result.section_scores || {};
        result.section_scores.skills_match = skillsMatchPct;

        // Compute formatting quality from extracted text quality/structure, not AI guess.
        result.section_scores.formatting_quality = scoreFormattingQuality(resumeText);

        // Clamp ATS score at least to deterministic keyword foundation + existing non-keyword rubric parts.
        const rubric = computeDeterministicRubric(
            resumeText,
            jdText,
            keywords_found,
            keywords_missing,
            result.section_scores.formatting_quality
        );
        result.ats_score = rubric.total;
        result.ats_score_explanation = rubric.explanation;
        result.section_scores.experience_relevance = Math.max(0, Math.min(100, Math.round((keywords_found.length / Math.max(1, totalKeywords)) * 70 + (result.section_scores.formatting_quality * 0.3))));
        result.section_scores.education_fit = /\b(bachelor|master|phd|degree|university|college|certif|education)\b/i.test(resumeText) ? 85 : 35;

        result.debug_meta = {
            parser_text_length: resumeText.length,
            keyword_pool_size: totalKeywords,
            deterministic_keyword_match_pct: rubric.keywordRatePct,
        };

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('ATS check error:', error);
        return NextResponse.json({ error: error.message || 'ATS check failed' }, { status: 500 });
    }
}
