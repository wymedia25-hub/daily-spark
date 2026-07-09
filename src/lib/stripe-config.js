export const STRIPE_PRICES = {
  monthly: "price_1TofZMDfkQwONAzfPns0Ydo4",
  annual: "price_1TrA2EDfkQwONAzfejgtNZsj",
};

export const PLANS = [
  {
    id: "monthly",
    name: "Monthly",
    price: "$8",
    period: "/month",
    priceId: STRIPE_PRICES.monthly,
    highlighted: false,
  },
  {
    id: "annual",
    name: "Annual",
    price: "$49.99",
    period: "/year",
    priceId: STRIPE_PRICES.annual,
    highlighted: true,
    savings: "7-day free trial",
  },
];