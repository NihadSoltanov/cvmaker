import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') as string;
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET || ''
        );
    } catch (error: any) {
        return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as any;
            const userId = session.client_reference_id || session.metadata?.userId;
            if (userId) {
                await supabaseAdmin.from('profiles').update({ is_paid: true }).eq('id', userId);
            }
            break;
        }
        case 'customer.subscription.deleted':
        case 'customer.subscription.updated': {
            const sub = event.data.object as any;
            const userId = sub.metadata?.userId;
            if (userId && event.type === 'customer.subscription.deleted') {
                await supabaseAdmin.from('profiles').update({ is_paid: false }).eq('id', userId);
            }
            break;
        }
        default:
            break;
    }

    return NextResponse.json({ received: true });
}

