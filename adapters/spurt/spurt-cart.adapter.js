import axiosInstance from "./spurt-client.js";
import { createCommonAddToCartResponse } from "../models/schemas/cart.interface.js";
import { getClientAuthToken, getValidAuthToken } from "../../utilities/tokenHelper.js";

export class SpurtCartAdapter {
  /**
   * Resolves valid authentication token from localStorage or cookies
   * @returns {string}
   */
  getToken() {
    if (typeof window === "undefined") {
      return getValidAuthToken(getClientAuthToken());
    }
    try {
      const local =
        localStorage.getItem("BearerToken") ||
        localStorage.getItem("token") ||
        "";
      const clean = getValidAuthToken(local);
      if (clean) return clean;
      const cookieMatch = document.cookie
        .split("; ")
        .find((row) => row.startsWith("BearerToken=") || row.startsWith("token="));
      if (cookieMatch) {
        return getValidAuthToken(decodeURIComponent(cookieMatch.split("=")[1] || ""));
      }
    } catch (e) {}
    return "";
  }

  /**
   * Adds an item to the cart using Spurt B2C API
   * @param {Object} payload
   * @param {Object} [datacart]
   * @returns {Promise<Object>}
   */
  async addToCart(payload, datacart = {}) {
    const token = this.getToken();
    if (!token) {
      return createCommonAddToCartResponse({
        status: 0,
        message: "User not logged in",
        data: null,
      });
    }

    try {
      const resolvedProductPrice = Number(
        payload?.productPrice ?? datacart?.productPrice ?? datacart?.price ?? 0
      );

      const resolvedType =
        datacart?.productType ??
        payload?.productType ??
        datacart?.product_type ??
        payload?.product_type ??
        (payload?.type && payload?.type !== "new" && payload?.type !== "physical" ? payload?.type : null) ??
        datacart?.type ??
        payload?.type ??
        "";

      const resolvedProductId = Number(payload?.productId ?? datacart?.productId);
      const resolvedSkuId = Number(payload?.skuId ?? datacart?.skuId ?? resolvedProductId);
      const resolvedTirePrice = Number(payload?.tirePrice ?? datacart?.tirePrice ?? 0);
      const resolvedQty = Number(payload?.quantity ?? 1);

      const dataStr = JSON.stringify({
        cartDetails: [
          {
            productId: resolvedProductId,
            productPrice: resolvedProductPrice,
            tirePrice: resolvedTirePrice,
            quantity: resolvedQty,
            skuId: resolvedSkuId,
            type: resolvedType || "physical",
          },
        ],
      });

      const result = await axiosInstance.post("cart", dataStr);

      if (result && result.data && result.data.status === 1) {
        return result.data;
      }

      return createCommonAddToCartResponse({
        status: 0,
        message: result?.data?.message || "Failed to add item to Spurt cart",
        data: null,
      });
    } catch (error) {
      console.error("SpurtCartAdapter addToCart error:", error);
      return createCommonAddToCartResponse({
        status: 0,
        message: error?.message || "Error connecting to Spurt Cart API",
        data: null,
      });
    }
  }

