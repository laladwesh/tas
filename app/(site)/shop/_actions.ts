"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { connectDB } from "@/server/db/mongoose";
import { Review } from "@/server/models";

const reviewInput = z.object({
  name: z.string().trim().min(1, "Please add your name").max(80),
  rating: z.coerce.number().min(1).max(5),
  quote: z.string().trim().min(4, "Please write a little more").max(1000),
});

export type ReviewFormState = { ok: boolean; error?: string };

/**
 * Public "write a review" form. Reviews are created INACTIVE so an admin
 * approves them before they appear — never let anonymous input publish itself.
 */
export async function submitReview(
  _prev: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const parsed = reviewInput.safeParse({
    name: formData.get("name"),
    rating: formData.get("rating"),
    quote: formData.get("quote"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  await connectDB();
  await Review.create({
    name: parsed.data.name,
    quote: parsed.data.quote,
    rating: parsed.data.rating.toFixed(1),
    role: "Verified customer",
    active: false, // pending admin approval
  });

  revalidatePath("/admin/reviews");
  return { ok: true };
}
