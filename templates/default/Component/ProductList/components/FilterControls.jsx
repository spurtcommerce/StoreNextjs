"use client";
import React from "react";
import { Check } from "lucide-react";

/**
 * Dynamic theme-aware custom Checkbox component
 */
export const CustomCheckbox = ({ checked, onChange, label, count }) => {
  const displayCount =
    typeof count === "number"
      ? count
      : typeof count === "string" && count.trim() !== "" && !isNaN(Number(count))
      ? Number(count)
      : Array.isArray(count)
      ? count.length
      : undefined;

  return (
    <label
      onClick={(e) => {
        e.preventDefault();
        onChange(!checked);
      }}
      className="flex items-center justify-between cursor-pointer text-gray-700 dark:text-zinc-300 hover:text-[var(--btn-bg,var(--color-161d25))] transition-colors select-none text-xs py-0.5 group"
    >
      <div className="flex items-center gap-2 min-w-0">
        <div
          className={`w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 ${
            checked
              ? "text-white"
              : "border-gray-300 dark:border-zinc-400 bg-white dark:bg-zinc-800/60 group-hover:border-[var(--btn-bg,var(--color-161d25))]"
          }`}
          style={
            checked
              ? {
                  backgroundColor: "var(--btn-bg, var(--color-161d25))",
                  borderColor: "var(--btn-bg, var(--color-161d25))",
                }
              : {}
          }
        >
          {checked && <Check size={11} strokeWidth={3} className="text-white" />}
        </div>
        {label && <span className="truncate">{label}</span>}
      </div>
      {displayCount !== undefined && (
        <span className="text-[11px] text-gray-400 group-hover:text-gray-600 dark:group-hover:text-zinc-300 font-medium ml-2">
          {displayCount}
        </span>
      )}
    </label>
  );
};

/**
 * Dynamic theme-aware custom Radio component
 */
export const CustomRadio = ({ checked, onChange, label }) => {
  return (
    <label
      onClick={(e) => {
        e.preventDefault();
        onChange();
      }}
      className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-zinc-300 hover:text-[var(--btn-bg,var(--color-161d25))] transition-colors select-none text-xs"
    >
      <div
        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
          checked
            ? ""
            : "border-gray-300 dark:border-zinc-400 bg-white dark:bg-zinc-800/60 hover:border-[var(--btn-bg,var(--color-161d25))]"
        }`}
        style={
          checked
            ? { borderColor: "var(--btn-bg, var(--color-161d25))" }
            : {}
        }
      >
        {checked && (
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: "var(--btn-bg, var(--color-161d25))" }}
          />
        )}
      </div>
      {label && <span>{label}</span>}
    </label>
  );
};

/**
 * Render a filter section item with checkbox and item count
 */
export const FilterItem = ({ item, isChecked, onToggle }) => {
  return (
    <label
      onClick={(e) => {
        e.preventDefault();
        onToggle();
      }}
      className="flex items-center justify-between cursor-pointer text-gray-700 dark:text-zinc-300 hover:text-[var(--btn-bg,var(--color-161d25))] transition-colors select-none text-xs py-0.5 group"
    >
      <div className="flex items-center gap-2 min-w-0">
        <div
          className={`w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 ${
            isChecked
              ? "text-white"
              : "border-gray-300 dark:border-zinc-400 bg-white dark:bg-zinc-800/60 group-hover:border-[var(--btn-bg,var(--color-161d25))]"
          }`}
          style={
            isChecked
              ? {
                  backgroundColor: "var(--btn-bg, var(--color-161d25))",
                  borderColor: "var(--btn-bg, var(--color-161d25))",
                }
              : {}
          }
        >
          {isChecked && <Check size={11} strokeWidth={3} className="text-white" />}
        </div>
        <span className="truncate">{item.itemName}</span>
      </div>
      {item.productCount !== undefined && (
        <span className="text-[11px] text-gray-400 group-hover:text-gray-600 dark:group-hover:text-zinc-300 font-medium ml-2">
          {item.productCount}
        </span>
      )}
    </label>
  );
};
