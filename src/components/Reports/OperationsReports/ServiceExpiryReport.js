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
import { FaCircle } from "react-icons/fa";
import CreateNewInvoice from "../../../Pages/CreateNewInvoice";

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const formatDate = (date) => format(date, "yyyy-MM-dd");

const ServiceExpiryReport = () => {
  const [activeService, setActiveService] = useState([]);
  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [selectedLeadMember, setSelectedLeadMember] = useState(null);
  const [selectedLeadClub, setSelectedLeadClub] = useState(null);

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

  useEffect(() => {
    fetchClub();
  }, []);

  const clubOptions = clubList.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  const fetchServiceExpiryReport = async (currentPage = page) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };

      // Club filter
      if (clubFilter) {
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

      const res = await authAxios().get("/report/service/expiry/list", {
        params,
      });
      const responseData = res.data;
      const data = responseData?.data || [];

      console.log(responseData, "responseData");

      setActiveService(data);
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
        fetchServiceExpiryReport(1);
      }
      return;
    }
    setPage(1);
    fetchServiceExpiryReport(1);
  }, [dateFilter, customFrom, customTo, clubFilter]);

  return (
    <div className="page--content">
      {/* Header */}
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">
            {`Home > Reports > Operations Reports > Service Expiry Report`}
          </p>
          <h1 className="text-3xl font-semibold">Service Expiry Report</h1>
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
                {/* <th className="px-2 py-4 min-w-[130px]">Status</th> */}
                <th className="px-2 py-4 min-w-[130px]">Sales Rep</th>
                <th className="px-2 py-4 min-w-[170px]">
                  Personal Trainer Name
                </th>
                <th className="px-2 py-4 min-w-[160px]">Plan Name</th>
                <th className="px-2 py-4 min-w-[120px]">Plan Type</th>
                <th className="px-2 py-4 min-w-[80px]">Amount</th>
                <th className="px-2 py-4 min-w-[100px]">Expiry Date</th>
                <th className="px-2 py-4 min-w-[200px]">
                  Last Check-in Date for PT
                </th>
                <th className="px-2 py-4 min-w-[120px]">Total Sessions</th>
                <th className="px-2 py-4 min-w-[100px]">Utilized</th>
                <th className="px-2 py-4 min-w-[100px]">Balance</th>
                <th className="px-2 py-4 min-w-[150px]">Last Check-in Date</th>
                <th className="px-2 py-4 min-w-[150px]">Renewal Done (Y/N)</th>
                <th className="px-2 py-4 min-w-[100px]">Payment Link</th>
              </tr>
            </thead>

            <tbody>
              {activeService.length ? (
                activeService.map((row, index) => (
                  <tr
                    key={index}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <td className="px-2 py-4">{row.club_name || "-"}</td>
                    <td className="px-2 py-4">{row.membership_number}</td>
                    <td className="px-2 py-4">{row.member_name}</td>

                    {/* <td className="px-2 py-4 flex items-center gap-2">
                      <FaCircle
                        className={`text-xs ${
                          row.booking_status === "COMPLETED"
                            ? "text-green-500"
                            : row.booking_status === "Expiring Soon"
                              ? "text-yellow-500"
                              : "text-red-500"
                        }`}
                      />
                      {row.booking_status}
                    </td> */}

                    <td className="px-2 py-4">
                      {row.sales_rep_name ? row.sales_rep_name : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {row.personal_pt ? row.personal_pt : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {row.plan_name ? row.plan_name : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {row.plan_type ? row.plan_type : "--"}
                    </td>
                    <td className="px-2 py-4">
                      ₹{formatIndianNumber(row.booking_amount)}
                    </td>
                    <td className="px-2 py-4">
                      {row.end_date ? formatAutoDate(row.end_date) : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {row.last_check_in_pt
                        ? formatAutoDate(row.last_check_in_pt)
                        : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {row.no_of_sessions ? row.no_of_sessions : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {row.utilized ? row.utilized : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {row.available_no_of_sessions
                        ? row.available_no_of_sessions
                        : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {row.last_check_in_date
                        ? formatAutoDate(row.last_check_in_date)
                        : "--"}
                    </td>
                    <td className="px-2 py-4 flex items-center justify-center gap-1">
                      <FaCircle
                        className={`text-xs ${
                          row.is_renewal === true
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      />
                      {row.is_renewal === true ? "Y" : "N"}
                    </td>
                    <td className="px-2 py-4">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLeadMember(row.member_id);
                          setInvoiceModal(true);
                          setSelectedLeadClub(row?.club_id)
                        }}
                        className="px-3 py-1 bg-black text-white rounded flex items-center gap-2 !text-[13px]"
                      >
                        Send Link
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={16} className="text-center py-4">
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
          currentDataLength={activeService.length}
          onPageChange={(newPage) => {
            setPage(newPage);
            fetchServiceExpiryReport(newPage);
          }}
        />
      </div>

      {invoiceModal && (
        <CreateNewInvoice
          setInvoiceModal={setInvoiceModal}
          selectedLeadMember={selectedLeadMember}
          clubId={selectedLeadClub}
        />
      )}
    </div>
  );
};

export default ServiceExpiryReport;
