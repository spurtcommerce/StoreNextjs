import axiosInstance from "./spurt-client.js";
import { createCommonCheckoutResponse } from "../models/schemas/checkout.interface.js";

export class SpurtCheckoutAdapter {
  /**
   * Completes checkout using Spurt Commerce API
   * @param {Object|string} payload Spurt checkout payload
   * @param {Object} [options] Additional options (headers, currency, etc.)
   * @returns {Promise<Object>} Normalized checkout response
   */
  async completeCheckout(payload, options = {}) {
    try {
      let data = payload;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch (e) {}
      }

      const headers = {};
      if (options?.currentCurrency) {
        headers["x-currency"] = options.currentCurrency;
      }

      // Check if this is a backorder checkout
      const isBackOrder = Boolean(
        data?.isBackOrder ||
        (Array.isArray(data?.productDetails) &&
          data.productDetails.some(
            (item) =>
              Number(item?.enableBackOrders) === 1 ||
              (item?.hasStock !== undefined && Number(item?.hasStock) === 0)
          ))
      );

      let response;
      if (isBackOrder) {
        // Construct backorder payload ensuring required fields are present
        const backOrderPayload = {
          shippingFirstName: data?.shippingFirstName || data?.paymentFirstName || "",
          shippingLastName: data?.shippingLastName || data?.paymentLastName || "",
          shippingCity: data?.shippingCity || data?.paymentCity || "",
          shippingPostCode: (data?.shippingPostCode || data?.paymentPostCode || "")?.toString(),
          shippingZone: data?.shippingZone || data?.paymentZone || data?.shippingCity || "",
          phoneNumber: (data?.phoneNumber || data?.paymentMobileNumber || "")?.toString(),
          shippingAddress_1: data?.shippingAddress_1 || data?.paymentAddress_1 || "",
          shippingAddress_2: data?.shippingAddress_2 || data?.paymentAddress_2 || "",
          emailId: data?.emailId || "",
          shippingCountryId: data?.shippingCountryId || data?.paymentCountryId,
          productDetails: data?.productDetails?.map((item) => {
            const requested = Number(item?.quantity) || Number(item?.productCount) || 1;
            const maxBackOrder = Number(item?.availableBackOrderStock);
            const finalQty = (!isNaN(maxBackOrder) && maxBackOrder > 0) ? Math.min(requested, maxBackOrder) : requested;
            return {
              ...item,
              quantity: finalQty,
              productCount: finalQty,
            };
          }),
          paymentMethod: data?.paymentMethod || 1,
          shippingCompany: data?.shippingCompany || data?.shippingFirstName || "",
        };

        response = await axiosInstance.post(
          "orders/back-order-checkout",
          backOrderPayload,
          { headers }
        );
      } else {
        const customerCheckoutData = {
          ...data,
          productDetails: Array.isArray(data?.productDetails)
            ? data.productDetails.map((item) => {
                const qty = Number(item?.quantity) || Number(item?.productCount) || 1;
                return {
                  ...item,
                  quantity: qty,
                  productCount: qty,
                };
              })
            : data?.productDetails,
        };

        response = await axiosInstance.post(
          "orders/customer-checkout",
          customerCheckoutData,
          { headers }
        );
      }

      if (response && response.data) {
        return response.data;
      }

      return createCommonCheckoutResponse({
        status: 0,
        message: "Failed to place order via Spurt",
        data: null,
      });
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Error placing order via Spurt";
      console.warn("SpurtCheckoutAdapter completeCheckout warning:", errorMsg);
      return createCommonCheckoutResponse({
        status: 0,
        message: errorMsg,
        data: null,
      });
    }
  }
}

