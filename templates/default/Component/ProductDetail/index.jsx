"use client";

// React
import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

// Components
import ProductImages from "./ProductImages";
import ProductPriceInDetail from "./ProductPriceInDetail";
import Description from "./Description";
import Highlights from "./Highlights";
import Specification from "./Specification";
import ProductDetailSkeleton from "./skeleton";
import { useGlobalProvider } from "@/GlobalComponents/Shared/Common";
import ProductQuantity from "@/GlobalComponents/Hooks/useProduct/ProductQuantity";
import eventBus, { triggerOpenHeaderModal } from "@/utilities/eventBus";
import { getProductDetail } from "@/api/ProductDetailApi";
import ProductOrderButtons from "@/GlobalComponents/Core/Product/ProductOrderButtons";
import RelatedProducts from "@/GlobalComponents/Features/RelatedProducts";
import Variants from "@/GlobalComponents/Shared/Display/Variants";
import RatingReview from "@/GlobalComponents/Shared/Feedback/RatingReview";
import AverageRating from "@/GlobalComponents/Shared/Feedback/AverageRating";
import {
  productCompareApi,
  AddWishListApi,
  WishListDeleteApi,
  checkWishListApi,
} from "@/api/ProductSearchApi/productsearch";
import { getClientAuthToken } from "@/utilities/tokenHelper";
import { isSpurtAdapter, isMedusaAdapter, hasAdapterCapability } from "@/config/adapter.config";
import { ToastMessage } from "@/utilities/toast";
import { useTranslations } from "next-intl";

