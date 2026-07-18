/**
 * Bootstraps the database.
 *
 * Creates ONLY what you can't create through the UI:
 *   1. your admin login
 *   2. the site-settings document
 *
 * It seeds NO content. Services, products, articles, reviews, gallery photos,
 * FAQs and hero slides are all added by you in /admin. Safe to re-run.
 *
 *   npm run seed
 */
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { connectDB } from "../server/db/mongoose";
import { User, SiteSetting } from "../server/models";

/** Minimal .env loader (avoids adding dotenv just for this script). */
function loadEnv() {
  const file = path.join(process.cwd(), ".env");
  if (!fs.existsSync(file)) return;
  for (const raw of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    if (!process.env[key]) process.env[key] = line.slice(eq + 1).trim();
  }
}

async function main() {
  loadEnv();
  await connectDB();
  console.log("Connected to", process.env.MONGODB_URI);

  /* ------------------------------- Admin user ------------------------------ */
  const email = (process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
  }

  const existing = await User.findOne({ email });
  if (existing) {
    // Keep the password in sync with .env so you can always get back in.
    existing.passwordHash = await bcrypt.hash(password, 12);
    existing.role = "admin";
    await existing.save();
    console.log(`✓ admin updated: ${email}`);
  } else {
    await User.create({
      email,
      passwordHash: await bcrypt.hash(password, 12),
      name: process.env.ADMIN_NAME ?? "Admin",
      role: "admin",
      emailVerified: new Date(),
      providers: ["credentials"],
    });
    console.log(`✓ admin created: ${email}`);
  }

  /* ------------------------------ Site settings ---------------------------- */
  await SiteSetting.findOneAndUpdate(
    { key: "site" },
    { $setOnInsert: { key: "site" } },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );
  console.log("✓ site settings ready (edit them in /admin/settings)");

  await mongoose.disconnect();

  console.log("\nNo content was seeded — that's intentional.");
  console.log("Sign in at /admin/login and add your own:");
  console.log("  1. Site settings  2. Services  3. Gallery");
  console.log("  4. Reviews  5. FAQs  6. Products  7. Articles");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
