export const STRIPE_PRICES = {
  monthly: "price_1Tmps3PafCGLJe7BweuihuQ5",
  annual: "price_1Tmps3PafCGLJe7B2Cqfv4cI",
};

export const PLANS = [
  {
    id: "monthly",
    name: "Monthly",
    price: "$4.99",
    period: "/month",
    priceId: STRIPE_PRICES.monthly,
    highlighted: false,
  },
  {
    id: "annual",
    name: "Annual",
    price: "$29.99",
    period: "/year",
    priceId: STRIPE_PRICES.annual,
    highlighted: true,
    savings: "Save 50%",
  },
];