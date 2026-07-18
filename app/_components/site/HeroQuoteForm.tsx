import { ChevronDownIcon } from "@/components/icons";

const fieldBase =
  "h-[40px] w-full rounded-[4px] bg-field px-[16px] text-[14px] font-medium tracking-[0.5px] text-black outline-none placeholder:font-medium placeholder:text-black/70 focus:border-b-2 focus:border-black";

const selectShell =
  "flex h-[40px] items-center justify-between gap-2 overflow-hidden rounded-[4px] bg-field px-[16px]";

/** The white card that overlaps the bottom of the hero (Figma: 928 × auto). */
export default function HeroQuoteForm({ services }: { services: string[] }) {
  return (
    <section
      id="quote"
      className="w-full scroll-mt-24 rounded-[12px] bg-white px-5 py-6 shadow-[4px_4px_32px_0px_rgba(0,0,0,0.1)] sm:px-[37px] sm:py-[30px]"
    >
      <form className="flex flex-col gap-[10px]">
        {/* Row 1 */}
        <div className="flex flex-col gap-[10px] sm:flex-row">
          <input name="name" placeholder="Name*" className={fieldBase} />
          <input name="email" type="email" placeholder="Email*" className={fieldBase} />
          <input name="phone" type="tel" placeholder="Phone No*" className={fieldBase} />
        </div>

        {/* Row 2 */}
        <div className="flex flex-col gap-[10px] sm:flex-row">
          <input name="address" placeholder="Address*" className={`${fieldBase} flex-1`} />

          <div className={`${selectShell} w-full sm:w-[278px]`}>
            <div className="flex min-w-0 flex-col items-start justify-center">
              <span className="text-[10px] font-medium tracking-[0.5px] text-black/70">
                Type Of Service*
              </span>
              <select
                name="service"
                defaultValue=""
                className="w-full cursor-pointer appearance-none bg-transparent text-[14px] tracking-[0.5px] text-black outline-none"
              >
                <option value="" disabled>
                  Select a service
                </option>
                {services.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>
            <ChevronDownIcon className="size-[20px] shrink-0 text-black" />
          </div>
        </div>

        {/* Row 3 */}
        <div className="flex flex-col gap-[10px] sm:flex-row sm:items-start">
          <textarea
            name="message"
            placeholder="Message"
            className="h-[96px] flex-1 resize-none rounded-[4px] bg-field px-[16px] py-[10px] text-[14px] font-medium tracking-[0.5px] text-black outline-none placeholder:font-medium placeholder:text-black/70"
          />

          <div className="flex w-full flex-col items-center justify-center gap-[16px] sm:w-[278px]">
            <div className={`${selectShell} w-full`}>
              <div className="flex min-w-0 flex-col items-start justify-center">
                <span className="whitespace-nowrap text-[10px] font-medium tracking-[0.5px] text-black/70">
                  Remove Existing Fence?*
                </span>
                <select
                  name="removeExisting"
                  defaultValue="Yes"
                  className="w-full cursor-pointer appearance-none bg-transparent text-[14px] tracking-[0.5px] text-black outline-none"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Not sure">Not sure</option>
                </select>
              </div>
              <ChevronDownIcon className="size-[20px] shrink-0 text-black" />
            </div>

            <button
              type="submit"
              className="flex h-[40px] w-full items-center justify-center rounded-[48px] bg-ink px-[16px] py-[3px] text-[14px] tracking-[0.5px] text-white transition-opacity hover:opacity-90"
            >
              Get my free quote
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
