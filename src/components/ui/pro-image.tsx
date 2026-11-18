"use client";

import Image from "next/image";
import { useState } from "react";
import { DEFAULT_PRO_AVATAR, resolveProfessionalAvatar } from "@/lib/images";
import { cn } from "@/lib/utils";

type ProImageProps = {
  src?: string | null;
  alt: string;
  seed?: string | number | null;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  rounded?: "full" | "2xl" | "none";
};

export function ProImage({
  src,
  alt,
  seed,
  className,
  imageClassName,
  sizes = "160px",
  rounded = "2xl",
}: ProImageProps) {
  const initial = resolveProfessionalAvatar(src, seed ?? alt);
  const [current, setCurrent] = useState(initial);
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-sand",
        rounded === "full" && "rounded-full",
        rounded === "2xl" && "rounded-2xl",
        className
      )}
    >
      <Image
        src={failed ? DEFAULT_PRO_AVATAR : current}
        alt={alt}
        fill
        sizes={sizes}
        className={cn("object-cover object-top", imageClassName)}
        onError={() => {
          if (!failed) {
            setFailed(true);
            setCurrent(DEFAULT_PRO_AVATAR);
          }
        }}
      />
    </div>
  );
}
