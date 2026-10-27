import { getCookieValues } from "@/api/cookiesHelper/getCookieValuesForApi";

export async function storeSettingsData() {
    const cookieValues = await getCookieValues()   
    const rawStoreSettings = cookieValues?.storeSettings;  
    if (!rawStoreSettings) return [];
    try {
      const data = JSON.parse(rawStoreSettings);  
      return data;
    } catch {
      return [];
    }
  }
