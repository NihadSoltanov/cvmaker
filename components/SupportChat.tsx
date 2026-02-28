"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
    MessageSquare, X, Send, Bot, User, Shield, Bell, Sparkles, Headphones,
    Trash2, AlertTriangle, RotateCcw, Paperclip, PhoneOff
} from "lucide-react";

interface Message {
    id: string;
    sender: "user" | "admin" | "ai";
    message: string;
    created_at: string;
}

interface Notification {
    id: string;
    type: string;
    title: string;
    body: string;
    read: boolean;
    link: string;
    created_at: string;
}

const QUICK_QUESTIONS = [
    { label: "Pricing & Plans", icon: "💳", key: "price", message: "What are the Nexora pricing plans? What's included in Free vs Pro?" },
    { label: "ATS Score Help", icon: "📊", key: "ats", message: "How does the ATS score work and how can I improve my ATS score?" },
    { label: "CV Tips", icon: "📄", key: "cv", message: "What are the best tips for writing a strong CV that gets noticed?" },
    { label: "Account & Billing", icon: "💰", key: "paid", message: "I have a question about my account or billing." },
    { label: "Technical Issue", icon: "🔧", key: "bug", message: null },
    { label: "Something else", icon: "💬", key: "other", message: null },
];

export function SupportChat() {
    const [open, setOpen] = useState(false);
    const openRef = useRef(false);
    const [tab, setTab] = useState<"chat" | "notifs">("chat");
    const [mode, setMode] = useState<"select" | "ai" | "human">("select");
    const [messages, setMessages] = useState<Message[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [hasHumanAgent, setHasHumanAgent] = useState(false);
    const [unreadMsgs, setUnreadMsgs] = useState(0);
    const [unreadNotifs, setUnreadNotifs] = useState(0);
    const [adminTyping, setAdminTyping] = useState(false);
    const [aiThinking, setAiThinking] = useState(false);
    const [aiCanEscalate, setAiCanEscalate] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);
    const [hoveredMsg, setHoveredMsg] = useState<string | null>(null);
    const [closeCountdown, setCloseCountdown] = useState<number | null>(null);

    const adminTypingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const typingChannelRef = useRef<any>(null);
    const typingSubscribed = useRef(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const msgPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const notifPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const closeCountdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const lastMsgCountRef = useRef(0);
    const tokenRef = useRef<string | null>(null);
    const userIdRef = useRef<string | null>(null);
    const prevMsgsLen = useRef(0);
    // Unique session id so user doesn't receive their own typing broadcast
    const sessionId = useRef(Math.random().toString(36).slice(2));

    useEffect(() => { openRef.current = open; }, [open]);
    useEffect(() => { tokenRef.current = token; }, [token]);
    useEffect(() => { userIdRef.current = userId; }, [userId]);

    // Auto-delete 60s after panel closes; fetch fresh data immediately when opening
    useEffect(() => {
        if (open) {
            // Cancel any pending auto-delete when user reopens
            if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
            if (closeCountdownRef.current) clearInterval(closeCountdownRef.current);
            setCloseCountdown(null);
            // Fetch immediately so user sees latest messages without waiting for the interval
            const tk = tokenRef.current;
            if (tk) { fetchMessages(tk); fetchNotifications(tk); }
        } else {
            // Panel just closed — start 60s countdown then wipe messages
            const tk = tokenRef.current;
            if (!tk) return;
            let secs = 60;
            setCloseCountdown(secs);
            closeCountdownRef.current = setInterval(() => {
                secs -= 1;
                setCloseCountdown(secs);
                if (secs <= 0) {
                    if (closeCountdownRef.current) clearInterval(closeCountdownRef.current);
                    setCloseCountdown(null);
                }
            }, 1000);
            closeTimerRef.current = setTimeout(async () => {
                const t = tokenRef.current;
                if (!t) return;
                await fetch("/api/support/messages?clear=true", {
                    method: "DELETE",
                    headers: { authorization: `Bearer ${t}` },
                });
                setMessages([]);
                setMode("select");
                setHasHumanAgent(false);
                setAiThinking(false);
                lastMsgCountRef.current = 0;
                prevMsgsLen.current = 0;
            }, 60000);
        }
    }, [open]); // eslint-disable-line

    // Auto-scroll when messages change
    useEffect(() => {
        if (messages.length !== prevMsgsLen.current) {
            prevMsgsLen.current = messages.length;
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
        }
    }, [messages]);

    const fetchMessages = useCallback(async (tk: string): Promise<Message[]> => {
        try {
            const res = await fetch("/api/support/messages", { headers: { authorization: `Bearer ${tk}` } });
            if (!res.ok) return [];
            const json = await res.json();
            const msgs: Message[] = json.messages || [];
            const isNew = msgs.length > lastMsgCountRef.current;
            lastMsgCountRef.current = msgs.length;
            setMessages(msgs);
            setHasHumanAgent(json.hasHumanAgent || false);
            if (isNew && !openRef.current) setUnreadMsgs(n => n + 1);
            return msgs;
        } catch { return []; }
    }, []);

    const fetchNotifications = useCallback(async (tk: string) => {
        try {
            const res = await fetch("/api/support/notifications", { headers: { authorization: `Bearer ${tk}` } });
            if (!res.ok) return;
            const json = await res.json();
            const notifs: Notification[] = json.notifications || [];
            const unread = notifs.filter(n => !n.read).length;
            setNotifications(notifs);
            setUnreadNotifs(unread);
        } catch { /* ignore */ }
    }, []);

    const init = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const uid = session.user.id;
        const tk = session.access_token;
        setUserId(uid);
        setToken(tk);

        const msgs = await fetchMessages(tk);
        // Determine mode from existing messages
        if (msgs.length > 0) {
            if (msgs.some(m => m.sender === "admin")) setMode("human");
            else setMode("ai");
        }

        await fetchNotifications(tk);

        // Typing: subscribe to shared broadcast channel
        if (typingChannelRef.current) supabase.removeChannel(typingChannelRef.current);
        typingChannelRef.current = supabase
            .channel(`chat-typing-${uid}`)
            .on("broadcast", { event: "typing" }, (ev: any) => {
                // Ignore own broadcasts (user typing) — only show admin typing
                if (ev.payload?.sender !== "admin") return;
                setAdminTyping(true);
                if (adminTypingTimer.current) clearTimeout(adminTypingTimer.current);
                adminTypingTimer.current = setTimeout(() => setAdminTyping(false), 3000);
            })
            .subscribe(() => { typingSubscribed.current = true; });

        // Poll messages every 5s — but ONLY when the panel is open
        if (msgPollRef.current) clearInterval(msgPollRef.current);
        msgPollRef.current = setInterval(() => {
            const t = tokenRef.current;
            if (t && openRef.current) fetchMessages(t);
        }, 5000);

        // Poll notifications every 30s — only when panel is open
        if (notifPollRef.current) clearInterval(notifPollRef.current);
        notifPollRef.current = setInterval(() => {
            const t = tokenRef.current;
            if (t && openRef.current) fetchNotifications(t);
        }, 30000);
    }, [fetchMessages, fetchNotifications]);

    useEffect(() => {
        init();
        return () => {
            if (msgPollRef.current) clearInterval(msgPollRef.current);
            if (notifPollRef.current) clearInterval(notifPollRef.current);
            if (typingChannelRef.current) supabase.removeChannel(typingChannelRef.current);
        };
    }, [init]);

    // Mark notifications read when switching to that tab
    useEffect(() => {
        if (!open || !token) return;
        if (tab === "notifs" && unreadNotifs > 0) {
            setUnreadNotifs(0);
            fetch("/api/support/notifications", {
                method: "PATCH",
                headers: { authorization: `Bearer ${token}` },
            });
        }
        if (tab === "chat") setUnreadMsgs(0);
    }, [open, tab]); // eslint-disable-line

    const broadcastTyping = useCallback(() => {
        if (!typingChannelRef.current || !typingSubscribed.current) return;
        typingChannelRef.current
            .send({ type: "broadcast", event: "typing", payload: { sender: "user", sid: sessionId.current } })
            .catch(() => {});
    }, []);

    const sendMessage = async (text?: string, forcedMode?: "ai" | "human") => {
        const msg = (text ?? input).trim();
        if (!msg || !userId || !token || sending) return;
        setSending(true);
        setInput("");
        setAiCanEscalate(false);

        const effectiveMode = forcedMode ?? (mode === "select" ? "ai" : mode);

        // Show AI thinking indicator BEFORE optimistic message replaces, so it appears on the left
        if (effectiveMode === "ai") setAiThinking(true);

        const optimistic: Message = {
            id: `temp-${Date.now()}`,
            sender: "user",
            message: msg,
            created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, optimistic]);

        try {
            const res = await fetch("/api/support/message", {
                method: "POST",
                headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
                body: JSON.stringify({ message: msg, mode: effectiveMode }),
            });
            const json = await res.json();
            if (json.hasHumanAgent) setHasHumanAgent(true);
            await fetchMessages(token);
        } catch {
            setMessages(prev => prev.filter(m => m.id !== optimistic.id));
        }
        setAiThinking(false);
        setSending(false);
    };

    const sendQuickQuestion = (q: typeof QUICK_QUESTIONS[0]) => {
        if (!q.message) {
            // bug + other → route to human agent
            escalateToHuman(q.key === "bug" ? "I'm experiencing a technical issue and need human support." : undefined);
            return;
        }
        setMode("ai");
        sendMessage(q.message, "ai");
    };

    const escalateToHuman = async (msg?: string) => {
        setMode("human");
        setAiCanEscalate(false);
        const text = msg || "I'd like to speak with a human agent.";
        await sendMessage(text, "human");
    };

    const deleteMessage = async (id: string) => {
        if (!token) return;
        setMessages(prev => prev.filter(m => m.id !== id));
        await fetch(`/api/support/messages?messageId=${id}`, {
            method: "DELETE",
            headers: { authorization: `Bearer ${token}` },
        });
        lastMsgCountRef.current = Math.max(0, lastMsgCountRef.current - 1);
    };

    const clearChat = async () => {
        if (!token) return;
        setMessages([]);
        setMode("select");
        setAiCanEscalate(false);
        setAiThinking(false);
        setHasHumanAgent(false);
        lastMsgCountRef.current = 0;
        prevMsgsLen.current = 0;
        setShowClearConfirm(false);
        await fetch("/api/support/messages?clear=true", {
            method: "DELETE",
            headers: { authorization: `Bearer ${token}` },
        });
    };

    const closeSession = async () => {
        setShowCloseConfirm(false);
        // Immediately clear local state
        setMessages([]);
        setMode("select");
        setAiThinking(false);
        setAiCanEscalate(false);
        setHasHumanAgent(false);
        setAdminTyping(false);
        lastMsgCountRef.current = 0;
        prevMsgsLen.current = 0;
        setOpen(false);
        // Delete all messages from DB now
        const tk = tokenRef.current;
        if (tk) {
            await fetch("/api/support/messages?clear=true", {
                method: "DELETE",
                headers: { authorization: `Bearer ${tk}` },
            });
        }
        // Cancel auto-delete timer since we already cleared
        if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
        if (closeCountdownRef.current) clearInterval(closeCountdownRef.current);
        setCloseCountdown(null);
    };

    const totalBadge = unreadMsgs + unreadNotifs;
    const notifIcon = (t: string) => ({ success: "", warning: "", error: "", message: "" }[t] ?? "ℹ");

    const msgBg = (sender: string) => {
        if (sender === "user") return "bg-indigo-600 text-white rounded-br-sm";
        if (sender === "ai") return "bg-white dark:bg-gray-800 text-neutral-800 dark:text-gray-100 border border-neutral-200 dark:border-gray-700 rounded-bl-sm";
        return "bg-green-50 dark:bg-green-900/30 text-green-900 dark:text-green-100 border border-green-200 dark:border-green-800 rounded-bl-sm";
    };

    const fileRef = useRef<HTMLInputElement>(null);
    const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !token || sending) return;
        e.target.value = "";
        setSending(true);
        const form = new FormData();
        form.append("file", file);
        try {
            const res = await fetch("/api/support/upload", {
                method: "POST",
                headers: { authorization: `Bearer ${token}` },
                body: form,
            });
            const json = await res.json();
            if (json.url) await sendMessage(json.url);
        } catch { /* ignore */ }
        setSending(false);
    };

    const renderMessage = (text: string) => {
        const trimmed = text.trim();
        if (!/^https?:\/\/.+/.test(trimmed)) return <span className="whitespace-pre-wrap">{text}</span>;
        if (/\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(trimmed))
            return <img src={trimmed} alt="attachment" className="max-w-full rounded-xl max-h-48 object-contain" />;
        const name = trimmed.split("/").pop()?.split("?")[0] || "File";
        return (
            <a href={trimmed} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 underline opacity-90 hover:opacity-100 break-all">
                <Paperclip className="w-3.5 h-3.5 shrink-0" /><span>{name}</span>
            </a>
        );
    };

    return (
        <>
            {/* FAB */}
            <button onClick={() => setOpen(o => !o)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-2xl shadow-indigo-500/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95">
                {open ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                {!open && totalBadge > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                        {totalBadge > 9 ? "9+" : totalBadge}
                    </span>
                )}
            </button>

            {/* Countdown toast when auto-delete is pending */}
            {!open && closeCountdown !== null && closeCountdown > 0 && (
                <div className="fixed bottom-24 right-6 z-50 bg-gray-900 border border-gray-700 rounded-2xl px-4 py-2.5 text-xs text-gray-300 shadow-xl flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                    Chat history deletes in <span className="font-bold text-yellow-400">{closeCountdown}s</span>
                    <button onClick={() => setOpen(true)} className="ml-1 text-indigo-400 hover:text-indigo-300 font-bold">Undo</button>
                </div>
            )}

            {open && (
                <div className="fixed bottom-24 right-6 z-50 w-[370px] flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl shadow-black/40 border border-neutral-200 dark:border-gray-700 overflow-hidden"
                    style={{ height: 540 }}>

                    {/* Header */}
                    <div className="bg-indigo-600 px-4 py-3 flex items-center gap-3 shrink-0">
                        <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                            {hasHumanAgent ? <Shield className="w-4 h-4 text-white" /> : mode === "ai" ? <Sparkles className="w-4 h-4 text-white" /> : <MessageSquare className="w-4 h-4 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white">Nexora Support</p>
                            <p className="text-[11px] text-indigo-200">
                                {hasHumanAgent ? " Human agent connected" : mode === "ai" ? " AI assistant" : mode === "human" ? " Waiting for human agent" : "Choose how to get help"}
                            </p>
                        </div>
                        <div className="flex items-center gap-1">
                            {messages.length > 0 && (
                                <>
                                    <button onClick={() => setShowCloseConfirm(true)}
                                        className="text-white/50 hover:text-red-300 transition p-1 rounded" title="End session">
                                        <PhoneOff className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => setShowClearConfirm(true)}
                                        className="text-white/50 hover:text-white transition p-1 rounded" title="Clear chat">
                                        <RotateCcw className="w-3.5 h-3.5" />
                                    </button>
                                </>
                            )}
                            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition p-1 rounded">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Close session confirmation */}
                    {showCloseConfirm && (
                        <div className="absolute inset-0 z-10 bg-black/70 flex items-center justify-center p-6">
                            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 text-center space-y-3 w-full">
                                <PhoneOff className="w-8 h-8 text-red-400 mx-auto" />
                                <p className="text-sm font-bold text-gray-200">End this chat session?</p>
                                <p className="text-xs text-gray-500">All messages in this session will be permanently deleted.</p>
                                <div className="flex gap-2 pt-1">
                                    <button onClick={() => setShowCloseConfirm(false)}
                                        className="flex-1 py-2 rounded-xl border border-gray-700 text-sm text-gray-400 hover:text-gray-200 hover:border-gray-500 transition">Cancel</button>
                                    <button onClick={closeSession}
                                        className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition">End Session</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Clear confirmation */}
                    {showClearConfirm && (
                        <div className="absolute inset-0 z-10 bg-black/60 flex items-center justify-center p-6">
                            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 text-center space-y-3 w-full">
                                <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto" />
                                <p className="text-sm font-bold text-gray-200">Clear entire chat?</p>
                                <p className="text-xs text-gray-500">All messages will be deleted permanently.</p>
                                <div className="flex gap-2 pt-1">
                                    <button onClick={() => setShowClearConfirm(false)}
                                        className="flex-1 py-2 rounded-xl border border-gray-700 text-sm text-gray-400 hover:text-gray-200 hover:border-gray-500 transition">Cancel</button>
                                    <button onClick={clearChat}
                                        className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition">Clear</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="flex border-b border-neutral-200 dark:border-gray-700 shrink-0">
                        <button onClick={() => { setTab("chat"); setUnreadMsgs(0); }}
                            className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition ${tab === "chat" ? "text-indigo-600 dark:text-indigo-400 border-indigo-500 bg-white dark:bg-gray-900" : "text-neutral-400 border-transparent bg-neutral-50 dark:bg-gray-950 hover:text-neutral-600"}`}>
                            <MessageSquare className="w-3.5 h-3.5" /> Chat
                            {unreadMsgs > 0 && <span className="bg-red-500 text-white text-[9px] font-black px-1.5 rounded-full">{unreadMsgs}</span>}
                        </button>
                        <button onClick={() => setTab("notifs")}
                            className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition ${tab === "notifs" ? "text-indigo-600 dark:text-indigo-400 border-indigo-500 bg-white dark:bg-gray-900" : "text-neutral-400 border-transparent bg-neutral-50 dark:bg-gray-950 hover:text-neutral-600"}`}>
                            <Bell className="w-3.5 h-3.5" /> Notifications
                            {unreadNotifs > 0 && <span className="bg-red-500 text-white text-[9px] font-black px-1.5 rounded-full">{unreadNotifs}</span>}
                        </button>
                    </div>

                    {/* CHAT TAB */}
                    {tab === "chat" && (
                        <div className="flex flex-col flex-1 min-h-0">
                            {/* Mode selector  shown only when no messages yet */}
                            {mode === "select" && messages.length === 0 && (
                                <div className="flex-1 overflow-y-auto p-4 bg-neutral-50 dark:bg-gray-950 space-y-4">
                                    <div>
                                        <p className="text-xs font-bold text-neutral-500 dark:text-gray-500 uppercase tracking-wider mb-3">How can we help?</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button onClick={() => setMode("ai")}
                                                className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-neutral-200 dark:border-gray-700 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition text-center group">
                                                <Sparkles className="w-6 h-6 text-indigo-500" />
                                                <div>
                                                    <p className="text-xs font-bold text-neutral-700 dark:text-gray-200">AI Assistant</p>
                                                    <p className="text-[10px] text-neutral-400 mt-0.5">Instant answers</p>
                                                </div>
                                            </button>
                                            <button onClick={() => escalateToHuman("Hi, I need help from a human agent.")}
                                                className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-neutral-200 dark:border-gray-700 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition text-center group">
                                                <Headphones className="w-6 h-6 text-green-500" />
                                                <div>
                                                    <p className="text-xs font-bold text-neutral-700 dark:text-gray-200">Human Agent</p>
                                                    <p className="text-[10px] text-neutral-400 mt-0.5">Reply in hours</p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold text-neutral-500 dark:text-gray-500 uppercase tracking-wider mb-2">Quick questions</p>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            {QUICK_QUESTIONS.map(q => (
                                                <button key={q.key} onClick={() => sendQuickQuestion(q)}
                                                    className="text-left text-xs px-3 py-2 rounded-xl border border-neutral-200 dark:border-gray-700 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-neutral-600 dark:text-gray-300 transition font-medium flex items-center gap-1.5">
                                                    <span>{q.icon}</span>
                                                    <span>{q.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Messages */}
                            {(mode !== "select" || messages.length > 0) && (
                                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50 dark:bg-gray-950 min-h-0">
                                    {messages.map(m => (
                                        <div key={m.id}
                                            className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                                            onMouseEnter={() => m.sender === "user" ? setHoveredMsg(m.id) : undefined}
                                            onMouseLeave={() => setHoveredMsg(null)}>
                                            <div className={`flex items-center gap-1 mb-0.5 text-[10px] font-bold ${m.sender === "user" ? "flex-row-reverse text-neutral-400" : "text-neutral-500 dark:text-gray-500"}`}>
                                                {m.sender === "user" ? <User className="w-3 h-3" /> : m.sender === "ai" ? <Bot className="w-3 h-3 text-indigo-500" /> : <Shield className="w-3 h-3 text-green-500" />}
                                                <span>{m.sender === "ai" ? "Nexora AI" : m.sender === "admin" ? "Support Team" : "You"}</span>
                                                <span className="opacity-50">{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                            </div>
                                            <div className={`w-full flex items-end gap-1.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                                                {m.sender === "user" && hoveredMsg === m.id && !m.id.startsWith("temp-") && (
                                                    <button onClick={() => deleteMessage(m.id)}
                                                        className="text-neutral-400 hover:text-red-400 transition shrink-0 mb-0.5">
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                )}
                                                <div className={`max-w-[82%] px-3 py-2 rounded-2xl text-sm leading-relaxed break-words ${m.id.startsWith("temp-") ? "opacity-60 " : ""}${msgBg(m.sender)}`}>
                                                    {renderMessage(m.message)}
                                                </div>
                                            </div>
                                            {/* Connect to Support button below every AI message */}
                                            {m.sender === "ai" && !hasHumanAgent && mode !== "human" && (
                                                <button onClick={() => escalateToHuman()}
                                                    className="mt-1.5 ml-0.5 flex items-center gap-1 text-[10px] text-neutral-400 dark:text-gray-500 hover:text-green-500 dark:hover:text-green-400 transition font-medium">
                                                    <Headphones className="w-3 h-3" /> Connect to human support
                                                </button>
                                            )}
                                        </div>
                                    ))}

                                    {/* AI thinking (while waiting for NVIDIA response) */}
                                    {aiThinking && (
                                        <div className="flex items-center gap-2">
                                            <Bot className="w-4 h-4 text-indigo-500" />
                                            <div className="bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-2xl rounded-bl-sm px-3 py-2 flex gap-1">
                                                {[0, 150, 300].map(d => <span key={d} className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                                            </div>
                                            <span className="text-[10px] text-neutral-400">Nexora AI thinking…</span>
                                        </div>
                                    )}

                                    {/* Admin/human agent typing */}
                                    {adminTyping && !aiThinking && (
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-green-500" />
                                            <div className="bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-2xl rounded-bl-sm px-3 py-2 flex gap-1">
                                                {[0, 150, 300].map(d => <span key={d} className="w-1.5 h-1.5 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                                            </div>
                                            <span className="text-[10px] text-neutral-400">Support typing…</span>
                                        </div>
                                    )}
                                    <div ref={bottomRef} />
                                </div>
                            )}

                            {/* Input  only when mode is set */}
                            {mode !== "select" && (
                                <div className={`p-3 border-t shrink-0 ${hasHumanAgent ? "border-green-800/40 dark:border-green-800/40 bg-green-950/20" : "border-neutral-200 dark:border-gray-800 bg-white dark:bg-gray-900"}`}>
                                    {!hasHumanAgent && mode === "human" && (
                                        <p className="text-[10px] text-yellow-400 font-semibold mb-1.5 px-1"> Your message will be delivered to support team</p>
                                    )}
                                    {hasHumanAgent && (
                                        <p className="text-[10px] text-green-400 font-semibold mb-1.5 px-1"> Human agent connected  reply below</p>
                                    )}
                                    <div className="flex gap-2">
                                        <input type="file" ref={fileRef} onChange={handleFilePick} className="hidden"
                                            accept="image/*,application/pdf,.doc,.docx,.txt" />
                                        <button type="button" onClick={() => fileRef.current?.click()} disabled={sending}
                                            className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-neutral-400 dark:text-gray-500 hover:text-neutral-700 dark:hover:text-gray-300 hover:bg-neutral-100 dark:hover:bg-gray-800 border border-neutral-200 dark:border-gray-700 transition disabled:opacity-40">
                                            <Paperclip className="w-4 h-4" />
                                        </button>
                                        <input
                                            value={input}
                                            onChange={e => { setInput(e.target.value); broadcastTyping(); }}
                                            onFocus={broadcastTyping}
                                            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                                            placeholder={mode === "ai" ? "Ask AI anything" : "Type your message"}
                                            disabled={sending}
                                            className="flex-1 bg-neutral-100 dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-neutral-800 dark:text-gray-200 placeholder-neutral-400 focus:outline-none focus:border-indigo-400 transition min-w-0"
                                        />
                                        <button onClick={() => sendMessage()} disabled={!input.trim() || sending}
                                            className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-white transition disabled:opacity-40 ${hasHumanAgent || mode === "human" ? "bg-green-600 hover:bg-green-500" : "bg-indigo-600 hover:bg-indigo-500"}`}>
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* NOTIFICATIONS TAB */}
                    {tab === "notifs" && (
                        <div className="flex-1 overflow-y-auto bg-neutral-50 dark:bg-gray-950 min-h-0">
                            {notifications.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full gap-2 text-neutral-400 dark:text-gray-600">
                                    <Bell className="w-10 h-10 opacity-25" />
                                    <p className="text-sm font-semibold">No notifications yet</p>
                                    <p className="text-xs opacity-60">Replies and updates appear here</p>
                                </div>
                            )}
                            {notifications.map(n => (
                                <div key={n.id} className={`px-4 py-3 border-b border-neutral-200 dark:border-gray-800 ${!n.read ? "bg-indigo-50 dark:bg-indigo-900/10" : ""}`}>
                                    <div className="flex items-start gap-2.5">
                                        <span className="text-base shrink-0 mt-0.5">{notifIcon(n.type)}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-neutral-800 dark:text-gray-200">{n.title}</p>
                                            {n.body && <p className="text-xs text-neutral-500 dark:text-gray-400 mt-0.5">{n.body}</p>}
                                            <p className="text-[10px] text-neutral-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                                        </div>
                                        {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
