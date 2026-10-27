// 3rd Party
import { useTranslations } from "next-intl";
//Utils
import { getReplacedHTMLValue } from "@/utilities/commonFunctions";

const Description = ({ productDetail }) => {
  const t = useTranslations("productDetail");
  const rawDescription =
    productDetail?.productDescriptionTrans || productDetail?.description || "";

  return (
    <div className="mt-6 mb-8">
      <h3 className="text-base font-semibold leading-[22px] text-[var(--color-161d25)] mb-4">
        {t("description")}
      </h3>
      <div
        className="text-[14px] leading-[21px] text-[var(--color-161d25)] mb-2 list-default bullet margin editor-style"
        dangerouslySetInnerHTML={{
          __html: getReplacedHTMLValue(rawDescription),
        }}
      />
    </div>
  );
};

export default Description;
