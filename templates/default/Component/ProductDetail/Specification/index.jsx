"use client";

// React
import { useCallback, useEffect, useMemo, useState } from "react";

// 3rd Party
import { useTranslations } from "next-intl";

// API
import {
  getProductSpecification,
  getSpecificationList,
} from "@/api/SpecificationApi";

const Specification = ({ productSlug, categoryIds = [], productDetail }) => {
  const t = useTranslations("productDetail");
  const [loading, setLoading] = useState(true);
  const [specificationList, setSpecificationList] = useState([]);
  const [productSpecification, setProductSpecification] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [specificationValue, setSpecificationValue] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState("all");

  // Product Specification API
  const getProductSpecificationApi = useCallback(async () => {
    if (!productSlug) {
      setLoading(false);
      return;
    }
    try {
      const result = await getProductSpecification(productSlug);
      if (result?.status == 1 && Array.isArray(result?.data)) {
        result.data.forEach((specList) => {
          specList?.attributeGroups?.forEach((attributeGroup) => {
            attributeGroup?.attributes?.forEach((attribute) => {
              attribute?.attributeValues?.forEach((attributeValue) => {
                attribute.value = attribute.value
                  ? `${attribute.value}, ${attributeValue?.valueTrans || attributeValue?.value}`
                  : attributeValue?.valueTrans || attributeValue?.value || "";
              });
            });
          });
        });
        setProductSpecification(result.data);
      } else {
        setProductSpecification([]);
      }
    } catch {
      setProductSpecification([]);
    } finally {
      setLoading(false);
    }
  }, [productSlug]);

  useEffect(() => {
    getProductSpecificationApi();
  }, [getProductSpecificationApi]);

  // Specification List API
  const getSpecificationListApi = useCallback(async () => {
    if (!categoryIds || (Array.isArray(categoryIds) && categoryIds.length === 0)) {
      return;
    }
    try {
      const catParam = Array.isArray(categoryIds) ? categoryIds.join(",") : String(categoryIds);
      const result = await getSpecificationList(catParam);
      if (result?.status == 1 && Array.isArray(result?.data)) {
        const flatAttrs = [];
        result.data.forEach((specification) => {
          specification?.attributeGroups?.forEach((attributeGroup) => {
            flatAttrs.push({
              specificationId: specification?.id,
              attributes: attributeGroup?.attributes,
            });
          });
        });
        setAttributes(flatAttrs);
        setSpecificationList(result.data);
      } else {
        setAttributes([]);
        setSpecificationList([]);
      }
    } catch {
      setAttributes([]);
      setSpecificationList([]);
    }
  }, [categoryIds]);

  useEffect(() => {
    if (categoryIds?.length > 0) {
      getSpecificationListApi();
    }
  }, [categoryIds, getSpecificationListApi]);

  function mergeAttributes(attributeList, productAttributes) {
    if (!Array.isArray(attributeList) || !Array.isArray(productAttributes)) return [];
    return attributeList.map((attribute) => {
      const matchingObj = productAttributes.find(
        (productAttribute) => productAttribute.attributeId == attribute.id
      );
      if (matchingObj) {
        return matchingObj;
      }
      return { attributeValue: "-" };
    });
  }

  function mergeSpecificationValues(data) {
    const result = [];
    const map = new Map();

    data.forEach((item) => {
      const { specificationId, specificationValue: specValues } = item;

      if (!map.has(specificationId)) {
        map.set(specificationId, []);
      }

      specValues.forEach((specVal, index) => {
        if (!map.get(specificationId)[index]) {
          map.get(specificationId)[index] = [];
        }
        map.get(specificationId)[index].push(...specVal);
      });
    });

    map.forEach((specValList, specificationId) => {
      result.push({
        specificationId,
        specificationValue: specValList.map((arr) => [...arr]),
      });
    });

    return result;
  }

  useEffect(() => {
    if (productSpecification?.length > 0 && attributes?.length > 0) {
      const updatedSpecificationValues = [];

      productSpecification.forEach((specification) => {
        attributes.forEach((specList) => {
          if (specList?.specificationId === specification.specificationId) {
            const attributeGroupsValues = (specification.attributeGroups || []).map(
              (attributeGroup) => {
                return mergeAttributes(
                  specList.attributes,
                  attributeGroup.attributes
                );
              }
            );

            updatedSpecificationValues.push({
              specificationId: specification.specificationId,
              specificationValue: attributeGroupsValues,
            });
          }
        });
      });

      const finalSpecification = mergeSpecificationValues(
        updatedSpecificationValues
      );
      setSpecificationValue(finalSpecification);
    }
  }, [productSpecification, attributes]);

  // Direct product attributes fallback (Medusa, raw product data, or custom specs)
  const directAttributes = useMemo(() => {
    if (
      productDetail?.specifications &&
      typeof productDetail.specifications === "object" &&
      !Array.isArray(productDetail.specifications)
    ) {
      return Object.entries(productDetail.specifications).map(([key, val]) => ({
        attributeName: key,
        value: typeof val === "object" ? JSON.stringify(val) : String(val),
      }));
    }

    const raw = productDetail?.productAttributes || productDetail?.attributes;
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((item) => ({
        attributeName:
          item?.attributeName ||
          item?.name ||
          item?.attribute?.name ||
          "Specification",
        value:
          item?.value ||
          (Array.isArray(item?.attributeValues)
            ? item.attributeValues
                .map((v) => v?.valueTrans || v?.value || "")
                .filter(Boolean)
                .join(", ")
            : "") ||
          "-",
      }));
    }

    return [];
  }, [productDetail]);

  const hasAdvancedSpecs = specificationValue?.length > 0;
  const hasSimpleSpecs = productSpecification?.length > 0;
  const hasDirectSpecs = directAttributes?.length > 0;
  const hasAnySpecs = hasAdvancedSpecs || hasSimpleSpecs || hasDirectSpecs;

  // Flattened simple items for easy search and counting
  const flattenedItems = useMemo(() => {
    if (hasSimpleSpecs) {
      const list = [];
      productSpecification.forEach((spec) => {
        const groupName = spec?.specificationName || "General";
        spec?.attributeGroups?.[0]?.attributes?.forEach((attr) => {
          list.push({
            group: groupName,
            name: attr?.attributeName || "",
            value: attr?.value || "-",
          });
        });
      });
      return list;
    }
    if (hasDirectSpecs) {
      return directAttributes.map((attr) => ({
        group: "General",
        name: attr.attributeName,
        value: attr.value,
      }));
    }
    return [];
  }, [hasSimpleSpecs, hasDirectSpecs, productSpecification, directAttributes]);

  const groups = useMemo(() => {
    const set = new Set();
    flattenedItems.forEach((i) => {
      if (i.group) set.add(i.group);
    });
    return Array.from(set);
  }, [flattenedItems]);

  const filteredItems = useMemo(() => {
    return flattenedItems.filter((item) => {
      const matchesGroup = activeGroup === "all" || item.group === activeGroup;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.value.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q);
      return matchesGroup && matchesSearch;
    });
  }, [flattenedItems, activeGroup, searchQuery]);

  // Value renderer with pill tags for comma-separated items
  const renderValue = (val) => {
    if (!val || val === "-" || val === "null" || val === "undefined") {
      return <span className="text-gray-400 font-normal italic">—</span>;
    }

    const str = String(val).trim();
    if (str.includes(",") && str.length < 120) {
      const parts = str.split(",").map((s) => s.trim()).filter(Boolean);
      if (parts.length > 1) {
        return (
          <div className="flex flex-wrap gap-1.5">
            {parts.map((p, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200/60 shadow-xs"
              >
                {p}
              </span>
            ))}
          </div>
        );
      }
    }

    return <span className="text-slate-900 font-semibold">{str}</span>;
  };

  if (loading) {
    return (
      <div className="mb-10 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-slate-200"></div>
          <div className="h-6 w-44 bg-slate-200 rounded-lg"></div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden p-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between py-2 border-b border-slate-100">
              <div className="w-1/3 h-4 bg-slate-200 rounded"></div>
              <div className="w-1/2 h-4 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!hasAnySpecs) {
    return null;
  }

  return (
    <div className="mb-10" id="specifications-section">
      {/* Premium Header */}
      <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/50 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-200/80 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-700 text-white shadow-sm ring-4 ring-slate-100">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    {t("specification") || "Product Specifications"}
                  </h3>
                  {flattenedItems.length > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {flattenedItems.length}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Detailed technical features and dimensions
                </p>
              </div>
            </div>

            {/* Quick search filter (if more than 5 specs) */}
            {flattenedItems.length > 5 && (
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter specifications..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-400 transition-all"
                />
                <svg
                  className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Group pill filters if multiple groups */}
          {groups.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveGroup("all")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  activeGroup === "all"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                }`}
              >
                All Specs ({flattenedItems.length})
              </button>
              {groups.map((group) => {
                const count = flattenedItems.filter((i) => i.group === group).length;
                return (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setActiveGroup(group)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      activeGroup === group
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                    }`}
                  >
                    {group} ({count})
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Mode 1: Advanced Matrix Specifications Table */}
        {hasAdvancedSpecs ? (
          specificationList?.map((specification, specificationIndex) =>
            specificationValue?.map(
              (specValItem) =>
                specification?.id == specValItem?.specificationId && (
                  <div key={`adv_spec_${specificationIndex}`} className="p-4 sm:p-6">
                    {specification?.name && (
                      <div className="mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-4 rounded-full bg-slate-900"></span>
                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                          {specification?.name}
                        </h4>
                      </div>
                    )}

                    <div className="w-full overflow-x-auto rounded-xl border border-slate-200/80 scrollbar-thin">
                      <table className="w-full border-collapse text-left min-w-[600px]">
                        <thead>
                          <tr className="bg-slate-100/80 border-b border-slate-200">
                            {specification?.attributeGroups?.map((attributeGroup) =>
                              attributeGroup?.attributes?.map((attribute, attributeIndex) => (
                                <th
                                  key={`attr_th_${attributeIndex}`}
                                  className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 whitespace-nowrap"
                                >
                                  {attribute?.name}
                                </th>
                              ))
                            )}
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 text-sm bg-white">
                          {specValItem?.specificationValue?.map((attrsGroup, attrsIndex) => (
                            <tr
                              key={`attr_row_${attrsIndex}`}
                              className="hover:bg-slate-50/80 transition-colors"
                            >
                              {attrsGroup?.map((attributevalue, valIndex) => (
                                <td
                                  key={`attr_td_${valIndex}`}
                                  className="px-5 py-3.5 text-slate-800"
                                >
                                  {attributevalue?.attributeValue === "-"
                                    ? <span className="text-gray-400 italic">—</span>
                                    : attributevalue?.attributeValues
                                        ?.map((v) =>
                                          v?.valueTrans !== "" ? v?.valueTrans : v?.value
                                        )
                                        ?.join(", ") || <span className="text-gray-400 italic">—</span>}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
            )
          )
        ) : (
          /* Mode 2 & Mode 3: Modern Key-Value List with Filter & Grouping */
          <div className="p-0">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No specifications found matching &ldquo;{searchQuery}&rdquo;.
              </div>
            ) : (
              <div className="divide-y divide-slate-100/90">
                {filteredItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 sm:grid-cols-12 px-5 sm:px-6 py-3.5 hover:bg-slate-50/70 transition-colors duration-150 gap-1.5 sm:gap-6 items-center"
                  >
                    <div className="sm:col-span-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0"></span>
                      <span className="text-xs sm:text-sm font-medium text-slate-600">
                        {item.name}
                      </span>
                    </div>
                    <div className="sm:col-span-8 text-xs sm:text-sm break-words">
                      {renderValue(item.value)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Specification;
