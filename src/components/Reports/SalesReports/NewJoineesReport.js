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
import { FaCircle } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useFormik } from "formik";
import { useSelector } from "react-redux";
import Pagination from "../../common/Pagination";
import MembershipSalesPanel from "../../FilterPanel/MembershipSalesPanel";

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const NewJoineesReport = () => {
  const location = useLocation();
  const [newJoineesList, setNewJoineesList] = useState([]);
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

  // ✅ Single source of truth for applied filters
  const [appliedFilters, setAppliedFilters] = useState({
    bill_type: null,
    plan_type: null,
    service_name: null,
    lead_source: null,
    lead_owner: null,
    pay_mode: null,
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      filterBillType: null,
      filterPlanType: null,
      filterServiceName: null,
      filterLeadSource: null,
      filterLeadOwner: null,
      filterPayMode: null,
    },
    onSubmit: (values) => {
      console.log(values);
    },
  });

  // Function to fetch club list
  const fetchClub = async (search = "") => {
    try {
      const response = await authAxios().get("/club/list", {
        params: search ? { search } : {},
      });
      const data = response.data?.data || [];
      const activeOnly = filterActiveItems(data);
      setClubList(activeOnly);
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

  const fetchNewJoinessReport = async (currentPage = page) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };

      // Date Filter
      if (dateFilter?.value && dateFilter.value !== "custom") {
        params.dateFilter = dateFilter.value;
      }

      if (dateFilter?.value === "custom" && customFrom && customTo) {
        const formatDate = (d) => format(d, "yyyy-MM-dd");
        params.startDate = formatDate(customFrom);
        params.endDate = formatDate(customTo);
      }

      // Club filter
      if (clubFilter?.value) {
        params.club_id = clubFilter.value;
      }

      if (appliedFilters.bill_type) params.bill_type = appliedFilters.bill_type;
      if (appliedFilters.plan_type) params.plan_type = appliedFilters.plan_type;
      if (appliedFilters.service_name)
        params.service_name = appliedFilters.service_name;
      if (appliedFilters.lead_source)
        params.lead_source = appliedFilters.lead_source;
      if (appliedFilters.lead_owner)
        params.lead_owner = appliedFilters.lead_owner;
      if (appliedFilters.pay_mode) params.pay_mode = appliedFilters.pay_mode;

      const res = await authAxios().get("/marketing/report/newjoinee", {
        params,
      });
      const responseData = res.data;
      const data = responseData?.data || [];

      setNewJoineesList(data);
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
      fetchNewJoinessReport(1);
    }
    return;
  }

  fetchNewJoinessReport(1);
}, [dateFilter, customFrom, customTo, clubFilter, appliedFilters]);

  useEffect(() => {
    // Wait for clubList to be loaded
    if (clubList.length === 0) return;

    const params = new URLSearchParams(location.search);

    const clubId = params.get("club_id");
    if (clubId) {
      const club = clubList.find((c) => c.id === Number(clubId));
      if (club) {
        setClubFilter({ label: club.name, value: club.id });
      }
    } else {
      // Set default club only on initial load
      setClubFilter({
        label: clubList[0].name,
        value: clubList[0].id,
      });
    }
  }, [clubList]);

  return (
    <div className="page--content">
      {/* Header */}
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home >  Reports > Sales Reports > Membership Sales Report`}</p>
          <h1 className="text-3xl font-semibold">Membership Sales Report</h1>
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
              value={clubFilter}
              options={clubOptions}
              onChange={(option) => setClubFilter(option)}
              isClearable={userRole === "ADMIN" ? true : false}
              styles={customStyles}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="w-full p-3 border bg-white shodow--box rounded-[10px]">
        <div className="flex items-start gap-3 justify-between w-full mb-3 border-b border-b-[#D4D4D4] pb-3">
          <div>
            {/* ✅ Pass both appliedFilters and setAppliedFilters */}
            <MembershipSalesPanel
              userRole={userRole}
              clubId={clubFilter?.value}
              filterBillType={formik.values.filterBillType}
              filterPlanType={formik.values.filterPlanType}
              filterServiceName={formik.values.filterServiceName}
              filterLeadSource={formik.values.filterLeadSource}
              filterLeadOwner={formik.values.filterLeadOwner}
              filterPayMode={formik.values.filterPayMode}
              formik={formik}
              setFilterValue={(field, value) =>
                formik.setFieldValue(field, value)
              }
              appliedFilters={appliedFilters}
              setAppliedFilters={setAppliedFilters}
            />
          </div>
        </div>

        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left ">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-2 py-4 min-w-[50px]">S.no</th>
                <th className="px-2 py-4 min-w-[150px]">Club Name</th>
                <th className="px-2 py-4 min-w-[100px]">Bill Type</th>
                <th className="px-2 py-4 min-w-[100px]">Member ID</th>
                <th className="px-2 py-4 min-w-[150px]">Member Name</th>
                <th className="px-2 py-4 min-w-[130px]">Service Type</th>
                <th className="px-2 py-4 min-w-[110px]">Plan Type</th>
                <th className="px-2 py-4 min-w-[130px]">Sevice Name</th>
                <th className="px-2 py-4 min-w-[140px]">Invoice ID</th>
                <th className="px-2 py-4 min-w-[130px]">Enquiry Date</th>
                <th className="px-2 py-4 min-w-[130px]">Purchase Date</th>
                <th className="px-2 py-4 min-w-[120px]">Start Date</th>
                <th className="px-2 py-4 min-w-[120px]">End Date</th>
                <th className="px-2 py-4 min-w-[120px]">Lead Source</th>
                <th className="px-2 py-4 min-w-[150px]">Lead Owner</th>

                <th className="px-2 py-4 min-w-[100px]">Amount</th>
                <th className="px-2 py-4 min-w-[100px]">CGST</th>
                <th className="px-2 py-4 min-w-[100px]">SGST</th>
                <th className="px-2 py-4 min-w-[100px]">IGST</th>
                <th className="px-2 py-4 min-w-[110px]">Final Amount</th>
                <th className="px-2 py-4 min-w-[110px]">Paid Amount</th>
                <th className="px-2 py-4 min-w-[100px]">Pay Mode</th>
                <th className="px-2 py-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {newJoineesList.length ? (
                newJoineesList.map((row, index) => (
                  <tr
                    key={index}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <td className="px-2 py-4">{index + 1}</td>
                    <td className="px-2 py-4">{row.club_name || "--"}</td>
                    <td className="px-2 py-4">{row.bill_type || "--"}</td>
                    <td className="px-2 py-4">
                      {row.membership_number || "--"}
                    </td>
                    <td className="px-2 py-4">
                      <Link to={`/member/${row.member_id}`}>
                        <span className="text-[#009EB2] font-medium">
                          {row.member_name || "--"}
                        </span>
                      </Link>
                    </td>
                    <td className="px-2 py-4">
                      {formatText(row.service_type) || "--"}
                    </td>
                    <td className="px-2 py-4">
                      {formatText(row.plan_type) || "--"}
                    </td>
                    <td className="px-2 py-4">{row.service_name || "--"}</td>
                    <td className="px-2 py-4">{row.invoice_id || "--"}</td>
                    <td className="px-2 py-4">
                      {formatAutoDate(row.enquiry_date) || "--"}
                    </td>
                    <td className="px-2 py-4">
                      {formatAutoDate(row.purchase_date) || "--"}
                    </td>
                    <td className="px-2 py-4">
                      {formatAutoDate(row.start_date) || "--"}
                    </td>
                    <td className="px-2 py-4">
                      {formatAutoDate(row.end_date) || "--"}
                    </td>
                    <td className="px-2 py-4">{row.lead_source || "--"}</td>
                    <td className="px-2 py-4">{row.sales_rep_name || "--"}</td>

                    <td className="px-2 py-4">
                      ₹{formatIndianNumber(row.booking_amount) || 0}
                    </td>
                    <td className="px-2 py-4">
                      ₹{formatIndianNumber(row.cgst) || 0}
                    </td>
                    <td className="px-2 py-4">
                      ₹{formatIndianNumber(row.sgst) || 0}
                    </td>
                    <td className="px-2 py-4">
                      ₹{formatIndianNumber(row.igst) || 0}
                    </td>
                    <td className="px-2 py-4">
                      ₹{formatIndianNumber(row.final_amount) || 0}
                    </td>
                    <td className="px-2 py-4">
                      ₹{formatIndianNumber(row.paid_amount) || 0}
                    </td>
                    <td className="px-2 py-4">{row.pay_mode || "--"}</td>
                    <td className="px-2 py-4">
                      <span
                        className={`flex items-center justify-between gap-1 rounded-full min-h-[30px] px-3 text-sm w-fit ${
                          row?.status !== "ACTIVE"
                            ? "bg-[#EEEEEE]"
                            : "bg-[#E8FFE6] text-[#138808]"
                        }`}
                      >
                        <FaCircle className="text-[10px]" /> {row?.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          currentDataLength={newJoineesList.length}
          onPageChange={(newPage) => {
            fetchNewJoinessReport(newPage);
          }}
        />
      </div>
    </div>
  );
};

export default NewJoineesReport;
