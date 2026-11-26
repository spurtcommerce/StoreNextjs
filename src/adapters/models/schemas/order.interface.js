/**
 * Creates a normalized CommonOrderListItem DTO matching Spurt order list item schema
 * @param {Partial<CommonOrderListItem>} partial
 * @returns {Object}
 */
export const createCommonOrderListItem = (partial = {}) => {
  return {
    orderId: partial.orderId ?? "",
    createdDate: partial.createdDate ?? new Date().toISOString(),
    orderPrefixId: partial.orderPrefixId ?? "",
    total: partial.total ?? "0.00",
    isShoppingList: partial.isShoppingList ?? 0,
    itemCount: partial.itemCount ?? "1",
    ...partial,
  };
};

/**
 * Creates a normalized CommonOrderListResponse DTO matching Spurt response schema
 * @param {Object} options
 * @param {number} [options.status=1]
 * @param {string} [options.message="Successfully shown the order list. "]
 * @param {Array<Object>|number} [options.data=[]]
 * @returns {Object}
 */
export const createCommonOrderListResponse = ({
  status = 1,
  message = "Successfully shown the order list. ",
  data = [],
} = {}) => {
  return {
    status,
    message,
    data,
  };
};

/**
 * Creates a normalized CommonOrderDetail DTO matching Spurt order detail schema
 * @param {Partial<CommonOrderDetail>} partial
 * @returns {Object}
 */
export const createCommonOrderDetail = (partial = {}) => {
  return {
    createdBy: partial.createdBy ?? null,
    createdDate: partial.createdDate ?? new Date().toISOString(),
    modifiedBy: partial.modifiedBy ?? null,
    modifiedDate: partial.modifiedDate ?? new Date().toISOString(),
    orderId: partial.orderId ?? "",
    customerId: partial.customerId ?? null,
    currencyId: partial.currencyId ?? null,
    shippingZoneId: partial.shippingZoneId ?? null,
    paymentZoneId: partial.paymentZoneId ?? null,
    shippingCountryId: partial.shippingCountryId ?? 99,
    paymentCountryId: partial.paymentCountryId ?? null,
    invoiceNo: partial.invoiceNo ?? "",
    invoicePrefix: partial.invoicePrefix ?? "SPURT",
    firstname: partial.firstname ?? null,
    lastname: partial.lastname ?? null,
    email: partial.email ?? "",
    telephone: partial.telephone ?? "",
    fax: partial.fax ?? null,
    shippingFirstname: partial.shippingFirstname ?? "",
    shippingLastname: partial.shippingLastname ?? "",
    shippingCompany: partial.shippingCompany ?? "",
    shippingAddress1: partial.shippingAddress1 ?? "",
    shippingAddress2: partial.shippingAddress2 ?? "",
    shippingCity: partial.shippingCity ?? "",
    shippingPostcode: partial.shippingPostcode ?? "",
    shippingCountry: partial.shippingCountry ?? "India",
    shippingZone: partial.shippingZone ?? "Tamil Nadu",
    shippingAddressFormat: partial.shippingAddressFormat ?? "",
    shippingMethod: partial.shippingMethod ?? null,
    paymentFirstname: partial.paymentFirstname ?? "",
    paymentLastname: partial.paymentLastname ?? "",
    paymentCompany: partial.paymentCompany ?? "",
    paymentAddress1: partial.paymentAddress1 ?? "",
    paymentAddress2: partial.paymentAddress2 ?? "",
    paymentCity: partial.paymentCity ?? "",
    paymentPostcode: partial.paymentPostcode ?? "",
    paymentCountry: partial.paymentCountry ?? "India",
    paymentZone: partial.paymentZone ?? "Tamil Nadu",
    paymentAddressFormat: partial.paymentAddressFormat ?? "",
    paymentMethod: partial.paymentMethod ?? "Standard Payment",
    comment: partial.comment ?? null,
    couponCode: partial.couponCode ?? null,
    discountAmount: partial.discountAmount ?? null,
    amount: partial.amount ?? 0,
    total: partial.total ?? 0,
    reward: partial.reward ?? null,
    orderStatusId: partial.orderStatusId ?? 1,
    fullfillmentStatusId: partial.fullfillmentStatusId ?? null,
    orderPrefixId: partial.orderPrefixId ?? "",
    affiliateId: partial.affiliateId ?? null,
    commision: partial.commision ?? null,
    currencyCode: partial.currencyCode ?? "INR",
    currencyValue: partial.currencyValue ?? 1,
    currencySymbolLeft: partial.currencySymbolLeft ?? "₹",
    currencySymbolRight: partial.currencySymbolRight ?? "",
    ip: partial.ip ?? "",
    paymentFlag: partial.paymentFlag ?? null,
    paymentStatus: partial.paymentStatus ?? 0,
    trackingUrl: partial.trackingUrl ?? null,
    trackingNo: partial.trackingNo ?? null,
    orderName: partial.orderName ?? null,
    paymentType: partial.paymentType ?? null,
    paymentProcess: partial.paymentProcess ?? 1,
    paymentDetails: partial.paymentDetails ?? null,
    backOrders: partial.backOrders ?? 0,
    tenantId: partial.tenantId ?? 1,
    isActive: partial.isActive ?? 1,
    customerGstNo: partial.customerGstNo ?? "",
    paymentMobileNumber: partial.paymentMobileNumber ?? "",
    poNumber: partial.poNumber ?? "",
    mustShipBefore: partial.mustShipBefore ?? new Date().toISOString(),
    notes: partial.notes ?? "",
    paymentRuleId: partial.paymentRuleId ?? null,
    paymentTermId: partial.paymentTermId ?? null,
    shippingCostOverride: partial.shippingCostOverride ?? "0.00",
    orderSource: partial.orderSource ?? "shopping-cart",
    createdByType: partial.createdByType ?? "buyer",
    currencyExchangeCode: partial.currencyExchangeCode ?? "INR",
    currencyExchangeSymbolLeft: partial.currencyExchangeSymbolLeft ?? "₹",
    rateUsed: partial.rateUsed ?? "1.0000",
    isShoppingList: partial.isShoppingList ?? false,
    orderStatusName: partial.orderStatusName ?? "Completed",
    orderStatusColorCode: partial.orderStatusColorCode ?? "#10B981",
    orderStatusDescription:
      partial.orderStatusDescription ?? "Order completed successfully.",
    orderProducts: partial.orderProducts ?? [],
    ...partial,
  };
};

/**
 * Creates a normalized CommonOrderDetailResponse DTO
 * @param {Object} options
 * @param {number} [options.status=1]
 * @param {string} [options.message="Successfully shown the order detail. "]
 * @param {Object|null} [options.data=null]
 * @returns {Object}
 */
export const createCommonOrderDetailResponse = ({
  status = 1,
  message = "Successfully shown the order detail. ",
  data = null,
} = {}) => {
  return {
    status,
    message,
    data,
  };
};
