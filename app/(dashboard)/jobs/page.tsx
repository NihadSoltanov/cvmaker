"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Briefcase, ExternalLink, Search, Lock, MapPin, Sparkles,
    ChevronDown, ChevronUp, Copy, Check, Zap, Globe, Building2,
    Clock, Wifi, AlertCircle, Loader2, Crown
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useIsPaid } from "@/lib/useIsPaid";
import { GuideButton } from "@/components/GuideButton";

const FREE_DAILY_SEARCHES = 3;
const FREE_VISIBLE_JOBS = 5;

interface Job {
    job_id: string;
    job_title: string;
    employer_name: string;
    employer_logo?: string;
    job_city?: string;
    job_posted_at_datetime_utc?: string;
    job_apply_link?: string;
    job_is_remote?: boolean;
}

function timeAgo(dateStr?: string): string {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
}

function CopyBtn({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button
            onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
        >
            {copied ? <><Check className="w-3.5 h-3.5 text-green-500" />Copied!</> : <><Copy className="w-3.5 h-3.5" />Copy JD</>}
        </button>
    );
}

function JobCard({ job, locked }: { job: Job; locked: boolean }) {
    const [expanded, setExpanded] = useState(false);
    const posted = timeAgo(job.job_posted_at_datetime_utc);

    return (
        <div className={`relative bg-white/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 shadow-lg transition group ${!locked ? "hover:border-indigo-400 dark:hover:border-indigo-500" : ""}`}>
            {/* Blur overlay for locked cards */}
            {locked && (
                <div className="absolute inset-0 rounded-3xl z-10 backdrop-blur-sm bg-black/40 flex flex-col items-center justify-center gap-3">
                    <Crown className="w-6 h-6 text-amber-400" />
                    <p className="text-sm font-black text-white text-center">Upgrade to Pro to see all jobs</p>
                    <Link href="/settings"
                        className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full shadow hover:from-amber-600 hover:to-orange-600 transition">
                        <Crown className="w-3.5 h-3.5" /> Upgrade Now
                    </Link>
                </div>
            )}

            {/* Header */}
            <div className="flex items-start gap-4 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {job.employer_logo ? (
                        <img src={job.employer_logo} alt={job.employer_name} className="w-10 h-10 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                        <Building2 className="w-6 h-6 text-neutral-400" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-black text-neutral-900 dark:text-white text-base leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition line-clamp-2">
                        {job.job_title}
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium truncate">{job.employer_name}</p>
                </div>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-2 mb-4">
                {(job.job_city || job.job_is_remote) && (
                    <span className="flex items-center gap-1 text-xs px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full font-medium">
                        {job.job_is_remote ? <Wifi className="w-3 h-3 text-green-500" /> : <MapPin className="w-3 h-3" />}
                        {job.job_is_remote && !job.job_city ? "Remote" : job.job_city}
                    </span>
                )}
                {posted && (
                    <span className="flex items-center gap-1 text-xs px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-500 rounded-full">
                        <Clock className="w-3 h-3" />{posted}
                    </span>
                )}
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-2">
                {job.job_apply_link && (
                    <a href={job.job_apply_link} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition shadow-sm">
                        <ExternalLink className="w-3.5 h-3.5" /> View on LinkedIn
                    </a>
                )}
                <Link href="/optimize"
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-full transition shadow-sm">
                    <Zap className="w-3.5 h-3.5" /> Optimize CV
                </Link>
                <button onClick={() => setExpanded(v => !v)}
                    className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition">
                    About Job {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
            </div>

            {/* Expanded */}
            {expanded && (
                <div className="mt-4 border-t border-neutral-200 dark:border-neutral-700 pt-4">
                    <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border border-violet-200 dark:border-violet-700/40 rounded-2xl">
                        <Zap className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-violet-800 dark:text-violet-300 mb-1">Optimize your CV for this job</p>
                            <p className="text-xs text-violet-600 dark:text-violet-400 mb-2">
                                Open the job on LinkedIn, copy the full description from the &ldquo;About the job&rdquo; section, then paste it into <strong>Optimize</strong> to generate a tailored CV.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {job.job_apply_link && <CopyBtn text={job.job_apply_link} />}
                                <Link href="/optimize"
                                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-full transition">
                                    <Zap className="w-3.5 h-3.5" /> Go to Optimize 
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function FindJobsPage() {
    const [role, setRole] = useState("");
    const [region, setRegion] = useState("");
    const [city, setCity] = useState("");
    const [countries, setCountries] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [loadingCountries, setLoadingCountries] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [searchCount, setSearchCount] = useState(0);
    const [hasSearched, setHasSearched] = useState(false);
    const { isPaid } = useIsPaid();

    // Fetch countries on mount
    useEffect(() => {
        setLoadingCountries(true);
        fetch("/api/locations?type=countries")
            .then(r => r.json())
            .then(d => setCountries(d.countries || []))
            .catch(() => {})
            .finally(() => setLoadingCountries(false));
    }, []);

    // Fetch cities when country changes
    useEffect(() => {
        if (!region) { setCities([]); return; }
        setLoadingCities(true);
        setCity("");
        fetch(`/api/locations?type=cities&country=${encodeURIComponent(region)}`)
            .then(r => r.json())
            .then(d => setCities(d.cities || []))
            .catch(() => setCities([]))
            .finally(() => setLoadingCities(false));
    }, [region]);

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data } = await supabase.from("resumes").select("resume_json").eq("user_id", user.id).maybeSingle();
            if (data?.resume_json?.experience?.[0]?.role) {
                setRole(data.resume_json.experience[0].role);
            }
        };
        load();
        const today = new Date().toISOString().slice(0, 10);
        try {
            const stored = JSON.parse(localStorage.getItem("job_search_count") || "{}");
            if (stored.date === today) setSearchCount(stored.count || 0);
        } catch (_e) { /* ignore */ }
    }, []);

    const searchesLeft = Math.max(0, FREE_DAILY_SEARCHES - searchCount);
    const reachedLimit = !isPaid && searchCount >= FREE_DAILY_SEARCHES;

    const handleSearch = useCallback(async () => {
        if (!role.trim() || isLoading || reachedLimit) return;

        setIsLoading(true);
        setError("");
        setJobs([]);
        setHasSearched(true);

        if (!isPaid) {
            const today = new Date().toISOString().slice(0, 10);
            const newCount = searchCount + 1;
            setSearchCount(newCount);
            localStorage.setItem("job_search_count", JSON.stringify({ date: today, count: newCount }));
        }

        try {
            const locationParts = [city.trim(), region].filter(Boolean);
            const location = locationParts.join(", ");
            const params = new URLSearchParams({ role: role.trim() });
            if (location) params.set("location", location);

            const res = await fetch(`/api/jobs/search?${params}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Search failed");
            setJobs(data.jobs || []);
        } catch (err: any) {
            setError(err.message || "Failed to load jobs. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [role, region, city, isPaid, searchCount, reachedLimit, isLoading]);

    const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleSearch(); };

    // For free users, first 5 visible, rest blurred
    const visibleJobs = isPaid ? jobs : jobs.slice(0, FREE_VISIBLE_JOBS);
    const lockedJobs = isPaid ? [] : jobs.slice(FREE_VISIBLE_JOBS);

    const locationDisplay = [city, region].filter(Boolean).join(", ");
    const hasCities = cities.length > 0;

    return (
        <div className="space-y-6 relative z-10 pb-20">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center shadow-inner">
                        <Search className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white flex items-center gap-3">
                            Find Jobs
                            {!isPaid && (
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${searchesLeft > 0 ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"}`}>
                                    {searchesLeft > 0 ? `${searchesLeft} searches left today` : "Daily limit reached"}
                                </span>
                            )}
                        </h1>
                        <p className="text-neutral-500 dark:text-neutral-400 font-medium text-sm mt-0.5">
                            Live listings from LinkedIn. Click <strong>About Job</strong>  copy description  paste into Optimize to tailor your CV.
                        </p>
                    </div>
                </div>
                <GuideButton guide={{
                    title: "Find Jobs  How to Use",
                    steps: [
                        "Enter the job title and select your country/city.",
                        "Click Search Jobs to fetch live LinkedIn listings.",
                        "Click 'View on LinkedIn' to open and read the full posting.",
                        "Copy the 'About the job' section text from LinkedIn.",
                        "Go to Optimize, paste the job description, and generate a tailored CV.",
                    ],
                    tips: [
                        "Free users get 3 searches/day and see the first 5 results. Upgrade for unlimited.",
                        "Newest jobs are shown first  check back daily for fresh listings.",
                        "Leave City blank to search the whole country.",
                    ]
                }} />
            </div>

            {/* Search form */}
            <div className="bg-white/60 dark:bg-black/40 backdrop-blur-2xl border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-xl">
                <div className="flex flex-wrap gap-3 items-end">
                    {/* Role */}
                    <div className="flex-1 min-w-52">
                        <label className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-2 flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5" /> Job Title / Role
                        </label>
                        <input
                            value={role}
                            onChange={e => setRole(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="e.g. Integration Architect, .NET Developer"
                            className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-2xl px-4 py-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-indigo-400 transition"
                        />
                    </div>

                    {/* Country */}
                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-2 flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5" /> Country
                        </label>
                        <select
                            value={region}
                            onChange={e => setRegion(e.target.value)}
                            disabled={loadingCountries}
                            className="w-full sm:w-52 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-2xl px-4 py-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-indigo-400 transition appearance-none cursor-pointer disabled:opacity-60"
                        >
                            <option value="">{loadingCountries ? "Loading countries…" : "🌍 Anywhere / Remote"}</option>
                            {countries.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    {/* City dropdown — shown only when a country is selected and has cities */}
                    {hasCities && (
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-2 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5" /> City
                            </label>
                            <select
                                value={city}
                                onChange={e => setCity(e.target.value)}
                                disabled={loadingCities}
                                className="w-full sm:w-48 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-2xl px-4 py-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-indigo-400 transition appearance-none cursor-pointer disabled:opacity-60"
                            >
                                <option value="">{loadingCities ? "Loading cities…" : "All cities"}</option>
                                {cities.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Search button */}
                    <button
                        onClick={handleSearch}
                        disabled={!role.trim() || isLoading || reachedLimit}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-2xl transition shadow-md hover:shadow-lg text-sm whitespace-nowrap"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        {isLoading ? "Searching" : "Search Jobs"}
                    </button>
                </div>

                {reachedLimit && !isPaid && (
                    <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl text-sm text-amber-800 dark:text-amber-300 flex items-center gap-3">
                        <Lock className="w-5 h-5 flex-shrink-0" />
                        <div>
                            <strong>Daily limit reached.</strong> Free plan: {FREE_DAILY_SEARCHES} searches/day.
                            <Link href="/settings" className="ml-2 underline font-bold">Upgrade to Pro for unlimited </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-bold text-red-700 dark:text-red-400">{error}</p>
                </div>
            )}

            {/* Loading skeleton */}
            {isLoading && (
                <div className="grid sm:grid-cols-2 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white/60 dark:bg-neutral-900/60 rounded-3xl p-5 border border-neutral-200 dark:border-neutral-800 animate-pulse">
                            <div className="flex gap-4 mb-4">
                                <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-800 rounded-2xl flex-shrink-0" />
                                <div className="flex-1 space-y-2 pt-1">
                                    <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded-full w-3/4" />
                                    <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded-full w-1/2" />
                                </div>
                            </div>
                            <div className="flex gap-2 mb-4">
                                <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded-full w-24" />
                                <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded-full w-16" />
                            </div>
                            <div className="flex gap-2">
                                <div className="h-7 bg-neutral-200 dark:bg-neutral-800 rounded-full w-28" />
                                <div className="h-7 bg-neutral-200 dark:bg-neutral-800 rounded-full w-24" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Results */}
            {!isLoading && jobs.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <p className="text-sm font-bold text-neutral-600 dark:text-neutral-400">
                            Found <span className="text-indigo-600 dark:text-indigo-400">{jobs.length}</span> jobs for{" "}
                            <span className="text-neutral-900 dark:text-white">&ldquo;{role}&rdquo;</span>
                            {locationDisplay ? ` in ${locationDisplay}` : ""}{" "}
                            <span className="font-normal text-neutral-400">(sorted by newest)</span>
                        </p>
                        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 px-3 py-1.5 rounded-full border border-violet-200 dark:border-violet-800">
                            <Zap className="w-3.5 h-3.5" />
                            Click &ldquo;About Job&rdquo; to optimize your CV for any listing
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {visibleJobs.map(job => <JobCard key={job.job_id} job={job} locked={false} />)}
                        {lockedJobs.map(job => <JobCard key={job.job_id} job={job} locked={true} />)}
                    </div>

                    {/* Upgrade CTA if free user has more results */}
                    {!isPaid && lockedJobs.length > 0 && (
                        <div className="mt-6 p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200 dark:border-amber-800 rounded-3xl text-center">
                            <Crown className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                            <h3 className="text-lg font-black text-neutral-900 dark:text-white mb-1">
                                {lockedJobs.length} more jobs hidden
                            </h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                                Free plan shows 5 results. Upgrade to Pro to see all {jobs.length} jobs + unlimited searches per day.
                            </p>
                            <Link href="/settings"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black rounded-2xl transition shadow-lg">
                                <Crown className="w-4 h-4" /> Upgrade to Pro
                            </Link>
                        </div>
                    )}
                </div>
            )}

            {/* Empty state */}
            {!isLoading && hasSearched && jobs.length === 0 && !error && (
                <div className="text-center py-16 px-4">
                    <div className="text-5xl mb-4"></div>
                    <h3 className="text-xl font-black text-neutral-900 dark:text-white mb-2">No jobs found</h3>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                        Try a broader role title, different country, or leave city blank.
                    </p>
                </div>
            )}

            {/* Pre-search */}
            {!isLoading && !hasSearched && (
                <div className="text-center py-16 px-4">
                    <div className="text-5xl mb-4"></div>
                    <h3 className="text-xl font-black text-neutral-900 dark:text-white mb-2">Find your next role</h3>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm max-w-md mx-auto">
                        Enter a job title above to search live LinkedIn listings  sorted by newest first.
                        <br /><br />
                        <span className="font-semibold text-violet-600 dark:text-violet-400">Pro tip:</span> After finding a job, click &ldquo;About Job&rdquo;, copy the job description from LinkedIn, then paste it into{" "}
                        <Link href="/optimize" className="underline">Optimize</Link> to generate a perfectly tailored CV.
                    </p>
                    {!isPaid && (
                        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-2xl text-sm text-neutral-600 dark:text-neutral-400 font-medium">
                            <Lock className="w-4 h-4" />
                            Free: {FREE_DAILY_SEARCHES} searches/day  {FREE_VISIBLE_JOBS} results visible
                            <Link href="/settings" className="text-indigo-500 font-bold underline ml-1">Upgrade </Link>
                        </div>
                    )}
                </div>
            )}

            {/* Tips */}
            <div className="bg-white/60 dark:bg-black/40 backdrop-blur-2xl border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-neutral-500 mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" /> Job Search Tips
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                    {[
                        { tip: "Tailor your CV for each job", desc: "Use the Optimize page to generate a custom CV, cover letter, and LinkedIn message for each specific job." },
                        { tip: "Apply within the first 24 hours", desc: "Early applicants are 3× more likely to get called back. Jobs shown here are sorted newest first." },
                        { tip: "Set LinkedIn to 'Open to Work'", desc: "Recruiters are 2× more likely to message candidates who have the Open to Work badge enabled." },
                        { tip: "Follow up after 5 business days", desc: "Send a short, polite follow-up email after applying. It doubles your chances of getting a response." },
                    ].map((t, i) => (
                        <div key={i} className="p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
                            <p className="font-bold text-neutral-900 dark:text-white text-sm">{t.tip}</p>
                            <p className="text-xs text-neutral-500 mt-1">{t.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
