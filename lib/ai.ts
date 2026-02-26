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

Analyze the resume and job description deeply, then output ONLY a raw JSON object (no markdown, no code blocks, no explanation, no reasoning text) with this exact schema:

{
  "tailored_resume_json": {
    "basicInfo": {
      "fullName": "copy from resume",
      "email": "copy from resume",
      "phone": "copy from resume",
      "location": "copy from resume",
      "linkedin": "copy from resume",
      "portfolio": "copy from resume"
    },
    "summary": "Rewritten 3-sentence professional summary — specific to this JD, uses keywords naturally, sounds human and confident (not buzzword-stuffed)",
    "skills": ["list", "of", "relevant", "skills", "including", "JD", "keywords"],
    "experience": [
      {
        "company": "exact company name from resume",
        "role": "exact role from resume",
        "startDate": "exact date from resume",
        "endDate": "exact date from resume",
        "description": "Rewritten bullet points using action verbs + metrics from resume, weaving in JD keywords naturally. Format: • Bullet one\n• Bullet two"
      }
    ],
    "education": [{"institution": "exact", "degree": "exact", "startDate": "exact", "endDate": "exact"}],
    "projects": [{"title": "exact", "description": "rewritten to highlight JD-relevant skills", "link": "exact"}]
  },
  "cover_letter": "3-4 paragraph cover letter. Paragraph 1: Hook — specific opening referencing the company and role. Paragraph 2: Your most relevant experience + a concrete achievement with numbers. Paragraph 3: Why this company specifically (reference something real in the JD). Paragraph 4: Call to action. Must sound like a real human wrote it — warm, confident, specific.",
  "motivation_letter": "Personal motivation letter (different from cover letter). Story-driven: opens with a personal moment or insight that connects to this industry/role. Explains the WHY behind career choices. Shows genuine enthusiasm for this company's mission. 3-4 paragraphs. Must feel authentically human, not templated.",
  "application_text": "Short 3-paragraph email body (150 words max). Professional, direct, human. Mentions the role name, one key strength, and a soft CTA.",
  "linkedin_messages": {
    "recruiter": "Friendly, personalized connection request to recruiter. Max 300 chars. Reference the specific role and one relevant skill. No generic phrases.",
    "hiring_manager": "Concise InMail to Hiring Manager. 2-3 sentences. Lead with value, not with asking for a job.",
    "referral": "Message to mutual connection asking for referral. Warm, specific about the role and company."
  },
  "ats_score": 72,
  "ats_keywords_used": ["keyword1 actually from the JD", "keyword2", "..."],
  "missing_requirements": ["Specific gap: JD requires X, candidate has Y but not Z — be precise."],
  "suggestions": {
    "projects": ["Concrete project idea that would directly address a gap or show a required skill"],
    "courses": ["Specific real course title + platform, e.g. 'AWS Solutions Architect on A Cloud Guru'"],
    "skills_to_learn": ["Specific tool or skill mentioned in JD that candidate lacks"],
    "career_tip": "One highly specific, actionable career tip tailored to this candidate and this application"
  }
}

Critical rules:
- Output language: ${language}
- Tone: ${tone}  
- NEVER invent company names, dates, achievements or certifications not in the resume
- DO rewrite bullet points to use JD keywords naturally (without stuffing)
- ATS score: calculate honestly based on keyword match, experience relevance, and skills alignment
- All letter content must feel written by a real human — avoid clichés like "I am writing to express my interest"
- Raw JSON ONLY — absolutely no text before or after the JSON object`;

    const messages = [
        { role: "system" as const, content: systemPrompt },
        {
            role: "user" as const,
            content: `Here is the candidate's resume:\n${resumeText}\n\n---\n\nHere is the target job description:\n${jdText}\n\nPlease analyze both thoroughly and generate all outputs. Remember: output ONLY the JSON object, nothing else.`
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

    return JSON.parse(jsonMatch[0]);
}
