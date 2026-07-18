"use client";

import { useActionState, useState } from "react";
import { placeOrderAction, type CheckoutState } from "./_actions";

const input =
  "h-[42px] w-full rounded-[4px] border border-black/15 bg-field px-3 text-[14px] outline-none focus:border-brand";
const label = "mb-1 block text-[12px] font-medium text-black/70";

export default function CheckoutForm() {
  const [state, formAction, pending] = useActionState<CheckoutState, FormData>(
    placeOrderAction,
    null
  );
  const [fulfilment, setFulfilment] = useState<"delivery" | "pickup">("delivery");

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* Fulfilment */}
      <fieldset>
        <legend className={label}>How would you like it?</legend>
        <div className="flex gap-3">
          {(["delivery", "pickup"] as const).map((option) => (
            <label
              key={option}
              className={`flex flex-1 cursor-pointer items-center justify-center rounded-[4px] border px-4 py-2.5 text-[13px] capitalize transition ${
                fulfilment === option
                  ? "border-brand bg-brand/5 font-semibold text-brand"
                  : "border-black/15 text-black/70 hover:bg-black/5"
              }`}
            >
              <input
                type="radio"
                name="fulfilment"
                value={option}
                checked={fulfilment === option}
                onChange={() => setFulfilment(option)}
                className="sr-only"
              />
              {option === "delivery" ? "Delivery" : "Pick up (Balcatta)"}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="name">
            Name*
          </label>
          <input id="name" name="name" required className={input} />
        </div>
        <div>
          <label className={label} htmlFor="email">
            Email*
          </label>
          <input id="email" name="email" type="email" required className={input} />
        </div>
      </div>

      <div>
        <label className={label} htmlFor="phone">
          Phone*
        </label>
        <input id="phone" name="phone" type="tel" required className={input} />
      </div>

      {fulfilment === "delivery" && (
        <>
          <div>
            <label className={label} htmlFor="address">
              Delivery address*
            </label>
            <input id="address" name="address" className={input} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="suburb">
                Suburb
              </label>
              <input id="suburb" name="suburb" className={input} />
            </div>
            <div>
              <label className={label} htmlFor="postcode">
                Postcode
              </label>
              <input id="postcode" name="postcode" className={input} />
            </div>
          </div>
        </>
      )}

      <div>
        <label className={label} htmlFor="notes">
          Order notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className={`${input} h-auto resize-none py-2`}
        />
      </div>

      {state?.error && (
        <p role="alert" className="text-[13px] text-brand">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="h-[46px] rounded-[48px] bg-brand text-[14px] font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-70"
      >
        {pending ? "Placing order..." : "Place order"}
      </button>

      <p className="text-[11px] leading-[1.5] text-black/50">
        No payment is taken online yet — we&rsquo;ll contact you to arrange
        payment and {fulfilment === "pickup" ? "pickup" : "delivery"}. Card
        payment via Stripe is coming soon.
      </p>
    </form>
  );
}
