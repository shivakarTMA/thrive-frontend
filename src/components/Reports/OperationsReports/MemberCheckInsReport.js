import React, { useEffect, useMemo, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, format, subYears } from "date-fns";
import { FaCalendarDays } from "react-icons/fa6";
import { customStyles, filterActiveItems } from "../../../Helper/helper";
import Select from "react-select";
import { authAxios } from "../../../config/config";
import { toast } from "react-toastify";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Pagination from "../../common/Pagination";

// Date filter dropdown options
const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const formatDate = (date) => format(date, "yyyy-MM-dd");

const MemberCheckInsReport = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const userRole = user.role;

  const [data, setData] = useState([]);
  const [summaryData, setSummaryData] = useState({});

  const [dateFilter, setDateFilter] = useState(dateFilterOptions[0]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);

  const [memberPlan, setMemberPlan] = useState([]);
  const [memberPlanFilter, setMemberPlanFilter] = useState(null);

  const [memberSearch, setMemberSearch] = useState("");
  const [memberResults, setMemberResults] = useState([]);
  const [memberFilter, setMemberFilter] = useState(null);
  const [memberLoading, setMemberLoading] = useState(false);
  const [selectedMemberName, setSelectedMemberName] = useState("");
  const memberSearchRef = useRef(null);

  const [filtersInitialized, setFiltersInitialized] = useState(false);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  /* ------------------ PAGE TITLE ------------------ */

  const pageTitle = useMemo(() => {
    if (memberFilter || id)
      return `Member Check-ins (${selectedMemberName || "Selected Member"})`;
    return "Member Check-ins";
  }, [memberFilter, id, selectedMemberName]);

  /* ------------------ FETCH MEMBERS ------------------ */

  const fetchMembers = async (search) => {
    if (!search || search.length < 2 || memberFilter) return;

    try {
      setMemberLoading(true);
      const res = await authAxios().get("/member/list", {
        params: { search },
      });
      setMemberResults(res.data?.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setMemberLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchMembers(memberSearch);
    }, 400);
    return () => clearTimeout(delay);
  }, [memberSearch, memberFilter]);

  /* ------------------ FETCH CLUBS ------------------ */

  const fetchClub = async () => {
    try {
      const res = await authAxios().get("/club/list");
      const activeClubs = filterActiveItems(res.data?.data || []);
      setClubList(activeClubs);

      // ✅ Set default club (index 0) ONLY if not already set
      if (!clubFilter && activeClubs.length > 0) {
        setClubFilter(activeClubs[0].id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMembershipPlan = async (clubId) => {
    try {
      if (!clubId) {
        setMemberPlan([]);
        setMemberPlanFilter(null);
        return;
      }

      const res = await authAxios().get("/subscription-plan/list", {
        params: { club_id: clubId }, // ✅ pass club_id
      });

      const activePlans = filterActiveItems(res.data?.data || []);
      setMemberPlan(activePlans);

      // Reset selection if not valid
      if (!activePlans.find((p) => p.id === memberPlanFilter)) {
        setMemberPlanFilter(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchClub();
  }, []);

  useEffect(() => {
    if (clubFilter) {
      fetchMembershipPlan(clubFilter);
    } else {
      setMemberPlan([]);
      setMemberPlanFilter(null);
    }
  }, [clubFilter]);

  const clubOptions = clubList.map((c) => ({
    label: c.name,
    value: c.id,
  }));

  const memberPlanOptions = memberPlan.map((c) => ({
    label: `${c.title} (${c.plan_type})`,
    value: c.id,
  }));

  console.log(memberPlanOptions, "memberPlanOptions");

  /* ------------------ FETCH REPORT ------------------ */

  const fetchReport = async (currentPage = page) => {
    try {
      const params = {
         page: currentPage,
        limit: rowsPerPage,
      };

      if (clubFilter){
        params.club_id = clubFilter;
      }
      if (memberFilter){
        params.member_id = memberFilter;
      }
      if (memberPlanFilter){
        params.subscription_plan_id = memberPlanFilter;
      } 
      // else if (id) params.member_id = Number(id);

      if (dateFilter.value === "custom") {
        if (customFrom && customTo) {
          params.startDate = formatDate(customFrom);
          params.endDate = formatDate(customTo);
        }
      } else {
        params.dateFilter = dateFilter.value;
      }

      const res = await authAxios().get("/report/attendance", { params });
      const responseData = res.data;
      setData(responseData?.data || []);
      setSummaryData(responseData?.summary || {});

      setPage(responseData?.currentPage || 1);
      setTotalPages(responseData?.totalPage || 1);
      setTotalCount(responseData?.totalCount || 0);
    } catch (error) {
      console.error(error);
    }
  };

  /* ------------------ URL → STATE ------------------ */

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const dateFilterValue = params.get("dateFilter");
    const startDate = params.get("startDate");
    const endDate = params.get("endDate");
    const clubId = params.get("club_id");
    const memberId = params.get("member_id");

    // DATE
    if (startDate && endDate) {
      setDateFilter(dateFilterOptions.find((d) => d.value === "custom"));
      setCustomFrom(new Date(startDate));
      setCustomTo(new Date(endDate));
    } else if (dateFilterValue) {
      const matched = dateFilterOptions.find(
        (opt) => opt.value === dateFilterValue,
      );
      if (matched) setDateFilter(matched);
    }

    // CLUB
    if (clubId) setClubFilter(Number(clubId));

    // MEMBER (URL first, route fallback)
    if (memberId) {
      setMemberFilter(Number(memberId));
    } else if (id) {
      setMemberFilter(Number(id));
    }

    setFiltersInitialized(true);
  }, [location.search, id]);

  /* ------------------ STATE → URL ------------------ */

  useEffect(() => {
    if (!filtersInitialized) return;

    const params = new URLSearchParams();

    if (dateFilter?.value === "custom" && customFrom && customTo) {
      params.set("startDate", formatDate(customFrom));
      params.set("endDate", formatDate(customTo));
    } else if (dateFilter?.value) {
      params.set("dateFilter", dateFilter.value);
    }

    if (clubFilter) params.set("club_id", clubFilter);
    if (memberFilter) params.set("member_id", memberFilter);

    navigate({ search: params.toString() }, { replace: true });
  }, [
    dateFilter,
    customFrom,
    customTo,
    clubFilter,
    memberFilter,
    memberPlanFilter,
    filtersInitialized,
    navigate,
  ]);

  /* ------------------ FETCH DATA ------------------ */

  useEffect(() => {
    if (!filtersInitialized) return;
    // 🚫 Prevent API call until both dates are selected
    if (dateFilter?.value === "custom" && (!customFrom || !customTo)) {
      return;
    }
    fetchReport(1);
  }, [
    filtersInitialized,
    dateFilter?.value,
    customFrom,
    customTo,
    clubFilter,
    memberFilter,
    memberPlanFilter,
    id,
  ]);

  /* ------------------ RENDER ------------------ */

  return (
    <>
      <div className="page--content">
        {/* Page heading */}
        <div className="flex items-end justify-between gap-2 mb-5">
          <div className="title--breadcrumbs">
            <p className="text-sm">{`Home >  Reports > Operations Reports > Member Check-ins`}</p>
            <h1 className="text-3xl font-semibold">{pageTitle}</h1>
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
                options={clubOptions}
                styles={customStyles}
                value={clubOptions.find((o) => o.value === clubFilter) || null}
                onChange={(o) => setClubFilter(o?.value || null)}
                className="w-full"
                isClearable={userRole === "ADMIN" ? true : false}
              />
            </div>
            <div className="w-fit min-w-[200px]">
              <Select
                placeholder="Filter by Plan"
                options={memberPlanOptions}
                styles={customStyles}
                value={
                  memberPlanOptions.find((o) => o.value === memberPlanFilter) ||
                  null
                }
                onChange={(o) => setMemberPlanFilter(o?.value || null)}
                className="w-full"
                isClearable={userRole === "ADMIN" ? true : false}
                isDisabled={!clubFilter} // ✅ disable if no club selected
              />
            </div>
            <div className="relative max-w-[250px] w-full">
              <input
                ref={memberSearchRef}
                type="text"
                placeholder="Filter by name or mobile"
                value={memberSearch}
                onChange={(e) => {
                  setMemberSearch(e.target.value);
                  setMemberFilter(null);
                  setSelectedMemberName("");
                }}
                onFocus={() => memberFilter && setMemberResults([])}
                className="custom--input w-full"
              />

              {/* Loader */}
              {memberLoading && (
                <div className="absolute w-full bg-white border p-2 text-sm z-10">
                  Searching...
                </div>
              )}

              {/* Dropdown Results */}
              {!memberLoading && memberResults.length > 0 && (
                <ul className="absolute w-full bg-white border z-10 max-h-[200px] overflow-auto">
                  {memberResults.map((m) => (
                    <li
                      key={m.id}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setMemberFilter(m.id);
                        setMemberSearch(m.full_name);
                        setSelectedMemberName(m.full_name);
                        setMemberResults([]);
                      }}
                    >
                      {m.full_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Statistics */}
        <div className="grid grid-cols-3 gap-5 mb-5 p-3 border bg-white shodow--box rounded-[10px]">
          {[
            ["Total Check-ins", summaryData.total_check_in],
            ["Total Unique Check-ins", summaryData.total_unique_check_in],
            ["Total Unique Members", summaryData.total_unique_members],
          ].map(([label, value], i) => (
            <div
              key={i}
              className="border rounded-[5px] overflow-hidden w-full"
            >
              <div className="flex gap-1 justify-center bg-[#F1F1F1] p-4 py-3">
                <div className="text-lg font-bold">{label}</div>
              </div>
              <div>
                <p className="text-3xl font-bold p-2 text-center py-5">
                  {value || 0}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Data Table */}
        <div className="w-full p-3 border bg-white shodow--box rounded-[10px]">
          <div className="table--data--bottom w-full">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    {/* <th className="px-2 py-4 min-w-[50px]">S.No</th> */}
                    <th className="px-2 py-4 min-w-[150px]">Club Name</th>
                    <th className="px-2 py-4 min-w-[100px]">Member ID</th>
                    <th className="px-2 py-4 min-w-[120px]">Member Name</th>
                    <th className="px-2 py-4 min-w-[150px]">
                      Member Current Plan
                    </th>

                    <th className="px-2 py-4 min-w-[100px]">Date</th>
                    <th className="px-2 py-4 min-w-[100px]">Check -In</th>
                    <th className="px-2 py-4 min-w-[100px]">Check-Out</th>
                  </tr>
                </thead>

                <tbody>
                  {data.length ? (
                    data.map((r, i) => (
                      <tr
                        key={i}
                        className="bg-white border-b hover:bg-gray-50 relative transition duration-700"
                      >
                        {/* <td className="px-2 py-4">{i + 1}</td> */}
                        <td className="px-2 py-4">{r?.club_name}</td>
                        <td className="px-2 py-4">{r?.membership_number}</td>
                        <td className="px-2 py-4">{r?.member_name}</td>
                        <td className="px-2 py-4">{r?.subscription_title}</td>
                        <td className="px-2 py-4">{r?.date}</td>
                        <td className="px-2 py-4 text-green-600">
                          {r?.check_in || "--"}
                        </td>
                        <td className="px-2 py-4 text-orange-500">
                          {r?.check_out || "--"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center px-2 py-4">
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
              currentDataLength={data.length}
              onPageChange={(newPage) => {
                setPage(newPage);
                fetchReport(newPage);
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default MemberCheckInsReport;
