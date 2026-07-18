"use client";

import { useActionState, useState } from "react";
import { submitReview, type ReviewFormState } from "@/app/(site)/shop/_actions";
import { ArrowUpRightIcon, StarIcon } from "@/components/icons";

const initial: ReviewFormState = { ok: false };

export default function ReviewForm() {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [state, action, pending] = useActionState(submitReview, initial);

  if (state.ok) {
    return (
      <div className="rounded-[8px] border border-cool-20 bg-field p-[24px]">
        <p className="text-sm font-medium text-ink">Thanks for your review!</p>
        <p className="mt-1 text-sm text-black/60">
          It’ll appear once our team approves it.
        </p>
      </div>
    );
  }

  return (
    <form
      action={action}
      className="flex flex-col gap-[16px] rounded-[8px] border border-cool-20 p-[24px]"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-black">Write a review</h3>
        <span className="text-xs text-black/40">
          Posting as a customer · reviewed after approval
        </span>
      </div>

      <input type="hidden" name="rating" value={rating} />
      <div className="flex flex-col gap-[6px]">
        <span className="text-sm text-black/70">Your rating</span>
        <div className="flex items-center gap-[4px]">
          {Array.from({ length: 5 }).map((_, i) => {
            const value = i + 1;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHover(value)}
                onMouseLeave={() => setHover(0)}
                aria-label={`${value} star${value > 1 ? "s" : ""}`}
                className="p-[2px]"
              >
                <StarIcon
                  className={`size-[22px] transition-colors ${
                    (hover || rating) >= value ? "text-brand" : "text-cool-20"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      <input
        name="name"
        placeholder="Your name"
        className="h-[44px] rounded-[6px] border border-cool-20 bg-white px-[14px] text-sm outline-none focus:border-ink"
      />

      <textarea
        name="quote"
        rows={4}
        placeholder="Tell us about your experience — quality, delivery, install…"
        className="resize-y rounded-[6px] border border-cool-20 bg-white px-[14px] py-[10px] text-sm outline-none focus:border-ink"
      />

      {/* Photos are visual-only for now — wired to S3 upload later. */}
      <div>
        <span className="mb-[6px] block text-sm text-black/70">
          Add photos <span className="text-black/40">(optional)</span>
        </span>
        <div className="flex gap-[10px]">
          <label className="flex size-[64px] cursor-pointer items-center justify-center rounded-[6px] border border-dashed border-cool-20 text-2xl text-black/30 hover:border-ink">
            +
            <input type="file" accept="image/*" multiple className="hidden" />
          </label>
        </div>
      </div>

      {state.error && <p className="text-sm text-brand">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="flex h-[44px] items-center gap-[6px] self-start rounded-[48px] bg-ink py-[4px] pl-[20px] pr-[4px] text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Submitting…" : "Submit Review"}
        <span className="flex size-[32px] items-center justify-center rounded-full bg-white text-ink">
          <ArrowUpRightIcon className="size-[16px]" />
        </span>
      </button>
    </form>
  );
}
