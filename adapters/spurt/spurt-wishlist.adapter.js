import axiosInstance from "./spurt-client.js";
import { createCommonWishlistResponse } from "../models/schemas/wishlist.interface.js";
import { getClientAuthToken } from "../../utilities/tokenHelper.js";

export class SpurtWishlistAdapter {
  /**
   * Resolves authentication token from localStorage or cookies
   * @returns {string}
   */
  getToken() {
    return getClientAuthToken();
  }

  /**
   * Fetches customer wishlist or count from Spurt B2C API
   * @param {Object} [params]
   * @returns {Promise<Object>}
   */
  async getWishlist(params = {}) {
    const isCountOnly =
      params?.count == 1 || params?.count === true || params?.count === "1";
    try {
      const token = this.getToken();
      if (!token) {
        return createCommonWishlistResponse({
          status: 1,
          message: "Guest user",
          data: isCountOnly ? 0 : [],
        });
      }

      const { limit = 5, offset = 0, count } = params;
      let endpoint = `customer/wishlist-product-list?limit=${limit}&offset=${offset}`;
      if (count !== undefined) {
        endpoint += `&count=${count}`;
      }

      const { data } = await axiosInstance.get(endpoint);

      if (data && data.status == 1) {
        return data;
      }

      // Spurt returns status 0 when wishlist is empty; normalize to status 1 with empty array or 0 count
      return createCommonWishlistResponse({
        status: 1,
        message: data?.message || "Wishlist is empty",
        data: isCountOnly ? 0 : [],
      });
    } catch (error) {
      if (error?.response?.status !== 401) {
        console.warn("SpurtWishlistAdapter.getWishlist warning:", error?.message || error);
      }
      return createCommonWishlistResponse({
        status: 1,
        message: error?.message || "Error connecting to Spurt API",
        data: isCountOnly ? 0 : [],
      });
    }
  }

  /**
   * Adds an item to Spurt customer wishlist
   * @param {string|number|Object} productIdOrData
   * @returns {Promise<Object>}
   */
  async addWishlistItem(productIdOrData) {
    const token = this.getToken();
    if (!token) {
      return {
        status: 0,
        message: "Please login to add to wishlist",
        data: null,
      };
    }

    try {
      const id =
        typeof productIdOrData === "object"
          ? productIdOrData.productId
          : productIdOrData;
      const requestData = {
        productId: id,
        productOptionValueId: "",
      };
      const { data } = await axiosInstance.post(
        `/customer/add-product-to-wishlist`,
        requestData
      );

      if (data && data.status == 1) {
        return data;
      }

      return {
        status: 0,
        message: data?.message || "Failed to add to wishlist",
      };
    } catch (error) {
      if (error?.response?.status !== 401) {
        console.error("SpurtWishlistAdapter.addWishlistItem error:", error);
      }
      return {
        status: 0,
        message:
          error?.response?.status === 401
            ? "Please login to add to wishlist"
            : error?.response?.data?.message || error?.message || "Error connecting to Spurt API",
      };
    }
  }

  /**
   * Removes an item from Spurt customer wishlist
   * @param {string|number|Object} idOrData
   * @returns {Promise<Object>}
   */
  async removeWishlistItem(idOrData) {
    const token = this.getToken();
    if (!token) {
      return {
        status: 0,
        message: "Please login to manage wishlist",
        data: null,
      };
    }

    try {
      let productId = null;
      let wishlistProductId = null;

      if (typeof idOrData === "object" && idOrData !== null) {
        productId = idOrData.productId;
        wishlistProductId = idOrData.wishlistProductId;
      } else {
        productId = idOrData;
      }

      // Spurt Commerce expects productId for deletion. Try productId first.
      const primaryId = productId || wishlistProductId;
      let response = await axiosInstance.delete(
        `/customer/wishlist-product-delete/${primaryId}`
      );
      let data = response?.data;

      // If primaryId returned "Invalid Product" or status 0, attempt secondaryId
      const secondaryId = primaryId === productId ? wishlistProductId : productId;
      if (
        secondaryId &&
        (data?.status == 0 ||
          (typeof data?.message === "string" &&
            data.message.toLowerCase().includes("invalid product")))
      ) {
        response = await axiosInstance.delete(
          `/customer/wishlist-product-delete/${secondaryId}`
        );
        data = response?.data;
      }

      const isSuccess =
        data &&
        (data.status == 1 ||
          (typeof data.message === "string" &&
            (data.message.toLowerCase().includes("success") ||
              data.message.toLowerCase().includes("deleted"))));

      if (isSuccess) {
        return {
          status: 1,
          message: data.message || "Removed from wishlist",
          data: data.data,
        };
      }

      return {
        status: data?.status ?? 0,
        message: data?.message || "Failed to remove from wishlist",
      };
    } catch (error) {
      if (error?.response?.status !== 401) {
        console.error("SpurtWishlistAdapter.removeWishlistItem error:", error);
      }
      return {
        status: 0,
        message:
          error?.response?.status === 401
            ? "Please login to manage wishlist"
            : error?.response?.data?.message || error?.message || "Error connecting to Spurt API",
      };
    }
  }

  /**
   * Fast check if a product is in wishlist
   * @param {string|number} productId
   * @returns {Promise<Object>}
   */
  async checkWishlistItem(productId) {
    try {
      const token = this.getToken();
      if (!token) {
        return { status: 1, in_wishlist: false, item_id: null };
      }
      const res = await this.getWishlist({ limit: 0, offset: 0 });
      if (res?.status === 1 && Array.isArray(res.data)) {
        const found = res.data.find(
          (i) =>
            String(i.productId) === String(productId) ||
            String(i.wishlistProductId) === String(productId)
        );
        return {
          status: 1,
          in_wishlist: Boolean(found),
          item_id: found ? found.wishlistProductId || found.productId : null,
        };
      }
      return { status: 1, in_wishlist: false, item_id: null };
    } catch {
      return { status: 1, in_wishlist: false, item_id: null };
    }
  }

  async isInWishlist(productId) {
    return this.checkWishlistItem(productId);
  }
}

