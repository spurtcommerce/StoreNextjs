/**
 * Creates a normalized CommonCartLineItem DTO matching Spurt cart item schema
 * @param {Partial<CommonCartLineItem>} partial
 * @returns {Object}
 */
export const createCommonCartLineItem = (partial = {}) => {
  return {
    productId: partial.productId ?? "",
    name: partial.name ?? "",
    customerId: partial.customerId ?? 1,
    quantity: partial.quantity ?? 1,
    productPrice: partial.productPrice ?? "0.00",
    tirePrice: partial.tirePrice ?? 0,
    vendorId: partial.vendorId ?? 1,
    total: partial.total ?? (Number(partial.productPrice || 0) * Number(partial.quantity || 1)),
    skuName: partial.skuName ?? "",
    id: partial.id ?? "",
    createdDate: partial.createdDate ?? new Date().toISOString(),
    modifiedDate: partial.modifiedDate ?? new Date().toISOString(),
    ...partial,
  };
};

/**
 * Creates a normalized CommonAddToCartResponse DTO
 * @param {Object} options
 * @param {number} [options.status=1]
 * @param {string} [options.message="Added to cart"]
 * @param {Object|null} [options.data=null]
 * @returns {Object}
 */
export const createCommonAddToCartResponse = ({
  status = 1,
  message = "Added to cart",
  data = null,
} = {}) => {
  return {
    status,
    message,
    data,
  };
};
