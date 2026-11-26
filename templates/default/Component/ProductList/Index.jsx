"use client";
import React, { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";
import { useTranslations } from "next-intl";

import useAllProductsFunc from "@/GlobalComponents/Hooks/useProduct/useAllProducts";
import { useProductFilters } from "./hooks/useProductFilters";
import { FilterSidebar, MobileFilterDrawer } from "./components/FilterSidebar";
import ProductGrid from "./components/ProductGrid";
import ProductPagination from "./components/ProductPagination";

const Select = dynamic(() => import("react-select"), { ssr: false });

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

/**
 * AllProductListPageClient component - default storefront product list page.
 * Composes filtering, grid layout, and pagination with custom hooks.
 */
const AllProductListPageClient = ({
  token,
  storeSettings,
  initialCategorySlug = "",
  categoryName = "",
  initialKeyword = "",
}) => {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryQuery = searchParams?.get("category") || searchParams?.get("categoryId") || searchParams?.get("category_id") || "";
  const categoryIdQuery = searchParams?.get("categoryId") || searchParams?.get("category_id") || "";
  const keywordQuery = searchParams?.get("keyword") || searchParams?.get("search") || initialKeyword || "";
  const initialCategoryRef = React.useRef(categoryQuery || initialCategorySlug || "");

  // Temporary container for selected site-filter values needed by useAllProductsFunc
  const [selectedVariantItems, setSelectedVariantItems] = useState([]);
  const [selectedAttributeItems, setSelectedAttributeItems] = useState([]);

  const {
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
    selectedCategoryId,
    handleCategoryChange,
    selectedKeyword,
    handleKeywordChange,
    isCategoryLoading,
    currentPage,
    limit,
    handleLimitChange,
    totalPages,
    handlePageChange,
  } = useAllProductsFunc({
    token,
    storeSettings,
    initialCategorySlug: initialCategoryRef.current,
    initialKeyword: keywordQuery,
    variantFilter: selectedVariantItems,
    attributeFilter: selectedAttributeItems,
  });

  const localizedOptions = useMemo(() => {
    return [
      { value: {}, label: t("productlist.all") || "All" },
      { value: { price: "ASC", latestArrival: 0 }, label: t("productlist.priceLowHigh") || "Low Price" },
      { value: { price: "DESC", latestArrival: 0 }, label: t("productlist.priceHighLow") || "High Price" },
      { value: { price: "", latestArrival: 1 }, label: t("productlist.mostRecent") || "Most Recent" },
    ];
  }, [t]);

  // Sync category only when URL search param actually changes externally (e.g. browser back/forward)
  const prevCategoryQueryRef = React.useRef(categoryQuery);
  useEffect(() => {
    if (prevCategoryQueryRef.current !== categoryQuery) {
      prevCategoryQueryRef.current = categoryQuery;
      handleCategoryChange(categoryQuery || "", categoryIdQuery || "");
    }
  }, [categoryQuery, categoryIdQuery, handleCategoryChange]);

  // Sync keyword when URL search param changes
  useEffect(() => {
    if (keywordQuery !== undefined && keywordQuery !== selectedKeyword) {
      handleKeywordChange?.(keywordQuery);
    }
  }, [keywordQuery, selectedKeyword, handleKeywordChange]);

  const currentCategory = selectedCategory;

  // Main custom filtering hook
  const filters = useProductFilters({
    allProductsList,
    categoryList,
    selectedCategory: currentCategory,
    handleCategoryChange,
    categoryName,
    storeSettings,
    order,
    router,
    allProductsListCount,
  });

  // Keep hook filters synced with useAllProductsFunc query state
  useEffect(() => {
    setSelectedVariantItems(filters.selectedVariantItems);
  }, [filters.selectedVariantItems]);

  useEffect(() => {
    setSelectedAttributeItems(filters.selectedAttributeItems);
  }, [filters.selectedAttributeItems]);

  const {
    filteredProducts,
    totalCount,
    hasActiveFilters,
    categoryTitle,
    mobileFilterOpen,
    setMobileFilterOpen,
  } = filters;

  return (
    <div className="w-full bg-white min-h-[calc(100vh-11.1rem)]">
      <main className="max-w-[1440px] mx-auto px-4 md:px-6 py-4">
        {/* Breadcrumb Navigation */}
        <nav className="text-xs text-gray-500 mb-3 flex items-center gap-1.5 font-medium">
          <Link
            href="/"
            className="text-[var(--btn-bg,var(--color-161d25))] hover:underline"
          >
            {t("Header.home") || "Home"}
          </Link>
          <span>/</span>
          {selectedCategory ? (
            <>
              <Link
                href="/products"
                className="text-[var(--btn-bg,var(--color-161d25))] hover:underline"
              >
                {t("productlist.allProducts") || "All Products"}
              </Link>
              <span>/</span>
              <span className="text-[var(--color-161d25)] font-semibold">
                {categoryTitle}
              </span>
            </>
          ) : (
            <span className="text-[var(--color-161d25)] font-semibold">
              {t("productlist.allProducts") || "All Products"}
            </span>
          )}
        </nav>

        {/* Header Left (Title & Count) + Header Right (Mobile Toggle, Limit, Sort) */}
        <div className="flex flex-wrap items-end justify-between mb-6 pb-2 border-b border-gray-100 gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--color-161d25)] leading-tight">
              {keywordQuery
                ? `${t("productlist.searchResultsFor") || "Search results for"} "${keywordQuery}"`
                : selectedCategory
                ? categoryTitle
                : (t("productlist.allProducts") || "All Products")}
            </h1>
            {keywordQuery && selectedCategory && (
              <p className="text-xs text-gray-500 mt-0.5">
                Filtered under <span className="font-semibold text-gray-700">{categoryTitle}</span>
              </p>
            )}
            <p className="text-xs text-gray-600 mt-1 font-medium">
              {filteredProducts && filteredProducts.length === 0
                ? (t("productlist.showingZeroProducts") || "Showing 0 products")
                : (t("productlist.showingOfProducts", {
                    current: Math.min(limit, Math.max(allProductsListCount || 0, totalCount || 0)),
                    total: Math.max(allProductsListCount || 0, totalCount || 0),
                  }) ||
                  `${t("productlist.showing") || "Showing"} ${Math.min(limit, Math.max(allProductsListCount || 0, totalCount || 0))} ${t("productlist.of") || "of"} ${Math.max(allProductsListCount || 0, totalCount || 0)} ${t("productlist.products") || "products"}`)}
            </p>
          </div>

          <div className="flex items-center gap-2 self-end">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-[var(--color-161d25)] bg-white hover:border-[var(--btn-bg,var(--color-161d25))] transition-colors"
            >
              <Filter size={14} />
              <span>{t("productlist.filters") || "Filters"}</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[var(--btn-bg,var(--color-161d25))]" />
              )}
            </button>

            {/* Limit Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 font-medium">{t("productlist.show") || "Show"}:</span>
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

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 ml-1">
              <span className="text-xs text-gray-500 font-medium">{t("productlist.sortBy") || "Sort by:"}</span>
              <Select
                options={localizedOptions}
                defaultValue={localizedOptions[0]}
                components={customComponents}
                onChange={handleSort}
                styles={selectCustomStyles}
                classNamePrefix="sort-select"
                isSearchable={false}
              />
            </div>
          </div>
        </div>

        {/* Content Section: Sidebar + Product Grid + Pagination */}
        <div className="flex gap-6">
          {/* Desktop Filter Sidebar */}
          <FilterSidebar
            filters={filters}
            categoryList={categoryList}
            isCategoryLoading={isCategoryLoading}
          />

          {/* Mobile Filter Drawer */}
          <MobileFilterDrawer
            isOpen={mobileFilterOpen}
            onClose={() => setMobileFilterOpen(false)}
            filters={filters}
            categoryList={categoryList}
            isCategoryLoading={isCategoryLoading}
          />

          {/* Product Grid & Pagination Area */}
          <div className="flex-1 min-w-0">
            <ProductGrid
              products={filteredProducts}
              isLoading={isAllProductsListLoading}
              Skeletonloader={Skeletonloader}
              token={token}
              selectedCategory={currentCategory}
              initialCategorySlug={initialCategorySlug}
            />

            <ProductPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalResults={Math.max(allProductsListCount || 0, filteredProducts?.length || 0)}
              limit={limit}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AllProductListPageClient;
