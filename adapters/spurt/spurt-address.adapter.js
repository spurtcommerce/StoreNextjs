import axiosInstance from "./spurt-client.js";
import { createCommonAddressListResponse } from "../models/schemas/address.interface.js";

let inFlightCustomerAddressPromise = null;
let cachedCustomerAddressList = null;
let customerAddressCacheTime = 0;
const ADDRESS_CACHE_TTL = 30000; // 30 seconds

let inFlightCountryPromise = null;
let cachedCountryList = null;

export const clearSpurtAddressCache = () => {
  cachedCustomerAddressList = null;
  customerAddressCacheTime = 0;
  inFlightCustomerAddressPromise = null;
};

export class SpurtAddressAdapter {
  /**
   * Fetches customer address list from Spurt Commerce backend
   * @param {Object} [params]
   * @returns {Promise<Object>} Normalized address list response
   */
  async getCustomerAddresses(params = {}) {
    const now = Date.now();
    if (
      !params?.force &&
      cachedCustomerAddressList &&
      now - customerAddressCacheTime < ADDRESS_CACHE_TTL
    ) {
      return cachedCustomerAddressList;
    }

    if (inFlightCustomerAddressPromise) {
      return inFlightCustomerAddressPromise;
    }

    inFlightCustomerAddressPromise = (async () => {
      try {
        const response = await axiosInstance.get("customer-address");

        if (response?.data?.status === 1 && response?.data?.data?.customerAddress) {
          const result = createCommonAddressListResponse({
            status: 1,
            message: response.data.message || "Successfully Get the customer Address",
            customerAddress: response.data.data.customerAddress,
          });
          cachedCustomerAddressList = result;
          customerAddressCacheTime = Date.now();
          return result;
        }

        const result = createCommonAddressListResponse({
          status: response?.data?.status ?? 0,
          message: response?.data?.message || "Failed to fetch customer addresses",
          customerAddress: [],
        });
        return result;
      } catch (error) {
        console.error("SpurtAddressAdapter.getCustomerAddresses error:", error);
        return createCommonAddressListResponse({
          status: 0,
          message: error?.response?.data?.message || error?.message || "Error fetching customer addresses",
          customerAddress: [],
        });
      } finally {
        inFlightCustomerAddressPromise = null;
      }
    })();

    return inFlightCustomerAddressPromise;
  }

  /**
   * Adds a new customer address via Spurt
   * @param {Object|string} payload Address details
   * @returns {Promise<Object>}
   */
  async addAddress(payload) {
    try {
      clearSpurtAddressCache();
      let data = payload;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch (e) {}
      }
      const response = await axiosInstance.post("customer-address", data);
      clearSpurtAddressCache();
      return response?.data || { status: 1, message: "Address added" };
    } catch (error) {
      console.error("SpurtAddressAdapter.addAddress error:", error);
      return {
        status: 0,
        message: error?.response?.data?.message || error?.message || "Failed to add address",
      };
    }
  }

  /**
   * Updates a customer address via Spurt
   * @param {string|number} addressId
   * @param {Object|string} payload
   * @returns {Promise<Object>}
   */
  async updateAddress(addressId, payload) {
    try {
      clearSpurtAddressCache();
      let data = payload;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch (e) {}
      }
      const response = await axiosInstance.put(`customer-address/${addressId}`, data);
      clearSpurtAddressCache();
      return response?.data || { status: 1, message: "Address updated successfully" };
    } catch (error) {
      console.error("SpurtAddressAdapter.updateAddress error:", error);
      return {
        status: 0,
        message: error?.response?.data?.message || error?.message || "Failed to update address",
      };
    }
  }

  /**
   * Deletes a customer address via Spurt
   * @param {string|number} addressId
   * @returns {Promise<Object>}
   */
  async deleteAddress(addressId) {
    try {
      clearSpurtAddressCache();
      const response = await axiosInstance.delete(`customer-address/${addressId}`);
      clearSpurtAddressCache();
      return response?.data || { status: 1, message: "Address deleted successfully" };
    } catch (error) {
      console.error("SpurtAddressAdapter.deleteAddress error:", error);
      return {
        status: 0,
        message: error?.response?.data?.message || error?.message || "Failed to delete address",
      };
    }
  }

  /**
   * Fetches country list from Spurt Commerce backend
   * @returns {Promise<Object>}
   */
  async getCountryList() {
    if (cachedCountryList && Array.isArray(cachedCountryList?.data) && cachedCountryList.data.length > 0) {
      return cachedCountryList;
    }

    if (inFlightCountryPromise) {
      return inFlightCountryPromise;
    }

    inFlightCountryPromise = (async () => {
      try {
        const response = await axiosInstance.get("store-list/country-list");
        if (response?.data?.status == 1 && Array.isArray(response?.data?.data) && response.data.data.length > 0) {
          cachedCountryList = response.data;
          return response.data;
        }
        const { getStoreCountryList } = await import("@/adapters/models/registry/store-adapter.helper");
        const fallbackList = getStoreCountryList();
        if (Array.isArray(fallbackList) && fallbackList.length > 0) {
          return { status: 1, message: "Country list", data: fallbackList };
        }
        return response?.data || { status: 0, data: [] };
      } catch (error) {
        console.warn("SpurtAddressAdapter.getCountryList fallback:", error?.message || error);
        try {
          const { getStoreCountryList } = await import("@/adapters/models/registry/store-adapter.helper");
          const fallbackList = getStoreCountryList();
          if (Array.isArray(fallbackList) && fallbackList.length > 0) {
            return { status: 1, message: "Country list", data: fallbackList };
          }
        } catch (_) {}
        return { status: 0, data: [] };
      } finally {
        inFlightCountryPromise = null;
      }
    })();

    return inFlightCountryPromise;
  }

  /**
   * Fetches state / zone list from Spurt Commerce backend
   * @param {string|Object} queryParams
   * @returns {Promise<Object>}
   */
  async getStateList(queryParams) {
    try {
      const query =
        typeof queryParams === "object" && queryParams !== null
          ? new URLSearchParams(queryParams).toString()
          : queryParams || "";
      const response = await axiosInstance.get(`store-list/zone?${query}`);
      return response?.data?.status == 1 ? response.data : { status: 0, data: [] };
    } catch (error) {
      console.error("SpurtAddressAdapter.getStateList error:", error);
      return { status: 0, data: [] };
    }
  }

  /**
   * Fetches a single customer address by ID via Spurt
   * @param {string|number} addressId
   * @returns {Promise<Object>}
   */
  async getAddressById(addressId) {
    try {
      const response = await axiosInstance.get(`customer-address/${addressId}`);
      return response?.data?.status == 1 ? response.data : { status: 0, data: {} };
    } catch (error) {
      console.error("SpurtAddressAdapter.getAddressById error:", error);
      return { status: 0, data: {} };
    }
  }
}

