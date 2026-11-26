import axiosInstance from "./spurt-client.js";
import { authenticationApiEndpoints } from "../../api/apiEndpoints.js";
import { createCommonLoginResponse } from "../models/schemas/auth.interface.js";

let inFlightProfilePromise = null;
let cachedProfileData = null;
let profileCacheTime = 0;
const PROFILE_CACHE_TTL = 30000; // 30 seconds

export const clearSpurtAuthProfileCache = () => {
  cachedProfileData = null;
  profileCacheTime = 0;
  inFlightProfilePromise = null;
};

export class SpurtAuthAdapter {
  /**
   * Performs customer login with Spurt B2C API
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  async login(payload) {
    try {
      const { data } = await axiosInstance.post(
        authenticationApiEndpoints?.customerEmailLogin || "customer/login",
        payload
      );

      if (data && data.status === 1) {
        return data;
      }

      return createCommonLoginResponse({
        status: 0,
        message: data?.message || "Login failed",
        data: null,
      });
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        (error?.code === "ECONNABORTED" || error?.message?.includes("timeout")
          ? "Login request timed out. Please try again."
          : error?.message) ||
        "Error connecting to Auth API";
      console.warn("SpurtAuthAdapter login warning:", message);
      return createCommonLoginResponse({
        status: 0,
        message,
        data: null,
      });
    }
  }

  /**
   * Performs customer registration with Spurt B2C API
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  async register(payload) {
    try {
      const { data } = await axiosInstance.post(
        authenticationApiEndpoints?.customerSignup || "customer/register",
        payload
      );

      if (data && data.status === 1) {
        return data;
      }

      return {
        status: 0,
        message: data?.message || "Registration failed",
        data: null,
      };
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        (error?.code === "ECONNABORTED" || error?.message?.includes("timeout")
          ? "Registration request timed out. Please try again."
          : error?.message) ||
        "Error connecting to Register API";
      console.warn("SpurtAuthAdapter register warning:", message);
      return {
        status: 0,
        message,
        data: null,
      };
    }
  }

  /**
   * Fetches customer profile from Spurt B2C API
   * @param {string|boolean} [tokenOrForce]
   * @returns {Promise<Object>}
   */
  async getCustomerProfile(tokenOrForce) {
    let cleanToken = "";
    if (typeof tokenOrForce === "string" && tokenOrForce.trim()) {
      cleanToken = tokenOrForce.trim().replace(/^Bearer\s+/i, "").replace(/^["']+|["']+$/g, "").trim();
      if (cleanToken === "undefined" || cleanToken === "null") cleanToken = "";
    }
    if (!cleanToken && typeof window !== "undefined") {
      try {
        const match = document.cookie
          .split("; ")
          .find((row) => row.startsWith("BearerToken=") || row.startsWith("token=") || row.startsWith("medusa_auth_token="));
        if (match) {
          cleanToken = decodeURIComponent(match.split("=")[1] || "").trim().replace(/^Bearer\s+/i, "").replace(/^["']+|["']+$/g, "").trim();
          if (cleanToken === "undefined" || cleanToken === "null") cleanToken = "";
        }
        if (!cleanToken) {
          const ls = localStorage.getItem("BearerToken") || localStorage.getItem("token") || localStorage.getItem("medusa_auth_token") || "";
          cleanToken = ls.trim().replace(/^Bearer\s+/i, "").replace(/^["']+|["']+$/g, "").trim();
          if (cleanToken === "undefined" || cleanToken === "null") cleanToken = "";
        }
      } catch (_) {}
    }

    if (!cleanToken) {
      return { status: 0, message: "No authorization token provided", data: null };
    }

    const isForce = typeof tokenOrForce === "object" ? Boolean(tokenOrForce?.force) : Boolean(tokenOrForce === true);
    const now = Date.now();
    if (!isForce && cachedProfileData && now - profileCacheTime < PROFILE_CACHE_TTL) {
      return cachedProfileData;
    }
    if (inFlightProfilePromise) {
      return inFlightProfilePromise;
    }

    inFlightProfilePromise = (async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
          },
        };
        const { data } = await axiosInstance.get("customer-user-profile", config);
        if (data && (data.status === 1 || data.status === "1")) {
          if (typeof window !== "undefined") {
            try {
              const avatar = data?.data?.avatar || data?.data?.image || localStorage.getItem("customer_avatar");
              const avatarPath = data?.data?.avatarPath || data?.data?.imagePath || data?.data?.containerName || localStorage.getItem("customer_avatar_path") || "customer/";
              if (data?.data && avatar) {
                data.data.avatar = avatar;
                data.data.image = avatar;
                data.data.avatarPath = avatarPath;
                data.data.containerName = avatarPath;
              }
              if (data?.data?.customer && avatar) {
                data.data.customer.avatar = avatar;
                data.data.customer.image = avatar;
                data.data.customer.avatarPath = avatarPath;
                data.data.customer.containerName = avatarPath;
              }
            } catch {}
          }
          cachedProfileData = data;
          profileCacheTime = Date.now();
          return data;
        }
        return {
          status: 0,
          message: data?.message || "Failed to fetch profile",
          data: null,
        };
      } catch (error) {
        const status = error?.response?.status;
        const message = error?.response?.data?.message || error?.message || "Error fetching profile";
        if (status !== 502 && status !== 503 && status !== 504 && status !== 401) {
          console.warn("SpurtAuthAdapter getCustomerProfile error:", message);
        }
        return {
          status: 0,
          message,
          data: null,
        };
      } finally {
        inFlightProfilePromise = null;
      }
    })();

    return inFlightProfilePromise;
  }

  /**
   * Updates customer profile with Spurt B2C API
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  async updateCustomerProfile(payload) {
    try {
      const cleanPayload = { ...payload };
      const isDeleteImage = Boolean(payload?.deleteImage || payload?.avatar === "");

      const base64Image =
        !isDeleteImage &&
        typeof payload?.image === "string" && (payload.image.startsWith("data:image/") || payload.image.startsWith("data:"))
          ? payload.image
          : !isDeleteImage && typeof payload?.avatar === "string" && (payload.avatar.startsWith("data:image/") || payload.avatar.startsWith("data:"))
          ? payload.avatar
          : null;

      let newAvatar = null;
      let newAvatarPath = "customer/";
      let editProfileRes = null;

      if (base64Image || isDeleteImage || payload?.firstName || payload?.lastName || payload?.phoneNumber) {
        try {
          const editPayload = {
            firstName: payload?.firstName,
            lastName: payload?.lastName,
            emailId: payload?.emailId || payload?.email,
            phoneNumber: payload?.phoneNumber ? String(payload.phoneNumber) : "",
          };
          if (base64Image) {
            editPayload.image = base64Image;
          } else if (isDeleteImage) {
            editPayload.image = "";
          }
          if (payload?.address) editPayload.address = payload.address;
          if (payload?.address2) editPayload.address2 = payload.address2;
          if (payload?.city) editPayload.city = payload.city;
          if (payload?.pincode) editPayload.pincode = payload.pincode;
          if (payload?.stateId) editPayload.stateId = payload.stateId;
          if (payload?.countryId) editPayload.countryId = payload.countryId;

          const res = await axiosInstance.post("customer/edit-profile", editPayload);
          if (res?.data && (res.data.status === 1 || res.data.status === "1")) {
            editProfileRes = res.data;
            newAvatar = res.data?.data?.avatar || res.data?.avatar || null;
            newAvatarPath = res.data?.data?.avatarPath || res.data?.avatarPath || "customer/";
          }
        } catch (imgErr) {
          console.warn("SpurtAuthAdapter customer/edit-profile upload warning:", imgErr?.message);
        }
      }

      // Always remove base64 or invalid strings from image and avatar before calling customer-user-profile PUT
      delete cleanPayload.image;
      delete cleanPayload.deleteImage;
      if (cleanPayload.phoneNumber !== undefined && cleanPayload.phoneNumber !== null) {
        cleanPayload.phoneNumber = String(cleanPayload.phoneNumber);
        cleanPayload.mobileNumber = String(cleanPayload.phoneNumber);
      }

      if (isDeleteImage) {
        cleanPayload.avatar = "";
        cleanPayload.avatarPath = "";
      } else {
        // Spurt PUT /customer-user-profile validates avatar as a base64 data URI;
        // sending an existing filename (e.g. "Img_123.jpeg") triggers "Only PNG,png,jpg,jpeg,svg types are allowed".
        delete cleanPayload.avatar;
        delete cleanPayload.avatarPath;
      }

      let data = null;
      try {
        const res = await axiosInstance.put("customer-user-profile", cleanPayload);
        data = res?.data;
      } catch (putErr) {
        if (editProfileRes && (editProfileRes.status === 1 || editProfileRes.status === "1")) {
          data = editProfileRes;
        } else {
          throw putErr;
        }
      }

      const finalResult =
        data && (data.status === 1 || data.status === "1")
          ? data
          : editProfileRes || data;

      if (finalResult && (finalResult.status === 1 || finalResult.status === "1")) {
        clearSpurtAuthProfileCache();
        try {
          const fresh = await this.getCustomerProfile(true);
          if (fresh && (fresh.status === 1 || fresh.status === "1") && fresh.data) {
            finalResult.data = { ...(fresh.data || {}), ...(finalResult.data || {}) };
          }
        } catch {}
        cachedProfileData = finalResult;
        profileCacheTime = Date.now();
        if (isDeleteImage) {
          if (!finalResult.data) finalResult.data = {};
          finalResult.data.avatar = "";
          finalResult.data.avatarPath = "";
          if (finalResult.data.customer) {
            finalResult.data.customer.avatar = "";
            finalResult.data.customer.avatarPath = "";
          }
          if (typeof window !== "undefined") {
            try {
              localStorage.removeItem("customer_avatar");
              localStorage.removeItem("customer_avatar_path");
            } catch {}
          }
          return finalResult;
        }

        const returnedAvatar = newAvatar || finalResult?.data?.avatar || cleanPayload?.avatar;
        const returnedPath = newAvatarPath || finalResult?.data?.avatarPath || cleanPayload?.avatarPath || "customer/";

        if (returnedAvatar) {
          if (!finalResult.data) finalResult.data = {};
          finalResult.data.avatar = returnedAvatar;
          finalResult.data.image = returnedAvatar;
          finalResult.data.avatarPath = returnedPath;
          finalResult.data.containerName = returnedPath;
          if (finalResult.data.customer) {
            finalResult.data.customer.avatar = returnedAvatar;
            finalResult.data.customer.image = returnedAvatar;
            finalResult.data.customer.avatarPath = returnedPath;
            finalResult.data.customer.containerName = returnedPath;
          }
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("customer_avatar", returnedAvatar);
              localStorage.setItem("customer_avatar_path", returnedPath);
            } catch {}
          }
        }
        return finalResult;
      }
      return {
        status: 0,
        message: finalResult?.message || "Failed to update profile",
        data: null,
      };
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        (error?.code === "ECONNABORTED" || error?.message?.includes("timeout")
          ? "Update profile request timed out. Please try again."
          : error?.message) ||
        "Error updating profile";
      console.warn("SpurtAuthAdapter updateCustomerProfile warning:", message);
      return {
        status: 0,
        message,
        data: null,
      };
    }
  }

  /**
   * Performs customer logout with Spurt B2C API
   * @returns {Promise<Object>}
   */
  async logout() {
    clearSpurtAuthProfileCache();
    try {
      const { data } = await axiosInstance.post(
        authenticationApiEndpoints?.customerLogout || "customer/logout"
      );
      return data?.status === 1 ? data : { status: 1, message: "Logged out successfully" };
    } catch (error) {
      console.warn("SpurtAuthAdapter logout warning:", error?.message || "Logout failed");
      return { status: 1, message: "Logged out successfully" };
    }
  }

  async sendOtp(payload) {
    try {
      const { data } = await axiosInstance.post(
        authenticationApiEndpoints?.customerSendOtp,
        payload
      );
      return data || {};
    } catch (error) {
      console.warn("SpurtAuthAdapter sendOtp warning:", error?.message || "Send OTP failed");
      return {};
    }
  }

  async changePassword(payload) {
    try {
      const response = await axiosInstance.put(
        authenticationApiEndpoints?.changePassword,
        payload
      );
      return response?.data || response || {};
    } catch (error) {
      console.warn("SpurtAuthAdapter changePassword warning:", error?.message || "Change password failed");
      return error?.response?.data || {};
    }
  }

  async forgotPassword(payload) {
    try {
      const response = await axiosInstance.get(
        `${authenticationApiEndpoints?.forgotPassword}?email=${payload?.emailId || payload?.email || ""}`
      );
      return response?.data || response || {};
    } catch (error) {
      console.warn("SpurtAuthAdapter forgotPassword warning:", error?.message || "Forgot password failed");
      return error?.response?.data || {};
    }
  }

  async verifyAccount(token) {
    try {
      const response = await axiosInstance.get(
        `${authenticationApiEndpoints?.accountVerification}?key=${token}`
      );
      return response?.data || response || {};
    } catch (error) {
      console.warn("SpurtAuthAdapter verifyAccount warning:", error?.message || "Verify account failed");
      return error || {};
    }
  }

  async resetPassword(payload) {
    try {
      const response = await axiosInstance.put(
        authenticationApiEndpoints?.resetPassword,
        payload
      );
      return response?.data || response || {};
    } catch (error) {
      console.warn("SpurtAuthAdapter resetPassword warning:", error?.message || "Reset password failed");
      return error?.response?.data || {};
    }
  }
}

