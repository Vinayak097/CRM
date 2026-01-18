const locations = [
  {
    name: "Nachinola",
    slug: "nachinola",
    description: "Nachinola is an emerging gem in North Goa...",
    image:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
    coordinates: { lat: 15.595372, lng: 73.853831 },
    highlights: [
      "Nachinola",
      "Goa",
      "Investment Opportunity",
      "Premium Location",
    ],
    amenities: [
      { name: "Prime Location", icon: "location" },
      { name: "Investment Potential", icon: "trending-up" },
      { name: "Modern Amenities", icon: "home" },
    ],
    featured: false,
    propertyCount: 0,
    active: true,
  },
  {
    name: "Madakkal",
    slug: "madakkal",
    description:
      "Madakkal, located just 65 km from Bengaluru, is emerging as a preferred destination for sustainable living.",
    image:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
    coordinates: { lat: 12.8683, lng: 77.5301 },
    highlights: [
      "Madakkal",
      "KA",
      "Investment Opportunity",
      "Premium Location",
    ],
    amenities: [
      { name: "Prime Location", icon: "location" },
      { name: "Investment Potential", icon: "trending-up" },
      { name: "Modern Amenities", icon: "home" },
    ],
    featured: false,
    propertyCount: 0,
    active: true,
  },
  {
    name: "Doddaballapura",
    slug: "doddaballapura",
    description:
      "Doddaballapura is a rapidly developing area located near Bengaluru.",
    image:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
    coordinates: { lat: 13.1352, lng: 77.4811 },
    highlights: [
      "Doddaballapura",
      "KA",
      "Investment Opportunity",
      "Premium Location",
    ],
    amenities: [
      { name: "Prime Location", icon: "location" },
      { name: "Investment Potential", icon: "trending-up" },
      { name: "Modern Amenities", icon: "home" },
    ],
    featured: false,
    propertyCount: 0,
    active: true,
  },
];

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// change if needed
const MONGO_URL = process.env.MONGODB_URI!;
console.log("mongo url ", MONGO_URL);
const locationSchema = new mongoose.Schema({}, { strict: false });
const Location = mongoose.model("Location", locationSchema, "locations");

async function seed() {
  try {
    await mongoose.connect(MONGO_URL);

    await Location.insertMany(locations, { ordered: false });

    console.log("✅ Locations inserted successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Insert failed:", err);
    process.exit(1);
  }
}

seed();
