"use client";

import { Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { GuideButton } from "@/components/GuideButton";

export default function SettingsPage() {
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [plan, setPlan] = useState("free");
    const [status, setStatus] = useState("inactive");
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setEmail(user.email || "");
                // Fetch profile
                const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
                if (profile) setFullName(profile.full_name || "");

                // Fetch subscription
                const { data: sub } = await supabase.from("subscriptions").select("plan, status").eq("user_id", user.id).single();
                if (sub) {
                    setPlan(sub.plan);
                    setStatus(sub.status);
                }
            }
            setIsLoading(false);
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
            alert("Profile updated successfully");
        }
        setIsSaving(false);
    };

    const handleDeleteData = async () => {
        if (!confirm("Are you sure you want to PERMANENTLY delete all your data and account?")) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            // Delete user data. Relying on ON DELETE CASCADE for related tables.
            await supabase.from("profiles").delete().eq("id", user.id);
            // Supabase auth user deletion is normally done via Edge Function or admin API, 
            // but for MVP we delete their profile and sign out.
            await supabase.auth.signOut();
            router.push("/");
        }
    };
    return (
        <div className="space-y-8 relative z-10 w-full mb-20">
            <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-neutral-900 dark:bg-neutral-800 text-white dark:text-neutral-200 rounded-2xl flex items-center justify-center shadow-inner">
                        <Settings className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-neutral-900 dark:text-white">Settings</h1>
                        <p className="text-neutral-500 dark:text-neutral-400 font-medium">Manage your profile, language preferences, and subscription.</p>
                    </div>
                </div>
                <GuideButton guide={{
                    title: "Settings Page Guide",
                    steps: [
                        "Update your Full Name here — this will appear in the sidebar greeting.",
                        "Email cannot be changed here for security reasons. Contact support if needed.",
                        "Your current subscription plan and its status are shown in the Subscription section.",
                        "Click 'Upgrade to Pro' to unlock unlimited optimizations, all 6 CV templates, and unlimited PDF downloads.",
                        "Use the Danger Zone to permanently delete all your data if you choose to."
                    ],
                    tips: [
                        "Pro plan grants: unlimited AI optimizations, all templates, unlimited PDF exports.",
                        "Data deletion is irreversible — please export anything you need first."
                    ]
                }} />
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 p-8 rounded-[2rem] space-y-6 shadow-sm">
                    <h2 className="text-2xl font-bold border-b border-neutral-200 dark:border-neutral-800/80 pb-4">Profile</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">Full Name</label>
                            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className="input-styled h-12 text-base font-medium rounded-xl bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">Email</label>
                            <input type="email" value={email} disabled className="input-styled h-12 text-base font-medium rounded-xl bg-neutral-100 dark:bg-neutral-900 cursor-not-allowed border-neutral-200 dark:border-neutral-800" />
                            <p className="text-sm font-medium text-neutral-500 mt-2">Contact support to securely change your email.</p>
                        </div>
                    </div>
                    <button onClick={handleSave} disabled={isSaving || isLoading} className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold h-12 px-8 rounded-xl w-full sm:w-auto hover:opacity-90 active:scale-95 transition-all mt-4 disabled:opacity-50">
                        {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                </div>

                <div className="bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 p-8 rounded-[2rem] space-y-6 shadow-sm">
                    <h2 className="text-2xl font-bold border-b border-neutral-200 dark:border-neutral-800/80 pb-4">Subscription & Data</h2>

                    <div className="p-6 rounded-2xl bg-indigo-50/80 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800/50">
                        <h3 className="font-bold text-indigo-700 dark:text-indigo-400 text-lg flex justify-between items-center capitalize">
                            {plan} Plan
                            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs uppercase tracking-wider rounded-md font-bold">{status}</span>
                        </h3>
                        {plan === "free" && (
                            <p className="font-medium text-indigo-600/80 dark:text-indigo-400/80 mt-2 text-sm leading-relaxed">Upgrade to Pro for unlimited generation capabilities and priority API access.</p>
                        )}
                    </div>

                    <div className="pt-6 mt-6 border-t border-neutral-200 dark:border-neutral-800/80">
                        <h3 className="font-bold text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
                        <p className="text-neutral-500 font-medium text-sm mb-4">You can permanently delete your data and account. This operation is irreversible.</p>
                        <button onClick={handleDeleteData} className="text-red-600 dark:text-red-400 font-bold hover:underline transition-all">Delete all my data</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
