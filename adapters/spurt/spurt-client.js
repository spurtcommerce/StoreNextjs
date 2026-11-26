import axios from "axios";
import {
  getAppId,
  getIndustrySlug,
  getReferer,
  getSpurtEndpoint,
} from "../../utilities/url.js";
import {
  getClientAuthToken,
  normalizeBearerToken,
} from "../../utilities/tokenHelper.js";
import { getCookieValues } from "../../api/cookiesHelper/getCookieValuesForApi.js";

/**
 * Dedicated, self-contained HTTP client for the Spurt commerce adapter.
 * Eliminates circular dependencies on src/api/interceptor and next/navigation,
 * allowing the adapter to be bundled and executed in both root and standalone environments.
 */
const axiosInstance = axios.create({
  timeout: Number(process.env.NEXT_PUBLIC_AXIOS_TIMEOUT) || 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

function setHeader(headers, key, value) {
  if (!headers) return;
  if (typeof headers.set === "function") {
    headers.set(key, value);
  }
  headers[key] = value;
}

function deleteHeader(headers, key) {
  if (!headers) return;
  if (typeof headers.delete === "function") {
    headers.delete(key);
  }
  delete headers[key];
}

function hasHeader(headers, key) {
  if (!headers) return false;
  if (typeof headers.has === "function") {
    return headers.has(key);
  }
  const lower = key.toLowerCase();
  return Object.keys(headers).some((k) => k.toLowerCase() === lower && Boolean(headers[k]));
}

async function resolveServerReferer() {
  const configured = getReferer();
  if (configured) return configured;
  if (typeof window !== "undefined") return "";
  try {
    const nextHeaders = require("next/headers");
    const headersList = await nextHeaders.headers();
    const host = headersList?.get?.("host");
    if (host) {
      const proto = headersList.get("x-forwarded-proto") || "http";
      return `${proto}://${host}/`;
    }
  } catch {}
  return "";
}

axiosInstance.interceptors.request.use(async (config) => {
  const base = getSpurtEndpoint() || "https://spurt-api.spurtb2c.store/api/";
  config.baseURL = base;

  const cookieValues = await getCookieValues().catch(() => ({}));

  let token = getClientAuthToken();
  if (!token && cookieValues?.BearerToken) {
    token = normalizeBearerToken(cookieValues.BearerToken);
  }
  if (token && !hasHeader(config.headers, "Authorization")) {
    setHeader(config.headers, "Authorization", `Bearer ${token}`);
  }

  for (const staleKey of ["appid", "appId", "Appid", "AppId"]) {
    deleteHeader(config.headers, staleKey);
  }
  const currentAppId = getAppId();
  if (currentAppId && currentAppId !== "undefined" && currentAppId !== "null") {
    setHeader(config.headers, "app-id", currentAppId);
  } else {
    deleteHeader(config.headers, "app-id");
  }

  deleteHeader(config.headers, "Industry");
  const currentIndustry = getIndustrySlug() || "furniture";
  if (currentIndustry && currentIndustry !== "undefined" && currentIndustry !== "null") {
    setHeader(config.headers, "industry", currentIndustry);
  } else {
    deleteHeader(config.headers, "industry");
  }

  if (typeof window === "undefined" && !hasHeader(config.headers, "Referer")) {
    const currentReferer = await resolveServerReferer();
    if (currentReferer) {
      setHeader(config.headers, "Referer", currentReferer);
    }
  }

  if (cookieValues?.languageKeyvalue && !hasHeader(config.headers, "languagekey")) {
    let langKey = cookieValues.languageKeyvalue;
    try {
      langKey = JSON.parse(decodeURIComponent(langKey));
    } catch {
      try {
        langKey = decodeURIComponent(langKey);
      } catch {}
    }
    if (langKey) {
      setHeader(config.headers, "languagekey", langKey);
    }
  }

  return config;
});

export { axiosInstance, axiosInstance as spurtClient };
export default axiosInstance;
