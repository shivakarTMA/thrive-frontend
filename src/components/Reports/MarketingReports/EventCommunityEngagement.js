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
    eventName: "New Year Fitness Kickoff",
    registrations: 420,
    attendees: 368,
    revenue: 840000,
    budget: 120000,
    roi: "600%",
  },
  {
    id: 2,
    eventName: "Yoga for Beginners – Weekend Workshop",
    registrations: 180,
    attendees: 156,
    revenue: 312000,
    budget: 60000,
    roi: "420%",
  },
  {
    id: 3,
    eventName: "HIIT Burn Challenge – 30 Days",
    registrations: 260,
    attendees: 214,
    revenue: 520000,
    budget: 100000,
    roi: "420%",
  },
  {
    id: 4,
    eventName: "Corporate Wellness Day",
    registrations: 140,
    attendees: 128,
    revenue: 960000,
    budget: 80000,
    roi: "1100%",
  },
  {
    id: 5,
    eventName: "Zumba Dance Night",
    registrations: 210,
    attendees: 182,
    revenue: 273000,
    budget: 75000,
    roi: "264%",
  },
  {
    id: 6,
    eventName: "Strength & Conditioning Masterclass",
    registrations: 95,
    attendees: 82,
    revenue: 246000,
    budget: 50000,
    roi: "392%",
  },
  {
    id: 7,
    eventName: "Community Run – 5K",
    registrations: 360,
    attendees: 298,
    revenue: 149000,
    budget: 90000,
    roi: "66%",
  },
  {
    id: 8,
    eventName: "Nutrition Awareness Webinar",
    registrations: 520,
    attendees: 410,
    revenue: 205000,
    budget: 40000,
    roi: "412%",
  },
];

const EventCommunityEngagement = () => {
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

  const fetchEventCommunityEngagement = async () => {
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
        fetchEventCommunityEngagement();
      }
      return;
    }

    // For all non-custom filters
    fetchEventCommunityEngagement();
  }, [dateFilter, customFrom, customTo, clubFilter]);

  return (
    <div className="page--content">
      {/* Header */}
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">
            {`Home > Reports > Marketing Reports > Event & Community Engagement`}
          </p>
          <h1 className="text-3xl font-semibold">
            Event & Community Engagement
          </h1>
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
                  onChange={setCustomFrom}
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
                  onChange={setCustomTo}
                  placeholderText="To Date"
                  className="custom--input w-full input--icon"
                  minDate={subYears(new Date(), 20)}
                  maxDate={addYears(new Date(), 0)}
                  dateFormat="dd-MM-yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
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
                <th className="px-2 py-4">Event Name</th>
                <th className="px-2 py-4">Registrations</th>
                <th className="px-2 py-4">Attendees</th>
                <th className="px-2 py-4">Revenue</th>
                <th className="px-2 py-4">Budget</th>
                <th className="px-2 py-4">ROI</th>
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
                    <td className="px-2 py-3">{item.eventName}</td>
                    <td className="px-2 py-3">{item.registrations}</td>
                    <td className="px-2 py-3">{item.attendees}</td>
                    <td className="px-2 py-3">₹{item.revenue}</td>
                    <td className="px-2 py-3">₹{item.budget}</td>
                    <td className="px-2 py-3">{item.roi}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-4">
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

export default EventCommunityEngagement;
