import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/user';
import { getStripe, hasStripeConfig } from '@/lib/stripe';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  if (!hasStripeConfig()) {
    return NextResponse.json(
      { error: 'Billing is not configured on this server.' },
      { status: 503 }
    );
  }

  try {
    const user = await getOrCreateUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!user.stripeCustomerId) {
      return NextResponse.json({ error: 'No billing account found.' }, { status: 400 });
    }

    const stripe = getStripe();
    const origin = req.headers.get('origin') ?? 'http://localhost:3000';

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${origin}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[/api/billing/portal]', err);
    return NextResponse.json({ error: 'Failed to open billing portal.' }, { status: 500 });
  }
}
