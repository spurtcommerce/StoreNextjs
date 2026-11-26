"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useTranslations } from "next-intl";

import { ProductCompareListApi } from "@/api/ProductSearchApi/productsearch";
import { getAllProductsList } from "@/api/ProductsApi";
import { getProductDetail } from "@/api/ProductDetailApi";
import { isSpurtAdapter, isOpenCartAdapter } from "@/config/adapter.config";
import { resolveCompareImageSrc } from "@/utilities/url";
import { PriceCalculate } from "@/utilities/PriceCalculate";
import CustomCurrencyFormatter from "@/GlobalComponents/Shared/Common/CustomCurrencyFormatter";
import CustomImage from "@/GlobalComponents/Hooks/useCustomImage";
import { AddToCartLocal, findMatchingCartItem, buildCompareCartItem } from "@/utilities/AddToCart";
import { addToCartApi } from "@/api/cartApi";
import { ToastMessage } from "@/utilities/toast";
import CompareSkeleton from "./Component/CompareSkeleton";

import { checkoutItems, enableBackOrder, enableFailedOrder } from "@/redux/slices/cartCheckout";
import { getClientAuthToken, getValidAuthToken } from "@/utilities/tokenHelper";
import { triggerOpenHeaderModal } from "@/utilities/eventBus";
import CustomStarRating from "@/GlobalComponents/Shared/Feedback/AverageRating/CustomStarRating";
import { getAverageRating } from "@/api/AverageRatingApi";
import { hasCapability } from "@/adapters/models/registry/adapter.registry";

const safeTranslate = (t, key, fallback) => {
  try {
    if (t && typeof t.has === "function" && t.has(key)) {
      const res = t(key);
      if (
        res &&
        typeof res === "string" &&
        !res.startsWith("MISSING_MESSAGE") &&
        !res.includes("Could not resolve") &&
        res !== key
      ) {
        return res;
      }
    } else if (typeof t === "function") {
      const res = t(key);
      if (
        res &&
        typeof res === "string" &&
        !res.startsWith("MISSING_MESSAGE") &&
        !res.includes("Could not resolve") &&
        res !== key
      ) {
        return res;
      }
    }
  } catch (e) {}
  return fallback;
};

const getRatingVal = (product) => {
  if (!product) return 0;
  const raw = product?.rating ?? product?.avgRating ?? product?.averageRating;
  const num = Number(raw);
  return !isNaN(num) && num > 0 ? num : 0;
};

const getReviewCount = (product) => {
  if (!product) return 0;

  const rawCount = product?.reviewCount ?? product?.totalReview ?? product?.totalReviews ?? product?.count;
  if (typeof rawCount === "number" && !isNaN(rawCount)) {
    return rawCount;
  }
  if (typeof rawCount === "string" && rawCount.trim() !== "" && !isNaN(Number(rawCount))) {
    return Number(rawCount);
  }

  if (Array.isArray(product?.reviews)) {
    return product.reviews.length;
  }
  if (Array.isArray(product?.productReview)) {
    return product.productReview.length;
  }
  if (Array.isArray(product?.review)) {
    return product.review.length;
  }

  if (typeof product?.reviews === "object" && product?.reviews !== null) {
    const objCount = Number(product.reviews.count ?? product.reviews.total ?? product.reviews.length);
    if (!isNaN(objCount)) return objCount;
  }

  if (typeof product?.reviews === "number" && !isNaN(product.reviews)) {
    return product.reviews;
  }
  if (typeof product?.reviews === "string" && product.reviews.trim() !== "" && !isNaN(Number(product.reviews))) {
    return Number(product.reviews);
  }

  const rCount = product?.ratingCount;
  if (
    rCount !== undefined &&
    rCount !== null &&
    rCount !== "" &&
    !isNaN(Number(rCount)) &&
    Number(rCount) !== Number(product?.rating)
  ) {
    return Number(rCount);
  }

  const ratingVal = Number(product?.rating || 0);
  if (!isNaN(ratingVal) && ratingVal > 0) {
    return 1;
  }

  return 0;
};

