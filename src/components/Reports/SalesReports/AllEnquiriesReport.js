import React, { useEffect, useState } from "react";
import { FaCircle } from "react-icons/fa";
import Select from "react-select";
import {
  customStyles,
  formatAutoDate,
  formatText,
} from "../../../Helper/helper";

import { useParams, useSearchParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, subYears } from "date-fns";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authAxios } from "../../../config/config";
import Pagination from "../../../components/common/Pagination";
import { FaCalendarDays } from "react-icons/fa6";
import AllEnquiresFilterPanel from "../../../components/FilterPanel/AllEnquiresFilterPanel";

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const AllEnquiriesReport = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const [selectedClub, setSelectedClub] = useState(null);
  const [selectedLeadSource, setSelectedLeadSource] = useState(null);
  const [selectedLeadStatus, setSelectedLeadStatus] = useState(null);
  const [selectedLastCallType, setSelectedLastCallType] = useState(null);
  const [selectedCallTag, setSelectedCallTag] = useState(null);
  const [selectedServiceName, setSelectedServiceName] = useState(null);
  const [selectedGender, setSelectedGender] = useState(null);

  const [searchParams] = useSearchParams();
  const [dateFilter, setDateFilter] = useState(dateFilterOptions[1]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  const [allLeads, setAllLeads] = useState([]);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const dateParam = searchParams.get("date");
    const customFromParam = searchParams.get("customFrom");
    const customToParam = searchParams.get("customTo");

    if (dateParam) {
      // Find the matching option from your dropdown
      const foundOption =
        dateFilterOptions.find((opt) => opt.value === dateParam) ||
        dateFilterOptions[1];
      setDateFilter(foundOption);

      if (dateParam === "custom" && customFromParam && customToParam) {
        // Decode and convert to JS Date
        const fromDate = new Date(decodeURIComponent(customFromParam));
        const toDate = new Date(decodeURIComponent(customToParam));

        setCustomFrom(fromDate);
        setCustomTo(toDate);
      }
    }
  }, []);

  const urlLastCallType = searchParams.get("last_call_status");
  const last_call_status = urlLastCallType
    ? decodeURIComponent(urlLastCallType)
    : null;

  const fetchEnquiriesList = async (
    currentPage = page,
    overrideSelected = {}
  ) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };

      if (id) {
        params.id = id;
        setDateFilter("");
      } else {
        const urlLeadStatus = searchParams.get("lead_status");
        const urlDate = searchParams.get("date");
        const urlCustomFrom = searchParams.get("customFrom");
        const urlCustomTo = searchParams.get("customTo");

        // ✅ Use overrideSelected first, then selected state, then URL, otherwise null
        const selLeadSource = overrideSelected.hasOwnProperty("lead_source")
          ? overrideSelected.lead_source
          : selectedLeadSource;
        const selLeadStatus = overrideSelected.hasOwnProperty("lead_status")
          ? overrideSelected.lead_status
          : selectedLeadStatus
          ? selectedLeadStatus
          : urlLeadStatus
          ? { label: urlLeadStatus, value: urlLeadStatus }
          : null;

        const selLastCallType = overrideSelected.hasOwnProperty(
          "last_call_status"
        )
          ? overrideSelected.last_call_status
          : selectedLastCallType
          ? selectedLastCallType
          : last_call_status
          ? { label: last_call_status, value: last_call_status }
          : null;

        const selCallTag = overrideSelected.hasOwnProperty("created_by")
          ? overrideSelected.created_by
          : selectedCallTag;
        const selServiceName = overrideSelected.hasOwnProperty("interested_in")
          ? overrideSelected.interested_in
          : selectedServiceName;
        const selGender = overrideSelected.hasOwnProperty("gender")
          ? overrideSelected.gender
          : selectedGender;
        const selClub = overrideSelected.hasOwnProperty("club_id")
          ? overrideSelected.club_id
          : selectedClub;

        let selDateFilter =
          overrideSelected.dateFilter?.value || dateFilter?.value || urlDate;

        let selCustomFrom =
          overrideSelected.customFrom ||
          customFrom ||
          (urlCustomFrom ? new Date(decodeURIComponent(urlCustomFrom)) : null);
        let selCustomTo =
          overrideSelected.customTo ||
          customTo ||
          (urlCustomTo ? new Date(decodeURIComponent(urlCustomTo)) : null);

        // 🚫 Only use URL custom range if no manual override
        if (
          !overrideSelected.dateFilter &&
          !customFrom &&
          !customTo &&
          urlDate === "custom" &&
          urlCustomFrom &&
          urlCustomTo
        ) {
          selDateFilter = "custom";
          selCustomFrom = new Date(decodeURIComponent(urlCustomFrom));
          selCustomTo = new Date(decodeURIComponent(urlCustomTo));
        }

        // ✅ Build query params (only if value exists)

        if (selLeadSource?.value) params.lead_source = selLeadSource.value;
        if (selLeadStatus?.value) params.lead_status = selLeadStatus.value;
        if (selLastCallType?.value)
          params.last_call_status = selLastCallType.value;
        if (selCallTag?.value) params.created_by = selCallTag.value;
        if (selServiceName?.value) params.interested_in = selServiceName.value;
        if (selGender?.value) params.gender = selGender.value;
        if (selClub?.value) params.club_id = selClub.value;

        // ✅ Date filter
        if (selDateFilter && selDateFilter !== "custom") {
          params.dateFilter = selDateFilter;
        } else if (selDateFilter === "custom" && selCustomFrom && selCustomTo) {
          const formatDate = (date) => {
            const d = new Date(date);
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return `${d.getFullYear()}-${month}-${day}`;
          };

          params.startDate = formatDate(selCustomFrom);
          params.endDate = formatDate(selCustomTo);
        }
      }

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

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlDateFilter = searchParams.get("date");

    const foundDateOption = dateFilterOptions.find(
      (option) => option.value === urlDateFilter
    );

    if (id) {
      // If id exists, fetch by id, but also include URL date filter if any
      fetchEnquiriesList(1, { id, dateFilter: foundDateOption });
    } else if (foundDateOption) {
      // If no id, but date filter exists in URL
      setDateFilter(foundDateOption);
      fetchEnquiriesList(1, { dateFilter: foundDateOption });
    } else {
      // Default fetch without id or URL date filter
      fetchEnquiriesList();
    }
  }, [id, location.search]);

  const handleDateFilterChange = (selected) => {
    setDateFilter(selected);

    // If custom date filter is selected, handle the logic for custom dates
    if (selected?.value !== "custom") {
      setCustomFrom(null);
      setCustomTo(null);
      // Navigate to /reports/sales-reports/all-enquiries-report, setting the new date filter in the URL
      navigate(
        `/reports/sales-reports/all-enquiries-report?date=${selected.value}`,
        { replace: true }
      );

      // Re-fetch the lead list based on the selected filter
      fetchEnquiriesList(1, { dateFilter: selected });
    } else {
      // Handle custom date filter logic here (e.g., open a date picker)
      // You may need to update the URL with a custom date range
    }
  };

  // Trigger only for custom range once both dates selected
  useEffect(() => {
    if (dateFilter?.value === "custom" && customFrom && customTo) {
      fetchEnquiriesList(1, { dateFilter, customFrom, customTo });
    }
  }, [dateFilter, customFrom, customTo]);

  const handleLeadUpdate = () => {
    fetchEnquiriesList();
  };

  const handleRemoveFilter = (filterKey) => {
    const setterMap = {
      club_id: setSelectedClub,
      lead_source: setSelectedLeadSource,
      last_call_status: setSelectedLastCallType,
      lead_status: setSelectedLeadStatus,
      created_by: setSelectedCallTag,
      interested_in: setSelectedServiceName,
      gender: setSelectedGender,
    };

    // Clear state
    setterMap[filterKey]?.(null);

    // Pass explicit null in overrideSelected so fetchEnquiriesList knows to skip it
    const overrideSelected = { [filterKey]: null };
    fetchEnquiriesList(1, overrideSelected);
  };

  const handleApplyFiltersFromChild = () => {
    fetchEnquiriesList(1);
  };

  return (
    <>
      <div className="content--area">
        <div className="page--content">
          <div className="flex items-end justify-between gap-2 mb-5">
            <div className="title--breadcrumbs">
              <p className="text-sm">{`Home > Sales Reports > All Enquiries Report`}</p>
              <h1 className="text-3xl font-semibold" onClick={handleLeadUpdate}>
                All Enquiries Report
              </h1>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-4 items-center justify-between">
            <div className="flex gap-2 w-full">
              <div className="max-w-[180px] w-full">
                <Select
                  placeholder="Select Date"
                  options={dateFilterOptions}
                  value={dateFilter}
                  onChange={handleDateFilterChange}
                  // isClearable
                  styles={customStyles}
                  className="w-full"
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
            </div>
          </div>

          <div className="w-full p-3 border bg-white shodow--box rounded-[10px]">
            <div className="flex items-start gap-3 justify-between w-full mb-3 border-b border-b-[#D4D4D4] pb-3">
              <div>
                <AllEnquiresFilterPanel
                  selectedClub={selectedClub}
                  setSelectedClub={setSelectedClub}
                  selectedLeadSource={selectedLeadSource}
                  setSelectedLeadSource={setSelectedLeadSource}
                  selectedLastCallType={selectedLastCallType}
                  selectedLeadStatus={selectedLeadStatus}
                  setSelectedLeadStatus={setSelectedLeadStatus}
                  selectedCallTag={selectedCallTag}
                  setSelectedCallTag={setSelectedCallTag}
                  setSelectedLastCallType={setSelectedLastCallType}
                  selectedGender={selectedGender}
                  setSelectedGender={setSelectedGender}
                  selectedServiceName={selectedServiceName}
                  setSelectedServiceName={setSelectedServiceName}
                  onApplyFilters={handleApplyFiltersFromChild} // child "Apply" -> parent fetch
                  onRemoveFilter={handleRemoveFilter}
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
                      <th className="px-2 py-4 min-w-[150px]">Lead Owner </th>
                      <th className="px-2 py-4 min-w-[120px]">Lead Source</th>
                      <th className="px-2 py-4 min-w-[120px]">Enquiry Type</th>
                      <th className="px-2 py-4 min-w-[120px]">Lead Status </th>
                      <th className="px-2 py-4 min-w-[100px]">Status</th>
                      <th className="px-2 py-4 min-w-[150px]">
                        Last Communication
                      </th>
                      <th className="px-2 py-4 min-w-[150px]">
                        Last Call Status
                      </th>
                      <th className="px-2 py-4 min-w-[150px]">
                        Next Follow-Up
                      </th>
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
                            {row.lead_owner ? row.lead_owner : "--"}
                          </td>
                          <td className="px-2 py-4">
                            {row.lead_source ? row.lead_source : "--"}
                          </td>
                          <td className="px-2 py-4">
                            {row.enquiry_type ? row.enquiry_type : "--"}
                          </td>
                          <td className="px-2 py-4">
                            {row.lead_status ? row.lead_status : "--"}
                          </td>
                          <td className="px-2 py-4">
                            {row.status ? formatText(row.status) : "--"}
                          </td>
                          <td className="px-2 py-4">
                            {formatAutoDate(row.last_communication_date)}
                          </td>
                          <td className="px-2 py-4">{row.last_call_status}</td>
                          <td className="px-2 py-4">
                            {row.next_follow_up
                              ? formatAutoDate(row.next_follow_up)
                              : "--"}
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
                  setPage(newPage);

                  // Prepare overrideSelected for removed filters
                  const overrideSelected = {
                    club_id: selectedClub || null,
                    lead_status: selectedLeadStatus || null,
                    lead_source: selectedLeadSource || null,
                    last_call_status: selectedLastCallType || null,
                    created_by: selectedCallTag || null,
                    interested_in: selectedServiceName || null,
                    gender: selectedGender || null,
                  };

                  fetchEnquiriesList(newPage, overrideSelected);
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
