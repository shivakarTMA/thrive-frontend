import React, { useEffect, useState } from "react";
import { authAxios } from "../../config/config";
import { toast } from "react-toastify";
import {
  customStyles,
  formatAutoDate,
  formatIndianNumber,
} from "../../Helper/helper";
import { FaCalendarDays } from "react-icons/fa6";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, format, subYears } from "date-fns";
import Select from "react-select";
import Pagination from "../common/Pagination";

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const formatDate = (date) => format(date, "yyyy-MM-dd");

const HealthProfile = ({ details }) => {
  const [activeHealthTab, setActiveHealthTab] = useState("activitylog");

  const [memberHealth, setMemberHealth] = useState([]);
  const [memberActivity, setMemberActivity] = useState([]);

  const [dateFilter, setDateFilter] = useState(dateFilterOptions[0]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const columnsActivity = [
    "Date",
    "Steps",
    "Calories Burned (kcal)",
    "Distance (km)",
    "Active Minutes (min)",
  ];

  const columnsHealth = [
    "Date",
    "Weight (Kg)",
    "SMM (Skeletal Muscle Mass) (Kg)",
    "PBF (Percent Body Fat) %",
    "Height (cm)",
  ];

  // ---------------- FETCH DATA ----------------
  const fetchData = async (type, currentPage = page) => {
    if (!details?.id) return;

    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };

      if (dateFilter?.value === "custom") {
        if (customFrom && customTo) {
          params.startDate = formatDate(customFrom);
          params.endDate = formatDate(customTo);
        }
      } else if (dateFilter?.value) {
        params.dateFilter = dateFilter.value;
      }

      const url =
        type === "health"
          ? `/member/health/log/${details?.id}`
          : `/member/activity/log/${details?.id}`;

      const res = await authAxios().get(url, { params });

      const data = res.data?.data || [];

      if (type === "health") {
        setMemberHealth(data);
      } else {
        setMemberActivity(data);
      }

      setPage(res.data?.currentPage || 1);
      setTotalPages(res.data?.totalPages || 1);
      setTotalCount(res.data?.totalCount || data.length);
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- EFFECT ----------------
  useEffect(() => {
    if (dateFilter?.value === "custom") {
      if (!customFrom || !customTo) return;
    }

    setPage(1);

    if (activeHealthTab === "healthlog") {
      fetchData("health", 1);
    } else {
      fetchData("activity", 1);
    }
  }, [dateFilter, customFrom, customTo, activeHealthTab]);

  const handleTabActive = (tab) => {
    setActiveHealthTab(tab);
    setDateFilter(dateFilterOptions[0]);
    setCustomFrom(null);
    setCustomTo(null);
    setPage(1);
  };

  // ---------------- DATE FILTER UI ----------------
  const DateFilterUI = () => (
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
            <span className="absolute z-[1] mt-[9px] ml-[15px]">
              <FaCalendarDays />
            </span>
            <DatePicker
              selected={customFrom}
              onChange={(date) => {
                setCustomFrom(date);
                setCustomTo(null);
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
            <span className="absolute z-[1] mt-[9px] ml-[15px]">
              <FaCalendarDays />
            </span>
            <DatePicker
              selected={customTo}
              onChange={(date) => setCustomTo(date)}
              placeholderText="To Date"
              className="custom--input w-full input--icon"
              minDate={customFrom || subYears(new Date(), 20)}
              maxDate={addYears(new Date(), 0)}
              dateFormat="dd-MM-yyyy"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              disabled={!customFrom}
            />
          </div>
        </>
      )}
    </div>
  );

  console.log(memberActivity, "memberActivity");

  return (
    <div className="p-4 bg-white rounded shadow">
      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        {["activitylog", "healthlog"].map((tab) => (
          <div
            key={tab}
            onClick={() => handleTabActive(tab)}
            className={`cursor-pointer rounded-[5px] ${
              activeHealthTab === tab
                ? "bg--color text-white"
                : "bg-white text-black"
            }`}
          >
            <div className="px-3 py-2 text-[14px]">
              {tab === "activitylog" ? "Activity logs" : "Health logs"}
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-3 mb-4 items-center justify-between">
        <DateFilterUI />
      </div>

      {/* Activity Table */}
      {activeHealthTab === "activitylog" && (
        <>
          <div className="overflow-auto">
            <table className="min-w-full border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  {columnsActivity.map((col) => (
                    <th key={col} className="border px-3 py-2 text-left">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {memberActivity.length ? (
                  memberActivity.map((item, idx) => (
                    <tr key={idx}>
                      <td className="border px-3 py-2">
                        {formatAutoDate(item.date)}
                      </td>
                      <td className="border px-3 py-2">
                        {item?.steps !== null && item?.steps !== undefined
                          ? formatIndianNumber(item?.steps)
                          : "--"}
                      </td>
                      <td className="border px-3 py-2">
                        {item?.total_calories ?? "--"}
                      </td>
                      <td className="border px-3 py-2">
                        {item?.distance ?? "--"}
                      </td>
                      <td className="border px-3 py-2">
                        {item?.active_minutes ?? "--"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-500">
                      No data found.
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
            currentDataLength={memberActivity.length}
            onPageChange={(newPage) => {
              setPage(newPage);
              fetchData("activity", newPage);
            }}
          />
        </>
      )}

      {/* Health Table */}
      {activeHealthTab === "healthlog" && (
        <>
          <div className="overflow-auto">
            <table className="min-w-full border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  {columnsHealth.map((col) => (
                    <th key={col} className="border px-3 py-2 text-left">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {memberHealth.length ? (
                  memberHealth.map((item, idx) => (
                    <tr key={idx}>
                      <td className="border px-3 py-2">
                        {formatAutoDate(item.datetime)}
                      </td>
                      <td className="border px-3 py-2">{item?.weight}</td>
                      <td className="border px-3 py-2">{item?.smm}</td>
                      <td className="border px-3 py-2">{item?.pbf}</td>
                      <td className="border px-3 py-2">{item?.height}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-500">
                      No data found.
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
            currentDataLength={memberHealth.length}
            onPageChange={(newPage) => {
              setPage(newPage);
              fetchData("health", newPage);
            }}
          />
        </>
      )}
    </div>
  );
};

export default HealthProfile;
