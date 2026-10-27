import React from "react";
import AllProductListPageClient from "./Component/ProductList/Index";

const ProductListPage = ({
  token,
  storeSettings,
  initialCategorySlug,
  categoryName,
}) => {
  return (
    <>
      <AllProductListPageClient
        token={token}
        storeSettings={storeSettings}
        initialCategorySlug={initialCategorySlug}
        categoryName={categoryName}
      />
    </>
  );
};

export default ProductListPage;
