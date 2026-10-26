<h1 align="center" style="border-bottom: none">
    <div>
        <a href="https://www.spurtcommerce.com">
            <img src="https://www.spurtcommerce.com/spurtcommerce.svg" width="318px" alt="SpurtCommerce logo" />
        </a>
        <br>
        🚀 <strong>StoreNextjs v1.0</strong>
        <br>
        <!-- Frontend Storefront & Universal Adapter Architecture -->
    </div>
</h1>

<p align="center">
    High-Performance Headless Storefront built with Next.js 16 + React 19 + Universal Commerce Adapter Architecture (SpurtCommerce, Medusa &amp; Pluggable Templates)
</p>

<p align="center">
    <a href="https://www.spurtcommerce.com"><b>Website</b></a> •
    <a href="https://docs.spurtcommerce.com"><b>Documentation</b></a> •
    <a href="https://discord.com/invite/hyW4MXXn8n"><b>Discord</b></a> •
    <a href="https://github.com/spurtcommerce"><b>GitHub</b></a>
</p>

<br />

> [!IMPORTANT]
> 🎉 <strong>StoreNextjs 1.0 — Next.js Storefront with Universal Adapter Architecture</strong>
>
> This documentation explains how to install, configure, run, and deploy the StoreNextjs v1.0 storefront powered by a pluggable Commerce Adapter layer (supporting SpurtCommerce and Medusa v2 backends) and dynamic runtime templates.

---

## ❯ 🚀 StoreNextjs 1.0 & Universal Adapter

**StoreNextjs v1.0** is an enterprise-grade headless e-commerce frontend built using:

* **Next.js 16 (App Router)** with Turbopack
* **React 19**
* **Universal Commerce Adapter Architecture** (Decoupled backend provider layer)
* **Tailwind CSS 4**
* **Redux Toolkit & Redux Persist**
* **Pluggable Dynamic Template Engine** (Runtime theme loading)

This guide covers the complete frontend setup including:

* Prerequisites
* Frontend installation
* Environment configuration
* Store & adapter configuration (`store-config.json`)
* Commerce adapter architecture & request flow
* Supported adapter domains & capabilities
* Store management portal (`/manage`)
* Storage isolation & multi-adapter state
* Development, production, and standalone distribution builds
* Troubleshooting

---

## ❯ Prerequisites

Before setting up the SpurtCommerce 6.0 Next.js Storefront, make sure the following software is installed.

* Node.js (v20.x or newer, recommended >= v22.x)
* npm (recommended >= 10.9.x)
* Running Commerce Backend:
  * **SpurtCommerce 6.0 API** (Node.js + TypeScript + TypeORM + MySQL), or
  * **Medusa v2 API Server**
* Git

### Check Installed Versions

```bash
node -v
npm -v
git --version
```

---

## ❯ 🚀 Frontend Setup

### 1. Navigate to Frontend

Navigate to the SpurtCommerce 6.0 storefront project directory.

```bash
cd StoreNextjs
```

### 2. Install Dependencies

Install all required Node.js dependencies.

```bash
npm install
```

### 3. Configure Environment

Create or update the `.env` (or `.env.production`) file in the frontend project root:

```env
NEXT_PUBLIC_ENV='production'

# Customized image / CDN URL (e.g. AWS CloudFront, S3, or your customized image server)
NEXT_PUBLIC_IMAGE_URL="https://your-cdn-url.cloudfront.net/"

# Storefront In-App Management Portal Credentials
NEXT_PUBLIC_MANAGE_USERNAME="your_admin_username"
NEXT_PUBLIC_MANAGE_PASSWORD="your_secure_password"
```

> [!NOTE]
> Set `NEXT_PUBLIC_IMAGE_URL` to your customized image/CDN URL. All commerce backend endpoints and identifiers (`spurtEndpoint`, `appId`, `apiEndpoint`, `publishableKey`) are configured directly in `store-config.json` or managed dynamically via the `/manage/connect` portal.

### 4. Configure Commerce Adapter

Edit `store-config.json` in the root folder to define the active commerce engine and store credentials:

