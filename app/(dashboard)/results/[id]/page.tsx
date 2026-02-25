"use client";

import { use } from "react";
import { ResultsTabs } from "@/components/ResultsTabs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SingleResultPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    // Example mocked data
    const mockedData = {
        coverLetter: "Detailed cover letter...",
        applicationText: "Application text...",
        linkedinMessages: { recruiter: "Hi", hiring_manager: "Hello", referral: "Hey" },
        missingRequirements: ["Typescript"]
    };

    return (
        <div className="space-y-8">
            <div>
                <Link href="/history" className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-indigo-500 mb-4 transition">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to History
                </Link>
                <h1 className="text-3xl font-bold mb-2">Generation Result {id}</h1>
            </div>

            <ResultsTabs parsedOutput={mockedData} />
        </div>
    );
}
