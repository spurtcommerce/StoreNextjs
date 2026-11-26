"use client";

// React
import { useEffect, useRef, useState } from "react";

// utils
import { resolveCommerceVideoUrl } from "@/utilities/mediaResolver";

// Component
import CustomNextImage from "@/GlobalComponents/Shared/Common/CustomNextImage";
import ResizeMedia from "./ResizeMedia";

const ProductImages = ({ productDetail }) => {
  // States
  const [selectedImage, setSelectedImage] = useState({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [resize, setResize] = useState(false);
  const [videoSrc, setVideoSrc] = useState("");

  // To handle product image vertical scroll
  const listRef = useRef(null);

  const scroll = (direction) => {
    if (!listRef.current) return;
    const scrollAmount = 88;
    listRef.current.scrollTop +=
      direction === "up" ? -scrollAmount : scrollAmount;
  };

  useEffect(() => {
    if (resize == true) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [resize]);

  const handleImageChange = (media, index) => {
    setSelectedImage(media);
    setSelectedImageIndex(index + 1);
  };

  const rawVideo = productDetail?.productVideo || productDetail?.video;
  const hasVideoData = Boolean(
    rawVideo?.name ||
    rawVideo?.path ||
    rawVideo?.url ||
    (typeof rawVideo === "string" && rawVideo)
  );

  const videoObj = (hasVideoData && rawVideo)
    ? typeof rawVideo === "object"
      ? { ...rawVideo, mediaType: 2, isVideo: true }
      : { url: rawVideo, mediaType: 2, isVideo: true }
    : null;

  const productImageNdVideo = Array.isArray(productDetail?.productImage)
    ? videoObj
      ? [...productDetail.productImage, videoObj]
      : [...productDetail.productImage]
    : [];

  const fetchVideo = () => {
    const src = resolveCommerceVideoUrl(rawVideo);
    if (src) setVideoSrc(src);
  };

  useEffect(() => {
    if (Array.isArray(productDetail?.productImage)) {
      productDetail.productImage.forEach((img, index) => {
        if (img?.defaultImage == 1) {
          setSelectedImage(img);
          setSelectedImageIndex(index + 1);
        }
      });
    }

    if (hasVideoData) {
      fetchVideo();
    }
  }, [productDetail, hasVideoData]);

  const handleSelectVideo = () => {
    if (videoObj) {
      setSelectedImage(videoObj);
      setSelectedImageIndex(productImageNdVideo.length);
    } else {
      setSelectedImage({ mediaType: 2, isVideo: true });
    }
  };

  return (
    <>
      <div className="sticky h-fit lg:top-[124px]">
        <div className="grid grid-cols-[auto_1fr] gap-2 h-[608px] max-md:flex max-md:flex-col-reverse max-md:h-fit">
          <div className="relative w-20 h-full overflow-hidden max-md:h-fit min-w-20 max-md:flex max-md:w-full">
            {/* Images scroll up button */}
            {Array.isArray(productImageNdVideo) &&
              productImageNdVideo?.length > 7 && (
                <button
                  className="cursor-pointer bg-[var(--color-white)]/32 absolute top-0 left-0 max-md:hidden w-full h-[26px] flex items-center justify-center z-10"
                  onClick={() => scroll("up")}
                >
                  <img src="/img/arrow-scroll-top.svg" alt="arrow" />
                </button>
              )}

            {/* Product images & video thumbnail box in the same list */}
            <ul
              className="flex flex-col h-full gap-2 overflow-y-auto scrollbar-none max-md:flex-row scroll-smooth scrollbar-hidden"
              ref={listRef}
            >
              {Array.isArray(productImageNdVideo) &&
                productImageNdVideo?.length > 0 &&
                productImageNdVideo?.map(
                  (media, index) =>
                    media?.mediaType == 1 && (
                      <li
                        key={`image${index}`}
                        onClick={(e) => handleImageChange(media, index)}
                      >
                        <a
                          className={`rounded-lg overflow-hidden block w-20 h-20 cursor-pointer border-2 border-solid hover:border-[var(--color-black)] ${
                            selectedImage?.mediaType == 1 && media?.image == selectedImage?.image
                              ? "border-[var(--color-black)]"
                              : "border-[var(--color-white)]"
                          }`}
                          role="button"
                        >
                          <CustomNextImage
                            containerName={media?.containerName}
                            imageName={media?.image}
                            alt={productDetail?.name}
                            height={80}
                            width={80}
                            className={""}
                          />
                        </a>
                      </li>
                    )
                )}

              {/* Product video thumbnail view like box next to images thumbnail view boxes */}
              {Boolean(videoSrc) && (
                <li
                  key="product-video-thumb"
                  onClick={handleSelectVideo}
                >
                  <a
                    className={`rounded-lg overflow-hidden block w-20 h-20 cursor-pointer border-2 border-solid hover:border-[var(--color-black)] bg-zinc-900 text-white relative flex flex-col items-center justify-center transition-all ${
                      selectedImage?.mediaType == 2
                        ? "border-[var(--color-black)] ring-2 ring-[var(--color-black)]"
                        : "border-[var(--color-white)] opacity-85 hover:opacity-100"
                    }`}
                    role="button"
                    title="Watch Product Video"
                  >
                    {videoSrc && (
                      <video
                        src={videoSrc}
                        className="absolute inset-0 w-full h-full object-cover opacity-35 pointer-events-none"
                        muted
                        playsInline
                      />
                    )}
                    <img
                      src="/img/play-circle.svg"
                      alt="play-video"
                      className="w-7 h-7 relative z-5"
                    />
                    <span className="text-[10px] font-bold mt-1 tracking-wider uppercase relative z-5">
                      Video
                    </span>
                  </a>
                </li>
              )}
            </ul>

            {/* Images scroll down button */}
            {Array.isArray(productImageNdVideo) &&
              productImageNdVideo?.length > 7 && (
                <button
                  onClick={() => scroll("down")}
                  className="cursor-pointer bg-[var(--color-white)]/32 absolute bottom-0 left-0 w-full h-[26px] flex items-center justify-center max-md:hidden z-10"
                >
                  <img src="/img/arrow-scroll-bottom.svg" alt="arrow" />
                </button>
              )}
          </div>

          {/* Product display image or video */}
          <div
            className="h-full overflow-hidden rounded-lg bg-[var(--color-gray-50)] flex items-center justify-center relative"
          >
            {selectedImage?.mediaType == 2 ? (
              <video
                src={videoSrc}
                controls
                autoPlay
                className="w-full h-full object-contain bg-black rounded-lg"
              />
            ) : (
              <div
                className="w-full h-full cursor-pointer flex items-center justify-center"
                onClick={() => setResize(true)}
              >
                {selectedImage?.mediaType == 1 && (
                  <CustomNextImage
                    containerName={selectedImage?.containerName}
                    imageName={selectedImage?.image}
                    alt={productDetail?.name}
                    height={600}
                    width={600}
                    className={"w-full h-full object-contain object-center"}
                  />
                )}
              </div>
            )}
          </div>
        </div>


      </div>

      {resize && (
        <ResizeMedia
          setResize={setResize}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          selectedImageIndex={selectedImageIndex}
          setSelectedImageIndex={setSelectedImageIndex}
          productImageNdVideo={productImageNdVideo}
          videoSrc={videoSrc}
          handleImageChange={handleImageChange}
        />
      )}
    </>
  );
};

export default ProductImages;
