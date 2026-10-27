import storeConfigStatic from "../../../../store-config.json";

function getCommerceConfig() {
  if (typeof window === "undefined") {
    try {
      const fs = require("fs");
      const path = require("path");
      const configPath = path.join(process.cwd(), "store-config.json");
      if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, "utf-8"));
      }
    } catch {
      // Fallback to static import
    }
  } else {
    try {
      if (typeof window !== "undefined" && window.__COMMERCE_CONFIG__) {
        return {
          ...storeConfigStatic,
          commerce: {
            ...(storeConfigStatic?.commerce || {}),
            ...window.__COMMERCE_CONFIG__,
          },
        };
      }
    } catch {}
  }
  return storeConfigStatic;
}

/**
 * Returns canonical store settings for dynamic storefronts
 * constructed directly from store-config.json without any remote legacy Spurt calls
 */
export function getStoreSettingsFromConfig() {
  const config = getCommerceConfig();
  const commerce = config?.commerce || {};
  const template = config?.template || {};

  const currencyCode =
    process.env.NEXT_PUBLIC_STORE_CURRENCY_CODE ||
    process.env.NEXT_PUBLIC_MEDUSA_CURRENCY_CODE ||
    (commerce?.region === "IN" ? "INR" : "USD");

  const currencySymbol = currencyCode === "INR" ? "₹" : "$";
  const storeDisplayName = "";

  const isSpurt = (commerce?.adapter || "").toLowerCase().trim() === "spurt";
  const defaultLogo = isSpurt ? "/img/logo.svg" : "/img/medusa-logo.png";

  return [
    {
      storeId: commerce?.storeId || commerce?.adapter || "storefront",
      storeName: storeDisplayName,
      siteName: storeDisplayName,
      metaTitle: storeDisplayName,
      metaTagDescription: "",
      metaTagKeyword: "",
      storeUrl: "",
      storeLogo: defaultLogo,
      storeLogoPath: "",
      storeLogoName: defaultLogo,
      currencyCode: currencyCode,
      currencySymbol: currencySymbol,
      symbolLeft: currencySymbol,
      symbolRight: "",
      currencyValue: 1,
      languageCode: "en",
      languageName: "English",
      isDefault: 1,
      isMaintenance: 0,
      showBadge: false,
      themeId: template?.themeId || 11,
      copyrights: storeDisplayName,
      companyDescription: "",
      customerServiceHours: "9:00 AM - 6:00 PM",
      storeEmail: "",
      storeMobileNo: "",
      storeTelephone: "",
      telephone: "",
      phone: "",
      storeAddress: "",
      storeAddress1: "",
      storeAddress2: "",
      storeAddressLine1: "",
      storeAddressLine2: "",
      storeCity: "",
      storeState: "",
      storeCountry: "",
      storePostalCode: "",
      storeZipcode: "",
      data: {
        hasActiveSubscription: 1,
      },
    },
  ];
}

/**
 * Standard country list for dynamic adapters without calling Spurt API
 */
export function getStoreCountryList() {
  return [
    {
      countryId: 99,
      name: "India",
      isoCode2: "IN",
      isoCode3: "IND",
      country: { countryId: 99, name: "India", isoCode2: "IN" },
    },
    {
      countryId: 223,
      name: "United States",
      isoCode2: "US",
      isoCode3: "USA",
      country: { countryId: 223, name: "United States", isoCode2: "US" },
    },
    {
      countryId: 222,
      name: "United Kingdom",
      isoCode2: "GB",
      isoCode3: "GBR",
      country: { countryId: 222, name: "United Kingdom", isoCode2: "GB" },
    },
    {
      countryId: 38,
      name: "Canada",
      isoCode2: "CA",
      isoCode3: "CAN",
      country: { countryId: 38, name: "Canada", isoCode2: "CA" },
    },
    {
      countryId: 13,
      name: "Australia",
      isoCode2: "AU",
      isoCode3: "AUS",
      country: { countryId: 13, name: "Australia", isoCode2: "AU" },
    },
    {
      countryId: 81,
      name: "Germany",
      isoCode2: "DE",
      isoCode3: "DEU",
      country: { countryId: 81, name: "Germany", isoCode2: "DE" },
    },
    {
      countryId: 75,
      name: "France",
      isoCode2: "FR",
      isoCode3: "FRA",
      country: { countryId: 75, name: "France", isoCode2: "FR" },
    },
    {
      countryId: 221,
      name: "United Arab Emirates",
      isoCode2: "AE",
      isoCode3: "ARE",
      country: { countryId: 221, name: "United Arab Emirates", isoCode2: "AE" },
    },
    {
      countryId: 188,
      name: "Singapore",
      isoCode2: "SG",
      isoCode3: "SGP",
      country: { countryId: 188, name: "Singapore", isoCode2: "SG" },
    },
  ];
}

