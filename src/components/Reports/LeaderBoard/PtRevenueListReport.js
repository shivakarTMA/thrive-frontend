import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, subYears, format } from "date-fns";
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
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { LuCalendar, LuDownload } from "react-icons/lu";

const PtRevenueListReport = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [ptRevenueListStaff, setPtRevenueListStaff] = useState([]);
  const [staffDetails, setStaffDetails] = useState("");
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);
  const { id } = useParams();
  // console.log("Staff ID:", id);

  const { user } = useSelector((state) => state.auth);
  const userRole = user.role;

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [filtersInitialized, setFiltersInitialized] = useState(false);

  const fetchPtRevenueListReportLeaderboard = async (currentPage = page) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
        staff_id: Number(id),
      };

      if (customFrom && customTo) {
        params.start_date = format(customFrom, "yyyy-MM-dd");
        params.end_date = format(customTo, "yyyy-MM-dd");
      }

      console.log("API Params:", params);

      const res = await authAxios().get(
        "/leaderboard/sales/pt/revenue/details",
        { params },
      );
      const responseData = res.data;
      const data = responseData?.data || [];

      setPtRevenueListStaff(data);
      setPage(responseData?.currentPage || 1);
      setTotalPages(responseData?.totalPage || 1);
      setTotalCount(responseData?.totalCount || data.length);

      const staffDetailsName = responseData?.staff?.name;
      setStaffDetails(staffDetailsName);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (id) {
      setPage(1);
      fetchPtRevenueListReportLeaderboard(1);
    }
  }, [id, customFrom, customTo]);

  // ── Initialize filters from URL ───────────────────────
  useEffect(() => {
    if (filtersInitialized) return;

    const params = new URLSearchParams(location.search);

    const startDate = params.get("startDate");
    const endDate = params.get("endDate");
    if (startDate && endDate) {
      setCustomFrom(new Date(startDate));
      setCustomTo(new Date(endDate));
    }

    setFiltersInitialized(true);
  }, []);

  useEffect(() => {
    if (!filtersInitialized || !id) return;

    setPage(1);
    fetchPtRevenueListReportLeaderboard(1);
  }, [id, customFrom, customTo, filtersInitialized]);

  return (
    <div className="page--content">
      {/* Header */}
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <h1 className="text-3xl font-semibold">
            {staffDetails} Revenue Report
          </h1>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 items-center justify-between">
        <div className="flex gap-2 w-full">
          <div className="custom--date dob-format flex-1 min-w-[120px] max-w-fit">
            <span className="absolute z-[1] mt-[10px] ml-[15px]">
              <FaCalendarDays />
            </span>
            <DatePicker
              selected={customFrom}
              onChange={(date) => {
                setCustomFrom(date);
                setCustomTo(null);
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
          <div className="custom--date dob-format flex-1 min-w-[120px] max-w-fit">
            <span className="absolute z-[1] mt-[10px] ml-[15px]">
              <FaCalendarDays />
            </span>
            <DatePicker
              selected={customTo}
              onChange={(date) => setCustomTo(date)}
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
        </div>
        {!ALLOWED_ROLES.includes(userRole) && (
          <div className="w-full">
            <button
              // onClick={handleDownloadMembers}
              disabled={ptRevenueListStaff.length === 0}
              className={`ms-auto px-4 py-2 rounded flex items-center gap-2
                ${
                  ptRevenueListStaff.length === 0
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
                <th className=" px-2 py-4 min-w-[150px]">Member Name</th>

                <th className="  px-2 py-4 min-w-[110px]">Member ID</th>
                <th className="  px-2 py-4 min-w-[100px]">Sale Type</th>

                <th className=" px-2 py-4 min-w-[110px]">Start Date</th>
                <th className=" px-2 py-4 min-w-[110px]">End Date</th>
                <th className=" px-2 py-4 min-w-[170px]">Service Name</th>
                <th className=" px-2 py-4 min-w-[120px] text-center">
                  Total Sessions
                </th>
                <th className=" px-2 py-4 min-w-[150px] text-center">
                  Completed Sessions
                </th>
                <th className=" px-2 py-4 min-w-[150px] text-center">
                  Pending Sessions
                </th>
                <th className=" px-2 py-4 min-w-[120px]">Amount Paid</th>
              </tr>
            </thead>

            <tbody>
              {ptRevenueListStaff.map((row, index) => (
                <tr
                  key={`${row.staff_id}-${index}`}
                  className="bg-white border-b hover:bg-gray-50 border-gray-200"
                >
                  <td className=" px-2 py-4">{row?.member_name}</td>
                  <td className="  px-2 py-4 ">{row?.membership_number}</td>
                  <td className="  px-2 py-4 ">
                    {row?.sale_type ? formatText(row?.sale_type) : "--"}
                  </td>

                  <td className="  px-2 py-4 ">
                    {row?.start_date ? formatAutoDate(row?.start_date) : "--"}
                  </td>
                  <td className="  px-2 py-4 ">
                    {row?.end_date ? formatAutoDate(row?.end_date) : "--"}
                  </td>
                  <td className="  px-2 py-4 ">{row?.service_name}</td>
                  <td className="  px-2 py-4 text-center">
                    {row?.total_sessions}
                  </td>
                  <td className="  px-2 py-4 text-center ">
                    {row?.completed_sessions}
                  </td>
                  <td className="  px-2 py-4 text-center ">
                    {row?.pending_sessions}
                  </td>
                  <td className="  px-2 py-4 ">
                    ₹
                    {row?.amount_paid
                      ? formatIndianNumber(row?.amount_paid)
                      : 0}
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
          currentDataLength={ptRevenueListStaff.length}
          onPageChange={(newPage) => {
            setPage(newPage);
            fetchPtRevenueListReportLeaderboard(newPage);
          }}
        />
      </div>
    </div>
  );
};

export default PtRevenueListReport;
