"use client";
import React from "react";
import { ChevronUp, ChevronDown, RotateCcw, X, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { CustomCheckbox, CustomRadio, FilterItem } from "./FilterControls";
import PriceRangeSlider from "./PriceRangeSlider";
import CategoryTreeItem from "./CategoryTreeItem";
import { CategorySidebarSkeleton } from "../../SkeletonLoader";

/**
 * FilterSidebar Desktop & Mobile Drawer components
 */
export const FilterSidebar = ({
  filters,
  categoryList,
  isCategoryLoading,
}) => {
  const t = useTranslations();
  const {
    categoriesOpen,
    setCategoriesOpen,
    priceOpen,
    setPriceOpen,
    variantsOpen,
    setVariantsOpen,
    attributesOpen,
    setAttributesOpen,
    categorySearch,
    setCategorySearch,
    priceOption,
    setPriceOption,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    selectedSizes,
    setSelectedSizes,
    selectedColors,
    setSelectedColors,
    selectedMaterials,
    setSelectedMaterials,
    inStockOnly,
    setInStockOnly,
    selectedVariantItems,
    setSelectedVariantItems,
    selectedAttributeItems,
    setSelectedAttributeItems,
    expandedCategories,
    toggleExpandCategory,
    toggleArrayItem,
    handleCategoryClick,
    clearAllFilters,
    showExtraFilters,
    storeCurrencySymbol,
    apiVariantSections,
    apiAttributeSections,
    minCalculatedPrice,
    maxCalculatedPrice,
    dynamicVariants,
    dynamicMaterials,
    inStockCount,
    categoryTitle,
    filteredCategoryList,
    categoryCounts,
    totalAllCount,
    hasActiveFilters,
    totalCount,
    selectedCategory,
  } = filters;

  const norm = (s) => String(s || "").toLowerCase().replace(/[-_\s&]+/g, " ").trim();

  const isAnyCategoryActive = React.useMemo(() => {
    if (!selectedCategory || !filteredCategoryList?.length) return false;
    const target = String(selectedCategory).toLowerCase().trim();
    const targetNorm = norm(target);

    const checkList = (list) => {
      return list?.some((cat) => {
        const cSlug = String(cat?.categorySlug || cat?.slug || "").toLowerCase().trim();
        const cName = String(cat?.categoryNameTrans || cat?.categoryName || cat?.name || "").toLowerCase().trim();
        const cId = String(cat?.categoryId || "").toLowerCase().trim();
        const matched = Boolean(
          (cSlug && cSlug === target) ||
          (cName && cName === target) ||
          (cId && cId === target) ||
          (cSlug && norm(cSlug) === targetNorm) ||
          (cName && norm(cName) === targetNorm) ||
          (cSlug && (target.includes(cSlug) || cSlug.includes(target))) ||
          (cName && (target.includes(cName) || cName.includes(target)))
        );
        const children = cat?.children || cat?.child;
        return matched || (Array.isArray(children) && checkList(children));
      });
    };

    return checkList(filteredCategoryList);
  }, [selectedCategory, filteredCategoryList]);

  const hasAttributes = Boolean(
    (apiAttributeSections &&
      apiAttributeSections.some(
        (sec) => Array.isArray(sec?.sectionItem) && sec.sectionItem.length > 0
      )) ||
    (dynamicMaterials && dynamicMaterials.length > 0)
  );

  return (
    <aside className="hidden lg:block w-60 shrink-0 space-y-4">
      {hasActiveFilters && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-[var(--color-161d25)]">
            {t("productlist.activeFilters") || "Active Filters"}
          </span>
          <button
            onClick={clearAllFilters}
            className="text-xs text-[var(--btn-bg,var(--color-161d25))] hover:underline flex items-center gap-1 font-semibold transition-opacity hover:opacity-80"
          >
            <RotateCcw size={12} /> {t("productlist.clearAll") || "Clear all"}
          </button>
        </div>
      )}

      {/* Active filter badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1.5 px-1 pb-1">
          {selectedCategory && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-[11px] text-gray-700 font-medium">
              {categoryTitle}
              <button
                onClick={() => handleCategoryClick("")}
                className="hover:text-red-500"
              >
                <X size={11} />
              </button>
            </span>
          )}
          {priceOption === "custom" && (minPrice || maxPrice) && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-[11px] text-gray-700 font-medium">
              {storeCurrencySymbol}{minPrice || "0"} - {storeCurrencySymbol}{maxPrice || maxCalculatedPrice}
              <button
                onClick={() => {
                  setPriceOption("any");
                  setMinPrice("");
                  setMaxPrice("");
                }}
                className="hover:text-red-500"
              >
                <X size={11} />
              </button>
            </span>
          )}
          {showExtraFilters &&
            selectedVariantItems.map((val) => (
              <span
                key={`badge-var-${val}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-[11px] text-gray-700 font-medium"
              >
                {val.includes("~") ? `${val.split("~")[0]}: ${val.split("~")[1]}` : `Variant: ${val}`}
                <button
                  onClick={() => toggleArrayItem(setSelectedVariantItems, val)}
                  className="hover:text-red-500"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          {showExtraFilters &&
            selectedAttributeItems.map((val) => (
              <span
                key={`badge-attr-${val}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-[11px] text-gray-700 font-medium"
              >
                {val.includes("~") ? `${val.split("~")[0]}: ${val.split("~")[1]}` : val}
                <button
                  onClick={() => toggleArrayItem(setSelectedAttributeItems, val)}
                  className="hover:text-red-500"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          {showExtraFilters &&
            selectedSizes.map((sz) => (
              <span
                key={`badge-sz-${sz}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-[11px] text-gray-700 font-medium"
              >
                Size: {sz}
                <button
                  onClick={() => toggleArrayItem(setSelectedSizes, sz)}
                  className="hover:text-red-500"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          {showExtraFilters &&
            selectedColors.map((col) => (
              <span
                key={`badge-col-${col}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-[11px] text-gray-700 font-medium"
              >
                Color: {col}
                <button
                  onClick={() => toggleArrayItem(setSelectedColors, col)}
                  className="hover:text-red-500"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          {showExtraFilters && inStockOnly && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-[11px] text-gray-700 font-medium">
              {t("ProductCard.inStock") || t("productlist.inStock") || "In Stock"}
              <button
                onClick={() => setInStockOnly(false)}
                className="hover:text-red-500"
              >
                <X size={11} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* 1. Categories Accordion Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-2xs">
        <button
          onClick={() => setCategoriesOpen(!categoriesOpen)}
          className="w-full flex items-center justify-between text-sm font-semibold text-[var(--color-161d25)] pb-1"
        >
          <span>{t("productlist.categories") || "Categories"}</span>
          {categoriesOpen ? (
            <ChevronUp size={16} className="text-gray-500" />
          ) : (
            <ChevronDown size={16} className="text-gray-500" />
          )}
        </button>

        {categoriesOpen && (
          <div className="mt-3 space-y-2 text-xs text-gray-600">
            {categoryList && categoryList.length > 5 && (
              <div className="relative mb-2">
                <Search
                  size={12}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder={t("productlist.searchCategory") || "Search category..."}
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full pl-7 pr-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-[var(--btn-bg,var(--color-161d25))]"
                />
              </div>
            )}

            <button
              onClick={() => handleCategoryClick("")}
              className={`flex items-center justify-between w-full text-left py-1 px-1.5 rounded-md transition-colors hover:text-[var(--btn-bg,var(--color-161d25))] ${
                !isAnyCategoryActive
                  ? "bg-gray-100 font-semibold text-[var(--btn-bg,var(--color-161d25))]"
                  : "text-gray-600"
              }`}
            >
              <span className="truncate">{t("productlist.all") || "All"}</span>
            </button>
            {isCategoryLoading ? (
              <CategorySidebarSkeleton count={6} />
            ) : filteredCategoryList.length === 0 ? (
              <p className="text-gray-400 py-1 text-[11px]">{t("productlist.noCategoriesFound") || "No categories found"}</p>
            ) : (
              filteredCategoryList.map((cat) => (
                <CategoryTreeItem
                  key={cat?.categoryId || cat?.categorySlug || cat?.slug}
                  cat={cat}
                  selectedCategory={selectedCategory}
                  onCategoryClick={handleCategoryClick}
                  expandedCategories={expandedCategories}
                  toggleExpand={toggleExpandCategory}
                  categoryCounts={categoryCounts}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* 2. Price Filter Accordion Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-2xs">
        <div className="border-b border-gray-100 pb-3 mb-3">
          <h3 className="text-sm font-semibold text-[var(--color-161d25)]">{t("productlist.Filter") || "Filter"}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{totalCount} {t("productlist.products") || "Products"}</p>
        </div>

        <div>
          <button
            onClick={() => setPriceOpen(!priceOpen)}
            className="w-full flex items-center justify-between text-xs font-semibold text-[var(--color-161d25)]"
          >
            <span>{t("productlist.price") || "Price"}</span>
            {priceOpen ? (
              <ChevronUp size={14} className="text-gray-500" />
            ) : (
              <ChevronDown size={14} className="text-gray-500" />
            )}
          </button>

          {priceOpen && (
            <div className="mt-3 space-y-2.5 text-xs">
              <CustomRadio
                checked={priceOption === "any"}
                onChange={() => setPriceOption("any")}
                label={t("productlist.anyPrice") || "Any price"}
              />

              <CustomRadio
                checked={priceOption === "custom"}
                onChange={() => setPriceOption("custom")}
                label={t("productlist.custom") || "Custom"}
              />

              {priceOption === "custom" && (
                <PriceRangeSlider
                  minLimit={minCalculatedPrice}
                  maxLimit={maxCalculatedPrice}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  currencySymbol={storeCurrencySymbol}
                  onChange={(newMin, newMax) => {
                    setMinPrice(newMin);
                    setMaxPrice(newMax);
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Extra Filters (Variants & Attributes): ONLY shown when category is selected */}
      {showExtraFilters && (
        <>
          {/* Dynamic Variants Filter */}
          {(apiVariantSections.length > 0 ||
            dynamicVariants.sizes.length > 0 ||
            dynamicVariants.colors.length > 0 ||
            dynamicVariants.customVariants.length > 0) && (
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-2xs">
              <button
                onClick={() => setVariantsOpen(!variantsOpen)}
                className="w-full flex items-center justify-between text-sm font-semibold text-[var(--color-161d25)] pb-1"
              >
                <span>{t("ProductCard.variants") || "Variants"}</span>
                {variantsOpen ? (
                  <ChevronUp size={16} className="text-gray-500" />
                ) : (
                  <ChevronDown size={16} className="text-gray-500" />
                )}
              </button>

              {variantsOpen && (
                <div className="mt-3 space-y-4">
                  {apiVariantSections.length > 0 &&
                    apiVariantSections.map((sec) => (
                      <div key={sec.id || sec.sectionSlug || sec.sectionName}>
                        <span className="text-xs font-medium text-gray-600 mb-2 block">
                          {sec.sectionName}
                        </span>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {sec.sectionItem?.map((item) => {
                            const filterKey = `${sec.sectionSlug || sec.sectionName}~${item.itemSlug || item.itemName}`;
                            const isChecked = selectedVariantItems.includes(filterKey);
                            return (
                              <FilterItem
                                key={filterKey}
                                item={item}
                                isChecked={isChecked}
                                onToggle={() => toggleArrayItem(setSelectedVariantItems, filterKey)}
                              />
                            );
                          })}
                        </div>
                      </div>
                    ))}

                  {apiVariantSections.length === 0 && (
                    <>
                      {dynamicVariants.sizes.length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-gray-600 mb-2 block">
                            Size / Capacity
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {dynamicVariants.sizes.map(({ name }) => {
                              const isSelected = selectedSizes.includes(name);
                              return (
                                <button
                                  key={name}
                                  onClick={() => toggleArrayItem(setSelectedSizes, name)}
                                  className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
                                    isSelected
                                      ? "border-[var(--btn-bg,var(--color-161d25))] bg-[var(--btn-bg,var(--color-161d25))] text-white font-semibold"
                                      : "border-gray-300 text-gray-700 hover:border-[var(--btn-bg,var(--color-161d25))]"
                                  }`}
                                  style={
                                    isSelected
                                      ? {
                                          backgroundColor: "var(--btn-bg, var(--color-161d25))",
                                          borderColor: "var(--btn-bg, var(--color-161d25))",
                                        }
                                      : {}
                                  }
                                >
                                  {name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {dynamicVariants.colors.length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-gray-600 mb-2 block">
                            Color
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {dynamicVariants.colors.map(({ name }) => {
                              const isSelected = selectedColors.includes(name);
                              return (
                                <button
                                  key={name}
                                  onClick={() => toggleArrayItem(setSelectedColors, name)}
                                  className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
                                    isSelected
                                      ? "border-[var(--btn-bg,var(--color-161d25))] bg-[var(--btn-bg,var(--color-161d25))] text-white font-semibold"
                                      : "border-gray-300 text-gray-700 hover:border-[var(--btn-bg,var(--color-161d25))]"
                                  }`}
                                >
                                  {name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {dynamicVariants.customVariants.map((customVar) => (
                        <div key={customVar.name}>
                          <span className="text-xs font-medium text-gray-600 mb-2 block">
                            {customVar.name}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {customVar.options.map(({ name }) => {
                              const isSelected = selectedSizes.includes(name);
                              return (
                                <button
                                  key={name}
                                  onClick={() => toggleArrayItem(setSelectedSizes, name)}
                                  className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
                                    isSelected
                                      ? "border-[var(--btn-bg,var(--color-161d25))] bg-[var(--btn-bg,var(--color-161d25))] text-white font-semibold"
                                      : "border-gray-300 text-gray-700 hover:border-[var(--btn-bg,var(--color-161d25))]"
                                  }`}
                                  style={
                                    isSelected
                                      ? {
                                          backgroundColor: "var(--btn-bg, var(--color-161d25))",
                                          borderColor: "var(--btn-bg, var(--color-161d25))",
                                        }
                                      : {}
                                  }
                                >
                                  {name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Dynamic Attributes Filter - only shown when attribute values are available */}
          {hasAttributes && (
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-2xs">
              <button
                onClick={() => setAttributesOpen(!attributesOpen)}
                className="w-full flex items-center justify-between text-sm font-semibold text-[var(--color-161d25)] pb-1"
              >
                <span>{t("productlist.attributes") || "Attributes"}</span>
                {attributesOpen ? (
                  <ChevronUp size={16} className="text-gray-500" />
                ) : (
                  <ChevronDown size={16} className="text-gray-500" />
                )}
              </button>

              {attributesOpen && (
                <div className="mt-3 space-y-4 text-xs">
                  {apiAttributeSections.length > 0 &&
                    apiAttributeSections.map((sec) => (
                      <div key={sec.id || sec.sectionSlug || sec.sectionName}>
                        <span className="text-xs font-medium text-gray-600 mb-2 block">
                          {sec.sectionName}
                        </span>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {sec.sectionItem?.map((item) => {
                            const filterKey = `${sec.sectionSlug || sec.sectionName}~${item.itemSlug || item.itemName}`;
                            const isChecked = selectedAttributeItems.includes(filterKey);
                            return (
                              <FilterItem
                                key={filterKey}
                                item={item}
                                isChecked={isChecked}
                                onToggle={() => toggleArrayItem(setSelectedAttributeItems, filterKey)}
                              />
                            );
                          })}
                        </div>
                      </div>
                    ))}

                  {dynamicMaterials.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-gray-600 mb-2 block">
                        Material
                      </span>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {dynamicMaterials.map(({ name, count }) => (
                          <CustomCheckbox
                            key={name}
                            checked={selectedMaterials.includes(name)}
                            onChange={() => toggleArrayItem(setSelectedMaterials, name)}
                            label={name}
                            count={count}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </aside>
  );
};

/**
 * Mobile Filter Drawer component
 */
export const MobileFilterDrawer = ({
  isOpen,
  onClose,
  filters,
  categoryList,
  isCategoryLoading,
}) => {
  if (!isOpen) return null;

  const t = useTranslations();
  const {
    categorySearch,
    setCategorySearch,
    priceOption,
    setPriceOption,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    selectedSizes,
    setSelectedSizes,
    selectedColors,
    setSelectedColors,
    selectedMaterials,
    setSelectedMaterials,
    inStockOnly,
    setInStockOnly,
    selectedVariantItems,
    setSelectedVariantItems,
    selectedAttributeItems,
    setSelectedAttributeItems,
    expandedCategories,
    toggleExpandCategory,
    toggleArrayItem,
    handleCategoryClick,
    clearAllFilters,
    showExtraFilters,
    storeCurrencySymbol,
    apiVariantSections,
    apiAttributeSections,
    minCalculatedPrice,
    maxCalculatedPrice,
    dynamicVariants,
    dynamicMaterials,
    inStockCount,
    filteredCategoryList,
    categoryCounts,
    totalAllCount,
    selectedCategory,
  } = filters;

  const norm = (s) => String(s || "").toLowerCase().replace(/[-_\s&]+/g, " ").trim();

  const isAnyCategoryActive = React.useMemo(() => {
    if (!selectedCategory || !filteredCategoryList?.length) return false;
    const target = String(selectedCategory).toLowerCase().trim();
    const targetNorm = norm(target);

    const checkList = (list) => {
      return list?.some((cat) => {
        const cSlug = String(cat?.categorySlug || cat?.slug || "").toLowerCase().trim();
        const cName = String(cat?.categoryNameTrans || cat?.categoryName || cat?.name || "").toLowerCase().trim();
        const cId = String(cat?.categoryId || "").toLowerCase().trim();
        const matched = Boolean(
          (cSlug && cSlug === target) ||
          (cName && cName === target) ||
          (cId && cId === target) ||
          (cSlug && norm(cSlug) === targetNorm) ||
          (cName && norm(cName) === targetNorm) ||
          (cSlug && (target.includes(cSlug) || cSlug.includes(target))) ||
          (cName && (target.includes(cName) || cName.includes(target)))
        );
        const children = cat?.children || cat?.child;
        return matched || (Array.isArray(children) && checkList(children));
      });
    };

    return checkList(filteredCategoryList);
  }, [selectedCategory, filteredCategoryList]);

  const hasMobileAttributes = Boolean(
    (apiAttributeSections &&
      apiAttributeSections.some(
        (sec) => Array.isArray(sec?.sectionItem) && sec.sectionItem.length > 0
      )) ||
    (dynamicMaterials && dynamicMaterials.length > 0)
  );

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        onClick={onClose}
      />
      <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-xl flex flex-col z-10 p-4 overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
          <h3 className="font-bold text-sm text-[var(--color-161d25)]">{t("productlist.filters") || "Filters"}</h3>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 text-xs">
          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-2 text-gray-800">{t("productlist.categories") || "Categories"}</h4>
            {isCategoryLoading ? (
              <CategorySidebarSkeleton count={5} />
            ) : (
              <>
                {categoryList && categoryList.length > 5 && (
                  <div className="relative mb-2">
                    <Search
                      size={12}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder={t("productlist.searchCategory") || "Search category..."}
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="w-full pl-7 pr-2 py-1 text-xs border border-gray-200 rounded-md"
                    />
                  </div>
                )}
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  <button
                    onClick={() => {
                      handleCategoryClick("");
                      onClose();
                    }}
                    className={`flex items-center justify-between w-full text-left py-1 px-1.5 rounded-md hover:text-[var(--btn-bg,var(--color-161d25))] ${
                      !isAnyCategoryActive
                        ? "bg-gray-100 font-bold text-[var(--btn-bg,var(--color-161d25))]"
                        : "text-gray-600"
                    }`}
                  >
                    <span className="truncate">{t("productlist.all") || "All"}</span>
                  </button>
                  {filteredCategoryList.map((cat) => (
                    <CategoryTreeItem
                      key={cat?.categoryId || cat?.categorySlug || cat?.slug}
                      cat={cat}
                      selectedCategory={selectedCategory}
                      onCategoryClick={(slug, catId) => {
                        handleCategoryClick(slug, catId);
                        onClose();
                      }}
                      expandedCategories={expandedCategories}
                      toggleExpand={toggleExpandCategory}
                      categoryCounts={categoryCounts}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Price */}
          <div className="border-t border-gray-200 pt-3 space-y-2">
            <h4 className="font-semibold mb-2 text-gray-800">{t("productlist.price") || "Price"}</h4>
            <CustomRadio
              checked={priceOption === "any"}
              onChange={() => setPriceOption("any")}
              label={t("productlist.anyPrice") || "Any price"}
            />
            <CustomRadio
              checked={priceOption === "custom"}
              onChange={() => setPriceOption("custom")}
              label={t("productlist.custom") || "Custom"}
            />
            {priceOption === "custom" && (
              <PriceRangeSlider
                minLimit={minCalculatedPrice}
                maxLimit={maxCalculatedPrice}
                minPrice={minPrice}
                maxPrice={maxPrice}
                currencySymbol={storeCurrencySymbol}
                onChange={(newMin, newMax) => {
                  setMinPrice(newMin);
                  setMaxPrice(newMax);
                }}
              />
            )}
          </div>

          {/* Extra Filters */}
          {showExtraFilters && (
            <>
              {(apiVariantSections.length > 0 ||
                dynamicVariants.sizes.length > 0 ||
                dynamicVariants.colors.length > 0) && (
                <div className="border-t border-gray-200 pt-3 space-y-3">
                  <h4 className="font-semibold text-gray-800">{t("ProductCard.variants") || "Variants"}</h4>
                  {apiVariantSections.length > 0 ? (
                    apiVariantSections.map((sec) => (
                      <div key={`m-${sec.id || sec.sectionName}`}>
                        <span className="text-gray-600 block mb-1.5">{sec.sectionName}</span>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                          {sec.sectionItem?.map((item) => {
                            const filterKey = `${sec.sectionSlug || sec.sectionName}~${item.itemSlug || item.itemName}`;
                            const isChecked = selectedVariantItems.includes(filterKey);
                            return (
                              <FilterItem
                                key={filterKey}
                                item={item}
                                isChecked={isChecked}
                                onToggle={() => toggleArrayItem(setSelectedVariantItems, filterKey)}
                              />
                            );
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      {dynamicVariants.sizes.length > 0 && (
                        <div>
                          <span className="text-gray-600 block mb-1.5">{t("productlist.size") || "Size / Capacity"}</span>
                          <div className="flex flex-wrap gap-1.5">
                            {dynamicVariants.sizes.map(({ name }) => (
                              <button
                                key={name}
                                onClick={() => toggleArrayItem(setSelectedSizes, name)}
                                className={`px-2 py-1 text-xs rounded border ${
                                  selectedSizes.includes(name)
                                    ? "bg-[var(--btn-bg,var(--color-161d25))] text-white font-semibold"
                                    : "border-gray-300 text-gray-700"
                                }`}
                                style={
                                  selectedSizes.includes(name)
                                    ? {
                                        backgroundColor: "var(--btn-bg, var(--color-161d25))",
                                        borderColor: "var(--btn-bg, var(--color-161d25))",
                                      }
                                    : {}
                                }
                              >
                                {name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {dynamicVariants.colors.length > 0 && (
                        <div>
                          <span className="text-gray-600 block mb-1.5">{t("productlist.color") || "Color"}</span>
                          <div className="flex flex-wrap gap-1.5">
                            {dynamicVariants.colors.map(({ name }) => {
                              const isSelected = selectedColors.includes(name);
                              return (
                                <button
                                  key={name}
                                  onClick={() => toggleArrayItem(setSelectedColors, name)}
                                  className={`px-3 py-1.5 text-xs rounded-md border transition-all ${
                                    isSelected
                                      ? "border-[var(--btn-bg,var(--color-161d25))] bg-[var(--btn-bg,var(--color-161d25))] text-white font-semibold"
                                      : "border-gray-300 text-gray-700"
                                  }`}
                                >
                                  {name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {hasMobileAttributes && (
                <div className="border-t border-gray-200 pt-3 space-y-3">
                  <h4 className="font-semibold text-gray-800">{t("productlist.attributes") || "Attributes"}</h4>
                  {apiAttributeSections.map((sec) => (
                    <div key={`m-attr-${sec.id || sec.sectionName}`}>
                      <span className="text-gray-600 block mb-1.5">{sec.sectionName}</span>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {sec.sectionItem?.map((item) => {
                          const filterKey = `${sec.sectionSlug || sec.sectionName}~${item.itemSlug || item.itemName}`;
                          const isChecked = selectedAttributeItems.includes(filterKey);
                          return (
                            <FilterItem
                              key={filterKey}
                              item={item}
                              isChecked={isChecked}
                              onToggle={() => toggleArrayItem(setSelectedAttributeItems, filterKey)}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="border-t border-gray-200 pt-3">
            <button
              onClick={() => {
                clearAllFilters();
                onClose();
              }}
              className="w-full py-2 text-xs font-semibold border border-gray-300 text-[var(--btn-bg,var(--color-161d25))] hover:bg-gray-50 rounded-md"
            >
              {t("productlist.clearFilters") || t("productlist.clearAll") || "Clear All Filters"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
