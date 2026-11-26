import Link from "next/link";
import React from "react";
import CustomNextImage from "@/GlobalComponents/Shared/Common/CustomNextImage";

export const resolveCategoryForKeyword = (kw, categories) => {
  if (!kw || !Array.isArray(categories) || categories.length === 0) return null;
  const cleanKw = String(kw).toLowerCase().trim();
  if (!cleanKw) return null;

  const flatten = (list) =>
    list.reduce((acc, cat) => {
      acc.push(cat);
      if (Array.isArray(cat.children) && cat.children.length > 0) {
        acc.push(...flatten(cat.children));
      }
      return acc;
    }, []);

  const allCats = flatten(categories);

  // 1. Exact match on categoryName or categorySlug
  let match = allCats.find(
    (c) =>
      (c?.categoryName || "").toLowerCase().trim() === cleanKw ||
      (c?.categorySlug || "").toLowerCase().trim() === cleanKw
  );
  if (match) return match;

  // 2. Category name contains keyword or keyword contains category name
  match = allCats.find((c) => {
    const name = (c?.categoryName || "").toLowerCase().trim();
    return name && (name.includes(cleanKw) || cleanKw.includes(name));
  });
  if (match) return match;

  // 3. Significant word matching (e.g. "sofa" in "sofa set" matches "Sofas & Couches")
  const stopWords = new Set(["set", "the", "and", "for", "with", "all", "pro", "new"]);
  const words = cleanKw
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !stopWords.has(w));

  for (const word of words) {
    const singular = word.replace(/s$/, "");
    match = allCats.find((c) => {
      const name = (c?.categoryName || "").toLowerCase();
      const slug = (c?.categorySlug || "").toLowerCase();
      return (
        name.includes(word) ||
        name.includes(singular) ||
        slug.includes(word) ||
        slug.includes(singular)
      );
    });
    if (match) return match;
  }

  return null;
};

const highlightText = (text, search) => {
  if (!search || !text) return text;
  const str = String(text);
  const q = String(search).trim();
  if (!q) return str;

  if (str.toLowerCase().startsWith(q.toLowerCase())) {
    return (
      <>
        <span className="font-normal text-gray-500">{str.slice(0, q.length)}</span>
        <span className="font-bold text-gray-900">{str.slice(q.length)}</span>
      </>
    );
  }

  const idx = str.toLowerCase().indexOf(q.toLowerCase());
  if (idx !== -1) {
    return (
      <>
        <span className="font-bold text-gray-900">{str.slice(0, idx)}</span>
        <span className="font-normal text-gray-500">{str.slice(idx, idx + q.length)}</span>
        <span className="font-bold text-gray-900">{str.slice(idx + q.length)}</span>
      </>
    );
  }

  return <span className="font-medium text-gray-900">{str}</span>;
};

export default function KeywordSearch({
  productKeywordSearch,
  focusedIndex = -1,
  keywordLoader = false,
  keyword = "",
  categories = [],
  onKeywordClick,
  isAdvancedSkuSearch = true,
}) {
  if (keywordLoader) {
    return [...Array(5)].map((_, index) => <ProductSkeleton key={index} />);
  }

  if (!productKeywordSearch?.length) {
    return null;
  }

  return productKeywordSearch.map((item, index) => {
    const data = typeof item === "string" ? item : item?.name || item?.keyword || "";
    const isKeywordItem =
      isAdvancedSkuSearch ||
      item?.isKeywordSuggestion ||
      typeof item === "string" ||
      (!item?.productSlug && !item?.image && !item?.productImage);

    const itemImage =
      item?.image ||
      item?.productImage?.image ||
      item?.thumbnail ||
      (typeof item?.productImage === "string" ? item.productImage : "");
    const itemContainer =
      item?.containerName ||
      item?.productImage?.containerName ||
      "";

    const itemCatName =
      (typeof item?.categoryName === "string" ? item.categoryName : item?.categoryName?.name) ||
      (typeof item?.category === "string" ? item.category : item?.category?.name) ||
      "";
    const itemCatSlug =
      item?.categorySlug ||
      item?.categoryName?.categorySlug ||
      item?.category?.categorySlug ||
      "";

    const matchedCat = itemCatName
      ? {
          categoryName: itemCatName,
          categorySlug: itemCatSlug || itemCatName.toLowerCase().replace(/\s+/g, "-"),
        }
      : resolveCategoryForKeyword(data, categories);

    const targetHref = item?.productSlug && !isKeywordItem
      ? `/products/${item.productSlug}`
      : matchedCat?.categorySlug
      ? `/products?category=${encodeURIComponent(matchedCat.categorySlug)}`
      : `/products?keyword=${encodeURIComponent(data)}`;

    const handleClick = (e) => {
      if (onKeywordClick) {
        e.preventDefault();
        onKeywordClick(data, matchedCat, targetHref, item);
      }
    };

    return (
      <div key={index}>
        <Link
          prefetch={false}
          href={targetHref}
          id={String(index)}
          onClick={handleClick}
          className={`flex cursor-pointer items-center space-x-3 px-4 py-2.5 transition-colors hover:bg-blue-50 ${
            focusedIndex === index ? "bg-blue-50" : ""
          }`}
        >
          {/* Keyword suggestion icon vs product thumbnail */}
          {isKeywordItem ? (
            <div className="w-5 h-5 flex items-center justify-center shrink-0 text-gray-400">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </div>
          ) : (
            <div className="w-10 h-10 rounded border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden">
              {itemImage ? (
                <CustomNextImage
                  containerName={itemContainer}
                  imageName={itemImage}
                  alt={data}
                  height={80}
                  width={80}
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src="/img/search.svg"
                  alt="searchIcon"
                  className="h-4 w-4 text-gray-400"
                />
              )}
            </div>
          )}

          {/* Keyword Text */}
          <div className="flex flex-col space-y-0.5 min-w-0 flex-1">
            <h6 className="line-clamp-1 text-sm text-gray-800">
              {highlightText(data, keyword)}
            </h6>
            {!isKeywordItem && matchedCat?.categoryName && (
              <span className="text-xs text-[#1877f2] font-normal truncate">
                in <span className="font-medium">{matchedCat.categoryName}</span>
              </span>
            )}
          </div>
        </Link>
      </div>
    );
  });
}

const ProductSkeleton = () => (
  <div className="flex animate-pulse items-center space-x-3 px-4 py-2.5">
    <div className="h-10 w-10 rounded bg-gray-200 shrink-0" />
    <div className="flex flex-1 flex-col space-y-1.5">
      <div className="h-3.5 w-3/4 rounded bg-gray-200" />
      <div className="h-2.5 w-1/3 rounded bg-gray-200" />
    </div>
  </div>
);

export { KeywordSearch, ProductSkeleton, highlightText };
