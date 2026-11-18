"use client";

import Image from "next/image";
import { useState } from "react";
import { DEFAULT_SERVICE_IMAGE } from "@/lib/images";
import { cn } from "@/lib/utils";

type ServiceImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
};

export function ServiceImage({
  src,
  alt,
  className,
  imageClassName,
  priority,
  sizes = "(max-width: 768px) 100vw, 33vw",
}: ServiceImageProps) {
  const [current, setCurrent] = useState(src || DEFAULT_SERVICE_IMAGE);
  const [failed, setFailed] = useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-sand", className)}>
      <Image
        src={failed ? DEFAULT_SERVICE_IMAGE : current}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={cn("object-cover", imageClassName)}
        onError={() => {
          if (!failed) {
            setFailed(true);
            setCurrent(DEFAULT_SERVICE_IMAGE);
          }
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
    </div>
  );
}
