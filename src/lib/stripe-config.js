export const STRIPE_PRICES = {
  monthly: "price_1TofZMDfkQwONAzfPns0Ydo4",
  annual: "price_1TofZLDfkQwONAzfHjHxqsRo",
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
    price: "$80",
    period: "/year",
    priceId: STRIPE_PRICES.annual,
    highlighted: true,
    savings: "Save 17%",
  },
];