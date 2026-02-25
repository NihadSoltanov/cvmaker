import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
    try {
        const { userId } = await req.json();

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID_PRO_YEARLY,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.APP_URL}/dashboard?success=true`,
            cancel_url: `${process.env.APP_URL}/pricing?canceled=true`,
            client_reference_id: userId,
        });

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
