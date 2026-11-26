"use client";
import React, { useMemo } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

/**
 * Recursive Category Tree Item for displaying nested categories with indentation
 */
export const CategoryTreeItem = ({
  cat,
  level = 0,
  selectedCategory,
  onCategoryClick,
  expandedCategories,
  toggleExpand,
  categoryCounts = {},
}) => {
  const slug = cat?.categorySlug || cat?.slug || "";
  const name = cat?.categoryNameTrans || cat?.categoryName || cat?.name || slug;
  const catId = String(cat?.categoryId || slug);
  const children = Array.isArray(cat?.children)
    ? cat.children
    : Array.isArray(cat?.child)
    ? cat.child
    : [];
  const hasChildren = children.length > 0;

  const norm = (s) => String(s || "").toLowerCase().replace(/[-_\s&]+/g, " ").trim();

  const isSelected = useMemo(() => {
    if (!selectedCategory) return false;
    const target = String(selectedCategory).toLowerCase().trim();
    const targetNorm = norm(target);
    const cSlug = String(slug || "").toLowerCase().trim();
    const cName = String(name || "").toLowerCase().trim();
    const cId = String(catId || "").toLowerCase().trim();

    return Boolean(
      (cSlug && cSlug === target) ||
      (cName && cName === target) ||
      (cId && cId === target) ||
      (cSlug && norm(cSlug) === targetNorm) ||
      (cName && norm(cName) === targetNorm) ||
      (cSlug && (target.includes(cSlug) || cSlug.includes(target))) ||
      (cName && (target.includes(cName) || cName.includes(target)))
    );
  }, [selectedCategory, slug, name, catId]);

  const rawCount =
    categoryCounts?.[slug] ??
    categoryCounts?.[catId] ??
    categoryCounts?.[name] ??
    cat?.productCount ??
    cat?.productAvailableCount ??
    cat?.products_count ??
    cat?.count ??
    cat?.totalCount;

  const productCount =
    typeof rawCount === "number"
      ? rawCount
      : Array.isArray(rawCount)
      ? rawCount.length
      : typeof rawCount === "string" && !isNaN(Number(rawCount))
      ? Number(rawCount)
      : rawCount !== undefined && rawCount !== null
      ? Number(rawCount) || 0
      : 0;

  const hasSelectedDescendant = useMemo(() => {
    if (!selectedCategory) return false;
    const target = String(selectedCategory).toLowerCase().trim();
    const targetNorm = norm(target);
    const checkDescendants = (list) => {
      return list?.some((child) => {
        const cSlug = String(child?.categorySlug || child?.slug || "").toLowerCase().trim();
        const cName = String(child?.categoryNameTrans || child?.categoryName || child?.name || "").toLowerCase().trim();
        const cId = String(child?.categoryId || "").toLowerCase().trim();
        const matched = Boolean(
          (cSlug && cSlug === target) ||
          (cName && cName === target) ||
          (cId && cId === target) ||
          (cSlug && norm(cSlug) === targetNorm) ||
          (cName && norm(cName) === targetNorm)
        );
        return matched || checkDescendants(child?.children || child?.child);
      });
    };
    return checkDescendants(children);
  }, [children, selectedCategory]);

  const isExpanded =
    expandedCategories?.has?.(catId) || isSelected || hasSelectedDescendant;

  return (
    <div className="w-full">
      <div
        className={`group flex items-center justify-between py-1 px-1.5 rounded-md transition-colors ${
          isSelected
            ? "bg-gray-100 font-semibold text-[var(--btn-bg,var(--color-161d25))]"
            : "text-gray-600 hover:text-[var(--btn-bg,var(--color-161d25))] hover:bg-gray-50"
        }`}
      >
        <button
          type="button"
          onClick={() => {
            onCategoryClick(slug, catId);
            if (hasChildren && !expandedCategories?.has?.(catId)) {
              toggleExpand(catId);
            }
          }}
          className="flex-1 flex items-center text-left text-xs cursor-pointer min-w-0"
          title={name}
        >
          <span
            className={`truncate ${
              isSelected
                ? "font-semibold text-[var(--btn-bg,var(--color-161d25))]"
                : ""
            }`}
          >
            {name}
          </span>
        </button>

        {hasChildren && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(catId);
            }}
            className="p-1 text-gray-400 hover:text-gray-700 transition-colors ml-1 cursor-pointer shrink-0"
            aria-label={isExpanded ? "Collapse subcategories" : "Expand subcategories"}
          >
            {isExpanded ? (
              <ChevronDown size={12} className="stroke-[2.2]" />
            ) : (
              <ChevronRight size={12} className="stroke-[2.2]" />
            )}
          </button>
        )}
      </div>

      {/* Nested child categories with indentation */}
      {hasChildren && isExpanded && (
        <div className="ml-2 pl-3 border-l-2 border-gray-100 space-y-0.5 my-1">
          {children.map((child) => (
            <CategoryTreeItem
              key={child?.categoryId || child?.categorySlug || child?.slug}
              cat={child}
              level={level + 1}
              selectedCategory={selectedCategory}
              onCategoryClick={onCategoryClick}
              expandedCategories={expandedCategories}
              toggleExpand={toggleExpand}
              categoryCounts={categoryCounts}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryTreeItem;
