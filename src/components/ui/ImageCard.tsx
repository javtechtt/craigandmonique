import Image from "next/image";
import type { WeddingImage } from "@/types/wedding";
import { cn } from "@/lib/cn";

interface ImageCardProps {
  image: WeddingImage;
  aspect?: "portrait" | "landscape" | "square";
  rounded?: boolean;
  caption?: string;
  priority?: boolean;
  className?: string;
}

const aspectClasses: Record<NonNullable<ImageCardProps["aspect"]>, string> = {
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  square: "aspect-square",
};

export function ImageCard({
  image,
  aspect = "portrait",
  rounded = true,
  caption,
  priority,
  className,
}: ImageCardProps) {
  return (
    <figure className={cn("flex flex-col gap-3", className)}>
      <div
        className={cn(
          "relative w-full overflow-hidden bg-[color:var(--color-cream)]",
          aspectClasses[aspect],
          rounded ? "rounded-2xl" : null,
        )}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      {caption || image.caption ? (
        <figcaption
          className="text-center text-sm italic"
          style={{ color: "var(--color-sage-dark)" }}
        >
          {caption ?? image.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

export default ImageCard;