export default function ComparePage({ token }) {
  const t = useTranslations();
  const router = useRouter();
  const dispatch = useDispatch();

  const [compareProductList, setCompareProductList] = useState([]);
  const [loader, setLoader] = useState(false);
  const isFetchingRef = useRef(false);
  const lastFetchedKeyRef = useRef("");

  const getProductCategoryName = (product) => {
    if (!product) return "-";
    if (typeof product?.categoryName === "string" && product?.categoryName.trim()) {
      return product.categoryName;
    }
    if (product?.categoryName?.name) {
      return product.categoryName.name;
    }
    if (product?.categoryName?.categoryName) {
      return product.categoryName.categoryName;
    }
    if (Array.isArray(product?.Category) && product.Category.length > 0) {
      const cat = product.Category[0];
      if (typeof cat === "string") return cat;
      if (cat?.categoryName) return cat.categoryName;
      if (cat?.name) return cat.name;
    }
    if (Array.isArray(product?.category) && product.category.length > 0) {
      const cat = product.category[0];
      if (typeof cat === "string") return cat;
      if (cat?.name) return cat.name;
      if (cat?.categoryName) return cat.categoryName;
    }
    if (typeof product?.category === "string" && product.category.trim()) {
      return product.category;
    }
    if (product?.category?.name) {
      return product.category.name;
    }
    if (product?.category?.categoryName) {
      return product.category.categoryName;
    }
    return "-";
  };

  const getProductDetailHref = (product) => {
    const rawSlug =
      product?.productSlug ||
      product?.slug ||
      product?.skuName ||
      product?.productId ||
      product?.id ||
      "";
    const cleanSlug = String(rawSlug).replace(/^\/+/, "");
    return `/products/${cleanSlug}`;
  };

  const getStockInfo = (product) => {
    const isBackOrderEnabled =
      product?.enableBackOrders == 1 ||
      product?.enableBackOrders === true ||
      Number(product?.enableBackOrders) === 1 ||
      product?.enableBackOrder == 1 ||
      product?.enableBackOrder === true ||
      Number(product?.enableBackOrder) === 1 ||
      product?.enable_back_orders == 1 ||
      product?.enable_back_orders === true ||
      Number(product?.enable_back_orders) === 1;

    const rawQty = Number(product?.quantity);
    const rawThreshold =
      product?.outOfStockThreshold !== null &&
      product?.outOfStockThreshold !== undefined &&
      product?.outOfStockThreshold !== ""
        ? Number(product?.outOfStockThreshold)
        : product?.out_of_stock_threshold !== null &&
          product?.out_of_stock_threshold !== undefined &&
          product?.out_of_stock_threshold !== ""
        ? Number(product?.out_of_stock_threshold)
        : null;

    // Out of regular stock when:
    // 1. quantity <= outOfStockThreshold
    // 2. Or quantity <= 0
    // 3. Or stockStatus === 'outOfStock'
    // 4. Or hasStock == 0 / false
    const isThresholdReached =
      (rawThreshold !== null &&
        !isNaN(rawThreshold) &&
        !isNaN(rawQty) &&
        rawQty <= rawThreshold) ||
      (!isNaN(rawQty) && rawQty <= 0) ||
      product?.stockStatus === "outOfStock" ||
      product?.hasStock == 0 ||
      product?.hasStock === false;

    const backOrderStock = Number(
      product?.availableBackOrderStock !== undefined &&
        product?.availableBackOrderStock !== null
        ? product?.availableBackOrderStock
        : product?.available_back_order_stock
    );
    const isBackOrderActive =
      isBackOrderEnabled &&
      isThresholdReached &&
      (!isNaN(backOrderStock) ? backOrderStock > 0 : true);

    const hasRegularStock =
      !isThresholdReached &&
      (product?.hasStock == 1 ||
        product?.hasStock === true ||
        product?.hasStock === undefined) &&
      (!isNaN(rawQty) ? rawQty > 0 : true);

    return {
      isThresholdReached,
      isBackOrderEnabled,
      isBackOrderActive,
      hasRegularStock,
    };
  };

  const getProductStockState = getStockInfo;

  const handleBackOrder = (product) => {
    const activeToken =
      getClientAuthToken(token) ||
      (typeof window !== "undefined"
        ? getValidAuthToken(
            localStorage.getItem("token") ||
              localStorage.getItem("BearerToken") ||
              localStorage.getItem("medusa_auth_token") ||
              ""
          )
        : "");

    if (!activeToken) {
      triggerOpenHeaderModal(true);
      return;
    }

    const maxStock =
      Number(
        product?.availableBackOrderStock ??
          product?.available_back_order_stock
      ) || 0;
    const maxAllowedCart =
      Number(product?.maxQuantityAllowedCart) || 0;
    const effectiveOrderLimit =
      maxStock > 0 ? maxStock : maxAllowedCart;

    const minQty = Number(product?.minQuantityAllowedCart) || 1;
    const qty = Math.min(
      Math.max(1, minQty),
      effectiveOrderLimit > 0 ? effectiveOrderLimit : 1
    );

    const calculatedPrice = PriceCalculate(
      product?.price,
      product?.pricerefer,
      product?.flag,
      product?.taxType,
      product?.taxValue
    );
    const finalPrice =
      parseFloat(calculatedPrice) || parseFloat(product?.price || 0) || 0;

    const pId =
      Number(product?.productId || product?.id) ||
      product?.productId ||
      product?.id;

    const orderItem = {
      ...product,
      productId: pId,
      productCount: qty,
      quantity: qty,
      price: finalPrice || product?.price,
      total: Number((finalPrice || product?.price || 0) * qty),
      priceGroup: 0,
      maxQuantityAllowedCart: effectiveOrderLimit,
      minQuantityAllowedCart: minQty,
      availableBackOrderStock: maxStock,
      isBackOrder: true,
    };

    dispatch(enableBackOrder(true));
    dispatch(enableFailedOrder(false));
    dispatch(checkoutItems("backOrder"));
    if (typeof window !== "undefined") {
      localStorage.setItem("backOrder", JSON.stringify([orderItem]));
      localStorage.setItem("isBackOrder", "true");
      sessionStorage.setItem("isBackOrder", "true");
    }
    router.push("/stock-checkout");
  };

  const fetchCompareProducts = useCallback(async () => {
    let rawIds = [];
    try {
      rawIds = JSON.parse(localStorage.getItem("compareId") || "[]");
    } catch {
      rawIds = [];
    }
    const ids = Array.isArray(rawIds) ? rawIds.filter(Boolean) : [];
    if (ids.length === 0) {
      setCompareProductList([]);
      setLoader(true);
      lastFetchedKeyRef.current = "";
      return;
    }

    const idsKey = ids.slice().sort().join(",");
    if (isFetchingRef.current) return;
    if (lastFetchedKeyRef.current === idsKey && compareProductList.length > 0) return;

    isFetchingRef.current = true;
    lastFetchedKeyRef.current = idsKey;

    let list = [];
    try {
      await ProductCompareListApi(
        1,
        ids,
        (res) => {
          const resList = Array.isArray(res) ? res : res?.data || [];
          if (Array.isArray(resList) && resList.length > 0) {
            list = resList;
          }
        },
        () => {}
      );
    } catch (e) {
      console.error("ProductCompareListApi error:", e);
    } finally {
      isFetchingRef.current = false;
    }

    if ((!Array.isArray(list) || list.length === 0) && !isSpurtAdapter()) {
      try {
        const catRes = await getAllProductsList("limit=50&offset=0");
        const catalog =
          (Array.isArray(catRes?.data) ? catRes.data : null) ||
          catRes?.data?.productList ||
          (Array.isArray(catRes) ? catRes : []);
        if (Array.isArray(catalog) && catalog.length > 0) {
          list = catalog.filter((p) =>
            ids.some((cid) => String(cid) === String(p.productId ?? p.id))
          );
        }
      } catch (err) {
        console.warn("Catalog fallback error:", err);
      }
    }

    if (
      ids.some(
        (cid) => !list.some((p) => String(p.productId ?? p.id) === String(cid))
      )
    ) {
      const missingIds = ids.filter(
        (cid) => !list.some((p) => String(p.productId ?? p.id) === String(cid))
      );
      for (const mid of missingIds) {
        try {
          const pDetail = await getProductDetail(mid);
          if (pDetail && (pDetail.productId || pDetail.id || pDetail.name)) {
            list.push(pDetail);
          }
        } catch {}
      }
    }

    // Enrich products with getProductDetail so stock, threshold, backorder, category and ratings are complete
    let enrichedList = list;
    if (Array.isArray(list) && list.length > 0) {
      try {
        enrichedList = await Promise.all(
          list.map(async (prod) => {
            const pId = prod?.productId || prod?.id;
            const pSlug = prod?.productSlug || prod?.slug || pId;
            let detail = null;
            try {
              if (pSlug) {
                detail = await getProductDetail(pSlug);
              }
            } catch (_) {}

            const merged =
              detail && typeof detail === "object"
                ? { ...detail, ...prod }
                : { ...prod };

            if (detail?.outOfStockThreshold !== undefined && merged.outOfStockThreshold === undefined) {
              merged.outOfStockThreshold = detail.outOfStockThreshold;
            }
            if (detail?.out_of_stock_threshold !== undefined && merged.out_of_stock_threshold === undefined) {
              merged.out_of_stock_threshold = detail.out_of_stock_threshold;
            }
            if (detail?.enableBackOrders !== undefined && merged.enableBackOrders === undefined) {
              merged.enableBackOrders = detail.enableBackOrders;
            }
            if (detail?.enable_back_orders !== undefined && merged.enable_back_orders === undefined) {
              merged.enable_back_orders = detail.enable_back_orders;
            }
            if (detail?.availableBackOrderStock !== undefined && merged.availableBackOrderStock === undefined) {
              merged.availableBackOrderStock = detail.availableBackOrderStock;
            }
            if (detail?.available_back_order_stock !== undefined && merged.available_back_order_stock === undefined) {
              merged.available_back_order_stock = detail.available_back_order_stock;
            }
            if (detail?.quantity !== undefined && merged.quantity === undefined) {
              merged.quantity = detail.quantity;
            }
            if (detail?.stockStatus !== undefined && merged.stockStatus === undefined) {
              merged.stockStatus = detail.stockStatus;
            }
            if (detail?.hasStock !== undefined && merged.hasStock === undefined) {
              merged.hasStock = detail.hasStock;
            }
            if (detail?.Category && !merged.Category) {
              merged.Category = detail.Category;
            }
            if (detail?.categoryName && !merged.categoryName) {
              merged.categoryName = detail.categoryName;
            }
            if (detail?.rating !== undefined && (merged.rating === undefined || merged.rating === null)) {
              merged.rating = detail.rating;
            }
            if (detail?.reviewCount !== undefined && (merged.reviewCount === undefined || merged.reviewCount === null)) {
              merged.reviewCount = detail.reviewCount;
            }

            if (
              (merged.rating === undefined || merged.rating === null || merged.rating === "") &&
              hasCapability("reviews")
            ) {
              try {
                const targetReviewId = merged.skuId || merged.productId || merged.id;
                if (targetReviewId) {
                  const ratingRes = await getAverageRating(targetReviewId);
                  if (ratingRes?.status == 1 && ratingRes?.data) {
                    const rData = ratingRes.data;
                    merged.rating = rData.rating;
                    merged.reviewCount =
                      rData.reviewCount ??
                      rData.totalReview ??
                      rData.totalReviews ??
                      rData.count ??
                      (Array.isArray(rData.reviews) ? rData.reviews.length : rData.reviews);
                  }
                }
              } catch (_) {}
            }

            return merged;
          })
        );
      } catch (err) {
        console.warn("Failed to enrich compare products:", err);
      }
    }

    setCompareProductList(enrichedList);
    setLoader(true);
  }, []);

  useEffect(() => {
    fetchCompareProducts();
    const handler = () => fetchCompareProducts();
    window.addEventListener("compare_updated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("compare_updated", handler);
      window.removeEventListener("storage", handler);
    };
  }, [fetchCompareProducts]);

  const decodeHtmlEntities = (str) => {
    if (!str) return "";
    if (typeof window !== "undefined") {
      const txt = document.createElement("textarea");
      txt.innerHTML = str;
      return txt.value;
    }
    return String(str);
  };

  const handleRemoveCompareProduct = (e, id) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    let currentCompare = [];
    try {
      currentCompare = JSON.parse(localStorage.getItem("compareId") || "[]");
    } catch {
      currentCompare = [];
    }
    const removedId = currentCompare.filter(
      (productid) => String(productid) !== String(id)
    );
    localStorage.setItem("compareId", JSON.stringify(removedId));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("compare_updated"));
      window.dispatchEvent(new Event("storage"));
    }
    setCompareProductList((prev) =>
      prev.filter((p) => String(p?.productId ?? p?.id) !== String(id))
    );
    ToastMessage({
      type: "info",
      message: t("tooltip.compareProductRemove") || "Removed from compare",
    });
  };

  const handleClearAll = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    localStorage.setItem("compareId", JSON.stringify([]));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("compare_updated"));
      window.dispatchEvent(new Event("storage"));
    }
    setCompareProductList([]);
    ToastMessage({
      type: "info",
      message: t("toastMessage.compareProductRemove") || "Comparison cleared",
    });
  };

  const handleAddItemToCart = async (product) => {
    const pId = product?.productId || product?.id;
    if (!product) return;

    const rawSlug =
      product?.productSlug || product?.slug || product?.skuName || "";
    const cleanSlug = String(rawSlug).replace(/^\/+/, "");

    const stockState = getStockInfo(product);
    if (stockState.isBackOrderActive) {
      handleBackOrder(product);
      return;
    }

    if (!isOpenCartAdapter() && (product?.isSimplified === 0 || product?.variantCount > 0)) {
      router.push(`/products/${cleanSlug}`);
      return;
    }

    try {
      const calculatedPrice = PriceCalculate(
        product?.price,
        product?.pricerefer,
        product?.flag,
        product?.taxType,
        product?.taxValue
      );
      const finalPrice =
        parseFloat(calculatedPrice) || parseFloat(product?.price || 0) || 0;
      const cartItem = buildCompareCartItem(product, finalPrice);

      await addToCartApi(
        1,
        product?.productType || product?.type || "physical",
        cartItem,
        dispatch,
        "addtocart",
        () => {},
        router
      );
    } catch (err) {
      console.error("handleAddItemToCart error:", err);
      router.push(`/products/${cleanSlug}`);
    }
  };

  const ProductRatingDisplay = ({ product }) => {
    const ratingVal = getRatingVal(product);
    const reviewCount = getReviewCount(product);

    return (
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        <CustomStarRating rating={ratingVal > 0 ? ratingVal.toFixed(1) : 0} size={14} />
        {ratingVal > 0 ? (
          <span className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
            {ratingVal.toFixed(1)}
          </span>
        ) : null}
        <span className="text-xs text-gray-400 dark:text-zinc-500">
          ({reviewCount})
        </span>
      </div>
    );
  };

  const renderActionButton = (product) => {
    const stockState = getStockInfo(product);

    if (stockState.hasRegularStock) {
      return (
        <button
          onClick={(e) => handleAddItemToCart(product)}
          className="flex justify-center items-center bg-[#2471A3] hover:bg-[#2471A3] hover:opacity-90 active:scale-95 px-6 rounded h-[41px] font-semibold text-white text-sm whitespace-nowrap btn transition-all cursor-pointer shadow-sm border-none"
          style={{
            fontFamily:
              "var(--btn-font-family, var(--font-sans, 'Noto Sans', sans-serif))",
          }}
        >
          {t("productcompare.AddtoCart") || "Add to Cart"}
        </button>
      );
    }

    if (stockState.isBackOrderActive) {
      return (
        <button
          onClick={(e) => handleBackOrder(product)}
          className="flex justify-center items-center bg-[#F54927] hover:bg-[#F54927] hover:opacity-90 active:scale-95 px-6 rounded h-[41px] font-semibold text-white text-sm whitespace-nowrap btn transition-all cursor-pointer shadow-sm border-none"
          style={{
            fontFamily:
              "var(--btn-font-family, var(--font-sans, 'Noto Sans', sans-serif))",
          }}
        >
          {t("productdetails.OrdNow") || "ORDER NOW"}
        </button>
      );
    }

    return (
      <button
        disabled
        className="flex justify-center items-center bg-[#E5E5E5] text-[#555555] px-6 rounded h-[41px] font-semibold text-sm whitespace-nowrap btn select-none cursor-not-allowed pointer-events-none"
        style={{
          fontFamily:
            "var(--btn-font-family, var(--font-sans, 'Noto Sans', sans-serif))",
        }}
      >
        {t("productdetails.OutOfStk") || "OUT OF STOCK"}
      </button>
    );
  };

  return loader == true ? (
    <div className="mx-auto w-full max-w-[1440px] px-[16px] py-8 md:px-[20px]">
      {/* Header Section */}
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-[var(--color-grey,#e5e7eb)] pb-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--color-161d25,#111827)] dark:text-white uppercase">
            {t("compare.Compare") || "COMPARE"}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-zinc-400">
            {t("productcompare.subtitle") ||
              "Compare features, technical specifications, and pricing side by side."}
          </p>
        </div>

        {compareProductList?.length > 0 && (
          <div className="flex items-center gap-4 self-start sm:self-auto">
            <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-zinc-800 border border-blue-200/60 dark:border-zinc-700 px-3.5 py-1 text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">
              {compareProductList.length}{" "}
              {compareProductList.length === 1
                ? (t("productcompare.productSelected") || "product selected")
                : (t("productcompare.productsSelected") || "products selected")}
            </span>

            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.75"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
              <span>{t("productcompare.clearAll") || "Clear All"}</span>
            </button>
          </div>
        )}
      </div>

      {compareProductList?.length > 0 ? (
        <div className="mb-20 overflow-auto">
          <table className="w-full border border-collapse rounded-md border-grey compare-tbl">
            <tbody>
              <tr>
                <td className="w-1/4 p-5 align-middle border border-b-0 border-grey"></td>
                {compareProductList?.map((product, index) => (
                  <td
                    className="relative w-1/4 px-10 py-4 align-middle border border-b-0 border-grey"
                    key={index}
                  >
                    <div className="flex flex-col items-center space-y-3">
                      {/* Product Image Clickable Link to Product Detail Page */}
                      <Link
                        prefetch={false}
                        href={getProductDetailHref(product)}
                        className="block h-[120px] transition-transform duration-200 hover:scale-105 cursor-pointer"
                        title={product?.productNameTrans || product?.name}
                      >
                        <CustomImage
                          src={resolveCompareImageSrc(product)}
                          alt={product?.name}
                          width={120}
                          height={120}
                          fallback="/img/no-image.png"
                          className="w-auto h-full object-contain mx-auto"
                        />
                      </Link>

                      {/* Category Name Badge */}
                      {getProductCategoryName(product) !== "-" && (
                        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full line-clamp-1 max-w-[200px] text-center">
                          {getProductCategoryName(product)}
                        </span>
                      )}

                      <div className="flex flex-col space-y-2 text-center text-wrap w-full">
                        <Link
                          prefetch={false}
                          href={getProductDetailHref(product)}
                          className="font-normal text-black-300 text-base line-clamp-2 leading-[21px] hover:text-orange-500 transition-colors"
                        >
                          {product?.productNameTrans
                            ? product?.productNameTrans
                            : product?.name}
                        </Link>

                        {/* Product Ratings */}
                        <div className="flex justify-center">
                          <ProductRatingDisplay product={product} />
                        </div>

                        <p className="text-lg font-bold leading-8 text-boldblack">
                          <CustomCurrencyFormatter
                            price={PriceCalculate(
                              product?.price,
                              product?.pricerefer,
                              product?.flag,
                              product?.taxType,
                              product?.taxValue
                            )}
                          />
                        </p>
                      </div>

                      {/* Stock-aware Action Button: Add to Cart / Order Now / Out of Stock */}
                      {renderActionButton(product)}
                    </div>

                    <a
                      role="button"
                      onClick={(e) =>
                        handleRemoveCompareProduct(e, product?.productId)
                      }
                      className="absolute flex items-center justify-center w-8 h-8 border rounded-full cursor-pointer top-4 right-4 hover:bg-slate-100 cancel-btn-shadow border-grey"
                    >
                      <CustomImage src="/img/tbl-delete.svg" alt="tbl-delete" width={16} height={16} />
                    </a>
                    {index > 0 && (
                      <div className="top-1/2 rtl:-right-4 -left-4 rtl:left-[unset] absolute v-s">
                        <img src="/img/compare.svg" alt="compare" />
                      </div>
                    )}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="bg-lightblue p-4 border border-grey border-y-0 font-bold text-[#191919] text-base uppercase">
                  {t("productcompare.GENERAL")}
                </td>
                {compareProductList?.map((_, index) => (
                  <td
                    key={index}
                    className="bg-lightblue p-4 border border-grey border-y-0 font-bold text-[#191919] text-base uppercase"
                  ></td>
                ))}
              </tr>

              {/* Name Row */}
              <tr>
                <td className="px-4 py-3 border border-grey border-t-0 font-bold text-[#191919] text-base text-wrap align-top">
                  {t("productcompare.Name")}
                </td>
                {compareProductList?.map((product, index) => (
                  <td
                    className="px-4 py-3 border border-grey border-t-0 font-normal text-[#191919] text-base text-wrap align-top"
                    key={index}
                  >
                    <Link
                      prefetch={false}
                      href={getProductDetailHref(product)}
                      className="hover:text-orange-500 transition-colors"
                    >
                      {product?.productNameTrans
                        ? product?.productNameTrans
                        : product?.name}
                    </Link>
                  </td>
                ))}
              </tr>

              {/* Category Name Row */}
              <tr>
                <td className="px-4 py-3 border border-grey border-t-0 font-bold text-[#191919] text-base text-wrap align-top">
                  {t("allcategory.category") || "Category"}
                </td>
                {compareProductList?.map((product, index) => (
                  <td
                    className="px-4 py-3 border border-grey border-t-0 font-normal text-[#191919] text-base text-wrap align-top"
                    key={index}
                  >
                    <span className="font-medium text-gray-800 dark:text-zinc-200">
                      {getProductCategoryName(product)}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Price Row */}
              <tr>
                <td className="px-4 py-3 border border-grey border-t-0 font-bold text-[#191919] text-base text-wrap align-top">
                  {t("productcompare.Price")}
                </td>
                {compareProductList?.map((product, index) => (
                  <td
                    className="px-4 py-3 border border-grey border-t-0 font-normal text-[#191919] text-base text-wrap align-top"
                    key={index}
                  >
                    <CustomCurrencyFormatter
                      price={PriceCalculate(
                        product?.price,
                        product?.pricerefer,
                        product?.flag,
                        product?.taxType,
                        product?.taxValue
                      )}
                    />
                  </td>
                ))}
              </tr>

              {/* Rating Row */}
              <tr>
                <td className="px-4 py-3 border border-grey border-t-0 font-bold text-[#191919] text-base text-wrap align-top">
                  {safeTranslate(t, "productcompare.RatingReview", "Rating")}
                </td>
                {compareProductList?.map((product, index) => {
                  const ratingVal = getRatingVal(product);
                  const reviewCount = getReviewCount(product);
                  return (
                    <td
                      className="px-4 py-3 border border-grey border-t-0 font-normal text-[#191919] text-base text-wrap align-top"
                      key={index}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <CustomStarRating rating={ratingVal > 0 ? ratingVal.toFixed(1) : 0} size={16} />
                        <span className="font-bold text-sm text-gray-800 dark:text-zinc-200">
                          {ratingVal > 0 ? ratingVal.toFixed(1) : "0.0"}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-zinc-400">
                          ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Availability Row */}
              <tr>
                <td className="px-4 py-3 border border-grey border-t-0 font-bold text-[#191919] text-base text-wrap align-top">
                  {safeTranslate(
                    t,
                    "productdetails.Availability",
                    safeTranslate(t, "productcompare.Availability", "Availability")
                  )}
                </td>
                {compareProductList?.map((product, index) => {
                  const stockState = getStockInfo(product);
                  return (
                    <td
                      className="px-4 py-3 border border-grey border-t-0 font-normal text-[#191919] text-base text-wrap align-top"
                      key={index}
                    >
                      {stockState.hasRegularStock ? (
                        <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-green-700 bg-green-50 dark:bg-green-950/40 dark:text-green-300 px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          {safeTranslate(t, "productdetails.InStock", "In Stock")}
                        </span>
                      ) : stockState.isBackOrderActive ? (
                        <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          {safeTranslate(t, "productdetails.AvailableOnBackorder", "Available on Backorder")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-300 px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          {safeTranslate(t, "productdetails.OutOfStk", "Out of Stock")}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Description Row */}
              <tr>
                <td className="px-4 py-3 border border-grey border-t-0 font-bold text-[#191919] text-base text-wrap align-top">
                  {t("productdetails.Description")}
                </td>
                {compareProductList?.map((product, index) => (
                  <td
                    className="px-4 py-3 border border-grey border-t-0 font-normal text-[#191919] text-base text-wrap align-top"
                    key={index}
                  >
                    <div
                      className="text-black-300 list-default bullet editor-style"
                      dangerouslySetInnerHTML={{
                        __html: decodeHtmlEntities(product?.description)
                          ?.replaceAll("&amp;", "&")
                          .replaceAll("&lt;", "<")
                          .replaceAll("&gt;", ">")
                          .replaceAll("&quot;", '"')
                          .replaceAll("&#39;", "'")
                          .replaceAll("&sbquo;", "‚")
                          .replaceAll("&#61;", "=")
                          .replaceAll("&#45;", "-")
                          .replaceAll("&hellip;", "…")
                          .replaceAll("&commat;", "@")
                          .replaceAll("&copy;", "©")
                          .replaceAll("&#35;", "#")
                          .replaceAll("&ldquo;", "“")
                          .replaceAll("&rsquo;", "’")
                          .replaceAll("&lsquo;", "‘")
                          .replaceAll("&trade;", "™")
                          .replaceAll("&reg;", "®")
                          .replaceAll("&ndash;", "–")
                          .replaceAll("&eacute;", "é")
                          .replaceAll("&euro;", "€")
                          .replaceAll("&pound;", "£")
                          .replaceAll("&nbsp;", "")
                          .replace(
                            "&lt;/p&gt;&amp;&#35;10;&amp;&#35;10;&lt;p&gt;",
                            ""
                          ),
                      }}
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="my-16 min-h-[35vh]">
          <div className="flex flex-col items-center justify-center gap-8 p-4 text-center sm:flex-row">
            <CustomImage src="/img/no-data.svg" alt="no-data" width={240} height={240} />
            <div>
              <h5 className="mb-1 text-xl font-black text-black-300">
                {t("myprofile.NoData")}
              </h5>
            </div>
          </div>
        </div>
      )}
    </div>
  ) : (
    <CompareSkeleton columns={2} />
  );
}