  /**
   * Retrieves cart list using Spurt B2C API
   * @returns {Promise<Object>}
   */
  async getCartList() {
    let localItems = [];
    if (typeof window !== "undefined") {
      try {
        localItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
        if (!Array.isArray(localItems)) localItems = [];
      } catch (_) {
        localItems = [];
      }
    }

    const token = this.getToken();
    if (!token) {
      const grandTotal = localItems.reduce(
        (sum, it) =>
          sum +
          (Number(it.productPrice || it.price || 0) *
            Number(it.productCount || it.quantity || 1)),
        0,
      );
      return {
        status: 1,
        message: "Guest cart",
        data: {
          cartList: localItems,
          grandTotal,
        },
      };
    }

    try {
      const result = await axiosInstance.get("cart");
      if (result && result.data) {
        if (
          result.data.status === 0 &&
          (result.data.message?.toLowerCase().includes("unauthorized") ||
            result.data.message?.toLowerCase().includes("token"))
        ) {
          const grandTotal = localItems.reduce(
            (sum, it) =>
              sum +
              (Number(it.productPrice || it.price || 0) *
                Number(it.productCount || it.quantity || 1)),
            0,
          );
          return {
            status: 1,
            message: "Local cart",
            data: {
              cartList: localItems,
              grandTotal,
            },
          };
        }

        const items = Array.isArray(result.data?.data?.cartList)
          ? result.data.data.cartList
          : Array.isArray(result.data?.cartList)
          ? result.data.cartList
          : Array.isArray(result.data?.data)
          ? result.data.data
          : [];

        if (items.length > 0) {
          return result.data;
        }

        // When logged in with a valid token, do NOT fall back to localItems
        return {
          status: 1,
          message: "Successfully got the cart list",
          data: {
            cartList: [],
            grandTotal: 0,
          },
        };
      }
      return {
        status: 1,
        message: "Successfully got the cart list",
        data: {
          cartList: [],
          grandTotal: 0,
        },
      };
    } catch (error) {
      return {
        status: 1,
        message: "Successfully got the cart list",
        data: {
          cartList: [],
          grandTotal: 0,
        },
      };
    }
  }

  /**
   * Updates item quantity in Spurt cart
   * @param {string|number} itemId
   * @param {number} quantity
   * @param {Object} [options]
   * @returns {Promise<Object>}
   */
  async updateItemQuantity(itemId, quantity, options = {}) {
    try {
      const resolvedProductId = Number(options?.productId || itemId);
      const resolvedSkuId = Number(options?.skuId || resolvedProductId);
      const resolvedPrice = Number(options?.productPrice ?? options?.price ?? 0);
      const resolvedQty = Number(quantity);
      const resolvedTirePrice = Number(options?.tirePrice || 0);
      const resolvedType =
        options?.productType ||
        options?.product_type ||
        (options?.type && options?.type !== "new" && options?.type !== "physical"
          ? options?.type
          : null) ||
        options?.type ||
        "physical";

      const dataStr = JSON.stringify({
        cartDetails: [
          {
            productId: resolvedProductId,
            productPrice: resolvedPrice,
            tirePrice: resolvedTirePrice,
            quantity: resolvedQty,
            skuId: resolvedSkuId,
            type: resolvedType,
          },
        ],
      });

      const response = await axiosInstance.post("cart", dataStr);
      return response?.data || { status: 1 };
    } catch (error) {
      console.error("SpurtCartAdapter updateItemQuantity error:", error);
      return { status: 0, message: error?.message || "Failed to update item quantity" };
    }
  }

  /**
   * Removes item from Spurt cart using DELETE cart/delete-cart-item with payload { cartId: cartList?.id }
   * @param {string|number} itemId
   * @param {Object} [options]
   * @returns {Promise<Object>}
   */
  async removeItem(itemId, options = {}) {
    try {
      const resolvedCartId = options?.cartId ?? options?.id ?? itemId;
      const response = await axiosInstance.delete("cart/delete-cart-item", {
        data: { cartId: String(resolvedCartId) },
      });
      return response?.data || { status: 1 };
    } catch (error) {
      console.error("SpurtCartAdapter removeItem error:", error);
      return { status: 0, message: error?.message || "Failed to remove item" };
    }
  }

  /**
   * Fetches price group details for SKU in Spurt
   * @param {string} sku
   * @returns {Promise<Array>}
   */
  async getPriceGroupList(sku) {
    try {
      const result = await axiosInstance.get(`price-group-detail/sku/${sku}`);
      if (result?.data?.status === 1 && Array.isArray(result?.data?.data)) {
        return result.data.data.sort((a, b) => a.maxQuantity - b.maxQuantity);
      }
      return [];
    } catch {
      return [];
    }
  }
}

