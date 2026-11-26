/**
 * Creates a normalized PaymentProvider Item DTO matching Spurt & Medusa payment schemas
 * @param {Object} partial
 * @returns {Object}
 */
export const createCommonPaymentItem = (partial = {}) => {
  return {
    id: partial.id ?? 1,
    pluginName: partial.pluginName ?? "",
    pluginAvatar: partial.pluginAvatar ?? "",
    pluginAvatarPath: partial.pluginAvatarPath ?? "logo/",
    pluginType: partial.pluginType ?? "Payment",
    pluginAdditionalInfo: partial.pluginAdditionalInfo ?? null,
    pluginStatus: partial.pluginStatus ?? 1,
    providerId: partial.providerId ?? partial.id ?? "",
    ...partial,
  };
};

/**
 * Creates a normalized CommonPaymentListResponse DTO
 * @param {Object} options
 * @param {number} [options.status=1]
 * @param {string} [options.message="Successfully got payment list"]
 * @param {Array} [options.data=[]]
 * @returns {Object}
 */
export const createCommonPaymentListResponse = ({
  status = 1,
  message = "Successfully got payment list",
  data = [],
} = {}) => {
  return {
    status,
    message,
    data: data.map((item) => createCommonPaymentItem(item)),
  };
};
