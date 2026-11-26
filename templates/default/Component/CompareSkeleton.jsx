"use client";

import React from "react";

export default function CompareSkeleton({ columns = 2 }) {
  const colCount = Math.max(2, Math.min(columns, 4));
  const productCols = Array.from({ length: colCount });

  const firstColWidth = colCount === 2 ? "w-1/3 sm:w-1/4" : "w-1/4";
  const productColWidth = colCount === 2 ? "w-1/3 sm:w-[37.5%]" : "w-1/4";

  return (
    <div className="mx-auto w-full max-w-[1440px] px-[16px] py-8 md:px-[20px] select-none" aria-busy="true" aria-label="Loading comparison">
      {/* Title / Header skeleton */}
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-[var(--color-grey,#e5e7eb)] pb-6 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <div className="h-8 w-44 rounded-md bg-gray-200 dark:bg-zinc-700 animate-pulse" />
          <div className="h-4 w-72 rounded bg-gray-200/80 dark:bg-zinc-700/80 animate-pulse" />
        </div>
        <div className="flex items-center gap-4">
          <div className="h-7 w-32 rounded-full bg-gray-200 dark:bg-zinc-700 animate-pulse" />
          <div className="h-7 w-20 rounded-md bg-gray-200 dark:bg-zinc-700 animate-pulse" />
        </div>
      </div>

      {/* Comparison Table Skeleton */}
      <div className="mb-20 overflow-x-auto rounded-lg border border-[var(--color-grey,#e5e7eb)] bg-white dark:bg-zinc-800 shadow-xs">
        <table className="w-full border-collapse compare-tbl min-w-[720px]">
          <tbody>
            {/* Row 1: Product Cards Header */}
            <tr>
              <td className={`${firstColWidth} p-5 align-middle border border-b-0 border-[var(--color-grey,#e5e7eb)] bg-gray-50/50 dark:bg-zinc-800/50`}>
                <div className="space-y-2 text-center p-4">
                  <div className="h-4 w-28 mx-auto rounded bg-gray-200 dark:bg-zinc-700 animate-pulse" />
                  <div className="h-3 w-36 mx-auto rounded bg-gray-200/70 dark:bg-zinc-700/70 animate-pulse" />
                </div>
              </td>
              {productCols.map((_, index) => (
                <td
                  key={index}
                  className={`relative ${productColWidth} px-6 py-5 align-middle border border-b-0 border-[var(--color-grey,#e5e7eb)]`}
                >
                  {/* Delete button skeleton */}
                  <div className="absolute top-4 right-4 h-7 w-7 rounded-full bg-gray-200 dark:bg-zinc-700 animate-pulse" />

                  {/* Product card contents */}
                  <div className="flex flex-col items-center space-y-3.5">
                    {/* Product Image placeholder */}
                    <div className="h-[120px] w-[120px] rounded-lg bg-gray-200 dark:bg-zinc-700 animate-pulse flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-gray-300 dark:text-zinc-600"
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

                    {/* Title placeholder */}
                    <div className="w-full space-y-1.5 flex flex-col items-center">
                      <div className="h-4 w-4/5 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse" />
                      <div className="h-4 w-3/5 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse" />
                    </div>

                    {/* Rating placeholder: CIRCULAR star dots + RECTANGULAR text */}
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, rIdx) => (
                        <div key={rIdx} className="h-3 w-3 rounded-full bg-gray-200 dark:bg-zinc-700 animate-pulse" />
                      ))}
                      <div className="h-3 w-6 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse ml-1" />
                    </div>

                    {/* Price placeholder */}
                    <div className="h-5 w-24 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse" />

                    {/* Add to Cart button placeholder */}
                    <div className="h-10 w-28 rounded-md bg-gray-200 dark:bg-zinc-700 animate-pulse" />
                  </div>

                  {/* VS divider icon */}
                  {index > 0 && (
                    <div className="top-1/2 rtl:-right-4 -left-4 rtl:left-[unset] absolute hidden md:block">
                      <div className="h-8 w-8 rounded-full bg-white dark:bg-zinc-800 border border-[var(--color-grey,#e5e7eb)] flex items-center justify-center shadow-xs">
                        <span className="text-[10px] font-bold text-gray-400">VS</span>
                      </div>
                    </div>
                  )}
                </td>
              ))}
            </tr>

            {/* Row 2: General Section Header */}
            <tr>
              <td className="bg-[var(--color-lightblue,#f3f8fd)] dark:bg-zinc-800/80 p-4 border border-[var(--color-grey,#e5e7eb)] border-y-0">
                <div className="h-4 w-24 rounded bg-gray-300 dark:bg-zinc-600 animate-pulse" />
              </td>
              {productCols.map((_, index) => (
                <td
                  key={index}
                  className="bg-[var(--color-lightblue,#f3f8fd)] dark:bg-zinc-800/80 p-4 border border-[var(--color-grey,#e5e7eb)] border-y-0"
                />
              ))}
            </tr>

            {/* Row 3: Category */}
            <tr>
              <td className="px-4 py-3.5 border border-[var(--color-grey,#e5e7eb)] border-t-0 bg-gray-50/30 dark:bg-zinc-800/30">
                <div className="h-4 w-20 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse" />
              </td>
              {productCols.map((_, index) => (
                <td
                  key={index}
                  className="px-4 py-3.5 border border-[var(--color-grey,#e5e7eb)] border-t-0"
                >
                  <div className="h-4 w-32 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse" />
                </td>
              ))}
            </tr>

            {/* Row 4: Price */}
            <tr>
              <td className="px-4 py-3.5 border border-[var(--color-grey,#e5e7eb)] border-t-0 bg-gray-50/30 dark:bg-zinc-800/30">
                <div className="h-4 w-14 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse" />
              </td>
              {productCols.map((_, index) => (
                <td
                  key={index}
                  className="px-4 py-3.5 border border-[var(--color-grey,#e5e7eb)] border-t-0"
                >
                  <div className="h-4 w-24 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse" />
                </td>
              ))}
            </tr>

            {/* Row 5: Rating & Review */}
            <tr>
              <td className="px-4 py-3.5 border border-[var(--color-grey,#e5e7eb)] border-t-0 bg-gray-50/30 dark:bg-zinc-800/30">
                <div className="h-4 w-28 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse" />
              </td>
              {productCols.map((_, index) => (
                <td
                  key={index}
                  className="px-4 py-3.5 border border-[var(--color-grey,#e5e7eb)] border-t-0"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-3 w-3 rounded-full bg-gray-200 dark:bg-zinc-700 animate-pulse" />
                      ))}
                    </div>
                    <div className="h-3 w-16 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse" />
                  </div>
                </td>
              ))}
            </tr>

            {/* Row 6: Availability */}
            <tr>
              <td className="px-4 py-3.5 border border-[var(--color-grey,#e5e7eb)] border-t-0 bg-gray-50/30 dark:bg-zinc-800/30">
                <div className="h-4 w-24 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse" />
              </td>
              {productCols.map((_, index) => (
                <td
                  key={index}
                  className="px-4 py-3.5 border border-[var(--color-grey,#e5e7eb)] border-t-0"
                >
                  <div className="h-6 w-24 rounded-full bg-gray-200 dark:bg-zinc-700 animate-pulse" />
                </td>
              ))}
            </tr>

            {/* Row 7: Description */}
            <tr>
              <td className="px-4 py-4 border border-[var(--color-grey,#e5e7eb)] border-t-0 align-top bg-gray-50/30 dark:bg-zinc-800/30">
                <div className="h-4 w-24 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse" />
              </td>
              {productCols.map((_, index) => (
                <td
                  key={index}
                  className="px-4 py-4 border border-[var(--color-grey,#e5e7eb)] border-t-0 align-top"
                >
                  <div className="space-y-2">
                    <div className="h-3 w-full rounded bg-gray-200 dark:bg-zinc-700 animate-pulse" />
                    <div className="h-3 w-11/12 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse" />
                    <div className="h-3 w-4/5 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse" />
                    <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse" />
                  </div>
                </td>
              ))}
            </tr>

            {/* Row 8: Specifications */}
            <tr>
              <td className="px-4 py-3.5 border border-[var(--color-grey,#e5e7eb)] border-t-0 align-top bg-gray-50/30 dark:bg-zinc-800/30">
                <div className="h-4 w-28 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse" />
              </td>
              {productCols.map((_, index) => (
                <td
                  key={index}
                  className="px-4 py-3.5 border border-[var(--color-grey,#e5e7eb)] border-t-0 align-top"
                >
                  <div className="space-y-1.5">
                    <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse" />
                    <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse" />
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
