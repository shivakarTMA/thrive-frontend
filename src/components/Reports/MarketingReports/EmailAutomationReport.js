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
    campaignName: "Welcome Series – New Members",
    emailsSent: 3200,
    openRate: "48%",
    ctr: "12%",
    responseRate: "6.5%",
    unsubscribeRate: "0.8%",
    bounceRate: "1.2%",
  },
  {
    id: 2,
    campaignName: "Trial Follow-up Reminder",
    emailsSent: 2150,
    openRate: "52%",
    ctr: "15%",
    responseRate: "8.1%",
    unsubscribeRate: "0.6%",
    bounceRate: "0.9%",
  },
  {
    id: 3,
    campaignName: "Membership Expiry Reminder",
    emailsSent: 1480,
    openRate: "58%",
    ctr: "18%",
    responseRate: "12.4%",
    unsubscribeRate: "0.9%",
    bounceRate: "0.7%",
  },
  {
    id: 4,
    campaignName: "Win-Back Campaign – Inactive Users",
    emailsSent: 1120,
    openRate: "41%",
    ctr: "10%",
    responseRate: "5.2%",
    unsubscribeRate: "1.6%",
    bounceRate: "1.4%",
  },
  {
    id: 5,
    campaignName: "Group Classes Weekly Newsletter",
    emailsSent: 2760,
    openRate: "36%",
    ctr: "8%",
    responseRate: "3.9%",
    unsubscribeRate: "1.1%",
    bounceRate: "1.0%",
  },
  {
    id: 6,
    campaignName: "PT Package Upsell",
    emailsSent: 980,
    openRate: "44%",
    ctr: "14%",
    responseRate: "7.6%",
    unsubscribeRate: "0.7%",
    bounceRate: "0.8%",
  },
  {
    id: 7,
    campaignName: "Corporate Wellness Update",
    emailsSent: 640,
    openRate: "61%",
    ctr: "22%",
    responseRate: "15.3%",
    unsubscribeRate: "0.4%",
    bounceRate: "0.5%",
  },
  {
    id: 8,
    campaignName: "Festive Offer Announcement",
    emailsSent: 3450,
    openRate: "39%",
    ctr: "9%",
    responseRate: "4.1%",
    unsubscribeRate: "1.9%",
    bounceRate: "1.6%",
  },
];

const EmailAutomationReport = () => {
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

  const fetchEmailAutomationReport = async () => {
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
        fetchEmailAutomationReport();
      }
      return;
    }

    // For all non-custom filters
    fetchEmailAutomationReport();
  }, [dateFilter, customFrom, customTo, clubFilter]);

  return (
    <div className="page--content">
      {/* Header */}
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">
            {`Home > Reports > Marketing Reports > Email Delivery Report`}
          </p>
          <h1 className="text-3xl font-semibold">Email Delivery Report</h1>
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
                <th className="px-2 py-4">Campaign Name</th>
                <th className="px-2 py-4">Emails Sent</th>
                <th className="px-2 py-4">Open Rate</th>
                <th className="px-2 py-4">CTR</th>
                <th className="px-2 py-4">Response Rate</th>
                <th className="px-2 py-4">Unsubscribe Rate</th>
                <th className="px-2 py-4">Bounce Rate</th>
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
                    <td className="px-2 py-3">{item.campaignName}</td>
                    <td className="px-2 py-3">{item.emailsSent}</td>
                    <td className="px-2 py-3">{item.openRate}</td>
                    <td className="px-2 py-3">{item.ctr}</td>
                    <td className="px-2 py-3">{item.responseRate}</td>
                    <td className="px-2 py-3">{item.unsubscribeRate}</td>
                    <td className="px-2 py-3">{item.bounceRate}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-4">
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

export default EmailAutomationReport;
