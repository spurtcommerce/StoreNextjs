"use client";
import ProductCard from "@/GlobalComponents/useProductCard";
import useAllProductsFunc from "@/GlobalComponents/useAllProductsFunc";
import React, { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import PaginationBar from "@/GlobalComponents/useCommon/PaginationBar";
import {
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Filter,
  X,
  RotateCcw,
  Check,
  Search,
} from "lucide-react";

import { getfilter } from "@/api/ProductDetailApi";
import * as SliderPrimitive from "@radix-ui/react-slider";

const Select = dynamic(() => import("react-select"), { ssr: false });
import NotFound from "@/GlobalComponents/useCommon/ProductNotFound";
import { PriceCalculate } from "@/utilities/PriceCalculate";

// Helper to calculate product final price with discounts and taxes
const getProductFinalPrice = (p) => {
  if (!p) return 0;
  const calculated = PriceCalculate(
    p?.price,
    p?.pricerefer,
    p?.flag,
    p?.taxType,
    p?.taxValue
  );
  const num = parseFloat(calculated);
  return isNaN(num) ? (parseFloat(p?.price || p?.productPrice || 0) || 0) : num;
};




// Helper to extract sections from any site-filter API response format
const extractSections = (res) => {
  if (!res) return [];
  if (Array.isArray(res?.data)) {
    const allSections = [];
    res.data.forEach((item) => {
      if (Array.isArray(item.sections)) {
        allSections.push(...item.sections);
      } else if (item.sectionName) {
        allSections.push(item);
      }
    });
    if (allSections.length > 0) return allSections;
  }
  if (Array.isArray(res)) {
    const allSections = [];
    res.forEach((item) => {
      if (Array.isArray(item.sections)) {
        allSections.push(...item.sections);
      } else if (item.sectionName) {
        allSections.push(item);
      }
    });
    if (allSections.length > 0) return allSections;
  }
  if (Array.isArray(res?.sections)) {
    return res.sections;
  }
  return [];
};

// Helper to match product against Category API Filter sections (Attributes & Variants)
const matchesFilterSections = (product, selectedItems) => {
  if (!selectedItems || selectedItems.length === 0) return true;

  // Group selected items by section (e.g. "product-colour", "battery-life")
  // Within a section, logic is OR. Across sections, logic is AND.
  const sectionGroups = {};
  selectedItems.forEach((item) => {
    const parts = String(item).split("~");
    const sec = (parts[0] || "").toLowerCase().replace(/[-_]/g, " ").trim();
    const val = (parts[1] || "").toLowerCase().replace(/[-_]/g, " ").trim();
    if (!sectionGroups[sec]) sectionGroups[sec] = [];
    sectionGroups[sec].push({ val, rawSec: parts[0], rawVal: parts[1] });
  });

  for (const [secName, values] of Object.entries(sectionGroups)) {
    const matchedAnyValue = values.some(({ val }) => {
      if (!val) return true;

      // 1. Check specifications (loaded from store-product-attributes)
      if (Array.isArray(product?.specifications)) {
        for (const spec of product.specifications) {
          for (const grp of spec?.attributeGroups || []) {
            for (const attr of grp?.attributes || []) {
              const aName = (attr?.attributeName || "")
                .toLowerCase()
                .replace(/[-_]/g, " ")
                .trim();
              if (
                aName === secName ||
                aName.includes(secName) ||
                secName.includes(aName) ||
                (/colou?r/.test(secName) && /colou?r/.test(aName))
              ) {
                const hasVal = (attr?.attributeValues || []).some((v) => {
                  const vStr = String(v?.value || "")
                    .toLowerCase()
                    .replace(/[-_]/g, " ")
                    .trim();
                  return (
                    vStr === val ||
                    vStr.includes(val) ||
                    val.includes(vStr)
                  );
                });
                if (hasVal) return true;
              }
            }
          }
        }
      }

      // 2. Check productVarient / productOption
      if (Array.isArray(product?.productVarient)) {
        for (const variant of product.productVarient) {
          const vName = (variant?.name || "")
            .toLowerCase()
            .replace(/[-_]/g, " ")
            .trim();
          if (
            vName === secName ||
            vName.includes(secName) ||
            secName.includes(vName) ||
            (/colou?r/.test(secName) && /colou?r/.test(vName))
          ) {
            const hasVal = (variant?.variantValue || []).some((v) => {
              const vStr = String(typeof v === "object" ? v?.value : v)
                .toLowerCase()
                .replace(/[-_]/g, " ")
                .trim();
              return (
                vStr === val ||
                vStr.includes(val) ||
                val.includes(vStr)
              );
            });
            if (hasVal) return true;
          }
        }
      }

      // 3. Check productOption
      if (Array.isArray(product?.productOption)) {
        for (const opt of product.productOption) {
          const oName = (opt?.title || opt?.name || "")
            .toLowerCase()
            .replace(/[-_]/g, " ")
            .trim();
          if (
            oName === secName ||
            oName.includes(secName) ||
            secName.includes(oName) ||
            (/colou?r/.test(secName) && /colou?r/.test(oName))
          ) {
            const hasVal = (opt?.values || []).some((v) => {
              const vStr = String(typeof v === "object" ? v?.value : v)
                .toLowerCase()
                .replace(/[-_]/g, " ")
                .trim();
              return (
                vStr === val ||
                vStr.includes(val) ||
                val.includes(vStr)
              );
            });
            if (hasVal) return true;
          }
        }
      }

      // 4. Check productAttributes / attributes array
      const rawAttrs = product?.productAttributes || product?.attributes || [];
      if (Array.isArray(rawAttrs)) {
        for (const attr of rawAttrs) {
          const aName = (attr?.attributeName || attr?.name || "")
            .toLowerCase()
            .replace(/[-_]/g, " ")
            .trim();
          if (
            aName === secName ||
            aName.includes(secName) ||
            secName.includes(aName) ||
            (/colou?r/.test(secName) && /colou?r/.test(aName))
          ) {
            const aVal = String(attr?.attributeValue || attr?.value || "")
              .toLowerCase()
              .replace(/[-_]/g, " ")
              .trim();
            if (aVal === val || aVal.includes(val) || val.includes(aVal)) {
              return true;
            }
          }
        }
      }

      // 5. If color/colour section, check colors/color/name
      if (/colou?r/.test(secName)) {
        const pColors = product?.colors || (product?.color ? [product.color] : []);
        if (
          Array.isArray(pColors) &&
          pColors.some((c) => String(c).toLowerCase().trim() === val)
        ) {
          return true;
        }
        if (
          product?.name &&
          new RegExp(`\\b${val}\\b`, "i").test(product.name)
        ) {
          return true;
        }
      }

      return false;
    });

    if (!matchedAnyValue) return false;
  }

  return true;
};

const selectCustomStyles = {
  control: (base, state) => ({
    ...base,
    borderRadius: "8px",
    borderColor: state.isFocused
      ? "var(--btn-bg, var(--color-161d25))"
      : "#e5e7eb",
    boxShadow: state.isFocused
      ? "0 0 0 1px var(--btn-bg, var(--color-161d25))"
      : "none",
    "&:hover": {
      borderColor: "var(--btn-bg, var(--color-161d25))",
    },
    padding: "0px 4px",
    fontSize: "13px",
    cursor: "pointer",
    backgroundColor: "#ffffff",
    minHeight: "36px",
    minWidth: "160px",
    fontWeight: "500",
    color: "var(--color-161d25, #161d25)",
    transition: "all 0.2s ease",
  }),
  option: (base, state) => ({
    ...base,
    fontSize: "13px",
    backgroundColor: state.isSelected
      ? "var(--btn-bg, var(--color-161d25))"
      : state.isFocused
      ? "color-mix(in srgb, var(--btn-bg, var(--color-161d25)) 12%, transparent)"
      : "#ffffff",
    color: state.isSelected ? "#ffffff" : "var(--color-161d25, #161d25)",
    cursor: "pointer",
    fontWeight: state.isSelected ? "600" : "400",
    "&:active": {
      backgroundColor: "var(--btn-bg, var(--color-161d25))",
      color: "#ffffff",
    },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: "8px",
    boxShadow:
      "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
    zIndex: 40,
    border: "1px solid #f3f4f6",
    overflow: "hidden",
  }),
  singleValue: (base) => ({
    ...base,
    color: "var(--color-161d25, #161d25)",
    fontWeight: "500",
  }),
};

// Dynamic theme-aware custom Checkbox component
const CustomCheckbox = ({ checked, onChange, label, count }) => {
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
      {count !== undefined && (
        <span className="text-[11px] text-gray-400 group-hover:text-gray-600 dark:group-hover:text-zinc-300 font-medium ml-2">
          {count}
        </span>
      )}
    </label>
  );
};

