"use client";

import { useState, useRef, useEffect } from "react";
import { BrainCircuit, Send, RefreshCw, Sparkles, User, Lock } from "lucide-react";
import { GuideButton } from "@/components/GuideButton";
import { useIsPaid } from "@/lib/useIsPaid";

type Message = { role: "user" | "assistant"; content: string };

const FREE_MSG_LIMIT = 5; // messages per day

const QUICK_PROMPTS = [
    "How do I negotiate a higher salary offer?",
    "How do I explain a 1-year career gap?",
    "Should I mention my failed startup on my CV?",
    "How do I switch careers from finance to tech?",
    "What should I say when asked 'What is your weakness?'",
    "How do I get promoted without asking directly?",
    "How do I handle a toxic manager?",
    "Should I accept a counteroffer from my current employer?",
    "How do I build my personal brand on LinkedIn?",
    "What's the best way to cold-email a hiring manager?",
];

export default function CareerCoachPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [msgCount, setMsgCount] = useState(0);
    const bottomRef = useRef<HTMLDivElement>(null);
    const { isPaid, loading: isPaidLoading } = useIsPaid();

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Load daily message count
    useEffect(() => {
        const today = new Date().toISOString().slice(0, 10);
        try {
            const stored = localStorage.getItem("coach_msg_count");
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.date === today) setMsgCount(parsed.count);
            }
        } catch { /* ignore */ }
    }, []);

    // Wait for isPaid to finish loading before applying the limit — avoids false-blocking paid users
    const reachedLimit = !isPaidLoading && !isPaid && msgCount >= FREE_MSG_LIMIT;
    const remaining = isPaid ? Infinity : FREE_MSG_LIMIT - msgCount;

    const sendMessage = async (text?: string) => {
        const userMsg = text ?? input.trim();
        if (!userMsg || isLoading || reachedLimit) return;

        setInput("");

        // Track usage for free users
        if (!isPaid) {
            const today = new Date().toISOString().slice(0, 10);
            const newCount = msgCount + 1;
            setMsgCount(newCount);
            localStorage.setItem("coach_msg_count", JSON.stringify({ date: today, count: newCount }));
        }

        const newMessages: Message[] = [...messages, { role: "user", content: userMsg }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const res = await fetch("/api/ai/coach", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newMessages }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed");
            setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
        } catch (e: any) {
            setMessages(prev => [...prev, { role: "assistant", content: `⚠️ Error: ${e.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-5rem)] space-y-0 relative z-10">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-5 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center shadow-inner">
                        <BrainCircuit className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
                            AI Career Coach
                            <span className="text-xs font-bold bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-2 py-0.5 rounded-full">KIMI K2</span>
                            {!isPaid && (
                                <span className="text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
                                    Free: {remaining > 0 ? `${remaining} left today` : "Limit reached"}
                                </span>
                            )}
                        </h1>
                        <p className="text-neutral-500 dark:text-neutral-400 font-medium text-sm">Get expert career advice — salary negotiation, job hunting, interviews, career pivots and more.</p>
                    </div>
                </div>
                <GuideButton guide={{
                    title: "How to use AI Career Coach",
                    steps: [
                        "Ask any career-related question — it's an open conversation.",
                        "Use the quick prompts below to get started fast.",
                        "The AI remembers the conversation context — follow up with questions.",
                        "Click 'New Chat' to start a fresh conversation.",
                    ],
                    tips: [
                        "Be specific: include your industry, experience level, and country for better advice.",
                        "Ask follow-up questions — the more context you give, the better the advice.",
                        `Free plan: ${FREE_MSG_LIMIT} messages/day. Pro: unlimited.`,
                    ]
                }} />
            </div>

            {/* Chat + Quick Prompts */}
            <div className="flex-1 flex flex-col min-h-0 bg-white/60 dark:bg-black/40 backdrop-blur-2xl border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-xl">

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center py-6">
                            <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mb-4 border border-purple-100 dark:border-purple-800">
                                <Sparkles className="w-8 h-8 text-purple-500" />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-700 dark:text-neutral-200 mb-2">Your AI Career Coach is ready</h3>
                            <p className="text-sm text-neutral-500 max-w-sm">Ask anything about your career — from salary negotiation scripts to handling a toxic boss. Powered by Kimi K2 reasoning AI.</p>
                            <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-2xl">
                                {QUICK_PROMPTS.slice(0, 6).map((q, i) => (
                                    <button key={i} onClick={() => sendMessage(q)} disabled={reachedLimit}
                                        className="text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-3 py-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300 transition border border-neutral-200 dark:border-neutral-700 text-left disabled:opacity-40 disabled:cursor-not-allowed">
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            {msg.role === "assistant" && (
                                <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mt-0.5">
                                    <BrainCircuit className="w-4 h-4 text-white" />
                                </div>
                            )}
                            <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user"
                                ? "bg-indigo-600 text-white rounded-tr-sm"
                                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 rounded-tl-sm"}`}>
                                {msg.content}
                            </div>
                            {msg.role === "user" && (
                                <div className="w-8 h-8 flex-shrink-0 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mt-0.5">
                                    <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                </div>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-3 justify-start">
                            <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                                <BrainCircuit className="w-4 h-4 text-white" />
                            </div>
                            <div className="bg-neutral-100 dark:bg-neutral-800 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:0ms]" />
                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:150ms]" />
                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:300ms]" />
                                <span className="text-xs text-neutral-400 ml-1">Kimi K2 thinking…</span>
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Limit reached banner */}
                {reachedLimit && (
                    <div className="px-4 py-3 bg-amber-50 dark:bg-amber-900/10 border-t border-amber-200 dark:border-amber-800 flex items-center gap-3 text-sm">
                        <Lock className="w-5 h-5 text-amber-500 flex-shrink-0" />
                        <p className="text-amber-800 dark:text-amber-300">
                            <strong>Daily message limit reached.</strong> Free plan allows {FREE_MSG_LIMIT} messages per day.
                            <a href="/settings" className="ml-2 underline font-bold text-indigo-600 dark:text-indigo-400">Upgrade to Pro →</a>
                        </p>
                    </div>
                )}

                {/* Quick prompts row (when conversation active) */}
                {messages.length > 0 && !reachedLimit && (
                    <div className="px-4 py-2 border-t border-neutral-100 dark:border-neutral-800 flex gap-2 overflow-x-auto no-scrollbar">
                        {QUICK_PROMPTS.slice(0, 5).map((q, i) => (
                            <button key={i} onClick={() => sendMessage(q)}
                                className="flex-shrink-0 text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-3 py-1.5 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 transition border border-neutral-200 dark:border-neutral-700">
                                {q.length > 38 ? q.slice(0, 38) + "…" : q}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex gap-3 items-end">
                    <button onClick={() => { setMessages([]); setInput(""); }}
                        className="flex-shrink-0 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:text-neutral-600 hover:border-neutral-400 transition"
                        title="New Chat">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                        rows={2}
                        disabled={reachedLimit}
                        placeholder={reachedLimit ? "Daily limit reached — upgrade to Pro for unlimited" : "Ask anything about your career… (Enter to send, Shift+Enter for new line)"}
                        className="flex-1 resize-none bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-4 py-3 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-indigo-400 transition disabled:opacity-50"
                    />
                    <button onClick={() => sendMessage()} disabled={!input.trim() || isLoading || reachedLimit}
                        className="flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center hover:opacity-90 transition disabled:opacity-40">
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
