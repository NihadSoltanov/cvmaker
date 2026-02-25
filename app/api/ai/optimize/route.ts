import { NextResponse } from 'next/server';
import { optimizeCV } from '@/lib/ai';
import { getCache, setCache } from '@/lib/cache';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const { resumeJson, jdText, language, tone, userId } = await req.json();

        // Hash inputs for caching
        const hash = crypto.createHash('sha256').update(JSON.stringify(resumeJson) + jdText + language + tone).digest('hex');
        const cached = getCache(hash);
        if (cached) {
            return NextResponse.json(cached);
        }

        const result = await optimizeCV(JSON.stringify(resumeJson), jdText, language, tone);

        // Save to cache
        setCache(hash, result);

        // Normally also record usage and save to DB
        // await recordUsage(userId, 'optimize');
        // await supabase.from('tailored_outputs').insert(...)

        return NextResponse.json(result);
    } catch (error) {
        console.error("AI Generation error:", error);
        return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
    }
}