```json
{
  "commerce": {
    "adapter": "spurt",
    "apiEndpoint": "http://localhost:9000",
    "publishableKey": "pk_your_publishable_key_here",
    "regionId": "reg_your_region_id_here",
    "storeId": "",
    "salesChannelId": "",
    "spurtEndpoint": "http://localhost:8000/api",
    "refId": "http://localhost:3000",
    "industry": "YourIndustry",
    "appId": "sp_your_app_id_here",
    "baseUrl": ""
  },
  "template": {
    "active": "default",
    "themeId": 11,
    "version": "1.1"
  },
  "status": {
    "live": true,
    "maintenance": false,
    "environment": "production"
  }
}
```

---

## ❯ 🔌 Commerce Adapter Architecture

The **Universal Commerce Adapter Architecture** completely decouples the storefront presentation layer from the underlying commerce backend. UI components, pages, and hooks consume standardized **Canonical Schemas**, allowing you to switch between **SpurtCommerce**, **Medusa v2**, or custom commerce engines without altering frontend code.

```text
Storefront UI Component / Page / Hook
                  │
                  ▼
          Adapter Resolver
      (getAdapter / adapters.*)
                  │
                  ▼
          Adapter Registry
   (SpurtCommerce / Medusa / Custom)
                  │
                  ▼
      Canonical Schema Contract
  (Product, Cart, Checkout, Auth, etc.)
                  │
                  ▼
      Commerce Backend API
  (SpurtCommerce :8000 / Medusa :9000)
```

### Request Flow

```text
User Interaction (Add to Cart, View Product, Checkout)
  ↓
Next.js Page / Custom Hook (useCart, useProductDetail, etc.)
  ↓
Adapter Proxy (adapters.cart / adapters.product)
  ↓
Active Adapter Instance (SpurtCartAdapter / MedusaCartAdapter)
  ↓
HTTP API Client (Axios / Fetch with isolated headers & credentials)
  ↓
Target Commerce Backend (SpurtCommerce API or Medusa v2 API)
  ↓
Response Transformed into Canonical DTO (createCommonProductRow, createCartSchema, etc.)
  ↓
UI Renders Seamlessly Across Any Engine
```

### Supported Adapter Domains

Each commerce engine implements a set of domain adapters registered in the central Adapter Registry:

| Domain | Description | Methods / Responsibilities |
| :--- | :--- | :--- |
| `product` | Catalog & Search | Product list, category filtering, keyword search, price filters, variant options |
| `productDetail` | Single Product | Product specifications, images, stock status, ratings, reviews, related products |
| `category` | Navigation Hierarchy | Category trees, subcategories, top-level menus |
| `cart` | Shopping Cart | Get cart, add line item, update quantity, remove item, apply coupon |
| `auth` | Customer Identity | Login, registration, token verification, forgot/reset password, profile edit |
| `address` | Shipping & Billing | Address book CRUD, country/zone lists, postal validation |
| `checkout` | Checkout Engine | Multi-step checkout, calculate totals, shipping methods, taxes |
| `payment` | Payment Gateways | Payment sessions, gateway initiation (Stripe, Razorpay, COD, etc.) |
| `order` | Order Management | Place order, order history, track order status, reorder |
| `wishlist` | Wishlist | Fetch wishlist items, toggle wishlist status |
| `store` | Store Configuration | Store settings, currencies, regions, sales channels, banners |

### Dynamic Adapter Resolution

Adapters can be consumed anywhere in the codebase through the central proxy or getter:

```javascript
import { adapters, getAdapter } from "@/adapters";

// Using the convenience proxy:
const productList = await adapters.product.getProductList({ limit: 12, offset: 0 });
const cartData = await adapters.cart.getCart();

// Using the direct domain resolver:
const authAdapter = getAdapter("auth");
const session = await authAdapter.login({ email, password });
```

### Adapter Capabilities & Feature Flags

Different commerce engines provide different feature sets out of the box. The adapter system exposes `hasCapability()` and `hasAdapterCapability()` to dynamically enable or hide UI features:

```javascript
import { hasAdapterCapability } from "@/config/adapter.config";

// Checks whether the active backend supports a specific capability
const canReview = hasAdapterCapability("reviews");
const hasWishlist = hasAdapterCapability("wishlist");
const hasDownloads = hasAdapterCapability("downloads");
```

