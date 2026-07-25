"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useScrollInView } from "../hooks/useScrollInView";

interface BlurImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  quality?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
  onClick?: () => void;
  fill?: boolean;
}

export default function BlurImage({
  src,
  alt,
  width,
  height,
  quality = 75,
  priority = false,
  className = "",
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
  onClick,
  fill = false,
}: BlurImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { ref, isInView } = useScrollInView({
    threshold: 0.1,
    triggerOnce: true,
    rootMargin: "50px",
  });

  // Reset loading state when src changes
  useEffect(() => {
    setIsLoaded(false);
    setIsLoading(true);
  }, [src]);

  // Generate transparent blur data URL for placeholder
  const blurDataURL = `data:image/svg+xml;base64,${Buffer.from(
    `<svg width="${width}" height="${height}" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="transparent"/>
    </svg>`
  ).toString("base64")}`;

  const handleLoad = () => {
    setIsLoaded(true);
    setIsLoading(false);
  };

  return (
    <div ref={ref} className="relative w-auto h-auto max-w-full max-h-full">
      {(isInView || priority) && (
        <div className="relative">
          <Image
            src={src}
            alt={alt}
            width={fill ? undefined : width}
            height={fill ? undefined : height}
            fill={fill}
            quality={quality}
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            className={`${className} transition-all duration-700 ease-out ${
              isLoaded
                ? "opacity-100 blur-0 scale-100"
                : "opacity-60 blur-sm scale-95"
            }`}
            sizes={sizes}
            onClick={onClick}
            onLoad={handleLoad}
            placeholder="blur"
            blurDataURL={blurDataURL}
          />

          {/* Simple loading indicator overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-500">
              <div className="w-6 h-6 border border-gray-300 border-t-gray-600 rounded-full animate-spin opacity-50"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
