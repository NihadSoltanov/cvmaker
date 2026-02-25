interface OpenRouterResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
}

export async function optimizeCV(
    resumeText: string,
    jdText: string,
    language: string,
    tone: string
) {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`
        },
        body: JSON.stringify({
            model: "google/gemini-2.5-flash", // We can default to Gemini Flash via OpenRouter for cost effectiveness, or adjust later.
            messages: [
                {
                    role: "system",
                    content: `You are an expert ATS CV Optimizer. Your job is to parse the input resume and job description, then generate tailored outputs. The outputs MUST be returned strictly as a JSON object with the following schema:
{
  "tailored_resume_json": { "header": {}, "summary": "", "skills": {}, "experience": [], "education": [], "projects": [], "certifications": [], "languages": [] },
  "cover_letter": "The cover letter text...",
  "application_text": "The short text suitable for email body...",
  "linkedin_messages": {
    "recruiter": "...",
    "hiring_manager": "...",
    "referral": "..."
  },
  "ats_keywords_used": ["keyword1", "keyword2"],
  "missing_requirements": ["missing1", "missing2"],
  "suggestions": {
    "projects": ["Idea 1"],
    "courses": ["Course 1"],
    "skills_to_learn": ["Skill 1"]
  }
}
Generate outputs in language: ${language}, Tone: ${tone}. Do NOT invent facts! Output purely JSON, no markdown formatting.`,
                },
                {
                    role: "user",
                    content: `Resume:\n${resumeText}\n\nJob Description:\n${jdText}`,
                },
            ],
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to communicate with OpenRouter');
    }

    const data = (await response.json()) as OpenRouterResponse;
    let content = data.choices[0].message.content.trim();

    if (content.startsWith("\`\`\`json")) {
        content = content.replace(/^```json\s*/, "").replace(/```$/, "").trim();
    }
    return JSON.parse(content);
}
