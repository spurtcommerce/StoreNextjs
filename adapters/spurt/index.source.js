import { SpurtAddressAdapter } from "./spurt-address.adapter.js";
import { SpurtAuthAdapter } from "./spurt-auth.adapter.js";
import { SpurtCartAdapter } from "./spurt-cart.adapter.js";
import { SpurtCategoryAdapter } from "./spurt-category.adapter.js";
import { SpurtCheckoutAdapter } from "./spurt-checkout.adapter.js";
import { SpurtOrderAdapter } from "./spurt-order.adapter.js";
import { SpurtPaymentAdapter } from "./spurt-payment.adapter.js";
import { SpurtProductAdapter } from "./spurt-product.adapter.js";
import { SpurtStoreAdapter } from "./spurt-store.adapter.js";
import { SpurtWishlistAdapter } from "./spurt-wishlist.adapter.js";

import {
  createCommonAddressItem,
  createCommonAddressListResponse,
} from "../models/schemas/address.interface.js";
import {
  createCommonLoginResponse,
  createCommonRegisterResponse,
  DEFAULT_CUSTOMER_PERMISSIONS,
} from "../models/schemas/auth.interface.js";
import {
  createCommonAddToCartResponse,
  createCommonCartLineItem,
} from "../models/schemas/cart.interface.js";
import {
  createCommonCategoryListResponse,
  createCommonCategoryRow,
} from "../models/schemas/category-list.interface.js";
import {
  createCommonCheckoutOrderData,
  createCommonCheckoutResponse,
} from "../models/schemas/checkout.interface.js";
import {
  createCommonOrderDetail,
  createCommonOrderDetailResponse,
  createCommonOrderListItem,
  createCommonOrderListResponse,
} from "../models/schemas/order.interface.js";
import {
  createCommonPaymentItem,
  createCommonPaymentListResponse,
} from "../models/schemas/payment.interface.js";
import {
  createCommonProductDetailResponse,
  createCommonProductListResponse,
  createCommonProductRow,
} from "../models/schemas/product-list.interface.js";
import {
  createCommonWishlistItem,
  createCommonWishlistResponse,
} from "../models/schemas/wishlist.interface.js";

export const capabilities = {
  reviews: true,
  relatedProducts: true,
  variants: true,
  downloads: true,
  specifications: true,
  banners: true,
  featuredProducts: true,
  collections: false,
};

export const schemas = {
  DEFAULT_CUSTOMER_PERMISSIONS,
  createCommonAddToCartResponse,
  createCommonAddressItem,
  createCommonAddressListResponse,
  createCommonCartLineItem,
  createCommonCategoryListResponse,
  createCommonCategoryRow,
  createCommonCheckoutOrderData,
  createCommonCheckoutResponse,
  createCommonLoginResponse,
  createCommonOrderDetail,
  createCommonOrderDetailResponse,
  createCommonOrderListItem,
  createCommonOrderListResponse,
  createCommonPaymentItem,
  createCommonPaymentListResponse,
  createCommonProductDetailResponse,
  createCommonProductListResponse,
  createCommonProductRow,
  createCommonRegisterResponse,
  createCommonWishlistItem,
  createCommonWishlistResponse,
};

export const definition = {
  name: "spurt",
  cart: SpurtCartAdapter,
  product: SpurtProductAdapter,
  productDetail: SpurtProductAdapter,
  category: SpurtCategoryAdapter,
  auth: SpurtAuthAdapter,
  address: SpurtAddressAdapter,
  checkout: SpurtCheckoutAdapter,
  payment: SpurtPaymentAdapter,
  order: SpurtOrderAdapter,
  wishlist: SpurtWishlistAdapter,
  store: SpurtStoreAdapter,
  capabilities,
  schemas,
};

export {
  SpurtAddressAdapter,
  SpurtAuthAdapter,
  SpurtCartAdapter,
  SpurtCategoryAdapter,
  SpurtCheckoutAdapter,
  SpurtOrderAdapter,
  SpurtPaymentAdapter,
  SpurtProductAdapter,
  SpurtStoreAdapter,
  SpurtWishlistAdapter,
};

export default definition;
