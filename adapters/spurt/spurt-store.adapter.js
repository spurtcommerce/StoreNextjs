import axiosInstance from "./spurt-client.js";
import { getStoreSettingsFromConfig } from "../models/registry/store-adapter.helper.js";
import { extractStoreSocialLinks } from "@/utilities/socialLinks";

let inFlightFooterPromise = null;
let cachedFooterList = null;

let inFlightAddonPromise = null;
let cachedAddonList = null;

let inFlightLanguagePromise = null;
let cachedLanguageList = null;

export class SpurtStoreAdapter {
  async getStoreSettings() {
    try {
      const { data } = await axiosInstance.get("vendor-store/store-setting");
      if (data?.status == 1 && data?.data) {
        const list = Array.isArray(data.data) ? data.data : [data.data];
        return list.map((item) => {
          if (!item || typeof item !== "object") return item;
          const social = extractStoreSocialLinks(item);
          return {
            ...item,
            facebook: social.facebook || item.facebook || "",
            twitter: social.twitter || item.twitter || "",
            instagram: social.instagram || item.instagram || "",
            youtube: social.youtube || item.youtube || "",
            linkedin: social.linkedin || item.linkedin || "",
            pinterest: social.pinterest || item.pinterest || "",
          };
        });
      }
      return getStoreSettingsFromConfig("spurt");
    } catch {
      return getStoreSettingsFromConfig("spurt");
    }
  }

  async getFooterList() {
    if (cachedFooterList && Array.isArray(cachedFooterList) && cachedFooterList.length > 0) {
      return cachedFooterList;
    }
    if (inFlightFooterPromise) {
      return inFlightFooterPromise;
    }

    inFlightFooterPromise = (async () => {
      try {
        const { data } = await axiosInstance.get("pages");
        if (data?.status == 1 && Array.isArray(data?.data)) {
          cachedFooterList = data.data;
          return data.data;
        }
        return data?.status == 1 ? data?.data : [];
      } catch {
        return [];
      } finally {
        inFlightFooterPromise = null;
      }
    })();

    return inFlightFooterPromise;
  }

  async getFooterPageDetail(params) {
    try {
      const { data } = await axiosInstance.get(`pages/${params}`);
      return data?.status == 1 ? data?.data : [];
    } catch {
      return [];
    }
  }

  async getAddonList() {
    if (cachedAddonList && Array.isArray(cachedAddonList) && cachedAddonList.length > 0) {
      return cachedAddonList;
    }
    if (inFlightAddonPromise) {
      return inFlightAddonPromise;
    }

    inFlightAddonPromise = (async () => {
      try {
        const { data } = await axiosInstance.get("addon");
        if (data?.status == 1 && Array.isArray(data?.data)) {
          cachedAddonList = data.data;
          return data.data;
        }
        return data?.status == 1 ? data?.data : [];
      } catch {
        return [];
      } finally {
        inFlightAddonPromise = null;
      }
    })();

    return inFlightAddonPromise;
  }

  async getLanguageList() {
    if (cachedLanguageList && Array.isArray(cachedLanguageList) && cachedLanguageList.length > 0) {
      return cachedLanguageList;
    }
    if (inFlightLanguagePromise) {
      return inFlightLanguagePromise;
    }

    inFlightLanguagePromise = (async () => {
      try {
        const { data } = await axiosInstance.get("list/language-list");
        if (data?.status == 1 && Array.isArray(data?.data)) {
          cachedLanguageList = data.data;
          return data.data;
        }
        return data?.status == 1 ? data?.data : [];
      } catch {
        return [];
      } finally {
        inFlightLanguagePromise = null;
      }
    })();

    return inFlightLanguagePromise;
  }
}

export default SpurtStoreAdapter;
