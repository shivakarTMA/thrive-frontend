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

const customerData = [
  {
    id: 1,
    memberId: "THR001245",
    memberName: "Rohan Mehta",
    gender: "Male",
    age: 32,
    status: "Active",
    memberFrom: "12-Mar-2024",
    expiredOn: "11-04-2026",
    attendance: 18,
    sessionsBooked: 16,
    sessionsAttended: 14,
    favoriteClass: "Strength Training",
  },
  {
    id: 2,
    memberId: "THR001312",
    memberName: "Ananya Singh",
    gender: "Female",
    age: 28,
    status: "Active",
    memberFrom: "05-Jun-2024",
    expiredOn: "05-07-2026",
    attendance: 22,
    sessionsBooked: 20,
    sessionsAttended: 19,
    favoriteClass: "Yoga",
  },
  {
    id: 3,
    memberId: "THR001401",
    memberName: "Kunal Verma",
    gender: "Male",
    age: 35,
    status: "Expired",
    memberFrom: "19-Jan-2023",
    expiredOn: "17-02-2025",
    attendance: 14,
    sessionsBooked: 12,
    sessionsAttended: 10,
    favoriteClass: "HIIT",
  },
  {
    id: 4,
    memberId: "THR001455",
    memberName: "Neha Kapoor",
    gender: "Female",
    age: 30,
    status: "Active",
    memberFrom: "02-Aug-2024",
    expiredOn: "01-09-2026",
    attendance: 16,
    sessionsBooked: 14,
    sessionsAttended: 13,
    favoriteClass: "Pilates",
  },
  {
    id: 5,
    memberId: "THR001512",
    memberName: "Arjun Malhotra",
    gender: "Male",
    age: 41,
    status: "Expired",
    memberFrom: "11-Nov-2022",
    expiredOn: "10-12-2024",
    attendance: 12,
    sessionsBooked: 10,
    sessionsAttended: 9,
    favoriteClass: "Functional Training",
  },
  {
    id: 6,
    memberId: "THR001588",
    memberName: "Pooja Nair",
    gender: "Female",
    age: 34,
    status: "Expired",
    memberFrom: "21-Feb-2023",
    expiredOn: "22-03-2025",
    attendance: 4,
    sessionsBooked: 6,
    sessionsAttended: 2,
    favoriteClass: "Zumba",
  },
  {
    id: 7,
    memberId: "THR001643",
    memberName: "Aman Khurana",
    gender: "Male",
    age: 27,
    status: "Active",
    memberFrom: "15-Sep-2024",
    expiredOn: "15-10-2026",
    attendance: 20,
    sessionsBooked: 18,
    sessionsAttended: 17,
    favoriteClass: "CrossFit",
  },
  {
    id: 8,
    memberId: "THR001702",
    memberName: "Simran Kaur",
    gender: "Female",
    age: 29,
    status: "Active",
    memberFrom: "07-Jul-2024",
    expiredOn: "06-08-2026",
    attendance: 15,
    sessionsBooked: 14,
    sessionsAttended: 12,
    favoriteClass: "Dance Fitness",
  },
  {
    id: 9,
    memberId: "THR001758",
    memberName: "Rahul Bansal",
    gender: "Male",
    age: 38,
    status: "Expired",
    memberFrom: "18-Jan-2022",
    expiredOn: "17-02-2024",
    attendance: 6,
    sessionsBooked: 8,
    sessionsAttended: 5,
    favoriteClass: "Strength Training",
  },
  {
    id: 10,
    memberId: "THR001804",
    memberName: "Meenal Joshi",
    gender: "Female",
    age: 33,
    status: "Active",
    memberFrom: "09-Apr-2024",
    expiredOn: "09-05-2026",
    attendance: 19,
    sessionsBooked: 17,
    sessionsAttended: 16,
    favoriteClass: "Yoga",
  },
];

const EngagementTrackingReport = () => {
  const [leadSource, setLeadSource] = useState(customerData);
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

  const fetchEngagementTrackingReport = async () => {
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

      const res = await authAxios().get(
        "/marketing/report/lead/source/performance",
        { params }
      );
      const responseData = res.data;
      const data = responseData?.data || [];

      // setLeadSource(data);
    } catch (err) {
      console.error(err);
      toast.error("data not found");
    }
  };
  useEffect(() => {
    // If custom date is selected, wait for both dates
    if (dateFilter?.value === "custom") {
      if (customFrom && customTo) {
        fetchEngagementTrackingReport();
      }
      return;
    }

    // For all non-custom filters
    fetchEngagementTrackingReport();
  }, [dateFilter, customFrom, customTo, clubFilter]);

  return (
    <div className="page--content">
      {/* Header */}
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">
            {`Home > Reports > Marketing Reports > Engagement Tracking Report`}
          </p>
          <h1 className="text-3xl font-semibold">Engagement Tracking Report</h1>
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
                <th className="px-2 py-4">S.No</th>
                <th className="px-2 py-4">Member ID</th>
                <th className="px-2 py-4">Name</th>
                <th className="px-2 py-4">Gender</th>
                <th className="px-2 py-4">Age</th>
                <th className="px-2 py-4">Status</th>
                <th className="px-2 py-4">Attendance</th>
                <th className="px-2 py-4">Sessions Booked</th>
                <th className="px-2 py-4">Sessions Attended</th>
                <th className="px-2 py-4">Favorite Class</th>
              </tr>
            </thead>

            <tbody>
              {customerData.length ? (
                customerData.map((item, index) => (
                  <tr
                    key={index}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <td className="px-2 py-3">{index + 1}</td>
                    <td className="px-2 py-3">{item.memberId}</td>
                    <td className="px-2 py-3">{item.memberName}</td>
                    <td className="px-2 py-3">{item.gender}</td>
                    <td className="px-2 py-3">{item.age}</td>
                    <td className="px-2 py-3">{item.status}</td>
                    <td className="px-2 py-3">{item.attendance}</td>
                    <td className="px-2 py-3">{item.sessionsBooked}</td>
                    <td className="px-2 py-3">{item.sessionsAttended}</td>
                    <td className="px-2 py-3">{item.favoriteClass}</td>
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
      </div>
    </div>
  );
};

export default EngagementTrackingReport;
