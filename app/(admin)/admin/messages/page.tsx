"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Send, Users, MessageSquare, Search, Shield, User, Bot, Trash2, RotateCcw, AlertTriangle, Paperclip, PhoneOff, Crown } from "lucide-react";

interface Conversation {
    user_id: string;
    email: string;
    display_name: string;
    full_name: string;
    is_paid: boolean;
    role: string;
    last_message: string;
    last_at: string;
    unread: number;
}

interface Thread {
    id: string;
    sender: "user" | "admin" | "ai";
    message: string;
    created_at: string;
}

export default function AdminMessagesPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selected, setSelected] = useState<string | null>(null);
    const [messages, setMessages] = useState<Thread[]>([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [search, setSearch] = useState("");
    const [adminTyping, setAdminTyping] = useState(false);
    const [userTyping, setUserTyping] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [hoveredMsg, setHoveredMsg] = useState<string | null>(null);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [showEndConfirm, setShowEndConfirm] = useState(false);
    const [endingSession, setEndingSession] = useState(false);

    const typingChannelRef = useRef<any>(null);
    const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const adminTypingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const convPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const threadPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const tokenRef = useRef<string | null>(null);
    const selectedRef = useRef<string | null>(null);
    const prevMsgsLen = useRef(0);

    useEffect(() => { tokenRef.current = token; }, [token]);
    useEffect(() => { selectedRef.current = selected; }, [selected]);

    // Auto-scroll when messages change
    useEffect(() => {
        if (messages.length !== prevMsgsLen.current) {
            prevMsgsLen.current = messages.length;
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
        }
    }, [messages]);

    const loadConversations = useCallback(async (tk: string) => {
        try {
            const res = await fetch("/api/admin/messages?type=conversations", {
                headers: { authorization: `Bearer ${tk}` },
            });
            if (!res.ok) return;
            const json = await res.json();
            setConversations(json.conversations || []);
        } catch { /* ignore */ }
    }, []);

    const loadThread = useCallback(async (tk: string, uid: string) => {
        try {
            const res = await fetch(`/api/admin/messages?type=thread&userId=${uid}`, {
                headers: { authorization: `Bearer ${tk}` },
            });
            if (!res.ok) return;
            const json = await res.json();
            setMessages(json.messages || []);
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        (async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const tk = session.access_token;
            setToken(tk);
            await loadConversations(tk);

            // Poll conversations every 5s
            convPollRef.current = setInterval(() => {
                const t = tokenRef.current;
                if (t) loadConversations(t);
            }, 5000);
        })();

        return () => {
            if (convPollRef.current) clearInterval(convPollRef.current);
            if (threadPollRef.current) clearInterval(threadPollRef.current);
            if (typingChannelRef.current) supabase.removeChannel(typingChannelRef.current);
        };
    }, [loadConversations]);

    const selectUser = useCallback((uid: string) => {
        if (uid === selectedRef.current) return;
        setSelected(uid);
        setMessages([]);
        prevMsgsLen.current = 0;
        setUserTyping(false);
        setInput("");
        setShowClearConfirm(false);

        // Cleanup previous typing channel
        if (typingChannelRef.current) supabase.removeChannel(typingChannelRef.current);
        if (threadPollRef.current) clearInterval(threadPollRef.current);

        const tk = tokenRef.current;
        if (!tk) return;

        // Subscribe to this user's typing channel
        typingChannelRef.current = supabase
            .channel(`chat-typing-${uid}`)
            .on("broadcast", { event: "typing" }, (ev: any) => {
                if (ev.payload?.sender !== "user") return;
                setUserTyping(true);
                if (typingTimer.current) clearTimeout(typingTimer.current);
                typingTimer.current = setTimeout(() => setUserTyping(false), 3000);
            })
            .subscribe();

        loadThread(tk, uid);
        threadPollRef.current = setInterval(() => {
            const t = tokenRef.current;
            const s = selectedRef.current;
            if (t && s) loadThread(t, s);
        }, 3000);
    }, [loadThread]);

    const broadcastTyping = () => {
        if (!typingChannelRef.current || !selected) return;
        // Only broadcast on SELECTED user's channel to avoid cross-contamination
        typingChannelRef.current
            .send({ type: "broadcast", event: "typing", payload: { sender: "admin" } })
            .catch(() => {});
        // Clear admin's own typing UI indicator (not needed here since admin sees their own input)
    };

    const sendMessage = async () => {
        const msg = input.trim();
        if (!msg || !selected || !token || sending) return;
        setSending(true);
        setInput("");

        const optimistic: Thread = {
            id: `temp-${Date.now()}`,
            sender: "admin",
            message: msg,
            created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, optimistic]);

        try {
            await fetch("/api/admin/messages", {
                method: "POST",
                headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
                body: JSON.stringify({ userId: selected, message: msg }),
            });
            await loadThread(token, selected);
            await loadConversations(token);
        } catch {
            setMessages(prev => prev.filter(m => m.id !== optimistic.id));
        }
        setSending(false);
    };

    const deleteMessage = async (id: string) => {
        if (!token) return;
        setMessages(prev => prev.filter(m => m.id !== id));
        await fetch(`/api/admin/messages?messageId=${id}`, {
            method: "DELETE",
            headers: { authorization: `Bearer ${token}` },
        });
    };

    const clearChat = async () => {
        if (!token || !selected) return;
        setMessages([]);
        prevMsgsLen.current = 0;
        setShowClearConfirm(false);
        await fetch(`/api/admin/messages?userId=${selected}&clear=true`, {
            method: "DELETE",
            headers: { authorization: `Bearer ${token}` },
        });
        await loadConversations(token);
    };

    const endSession = async () => {
        if (!token || !selected) return;
        setEndingSession(true);
        // Wipe all messages for this user
        await fetch(`/api/admin/messages?userId=${selected}&clear=true`, {
            method: "DELETE",
            headers: { authorization: `Bearer ${token}` },
        });
        setMessages([]);
        prevMsgsLen.current = 0;
        setShowEndConfirm(false);
        setSelected(null);
        // Stop thread polling
        if (threadPollRef.current) clearInterval(threadPollRef.current);
        if (typingChannelRef.current) supabase.removeChannel(typingChannelRef.current);
        await loadConversations(token);
        setEndingSession(false);
    };

    const filtered = conversations.filter(c =>
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        (c.full_name || "").toLowerCase().includes(search.toLowerCase())
    );

    const selectedConv = conversations.find(c => c.user_id === selected);

    const msgBubble = (sender: string) => {
        if (sender === "admin") return "bg-indigo-600 text-white rounded-br-sm";
        if (sender === "ai") return "bg-gray-800 text-gray-100 border border-gray-700 rounded-bl-sm";
        return "bg-gray-700 text-gray-100 rounded-bl-sm";
    };

    const fileRef = useRef<HTMLInputElement>(null);
    const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!token || !selected || sending) return;
        const file = e.target.files?.[0];
        if (!file) return;
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
            if (json.url) {
                const optimistic: Thread = { id: `temp-${Date.now()}`, sender: "admin", message: json.url, created_at: new Date().toISOString() };
                setMessages(prev => [...prev, optimistic]);
                await fetch("/api/admin/messages", {
                    method: "POST",
                    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
                    body: JSON.stringify({ userId: selected, message: json.url }),
                });
                await loadThread(token, selected);
                await loadConversations(token);
            }
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
        <div className="flex h-full bg-gray-950">
            {/* Sidebar */}
            <aside className="w-72 border-r border-gray-800 flex flex-col h-full shrink-0">
                <div className="p-4 border-b border-gray-800">
                    <h2 className="text-base font-bold text-gray-200 flex items-center gap-2 mb-3">
                        <MessageSquare className="w-4 h-4 text-indigo-400" /> Support Chats
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users"
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-8 pr-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {filtered.length === 0 && (
                        <p className="text-center text-gray-600 text-sm py-10">No conversations</p>
                    )}
                    {filtered.map(c => (
                        <button key={c.user_id} onClick={() => selectUser(c.user_id)}
                            className={`w-full text-left px-4 py-3 border-b border-gray-800 transition hover:bg-gray-900 ${selected === c.user_id ? "bg-indigo-900/40 border-l-2 border-l-indigo-500" : ""}`}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0 relative">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    {c.is_paid && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                                            <Crown className="w-2.5 h-2.5 text-white" />
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-1">
                                        <p className="text-sm font-bold text-gray-200 truncate">{c.full_name || c.email}</p>
                                        <div className="flex items-center gap-1 shrink-0">
                                            {c.is_paid
                                                ? <span className="text-[9px] font-black bg-amber-500/20 text-amber-400 px-1.5 rounded-full">PRO</span>
                                                : <span className="text-[9px] font-black bg-gray-700 text-gray-500 px-1.5 rounded-full">FREE</span>
                                            }
                                            {c.unread > 0 && <span className="bg-indigo-500 text-white text-[9px] font-black px-1.5 rounded-full">{c.unread}</span>}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">{c.last_message || "No messages"}</p>
                                    <p className="text-[10px] text-gray-600 mt-0.5">{c.last_at ? new Date(c.last_at).toLocaleString() : ""}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </aside>

            {/* Thread */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {!selected ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-600">
                        <MessageSquare className="w-12 h-12 opacity-20" />
                        <p className="text-sm font-semibold">Select a conversation</p>
                    </div>
                ) : (
                    <>
                        {/* Thread header */}
                        <div className="px-5 py-3 border-b border-gray-800 flex items-center gap-3 shrink-0 bg-gray-900">
                            <div className="w-8 h-8 rounded-full bg-indigo-900 flex items-center justify-center shrink-0 relative">
                                <User className="w-4 h-4 text-indigo-300" />
                                {selectedConv?.is_paid && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                                        <Crown className="w-2.5 h-2.5 text-white" />
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-gray-200 truncate">{selectedConv?.full_name || selectedConv?.email || selected}</p>
                                    {selectedConv?.is_paid
                                        ? <span className="text-[9px] font-black bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full shrink-0">PRO</span>
                                        : <span className="text-[9px] font-black bg-gray-700 text-gray-500 px-1.5 py-0.5 rounded-full shrink-0">FREE</span>
                                    }
                                </div>
                                <p className="text-[10px] text-gray-500 truncate">{selectedConv?.email}</p>
                                {userTyping && <p className="text-xs text-indigo-400 animate-pulse">User is typing…</p>}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button onClick={() => setShowEndConfirm(true)} disabled={endingSession}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-900/30 hover:bg-red-900/60 border border-red-800/50 hover:border-red-600 text-red-400 hover:text-red-300 text-xs font-bold transition disabled:opacity-40" title="End session">
                                    <PhoneOff className="w-3.5 h-3.5" />
                                    End session
                                </button>
                                <button onClick={() => setShowClearConfirm(true)}
                                    className="text-gray-500 hover:text-yellow-400 transition p-1.5 rounded-lg hover:bg-yellow-900/20" title="Clear messages">
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* End session confirm overlay */}
                        {showEndConfirm && (
                            <div className="absolute inset-0 z-20 bg-black/80 flex items-center justify-center p-8">
                                <div className="bg-gray-900 border border-red-800/60 rounded-2xl p-6 text-center space-y-3 max-w-xs w-full">
                                    <PhoneOff className="w-10 h-10 text-red-400 mx-auto" />
                                    <p className="text-base font-black text-gray-100">End this session?</p>
                                    <p className="text-xs text-gray-400">All messages in this conversation will be <span className="text-red-400 font-bold">permanently deleted</span> for both sides.</p>
                                    <div className="flex gap-2 pt-2">
                                        <button onClick={() => setShowEndConfirm(false)}
                                            className="flex-1 py-2 rounded-xl border border-gray-700 text-sm text-gray-400 hover:text-gray-200 transition">Cancel</button>
                                        <button onClick={endSession} disabled={endingSession}
                                            className="flex-1 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white text-sm font-black transition disabled:opacity-50">
                                            {endingSession ? "Ending…" : "End Session"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Clear confirm overlay */}
                        {showClearConfirm && (
                            <div className="absolute inset-0 z-20 bg-black/70 flex items-center justify-center p-8">
                                <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 text-center space-y-3 max-w-xs w-full">
                                    <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto" />
                                    <p className="text-sm font-bold text-gray-200">Clear entire chat?</p>
                                    <p className="text-xs text-gray-500">All messages in this thread will be deleted.</p>
                                    <div className="flex gap-2 pt-1">
                                        <button onClick={() => setShowClearConfirm(false)}
                                            className="flex-1 py-2 rounded-xl border border-gray-700 text-sm text-gray-400 hover:text-gray-200 transition">Cancel</button>
                                        <button onClick={clearChat}
                                            className="flex-1 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white text-sm font-bold transition">Clear</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-0 bg-gray-950">
                            {messages.length === 0 && (
                                <p className="text-center text-gray-700 text-sm py-10">No messages in this conversation</p>
                            )}
                            {messages.map(m => (
                                <div key={m.id}
                                    className={`flex flex-col ${m.sender === "admin" ? "items-end" : "items-start"}`}
                                    onMouseEnter={() => setHoveredMsg(m.id)}
                                    onMouseLeave={() => setHoveredMsg(null)}>
                                    <div className={`flex items-center gap-1 mb-0.5 text-[10px] font-bold ${m.sender === "admin" ? "flex-row-reverse text-gray-500" : "text-gray-500"}`}>
                                        {m.sender === "admin" ? <Shield className="w-3 h-3 text-indigo-400" /> : m.sender === "ai" ? <Bot className="w-3 h-3 text-purple-400" /> : <User className="w-3 h-3 text-gray-400" />}
                                        <span>{m.sender === "admin" ? "You (Admin)" : m.sender === "ai" ? "Nexora AI" : "User"}</span>
                                        <span className="opacity-50">{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                    </div>
                                    <div className={`w-full flex items-end gap-1.5 ${m.sender === "admin" ? "justify-end" : "justify-start"}`}>
                                        {hoveredMsg === m.id && !m.id.startsWith("temp-") && (
                                            <button onClick={() => deleteMessage(m.id)}
                                                className={`text-gray-600 hover:text-red-400 transition shrink-0 mb-0.5 ${m.sender === "admin" ? "order-first" : "order-last"}`}>
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        )}
                                        <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${m.id.startsWith("temp-") ? "opacity-60 " : ""}${msgBubble(m.sender)}`}>
                                            {renderMessage(m.message)}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Typing indicator */}
                            {userTyping && (
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-500" />
                                    <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-bl-sm px-3 py-2 flex gap-1">
                                        {[0, 150, 300].map(d => <span key={d} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Reply input */}
                        <div className="p-4 border-t border-gray-800 bg-gray-900 shrink-0">
                            <div className="flex gap-2">
                                <input type="file" ref={fileRef} onChange={handleFilePick} className="hidden"
                                    accept="image/*,application/pdf,.doc,.docx,.txt" />
                                <button type="button" onClick={() => fileRef.current?.click()} disabled={sending}
                                    className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-gray-800 border border-gray-700 transition disabled:opacity-40">
                                    <Paperclip className="w-4 h-4" />
                                </button>
                                <input
                                    value={input}
                                    onChange={e => { setInput(e.target.value); broadcastTyping(); }}
                                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                                    placeholder="Reply as Support Team…"
                                    disabled={sending}
                                    className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition min-w-0"
                                />
                                <button onClick={sendMessage} disabled={!input.trim() || sending}
                                    className="w-10 h-10 shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition disabled:opacity-40">
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
