export const CATEGORIES = [
  {
    id: "cleaning",
    name: "Cleaning",
    description: "Home & bathroom cleans",
    icon: "Sparkles",
  },
  {
    id: "beauty",
    name: "Beauty",
    description: "Salon & spa at home",
    icon: "Heart",
  },
  {
    id: "plumbing",
    name: "Plumbing",
    description: "Leaks & fittings",
    icon: "Wrench",
  },
  {
    id: "electrical",
    name: "Electrical",
    description: "Wiring & switches",
    icon: "Zap",
  },
  {
    id: "appliance",
    name: "Appliances",
    description: "AC, fridge, washer",
    icon: "AirVent",
  },
  {
    id: "painting",
    name: "Painting",
    description: "Walls & finishes",
    icon: "Paintbrush",
  },
  {
    id: "carpentry",
    name: "Carpentry",
    description: "Furniture repairs",
    icon: "Hammer",
  },
  {
    id: "pest-control",
    name: "Pest Control",
    description: "Safe treatments",
    icon: "Bug",
  },
  {
    id: "moving",
    name: "Moving",
    description: "Pack & shift",
    icon: "Truck",
  },
  {
    id: "laundry",
    name: "Laundry",
    description: "Wash & iron",
    icon: "Shirt",
  },
  {
    id: "gardening",
    name: "Gardening",
    description: "Plants & lawn",
    icon: "Flower2",
  },
  {
    id: "hvac",
    name: "HVAC",
    description: "Cooling & vents",
    icon: "Thermometer",
  },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const CITIES = ["Mumbai", "Pune", "Bengaluru", "Delhi", "Hyderabad"] as const;

export const TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
] as const;

export const PROMO_CODES: Record<string, number> = {
  SAVE20: 0.2,
  FIRST50: 0.15,
  SHEEASE10: 0.1,
};

export const TAX_RATE = 0.18;

export const SERVICE_CATEGORIES = CATEGORIES.map((c) => c.id);