| Capability | SpurtCommerce Adapter | Medusa Adapter |
| :--- | :---: | :---: |
| `variants` | ✅ Supported | ✅ Supported |
| `wishlist` | ✅ Supported | ✅ Supported |
| `reviews` | ✅ Supported | ❌ Optional Addon |
| `relatedProducts` | ✅ Supported | ❌ Custom Workflow |
| `downloads` | ✅ Supported | ❌ Not Implemented |
| `specifications` | ✅ Supported | ❌ Not Implemented |
| `banners` | ✅ Supported | ✅ Static Banner (`/img/Medusa Banner.png`) |

---

## ❯ 🎛️ Store & Adapter Configuration (`store-config.json`)

The `store-config.json` file in the project root is the single source of truth for runtime adapter binding and store metadata.

### Configuration Properties

| Property | Purpose | Example |
| :--- | :--- | :--- |
| `commerce.adapter` | Active backend engine (`spurt` \| `medusa`) | `"spurt"` or `"medusa"` |
| `commerce.apiEndpoint` | Base URL for modern dynamic adapters (e.g. Medusa) | `"http://localhost:9000"` |
| `commerce.spurtEndpoint` | Base URL for SpurtCommerce API backend | `"http://localhost:8000/api"` |
| `commerce.publishableKey` | Publishable API Key (Medusa v2) | `"pk_d54aa06670668daa868..."` |
| `commerce.regionId` | Default Region Identifier (Medusa) | `"reg_01M2MFH0TSCZEAX5..."` |
| `commerce.salesChannelId`| Default Sales Channel ID (Medusa) | `"sc_01M2MFH0..."` |
| `commerce.appId` | Application Identifier (SpurtCommerce) | `"sp_83a960b9639e474d98af"` |
| `commerce.refId` | Storefront origin / referer | `"http://localhost:3000"` |
| `commerce.industry` | Storefront industry classification | `"Furniture"`, `"Electronics"` |
| `template.active` | Active frontend template (`default` \| `horizon`) | `"default"` |
| `template.themeId` | Theme numeric identifier | `11` |
| `status.live` | Storefront operational state | `true` |
| `status.environment` | Runtime target (`production` \| `development`) | `"production"` |

### Example 1: SpurtCommerce Configuration

```json
{
  "commerce": {
    "adapter": "spurt",
    "spurtEndpoint": "http://localhost:8000/api",
    "appId": "sp_your_app_id_here",
    "refId": "http://localhost:3000",
    "industry": "Electronics"
  },
  "template": {
    "active": "default"
  }
}
```

### Example 2: Medusa v2 Configuration

```json
{
  "commerce": {
    "adapter": "medusa",
    "apiEndpoint": "http://localhost:9000",
    "publishableKey": "pk_your_medusa_publishable_key_here",
    "regionId": "reg_your_region_id_here",
    "salesChannelId": "sc_your_sales_channel_id_here"
  },
  "template": {
    "active": "default"
  }
}
```

---

## ❯ ⚙️ Environment Configuration

The following core environment variables are configured in `.env` (development) and `.env.production` (production):

| Variable | Required | Description | Example / Value |
| :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_ENV` | Yes | Storefront operational environment | `'production'` or `'development'` |
| `NEXT_PUBLIC_IMAGE_URL` | Yes | **Your customized image / CDN URL** for media and product asset resolution | `"https://your-cdn-url.cloudfront.net/"` |
| `NEXT_PUBLIC_MANAGE_USERNAME` | Yes | Username for `/manage` administration console | `"your_admin_username"` |
| `NEXT_PUBLIC_MANAGE_PASSWORD` | Yes | Password for `/manage` administration console | `"your_secure_password"` |

> [!NOTE]
> **Decoupled Backend Configuration:**
> Commerce backend endpoints, tenant application IDs, and API keys are maintained in `store-config.json` (or dynamically managed via the `/manage/connect` portal) rather than hardcoded in `.env`. Optional legacy environment fallbacks (such as `NEXT_PUBLIC_APP_ID`, `NEXT_PUBLIC_SERVER_URL`, or `NEXT_PUBLIC_MEDUSA_API_BASE_URL`) can still be provided if required.

---

## ❯ 🔐 Store Management Portal (`/manage`)

The storefront includes a built-in management and connectivity console located at `/manage`. This allows store operators to dynamically test connections, switch commerce backends, and toggle themes in real time without touching source code.

### Login Credentials

| Field | Value |
| :--- | :--- |
| **Portal URL** | `http://localhost:3000/manage` |
| **Username** | Set via `NEXT_PUBLIC_MANAGE_USERNAME` |
| **Password** | Set via `NEXT_PUBLIC_MANAGE_PASSWORD` |