// Dynamic theme-aware custom Radio component
const CustomRadio = ({ checked, onChange, label }) => {
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

// Dynamic Dual-Thumb Price Range Slider component
const PriceRangeSlider = ({
  minLimit = 0,
  maxLimit = 100000,
  minPrice,
  maxPrice,
  onChange,
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
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[11px] font-medium">₹</span>
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
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[11px] font-medium">₹</span>
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
        <span>Min: ₹{safeMinLimit.toLocaleString()}</span>
        <span>Max: ₹{safeMaxLimit.toLocaleString()}</span>
      </div>
    </div>
  );
};

// Recursive Category Tree Item for displaying nested categories with indentation
const CategoryTreeItem = ({
  cat,
  level = 0,
  selectedCategory,
  onCategoryClick,
  expandedCategories,
  toggleExpand,
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

  const isSelected = selectedCategory === slug;

  const hasSelectedDescendant = useMemo(() => {
    if (!selectedCategory) return false;
    const checkDescendants = (list) => {
      return list?.some(
        (child) =>
          (child?.categorySlug || child?.slug) === selectedCategory ||
          checkDescendants(child?.children || child?.child)
      );
    };
    return checkDescendants(children);
  }, [children, selectedCategory]);

  const isExpanded =
    expandedCategories.has(catId) || isSelected || hasSelectedDescendant;

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
            if (hasChildren && !expandedCategories.has(catId)) {
              toggleExpand(catId);
            }
          }}
          className={`flex-1 text-left truncate text-xs cursor-pointer ${
            isSelected
              ? "font-semibold text-[var(--btn-bg,var(--color-161d25))]"
              : ""
          }`}
          title={name}
        >
          {name}
        </button>

        {hasChildren && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(catId);
            }}
            className="p-1 text-gray-400 hover:text-gray-700 transition-colors ml-1 cursor-pointer"
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
            />
          ))}
        </div>
      )}
    </div>
  );
};

