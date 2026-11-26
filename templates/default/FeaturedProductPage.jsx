"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronRight, Search, ArrowUpDown } from "lucide-react";
import ProductCard from "./Component/ProductCard/Index";
import { getFeaturedProductList } from "@/api/FeaturedProductApi";
import { isMedusaAdapter } from "@/config/adapter.config";
import { ProductCardSkeleton } from "./Component/SkeletonLoader";

const FeaturedProductPage = ({
  token,
  storeSettings,
  initialProducts = [],
  featuredProductResponse,
}) => {
  if (isMedusaAdapter()) {
    return null;
  }
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [trigger, setTrigger] = useState(0);
  const [compareTrigger, setCompareTrigger] = useState(0);
  const [products, setProducts] = useState(
    Array.isArray(initialProducts) ? initialProducts : []
  );
  const [isLoading, setIsLoading] = useState(false);
  const isFirstRenderRef = useRef(true);
  const activeRequestIdRef = useRef(0);

  // Debounce search input by 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchTerm.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchFeaturedProducts = useCallback(async (keywordVal, sortByVal) => {
    const requestId = ++activeRequestIdRef.current;
    setIsLoading(true);

    const params = {
      limit: 20,
      offset: 0,
    };

    const trimmed = (keywordVal || "").trim();
    if (trimmed) {
      params.keyword = trimmed;
    }

    if (sortByVal === "price-asc") {
      params.sortBy = "price";
      params.sortOrder = "ASC";
    } else if (sortByVal === "price-desc") {
      params.sortBy = "price";
      params.sortOrder = "DESC";
    } else if (sortByVal === "name-asc") {
      params.sortBy = "name";
      params.sortOrder = "ASC";
    } else if (sortByVal === "name-desc") {
      params.sortBy = "name";
      params.sortOrder = "DESC";
    }

    try {
      const res = await getFeaturedProductList(params);
      if (requestId === activeRequestIdRef.current) {
        let list = [];
        if (res?.status === 1 && Array.isArray(res?.data)) {
          list = res.data;
        } else if (Array.isArray(res)) {
          list = res;
        }
        setProducts(list);
      }
    } catch (err) {
      if (requestId === activeRequestIdRef.current) {
        console.error("Failed to fetch featured products:", err);
        setProducts([]);
      }
    } finally {
      if (requestId === activeRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Trigger API fetch on sort change or debounced keyword change
  useEffect(() => {
    if (isMedusaAdapter()) return;

    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      if (Array.isArray(initialProducts) && initialProducts.length > 0 && sortBy === "default" && !debouncedKeyword) {
        return;
      }
    }

    fetchFeaturedProducts(debouncedKeyword, sortBy);
  }, [debouncedKeyword, sortBy, fetchFeaturedProducts, initialProducts]);

  const title = "Featured Products";
  const description =
    "Explore our handpicked selection of top-rated and featured products curated just for you.";

  return (
    <div className="min-h-screen bg-[var(--color-white)] text-[var(--color-161d25)] pb-16">
      {/* Breadcrumb Header */}
      <div className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50/60 dark:bg-zinc-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav className="flex items-center gap-2 text-xs md:text-sm text-gray-500 dark:text-zinc-400">
            <Link
              prefetch={false}
              href="/"
              className="hover:text-[var(--btn-bg,var(--color-161d25))] transition-colors"
            >
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-medium text-[var(--color-161d25)] dark:text-zinc-100 truncate max-w-[200px] md:max-w-none">
              Featured Products
            </span>
          </nav>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-8">
        {/* Title and Description Banner */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-gray-100 dark:border-zinc-800">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-161d25)] dark:text-white tracking-tight">
                {title}
              </h1>
              {description && (
                <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            <div className="text-xs md:text-sm font-medium text-gray-500 dark:text-zinc-400 shrink-0">
              Showing{" "}
              <span className="text-[var(--color-161d25)] dark:text-white font-semibold">
                {products.length}
              </span>{" "}
              {products.length === 1 ? "product" : "products"}
            </div>
          </div>

          {/* Controls Bar: Search & Sort (Always visible) */}
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search in featured products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs md:text-sm border border-gray-200 dark:border-zinc-700 rounded-lg bg-transparent focus:outline-none focus:border-[var(--btn-bg,var(--color-161d25))] dark:focus:border-white transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs md:text-sm py-2 px-2.5 border border-gray-200 dark:border-zinc-700 rounded-lg bg-transparent text-[var(--color-161d25)] dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="default" className="text-black">
                  Default
                </option>
                <option value="price-asc" className="text-black">
                  Price: Low to High
                </option>
                <option value="price-desc" className="text-black">
                  Price: High to Low
                </option>
                <option value="name-asc" className="text-black">
                  Name: A to Z
                </option>
                <option value="name-desc" className="text-black">
                  Name: Z to A
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
            {Array.from({ length: 10 }).map((_, idx) => (
              <ProductCardSkeleton key={idx} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
            {products.map((item, index) => (
              <ProductCard
                key={`${item?.productId || item?.id || "product"}-${index}`}
                token={token}
                rawProduct={item}
                trigger={trigger}
                setTrigger={setTrigger}
                comparetrigger={compareTrigger}
                setCompareTrigger={setCompareTrigger}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-4 bg-gray-50/60 dark:bg-zinc-900/30 rounded-2xl border border-gray-100 dark:border-zinc-800">
            <p className="text-base font-medium text-gray-700 dark:text-zinc-300">
              No featured products found
            </p>
            <p className="text-xs md:text-sm text-gray-500 dark:text-zinc-400 mt-1">
              {searchTerm
                ? "No products matched your search keyword."
                : "There are currently no featured products available."}
            </p>
            <div className="mt-6">
              <Link
                prefetch={false}
                href="/products"
                className="inline-flex items-center px-4 py-2 rounded-lg text-xs md:text-sm font-medium bg-[var(--btn-bg,var(--color-161d25))] text-white hover:opacity-90 transition-opacity"
              >
                Browse All Products
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedProductPage;
