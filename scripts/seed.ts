import mongoose from "mongoose";
import { connectDB } from "../src/lib/db";
import { PRO_AVATARS, resolveProfessionalAvatar } from "../src/lib/images";
import { slugify } from "../src/lib/utils";
import { User } from "../src/models/User";
import { Professional } from "../src/models/Professional";
import { Service } from "../src/models/Service";
import { Booking } from "../src/models/Booking";
import { Review } from "../src/models/Review";

const services = [
  {
    name: "Home Cleaning",
    category: "cleaning",
    description:
      "Trained professionals for deep home cleaning with eco-friendly products and transparent pricing.",
    startingPrice: 599,
    popular: true,
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
    features: ["Verified pros", "Eco products", "Same-day slots"],
    packages: [
      {
        name: "Studio / 1BHK",
        description: "Ideal for compact homes",
        price: 599,
        durationMins: 90,
        includes: ["Kitchen", "Bathroom", "Living area", "Dusting"],
      },
      {
        name: "2BHK Deep Clean",
        description: "Most booked package",
        price: 999,
        durationMins: 150,
        includes: ["All rooms", "Kitchen deep clean", "Bathrooms", "Balcony"],
      },
      {
        name: "3BHK Premium",
        description: "Full home sanitize",
        price: 1499,
        durationMins: 210,
        includes: ["Everything in 2BHK", "Sofa wipe", "Appliance exteriors"],
      },
    ],
    addons: [
      { name: "Sofa shampoo", price: 399, description: "Per 3-seater" },
      { name: "Fridge clean", price: 249, description: "Interior + exterior" },
      { name: "Mattress clean", price: 349, description: "Single mattress" },
    ],
    faqs: [
      {
        question: "Do I need to provide cleaning materials?",
        answer: "No. Pros bring professional-grade supplies.",
      },
      {
        question: "Can I reschedule?",
        answer: "Yes, free reschedule up to 2 hours before the slot.",
      },
    ],
  },
  {
    name: "Bathroom Cleaning",
    category: "cleaning",
    description: "Hard-water stain removal and bathroom sanitization.",
    startingPrice: 449,
    popular: true,
    image:
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
    features: ["Stain removal", "Sanitized finish"],
    packages: [
      {
        name: "1 Bathroom",
        description: "Complete bathroom deep clean",
        price: 449,
        durationMins: 60,
        includes: ["Tiles", "Fixtures", "Floor", "Mirror"],
      },
      {
        name: "2 Bathrooms",
        description: "Two bathroom package",
        price: 799,
        durationMins: 100,
        includes: ["Everything for 2 bathrooms"],
      },
    ],
    addons: [{ name: "Kitchen sink scrub", price: 149, description: "" }],
    faqs: [],
  },
  {
    name: "Plumbing",
    category: "plumbing",
    description: "Leak fixes, fittings, and bathroom plumbing by certified experts.",
    startingPrice: 299,
    popular: true,
    image:
      "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=1200&q=80",
    features: ["Visit charge adjustable", "Genuine parts"],
    packages: [
      {
        name: "Inspection Visit",
        description: "Diagnose the issue",
        price: 299,
        durationMins: 45,
        includes: ["Inspection", "Quote for repair"],
      },
      {
        name: "Leak Repair",
        description: "Common leak fixes",
        price: 499,
        durationMins: 90,
        includes: ["Labour", "Basic fittings"],
      },
    ],
    addons: [{ name: "Tap replacement labour", price: 199, description: "" }],
    faqs: [],
  },
  {
    name: "Electrical Work",
    category: "electrical",
    description: "Safe electrical repairs, wiring, and installation services.",
    startingPrice: 249,
    popular: true,
    image:
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80",
    features: ["Licensed electricians", "Safety-first"],
    packages: [
      {
        name: "Switch / Socket Fix",
        description: "Repair or replace",
        price: 249,
        durationMins: 40,
        includes: ["Diagnosis", "Labour"],
      },
      {
        name: "Fan Installation",
        description: "Ceiling fan install",
        price: 399,
        durationMins: 60,
        includes: ["Installation labour"],
      },
    ],
    addons: [{ name: "MCB check", price: 149, description: "" }],
    faqs: [],
  },
  {
    name: "AC Service & Repair",
    category: "appliance",
    description: "AC servicing, gas refill, and repair by trained technicians.",
    startingPrice: 449,
    popular: true,
    image:
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80",
    features: ["Same-day available", "Spare parts warranty"],
    packages: [
      {
        name: "AC Service",
        description: "Jet pump + filter clean",
        price: 449,
        durationMins: 60,
        includes: ["Filter clean", "Coil clean", "Performance check"],
      },
      {
        name: "AC Repair Visit",
        description: "Diagnosis + labour",
        price: 299,
        durationMins: 45,
        includes: ["Inspection", "Repair quote"],
      },
    ],
    addons: [{ name: "Gas top-up (per unit)", price: 1800, description: "" }],
    faqs: [],
  },
  {
    name: "Painting",
    category: "painting",
    description: "Interior painting with neat finishes and protected flooring.",
    startingPrice: 12,
    popular: false,
    image:
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1200&q=80",
    features: ["Colour consult", "Furniture cover"],
    packages: [
      {
        name: "1 Room Paint",
        description: "Per room estimate",
        price: 2499,
        durationMins: 480,
        includes: ["Labour", "Masking", "2 coats"],
      },
    ],
    addons: [{ name: "Putty touch-up", price: 499, description: "" }],
    faqs: [],
  },
  {
    name: "Carpentry",
    category: "carpentry",
    description: "Furniture repair, fittings, and custom woodwork.",
    startingPrice: 349,
    popular: false,
    image:
      "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1200&q=80",
    features: ["On-site estimate"],
    packages: [
      {
        name: "Door / Hinge Fix",
        description: "Common carpentry repairs",
        price: 349,
        durationMins: 60,
        includes: ["Labour"],
      },
    ],
    addons: [],
    faqs: [],
  },
  {
    name: "Pest Control",
    category: "pest-control",
    description: "Safe pest treatments for homes and kitchens.",
    startingPrice: 999,
    popular: false,
    image:
      "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=1200&q=80",
    features: ["Pet-safe options", "Follow-up visit"],
    packages: [
      {
        name: "General Pest Control",
        description: "2BHK coverage",
        price: 999,
        durationMins: 90,
        includes: ["Spray treatment", "Advice"],
      },
    ],
    addons: [{ name: "Kitchen focus", price: 299, description: "" }],
    faqs: [],
  },
  {
    name: "Moving & Packing",
    category: "moving",
    description: "Careful packing and local shifting with trained movers.",
    startingPrice: 1999,
    popular: false,
    image:
      "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?auto=format&fit=crop&w=1200&q=80",
    features: ["Insured options", "Packaging materials"],
    packages: [
      {
        name: "Studio Move",
        description: "Within city",
        price: 1999,
        durationMins: 240,
        includes: ["Packing labour", "Loading"],
      },
    ],
    addons: [{ name: "Extra helpers", price: 499, description: "Per helper" }],
    faqs: [],
  },
  {
    name: "Garden Maintenance",
    category: "gardening",
    description: "Lawn care, plant health, and balcony garden setups.",
    startingPrice: 499,
    popular: false,
    image:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80",
    features: ["Seasonal tips"],
    packages: [
      {
        name: "Balcony Garden Care",
        description: "Monthly style visit",
        price: 499,
        durationMins: 90,
        includes: ["Pruning", "Soil check", "Watering setup"],
      },
    ],
    addons: [],
    faqs: [],
  },
  {
    name: "Salon at Home - Women",
    category: "beauty",
    description: "Hair, waxing, facial and manicure packages at your doorstep.",
    startingPrice: 399,
    popular: true,
    image:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
    features: ["Sanitized kits", "Trained beauticians"],
    packages: [
      {
        name: "Cleanup + Threading",
        description: "Quick glow package",
        price: 399,
        durationMins: 45,
        includes: ["Cleanup", "Threading", "Basic massage"],
      },
      {
        name: "Waxing Full Arms + Legs",
        description: "Most booked",
        price: 799,
        durationMins: 75,
        includes: ["Full arms", "Full legs", "Underarms"],
      },
      {
        name: "Bridal Glow Facial",
        description: "Premium facial",
        price: 1499,
        durationMins: 90,
        includes: ["Cleanse", "Scrub", "Mask", "Massage"],
      },
    ],
    addons: [
      { name: "Hair wash & blow dry", price: 349, description: "" },
      { name: "Pedicure", price: 449, description: "" },
    ],
    faqs: [],
  },
  {
    name: "Men's Grooming",
    category: "beauty",
    description: "Haircut, beard styling and grooming at home.",
    startingPrice: 299,
    popular: true,
    image:
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1200&q=80",
    features: ["Disposable kits", "Experienced stylists"],
    packages: [
      {
        name: "Haircut",
        description: "Classic cut",
        price: 299,
        durationMins: 30,
        includes: ["Haircut", "Styling"],
      },
      {
        name: "Haircut + Beard",
        description: "Complete look",
        price: 449,
        durationMins: 45,
        includes: ["Haircut", "Beard trim", "Styling"],
      },
    ],
    addons: [{ name: "Head massage", price: 149, description: "" }],
    faqs: [],
  },
  {
    name: "Sofa & Carpet Cleaning",
    category: "cleaning",
    description: "Deep shampoo for sofas, carpets and mattresses.",
    startingPrice: 499,
    popular: true,
    image:
      "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=1200&q=80",
    features: ["Dry in hours", "Stain treatment"],
    packages: [
      {
        name: "3-Seater Sofa",
        description: "Shampoo + dry",
        price: 499,
        durationMins: 60,
        includes: ["Vacuum", "Shampoo", "Spot clean"],
      },
      {
        name: "Carpet up to 50 sq ft",
        description: "Deep clean",
        price: 699,
        durationMins: 75,
        includes: ["Vacuum", "Shampoo", "Deodorize"],
      },
    ],
    addons: [{ name: "Mattress single", price: 349, description: "" }],
    faqs: [],
  },
  {
    name: "Kitchen Deep Cleaning",
    category: "cleaning",
    description: "Degrease chimneys, cabinets and kitchen surfaces.",
    startingPrice: 699,
    popular: false,
    image:
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80",
    features: ["Chimney clean", "Cabinet wipe"],
    packages: [
      {
        name: "Standard Kitchen",
        description: "Full kitchen deep clean",
        price: 699,
        durationMins: 120,
        includes: ["Cabinets", "Sink", "Countertops", "Floor"],
      },
      {
        name: "Kitchen + Chimney",
        description: "Includes chimney degrease",
        price: 1099,
        durationMins: 150,
        includes: ["Everything in Standard", "Chimney deep clean"],
      },
    ],
    addons: [],
    faqs: [],
  },
  {
    name: "Fridge Repair",
    category: "appliance",
    description: "Cooling issues, gas refill and fridge repairs.",
    startingPrice: 299,
    popular: false,
    image:
      "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=1200&q=80",
    features: ["All brands", "Genuine parts"],
    packages: [
      {
        name: "Inspection Visit",
        description: "Diagnose cooling issues",
        price: 299,
        durationMins: 40,
        includes: ["Inspection", "Quote"],
      },
      {
        name: "Minor Repair",
        description: "Common fixes",
        price: 599,
        durationMins: 90,
        includes: ["Labour"],
      },
    ],
    addons: [{ name: "Gas refill", price: 1200, description: "" }],
    faqs: [],
  },
  {
    name: "Washing Machine Repair",
    category: "appliance",
    description: "Drum, motor, drainage and installation support.",
    startingPrice: 299,
    popular: false,
    image:
      "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=1200&q=80",
    features: ["Same-day slots"],
    packages: [
      {
        name: "Inspection Visit",
        description: "Find the issue",
        price: 299,
        durationMins: 40,
        includes: ["Inspection", "Quote"],
      },
    ],
    addons: [],
    faqs: [],
  },
  {
    name: "Geyser / Water Heater",
    category: "appliance",
    description: "Installation, repair and servicing for geysers.",
    startingPrice: 249,
    popular: false,
    image:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
    features: ["Safety check"],
    packages: [
      {
        name: "Service",
        description: "Cleaning + check",
        price: 349,
        durationMins: 45,
        includes: ["Descaling", "Safety check"],
      },
      {
        name: "Installation",
        description: "New geyser install",
        price: 499,
        durationMins: 60,
        includes: ["Installation labour"],
      },
    ],
    addons: [],
    faqs: [],
  },
  {
    name: "Water Purifier Service",
    category: "appliance",
    description: "RO/UV filter change, servicing and installation.",
    startingPrice: 399,
    popular: true,
    image:
      "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=1200&q=80",
    features: ["Filter check", "TDS test"],
    packages: [
      {
        name: "Annual Service",
        description: "Full service visit",
        price: 399,
        durationMins: 45,
        includes: ["Filter check", "Cleaning", "TDS test"],
      },
      {
        name: "Filter Replacement Labour",
        description: "Labour only",
        price: 249,
        durationMins: 40,
        includes: ["Labour"],
      },
    ],
    addons: [{ name: "Sediment filter", price: 350, description: "" }],
    faqs: [],
  },
  {
    name: "Laundry & Ironing",
    category: "laundry",
    description: "Wash, dry and iron for everyday clothes and linens.",
    startingPrice: 199,
    popular: true,
    image:
      "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=1200&q=80",
    features: ["Pickup available", "Care labels followed"],
    packages: [
      {
        name: "10 Garments Wash & Iron",
        description: "Everyday wear",
        price: 399,
        durationMins: 1440,
        includes: ["Wash", "Dry", "Iron"],
      },
      {
        name: "Iron Only - 10 pieces",
        description: "Quick press",
        price: 199,
        durationMins: 120,
        includes: ["Ironing"],
      },
    ],
    addons: [{ name: "Delicate item", price: 79, description: "Per piece" }],
    faqs: [],
  },
  {
    name: "Dry Cleaning",
    category: "laundry",
    description: "Suits, sarees and delicate garments handled carefully.",
    startingPrice: 149,
    popular: false,
    image:
      "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=1200&q=80",
    features: ["Delicate care"],
    packages: [
      {
        name: "Shirt / Top",
        description: "Per piece",
        price: 149,
        durationMins: 2880,
        includes: ["Dry clean", "Press"],
      },
      {
        name: "Suit 2-piece",
        description: "Jacket + trousers",
        price: 449,
        durationMins: 2880,
        includes: ["Dry clean", "Press"],
      },
    ],
    addons: [],
    faqs: [],
  },
  {
    name: "Fan Installation",
    category: "electrical",
    description: "Ceiling and exhaust fan installation and repair.",
    startingPrice: 199,
    popular: false,
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80",
    features: ["Safety first"],
    packages: [
      {
        name: "Ceiling Fan Install",
        description: "Labour only",
        price: 349,
        durationMins: 45,
        includes: ["Installation"],
      },
      {
        name: "Fan Repair",
        description: "Noise / speed issues",
        price: 249,
        durationMins: 40,
        includes: ["Diagnosis", "Labour"],
      },
    ],
    addons: [],
    faqs: [],
  },
  {
    name: "Tap & Mixer Fix",
    category: "plumbing",
    description: "Tap replacement, mixer repair and leak stops.",
    startingPrice: 199,
    popular: false,
    image:
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=80",
    features: ["Quick visit"],
    packages: [
      {
        name: "Tap Replacement Labour",
        description: "Labour only",
        price: 199,
        durationMins: 30,
        includes: ["Labour"],
      },
      {
        name: "Mixer Repair",
        description: "Common mixer fixes",
        price: 349,
        durationMins: 45,
        includes: ["Labour"],
      },
    ],
    addons: [],
    faqs: [],
  },
  {
    name: "Wall Painting - Room",
    category: "painting",
    description: "Fresh coats for a single room with neat masking.",
    startingPrice: 1999,
    popular: false,
    image:
      "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&q=80",
    features: ["Furniture cover", "2 coats"],
    packages: [
      {
        name: "1 Room Labour",
        description: "Paint not included",
        price: 1999,
        durationMins: 480,
        includes: ["Masking", "2 coats labour"],
      },
    ],
    addons: [{ name: "Putty touch-up", price: 499, description: "" }],
    faqs: [],
  },
  {
    name: "Furniture Assembly",
    category: "carpentry",
    description: "Assemble beds, wardrobes and flat-pack furniture.",
    startingPrice: 399,
    popular: false,
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
    features: ["Tools included"],
    packages: [
      {
        name: "Bed / Wardrobe Assemble",
        description: "Standard flat-pack",
        price: 599,
        durationMins: 120,
        includes: ["Assembly labour"],
      },
      {
        name: "Small Furniture",
        description: "Table / chair / shelf",
        price: 399,
        durationMins: 60,
        includes: ["Assembly labour"],
      },
    ],
    addons: [],
    faqs: [],
  },
  {
    name: "Termite Control",
    category: "pest-control",
    description: "Targeted termite treatment for wood and walls.",
    startingPrice: 1499,
    popular: false,
    image:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
    features: ["Follow-up visit"],
    packages: [
      {
        name: "2BHK Termite Treatment",
        description: "Drill & inject",
        price: 2499,
        durationMins: 180,
        includes: ["Treatment", "Advice"],
      },
    ],
    addons: [],
    faqs: [],
  },
  {
    name: "AC Installation",
    category: "hvac",
    description: "Split AC installation and gas charging support.",
    startingPrice: 999,
    popular: false,
    image:
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80",
    features: ["Copper piping labour"],
    packages: [
      {
        name: "Split AC Install",
        description: "Standard install labour",
        price: 1499,
        durationMins: 180,
        includes: ["Indoor + outdoor mount", "Basic piping labour"],
      },
    ],
    addons: [{ name: "Extra piping labour", price: 299, description: "Per metre" }],
    faqs: [],
  },
];

