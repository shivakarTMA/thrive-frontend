import React, { useEffect, useState } from "react";
import { FaCircle } from "react-icons/fa";
import Select from "react-select";
import {
  customStyles,
  filterActiveItems,
  formatAutoDate,
  formatText,
} from "../../../Helper/helper";

import { useParams, useSearchParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, format, subYears } from "date-fns";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authAxios } from "../../../config/config";
import Pagination from "../../../components/common/Pagination";
import { FaCalendarDays } from "react-icons/fa6";
import AllEnquiresFilterPanel from "../../../components/FilterPanel/AllEnquiresFilterPanel";
import { useSelector } from "react-redux";
import { useFormik } from "formik";

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const AllEnquiriesReport = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const userRole = user.role;

  const [searchParams] = useSearchParams();
  const [dateFilter, setDateFilter] = useState(dateFilterOptions[1]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);

  const [allLeads, setAllLeads] = useState([]);
  const [filtersInitialized, setFiltersInitialized] = useState(false);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // ✅ Single source of truth for applied filters
  const [appliedFilters, setAppliedFilters] = useState({
    gender: null,
    enquiry_type: null,
    lead_source: null,
    lead_status: null,
    call_tag: null,
    owner_id: null,
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      filterGender: null,
      filterEnquiryType: null,
      filterLeadSource: null,
      filterLeadStatus: null,
      filterCallTag: null,
      filterLeadOwner: null,
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
    if (filters.lead_status) {
      params.set("lead_status", filters.lead_status);
    }

    navigate(`?${params.toString()}`, { replace: true });
  };

  const fetchEnquiriesList = async (currentPage = page) => {
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

      if (appliedFilters.gender) params.gender = appliedFilters.gender;
      if (appliedFilters.enquiry_type)
        params.enquiry_type = appliedFilters.enquiry_type;
      if (appliedFilters.lead_source)
        params.lead_source = appliedFilters.lead_source;
      if (appliedFilters.lead_status)
        params.lead_status = appliedFilters.lead_status;
      if (appliedFilters.call_tag) params.call_tag = appliedFilters.call_tag;
      if (appliedFilters.owner_id)
        params.owner_id = appliedFilters.owner_id;

      const res = await authAxios().get("/marketing/report/enquiry", {
        params,
      });

      const responseData = res.data;
      const data = responseData?.data || [];

      setAllLeads(data);
      setPage(responseData?.currentPage || 1);
      setTotalPages(responseData?.totalPage || 1);
      setTotalCount(responseData?.totalCount || data.length);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch leads");
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
        (opt) => opt.value === dateFilterValue
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
      lead_status: params.get("lead_status") || null,
    };

    setAppliedFilters(urlFilters);

    // Sync with formik
    formik.setValues({
      filterGender: urlFilters.gender,
      filterEnquiryType: urlFilters.enquiry_type,
      filterLeadSource: urlFilters.lead_source,
      filterLeadStatus: urlFilters.lead_status,
      filterCallTag: urlFilters.call_tag,
      filterLeadOwner: urlFilters.owner_id,
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
    fetchEnquiriesList(1);
    updateURLParams(appliedFilters);
  }, [
    filtersInitialized,
    dateFilter?.value,
    customFrom,
    customTo,
    clubFilter?.value,
    appliedFilters.gender,
    appliedFilters.enquiry_type,
    appliedFilters.lead_source,
    appliedFilters.lead_status,
    appliedFilters.call_tag,
    appliedFilters.owner_id,
  ]);

  return (
    <>
      <div className="content--area">
        <div className="page--content">
          <div className="flex items-end justify-between gap-2 mb-5">
            <div className="title--breadcrumbs">
              <p className="text-sm">{`Home > Sales Reports > All Enquiries Report`}</p>
              <h1 className="text-3xl font-semibold">All Enquiries Report</h1>
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

          <div className="w-full p-3 border bg-white shodow--box rounded-[10px]">
            <div className="flex items-start gap-3 justify-between w-full mb-3 border-b border-b-[#D4D4D4] pb-3">
              <div>
                <AllEnquiresFilterPanel
                  userRole={userRole}
                  clubId={clubFilter?.value}
                  filterGender={formik.values.filterGender}
                  filterEnquiryType={formik.values.filterEnquiryType}
                  filterLeadSource={formik.values.filterLeadSource}
                  filterLeadStatus={formik.values.filterLeadStatus}
                  filterCallTag={formik.values.filterCallTag}
                  filterLeadOwner={formik.values.filterLeadOwner}
                  formik={formik}
                  setFilterValue={(field, value) =>
                    formik.setFieldValue(field, value)
                  }
                  appliedFilters={appliedFilters}
                  setAppliedFilters={setAppliedFilters}
                />
              </div>
            </div>

            <div className="table--data--bottom w-full">
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-2 py-4 min-w-[150px]">Club Name</th>
                      <th className="px-2 py-4 min-w-[100px]">Enquiry Date</th>
                      <th className="px-2 py-4 min-w-[140px]">Name</th>
                      <th className="px-2 py-4 min-w-[120px]">Location</th>
                      <th className="px-2 py-4 min-w-[100px]">Gender</th>
                      <th className="px-2 py-4 min-w-[150px]">
                        Interested In{" "}
                      </th>
                      <th className="px-2 py-4 min-w-[120px]">Enquiry Type</th>

                      <th className="px-2 py-4 min-w-[120px]">Lead Source</th>
                      <th className="px-2 py-4 min-w-[120px]">Lead Status </th>
                      <th className="px-2 py-4 min-w-[100px]">Call Tag</th>
                      <th className="px-2 py-4 min-w-[150px]">
                        Last Communication
                      </th>
                      <th className="px-2 py-4 min-w-[150px]">
                        Last Call Status
                      </th>
                      <th className="px-2 py-4 min-w-[150px]">
                        Next Follow-Up
                      </th>
                      <th className="px-2 py-4 min-w-[150px]">Lead Owner </th>
                    </tr>
                  </thead>

                  <tbody>
                    {allLeads.length ? (
                      allLeads.map((row, index) => (
                        <tr
                          key={index}
                          className="bg-white border-b hover:bg-gray-50 transition"
                        >
                          <td className="px-2 py-4">{row.club_name || "-"}</td>
                          <td className="px-2 py-4">
                            {formatAutoDate(row.enquiry_date)}
                          </td>
                          <td className="px-2 py-4">
                            {row.name ? row.name : "--"}
                          </td>
                          <td className="px-2 py-4">
                            {row.location ? row.location : "--"}
                          </td>
                          <td className="px-2 py-4">
                            {formatText(row.gender)}
                          </td>
                          <td className="px-2 py-4">
                            {row.interested_in ? row.interested_in : "--"}
                          </td>
                          <td className="px-2 py-4">
                            {row.enquiry_type ? row.enquiry_type : "--"}
                          </td>

                          <td className="px-2 py-4">
                            {row.lead_source ? row.lead_source : "--"}
                          </td>
                          <td className="px-2 py-4">
                            {row.lead_status ? row.lead_status : "--"}
                          </td>
                          <td className="px-2 py-4">
                            {row.call_tag ? formatText(row.call_tag) : "--"}
                          </td>
                          <td className="px-2 py-4">
                            {row.last_communication_date
                              ? formatAutoDate(row.last_communication_date)
                              : "--"}
                          </td>
                          <td className="px-2 py-4">
                            {row.last_call_status ? row.last_call_status : "--"}
                          </td>
                          <td className="px-2 py-4">
                            {row.next_follow_up
                              ? formatAutoDate(row.next_follow_up)
                              : "--"}
                          </td>
                          <td className="px-2 py-4">
                            {row.lead_owner ? row.lead_owner : "--"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={13} className="text-center px-2 py-4">
                          No data found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <Pagination
                page={page}
                totalPages={totalPages}
                rowsPerPage={rowsPerPage}
                totalCount={totalCount}
                currentDataLength={allLeads.length}
                onPageChange={(newPage) => {
                  fetchEnquiriesList(newPage);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AllEnquiriesReport;
