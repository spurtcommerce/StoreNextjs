"use client";
import React from "react";

/**
 * CircularSkeleton - Renders a circular skeleton loader with pulse animation.
 * Ideal for avatars, action icon buttons (compare, wishlist), circular badges, and rating dots.
 */
export const CircularSkeleton = ({
  size = "w-10 h-10",
  className = "",
  style,
  ...props
}) => {
  return (
    <div
      className={`rounded-full bg-gray-200 dark:bg-zinc-700 animate-pulse shrink-0 ${size} ${className}`}
      style={style}
      aria-hidden="true"
      {...props}
    />
  );
};

/**
 * RectangularSkeleton - Renders a rectangular skeleton loader with pulse animation.
 * Ideal for product images, banners, card containers, title lines, price tags, and buttons.
 */
export const RectangularSkeleton = ({
  width = "w-full",
  height = "h-4",
  rounded = "rounded-md",
  className = "",
  style,
  ...props
}) => {
  return (
    <div
      className={`bg-gray-200 dark:bg-zinc-700 animate-pulse ${rounded} ${width} ${height} ${className}`}
      style={style}
      aria-hidden="true"
      {...props}
    />
  );
};

/**
 * Base polymorphic Skeleton component.
 * Supports variant="circular" | "rectangular" | "text".
 */
export const Skeleton = ({
  variant = "rectangular",
  width,
  height,
  className = "",
  style,
  ...props
}) => {
  if (variant === "circular") {
    const sizeClass = width && height ? `${width} ${height}` : "w-10 h-10";
    return (
      <CircularSkeleton
        size={sizeClass}
        className={className}
        style={style}
        {...props}
      />
    );
  }

  const rounded = variant === "text" ? "rounded-xs" : "rounded-md";
  const w = width || "w-full";
  const h = height || (variant === "text" ? "h-3.5" : "h-10");

  return (
    <RectangularSkeleton
      width={w}
      height={h}
      rounded={rounded}
      className={className}
      style={style}
      {...props}
    />
  );
};

/**
 * ProductCardSkeleton - Unified default product card skeleton featuring BOTH
 * circular (wishlist button, compare button, rating dots) and rectangular
 * (product image, title, price, buttons) skeleton loaders.
 */
export const ProductCardSkeleton = ({ className = "" }) => {
  return (
    <div
      role="status"
      aria-label="Loading product"
      className={`rounded-xl flex flex-col relative select-none animate-pulse ${className}`}
    >
      {/* Top spacer matching z-20 h-8 floating action bar in real ProductCard */}
      <div className="z-20 h-8" />

      {/* Product Image: RECTANGULAR Skeleton matching real ProductCard */}
      <div className="relative w-full max-sm:aspect-square sm:h-60 rounded-lg overflow-hidden bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
        <div className="w-full h-full bg-gray-200/80 dark:bg-zinc-700/80" />
        <svg
          className="absolute w-10 h-10 text-gray-300 dark:text-zinc-600 opacity-60"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
          />
        </svg>
      </div>

      {/* Product Title: 2 lines matching h-[44px] mt-[16px] */}
      <div className="mt-4 space-y-1.5 h-[44px]">
        <div className="h-4 w-11/12 rounded bg-gray-200 dark:bg-zinc-700" />
        <div className="h-4 w-3/5 rounded bg-gray-200 dark:bg-zinc-700" />
      </div>

      {/* Product Price: matching mt-3 flex items-center */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="h-5 w-24 rounded bg-gray-200 dark:bg-zinc-700" />
      </div>
    </div>
  );
};

/**
 * ProductGridSkeleton - Renders a responsive grid of ProductCardSkeleton items.
 */
export const ProductGridSkeleton = ({ count = 8, className = "" }) => {
  return (
    <div
      className={`w-full mx-auto px-0 pb-8 grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5 ${className}`}
    >
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};

/**
 * CategorySidebarSkeleton - Category sidebar filter skeleton featuring
 * CIRCULAR bullets/indicators + RECTANGULAR title bars.
 */
export const CategorySidebarSkeleton = ({ count = 6 }) => {
  return (
    <div className="space-y-2 py-1 select-none" aria-busy="true" aria-label="Loading categories">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="flex items-center gap-2.5 px-1 py-1.5">
          {/* Circular bullet/indicator */}
          <CircularSkeleton size="w-3.5 h-3.5" className="bg-gray-300 dark:bg-zinc-600" />
          {/* Rectangular title */}
          <RectangularSkeleton
            width={idx % 2 === 0 ? "w-28" : "w-20"}
            height="h-3.5"
            rounded="rounded"
          />
        </div>
      ))}
    </div>
  );
};

/**
 * FeaturedProductsSkeleton - Home page featured products section skeleton
 * featuring RECTANGULAR header and grid of cards with BOTH circular and rectangular loaders.
 */
export const FeaturedProductsSkeleton = ({ count = 5 }) => {
  return (
    <div
      className="mt-[16px] md:mt-[40px] select-none"
      data-testid="default-featured-products-skeleton"
      aria-busy="true"
      aria-label="Loading featured products"
    >
      {/* Heading and View More skeleton */}
      <div className="flex items-center justify-between gap-4 mb-2 md:mb-3">
        <RectangularSkeleton width="w-48" height="h-6 md:h-7" rounded="rounded-md" />
        <RectangularSkeleton width="w-20" height="h-4" rounded="rounded" />
      </div>

      {/* Grid of ProductCardSkeletons with both circular and rectangular shapes */}
      <div className="w-full mx-auto px-0 py-[16px] md:py-8 grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-[16px] md:gap-6">
        {Array.from({ length: count }).map((_, idx) => (
          <ProductCardSkeleton key={idx} />
        ))}
      </div>
    </div>
  );
};

export default Skeleton;
