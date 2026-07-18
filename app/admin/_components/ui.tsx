import type { ReactNode } from "react";

export const inputClass =
  "w-full rounded-sm border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand";

export const labelClass = "mb-1 block text-xs font-medium text-gray-600";

export function Card({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
      {title && (
        <header className="mb-4">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm text-gray-500">{description}</p>
          )}
        </header>
      )}
      {children}
    </section>
  );
}

export function PrimaryButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="rounded-sm bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-70"
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="rounded-sm border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
    >
      {children}
    </button>
  );
}

export function DangerButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="rounded-sm border border-brand/40 px-3 py-2 text-sm font-medium text-brand transition hover:bg-brand/5"
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

export function Checkbox({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-700">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 accent-[#bc3e37]"
      />
      {label}
    </label>
  );
}

/** Success/error banner driven by ?ok= / ?error= search params. */
export function Banner({ ok, error }: { ok?: string; error?: string }) {
  if (!ok && !error) return null;
  const isError = Boolean(error);
  return (
    <div
      role="status"
      className={`mb-5 rounded-sm border px-4 py-2.5 text-sm ${
        isError
          ? "border-brand/40 bg-brand/5 text-brand"
          : "border-green-600/30 bg-green-50 text-green-700"
      }`}
    >
      {error ?? ok}
    </div>
  );
}

export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
        {title}
      </h1>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
    </div>
  );
}
