// Component
import CustomCurrencyFormatter from "@/GlobalComponents/useCommon/CustomCurrencyFormatter";
import {
  DiscountPercentCalculate,
  PriceCalculate,
  PriceTaxCalculate,
} from "@/utilities/PriceCalculate";
// 3rd Party
import {useTranslations} from 'next-intl';

const ProductPriceInDetail = ({ productDetail }) => {
  const t = useTranslations("productDetail");

  const discountPercentage = DiscountPercentCalculate(
              productDetail?.price,
              productDetail?.pricerefer,
              productDetail?.taxType,
              productDetail?.taxValue
            )

  return (
    <div className="mt-3 space-x-2 mb-8">
      <span className="text-[28px] font-semibold leading-[31px] text-[var(--color-161d25)]">
        <CustomCurrencyFormatter
          price={PriceCalculate(
            productDetail?.price,
            productDetail?.pricerefer,
            productDetail?.flag,
            productDetail?.taxType,
            productDetail?.taxValue
          )}
        />
      </span>
      {productDetail?.flag == 1 && (
        <>
          <span className="text-sm font-normal text-[var(--color-black-300)] line-through">
            MRP{" "}
            <CustomCurrencyFormatter
              price={PriceTaxCalculate(
                productDetail?.price,
                productDetail?.taxType,
                productDetail?.taxValue
              )}
            />
          </span>
          {discountPercentage != 0 && 
          <span className="text-[var(--color-0a7205)] text-sm font-normal">
            {discountPercentage}
            % {t("off")}
          </span>
          } 
        </>
      )}
    </div>
  );
};

export default ProductPriceInDetail;
