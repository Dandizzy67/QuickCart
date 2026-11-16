// env.ts
// Reads the settings from the .env file in one place, so the rest of the code uses `env.
// port`, `env.mongoUrl`, etc.

import dotenv from "dotenv";
import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { Product, liveProducts } from "../models/Products";
import { AppError } from "../utils/apperror";

dotenv.config({ quiet: true });

// ***STEP 1: Read the settings from .env
// All settings (port, database address, JWT secret...) are read from .env here, once, so
// the rest of the code uses env.port, env.mongoUrl and so on.

// Next: STEP 2 (Connect to MongoDB) -> server/src/config/database.ts

export const CARD_FIELDS =
  "name slug description tagline priceNote images brand price oldPrice badge ratings reviewCount ratingCounts category tags trackStock stock sold flashSaleStock colors";

// Shared helpers — exported so reviews controller can reuse them
// For page and limit: a whole number above 0, otherwise the fallback ("abc", "-3", "0" -> fallback)
export const wholeNumber = (value: unknown, fallback: number) => {
  const number = Math.floor(
    Number(typeof value === "string" ? value.trim() : value),
  );
  return number > 0 ? number : fallback;
};

// A MongoDB id is exactly 24 characters of 0-9 and a-f
export const OBJECT_ID = /^[a-f0-9]{24}$/i;

export const getProducts = async (_req: Request, res: Response) => {
  const query = liveProducts() as any;

  const products = await Product.find(query)
    .select(CARD_FIELDS)
    .populate("category", "name slug")
    .lean();

  res.json({ products });
};

export const getProduct = async (
  req: Request<{ idOrSlug: string }>,
  res: Response,
) => {
  const { idOrSlug } = req.params;
  const query: any = {
    $and: [
      {
        $or: [
          isValidObjectId(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug },
        ],
      },
      liveProducts(),
    ],
  };

  const product = await Product.findOne(query)
    .populate("category", "name slug")
    .lean();

  if (!product) {
    throw new AppError(404, "Product not found");
  }

  res.json({ product });
};

export const env = {
  port: Number(process.env.PORT) || 5000,
  MongoUri:
    process.env.MONGO_URI ||
    "mongodb+srv://aderinsoladaniel433_db_user:03ucClKr2L48ZorD@cluster0.e8kldlt.mongodb.net/Quickcart",
  jwSecret: process.env.JWT_SECRET || "dev-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15d",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173/",

  // // The hidden demo panel (reset the data, move orders along) for presentations.
  // On while developing (npm run dev... runs the .ts files); off the built site (npm
  // start runs .js from dist)
  // unless DEMO_MODE=true is set. DEMO_MODE=false always turns it off.
  demoMode: process.env.DEMO_MODE
    ? process.env.DEMO_MODE === "true"
    : __filename.endsWith(".ts"),

  // Cloudinary stores the product photos (see config/cloudinary.ts). Empty = use the
  // photo in client/public
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",

  // Brevo sends the emails (see utils/sendEmail.ts). Empty = emails are printed in the terminal instead
  brevoApiKey: process.env.BREVO_API_KEY || "",
  emailFrom: process.env.EMAIL_FROM || "", // must be a sender you verified in Brevo
  emailFromName: process.env.EMAIL_FROM_NAME || "QuickCart",
};
