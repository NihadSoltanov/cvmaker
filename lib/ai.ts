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

    const systemPrompt = `You are an elite ATS CV Optimizer and career consultant. Analyze the resume and job description thoroughly, then output ONLY a raw JSON object (no markdown, no code blocks, no explanation) with this exact schema:

{
  "tailored_resume_json": {
    "summary": "Rewritten professional summary aligned to the JD",
    "skills": ["skill1", "skill2"],
    "experience": [{"company":"","role":"","startDate":"","endDate":"","description":"ATS-optimized bullet points"}],
    "education": [{"institution":"","degree":"","startDate":"","endDate":""}],
    "projects": [{"title":"","description":"","link":""}]
  },
  "cover_letter": "Full professional cover letter (3-4 paragraphs, formal tone, personalized to the specific company and role)",
  "motivation_letter": "Motivational letter (personal, story-driven, explains WHY this company and role aligns with career mission)",
  "application_text": "Short 150-word email body to send with CV attachment — professional and direct",
  "linkedin_messages": {
    "recruiter": "Connection request to recruiter (300 chars max)",
    "hiring_manager": "InMail to Hiring Manager (focused on value proposition)",
    "referral": "Message to mutual connection asking for referral"
  },
  "ats_score": 85,
  "ats_keywords_used": ["keyword1", "keyword2"],
  "missing_requirements": ["Gap 1 — what they need vs what candidate has"],
  "suggestions": {
    "projects": ["Side project idea that would strengthen candidacy"],
    "courses": ["Specific course to take with platform name"],
    "skills_to_learn": ["Specific skill gap to fill"],
    "career_tip": "One concrete strategic career tip based on this specific application"
  }
}

Rules:
- Output language: ${language}
- Tone: ${tone}
- NEVER fabricate employment dates, company names, or certifications
- DO tailor summaries, bullet points, and keywords to the JD
- ATS score must be realistic and honest (0-100)
- Cover letter MUST address the company by name and reference the specific role
- Raw JSON ONLY — no markdown fences, no extra text`;

    const messages = [
        { role: "system" as const, content: systemPrompt },
        {
            role: "user" as const,
            content: `Resume Data:\n${resumeText}\n\n---\nJob Description:\n${jdText}\n\nAnalyze deeply and generate all outputs in the specified JSON format.`
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
