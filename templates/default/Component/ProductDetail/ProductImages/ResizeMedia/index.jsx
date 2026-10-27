// Component
import CustomNextImage from "@/GlobalComponents/useCustomNextImage";
// 3rd Party
import { useTranslations } from "next-intl";

const ResizeMedia = ({
  setResize,
  selectedImage,
  setSelectedImage,
  selectedImageIndex,
  setSelectedImageIndex,
  productImageNdVideo,
  videoSrc,
  handleImageChange,
}) => {
  const t = useTranslations("productDetail");
  const handlePreviousImage = () => {
    productImageNdVideo?.forEach((media, index) => {
      if (media?.image == selectedImage?.image) {
        if (index == 0) {
          setSelectedImageIndex(productImageNdVideo?.length);
          const lastImage = productImageNdVideo?.at(-1);
          setSelectedImage(JSON?.parse(JSON?.stringify(lastImage)));
        } else {
          setSelectedImageIndex(index);
          const previousImage = productImageNdVideo?.find(
            (_, i) => i == index - 1
          );

          setSelectedImage(JSON?.parse(JSON?.stringify(previousImage)));
        }
      }
    });
  };

  const handleNextImage = () => {
    productImageNdVideo?.forEach((media, index) => {
      if (media?.image == selectedImage?.image) {
        if (index + 1 == productImageNdVideo?.length) {
          setSelectedImageIndex(1);
          const firstImage = productImageNdVideo?.at(0);
          setSelectedImage(JSON?.parse(JSON?.stringify(firstImage)));
        } else {
          setSelectedImageIndex(index + 2);
          const nextImage = productImageNdVideo?.find((_, i) => i == index + 1);
          setSelectedImage(JSON?.parse(JSON?.stringify(nextImage)));
        }
      }
    });
  };

  const handleCloseResize = () => {
    if (selectedImage?.mediaType == 2) {
      // If Selected media is a video while closing resize modal setSelectedMedia as an image
      setSelectedImage(
        productImageNdVideo?.find((media) => media?.defaultImage == 1) ||
          productImageNdVideo?.[0]
      );
    }
    setResize(false);
  };

  return (
    <div
      className={`fixed top-0 left-0 w-full h-full bg-[var(--color-light-modal)] z-150 flex justify-center items-center lg:items-start`}
    >
      <div className="bg-[var(--color-white)] pb-4 w-full h-full z-50">
        <div className="flex items-center m-4">
          <div className="flex justify-center items-center space-x-3 px-6 w-full">
            <h2 className="flex space-x-1 font-bold text-[var(--color-black)] text-xl">
              {selectedImageIndex}{" "}
              <span className="text-[var(--color-black)] mx-1"> {t("of")} </span>{" "}
              {Array.isArray(productImageNdVideo) &&
                productImageNdVideo?.length > 0 &&
                productImageNdVideo?.length}
            </h2>
          </div>
          <button
            className="flex justify-center items-center bg-[var(--color-white)] hover:bg-[var(--color-e8e8e8)] hover:shadow-lg rounded-full w-8 h-8 cursor-pointer"
            onClick={() => handleCloseResize()}
          >
            {" "}
            <img className="w-4" src="/img/close.svg" alt="close" />
          </button>
        </div>
        <div className="flex space-x-6 rtl:space-x-[unset] px-4 h-calc">
          <div className="relative flex-13 bg-[var(--color-gray-100)] rtl:ml-6 rounded-2xl w-full min-w-full md:min-w-[75vw] h-full aspect-square">
            {selectedImage?.mediaType == 1 ? (
              <CustomNextImage
                containerName={selectedImage?.containerName}
                imageName={selectedImage?.image}
                alt={selectedImage?.image}
                height={500}
                width={600}
                className={"m-auto rounded-2xl w-full h-full object-contain"}
              />
            ) : (
              <video
                src={videoSrc}
                className="m-auto w-full h-full object-contain"
                autoPlay
                controls
                controlsList="nodownload"
              />
            )}
            <button
              onClick={() => handlePreviousImage()}
              className="top-[45%] left-2 absolute flex justify-center items-center bg-[var(--color-white)] hover:bg-[var(--color-gray-100)] shadow-lg rounded-full w-12 h-12 cursor-pointer"
            >
              <img src="/img/leftgray-arrow.svg" alt="leftgray-arrow" />
            </button>
            <button
              onClick={() => handleNextImage()}
              className="top-[45%] right-2 absolute flex justify-center items-center bg-[var(--color-white)] hover:bg-[var(--color-gray-100)] shadow-lg rounded-full w-12 h-12 cursor-pointer"
            >
              <img src="/img/rightgray-arrow.svg" alt="rightgray-arrow" />
            </button>
          </div>

          <div className="hidden flex-3 gap-3 three-grid md:grid h-auto lg:h-50vh overflow-y-auto scroll-hide">
            {Array.isArray(productImageNdVideo) &&
              productImageNdVideo?.length > 0 &&
              productImageNdVideo?.map(
                (media, index) =>
                  media?.mediaType == 1 && (
                    <a
                      key={`image${index}`}
                      onClick={() => handleImageChange(media, index)}
                      className={`w-full bg-[var(--color-gray-100)] max-h-[236px] hover:border-2 cursor-pointer border-[var(--color-black)]  aspect-square hover:p-0.5 rounded-2xl ${
                        selectedImage?.image == media?.image && "border-2 p-0.5"
                      }`}
                    >
                      <CustomNextImage
                        containerName={media?.containerName}
                        imageName={media?.image}
                        alt={media?.image}
                        height={236}
                        width={278}
                        className={
                          "m-auto rounded-2xl w-full h-full object-contain"
                        }
                      />
                    </a>
                  )
              )}
            {Array.isArray(productImageNdVideo) &&
              productImageNdVideo?.length > 0 &&
              productImageNdVideo?.map(
                (media, index) =>
                  media?.mediaType == 2 && (
                    <a
                      key={`video${index}`}
                      onClick={() => handleImageChange(media, index)}
                      className={`relative w-full bg-[var(--color-gray-100)] max-h-[236px] hover:border-2 border-[var(--color-black)] cursor-pointer aspect-square hover:p-0.5 rounded-2xl flex items-center justify-center before:rounded-2xl before:block before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-[var(--color-000000)]/32 before:z-0 ${
                        selectedImage?.image == media?.image && "border-2 p-0.5"
                      }`}
                    >
                      <video
                        src={videoSrc}
                        className="m-auto w-full h-full object-contain"
                      ></video>
                      <div className="absolute flex items-center justify-center">
                        <img
                          src="/img/play-circle.svg"
                          alt="play-video"
                          className="relative z-5"
                        />
                      </div>
                    </a>
                  )
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResizeMedia;
