import React, { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, format, subYears } from "date-fns";
import { FaCalendarDays } from "react-icons/fa6";
import Select from "react-select";
import { customStyles, filterActiveItems } from "../../../Helper/helper";
import { authAxios } from "../../../config/config";
import { toast } from "react-toastify";
import { LuDownload } from "react-icons/lu";
import Pagination from "../../common/Pagination";

const API_ENDPOINT = "/membership/freeze/list";
const DOWNLOAD_ENDPOINT = "/membership/freeze/list/download";

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const formatDate = (date) => format(date, "yyyy-MM-dd");

const MembershipFrozenReport = () => {
  const [data, setData] = useState([]);

  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);

  const [dateFilter, setDateFilter] = useState(dateFilterOptions[0]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const latestRequest = useRef(0);

  // ---------------- FETCH CLUBS ----------------

  useEffect(() => {
    let active = true;

    const fetchClub = async () => {
      try {
        const response = await authAxios().get("/club/list");

        if (!active) return;

        const clubs = response.data?.data || [];
        const activeClubs = filterActiveItems(clubs);

        setClubList(activeClubs);
          if (activeClubs.length > 0) {
        setClubFilter(activeClubs[0].id);
      }
      } catch (error) {
        console.error("Failed to fetch clubs:", error);
      }
    };

    fetchClub();

    return () => {
      active = false;
    };
  }, []);

  const clubOptions = clubList.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  // ---------------- COMMON API PARAMS ----------------

  const getReportParams = (currentPage = 1, isDownload = false) => {
    const params = {};

    // Pagination only for listing API
    if (!isDownload) {
      params.page = currentPage;
      params.limit = rowsPerPage;
    }

    // Club filter
    if (clubFilter != null) {
      params.club_id = clubFilter;
    }

    // Date filter
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

  // ---------------- FETCH REPORT ----------------

  const fetchReport = async (currentPage = 1) => {
    const requestId = ++latestRequest.current;

    try {
      setLoading(true);

      const params = getReportParams(currentPage);

      const response = await authAxios().get(API_ENDPOINT, {
        params,
      });

      if (requestId !== latestRequest.current) return;

      const responseData = response.data;

      setData(
        Array.isArray(responseData?.data)
          ? responseData.data
          : []
      );

      setPage(responseData?.currentPage || currentPage);
      setTotalPages(responseData?.totalPage || 1);
      setTotalCount(responseData?.totalCount || 0);
    } catch (error) {
      if (requestId !== latestRequest.current) return;

      console.error("Failed to fetch report:", error);

      setData([]);
      setTotalPages(1);
      setTotalCount(0);

      toast.error(
        error?.response?.data?.message ||
          "Failed to fetch report"
      );
    } finally {
      if (requestId === latestRequest.current) {
        setLoading(false);
      }
    }
  };

  // ---------------- AUTO FETCH ON FILTER CHANGE ----------------

  useEffect(() => {
    if (
      dateFilter?.value === "custom" &&
      (!customFrom || !customTo)
    ) {
      latestRequest.current += 1;
      setLoading(false);
      setData([]);
      setPage(1);
      setTotalPages(1);
      setTotalCount(0);
      return;
    }

    if (customFrom && customTo && customFrom > customTo) {
      latestRequest.current += 1;
      setLoading(false);
      setData([]);
      setTotalCount(0);
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
  ]);

  // ---------------- DOWNLOAD REPORT ----------------

  const handleDownloadReport = async () => {
    if (loading || downloadLoading || data.length === 0) {
      return;
    }

    if (
      dateFilter?.value === "custom" &&
      (!customFrom || !customTo)
    ) {
      toast.error("Please select both From Date and To Date");
      return;
    }

    if (customFrom && customTo && customFrom > customTo) {
      toast.error("From Date cannot be after To Date");
      return;
    }

    try {
      setDownloadLoading(true);

      // Same filters, without page and limit
      const params = getReportParams(1, true);

      console.log("Download API Params:", params);

      const response = await authAxios().get(
        DOWNLOAD_ENDPOINT,
        {
          params,
          responseType: "blob",
        }
      );

      const contentType =
        response.headers?.["content-type"] ||
        "application/octet-stream";

      const blob =
        response.data instanceof Blob
          ? response.data
          : new Blob([response.data], {
              type: contentType,
            });

      // Handle backend JSON errors
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

      // Fixed Excel filename
      const fileName = "Freeze Membership Report.xlsx";

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);

      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error("Download API Error:", error);

      let message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to download report";

      // Axios may return an error response as a Blob
      if (error?.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const result = JSON.parse(text);
          message = result.message || message;
        } catch (parseError) {
          console.error("Download error parsing:", parseError);
        }
      }

      toast.error(message);
    } finally {
      setDownloadLoading(false);
    }
  };

  // ---------------- PAGE CHANGE ----------------

  const handlePageChange = (newPage) => {
    if (loading || newPage === page) return;

    setPage(newPage);
    fetchReport(newPage);
  };

  // ---------------- TABLE HELPERS ----------------

  const displayValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return "--";
    }

    return value;
  };

  // ---------------- RENDER ----------------

  return (
    <div className="page--content">
      {/* Header */}
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">
            Home &gt; Reports &gt; Operations Reports &gt;
            Freeze Membership Report
          </p>

          <h1 className="text-3xl font-semibold">
            Freeze Membership Report
          </h1>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 items-center justify-between">
        <div className="flex gap-2 w-full flex-wrap">
          {/* Date Filter */}
          <div className="max-w-[180px] w-full">
            <Select
              placeholder="Date Filter"
              options={dateFilterOptions}
              value={dateFilter}
              onChange={(selected) => {
                setDateFilter(selected);

                if (selected?.value !== "custom") {
                  setCustomFrom(null);
                  setCustomTo(null);
                }

                setPage(1);
              }}
              styles={customStyles}
            />
          </div>

          {/* Custom From Date */}
          {dateFilter?.value === "custom" && (
            <>
              <div className="custom--date dob-format flex-1 max-w-[180px] w-full">
                <span className="absolute z-[1] mt-[11px] ml-[15px]">
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

              {/* Custom To Date */}
              <div className="custom--date dob-format flex-1 max-w-[180px] w-full">
                <span className="absolute z-[1] mt-[11px] ml-[15px]">
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
                  minDate={
                    customFrom || subYears(new Date(), 20)
                  }
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

          {/* Club Filter */}
          <div className="w-full max-w-[200px]">
            <Select
              placeholder="Filter by club"
              value={
                clubOptions.find(
                  (option) => option.value === clubFilter
                ) || null
              }
              options={clubOptions}
              onChange={(option) => {
                setClubFilter(option?.value ?? null);
                setPage(1);
              }}
              isClearable
              styles={customStyles}
            />
          </div>
        </div>

        {/* Download Button */}
        <div className="w-full max-w-[170px]">
          <button
            type="button"
            onClick={handleDownloadReport}
            disabled={
              loading ||
              downloadLoading ||
              data.length === 0 ||
              (dateFilter?.value === "custom" &&
                (!customFrom || !customTo))
            }
            className={`ms-auto px-4 py-2 rounded flex items-center justify-center gap-2 whitespace-nowrap ${
              loading ||
              downloadLoading ||
              data.length === 0 ||
              (dateFilter?.value === "custom" &&
                (!customFrom || !customTo))
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            <LuDownload />

            <span>
              {downloadLoading
                ? "Downloading..."
                : "Download Report"}
            </span>
          </button>
        </div>
      </div>

      {/* Table */}
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

                  <th className="px-2 py-4 min-w-[150px]">
                    Subscription Plan
                  </th>

                  <th className="px-2 py-4 min-w-[130px]">
                    Start Date
                  </th>

                  <th className="px-2 py-4 min-w-[130px]">
                    Original End Date
                  </th>

                  <th className="px-2 py-4 min-w-[180px]">
                    Number of Days Freezed
                  </th>

                  <th className="px-2 py-4 min-w-[120px]">
                    New End Date
                  </th>

                  <th className="px-2 py-4 min-w-[150px]">
                    Last Check-in Date
                  </th>

                  <th className="px-2 py-4 min-w-[120px]">
                    Updated On
                  </th>
                </tr>
              </thead>

              <tbody>
                {data.length > 0 ? (
                  data.map((row, index) => (
                    <tr
                      key={row?.id ?? index}
                      className="bg-white border-b hover:bg-gray-50 transition duration-300"
                    >
                      <td className="px-2 py-4">
                        {displayValue(row.club_name)}
                      </td>

                      <td className="px-2 py-4">
                        {displayValue(
                          row.membership_number ?? row.memberId
                        )}
                      </td>

                      <td className="px-2 py-4">
                        {displayValue(
                          row.member_name ?? row.memberName
                        )}
                      </td>

                      <td className="px-2 py-4">
                        {displayValue(
                          row.service_name ??
                            row.plan_name ??
                            row.planName
                        )}
                      </td>

                      <td className="px-2 py-4">
                        {displayValue(
                          row.start_date ??
                            row.start_date
                        )}
                      </td>

                      <td className="px-2 py-4">
                        {displayValue(
                          row.original_end_date ??
                            row.freezeEndDate
                        )}
                      </td>

                      <td className="px-2 py-4">
                        {displayValue(
                          row.no_of_days_freezed ??
                            row.no_of_days_freezed
                        )}
                      </td>

                      <td className="px-2 py-4">
                        {displayValue(
                          row.new_end_date ??
                            row.newEndDate
                        )}
                      </td>

                      <td className="px-2 py-4">
                        {displayValue(
                          row.last_check_in_date ??
                            row.last_check_in_date
                        )}
                      </td>

                      <td className="px-2 py-4">
                        {displayValue(
                          row.updated_on ??
                            row.updatedOn
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={10}
                      className="text-center px-2 py-6"
                    >
                      {loading
                        ? "Loading report..."
                        : "No data found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
    </div>
  );
};

export default MembershipFrozenReport;
