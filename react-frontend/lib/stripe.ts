import { loadStripe } from '@stripe/stripe-js'

export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      '3 AI consultant queries per day',
      'Basic cloud recommendation',
      'Market data access',
      'Cost estimator',
    ],
    limits: {
      aiQueriesPerDay: 3,
      savedReports: 1,
    },
  },
  pro: {
    name: 'Pro',
    price: 19,
    priceId: 'price_pro_monthly',
    features: [
      'Unlimited AI consultant queries',
      'Full personalized recommendations',
      'Unlimited saved reports',
      'Week-by-week deployment roadmap',
      'Migration complexity analysis',
      'Executive PDF reports',
      'Priority support',
    ],
    limits: {
      aiQueriesPerDay: -1,
      savedReports: -1,
    },
  },
  business: {
    name: 'Business',
    price: 79,
    priceId: 'price_business_monthly',
    features: [
      'Everything in Pro',
      'Team sharing (up to 10 seats)',
      'API access',
      'White-label reports',
      'Cloud billing integration',
      'Dedicated support',
      'Custom compliance reports',
    ],
    limits: {
      aiQueriesPerDay: -1,
      savedReports: -1,
    },
  },
}
