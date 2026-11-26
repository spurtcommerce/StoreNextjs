import axiosInstance from "./spurt-client.js";
import { OrdersApiEndPoints } from "../../api/apiEndpoints.js";
import {
  createCommonOrderListResponse,
  createCommonOrderDetailResponse,
} from "../models/schemas/order.interface.js";
import { getClientAuthToken } from "../../utilities/tokenHelper.js";

export class SpurtOrderAdapter {
  /**
   * Fetches order list or count from Spurt B2C API
   * @param {Object} [params]
   * @returns {Promise<Object>}
   */
  async getOrderList(params = {}) {
    const isCountOnly =
      params?.count == 1 || params?.count === true || params?.count === "1";
    try {
      const token = getClientAuthToken();
      if (!token) {
        return createCommonOrderListResponse({
          status: 1,
          message: "Guest user",
          data: isCountOnly ? 0 : [],
        });
      }

      const endpoint = OrdersApiEndPoints?.getOrderList || "orders/order-list";
      const { data } = await axiosInstance.get(endpoint, {
        params: params,
      });

      if (data && data.status == 1) {
        return data;
      }

      return createCommonOrderListResponse({
        status: 0,
        message: data?.message || "Failed to fetch orders from Spurt API",
        data: isCountOnly ? 0 : [],
      });
    } catch (error) {
      console.error("SpurtOrderAdapter.getOrderList error:", error);
      return createCommonOrderListResponse({
        status: 0,
        message: error?.message || "Error connecting to Spurt API",
        data: isCountOnly ? 0 : [],
      });
    }
  }

  /**
   * Fetches order details from Spurt B2C API
   * @param {string|number} orderId
   * @param {Object} [params]
   * @returns {Promise<Object>}
   */
  async getOrderDetails(orderId, params = {}) {
    try {
      const token = getClientAuthToken();
      if (!token) {
        return createCommonOrderDetailResponse({
          status: 0,
          message: "Guest user - order details not available without authentication in Spurt",
          data: null,
        });
      }

      const basePath =
        OrdersApiEndPoints?.getOrdeerDetails || "orders/order-detail";
      let res;
      try {
        res = await axiosInstance.get(`${basePath}/${orderId}`, {
          params,
        });
      } catch (err1) {
        res = await axiosInstance.get(basePath, {
          params: { orderProductId: orderId, ...params },
        });
      }

      const data = res?.data;
      if (data && data.status == 1) {
        return data;
      }

      return createCommonOrderDetailResponse({
        status: 0,
        message: data?.message || "Failed to fetch order detail from Spurt API",
        data: null,
      });
    } catch (error) {
      console.error("SpurtOrderAdapter.getOrderDetails error:", error);
      return createCommonOrderDetailResponse({
        status: 0,
        message: error?.message || "Error connecting to Spurt API",
        data: null,
      });
    }
  }

