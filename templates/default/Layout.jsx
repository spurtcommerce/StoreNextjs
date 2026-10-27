import React from "react";
import "./style.css";
import Header from "./Component/Headers";
import DefaultFooter from "./Component/Footers/Index";

const Layout = ({ children, storeSettings, token }) => {
  return (
    <>
      <Header storeSettings={storeSettings}/>
      <main>{children}</main>
      <DefaultFooter storeSettings={storeSettings} />
          </>
  );
};

export default Layout;

