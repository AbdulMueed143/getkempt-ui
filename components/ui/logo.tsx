import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface LogoProps {
  variant?: "colored" | "white";
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
}

const sizes = {
  sm: { width: 90, height: 43 },
  md: { width: 120, height: 57 },
  lg: { width: 160, height: 76 },
};

export function Logo({
  variant = "colored",
  size = "md",
  href,
  className,
}: LogoProps) {
  const { width, height } = sizes[size];
  const src =
    variant === "white"
      ? "/assets/logo_partial_white.svg"
      : "/assets/logo_colored.svg";

  const img = (
    <Image
      src={src}
      alt="Get Kempt"
      width={width}
      height={height}
      priority
      className={cn("select-none", className)}
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-block focus-visible:outline-none">
        {img}
      </Link>
    );
  }

  return img;
}
