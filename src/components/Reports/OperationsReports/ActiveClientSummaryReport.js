import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, format, subYears } from "date-fns";
import { FaCalendarDays } from "react-icons/fa6";
import Select from "react-select";
import {
  customStyles,
  filterActiveItems,
  formatAutoDate,
  formatIndianNumber,
  formatText,
} from "../../../Helper/helper";
import { authAxios } from "../../../config/config";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Pagination from "../../common/Pagination";

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

  const genderOptions = [
    { value: "MALE", label: "Male" },
    { value: "FEMALE", label: "Female" },
    { value: "NOTDISCLOSE", label: "Prefer Not To Say" },
  ];

const formatDate = (date) => format(date, "yyyy-MM-dd");

const ActiveClientReport = () => {
  const [activeMember, setActiveMember] = useState([]);
  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);

  const [companyList, setCompanyList] = useState([]);
  const [companyFilter, setCompanyFilter] = useState(null);
  const [genderFilter, setGenderFilter] = useState(null);

  const { user } = useSelector((state) => state.auth);
  const userRole = user.role;

  const [dateFilter, setDateFilter] = useState(dateFilterOptions[1]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

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
      toast.error("Failed to fetch clubs");
    }
  };
  // Function to fetch role list

  // Function to fetch company list
  const fetchCompanies = async () => {
    try {
      const response = await authAxios().get("/company/list");
      const data = response.data?.data || [];
      const activeOnly = filterActiveItems(data);
      setCompanyList(activeOnly)
    } catch (error) {
      toast.error("Failed to fetch company");
    }
  };
  // Function to fetch company list

  useEffect(() => {
    fetchClub();
    fetchCompanies();
  }, []);

  const clubOptions = clubList.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  const companyOptions = companyList.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  const fetchActiveClientReport = async (currentPage = page) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };

      // Club filter
      if (clubFilter) {
        params.club_id = clubFilter;
      }

      // Company filter
      if (companyFilter) {
        params.company_id = companyFilter;
      }
      // Gender filter
      if (genderFilter) {
        params.gender = genderFilter;
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

      const res = await authAxios().get("/report/active/client/list", {
        params,
      });
      const responseData = res.data;
      const data = responseData?.data || [];

      console.log(responseData, "responseData");

      setActiveMember(data);
      setPage(responseData?.currentPage || 1);
      setTotalPages(responseData?.totalPage || 1);
      setTotalCount(responseData?.totalCount || data.length);
    } catch (err) {
      console.error(err);
      toast.error("data not found");
    }
  };

  useEffect(() => {
    if (dateFilter?.value === "custom") {
      if (customFrom && customTo) {
        fetchActiveClientReport(1);
      }
      return;
    }
    setPage(1);
    fetchActiveClientReport(1);
  }, [dateFilter, customFrom, customTo, clubFilter, companyFilter, genderFilter]);

  return (
    <div className="page--content">
      {/* Header */}
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">
            {`Home > Reports > Operations Reports > Active Client Report`}
          </p>
          <h1 className="text-3xl font-semibold">Active Client Report</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 items-center justify-between">
        <div className="flex gap-2 w-full">
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
                <span className="absolute z-[1] mt-[11px] ml-[15px]">
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
                <span className="absolute z-[1] mt-[11px] ml-[15px]">
                  <FaCalendarDays />
                </span>
                <DatePicker
                  selected={customTo}
                  onChange={(date) => setCustomTo(date)}
                  placeholderText="To Date"
                  className="custom--input w-full input--icon"
                  minDate={customFrom || subYears(new Date(), 20)}
                  maxDate={addYears(new Date(), 0)}
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
              placeholder="Filter by Company"
              value={companyOptions.find((o) => o.value === companyFilter) || null}
              options={companyOptions}
              onChange={(option) => setCompanyFilter(option?.value)}
              styles={customStyles}
              className="w-full"
              isClearable={userRole === "ADMIN" ? true : false}
            />
          </div>
          <div className="w-fit min-w-[200px]">
            <Select
              placeholder="Filter by Gender"
              value={genderOptions.find((o) => o.value === genderFilter) || null}
              options={genderOptions}
              onChange={(option) => setGenderFilter(option?.value)}
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
                <th className="px-2 py-4 min-w-[150px]">Club Name</th>
                <th className="px-2 py-4 min-w-[100px]">Member ID</th>
                <th className="px-2 py-4 min-w-[120px]">Member Name</th>
                <th className="px-2 py-4 min-w-[120px]">Plan Name</th>
                <th className="px-2 py-4 min-w-[100px]">Start Date</th>
                <th className="px-2 py-4 min-w-[100px]">End Date</th>
                <th className="px-2 py-4 min-w-[150px]">Last Check-in Date</th>
                <th className="px-2 py-4 min-w-[120px]">Lead Source</th>
                <th className="px-2 py-4 min-w-[120px]">Sales Rep Name</th>
                <th className="px-2 py-4 min-w-[100px]">Bill Amount</th>
                <th className="px-2 py-4 min-w-[100px]">Pay Mode</th>
                <th className="px-2 py-4 min-w-[150px]">Company Name</th>
                <th className="px-2 py-4 min-w-[100px]">Gender</th>
              </tr>
            </thead>

            <tbody>
              {activeMember.length ? (
                activeMember.map((row, index) => (
                  <tr
                    key={index}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <td className="px-2 py-4">{row.club_name || "--"}</td>
                    <td className="px-2 py-4">
                      {row.membership_number ? row.membership_number : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {row.full_name ? row.full_name : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {row.plan_name ? row.plan_name : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {row.start_date ? formatAutoDate(row.start_date) : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {row.end_date ? formatAutoDate(row.end_date) : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {row.last_check_in_date
                        ? formatAutoDate(row.last_check_in_date)
                        : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {row.lead_source ? row.lead_source : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {row.sales_rep_name ? row.sales_rep_name : "--"}
                    </td>
                    <td className="px-2 py-4">
                      ₹{formatIndianNumber(row.booking_amount)}
                    </td>
                    <td className="px-2 py-4">
                      {row.payment_method
                        ? formatText(row.payment_method)
                        : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {row.company_name ? row.company_name : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {formatText(
                        row?.gender === "NOTDISCLOSE"
                          ? "Prefer Not To Say"
                          : row?.gender,
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={13} className="text-center py-4">
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
          currentDataLength={activeMember.length}
          onPageChange={(newPage) => {
            setPage(newPage);
            fetchActiveClientReport(newPage);
          }}
        />
      </div>
    </div>
  );
};

export default ActiveClientReport;
