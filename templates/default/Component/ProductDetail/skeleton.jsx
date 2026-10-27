const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-[var(--color-gray-200)] ${className}`} />
);

const ProductDetailSkeleton = () => {
  return (
    <main>
      <section className="grid grid-cols-[1.2fr_1fr] max-lg:grid-cols-1 max-lg:p-6 gap-14 p-[47px_40px] overflow-hidden max-xl:gap-6 max-md:p-4 max-w-[1440px] mx-auto w-full">
        {/* Left Column - Image Thumbnails + Main Image */}
        <div className="sticky h-fit">
          <div className="grid grid-cols-[auto_1fr] gap-2 h-[608px] max-md:flex max-md:flex-col-reverse max-md:h-fit">
            {/* Thumbnails */}
            <div className="h-full max-md:h-fit overflow-hidden relative w-20 min-w-20 max-md:w-full flex flex-col gap-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="w-20 h-20 rounded-lg" />
              ))}
            </div>

            {/* Main Image */}
            <div className="h-full rounded-lg overflow-hidden bg-[var(--color-gray-50)] flex items-center justify-center">
              <Skeleton className="w-full h-full" />
            </div>
          </div>

          {/* Video Preview */}
          <Skeleton className="w-full h-20 rounded-lg mt-3" />
        </div>

        {/* Right Column - Product Details */}
        <div className="overflow-hidden">
          <Skeleton className="h-8 w-[60%] mb-3" />

          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="w-[100px] h-6 rounded-sm" />
            <Skeleton className="w-20 h-5 rounded-sm" />
          </div>

          <Skeleton className="h-8 w-[100px] mb-8" />

          {/* Quantity Offers */}
          <div className="mb-8">
            <Skeleton className="w-[150px] h-[22px] mb-3.5" />
            <div className="flex gap-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="min-w-[120px] h-20 rounded-[5px]"
                />
              ))}
            </div>
          </div>

          {/* Quantity & Color Selectors */}
          <div className="max-w-[516px] flex gap-2 mb-6">
            <Skeleton className="w-36 h-[42px] rounded-[5px]" />
            <Skeleton className="flex-1 h-[42px] rounded-[5px]" />
          </div>

          {/* Description Section */}
          <div className="mb-8">
            <Skeleton className="h-[22px] w-40 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-4/5 mb-2" />
            <Skeleton className="h-4 w-3/5 mb-2" />
          </div>

          {/* Product Details Table */}
          <div className="mb-8">
            <Skeleton className="h-[22px] w-40 mb-4" />
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <Skeleton className="w-1/3 h-5" />
                <Skeleton className="w-2/3 h-5" />
              </div>
            ))}
          </div>

          {/* Reviews */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-[22px] w-[120px]" />
              <Skeleton className="h-8 w-[120px] rounded-[5px]" />
            </div>

            {[...Array(2)].map((_, i) => (
              <div key={i} className="border-b border-[var(--color-e9e9e9)] pb-4 mb-4">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Skeleton key={j} className="w-4 h-4 rounded" />
                  ))}
                </div>
                <div className="flex items-center gap-2.5 mb-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div>
                    <Skeleton className="w-[100px] h-4 mb-1" />
                    <Skeleton className="w-[60px] h-3.5" />
                  </div>
                </div>
                <Skeleton className="w-3/5 h-[18px] mb-1" />
                <Skeleton className="w-full h-3.5" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProductDetailSkeleton;