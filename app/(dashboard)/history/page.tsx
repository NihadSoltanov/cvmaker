import { FileText, ArrowRight, Clock } from "lucide-react";

export default function HistoryPage() {
    const history = [
        { id: 1, title: 'Senior Engineer at Google', date: 'Oct 12, 2023', lang: 'English' },
        { id: 2, title: 'Frontend Developer at Vercel', date: 'Nov 04, 2023', lang: 'English' }
    ];

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
                {history.map(item => (
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
