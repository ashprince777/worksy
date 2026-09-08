import Image from "next/image";
import Link from "next/link";

interface WorksyLogoProps {
  variant?: "light" | "white" | "icon";
  className?: string;
  height?: number;
  showLink?: boolean;
}

export function WorksyLogo({
  variant = "light",
  className = "",
  height = 36,
  showLink = false,
}: WorksyLogoProps) {
  // Calculate aspect-ratio preserved width: 957 / 267 ~= 3.58
  const width = variant === "icon" ? height : Math.round(height * 3.58);
  const src =
    variant === "icon"
      ? "/logo-icon.png"
      : variant === "white"
      ? "/logo-white.png"
      : "/logo.png";

  const content = (
    <div className={`inline-flex items-center select-none ${className}`}>
      <Image
        src={src}
        alt="Worksy — Get Work Done"
        width={width}
        height={height}
        priority
        className="h-auto object-contain transition-transform hover:scale-[1.02]"
        style={{ maxHeight: `${height}px`, width: "auto" }}
      />
    </div>
  );

  if (showLink) {
    return (
      <Link href="/" className="inline-flex items-center group">
        {content}
      </Link>
    );
  }

  return content;
}
