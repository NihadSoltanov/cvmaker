// AI optimization via NVIDIA Kimi K2 (reasoning model)
// Base URL: https://integrate.api.nvidia.com/v1

export async function optimizeCV(
    resumeText: string,
    jdText: string,
    language: string,
    tone: string
) {
    const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;

    const systemPrompt = `You are an elite ATS CV Optimizer and career consultant powered by deep reasoning. Analyze the resume and job description thoroughly, then output ONLY a raw JSON object (no markdown, no code blocks) with this exact schema:

{
  "tailored_resume_json": {
    "summary": "Rewritten professional summary aligned to the JD",
    "skills": ["skill1", "skill2"],
    "experience": [{"company":"","role":"","startDate":"","endDate":"","description":"Bullet points optimized for ATS"}],
    "education": [{"institution":"","degree":"","startDate":"","endDate":""}],
    "projects": [{"title":"","description":"","link":""}]
  },
  "cover_letter": "Full professional cover letter (3-4 paragraphs, formal tone, personalized to company and role)",
  "motivation_letter": "Motivational letter (more personal, story-driven, explains WHY this company and role aligns with candidate's career mission)",
  "application_text": "Short 150-word email body to send with CV attachment",
  "linkedin_messages": {
    "recruiter": "Connection request message to recruiter (300 chars max)",
    "hiring_manager": "InMail to Hiring Manager",
    "referral": "Message to a mutual connection asking for referral"
  },
  "ats_score": 85,
  "ats_keywords_used": ["keyword1", "keyword2"],
  "missing_requirements": ["Gap 1 - what they need vs what candidate has"],
  "suggestions": {
    "projects": ["Side project idea that would strengthen candidacy"],
    "courses": ["Specific course to take"],
    "skills_to_learn": ["Skill gap to fill"],
    "career_tip": "One strategic career tip based on this application"
  }
}

Rules:
- Output language: ${language}
- Tone: ${tone}  
- Do NOT fabricate experience, dates, or companies
- Do tailor summaries, bullet points, keywords
- ATS score must be realistic (0-100)
- Cover letter must name the company and role
- Raw JSON only, no markdown`;

    const messages = [
        { role: "system", content: systemPrompt },
        {
            role: "user",
            content: `Resume Data:\n${resumeText}\n\n---\nJob Description:\n${jdText}\n\nPlease analyze deeply and generate all outputs.`
        }
    ];

    // Try NVIDIA Kimi K2 first
    if (NVIDIA_API_KEY) {
        try {
            const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${NVIDIA_API_KEY}`,
                },
                body: JSON.stringify({
                    model: "moonshotai/kimi-k2",
                    messages,
                    temperature: 0.7,
                    top_p: 0.9,
                    max_tokens: 8192,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                let content = data.choices?.[0]?.message?.content?.trim() || "";
                content = content.replace(/^```json\s*/i, "").replace(/```$/g, "").trim();
                // Extract JSON if wrapped in any extra text
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) content = jsonMatch[0];
                return JSON.parse(content);
            }
        } catch (e) {
            console.warn("NVIDIA Kimi K2 failed, falling back to OpenRouter:", e);
        }
    }

    // Fallback: OpenRouter (Gemini Flash)
    const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
    const fallbackResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENROUTER_KEY}`,
        },
        body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages,
        }),
    });

    if (!fallbackResponse.ok) {
        const err = await fallbackResponse.json().catch(() => ({}));
        throw new Error(err?.error?.message || `AI API Error: ${fallbackResponse.status}`);
    }

    const fallbackData = await fallbackResponse.json();
    let content = fallbackData.choices[0].message.content.trim();
    content = content.replace(/^```json\s*/i, "").replace(/```$/g, "").trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) content = jsonMatch[0];
    return JSON.parse(content);
}
