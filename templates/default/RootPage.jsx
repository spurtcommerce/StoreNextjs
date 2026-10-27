"use client";

import Banner from "./Component/Banner";
import Widgets from "@/GlobalComponents/Widget";

const RootPage = ({ token, bannerList,storeSettings, WidgetList }) => {

  return (
    <>
      <div className="mx-auto max-w-[1440px] p-[16px] md:p-[16px_20px_20px]">
        <Banner token={token} bannerList={bannerList} WidgetList={WidgetList} />
        <Widgets token={token} WidgetListServer={WidgetList} />
      </div>
    </>
  );
};

export default RootPage;
