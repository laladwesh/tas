"use client";

import { useRef, useState } from "react";
import { inputClass, labelClass } from "@/app/admin/_components/ui";

type Props = {
  name: string;
  label?: string;
  defaultValue?: string;
  folder?: string;
  required?: boolean;
};

/**
 * Image picker for the admin.
 *
 * Uploads straight to S3 with a presigned URL (the file never touches our
 * server), then writes the resulting public URL into a hidden input so the
 * surrounding <form> submits it like any other field.
 *
 * You can also just paste a path ("/hero1.png") or any URL — so this keeps
 * working before AWS creds are set.
 */
export default function ImageField({
  name,
  label = "Image",
  defaultValue = "",
  folder = "uploads",
  required,
}: Props) {
  const [value, setValue] = useState(defaultValue);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setStatus("uploading");
    setError("");

    try {
      // 1. Ask our server for a one-shot upload URL.
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          size: file.size,
          folder,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message ?? "Upload failed");
      }

      // 2. PUT the file straight to S3.
      const put = await fetch(data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!put.ok) throw new Error("S3 rejected the upload");

      setValue(data.publicUrl);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  }

  return (
    <div>
      <span className={labelClass}>{label}</span>

      {/* The actual submitted value */}
      <input type="hidden" name={name} value={value} required={required} />

      <div className="flex items-start gap-3">
        {/* Preview */}
        <div className="relative size-[64px] shrink-0 overflow-hidden rounded-sm border border-gray-200 bg-gray-50">
          {value ? (
            // Plain <img>: the value can be any host, and next/image would need
            // each one whitelisted in next.config.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt=""
              className="size-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.opacity = "0.2";
              }}
            />
          ) : (
            <span className="flex size-full items-center justify-center text-[10px] text-gray-400">
              none
            </span>
          )}
        </div>

        <div className="flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="/hero1.png or https://…"
            className={inputClass}
          />

          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={status === "uploading"}
              className="rounded-sm border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
            >
              {status === "uploading" ? "Uploading…" : "Upload image"}
            </button>

            {value && (
              <button
                type="button"
                onClick={() => setValue("")}
                className="text-xs text-brand hover:underline"
              >
                Clear
              </button>
            )}

            {status === "error" && (
              <span className="text-xs text-brand">{error}</span>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload(file);
              e.target.value = ""; // allow re-picking the same file
            }}
          />
        </div>
      </div>
    </div>
  );
}
