import Image from "next/image";
import Link from "next/link";

export type WorksyLogoVariant =
  | "light"
  | "white"
  | "footer"
  | "dark-card"
  | "compact"
  | "icon"
  | "squircle";

interface WorksyLogoProps {
  variant?: WorksyLogoVariant;
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
  let src = "/logo.png";
  let aspectRatio = 3.26;

  switch (variant) {
    case "footer":
      src = "/logo-footer.png";
      aspectRatio = 3.93;
      break;
    case "white":
      src = "/logo-white.png";
      aspectRatio = 3.88;
      break;
    case "dark-card":
      src = "/logo-dark-card.png";
      aspectRatio = 3.88;
      break;
    case "compact":
      src = "/logo-compact.png";
      aspectRatio = 2.47;
      break;
    case "squircle":
      src = "/logo-squircle.png";
      aspectRatio = 1.0;
      break;
    case "icon":
      src = "/logo-icon.png";
      aspectRatio = 1.0;
      break;
    case "light":
    default:
      src = "/logo.png";
      aspectRatio = 3.26;
      break;
  }

  const width = Math.round(height * aspectRatio);

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
