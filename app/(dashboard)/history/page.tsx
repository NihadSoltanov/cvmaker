"use client";

import { FileText, ArrowRight, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function HistoryPage() {
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Fetch tailored outputs mapping to job posts
                const { data } = await supabase
                    .from("tailored_outputs")
                    .select("id, created_at, output_language, job_posts(job_title, company)")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false });

                if (data) {
                    setHistory(data.map(item => ({
                        id: item.id,
                        title: (item.job_posts as any)?.job_title && (item.job_posts as any)?.company ?
                            `${(item.job_posts as any).job_title} at ${(item.job_posts as any).company}` : 'Optimized Profile',
                        date: new Date(item.created_at).toLocaleDateString(),
                        lang: item.output_language === 'en' ? 'English' :
                            item.output_language === 'tr' ? 'Turkish' :
                                item.output_language === 'az' ? 'Azerbaijani' :
                                    item.output_language === 'ru' ? 'Russian' : item.output_language
                    })));
                }
            }
            setIsLoading(false);
        };
        fetchHistory();
    }, []);

    return (
        <div className="space-y-8 relative z-10 w-full mb-20">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center shadow-inner">
                    <Clock className="w-7 h-7" />
                </div>
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-neutral-900 dark:text-white">Application History</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 font-medium">Access and redownload your past AI optimization packages.</p>
                </div>
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-center text-neutral-500 py-10">Loading history...</div>
                ) : history.length === 0 ? (
                    <div className="text-center text-neutral-500 py-10">No generated applications yet. Go to Optimize page to create one!</div>
                ) : history.map(item => (
                    <div key={item.id} className="bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 group">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">{item.title}</h3>
                                <p className="text-sm font-medium text-neutral-500">Optimized on <strong className="text-neutral-700 dark:text-neutral-300">{item.date}</strong> • Language: {item.lang}</p>
                            </div>
                        </div>
                        <button className="text-sm font-bold bg-indigo-600 hover:bg-indigo-700 disabled:pointer-events-none disabled:opacity-50 text-white h-10 px-6 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-indigo-600/20 mt-4 sm:mt-0 w-full sm:w-auto justify-center">
                            View Result <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
