"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CvTemplateRenderer } from "@/components/CvTemplates";
import { PdfDownloadButton } from "@/components/PdfGenerator";

export default function SharePage() {
    const params = useParams();
    const token = params?.token as string;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [resumeData, setResumeData] = useState<any>(null);
    const [templateId, setTemplateId] = useState("classic");
    const [expiresAt, setExpiresAt] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            if (!token) { setError("Invalid link"); setLoading(false); return; }

            // Try Supabase first (works after migration is run)
            const { data, error: dbError } = await supabase
                .from("share_links")
                .select("*")
                .eq("token", token)
                .maybeSingle();

            if (data && !dbError) {
                // Check expiry
                if (data.expires_at && new Date(data.expires_at) < new Date()) {
                    setError("expired");
                    setLoading(false);
                    return;
                }

                try {
                    const snap = data.resume_snapshot
                        ? JSON.parse(data.resume_snapshot)
                        : null;
                    if (snap) {
                        setResumeData(snap);
                        setTemplateId(data.template_id || "classic");
                        setExpiresAt(data.expires_at);
                        setLoading(false);
                        return;
                    }
                } catch { /* fall through to localStorage */ }
            }

            // Fallback: check localStorage (immediate sharing without DB)
            const localKey = `share_preview_${token}`;
            const localData = localStorage.getItem(localKey);
            if (localData) {
                try {
                    const parsed = JSON.parse(localData);
                    setResumeData(parsed.data);
                    setTemplateId(parsed.templateId || "classic");
                    setExpiresAt(parsed.expiresAt || null);
                    setLoading(false);
                    return;
                } catch { /* ignore */ }
            }

            // Nothing found
            if (dbError && !data) {
                setError("Database table not set up. Please run the migration SQL in Supabase.");
            } else {
                setError("notfound");
            }
            setLoading(false);
        }

        load();
    }, [token]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-100">
            <div className="text-center">
                <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-neutral-500 font-semibold">Loading shared CV…</p>
            </div>
        </div>
    );

    if (error === "expired") return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-100">
            <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-sm">
                <div className="text-5xl mb-4">⏳</div>
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">Link Expired</h1>
                <p className="text-neutral-500 mb-6">This share link has expired. Ask the owner to generate a new one.</p>
                <a href="/" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition">
                    Go to CViq →
                </a>
            </div>
        </div>
    );

    if (error === "notfound" || (!resumeData && !loading)) return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-100">
            <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-sm">
                <div className="text-5xl mb-4">🔍</div>
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">CV Not Found</h1>
                <p className="text-neutral-500 mb-6">This share link doesn&apos;t exist or has been removed.</p>
                <a href="/" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition">
                    Create Your Own CV →
                </a>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-100 p-4">
            <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-md">
                <div className="text-5xl mb-4">⚙️</div>
                <h1 className="text-xl font-bold text-neutral-900 mb-2">Setup Required</h1>
                <p className="text-sm text-neutral-500 mb-4">{error}</p>
                <code className="block text-xs bg-neutral-100 p-3 rounded-xl text-left mb-4 break-all">
                    Run: supabase_migration_share_links.sql in your Supabase SQL Editor
                </code>
                <a href="/resume" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition">
                    ← Back to My CV
                </a>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-neutral-200 dark:bg-neutral-900 py-8 px-4">
            {/* Top bar */}
            <div className="max-w-[800px] mx-auto mb-5 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full text-sm font-semibold text-neutral-600 border border-neutral-200 shadow-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    Shared CV · View only
                    {expiresAt && <span className="text-neutral-400 font-normal">· Expires {new Date(expiresAt).toLocaleDateString()}</span>}
                </div>
                <div className="flex items-center gap-2">
                    <PdfDownloadButton data={resumeData} templateId={templateId} />
                </div>
            </div>

            {/* CV Preview */}
            <div className="max-w-[800px] mx-auto shadow-2xl overflow-hidden rounded-lg bg-white">
                <CvTemplateRenderer templateId={templateId} data={resumeData} />
            </div>

            <div className="text-center mt-8">
                <p className="text-sm text-neutral-500 mb-3">Powered by <strong className="text-neutral-700">CViq</strong></p>
                <a href="/" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20">
                    Create Your Own CV →
                </a>
            </div>
        </div>
    );
}
