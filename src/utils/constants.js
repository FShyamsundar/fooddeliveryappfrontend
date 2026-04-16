// Default images and constants for the application
export const DEFAULT_RESTAURANT_IMAGE =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop";

export const DEFAULT_RESTAURANT_IMAGES = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop",
];

// Currency symbol
export const CURRENCY_SYMBOL = "₹";

// Available coupon codes
export const COUPON_CODES = {
  WELCOME10: {
    discount: 10,
    type: "percentage",
    description: "10% off on total order",
  },
  FLAT50: { discount: 50, type: "fixed", description: "Flat ₹50 off" },
  FREEDEL: {
    discount: "delivery",
    type: "delivery",
    description: "Free delivery",
  },
};

export const getPrimaryImage = (images) => {
  if (!images) return DEFAULT_RESTAURANT_IMAGE;
  const firstValid = images.find(
    (img) => typeof img === "string" && img.trim(),
  );
  return firstValid || DEFAULT_RESTAURANT_IMAGE;
};
