import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, format, subYears } from "date-fns";
import { FaCalendarDays } from "react-icons/fa6";
import Select from "react-select";
import {
  customStyles,
  filterActiveItems,
  formatIndianNumber,
} from "../../Helper/helper";
import { authAxios } from "../../config/config";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Pagination from "../common/Pagination";
import { FiEye } from "react-icons/fi";
import { IoSearchOutline } from "react-icons/io5";

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const statusFilterOptions = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

const formatDate = (date) => format(date, "yyyy-MM-dd");

const KycDocumentsList = () => {
  const [kycDocumentsData, setKycDocumentsData] = useState([]);
  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [nameFilter, setNameFilter] = useState(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { user } = useSelector((state) => state.auth);
  const userRole = user.role;

  const [dateFilter, setDateFilter] = useState(dateFilterOptions[0]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(2);
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

  const fetchMemberKycDocuments = async (search, currentPage) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
        ...(search ? { search } : {}),
      };

      // Club filter
      if (clubFilter) {
        params.club_id = clubFilter;
      }

      // Status filter
      if (statusFilter) {
        params.status = statusFilter;
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

      const res = await authAxios().get("/kyc/document/status/list", {
        params,
      });
      const responseData = res.data;
      const data = responseData?.data || [];

      setKycDocumentsData(data);
      setPage(responseData?.currentPage || 1);
      setTotalPages(responseData?.totalPage || 1);
      setTotalCount(responseData?.totalCount || data.length);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(searchTerm);
    setPage(1); // reset page on search
  }, 500);

  return () => clearTimeout(timer);
}, [searchTerm]);
useEffect(() => {
  // Handle custom date
  if (dateFilter?.value === "custom") {
    if (!(customFrom && customTo)) return;
  }

  fetchMemberKycDocuments(debouncedSearch, page);
}, [
  page,
  debouncedSearch,
  dateFilter,
  customFrom,
  customTo,
  clubFilter,
  statusFilter,
]);

useEffect(() => {
  setPage(1);
}, [statusFilter, clubFilter, dateFilter, customFrom, customTo]);

  return (
    <div className="page--content">
      {/* Header */}
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > Kyc Documents`}</p>
          <h1 className="text-3xl font-semibold">Kyc Documents</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 items-center justify-between">
        <div className="flex gap-2 w-full">
          {/* Search */}
          <div className="w-full max-w-[200px] relative">
            <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
              <IoSearchOutline />
            </span>
            <input
              type="text"
              placeholder="Search club..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="custom--input w-full input--icon"
            />
          </div>
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
              }}
              styles={customStyles}
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
                    setCustomTo(null); // ✅ reset To Date if From Date changes
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
                  onChange={(date) => setCustomTo(date)}
                  placeholderText="To Date"
                  className="custom--input w-full input--icon"
                  minDate={customFrom || subYears(new Date(), 20)}
                  // maxDate={addYears(new Date(), 0)}
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  dateFormat="dd-MM-yyyy"
                  disabled={!customFrom}
                />
              </div>
            </>
          )}

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
          <div className="w-fit min-w-[200px]">
            <Select
              placeholder="Filter by status"
              value={
                statusFilterOptions.find((o) => o.value === statusFilter) ||
                null
              }
              options={statusFilterOptions}
              onChange={(option) => setStatusFilter(option?.value)}
              styles={customStyles}
              className="w-full"
              isClearable={userRole === "ADMIN" ? true : false}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="w-full p-3 border bg-white shodow--box rounded-[10px]">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-2 py-4 min-w-[150px]">club name</th>
                <th className="px-2 py-4 min-w-[120px]">Membership ID</th>
                <th className="px-2 py-4 min-w-[150px]">Member Name</th>
                <th className="px-2 py-4 min-w-[200px]">Membership Duration</th>
                <th className="px-2 py-4 min-w-[150px]">Upload Date</th>
                <th className="px-2 py-4 min-w-[150px]">Reviewed By</th>
                <th className="px-2 py-4 min-w-[150px]">Status</th>
                <th className="px-2 py-4 min-w-[120px]">Source</th>
                <th className="px-2 py-4 min-w-[120px]">Remark</th>
                {(userRole === "FOH" ||
                  userRole === "CLUB_MANAGER" ||
                  userRole === "ADMIN") && (
                  <th className="px-2 py-4 min-w-[100px]">Action</th>
                )}
              </tr>
            </thead>

            <tbody>
              {kycDocumentsData.length ? (
                kycDocumentsData.map((row, index) => (
                  <tr
                    key={index}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <td className="px-2 py-4">{row?.club_name || "--"}</td>
                    <td className="px-2 py-4">{row?.membership_id}</td>
                    <td className="px-2 py-4">{row?.member_name}</td>
                    <td className="px-2 py-4">{row?.membership_duration}</td>
                    <td className="px-2 py-4">{row?.upload_date}</td>
                    <td className="px-2 py-4">{row?.reviewed_by}</td>
                    <td className="px-2 py-4">{row?.status}</td>
                    <td className="px-2 py-4">{row?.source}</td>
                    <td className="px-2 py-4">{row?.remark || "--"}</td>
                    {(userRole === "FOH" ||
                      userRole === "CLUB_MANAGER" ||
                      userRole === "ADMIN") && (
                      <td className="px-2 py-4">
                        <button
                          type="button"
                          className="w-[30px] h-[30px] text-center flex items-center justify-center bg-gray-100 text-black rounded gap-2 !text-[13px]"
                        >
                          <FiEye className="text-lg" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="text-center py-4">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Component */}
        <Pagination
          page={page}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          currentDataLength={kycDocumentsData.length}
          onPageChange={(newPage) => {
            setPage(newPage);
            }}
        />
      </div>
    </div>
  );
};

export default KycDocumentsList;
