import crypto from "crypto";
import bcrypt from "bcryptjs";

import { connectDB } from "@/server/db/mongoose";
import { OtpToken, User } from "@/server/models";
import { sendMail } from "@/server/services/mailer";

const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute
const MAX_ATTEMPTS = 5;

/** 6-digit code, uniformly random (no Math.random). */
function generateCode() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

export async function requestOtp(rawEmail: string) {
  const email = rawEmail.toLowerCase().trim();
  await connectDB();

  const existing = await OtpToken.findOne({ email });
  if (existing) {
    const age = Date.now() - new Date(existing.createdAt as Date).getTime();
    if (age < RESEND_COOLDOWN_MS) {
      const wait = Math.ceil((RESEND_COOLDOWN_MS - age) / 1000);
      return { ok: false as const, message: `Please wait ${wait}s before requesting another code.` };
    }
    await OtpToken.deleteMany({ email });
  }

  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);

  await OtpToken.create({
    email,
    codeHash,
    expiresAt: new Date(Date.now() + CODE_TTL_MS),
    attempts: 0,
  });

  try {
    await sendMail({
      to: email,
      subject: `${code} is your Stag Fencing sign-in code`,
      text: `Your Stag Fencing sign-in code is ${code}. It expires in 10 minutes.\n\nIf you didn't request this, you can ignore this email.`,
      html: `<p>Your Stag Fencing sign-in code is:</p>
             <p style="font-size:28px;font-weight:700;letter-spacing:4px">${code}</p>
             <p>It expires in 10 minutes. If you didn't request this, ignore this email.</p>`,
    });
  } catch (error) {
    // Don't leave a code the user can never receive.
    await OtpToken.deleteMany({ email });
    console.error("[otp] failed to send code:", error);
    return { ok: false as const, message: "Couldn't send the code. Please try again." };
  }

  return { ok: true as const, message: "We've emailed you a 6-digit code." };
}

/** Returns the user on success, or null (Auth.js treats null as a failed login). */
export async function verifyOtp(rawEmail: string, code: string) {
  const email = rawEmail.toLowerCase().trim();
  await connectDB();

  const token = await OtpToken.findOne({ email });
  if (!token) return null;

  if (new Date(token.expiresAt).getTime() < Date.now()) {
    await OtpToken.deleteMany({ email });
    return null;
  }

  if ((token.attempts ?? 0) >= MAX_ATTEMPTS) {
    await OtpToken.deleteMany({ email });
    return null;
  }

  const valid = await bcrypt.compare(code, token.codeHash);
  if (!valid) {
    await OtpToken.updateOne({ _id: token._id }, { $inc: { attempts: 1 } });
    return null;
  }

  await OtpToken.deleteMany({ email });

  // Upsert the customer account.
  const user = await User.findOneAndUpdate(
    { email },
    {
      $setOnInsert: { email, role: "customer", name: email.split("@")[0] },
      $set: { emailVerified: new Date() },
      $addToSet: { providers: "otp" },
    },
    { upsert: true, returnDocument: "after" }
  );

  return {
    id: String(user._id),
    email: user.email,
    name: user.name || user.email,
    role: user.role,
  };
}
