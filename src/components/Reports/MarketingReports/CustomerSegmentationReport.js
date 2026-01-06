import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, subYears } from "date-fns";
import { FaCalendarDays } from "react-icons/fa6";
import Select from "react-select";
import {
  customStyles,
  filterActiveItems,
  formatIndianNumber,
  selectIcon,
} from "../../../Helper/helper";
import { authAxios } from "../../../config/config";
import { toast } from "react-toastify";
import { format, endOfMonth } from "date-fns";
import { LuCalendar } from "react-icons/lu";

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];


const CustomerSegmentationReport = () => {
  const [leadSource, setLeadSource] = useState([]);
  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);

  const [dateFilter, setDateFilter] = useState(dateFilterOptions[1]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  const formatMonth = (date) => format(date, "yyyy-MM");
  const [selectedMonth, setSelectedMonth] = useState(new Date());

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

  const fetchCustomerSegmentationReport = async () => {
    try {
      const params = {};

      // month filter (YYYY-MM)
      if (selectedMonth) {
        params.month = formatMonth(selectedMonth);
      }

      // club filter
      if (clubFilter) {
        params.club_id = clubFilter;
      }

      const res = await authAxios().get(
        "/marketing/report/customer/segmentation",
        { params }
      );

      setLeadSource(res.data?.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Data not found");
    }
  };

  useEffect(() => {
    fetchCustomerSegmentationReport();
  }, [selectedMonth, clubFilter]);

  return (
    <div className="page--content">
      {/* Header */}
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">
            {`Home > Reports > Marketing Reports > Customer Segmentation Report`}
          </p>
          <h1 className="text-3xl font-semibold">
            Customer Segmentation Report
          </h1>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 items-center justify-between">
        <div className="flex gap-2 w-full">
          <div className="max-w-[180px] w-full">
            <div className="custom--date">
              <span className="absolute mt-[12px] ml-[15px] z-[1]">
                <LuCalendar />
              </span>
              <DatePicker
                selected={selectedMonth}
                onChange={(date) => setSelectedMonth(date)}
                dateFormat="MM-yyyy"
                showMonthYearPicker
                maxDate={endOfMonth(new Date())} 
                className="custom--input w-full input--icon"
                placeholderText="Select Month"
                styles={selectIcon}
              />
            </div>
          </div>

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
                <th className="px-2 py-4 min-w-[120px]">Customer Segment</th>
                <th className="px-2 py-4 min-w-[170px]">Total Customers</th>
                <th className="px-2 py-4 min-w-[100px]">Revenue</th>
                <th className="px-2 py-4 min-w-[120px]">Retention Rate</th>
                <th className="px-2 py-4 min-w-[150px]">Churn Rate</th>
                <th className="px-2 py-4 min-w-[150px]">
                  Average Lifetime Value (LTV)
                </th>
              </tr>
            </thead>

            <tbody>
              {leadSource.length ? (
                leadSource.map((item, index) => (
                  <tr
                    key={index}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <td className="px-2 py-3">{index + 1}</td>
                    <td className="px-2 py-3">{item.customer_segment}</td>
                    <td className="px-2 py-3">{item.total_customers}</td>
                    <td className="px-2 py-3">₹{formatIndianNumber(item.revenue_per_segment)}</td>
                    <td className="px-2 py-3">{item.retention_rate}%</td>
                    <td className="px-2 py-3">{item.churn_rate}%</td>
                    <td className="px-2 py-3">₹{formatIndianNumber(item.average_lifetime_value)}</td>
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

export default CustomerSegmentationReport;
