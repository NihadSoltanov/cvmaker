"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

/** Hook to check if the current user has an active paid subscription */
export function useIsPaid() {
    const [isPaid, setIsPaid] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const check = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) { setLoading(false); return; }

                const { data: profile } = await supabase
                    .from("profiles")
                    .select("is_paid")
                    .eq("id", user.id)
                    .maybeSingle();

                setIsPaid(profile?.is_paid === true);
            } catch {
                setIsPaid(false);
            } finally {
                setLoading(false);
            }
        };
        check();
    }, []);

    return { isPaid, loading };
}
