"use client";
import React, { useMemo, useCallback, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useTranslations } from "next-intl";

// Components
import CustomNextImage from "@/GlobalComponents/Shared/Common/CustomNextImage";
import CustomCurrencyFormatter from "@/GlobalComponents/Shared/Common/CustomCurrencyFormatter";
import CommonButton from "@/GlobalComponents/Reused/CommonButton";

// APIs & State
import {
  AddWishListApi,
  productCompareApi,
  WishListDeleteApi,
} from "@/api/ProductSearchApi/productsearch";
import { useGlobalProvider } from "@/GlobalComponents/Shared/Common";
import { GetCompareId } from "@/utilities/localStorage";
import { ToastMessage } from "@/utilities/toast";
import { triggerOpenHeaderModal } from "@/utilities/eventBus";
import { getClientAuthToken } from "@/utilities/tokenHelper";
import { getProductStockState } from "@/utilities/helper";
import { extractProductImageData } from "@/utilities/mediaResolver";
import {
  DiscountPercentCalculate,
  PriceCalculate,
  PriceTaxCalculate,
} from "@/utilities/PriceCalculate";
import {
  enableBackOrder,
  enableFailedOrder,
  checkoutItems,
} from "@/redux/slices/cartCheckout";
import { AddToCartLocal, findMatchingCartItem } from "@/utilities/AddToCart";

