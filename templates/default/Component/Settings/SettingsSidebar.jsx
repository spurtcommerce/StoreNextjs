"use client";
// Nextjs
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

// Third-party

const loadMaterialtailwind = (ui) =>
  dynamic(() => import("@material-tailwind/react").then((mod) => mod[ui]));

const Tabs = loadMaterialtailwind("Tabs");
const TabsHeader = loadMaterialtailwind("TabsHeader");
const Tab = loadMaterialtailwind("Tab");

// context
import { useAddons } from "@/GlobalComponents/useCommon/AddonProvider";

// Utilities
import { isRouteSupported } from "@/config/adapterRoutes";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const SettingsSidebar = ({ children }) => {
  const t = useTranslations();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasCookie = document.cookie
        .split("; ")
        .some((c) =>
          c.startsWith("BearerToken=") ||
          c.startsWith("token=") ||
          c.startsWith("medusa_auth_token=")
        );
      const hasStorage = !!(
        localStorage.getItem("BearerToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("medusa_auth_token")
      );
      if (!hasCookie && !hasStorage) {
        router.replace("/");
      }
    }
  }, [router]);

  const { addons } = useAddons();

  const pathname = usePathname();
  const isSettingsHome = pathname === "/settings";
  const currentPath = pathname.includes("/settings/")
    ? pathname.split("/settings/")[1]?.split("/")[0]
    : "";


  const tabClass = (name) =>
    `${currentPath === name ? "border-[var(--color-161d25)]" : "border-[var(--color-transparent)]"} 
    font-normal w-full items-start justify-start border-solid p-[8px_0] 
    text-start text-sm leading-[19px] text-[var(--color-161d25)] transition-all
    duration-300 max-md:border-b-[2px] md:p-[8px] !rounded-[6px]`;

  return isSettingsHome ? (
    children
  ) : (
    <div className="flex min-h-[calc(100vh-105px)] grow flex-col bg-[var(--color-f9fafc)]">
      <div className="mx-auto flex h-full w-full max-w-360 grow flex-col bg-[var(--color-white)]">
        <Tabs
          value={currentPath}
          className="flex grow flex-col md:grid md:grid-cols-[200px_1fr]"
        >
          <div className="sticky top-0 h-full min-w-50 overflow-auto bg-[var(--color-white)] max-md:bg-[var(--color-f9fafc)]">
            <h3 className="mt-4 ml-5 px-2 text-[12px] leading-4.5 font-medium text-[var(--color-767676)] max-md:hidden">
              {t("sidebar.settings")}
            </h3>

            <TabsHeader
              className="rounded-none bg-[var(--color-f9fafc)] p-[16px] [scrollbar-width:none] max-md:gap-[24px] max-md:border-e-0 max-md:border-b max-md:p-[0_16px] max-sm:w-max max-sm:min-w-max md:flex-col md:bg-[var(--color-white)]"
              indicatorProps={{
                className:
                  "bg-[color-mix(in_srgb,var(--btn-bg,var(--color-161d25))_18%,transparent)] text-start shadow-none !items-start !rounded-[6px]",
              }}
            >
              {/* Addrerss Book */}
              <Link prefetch={false} href="/settings/account">
                <Tab value="account" className={`${tabClass("account")}`}>
                  <span
                    aria-label="orders"
                    className="flex items-center gap-[8px]"
                  >
                    <img src="/img/my-account-icon.svg" alt="accountIcon" />
                    {t("sidebar.account")}
                  </span>
                </Tab>
              </Link>

              {/* My Orders */}
              <Link prefetch={false} href="/settings/orders">
                <Tab value="orders" className={tabClass("orders")}>
                  <span
                    aria-label="orders"
                    className="flex items-center gap-[8px]"
                  >
                    <img src="/img/my-order-icon.svg" alt="OrderIcon" />
                    {t("sidebar.orders")}
                  </span>
                </Tab>
              </Link>


              {/* My Wishlist */}
              <Link prefetch={false} href="/settings/wishlist">
                <Tab value="wishlist" className={tabClass("wishlist")}>
                  <span
                    aria-label="wishlist"
                    className="flex items-center gap-[8px]"
                  >
                    <img
                      src="/img/favourtie-black.svg"
                      alt="usersIcon"
                      width={15}
                    />
                    {t("sidebar.wishlist")}
                  </span>
                </Tab>
              </Link>
              {/* )} */}

              </TabsHeader>
          </div>
          {children}
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsSidebar;
