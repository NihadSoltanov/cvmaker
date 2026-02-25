import { NextResponse } from 'next/server';
import { checkUsageLimit } from '@/lib/rateLimit';

export async function POST(req: Request) {
    try {
        const { userId, action } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { allowed, totalUsed } = await checkUsageLimit(userId, action);

        if (!allowed) {
            return NextResponse.json({ allowed: false, error: 'Limit reached', totalUsed }, { status: 403 });
        }

        return NextResponse.json({ allowed: true, totalUsed });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to check usage' }, { status: 500 });
    }
}
