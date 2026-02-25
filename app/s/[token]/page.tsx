import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { CvTemplateRenderer } from "@/components/CvTemplates";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function SharePage({ params }: { params: { token: string } }) {
    const { data, error } = await supabase
        .from("share_links")
        .select("*")
        .eq("token", params.token)
        .maybeSingle();

    if (!data || error) return notFound();

    // Check expiry
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-100">
                <div className="text-center p-8 bg-white rounded-3xl shadow-xl">
                    <div className="text-4xl mb-4">⏳</div>
                    <h1 className="text-2xl font-bold text-neutral-900 mb-2">Link Expired</h1>
                    <p className="text-neutral-500">This share link has expired. Please ask the owner to generate a new one.</p>
                </div>
            </div>
        );
    }

    let resumeData: any = {};
    try {
        resumeData = JSON.parse(data.resume_snapshot || "{}");
    } catch {
        resumeData = {};
    }

    const templateId = data.template_id || "classic";

    return (
        <div className="min-h-screen bg-neutral-200 py-8 px-4">
            <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full text-sm font-semibold text-neutral-600 border border-neutral-200 shadow-sm mb-4">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    Shared CV · View only
                </div>
                <p className="text-xs text-neutral-400">
                    Powered by <span className="font-bold text-neutral-600">AI CV Optimizer</span>
                    {data.expires_at && ` · Expires ${new Date(data.expires_at).toLocaleDateString()}`}
                </p>
            </div>

            <div className="max-w-[800px] mx-auto shadow-2xl overflow-hidden rounded-lg">
                <CvTemplateRenderer templateId={templateId} data={resumeData} />
            </div>

            <div className="text-center mt-8">
                <a href="/" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20">
                    Create Your Own CV →
                </a>
            </div>
        </div>
    );
}