> [!NOTE]
> Configure your management portal credentials via `NEXT_PUBLIC_MANAGE_USERNAME` and `NEXT_PUBLIC_MANAGE_PASSWORD` in your `.env` or `.env.production` file. Use strong credentials in production.

### Management Portal Features

1. **Connect Adapter (`/manage/connect`)**:
   - Choose active backend: **SpurtCommerce** or **Medusa**.
   - Input Endpoint, Publishable Key, Region ID, and Application ID.
   - Built-in live connection tester (`/api/test-connection`) verifies endpoint health before applying.
2. **Pluggable Templates (`/manage/templates`)**:
   - Inspect all installed templates (`default`, `horizon`).
   - Preview and switch the live storefront template instantly.

---

## ❯ 🛡️ Storage Isolation & Multi-Adapter State

When switching between adapters, the storefront utilizes **Storage Isolation** via `adapterStorage.js`. This guarantees that sessions, carts, and auth tokens from one backend do not contaminate another.

* **SpurtCommerce Scope**:
  - Cookies: `appId`, `spurtEndpoint`, `BearerToken`, `token`, `refId`, `themeId`
  - LocalStorage: `cartItems`, `cart`, `storeSetting`, `compareId`, `persist:root`
* **Medusa Scope**:
  - Cookies: `medusa_auth_token`, `medusa_cart_id`, `medusa_region_id`, `medusa_publishable_key`
  - LocalStorage: `medusa_region_id`, `medusa_sales_channel_id`, `medusa_cart`

Switching adapters automatically resets the active namespace while preserving global admin preferences.

---

## ❯ ▶️ Start & Build Commands

Run the storefront using the following scripts configured in `package.json`:

### 1. Development Mode (Turbopack)

Runs the application locally with fast Turbopack compilation.

```bash
npm run dev
```

* Storefront: `http://localhost:3000`
* Management Portal: `http://localhost:3000/manage`

*(If your project needs additional Node.js memory for large catalogs, use `npm run dev:large`)*

### 2. Standard Production Build

Generates the optimized Next.js production build using `.env`.

```bash
npm run build
```

### 3. Production Environment Build

Builds the application loaded with `.env.production`.

```bash
npm run prod
```

### 4. Start Production Server

Starts the built Next.js application on port 3004 (or configured port).

```bash
npm start
```

---

## ❯ 📦 Standalone Distribution & Pluggable Templates

This storefront supports **Next.js Standalone Distribution** (`dist/`) with pluggable runtime templates. You can compile the core standalone store without secondary templates, and drop external templates (like **Horizon**) into `dist/templates/horizon` at runtime without rebuilding the server.

| Command | Description | Output |
| :--- | :--- | :--- |
| `npm run build:core` | Builds core standalone storefront strictly excluding external templates | Assembles `dist/` |
| `npm run build:template horizon` | Compiles the Horizon template package with `esbuild` | `dist-template/horizon/` |
| `npm run pack:dist` | Re-packages `.next/standalone`, assets, adapters, and `default` template | Updates `dist/` |
| `npm run start:dist` | Runs the standalone production server from `dist/` | Server on port 3000 |

### Runtime Template Hot-Swapping

1. Build the standalone server:
   ```bash
   npm run build:core
   ```
2. Build the external template:
   ```bash
   npm run build:template horizon
   ```
3. Copy the compiled template into `dist/templates/horizon`:
   ```bash
   # Windows PowerShell
   Copy-Item -Recurse dist-template/horizon dist/templates/horizon
   ```
4. The running server immediately discovers the template at runtime via `GET /api/templates`.

---

## ❯ 🛠️ Troubleshooting

