import ProductDetail from './Component/ProductDetail';
import React from 'react';

const ProductDetailPage = ({
  token,
  productSlug,
  categorySlug,
  productDetails,
  categoryIds,
}) => {
  return (
    <ProductDetail
      token={token}
      productSlug={productSlug}
      categorySlug={categorySlug}
      rawProduct={productDetails}
      categoryIds={categoryIds}
    />
  );
};

export default ProductDetailPage;
