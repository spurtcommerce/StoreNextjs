/**
 * Creates a normalized Address Item DTO matching Spurt & Medusa customer address schemas
 * @param {Object} partial
 * @returns {Object}
 */
export const createCommonAddressItem = (partial = {}) => {
  const isIndia =
    partial.country_code === "in" ||
    partial.country_code === "IN" ||
    partial.countryId === 99;

  return {
    createdBy: partial.createdBy ?? null,
    createdDate: partial.createdDate ?? new Date().toISOString(),
    modifiedBy: partial.modifiedBy ?? null,
    modifiedDate: partial.modifiedDate ?? new Date().toISOString(),
    addressId: partial.addressId ?? partial.id ?? 1,
    customerId: partial.customerId ?? partial.customer_id ?? 1,
    countryId: partial.countryId ?? (isIndia ? 99 : 1),
    zoneId: partial.zoneId ?? 76,
    firstName: partial.firstName ?? partial.first_name ?? "",
    lastName: partial.lastName ?? partial.last_name ?? "",
    company: partial.company ?? "",
    address1: partial.address1 ?? partial.address_1 ?? "",
    address2: partial.address2 ?? partial.address_2 ?? "",
    postcode: partial.postcode ?? partial.postal_code ?? "",
    city: partial.city ?? "",
    state: partial.state ?? partial.province ?? "",
    emailId: partial.emailId ?? partial.email ?? null,
    phoneNo: partial.phoneNo ?? partial.phone ?? "",
    addressType: partial.addressType ?? 0,
    isActive: partial.isActive ?? 1,
    landmark: partial.landmark ?? "",
    isDefault: partial.isDefault ?? partial.is_default ?? 0,
    zone: partial.zone ?? {
      createdBy: null,
      createdDate: new Date().toISOString(),
      modifiedBy: null,
      modifiedDate: null,
      zoneId: partial.zoneId ?? 76,
      countryId: partial.countryId ?? (isIndia ? 99 : 1),
      code: partial.zoneCode ?? "TN",
      name: partial.state ?? partial.province ?? "Tamil Nadu",
      isActive: 1,
    },
    ...partial,
  };
};

/**
 * Creates a normalized CommonAddressListResponse DTO
 * @param {Object} options
 * @param {number} [options.status=1]
 * @param {string} [options.message="Successfully Get the customer Address"]
 * @param {Array} [options.customerAddress=[]]
 * @returns {Object}
 */
export const createCommonAddressListResponse = ({
  status = 1,
  message = "Successfully Get the customer Address",
  customerAddress = [],
} = {}) => {
  const mapped = customerAddress.map((item) => createCommonAddressItem(item));
  return {
    status,
    message,
    customerAddress: mapped,
    data: {
      customerAddress: mapped,
    },
  };
};
