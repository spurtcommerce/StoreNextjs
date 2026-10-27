"use client";
import React, { useMemo, useCallback } from "react";
import Image from "next/image";
import { imageUrl } from "@/utilities/url";
import { resolveProductImageUrl } from "@/utilities/mediaResolver";
import Link from "next/link";
import CommonButton from "@/GlobalComponents/Reused/CommonButton";

export default function ProductCard({
  token,
  rawProduct = {},
  onAddToCart,
}) {
  //  Memoized price formatting (Intl.NumberFormat is heavy if run on every render)
  const formatPrice = useMemo(() => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    });
  }, []);

  const formattedPrice = useCallback(
    (v) => (v ? formatPrice.format(v) : "₹0"),
    [formatPrice]
  );

  //  Memoize image URL to avoid recomputing every render
  const LogoSrc = useMemo(() => {
    return resolveProductImageUrl(rawProduct, { width: 400, height: 400 });
  }, [rawProduct]);

  const rating = rawProduct?.rating ?? 0;
  const comparePrice = rawProduct?.comparePrice ?? 0;
  const price = rawProduct?.price ?? 0;
  const discount =
    comparePrice > price
      ? Math.round(((comparePrice - price) / comparePrice) * 100)
      : 0;

  //  Stable add-to-cart handler
  const handleAdd = useCallback(() => {
    onAddToCart?.(rawProduct);
  }, [onAddToCart, rawProduct]);

  return (
    <article
      className="group relative bg-[var(--color-white)] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
      aria-label={rawProduct?.name || "Product"}
    >
      {/*  Product Image */}
      <Link prefetch={false} href={`/products/${String(rawProduct?.productSlug || rawProduct?.slug || "").replace(/^\/+/, "")}`}>
      <div className="relative w-full h-56 sm:h-64 lg:h-56 bg-[var(--color-gray-100)]">
        <Image
          src={LogoSrc}
          alt={rawProduct?.widget_title || rawProduct?.name || "Product Image"}
          fill
          loading="lazy"
          placeholder="blur"
          blurDataURL="/img/no-image.png"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
          unoptimized
        />
      </div>
      </Link>

      {/*  Content */}
      <div className="p-4 sm:p-5">
        {/* Product Title */}
        <Link prefetch={false} href={`/products/${String(rawProduct?.productSlug || rawProduct?.slug || "").replace(/^\/+/, "")}`}>
          <h3
            className="text-sm sm:text-base font-medium text-[var(--color-gray-900)] line-clamp-2 hover:text-[var(--color-primary)] transition-colors"
            title={rawProduct?.widget_title || rawProduct?.skuName || rawProduct?.name}
          >
            {rawProduct?.widget_title ||
              (rawProduct?.skuName
                ? `${rawProduct?.skuName} - ${rawProduct?.productNameTrans || rawProduct?.name}`
                : rawProduct?.productNameTrans || rawProduct?.name)}
          </h3>
        </Link>

        {/* Rating */}
        {rating > 0 && (
          <div className="mt-2 flex items-center gap-2 text-sm text-[var(--color-gray-500)]">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => {
                const filled = i + 1 <= Math.round(rating);
                return (
                  <svg
                    key={i}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    className={`${
                      filled ? "text-[var(--color-yellow-500)]" : "text-[var(--color-gray-300)]"
                    } transition-colors`}
                    fill={filled ? "currentColor" : "none"}
                  >
                    <path d="M12 .587l3.668 7.431L23.4 9.748l-5.7 5.554L19.336 24 12 20.202 4.664 24l1.636-8.698L.6 9.748l7.732-1.73L12 .587z" />
                  </svg>
                );
              })}
            </div>
            <span className="text-xs">{rating.toFixed(1)}</span>
            {rawProduct?.reviews && (
              <span className="text-xs text-[var(--color-gray-400)]">
                ({rawProduct?.reviews} reviews)
              </span>
            )}
          </div>
        )}

        {/* Pricing */}
        <div className="mt-3 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-3">
              <span className="text-lg sm:text-xl font-semibold text-[var(--color-gray-900)]">
                {formattedPrice(price)}
              </span>
              {comparePrice > 0 && (
                <span className="text-sm line-through text-[var(--color-gray-400)]">
                  {formattedPrice(comparePrice)}
                </span>
              )}
            </div>
            {discount > 0 && (
              <div className="mt-1 text-xs text-[var(--color-green-600)] font-medium">
                Save {discount}%
              </div>
            )}
          </div>

          {/* Add to Cart Button */}
          <CommonButton
            onClick={handleAdd}
            variant="primary"
            size="sm"
            startIcon={
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="-ml-0.5"
              >
                <path
                  d="M6 6h15l-1.5 9h-12z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="10" cy="20" r="1" fill="currentColor" />
                <circle cx="18" cy="20" r="1" fill="currentColor" />
              </svg>
            }
            className="rounded-xl shadow hover:scale-105 transition-transform"
          >
            Add
          </CommonButton>
        </div>
      </div>
      
    </article>
  );
}
