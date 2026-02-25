import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
// import { supabase } from '@/lib/supabase';

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
        case 'checkout.session.completed':
            // const session = event.data.object;
            // await supabase.from('subscriptions').update({ plan: 'pro', status: 'active' }).eq('user_id', session.client_reference_id)
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
