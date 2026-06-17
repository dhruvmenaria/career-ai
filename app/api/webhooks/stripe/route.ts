import { NextRequest, NextResponse } from 'next/server';
import { getStripe, hasStripeConfig } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  if (!hasStripeConfig()) {
    // Not configured — return 200 so Stripe doesn't retry
    return NextResponse.json({ received: true, note: 'Stripe not configured.' });
  }

  const body = await req.text();
  const sig = req.headers.get('stripe-signature') ?? '';

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET ?? ''
    );
  } catch (err) {
    console.error('[stripe webhook] signature verification failed', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.CheckoutSession;
        const userId = session.metadata?.userId;
        if (!userId || !session.subscription) break;

        const sub = await getStripe().subscriptions.retrieve(session.subscription as string);
        await prisma.user.update({
          where: { id: userId },
          data: {
            stripeSubId: sub.id,
            stripePriceId: sub.items.data[0]?.price.id,
            subStatus: 'active',
            subCurrentPeriodEnd: new Date((sub as any).current_period_end * 1000),
          },
        });
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const user = await prisma.user.findFirst({ where: { stripeSubId: sub.id } });
        if (!user) break;

        await prisma.user.update({
          where: { id: user.id },
          data: {
            subStatus: sub.status,
            subCurrentPeriodEnd: new Date((sub as any).current_period_end * 1000),
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const user = await prisma.user.findFirst({ where: { stripeSubId: sub.id } });
        if (!user) break;

        await prisma.user.update({
          where: { id: user.id },
          data: { subStatus: 'free', stripeSubId: null, stripePriceId: null },
        });
        break;
      }

      default:
        // Unhandled event types — silently ignore
        break;
    }
  } catch (err) {
    console.error('[stripe webhook] handler error', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
