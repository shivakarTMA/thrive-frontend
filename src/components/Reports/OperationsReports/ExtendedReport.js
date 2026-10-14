
import React, { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { addYears, format, subYears } from "date-fns";
import { FaCalendarDays } from "react-icons/fa6";
import { FiEye, FiX, FiDownload } from "react-icons/fi";
import Select from "react-select";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  customStyles,
  filterActiveItems,
  formatText,
} from "../../../Helper/helper";
import { authAxios } from "../../../config/config";
import Pagination from "../../common/Pagination";
import IsLoadingHOC from "../../common/IsLoadingHOC";

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const serviceTypeOptions = [
  { label: "Package", value: "PACKAGE" },
  { label: "Subscription", value: "SUBSCRIPTION" },
];

const formatDate = (date) => format(date, "yyyy-MM-dd");

const getInitialFilters = (searchParams) => {
  const params = new URLSearchParams(searchParams);
  const startDate = params.get("startDate");
  const endDate = params.get("endDate");
  const dateValue = params.get("dateFilter");
  const serviceType = params.get("service_type");

  return {
    dateFilter:
      startDate && endDate
        ? dateFilterOptions[3]
        : dateFilterOptions.find((item) => item.value === dateValue) ||
          dateFilterOptions[0],
    customFrom: startDate ? new Date(`${startDate}T00:00:00`) : null,
    customTo: endDate ? new Date(`${endDate}T00:00:00`) : null,
    clubFilter: params.get("club_id")
      ? Number(params.get("club_id"))
      : null,
    serviceTypeFilter: serviceTypeOptions.some(
      (item) => item.value === serviceType
    )
      ? serviceType
      : null,
    search: params.get("search") || "",
  };
};

/* ------------------ PDF MODAL ------------------ */

const PdfViewerModal = ({ pdfUrl, onClose }) => {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!pdfUrl) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeRef.current();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [pdfUrl]);

  if (!pdfUrl) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-2 sm:p-3"
      onClick={onClose}
    >
      <div
        className="relative flex h-[97vh] w-full max-w-[960px] flex-col rounded-[12px] bg-white p-3 sm:p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="PDF Preview"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-[14px] top-[28px] z-20 flex h-[32px] w-[32px] items-center justify-center rounded-full bg-black text-white hover:bg-gray-800"
          aria-label="Close PDF"
        >
          <FiX className="text-xl" />
        </button>

        <div className="h-full w-full overflow-hidden rounded-[3px] bg-[#292929]">
          <iframe
            src={pdfUrl}
            title="PDF Preview"
            className="h-full w-full border-0"
          />
        </div>
      </div>
    </div>
  );
};

/* ------------------ MAIN COMPONENT ------------------ */

