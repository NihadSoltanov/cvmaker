"use client";

import { useState, useEffect } from "react";
import { Briefcase, ExternalLink, Search, Lock, MapPin, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useIsPaid } from "@/lib/useIsPaid";
import { GuideButton } from "@/components/GuideButton";

const PLATFORMS = [
    { name: "LinkedIn Jobs", icon: "💼", color: "bg-blue-600 hover:bg-blue-700", buildUrl: (q: string, loc: string) => `https://www.linkedin.com/jobs/search/?keywords=${q}&location=${loc}` },
    { name: "Indeed", icon: "🔍", color: "bg-purple-600 hover:bg-purple-700", buildUrl: (q: string, loc: string) => `https://www.indeed.com/jobs?q=${q}&l=${loc}` },
    { name: "Glassdoor", icon: "🏢", color: "bg-green-600 hover:bg-green-700", buildUrl: (q: string, loc: string) => `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${q}&locT=C&locId=0` },
    { name: "Adzuna", icon: "📋", color: "bg-orange-500 hover:bg-orange-600", buildUrl: (q: string, loc: string) => `https://www.adzuna.com/search?q=${q}&where=${loc}` },
    { name: "We Work Remotely", icon: "🌍", color: "bg-teal-600 hover:bg-teal-700", buildUrl: (q: string) => `https://weworkremotely.com/remote-jobs/search?term=${q}` },
    { name: "Remote OK", icon: "🏠", color: "bg-gray-700 hover:bg-gray-800", buildUrl: (q: string) => `https://remoteok.com/remote-${encodeURIComponent(q.toLowerCase().replace(/\s+/g, "-"))}-jobs` },
];

const FREE_LIMIT = 3; // searches per day

