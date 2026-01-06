import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, subYears } from "date-fns";
import { FaCalendarDays } from "react-icons/fa6";
import Select from "react-select";
import { customStyles, filterActiveItems } from "../../../Helper/helper";
import { authAxios } from "../../../config/config";
import { toast } from "react-toastify";

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

const ThriveCoinsUsage = () => {
  const [leadSource, setLeadSource] = useState([]);
  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);

  const [dateFilter, setDateFilter] = useState(dateFilterOptions[1]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  // Function to fetch club list
  const fetchClub = async (search = "") => {
    try {
      const response = await authAxios().get("/club/list", {
        params: search ? { search } : {},
      });
      const data = response.data?.data || [];
      const activeOnly = filterActiveItems(data);
      setClubList(activeOnly);

      if (activeOnly.length === 1) {
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

  const fetchThriveCoinsUsage = async () => {
    try {
      const params = {};

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

      const res = await authAxios().get("/marketing/report/coins/usage", {
        params,
      });
      const responseData = res.data;
      const data = responseData?.data || [];

      setLeadSource(data);
    } catch (err) {
      console.error(err);
      toast.error("data not found");
    }
  };

  useEffect(() => {
    // If custom date is selected, wait for both dates
    if (dateFilter?.value === "custom") {
      if (customFrom && customTo) {
        fetchThriveCoinsUsage();
      }
      return;
    }

    // For all non-custom filters
    fetchThriveCoinsUsage();
  }, [dateFilter, customFrom, customTo, clubFilter]);

  return (
    <div className="page--content">
      {/* Header */}
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">
            {`Home > Reports > Marketing Reports > Thrive Coins Usage`}
          </p>
          <h1 className="text-3xl font-semibold">Thrive Coins Usage</h1>
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
                <th className="px-2 py-4 min-w-[30px]">S.No</th>
                <th className="px-2 py-4 min-w-[120px]">Member Id</th>
                <th className="px-2 py-4 min-w-[170px]">Member Name</th>
                <th className="px-2 py-4 min-w-[100px]">Status</th>
                <th className="px-2 py-4 min-w-[120px]">Member From</th>
                <th className="px-2 py-4 min-w-[150px]">Expired on</th>
                <th className="px-2 py-4 min-w-[150px]">Total Points Issued</th>
                <th className="px-2 py-4 min-w-[150px]">Points Used</th>
                <th className="px-2 py-4 min-w-[150px]">Points Balance</th>
              </tr>
            </thead>

            <tbody>
              {leadSource.length ? (
                leadSource.map((row, index) => (
                  <tr
                    key={index}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <td className="px-2 py-4">{index + 1}</td>
                    <td className="px-2 py-2">
                      {row?.member_id ? row?.member_id : "--"}
                    </td>
                    <td className="px-2 py-2">
                      {row?.member_name ? row?.member_name : "--"}
                    </td>
                    <td className="px-2 py-2">{row?.status}</td>
                    <td className="px-2 py-2">
                      {row?.member_from ? row?.member_from : "--"}
                    </td>
                    <td className="px-2 py-2">
                      {row?.expired_on ? row?.expired_on : "--"}
                    </td>
                    <td className="px-2 py-2">
                      {row?.total_points_issued
                        ? row?.total_points_issued
                        : "--"}
                    </td>
                    <td className="px-2 py-2">
                      {row?.points_used ? row?.points_used : "--"}
                    </td>
                    <td className="px-2 py-2">
                      {row?.points_balance ? row?.points_balance : "--"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-4">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ThriveCoinsUsage;
