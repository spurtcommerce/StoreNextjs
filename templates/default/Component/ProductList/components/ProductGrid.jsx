"use client";
import React from "react";
import ProductCard from "../../ProductCard/Index";
import NotFound from "@/GlobalComponents/Shared/Common/ProductNotFound";
import { ProductGridSkeleton } from "../../SkeletonLoader";

/**
 * ProductGrid component - handles loading skeletons, product cards, and not-found states
 */
export const ProductGrid = ({
  products = [],
  isLoading = false,
  Skeletonloader,
  token,
  selectedCategory,
  initialCategorySlug,
}) => {
  if (isLoading) {
    return <ProductGridSkeleton count={8} />;
  }

  if (products && products.length > 0) {
    return (
      <div className="w-full mx-auto px-0 pb-8 grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
        {products.map((product, index) => (
          <ProductCard
            key={`${product?.productId || product?.id || "product"}-${index}`}
            token={token}
            rawProduct={product}
            showActionButton={false}
            categorySlug={
              selectedCategory ||
              product?.categorySlug ||
              product?.Category?.[0]?.categorySlug ||
              ""
            }
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center w-full min-h-[480px] py-16">
      <NotFound />
    </div>
  );
};

export default ProductGrid;
