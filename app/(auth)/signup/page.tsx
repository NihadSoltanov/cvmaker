"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { createProfile } from "@/app/actions/auth";
import { useLang } from "@/lib/langContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function SignupPage() {
    const router = useRouter();
    const { t } = useLang();
    const [isLoading, setIsLoading] = useState(false);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg("");

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } },
        });

        if (error) {
            setErrorMsg(error.message);
            setIsLoading(false);
            return;
        }

        if (data.user) {
            await createProfile(data.user.id, email, fullName);
        }

        router.push("/dashboard");
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Top-right language switcher */}
            <div className="absolute top-4 right-4 z-50">
                <LanguageSwitcher inline />
            </div>

            <div className="glass-card w-full max-w-md p-8 rounded-3xl z-10">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-indigo-500 mb-8 transition">
                    <ArrowLeft className="w-4 h-4 mr-2" /> {t("backHome")}
                </Link>

                <h1 className="text-2xl font-bold mb-2">{t("createAccount")}</h1>
                <p className="text-neutral-500 text-sm mb-8">{t("signupSubtitle")}</p>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {errorMsg && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">{errorMsg}</div>}
                    <div>
                        <label className="block text-sm font-medium mb-1">{t("fullNameLabel")}</label>
                        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" className="input-styled" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">{t("emailLabel")}</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input-styled" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">{t("passwordLabel")}</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="input-styled" required />
                    </div>
                    <button type="submit" disabled={isLoading} className="btn-primary w-full mt-2">
                        {isLoading ? t("signupBtnLoading") : t("signupBtn")}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-neutral-500">
                    {t("alreadyHaveAccount")} <Link href="/login" className="text-indigo-600 hover:underline font-semibold">{t("logInLink")}</Link>
                </p>
            </div>
        </div>
    );
}
