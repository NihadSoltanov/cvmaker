"use client";

import { useEffect, useState } from "react";
import { ResumeEditor } from "@/components/ResumeEditor";
import { FileText } from "lucide-react";
import { supabase } from "@/lib/supabase";

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
                .single();

            if (data?.resume_json) {
                setResume(data.resume_json);
            }
            setIsLoading(false);
        };
        fetchResume();
    }, []);

    const handleSave = async (updatedData: any) => {
        setIsSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // check if exists
        const { data: existing } = await supabase.from("resumes").select("id").eq("user_id", user.id).single();

        if (existing) {
            await supabase.from("resumes").update({ resume_json: updatedData }).eq("id", existing.id);
        } else {
            await supabase.from("resumes").insert([{ user_id: user.id, title: "Main CV", resume_json: updatedData }]);
        }

        setResume(updatedData);
        setIsSaving(false);
    };

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col space-y-8 relative z-10 w-full mb-20">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center shadow-inner">
                    <FileText className="w-7 h-7" />
                </div>
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-neutral-900 dark:text-white">Master Profile</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 font-medium">This serves as the sole source of truth for all your AI optimizations.</p>
                </div>
            </div>

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
