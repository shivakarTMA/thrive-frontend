import React, { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, subYears } from "date-fns";
import { FaCalendarDays } from "react-icons/fa6";
import Select from "react-select";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { authAxios } from "../../../config/config";
import { customStyles, filterActiveItems } from "../../../Helper/helper";

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const formatDate = (date) =>
  date ? date.toISOString().split("T")[0] : null;

const MemberCheckInsReport = () => {
  const { id } = useParams();

  const [data, setData] = useState([]);
  const [summaryData, setSummaryData] = useState({});
  const [dateFilter, setDateFilter] = useState(dateFilterOptions[1]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);

  const [memberSearch, setMemberSearch] = useState("");
  const [memberResults, setMemberResults] = useState([]);
  const [memberFilter, setMemberFilter] = useState(null);
  const [memberLoading, setMemberLoading] = useState(false);
  const memberSearchRef = useRef(null);

  const fetchMembers = async (search) => {
    if (!search || search.length < 2 || memberFilter) return;

    try {
      setMemberLoading(true);
      const res = await authAxios().get("/member/list", {
        params: { search },
      });
      setMemberResults(res.data?.data || []);
    } catch {
      toast.error("Failed to fetch members");
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

  const fetchClub = async () => {
    try {
      const res = await authAxios().get("/club/list");
      setClubList(filterActiveItems(res.data?.data || []));
    } catch {
      toast.error("Failed to fetch clubs");
    }
  };

  useEffect(() => {
    fetchClub();
  }, []);

  const clubOptions = clubList.map((c) => ({
    label: c.name,
    value: c.id,
  }));

  const fetchReport = async () => {
    try {
      const params = {};

      if (clubFilter) params.club_id = clubFilter;
      if (memberFilter) params.member_id = memberFilter;
      else if (id) params.member_id = Number(id);

      if (dateFilter.value === "custom") {
        if (customFrom && customTo) {
          params.startDate = formatDate(customFrom);
          params.endDate = formatDate(customTo);
        }
      } else {
        params.dateFilter = dateFilter.value;
      }

      const res = await authAxios().get("/report/attendance", { params });
      setData(res.data?.data || []);
      setSummaryData(res.data?.summary || {});
    } catch {
      toast.error("Data not found");
    }
  };

  useEffect(() => {
    if (dateFilter.value === "custom" && (!customFrom || !customTo)) return;
    fetchReport();
  }, [dateFilter, customFrom, customTo, clubFilter, memberFilter, id]);

  return (
    <div className="page--content">
      <div className="title--breadcrumbs mb-5">
        <p className="text-sm">
          Home &gt; Reports &gt; Operations Reports &gt; Member Check-ins
        </p>
        <h1 className="text-3xl font-semibold">Member Check-ins</h1>
      </div>

      <div className="flex gap-2 mb-4">
        <Select
          className="w-[180px]"
          options={dateFilterOptions}
          value={dateFilter}
          styles={customStyles}
          onChange={(v) => {
            setDateFilter(v);
            setCustomFrom(null);
            setCustomTo(null);
          }}
        />

        {dateFilter.value === "custom" && (
          <>
            <div className="relative w-[180px]">
              <FaCalendarDays className="absolute left-3 top-3 z-10" />
              <DatePicker
                selected={customFrom}
                onChange={(d) => {
                  setCustomFrom(d);
                  setCustomTo(null);
                }}
                className="custom--input pl-10"
                placeholderText="From Date"
                minDate={subYears(new Date(), 20)}
                maxDate={new Date()}
                dateFormat="dd-MM-yyyy"
              />
            </div>

            <div className="relative w-[180px]">
              <FaCalendarDays className="absolute left-3 top-3 z-10" />
              <DatePicker
                selected={customTo}
                onChange={setCustomTo}
                className="custom--input pl-10"
                placeholderText="To Date"
                minDate={customFrom}
                maxDate={new Date()}
                dateFormat="dd-MM-yyyy"
                disabled={!customFrom}
              />
            </div>
          </>
        )}

        <Select
          className="w-[220px]"
          placeholder="Filter by club"
          options={clubOptions}
          styles={customStyles}
          value={clubOptions.find((o) => o.value === clubFilter) || null}
          onChange={(o) => setClubFilter(o?.value || null)}
        />

        <div className="relative w-[260px]">
          <input
            ref={memberSearchRef}
            className="custom--input w-full"
            placeholder="Filter by name or mobile"
            value={memberSearch}
            onChange={(e) => {
              setMemberSearch(e.target.value);
              setMemberFilter(null);
            }}
            onFocus={() => memberFilter && setMemberResults([])}
          />

          {memberLoading && (
            <div className="absolute w-full bg-white border p-2 text-sm z-10">
              Searching...
            </div>
          )}

          {!memberLoading && memberResults.length > 0 && (
            <ul className="absolute w-full bg-white border z-10 max-h-[200px] overflow-auto">
              {memberResults.map((m) => (
                <li
                  key={m.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setMemberFilter(m.id);
                    setMemberSearch(m.full_name);
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

      <div className="grid grid-cols-3 gap-5 mb-5">
        {[
          ["Total Check-ins", summaryData.total_check_in],
          ["Total Unique Check-ins", summaryData.total_unique_check_in],
          ["Total Unique Members", summaryData.total_unique_members],
        ].map(([label, value], i) => (
          <div key={i} className="border rounded bg-white">
            <div className="bg-gray-100 p-3 text-center font-bold">
              {label}
            </div>
            <div className="text-center text-3xl font-bold py-6">
              {value || 0}
            </div>
          </div>
        ))}
      </div>

      <div className="border bg-white rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase">
            <tr>
              <th className="p-3">S.No</th>
              <th className="p-3">Club Name</th>
              <th className="p-3">Member ID</th>
              <th className="p-3">Member Name</th>
              <th className="p-3">Date</th>
              <th className="p-3">Check-In</th>
              <th className="p-3">Check-Out</th>
            </tr>
          </thead>
          <tbody>
            {data.length ? (
              data.map((r, i) => (
                <tr key={i}>
                  <td className="px-2 py-4">{i + 1}</td>
                  <td className="px-2 py-4">{r.club_name}</td>
                  <td className="px-2 py-4">{r.membership_number}</td>
                  <td className="px-2 py-4">{r.member_name}</td>
                  <td className="px-2 py-4">{r.date}</td>
                  <td className="px-2 py-4 text-green-600">
                    {r.check_in || "--"}
                  </td>
                  <td className="px-2 py-4 text-orange-500">
                    {r.check_out || "--"}
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
    </div>
  );
};

export default MemberCheckInsReport;
