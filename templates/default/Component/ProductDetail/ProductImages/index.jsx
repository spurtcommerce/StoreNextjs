"use client";

// React
import { useEffect, useRef, useState } from "react";

// utils
import { resolveCommerceVideoUrl } from "@/utilities/mediaResolver";

// Component
import CustomNextImage from "@/GlobalComponents/useCustomNextImage";
import ResizeMedia from "./ResizeMedia";
import WatchVideoPreview from "./WatchVideoPreview";

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

  const productImageNdVideo = Array.isArray(productDetail?.productImage)
    ? productDetail?.productVideo?.name
      ? [...productDetail.productImage, productDetail.productVideo]
      : productDetail.productImage
    : productDetail?.productImage;

  useEffect(() => {
    // To handle product's images and video
    Array.isArray(productDetail?.productImage) &&
      productDetail?.productImage?.length > 0 &&
      productDetail?.productImage?.map((img, index) => {
        if (img?.defaultImage == 1) {
          setSelectedImage(img);
          setSelectedImageIndex(index + 1);
        }
      });

    if (productDetail?.productVideo?.name) {
      fetchVideo();
    }
  }, [productDetail]);

  const fetchVideo = () => {
    const src = resolveCommerceVideoUrl(productDetail?.productVideo);
    if (src) setVideoSrc(src);
  };

  return (
    <>
      <div className="sticky h-fit lg:top-[124px]">
        <div className="grid grid-cols-[auto_1fr] gap-2 h-[608px] max-md:flex max-md:flex-col-reverse max-md:h-fit">
          <div className="relative w-20 h-full overflow-hidden max-md:h-fit min-w-20 max-md:flex max-md:w-full ">
            {/* Images scroll up button */}
            {Array.isArray(productImageNdVideo) &&
              productImageNdVideo?.length > 7 && (
                <button
                  className="cursor-pointer bg-[var(--color-white)]/32 absolute top-0 left-0 max-md:hidden w-full h-[26px] flex items-center justify-center"
                  onClick={() => scroll("up")}
                >
                  <img src="/img/arrow-scroll-top.svg" alt="arrow" />
                </button>
              )}

            {/* Product images */}
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
                            media?.image == selectedImage?.image
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
            </ul>

            {/* Images scroll down button */}
            {Array.isArray(productImageNdVideo) &&
              productImageNdVideo?.length > 7 && (
                <button
                  onClick={() => scroll("down")}
                  className="cursor-pointer bg-[var(--color-white)]/32 absolute bottom-0 left-0 w-full h-[26px] flex items-center justify-center  max-md:hidden"
                >
                  <img src="/img/arrow-scroll-bottom.svg" alt="arrow" />
                </button>
              )}
          </div>

          {/* Product display image */}
          <div
            className="h-full overflow-hidden rounded-lg cursor-pointer bg-[var(--color-gray-50)]"
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
        </div>

        {/* Product video thumbnail */}
        <WatchVideoPreview
          productImageNdVideo={productImageNdVideo}
          videoSrc={videoSrc}
          handleImageChange={handleImageChange}
          setResize={setResize}
        />
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
