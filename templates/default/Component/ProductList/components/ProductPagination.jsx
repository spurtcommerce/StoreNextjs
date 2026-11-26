"use client";
import React from "react";
import PaginationBar from "@/GlobalComponents/Shared/Common/PaginationBar";

/**
 * ProductPagination component
 */
export const ProductPagination = ({
  currentPage = 1,
  totalPages = 1,
  totalResults = 0,
  limit = 20,
  onPageChange,
}) => {
  if (totalPages <= 1 && totalResults <= limit) {
    return null;
  }

  return (
    <div className="pt-4 pb-12 flex justify-center w-full">
      <PaginationBar
        currentPage={currentPage}
        totalPages={totalPages}
        totalResults={totalResults}
        pageSize={limit}
        limit={limit}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default ProductPagination;