/**
 * Standard state/zone list for dynamic storefronts
 * providing states for India (99), US (223), UK (222), Canada (38), Australia (13), UAE (221), etc.
 */
export function getStoreStateList() {
  const india = { countryId: 99, name: "India", isoCode2: "IN" };
  const us = { countryId: 223, name: "United States", isoCode2: "US" };
  const uk = { countryId: 222, name: "United Kingdom", isoCode2: "GB" };
  const canada = { countryId: 38, name: "Canada", isoCode2: "CA" };
  const australia = { countryId: 13, name: "Australia", isoCode2: "AU" };
  const uae = { countryId: 221, name: "United Arab Emirates", isoCode2: "AE" };
  const germany = { countryId: 81, name: "Germany", isoCode2: "DE" };
  const france = { countryId: 75, name: "France", isoCode2: "FR" };
  const singapore = { countryId: 188, name: "Singapore", isoCode2: "SG" };

  return [
    // ── India (99) ──
    { zoneId: 1,  code: "AN", name: "Andaman and Nicobar Islands", countryId: 99, country: india },
    { zoneId: 2,  code: "AP", name: "Andhra Pradesh", countryId: 99, country: india },
    { zoneId: 3,  code: "AR", name: "Arunachal Pradesh", countryId: 99, country: india },
    { zoneId: 4,  code: "AS", name: "Assam", countryId: 99, country: india },
    { zoneId: 5,  code: "BR", name: "Bihar", countryId: 99, country: india },
    { zoneId: 6,  code: "CH", name: "Chandigarh", countryId: 99, country: india },
    { zoneId: 7,  code: "CG", name: "Chhattisgarh", countryId: 99, country: india },
    { zoneId: 8,  code: "DN", name: "Dadra and Nagar Haveli and Daman and Diu", countryId: 99, country: india },
    { zoneId: 9,  code: "DL", name: "Delhi", countryId: 99, country: india },
    { zoneId: 10, code: "GA", name: "Goa", countryId: 99, country: india },
    { zoneId: 11, code: "GJ", name: "Gujarat", countryId: 99, country: india },
    { zoneId: 12, code: "HR", name: "Haryana", countryId: 99, country: india },
    { zoneId: 13, code: "HP", name: "Himachal Pradesh", countryId: 99, country: india },
    { zoneId: 14, code: "JK", name: "Jammu and Kashmir", countryId: 99, country: india },
    { zoneId: 15, code: "JH", name: "Jharkhand", countryId: 99, country: india },
    { zoneId: 16, code: "KA", name: "Karnataka", countryId: 99, country: india },
    { zoneId: 17, code: "KL", name: "Kerala", countryId: 99, country: india },
    { zoneId: 18, code: "LA", name: "Ladakh", countryId: 99, country: india },
    { zoneId: 19, code: "LD", name: "Lakshadweep", countryId: 99, country: india },
    { zoneId: 20, code: "MP", name: "Madhya Pradesh", countryId: 99, country: india },
    { zoneId: 21, code: "MH", name: "Maharashtra", countryId: 99, country: india },
    { zoneId: 22, code: "MN", name: "Manipur", countryId: 99, country: india },
    { zoneId: 23, code: "ML", name: "Meghalaya", countryId: 99, country: india },
    { zoneId: 24, code: "MZ", name: "Mizoram", countryId: 99, country: india },
    { zoneId: 25, code: "NL", name: "Nagaland", countryId: 99, country: india },
    { zoneId: 26, code: "OR", name: "Odisha", countryId: 99, country: india },
    { zoneId: 27, code: "PY", name: "Puducherry", countryId: 99, country: india },
    { zoneId: 28, code: "PB", name: "Punjab", countryId: 99, country: india },
    { zoneId: 29, code: "RJ", name: "Rajasthan", countryId: 99, country: india },
    { zoneId: 30, code: "SK", name: "Sikkim", countryId: 99, country: india },
    { zoneId: 76, code: "TN", name: "Tamil Nadu", countryId: 99, country: india },
    { zoneId: 32, code: "TS", name: "Telangana", countryId: 99, country: india },
    { zoneId: 33, code: "TR", name: "Tripura", countryId: 99, country: india },
    { zoneId: 34, code: "UP", name: "Uttar Pradesh", countryId: 99, country: india },
    { zoneId: 35, code: "UK", name: "Uttarakhand", countryId: 99, country: india },
    { zoneId: 36, code: "WB", name: "West Bengal", countryId: 99, country: india },

    // ── United States (223) ──
    { zoneId: 201, code: "AL", name: "Alabama", countryId: 223, country: us },
    { zoneId: 202, code: "AK", name: "Alaska", countryId: 223, country: us },
    { zoneId: 203, code: "AZ", name: "Arizona", countryId: 223, country: us },
    { zoneId: 204, code: "AR", name: "Arkansas", countryId: 223, country: us },
    { zoneId: 205, code: "CA", name: "California", countryId: 223, country: us },
    { zoneId: 206, code: "CO", name: "Colorado", countryId: 223, country: us },
    { zoneId: 207, code: "CT", name: "Connecticut", countryId: 223, country: us },
    { zoneId: 208, code: "DE", name: "Delaware", countryId: 223, country: us },
    { zoneId: 209, code: "DC", name: "District of Columbia", countryId: 223, country: us },
    { zoneId: 210, code: "FL", name: "Florida", countryId: 223, country: us },
    { zoneId: 211, code: "GA", name: "Georgia", countryId: 223, country: us },
    { zoneId: 212, code: "HI", name: "Hawaii", countryId: 223, country: us },
    { zoneId: 213, code: "ID", name: "Idaho", countryId: 223, country: us },
    { zoneId: 214, code: "IL", name: "Illinois", countryId: 223, country: us },
    { zoneId: 215, code: "IN", name: "Indiana", countryId: 223, country: us },
    { zoneId: 216, code: "IA", name: "Iowa", countryId: 223, country: us },
    { zoneId: 217, code: "KS", name: "Kansas", countryId: 223, country: us },
    { zoneId: 218, code: "KY", name: "Kentucky", countryId: 223, country: us },
    { zoneId: 219, code: "LA", name: "Louisiana", countryId: 223, country: us },
    { zoneId: 220, code: "ME", name: "Maine", countryId: 223, country: us },
    { zoneId: 221, code: "MD", name: "Maryland", countryId: 223, country: us },
    { zoneId: 222, code: "MA", name: "Massachusetts", countryId: 223, country: us },
    { zoneId: 223, code: "MI", name: "Michigan", countryId: 223, country: us },
    { zoneId: 224, code: "MN", name: "Minnesota", countryId: 223, country: us },
    { zoneId: 225, code: "MS", name: "Mississippi", countryId: 223, country: us },
    { zoneId: 226, code: "MO", name: "Missouri", countryId: 223, country: us },
    { zoneId: 227, code: "MT", name: "Montana", countryId: 223, country: us },
    { zoneId: 228, code: "NE", name: "Nebraska", countryId: 223, country: us },
    { zoneId: 229, code: "NV", name: "Nevada", countryId: 223, country: us },
    { zoneId: 230, code: "NH", name: "New Hampshire", countryId: 223, country: us },
    { zoneId: 231, code: "NJ", name: "New Jersey", countryId: 223, country: us },
    { zoneId: 232, code: "NM", name: "New Mexico", countryId: 223, country: us },
    { zoneId: 233, code: "NY", name: "New York", countryId: 223, country: us },
    { zoneId: 234, code: "NC", name: "North Carolina", countryId: 223, country: us },
    { zoneId: 235, code: "ND", name: "North Dakota", countryId: 223, country: us },
    { zoneId: 236, code: "OH", name: "Ohio", countryId: 223, country: us },
    { zoneId: 237, code: "OK", name: "Oklahoma", countryId: 223, country: us },
    { zoneId: 238, code: "OR", name: "Oregon", countryId: 223, country: us },
    { zoneId: 239, code: "PA", name: "Pennsylvania", countryId: 223, country: us },
    { zoneId: 240, code: "RI", name: "Rhode Island", countryId: 223, country: us },
    { zoneId: 241, code: "SC", name: "South Carolina", countryId: 223, country: us },
    { zoneId: 242, code: "SD", name: "South Dakota", countryId: 223, country: us },
    { zoneId: 243, code: "TN", name: "Tennessee", countryId: 223, country: us },
    { zoneId: 244, code: "TX", name: "Texas", countryId: 223, country: us },
    { zoneId: 245, code: "UT", name: "Utah", countryId: 223, country: us },
    { zoneId: 246, code: "VT", name: "Vermont", countryId: 223, country: us },
    { zoneId: 247, code: "VA", name: "Virginia", countryId: 223, country: us },
    { zoneId: 248, code: "WA", name: "Washington", countryId: 223, country: us },
    { zoneId: 249, code: "WV", name: "West Virginia", countryId: 223, country: us },
    { zoneId: 250, code: "WI", name: "Wisconsin", countryId: 223, country: us },
    { zoneId: 251, code: "WY", name: "Wyoming", countryId: 223, country: us },

    // ── United Kingdom (222) ──
    { zoneId: 301, code: "ENG", name: "England", countryId: 222, country: uk },
    { zoneId: 302, code: "SCT", name: "Scotland", countryId: 222, country: uk },
    { zoneId: 303, code: "WLS", name: "Wales", countryId: 222, country: uk },
    { zoneId: 304, code: "NIR", name: "Northern Ireland", countryId: 222, country: uk },

    // ── Canada (38) ──
    { zoneId: 401, code: "ON", name: "Ontario", countryId: 38, country: canada },
    { zoneId: 402, code: "QC", name: "Quebec", countryId: 38, country: canada },
    { zoneId: 403, code: "BC", name: "British Columbia", countryId: 38, country: canada },
    { zoneId: 404, code: "AB", name: "Alberta", countryId: 38, country: canada },
    { zoneId: 405, code: "MB", name: "Manitoba", countryId: 38, country: canada },
    { zoneId: 406, code: "SK", name: "Saskatchewan", countryId: 38, country: canada },
    { zoneId: 407, code: "NS", name: "Nova Scotia", countryId: 38, country: canada },
    { zoneId: 408, code: "NB", name: "New Brunswick", countryId: 38, country: canada },
    { zoneId: 409, code: "NL", name: "Newfoundland and Labrador", countryId: 38, country: canada },
    { zoneId: 410, code: "PE", name: "Prince Edward Island", countryId: 38, country: canada },

    // ── Australia (13) ──
    { zoneId: 501, code: "NSW", name: "New South Wales", countryId: 13, country: australia },
    { zoneId: 502, code: "VIC", name: "Victoria", countryId: 13, country: australia },
    { zoneId: 503, code: "QLD", name: "Queensland", countryId: 13, country: australia },
    { zoneId: 504, code: "WA",  name: "Western Australia", countryId: 13, country: australia },
    { zoneId: 505, code: "SA",  name: "South Australia", countryId: 13, country: australia },
    { zoneId: 506, code: "TAS", name: "Tasmania", countryId: 13, country: australia },
    { zoneId: 507, code: "ACT", name: "Australian Capital Territory", countryId: 13, country: australia },
    { zoneId: 508, code: "NT",  name: "Northern Territory", countryId: 13, country: australia },

    // ── United Arab Emirates (221) ──
    { zoneId: 601, code: "DXB", name: "Dubai", countryId: 221, country: uae },
    { zoneId: 602, code: "AUH", name: "Abu Dhabi", countryId: 221, country: uae },
    { zoneId: 603, code: "SHJ", name: "Sharjah", countryId: 221, country: uae },
    { zoneId: 604, code: "AJM", name: "Ajman", countryId: 221, country: uae },
    { zoneId: 605, code: "RAK", name: "Ras Al Khaimah", countryId: 221, country: uae },
    { zoneId: 606, code: "FUJ", name: "Fujairah", countryId: 221, country: uae },
    { zoneId: 607, code: "UAQ", name: "Umm Al Quwain", countryId: 221, country: uae },

    // ── Singapore (188) ──
    { zoneId: 701, code: "SG", name: "Singapore", countryId: 188, country: singapore },

    // ── Germany (81) ──
    { zoneId: 801, code: "BY", name: "Bavaria", countryId: 81, country: germany },
    { zoneId: 802, code: "BE", name: "Berlin", countryId: 81, country: germany },
    { zoneId: 803, code: "BW", name: "Baden-Württemberg", countryId: 81, country: germany },
    { zoneId: 804, code: "NW", name: "North Rhine-Westphalia", countryId: 81, country: germany },

    // ── France (75) ──
    { zoneId: 901, code: "IDF", name: "Île-de-France", countryId: 75, country: france },
    { zoneId: 902, code: "ARA", name: "Auvergne-Rhône-Alpes", countryId: 75, country: france },
    { zoneId: 903, code: "PAC", name: "Provence-Alpes-Côte d'Azur", countryId: 75, country: france },
  ];
}

// Backward-compatibility aliases
export const getMedusaStoreSettings = getStoreSettingsFromConfig;
export const getMedusaCountryList = getStoreCountryList;
export const getMedusaStateList = getStoreStateList;