const professionals = [
  {
    name: "Rajesh Kumar",
    profession: "Deep Cleaning Specialist",
    category: "cleaning",
    priceAmount: 800,
    experience: "5+ years",
    location: "Andheri West, Mumbai",
    skills: ["Deep Cleaning", "Carpet Cleaning", "Kitchen Deep Clean"],
    rating: 4.8,
    totalReviews: 127,
    avatar: PRO_AVATARS[0],
  },
  {
    name: "Priya Sharma",
    profession: "Home Cleaning Expert",
    category: "cleaning",
    priceAmount: 600,
    experience: "3+ years",
    location: "Bandra East, Mumbai",
    skills: ["Regular Cleaning", "Move-in Cleaning", "Window Cleaning"],
    rating: 4.9,
    totalReviews: 89,
    avatar: PRO_AVATARS[1],
  },
  {
    name: "Amit Patel",
    profession: "Plumbing Expert",
    category: "plumbing",
    priceAmount: 500,
    experience: "7+ years",
    location: "Powai, Mumbai",
    skills: ["Pipe Repair", "Leak Fix", "Bathroom Fitting"],
    rating: 4.7,
    totalReviews: 143,
    avatar: PRO_AVATARS[2],
  },
  {
    name: "Vikash Singh",
    profession: "Licensed Electrician",
    category: "electrical",
    priceAmount: 400,
    experience: "8+ years",
    location: "Dadar, Mumbai",
    skills: ["Wiring", "Switch Repair", "MCB Installation"],
    rating: 4.6,
    totalReviews: 98,
    avatar: PRO_AVATARS[3],
  },
  {
    name: "Suresh Verma",
    profession: "AC Technician",
    category: "appliance",
    priceAmount: 600,
    experience: "6+ years",
    location: "Malad West, Mumbai",
    skills: ["AC Repair", "Gas Refill", "AC Installation"],
    rating: 4.8,
    totalReviews: 211,
    avatar: PRO_AVATARS[4],
  },
  {
    name: "Neha Joshi",
    profession: "Interior Painter",
    category: "painting",
    priceAmount: 900,
    experience: "4+ years",
    location: "Thane, Mumbai",
    skills: ["Wall painting", "Texture", "Colour matching"],
    rating: 4.5,
    totalReviews: 54,
    avatar: PRO_AVATARS[5],
  },
  {
    name: "Ravi Deshmukh",
    profession: "Carpenter",
    category: "carpentry",
    priceAmount: 550,
    experience: "9+ years",
    location: "Goregaon, Mumbai",
    skills: ["Furniture repair", "Modular fittings"],
    rating: 4.6,
    totalReviews: 76,
    avatar: PRO_AVATARS[6],
  },
  {
    name: "Farhan Ali",
    profession: "Pest Control Specialist",
    category: "pest-control",
    priceAmount: 1100,
    experience: "5+ years",
    location: "Kurla, Mumbai",
    skills: ["General pest", "Termite", "Kitchen treatment"],
    rating: 4.4,
    totalReviews: 62,
    avatar: PRO_AVATARS[7],
  },
  {
    name: "Kavita Nair",
    profession: "Moving Supervisor",
    category: "moving",
    priceAmount: 1500,
    experience: "6+ years",
    location: "Navi Mumbai",
    skills: ["Packing", "Local shifting", "Fragile handling"],
    rating: 4.7,
    totalReviews: 41,
    avatar: PRO_AVATARS[8],
  },
  {
    name: "Anil More",
    profession: "Garden Expert",
    category: "gardening",
    priceAmount: 500,
    experience: "10+ years",
    location: "Borivali, Mumbai",
    skills: ["Lawn care", "Plant health", "Balcony gardens"],
    rating: 4.8,
    totalReviews: 33,
    avatar: PRO_AVATARS[9],
  },
  {
    name: "Meera Kapoor",
    profession: "Beautician",
    category: "beauty",
    priceAmount: 700,
    experience: "6+ years",
    location: "Juhu, Mumbai",
    skills: ["Facial", "Waxing", "Cleanup", "Manicure"],
    rating: 4.9,
    totalReviews: 156,
    avatar: PRO_AVATARS[10],
  },
  {
    name: "Arjun Mehta",
    profession: "Men's Grooming Stylist",
    category: "beauty",
    priceAmount: 450,
    experience: "4+ years",
    location: "Lower Parel, Mumbai",
    skills: ["Haircut", "Beard styling", "Hair colour"],
    rating: 4.7,
    totalReviews: 88,
    avatar: PRO_AVATARS[11],
  },
  {
    name: "Sana Qureshi",
    profession: "Laundry Specialist",
    category: "laundry",
    priceAmount: 350,
    experience: "5+ years",
    location: "Santacruz, Mumbai",
    skills: ["Wash & iron", "Dry clean prep", "Delicate care"],
    rating: 4.6,
    totalReviews: 47,
    avatar: PRO_AVATARS[12],
  },
];