export default function FindJobsPage() {
    const [role, setRole] = useState("");
    const [location, setLocation] = useState("");
    const [skills, setSkills] = useState<string[]>([]);
    const [searchCount, setSearchCount] = useState(0);
    const { isPaid } = useIsPaid();

    // Load user's skills from their saved CV
    useEffect(() => {
        const loadProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data } = await supabase.from("resumes").select("resume_json").eq("user_id", user.id).maybeSingle();
            if (data?.resume_json) {
                const rj = data.resume_json;
                // Filter out garbage/placeholder skills
                const isRealSkill = (s: string) => {
                    const l = s.toLowerCase().trim();
                    if (l.length < 2) return false;
                    if (/^[xcvbnmasdfghjklqwertyuiop]+$/i.test(l) && l.length < 8) return false;
                    if (/^(test|asdf|qwerty|lorem|xxx|placeholder|sample)/i.test(l)) return false;
                    return true;
                };
                if (Array.isArray(rj.skills)) {
                    const clean = rj.skills.filter(isRealSkill);
                    if (clean.length > 0) setSkills(clean.slice(0, 8));
                }
                if (rj.experience?.[0]?.role) setRole(rj.experience[0].role);
                if (rj.basicInfo?.location) setLocation(rj.basicInfo.location);
            }

        };
        loadProfile();
        // Load daily search count from localStorage
        const today = new Date().toISOString().slice(0, 10);
        const stored = localStorage.getItem("job_search_count");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed.date === today) setSearchCount(parsed.count);
            } catch { /* ignore */ }
        }
    }, []);

    const handleSearch = (url: string) => {
        if (!isPaid) {
            const today = new Date().toISOString().slice(0, 10);
            if (searchCount >= FREE_LIMIT) return;
            const newCount = searchCount + 1;
            setSearchCount(newCount);
            localStorage.setItem("job_search_count", JSON.stringify({ date: today, count: newCount }));
        }
        window.open(url, "_blank");
    };

    const q = encodeURIComponent(`${role} ${skills.slice(0, 3).join(" ")}`);
    const loc = encodeURIComponent(location);
    const reachedLimit = !isPaid && searchCount >= FREE_LIMIT;

    return (
        <div className="space-y-8 relative z-10 pb-20">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-teal-500/10 text-teal-500 rounded-2xl flex items-center justify-center shadow-inner">
                        <Search className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
                            Find Jobs
                            {!isPaid && <span className="text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">Free: {FREE_LIMIT - searchCount} left today</span>}
                        </h1>
                        <p className="text-neutral-500 dark:text-neutral-400 font-medium text-sm">Search 6 job platforms with your role, location, and top skills auto-filled from your CV.</p>
                    </div>
                </div>
                <GuideButton guide={{
                    title: "Find Jobs — How to Use",
                    steps: [
                        "Your role and location are auto-filled from your saved CV.",
                        "Edit the Role and Location fields to refine your search.",
                        "Click any platform button to open their job search in a new tab.",
                        "Free users get 3 searches per day. Upgrade to Pro for unlimited.",
                    ],
                    tips: [
                        "Use LinkedIn Jobs for the most relevant results — log in first.",
                        "Set filters like 'Posted in last week' and 'Experience Level' for better matches.",
                        "For remote roles, try We Work Remotely or RemoteOK.",
                    ]
                }} />
            </div>

            {/* Search filters */}
            <div className="bg-white/60 dark:bg-black/40 backdrop-blur-2xl border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-xl">
                <div className="grid sm:grid-cols-2 gap-5 mb-5">
                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-2 block flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5" /> Job Title / Role
                        </label>
                        <input value={role} onChange={e => setRole(e.target.value)}
                            placeholder="e.g. Frontend Developer"
                            className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-2xl px-4 py-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-indigo-400 transition" />
                    </div>
                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-2 block flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" /> Location
                        </label>
                        <input value={location} onChange={e => setLocation(e.target.value)}
                            placeholder="e.g. Vilnius, Lithuania"
                            className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-2xl px-4 py-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-indigo-400 transition" />
                    </div>
                </div>

                {/* Skills tags */}
                {skills.length > 0 && (
                    <div className="mb-5">
                        <p className="text-xs font-bold text-neutral-400 mb-2">Skills from your CV (included in search):</p>
                        <div className="flex flex-wrap gap-2">
                            {skills.map((sk, i) => (
                                <span key={i} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-full border border-indigo-200 dark:border-indigo-800">
                                    {sk}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Platform grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {PLATFORMS.map(p => {
                        const url = p.buildUrl(q, loc);
                        return (
                            <button key={p.name}
                                onClick={() => handleSearch(url)}
                                disabled={reachedLimit}
                                className={`relative flex items-center gap-3 px-5 py-4 ${p.color} text-white rounded-2xl font-bold text-sm transition shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed text-left`}>
                                <span className="text-2xl">{p.icon}</span>
                                <div>
                                    <p className="font-black text-base">{p.name}</p>
                                    <p className="text-xs opacity-75 font-normal">Open and apply</p>
                                </div>
                                <ExternalLink className="w-4 h-4 ml-auto opacity-60" />
                                {reachedLimit && (
                                    <div className="absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center">
                                        <div className="flex items-center gap-2 text-white text-xs font-bold">
                                            <Lock className="w-4 h-4" /> Upgrade to Pro
                                        </div>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {reachedLimit && (
                    <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl text-sm text-amber-800 dark:text-amber-300 flex items-center gap-3">
                        <Lock className="w-5 h-5 flex-shrink-0" />
                        <div>
                            <strong>Daily limit reached.</strong> Free plan allows {FREE_LIMIT} job searches per day.
                            <a href="/settings" className="ml-2 underline font-bold">Upgrade to Pro →</a>
                        </div>
                    </div>
                )}
            </div>

            {/* Tips */}
            <div className="bg-white/60 dark:bg-black/40 backdrop-blur-2xl border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-neutral-500 mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" /> Job Search Tips
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                    {[
                        { tip: "Set LinkedIn to 'Open to Work'", desc: "Recruiters are 2x more likely to message you.", link: "https://www.linkedin.com/help/linkedin/answer/a507508" },
                        { tip: "Apply within the first 24 hours", desc: "Early applicants are 3x more likely to get called.", link: "https://www.linkedin.com/pulse/how-early-applicants-get-edge-landing-interviews/" },
                        { tip: "Use the same keywords in your CV", desc: "ATS filters by exact keyword match — use the JD's words.", link: "https://www.jobscan.co/blog/ats-resume/" },
                        { tip: "Follow up after 5 business days", desc: "A polite follow-up email doubles your interview chances.", link: "https://hbr.org/2020/11/how-to-follow-up-on-a-job-application" },
                    ].map((t, i) => (
                        <a key={i} href={t.link} target="_blank" rel="noopener noreferrer"
                            className="p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl hover:border-indigo-400 transition group">
                            <p className="font-bold text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition text-sm">{t.tip}</p>
                            <p className="text-xs text-neutral-500 mt-1">{t.desc}</p>
                            <p className="text-xs text-indigo-500 font-bold mt-2 flex items-center gap-1">Read more <ExternalLink className="w-3 h-3" /></p>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
