import React, { useState } from "react";
import Image, { ImageProps } from "next/image";

/**
 * FadeInImage – thin wrapper around Next.js `Image` that
 * 1. Uses automatic optimisation (responsive, WebP/AVIF, lazy-loading)
 * 2. Fades from 0 → 100 % opacity once the image is fully loaded
 */
const FadeInImage: React.FC<ImageProps> = ({ className = "", ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <Image
      {...props}
      className={
        "transition-opacity duration-700 ease-in-out " +
        (isLoaded ? "opacity-100" : "opacity-0") +
        " " +
        className
      }
      onLoadingComplete={() => setIsLoaded(true)}
    />
  );
};

export default FadeInImage; 