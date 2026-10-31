
import React, { useCallback, useEffect, useState } from "react";
import Select from "react-select";
import { authAxios } from "../../../config/config";
import {
  customStyles,
  filterActiveItems,
} from "../../../Helper/helper";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const monthOptions = [
  { value: 0, label: "January" },
  { value: 1, label: "February" },
  { value: 2, label: "March" },
  { value: 3, label: "April" },
  { value: 4, label: "May" },
  { value: 5, label: "June" },
  { value: 6, label: "July" },
  { value: 7, label: "August" },
  { value: 8, label: "September" },
  { value: 9, label: "October" },
  { value: 10, label: "November" },
  { value: 11, label: "December" },
];

const currentDate = new Date();
const currentMonth = currentDate.getMonth();
const currentYear = currentDate.getFullYear();

const yearOptions = Array.from({ length: 10 }, (_, i) => {
  const year = currentYear - i;

  return {
    value: year,
    label: year.toString(),
  };
});

const RenewalReport = () => {
  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);

  const [selectedMonth, setSelectedMonth] = useState(
    monthOptions.find((month) => month.value === currentMonth)
  );

  const [selectedYear, setSelectedYear] = useState(
    yearOptions.find((year) => year.value === currentYear)
  );

  const [reportData, setReportData] = useState([]);
  const [reportTotal, setReportTotal] = useState(null);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleViewList = (clubId, listType) => {
    if (!selectedMonth || !selectedYear || !clubId) {
      toast.error("Please select a month, year, and club.");
      return;
    }

    const month = selectedMonth.value; // 0-based month
    const year = selectedYear.value;

    // Calculate the first and last day of the selected month.
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const formatDate = (date) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");

      return `${yyyy}-${mm}-${dd}`;
    };
    const renewedTypeMap = {
      renewal: "RENEWAL",
      reinstatement: "REINSTATEMENTS",
      "advance-renewal": "ADVANCE_RENEWAL",
    };

    const params = new URLSearchParams({
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      club_id: String(clubId),
      renewed_type: renewedTypeMap[listType],
    });

    // Optional: preserve which View button was clicked.
    // Remove listType if the destination does not need it.
    // params.set("listType", listType);

    navigate(
      `/reports/operations-reports/membership-expiry-report?${params.toString()}`
    );
  };

  // Fetch active clubs for the dropdown.
  const fetchClub = async () => {
    try {
      const response = await authAxios().get("/club/list");

      const clubs = response.data?.data || [];
      const activeClubs = filterActiveItems(clubs);

      setClubList(activeClubs);
    } catch (error) {
      console.error("Error fetching clubs:", error);
      toast.error("Failed to fetch club list.");
    }
  };

  useEffect(() => {
    fetchClub();
  }, []);

  // Prepare dropdown options.
  const clubOptions = clubList.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  // Fetch renewal report from the API.
  const fetchRenewalReport = useCallback(async () => {
    setLoading(true);

    try {
      const params = {};

      // Club filter is optional.
      if (clubFilter !== null && clubFilter !== undefined) {
        params.club_id = clubFilter;
      }

      // The dropdown uses 0-11 for January-December.
      // The API is assumed to use 1-12.
      if (selectedMonth !== null) {
        params.month = selectedMonth.value + 1;
      }

      if (selectedYear !== null) {
        params.year = selectedYear.value;
      }

      const response = await authAxios().get(
        "/report/renewal/iteration/list",
        { params }
      );

      const responseData = response.data;

      if (responseData?.success) {
        setReportData(responseData.data || []);
        setReportTotal(responseData.total || null);
      } else {
        setReportData([]);
        setReportTotal(null);

        toast.error(
          responseData?.message || "Failed to fetch renewal report."
        );
      }
    } catch (error) {
      console.error("Error fetching renewal report:", error);

      setReportData([]);
      setReportTotal(null);

      toast.error(
        error.response?.data?.message ||
          "Failed to fetch renewal report."
      );
    } finally {
      setLoading(false);
    }
  }, [clubFilter, selectedMonth, selectedYear]);

  // Fetch report whenever a filter changes.
  useEffect(() => {
    fetchRenewalReport();
  }, [fetchRenewalReport]);

  // Read total values safely from the API response.
  const thisMonthTotal = reportTotal?.this_month_summary || {};
  const oldExpiredTotal = reportTotal?.old_expired_memberships || {};
  const advanceTotal =
    reportTotal?.membership_renewed_in_advance || {};

  return (
    <div className="page--content">
      {/* Header */}
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">
            Home &gt; Reports &gt; Operations Reports &gt; Renewal Report
          </p>

          <h1 className="text-3xl font-semibold">
            Renewal Report
          </h1>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-center justify-between">
        <div className="flex flex-wrap gap-2 w-full">
          {/* Month filter */}
          <div className="max-w-[160px] w-full">
            <Select
              placeholder="Month"
              options={monthOptions}
              value={selectedMonth}
              onChange={setSelectedMonth}
              // isClearable
              styles={customStyles}
            />
          </div>

          {/* Year filter */}
          <div className="w-full max-w-[140px]">
            <Select
              placeholder="Year"
              options={yearOptions}
              value={selectedYear}
              onChange={setSelectedYear}
              // isClearable
              styles={customStyles}
            />
          </div>

          {/* Club filter */}
          <div className="w-full max-w-[200px]">
            <Select
              placeholder="Filter by club"
              options={clubOptions}
              value={
                clubOptions.find(
                  (option) => option.value === clubFilter
                ) || null
              }
              onChange={(option) =>
                setClubFilter(option?.value ?? null)
              }
              isClearable
              styles={customStyles}
            />
          </div>
        </div>
      </div>

      {/* Report table */}
      <div className="w-full p-3 border bg-white shadow--box rounded-[10px]">
        <div className="relative overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th
                  rowSpan={2}
                  className="border px-3 py-2 whitespace-nowrap"
                >
                  Club Name
                </th>

                <th
                  colSpan={5}
                  className="border px-3 py-2 whitespace-nowrap"
                >
                  This Month&apos;s Summary
                </th>

                <th
                  colSpan={5}
                  className="border px-3 py-2 whitespace-nowrap"
                >
                  Old Expired Memberships
                </th>

                <th
                  colSpan={2}
                  className="border px-3 py-2 whitespace-nowrap"
                >
                  Membership Renewed In Advance
                </th>
              </tr>

              <tr>
                {/* This month's summary */}
                <th className="border px-3 py-2 whitespace-nowrap">
                  Total Expiry
                </th>
                <th className="border px-3 py-2 whitespace-nowrap">
                  Total Renewal
                </th>
                <th className="border px-3 py-2 whitespace-nowrap">
                  Renewal %
                </th>
                <th className="border px-3 py-2 whitespace-nowrap">
                  Attrition %
                </th>
                <th className="border px-3 py-2 whitespace-nowrap">
                  List
                </th>

                {/* Old expired memberships */}
                <th className="border px-3 py-2 whitespace-nowrap">
                  Total Old Expiry
                </th>
                <th className="border px-3 py-2 whitespace-nowrap">
                  Total Reinstatements
                </th>
                <th className="border px-3 py-2 whitespace-nowrap">
                  Reinstatement %
                </th>
                <th className="border px-3 py-2 whitespace-nowrap">
                  List
                </th>

                {/* Advance renewals */}
                <th className="border px-3 py-2 whitespace-nowrap">
                  Renewed In Advance
                </th>
                <th className="border px-3 py-2 whitespace-nowrap">
                  List
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={12}
                    className="border px-3 py-6 text-center"
                  >
                    Loading renewal report...
                  </td>
                </tr>
              ) : reportData.length === 0 ? (
                <tr>
                  <td
                    colSpan={12}
                    className="border px-3 py-6 text-center"
                  >
                    No renewal report data found.
                  </td>
                </tr>
              ) : (
                reportData.map((row) => {
                  const monthSummary =
                    row.this_month_summary || {};

                  const oldExpired =
                    row.old_expired_memberships || {};

                  const advanceRenewal =
                    row.membership_renewed_in_advance || {};

                  return (
                    <tr
                      key={row.club_id}
                      className="text-center"
                    >
                      <td className="border px-3 py-2 text-left whitespace-nowrap">
                        {row.club_name || "-"}
                      </td>

                      {/* This month's summary */}
                      <td className="border px-3 py-2">
                        {monthSummary.total_expiry ?? 0}
                      </td>

                      <td className="border px-3 py-2">
                        {monthSummary.total_renewal ?? 0}
                      </td>

                      <td className="border px-3 py-2">
                        {monthSummary.renewal_percentage ?? 0}%
                      </td>

                      <td className="border px-3 py-2">
                        {monthSummary.attrition_percentage ?? 0}%
                      </td>

                      <td className="border px-3 py-2">
                        <button
                          type="button"
                          className="bg-black text-white px-3 py-1 rounded"
                          onClick={() => handleViewList(row.club_id, "renewal")}
                        >
                          View
                        </button>
                      </td>

                      {/* Old expired memberships */}
                      <td className="border px-3 py-2">
                        {oldExpired.old_expiry ?? 0}
                      </td>

                      <td className="border px-3 py-2">
                        {oldExpired.total_reinstatements ?? 0}
                      </td>

                      <td className="border px-3 py-2">
                        {oldExpired.reinstatement_percentage ?? 0}%
                      </td>

                      <td className="border px-3 py-2">
                        <button
                          type="button"
                          className="bg-black text-white px-3 py-1 rounded"
                          onClick={() => handleViewList(row.club_id, "reinstatement")}
                        >
                          View
                        </button>
                      </td>

                      {/* Advance renewals */}
                      <td className="border px-3 py-2">
                        {advanceRenewal.advance_renewal ?? 0}
                      </td>

                      <td className="border px-3 py-2">
                        <button
                          type="button"
                          className="bg-black text-white px-3 py-1 rounded"
                          onClick={() => handleViewList(row.club_id, "advance-renewal")}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}

              {/* Total row */}
              {!loading && reportData.length > 0 && (
                <tr className="font-bold bg-gray-50 text-center">
                  <td className="border px-3 py-2 text-left">
                    Total
                  </td>

                  <td className="border px-3 py-2">
                    {thisMonthTotal.expiry_count ?? 0}
                  </td>

                  <td className="border px-3 py-2">
                    {thisMonthTotal.renewal_count ?? 0}
                  </td>

                  <td colSpan="3" className="border px-3 py-2"></td>

                  <td className="border px-3 py-2">
                    {oldExpiredTotal.old_expiry_count ?? 0}
                  </td>

                  <td className="border px-3 py-2">
                    {oldExpiredTotal.reinstatements_count ?? 0}
                  </td>

                  <td colSpan="3" className="border px-3 py-2"></td>

                  {/* <td className="border px-3 py-2">
                    {advanceTotal.advance_renewal_count ?? 0}
                  </td> */}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RenewalReport;
