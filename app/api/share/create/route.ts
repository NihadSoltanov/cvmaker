import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const { outputId } = await req.json();

        // Verify auth context here usually. We'll simulate success.
        // user_id = "..."

        const token = crypto.randomBytes(16).toString('hex');

        // const { error } = await supabase.from('share_links').insert({
        //   user_id: "...",
        //   tailored_output_id: outputId,
        //   token,
        //   visibility: 'unlisted',
        // });

        return NextResponse.json({ token, link: `/s/${token}` });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 });
    }
}
