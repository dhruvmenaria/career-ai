import Stripe from 'stripe';

// Lazily initialised to avoid build-time errors when key is not set
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured.');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia' as any,
    });
  }
  return _stripe;
}

// Named export for direct use in server routes
export const stripe = {
  get customers() { return getStripe().customers; },
  get checkout() { return getStripe().checkout; },
  get billingPortal() { return getStripe().billingPortal; },
  get subscriptions() { return getStripe().subscriptions; },
  get webhooks() { return getStripe().webhooks; },
};

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    resumeLimit: 3,
    interviewLimit: 2,
  },
  pro: {
    name: 'Pro',
    price: 9,
    get priceId() { return process.env.STRIPE_PRO_PRICE_ID ?? ''; },
    resumeLimit: Infinity,
    interviewLimit: Infinity,
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export function getUserPlan(subStatus: string | null | undefined): PlanKey {
  return subStatus === 'active' ? 'pro' : 'free';
}

export function hasStripeConfig(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
