"use client";

import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface ShinyButtonProps extends HTMLMotionProps<"button"> {
    children: React.ReactNode;
}

export function ShinyButton({ children, className, ...props }: ShinyButtonProps) {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ "--x": "100%", scale: 1 }}
            animate={{ "--x": "-100%" }}
            transition={{
                repeat: Infinity,
                repeatType: "loop",
                repeatDelay: 1,
                type: "spring",
                stiffness: 20,
                damping: 15,
                mass: 2,
                scale: {
                    type: "spring",
                    stiffness: 10,
                    damping: 5,
                    mass: 0.1,
                },
            }}
            className={cn(
                "relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-neutral-950 dark:bg-neutral-50 px-8 py-3 font-medium text-neutral-50 dark:text-neutral-950 backdrop-blur-3xl transition-all shadow-xl hover:shadow-indigo-500/30",
                "border border-white/10 dark:border-black/10",
                className
            )}
            {...props}
        >
            <span className="relative z-10 flex h-full w-full items-center justify-center tracking-tight">
                {children}
            </span>
            <span className="absolute inset-0 z-0 block h-full w-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] bg-[position:var(--x),0,0,0]" />
        </motion.button>
    );
}
