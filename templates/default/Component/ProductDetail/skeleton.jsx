"use client";
import React from "react";
import { CircularSkeleton, RectangularSkeleton } from "../SkeletonLoader";

const ProductDetailSkeleton = () => {
  return (
    <main className="select-none" aria-busy="true" aria-label="Loading product details">
      <section className="grid grid-cols-[1.2fr_1fr] max-lg:grid-cols-1 max-lg:p-6 gap-14 p-[47px_40px] overflow-hidden max-xl:gap-6 max-md:p-4 max-w-[1440px] mx-auto w-full">
        {/* Left Column - Image Thumbnails + Main Image: RECTANGULAR Skeletons */}
        <div className="sticky h-fit">
          <div className="grid grid-cols-[auto_1fr] gap-2 h-[608px] max-md:flex max-md:flex-col-reverse max-md:h-fit">
            {/* Thumbnails */}
            <div className="h-full max-md:h-fit overflow-hidden relative w-20 min-w-20 max-md:w-full flex flex-col gap-2">
              {[...Array(5)].map((_, i) => (
                <RectangularSkeleton key={i} width="w-20" height="h-20" rounded="rounded-lg" />
              ))}
            </div>

            {/* Main Image */}
            <div className="h-full rounded-xl overflow-hidden bg-gray-50 dark:bg-zinc-800 flex items-center justify-center relative">
              <RectangularSkeleton width="w-full" height="h-full" rounded="rounded-xl" />
              <svg
                className="absolute w-16 h-16 text-gray-300 dark:text-zinc-600 opacity-60"
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
          </div>

          {/* Video / Banner Preview */}
          <div className="mt-3">
            <RectangularSkeleton width="w-full" height="h-20" rounded="rounded-lg" />
          </div>
        </div>

        {/* Right Column - Product Details */}
        <div className="overflow-hidden">
          {/* Title: RECTANGULAR Skeletons */}
          <RectangularSkeleton width="w-3/4" height="h-8" rounded="rounded-md" className="mb-3" />

          {/* Rating Row: CIRCULAR Star Dots + RECTANGULAR Score */}
          <div className="flex items-center gap-2 mb-5">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <CircularSkeleton key={i} size="w-4 h-4" />
              ))}
            </div>
            <RectangularSkeleton width="w-10" height="h-4" rounded="rounded-xs" />
            <RectangularSkeleton width="w-20" height="h-4" rounded="rounded-xs" />
          </div>

          {/* Price: RECTANGULAR Skeleton */}
          <RectangularSkeleton width="w-36" height="h-9" rounded="rounded-md" className="mb-6" />

          {/* Color Swatches: CIRCULAR Skeletons */}
          <div className="mb-6">
            <RectangularSkeleton width="w-28" height="h-4" rounded="rounded-xs" className="mb-3" />
            <div className="flex items-center gap-3">
              {[...Array(4)].map((_, i) => (
                <CircularSkeleton key={i} size="w-8 h-8" className="border-2 border-white shadow-xs" />
              ))}
            </div>
          </div>

          {/* Quantity and Action Buttons: RECTANGULAR Skeletons */}
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex gap-3">
              <RectangularSkeleton width="w-36" height="h-[49px]" rounded="rounded-md" />
              <RectangularSkeleton width="w-full" height="h-[49px]" rounded="rounded-md" />
            </div>
            <RectangularSkeleton width="w-full" height="h-[49px]" rounded="rounded-md" />
          </div>

          {/* Action Row: CIRCULAR Wishlist & Compare Buttons */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <CircularSkeleton size="w-10 h-10" />
              <RectangularSkeleton width="w-24" height="h-4" rounded="rounded-xs" />
            </div>
            <div className="flex items-center gap-2">
              <CircularSkeleton size="w-10 h-10" />
              <RectangularSkeleton width="w-24" height="h-4" rounded="rounded-xs" />
            </div>
          </div>

          {/* Description Section: RECTANGULAR Skeletons */}
          <div className="mb-8">
            <RectangularSkeleton width="w-32" height="h-5" rounded="rounded-md" className="mb-4" />
            <div className="space-y-2">
              <RectangularSkeleton width="w-full" height="h-3.5" rounded="rounded" />
              <RectangularSkeleton width="w-11/12" height="h-3.5" rounded="rounded" />
              <RectangularSkeleton width="w-4/5" height="h-3.5" rounded="rounded" />
              <RectangularSkeleton width="w-3/5" height="h-3.5" rounded="rounded" />
            </div>
          </div>

          {/* Specifications Table: RECTANGULAR Rows */}
          <div className="mb-8">
            <RectangularSkeleton width="w-32" height="h-5" rounded="rounded-md" className="mb-4" />
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <RectangularSkeleton width="w-1/3" height="h-5" rounded="rounded-sm" />
                  <RectangularSkeleton width="w-2/3" height="h-5" rounded="rounded-sm" />
                </div>
              ))}
            </div>
          </div>

          {/* Reviews Section: CIRCULAR Avatar & Stars + RECTANGULAR Comments */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <RectangularSkeleton width="w-28" height="h-5" rounded="rounded-md" />
              <RectangularSkeleton width="w-24" height="h-8" rounded="rounded-md" />
            </div>

            {[...Array(2)].map((_, i) => (
              <div key={i} className="border-b border-gray-100 dark:border-zinc-800 pb-4 mb-4">
                <div className="flex items-center gap-1 mb-2.5">
                  {[...Array(5)].map((_, j) => (
                    <CircularSkeleton key={j} size="w-3.5 h-3.5" />
                  ))}
                </div>
                <div className="flex items-center gap-3 mb-2.5">
                  {/* Circular Reviewer Avatar */}
                  <CircularSkeleton size="w-10 h-10" />
                  <div className="space-y-1">
                    <RectangularSkeleton width="w-28" height="h-4" rounded="rounded-xs" />
                    <RectangularSkeleton width="w-16" height="h-3" rounded="rounded-xs" />
                  </div>
                </div>
                <RectangularSkeleton width="w-3/4" height="h-4" rounded="rounded-xs" className="mb-1.5" />
                <RectangularSkeleton width="w-full" height="h-3.5" rounded="rounded-xs" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProductDetailSkeleton;
