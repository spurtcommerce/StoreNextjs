// 3rd Party
import { useTranslations } from "next-intl";

//Utils
import { getReplacedHTMLValue } from "@/utilities/commonFunctions";

const Highlights = ({ productDetail }) => {
  const t = useTranslations("productDetail");

  const rawHighlight = productDetail?.productHighlights;

  return (
    <div className="mb-8">
      <h3 className="text-base font-semibold leading-[22px] text-[var(--color-161d25)] mb-4">
        {t("productHighlights")}
      </h3>
      {rawHighlight &&
        rawHighlight?.map((item, idx) => (
          <div
            key={idx}
            className="text-[14px] leading-[21px] text-[var(--color-161d25)] mb-2 list-default bullet margin editor-style"
            dangerouslySetInnerHTML={{
              __html: getReplacedHTMLValue(item?.data),
            }}
          />
        ))}
    </div>
  );
};

export default Highlights;