const AllProductListPageClient = ({
  token,
  storeSettings,
  initialCategorySlug = "",
  categoryName = "",
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryQuery = searchParams?.get("category") || "";
  const activeCategory = categoryQuery || initialCategorySlug || "";

  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);
  const [variantsOpen, setVariantsOpen] = useState(true);
  const [attributesOpen, setAttributesOpen] = useState(true);

  // Search terms inside filter accordions
  const [categorySearch, setCategorySearch] = useState("");

  const [priceOption, setPriceOption] = useState("any"); // "any" | "custom"
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Product-extracted filters state
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Category API Site-Filter state
  const [filterSections, setFilterSections] = useState([]);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [selectedVariantItems, setSelectedVariantItems] = useState([]);
  const [selectedAttributeItems, setSelectedAttributeItems] = useState([]);

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const {
    t,
    allProductsList,
    allProductsListCount,
    isAllProductsListLoading,
    options,
    handleSort,
    order,
    customComponents,
    Skeletonloader,
    categoryList,
    selectedCategory,
    handleCategoryChange,
    isCategoryLoading,
    currentPage,
    setCurrentPage,
    limit,
    handleLimitChange,
    totalPages,
    handlePageChange,
  } = useAllProductsFunc({
    token,
    storeSettings,
    initialCategorySlug: activeCategory,
    variantFilter: selectedVariantItems,
    attributeFilter: selectedAttributeItems,
  });

  // Sync when URL category query param changes
  useEffect(() => {
    if (categoryQuery !== undefined && categoryQuery !== selectedCategory) {
      handleCategoryChange(categoryQuery);
    }
  }, [categoryQuery]);

  // Only show extra filters (Variants, Attributes) when a category is selected!
  const showExtraFilters = Boolean(selectedCategory);

  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const toggleExpandCategory = (catId) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
      }
      return next;
    });
  };

  // Auto-expand parents of currently selected category
  useEffect(() => {
    if (!selectedCategory || !categoryList) return;
    const findParents = (list, targetSlug, parents = []) => {
      for (const cat of list || []) {
        const catSlug = cat?.categorySlug || cat?.slug;
        const catId = String(cat?.categoryId || catSlug);
        if (catSlug === targetSlug) {
          return parents;
        }
        const children = cat?.children || cat?.child || [];
        if (children.length > 0) {
          const found = findParents(children, targetSlug, [...parents, catId]);
          if (found) return found;
        }
      }
      return null;
    };
    const parentIds = findParents(categoryList, selectedCategory);
    if (parentIds && parentIds.length > 0) {
      setExpandedCategories((prev) => {
        const next = new Set(prev);
        parentIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }, [selectedCategory, categoryList]);

  // Handle category selection and URL route change
  const handleCategoryClick = (slug, catId) => {
    if (selectedCategory === slug) {
      handleCategoryChange("");
      router.push("/products");
    } else {
      handleCategoryChange(slug);
      if (catId) {
        setExpandedCategories((prev) => new Set(prev).add(String(catId)));
      }
      if (slug) {
        router.push(`/products?category=${encodeURIComponent(slug)}`);
      } else {
        router.push("/products");
      }
    }
  };

  // Fetch dynamic category filters (site-filter/:categorySlug) only when a category is selected
  useEffect(() => {
    let isMounted = true;
    const fetchCategoryFilters = async () => {
      if (!selectedCategory) {
        setFilterSections([]);
        setSelectedVariantItems([]);
        setSelectedAttributeItems([]);
        return;
      }
      setIsFilterLoading(true);
      try {
        const res = await getfilter(selectedCategory);
        if (isMounted) {
          const sections = extractSections(res);
          setFilterSections(sections || []);
        }
      } catch (err) {
        console.error("Error fetching site-filter details:", err);
        if (isMounted) setFilterSections([]);
      } finally {
        if (isMounted) setIsFilterLoading(false);
      }
    };

    fetchCategoryFilters();
    return () => {
      isMounted = false;
    };
  }, [selectedCategory]);

  // Separate site-filter sections into variants and attributes
  const { apiVariantSections, apiAttributeSections } = useMemo(() => {
    const variants = [];
    const attributes = [];

    filterSections.forEach((sec) => {
      const filterType = (sec?.filterType || "").toLowerCase();
      const sectionType = Number(sec?.sectionType);
      const name = (sec?.sectionName || "").toLowerCase();

      // Variant section check (filterType: "variant", sectionType: 1, or name matches "variant" / "color" / "size")
      if (
        filterType === "variant" ||
        sectionType === 1 ||
        name === "variant" ||
        name === "color" ||
        name === "size"
      ) {
        variants.push(sec);
      } else {
        attributes.push(sec);
      }
    });

    return { apiVariantSections: variants, apiAttributeSections: attributes };
  }, [filterSections]);

  // Calculate dynamic min and max price limits from real products
  const { minCalculatedPrice, maxCalculatedPrice } = useMemo(() => {
    if (!allProductsList || allProductsList.length === 0) {
      return { minCalculatedPrice: 0, maxCalculatedPrice: 100000 };
    }
    let min = Infinity;
    let max = -Infinity;
    allProductsList.forEach((p) => {
      const val = parseFloat(p?.price || p?.productPrice || p?.pricerefer || 0);
      if (!isNaN(val) && val >= 0) {
        if (val < min) min = val;
        if (val > max) max = val;
      }
    });
    return {
      minCalculatedPrice: min === Infinity ? 0 : Math.floor(min),
      maxCalculatedPrice: max === -Infinity ? 100000 : Math.ceil(max),
    };
  }, [allProductsList]);



  // Dynamically extract Variants from loaded products
  const dynamicVariants = useMemo(() => {
    if (!allProductsList || allProductsList.length === 0) {
      return { sizes: [], colors: [], customVariants: [] };
    }

    const sizesMap = new Map();
    const colorsMap = new Map();
    const customVariantsMap = new Map();

    allProductsList.forEach((product) => {
      if (Array.isArray(product?.productVarient)) {
        product.productVarient.forEach((variant) => {
          const vName = (variant?.name || "").trim();
          const vValues = Array.isArray(variant?.variantValue)
            ? variant.variantValue
                .map((v) => (typeof v === "object" ? v?.value : v))
                .filter(Boolean)
            : [];

          if (/size|dimension/i.test(vName)) {
            vValues.forEach((val) => {
              const str = String(val).trim();
              sizesMap.set(str, (sizesMap.get(str) || 0) + 1);
            });
          } else if (/colou?r/i.test(vName)) {
            vValues.forEach((val) => {
              const str = String(val).trim();
              colorsMap.set(str, (colorsMap.get(str) || 0) + 1);
            });
          } else if (vName) {
            if (!customVariantsMap.has(vName)) customVariantsMap.set(vName, new Map());
            const valMap = customVariantsMap.get(vName);
            vValues.forEach((val) => {
              const str = String(val).trim();
              valMap.set(str, (valMap.get(str) || 0) + 1);
            });
          }
        });
      }

      if (Array.isArray(product?.productOption)) {
        product.productOption.forEach((opt) => {
          const title = (opt?.title || opt?.name || "").trim();
          const vals = Array.isArray(opt?.values)
            ? opt.values
                .map((v) => (typeof v === "object" ? v?.value : v))
                .filter(Boolean)
            : [];

          if (/size|dimension/i.test(title)) {
            vals.forEach((val) => {
              const str = String(val).trim();
              sizesMap.set(str, (sizesMap.get(str) || 0) + 1);
            });
          } else if (/colou?r/i.test(title)) {
            vals.forEach((val) => {
              const str = String(val).trim();
              colorsMap.set(str, (colorsMap.get(str) || 0) + 1);
            });
          } else if (title) {
            if (!customVariantsMap.has(title)) customVariantsMap.set(title, new Map());
            const valMap = customVariantsMap.get(title);
            vals.forEach((val) => {
              const str = String(val).trim();
              valMap.set(str, (valMap.get(str) || 0) + 1);
            });
          }
        });
      }

      if (Array.isArray(product?.sizes)) {
        product.sizes.forEach((s) => sizesMap.set(String(s).trim(), (sizesMap.get(String(s).trim()) || 0) + 1));
      } else if (product?.size) {
        sizesMap.set(String(product.size).trim(), (sizesMap.get(String(product.size).trim()) || 0) + 1);
      }

      if (Array.isArray(product?.colors)) {
        product.colors.forEach((c) => colorsMap.set(String(c).trim(), (colorsMap.get(String(c).trim()) || 0) + 1));
      } else if (product?.color) {
        colorsMap.set(String(product.color).trim(), (colorsMap.get(String(product.color).trim()) || 0) + 1);
      }

      const name = product?.name || "";
      const storageMatch = name.match(/\b(64GB|128GB|256GB|512GB|1TB|20000mAh|10000mAh|64MP|4K)\b/i);
      if (storageMatch) {
        const str = storageMatch[1].toUpperCase();
        sizesMap.set(str, (sizesMap.get(str) || 0) + 1);
      }

      const knownColorNames = [
        "Black", "White", "Red", "Blue", "Green", "Gold", "Silver", "Grey", "Pink", "Purple"
      ];
      knownColorNames.forEach((c) => {
        const regex = new RegExp(`\\b${c}\\b`, "i");
        if (regex.test(name)) {
          colorsMap.set(c, (colorsMap.get(c) || 0) + 1);
        }
      });
    });

    return {
      sizes: Array.from(sizesMap.entries()).map(([name, count]) => ({ name, count })),
      colors: Array.from(colorsMap.entries()).map(([name, count]) => ({
        name,
        count,
      })),
      customVariants: Array.from(customVariantsMap.entries()).map(([name, map]) => ({
        name,
        options: Array.from(map.entries()).map(([val, count]) => ({ name: val, count })),
      })),
    };
  }, [allProductsList]);

  // Dynamically extract Materials
  const dynamicMaterials = useMemo(() => {
    if (!allProductsList || allProductsList.length === 0) return [];
    const matMap = new Map();
    allProductsList.forEach((p) => {
      const mat = p?.material || p?.materials;
      if (mat) {
        if (Array.isArray(mat)) {
          mat.forEach((m) => matMap.set(String(m).trim(), (matMap.get(String(m).trim()) || 0) + 1));
        } else {
          matMap.set(String(mat).trim(), (matMap.get(String(mat).trim()) || 0) + 1);
        }
      }
    });
    return Array.from(matMap.entries()).map(([name, count]) => ({ name, count }));
  }, [allProductsList]);

  // In Stock Products Count
  const inStockCount = useMemo(() => {
    if (!allProductsList) return 0;
    return allProductsList.filter((p) => {
      const qty = Number(p?.quantity ?? p?.stock ?? 1);
      const hasStock = p?.hasStock !== false && p?.stockStatusId !== 2;
      return qty > 0 && hasStock;
    }).length;
  }, [allProductsList]);

  // Active Category Object (recursive lookup across parents and children)
  const activeCategoryObj = useMemo(() => {
    if (!selectedCategory) return null;
    const findCategory = (list) => {
      for (const cat of list || []) {
        if (
          (cat?.categorySlug || cat?.slug) === selectedCategory ||
          String(cat?.categoryId) === String(selectedCategory)
        ) {
          return cat;
        }
        const foundInChild = findCategory(cat?.children || cat?.child);
        if (foundInChild) return foundInChild;
      }
      return null;
    };
    return findCategory(categoryList);
  }, [categoryList, selectedCategory]);

  const categoryTitle = selectedCategory
    ? activeCategoryObj?.categoryNameTrans ||
      activeCategoryObj?.name ||
      activeCategoryObj?.categoryName ||
      categoryName ||
      selectedCategory
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "All Products";

  // Filtered Category List by Search Input (including matching children)
  const filteredCategoryList = useMemo(() => {
    if (!categoryList) return [];
    if (!categorySearch.trim()) return categoryList;
    const q = categorySearch.toLowerCase().trim();

    const filterCategoryNode = (cat) => {
      const name =
        cat?.categoryNameTrans || cat?.categoryName || cat?.name || "";
      const matchesSelf = name.toLowerCase().includes(q);
      const rawChildren = Array.isArray(cat?.children)
        ? cat.children
        : Array.isArray(cat?.child)
        ? cat.child
        : [];
      const matchingChildren = rawChildren
        .map(filterCategoryNode)
        .filter(Boolean);

      if (matchesSelf || matchingChildren.length > 0) {
        return {
          ...cat,
          children:
            matchingChildren.length > 0 ? matchingChildren : rawChildren,
        };
      }
      return null;
    };

    return categoryList.map(filterCategoryNode).filter(Boolean);
  }, [categoryList, categorySearch]);



  // Toggle array item helper
  const toggleArrayItem = (setter, item) => {
    setter((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const clearAllFilters = () => {
    handleCategoryClick("");
    setPriceOption("any");
    setMinPrice("");
    setMaxPrice("");
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedMaterials([]);
    setSelectedVariantItems([]);
    setSelectedAttributeItems([]);
    setInStockOnly(false);
    setCategorySearch("");
  };

  const hasActiveFilters =
    selectedCategory ||
    priceOption === "custom" ||
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    selectedMaterials.length > 0 ||
    selectedVariantItems.length > 0 ||
    selectedAttributeItems.length > 0 ||
    inStockOnly;

  // Filter products by active filter criteria
  const filteredProducts = useMemo(() => {
    if (!allProductsList) return [];

    let list = allProductsList.filter((product) => {
      // 1. Dynamic Price Filter
      if (priceOption === "custom") {
        const finalP = getProductFinalPrice(product);
        const min = minPrice !== "" ? parseFloat(minPrice) : 0;
        const max = maxPrice !== "" ? parseFloat(maxPrice) : Infinity;
        if (finalP < min || finalP > max) return false;
      }

      // 2. Dynamic Product-Extracted Variant - Size Filter
      if (showExtraFilters && selectedSizes.length > 0) {
        const matchesSize = selectedSizes.some((sz) => {
          const szLower = sz.toLowerCase();
          if (Array.isArray(product?.productVarient)) {
            const hasVariantMatch = product.productVarient.some((v) =>
              /size|dimension/i.test(v?.name || "") &&
              v?.variantValue?.some((val) => String(val?.value || val).toLowerCase() === szLower)
            );
            if (hasVariantMatch) return true;
          }
          if (Array.isArray(product?.productOption)) {
            const hasOptionMatch = product.productOption.some((opt) =>
              /size|dimension/i.test(opt?.title || opt?.name || "") &&
              opt?.values?.some((val) => String(val?.value || val).toLowerCase() === szLower)
            );
            if (hasOptionMatch) return true;
          }
          const pSizes = product?.sizes || product?.size || [];
          if (Array.isArray(pSizes) && pSizes.some((s) => String(s).toLowerCase() === szLower)) return true;
          if (typeof pSizes === "string" && pSizes.toLowerCase().includes(szLower)) return true;
          if (product?.name && product.name.toLowerCase().includes(szLower)) return true;
          return false;
        });
        if (!matchesSize) return false;
      }

      // 3. Dynamic Product-Extracted Variant - Color Filter
      if (showExtraFilters && selectedColors.length > 0) {
        const matchesColor = selectedColors.some((c) => {
          const cLower = c.toLowerCase();
          if (Array.isArray(product?.productVarient)) {
            const hasVariantMatch = product.productVarient.some((v) =>
              /colou?r/i.test(v?.name || "") &&
              v?.variantValue?.some((val) => String(val?.value || val).toLowerCase() === cLower)
            );
            if (hasVariantMatch) return true;
          }
          if (Array.isArray(product?.productOption)) {
            const hasOptionMatch = product.productOption.some((opt) =>
              /colou?r/i.test(opt?.title || opt?.name || "") &&
              opt?.values?.some((val) => String(val?.value || val).toLowerCase() === cLower)
            );
            if (hasOptionMatch) return true;
          }
          const pColors = product?.colors || product?.color || [];
          if (Array.isArray(pColors) && pColors.some((col) => String(col).toLowerCase() === cLower)) return true;
          if (typeof pColors === "string" && pColors.toLowerCase().includes(cLower)) return true;
          if (product?.name && product.name.toLowerCase().includes(cLower)) return true;
          return false;
        });
        if (!matchesColor) return false;
      }

      // 4. Dynamic Attribute - Material Filter
      if (showExtraFilters && selectedMaterials.length > 0) {
        const mat = product?.material || product?.materials || "";
        const matchesMat = selectedMaterials.some((m) =>
          Array.isArray(mat)
            ? mat.some((x) => String(x).toLowerCase() === m.toLowerCase())
            : String(mat).toLowerCase().includes(m.toLowerCase())
        );
        if (!matchesMat) return false;
      }

      // 5. Dynamic Attribute - In Stock Only
      if (showExtraFilters && inStockOnly) {
        const qty = Number(product?.quantity ?? product?.stock ?? 1);
        const hasStock = product?.hasStock !== false && product?.stockStatusId !== 2;
        if (qty <= 0 || !hasStock) return false;
      }

      // 6. Category API Attribute Sections (e.g. Product Colour, Battery Life)
      if (showExtraFilters && selectedAttributeItems.length > 0) {
        if (!matchesFilterSections(product, selectedAttributeItems)) return false;
      }

      // 7. Category API Variant Sections (e.g. Color, Size)
      if (showExtraFilters && selectedVariantItems.length > 0) {
        if (!matchesFilterSections(product, selectedVariantItems)) return false;
      }

      return true;
    });

    // Client-side exact price sorting so Low Price / High Price displays strictly in numerical order
    if (order?.price === "ASC") {
      list.sort((a, b) => getProductFinalPrice(a) - getProductFinalPrice(b));
    } else if (order?.price === "DESC") {
      list.sort((a, b) => getProductFinalPrice(b) - getProductFinalPrice(a));
    }

    return list;
  }, [
    allProductsList,
    selectedCategory,
    priceOption,
    minPrice,
    maxPrice,
    selectedSizes,
    selectedColors,
    selectedMaterials,
    selectedVariantItems,
    selectedAttributeItems,
    inStockOnly,
    showExtraFilters,
    order,
  ]);

  const totalCount = filteredProducts?.length || 0;

  // Render a filter section item with checkbox
  const renderFilterItem = (item, isChecked, onToggle) => {
    return (
      <label
        key={item.id || item.itemSlug || item.itemName}
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

  return (
    <div className="w-full bg-white min-h-[calc(100vh-11.1rem)]">
      <main className="max-w-[1440px] mx-auto px-4 md:px-6 py-4">
        {/* Dynamic Breadcrumbs */}
        <nav className="text-xs text-gray-500 mb-3 flex items-center gap-1.5 font-medium">
          <Link
            href="/"
            className="text-[var(--btn-bg,var(--color-161d25))] hover:underline"
          >
            Home
          </Link>
          <span>/</span>
          {selectedCategory ? (
            <>
              <Link
                href="/products"
                className="text-[var(--btn-bg,var(--color-161d25))] hover:underline"
              >
                All Products
              </Link>
              <span>/</span>
              <span className="text-[var(--color-161d25)] font-semibold">{categoryTitle}</span>
            </>
          ) : (
            <span className="text-[var(--color-161d25)] font-semibold">All Products</span>
          )}
        </nav>

        {/* Header Left + Sort Right */}
        <div className="flex flex-wrap items-end justify-between mb-6 pb-2 border-b border-gray-100 gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--color-161d25)] leading-tight">
              {categoryTitle}
            </h1>
            <p className="text-xs text-gray-600 mt-1 font-medium">
              {filteredProducts && filteredProducts.length === 0
                ? "Showing 0 products"
                : `Showing ${Math.min(limit, Math.max(allProductsListCount || 0, totalCount || 0))} of ${Math.max(allProductsListCount || 0, totalCount || 0)} products`}
            </p>
          </div>

          <div className="flex items-center gap-2 self-end">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-[var(--color-161d25)] bg-white hover:border-[var(--btn-bg,var(--color-161d25))] transition-colors"
            >
              <Filter size={14} />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[var(--btn-bg,var(--color-161d25))]" />
              )}
            </button>

            {/* Limit Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 font-medium">Show:</span>
              <select
                value={limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                aria-label="Products per page"
                className="bg-white border border-gray-300 text-gray-800 text-xs font-medium rounded-md pl-2.5 pr-7 py-1.5 hover:border-gray-400 focus:outline-none focus:border-[var(--btn-bg,#161d25)] focus:ring-1 focus:ring-[var(--btn-bg,#161d25)] cursor-pointer shadow-2xs transition-colors"
              >
                {[8, 12, 16, 24, 32].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 ml-1">
              <span className="text-xs text-gray-500 font-medium">Sort by:</span>
              <Select
                options={options}
                defaultValue={options[0]}
                components={customComponents}
                onChange={handleSort}
                styles={selectCustomStyles}
                classNamePrefix="sort-select"
                isSearchable={false}
              />
            </div>
          </div>
        </div>

        {/* Content Section: Sidebar + Product Grid */}
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-60 shrink-0 space-y-4">
            {hasActiveFilters && (
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-[var(--color-161d25)]">
                  Active Filters
                </span>
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-[var(--btn-bg,var(--color-161d25))] hover:underline flex items-center gap-1 font-semibold transition-opacity hover:opacity-80"
                >
                  <RotateCcw size={12} /> Clear all
                </button>
              </div>
            )}

            {/* Active filter badges */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-1.5 px-1 pb-1">
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-[11px] text-gray-700 font-medium">
                    {categoryTitle}
                    <button
                      onClick={() => handleCategoryClick("")}
                      className="hover:text-red-500"
                    >
                      <X size={11} />
                    </button>
                  </span>
                )}
                {priceOption === "custom" && (minPrice || maxPrice) && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-[11px] text-gray-700 font-medium">
                    ₹{minPrice || "0"} - ₹{maxPrice || maxCalculatedPrice}
                    <button
                      onClick={() => {
                        setPriceOption("any");
                        setMinPrice("");
                        setMaxPrice("");
                      }}
                      className="hover:text-red-500"
                    >
                      <X size={11} />
                    </button>
                  </span>
                )}
                {showExtraFilters && selectedVariantItems.map((val) => (
                  <span
                    key={`badge-var-${val}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-[11px] text-gray-700 font-medium"
                  >
                    {val.includes("~") ? `${val.split("~")[0]}: ${val.split("~")[1]}` : `Variant: ${val}`}
                    <button
                      onClick={() => toggleArrayItem(setSelectedVariantItems, val)}
                      className="hover:text-red-500"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
                {showExtraFilters && selectedAttributeItems.map((val) => (
                  <span
                    key={`badge-attr-${val}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-[11px] text-gray-700 font-medium"
                  >
                    {val.includes("~") ? `${val.split("~")[0]}: ${val.split("~")[1]}` : val}
                    <button
                      onClick={() => toggleArrayItem(setSelectedAttributeItems, val)}
                      className="hover:text-red-500"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
                {showExtraFilters && selectedSizes.map((sz) => (
                  <span
                    key={`badge-sz-${sz}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-[11px] text-gray-700 font-medium"
                  >
                    Size: {sz}
                    <button
                      onClick={() => toggleArrayItem(setSelectedSizes, sz)}
                      className="hover:text-red-500"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
                {showExtraFilters && selectedColors.map((col) => (
                  <span
                    key={`badge-col-${col}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-[11px] text-gray-700 font-medium"
                  >
                    Color: {col}
                    <button
                      onClick={() => toggleArrayItem(setSelectedColors, col)}
                      className="hover:text-red-500"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}

                {showExtraFilters && inStockOnly && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-[11px] text-gray-700 font-medium">
                    In Stock
                    <button
                      onClick={() => setInStockOnly(false)}
                      className="hover:text-red-500"
                    >
                      <X size={11} />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* 1. Categories Accordion Card (Always visible) */}
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-2xs">
              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="w-full flex items-center justify-between text-sm font-semibold text-[var(--color-161d25)] pb-1"
              >
                <span>Categories</span>
                {categoriesOpen ? (
                  <ChevronUp size={16} className="text-gray-500" />
                ) : (
                  <ChevronDown size={16} className="text-gray-500" />
                )}
              </button>

              {categoriesOpen && (
                <div className="mt-3 space-y-2 text-xs text-gray-600">
                  {/* Category dynamic search input */}
                  {categoryList && categoryList.length > 5 && (
                    <div className="relative mb-2">
                      <Search
                        size={12}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="Search category..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        className="w-full pl-7 pr-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-[var(--btn-bg,var(--color-161d25))]"
                      />
                    </div>
                  )}

                  <button
                    onClick={() => handleCategoryClick("")}
                    className={`block w-full text-left py-1 px-1.5 rounded-md transition-colors hover:text-[var(--btn-bg,var(--color-161d25))] ${
                      !selectedCategory
                        ? "bg-gray-100 font-semibold text-[var(--btn-bg,var(--color-161d25))]"
                        : "text-gray-600"
                    }`}
                  >
                    All
                  </button>
                  {isCategoryLoading ? (
                    <p className="text-gray-400 py-1">Loading...</p>
                  ) : filteredCategoryList.length === 0 ? (
                    <p className="text-gray-400 py-1 text-[11px]">No categories found</p>
                  ) : (
                    filteredCategoryList.map((cat) => (
                      <CategoryTreeItem
                        key={cat?.categoryId || cat?.categorySlug || cat?.slug}
                        cat={cat}
                        selectedCategory={selectedCategory}
                        onCategoryClick={handleCategoryClick}
                        expandedCategories={expandedCategories}
                        toggleExpand={toggleExpandCategory}
                      />
                    ))
                  )}
                </div>
              )}
            </div>

            {/* 2. Price Filter Accordion Card (Always visible: Any price, Custom) */}
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-2xs">
              <div className="border-b border-gray-100 pb-3 mb-3">
                <h3 className="text-sm font-semibold text-[var(--color-161d25)]">Filter</h3>
                <p className="text-xs text-gray-400 mt-0.5">{totalCount} Products</p>
              </div>

              <div>
                <button
                  onClick={() => setPriceOpen(!priceOpen)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-[var(--color-161d25)]"
                >
                  <span>Price</span>
                  {priceOpen ? (
                    <ChevronUp size={14} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={14} className="text-gray-500" />
                  )}
                </button>

                {priceOpen && (
                  <div className="mt-3 space-y-2.5 text-xs">
                    <CustomRadio
                      checked={priceOption === "any"}
                      onChange={() => setPriceOption("any")}
                      label="Any price"
                    />

                    <CustomRadio
                      checked={priceOption === "custom"}
                      onChange={() => setPriceOption("custom")}
                      label="Custom"
                    />

                    {priceOption === "custom" && (
                      <PriceRangeSlider
                        minLimit={minCalculatedPrice}
                        maxLimit={maxCalculatedPrice}
                        minPrice={minPrice}
                        maxPrice={maxPrice}
                        onChange={(newMin, newMax) => {
                          setMinPrice(newMin);
                          setMaxPrice(newMax);
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Extra Filters (Variants & Attributes): ONLY shown when a category is selected */}
            {showExtraFilters && (
              <>
                {/* Dynamic Variants Filter Accordion Card */}
                {(apiVariantSections.length > 0 ||
                  dynamicVariants.sizes.length > 0 ||
                  dynamicVariants.colors.length > 0 ||
                  dynamicVariants.customVariants.length > 0) && (
                  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-2xs">
                    <button
                      onClick={() => setVariantsOpen(!variantsOpen)}
                      className="w-full flex items-center justify-between text-sm font-semibold text-[var(--color-161d25)] pb-1"
                    >
                      <span>Variants</span>
                      {variantsOpen ? (
                        <ChevronUp size={16} className="text-gray-500" />
                      ) : (
                        <ChevronDown size={16} className="text-gray-500" />
                      )}
                    </button>

                    {variantsOpen && (
                      <div className="mt-3 space-y-4">
                        {/* Category API Variants shown like Attributes */}
                        {apiVariantSections.length > 0 &&
                          apiVariantSections.map((sec) => (
                            <div key={sec.id || sec.sectionSlug || sec.sectionName}>
                              <span className="text-xs font-medium text-gray-600 mb-2 block">
                                {sec.sectionName}
                              </span>
                              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                {sec.sectionItem?.map((item) => {
                                  const filterKey = `${sec.sectionSlug || sec.sectionName}~${item.itemSlug || item.itemName}`;
                                  const isChecked = selectedVariantItems.includes(filterKey);
                                  return renderFilterItem(
                                    item,
                                    isChecked,
                                    () => toggleArrayItem(setSelectedVariantItems, filterKey)
                                  );
                                })}
                              </div>
                            </div>
                          ))}

                        {/* Fallback to product-extracted variants if no category API variants */}
                        {apiVariantSections.length === 0 && (
                          <>
                            {dynamicVariants.sizes.length > 0 && (
                              <div>
                                <span className="text-xs font-medium text-gray-600 mb-2 block">
                                  Size / Capacity
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {dynamicVariants.sizes.map(({ name }) => {
                                    const isSelected = selectedSizes.includes(name);
                                    return (
                                      <button
                                        key={name}
                                        onClick={() => toggleArrayItem(setSelectedSizes, name)}
                                        className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
                                          isSelected
                                            ? "border-[var(--btn-bg,var(--color-161d25))] bg-[var(--btn-bg,var(--color-161d25))] text-white font-semibold"
                                            : "border-gray-300 text-gray-700 hover:border-[var(--btn-bg,var(--color-161d25))]"
                                        }`}
                                        style={
                                          isSelected
                                            ? {
                                                backgroundColor: "var(--btn-bg, var(--color-161d25))",
                                                borderColor: "var(--btn-bg, var(--color-161d25))",
                                              }
                                            : {}
                                        }
                                      >
                                        {name}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {dynamicVariants.colors.length > 0 && (
                              <div>
                                <span className="text-xs font-medium text-gray-600 mb-2 block">
                                  Color
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {dynamicVariants.colors.map(({ name }) => {
                                    const isSelected = selectedColors.includes(name);
                                    return (
                                      <button
                                        key={name}
                                        onClick={() => toggleArrayItem(setSelectedColors, name)}
                                        className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
                                          isSelected
                                            ? "border-[var(--btn-bg,var(--color-161d25))] bg-[var(--btn-bg,var(--color-161d25))] text-white font-semibold"
                                            : "border-gray-300 text-gray-700 hover:border-[var(--btn-bg,var(--color-161d25))]"
                                        }`}
                                      >
                                        {name}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {dynamicVariants.customVariants.map((customVar) => (
                              <div key={customVar.name}>
                                <span className="text-xs font-medium text-gray-600 mb-2 block">
                                  {customVar.name}
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {customVar.options.map(({ name }) => {
                                    const isSelected = selectedSizes.includes(name);
                                    return (
                                      <button
                                        key={name}
                                        onClick={() => toggleArrayItem(setSelectedSizes, name)}
                                        className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
                                          isSelected
                                            ? "border-[var(--btn-bg,var(--color-161d25))] bg-[var(--btn-bg,var(--color-161d25))] text-white font-semibold"
                                            : "border-gray-300 text-gray-700 hover:border-[var(--btn-bg,var(--color-161d25))]"
                                        }`}
                                        style={
                                          isSelected
                                            ? {
                                                backgroundColor: "var(--btn-bg, var(--color-161d25))",
                                                borderColor: "var(--btn-bg, var(--color-161d25))",
                                              }
                                            : {}
                                        }
                                      >
                                        {name}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Dynamic Attributes Filter Accordion Card */}
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-2xs">
                  <button
                    onClick={() => setAttributesOpen(!attributesOpen)}
                    className="w-full flex items-center justify-between text-sm font-semibold text-[var(--color-161d25)] pb-1"
                  >
                    <span>Attributes</span>
                    {attributesOpen ? (
                      <ChevronUp size={16} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-500" />
                    )}
                  </button>

                  {attributesOpen && (
                    <div className="mt-3 space-y-4 text-xs">
                      {/* Category API Attribute Sections (e.g. Product Colour, Battery Life) */}
                      {apiAttributeSections.length > 0 &&
                        apiAttributeSections.map((sec) => (
                          <div key={sec.id || sec.sectionSlug || sec.sectionName}>
                            <span className="text-xs font-medium text-gray-600 mb-2 block">
                              {sec.sectionName}
                            </span>
                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                              {sec.sectionItem?.map((item) => {
                                const filterKey = `${sec.sectionSlug || sec.sectionName}~${item.itemSlug || item.itemName}`;
                                const isChecked = selectedAttributeItems.includes(filterKey);
                                return renderFilterItem(
                                  item,
                                  isChecked,
                                  () => toggleArrayItem(setSelectedAttributeItems, filterKey)
                                );
                              })}
                            </div>
                          </div>
                        ))}



                      {/* Dynamic Material List */}
                      {dynamicMaterials.length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-gray-600 mb-2 block">
                            Material
                          </span>
                          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                            {dynamicMaterials.map(({ name, count }) => (
                              <CustomCheckbox
                                key={name}
                                checked={selectedMaterials.includes(name)}
                                onChange={() => toggleArrayItem(setSelectedMaterials, name)}
                                label={name}
                                count={count}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* In Stock Only Availability */}
                      <div className="pt-2 border-t border-gray-100">
                        <CustomCheckbox
                          checked={inStockOnly}
                          onChange={(val) => setInStockOnly(val)}
                          label="In Stock Only"
                          count={inStockCount}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </aside>

          {/* Mobile Filter Drawer */}
          {mobileFilterOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-xs"
                onClick={() => setMobileFilterOpen(false)}
              />
              <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-xl flex flex-col z-10 p-4 overflow-y-auto">
                <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
                  <h3 className="font-bold text-sm text-[var(--color-161d25)]">Filters</h3>
                  <button onClick={() => setMobileFilterOpen(false)}>
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-5 text-xs">
                  {/* Dynamic Categories */}
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-800">Categories</h4>
                    {categoryList && categoryList.length > 5 && (
                      <div className="relative mb-2">
                        <Search
                          size={12}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="text"
                          placeholder="Search category..."
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          className="w-full pl-7 pr-2 py-1 text-xs border border-gray-200 rounded-md"
                        />
                      </div>
                    )}
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      <button
                        onClick={() => {
                          handleCategoryClick("");
                          setMobileFilterOpen(false);
                        }}
                        className={`block w-full text-left py-1 px-1.5 rounded-md hover:text-[var(--btn-bg,var(--color-161d25))] ${
                          !selectedCategory
                            ? "bg-gray-100 font-bold text-[var(--btn-bg,var(--color-161d25))]"
                            : "text-gray-600"
                        }`}
                      >
                        All
                      </button>
                      {filteredCategoryList.map((cat) => (
                        <CategoryTreeItem
                          key={cat?.categoryId || cat?.categorySlug || cat?.slug}
                          cat={cat}
                          selectedCategory={selectedCategory}
                          onCategoryClick={(slug, catId) => {
                            handleCategoryClick(slug, catId);
                            setMobileFilterOpen(false);
                          }}
                          expandedCategories={expandedCategories}
                          toggleExpand={toggleExpandCategory}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Price (Always visible) */}
                  <div className="border-t border-gray-200 pt-3 space-y-2">
                    <h4 className="font-semibold mb-2 text-gray-800">Price</h4>
                    <CustomRadio
                      checked={priceOption === "any"}
                      onChange={() => setPriceOption("any")}
                      label="Any price"
                    />
                    <CustomRadio
                      checked={priceOption === "custom"}
                      onChange={() => setPriceOption("custom")}
                      label="Custom"
                    />
                    {priceOption === "custom" && (
                      <PriceRangeSlider
                        minLimit={minCalculatedPrice}
                        maxLimit={maxCalculatedPrice}
                        minPrice={minPrice}
                        maxPrice={maxPrice}
                        onChange={(newMin, newMax) => {
                          setMinPrice(newMin);
                          setMaxPrice(newMax);
                        }}
                      />
                    )}
                  </div>

                  {/* Extra Filters (Variants & Attributes): ONLY shown when category selected */}
                  {showExtraFilters && (
                    <>
                      {/* Dynamic Variants */}
                      {(apiVariantSections.length > 0 ||
                        dynamicVariants.sizes.length > 0 ||
                        dynamicVariants.colors.length > 0) && (
                        <div className="border-t border-gray-200 pt-3 space-y-3">
                          <h4 className="font-semibold text-gray-800">Variants</h4>

                          {apiVariantSections.length > 0 ? (
                            apiVariantSections.map((sec) => (
                              <div key={`m-${sec.id || sec.sectionName}`}>
                                <span className="text-gray-600 block mb-1.5">{sec.sectionName}</span>
                                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                  {sec.sectionItem?.map((item) => {
                                    const filterKey = `${sec.sectionSlug || sec.sectionName}~${item.itemSlug || item.itemName}`;
                                    const isChecked = selectedVariantItems.includes(filterKey);
                                    return renderFilterItem(
                                      item,
                                      isChecked,
                                      () => toggleArrayItem(setSelectedVariantItems, filterKey)
                                    );
                                  })}
                                </div>
                              </div>
                            ))
                          ) : (
                            <>
                              {dynamicVariants.sizes.length > 0 && (
                                <div>
                                  <span className="text-gray-600 block mb-1.5">Size / Capacity</span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {dynamicVariants.sizes.map(({ name }) => (
                                      <button
                                        key={name}
                                        onClick={() => toggleArrayItem(setSelectedSizes, name)}
                                        className={`px-2 py-1 text-xs rounded border ${
                                          selectedSizes.includes(name)
                                            ? "bg-[var(--btn-bg,var(--color-161d25))] text-white font-semibold"
                                            : "border-gray-300 text-gray-700"
                                        }`}
                                        style={
                                          selectedSizes.includes(name)
                                            ? {
                                                backgroundColor: "var(--btn-bg, var(--color-161d25))",
                                                borderColor: "var(--btn-bg, var(--color-161d25))",
                                              }
                                            : {}
                                        }
                                      >
                                        {name}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {dynamicVariants.colors.length > 0 && (
                                <div>
                                  <span className="text-gray-600 block mb-1.5">Color</span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {dynamicVariants.colors.map(({ name }) => {
                                      const isSelected = selectedColors.includes(name);
                                      return (
                                        <button
                                          key={name}
                                          onClick={() => toggleArrayItem(setSelectedColors, name)}
                                          className={`px-3 py-1.5 text-xs rounded-md border transition-all ${
                                            isSelected
                                              ? "border-[var(--btn-bg,var(--color-161d25))] bg-[var(--btn-bg,var(--color-161d25))] text-white font-semibold"
                                              : "border-gray-300 text-gray-700"
                                          }`}
                                        >
                                          {name}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}

                      {/* Dynamic Attributes */}
                      <div className="border-t border-gray-200 pt-3 space-y-3">
                        <h4 className="font-semibold text-gray-800">Attributes</h4>

                        {apiAttributeSections.map((sec) => (
                          <div key={`m-attr-${sec.id || sec.sectionName}`}>
                            <span className="text-gray-600 block mb-1.5">{sec.sectionName}</span>
                            <div className="space-y-1.5 max-h-40 overflow-y-auto">
                              {sec.sectionItem?.map((item) => {
                                const filterKey = `${sec.sectionSlug || sec.sectionName}~${item.itemSlug || item.itemName}`;
                                const isChecked = selectedAttributeItems.includes(filterKey);
                                return renderFilterItem(
                                  item,
                                  isChecked,
                                  () => toggleArrayItem(setSelectedAttributeItems, filterKey)
                                );
                              })}
                            </div>
                          </div>
                        ))}


                      </div>

                      {/* In Stock */}
                      <div className="border-t border-gray-200 pt-3">
                        <CustomCheckbox
                          checked={inStockOnly}
                          onChange={(val) => setInStockOnly(val)}
                          label="In Stock Only"
                          count={inStockCount}
                        />
                      </div>
                    </>
                  )}

                  <div className="border-t border-gray-200 pt-3">
                    <button
                      onClick={clearAllFilters}
                      className="w-full py-2 text-xs font-semibold border border-gray-300 text-[var(--btn-bg,var(--color-161d25))] hover:bg-gray-50 rounded-md"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Product Grid Area */}
          <div className="flex-1 min-w-0">
            {isAllProductsListLoading ? (
              <div className="w-full mx-auto px-0 pb-8 grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
                <Skeletonloader />
              </div>
            ) : filteredProducts && filteredProducts?.length > 0 ? (
              <>
                <div className="w-full mx-auto px-0 pb-8 grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
                  {filteredProducts?.map((product, index) => (
                    <ProductCard
                      key={`${product?.productId || product?.id || "product"}-${index}`}
                      token={token}
                      rawProduct={product}
                      categorySlug={selectedCategory || initialCategorySlug || product?.categorySlug || product?.Category?.[0]?.categorySlug || ""}
                    />
                  ))}
                </div>

                {/* Pagination Bar */}
                <div className="pt-4 pb-12 flex justify-center w-full">
                  <PaginationBar
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalResults={Math.max(allProductsListCount || 0, filteredProducts?.length || 0)}
                    pageSize={limit}
                    limit={limit}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-col justify-center items-center w-full min-h-[480px] py-16">
                <NotFound />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AllProductListPageClient;
