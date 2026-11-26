"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import ProductCard from "@/GlobalComponents/Hooks/useProduct/useProductCard";
import { getFeaturedProductList } from "@/api/FeaturedProductApi";
import { isMedusaAdapter } from "@/config/adapter.config";
import { FeaturedProductsSkeleton } from "../SkeletonLoader";

const FeaturedProducts = ({
  token,
  featuredProducts = [],
  title = "Featured Products",
}) => {
  if (isMedusaAdapter()) {
    return null;
  }
  const t = useTranslations("productDetail");
  const [products, setProducts] = useState(
    Array.isArray(featuredProducts) ? featuredProducts : []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [trigger, setTrigger] = useState(0);
  const [comparetrigger, setCompareTrigger] = useState(0);

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (isMedusaAdapter()) return;
    if (Array.isArray(featuredProducts) && featuredProducts.length > 0) {
      setProducts(featuredProducts);
    } else if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      setIsLoading(true);
      getFeaturedProductList({ limit: 10, offset: 0 })
        .then((res) => {
          if (res?.status === 1 && Array.isArray(res?.data) && res.data.length > 0) {
            setProducts(res.data);
          } else if (Array.isArray(res) && res.length > 0) {
            setProducts(res);
          }
        })
        .catch(() => { })
        .finally(() => setIsLoading(false));
    }
  }, [featuredProducts]);

  const uniqueProducts = React.useMemo(() => {
    if (!Array.isArray(products)) return [];
    const seen = new Set();
    return products.filter((p) => {
      const id = p?.skuId || p?.productId || p?.id || p?.productSlug;
      if (!id) return true;
      const key = String(id);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [products]);

  if (isLoading && (!products || products.length === 0)) {
    return <FeaturedProductsSkeleton count={5} />;
  }

  if (!uniqueProducts || uniqueProducts.length === 0) {
    return null;
  }

  const displayedItems = uniqueProducts.slice(0, 5);
  const hasMoreThanFive = uniqueProducts.length > 5;
  const viewMoreHref = "/featured-product";

  return (
    <div className="mt-[16px] md:mt-[40px]" data-testid="default-featured-products">
      {/* Heading and View More link */}
      <div className="flex items-center justify-between gap-4 mb-2 md:mb-3">
        <h2 className="text-[18px] md:text-[22px] font-semibold leading-[24px] md:leading-[28px] text-[var(--color-161d25)]">
          {title}
        </h2>
        <Link
          prefetch={false}
          href={viewMoreHref}
          className="text-xs md:text-sm font-normal text-gray-500 hover:text-[var(--color-161d25)] dark:text-zinc-400 dark:hover:text-white hover:underline transition-colors shrink-0"
        >
          {t("viewMore") || "View More"}
        </Link>
      </div>

      {/* Products Grid */}
      <div className="w-full mx-auto px-0 py-[16px] md:py-8 grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-[16px] md:gap-6">
        {displayedItems.map((product, idx) => {
          const productKey =
            product?.skuId ||
            product?.productId ||
            product?.id ||
            product?.productSlug ||
            "product";
          return (
            <ProductCard
              key={`${productKey}-${idx}`}
              token={token}
              rawProduct={product}
              trigger={trigger}
              setTrigger={setTrigger}
              comparetrigger={comparetrigger}
              setCompareTrigger={setCompareTrigger}
            />
          );
        })}
      </div>

      {hasMoreThanFive && (
        <div className="flex justify-center -mt-2 mb-4 sm:hidden">
          <Link
            href={viewMoreHref}
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-[var(--color-161d25)] border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t("viewMore") || "View More"} &rarr;
          </Link>
        </div>
      )}
    </div>
  );
};

export default FeaturedProducts;
