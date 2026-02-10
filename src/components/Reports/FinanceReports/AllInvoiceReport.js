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

const formatDate = (date) => format(date, "yyyy-MM-dd");

const AllInvoiceReport = () => {
  const [activeMember, setActiveMember] = useState([]);
  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);

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

  const fetchAllInvoiceReport = async (currentPage = page) => {
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

      const res = await authAxios().get("/report/all/invoice/list", { params });
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
        fetchAllInvoiceReport(1);
      }
      return;
    }
    setPage(1);
    fetchAllInvoiceReport(1);
  }, [dateFilter, customFrom, customTo, clubFilter]);

  return (
    <div className="page--content">
      {/* Header */}
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">
            {`Home > Reports > Finance Reports > All Invoice Report`}
          </p>
          <h1 className="text-3xl font-semibold">All Invoice Report</h1>
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
                <th className="px-2 py-4 min-w-[120px]">purchase date</th>
                <th className="px-2 py-4 min-w-[150px]">branch location</th>
                <th className="px-2 py-4 min-w-[120px]">member id</th>
                <th className="px-2 py-4 min-w-[150px]">member name</th>
                <th className="px-2 py-4 min-w-[150px]">contact number</th>
                <th className="px-2 py-4 min-w-[150px]">e-mail</th>
                <th className="px-2 py-4 min-w-[100px]">gst no</th>
             
                <th className="px-2 py-4 min-w-[120px]">gender</th>
                <th className="px-2 py-4 min-w-[120px]">birthday</th>
                <th className="px-2 py-4 min-w-[120px]">company</th>
                <th className="px-2 py-4 min-w-[130px]">bill no</th>
             
                <th className="px-2 py-4 min-w-[120px]">paid invoice</th>
                <th className="px-2 py-4 min-w-[170px]">
                  cancelled paid invoice
                </th>
                <th className="px-2 py-4 min-w-[200px]">description service</th>
                <th className="px-2 py-4 min-w-[120px]">start date</th>
                <th className="px-2 py-4 min-w-[120px]">end date</th>
                <th className="px-2 py-4 min-w-[120px]">pt name</th>
                <th className="px-2 py-4 min-w-[120px]">sales rep name</th>
                <th className="px-2 py-4 min-w-[120px]">general trainer</th>
                <th className="px-2 py-4 min-w-[100px]">created by</th>
                <th className="px-2 py-4 min-w-[80px]">amount</th>
                <th className="px-2 py-4 min-w-[80px]">cgst</th>
                <th className="px-2 py-4 min-w-[80px]">sgst</th>
                <th className="px-2 py-4 min-w-[50px]">igst</th>
                <th className="px-2 py-4 min-w-[110px]">final amount</th>
                <th className="px-2 py-4 min-w-[100px]">paid</th>
                <th className="px-2 py-4 min-w-[100px]">tds amount</th>
                <th className="px-2 py-4 min-w-[100px]">pending</th>
                <th className="px-2 py-4 min-w-[100px]">pay mode</th>
                <th className="px-2 py-4 min-w-[100px]">lead source</th>
                <th className="px-2 py-4 min-w-[100px]">status</th>
        
              </tr>
            </thead>

            <tbody>
              {activeMember.length ? (
                activeMember.map((row, index) => (
                  <tr
                    key={index}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <td className="px-2 py-4">{row.club_name || "-"}</td>
                    <td className="px-2 py-4">
                      {formatAutoDate(row.invoice_date)}
                    </td>
                    <td className="px-2 py-4">{row.club_address}</td>
                    <td className="px-2 py-4">{row.membership_number}</td>
                    <td className="px-2 py-4">{row.full_name}</td>
                    <td className="px-2 py-4">+{row?.country_code}{" "}{row?.mobile}</td>
                    <td className="px-2 py-4">
                      {row.email ? row.email : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {row.club_gstno ? row.club_gstno : "--"}
                    </td>
         
                    <td className="px-2 py-4">
                      {formatText(
                        row?.gender === "NOTDISCLOSE"
                          ? "Prefer Not To Say"
                          : row?.gender,
                      )}
                    </td>
                    <td className="px-2 py-4">
                      {row.date_of_birth
                        ? formatAutoDate(row.date_of_birth)
                        : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {row.company_name ? row.company_name : "--"}
                    </td>
                    <td className="px-2 py-4">{row.invoice_no ? row.invoice_no : "--"}</td>
           
                    <td className="px-2 py-4">{row.paidInvoice ? row.paidInvoice : "--"}</td>
                    <td className="px-2 py-4">{row.cancelledPaidInvoice ? row.cancelledPaidInvoice : "--"}</td>

                    <td className="px-2 py-4">{row.service_name ? row.service_name : "--"}</td>
                    <td className="px-2 py-4">
                      {formatAutoDate(row.start_date)}
                    </td>
                    <td className="px-2 py-4">
                      {formatAutoDate(row.end_date)}
                    </td>
                    <td className="px-2 py-4">
                      {row.pt_name ? row.pt_name : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {row.sales_rep_name ? row.sales_rep_name : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {row.gt_name ? row.gt_name : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {row.createdBy ? row.createdBy : "--"}
                    </td>
                    <td className="px-2 py-4">₹{formatIndianNumber(row.total_amount)}</td>
                    <td className="px-2 py-4">₹{formatIndianNumber(row.cgst_amount)}</td>
                    <td className="px-2 py-4">₹{formatIndianNumber(row.sgst_amount)}</td>
                    <td className="px-2 py-4">₹{formatIndianNumber(row.igst_amount)}</td>
                    <td className="px-2 py-4">₹{formatIndianNumber(row.booking_amount)}</td>
                    <td className="px-2 py-4">₹{formatIndianNumber(row.booking_amount)}</td>
                    <td className="px-2 py-4">₹{formatIndianNumber(row.tdsAmount)}</td>
                    <td className="px-2 py-4">₹{formatIndianNumber(row.pending)}</td>
                    <td className="px-2 py-4">
                      {formatText(row.payment_method)}
                    </td>
                    <td className="px-2 py-4">{row.lead_source}</td>
                    <td className="px-2 py-4">
                      {row.is_subscribed === true ? "Active" : "Inactive"}
                    </td>

  
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={18} className="text-center py-4">
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
            fetchAllInvoiceReport(newPage);
          }}
        />
      </div>
    </div>
  );
};

export default AllInvoiceReport;
