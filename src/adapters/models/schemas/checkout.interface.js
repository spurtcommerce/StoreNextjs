/**
 * Creates a normalized Spurt Checkout Order DTO from Medusa order/cart & Spurt payload
 * @param {Object} order Medusa order or cart object
 * @param {Object} payload Spurt checkout input payload
 * @returns {Object}
 */
export const createCommonCheckoutOrderData = (order = {}, payload = {}) => {
  const rawId = order?.display_id || order?.id || payload?.orderId || Date.now();
  let numericId = typeof rawId === "number" ? rawId : parseInt(String(rawId).replace(/\D/g, "")) || 792;
  if (numericId > 999999) numericId = numericId % 10000;

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const orderPrefixId = `SPURT-${dateStr}${numericId}`;
  const invoiceNo = `INV${String(numericId).padStart(5, "0")}`;

  const email = payload.emailId || payload.email || order.email || "customer@example.com";
  const phone = String(payload.phoneNumber || payload.paymentMobileNumber || payload.telephone || "8778748473");

  const totalAmt = Number(order.total ?? payload.total ?? payload.amount ?? 60750);

  const productDetails = Array.isArray(payload.productDetails) && payload.productDetails.length > 0
    ? payload.productDetails.map((p, idx) => ({
        createdBy: null,
        createdDate: new Date().toISOString(),
        modifiedBy: null,
        modifiedDate: new Date().toISOString(),
        orderProductId: p.orderProductId || idx + 1000,
        productId: p.productId || p.id || 557,
        orderProductPrefixId: `${orderPrefixId}${idx + 1}`,
        orderId: numericId,
        name: p.name || p.productName || p.title || "Product",
        model: p.model || p.name || p.title || "Product",
        quantity: Number(p.quantity || 1),
        productPrice: Number(p.productPrice || p.price || totalAmt),
        discountAmount: Number(p.discountAmount || 0),
        basePrice: Number(p.basePrice || p.productPrice || totalAmt),
        taxType: 1,
        taxValue: Number(p.taxValue || 0),
        total: Number(p.total || (p.productPrice || totalAmt) * (p.quantity || 1)),
        discountedAmount: 0,
        orderStatusId: 1,
        fullfillmentStatusId: null,
        tags: null,
        trackingUrl: null,
        trackingNo: null,
        trace: null,
        tax: null,
        cancelRequest: 0,
        cancelRequestStatus: 0,
        cancelReason: null,
        cancelReasonDescription: null,
        isActive: 1,
        skuName: p.skuName || p.sku || "",
        couponDiscountAmount: null,
        priceGroupDetailId: 0,
        image: p.image || null,
      }))
    : (Array.isArray(order.items) ? order.items : []).map((item, idx) => ({
        createdBy: null,
        createdDate: new Date().toISOString(),
        modifiedBy: null,
        modifiedDate: new Date().toISOString(),
        orderProductId: idx + 1000,
        productId: item.product_id || item.variant_id || 557,
        orderProductPrefixId: `${orderPrefixId}${idx + 1}`,
        orderId: numericId,
        name: item.title || "Product",
        model: item.title || "Product",
        quantity: Number(item.quantity || 1),
        productPrice: Number(item.unit_price || totalAmt),
        discountAmount: 0,
        basePrice: Number(item.unit_price || totalAmt),
        taxType: 1,
        taxValue: 0,
        total: Number(item.subtotal || item.unit_price * item.quantity || totalAmt),
        discountedAmount: 0,
        orderStatusId: 1,
        fullfillmentStatusId: null,
        tags: null,
        trackingUrl: null,
        trackingNo: null,
        trace: null,
        tax: null,
        cancelRequest: 0,
        cancelRequestStatus: 0,
        cancelReason: null,
        cancelReasonDescription: null,
        isActive: 1,
        skuName: item.variant_sku || "",
        couponDiscountAmount: null,
        priceGroupDetailId: 0,
        image: null,
      }));

  return {
    createdBy: null,
    createdDate: order.created_at || new Date().toISOString(),
    modifiedBy: null,
    modifiedDate: new Date().toISOString(),
    orderId: numericId,
    customerId: payload.customerId || 354,
    currencyId: null,
    shippingZoneId: payload.zoneId || null,
    paymentZoneId: null,
    shippingCountryId: payload.shippingCountryId || 99,
    paymentCountryId: payload.paymentCountryId || null,
    invoiceNo: invoiceNo,
    invoicePrefix: "SPURT",
    firstname: payload.shippingFirstName || payload.paymentFirstName || null,
    lastname: payload.shippingLastName || payload.paymentLastName || null,
    email: email,
    telephone: phone,
    fax: null,
    shippingFirstname: payload.shippingFirstName || "Customer",
    shippingLastname: payload.shippingLastName || "",
    shippingCompany: payload.shippingCompany || "",
    shippingAddress1: payload.shippingAddress_1 || payload.shippingAddress1 || "",
    shippingAddress2: payload.shippingAddress_2 || payload.shippingAddress2 || "",
    shippingCity: payload.shippingCity || "",
    shippingPostcode: String(payload.shippingPostCode || payload.shippingPostcode || ""),
    shippingCountry: payload.shippingCountry || "India",
    shippingZone: payload.shippingZone || "Tamil Nadu",
    shippingAddressFormat: payload.shippingAddressFormat || "",
    shippingMethod: null,
    paymentFirstname: payload.paymentFirstName || payload.shippingFirstName || "Customer",
    paymentLastname: payload.paymentLastName || payload.shippingLastName || "",
    paymentCompany: payload.paymentCompany || payload.shippingCompany || "",
    paymentAddress1: payload.paymentAddress_1 || payload.paymentAddress1 || "",
    paymentAddress2: payload.paymentAddress_2 || payload.paymentAddress2 || "",
    paymentCity: payload.paymentCity || payload.shippingCity || "",
    paymentPostcode: String(payload.paymentPostCode || payload.paymentPostcode || ""),
    paymentCountry: payload.paymentCountry || "India",
    paymentZone: payload.paymentZone || payload.shippingZone || "Tamil Nadu",
    paymentAddressFormat: "",
    paymentMethod: String(payload.paymentMethod || "1"),
    comment: null,
    couponCode: payload.couponCode || null,
    discountAmount: payload.couponDiscountAmount || null,
    amount: totalAmt,
    total: totalAmt,
    reward: null,
    orderStatusId: 1,
    fullfillmentStatusId: null,
    orderPrefixId: orderPrefixId,
    affiliateId: null,
    commision: null,
    currencyCode: "USD",
    currencyValue: 73,
    currencySymbolLeft: "$",
    currencySymbolRight: "",
    ip: "127.0.0.1",
    paymentFlag: null,
    paymentStatus: 0,
    trackingUrl: null,
    trackingNo: null,
    orderName: null,
    paymentType: "CashOnDelivery",
    paymentProcess: 1,
    paymentDetails: null,
    backOrders: 0,
    tenantId: 5,
    isActive: 1,
    customerGstNo: payload.taxNumber || "",
    paymentMobileNumber: phone,
    poNumber: payload.poNumber || "",
    mustShipBefore: new Date().toISOString(),
    notes: payload.notes || "",
    paymentRuleId: null,
    paymentTermId: null,
    shippingCostOverride: "0.00",
    orderSource: payload.orderSource || "shopping-cart",
    createdByType: "buyer",
    currencyExchangeCode: "INR",
    currencyExchangeSymbolLeft: "₹",
    rateUsed: "1.0000",
    isShoppingList: false,
    productDetail: productDetails,
  };
};

/**
 * Creates a normalized Checkout Response DTO matching Spurt & Medusa checkout response schemas
 * @param {Object} options
 * @param {number} [options.status=1]
 * @param {string} [options.message="You have successfully placed order. order details sent to your mail"]
 * @param {Object|null} [options.data=null]
 * @returns {Object}
 */
export const createCommonCheckoutResponse = ({
  status = 1,
  message = "You have successfully placed order. order details sent to your mail",
  data = null,
} = {}) => {
  return {
    status,
    message,
    data,
  };
};