export default function ProductCard({
  token,
  rawProduct = {},
  categorySlug,
  trigger: triggerProp,
  setTrigger: setTriggerProp,
  comparetrigger: comparetriggerProp,
  setCompareTrigger: setCompareTriggerProp,
  onAddToCart,
  showActionButton = false,
}) {
  const t = useTranslations();
  const router = useRouter();
  const dispatch = useDispatch();
  const wishCount = useSelector((state) => state.storeReducer.wishCount);

  const [internalTrigger, setInternalTrigger] = useState(0);
  const trigger = triggerProp ?? internalTrigger;
  const setTrigger =
    typeof setTriggerProp === "function" ? setTriggerProp : setInternalTrigger;

  const [internalCompareTrigger, setInternalCompareTrigger] = useState(0);
  const comparetrigger = comparetriggerProp ?? internalCompareTrigger;
  const setCompareTrigger =
    typeof setCompareTriggerProp === "function"
      ? setCompareTriggerProp
      : setInternalCompareTrigger;

  // Normalized product representation
  const product = useMemo(() => {
    if (!rawProduct) return null;

    const { image, containerName } = extractProductImageData(rawProduct);

    return {
      containerName,
      flag: rawProduct.flag,
      image,
      isSimplified: rawProduct.isSimplified,
      name: rawProduct.name,
      widget_title: rawProduct.widget_title,
      price: rawProduct.price,
      pricerefer: rawProduct.pricerefer,
      productDiscount: rawProduct.productDiscount,
      productId:
        Number(rawProduct.productId || rawProduct.id) ||
        rawProduct.productId ||
        rawProduct.id,
      productNameTrans: rawProduct.productNameTrans,
      productSlug: rawProduct.productSlug,
      productSpecial: rawProduct.productSpecial,
      quantity: rawProduct.quantity,
      sku: rawProduct.sku,
      skuId: rawProduct.skuId,
      skuName: rawProduct.skuName,
      taxType: rawProduct.taxType,
      taxValue: rawProduct.taxValue,
      variantCount: rawProduct.variantCount,
      vcPrice: rawProduct.vcPrice,
      vcgPrice: rawProduct.vcgPrice,
      wishListStatus: rawProduct.wishListStatus,
      availableBackOrderStock: rawProduct.availableBackOrderStock,
      maxQuantityAllowedCart: rawProduct.maxQuantityAllowedCart,
      minQuantityAllowedCart: rawProduct.minQuantityAllowedCart,
    };
  }, [rawProduct]);

  // Compare state
  const [compareStateIds, setCompareStateIds] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const syncCompareIds = () => {
        try {
          const stored = localStorage.getItem("compareId");
          const ids = stored ? JSON.parse(stored) : [];
          setCompareStateIds(Array.isArray(ids) ? ids : []);
        } catch (_) {
          setCompareStateIds([]);
        }
      };
      syncCompareIds();
      window.addEventListener("compare_updated", syncCompareIds);
      window.addEventListener("storage", syncCompareIds);
      return () => {
        window.removeEventListener("compare_updated", syncCompareIds);
        window.removeEventListener("storage", syncCompareIds);
      };
    }
  }, []);

  const handleAddItemToCompare = (e, productId) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();
    if (!productId) return;
    const currentCompareIds = GetCompareId() || [];
    const isAlreadyAdded = currentCompareIds.some(
      (value) => String(value) === String(productId)
    );
    if (isAlreadyAdded) {
      const filtered = currentCompareIds.filter(
        (value) => String(value) !== String(productId)
      );
      productCompareApi(
        0,
        filtered,
        setCompareTrigger,
        comparetrigger,
        currentCompareIds
      );
    } else {
      if (currentCompareIds.length >= 2) {
        ToastMessage({
          type: "error",
          message:
            t("toastMessage.compareProductLimit") ||
            t("tooltip.compareProductLimit") ||
            "Cannot add more than 2 product",
        });
      } else {
        const compareIds = [...currentCompareIds, productId];
        productCompareApi(
          0,
          compareIds,
          setCompareTrigger,
          comparetrigger,
          currentCompareIds
        );
      }
    }
  };

  const compareCheckFunction = (productId) => {
    if (!productId) return false;
    return compareStateIds.some((value) => String(value) === String(productId));
  };

  // Wishlist state & sync
  const checkIsWishlisted = useCallback(() => {
    const candidateIds = [
      product?.productId,
      rawProduct?.productId,
      product?.id,
      rawProduct?.id,
      product?.skuId,
      rawProduct?.skuId,
      product?.productSlug,
      rawProduct?.productSlug,
      product?.slug,
      rawProduct?.slug,
    ]
      .filter((v) => v !== undefined && v !== null && String(v).trim() !== "")
      .map((v) => String(v).trim());

    if (candidateIds.length === 0) return false;
    if (
      product?.wishListStatus === 1 ||
      rawProduct?.wishListStatus === 1 ||
      product?.wishListStatus === true ||
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
    product?.productId,
    rawProduct?.productId,
    product?.id,
    rawProduct?.id,
    product?.skuId,
    rawProduct?.skuId,
    product?.productSlug,
    rawProduct?.productSlug,
    product?.slug,
    rawProduct?.slug,
    product?.wishListStatus,
    rawProduct?.wishListStatus,
  ]);

  const [isWishlisted, setIsWishlisted] = useState(checkIsWishlisted);

  useEffect(() => {
    setIsWishlisted(checkIsWishlisted());
  }, [checkIsWishlisted, wishCount]);

  const handleWishList = async (e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();
    const activeToken = getClientAuthToken(token);
    if (!activeToken) {
      triggerOpenHeaderModal(true);
      return;
    }
    const nextStatus = !isWishlisted;
    setIsWishlisted(nextStatus);
    const prodId = product?.productId || rawProduct?.productId || product?.id;
    if (!nextStatus) {
      await WishListDeleteApi(prodId, dispatch, wishCount);
    } else {
      await AddWishListApi(prodId, dispatch, wishCount);
    }
    setTrigger(trigger + 1);
  };

  // Price calculations
  const { price, pricerefer } = useMemo(() => {
    const basePrice = product?.vcgPrice || product?.vcPrice || product?.price;
    const refPrice =
      product?.vcgPrice || product?.vcPrice || product?.pricerefer;
    return { price: basePrice, pricerefer: refPrice };
  }, [product]);

  const finalPrice = useMemo(
    () =>
      PriceCalculate(
        price,
        pricerefer,
        product?.flag,
        product?.taxType,
        product?.taxValue
      ),
    [price, pricerefer, product]
  );

  const originalPrice = useMemo(
    () =>
      PriceTaxCalculate(product?.price, product?.taxType, product?.taxValue),
    [product]
  );

  const discount = useMemo(
    () =>
      DiscountPercentCalculate(
        product?.price,
        pricerefer,
        product?.taxType,
        product?.taxValue
      ),
    [product, pricerefer]
  );

  const hasDiscount = Boolean(
    (product?.flag === 1 ||
      product?.vcgPrice ||
      product?.vcPrice ||
      (product?.pricerefer &&
        Number(product.pricerefer) > Number(product.price))) &&
      Number(discount) > 0
  );

  // Stock & Backorder status
  const stockState = getProductStockState(rawProduct);
  const isBackOrder = Boolean(
    stockState.isBackOrder || stockState.isBackOrderActive
  );
  const isOutOfStock = Boolean(stockState.isOutOfStock);

  const handleOrderNow = useCallback(
    (e) => {
      e?.stopPropagation?.();
      e?.preventDefault?.();

      const activeToken = getClientAuthToken(token);
      if (!activeToken) {
        triggerOpenHeaderModal(true);
        return;
      }

      const maxStock = Number(rawProduct?.availableBackOrderStock) || 0;
      const maxAllowedCart = Number(rawProduct?.maxQuantityAllowedCart) || 0;
      const effectiveOrderLimit = maxStock > 0 ? maxStock : maxAllowedCart;
      const minQty = Math.max(
        1,
        Number(rawProduct?.minQuantityAllowedCart) || 1
      );

      const orderItem = {
        ...rawProduct,
        productId:
          Number(rawProduct?.productId || rawProduct?.id) ||
          rawProduct?.productId ||
          rawProduct?.id,
        productCount: minQty,
        priceGroup: 0,
        maxQuantityAllowedCart: effectiveOrderLimit || 5,
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
    },
    [rawProduct, token, dispatch, router]
  );

  const handleAdd = useCallback(
    (e) => {
      e?.stopPropagation?.();
      e?.preventDefault?.();
      if (onAddToCart) {
        onAddToCart(rawProduct);
        return;
      }
      const cartItem = {
        ...rawProduct,
        productId:
          Number(rawProduct?.productId || rawProduct?.id) ||
          rawProduct?.productId ||
          rawProduct?.id,
        productCount: 1,
        quantity: 1,
        price: finalPrice || rawProduct?.price,
        total: Number(finalPrice || rawProduct?.price || 0),
        name: rawProduct?.name,
        skuName: rawProduct?.skuName || rawProduct?.name,
      };
      const existing = findMatchingCartItem(cartItem);
      if (existing) {
        ToastMessage({ type: "info", message: "Already added to cart" });
        return;
      }
      AddToCartLocal(cartItem, dispatch);
      ToastMessage({
        type: "success",
        message: `${rawProduct?.name || "Product"} added to cart`,
      });
    },
    [onAddToCart, rawProduct, finalPrice, dispatch]
  );

  if (!product) return null;

  const rawSlug =
    product?.productSlug ||
    rawProduct?.productSlug ||
    product?.slug ||
    rawProduct?.slug ||
    "";
  const cleanSlug = String(rawSlug).replace(/^\/+/, "");
  const productHref = `/products/${cleanSlug}`;

  const title =
    product?.widget_title ||
    product?.productNameTrans ||
    product?.name ||
    rawProduct?.name ||
    "";

  return (
    <div className="rounded-xl flex flex-col group group/widget relative transition-all duration-300">
      {/* Wishlist and Compare Floating Buttons */}
      <div className="z-20 h-8">
        <div className="top-2 right-2 z-20 hidden justify-end gap-3 overflow-visible group-hover/widget:flex rtl:right-[unset] rtl:left-2">
          {/* Compare Button */}
          <div
            onClick={(e) => handleAddItemToCompare(e, product?.productId)}
            className={`group/compare relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[var(--color-white)] shadow-md transition-all duration-200 hover:shadow-lg ${
              compareCheckFunction(product?.productId) ? "" : "item"
            }`}
          >
            <img
              src={
                compareCheckFunction(product?.productId)
                  ? "/img/compare-outline-active.svg"
                  : "/img/compare-outline.svg"
              }
              alt="compare"
              width={20}
              height={20}
              className="w-5"
            />
            {/* Compare Tooltip */}
            <span className="pointer-events-none invisible absolute bottom-full left-1/2 z-[9999] mb-2 -translate-x-1/2 rounded-md bg-[var(--color-gray-900)] px-3 py-1.5 text-xs font-medium whitespace-nowrap !text-white opacity-0 transition-all duration-200 group-hover/compare:visible group-hover/compare:opacity-100">
              {t("tooltip.compare") || "Compare"}
              <span className="absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-t-4 border-x-[var(--color-transparent)] border-t-[var(--color-gray-900)]" />
            </span>
          </div>

          {/* Wishlist Button */}
          <div
            onClick={handleWishList}
            className={`group/wishlist relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[var(--color-white)] shadow-md transition-all duration-200 hover:shadow-lg hover:scale-110 ${
              !isWishlisted ? "item" : ""
            }`}
          >
            <img
              src={
                isWishlisted
                  ? "/img/heart-select-red-wisit.svg"
                  : "/img/heart-outline-wisit.svg"
              }
              alt="wishlist"
              width={20}
              height={20}
              className="w-5 transition-transform duration-200"
            />
            {/* Wishlist Tooltip */}
            <span className="pointer-events-none invisible absolute bottom-full left-1/2 z-[9999] mb-2 -translate-x-1/2 rounded-md bg-[var(--color-gray-900)] px-3 py-1.5 text-xs font-medium whitespace-nowrap !text-white opacity-0 transition-all duration-200 group-hover/wishlist:visible group-hover/wishlist:opacity-100">
              {t("tooltip.wishList") || "Wishlist"}
              <span className="absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-t-4 border-x-[var(--color-transparent)] border-t-[var(--color-gray-900)]" />
            </span>
          </div>
        </div>
      </div>

      {/* Product Image */}
      <Link prefetch={false} href={productHref} className="relative block">
        <CustomNextImage
          containerName={product?.containerName}
          imageName={product?.image}
          alt={title}
          height={300}
          width={300}
          className="rounded-lg object-contain w-full max-sm:aspect-square sm:h-60 bg-[var(--color-gray-50)] group-hover:scale-105 transition-transform duration-300"
        />
        {product?.isSimplified === 0 && product?.variantCount > 0 && (
          <div className="absolute right-3 bottom-2 flex gap-[5px] rounded-[5px] bg-[var(--color-01040bcc)] p-[4px_8px] text-sm font-medium text-[var(--color-white)]">
            <img src="/img/variant.svg" alt="Variants" />
            <span>{product.variantCount}+ {t("ProductCard.variants") || "Variants"}</span>
          </div>
        )}
      </Link>

      {/* Product Title */}
      <Link prefetch={false} href={productHref}>
        <h2
          className="font-normal text-[var(--color-161d25)] text-base leading-snug line-clamp-2 group-hover:underline h-[44px] mt-[16px]"
          title={title}
        >
          {title}
        </h2>
      </Link>

      {/* Product Price & Action Buttons */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="space-x-2">
          <span className="text-[1.125rem] font-semibold text-[var(--color-171d26)]">
            <CustomCurrencyFormatter price={finalPrice} />
          </span>

          {hasDiscount && (
            <>
              <span className="text-[var(--color-7d7e80)] line-through text-[0.8125rem] font-normal">
                <CustomCurrencyFormatter price={originalPrice} />
              </span>
              <span className="text-[var(--color-0a7205)] text-[0.8125rem] font-semibold">
                {discount}% {t("Common.off") || "off"}
              </span>
            </>
          )}
        </div>

        {/* Action Button: Order Now / Out of Stock / Add (no icon) */}
        {showActionButton && (
          isBackOrder ? (
            <CommonButton
              onClick={handleOrderNow}
              size="sm"
              className="rounded-xl shadow bg-[#F54927] hover:bg-[#F54927] hover:opacity-90 active:scale-95 text-white transition-all text-xs font-bold px-3 py-1.5 border-none"
            >
              {t("productDetail.OrdNow") || t("productlist.Buynow") || "Order Now"}
            </CommonButton>
          ) : isOutOfStock ? (
            <CommonButton
              disabled
              variant="secondary"
              size="sm"
              className="rounded-xl bg-gray-200 text-gray-500 cursor-not-allowed select-none opacity-80 text-xs font-semibold px-3 py-1.5"
            >
              {t("ProductCard.outofStock") || "Out of Stock"}
            </CommonButton>
          ) : (
            <CommonButton
              onClick={handleAdd}
              size="sm"
              className="rounded-xl shadow bg-[#2471A3] hover:bg-[#2471A3] hover:opacity-90 active:scale-95 text-white transition-all text-xs font-bold px-3.5 py-1.5 border-none"
            >
              {t("ProductCard.add") || t("Common.add") || "Add"}
            </CommonButton>
          )
        )}
      </div>
    </div>
  );
}

export { ProductCardSkeleton } from "../SkeletonLoader";
