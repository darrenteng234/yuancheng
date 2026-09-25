/**
 * English dictionary — the CANONICAL shape. Other locales implement `Dictionary`
 * so TypeScript flags any missing key. This is the single source of customer copy;
 * there is one page tree ([locale]) consuming it, never duplicated page folders.
 */
export const en = {
  common: {
    appName: 'Yuancheng',
    tagline: 'Devotion, delivered.',
    loading: 'Loading…',
    error: 'Something went wrong',
    retry: 'Try again',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    search: 'Search',
    empty: 'Nothing here yet',
    currencyPrefix: 'RM',
  },
  nav: {
    discover: 'Discover',
    howItWorks: 'How it works',
    faq: 'FAQ',
    myOrders: 'My orders',
    signIn: 'Sign in',
    providerPortal: 'Provider portal',
  },
  home: {
    heroTitle: 'Yuancheng',
    heroSubtitle: 'Sincere temple and service offerings, fulfilled on your behalf — with photo and video evidence for every order.',
    ctaDiscover: 'How it works',
    ctaProvider: 'Become a provider',
    featureFulfilment: 'Verified fulfilment',
    featureFulfilmentDesc: 'Every order is carried out by a vetted fulfiller and documented.',
    featureEvidence: 'Completion evidence',
    featureEvidenceDesc: 'Photos and video are uploaded so you can see it was done.',
    featureTracking: 'Track anytime',
    featureTrackingDesc: 'Follow your order from payment to completion with a secure link.',
  },
  howItWorks: {
    title: 'How it works',
    intro: 'From order to completion, every step is documented.',
    steps: [
      { title: 'Choose an offering', body: 'Pick a service and option from a provider’s storefront.' },
      { title: 'Pay securely', body: 'Checkout is handled through Stripe. The amount is fixed by the provider.' },
      { title: 'We fulfil it', body: 'A vetted fulfiller carries out the offering on your behalf.' },
      { title: 'See the evidence', body: 'Photos and video are uploaded and reviewed before completion.' },
    ],
  },
  faq: {
    title: 'Frequently asked questions',
    items: [
      { q: 'How do I know my order was fulfilled?', a: 'Every order includes photo/video evidence, reviewed before it is marked complete.' },
      { q: 'How do I track my order?', a: 'Use the secure tracking link shown after checkout — no account required.' },
      { q: 'Can I get a refund?', a: 'Yes, subject to our refund policy. Contact us with your order number.' },
      { q: 'Do you guarantee outcomes?', a: 'We facilitate temple-related services. We do not guarantee religious or spiritual outcomes.' },
    ],
  },
  about: {
    title: 'About Yuancheng',
    body: 'Independent providers carry out offerings and ceremonies on your behalf, with photo and video records on completion. Yuancheng connects you with places and independent providers; providers publish their services and we help deliver them with transparent records.',
  },
  terms: {
    title: 'Terms of service',
    body: 'By using Yuancheng you agree that we facilitate temple-related services and do not guarantee religious or spiritual outcomes. Orders are fulfilled on a best-effort basis by vetted fulfillers. Prices are set by providers. Full terms are provided at checkout.',
  },
  refund: {
    title: 'Refund policy',
    body: 'If a provider cannot complete an order, the provider refunds you directly. Yuancheng does not collect or transfer funds. Contact the provider with your order number to arrange it.',
  },
  order: {
    status: {
      draft: 'Draft',
      pending_payment: 'Pending payment',
      payment_failed: 'Payment failed',
      paid: 'Paid',
      accepted: 'Accepted',
      in_progress: 'In progress',
      evidence_submitted: 'Evidence submitted',
      under_review: 'Under review',
      completed: 'Completed',
      cancelled: 'Cancelled',
      refunded: 'Refunded',
      disputed: 'Disputed',
    },
    trackTitle: 'Track your order',
    trackIntro: 'Enter your order id and access token, or open the secure link from checkout.',
    orderNumber: 'Order number',
  },
  auth: {
    signInTitle: 'Sign in',
    registerTitle: 'Create account',
    name: 'Name',
    email: 'Email',
    password: 'Password',
    signIn: 'Sign in',
    register: 'Create account',
    toRegister: 'New here? Create an account',
    toSignIn: 'Already have an account? Sign in',
    invalid: 'Invalid email or password.',
  },
  provider: {
    dashboard: 'Dashboard',
    storefront: 'Storefront',
    products: 'Products',
    orders: 'Orders',
    payments: 'Payments',
    account: 'Account',
    skuLimitReached: 'You have reached your plan’s active-SKU limit.',
    upgrade: 'Upgrade plan',
  },
  checkout: {
    title: 'Checkout',
    pay: 'Pay',
    email: 'Email',
    payProcessing: 'Processing…',
  },
};

export type Dictionary = typeof en;
