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

const CollectionReport = () => {
  const [activeService, setActiveService] = useState([]);
  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [selectedLeadMember, setSelectedLeadMember] = useState(null);

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

  const fetchCollectionReport = async (currentPage = page) => {
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

      const res = await authAxios().get("/report/collection/list", {
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
        fetchCollectionReport(1);
      }
      return;
    }
    setPage(1);
    fetchCollectionReport(1);
  }, [dateFilter, customFrom, customTo, clubFilter]);

  return (
    <div className="page--content">
      {/* Header */}
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">
            {`Home > Reports > Finance Reports > Collection Report`}
          </p>
          <h1 className="text-3xl font-semibold">Collection Report</h1>
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
        </div>
      </div>

      {/* Table */}
      <div className="w-full p-3 border bg-white shodow--box rounded-[10px]">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-2 py-4 min-w-[150px]">Club Name</th>
                <th className="px-2 py-4 min-w-[100px]">bill type</th>
                <th className="px-2 py-4 min-w-[150px]">paid invoice no</th>
                <th className="px-2 py-4 min-w-[120px]">purchase date</th>
                <th className="px-2 py-4 min-w-[120px]">Start date</th>
                <th className="px-2 py-4 min-w-[140px]">branch location</th>
                <th className="px-2 py-4 min-w-[130px]">member id</th>
                <th className="px-2 py-4 min-w-[150px]">member name</th>
                <th className="px-2 py-4 min-w-[150px]">mobile</th>
                <th className="px-2 py-4 min-w-[120px]">mail</th>
                <th className="px-2 py-4 min-w-[80px]">amount</th>
                <th className="px-2 py-4 min-w-[100px]">tax amount</th>
                <th className="px-2 py-4 min-w-[110px]">final amount</th>
                <th className="px-2 py-4 min-w-[100px]">paid amount</th>
                <th className="px-2 py-4 min-w-[150px]">service name</th>
                <th className="px-2 py-4 min-w-[130px]">sales rep name</th>
                <th className="px-2 py-4 min-w-[120px]">pt staff</th>
                <th className="px-2 py-4 min-w-[120px]">paymode details</th>
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
                    <td className="px-2 py-4">{row.bill_type ? formatText(row.bill_type) : "--"}</td>
                    <td className="px-2 py-4">{row.invoice_no ? row.invoice_no : "--"}</td>
                    <td className="px-2 py-4">{row.purchase_date ? formatAutoDate(row.purchase_date) : "--"}</td>
                    <td className="px-2 py-4">{row.service_start_date ? formatAutoDate(row.service_start_date) : "--"}</td>
                    <td className="px-2 py-4">{row.club_city ? row.club_city : "--"}</td>
                    <td className="px-2 py-4">{row.membership_number ? row.membership_number : "--"}</td>
                    <td className="px-2 py-4">{row.member_name ? row.member_name : "--"}</td>
                    <td className="px-2 py-4">+{row.country_code}{" "}{row.mobile}</td>
                    <td className="px-2 py-4">{row.email ? row.email : "--"}</td>
                    <td className="px-2 py-4">₹{formatIndianNumber(row.amount)}</td>
                    <td className="px-2 py-4">₹{formatIndianNumber(row.tax_amount)}</td>
                    <td className="px-2 py-4">₹{formatIndianNumber(row.final_amount)}</td>
                    <td className="px-2 py-4">₹{formatIndianNumber(row.paid_amount)}</td>
                    <td className="px-2 py-4">{row.service_name ? row.service_name : "--"}</td>
                    <td className="px-2 py-4">{row.lead_owner ? row.lead_owner : "--"}</td>
                    <td className="px-2 py-4">{row.trainer_name ? row.trainer_name : "--"}</td>
                    <td className="px-2 py-4">{row.payment_method ? formatText(row.payment_method) : "--"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={24} className="text-center py-4">
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
            fetchCollectionReport(newPage);
          }}
        />
      </div>

      {invoiceModal && (
        <CreateNewInvoice
          setInvoiceModal={setInvoiceModal}
          selectedLeadMember={selectedLeadMember}
        />
      )}
    </div>
  );
};

export default CollectionReport;
