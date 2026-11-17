import NextImage from "next/image";
import { cn } from "@/lib/utils";
import type { Experimental_GeneratedImage } from "ai";

export type ImageProps = Experimental_GeneratedImage & {
  className?: string;
  alt?: string;
};

export const Image = ({ base64, mediaType, className, alt }: ImageProps) => (
  <NextImage
    alt={alt ?? ""}
    className={cn(
      "h-auto w-auto max-w-full overflow-hidden rounded-md",
      className
    )}
    height={0}
    sizes="100vw"
    src={`data:${mediaType};base64,${base64}`}
    unoptimized
    width={0}
  />
);
