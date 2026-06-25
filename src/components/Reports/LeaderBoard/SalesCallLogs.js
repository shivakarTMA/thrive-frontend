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

const SalesCallLogs = () => {
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

  const fetchSalesCallLogsLeaderboard = async (currentPage = page) => {
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

      const res = await authAxios().get("/leaderboard/sales/calllog", {
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
        totalAttempts : statusCount?.total_attempts,
        totalContacted : statusCount?.total_contacted,
        totalMemberCalls : statusCount?.total_member_calls,
        totalNotContacted : statusCount?.total_not_contacted,
        totalProspectingCalls : statusCount?.total_prospecting_calls,
      })

    } catch (err) {
      console.error(err);
    }
  };

 useEffect(() => {
    if (clubFilter !== null) {
      setPage(1);
      fetchSalesCallLogsLeaderboard(1);
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

  return (
    <div className="page--content">
      {/* Header */}
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <h1 className="text-3xl font-semibold">Call logs</h1>
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
                // onClick={handleDownloadMembers}
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

      {/* Dynamic Statistics */}
      <div className="grid grid-cols-5 gap-3 mb-5 p-3 border bg-white shodow--box rounded-[10px]">
        <div className="border rounded-[5px] overflow-hidden w-full">
          <div className="flex gap-1 justify-center bg-[#F1F1F1] p-4 py-3">
            <div className="text-lg font-bold text-center">Attempts</div>
          </div>
          <div>
            <p className="text-3xl font-bold p-2 text-center py-5">
              {stats?.totalAttempts}
            </p>
          </div>
        </div>
        <div className="border rounded-[5px] overflow-hidden w-full">
          <div className="flex gap-1 justify-center bg-[#F1F1F1] p-4 py-3">
            <div className="text-lg font-bold text-center">Contacted</div>
          </div>
          <div>
            <p className="text-3xl font-bold p-2 text-center py-5">
            {stats?.totalContacted}
            </p>
          </div>
        </div>
        <div className="border rounded-[5px] overflow-hidden w-full">
          <div className="flex gap-1 justify-center bg-[#F1F1F1] p-4 py-3">
            <div className="text-lg font-bold text-center">Not-Contacted</div>
          </div>
          <div>
            <p className="text-3xl font-bold p-2 text-center py-5">
              {stats?.totalNotContacted}
            </p>
          </div>
        </div>
        <div className="border rounded-[5px] overflow-hidden w-full">
          <div className="flex gap-1 justify-center bg-[#F1F1F1] p-4 py-3">
            <div className="text-lg font-bold text-center">Prospecting Calls</div>
          </div>
          <div>
            <p className="text-3xl font-bold p-2 text-center py-5">
              {stats?.totalProspectingCalls}
            </p>
          </div>
        </div>
        <div className="border rounded-[5px] overflow-hidden w-full">
          <div className="flex gap-1 justify-center bg-[#F1F1F1] p-4 py-3">
            <div className="text-lg font-bold text-center">Member Calls</div>
          </div>
          <div>
            <p className="text-3xl font-bold p-2 text-center py-5">
              {stats?.totalMemberCalls}
            </p>
          </div>
        </div>
        
      </div>

      {/* Table */}
      <div className="w-full p-3 border bg-white shodow--box rounded-[10px]">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className=" px-2 py-4">
                  Staff Name
                </th>

                <th
                  className="  px-2 py-4 text-center font-bold"
                >
                  Attempts
                </th>

                <th
                  className=" px-2 py-4 text-center font-bold"
                >
                  Contacted
                </th>

                <th className="  px-2 py-4 text-center">
                  Not-Contacted
                </th>
                <th className="  px-2 py-4 text-center">
                  Prospecting Calls
                </th>
                <th className="  px-2 py-4 text-center">
                  Member Calls
                </th>

                <th className="  px-2 py-4">
                  View
                </th>
              </tr>
            </thead>

            <tbody>
              {leaderboardCallLogs.map((row, index) => (
                <tr key={`${row.staff_id}-${index}`} className="bg-white border-b hover:bg-gray-50 border-gray-200">
                  <td className=" px-2 py-4">
                    {row?.staff_name}
                  </td>

                  <td className="  px-2 py-4 text-center">
                    {row?.attempts}
                  </td>

                  <td className="  px-2 py-4 text-center">
                    {row?.contacted}
                  </td>

                  <td className="  px-2 py-4 text-center font-medium">
                    {row?.not_contacted}
                  </td>

                  <td className="px-2 py-4 text-center">
                    {row?.prospecting_calls}
                  </td>

                  <td className="px-2 py-4 text-center">
                    {row?.member_calls}
                  </td>

                  <td className=" px-2 py-4 text-center">
                    <Tooltip
                      id={`tooltip-view-${row.id}`}
                      content="View Call Log"
                      place="left"
                    >
                      <Link
                        to={`/leaderboard/sales/call-logs/call-log-report?club_id=${clubFilter}&startDate=${startDate}&endDate=${endDate}&lead_owner=${row.staff_id}`}
                        className="p-1 cursor-pointer block"
                      >
                        <IoEyeOutline className="text-[25px] text-black" />
                      </Link>
                    </Tooltip>
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
            fetchSalesCallLogsLeaderboard(newPage);
          }}
        />
      </div>
    </div>
  );
};

export default SalesCallLogs;