const ProductDetail = ({ token, productSlug, rawProduct, categoryIds }) => {
  const t = useTranslations();
  const { loading } = useGlobalProvider();

  const [productDetail, setProductDetail] = useState({ ...rawProduct } || {});
  const [isProductDetailLoading, setIsProductDetailLoading] = useState(
    () =>
      !(
        rawProduct &&
        (rawProduct.name || rawProduct.skuName || rawProduct.productId) &&
        rawProduct.isSimplified !== 0
      )
  );
  const [productQuantity, setProductQuantity] = useState(1);
  const [variantChangeTrigger, setVariantChangeTrigger] = useState(0);

  const currentProductId =
    productDetail?.productId ||
    rawProduct?.productId ||
    productDetail?.id ||
    rawProduct?.id;

  const dispatch = useDispatch();
  const wishCount = useSelector((state) => state?.storeReducer?.wishCount);

  // Authentication check for logged-in scenario
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(Boolean(getClientAuthToken(token)));
    };
    checkAuth();
    window.addEventListener("storage", checkAuth);
    if (typeof eventBus?.addEventListener === "function") {
      eventBus.addEventListener("toKenKey", checkAuth);
    }
    return () => {
      window.removeEventListener("storage", checkAuth);
      if (typeof eventBus?.removeEventListener === "function") {
        eventBus.removeEventListener("toKenKey", checkAuth);
      }
    };
  }, [token]);

  const isSpurt = isSpurtAdapter();
  const isMedusa = isMedusaAdapter();
  const showWishlist = isSpurt || isMedusa || hasAdapterCapability("wishlist");

  // Wishlist state & sync
  const checkWishlistStatus = useCallback(() => {
    if (!getClientAuthToken(token)) return false;

    const candidateIds = [
      productDetail?.productId,
      rawProduct?.productId,
      productDetail?.id,
      rawProduct?.id,
      productDetail?.skuId,
      rawProduct?.skuId,
      productDetail?.productSlug,
      rawProduct?.productSlug,
      productSlug,
    ]
      .filter((v) => v !== undefined && v !== null && String(v).trim() !== "")
      .map((v) => String(v).trim());

    if (candidateIds.length === 0) return false;
    if (
      productDetail?.wishListStatus === 1 ||
      rawProduct?.wishListStatus === 1 ||
      productDetail?.wishListStatus === true ||
      rawProduct?.wishListStatus === true
    ) {
      return true;
    }

    if (typeof window !== "undefined") {
      try {
        const storedIds =
          localStorage.getItem("medusa_wishlist_ids") ||
          localStorage.getItem("wishlist_product_ids");
        if (storedIds) {
          const parsed = JSON.parse(storedIds);
          if (Array.isArray(parsed)) {
            const parsedSet = new Set(parsed.map((id) => String(id).trim()));
            if (candidateIds.some((cid) => parsedSet.has(cid))) return true;
          }
        }
      } catch (e) {}
    }
    return false;
  }, [
    token,
    productDetail?.productId,
    rawProduct?.productId,
    productDetail?.id,
    rawProduct?.id,
    productDetail?.skuId,
    rawProduct?.skuId,
    productDetail?.productSlug,
    rawProduct?.productSlug,
    productSlug,
    productDetail?.wishListStatus,
    rawProduct?.wishListStatus,
  ]);

  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    setIsWishlisted(checkWishlistStatus());
  }, [checkWishlistStatus, wishCount, isLoggedIn]);

  useEffect(() => {
    let active = true;
    if (!isLoggedIn || !isMedusa || !currentProductId) return;
    checkWishListApi(currentProductId)
      .then((res) => {
        if (!active || !res) return;
        if (res.in_wishlist) {
          setIsWishlisted(true);
          setProductDetail((prev) => ({ ...prev, wishListStatus: 1 }));
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isLoggedIn, isMedusa, currentProductId]);

  useEffect(() => {
    const syncWishlist = () => {
      setIsWishlisted(checkWishlistStatus());
    };
    window.addEventListener("medusa_wishlist_updated", syncWishlist);
    window.addEventListener("storage", syncWishlist);
    return () => {
      window.removeEventListener("medusa_wishlist_updated", syncWishlist);
      window.removeEventListener("storage", syncWishlist);
    };
  }, [checkWishlistStatus]);

  const handleToggleWishlist = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    const activeToken = getClientAuthToken(token);
    if (!activeToken) {
      triggerOpenHeaderModal(true);
      return;
    }

    const pId = currentProductId;
    if (!pId) return;

    const wishlistPayload =
      productDetail && typeof productDetail === "object"
        ? { ...productDetail, productId: pId }
        : pId;

    const next = !isWishlisted;
    setIsWishlisted(next);
    setProductDetail((prev) => ({ ...prev, wishListStatus: next ? 1 : 0 }));

    try {
      if (next) {
        const res = await AddWishListApi(wishlistPayload, dispatch, wishCount);
        if (res && res.status != 1 && res.status !== "1") {
          setIsWishlisted(!next);
          setProductDetail((prev) => ({ ...prev, wishListStatus: !next ? 1 : 0 }));
        }
      } else {
        const res = await WishListDeleteApi(wishlistPayload, dispatch, wishCount);
        if (res && res.status != 1 && res.status !== "1") {
          setIsWishlisted(!next);
          setProductDetail((prev) => ({ ...prev, wishListStatus: !next ? 1 : 0 }));
        }
      }
    } catch (err) {
      console.error("handleToggleWishlist error:", err);
      setIsWishlisted(!next);
      setProductDetail((prev) => ({ ...prev, wishListStatus: !next ? 1 : 0 }));
    }
  };

  const [isCompared, setIsCompared] = useState(false);

  useEffect(() => {
    const checkCompare = () => {
      if (typeof window === "undefined") return;
      try {
        const raw = JSON.parse(localStorage.getItem("compareId") || "[]");
        const list = Array.isArray(raw) ? raw : [];
        const pId = String(currentProductId || "");
        setIsCompared(pId ? list.some((id) => String(id) === pId) : false);
      } catch {
        setIsCompared(false);
      }
    };
    checkCompare();
    window.addEventListener("compare_updated", checkCompare);
    window.addEventListener("storage", checkCompare);
    return () => {
      window.removeEventListener("compare_updated", checkCompare);
      window.removeEventListener("storage", checkCompare);
    };
  }, [currentProductId]);

  const handleToggleCompare = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (!currentProductId) return;

    try {
      const raw = JSON.parse(localStorage.getItem("compareId") || "[]");
      const current = Array.isArray(raw) ? raw.filter(Boolean) : [];
      const pId = currentProductId;
      const isAlready = current.some((id) => String(id) === String(pId));

      if (isAlready) {
        const next = current.filter((id) => String(id) !== String(pId));
        localStorage.setItem("compareId", JSON.stringify(next));
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("compare_updated"));
          window.dispatchEvent(new Event("storage"));
        }
        setIsCompared(false);
        ToastMessage({
          type: "info",
          message: t("tooltip.compareProductRemove") || "Removed from compare",
        });
      } else {
        if (current.length >= 2) {
          ToastMessage({
            type: "error",
            message:
              t("toastMessage.compareProductLimit") ||
              t("tooltip.compareProductLimit") ||
              "Cannot add more than 2 product",
          });
          return;
        }
        const next = [...current, pId];
        await productCompareApi(0, next, () => {}, 0, current);
        try {
          const updated = JSON.parse(localStorage.getItem("compareId") || "[]");
          if (Array.isArray(updated) && updated.some((id) => String(id) === String(pId))) {
            setIsCompared(true);
          }
        } catch (_) {}
      }
    } catch (err) {
      console.error("handleToggleCompare error:", err);
    }
  };

  const productDetailClassnames = {
    quantityVariantDiv: "w-full",
    quantityWidth: "w-full",
    singleVariantDropdown: "w-full",
    doubleVariantDropdown: "w-full",
  };

  const serverProductApi = async () => {
    const prodData = await getProductDetail(productSlug);
    if (prodData) {
      setProductDetail(prodData);
    }
  };

  // Keep productQuantity within bounds whenever productDetail / stock / backorder settings change
  useEffect(() => {
    const isBackOrderEnabled =
      Number(productDetail?.enableBackOrders) === 1 ||
      productDetail?.enableBackOrders === 1 ||
      productDetail?.enableBackOrders === true;

    const rawQty = Number(productDetail?.quantity);
    const rawThreshold =
      productDetail?.outOfStockThreshold !== null &&
      productDetail?.outOfStockThreshold !== undefined &&
      productDetail?.outOfStockThreshold !== ""
        ? Number(productDetail?.outOfStockThreshold)
        : null;

    const isThresholdReached =
      (rawThreshold !== null && !isNaN(rawThreshold) && !isNaN(rawQty) && rawQty <= rawThreshold) ||
      (!isNaN(rawQty) && rawQty <= 0) ||
      productDetail?.stockStatus === "outOfStock" ||
      productDetail?.hasStock == 0 ||
      productDetail?.hasStock === false;

    const backStock = Number(productDetail?.availableBackOrderStock);
    const isBackOrderActive =
      isBackOrderEnabled &&
      isThresholdReached &&
      (!isNaN(backStock) ? backStock > 0 : true);

    if (isBackOrderActive) {
      const minQty =
        Number(productDetail?.minQuantityAllowedCart) > 0
          ? Number(productDetail?.minQuantityAllowedCart)
          : 1;

      const backStock = Number(productDetail?.availableBackOrderStock);
      const maxAllowed = Number(productDetail?.maxQuantityAllowedCart);
      const maxQty =
        !isNaN(backStock) && backStock > 0
          ? backStock
          : !isNaN(maxAllowed) && maxAllowed > 0
            ? maxAllowed
            : null;

      setProductQuantity((prev) => {
        let next = prev < minQty ? minQty : prev;
        if (maxQty !== null && next > maxQty) {
          next = maxQty;
        }
        return next;
      });
    } else {
      const minQty =
        Number(productDetail?.minQuantityAllowedCart) > 0
          ? Number(productDetail?.minQuantityAllowedCart)
          : 1;
      const stockQty = Number(productDetail?.quantity);
      const maxAllowed = Number(productDetail?.maxQuantityAllowedCart);
      const effectiveMax =
        !isNaN(maxAllowed) && maxAllowed > 0 && !isNaN(stockQty) && stockQty > 0
          ? Math.min(stockQty, maxAllowed)
          : !isNaN(maxAllowed) && maxAllowed > 0
            ? maxAllowed
            : !isNaN(stockQty) && stockQty > 0
              ? stockQty
              : null;

      setProductQuantity((prev) => {
        let next = prev < minQty ? minQty : prev;
        if (effectiveMax !== null && next > effectiveMax) {
          next = effectiveMax;
        }
        return next;
      });
    }
  }, [
    productDetail?.enableBackOrders,
    productDetail?.outOfStockThreshold,
    productDetail?.minQuantityAllowedCart,
    productDetail?.maxQuantityAllowedCart,
    productDetail?.availableBackOrderStock,
    productDetail?.quantity,
    productDetail?.stockStatus,
    productDetail?.hasStock,
    productDetail?.skuId,
  ]);

  useEffect(() => {
    const handleRefresh = () => serverProductApi(); // Re-fetch on event
    eventBus.addEventListener("productDetailKey", handleRefresh);
    return () => {
      eventBus.removeEventListener("productDetailKey", handleRefresh); // Cleanup
    };
  }, []);

  const isReadyProduct = Boolean(
    productDetail?.variantMode === "selector" ||
      productDetail?.variantMode === "simple" ||
      productDetail?.isSimplified === 1 ||
      ((productDetail?.name || productDetail?.productId) && productDetail?.isSimplified !== 0)
  );
  const effectiveLoading = isProductDetailLoading && !isReadyProduct;

  const isBackOrderEnabled =
    Number(productDetail?.enableBackOrders) === 1 ||
    productDetail?.enableBackOrders === 1 ||
    productDetail?.enableBackOrders === true;

  const rawQty = Number(productDetail?.quantity);
  const rawThreshold =
    productDetail?.outOfStockThreshold !== null &&
    productDetail?.outOfStockThreshold !== undefined &&
    productDetail?.outOfStockThreshold !== ""
      ? Number(productDetail?.outOfStockThreshold)
      : null;

  const isThresholdReached =
    (rawThreshold !== null && !isNaN(rawThreshold) && !isNaN(rawQty) && rawQty <= rawThreshold) ||
    (!isNaN(rawQty) && rawQty <= 0) ||
    productDetail?.stockStatus === "outOfStock" ||
    productDetail?.hasStock == 0 ||
    productDetail?.hasStock === false;

  const backStock = Number(productDetail?.availableBackOrderStock);
  const isBackOrderActive =
    isBackOrderEnabled &&
    isThresholdReached &&
    (!isNaN(backStock) ? backStock > 0 : true);

  const hasRegularStock =
    !isThresholdReached &&
    (productDetail?.hasStock == 1 || productDetail?.hasStock === true) &&
    (!isNaN(rawQty) ? rawQty > 0 : true);

  return (
    <>
      {effectiveLoading && <ProductDetailSkeleton />}

      <main className={`${effectiveLoading ? "hidden" : "block"}`}>
        <section className="mx-auto grid w-full max-w-[1440px] grid-cols-[1.2fr_1fr] gap-14 p-[47px_20px] max-xl:gap-6 max-lg:grid-cols-1 max-md:p-4">
          {/* Product images */}
          <ProductImages productDetail={productDetail} />

          <div className="overflow-hidden">
            <h1 className="mb-5 text-[24px] leading-[33px] font-normal text-[var(--color-161d25)]">
              {productDetail?.skuName} -{" "}
              {productDetail?.productNameTrans
                ? productDetail?.productNameTrans
                : productDetail?.name}
            </h1>

            {/* Product ratings */}
            {!effectiveLoading && (
              <AverageRating productDetail={productDetail} />
            )}

            {/* Product price */}
            <ProductPriceInDetail productDetail={productDetail} />

            {/* Product quantity and variant list */}
            {/* If isSimplified == 0 its a variant product */}
            {productDetail?.isSimplified == 0 && (
              <div
                className={`${productDetailClassnames?.quantityVariantDiv} ${productDetail?.productVarient?.length == 1
                    ? "flex w-full flex-col gap-2 "
                    : ""
                }`}
              >
            <Variants
              setIsProductDetailLoading={setIsProductDetailLoading}
              productSlug={productSlug}
              classNames={productDetailClassnames}
              rawProduct={rawProduct}
              product={productDetail}
              setProduct={setProductDetail}
              setVariantChangeTrigger={setVariantChangeTrigger}
            />
          </div>
            )}

          {/* Product quantity */}
          {(hasRegularStock || isBackOrderActive) && (
            <ProductQuantity
              product={productDetail}
              productQuantity={productQuantity}
              setProductQuantity={setProductQuantity}
              classNames={productDetailClassnames}
            />
          )}

          <ProductOrderButtons
            token={token}
            productDetail={productDetail}
            productQuantity={productQuantity}
            setProductQuantity={setProductQuantity}
          />

          {/* Actions: Compare & Wishlist */}
          <div className="mt-4 mb-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleToggleCompare}
              className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 cursor-pointer ${
                isCompared
                  ? "border-[var(--btn-bg,var(--color-primary))] bg-[var(--btn-bg,var(--color-primary))]/10 text-[var(--btn-bg,var(--color-primary))] font-semibold shadow-sm"
                  : "border-gray-300 dark:border-zinc-700 hover:border-gray-400 bg-white dark:bg-zinc-800 text-[var(--color-161d25)] dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700"
              }`}
            >
              <img
                src={
                  isCompared
                    ? "/img/compare-outline-active.svg"
                    : "/img/compare-outline.svg"
                }
                alt="compare"
                width={18}
                height={18}
                className="w-4 h-4"
              />
              <span>
                {isCompared
                  ? (t("tooltip.inCompare") || "In Compare List")
                  : (t("tooltip.compare") || "Add to Compare")}
              </span>
            </button>

            {showWishlist && (
              <button
                type="button"
                onClick={handleToggleWishlist}
                className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isWishlisted
                    ? "border-red-200 bg-red-50 text-red-600 font-semibold shadow-sm"
                    : "border-gray-300 dark:border-zinc-700 hover:border-gray-400 bg-white dark:bg-zinc-800 text-[var(--color-161d25)] dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700"
                }`}
                title={
                  isWishlisted
                    ? (t("wishlist.removeFromWishlist") || "Remove from wishlist")
                    : (t("wishlist.addToWishlist") || "Add to wishlist")
                }
              >
                <img
                  src={
                    isWishlisted
                      ? "/img/heart-select-red-wisit.svg"
                      : "/img/heart-outline-wisit.svg"
                  }
                  alt="wishlist"
                  width={18}
                  height={18}
                  className="w-4 h-4"
                />
                <span>
                  {isWishlisted
                    ? (t("wishlist.wishlisted") || t("tooltip.wishList") || "Wishlist")
                    : (t("wishlist.wishlist") || t("tooltip.wishList") || "Wishlist")}
                </span>
              </button>
            )}
          </div>

          {/* Product Description */}
          <Description productDetail={productDetail} />

          {/* Product Highlights */}
          <Highlights productDetail={productDetail} />

          {/* Product specification */}
          {!effectiveLoading && (
            <Specification
              productSlug={productSlug}
              categoryIds={categoryIds}
              productDetail={productDetail}
            />
          )}

          {/* Product rating and reviews */}
          {!isProductDetailLoading && (
            <RatingReview productDetail={productDetail} token={token} />
          )}
        </div>
      </section>
      {!effectiveLoading && (
        <RelatedProducts
          token={token}
          productSlug={productSlug}
          productDetail={productDetail}
        />
      )}
    </main >
    </>
  );
};

export default ProductDetail;