  /**
   * Downloads invoice PDF blob (with clean fallback PDF generation if API returns non-PDF)
   * @param {Object} params
   * @returns {Promise<boolean>}
   */
  async downloadInvoice(params) {
    const triggerPdfDownload = (blob, fileName) => {
      const pdfBlob =
        blob.type === "application/pdf"
          ? blob
          : new Blob([blob], { type: "application/pdf" });
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    };

    const buildFallbackPdfBlob = (order) => {
      const esc = (s) =>
        String(s ?? "")
          .replace(/[^\x20-\x7E]/g, " ")
          .replace(/\\/g, "\\\\")
          .replace(/\(/g, "\\(")
          .replace(/\)/g, "\\)");

      const orderRef = order?.orderPrefixId || order?.orderId || params?.orderPrefixId || params?.orderId || "ORDER";
      const created = order?.createdDate ? String(order.createdDate).slice(0, 10) : new Date().toISOString().slice(0, 10);
      const status = order?.orderStatusName || "Open";
      const payment = order?.paymentType || "Online";
      const products = Array.isArray(order?.orderProducts) ? order.orderProducts : [];

      const lines = [
        { text: "INVOICE", size: 18, bold: true },
        { text: `Order Reference: ${orderRef}`, size: 11 },
        { text: `Order Date: ${created}   |   Status: ${status}   |   Payment: ${payment}`, size: 10 },
        { text: `Customer: ${order?.shippingFirstname || ""} ${order?.shippingLastname || ""}`.trim(), size: 10 },
        {
          text: `Shipping: ${[order?.shippingAddress1, order?.shippingCity, order?.shippingZone, order?.shippingCountry, order?.shippingPostcode].filter(Boolean).join(", ")}`,
          size: 9,
        },
        { text: "--------------------------------------------------------------------------------", size: 9 },
        { text: "Item                                                      Qty        Total", size: 10, bold: true },
        { text: "--------------------------------------------------------------------------------", size: 9 },
      ];

      products.forEach((p, idx) => {
        const name = String(p?.productNameTrans || p?.name || `Item ${idx + 1}`).slice(0, 48);
        const qty = Number(p?.quantity || 1);
        const total = Number(p?.total || Number(p?.productPrice || 0) * qty).toFixed(2);
        lines.push({
          text: `${name.padEnd(52, " ")} ${String(qty).padStart(4, " ")}   ${total.padStart(10, " ")}`,
          size: 9,
        });
      });

      const subTotal = Number(order?.subTotal ?? order?.total ?? 0).toFixed(2);
      const totalAmt = Number(order?.total ?? 0).toFixed(2);
      lines.push({ text: "--------------------------------------------------------------------------------", size: 9 });
      lines.push({ text: `Subtotal: ${subTotal}`, size: 10 });
      lines.push({ text: `Grand Total: ${totalAmt}`, size: 12, bold: true });

      let y = 760;
      const streamParts = ["BT"];
      lines.forEach((l) => {
        streamParts.push(`/F1 ${l.size} Tf`);
        streamParts.push(`1 0 0 1 48 ${y} Tm (${esc(l.text)}) Tj`);
        y -= l.size + 6;
      });
      streamParts.push("ET");
      const stream = streamParts.join("\n");

      const objects = [
        "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n",
        "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n",
        "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n",
        `4 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj\n`,
        "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Courier >> endobj\n",
      ];

      let pdf = "%PDF-1.4\n";
      const offsets = [0];
      objects.forEach((obj) => {
        offsets.push(pdf.length);
        pdf += obj;
      });
      const xrefOffset = pdf.length;
      pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
      for (let i = 1; i < offsets.length; i++) {
        pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
      }
      pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

      return new Blob([pdf], { type: "application/pdf" });
    };

    const orderRef = params?.orderPrefixId || params?.orderId || Date.now();
    const fileName = `invoice-${orderRef}.pdf`;

    try {
      const endpoint = OrdersApiEndPoints?.invoice || "orders/order-export-pdf";
      const queryParams = {};
      if (params?.orderId) queryParams.orderId = params.orderId;
      if (params?.orderPrefixId) queryParams.orderPrefixId = params.orderPrefixId;

      const response = await axiosInstance.get(endpoint, {
        params: queryParams,
        responseType: "blob",
      });

      const blob = response?.data instanceof Blob ? response.data : new Blob([response?.data || ""]);
      const head = await blob.slice(0, 5).text();

      if (head === "%PDF-") {
        triggerPdfDownload(blob, fileName);
        return true;
      }

      if (blob.type?.includes("json") || head.trim().startsWith("{")) {
        const text = await blob.text();
        try {
          const parsed = JSON.parse(text);
          const payloadStr = typeof parsed?.data === "string" ? parsed.data : "";
          if (payloadStr.startsWith("data:application/pdf;base64,") || payloadStr.startsWith("JVBERi0")) {
            const b64 = payloadStr.replace(/^data:application\/pdf;base64,/, "");
            const bin = atob(b64);
            const bytes = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
            triggerPdfDownload(new Blob([bytes], { type: "application/pdf" }), fileName);
            return true;
          }
        } catch {}
      }

      if (params?.orderDetails) {
        triggerPdfDownload(buildFallbackPdfBlob(params.orderDetails), fileName);
        return true;
      }
      return false;
    } catch (error) {
      console.error("SpurtOrderAdapter downloadInvoice error:", error);
      if (params?.orderDetails) {
        triggerPdfDownload(buildFallbackPdfBlob(params.orderDetails), fileName);
        return true;
      }
      return false;
    }
  }

