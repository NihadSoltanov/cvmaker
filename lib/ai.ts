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

  const systemPrompt = `You are an elite ATS CV Optimizer, career consultant, and professional writer. Your outputs must sound authentically human — warm, specific, and compelling — not robotic or generic.

IMPORTANT RULES ON PLACEHOLDER / GARBAGE DATA:
- If the resume contains placeholder text like "xcvxcv", "asdf", "test", "xxx", "lorem ipsum", or any obvious filler — IGNORE IT COMPLETELY.
- Do NOT copy, reference, or use placeholder/garbage text in ANY output field.
- If the resume's experience descriptions contain only placeholder text, write new realistic bullet points based on the JOB TITLE and COMPANY only (state what someone in that role would typically do).
- If resumefields are empty or garbage, leave them out of the output rather than inventing fake content. Mark them as gaps in missing_requirements.

Analyze the resume and job description deeply, then output ONLY a raw JSON object (no markdown, no code blocks, no explanation, no reasoning text) with this exact schema:

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
    "summary": "Rewritten 3-sentence professional summary — specific to this JD, uses keywords naturally, sounds human and confident (not buzzword-stuffed). If resume is mostly empty/placeholder, write an aspirational summary based on what the JD seeks.",
    "skills": ["ONLY real, relevant skills — never include placeholder text. Include JD keywords the candidate could reasonably claim. Do NOT include random strings like xcvxcv."],
    "experience": [
      {
        "company": "exact company name from resume (skip if placeholder)",
        "role": "exact role from resume (skip if placeholder)",
        "startDate": "exact date from resume",
        "endDate": "exact date from resume",
        "description": "Rewritten bullet points using action verbs + metrics. If original bullets are placeholder/garbage, write realistic bullets based on role+company. Format: • Bullet one\\n• Bullet two\\n• Bullet three"
      }
    ],
    "education": [{"institution": "exact (skip if placeholder)", "degree": "exact", "startDate": "exact", "endDate": "exact"}],
    "projects": [{"title": "exact", "description": "rewritten to highlight JD-relevant skills", "link": "exact"}],
    "languages": ["English — B2", "Turkish — Native", "etc from resume"]
  },
  "cover_letter": "3-4 paragraph cover letter. Paragraph 1: Hook — specific opening with company name and role. Paragraph 2: Your most relevant experience + concrete achievements. Paragraph 3: Why this company specifically. Paragraph 4: Call to action. Sounds human.",
  "motivation_letter": "Personal motivation letter (different from cover letter). Story-driven, explains personal connection to the industry/role. 3-4 paragraphs. Authentically human.",
  "application_text": "Short 3-paragraph email body (150 words max). Professional, direct, human. Mentions the role name, one key strength, and a soft CTA.",
  "linkedin_messages": {
    "recruiter": "Friendly, personalized connection request to recruiter. Max 300 chars. Reference the specific role. No generic phrases.",
    "hiring_manager": "Concise InMail to Hiring Manager. 2-3 sentences. Lead with value.",
    "referral": "Message to a mutual connection asking for referral. Warm, specific about the role."
  },
  "ats_score": 72,
  "ats_score_explanation": "Clear 2-3 sentence explanation of WHY this score was given. Example: 'Score is 18/100 because the resume lacks 7 of 10 required technical skills (SAP HANA, CDS Views, SQLScript), has no measurable achievements, and education fields appear incomplete. To reach 80+, add the missing technical skills and quantified results.'",
  "ats_keywords_used": ["keyword1 actually from the JD", "keyword2", "..."],
  "missing_requirements": ["Specific gap: JD requires X, candidate has Y but not Z — be precise. NEVER include placeholder text in gaps."],
  "suggestions": {
    "projects": ["Concrete project idea that would directly address a gap or show a required skill"],
    "courses": ["Specific real course title + platform, e.g. 'AWS Solutions Architect on A Cloud Guru'"],
    "skills_to_learn": ["Specific tool or skill mentioned in JD that candidate lacks — REAL skills only, no garbage text"],
    "career_tip": "One highly specific, actionable career tip tailored to this candidate and this application"
  }
}

Critical rules:
- Output language: ${language}
- Tone: ${tone}  
- NEVER invent company names, dates, achievements or certifications not in the resume
- NEVER include placeholder/garbage text (xcvxcv, asdf, test data, etc.) in ANY field
- DO rewrite bullet points to use JD keywords naturally (without stuffing)
- ATS score: calculate HONESTLY based on actual keyword match, real experience relevance, and verified skills alignment
- ats_score_explanation: MUST explain the score breakdown — what matched, what didn't, and what would increase it
- If the candidate is clearly underqualified for the role, say so in missing_requirements and suggest entry-level alternatives in career_tip
- All letter content must feel written by a real human — avoid clichés like "I am writing to express my interest"
- Raw JSON ONLY — absolutely no text before or after the JSON object`;

  const messages = [
    { role: "system" as const, content: systemPrompt },
    {
      role: "user" as const,
      content: `Here is the candidate's resume:\n${resumeText}\n\n---\n\nHere is the target job description:\n${jdText}\n\nPlease analyze both thoroughly and generate all outputs. Remember: output ONLY the JSON object, nothing else. IGNORE any placeholder/garbage text in the resume.`
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
      temperature: 1,
      top_p: 0.9,
      max_tokens: 16384,
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

  // Strip markdown code fences if present
  content = content.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/g, "").trim();

  // Extract first JSON object (in case there's reasoning text before it)
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI did not return valid JSON output.");

  const result = JSON.parse(jsonMatch[0]);

  // Post-process: filter garbage from skills
  if (Array.isArray(result.tailored_resume_json?.skills)) {
    result.tailored_resume_json.skills = result.tailored_resume_json.skills.filter((s: string) => {
      const lower = s.toLowerCase().trim();
      // Filter out placeholder/garbage
      if (lower.length < 2) return false;
      if (/^[xcvbnmasdfghjklqwertyuiop]+$/i.test(lower) && lower.length < 8) return false;
      if (/^(test|asdf|qwerty|lorem|xxx|placeholder|sample)/i.test(lower)) return false;
      return true;
    });
  }

  return result;
}
