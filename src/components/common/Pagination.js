import React from "react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";

const Pagination = ({
  page,
  totalPages,
  rowsPerPage,
  totalCount,
  currentDataLength,
  onPageChange,
}) => {
  // Calculate "Showing X to Y of Z entries"
  const start = currentDataLength === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const end = Math.min(page * rowsPerPage, totalCount);

  // Compute which page numbers to display (always 3)
  let pagesToShow = [];
  if (totalPages <= 3) {
    pagesToShow = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else if (page === 1) {
    pagesToShow = [1, 2, 3];
  } else if (page === totalPages) {
    pagesToShow = [totalPages - 2, totalPages - 1, totalPages];
  } else {
    pagesToShow = [page - 1, page, page + 1];
  }

  return (
    <div className="flex justify-between items-center mt-4 gap-2">
      {/* Showing Info */}
      <p className="text-gray-700">
        Showing {start} to {end} of {totalCount} entries
      </p>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* Prev */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-2 border rounded disabled:opacity-50"
        >
          <FaAngleLeft />
        </button>

        {/* Page Numbers */}
        {pagesToShow.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1 border rounded ${
              page === p ? "bg-gray-200 font-semibold" : ""
            }`}
          >
            {p}
          </button>
        ))}

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-2 border rounded disabled:opacity-50"
        >
          <FaAngleRight />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
