/**
 * Creates a normalized CommonWishlistItem DTO matching Spurt wishlist item schema
 * @param {Partial<CommonWishlistItem>} partial
 * @returns {Object}
 */
export const createCommonWishlistItem = (partial = {}) => {
  return {
    wishlistProductId: partial.wishlistProductId ?? "",
    productId: partial.productId ?? "",
    taxType: partial.taxType ?? 1,
    taxValue: partial.taxValue ?? 0,
    name: partial.name ?? "",
    price: partial.price ?? "0.00",
    quantity: partial.quantity ?? 10,
    description: partial.description ?? "",
    dateAvailable: partial.dateAvailable ?? new Date().toISOString(),
    sku: partial.sku ?? "",
    skuId: partial.skuId ?? partial.productId ?? "",
    sortOrder: partial.sortOrder ?? 1,
    isSimplified: partial.isSimplified ?? 1,
    isSpecification: partial.isSpecification ?? 0,
    upc: partial.upc ?? "1",
    rating: partial.rating ?? null,
    isActive: partial.isActive ?? 1,
    productSlug: partial.productSlug ?? "",
    hasStock: partial.hasStock ?? 1,
    outOfStockThreshold: partial.outOfStockThreshold ?? null,
    stockStatusId: partial.stockStatusId ?? 1,
    createdDate: partial.createdDate ?? new Date().toISOString(),
    keywords: partial.keywords ?? "",
    containerName: partial.containerName ?? "",
    image: partial.image ?? "",
    defaultImage: partial.defaultImage ?? 1,
    vendorId: partial.vendorId ?? 1,
    vendorName: partial.vendorName ?? "SingleVendor",
    vendorCompanyName: partial.vendorCompanyName ?? null,
    vendorSlugName: partial.vendorSlugName ?? null,
    displayNameUrl: partial.displayNameUrl ?? null,
    companyLogo: partial.companyLogo ?? null,
    companyLogoPath: partial.companyLogoPath ?? null,
    maxQuantityAllowedCart: partial.maxQuantityAllowedCart ?? 5,
    minQuantityAllowedCart: partial.minQuantityAllowedCart ?? 1,
    ratingCount: partial.ratingCount ?? "0",
    reviewCount: partial.reviewCount ?? "0",
    skuName: partial.skuName ?? "",
    productDiscount: partial.productDiscount ?? null,
    productSpecial: partial.productSpecial ?? null,
    productNameTrans: partial.productNameTrans ?? "",
    productDescriptionTrans: partial.productDescriptionTrans ?? "",
    pricerefer: partial.pricerefer ?? "",
    flag: partial.flag ?? "",
    stockStatus: partial.stockStatus ?? "inStock",
    ...partial,
  };
};

/**
 * Creates a normalized CommonWishlistResponse DTO matching Spurt response schema
 * @param {Object} options
 * @param {number} [options.status=1]
 * @param {string} [options.message="Successfully show the wishlist product list"]
 * @param {Array<Object>|number} [options.data=[]]
 * @returns {Object}
 */
export const createCommonWishlistResponse = ({
  status = 1,
  message = "Successfully show the wishlist product list",
  data = [],
} = {}) => {
  return {
    status,
    message,
    data,
  };
};
