import React from "react";
import AllProductListPageClient from "./Component/ProductList/Index";

const ProductListPage = ({
  token,
  storeSettings,
  initialCategorySlug,
  categoryName,
  initialKeyword,
  searchParams,
}) => {
  return (
    <>
      <AllProductListPageClient
        token={token}
        storeSettings={storeSettings}
        initialCategorySlug={initialCategorySlug}
        categoryName={categoryName}
        initialKeyword={initialKeyword}
        searchParams={searchParams}
      />
    </>
  );
};

export default ProductListPage;
