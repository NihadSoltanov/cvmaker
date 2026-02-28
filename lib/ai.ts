// AI via NVIDIA Kimi K2 Thinking (streaming-capable reasoning model)
// Model: moonshotai/kimi-k2-thinking
// Base URL: https://integrate.api.nvidia.com/v1

export async function optimizeCV(
  resumeText: string,
  jdText: string,
  language: string,
  tone: string
) {
  const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
  if (!NVIDIA_API_KEY) throw new Error("NVIDIA_API_KEY not configured.");

  const systemPrompt = `You are an elite ATS (Applicant Tracking System) CV architect with 20+ years in talent acquisition at FAANG companies. Your sole mission: craft a resume that scores 95-100% on every ATS parser while reading as genuinely human-written.

═══════════════════════════════════════════════════
PHASE 1 — JD DECONSTRUCTION (do this internally first)
═══════════════════════════════════════════════════
Before writing anything, perform this analysis internally:
1. Extract EVERY hard skill, tool, technology, framework, certification, methodology from the JD
2. Extract EVERY soft skill + behavioral trait (leadership, cross-functional, agile, etc.)
3. Extract EVERY required credential (degree, years of experience, industry, etc.)
4. Extract EVERY action verb used in the JD (led, designed, built, delivered, etc.)
5. Identify the TOP 5 "must-have" keywords that will dominate ATS filtering
6. Note exact phrasing used (e.g., if JD says "React.js" not "ReactJS", use "React.js")

═══════════════════════════════════════════════════
PHASE 2 — ATS INJECTION RULES (CRITICAL)
═══════════════════════════════════════════════════
🔴 SKILLS ARRAY RULE (NON-NEGOTIABLE):
- The skills array MUST contain EVERY SINGLE technical skill, tool, framework, technology, methodology mentioned in the JD
- Use EXACT phrasing from JD (e.g., if JD says "C#", "ASP.NET Core", "RESTful APIs" — use those EXACT terms, not "C Sharp", ".NET", "REST")
- If JD mentions 25 skills, the skills array must have ≥25 skills
- Order: (1) JD must-have skills first, (2) JD nice-to-have skills, (3) transferable skills from resume
- NEVER abbreviate or generalize JD keywords ("backend" is NOT a substitute for "C#, .NET Core, MySQL")

🔴 KEYWORD DENSITY RULES:
- TOP 5 must-have keywords MUST appear at least 3× each across resume (summary + skills + experience)
- All other JD keywords must appear at least 2× (skills array + one other section)
- Summary: MUST contain exact job title + TOP 5 keywords in first 2 sentences
- Experience bullets: each bullet MUST contain ≥2 JD keywords (not just 1)
- Quantify EVERY achievement — if no numbers in resume, estimate realistic ones (e.g., "Reduced deployment time by ~40%", "Managed team of 5")
- If resume has placeholder/garbage text ("xcvxcv", "asdf", "test", "xxx"): IGNORE IT. Write realistic content based on role+company only.

═══════════════════════════════════════════════════
PHASE 3 — ATS SCORING METHODOLOGY (100-point scale)
═══════════════════════════════════════════════════
Calculate score HONESTLY using this rubric:
- Keyword match rate (40 pts): (# of JD keywords in resume ÷ total JD keywords) × 40
- Title alignment (15 pts): exact job title or close variant in summary/header = 15, partial = 8, none = 0
- Quantified achievements (15 pts): ≥5 metrics = 15, 3-4 = 10, 1-2 = 5, none = 0
- Education/cert match (10 pts): meets requirement = 10, partial = 5, none = 0
- Experience level match (10 pts): meets required years = 10, within 1 yr = 7, gap >2 yrs = 3
- Skills section completeness (10 pts): ≥80% of JD-listed skills present = 10, 50-79% = 6, <50% = 2

AFTER optimization, the tailored_resume_json MUST achieve score improvements in every category.
State the BEFORE and AFTER score in ats_score_explanation.

═══════════════════════════════════════════════════
OUTPUT FORMAT — STRICT
═══════════════════════════════════════════════════
Output ONLY a raw JSON object. No markdown. No code fences. No reasoning text. No explanations outside the JSON.

{
  "tailored_resume_json": {
    "basicInfo": {
      "fullName": "copy from resume (skip if garbage)",
      "email": "copy from resume",
      "phone": "copy from resume",
      "location": "copy from resume",
      "linkedin": "copy from resume",
      "portfolio": "copy from resume"
    },
    "summary": "3 sentences. Sentence 1: [Exact JD job title] with [X years] experience in [top 5 JD keywords — use EXACT terms from JD, separated by commas]. Sentence 2: Proven track record of [specific achievement containing 2-3 more JD keywords]. Sentence 3: Expert in [list 3 more critical JD technologies/methodologies]. NO generic words, every sentence must contain real JD keywords.",
    "skills": ["⚠️ CRITICAL: Include EVERY SINGLE skill/technology/tool mentioned in the JD. Use EXACT JD phrasing (e.g., 'C#', 'ASP.NET Core', 'RESTful APIs', 'MySQL', 'RabbitMQ'). If JD lists 25 keywords, this array must have ≥25 items. Order: (1) JD must-haves first, (2) JD nice-to-haves, (3) transferable skills from resume. NEVER use generic terms when JD is specific. ATS systems do exact string matching — one typo or abbreviation difference = keyword miss."],
    "experience": [
      {
        "company": "exact company name (skip if placeholder)",
        "role": "exact role (skip if placeholder)",
        "startDate": "exact date from resume",
        "endDate": "exact date from resume",
        "description": "5-7 bullet points. Format: • [Strong action verb matching JD] [specific task/project using 2-3 JD keywords] [quantified result]. Each bullet MUST contain ≥2 JD keywords naturally woven in. Use exact JD terminology. If original bullets are garbage, write realistic ones based on role+company title that showcase JD-required skills."
      }
    ],
    "education": [{"institution": "exact (skip if placeholder)", "degree": "exact", "startDate": "exact", "endDate": "exact"}],
    "projects": [{"title": "exact or AI-suggested if empty", "description": "Rewritten to highlight exactly which JD skills this project demonstrates. Quantify impact.", "link": "exact"}],
    "languages": ["Language — Level (if in resume)"]
  },
  "demo_100_cv": {
    "_warning": "DEMO ONLY — This version shows what a perfect 100% ATS score would look like for this job. It may include skills or experience the candidate does not actually have. Do NOT submit this as-is.",
    "_experience_fit": "honest 1-sentence assessment: does the candidate's real background qualify for this role? e.g. 'Candidate has 2 years experience but role requires 5+ — significant gap.' OR 'Candidate background aligns well with role requirements.'",
    "_is_qualified": true,
    "basicInfo": {
      "fullName": "MUST be exact same as tailored_resume_json.basicInfo.fullName — never change the candidate's name",
      "email": "exact same as tailored_resume_json.basicInfo.email",
      "phone": "exact same as tailored_resume_json.basicInfo.phone",
      "location": "exact same as tailored_resume_json.basicInfo.location",
      "linkedin": "exact same as tailored_resume_json.basicInfo.linkedin",
      "portfolio": "exact same as tailored_resume_json.basicInfo.portfolio"
    },
    "summary": "Perfect 3-sentence summary. Sentence 1: [Exact JD job title] with proven expertise in [top 5 JD keywords with EXACT terms]. Sentence 2: [Achievement with 3 more JD keywords]. Sentence 3: [2-3 final critical JD keywords/certifications]. Every word earns ATS points.",
    "skills": ["EVERY SINGLE skill from the JD included here — zero omissions. If JD mentions C#, .NET Core, REST, SOAP, MySQL, RabbitMQ, messaging systems, performance optimization, code reviews — ALL must appear with EXACT phrasing. Minimum 20-30 skills for most senior roles. Order by JD priority."],
    "experience": [
      {
        "company": "exact company name from candidate's resume",
        "role": "JD job title or closest equivalent",
        "startDate": "same as resume",
        "endDate": "same as resume",
        "description": "7 bullet points, each containing at least 2 JD keywords. Metrics added everywhere. Verbs match JD action words exactly."
      }
    ],
    "education": "same as tailored_resume_json.education",
    "projects": [{"title": "Project directly demonstrating the top missing JD skill", "description": "Project description that fills the biggest keyword gap from the JD.", "link": ""}],
    "languages": "same as tailored_resume_json.languages"
  },
  "cover_letter": "4 paragraphs. Para 1: Hook — mention company name + role + one specific thing you admire about the company (make it realistic). Para 2: Your strongest JD-relevant achievement with numbers. Para 3: Why this company specifically — connect your values to their mission. Para 4: CTA — confident, not desperate. NO clichés like 'I am writing to express my interest'. Sounds like a real human wrote this on a Tuesday morning.",
  "motivation_letter": "Story-driven personal letter (different from cover letter). 3-4 paragraphs. Para 1: Origin story — what sparked interest in this field. Para 2: Journey — key milestone that built relevant expertise. Para 3: Why THIS role at THIS company is the natural next step. Para 4: Vision — what you will contribute. Authentically personal, no buzzwords.",
  "application_text": "Email body only (no subject line). 3 short paragraphs, max 150 words total. Para 1: State role + where you found it. Para 2: Your single strongest qualification for this role + one metric. Para 3: Soft CTA — link to resume/portfolio, available for call. Professional, direct, human-sounding.",
  "linkedin_messages": {
    "recruiter": "Connection request (max 300 chars). Personalized — mention the role name, one concrete skill match, and a subtle compliment on their company. No 'Hi I saw your profile'.",
    "hiring_manager": "InMail (3 sentences max). Lead with the value you bring, name the role explicitly, end with soft question. Confident but not pushy.",
    "referral": "Message to mutual connection (3 sentences). Warm tone — acknowledge relationship, ask for referral to specific role, mention one reason you'd be a great fit. Not generic."
  },
  "ats_score": 85,
  "ats_score_explanation": "BEFORE optimization: [score]/100 — explain which rubric categories were low and why (e.g., 'Only 8 of 24 JD keywords present, no quantified achievements, skills section missing React.js, TypeScript, CI/CD'). AFTER optimization (your tailored output): [score]/100 — explain what improved (e.g., 'Now includes 21/24 JD keywords, 6 quantified achievements added, skills section now mirrors JD exactly'). Remaining gap: [3 specific things still missing that the candidate must genuinely have to reach 100%].",
  "ats_keywords_used": ["ONLY keywords that actually appear in the JD AND are now in the tailored resume. Be precise — list exact strings."],
  "missing_requirements": ["Precise gap statement: 'JD requires 5+ years in X, candidate resume shows 2 years' or 'JD mandates AWS certification, no certification found in resume'. Be specific. Never include garbage text as a gap."],
  "suggestions": {
    "projects": ["Specific project idea that directly demonstrates a missing JD skill — include tech stack and deliverable. E.g., 'Build a CI/CD pipeline using GitHub Actions + Docker to deploy a Node.js app to AWS EC2 — directly addresses the DevOps requirement in this JD.'"],
    "courses": ["Exact course title + platform + estimated duration. E.g., 'AWS Certified Solutions Architect – Associate on A Cloud Guru (40 hours) — directly addresses missing cloud architecture requirement.'"],
    "skills_to_learn": ["Specific skill from JD the candidate lacks — with context of why ATS will filter on it. REAL skills only, no garbage."],
    "career_tip": "One hyper-specific, actionable tip for THIS candidate applying to THIS role. Not generic advice. E.g., 'Since you lack AWS experience but have GCP, add a comparison project that ports a GCP architecture to AWS — this shows cloud agnosticism which 3 of the JD bullets reference.'"
  }
}

Output language: ${language}
Tone: ${tone}
RULE: Raw JSON ONLY — no text before or after the JSON. No markdown. No code fences. No thinking text.`;

  const messages = [
    { role: "system" as const, content: systemPrompt },
    {
      role: "user" as const,
      content: `CANDIDATE RESUME:\n${resumeText}\n\n${"═".repeat(60)}\n\nTARGET JOB DESCRIPTION:\n${jdText}\n\n${"═".repeat(60)}\n\nINSTRUCTIONS:\n1. First internally run Phase 1 JD Deconstruction — identify ALL keywords, top 5 must-haves, exact phrasing\n2. Apply Phase 2 ATS Injection Rules to every section of the resume\n3. Calculate honest BEFORE and AFTER ATS scores per the Phase 3 rubric\n4. Output ONLY the JSON object — no reasoning, no explanations, no markdown fences\n5. IGNORE any placeholder/garbage text (xcvxcv, asdf, test, lorem ipsum, etc.) in the resume`
    }
  ];

  // Non-streaming call to kimi-k2-thinking
  const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${NVIDIA_API_KEY}`,
    },
    body: JSON.stringify({
      model: "moonshotai/kimi-k2-thinking",
      messages,
      temperature: 0.6,
      top_p: 0.95,
      max_tokens: 20000,
      stream: false,
    }),
  });

  if (!response.ok) {
    let errMsg = `NVIDIA API Error ${response.status}`;
    try {
      const err = await response.json();
      errMsg = err?.error?.message || err?.message || errMsg;
    } catch { /* ignore */ }
    throw new Error(errMsg);
  }

  const data = await response.json();
  let content: string = data.choices?.[0]?.message?.content?.trim() || "";

  // Strip <think>...</think> reasoning blocks emitted by thinking models
  content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // Strip markdown code fences if present
  content = content.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/g, "").trim();

  // Extract first JSON object (in case there's reasoning text before it)
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI did not return valid JSON output.");

  let jsonStr = jsonMatch[0];

  // Attempt to fix common AI JSON issues
  let result;
  try {
    result = JSON.parse(jsonStr);
  } catch (e1) {
    // Try fixing: trailing commas before } or ]
    let fixed = jsonStr.replace(/,\s*([}\]])/g, '$1');
    // Try fixing: unescaped newlines inside string values 
    fixed = fixed.replace(/(?<=:\s*"[^"]*)\n(?=[^"]*")/g, '\\n');
    // Try fixing: single quotes -> double quotes (risky but common AI mistake)
    // Only if double-quote parse fails
    try {
      result = JSON.parse(fixed);
    } catch (e2) {
      // Last resort: truncate at last valid closing brace and retry
      let lastValid = fixed.lastIndexOf('}');
      while (lastValid > 0) {
        try {
          result = JSON.parse(fixed.slice(0, lastValid + 1));
          break;
        } catch {
          lastValid = fixed.lastIndexOf('}', lastValid - 1);
        }
      }
      if (!result) {
        console.error('AI JSON parse failed. First 500 chars:', jsonStr.slice(0, 500));
        throw new Error("AI returned malformed JSON. Please try again.");
      }
    }
  }

  // Post-process: filter garbage from skills
  if (Array.isArray(result.tailored_resume_json?.skills)) {
    result.tailored_resume_json.skills = result.tailored_resume_json.skills
      .map((s: string) => {
        // Strip AI noise appendages like " - None in cv", " — not found in resume", " (missing)", etc.
        let cleaned = s
          .replace(/\s*[-–—]\s*(none|not found|missing|absent|n\/a|null)(\s+(in|from|on)\s+(cv|resume|the cv|the resume|candidate))?.*$/i, '')
          .replace(/\s*\(\s*(none|not found|missing|absent|n\/a|null)\s*\)/i, '')
          .replace(/\s*·\s*(none|not found|missing).*$/i, '')
          .trim();
        return cleaned;
      })
      .filter((s: string) => {
        const lower = s.toLowerCase().trim();
        // Filter out placeholder/garbage
        if (lower.length < 2) return false;
        if (/^[xcvbnmasdfghjklqwertyuiop]+$/i.test(lower) && lower.length < 8) return false;
        if (/^(test|asdf|qwerty|lorem|xxx|placeholder|sample)/i.test(lower)) return false;
        // Filter out leftover "none in cv" type strings
        if (/\bnone\b.*\b(cv|resume)\b/i.test(lower)) return false;
        if (/^(none|null|n\/a|undefined|missing)$/i.test(lower)) return false;
        return true;
      });
  }

  // Post-process: clean missing_requirements from AI noise
  if (Array.isArray(result.missing_requirements)) {
    result.missing_requirements = result.missing_requirements.filter((r: string) => {
      const lower = (r || '').toLowerCase().trim();
      if (lower.length < 5) return false;
      // Filter out generic filler
      if (/^(none|n\/a|null|no gaps|no missing|all requirements met)/i.test(lower)) return false;
      return true;
    });
  }

  return result;
}

/**
 * parsePdfWithNemotron — uses nvidia/nemotron-parse to extract structured text
 * from a PDF or image file buffer.  Falls back gracefully if the API rejects.
 *
 * Works for:
 *  - Scanned / image-based PDFs that fool the regex extractor
 *  - Any image containing CV text (JPG, PNG, WEBP…)
 *
 * Returns clean markdown text ready to feed into optimizeCV().
 */
export async function parsePdfWithNemotron(buffer: Buffer, mimeType?: string): Promise<string> {
  const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
  if (!NVIDIA_API_KEY) throw new Error("NVIDIA_API_KEY not configured.");

  const mime = mimeType || "application/pdf";
  const b64 = buffer.toString("base64");

  // nemotron-parse expects multimodal content, not plain string content.
  const mediaUrl = `data:${mime};base64,${b64}`;

  // markdown_no_bbox → clean markdown text, no coordinate noise
  const toolName = "markdown_no_bbox";

  const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${NVIDIA_API_KEY}`,
      "Accept": "application/json",
    },
    body: JSON.stringify({
      model: "nvidia/nemotron-parse",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: mediaUrl },
            },
          ],
        },
      ],
      tools: [{ type: "function", function: { name: toolName } }],
      tool_choice: { type: "function", function: { name: toolName } },
      max_tokens: 8192,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`nemotron-parse error ${response.status}: ${errText.slice(0, 300)}`);
  }

  const data = await response.json();

  // nemotron-parse returns its output in tool_calls[0].function.arguments
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (toolCall?.function?.arguments) {
    try {
      const args = JSON.parse(toolCall.function.arguments);
      // The argument key may be "markdown", "content", or the tool name itself
      const text = args.markdown ?? args.content ?? args[toolName] ?? JSON.stringify(args);
      return String(text).trim();
    } catch {
      return String(toolCall.function.arguments).trim();
    }
  }

  // Some responses put content in the regular message field
  return data.choices?.[0]?.message?.content?.trim() || "";
}
