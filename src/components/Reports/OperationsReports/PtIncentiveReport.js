import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, startOfMonth, endOfMonth, isSameMonth } from "date-fns";
import { FaCalendarDays } from "react-icons/fa6";
import Select from "react-select";
import {
    ALLOWED_ROLES,
  customStyles,
  filterActiveItems,
  formatAutoDate,
  formatIndianNumber,
  formatText,
  selectIcon,
} from "../../../Helper/helper";
import { authAxios } from "../../../config/config";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Pagination from "../../common/Pagination";
import { FaCircle } from "react-icons/fa";
import { IoEyeOutline } from "react-icons/io5";
import Tooltip from "../../common/Tooltip";
import { Link } from "react-router-dom";
import { LuCalendar, LuDownload } from "react-icons/lu";
import IsLoadingHOC from "../../common/IsLoadingHOC";

const PtIncentiveReport = (props) => {
  const { setLoading } = props;
  const [leaderboardCallLogs, setLeaderboardCallLogs] = useState([]);
  const [stats, setStats] = useState({});
  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);

  const { user } = useSelector((state) => state.auth);
  const userRole = user.role;

  const formatMonth = (date) => format(date, "yyyy-MM");
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Function to fetch club list
  const fetchClub = async (search = "") => {
    try {
      const response = await authAxios().get("/club/list", {
        params: search ? { search } : {},
      });
      const data = response.data?.data || [];
      const activeOnly = filterActiveItems(data);
      setClubList(activeOnly);

      // ✅ Set default club (index 0) ONLY if not already set
      if (!clubFilter && activeOnly.length > 0) {
        setClubFilter(activeOnly[0].id);
      }
    } catch (error) {
      console.error(error);
    }
  };
  // Function to fetch role list

  useEffect(() => {
    fetchClub();
  }, []);

  const clubOptions = clubList.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  const fetchPtIncentiveReport = async (currentPage = page) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };

      // Club filter
      if (clubFilter) {
        params.club_id = clubFilter;
      }

      // month filter (YYYY-MM)
      if (selectedMonth) {
        params.month = formatMonth(selectedMonth);
      }

      const res = await authAxios().get("/incentive/policy/pt", {
        params,
      });
      const responseData = res.data;
      const data = responseData?.data || [];

      // console.log(responseData,'checking call log')

      setLeaderboardCallLogs(data);
      setPage(responseData?.currentPage || 1);
      setTotalPages(responseData?.totalPage || 1);
      setTotalCount(responseData?.totalCount || data.length);

      const statusCount = responseData?.summary || {}

      setStats({
        totalNewSales : statusCount?.total_new_sales,
        totalRenewals : statusCount?.total_renewals,
      })

    } catch (err) {
      console.error(err);
    }
  };

 useEffect(() => {
    if (clubFilter !== null) {
      setPage(1);
      fetchPtIncentiveReport(1);
    }
  }, [selectedMonth, clubFilter]);

  const getDateRange = (selectedMonth) => {
    const today = new Date();

    const startDate = format(startOfMonth(selectedMonth), "yyyy-MM-dd");

    const endDate = isSameMonth(selectedMonth, today)
      ? format(today, "yyyy-MM-dd") // current month -> today's date
      : format(endOfMonth(selectedMonth), "yyyy-MM-dd"); // past month -> last day of month

    return { startDate, endDate };
  };
  const { startDate, endDate } = getDateRange(selectedMonth);

  const handleDownloadPtIncentiveReport = async () => {
    try {
      setLoading(true);

      const params = {};

      // Club filter
      if (clubFilter) {
        params.club_id = clubFilter;
      }

      // month filter (YYYY-MM)
      if (selectedMonth) {
        params.month = formatMonth(selectedMonth);
      }

      console.log("📥 Download Params:", params);

      const response = await authAxios().get("/incentive/policy/pt/download", {
        params,
        responseType: "blob",
      });

      // 📄 Create download
      const blob = new Blob([response.data]);

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.setAttribute("download", "PT_Incentive_Report.xlsx");

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      toast.success("PT incentive report downloaded successfully!");
    } catch (error) {
      console.error(error);

      toast.error("Failed to download PT incentive report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page--content">
      {/* Header */}
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <h1 className="text-3xl font-semibold">PT Incentive Report</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 items-center justify-between">
        <div className="flex gap-2 w-full">
          <div className="max-w-[180px] w-full">
            <div className="custom--date">
              <span className="absolute mt-[12px] ml-[15px] z-[1]">
                <LuCalendar />
              </span>
              <DatePicker
                selected={selectedMonth}
                onChange={(date) => setSelectedMonth(date)}
                dateFormat="MM-yyyy"
                showMonthYearPicker
                maxDate={endOfMonth(new Date())}
                className="custom--input w-full input--icon"
                placeholderText="Select Month"
                styles={selectIcon}
              />
            </div>
          </div>

          <div className="w-fit min-w-[200px]">
            <Select
              placeholder="Filter by club"
              value={clubOptions.find((o) => o.value === clubFilter) || null}
              options={clubOptions}
              onChange={(option) => setClubFilter(option?.value)}
              styles={customStyles}
              className="w-full"
              isClearable={userRole === "ADMIN" ? true : false}
            />
          </div>
        </div>
        {!ALLOWED_ROLES.includes(userRole) && (
            <div className="w-full">
              <button
                onClick={handleDownloadPtIncentiveReport}
                disabled={leaderboardCallLogs.length === 0}
                className={`ms-auto px-4 py-2 rounded flex items-center gap-2
                ${
                  leaderboardCallLogs.length === 0
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                <LuDownload /> <span>Download Report</span>
              </button>
            </div>
          )}
      </div>

      {/* Table */}
      <div className="w-full p-3 border bg-white shodow--box rounded-[10px]">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className=" px-2 py-4">
                  Trainer Name
                </th>

                <th
                  className="  px-2 py-4 text-center font-bold"
                >
                  Active Clients
                </th>

                <th
                  className=" px-2 py-4 text-center font-bold"
                >
                  Revenue this month
                </th>

                <th className="  px-2 py-4 text-center font-bold">
                  Sessions conducted
                </th>
                <th className="  px-2 py-4 text-center font-bold">
                  Incentive Slab
                </th>
                <th className="  px-2 py-4 text-center font-bold">
                  Incentive Amount
                </th>
              </tr>
            </thead>

            <tbody>
              {leaderboardCallLogs.map((row, index) => (
                <tr key={`${row.staff_id}-${index}`} className="bg-white border-b hover:bg-gray-50 border-gray-200">
                  <td className=" px-2 py-4">
                    {row?.trainer_name}
                  </td>

                  <td className="  px-2 py-4 text-center">
                    {row?.active_clients}
                  </td>

                  <td className="  px-2 py-4 text-center">
                    ₹{row?.revenue_this_month ? formatIndianNumber(row?.revenue_this_month) : 0}
                  </td>

                  <td className="  px-2 py-4 text-center">
                    {row?.sessions_conducted}
                  </td>
                  <td className="  px-2 py-4 text-center">
                    {row?.incentive_slab}%
                  </td>
                  <td className="  px-2 py-4 text-center">
                    ₹{row?.incentive_amount ? formatIndianNumber(row?.incentive_amount) : 0}
                  </td>

                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination Component */}
        <Pagination
          page={page}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          currentDataLength={leaderboardCallLogs.length}
          onPageChange={(newPage) => {
            setPage(newPage);
            fetchPtIncentiveReport(newPage);
          }}
        />
      </div>
    </div>
  );
};

export default IsLoadingHOC(PtIncentiveReport);