| Problem | What to Check |
| :--- | :--- |
| **Adapter Not Found Error** | Check `store-config.json` → `commerce.adapter` matches registered adapters (`spurt`, `medusa`) |
| **Missing Medusa Region or Key** | Ensure `publishableKey` and `regionId` are valid and start with `pk_` and `reg_` |
| **Spurt Invalid Tenant / 401** | Verify `APP_ID` matches your SpurtCommerce backend database application/vendor record |
| **Product or Category Images Fail** | Verify `NEXT_PUBLIC_IMAGE_URL` in `.env` and S3 bucket / CloudFront CDN permissions |
| **Connection Timed Out in `/manage`** | Verify backend server is running, CORS is enabled, and API port is accessible |
| **Redux Serializable Warning in Dev** | Normal in Next.js development mode for large state trees; automatically disabled in production |
| **Dynamic Server Usage in Build** | Normal when routes inspect incoming `cookies` or request headers for tenant detection |
| **Port Collision (3000 or 3004 in use)** | Kill competing processes or launch with custom port: `npx next start -p 3005` |

---

## ❯ 🚀 Quick Start

For a quick local setup:

### 1. Navigate to Frontend

```bash
cd StoreNextjs
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure `store-config.json`

Set your active commerce adapter:

```json
{
  "commerce": {
    "adapter": "spurt",
    "spurtEndpoint": "http://localhost:8000/api",
    "appId": "sp_your_app_id_here"
  },
  "template": {
    "active": "default"
  }
}
```

### 4. Start Development Server

```bash
npm run dev
```

### 5. Open Storefront

Open your browser at:

```text
http://localhost:3000
```

### 6. Open Management Portal

```text
http://localhost:3000/manage
```

*(Login with your configured credentials)*

---

## ❯ 📋 Project Information

| Property | Value |
| :--- | :--- |
| **Platform** | StoreNextjs |
| **Version** | 1.0 |
| **Application** | B2C & B2B Headless Storefront |
| **Framework** | Next.js 16 (App Router) |
| **UI Library** | React 19 |
| **Styling** | Tailwind CSS 4 |
| **Architecture** | Universal Commerce Adapter Pattern |
| **State Management**| Redux Toolkit + Redux Persist |
| **Supported Adapters**| SpurtCommerce (`spurt`), Medusa v2 (`medusa`) |
| **Pluggable Templates**| Default (SpurtCommerce), Horizon |
| **Default Ports** | `3000` (dev) / `3004` (start) / `3000` (start:dist) |

---

## ❯ 🤔 Support, Documentation and Help

For additional information and documentation:

* [SpurtCommerce Website](https://www.spurtcommerce.com)
* [SpurtCommerce Documentation](https://docs.spurtcommerce.com)
* [SpurtCommerce GitHub](https://github.com/spurtcommerce)
* [SpurtCommerce Discord](https://discord.com/invite/hyW4MXXn8n)

For backend setup, refer to the **SpurtCommerce 6.0 B2C & B2B APIs** backend documentation.

---

## ❯ 🐞 Troubleshooting and Issues

If you encounter an issue while running the StoreNextjs 1.0 Storefront, check:

1. Node.js version (`node -v` >= 20.x) and npm version
2. Backend API status (SpurtCommerce at port `8000` or Medusa at port `9000`)
3. `store-config.json` adapter configuration (`commerce.adapter`)
4. `.env` and `.env.production` URLs and keys (customized `NEXT_PUBLIC_IMAGE_URL`)
5. `NEXT_PUBLIC_APP_ID` consistency with backend vendor/tenant records
6. Medusa `publishableKey` and `regionId` settings
7. CORS settings on the backend API server
8. Browser cookies and localStorage isolation (`active_commerce_adapter`)
9. Next.js cache directory (`.next` or `dist`)
10. Terminal server logs and browser console output

---

## ❯ 📦 Version

**StoreNextjs 1.0**

**Application:** B2C & B2B Headless Storefront

**Frontend:** Next.js 16 + React 19 + Universal Commerce Adapter Architecture

---

<p align="center">
    <strong>StoreNextjs v1.0 — Next.js Storefront</strong>
    <br>
    Universal Commerce Adapter &amp; Frontend Run Guide
</p>