const MemberCheckInsReport = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const userRole = user?.role;

  const initialFilters = useRef(
    getInitialFilters(location.search)
  ).current;

  const [data, setData] = useState([]);
  const [dateFilter, setDateFilter] = useState(initialFilters.dateFilter);
  const [customFrom, setCustomFrom] = useState(initialFilters.customFrom);
  const [customTo, setCustomTo] = useState(initialFilters.customTo);
  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(initialFilters.clubFilter);
  const [serviceTypeFilter, setServiceTypeFilter] = useState(
    initialFilters.serviceTypeFilter
  );

  const [search, setSearch] = useState(initialFilters.search);
  const [debouncedSearch, setDebouncedSearch] = useState(
    initialFilters.search
  );

  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  const latestRequest = useRef(0);

  /* ------------------ SEARCH DEBOUNCE ------------------ */

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  /* ------------------ FETCH CLUBS ------------------ */

  useEffect(() => {
    let active = true;

    const fetchClubs = async () => {
      try {
        const res = await authAxios().get("/club/list");
        if (!active) return;

        const activeClubs = filterActiveItems(res.data?.data || []);
        setClubList(activeClubs);

        setClubFilter((previous) => {
          if (previous != null) return previous;
          return activeClubs.length > 0 ? activeClubs[0].id : null;
        });
      } catch (error) {
        console.error("Failed to fetch clubs:", error);
      }
    };

    fetchClubs();

    return () => {
      active = false;
    };
  }, []);

  const clubOptions = clubList.map((club) => ({
    label: club.name,
    value: club.id,
  }));

  /* ------------------ COMMON FILTER PARAMS ------------------ */

  const getReportParams = (currentPage = 1, isDownload = false) => {
    const params = {};

    if (!isDownload) {
      params.page = currentPage;
      params.limit = rowsPerPage;
    }

    if (clubFilter != null) {
      params.club_id = clubFilter;
    }

    if (id) {
      params.member_id = Number(id);
    }

    if (serviceTypeFilter) {
      params.service_type = serviceTypeFilter;
    }

    const searchValue = isDownload ? search.trim() : debouncedSearch;

    if (searchValue) {
      params.search = searchValue;
    }

    if (dateFilter?.value === "custom") {
      if (customFrom && customTo) {
        params.startDate = formatDate(customFrom);
        params.endDate = formatDate(customTo);
      }
    } else if (dateFilter?.value) {
      params.dateFilter = dateFilter.value;
    }

    return params;
  };

  /* ------------------ FETCH REPORT ------------------ */

  const fetchReport = async (currentPage = 1) => {
    const requestId = ++latestRequest.current;

    try {
      setLoading(true);

      const params = getReportParams(currentPage);

      const res = await authAxios().get("/extend/service/list", {
        params,
      });

      if (requestId !== latestRequest.current) return;

      const responseData = res.data;

      setData(
        Array.isArray(responseData?.data) ? responseData.data : []
      );
      setPage(responseData?.currentPage || currentPage);
      setTotalPages(responseData?.totalPage || 1);
      setTotalCount(responseData?.totalCount || 0);
    } catch (error) {
      if (requestId !== latestRequest.current) return;

      console.error("Failed to fetch extension report:", error);
      setData([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      if (requestId === latestRequest.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (
      dateFilter?.value === "custom" &&
      (!customFrom || !customTo)
    ) {
      latestRequest.current += 1;
      setLoading(false);
      return;
    }

    fetchReport(1);

    return () => {
      latestRequest.current += 1;
    };
  }, [
    dateFilter?.value,
    customFrom,
    customTo,
    clubFilter,
    serviceTypeFilter,
    debouncedSearch,
    id,
  ]);

  /* ------------------ URL SYNC ------------------ */

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    [
      "dateFilter",
      "startDate",
      "endDate",
      "club_id",
      "service_type",
      "search",
    ].forEach((key) => params.delete(key));

    if (
      dateFilter?.value === "custom" &&
      customFrom &&
      customTo
    ) {
      params.set("startDate", formatDate(customFrom));
      params.set("endDate", formatDate(customTo));
    } else if (dateFilter?.value !== "custom" && dateFilter?.value) {
      params.set("dateFilter", dateFilter.value);
    }

    if (clubFilter != null) {
      params.set("club_id", String(clubFilter));
    }

    if (serviceTypeFilter) {
      params.set("service_type", serviceTypeFilter);
    }

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    }

    const finalSearch = params.toString();

    if (finalSearch !== location.search.replace(/^\?/, "")) {
      navigate({ search: finalSearch }, { replace: true });
    }
  }, [
    dateFilter?.value,
    customFrom,
    customTo,
    clubFilter,
    serviceTypeFilter,
    debouncedSearch,
    navigate,
  ]);

  /* ------------------ DOWNLOAD REPORT ------------------ */


