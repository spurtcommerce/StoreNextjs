<h1 align="center" style="border-bottom: none">
    <div>
        <a href="https://www.spurtcommerce.com">
            <img src="https://www.spurtcommerce.com/spurtcommerce.svg" width="318px" alt="SpurtCommerce logo" />
        </a>
        <br>
        <strong>StoreNextjs v1.0</strong>
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
    <a href="https://github.com/spurtcommerce"><b>GitHub</b></a>
</p>

<br />

> [!IMPORTANT]
> <strong>StoreNextjs 1.0 — Next.js Storefront with Universal Adapter Architecture</strong>
>
> This documentation explains how to install, configure, run, and deploy the StoreNextjs v1.0 storefront powered by a pluggable Commerce Adapter layer (supporting SpurtCommerce and Medusa v2 backends) and dynamic runtime templates.



# StoreNextjs - Multi-Commerce Storefront

A modern, enterprise-grade e-commerce storefront built with **Next.js 16**, **React 19**, and **Tailwind CSS**. This project features a flexible adapter architecture that supports multiple commerce backends, allowing you to switch between different e-commerce platforms seamlessly.

### Features
### 🔧 Adapter Comparison

This project supports four commerce adapters, each with different capabilities:

| Feature | Spurt Adapter |Woocommerce Adapter | Medusa Adapter | OpenCart Adapter | 
|---------|---------------|--------------------|----------------|------------------|
| **Authentication** | ✅ Yes |  ✅ Yes |✅ Yes | ✅ Yes |
| **Order Management** | ✅ Yes |  ✅ Yes |✅ Yes | ✅ Yes |
| **Address Management** | ✅ Yes |  ✅ Yes |✅ Yes | ✅ Yes |
| **Payment Integration** | ✅ Yes |  ✅ Yes |✅ Yes | ✅ Yes |
| **Category Management** | ✅ Yes |  ✅ Yes |✅ Yes | ✅ Yes |
| **Product Variants** |✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | 
| **Cart Management** | ✅ Yes | ✅ Yes |✅ Yes | ✅ Yes | 
| **Checkout** | ✅ Yes | ✅ Yes |✅ Yes | ✅ Yes | 
| **Wishlist** | ✅ Yes |  ✅ Yes |✅ Yes | ✅ Yes |
| **Product Reviews** | ✅ Yes |✅ Yes | ❌ No | ✅ Yes | 
| **Related Products** | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes |
| **Product Specifications** | ✅ Yes |✅ Yes | ❌ No | ✅ Yes | 
| **Banners** | ✅ Yes |  ✅ Yes |❌ No | ✅ Yes |


### Spurt Adapter
The **Spurt Adapter** provides a comprehensive e-commerce experience with advanced features like product reviews, specifications, related products, and support for digital downloads. It's ideal for businesses that need a feature-rich storefront.

### Medusa Adapter
The **Medusa Adapter** offers a streamlined e-commerce experience optimized for headless commerce. It focuses on core shopping functionalities with excellent performance and scalability through the Medusa backend.

### OpenCart Adapter
The **OpenCart Adapter** brings the flexibility of OpenCart to the StoreNextjs storefront. It supports a wide range of features including product reviews, digital downloads, and comprehensive category management. Ideal for businesses already using OpenCart as their backend.

### Woocommerce Adapter
The **Woocommerce Adapter** integrates the powerful Woocommerce platform with StoreNextjs. It provides full support for all major e-commerce features including product variants, reviews, related products, and seamless payment integration. Perfect for businesses built on the WordPress/Woocommerce ecosystem.


### Core Features
- 🛒 **Multi-Adapter Architecture** - Support for multiple commerce backends (Medusa, Spurt, OpenCart, Woocommerce)
- 🌍 **Multi-Language Support** - Built-in i18n with support for 9 languages (English, Spanish, French, German, Italian, Japanese, Chinese, Hindi, Arabic)
- 🎨 **Modern UI** - Built with Radix UI, Headless UI, and Material Tailwind components
- 📱 **Responsive Design** - Mobile-first approach with Tailwind CSS
- 🔒 **Secure Authentication** - Built-in auth system with JWT support
- 🛍️ **Shopping Cart** - Real-time cart management
- 💳 **Checkout & Payment** - Complete checkout flow with payment integration
- 📦 **Order Management** - Order history and tracking
- ❤️ **Wishlist** - Save favorite products
- 🏷️ **Category Management** - Dynamic category navigation
- 🔍 **Product Search** - Advanced search and filtering
- 📍 **Address Management** - Multiple shipping addresses support
- ⚡ **Performance Optimized** - Built with Next.js standalone output for optimal deployment

## 📋 System Requirements

Before downloading and running this project, ensure you have the following installed on your system:

- **Node.js**: Version 18.17 or higher ([Download](https://nodejs.org/))
- **npm**: Version 9.x or higher (comes with Node.js)
- **Git**: For cloning the repository ([Download](https://git-scm.com/))

## 📥 Download & Installation

### Step 1: Clone the Repository

```bash
git clone -b main https://github.com/spurtcommerce/StoreNextjs.git
cd StoreNextjs
npm install
```

### Step 2: Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
NEXT_PUBLIC_ENV='production'
NEXT_PUBLIC_IMAGE_URL="https://your-image-cdn.com/"

# Admin Authentication Credentials (Optional)
NEXT_PUBLIC_MANAGE_USERNAME="admin@yourdomain.com"
NEXT_PUBLIC_MANAGE_PASSWORD="your-secure-password"
```
### Step 3: Run the Development Server

```bash
node server.js
```
Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🖼️ Adding Custom Image URLs

To add support for additional image URLs or CDN domains, update the `next.config.mjs` file:

### Step 1: Open `next.config.mjs`

```javascript
images: {
  remotePatterns: [
    // Existing patterns...
    {
      protocol: "https",
      hostname: "your-custom-domain.com",
    },
    {
      protocol: "https",
      hostname: "*.your-cdn-provider.com", // Wildcard support
    },
    {
      protocol: "https",
      hostname: "your-s3-bucket.s3.region.amazonaws.com",
    },
    // Add more patterns as needed
  ],
  qualities: [25, 50, 75, 100],
}
```
### Step 2: Pattern Configuration Options

```javascript
{
  protocol: "https",              // Required: "http" or "https"
  hostname: "example.com",        // Required: domain name
  port: "3000",                   // Optional: specific port
  pathname: "/images/**",         // Optional: path pattern
}
```
### Step 3: Restart Development Server

After modifying `next.config.mjs`, restart your development server:

```bash
# Stop the server (Ctrl+C) and restart
node server.js
```
### Common Image URL Patterns

```javascript
// AWS S3
{
  protocol: "https",
  hostname: "your-bucket.s3.amazonaws.com",
}

// Cloudfront CDN
{
  protocol: "https",
  hostname: "d123456789.cloudfront.net",
}

// Custom CDN
{
  protocol: "https",
  hostname: "cdn.yourdomain.com",
}

// Wildcard for subdomains
{
  protocol: "https",
  hostname: "*.yourdomain.com",
}
```

## 📁 Project Structure

```
StoreNextjs/
├── adapters/           # Commerce adapter modules
│   ├── medusa/        # Medusa adapter
│   ├── spurt/         # Spurt adapter
│   ├── opencart/      # OpenCart adapter
│   └── woocommerce/   # Woocommerce adapter
├── dist/              # Production build output
├── i18n/              # Internationalization configuration
├── messages/          # Translation files
├── public/            # Static assets
│   ├── brand/        # Brand assets (logo, etc.)
│   └── img/          # Images
├── next.config.mjs    # Next.js configuration
├── package.json       # Dependencies and scripts
└── store-config.json  # Store adapter configuration
```

## 🌍 Supported Languages

- 🇬🇧 English (en)
- 🇪🇸 Spanish (es)
- 🇫🇷 French (fr)
- 🇩🇪 German (de)
- 🇮🇹 Italian (it)
- 🇯🇵 Japanese (ja)
- 🇨🇳 Chinese (zh)
- 🇮🇳 Hindi (hi)
- 🇸🇦 Arabic (ar)

## 🎨 Technology Stack

- **Framework**: Next.js 16.2.10
- **React**: 19.2.7
- **Styling**: Tailwind CSS 4.3.3
- **UI Components**: Radix UI, Headless UI, Material Tailwind
- **State Management**: Redux Toolkit with Redux Persist
- **Internationalization**: next-intl
- **HTTP Client**: Axios
- **Forms**: React Hook Form
- **Animations**: Framer Motion
- **Icons**: React Icons, Lucide React
- **Carousel**: Embla Carousel, Swiper
- **Notifications**: React Toastify, Sonner

## 🔒 Security

- Always use HTTPS in production
- Never commit `.env` files with sensitive credentials
- Update the default admin credentials immediately
- Keep dependencies updated regularly
- Use environment variables for sensitive data

### Environment Variables for Production

Ensure the following environment variables are set in your production environment:

```env
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_IMAGE_URL=https://your-cdn.com/
MANAGE_USERNAME=your-admin-username
MANAGE_PASSWORD=your-secure-password
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 📧 Support

For issues, questions, or contributions, please open an issue on GitHub.


---

## 📦 Release Notes

### V1.0.1 (Current)

**New Adapters**
- Added **OpenCart Adapter** — brings OpenCart's flexibility to StoreNextjs with full feature support including product reviews, digital downloads, related products, specifications, banners, wishlist, cart management, checkout, order management, authentication, address management, payment integration, and category management.
- Added **Woocommerce Adapter** — integrates the Woocommerce platform with StoreNextjs, providing full support for product variants, reviews, related products, specifications, digital downloads, banners, wishlist, cart management, checkout, order management, authentication, address management, payment integration, and category management.

**Updated Comparison Table**
- The adapter comparison table now includes four adapters: Spurt, Medusa, OpenCart, and Woocommerce.

**Updated Project Structure**
- Added `adapters/opencart/` and `adapters/woocommerce/` directories to the project structure.

---


**Built with ❤️ using Next.js and modern web technologies**
