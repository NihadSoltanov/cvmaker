import { FileText, Download } from "lucide-react";

export default function ShareLinkPage({ params }: { params: { token: string } }) {
    // Normally search DB for tailored_outputs via token
    return (
        <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 flex flex-col items-center justify-center p-4">
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-500/20 to-transparent pointer-events-none" />

            <div className="max-w-4xl w-full z-10 glass-card p-8 rounded-3xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-neutral-200 dark:border-neutral-800">
                    <div>
                        <h1 className="text-3xl font-bold mb-1 tracking-tight">John Doe</h1>
                        <p className="text-neutral-500 flex items-center gap-2"><FileText className="w-4 h-4" /> Tailored Application Profile</p>
                    </div>
                    <button className="btn-primary rounded-xl mt-4 sm:mt-0 shadow-lg">
                        <Download className="w-4 h-4 mr-2" /> Download PDF
                    </button>
                </div>

                <div className="prose dark:prose-invert max-w-none text-sm text-neutral-700 dark:text-neutral-300">
                    <p className="text-lg">This page securely displays the shared resume context representing the candidate.</p>
                    <div className="w-full h-64 bg-neutral-50 dark:bg-neutral-900 rounded-2xl flex items-center justify-center mt-8 border border-neutral-200 dark:border-neutral-800 font-mono text-center px-4">
                        [ Render detailed interactive resume layout based on JSON here ]
                    </div>
                </div>

                <div className="mt-8 text-center border-t border-neutral-200 dark:border-neutral-800 pt-6">
                    <p className="text-xs text-neutral-400 mb-2">Powered by AI CV Optimizer</p>
                </div>
            </div>
        </div>
    );
}
