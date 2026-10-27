"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Search, ArrowUpDown } from "lucide-react";
import ProductCard from "@/GlobalComponents/useProductCard";
import { getReplacedHTMLValue } from "@/utilities/commonFunctions";
import { PriceCalculate } from "@/utilities/PriceCalculate";

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
  return isNaN(num) ? parseFloat(p?.price || p?.productPrice || 0) || 0 : num;
};

const WidgetListPage = ({ token, storeSettings, widget, slug }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [trigger, setTrigger] = useState(0);
  const [compareTrigger, setCompareTrigger] = useState(0);

  const rawProducts = useMemo(() => {
    if (!widget) return [];
    if (Array.isArray(widget.widgetItems) && widget.widgetItems.length > 0) {
      return widget.widgetItems;
    }
    if (Array.isArray(widget.items) && widget.items.length > 0) {
      return widget.items;
    }
    if (Array.isArray(widget.products) && widget.products.length > 0) {
      return widget.products;
    }
    return [];
  }, [widget]);

  const title =
    widget?.widgetTranslation?.[0]?.widgetTitle ||
    widget?.widgetTitle ||
    widget?.widgetLongTitle ||
    (slug
      ? String(slug)
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : "Widget Products");

  const description =
    widget?.widgetDescription ||
    widget?.widgetLongTitle ||
    "";

  // Filter & sort products
  const filteredProducts = useMemo(() => {
    let list = [...rawProducts];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter((p) => {
        const name = (p.name || p.productName || p.title || "").toLowerCase();
        const sku = (p.sku || p.skuName || "").toLowerCase();
        return name.includes(q) || sku.includes(q);
      });
    }

    if (sortBy === "price-asc") {
      list.sort((a, b) => getProductFinalPrice(a) - getProductFinalPrice(b));
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => getProductFinalPrice(b) - getProductFinalPrice(a));
    } else if (sortBy === "name-asc") {
      list.sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      );
    } else if (sortBy === "name-desc") {
      list.sort((a, b) =>
        (b.name || "").localeCompare(a.name || "")
      );
    }

    return list;
  }, [rawProducts, searchTerm, sortBy]);

  return (
    <div className="min-h-screen bg-[var(--color-white)] text-[var(--color-161d25)] pb-16">
      {/* Breadcrumb Header */}
      <div className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50/60 dark:bg-zinc-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav className="flex items-center gap-2 text-xs md:text-sm text-gray-500 dark:text-zinc-400">
            <Link
              href="/"
              className="hover:text-[var(--btn-bg,var(--color-161d25))] transition-colors"
            >
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <Link
              href="/products"
              className="hover:text-[var(--btn-bg,var(--color-161d25))] transition-colors"
            >
              Widgets
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-medium text-[var(--color-161d25)] dark:text-zinc-100 truncate max-w-[200px] md:max-w-none">
              {title}
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
                <div
                  className="mt-2 text-sm text-gray-600 dark:text-zinc-400 max-w-3xl leading-relaxed [&_p]:mb-1 [&_ul]:list-disc [&_ul]:pl-5"
                  dangerouslySetInnerHTML={{
                    __html: getReplacedHTMLValue(description),
                  }}
                />
              )}
            </div>

            <div className="text-xs md:text-sm font-medium text-gray-500 dark:text-zinc-400 shrink-0">
              Showing{" "}
              <span className="text-[var(--color-161d25)] dark:text-white font-semibold">
                {filteredProducts.length}
              </span>{" "}
              {filteredProducts.length === 1 ? "product" : "products"}
            </div>
          </div>

          {/* Controls Bar: Search & Sort */}
          {rawProducts.length > 0 && (
            <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search in this widget..."
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
                  <option value="default" className="text-black">Featured</option>
                  <option value="price-asc" className="text-black">Price: Low to High</option>
                  <option value="price-desc" className="text-black">Price: High to Low</option>
                  <option value="name-asc" className="text-black">Name: A to Z</option>
                  <option value="name-desc" className="text-black">Name: Z to A</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
            {filteredProducts.map((item, index) => (
              <ProductCard
                key={item?.productId || item?.id || index}
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
              No products found
            </p>
            <p className="text-xs md:text-sm text-gray-500 dark:text-zinc-400 mt-1">
              {searchTerm
                ? "No products matched your search keyword."
                : "This widget currently does not have any active products."}
            </p>
            <div className="mt-6">
              <Link
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

export default WidgetListPage;
