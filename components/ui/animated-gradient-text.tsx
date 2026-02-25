"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function AnimatedGradientText({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <motion.span
            initial={{ backgroundPosition: "0% 50%" }}
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 5, ease: "linear", repeat: Infinity }}
            className={cn(
                "bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-[length:200%_auto] font-extrabold",
                className
            )}
        >
            {children}
        </motion.span>
    );
}
