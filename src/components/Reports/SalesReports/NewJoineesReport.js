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
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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

  const [filtersInitialized, setFiltersInitialized] = useState(false);

  // ✅ Single source of truth for applied filters
  const [appliedFilters, setAppliedFilters] = useState({
    trial_type: null,
    subscription_type: null,
    plan_type: null,
    service_name: null,
    lead_source: null,
    owner_id: null,
    payment_method: null,
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      filterTrialType: null,
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

  const selectedClub =
    clubOptions.find((opt) => opt.value === clubFilter?.value) || null;

  // ---------------------------
  // UPDATE URL WITH PARAMS
  // ---------------------------
  const updateURLParams = (filters) => {
    const params = new URLSearchParams();

    // Date filter
    if (dateFilter?.value && dateFilter.value !== "custom") {
      params.set("dateFilter", dateFilter.value);
    }

    if (dateFilter?.value === "custom" && customFrom && customTo) {
      params.set("startDate", format(customFrom, "yyyy-MM-dd"));
      params.set("endDate", format(customTo, "yyyy-MM-dd"));
    }

    // Club filter
    if (clubFilter?.value) {
      params.set("club_id", clubFilter.value);
    }

    // Applied filters
    if (filters.subscription_type) {
      params.set("subscription_type", filters.subscription_type);
    }
    if (filters.plan_type) {
      params.set("plan_type", filters.plan_type);
    }
    if (filters.service_name) {
      params.set("service_name", filters.service_name);
    }
    if (filters.lead_source) {
      params.set("lead_source", filters.lead_source);
    }
    if (filters.owner_id) {
      params.set("owner_id", filters.owner_id);
    }
    if (filters.payment_method) {
      params.set("payment_method", filters.payment_method);
    }

    navigate(`?${params.toString()}`, { replace: true });
  };

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

      if (appliedFilters.subscription_type)
        params.subscription_type = appliedFilters.subscription_type;
      if (appliedFilters.plan_type) params.plan_type = appliedFilters.plan_type;
      if (appliedFilters.service_name)
        params.service_name = appliedFilters.service_name;
      if (appliedFilters.lead_source)
        params.lead_source = appliedFilters.lead_source;
      if (appliedFilters.owner_id) params.owner_id = appliedFilters.owner_id;
      if (appliedFilters.payment_method)
        params.payment_method = appliedFilters.payment_method;
      if (appliedFilters.trial_type)
        params.trial_type = appliedFilters.trial_type;

      const res = await authAxios().get("/marketing/report/newjoinee", {
        params,
      });
      const responseData = res.data;
      const data = responseData?.data || [];

      console.log("SHIVAKAR", responseData);

      setNewJoineesList(data);
      setPage(responseData?.currentPage || 1);
      setTotalPages(responseData?.totalPages || 1);
      setTotalCount(responseData?.totalCount || data.length);
    } catch (err) {
      console.error(err);
      toast.error("data not found");
    }
  };

  // ---------------------------
  // INITIALIZE FROM URL
  // ---------------------------

  useEffect(() => {
    // Wait for clubList to be loaded
    if (clubList.length === 0) return;

    // Only run initialization once
    if (filtersInitialized) return;

    const params = new URLSearchParams(location.search);

    // Date filter
    const dateFilterValue = params.get("dateFilter");
    if (dateFilterValue) {
      const matchedDate = dateFilterOptions.find(
        (opt) => opt.value === dateFilterValue,
      );
      if (matchedDate) {
        setDateFilter(matchedDate);
      }
    }

    // Custom date filter
    const startDate = params.get("startDate");
    const endDate = params.get("endDate");
    if (startDate && endDate) {
      setDateFilter(dateFilterOptions.find((d) => d.value === "custom"));
      setCustomFrom(new Date(startDate));
      setCustomTo(new Date(endDate));
    }

    // Club filter - only set from URL if present, otherwise default to first club
    const clubId = params.get("club_id");
    // if (clubId) {
    //   const club = clubList.find((c) => c.id === Number(clubId));
    //   if (club) {
    //     setClubFilter({ label: club.name, value: club.id });
    //   }
    // } else {
    //   // Set default club only on initial load
    //   setClubFilter({
    //     label: clubList[0].name,
    //     value: clubList[0].id,
    //   });
    // }
    if (!clubFilter) {
      if (clubId) {
        const club = clubList.find((c) => c.id === Number(clubId));
        if (club) {
          setClubFilter({ label: club.name, value: club.id });
        }
      } else {
        setClubFilter({
          label: clubList[0].name,
          value: clubList[0].id,
        });
      }
    }

    // Applied filters from URL
    const urlFilters = {
      trial_type: params.get("trial_type") || null,
      // plan_type: params.get("plan_type") || null,
      // service_name: params.get("service_name") || null,
    };

    setAppliedFilters(urlFilters);

    // Sync with formik
    formik.setValues({
      filterTrialType: urlFilters.trial_type,
      filterBillType: urlFilters.subscription_type,
      filterPlanType: urlFilters.plan_type,
      filterServiceName: urlFilters.service_name,
      filterLeadSource: urlFilters.lead_source,
      filterLeadOwner: urlFilters.owner_id,
      filterPayMode: urlFilters.payment_method,
    });

    setFiltersInitialized(true);
  }, [clubList]);

  // ---------------------------
  // FETCH WHEN FILTERS CHANGE
  // ---------------------------
  useEffect(() => {
    if (!filtersInitialized) return;

    // 🚫 Prevent API call until both dates are selected
    if (dateFilter?.value === "custom" && (!customFrom || !customTo)) {
      return;
    }

    setPage(1);
    fetchNewJoinessReport(1);
    updateURLParams(appliedFilters);
  }, [
    filtersInitialized,
    dateFilter?.value,
    customFrom,
    customTo,
    clubFilter?.value,
    appliedFilters.trial_type,
    appliedFilters.subscription_type,
    appliedFilters.plan_type,
    appliedFilters.service_name,
    appliedFilters.lead_source,
    appliedFilters.owner_id,
    appliedFilters.payment_method,
  ]);

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
              value={selectedClub}
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
              filterTrialType={formik.values.filterTrialType}
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
                {/* <th className="px-2 py-4 min-w-[50px]">S.no</th> */}
                <th className="px-2 py-4 min-w-[150px]">Club Name</th>
                <th className="px-2 py-4 min-w-[100px]">Bill Type</th>
                <th className="px-2 py-4 min-w-[100px]">Trial Type</th>
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
                <th className="px-2 py-4 min-w-[100px]">Discount</th>
                <th className="px-2 py-4 min-w-[110px]">Final Amount</th>
                <th className="px-2 py-4 min-w-[100px]">CGST</th>
                <th className="px-2 py-4 min-w-[100px]">SGST</th>
                <th className="px-2 py-4 min-w-[100px]">IGST</th>

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
                    {/* <td className="px-2 py-4">{index + 1}</td> */}
                    <td className="px-2 py-4">{row.club_name || "--"}</td>
                    <td className="px-2 py-4">
                      {formatText(row.subscription_type) || "--"}
                    </td>
                    <td className="px-2 py-4">
                      {row?.trial_type === "NONTRIAL"
                        ? "No Trial"
                        : formatText(row?.trial_type)}
                    </td>
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
                      {row.plan_type === "NONDLF"
                        ? "NON-DLF"
                        : row.plan_type || "--"}
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
                      ₹{formatIndianNumber(row.amount) || 0}
                    </td>
                    <td className="px-2 py-4">
                      ₹{formatIndianNumber(row.discount) || 0}
                    </td>
                    <td className="px-2 py-4">
                      ₹{formatIndianNumber(row.total_amount) || 0}
                    </td>
                    <td className="px-2 py-4">
                      ₹{formatIndianNumber(row.cgst_amount) || 0}
                    </td>
                    <td className="px-2 py-4">
                      ₹{formatIndianNumber(row.sgst_amount) || 0}
                    </td>
                    <td className="px-2 py-4">
                      ₹{formatIndianNumber(row.igst_amount) || 0}
                    </td>

                    <td className="px-2 py-4">
                      ₹{formatIndianNumber(row.booking_amount) || 0}
                    </td>
                    <td className="px-2 py-4">
                      {formatText(row.payment_method) || "--"}
                    </td>
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
