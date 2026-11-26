"use client";

import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import SocialIcons from "./social-icons";
import Link from "next/link";
import { getStateListServerAPI } from "@/api/commonApi";
import { formatAddress } from "@/utilities/commonFunctions";
import { useGlobalProvider } from "@/GlobalComponents/Shared/Common";
import useFooterServer from "@/GlobalComponents/Hooks/useFooter/useFooterServer";
import { resolveStoreLogo, getDefaultStoreLogo } from "@/utilities/mediaResolver";

// Build Query Params
const buildQueryParams = (countryId) => {
  return `countryId=${encodeURIComponent(countryId)}`;
};

const DefaultFooter = ({ storeSettings: propStoreSettings }) => {
  const { footerList, countryList } = useFooterServer(propStoreSettings);
  const t = useTranslations("Footer");
  const pathname = usePathname();
  const { loading, storeSettings: contextStoreSettings } = useGlobalProvider();
  const hasContactData = (s) =>
    Boolean(
      s?.storeEmail ||
        s?.email ||
        s?.contactEmail ||
        s?.storeMobileNo ||
        s?.storeTelephone ||
        s?.telephone ||
        s?.phone ||
        s?.storeAddress ||
        s?.address ||
        s?.storeAddressLine1 ||
        s?.storeAddress1
    );
  const storeSettings = hasContactData(propStoreSettings?.[0])
    ? propStoreSettings
    : hasContactData(contextStoreSettings?.[0])
      ? contextStoreSettings
      : propStoreSettings?.length > 0
        ? propStoreSettings
        : contextStoreSettings || propStoreSettings;
  const settings = storeSettings?.[0] || {};
  const countryId = settings?.storeCountryId;
  const stateId = settings?.zoneId;

  

  const [stateList, setStateList] = useState([]);

  const modifiedCountryData = useMemo(() => {
    return (
      countryList?.map((info) => ({
        label: info?.country?.name,
        value: info?.country?.countryId,
      })) || []
    );
  }, [countryList]);

  const uniqueFooterList = useMemo(() => {
    if (!Array.isArray(footerList)) return [];
    const groupMap = new Map();

    footerList.forEach((item) => {
      const groupKey = (item?.groupName || item?.groupNameTrans || "").trim();
      if (!groupKey || groupKey.toLowerCase() === "test") return;

      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, {
          ...item,
          groupName: groupKey,
          page: [],
        });
      }

      const existingGroup = groupMap.get(groupKey);
      if (Array.isArray(item?.page)) {
        item.page.forEach((p) => {
          const pageKey = p?.slugName || p?.pageId || p?.title;
          const pageExists = existingGroup.page.some(
            (ep) => (ep?.slugName || ep?.pageId || ep?.title) === pageKey
          );
          if (!pageExists) {
            existingGroup.page.push(p);
          }
        });
      }
    });

    return Array.from(groupMap.values());
  }, [footerList]);

  const getFooterHref = (item) => {
    if (item?.href) {
      if (
        item.href === "/pages/compare" ||
        item.href === "/pages/product-compare" ||
        item.href === "/compare"
      ) {
        return "/product-compare";
      }
      return item.href;
    }
    const slug = (item?.slugName || "").toLowerCase().trim();
    const title = (
      item?.pageTranslation?.title ||
      item?.title ||
      ""
    ).toLowerCase().trim();
    if (
      slug === "compare" ||
      slug === "product-compare" ||
      slug === "compare-products" ||
      title === "compare" ||
      title === "product compare"
    ) {
      return "/product-compare";
    }
    return `/pages/${item?.slugName}`;
  };

  const displayFooterList = useMemo(() => {
    if (uniqueFooterList && uniqueFooterList.length > 0) return uniqueFooterList;
    return [
      {
        pageGroupId: "default-info",
        groupName: "Information",
        groupNameTrans: "Information",
        page: [
          {
            slugName: "terms-of-service",
            title: t("termsOfService") || "Terms of Service",
            href: "/terms-of-service",
          },
          {
            slugName: "privacy-policy",
            title: t("privacyPolicy") || "Privacy Policy",
            href: "/privacy-policy",
          },
          {
            slugName: "product-compare",
            title: "Compare",
            href: "/product-compare",
          },
        ],
      },
    ];
  }, [uniqueFooterList, t]);

  const getStateListApiFunction = useCallback(async (countryId) => {
    if (!countryId) return;
    const queryParams = buildQueryParams(countryId);
    const response = await getStateListServerAPI(queryParams);

    setStateList(
      response?.map((info) => ({
        stateId: info?.zoneId,
        stateName: info?.name,
      })) || []
    );
  }, []);

  useEffect(() => {
    getStateListApiFunction(countryId);
  }, [countryId, getStateListApiFunction]);

  const countryName = useMemo(() => {
    return modifiedCountryData?.find((c) => c.value === countryId)?.label || "";
  }, [countryId, modifiedCountryData]);

  const stateName = useMemo(() => {
    return stateList?.find((s) => s?.stateId === stateId)?.stateName || "";
  }, [stateId, stateList]);

  const links = [
    { text: t("termsOfService"), href: "/terms-of-service" },
    { text: t("privacyPolicy"), href: "/privacy-policy" },
  ];

  if (pathname?.startsWith("/manage")) {
    return null;
  }

  return (
    <footer className="bg-white w-full">
      {/* Top Section */}
      <div className="w-full bg-[#1E7B1E] text-white py-[2rem]">
        <div className="w-full max-w-[1440px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center lg:text-left px-[16px] md:px-[20px]">

          {/* Customer Service */}
          <div className="flex flex-col items-start lg:items-start min-w-0">
            <div className="flex items-start gap-4 min-w-0">
              <img src="/img/customer-service.svg" alt="Customer Service" className="shrink-0" />
              <div className="min-w-0">
                <h3 className="font-semibold text-[var(--color-white)] mb-2 text-left">
                  {t("customerService")}
                </h3>
                {storeSettings?.[0]?.customerServiceHours && (
                  <p className="text-base text-white/85 text-left break-words">
                    {storeSettings?.[0]?.customerServiceHours}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Call Us */}
          <div className="flex flex-col items-start lg:items-start min-w-0">
            <div className="flex items-start gap-4 min-w-0">
              <img src="/img/call.svg" alt="Call Us" className="shrink-0" />
              <div className="min-w-0">
                <h3 className="font-semibold text-[var(--color-white)] mb-2 text-left">
                  {t("callUs")}
                </h3>
                {(storeSettings?.[0]?.storeMobileNo ||
                  storeSettings?.[0]?.storeTelephone ||
                  storeSettings?.[0]?.telephone ||
                  storeSettings?.[0]?.phone) && (
                  <p className="text-base text-white/85 text-left break-words">
                    {storeSettings?.[0]?.storeMobileNo ||
                      storeSettings?.[0]?.storeTelephone ||
                      storeSettings?.[0]?.telephone ||
                      storeSettings?.[0]?.phone}{" "}
                    <span className="text-white/70">({t("tollFree")})</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Get in Touch */}
          <div className="flex flex-col items-start lg:items-start min-w-0">
            <div className="flex items-start gap-4 min-w-0">
              <img src="/img/get-in-touch.svg" alt="Get in Touch" className="shrink-0" />
              <div className="min-w-0">
                <h3 className="font-semibold text-[var(--color-white)] mb-2 text-left">
                  {t("getInTouch")}
                </h3>
                {(storeSettings?.[0]?.storeEmail ||
                  storeSettings?.[0]?.email ||
                  storeSettings?.[0]?.contactEmail) && (
                  <p className="text-base text-white/85 text-left break-words">
                    {storeSettings?.[0]?.storeEmail ||
                      storeSettings?.[0]?.email ||
                      storeSettings?.[0]?.contactEmail}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="flex flex-col items-start lg:items-start min-w-0 w-full">
            <div className="flex items-start gap-4 min-w-0 w-full">
              <img src="/img/address.svg" alt="Address" className="shrink-0 mt-1" />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-[var(--color-white)] mb-2 text-left">
                  {t("address")}
                </h3>
                {(storeSettings?.[0]?.storeAddress ||
                  storeSettings?.[0]?.address ||
                  storeSettings?.[0]?.storeAddressLine1 ||
                  storeSettings?.[0]?.storeAddress1 ||
                  storeSettings?.[0]?.storeAddressLine2 ||
                  storeSettings?.[0]?.storeAddress2 ||
                  storeSettings?.[0]?.storeCity ||
                  storeSettings?.[0]?.storeZipcode ||
                  storeSettings?.[0]?.storePostalCode) && (
                  <p className="text-base text-white/85 text-left capitalize break-words whitespace-normal">
                    {((storeSettings?.[0]?.storeAddress || storeSettings?.[0]?.address)
                      ? `${storeSettings?.[0]?.storeAddress || storeSettings?.[0]?.address}${
                          (storeSettings?.[0]?.storeZipcode || storeSettings?.[0]?.storePostalCode) &&
                          !(storeSettings?.[0]?.storeAddress || storeSettings?.[0]?.address).includes(storeSettings?.[0]?.storeZipcode || storeSettings?.[0]?.storePostalCode)
                            ? ` - ${storeSettings?.[0]?.storeZipcode || storeSettings?.[0]?.storePostalCode}`
                            : ""
                        }`
                      : `${formatAddress([
                          storeSettings?.[0]?.storeAddressLine1 || storeSettings?.[0]?.storeAddress1,
                          storeSettings?.[0]?.storeAddressLine2 || storeSettings?.[0]?.storeAddress2,
                          storeSettings?.[0]?.storeCity,
                          storeSettings?.[0]?.storeState || stateName,
                          storeSettings?.[0]?.storeCountry || countryName,
                        ])}${
                          (storeSettings?.[0]?.storeZipcode || storeSettings?.[0]?.storePostalCode)
                            ? ` - ${storeSettings?.[0]?.storeZipcode || storeSettings?.[0]?.storePostalCode}`
                            : ""
                        }`
                    ).replace(/\u00A0/g, " ")}
                  </p>
                )}
              </div>
            </div>
          </div>


        </div>
      </div>

      {/* Middle Section */}

      <div className="bg-white text-[var(--color-202124)] py-12 border-t border-gray-200">
        <div className="w-full max-w-[1440px] mx-auto flex flex-wrap gap-10 px-[16px] md:px-[20px]">
          <div className="flex-[1.6] min-w-[260px] sm:min-w-[32%]">
            <div className="mb-4">
              <Link href="/">
                <img
                  src={resolveStoreLogo(storeSettings) || "/img/spurt-logo.svg"}
                  alt={storeSettings?.[0]?.storeName ?? "Store"}
                  className="h-10 w-auto object-contain"
                  onError={({ currentTarget }) => {
                    currentTarget.src = "/img/spurt-logo.svg";
                  }}
                />
              </Link>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed max-w-[75%]">
              {storeSettings?.[0]?.companyDescription || storeSettings?.[0]?.metaTagDescription || ""}
            </p>
            <SocialIcons
              facebook={storeSettings?.[0]?.facebook}
              twitter={storeSettings?.[0]?.twitter}
              youtube={storeSettings?.[0]?.youtube}
              instagram={storeSettings?.[0]?.instagram}
              linkedin={storeSettings?.[0]?.linkedin}
            />
          </div>

          {displayFooterList &&
            displayFooterList
              ?.slice(0, 5)
              ?.map((data, idx) => (
              <Fragment key={idx}>
                <div className="flex-1 min-w-[140px]">
                  <h3 className="font-semibold mb-4 text-black">
                    {data?.groupNameTrans
                      ? data?.groupNameTrans
                      : data?.groupName}
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    {data?.page?.map((datafooter, pIdx) => (
                      <li key={pIdx}>
                        <Link   prefetch={false}
                          href={getFooterHref(datafooter)}
                          className="relative inline-block text-gray-700 hover:text-black group transition-colors duration-200"
                        >
                          {datafooter?.pageTranslation?.title
                            ? datafooter?.pageTranslation?.title
                            : datafooter?.title}
                          <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-black transition-all duration-300 ease-in-out group-hover:w-full"></span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </Fragment>
            ))}
        </div>

        {displayFooterList?.length > 5 &&
          pathname !== "/view-more-pages" &&
          !pathname.includes("/pages/") && (
            <div className="w-full max-w-[1440px] mx-auto flex items-center sm:justify-end px-[16px] md:px-[20px] pt-10 justify-center">
              <Link   prefetch={false}
                href="/view-more-pages"
                className="relative group text-gray-700 hover:text-black transition-colors duration-200 font-medium flex gap-1.5"
              >
                {t("viewMorePages")}
                <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-black transition-all duration-300 ease-in-out group-hover:w-full"></span>
                <img src="/img/arrow.svg" alt="" className="w-[15px]" />
              </Link>
            </div>
          )}
      </div>

      <div className="bg-white text-black">
        <div className="w-full max-w-[1440px] px-[16px] md:px-[20px] mx-auto">
          <div className=" border-t border-gray-200 py-[24px]  flex flex-col md:flex-row items-center justify-between gap-4  text-sm text-gray-700">
            {/* Left side */}
            <p className="text-gray-700">
              {`© 2025 ${storeSettings?.[0]?.siteName || storeSettings?.[0]?.storeName || "Store"}. ${t("poweredBy")} ${
                storeSettings?.[0]?.copyrights || storeSettings?.[0]?.siteName || storeSettings?.[0]?.storeName || "Store"
              }`}
            </p>

            {/* Right side */}
            <div className="flex space-x-6">
              {links?.map((item, index) => (
                <Link   prefetch={false}
                  key={index}
                  href={item?.href}
                  className="relative inline-block text-gray-700 hover:text-black transition-colors duration-200 group"
                >
                  {item?.text}
                  <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-black transition-all duration-300 ease-in-out group-hover:w-full"></span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default DefaultFooter;