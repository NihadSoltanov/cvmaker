import { supabase } from './supabase';

/**
 * Basic usage checking. 
 * This requires server-side setup like fetching user context.
 */
export async function checkUsageLimit(userId: string, action: string) {
    const { data: usage, error } = await supabase
        .from('usage_events')
        .select('count')
        .eq('user_id', userId)
        .eq('feature', action);

    // Free accounts have max. 3 optimizes / month (stub logic, can be expanded)
    const totalUsed = usage?.reduce((acc, curr) => acc + curr.count, 0) || 0;

    return { allowed: totalUsed < 3, totalUsed };
}

export async function recordUsage(userId: string, action: string) {
    await supabase
        .from('usage_events')
        .insert([{ user_id: userId, feature: action, count: 1 }]);
}
