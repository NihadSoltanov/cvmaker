"use client";

import { useEffect, useState } from "react";
import { ResumeEditor } from "@/components/ResumeEditor";
import { FileText } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { GuideButton } from "@/components/GuideButton";

export default function ResumePage() {
    const [resume, setResume] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchResume = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("resumes")
                .select("*")
                .eq("user_id", user.id)
                .maybeSingle();

            if (data?.resume_json) {
                setResume(data.resume_json);
            }
            setIsLoading(false);
        };
        fetchResume();
    }, []);

    const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);

    const handleSave = async (updatedData: any) => {
        setIsSaving(true);
        setSaveMsg(null);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { setSaveMsg({ ok: false, text: "Not logged in." }); return; }

            // Check if a resume row already exists for this user
            const { data: existing, error: fetchErr } = await supabase
                .from("resumes").select("id").eq("user_id", user.id).maybeSingle();

            if (fetchErr) { console.error("Save fetch error:", fetchErr); }

            let saveError: any = null;
            if (existing) {
                const { error } = await supabase.from("resumes")
                    .update({ resume_json: updatedData })
                    .eq("id", existing.id);
                saveError = error;
            } else {
                const { error } = await supabase.from("resumes")
                    .insert([{ user_id: user.id, title: "Main CV", resume_json: updatedData }]);
                saveError = error;
            }

            if (saveError) {
                console.error("Save error:", saveError);
                setSaveMsg({ ok: false, text: `Save failed: ${saveError.message}` });
            } else {
                setResume(updatedData);
                setSaveMsg({ ok: true, text: "✓ CV saved successfully! Go to Optimize to tailor it." });
                setTimeout(() => setSaveMsg(null), 5000);
            }
        } catch (e: any) {
            console.error("Save threw:", e);
            setSaveMsg({ ok: false, text: `Unexpected error: ${e.message}` });
        } finally {
            setIsSaving(false);
        }
    };


    return (
        <div className="min-h-[calc(100vh-64px)] flex flex-col space-y-8 relative z-10 w-full mb-20">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center shadow-inner">
                        <FileText className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-neutral-900 dark:text-white">Master Profile</h1>
                        <p className="text-neutral-500 dark:text-neutral-400 font-medium">The single source of truth used by the AI to optimize your applications.</p>
                    </div>
                </div>
                <GuideButton guide={{
                    title: "Master CV — How to Use",
                    steps: [
                        "Fill in your Personal Details. Fields marked with * are mandatory for ATS systems.",
                        "Add all your Work Experiences — use the 'Add Experience' button to add more entries.",
                        "Use date pickers for Start and End dates. Leave End Date blank for your current role.",
                        "Add your Education history and optionally, Projects.",
                        "Go to 'Choose Template' tab to select your CV style, then 'Live Preview' to see the result.",
                        "Click 'Save Master CV' to save your data before going to the Optimize page.",
                        "Click 'Download PDF' to get a print-ready version using your selected template.",
                    ],
                    tips: [
                        "Use bullet points (starting with •) in experience descriptions for best ATS readability.",
                        "Include quantifiable achievements (e.g. 'Increased revenue by 30%').",
                        "Free plan allows 2 PDF downloads/month. Upgrade to Pro for unlimited.",
                        "The Classic ATS template has no photo and the highest ATS compatibility score."
                    ]
                }} />
            </div>

            {/* Save result banner */}
            {saveMsg && (
                <div className={`px-5 py-3 rounded-2xl text-sm font-semibold flex items-center gap-3 border ${saveMsg.ok
                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700"
                    : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700"}`}>
                    <span className="text-lg">{saveMsg.ok ? "✅" : "❌"}</span>
                    {saveMsg.text}
                    {saveMsg.ok && (
                        <a href="/optimize" className="ml-auto text-xs font-bold underline text-green-600 dark:text-green-400 hover:opacity-80">
                            → Go to Optimize
                        </a>
                    )}
                </div>
            )}

            <div className="flex-1 min-h-[600px] w-full bg-white/40 dark:bg-black/40 backdrop-blur-2xl border border-neutral-200 dark:border-neutral-800 rounded-[2rem] shadow-2xl shadow-indigo-500/5 overflow-hidden">
                {isLoading ? (
                    <div className="w-full h-full flex items-center justify-center text-neutral-500">Loading CV...</div>
                ) : (
                    <ResumeEditor resume={resume} onSave={handleSave} isSaving={isSaving} />
                )}
            </div>
        </div>
    );
}

