import React, { useState, useEffect } from 'react';

// Simplified for MVP, real usage uses massive JSON.
export function ResumeEditor({ resume, onSave, isSaving }: any) {
    const [name, setName] = useState("");
    const [summary, setSummary] = useState("");
    const [experience, setExperience] = useState("");
    const [skills, setSkills] = useState("");

    useEffect(() => {
        if (resume) {
            setName(resume.name || "");
            setSummary(resume.summary || "");
            setExperience(typeof resume.experience === 'string' ? resume.experience : JSON.stringify(resume.experience, null, 2) || "");
            setSkills(Array.isArray(resume.skills) ? resume.skills.join(", ") : resume.skills || "");
        }
    }, [resume]);

    const handleSave = () => {
        let expParsed: any = [];
        try {
            expParsed = JSON.parse(experience || "[]");
        } catch {
            expParsed = experience; // fallback to text
        }

        onSave({
            name,
            summary,
            experience: expParsed,
            skills: skills.split(",").map((s: string) => s.trim()).filter(Boolean)
        });
    };
    return (
        <div className="glass-card rounded-3xl p-6 relative overflow-hidden h-full flex flex-col">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-200 dark:border-neutral-800">
                <h2 className="text-2xl font-bold tracking-tight">CV Blueprint</h2>
                <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-semibold">Editable</span>
            </div>

            <div className="flex-1 overflow-auto space-y-6 lg:pr-4 custom-scrollbar">
                <div className="space-y-3">
                    <label className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">FullName</label>
                    <input className="input-styled" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" />

                    <label className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mt-4 block">Summary</label>
                    <textarea className="input-styled h-24" value={summary} onChange={e => setSummary(e.target.value)} placeholder="Experienced developer with 5+ years building scalable web apps..." />
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Experience (Raw JSON Outline or Text)</label>
                    <textarea className="input-styled h-32 font-mono text-xs" value={experience} onChange={e => setExperience(e.target.value)} placeholder="[ { Company: 'Google', Role: 'SWE', ... } ]" />
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Skills (Comma separated)</label>
                    <textarea className="input-styled h-20 font-mono text-xs" value={skills} onChange={e => setSkills(e.target.value)} placeholder="React, Next.js, Node.js, Postgres..." />
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 flex gap-4">
                <button onClick={handleSave} disabled={isSaving} className="flex-1 bg-indigo-600 text-white rounded-xl py-3 font-semibold hover:bg-indigo-700 transition disabled:opacity-50">
                    {isSaving ? "Saving..." : "Save Master CV"}
                </button>
                <button className="flex-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-xl py-3 font-semibold hover:opacity-90 transition disabled:opacity-50">
                    Import PDF
                </button>
            </div>
        </div>
    );
}
