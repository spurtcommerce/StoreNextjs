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
import { useAddons } from "@/GlobalComponents/useCommon/AddonProvider";
import useFooterServer from "@/GlobalComponents/useFooterFunc/useFooterServer";

// Build Query Params
const buildQueryParams = (countryId) => {
  return `countryId=${encodeURIComponent(countryId)}`;
};

const DefaultFooter = ({ storeSettings}) => {
  const { footerList, countryList } =  useFooterServer(storeSettings);
  const t = useTranslations("Footer");
  const pathname = usePathname();
  const settings = storeSettings?.[0] || {};
  const countryId = settings?.storeCountryId;
  const stateId = settings?.zoneId;
  const { addons, loading } = useAddons();

  

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

  return (
    <footer className="bg-white w-full">
      {/* Top Section */}
      <div className="bg-[var(--color)] text-[var(--color-gray-100)] py-[2rem]">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center lg:text-left px-6">
          {/* Customer Service */}
          <div className="flex flex-col items-start lg:items-start">
            <div className="flex items-start gap-4">
              <img src="/img/customer-service.svg" alt="Customer Service" />
              <div>
                <h3 className="font-semibold text-[var(--color-white)] mb-2 text-left">
                  {t("customerService")}
                </h3>
                {storeSettings?.[0]?.customerServiceHours && (
                  <p className="text-base text-white/85 text-left">
                    {storeSettings?.[0]?.customerServiceHours}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Call Us */}
          <div className="flex flex-col items-start lg:items-start">
            <div className="flex items-start gap-4">
              <img src="/img/call.svg" alt="Call Us" />
              <div>
                <h3 className="font-semibold text-[var(--color-white)] mb-2 text-left">
                  {t("callUs")}
                </h3>
                {(storeSettings?.[0]?.storeMobileNo ||
                  storeSettings?.[0]?.storeTelephone ||
                  storeSettings?.[0]?.telephone ||
                  storeSettings?.[0]?.phone) && (
                  <p className="text-base text-white/85 text-left">
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
          <div className="flex flex-col items-start lg:items-start">
            <div className="flex items-start gap-4">
              <img src="/img/get-in-touch.svg" alt="Get in Touch" />
              <div>
                <h3 className="font-semibold text-[var(--color-white)] mb-2 text-left">
                  {t("getInTouch")}
                </h3>
                {storeSettings?.[0]?.storeEmail && (
                  <p className="text-base text-white/85 text-left">
                    {storeSettings?.[0]?.storeEmail}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="flex flex-col items-start lg:items-start">
            <div className="flex items-start gap-4">
              <img src="/img/address.svg" alt="Address" />
              <div>
                <h3 className="font-semibold text-[var(--color-white)] mb-2 text-left">
                  {t("address")}
                </h3>
                {(storeSettings?.[0]?.storeAddress ||
                  storeSettings?.[0]?.storeAddressLine1 ||
                  storeSettings?.[0]?.storeAddress1 ||
                  storeSettings?.[0]?.storeAddressLine2 ||
                  storeSettings?.[0]?.storeCity ||
                  storeSettings?.[0]?.storeZipcode ||
                  storeSettings?.[0]?.storePostalCode) && (
                  <p className="text-base text-white/85 text-left capitalize">
                    {storeSettings?.[0]?.storeAddress
                      ? `${storeSettings?.[0]?.storeAddress}${
                          (storeSettings?.[0]?.storeZipcode || storeSettings?.[0]?.storePostalCode) &&
                          !storeSettings?.[0]?.storeAddress.includes(storeSettings?.[0]?.storeZipcode || storeSettings?.[0]?.storePostalCode)
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
                        }`}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section */}

      <div className="bg-white text-[var(--color-gray-800)] py-12 border-t border-[var(--color-gray-200)]">
        <div className="max-w-[1440px] mx-auto flex flex-wrap gap-10 px-6">
          <div className="flex-[1.6] min-w-[32%]">
            <h2 className="text-2xl font-bold mb-3">
              {storeSettings?.[0]?.siteName?.toLowerCase() === "test" ? "" : storeSettings?.[0]?.siteName}
            </h2>
            <p className="text-[var(--color-gray-600)] mb-6 leading-relaxed max-w-[75%]">
              {storeSettings?.[0]?.companyDescription}
            </p>
            <SocialIcons
              facebook={storeSettings?.[0]?.facebook}
              twitter={storeSettings?.[0]?.twitter}
              youtube={storeSettings?.[0]?.youtube}
              instagram={storeSettings?.[0]?.instagram}
              linkedin={storeSettings?.[0]?.linkedin}
            />
          </div>

          {uniqueFooterList &&
            uniqueFooterList
              ?.slice(0, 5)
              ?.map((data, idx) => (
              <Fragment key={idx}>
                <div className="flex-1 min-w-[140px]">
                  <h3 className="font-semibold mb-4 text-[var(--color-gray-900)]">
                    {data?.groupNameTrans
                      ? data?.groupNameTrans
                      : data?.groupName}
                  </h3>
                  <ul className="space-y-2 text-[var(--color-gray-700)]">
                    {data?.page?.map((datafooter, idx) => (
                      <li key={idx}>
                        <Link   prefetch={false}
                          href={`/pages/${datafooter?.slugName}`}
                          className="relative inline-block text-[var(--color-gray-700)] hover:text-[var(--color-gray-900)] group"
                        >
                          {datafooter?.pageTranslation?.title
                            ? datafooter?.pageTranslation?.title
                            : datafooter?.title}
                          <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-[var(--color-161d25)] transition-all duration-300 ease-in-out group-hover:w-full"></span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </Fragment>
            ))}
        </div>

        {uniqueFooterList?.length > 5 &&
          pathname !== "/view-more-pages" &&
          !pathname.includes("/pages/") && (
            <div className="max-w-[1440px] mx-auto flex items-center sm:justify-end px-6 pt-10 justify-center">
              <Link   prefetch={false}
                href="/view-more-pages"
                className="relative group hover:text-[var(--color-gray-900)] transition-colors duration-200 font-medium flex gap-1.5"
              >
                {t("viewMorePages")}
                <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-[var(--color-161d25)] transition-all duration-300 ease-in-out group-hover:w-full"></span>
                <img src="/img/arrow.svg" alt="" className="w-[15px]" />
              </Link>
            </div>
          )}
      </div>

      <div className="bg-white">
        <div className="max-w-[1440px] px-6 mx-auto">
          <div className=" border-t border-[var(--color-gray-200)] py-[24px]  flex flex-col md:flex-row items-center justify-between gap-4  text-sm text-[var(--color-161d25)]">
            {/* Left side */}
            <p>
              {`© 2025 ${storeSettings?.[0]?.siteName}. ${t("poweredBy")} ${
                storeSettings?.[0]?.copyrights
              }`}
            </p>

            {/* Right side */}
            <div className="flex space-x-6">
              {links?.map((item, index) => (
                <Link   prefetch={false}
                  key={index}
                  href={item?.href}
                  className="relative inline-block group hover:text-[var(--color-gray-900)] transition-colors duration-200"
                >
                  {item?.text}
                  <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-[var(--color-161d25)] transition-all duration-300 ease-in-out group-hover:w-full"></span>
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