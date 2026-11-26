import React from "react";
import "./style.css";
import Header from "./Component/Headers";
import DefaultFooter from "./Component/Footers/Index";
import CompareFloatingBar from "@/GlobalComponents/Features/CompareFloatingBar";

const Layout = ({ children, storeSettings, token }) => {
  return (
    <>
      <Header storeSettings={storeSettings} token={token} />
      <main>{children}</main>
      <CompareFloatingBar />
      <DefaultFooter storeSettings={storeSettings} />
    </>
  );
};

export default Layout;

