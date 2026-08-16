import { ButtonHTMLAttributes } from "react";
import Link from "next/link";

export const primaryButtonClasses =
  "min-h-12 rounded-full bg-leaf px-6 py-3 font-semibold text-cream transition-colors hover:bg-leaf-dark disabled:cursor-not-allowed disabled:bg-sage disabled:text-cream/80 inline-flex items-center justify-center";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean;
};

// Min 44x44pt / 48x48dp tap target per design doc §5.2 — the one place iOS HIG and Material already agree.
export default function PrimaryButton({ fullWidth, className = "", ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`${fullWidth ? "w-full" : ""} ${primaryButtonClasses} ${className}`}
    />
  );
}

// Use for a primary CTA that navigates — renders a single <a>, avoiding an
// invalid <button> nested inside a <Link>'s anchor.
export function PrimaryLinkButton({
  href,
  fullWidth,
  className = "",
  children,
}: {
  href: string;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={`${fullWidth ? "w-full" : ""} ${primaryButtonClasses} ${className}`}>
      {children}
    </Link>
  );
}