const handleDownloadReport = async () => {
  // Prevent download when loading or no data is available
  if (loading || downloadLoading || data.length === 0) return;

  // Validate custom date filter
  if (
    dateFilter?.value === "custom" &&
    (!customFrom || !customTo)
  ) {
    console.log("Please select both From Date and To Date");
    return;
  }

  try {
    setDownloadLoading(true);

    // Same filters as listing API, without pagination
    const params = getReportParams(1, true);

    console.log("Download API Params:", params);

    // Download API
    const response = await authAxios().get(
      "/extend/service/list/download",
      {
        params,
        responseType: "blob",
      }
    );

    const contentType =
      response.headers?.["content-type"] ||
      "application/octet-stream";

    // Create blob
    const blob =
      response.data instanceof Blob
        ? response.data
        : new Blob([response.data], {
            type: contentType,
          });

    // Handle JSON error response returned as blob
    if (contentType.includes("application/json")) {
      const text = await blob.text();

      let message = "Failed to download report";

      try {
        const result = JSON.parse(text);
        message = result.message || message;
      } catch (parseError) {
        console.error(
          "Invalid download response:",
          parseError
        );
      }

      throw new Error(message);
    }

    // Fixed filename (ignore backend filename)
    const fileName = "Extension Report.xlsx";

    // Create download URL
    const url = window.URL.createObjectURL(blob);

    // Create temporary anchor
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    link.remove();

    // Release object URL
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);

  } catch (error) {
    console.error("Download API Error:", error);
    console.log(
      error?.message || "Failed to download report"
    );
  } finally {
    setDownloadLoading(false);
  }
};


  /* ------------------ PDF ACTION ------------------ */

  const handleViewPdf = (url) => {
    if (!url || typeof url !== "string") return;

    try {
      const parsedUrl = new URL(url);

      if (
        parsedUrl.protocol !== "https:" &&
        parsedUrl.protocol !== "http:"
      ) {
        return;
      }

      setPdfUrl(parsedUrl.href);
    } catch (error) {
      console.error("Invalid PDF URL:", error);
    }
  };

  const handlePageChange = (newPage) => {
    if (loading || newPage === page) return;

    setPage(newPage);
    fetchReport(newPage);
  };

  /* ------------------ RENDER ------------------ */

  return (
    <div className="page--content">
      {/* HEADER */}

      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">
            Home &gt; Reports &gt; Operations Reports &gt;
            Extension Report
          </p>

          <h1 className="text-3xl font-semibold">
            Extension Report
          </h1>
        </div>

        <button
          type="button"
          onClick={handleDownloadReport}
          disabled={loading || downloadLoading || data.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1A1A1A] text-white rounded-md hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiDownload className="text-lg" />
          <span>
            {downloadLoading ? "Downloading..." : "Download Report"}
          </span>
        </button>
      </div>

      {/* FILTERS */}

      <div className="flex gap-3 mb-4 items-center justify-between">
        <div className="flex gap-2 w-full flex-wrap">

          <div className="max-w-[150px] w-full">
            <Select
              placeholder="Date Filter"
              options={dateFilterOptions}
              value={dateFilter}
              styles={customStyles}
              onChange={(selected) => {
                setDateFilter(selected);
                if (selected?.value !== "custom") {
                  setCustomFrom(null);
                  setCustomTo(null);
                }
                setPage(1);
              }}
            />
          </div>

          {dateFilter?.value === "custom" && (
            <>
              <div className="custom--date dob-format flex-1 max-w-[180px] w-full">
                <span className="absolute z-[1] mt-[10px] ml-[15px]">
                  <FaCalendarDays />
                </span>
                <DatePicker
                  selected={customFrom}
                  onChange={(date) => {
                    setCustomFrom(date);
                    setCustomTo(null);
                    setPage(1);
                  }}
                  placeholderText="From Date"
                  className="custom--input w-full input--icon"
                  minDate={subYears(new Date(), 20)}
                  maxDate={addYears(new Date(), 0)}
                  dateFormat="dd-MM-yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
              </div>

              <div className="custom--date dob-format flex-1 max-w-[180px] w-full">
                <span className="absolute z-[1] mt-[10px] ml-[15px]">
                  <FaCalendarDays />
                </span>
                <DatePicker
                  selected={customTo}
                  onChange={(date) => {
                    setCustomTo(date);
                    setPage(1);
                  }}
                  placeholderText="To Date"
                  className="custom--input w-full input--icon"
                  minDate={customFrom || subYears(new Date(), 20)}
                  maxDate={addYears(new Date(), 0)}
                  dateFormat="dd-MM-yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  disabled={!customFrom}
                />
              </div>
            </>
          )}

          <div className="w-full max-w-[190px]">
            <Select
              placeholder="Filter by club"
              options={clubOptions}
              styles={customStyles}
              value={
                clubOptions.find(
                  (option) => option.value === clubFilter
                ) || null
              }
              onChange={(selected) => {
                setClubFilter(selected?.value ?? null);
                setPage(1);
              }}
              isClearable={userRole === "ADMIN"}
            />
          </div>

          <div className="w-full max-w-[190px]">
            <Select
              placeholder="Filter by Service Type"
              options={serviceTypeOptions}
              styles={customStyles}
              value={
                serviceTypeOptions.find(
                  (option) => option.value === serviceTypeFilter
                ) || null
              }
              onChange={(selected) => {
                setServiceTypeFilter(selected?.value || null);
                setPage(1);
              }}
              isClearable
            />
          </div>

          <div className="relative max-w-[220px] w-full">
            <input
              type="text"
              placeholder="Search Member"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="custom--input w-full"
            />
          </div>
        </div>
      </div>

      {/* REPORT TABLE */}

      <div className="w-full p-3 border bg-white shodow--box rounded-[10px]">
        <div className="table--data--bottom w-full">
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-2 py-4 min-w-[150px]">
                    Club Name
                  </th>

                  <th className="px-2 py-4 min-w-[100px]">
                    Member ID
                  </th>

                  <th className="px-2 py-4 min-w-[120px]">
                    Member Name
                  </th>

                  <th className="px-2 py-4 min-w-[120px]">
                    Service Type
                  </th>

                  <th className="px-2 py-4 min-w-[150px]">
                    Service Name
                  </th>

                  <th className="px-2 py-4 min-w-[100px]">
                    Start Date
                  </th>

                  <th className="px-2 py-4 min-w-[150px]">
                    Original End Date
                  </th>

                  <th className="px-2 py-4 min-w-[200px]">
                    Number of days extended
                  </th>

                  <th className="px-2 py-4 min-w-[120px]">
                    New End Date
                  </th>

                  <th className="px-2 py-4 min-w-[100px]">
                    Updated On
                  </th>

                  <th className="px-2 py-4 min-w-[100px]">
                    Remarks
                  </th>

                  <th className="px-2 py-4 min-w-[100px]">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {data.length > 0 ? (
                  data.map((row, index) => (
                    <tr
                      key={row?.id ?? index}
                      className="bg-white border-b hover:bg-gray-50 transition duration-700"
                    >
                      <td className="px-2 py-4">
                        {row?.club_name || "--"}
                      </td>
                      <td className="px-2 py-4">
                        {row?.membership_number || "--"}
                      </td>
                      <td className="px-2 py-4">
                        {row?.member_name || "--"}
                      </td>
                      <td className="px-2 py-4">
                        {row?.service_type
                          ? formatText(row.service_type)
                          : "--"}
                      </td>
                      <td className="px-2 py-4">
                        {row?.service_name || "--"}
                      </td>
                      <td className="px-2 py-4">
                        {row?.start_date || "--"}
                      </td>
                      <td className="px-2 py-4">
                        {row?.original_end_date || "--"}
                      </td>
                      <td className="px-2 py-4">
                        {row?.no_of_days ?? "--"}
                      </td>
                      <td className="px-2 py-4">
                        {row?.new_end_date || "--"}
                      </td>
                      <td className="px-2 py-4">
                        {row?.updated_on?.split("T")[0] || "--"}
                      </td>
                      <td className="px-2 py-4">
                        {row?.remarks || "--"}
                      </td>
                      <td className="px-2 py-4">
                        {row?.image ? (
                          <button
                            type="button"
                            onClick={() => handleViewPdf(row.image)}
                            className="w-[30px] h-[30px] flex items-center justify-center bg-gray-100 text-black rounded hover:bg-gray-200 transition"
                            title="View PDF"
                          >
                            <FiEye className="text-lg" />
                          </button>
                        ) : (
                          <span className="text-gray-400">--</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={12}
                      className="text-center px-2 py-6"
                    >
                      {loading ? "Loading report..." : "No data found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            totalCount={totalCount}
            currentDataLength={data.length}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      <PdfViewerModal
        pdfUrl={pdfUrl}
        onClose={() => setPdfUrl(null)}
      />
    </div>
  );
};

export default IsLoadingHOC(MemberCheckInsReport);
