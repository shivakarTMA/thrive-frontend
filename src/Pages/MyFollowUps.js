import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, subYears } from "date-fns";
import { FaCalendarDays } from "react-icons/fa6";
import Select from "react-select";
import {
  customStyles,
  filterActiveItems,
  formatAutoDate,
  formatIndianNumber,
  formatText,
} from "../Helper/helper";
import { authAxios } from "../config/config";
import { toast } from "react-toastify";
import { FaCircle } from "react-icons/fa";
import Tooltip from "../components/common/Tooltip";
import { LiaEdit } from "react-icons/lia";
import { Link } from "react-router-dom";

const callsData = [
  {
    id: 1,
    clubName: "DLF Summit Plaza",
    scheduledDate: "15/01/2026",
    scheduledTime: "3:00 pm",
    callType: "Enquiry Call",
    name: "Shreya Agarwal",
    callStatus: "Upcoming",
    staffName: "Prerna",
    action: "Update",
  },
  {
    id: 2,
    clubName: "DLF Summit Plaza",
    scheduledDate: "15/01/2026",
    scheduledTime: "4:30 pm",
    callType: "Renewal Call",
    name: "Divya",
    callStatus: "Upcoming",
    staffName: "Prerna",
    action: "Update",
  },
  {
    id: 3,
    clubName: "DLF Summit Plaza",
    scheduledDate: "12/01/2026",
    scheduledTime: "9:45 am",
    callType: "Birthday Call",
    name: "Ajeet Kumar",
    callStatus: "Missed",
    staffName: "Shivakar",
    action: "Update",
  },
  {
    id: 4,
    clubName: "DLF Summit Plaza",
    scheduledDate: "12/01/2026",
    scheduledTime: "2:00 pm",
    callType: "Renewal Call",
    name: "Abu Bakar",
    callStatus: "Missed",
    staffName: "Prerna",
    action: "Update",
  },
  {
    id: 5,
    clubName: "DLF Summit Plaza",
    scheduledDate: "10/01/2026",
    scheduledTime: "5:00 pm",
    callType: "Enquiry Call",
    name: "Nitin Sehgal",
    callStatus: "Contacted",
    staffName: "Prerna",
    action: "Update",
  },
];

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
  const [leadSource, setLeadSource] = useState(callsData);
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

//   const fetchLeadSourcePerformance = async () => {
//     try {
//       const params = {};

//       // Club filter
//       if (clubFilter) {
//         params.club_id = clubFilter;
//       }

//       // Date filter
//       if (dateFilter?.value === "custom") {
//         if (customFrom && customTo) {
//           params.startDate = formatDate(customFrom);
//           params.endDate = formatDate(customTo);
//         }
//       } else if (dateFilter?.value) {
//         params.dateFilter = dateFilter.value;
//       }

//       const res = await authAxios().get("/marketing/report/newjoinee", {
//         params,
//       });
//       const responseData = res.data;
//       const data = responseData?.data || [];

//       //   setLeadSource(data);
//     } catch (err) {
//       console.error(err);
//       toast.error("data not found");
//     }
//   };
//   useEffect(() => {
//     // If custom date is selected, wait for both dates
//     if (dateFilter?.value === "custom") {
//       if (customFrom && customTo) {
//         fetchLeadSourcePerformance();
//       }
//       return;
//     }

//     // For all non-custom filters
//     fetchLeadSourcePerformance();
//   }, [dateFilter, customFrom, customTo, clubFilter]);

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
                <th className="px-2 py-4 min-w-[50px]">S.no</th>
                <th className="px-2 py-4 min-w-[150px]">Club Name</th>
                <th className="px-2 py-4 min-w-[100px]">Scheduled Date</th>
                <th className="px-2 py-4 min-w-[150px]">Scheduled Time</th>
                <th className="px-2 py-4 min-w-[150px]">Call Type</th>
                <th className="px-2 py-4 min-w-[130px]">Name</th>
                <th className="px-2 py-4 min-w-[140px]">Call Status</th>
                <th className="px-2 py-4 min-w-[130px]">Staff Name</th>
                <th className="px-2 py-4">Action</th>
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
                    <td className="px-2 py-4">{row.clubName}</td>
                    <td className="px-2 py-4">{row.scheduledDate}</td>
                    <td className="px-2 py-4">{row.scheduledTime}</td>
                    <td className="px-2 py-4">{row.callType}</td>
                    <td className="px-2 py-4">{row.name}</td>
                    <td className="px-2 py-4">{row.callStatus}</td>
                    <td className="px-2 py-4">{row.staffName}</td>
                    <td className="px-2 py-4">
                      <div className="flex">
                        <Tooltip
                        id={`tooltip-update-${row.id}`}
                        content="Update Follow Up"
                        place="top"
                      >
                        <Link to="/lead-follow-up/18" className="p-1 block cursor-pointer">
                          <LiaEdit className="text-[25px] text-black" />
                        </Link>
                      </Tooltip>
                      </div>
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
      </div>
    </div>
  );
};

export default MyFollowUps;
