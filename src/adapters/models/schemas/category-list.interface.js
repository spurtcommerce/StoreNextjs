/**
 * Creates a normalized CommonCategoryRow DTO matching Spurt category schema
 * @param {Partial<CommonCategoryRow>} partial
 * @returns {Object}
 */
export const createCommonCategoryRow = (partial = {}) => {
  return {
    categoryId: partial.categoryId ?? "",
    name: partial.name ?? "",
    categoryDescription: partial.categoryDescription ?? "",
    image: partial.image ?? null,
    imagePath: partial.imagePath ?? null,
    parentInt: partial.parentInt ?? 0,
    sortOrder: partial.sortOrder ?? 1,
    categorySlug: partial.categorySlug ?? "",
    isActive: partial.isActive ?? "1",
    languageId: partial.languageId ?? null,
    categoryNameTrans: partial.categoryNameTrans ?? "",
    categoryDescriptionTrans: partial.categoryDescriptionTrans ?? "",
    children: partial.children ?? [],
    ...partial,
  };
};

/**
 * Creates a normalized CommonCategoryListResponse DTO
 * @param {Object} options
 * @param {number} [options.status=1]
 * @param {string} [options.message="Successfully got the list of categories"]
 * @param {Array<Object>} [options.data=[]]
 * @returns {Object}
 */
export const createCommonCategoryListResponse = ({
  status = 1,
  message = "Successfully got the list of categories",
  data = [],
} = {}) => {
  return {
    status,
    message,
    data,
  };
};
