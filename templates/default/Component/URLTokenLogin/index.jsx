"use client";
// React
import { useEffect } from "react";

// Utils
import { setCookie } from "@/utilities/cookies";

// 3rd Party
import { ToastMessage } from "@/utilities/toast";

const URLTokenLogin = ({ searchParamToken, token }) => {
  useEffect(() => {
    const storeTokenInCookie = async () => {
      // Save token
      await setCookie("BearerToken", searchParamToken);
      ToastMessage({ type: "success", message: "Logged in Successfully" });
    };

    if (searchParamToken) {
      storeTokenInCookie();
    }
  }, [searchParamToken]);

  useEffect(() => {
    const clearUrl = () => {
      // Remove token from URL without reload
      const url = new URL(window.location.href);
      url.searchParams.delete("token");
      window.history.replaceState({}, document.title, url.toString());
    };

    if (token) {
      clearUrl();
    }
  }, [token]);

  return;
};

export default URLTokenLogin;