async function seed() {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    await Promise.all([
      User.deleteMany({}),
      Professional.deleteMany({}),
      Service.deleteMany({}),
      Booking.deleteMany({}),
      Review.deleteMany({}),
    ]);
    console.log("Cleared collections");

    // Plain passwords — User pre-save hook hashes once
    const demoUser = await User.create({
      name: "Demo User",
      email: "demo.user@sheease.com",
      password: "user123",
      phone: "+91 98765 00001",
      type: "user",
      isVerified: true,
      addresses: [
        {
          label: "Home",
          street: "14, Palm Residency, Andheri West",
          city: "Mumbai",
          pincode: "400053",
          state: "Maharashtra",
          isDefault: true,
        },
      ],
    });

    const demoProUser = await User.create({
      name: "Demo Professional",
      email: "demo.pro@sheease.com",
      password: "pro123",
      phone: "+91 98765 00002",
      type: "professional",
      isVerified: true,
    });

    await User.create({
      name: "SheEase Admin",
      email: "admin@sheease.com",
      password: "admin123",
      phone: "+91 98765 00000",
      type: "admin",
      isVerified: true,
    });

    const serviceDocs = await Service.insertMany(
      services.map((s) => ({
        ...s,
        slug: slugify(s.name),
        icon: s.category,
        rating: 4.6 + Math.random() * 0.3,
        totalBookings: Math.floor(80 + Math.random() * 400),
      }))
    );

    const proDocs: Array<{ _id: mongoose.Types.ObjectId }> = [];
    for (const p of professionals) {
      const email = `${p.name.toLowerCase().replace(/\s+/g, ".")}@sheease.com`;
      const u = await User.create({
        name: p.name,
        email,
        password: "pro123",
        phone: "+91 98765 11111",
        type: "professional",
        isVerified: true,
      });

      const doc = await Professional.create({
        user: u._id,
        name: p.name,
        email,
        phone: u.phone,
        profession: p.profession,
        category: p.category,
        description: `${p.profession} with ${p.experience} of experience serving Mumbai homes.`,
        bio: `Trusted ${p.profession.toLowerCase()} focused on punctuality and quality finishes.`,
        skills: p.skills,
        experience: p.experience,
        price: `₹${p.priceAmount}/visit`,
        priceAmount: p.priceAmount,
        location: p.location,
        city: "Mumbai",
        serviceArea: ["Mumbai", "Thane", "Navi Mumbai"],
        avatar: p.avatar || resolveProfessionalAvatar(null, p.name),
        verified: true,
        verificationStatus: "approved",
        workingHours: {
          start: "09:00",
          end: "18:00",
          days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        },
        isAvailable: true,
        rating: p.rating,
        totalReviews: p.totalReviews,
        completedBookings: Math.floor(p.totalReviews * 1.2),
        earnings: Math.floor(p.totalReviews * p.priceAmount * 0.8),
      });
      proDocs.push(doc);
    }

    await Professional.create({
      user: demoProUser._id,
      name: "Demo Professional",
      email: "demo.pro@sheease.com",
      phone: "+91 98765 00002",
      profession: "Multi-Service Expert",
      category: "cleaning",
      description: "Experienced across cleaning and home maintenance jobs.",
      bio: "Your reliable SheEase partner for quality home services.",
      skills: ["Cleaning", "Plumbing basics", "Electrical basics"],
      experience: "4+ years",
      price: "₹700/visit",
      priceAmount: 700,
      location: "Mumbai",
      city: "Mumbai",
      serviceArea: ["Mumbai"],
      avatar: PRO_AVATARS[13],
      verified: true,
      verificationStatus: "approved",
      workingHours: {
        start: "09:00",
        end: "19:00",
        days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      },
      isAvailable: true,
      rating: 4.5,
      totalReviews: 45,
      completedBookings: 52,
      earnings: 36400,
    });

    const cleaningService = serviceDocs.find((s) => s.category === "cleaning");
    const assignedPro = proDocs[0];

    if (cleaningService && assignedPro) {
      const booking = await Booking.create({
        user: demoUser._id,
        professional: assignedPro._id,
        serviceRef: cleaningService._id,
        service: {
          name: cleaningService.name,
          category: cleaningService.category,
          packageName: "2BHK Deep Clean",
          addons: ["Sofa shampoo"],
        },
        date: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
        time: "11:00 AM",
        address: {
          street: "14, Palm Residency, Andheri West",
          city: "Mumbai",
          pincode: "400053",
          state: "Maharashtra",
          full: "14, Palm Residency, Andheri West, Mumbai 400053",
        },
        phone: demoUser.phone,
        status: "confirmed",
        statusHistory: [
          { status: "pending", at: new Date(Date.now() - 86400000), note: "Booking created" },
          { status: "confirmed", at: new Date(), note: "Professional confirmed" },
        ],
        payment: {
          method: "upi",
          status: "paid",
          baseCost: 1398,
          discount: 280,
          taxes: 201,
          total: 1319,
          promoCode: "SAVE20",
          paidAt: new Date(),
        },
      });

      await Booking.create({
        user: demoUser._id,
        professional: proDocs[2]._id,
        serviceRef: serviceDocs.find((s) => s.category === "plumbing")?._id,
        service: {
          name: "Plumbing",
          category: "plumbing",
          packageName: "Leak Repair",
          addons: [],
        },
        date: new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10),
        time: "03:00 PM",
        address: {
          street: "14, Palm Residency, Andheri West",
          city: "Mumbai",
          pincode: "400053",
          state: "Maharashtra",
          full: "14, Palm Residency, Andheri West, Mumbai 400053",
        },
        phone: demoUser.phone,
        status: "completed",
        statusHistory: [
          { status: "pending", at: new Date(Date.now() - 7 * 86400000), note: "Booking created" },
          { status: "completed", at: new Date(Date.now() - 5 * 86400000), note: "Job completed" },
        ],
        payment: {
          method: "cash",
          status: "paid",
          baseCost: 499,
          discount: 0,
          taxes: 90,
          total: 589,
          promoCode: "",
          paidAt: new Date(Date.now() - 5 * 86400000),
        },
        isReviewed: true,
      });

      console.log("Sample bookings created:", booking.bookingId);
    }

    console.log("\nSeeding complete");
    console.log("Customer: demo.user@sheease.com / user123");
    console.log("Pro:      demo.pro@sheease.com / pro123");
    console.log("Admin:    admin@sheease.com / admin123");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
