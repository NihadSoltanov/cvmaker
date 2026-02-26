import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { messages } = await request.json();
        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
        if (!NVIDIA_API_KEY) return NextResponse.json({ error: "NVIDIA_API_KEY not set" }, { status: 500 });

        const systemPrompt = `You are an expert AI Career Coach with 20+ years of experience in HR, recruitment, career development, salary negotiation, and executive coaching across all industries globally.

Your expertise covers:
- Salary negotiation strategies (specific scripts and tactics)
- Career pivots and industry transitions  
- Interview preparation and coaching (including tricky behavioral questions)
- Personal branding and LinkedIn optimization
- Handling difficult workplace situations (toxic managers, conflicts, unfair treatment)
- Career gap explanations
- Promotion strategies
- Job search tactics (cold outreach, networking, referrals)
- Resume and CV strategy
- Entrepreneurship vs corporate career decisions

Your style:
- Warm, direct, and actionable — never vague or generic
- Give specific scripts, templates, and examples when relevant
- Ask clarifying questions if you need more context to give better advice
- Be honest even when the answer is uncomfortable
- Adapt your advice to the person's specific situation, industry, and country when they share it
- Keep responses concise but complete — use bullet points for action items`;

        const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${NVIDIA_API_KEY}`,
            },
            body: JSON.stringify({
                model: "moonshotai/kimi-k2-thinking",
                messages: [
                    { role: "system", content: systemPrompt },
                    ...messages.map((m: any) => ({ role: m.role, content: m.content })),
                ],
                temperature: 1,
                top_p: 0.9,
                max_tokens: 4096,
                stream: false,
            }),
        });

        if (!response.ok) {
            let errMsg = `API Error ${response.status}`;
            try { const err = await response.json(); errMsg = err?.error?.message || errMsg; } catch { /* ignore */ }
            return NextResponse.json({ error: errMsg }, { status: 500 });
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content?.trim() || "I'm sorry, I couldn't generate a response. Please try again.";

        return NextResponse.json({ reply });
    } catch (error: any) {
        console.error("Career coach error:", error);
        return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
    }
}
