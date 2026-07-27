"use client";

import { useEffect, useRef, useState } from "react";

type Banner = {
  id: string;
  image_url: string;
  link_url: string | null;
};

export default function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  useEffect(() => {
    trackRef.current?.scrollTo({
      left: index * trackRef.current.clientWidth,
      behavior: "smooth",
    });
  }, [index]);

  if (banners.length === 0) return null;

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar rounded-xl"
        style={{ scrollbarWidth: "none" }}
      >
        {banners.map((b) => (
          <a
            key={b.id}
            href={b.link_url ?? "#"}
            className="min-w-full snap-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={b.image_url}
              alt=""
              className="w-full h-40 sm:h-56 object-cover"
            />
          </a>
        ))}
      </div>

      {banners.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {banners.map((b, i) => (
            <button
              key={b.id}
              onClick={() => setIndex(i)}
              aria-label={`Go to banner ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-zinc-900" : "w-1.5 bg-zinc-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
