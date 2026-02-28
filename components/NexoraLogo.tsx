"use client";

// Nexora custom logo
export function NexoraLogo({ size = 32 }: { size?: number }) {
    return (
        <img src="/logo.svg" alt="Nexora" style={{ width: size, height: "auto" }} />
    );
}

// Full Nexora logo with text (for marketing materials)
export function NexoraFullLogo({ variant = "dark" }: { variant?: "dark" | "light" }) {
    return (
        <img
            src={variant === "light" ? "/nexora-logo-new-white.svg" : "/nexora-logo-new.svg"}
            alt="Nexora AI"
            style={{ height: "40px", width: "auto" }}
            className="object-contain"
        />
    );
}

// Icon-only for favicon/small places
export function NexoraIcon({ size = 80 }: { size?: number }) {
    return (
        <img
            src="/nexora-icon-new.svg"
            alt="Nexora"
            style={{ width: size, height: size }}
            className="object-contain"
        />
    );
}
