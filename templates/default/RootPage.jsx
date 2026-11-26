"use client";

import React, { useMemo } from "react";
import Banner from "./Component/Banner";
import Widgets from "@/GlobalComponents/Widgets/Widget";
import FeaturedProducts from "./Component/FeaturedProducts";
import { isMedusaAdapter } from "@/config/adapter.config";

const RootPage = ({
  token,
  bannerList,
  storeSettings,
  WidgetList,
  featuredProducts = [],
}) => {
  const displayWidgets = useMemo(() => {
    if (!Array.isArray(WidgetList)) return [];
    if (featuredProducts && featuredProducts.length > 0) {
      return WidgetList.filter((w) => {
        const slug = String(w?.widgetSlugName || w?.slug || "").toLowerCase();
        const title = String(w?.widgetTitle || w?.name || "").toLowerCase();
        return (
          slug !== "featured" &&
          slug !== "featured-products" &&
          title !== "featured products"
        );
      });
    }
    return WidgetList;
  }, [WidgetList, featuredProducts]);

  return (
    <>
      <div className="mx-auto max-w-[1440px] p-[16px] md:p-[16px_20px_20px]">
        <Banner token={token} bannerList={bannerList} WidgetList={WidgetList} />
        {!isMedusaAdapter() && (
          <FeaturedProducts token={token} featuredProducts={featuredProducts} />
        )}
        <Widgets token={token} WidgetListServer={displayWidgets} />
      </div>
    </>
  );
};

export default RootPage;
