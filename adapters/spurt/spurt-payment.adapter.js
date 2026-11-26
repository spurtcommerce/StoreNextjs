import axiosInstance from "./spurt-client.js";
import { createCommonPaymentListResponse } from "../models/schemas/payment.interface.js";

export class SpurtPaymentAdapter {
  /**
   * Fetches payment list from Spurt commerce backend
   * @param {Object} [params]
   * @returns {Promise<Object>} Normalized payment list response
   */
  async getPaymentList(params = {}) {
    try {
      const response = await axiosInstance.get(`store-list/payment?keyword=payment`, {
        params,
      });

      if (response?.data?.status === 1 && Array.isArray(response?.data?.data)) {
        return createCommonPaymentListResponse({
          status: 1,
          message: response.data.message || "Successfully got payment list",
          data: response.data.data,
        });
      }

      return createCommonPaymentListResponse({
        status: response?.data?.status ?? 0,
        message: response?.data?.message || "Failed to fetch payment list",
        data: [],
      });
    } catch (error) {
      console.error("SpurtPaymentAdapter.getPaymentList error:", error);
      return createCommonPaymentListResponse({
        status: 0,
        message: error?.message || "Error fetching payment list from Spurt",
        data: [],
      });
    }
  }
}
