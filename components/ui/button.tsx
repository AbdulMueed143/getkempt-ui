import * as React from "react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "ghost" | "outline" | "link";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    "bg-warm-sand text-midnight-navy font-semibold",
    "hover:bg-royal-indigo hover:text-soft-ivory active:scale-[0.98]",
    "shadow-[0_0_20px_rgba(213,181,132,0.15)]",
    "hover:shadow-[0_0_28px_rgba(27,49,99,0.4)]",
  ].join(" "),

  ghost: [
    "bg-transparent text-soft-ivory",
    "hover:bg-royal-indigo/20 active:bg-royal-indigo/30",
  ].join(" "),

  outline: [
    "bg-transparent text-warm-sand border border-warm-sand/40",
    "hover:bg-royal-indigo hover:text-soft-ivory hover:border-royal-indigo",
    "active:scale-[0.98]",
  ].join(" "),

  link: [
    "bg-transparent text-warm-sand underline-offset-4",
    "hover:text-soft-ivory hover:underline p-0 h-auto",
  ].join(" "),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm rounded-md gap-1.5",
  md: "h-11 px-6 text-sm rounded-lg gap-2",
  lg: "h-13 px-8 text-base rounded-xl gap-2.5",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          "inline-flex items-center justify-center font-sans",
          "transition-all duration-200 cursor-pointer",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-sand focus-visible:ring-offset-2 focus-visible:ring-offset-midnight-navy",
          variantStyles[variant],
          variant !== "link" && sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Spinner size={size} />
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

function Spinner({ size }: { size: ButtonSize }) {
  const s = size === "sm" ? 14 : size === "md" ? 16 : 18;
  return (
    <svg
      className="animate-spin"
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
