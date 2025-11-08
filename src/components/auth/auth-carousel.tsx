"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import type { UseEmblaCarouselType } from "embla-carousel-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/media/carousel";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Export images as a prop for modularity
export interface AuthCarouselProps {
  images?: { src: string; alt: string }[];
}

const defaultImages = [
  { src: "/carousel/image1.svg", alt: "Carousel Image 1" },
  { src: "/carousel/image2.svg", alt: "Carousel Image 2" },
  { src: "/carousel/image3.svg", alt: "Carousel Image 3" },
  { src: "/carousel/image4.svg", alt: "Carousel Image 4" },
  { src: "/carousel/image5.svg", alt: "Carousel Image 5" },
];

export function AuthCarousel({ images = defaultImages }: AuthCarouselProps) {
  // Embla autoplay plugin
  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  // Embla API state
  const [api, setApi] = React.useState<UseEmblaCarouselType[1]>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  // Embla event listeners
  React.useEffect(() => {
    if (!api) return;
    const autoplay = autoplayPlugin.current;
    autoplay.play();
    setCount(api.slideNodes().length);
    setCurrent(api.selectedScrollSnap());
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => {
      autoplay.stop();
      api.off("select", onSelect);
    };
  }, [api]);

  const scrollTo = React.useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api]
  );

  return (
    <div className="relative flex flex-col flex-grow min-h-0 items-center justify-center w-full bg-gradient-to-b from-muted to-muted/70 overflow-hidden">
      {/* Optional: background effect */}
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0,rgba(0,0,0,0)_70%)] pointer-events-none" />
      <Carousel
        plugins={[autoplayPlugin.current]}
        className="w-full max-w-2xl aspect-[12/12] px-4 md:px-8 mx-auto"
        opts={{
          align: "center",
          loop: true,
          skipSnaps: false,
        }}
        setApi={setApi}
        onMouseEnter={() => autoplayPlugin.current.stop()}
        onMouseLeave={() => autoplayPlugin.current.play()}
      >
        {/* Carousel content with basis for sizing, as in shadcn/ui docs */}
        <CarouselContent className="-ml-4 h-full">
          {images.map((image, index) => (
            <CarouselItem
              key={index}
              className="pl-4 basis-full flex items-center justify-center"
            >
              <div className="relative w-full h-full aspect-[12/12] overflow-hidden rounded-xl bg-background/50 backdrop-blur-sm shadow-lg flex items-center justify-center p-2 md:p-4">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-contain"
                  priority={index === 0}
                  sizes="(max-width: 768px) 90vw, 60vw"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation dots */}
        <div className="flex justify-center gap-4 z-10 mt-8">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              className={cn(
                "h-2 w-2 rounded-full transition-all duration-300",
                index === current
                  ? "bg-primary w-4"
                  : "bg-primary/30 hover:bg-primary/50"
              )}
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation arrows */}
        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none">
          <div className="pointer-events-auto">
            <CarouselPrevious className="h-8 w-8 opacity-70 hover:opacity-100 transition-opacity" />
          </div>
          <div className="pointer-events-auto">
            <CarouselNext className="h-8 w-8 opacity-70 hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </Carousel>
    </div>
  );
}
