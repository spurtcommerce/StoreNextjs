"use client";
import React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

/**
 * Dynamic Dual-Thumb Price Range Slider component
 */
export const PriceRangeSlider = ({
  minLimit = 0,
  maxLimit = 100000,
  minPrice,
  maxPrice,
  onChange,
  currencySymbol = "₹",
}) => {
  const safeMinLimit = Math.max(0, Math.floor(minLimit));
  const safeMaxLimit = Math.max(safeMinLimit + 10, Math.ceil(maxLimit));

  const currentMin =
    minPrice !== "" && !isNaN(Number(minPrice))
      ? Math.max(safeMinLimit, Math.min(Number(minPrice), safeMaxLimit))
      : safeMinLimit;

  const currentMax =
    maxPrice !== "" && !isNaN(Number(maxPrice))
      ? Math.min(safeMaxLimit, Math.max(Number(maxPrice), safeMinLimit))
      : safeMaxLimit;

  const step = Math.max(1, Math.round((safeMaxLimit - safeMinLimit) / 100));

  return (
    <div className="pt-2 pb-1 space-y-3">
      {/* Dual Slider Track and Thumbs */}
      <div className="px-1 pt-1">
        <SliderPrimitive.Root
          value={[currentMin, currentMax]}
          min={safeMinLimit}
          max={safeMaxLimit}
          step={step}
          onValueChange={([newMin, newMax]) => {
            onChange(newMin, newMax);
          }}
          className="relative flex items-center select-none touch-none w-full h-5 cursor-pointer"
        >
          <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-gray-200">
            <SliderPrimitive.Range className="absolute h-full bg-[var(--btn-bg,#161d25)] rounded-full" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb
            className="block w-4 h-4 rounded-full border-2 border-[var(--btn-bg,#161d25)] bg-white shadow-sm transition-transform hover:scale-115 focus:outline-none focus:ring-2 focus:ring-[var(--btn-bg,#161d25)] focus:ring-offset-1 cursor-grab active:cursor-grabbing"
            aria-label="Min price"
          />
          <SliderPrimitive.Thumb
            className="block w-4 h-4 rounded-full border-2 border-[var(--btn-bg,#161d25)] bg-white shadow-sm transition-transform hover:scale-115 focus:outline-none focus:ring-2 focus:ring-[var(--btn-bg,#161d25)] focus:ring-offset-1 cursor-grab active:cursor-grabbing"
            aria-label="Max price"
          />
        </SliderPrimitive.Root>
      </div>

      {/* Inputs for precise price values */}
      <div className="flex items-center gap-2">
        <div className="relative w-full">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[11px] font-medium">
            {currencySymbol}
          </span>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => onChange(e.target.value, maxPrice)}
            placeholder={String(safeMinLimit)}
            className="w-full border border-gray-200 rounded-md pl-6 pr-2 py-1 text-xs text-gray-800 font-medium focus:outline-none focus:border-[var(--btn-bg,#161d25)] focus:ring-1 focus:ring-[var(--btn-bg,#161d25)] bg-white shadow-2xs"
          />
        </div>
        <span className="text-gray-400 text-xs font-medium shrink-0">to</span>
        <div className="relative w-full">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[11px] font-medium">
            {currencySymbol}
          </span>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => onChange(minPrice, e.target.value)}
            placeholder={String(safeMaxLimit)}
            className="w-full border border-gray-200 rounded-md pl-6 pr-2 py-1 text-xs text-gray-800 font-medium focus:outline-none focus:border-[var(--btn-bg,#161d25)] focus:ring-1 focus:ring-[var(--btn-bg,#161d25)] bg-white shadow-2xs"
          />
        </div>
      </div>

      {/* Range Min/Max Labels */}
      <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium">
        <span>Min: {currencySymbol}{safeMinLimit.toLocaleString()}</span>
        <span>Max: {currencySymbol}{safeMaxLimit.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default PriceRangeSlider;
