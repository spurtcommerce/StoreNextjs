import { useTranslations } from "next-intl";
const WatchVideoPreview = ({
  productImageNdVideo,
  videoSrc,
  handleImageChange,
  setResize,
}) => {
  const t = useTranslations("productDetail");

  return (
    Array.isArray(productImageNdVideo) &&
    productImageNdVideo?.length > 0 &&
    productImageNdVideo?.map((media, index) =>
      media?.mediaType == 2 && !videoSrc?.length ? (
        <VideoPreviewLoader key={index} />
      ) : (
        media?.mediaType == 2 &&
        videoSrc?.length && (
          <a
            key={`video${index}`}
            className="w-full h-20 rounded-lg overflow-hidden mt-3 flex items-center justify-center gap-2 relative before:block before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-[var(--color-000000)]/32 before:z-0 cursor-pointer"
            onClick={() => {
              handleImageChange(media, index);
              setResize(true);
            }}
          >
            <video src={videoSrc} className="w-full"></video>
            <div className="absolute flex items-center justify-center gap-2 p-4">
              <p className="text-[18px] leading-[31px] font-bold text-[var(--color-f8f8f8)] relative z-5">
                {t("watchVideo")}
              </p>
              <img
                src="/img/play-circle.svg"
                alt="play-video"
                className="relative z-5"
              />
            </div>
          </a>
        )
      )
    )
  );
};

export default WatchVideoPreview;

const VideoPreviewLoader = () => {
  return (
    <div className="relative flex items-center justify-center w-full h-20 gap-2 mt-3 overflow-hidden bg-[var(--color-gray-200)] rounded-lg animate-pulse">
      <div className="absolute top-0 left-0 w-full h-full bg-[var(--color-000000)]/20 z-0"></div>

      <div className="absolute flex items-center justify-center gap-2 p-4 z-5">
        <div className="w-[120px] h-6 bg-[var(--color-9f9f9f)] rounded-md"></div>
        <div className="w-6 h-6 bg-[var(--color-9f9f9f)] rounded-full"></div>
      </div>
    </div>
  );
};