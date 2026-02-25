"use client";
import { cn } from "@/lib/utils";
import React from "react";

export const BackgroundBeams = ({ className }: { className?: string }) => {
    return (
        <div
            className={cn(
                "absolute inset-0 overflow-hidden pointer-events-none z-0",
                className
            )}
        >
            <div className="absolute inset-x-0 bottom-[-20%] h-[120%] w-[120%] left-[-10%] translate-z-0 rounded-full blur-[120px] bg-[radial-gradient(circle_at_bottom,rgba(99,102,241,0.15),transparent_60%)]" />
            <div className="absolute top-[10%] right-[-10%] w-[80%] h-[80%] rounded-full blur-[100px] bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.15),transparent_60%)]" />

            <svg
                className="absolute inset-0 h-full w-full stroke-neutral-900/5 dark:stroke-white/5"
                aria-hidden="true"
            >
                <defs>
                    <pattern
                        id="pattern-rect"
                        width="40"
                        height="40"
                        patternUnits="userSpaceOnUse"
                        patternTransform="translate(-1 -1)"
                    >
                        <path d="M.5 40V.5H40" fill="none" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" strokeWidth="0" fill="url(#pattern-rect)" />
            </svg>
        </div>
    );
};
