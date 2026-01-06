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
    campaignName: "Trial Reminder – PT Session",
    smsSent: 2400,
    deliveryRate: "95.2%",
    openRate: "82%",
    clickedRate: "24%",
    bounceRate: "1.8%",
    optOutRate: "0.6%",
    sentOn: "05-12-2025",
    segment: "New",
  },
  {
    id: 2,
    campaignName: "Membership Expiry Alert",
    smsSent: 1850,
    deliveryRate: "96.5%",
    openRate: "88%",
    clickedRate: "28%",
    bounceRate: "1.2%",
    optOutRate: "0.9%",
    sentOn: "10-12-2025",
    segment: "Active",
  },
  {
    id: 3,
    campaignName: "Win-Back Offer – Inactive Members",
    smsSent: 1120,
    deliveryRate: "94.1%",
    openRate: "76%",
    clickedRate: "18%",
    bounceRate: "2.1%",
    optOutRate: "1.8%",
    sentOn: "13-12-2026",
    segment: "Inactive",
  },
  {
    id: 4,
    campaignName: "Referral Reward Notification",
    smsSent: 980,
    deliveryRate: "97.8%",
    openRate: "91%",
    clickedRate: "34%",
    bounceRate: "0.9%",
    optOutRate: "0.4%",
    sentOn: "18-12-2026",
    segment: "Active",
  },
  {
    id: 5,
    campaignName: "Corporate Wellness Announcement",
    smsSent: 640,
    deliveryRate: "98.4%",
    openRate: "93%",
    clickedRate: "36%",
    bounceRate: "0.6%",
    optOutRate: "0.3%",
    sentOn: "23-12-2026",
    segment: "Corporate",
  },
  {
    id: 6,
    campaignName: "Group Class Reminder",
    smsSent: 2760,
    deliveryRate: "96.9%",
    openRate: "89%",
    clickedRate: "31%",
    bounceRate: "1.0%",
    optOutRate: "0.7%",
    sentOn: "28-12-2026",
    segment: "Active",
  },
  {
    id: 7,
    campaignName: "Festive Offer Promotion",
    smsSent: 3450,
    deliveryRate: "93.6%",
    openRate: "74%",
    clickedRate: "16%",
    bounceRate: "2.4%",
    optOutRate: "2.2%",
    sentOn: "02-01-2027",
    segment: "All",
  },
  {
    id: 8,
    campaignName: "Payment Pending Reminder",
    smsSent: 520,
    deliveryRate: "97.1%",
    openRate: "90%",
    clickedRate: "27%",
    bounceRate: "0.8%",
    optOutRate: "0.5%",
    sentOn: "04-01-2027",
    segment: "Active",
  },
];

const SMSDeliveryReport = () => {
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

  const fetchSMSDeliveryReport = async () => {
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
        fetchSMSDeliveryReport();
      }
      return;
    }

    // For all non-custom filters
    fetchSMSDeliveryReport();
  }, [dateFilter, customFrom, customTo, clubFilter]);

  return (
    <div className="page--content">
      {/* Header */}
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">
            {`Home > Reports > Marketing Reports > SMS Delivery Report`}
          </p>
          <h1 className="text-3xl font-semibold">SMS Delivery Report</h1>
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
                <th className="px-2 py-4">Campaign</th>
                <th className="px-2 py-4">SMS Sent</th>
                <th className="px-2 py-4">Delivery Rate</th>
                <th className="px-2 py-4">Open Rate</th>
                <th className="px-2 py-4">Clicked Rate</th>
                <th className="px-2 py-4">Bounce Rate</th>
                <th className="px-2 py-4">Opt-Out Rate</th>
                <th className="px-2 py-4">Segment</th>
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
                    <td className="px-2 py-3">{item.smsSent}</td>
                    <td className="px-2 py-3">{item.deliveryRate}</td>
                    <td className="px-2 py-3">{item.openRate}</td>
                    <td className="px-2 py-3">{item.clickedRate}</td>
                    <td className="px-2 py-3">{item.bounceRate}</td>
                    <td className="px-2 py-3">{item.optOutRate}</td>
                    <td className="px-2 py-3">{item.segment}</td>
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

export default SMSDeliveryReport;
