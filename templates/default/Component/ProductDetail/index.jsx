"use client";

// React
import { useEffect, useState } from "react";

// Components
import ProductImages from "./ProductImages";
import ProductPriceInDetail from "./ProductPriceInDetail";
import Description from "./Description";
import Highlights from "./Highlights";
import Specification from "./Specification";
import ProductDetailSkeleton from "./skeleton";
import { useAddons } from "@/GlobalComponents/useCommon/AddonProvider";
import ProductQuantity from "@/GlobalComponents/useProductCard/ProductQuantity";
import eventBus from "@/utilities/eventBus";
import { getProductDetail } from "@/api/ProductDetailApi";
import ProductOrderButtons from "@/GlobalComponents/ProductOrderButtons";
import RelatedProducts from "@/GlobalComponents/RelatedProducts";
import Variants from "@/GlobalComponents/Variants";
import RatingReview from "@/GlobalComponents/RatingReview";
import AverageRating from "@/GlobalComponents/AverageRating";

const ProductDetail = ({ token, productSlug, rawProduct, categoryIds }) => {
  const { addons, loading } = useAddons();



  const [productDetail, setProductDetail] = useState({ ...rawProduct } || {});
  const [isProductDetailLoading, setIsProductDetailLoading] = useState(true);
  const [productQuantity, setProductQuantity] = useState(1);
  const [variantChangeTrigger, setVariantChangeTrigger] = useState(0);

  const productDetailClassnames = {
    quantityVariantDiv: "max-w-[516px]",
    quantityWidth: "w-full max-w-[516px]",
    singleVariantDropdown: "w-full",
    doubleVariantDropdown: "w-full",
  };

  const serverProductApi = async () => {
    const prodData = await getProductDetail(productSlug);
    if (prodData) {
      setProductDetail(prodData);
    }
  };

  // const langContentReduxState = useSelector(
  //   (state) => state.storeReducer.langContentRedux
  // );

  // useEffect(() => {
  //   serverProductApi();
  // }, [langContentReduxState]);

  useEffect(() => {
    const handleRefresh = () => serverProductApi(); // Re-fetch on event
    eventBus.addEventListener("productDetailKey", handleRefresh);
    return () => {
      eventBus.removeEventListener("productDetailKey", handleRefresh); // Cleanup
    };
  }, []);

  useEffect(() => {
    if (
      productDetail?.variantMode === "selector" ||
      productDetail?.variantMode === "simple" ||
      productDetail?.isSimplified === 1
    ) {
      setIsProductDetailLoading(false);
    }
  }, [productDetail?.variantMode, productDetail?.isSimplified]);

  return (
    <>
      {isProductDetailLoading && <ProductDetailSkeleton />}

      <main className={`${isProductDetailLoading ? "hidden" : "block"}`}>
        <section className="mx-auto grid w-full max-w-[1440px] grid-cols-[1.2fr_1fr] gap-14 p-[47px_20px] max-xl:gap-6 max-lg:grid-cols-1 max-md:p-4">
          {/* overflow-hidden */}
          {/* Product images */}
          <ProductImages productDetail={productDetail} />

          <div className="overflow-hidden">
            <h1 className="mb-5 text-[24px] leading-[33px] font-normal text-[var(--color-161d25)]">
              {productDetail?.skuName} -{" "}
              {productDetail?.productNameTrans
                ? productDetail?.productNameTrans
                : productDetail?.name}
            </h1>
            {/* 
           <div className="flex items-center gap-4 mb-6">
                  <ProductStockStatus
                    product={productDetail}
                    customClassName={
                      "flex items-center gap-[3px] p-[3px_5px] rounded-[3px] w-fit"
                    }
                  /> 
                  </div> */}

            {/* Product ratings */}
            {!isProductDetailLoading && (
              <AverageRating productDetail={productDetail} />
            )}
            {/* </div> */}

            {/* Product price */}
            <ProductPriceInDetail productDetail={productDetail} />



            {/* Product quantity and variant list */}
            {/* If isSimplified == 0 its a variant product */}
            {productDetail?.isSimplified == 0 && (
              <div
                className={`${productDetailClassnames?.quantityVariantDiv
                  } ${productDetail?.productVarient?.length == 1
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
            {(productDetail?.hasStock == 1 || productDetail?.hasStock === true) &&
              (productDetail?.quantity === undefined ||
                productDetail?.quantity === null ||
                Number(productDetail?.quantity) > 0) && (
                <ProductQuantity
                  product={productDetail}
                  productQuantity={productQuantity}
                  setProductQuantity={setProductQuantity}
                  classNames={productDetailClassnames}
                />
              )}



            <ProductOrderButtons
              token={token}
              addonlist={addons}

              productDetail={productDetail}
              productQuantity={productQuantity}
              setProductQuantity={setProductQuantity}
            />

            {/* Product Description */}
            <Description productDetail={productDetail} />

            {/* Product Highlights */}
            <Highlights productDetail={productDetail} />

            {/* Product specification */}
            {!isProductDetailLoading && (
              <Specification
                productSlug={productSlug}
                categoryIds={categoryIds}
                productDetail={productDetail}
              />
            )}

            {/* Product rating and reviews */}
            {!isProductDetailLoading && (
              <RatingReview productDetail={productDetail} />
            )}
          </div>
        </section>
        {
          !isProductDetailLoading && (
            <RelatedProducts token={token} productSlug={productSlug} />
          )}
      </main>
    </>
  );
};

export default ProductDetail;
