import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, subYears, format } from "date-fns";
import { FaCalendarDays } from "react-icons/fa6";
import Select from "react-select";
import {
  customStyles,
  filterActiveItems,
  formatAutoDate,
  formatTimeAppointment,
  formatText,
} from "../Helper/helper";
import { authAxios } from "../config/config";
import { toast } from "react-toastify";
import Tooltip from "../components/common/Tooltip";
import { LiaEdit } from "react-icons/lia";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Pagination from "../components/common/Pagination";
import { useSelector } from "react-redux";

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const formatDate = (date) => {
  if (!date) return null;
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
};

const MyFollowUps = () => {
  const [myFollowUps, setMyFollowUps] = useState([]);
  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const [filtersInitialized, setFiltersInitialized] = useState(false);

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
  const updateURLParams = () => {
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

    navigate(`?${params.toString()}`, { replace: true });
  };

  const fetchMyFollowups = async (currentPage = page) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };

      // Club filter
      if (clubFilter?.value) {
        params.club_id = clubFilter.value;
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

      const res = await authAxios().get("/report/myfollowup", {
        params,
      });
      const responseData = res.data;
      const data = responseData?.data || [];

      setMyFollowUps(data);
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
    if (clubList.length === 0) return;
    if (filtersInitialized) return;

    const params = new URLSearchParams(location.search);

    // ---- Date filter ----
    const dateFilterValue = params.get("dateFilter");
    if (dateFilterValue) {
      const matchedDate = dateFilterOptions.find(
        (opt) => opt.value === dateFilterValue,
      );
      if (matchedDate) {
        setDateFilter(matchedDate);
      }
    }

    // ---- Custom date ----
    const startDate = params.get("startDate");
    const endDate = params.get("endDate");
    if (startDate && endDate) {
      setDateFilter(dateFilterOptions.find((d) => d.value === "custom"));
      setCustomFrom(new Date(startDate));
      setCustomTo(new Date(endDate));
    }

    // ---- Club filter ----
    const clubId = params.get("club_id");

    // if (clubId) {
    //   const club = clubList.find((c) => c.id === Number(clubId));
    //   if (club) {
    //     setClubFilter({ label: club.name, value: club.id });
    //   }
    // } else {
    //   // ✅ default only when URL does NOT have club_id
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

    setFiltersInitialized(true);
  }, [clubList, location.search]);

  // ---------------------------
  // FETCH WHEN FILTERS CHANGE
  // ---------------------------
  useEffect(() => {
    if (!filtersInitialized) return;

    // 🚫 wait until both dates are selected for custom range
    if (dateFilter?.value === "custom" && (!customFrom || !customTo)) {
      return;
    }

    setPage(1);
    fetchMyFollowups(1);
    updateURLParams();
  }, [
    filtersInitialized,
    dateFilter?.value,
    customFrom,
    customTo,
    clubFilter?.value,
  ]);

  return (
    <div className="page--content">
      {/* Header */}
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > My Follow Up`}</p>
          <h1 className="text-3xl font-semibold">My Follow Up</h1>
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
              styles={customStyles}
              isClearable={userRole === "ADMIN" ? true : false}
              className="w-full"
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
                <th className="px-2 py-4 min-w-[50px]">S.no</th>
                <th className="px-2 py-4 min-w-[130px]">Club Name</th>
                <th className="px-2 py-4 min-w-[100px]">Scheduled Date</th>
                <th className="px-2 py-4 min-w-[100px]">Scheduled Time</th>
                <th className="px-2 py-4 min-w-[100px]">Call Type</th>
                <th className="px-2 py-4 min-w-[100px]">Member Type</th>
                <th className="px-2 py-4 min-w-[130px]">Name</th>
                <th className="px-2 py-4 min-w-[140px]">Call Status</th>
                <th className="px-2 py-4 min-w-[130px]">Staff Name</th>
                <th className="px-2 py-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {myFollowUps.length ? (
                myFollowUps.map((row, index) => (
                  <tr
                    key={index}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <td className="px-2 py-4">{index + 1}</td>
                    <td className="px-2 py-4">{row.club_name}</td>
                    <td className="px-2 py-4">
                      {formatAutoDate(row.schedule_date)}
                    </td>
                    <td className="px-2 py-4">
                      {formatTimeAppointment(row.schedule_time)}
                    </td>
                    <td className="px-2 py-4">
                      {row.call_type ? row.call_type : "--"}
                    </td>
                    <td className="px-2 py-4">{formatText(row.entity_type)}</td>
                    <td className="px-2 py-4">
                      {row.member_name ? row.member_name : "--"}
                    </td>
                    <td className="px-2 py-4">{row.call_status}</td>
                    <td className="px-2 py-4">
                      {row.staff_name ? row.staff_name : "--"}
                    </td>
                    <td className="px-2 py-4">
                      <div className="flex">
                        {!(row.entity_type === "LEAD" && row.is_subscribed) ? (
                          <Tooltip
                            id={`tooltip-update-${row.id}`}
                            content="Update Follow Up"
                            place="top"
                          >
                            <Link
                              to={
                                row.entity_type === "LEAD"
                                  ? `/lead-follow-up/${row.member_id}?logId=${row.id}`
                                  : `/member/${row.member_id}?view=call-logs&logId=${row.id}`
                              }
                              className="p-1 block cursor-pointer"
                            >
                              <LiaEdit className="text-[25px] text-black" />
                            </Link>
                          </Tooltip>
                        ) : (
                          <Tooltip
                            id={`tooltip-disabled-${row.id}`}
                            content="Subscribed leads cannot be edited"
                            place="top"
                          >
                            <span className="p-1 block cursor-not-allowed opacity-50">
                              <LiaEdit className="text-[25px] text-gray-400" />
                            </span>
                          </Tooltip>
                        )}
                      </div>
                    </td>
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

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          currentDataLength={myFollowUps.length}
          onPageChange={(newPage) => {
            setPage(newPage);
            fetchMyFollowups(newPage);
          }}
        />
      </div>
    </div>
  );
};

export default MyFollowUps;
