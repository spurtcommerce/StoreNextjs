"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { getfilter } from "@/api/ProductDetailApi";
import { getAllProductsList } from "@/api/ProductsApi";
import { PriceCalculate } from "@/utilities/PriceCalculate";
import { resolveStoreCurrency } from "@/utilities/localStorage";
import { isDynamicAdapter, isMedusaAdapter } from "@/config/adapter.config";

/**
 * Helper to calculate product final price with discounts and taxes
 */
export const getProductFinalPrice = (p) => {
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

/**
 * Helper to extract sections from site-filter API response formats
 */
export const extractSections = (res) => {
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

/**
 * Match product against Category API Filter sections (Attributes & Variants)
 */
export const matchesFilterSections = (product, selectedItems) => {
  if (!selectedItems || selectedItems.length === 0) return true;

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

      // 1. Check specifications
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

      // 2. Check productVarient
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

      // 5. If color section, check colors array or product name
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

/**
 * Custom hook to manage all filtering, faceted search, category hierarchy,
 * dynamic attribute/variant extraction, and price range filtering for ProductList.
 */
export function useProductFilters({
  allProductsList = [],
  categoryList = [],
  selectedCategory = "",
  handleCategoryChange,
  categoryName = "",
  storeSettings = null,
  order = null,
  router,
  allProductsListCount,
}) {
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);
  const [variantsOpen, setVariantsOpen] = useState(true);
  const [attributesOpen, setAttributesOpen] = useState(true);

  const [categorySearch, setCategorySearch] = useState("");
  const [categoryCounts, setCategoryCounts] = useState({});
  const [priceOption, setPriceOption] = useState("any");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);

  const [filterSections, setFilterSections] = useState([]);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [selectedVariantItems, setSelectedVariantItems] = useState([]);
  const [selectedAttributeItems, setSelectedAttributeItems] = useState([]);

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const showExtraFilters = Boolean(selectedCategory);

  const primaryStoreSetting = Array.isArray(storeSettings) ? storeSettings[0] : storeSettings;
  const storeCurrencySymbol =
    primaryStoreSetting?.symbolLeft ||
    primaryStoreSetting?.currencySymbolLeft ||
    primaryStoreSetting?.currencySymbol ||
    primaryStoreSetting?.symbolRight ||
    resolveStoreCurrency({}, null, "INR").currencySymbol ||
    "₹";

  const toggleExpandCategory = useCallback((catId) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
      }
      return next;
    });
  }, []);

  // Extract category counts if already present on category objects without querying count=1 per category
  useEffect(() => {
    if (!Array.isArray(categoryList) || !categoryList.length) return;

    const flattenCategories = (items) => {
      const result = [];
      items.forEach((item) => {
        result.push(item);
        const children = item?.children || item?.child;
        if (Array.isArray(children) && children.length > 0) {
          result.push(...flattenCategories(children));
        }
      });
      return result;
    };

    const flat = flattenCategories(categoryList);
    const initialCounts = {};

    flat.forEach((cat) => {
      const slug = cat?.categorySlug || cat?.slug || "";
      const catId = String(cat?.categoryId || "");
      const directCount =
        cat?.productCount ??
        cat?.productAvailableCount ??
        cat?.products_count ??
        cat?.count ??
        cat?.totalCount;

      if (directCount !== undefined && directCount !== null) {
        const num = Number(directCount);
        const val = !isNaN(num) ? num : 0;
        if (slug) initialCounts[slug] = val;
        if (catId) initialCounts[catId] = val;
      }
    });

    if (Object.keys(initialCounts).length > 0) {
      setCategoryCounts((prev) => ({ ...prev, ...initialCounts }));
    }
  }, [categoryList]);

  const totalAllCount = useMemo(() => {
    if (allProductsListCount !== undefined && allProductsListCount !== null && allProductsListCount > 0) {
      return allProductsListCount;
    }
    const vals = Object.values(categoryCounts || {});
    if (vals.length > 0) {
      return vals.reduce((sum, n) => sum + (Number(n) || 0), 0);
    }
    return undefined;
  }, [allProductsListCount, categoryCounts]);

  const toggleArrayItem = useCallback((setter, item) => {
    setter((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  }, []);

  // Auto-expand parents of currently selected category
  useEffect(() => {
    if (!selectedCategory || !categoryList) return;
    const target = String(selectedCategory).toLowerCase().trim();
    const findParents = (list, parents = []) => {
      for (const cat of list || []) {
        const catSlug = String(cat?.categorySlug || cat?.slug || "").toLowerCase().trim();
        const catName = String(cat?.categoryNameTrans || cat?.categoryName || cat?.name || "").toLowerCase().trim();
        const catId = String(cat?.categoryId || catSlug).toLowerCase().trim();
        const isMatch = Boolean(
          catSlug === target ||
          catName === target ||
          catId === target ||
          catSlug.replace(/[-_]/g, " ") === target.replace(/[-_]/g, " ") ||
          catName.replace(/[-_]/g, " ") === target.replace(/[-_]/g, " ")
        );
        if (isMatch) {
          return parents;
        }
        const children = cat?.children || cat?.child || [];
        if (children.length > 0) {
          const found = findParents(children, [...parents, catId]);
          if (found) return found;
        }
      }
      return null;
    };
    const parentIds = findParents(categoryList);
    if (parentIds && parentIds.length > 0) {
      setExpandedCategories((prev) => {
        const next = new Set(prev);
        parentIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }, [selectedCategory, categoryList]);

  // Handle category selection and router navigation
  const handleCategoryClick = useCallback(
    (slug, catId) => {
      const getActiveKeyword = () => {
        if (typeof window === "undefined") return "";
        try {
          const sp = new URLSearchParams(window.location.search);
          return sp.get("keyword") || sp.get("search") || "";
        } catch {
          return "";
        }
      };
      const activeKw = getActiveKeyword();

      const isClearing =
        !slug ||
        selectedCategory === slug ||
        String(selectedCategory).toLowerCase().trim() === String(slug).toLowerCase().trim();

      if (isClearing) {
        handleCategoryChange?.("", "");
        setSelectedVariantItems([]);
        setSelectedAttributeItems([]);
        setSelectedSizes([]);
        setSelectedColors([]);
        setSelectedMaterials([]);
        setFilterSections([]);
        const targetUrl = activeKw ? `/products?keyword=${encodeURIComponent(activeKw)}` : "/products";
        if (router?.replace) {
          router.replace(targetUrl, { scroll: false });
        } else if (router?.push) {
          router.push(targetUrl, { scroll: false });
        }
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", targetUrl);
        }
      } else {
        handleCategoryChange?.(slug, catId);
        // Clear previous category's variants and attributes when switching to another category
        setSelectedVariantItems([]);
        setSelectedAttributeItems([]);
        setSelectedSizes([]);
        setSelectedColors([]);
        setSelectedMaterials([]);
        if (catId) {
          setExpandedCategories((prev) => new Set(prev).add(String(catId)));
        }
        const targetUrl = slug
          ? (activeKw
              ? `/products?category=${encodeURIComponent(slug)}&keyword=${encodeURIComponent(activeKw)}`
              : `/products?category=${encodeURIComponent(slug)}`)
          : (activeKw ? `/products?keyword=${encodeURIComponent(activeKw)}` : "/products");
        if (router?.replace) {
          router.replace(targetUrl, { scroll: false });
        } else if (router?.push) {
          router.push(targetUrl, { scroll: false });
        }
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", targetUrl);
        }
      }
    },
    [selectedCategory, handleCategoryChange, router]
  );

  // Fetch dynamic category site-filter
  useEffect(() => {
    let isMounted = true;
    const fetchCategoryFilters = async () => {
      if (!selectedCategory || isMedusaAdapter()) {
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

  // Calculate dynamic min and max price limits from product list
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

  // Active Category Object
  const activeCategoryObj = useMemo(() => {
    if (!selectedCategory) return null;
    const target = String(selectedCategory).toLowerCase().trim();
    const findCategory = (list) => {
      for (const cat of list || []) {
        const cSlug = String(cat?.categorySlug || cat?.slug || "").toLowerCase().trim();
        const cName = String(cat?.categoryNameTrans || cat?.categoryName || cat?.name || "").toLowerCase().trim();
        const cId = String(cat?.categoryId || "").toLowerCase().trim();
        if (
          cSlug === target ||
          cName === target ||
          cId === target ||
          cSlug.replace(/[-_]/g, " ") === target.replace(/[-_]/g, " ") ||
          cName.replace(/[-_]/g, " ") === target.replace(/[-_]/g, " ") ||
          (cSlug && target.includes(cSlug)) ||
          (cName && target.includes(cName))
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

  // Filtered Category List by Search Input
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

  const clearAllFilters = useCallback(() => {
    handleCategoryChange?.("", "");
    setPriceOption("any");
    setMinPrice("");
    setMaxPrice("");
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedMaterials([]);
    setSelectedVariantItems([]);
    setSelectedAttributeItems([]);
    setFilterSections([]);
    setInStockOnly(false);
    setCategorySearch("");

    const getActiveKeyword = () => {
      if (typeof window === "undefined") return "";
      try {
        const sp = new URLSearchParams(window.location.search);
        return sp.get("keyword") || sp.get("search") || "";
      } catch {
        return "";
      }
    };
    const activeKw = getActiveKeyword();
    const targetUrl = activeKw ? `/products?keyword=${encodeURIComponent(activeKw)}` : "/products";
    if (router?.replace) {
      router.replace(targetUrl, { scroll: false });
    } else if (router?.push) {
      router.push(targetUrl, { scroll: false });
    }
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", targetUrl);
    }
  }, [handleCategoryChange, router]);

  const hasActiveFilters =
    Boolean(selectedCategory) ||
    priceOption === "custom" ||
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    selectedMaterials.length > 0 ||
    selectedVariantItems.length > 0 ||
    selectedAttributeItems.length > 0 ||
    inStockOnly;

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    if (!allProductsList) return [];

    let list = allProductsList.filter((product) => {
      if (priceOption === "custom") {
        const finalP = getProductFinalPrice(product);
        const min = minPrice !== "" ? parseFloat(minPrice) : 0;
        const max = maxPrice !== "" ? parseFloat(maxPrice) : Infinity;
        if (finalP < min || finalP > max) return false;
      }

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

      if (showExtraFilters && selectedMaterials.length > 0) {
        const mat = product?.material || product?.materials || "";
        const matchesMat = selectedMaterials.some((m) =>
          Array.isArray(mat)
            ? mat.some((x) => String(x).toLowerCase() === m.toLowerCase())
            : String(mat).toLowerCase().includes(m.toLowerCase())
        );
        if (!matchesMat) return false;
      }

      if (showExtraFilters && inStockOnly) {
        const qty = Number(product?.quantity ?? product?.stock ?? 1);
        const hasStock = product?.hasStock !== false && product?.stockStatusId !== 2;
        if (qty <= 0 || !hasStock) return false;
      }

      if (showExtraFilters && selectedAttributeItems.length > 0) {
        if (!matchesFilterSections(product, selectedAttributeItems)) return false;
      }

      if (showExtraFilters && selectedVariantItems.length > 0) {
        if (!matchesFilterSections(product, selectedVariantItems)) return false;
      }

      return true;
    });

    if (order?.price === "ASC") {
      list.sort((a, b) => getProductFinalPrice(a) - getProductFinalPrice(b));
    } else if (order?.price === "DESC") {
      list.sort((a, b) => getProductFinalPrice(b) - getProductFinalPrice(a));
    }

    return list;
  }, [
    allProductsList,
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

  return {
    categoriesOpen,
    setCategoriesOpen,
    priceOpen,
    setPriceOpen,
    variantsOpen,
    setVariantsOpen,
    attributesOpen,
    setAttributesOpen,
    categorySearch,
    setCategorySearch,
    priceOption,
    setPriceOption,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    selectedSizes,
    setSelectedSizes,
    selectedColors,
    setSelectedColors,
    selectedMaterials,
    setSelectedMaterials,
    inStockOnly,
    setInStockOnly,
    filterSections,
    isFilterLoading,
    selectedVariantItems,
    setSelectedVariantItems,
    selectedAttributeItems,
    setSelectedAttributeItems,
    mobileFilterOpen,
    setMobileFilterOpen,
    expandedCategories,
    toggleExpandCategory,
    toggleArrayItem,
    handleCategoryClick,
    clearAllFilters,
    showExtraFilters,
    storeCurrencySymbol,
    apiVariantSections,
    apiAttributeSections,
    minCalculatedPrice,
    maxCalculatedPrice,
    dynamicVariants,
    dynamicMaterials,
    inStockCount,
    activeCategoryObj,
    categoryTitle,
    selectedCategory,
    filteredCategoryList,
    categoryCounts,
    totalAllCount,
    hasActiveFilters,
    filteredProducts,
    totalCount,
  };
}

export default useProductFilters;
