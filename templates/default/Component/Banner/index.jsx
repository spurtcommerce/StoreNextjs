"use client";
import Link from "next/link";
import CustomNextImage from "@/GlobalComponents/Shared/Common/CustomNextImage";
import { getWebUrl } from "@/utilities/commonFunctions";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { isMedusaAdapter } from "@/config/adapter.config";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Banner = ({ bannerList }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  const banners = useMemo(() => {
    if (isMedusaAdapter()) {
      return [];
    }
    if (Array.isArray(bannerList) && bannerList.length > 0) {
      return bannerList.filter(
        (banner) => banner?.isMiniBanner != 1 && banner?.isMiniBanner !== "1"
      );
    }
    return [];
  }, [bannerList]);

  const slidesCount = banners.length;

  const extendedSlides = useMemo(() => {
    if (slidesCount <= 1) return banners;
    return [...banners, banners[0]];
  }, [banners, slidesCount]);

  const resetInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (slidesCount > 1 && !isPaused) {
      intervalRef.current = setInterval(() => {
        setActiveIndex((prev) => prev + 1);
      }, 5000);
    }
  };

  const nextSlide = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (slidesCount <= 1) return;
    setIsTransitioning(true);
    setActiveIndex((prev) => {
      const current = prev >= slidesCount ? 0 : prev;
      return current + 1;
    });
    resetInterval();
  };

  const prevSlide = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (slidesCount <= 1) return;
    setIsTransitioning(true);
    setActiveIndex((prev) => {
      const current = prev % slidesCount;
      return current <= 0 ? slidesCount - 1 : current - 1;
    });
    resetInterval();
  };

  const goToSlide = (index) => {
    if (slidesCount <= 1) return;
    setIsTransitioning(true);
    setActiveIndex(index);
    resetInterval();
  };

  const slides = useMemo(
    () =>
      extendedSlides?.map((banner, index) => {
        const href = getWebUrl(banner?.link) || "#";
        const isExternal = /^https?:\/\//i.test(href);

        const bannerImage = (
          <CustomNextImage
            containerName={banner?.bannerImages?.[0]?.imagePath ?? banner?.imagePath ?? ""}
            imageName={
              banner?.bannerImages?.[0]?.imageName ||
              banner?.bannerImages?.[0]?.image ||
              banner?.image ||
              banner?.imageName ||
              ""
            }
            alt={banner?.title || ""}
            className="max-h-[480px] w-full object-cover"
            width="1440"
            height="480"
            priority={index === 0}
            loading={index === 0 ? "eager" : "lazy"}
          />
        );

        return (
          <div key={index} className="w-full flex-shrink-0">
            {isExternal ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="block cursor-pointer"
              >
                {bannerImage}
              </a>
            ) : (
              <Link
                href={href}
                prefetch={false}
                className="block cursor-pointer"
              >
                {bannerImage}
              </Link>
            )}
          </div>
        );
      }),
    [extendedSlides],
  );

  useEffect(() => {
    if (slidesCount <= 1 || isPaused) return;
    intervalRef.current = setInterval(
      () => setActiveIndex((prev) => prev + 1),
      5000,
    );
    return () => clearInterval(intervalRef.current);
  }, [slidesCount, isPaused]);

  useEffect(() => {
    if (activeIndex === slidesCount) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        setActiveIndex(0);
      }, 700);
      return () => clearTimeout(timeout);
    } else {
      setIsTransitioning(true);
    }
  }, [activeIndex, slidesCount]);

  if (!banners?.length) return null;

  const currentSlideIndex = slidesCount > 0 ? activeIndex % slidesCount : 0;

  return (
    <div
      className="group relative w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className={`flex ${
          isTransitioning ? "transition-transform duration-700 ease-in-out" : ""
        }`}
        style={{
          transform: `translateX(-${activeIndex * 100}%)`,
          direction: "ltr",
        }}
      >
        {slides}
      </div>

      {/* Navigation Arrow Controls (Previous and Next Banner) */}
      {slidesCount > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous banner"
            className="absolute start-3 sm:start-6 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-all duration-200 border border-white/20 shadow-lg hover:scale-105 active:scale-95 cursor-pointer rtl:rotate-180"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next banner"
            className="absolute end-3 sm:end-6 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-all duration-200 border border-white/20 shadow-lg hover:scale-105 active:scale-95 cursor-pointer rtl:rotate-180"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </>
      )}

      {/* Dots Pagination based on banner count */}
      {slidesCount > 1 && (
        <div
          className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center gap-1.5 sm:gap-2 max-w-[90%] flex-wrap px-3 py-1.5 rounded-full bg-black/35 backdrop-blur-md border border-white/15 shadow-lg"
          role="tablist"
          aria-label="Banner pagination"
        >
          {banners.map((_, idx) => {
            const isActive = currentSlideIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                role="tab"
                onClick={() => goToSlide(idx)}
                aria-label={`Go to banner ${idx + 1} of ${slidesCount}`}
                aria-selected={isActive}
                className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 cursor-pointer focus:outline-none ${
                  isActive
                    ? "w-6 sm:w-8 bg-white shadow-sm"
                    : "w-2 sm:w-2.5 bg-white/50 hover:bg-white/85 hover:scale-110"
                }`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default React.memo(Banner);
