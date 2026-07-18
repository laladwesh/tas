"use client";

import { useActionState } from "react";
import { sendQuote, type QuoteState } from "@/app/actions/sendQuote";

const inputClass =
  "w-full rounded-sm border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand";

const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";

export default function QuoteSection({ fenceTypes }: { fenceTypes: string[] }) {
  const [state, formAction, pending] = useActionState<QuoteState, FormData>(
    sendQuote,
    null
  );

  return (
    <section id="quote" className="w-full scroll-mt-20 bg-white py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left: copy */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Get Free Quote
            </h2>

            <div className="mt-6 space-y-5 text-sm leading-relaxed text-gray-600">
              <p>
                Looking for trusted fencing contractors in Perth? At Stag
                Fencing, we delivered top-quality fencing services for both
                residential and commercial properties across Perth. including{" "}
                <span className="underline">Colorbond fencing</span>,{" "}
                <span className="underline">pool fencing</span>, gates fencing,{" "}
                <span className="underline">asbestos fencing</span>, retaining
                walls, we handle it all with precision and care.
              </p>
              <p>
                No matter the size of your project, we&apos;ve got the right
                solution! Whether big or small, Stag fencing is here to help. We
                offer a free quote to get you started on your fencing journey.
                Why not enquire today?
              </p>
              <p>
                Fill out the form with as much detail as possible so we can
                provide you with the most accurate{" "}
                <span className="underline">free quote</span>!
              </p>
            </div>
          </div>

          {/* Right: form */}
          <div className="rounded-sm border border-brand/40 p-6 sm:p-8">
            <form action={formAction} className="space-y-4">
              <div>
                <label htmlFor="name" className={labelClass}>
                  Name
                </label>
                <input id="name" name="name" type="text" placeholder="Name" className={inputClass} />
              </div>

              <div>
                <label htmlFor="email" className={labelClass}>
                  Email
                </label>
                <input id="email" name="email" type="email" placeholder="Email" className={inputClass} />
              </div>

              <div>
                <label htmlFor="phone" className={labelClass}>
                  Phone No.
                </label>
                <input id="phone" name="phone" type="tel" placeholder="Phone No." className={inputClass} />
              </div>

              <div>
                <label htmlFor="address" className={labelClass}>
                  Address
                </label>
                <input id="address" name="address" type="text" placeholder="Address" className={inputClass} />
              </div>

              <div>
                <label htmlFor="fenceType1" className={labelClass}>
                  What type of fence are you looking for?
                </label>
                <select
                  id="fenceType1"
                  name="fenceType1"
                  defaultValue=""
                  className={`${inputClass} text-gray-400 [&:valid]:text-gray-900`}
                  required
                >
                  <option value="" disabled>
                    Select One
                  </option>
                  {fenceTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="message" className={labelClass}>
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder="Message"
                  className={`${inputClass} resize-none`}
                />
              </div>

              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-sm bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
              >
                {pending ? "Sending..." : "Get Your Quote Within One Day"}
              </button>

              {state && (
                <p
                  role="status"
                  className={`text-sm ${state.ok ? "text-green-600" : "text-brand"}`}
                >
                  {state.message}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
