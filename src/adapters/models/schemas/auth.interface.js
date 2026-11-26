/**
 * Default permission object for buyer customer
 */
export const DEFAULT_CUSTOMER_PERMISSIONS = {};

/**
 * Normalized Login Response builder DTO
 * @param {Object} options
 * @returns {Object}
 */
export const createCommonLoginResponse = ({
  status = 1,
  message = "Logged in Successfully",
  data = null,
} = {}) => {
  return {
    status,
    message,
    data,
  };
};

/**
 * Normalized Register Response builder DTO
 * @param {Object} options
 * @returns {Object}
 */
export const createCommonRegisterResponse = ({
  status = 1,
  message = "Successfully Created Registration",
  data = null,
} = {}) => {
  return {
    status,
    message,
    data,
  };
};

/**
 * Builds normalized Spurt customer profile DTO from Medusa /store/customers/me response object
 * @param {Object} customerObj Medusa customer object
 * @returns {Object} Spurt customer user profile response format
 */
export const createMedusaCustomerProfileDto = (customerObj) => {
  if (!customerObj) {
    return {
      status: 0,
      message: "Customer profile not found",
      data: null,
    };
  }

  const firstName =
    customerObj?.first_name ||
    customerObj?.firstName ||
    "";
  const lastName =
    customerObj?.last_name ||
    customerObj?.lastName ||
    "";
  const email = customerObj?.email || customerObj?.username || "";
  const phone =
    customerObj?.phone ||
    customerObj?.phoneNumber ||
    customerObj?.mobileNumber ||
    null;
  const customerId = customerObj?.id || 1;
  const createdAt = customerObj?.created_at || customerObj?.createdDate || new Date().toISOString();
  const updatedAt = customerObj?.updated_at || new Date().toISOString();

  let avatar =
    customerObj?.metadata?.avatar ||
    customerObj?.avatar ||
    customerObj?.metadata?.image ||
    customerObj?.image ||
    null;

  let avatarPath =
    customerObj?.metadata?.avatarPath ||
    customerObj?.avatarPath ||
    null;

  if (!avatar && typeof window !== "undefined") {
    try {
      avatar = localStorage.getItem("customer_avatar") || null;
      avatarPath = localStorage.getItem("customer_avatar_path") || null;
    } catch {}
  }

  return {
    status: 1,
    message: "Profile fetched successfully.",
    data: {
      createdDate: createdAt,
      id: customerId,
      customerUserGroupId: 1,
      username: email,
      firstName: firstName,
      lastName: lastName,
      email: email,
      avatar: avatar,
      avatarPath: avatarPath,
      address: null,
      phoneNumber: phone,
      mobileNumber: phone,
      isActive: 1,
      deleteFlag: 0,
      isSuperCustomer: 1,
      customerUserGroups: {
        createdDate: createdAt,
        id: 1,
        name: "Buyer",
        description:
          "Handles day-to-day purchasing, negotiates with suppliers, and ensures timely, cost-efficient procurement of goods and services.",
        slug: "buyer",
        isActive: 1,
        permission: JSON.stringify(DEFAULT_CUSTOMER_PERMISSIONS),
        roleType: "predefined",
        tenantId: 1,
        customerId: customerId,
      },
      customer: {
        createdDate: createdAt,
        id: customerId,
        firstName: firstName,
        lastName: lastName,
        gender: null,
        dob: null,
        username: email,
        email: email,
        mobileNumber: phone,
        phoneNumber: phone,
        address: null,
        countryId: null,
        zoneId: null,
        city: null,
        local: null,
        oauthData: null,
        avatar: avatar,
        avatarPath: avatarPath,
        lastLogin: updatedAt,
        pincode: null,
        linkExpires: null,
        lockedOn: null,
        siteId: 0,
        tenantId: 1,
        isVendor: 0,
        address2: null,
        landmark: null,
        mailOtp: null,
        mailOtpExpireTime: null,
        paymentTermId: null,
        companyName: customerObj?.company_name || customerObj?.companyName || "",
        taxNumber: "",
      },
    },
  };
};

