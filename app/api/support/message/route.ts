import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const NEXORA_SYSTEM_PROMPT = `You are the friendly, knowledgeable support AI for Nexora â€” an AI-powered CV optimization platform.

ABOUT NEXORA:
Nexora helps job seekers create ATS-optimized CVs tailored to specific job descriptions. Key features:
- My CV (Resume Editor): Users fill in their master CV â€” personal info, work experience, education, skills, languages, projects. This is saved and reused for every application.
- Tailor Application (Optimize): Users paste a job description and Nexora's AI rewrites their CV, improving ATS keyword alignment. Generates a tailored CV, cover letter, motivation letter, LinkedIn messages, and application email.
- ATS Score: Each optimization shows an ATS match score (0-100) with a detailed explanation of what matched and what is missing.
- History: Users can view all previous optimizations and re-download PDFs.
- AI Career Coach: A conversational AI coach for interview prep, career advice, salary negotiation, and job search strategy.
- PDF Download: Every optimized CV can be downloaded as a styled PDF.
- Job Listings (Jobs): Browse open positions relevant to the user profile.
- Settings: Users can update their profile, preferred language (Azerbaijani, English, Russian, Turkish), and notifications.

PRICING:
- Free tier: 3 CV optimizations per day, basic templates, standard ATS check.
- Pro plan: Unlimited optimizations, all premium templates, priority AI, ATS checker, PDF watermark removed, full history.
- Pro is a monthly or annual subscription via Stripe. After payment, access is instant.

HOW TO USE (step by step):
1. Sign up / Log in at nexora.app
2. Go to "My CV" and fill in your full resume details
3. Go to "Tailor Application", paste the job description, click Optimize
4. Review the ATS score and tailored outputs (CV, cover letter, etc.)
5. Download the PDF or copy the text
6. Use "AI Career Coach" for interview tips and career advice
7. Check "History" to revisit past optimizations

COMMON ISSUES AND SOLUTIONS:
- "I paid but still on Free": Ask user to log out and log back in. If still wrong, ask for their email and payment date so a human agent can manually verify.
- "My ATS score is low": Tips: use exact keywords from the job description, quantify achievements (e.g. increased revenue by 30%), remove tables and graphics from resume, add a clear Skills section.
- "CV optimization not working": Ask them to check their internet connection, refresh, and try again. If error persists, note the error message and escalate.
- "I cannot download the PDF": Try a different browser. Disable ad-blockers. If still failing, escalate to human support.
- "How do I change language?": Go to Settings or use the language switcher in the top bar.
- "I want to change my email": Email change is in Settings > Account. If locked out, escalate to human support.

YOUR BEHAVIOR:
- Be warm, concise, and helpful. Maximum 3-4 sentences per response unless explaining a multi-step process.
- Always answer in the SAME LANGUAGE the user writes in (Azerbaijani, Turkish, Russian, or English).
- If you do not know the answer or it is account-specific (payment issues, data loss, bugs), say so clearly and recommend connecting to human support.
- Never make up facts about Nexora.
- Do NOT include a Connect to Support footer â€” the UI handles that separately.
- Do NOT repeat the user's question back to them.
- Keep responses concise and actionable.`;

async function callNvidiaAI(userMessage: string, history: { role: string; content: string }[]): Promise<string> {
    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) throw new Error("NVIDIA_API_KEY not set");

    const messages = [
        { role: "system", content: NEXORA_SYSTEM_PROMPT },
        ...history.slice(-6),
        { role: "user", content: userMessage },
    ];

    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "moonshotai/kimi-k2-instruct",
            messages,
            temperature: 0.5,
            max_tokens: 400,
            stream: false,
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`NVIDIA API error: ${err}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() ?? "I am having trouble responding right now. Please try again or connect to a human agent.";
}

// POST /api/support/message
export async function POST(req: NextRequest) {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { message, mode } = await req.json();
    if (!message?.trim()) return NextResponse.json({ error: "message required" }, { status: 400 });

    const chatMode = mode === "human" ? "human" : "ai";

    // Insert user message â€” chat_mode=ai means admin inbox ignores it
    const { error: insertError } = await supabaseAdmin.from("support_messages").insert({
        user_id: user.id,
        sender: "user",
        message: message.trim(),
        read_by_admin: chatMode === "ai",
        read_by_user: true,
        chat_mode: chatMode,
    });
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

    // Check if a human admin has ever replied
    const { data: adminReplies } = await supabaseAdmin
        .from("support_messages")
        .select("id")
        .eq("user_id", user.id)
        .eq("sender", "admin")
        .limit(1);
    const hasHumanAgent = (adminReplies?.length ?? 0) > 0;

    // AI reply only when in AI mode and no human agent yet
    if (chatMode === "ai" && !hasHumanAgent) {
        // Fetch last few exchanges for context
        const { data: historyRows } = await supabaseAdmin
            .from("support_messages")
            .select("sender, message")
            .eq("user_id", user.id)
            .eq("chat_mode", "ai")
            .order("created_at", { ascending: false })
            .limit(8);

        const chatHistory = (historyRows || [])
            .reverse()
            .slice(0, -1)
            .map((m: any) => ({
                role: m.sender === "user" ? "user" : "assistant",
                content: m.message,
            }));

        let aiReply = "I am having trouble responding right now. Please try again or connect to a human agent.";
        try {
            aiReply = await callNvidiaAI(message.trim(), chatHistory);
        } catch (e) {
            console.error("AI error:", e);
        }

        await supabaseAdmin.from("support_messages").insert({
            user_id: user.id,
            sender: "ai",
            message: aiReply,
            read_by_admin: true,
            read_by_user: false,
            chat_mode: "ai",
        });
    }

    // If first human-mode message, notify all admins
    if (chatMode === "human" && !hasHumanAgent) {
        const { data: userProfile } = await supabaseAdmin
            .from("profiles")
            .select("email, full_name")
            .eq("id", user.id)
            .single();
        const { data: admins } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("role", "admin");
        if (admins && admins.length > 0) {
            await supabaseAdmin.from("notifications").insert(
                admins.map((a: any) => ({
                    user_id: a.id,
                    type: "message",
                    title: "New support request",
                    body: `${userProfile?.full_name || userProfile?.email || "A user"} is requesting human support.`,
                    link: "/admin/messages",
                }))
            );
        }
    }

    return NextResponse.json({ ok: true, hasHumanAgent });
}
