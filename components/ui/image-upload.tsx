"use client";

import { useRef, useState } from "react";
import { Upload, X, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ImageUploadProps {
  /** Current image as a data URL (or an existing CDN URL) */
  value?: string | null;
  onChange: (value: string | null) => void;
  /**
   * "square"    — 1:1, max-w-[160px]. Use for profile photos.
   * "landscape" — 16:7. Use for service / package cover images.
   */
  aspect?: "square" | "landscape";
  /** Max file size in MB (default 5) */
  maxSizeMB?: number;
  /** Helper text shown below the uploader */
  hint?: string;
  disabled?: boolean;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  aspect = "landscape",
  maxSizeMB = 5,
  hint,
  disabled = false,
  className,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ── File processing ── */
  function processFile(file: File) {
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, WEBP)");
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File must be under ${maxSizeMB} MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // reset so the same file can be re-selected
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  const wrapperClass = cn(
    aspect === "square" ? "w-[160px] aspect-square" : "w-full aspect-[16/7]",
    className
  );

  return (
    <div className="space-y-1.5">
      <div className={wrapperClass}>
        {value ? (
          /* ── Preview ── */
          <div className="relative w-full h-full rounded-xl overflow-hidden border border-gray-200 bg-gray-100 group">
            <img
              src={value}
              alt="Uploaded preview"
              className="w-full h-full object-cover"
            />

            {!disabled && (
              <>
                {/* Remove */}
                <button
                  type="button"
                  onClick={() => onChange(null)}
                  aria-label="Remove image"
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Change */}
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="absolute bottom-2 right-2 flex items-center gap-1 text-xs bg-black/60 text-white px-2.5 py-1 rounded-md hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <RefreshCw className="w-3 h-3" />
                  Change
                </button>
              </>
            )}
          </div>
        ) : (
          /* ── Drop zone ── */
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "w-full h-full flex flex-col items-center justify-center gap-2 rounded-xl",
              "border-2 border-dashed transition-all cursor-pointer",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              isDragging
                ? "border-[#1B3163] bg-[#EEF1F8]"
                : "border-gray-200 hover:border-[#1B3163] hover:bg-[#EEF1F8]/40 bg-gray-50"
            )}
          >
            <Upload
              className={cn(
                "w-6 h-6 transition-colors",
                isDragging ? "text-[#1B3163]" : "text-gray-300"
              )}
            />
            <div className="text-center px-3">
              <p className="text-xs font-medium text-gray-500">
                Click to upload
                <span className="hidden sm:inline"> or drag &amp; drop</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                PNG · JPG · WEBP &nbsp;·&nbsp; max {maxSizeMB} MB
              </p>
            </div>
          </button>
        )}
      </div>

      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && <p className="text-xs text-rose-500">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={disabled}
        onChange={handleInputChange}
      />
    </div>
  );
}
