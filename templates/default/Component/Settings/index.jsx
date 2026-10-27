"use client";
import { useAddons } from "@/GlobalComponents/useCommon/AddonProvider";
import { useTranslations } from "next-intl";
import { isRouteSupported } from "@/config/adapterRoutes";

import dynamic from "next/dynamic";

import Link from "next/link";
import SettingsSkeleton from "./settingSkeletonLoader";
const SettingsComponent = () => {
  const { Permission, loading, addons } = useAddons();
  const t = useTranslations();

  const tabs = [
    {
      routeType: "account",
      img: "my-account.svg",
      slugName: "default",
      heading: t("settings.account"),
      description: t("settings.accountDescription"),
    },
    {
      routeType: "orders",
      img: "my-orders.svg",
      slugName: "default",
      heading: t("settings.orders"),
      description: t("settings.ordersDescription"),
    },
    {
      routeType: "wishlist",
      img: "favourtie.svg",
      slugName: "default",
      heading: t("settings.wishlist"),
      description: t("settings.wishlistDescription"),
    },
  ];

  // slugName is to protect the particular module. It works upon permission is granted..

  if (loading) return <SettingsSkeleton />;
  const tabsInfo = tabs.filter((item) => {
    if (!isRouteSupported(item.routeType, { addons })) {
      return false;
    }
    return Permission?.[item.slugName] || item.slugName === "default";
  });

  return (
    <section className="mx-auto min-h-[calc(100vh-105px)] w-full max-w-360 p-4 md:p-[24px_20px]">
      <h1
        className="settings-header"
      >
        {t("settings.settingCaps")}
      </h1>

      <div className="grid grid-cols-1 gap-4 min-[1920px]:grid-cols-[repeat(auto-fit,minmax(430px,1fr))] sm:grid-cols-2 md:grid-cols-3">
        {tabsInfo?.map((tab) => (
          <Link
            prefetch={false}
            key={tab?.routeType}
            href={`/settings/${tab?.routeType}`}
            className="settings-card group"
          >
            <div className="settings-card-icon-wrapper">
              <img src={`/img/${tab?.img}`} alt="tabImage" />
            </div>
            <div>
              <h2 className="settings-card-title">
                {tab?.heading}
              </h2>
              <p className="settings-card-description">
                {tab?.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default SettingsComponent;
