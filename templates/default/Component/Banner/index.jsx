"use client";
import Link from "next/link";
import CustomNextImage from "@/GlobalComponents/useCustomNextImage";
import { getWebUrl } from "@/utilities/commonFunctions";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { isMedusaAdapter } from "@/config/adapter.config";

const MEDUSA_DEFAULT_BANNER = [
  {
    bannerId: "medusa-banner-1",
    title: "Medusa Store",
    content: "Discover our curated collection powered by Medusa.",
    link: "/products",
    position: 1,
    bannerImages: [
      {
        imagePath: "",
        imageName: "/img/Medusa Banner.png",
      },
    ],
    image: "/img/Medusa Banner.png",
  },
];

const Banner = ({ bannerList }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const banners = useMemo(() => {
    if (Array.isArray(bannerList) && bannerList.length > 0) {
      return bannerList;
    }
    if (isMedusaAdapter()) {
      return MEDUSA_DEFAULT_BANNER;
    }
    return [];
  }, [bannerList]);
  const slidesCount = banners.length;
  const intervalRef = useRef(null);

  const extendedSlides = useMemo(() => {
    if (slidesCount <= 1) return banners;
    return [...banners, banners[0]];
  }, [banners, slidesCount]);

  const slides = useMemo(
    () =>
      extendedSlides?.map((banner, index) => {
        const href = getWebUrl(banner?.link) || "#";
        const isExternal = /^https?:\/\//i.test(href);

        const bannerImage = (
          <CustomNextImage
            containerName={banner?.bannerImages?.[0]?.imagePath}
            imageName={banner?.bannerImages?.[0]?.imageName}
            alt={banner?.title || ""}
            className="max-h-[480px] w-full object-cover"
            width="1440"
            height="480"
            loading="lazy"
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
    if (slidesCount <= 1) return;
    intervalRef.current = setInterval(
      () => setActiveIndex((prev) => prev + 1),
      5000,
    );
    return () => clearInterval(intervalRef.current);
  }, [slidesCount]);

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

  return (
    <div className="relative w-full overflow-hidden">
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
    </div>
  );
};

export default React.memo(Banner);