  /**
   * Places a back-order checkout
   * @param {Object} data
   * @param {string} currentCurrency
   * @returns {Promise<Object>}
   */
  async backOrderCheckout(data, currentCurrency) {
    try {
      const result = await axiosInstance.post(`orders/back-order-checkout`, data, {
        headers: {
          "x-currency": currentCurrency,
        },
      });
      return result?.data || { status: 0, message: "Failed to place back-order." };
    } catch (error) {
      return {
        status: 0,
        message: error?.response?.data?.message || error?.message || "An error occurred while placing your back-order.",
      };
    }
  }

  /**
   * Tracks an order product
   * @param {string|number} orderProductId
   * @returns {Promise<Object>}
   */
  async trackOrder(orderProductId) {
    try {
      const result = await axiosInstance.get(
        `orders/track-order-product?orderProductId=${orderProductId}`
      );
      return result?.data || { status: 0, data: null };
    } catch (error) {
      return { status: 0, data: null };
    }
  }

  /**
   * Fetches failed orders or count
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async getFailedOrders(params = {}) {
    try {
      const limit = params.limit ?? 5;
      const offset = params.offset ?? 0;
      const count = params.count ?? 0;
      const keyword = params.keyword ?? "";
      const result = await axiosInstance.get(
        `orders/failed?limit=${limit}&offset=${offset}&count=${count}&keyword=${keyword}`
      );
      return result?.data || { status: 0, data: count == 1 ? 0 : [] };
    } catch (error) {
      return { status: 0, data: params.count == 1 ? 0 : [] };
    }
  }

  /**
   * Cancels an order product
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async cancelOrder(data) {
    try {
      const result = await axiosInstance.post(`orders/order-cancel-request`, data);
      return result?.data || { status: 1 };
    } catch (error) {
      return { status: 0, message: error?.message };
    }
  }

  /**
   * Retrieves list of cancel reasons
   * @returns {Promise<Array>}
   */
  async getCancelReasons() {
    try {
      const result = await axiosInstance.get(
        "orders/order-cancel-reason-list?limit=0&offset=0&count=0"
      );
      if (result?.data?.data && Array.isArray(result.data.data)) {
        return result.data.data.map((d) => ({
          label: d.reason,
          value: d.id,
        }));
      }
      return [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Retries payment for a failed order
   * @param {Object} paymentdata
   * @param {string} currentCurrency
   * @returns {Promise<Object>}
   */
  async retryPayment(paymentdata, currentCurrency) {
    try {
      const result = await axiosInstance.put(`orders/retry-payment`, paymentdata, {
        headers: {
          "x-currency": currentCurrency,
        },
      });
      return result?.data || { status: 0 };
    } catch (error) {
      return { status: 0, message: error?.message };
    }
  }

  /**
   * Retrieves currency list
   * @returns {Promise<Array>}
   */
  async getCurrencies() {
    try {
      const result = await axiosInstance.get(`list/currency`);
      if (result?.data?.status == 1 && Array.isArray(result.data.data)) {
        return result.data.data;
      }
      return [{ code: "INR", symbol: "₹" }];
    } catch (error) {
      return [{ code: "INR", symbol: "₹" }];
    }
  }
}
