# StoreNextjs Template Creation Guide

## 📋 Table of Contents

1. [Overview](#overview)
2. [Default Template Architecture](#default-template-architecture)
3. [Template Structure](#template-structure)
4. [Required Files](#required-files)
5. [Template Components](#template-components)
6. [Step-by-Step: Creating a New Template](#step-by-step-creating-a-new-template)
7. [Styling Your Template](#styling-your-template)
8. [Template Configuration](#template-configuration)
9. [Component Guidelines](#component-guidelines)
10. [Testing Your Template](#testing-your-template)
11. [Building and Deployment](#building-and-deployment)
12. [Best Practices](#best-practices)
13. [Troubleshooting](#troubleshooting)

---

## Overview

StoreNextjs v1.0 features a **pluggable dynamic template engine** that allows you to create custom storefront designs without modifying the core application. Templates are self-contained design systems that control the visual presentation of your e-commerce store while leveraging the universal commerce adapter architecture.

### What is a Template?

A template is a collection of React components that define:
- Layout structure (header, footer, main content)
- Visual design (styling, colors, typography)
- Component variants (product cards, banners, navigation)
- Page structures (home page, product listings, product details)

### Key Features

- **Hot-swappable**: Switch between templates without rebuilding the application
- **Adapter-agnostic**: Works with any commerce backend (SpurtCommerce, Medusa, etc.)
- **Standalone compilation**: Templates can be built separately from the core app
- **Runtime discovery**: Templates are auto-detected at application startup

---

## Default Template Architecture

The default template serves as the reference implementation. Understanding its structure is essential for creating new templates.

### Default Template File Structure

```
templates/
└── default/
    ├── template.json                 # Template metadata
    ├── style.css                     # Template-specific styles
    ├── thumbnail.png                 # Template thumbnail (for management UI)
    ├── preview.png                   # Template preview image
    ├── Layout.jsx                    # Root layout wrapper
    ├── RootPage.jsx                  # Homepage component
    ├── ProductListPage.jsx           # Product listing page
    ├── ProductDetailPage.jsx         # Product detail page
    ├── FooterPageDetail.jsx          # Footer detail pages
    ├── WidgetListPage.jsx            # Widget/content pages
    ├── AccountVerification.jsx       # Account verification page
    └── Component/                    # Feature-specific components
        ├── Banner/
        ├── Headers/
        ├── Footers/
        ├── ProductCard/
        ├── ProductList/
        ├── ProductDetail/
        ├── SignIn/
        ├── SignUp/
        ├── ChangePassword/
        ├── ForgotPassword/
        ├── Settings/
        └── URLTokenLogin/
```

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   Next.js App Layer                      │
│                    (src/app/)                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Template Loader System                      │
│              (src/lib/loadTemplate.js)                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│            Active Template (e.g., "default")             │
│                  (templates/default/)                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Layout.jsx → Wrapper for all pages               │  │
│  │    ├── Header Component                           │  │
│  │    ├── Main Content (children)                    │  │
│  │    └── Footer Component                           │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  RootPage.jsx → Homepage                          │  │
│  │    ├── Banner Component                           │  │
│  │    └── Widgets (from GlobalComponents)           │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  ProductListPage.jsx → Category/Search Results    │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  ProductDetailPage.jsx → Single Product View      │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              Global Components Layer                     │
│           (src/GlobalComponents/)                        │
│  • useHeaders, useFooters, Widget System                │
│  • Shared utilities (cart, auth, etc.)                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│          Commerce Adapter Layer                          │
│              (adapters/)                                 │
│  • Product, Cart, Auth, Checkout, etc.                  │
│  • Backend-agnostic canonical schemas                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│         Commerce Backend API                             │
│    (SpurtCommerce, Medusa, etc.)                        │
└─────────────────────────────────────────────────────────┘
```

---

## Template Structure

### Minimal Required Structure

Every template must have at minimum:

```
templates/
└── your-template-name/
    ├── template.json          # REQUIRED: Template metadata
    ├── Layout.jsx             # REQUIRED: Root layout wrapper
    ├── RootPage.jsx           # REQUIRED: Homepage
    ├── ProductListPage.jsx    # REQUIRED: Product listings
    ├── ProductDetailPage.jsx  # REQUIRED: Product details
    ├── style.css              # RECOMMENDED: Template styles
    ├── thumbnail.png          # RECOMMENDED: 300x200px thumbnail
    └── preview.png            # RECOMMENDED: 1200x800px preview
```

### Full Recommended Structure

```
templates/
└── your-template-name/
    ├── template.json
    ├── style.css
    ├── thumbnail.png
    ├── preview.png
    ├── Layout.jsx
    ├── RootPage.jsx
    ├── ProductListPage.jsx
    ├── ProductDetailPage.jsx
    ├── FooterPageDetail.jsx
    ├── WidgetListPage.jsx
    ├── AccountVerification.jsx
    └── Component/
        ├── Banner/
        │   └── index.jsx
        ├── Headers/
        │   ├── index.jsx
        │   └── HeaderClient.jsx
        ├── Footers/
        │   └── Index.jsx
        ├── ProductCard/
        │   └── index.jsx
        ├── ProductList/
        │   └── Index.jsx
        ├── ProductDetail/
        │   └── index.jsx
        ├── SignIn/
        │   └── Index.jsx
        ├── SignUp/
        │   └── Index.jsx
        ├── ChangePassword/
        │   └── Index.jsx
        ├── ForgotPassword/
        │   └── Index.jsx
        ├── Settings/
        │   └── Index.jsx
        └── URLTokenLogin/
            └── Index.jsx
```

---

## Required Files

### 1. `template.json`

**Purpose**: Defines template metadata for discovery and display in the management UI.

**Structure**:
```json
{
  "id": "your-template-id",
  "themeId": 13,
  "name": "Your Template Name",
  "desc": "Brief description of your template",
  "version": "1.0",
  "thumbnail": "thumbnail.png",
  "preview": "preview.png",
  "style": "style.css"
}
```

**Field Descriptions**:
- `id` (string, required): Unique identifier (lowercase, alphanumeric, hyphens). Must match folder name.
- `themeId` (number, required): Unique numeric identifier. Use an unused number (11=default, 12=horizon).
- `name` (string, required): Display name shown in management UI.
- `desc` (string, required): Short description of the template's design focus.
- `version` (string, required): Semantic version (e.g., "1.0", "1.1").
- `thumbnail` (string): Filename of thumbnail image (300×200px recommended).
- `preview` (string): Filename of preview image (1200×800px recommended).
- `style` (string): Filename of CSS file.

**Example**:
```json
{
  "id": "modern-minimal",
  "themeId": 15,
  "name": "Modern Minimal",
  "desc": "Clean, minimalist design for modern brands",
  "version": "1.0",
  "thumbnail": "thumbnail.png",
  "preview": "preview.png",
  "style": "style.css"
}
```

---

### 2. `Layout.jsx`

**Purpose**: Root wrapper component that wraps all pages. Contains header, footer, and main content area.

**Key Responsibilities**:
- Render header navigation
- Provide main content wrapper
- Render footer
- Load template-specific CSS
- Set up any template-wide context

**Required Props**:
- `children`: React children (page content)
- `storeSettings`: Store configuration and settings
- `token`: Authentication token (optional)

**Template Structure**:
```jsx
import React from "react";
import "./style.css";
import Header from "./Component/Headers";
import Footer from "./Component/Footers/Index";

const Layout = ({ children, storeSettings, token }) => {
  return (
    <>
      <Header storeSettings={storeSettings} />
      <main>{children}</main>
      <Footer storeSettings={storeSettings} />
    </>
  );
};

export default Layout;
```

**Best Practices**:
- Keep Layout minimal—delegate complex logic to child components
- Always render `{children}` inside a `<main>` tag for accessibility
- Import template-specific CSS at the top
- Pass down `storeSettings` to header/footer for dynamic content

---

### 3. `RootPage.jsx`

**Purpose**: Homepage component. Renders banners, featured products, and widgets.

**Required Props**:
- `token`: Authentication token
- `bannerList`: Array of banner data
- `storeSettings`: Store configuration
- `WidgetList`: Array of widget configurations

**Template Structure**:
```jsx
"use client";

import Banner from "./Component/Banner";
import Widgets from "@/GlobalComponents/Widget";

const RootPage = ({ token, bannerList, storeSettings, WidgetList }) => {
  return (
    <>
      <div className="mx-auto max-w-[1440px] p-[16px] md:p-[16px_20px_20px]">
        <Banner token={token} bannerList={bannerList} WidgetList={WidgetList} />
        <Widgets token={token} WidgetListServer={WidgetList} />
      </div>
    </>
  );
};

export default RootPage;
```

**Key Components**:
- `Banner`: Hero carousel/banner section
- `Widgets`: Global widget system (best sellers, featured products, etc.)

**Customization Tips**:
- Adjust max-width for different layouts (e.g., `max-w-[1920px]` for full-width)
- Modify padding/spacing to match your design system
- Add additional sections (testimonials, featured categories, etc.)
- Use conditional rendering based on `storeSettings`

---

### 4. `ProductListPage.jsx`

**Purpose**: Product catalog/listing page. Shows products filtered by category, search, or other criteria.

**Required Props**:
- `token`: Authentication token
- `storeSettings`: Store configuration
- `initialCategorySlug`: Initial category filter
- `categoryName`: Display name of current category

**Template Structure**:
```jsx
import React from "react";
import AllProductListPageClient from "./Component/ProductList/Index";

const ProductListPage = ({
  token,
  storeSettings,
  initialCategorySlug,
  categoryName,
}) => {
  return (
    <>
      <AllProductListPageClient
        token={token}
        storeSettings={storeSettings}
        initialCategorySlug={initialCategorySlug}
        categoryName={categoryName}
      />
    </>
  );
};

export default ProductListPage;
```

**Customization Areas**:
- Filters sidebar (price, rating, attributes)
- Grid/list view toggle
- Sort options (price, popularity, newest)
- Pagination style
- Product card design

---

### 5. `ProductDetailPage.jsx`

**Purpose**: Single product view with images, description, pricing, add to cart, and reviews.

**Required Props**:
- `token`: Authentication token
- `productSlug`: URL-friendly product identifier
- `categorySlug`: Parent category slug
- `productDetails`: Full product data object
- `categoryIds`: Array of category IDs for breadcrumbs/navigation

**Template Structure**:
```jsx
import ProductDetail from './Component/ProductDetail';
import React from 'react';

const ProductDetailPage = ({
  token,
  productSlug,
  categorySlug,
  productDetails,
  categoryIds,
}) => {
  return (
    <ProductDetail
      token={token}
      productSlug={productSlug}
      categorySlug={categorySlug}
      rawProduct={productDetails}
      categoryIds={categoryIds}
    />
  );
};

export default ProductDetailPage;
```

**Customization Areas**:
- Image gallery layout (vertical thumbnails, horizontal, grid)
- Product information tabs (description, specifications, reviews)
- Variant selector design (color swatches, size buttons)
- Add to cart button style
- Related products section
- Reviews and ratings display

---

## Template Components

### Header Component

**Location**: `Component/Headers/index.jsx`

**Purpose**: Top navigation, search, cart, user menu.

**Key Features**:
- Logo and branding
- Main navigation menu
- Search bar
- Shopping cart icon with item count
- User account dropdown
- Language/currency selector
- Mobile responsive menu

**Example Structure**:
```jsx
import { getHeaderData } from '@/GlobalComponents/useHeaders/useHeaderDataServer';
import dynamic from 'next/dynamic';

const HeaderClient = dynamic(() => import('./HeaderClient'), { ssr: true });

const Header = async ({ storeSettings }) => {
  const { token, allProductsList, languageList } = await getHeaderData(storeSettings);
  
  return (
    <HeaderClient
      storeSettings={storeSettings}
      token={token}
      allProductsList={allProductsList}
      languageList={languageList}
    />
  );
};

export default Header;
```

**Global Utilities Available**:
- `getHeaderData`: Fetches menu, categories, cart count
- `useCart`: Cart state and actions
- `useAuth`: Authentication state

---

### Footer Component

**Location**: `Component/Footers/Index.jsx`

**Purpose**: Site-wide footer with links, social media, newsletter, copyright.

**Key Sections**:
- Site navigation links
- Customer service links
- Social media icons
- Newsletter subscription
- Payment method logos
- Copyright notice

**Styling Tips**:
- Use grid layouts for multi-column footers
- Ensure mobile responsive (stack columns on small screens)
- Keep links organized by category
- Add hover effects for better UX

---

### Banner Component

**Location**: `Component/Banner/index.jsx`

**Purpose**: Homepage hero carousel/slider.

**Props**:
- `bannerList`: Array of banner objects with images and links
- `token`: Authentication token
- `WidgetList`: Additional widget data

**Common Features**:
- Auto-play slider with manual controls
- Call-to-action buttons
- Responsive images
- Overlay text support

**Libraries to Use**:
- Swiper (`swiper`) for carousels
- Embla Carousel (`embla-carousel-react`) as alternative
- Framer Motion (`framer-motion`) for animations

---

### Product Card Component

**Location**: `Component/ProductCard/index.jsx`

**Purpose**: Reusable product card for lists and grids.

**Key Elements**:
- Product image with aspect ratio
- Product name
- Price (with sale price if applicable)
- Rating stars
- Quick add to cart button
- Wishlist toggle icon
- Badge/label (new, sale, out of stock)

**Design Considerations**:
- Consistent card height (use `aspect-ratio` CSS)
- Hover effects (zoom, overlay, shadow)
- Loading skeleton state
- Image lazy loading

---

## Step-by-Step: Creating a New Template

### Step 1: Choose a Template Name

Pick a unique, descriptive name for your template:
- Use lowercase with hyphens (e.g., `modern-minimal`, `vintage-boutique`)
- Avoid special characters
- Keep it short and memorable

### Step 2: Copy the Default Template

```bash
cd templates
cp -r default your-template-name
```

Or on Windows:
```cmd
cd templates
xcopy /E /I default your-template-name
```

### Step 3: Update `template.json`

Edit `your-template-name/template.json`:

```json
{
  "id": "your-template-name",
  "themeId": 14,
  "name": "Your Template Display Name",
  "desc": "A brief description of your design aesthetic",
  "version": "1.0",
  "thumbnail": "thumbnail.png",
  "preview": "preview.png",
  "style": "style.css"
}
```

**Important**: Choose an unused `themeId`. Check existing templates:
- 11 = default
- 12 = horizon
- 13+ = available

### Step 4: Customize Styling

Edit `your-template-name/style.css`:

```css
/* Your Template Name - Custom Styles */

/* CSS Variables for Easy Theming */
:root {
  --primary-color: #027600;
  --secondary-color: #333333;
  --accent-color: #FF6B35;
  --text-color: #1a1a1a;
  --bg-color: #ffffff;
  --border-color: #e5e5e5;
  
  --font-family-primary: 'Inter', sans-serif;
  --font-family-heading: 'Jost', sans-serif;
  
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
  --spacing-xl: 3rem;
  
  --border-radius: 8px;
  --transition: all 0.3s ease;
}

/* Global Overrides */
body[data-theme="your-template-name"] {
  font-family: var(--font-family-primary);
  color: var(--text-color);
}

/* Component-Specific Styles */
.btn-primary {
  background-color: var(--primary-color);
  color: white;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);
  transition: var(--transition);
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

/* Header Customization */
.header-wrapper {
  background-color: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
}

/* Product Card Customization */
.product-card {
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  transition: var(--transition);
}

.product-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}
```

**Styling Best Practices**:
- Use CSS variables for consistency
- Scope styles with `data-theme` attribute
- Keep specificity low for easier overrides
- Use Tailwind utility classes where possible
- Provide dark mode support if desired

### Step 5: Customize Components

Edit template components starting with high-impact areas:

#### a. Customize Header (`Component/Headers/HeaderClient.jsx`)

```jsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const HeaderClient = ({ storeSettings, token, allProductsList, languageList }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <header className="header-wrapper sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src={storeSettings[0]?.logo || '/brand/logo.svg'}
              alt={storeSettings[0]?.siteName || 'Store'}
              width={150}
              height={50}
            />
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/products" className="nav-link">Products</Link>
            <Link href="/about" className="nav-link">About</Link>
            <Link href="/contact" className="nav-link">Contact</Link>
          </nav>
          
          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button className="icon-btn">🔍</button>
            <Link href="/cart" className="icon-btn">🛒</Link>
            {token ? (
              <Link href="/account" className="icon-btn">👤</Link>
            ) : (
              <Link href="/login" className="btn-primary">Login</Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderClient;
```

#### b. Customize Banner (`Component/Banner/index.jsx`)

Create an engaging hero section with your brand's visual identity.

#### c. Customize Product Card (`Component/ProductCard/index.jsx`)

Design product cards that match your template's aesthetic.

### Step 6: Create Thumbnail and Preview Images

**Thumbnail** (`thumbnail.png`):
- Size: 300×200 pixels
- Shows template in a small preview
- Clear, recognizable design elements

**Preview** (`preview.png`):
- Size: 1200×800 pixels (or larger)
- Full-page screenshot of the template
- Showcase key features and design

**Tools**:
- Take screenshots of your template running locally
- Use design tools (Figma, Photoshop, GIMP)
- Optimize images (TinyPNG, ImageOptim)

### Step 7: Test Your Template Locally

1. **Update `store-config.json`**:
```json
{
  "commerce": {
    "adapter": "spurt",
    "spurtEndpoint": "http://localhost:8000/api",
    "appId": "sp_your_app_id_here"
  },
  "template": {
    "active": "your-template-name",
    "themeId": 14,
    "version": "1.0"
  }
}
```

2. **Start development server**:
```bash
npm run dev
```

3. **Visit**: `http://localhost:3000`

4. **Check all pages**:
   - Homepage (/)
   - Product listing (/products)
   - Product detail (/products/[slug])
   - Cart (/cart)
   - Checkout (/checkout)
   - Account (/account)

### Step 8: Test with Management Portal

1. **Navigate to**: `http://localhost:3000/manage`
2. **Login** with credentials from `.env`
3. **Go to Templates** section
4. **Verify** your template appears in the list
5. **Preview** and **activate** your template

---

## Styling Your Template

### CSS Architecture

#### 1. Template-Scoped Styles

Use the `data-theme` attribute to scope styles:

```css
/* Only applied when your template is active */
body[data-theme="your-template-name"] {
  /* Your styles */
}

body[data-theme="your-template-name"] .header {
  background: linear-gradient(to right, #667eea 0%, #764ba2 100%);
}
```

#### 2. Component-Level Styles

```css
/* Product Card */
body[data-theme="your-template-name"] .product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease;
}

body[data-theme="your-template-name"] .product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}
```

#### 3. Utility Classes with Tailwind

Combine custom CSS with Tailwind utilities:

```jsx
<div className="product-card p-4 rounded-lg shadow-md hover:shadow-xl transition-all">
  {/* Content */}
</div>
```

### Color Palettes

Define a cohesive color system:

```css
:root {
  /* Primary Brand Colors */
  --color-primary-50: #f0f9ff;
  --color-primary-100: #e0f2fe;
  --color-primary-200: #bae6fd;
  --color-primary-500: #0ea5e9;
  --color-primary-600: #0284c7;
  --color-primary-900: #0c4a6e;
  
  /* Semantic Colors */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
  
  /* Neutral Colors */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-500: #6b7280;
  --color-gray-900: #111827;
}
```

### Typography

```css
:root {
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */
  
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
}

/* Heading Styles */
body[data-theme="your-template-name"] h1 {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  color: var(--color-gray-900);
}
```

### Responsive Design

```css
/* Mobile First Approach */
.container {
  padding: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: 3rem;
  }
}

/* Large Desktop */
@media (min-width: 1440px) {
  .container {
    max-width: 1400px;
    margin: 0 auto;
  }
}
```

---

## Template Configuration

### Store Config Integration

Your template automatically receives store configuration:

```jsx
const Layout = ({ storeSettings }) => {
  const storeName = storeSettings[0]?.siteName;
  const logo = storeSettings[0]?.logo;
  const primaryColor = storeSettings[0]?.primaryColor;
  
  // Use these values in your components
};
```

### Available Store Settings

```javascript
{
  siteName: "Your Store Name",
  logo: "logo.png",
  favicon: "favicon.ico",
  metaTitle: "SEO Title",
  metaTagDescription: "SEO Description",
  metaTagKeyword: "keywords",
  primaryColor: "#027600",
  secondaryColor: "#333333",
  currency: "USD",
  currencySymbol: "$",
  languageCode: "en",
  isDefault: 1,
  isMaintenance: 0,
  showBadge: 0,
  storeUrl: "https://example.com"
}
```

### Dynamic Theming

```jsx
// Apply store's primary color dynamically
const customStyle = {
  '--theme-primary': storeSettings[0]?.primaryColor || '#027600',
  '--theme-secondary': storeSettings[0]?.secondaryColor || '#333333'
};

<div style={customStyle}>
  {/* Components will inherit CSS variables */}
</div>
```

---

## Component Guidelines

### Using Global Components

StoreNextjs provides global components you can use in your template:

```jsx
// Import from GlobalComponents
import Widgets from "@/GlobalComponents/Widget";
import { getHeaderData } from '@/GlobalComponents/useHeaders/useHeaderDataServer';
import { useCart } from '@/GlobalComponents/useCart';
import { useAuth } from '@/GlobalComponents/useAuth';
```

### Available Global Utilities

#### Cart Management
```jsx
"use client";
import { useCart } from '@/GlobalComponents/useCart';

const MyComponent = () => {
  const { cart, addToCart, removeFromCart, updateQuantity } = useCart();
  
  const handleAddToCart = async (productId, quantity) => {
    await addToCart(productId, quantity);
  };
  
  return (
    <button onClick={() => handleAddToCart(123, 1)}>
      Add to Cart ({cart.items?.length || 0})
    </button>
  );
};
```

#### Authentication
```jsx
"use client";
import { useAuth } from '@/GlobalComponents/useAuth';

const UserMenu = () => {
  const { user, token, logout } = useAuth();
  
  if (!token) {
    return <Link href="/login">Login</Link>;
  }
  
  return (
    <div>
      <p>Welcome, {user?.firstName}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

#### Widgets
```jsx
import Widgets from "@/GlobalComponents/Widget";

const HomePage = ({ WidgetList, token }) => {
  return (
    <div>
      <Widgets token={token} WidgetListServer={WidgetList} />
    </div>
  );
};
```

### Using Adapters

Templates should use adapters for data fetching:

```jsx
import { adapters } from '@/adapters';

// Fetch products
const products = await adapters.product.getProductList({
  limit: 12,
  offset: 0,
  categoryId: categoryId
});

// Fetch product details
const product = await adapters.product.getProductDetail(productSlug);

// Add to cart
await adapters.cart.addToCart({
  productId: product.id,
  quantity: 1
});
```

### Internationalization

Support multiple languages:

```jsx
import { useTranslations } from 'next-intl';

const MyComponent = () => {
  const t = useTranslations('Common');
  
  return (
    <button>{t('addToCart')}</button>
  );
};
```

Translation files are in `/messages/[locale].json`.

---

## Testing Your Template

### Checklist

#### Visual Testing
- [ ] Homepage loads correctly
- [ ] Header is responsive (mobile, tablet, desktop)
- [ ] Footer renders properly
- [ ] Product cards display correctly
- [ ] Product detail page shows all information
- [ ] Cart page functions
- [ ] Checkout flow works
- [ ] Forms are styled consistently
- [ ] Images load and display correctly
- [ ] Colors match design system

#### Functional Testing
- [ ] Navigation links work
- [ ] Search functionality
- [ ] Add to cart works
- [ ] Remove from cart works
- [ ] Update cart quantity
- [ ] Wishlist toggle
- [ ] User login/logout
- [ ] Form validation
- [ ] Responsive menu (mobile)
- [ ] Filter and sort products

#### Cross-Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers (iOS Safari, Chrome Android)

#### Performance Testing
- [ ] Page load times < 3 seconds
- [ ] Images are optimized
- [ ] No console errors
- [ ] Lighthouse score > 90

### Testing Commands

```bash
# Development mode
npm run dev

# Production build test
npm run build
npm start

# Standalone build test
npm run build:core
npm run build:template your-template-name
npm run pack:dist
npm run start:dist
```

---

## Building and Deployment

### Build Your Template

#### Option 1: Include in Main Build

Your template is automatically included when you run:

```bash
npm run build
```

#### Option 2: Standalone Template Build

Build only your template separately:

```bash
npm run build:template your-template-name
```

This creates a compiled version in `dist-template/your-template-name/`.

### Deploy Your Template

#### Standalone Deployment

1. **Build the core app** (without your template):
```bash
npm run build:core
```

2. **Build your template separately**:
```bash
npm run build:template your-template-name
```

3. **Copy template to production**:
```bash
# Copy to dist/templates/
cp -r dist-template/your-template-name dist/templates/
```

4. **Run standalone server**:
```bash
npm run start:dist
```

#### Full Deployment

1. **Build everything**:
```bash
npm run build:all
```

2. **Package for deployment**:
```bash
npm run pack:dist
```

3. **Deploy the `dist/` folder** to your hosting provider.

### Update `store-config.json` on Server

On your production server, update `store-config.json`:

```json
{
  "template": {
    "active": "your-template-name",
    "themeId": 14,
    "version": "1.0"
  }
}
```

Restart the server to apply changes.

---

## Best Practices

### Code Quality

1. **Use TypeScript (Optional)**
   - Add type safety with JSDoc comments
   - Or rename `.jsx` to `.tsx` and add type definitions

2. **Component Structure**
   - Keep components small and focused
   - Extract reusable logic into custom hooks
   - Use composition over inheritance

3. **Performance**
   - Use `next/image` for all images
   - Lazy load components with `dynamic()`
   - Minimize CSS file size
   - Use CSS variables for theming

4. **Accessibility**
   - Use semantic HTML (`<header>`, `<nav>`, `<main>`, `<footer>`)
   - Add ARIA labels where needed
   - Ensure keyboard navigation works
   - Maintain color contrast ratios (WCAG AA)

### Design Consistency

1. **Design System**
   - Define spacing scale
   - Create typography hierarchy
   - Establish color palette
   - Document component variants

2. **Responsive Design**
   - Mobile-first approach
   - Test on real devices
   - Use breakpoints consistently
   - Ensure touch targets are 44×44px minimum

3. **Brand Alignment**
   - Reflect brand personality in design
   - Use brand colors, fonts, imagery
   - Maintain consistent tone and style

### Documentation

1. **Component Documentation**
   - Document props and their types
   - Provide usage examples
   - Explain customization options

2. **Setup Guide**
   - Include installation instructions
   - Document dependencies
   - Provide configuration examples

3. **Changelog**
   - Track version changes
   - Document breaking changes
   - List new features and bug fixes

---

## Troubleshooting

### Common Issues

#### Template Not Loading

**Symptom**: Template doesn't appear or falls back to default.

**Solutions**:
1. Check `store-config.json` → `template.active` matches folder name
2. Verify `template.json` exists with correct `id`
3. Check console for import errors
4. Ensure all required files exist (Layout.jsx, RootPage.jsx, etc.)
5. Restart development server

#### Styles Not Applying

**Symptom**: CSS changes don't show up.

**Solutions**:
1. Clear Next.js cache: `rm -rf .next`
2. Restart dev server: `npm run dev`
3. Check `style.css` is imported in `Layout.jsx`
4. Verify CSS is scoped correctly with `data-theme`
5. Check browser DevTools for CSS loading errors

#### Components Not Found

**Symptom**: `Module not found` errors.

**Solutions**:
1. Check import paths are correct
2. Ensure component files exist in `Component/` folder
3. Verify file names match imports (case-sensitive)
4. Check for circular dependencies

#### Images Not Loading

**Symptom**: Broken image icons or 404 errors.

**Solutions**:
1. Check image paths in `template.json`
2. Verify images exist in template folder
3. Use `/api/templates/[id]/thumbnail.png` for external access
4. Ensure `NEXT_PUBLIC_IMAGE_URL` is set correctly in `.env`

#### Build Errors

**Symptom**: Build fails with errors.

**Solutions**:
1. Check for syntax errors in all `.jsx` files
2. Ensure all imports are valid
3. Verify no server-side code in client components
4. Check for missing dependencies in `package.json`
5. Review build output for specific error messages

### Getting Help

1. **Check Documentation**
   - Read this guide thoroughly
   - Review default template as reference
   - Check Next.js documentation

2. **Debug Tools**
   - Use browser DevTools (Console, Network, Elements)
   - Check Next.js error overlay
   - Review server logs in terminal

3. **Community Support**
   - SpurtCommerce Discord: https://discord.com/invite/hyW4MXXn8n
   - Documentation: https://docs.spurtcommerce.com
   - GitHub Issues: https://github.com/spurtcommerce

---

## Advanced Topics

### Dynamic Component Loading

Load template components conditionally:

```jsx
import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(
  () => import('./Component/CustomSection'),
  { 
    ssr: true,
    loading: () => <div>Loading...</div>
  }
);
```

### Template-Specific Hooks

Create custom hooks for your template:

```jsx
// hooks/useTemplateConfig.js
export function useTemplateConfig() {
  const primaryColor = '#027600';
  const layoutMode = 'wide'; // or 'boxed'
  
  return { primaryColor, layoutMode };
}
```

### Conditional Features

Show/hide features based on adapter capabilities:

```jsx
import { hasAdapterCapability } from '@/config/adapter.config';

const ProductCard = ({ product }) => {
  const hasWishlist = hasAdapterCapability('wishlist');
  const hasReviews = hasAdapterCapability('reviews');
  
  return (
    <div>
      {hasWishlist && <WishlistButton productId={product.id} />}
      {hasReviews && <ProductRating rating={product.rating} />}
    </div>
  );
};
```

### Multi-Variant Templates

Support light/dark themes within your template:

```css
/* Light theme (default) */
body[data-theme="your-template"][data-mode="light"] {
  --bg: #ffffff;
  --text: #1a1a1a;
}

/* Dark theme */
body[data-theme="your-template"][data-mode="dark"] {
  --bg: #1a1a1a;
  --text: #ffffff;
}
```

```jsx
"use client";
import { useTheme } from '@/lib/theme';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};
```

---

## Conclusion

You now have a comprehensive guide to creating custom templates for StoreNextjs. Remember:

1. Start with the default template as a foundation
2. Customize incrementally (config → styles → components)
3. Test thoroughly on all devices and browsers
4. Follow best practices for code quality and accessibility
5. Document your customizations for future maintenance

Happy template building! 🎨

---

## Additional Resources

- **StoreNextjs Documentation**: [README.md](./README.md)
- **Commerce Adapters**: [adapters/README.md](./adapters/README.md)
- **Release Notes**: [RELEASE_NOTES.md](./RELEASE_NOTES.md)
- **SpurtCommerce Website**: https://www.spurtcommerce.com
- **SpurtCommerce Docs**: https://docs.spurtcommerce.com
- **Discord Community**: https://discord.com/invite/hyW4MXXn8n

---

**Version**: 1.0  
**Last Updated**: 2026  
**Maintainer**: SpurtCommerce Team
