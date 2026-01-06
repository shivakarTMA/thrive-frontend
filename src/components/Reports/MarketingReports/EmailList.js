import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, subYears } from "date-fns";
import { FaCalendarDays } from "react-icons/fa6";
import Select from "react-select";
import { customStyles, filterActiveItems } from "../../../Helper/helper";
import { authAxios } from "../../../config/config";
import { toast } from "react-toastify";
import { BsSend } from "react-icons/bs";
import { Link } from "react-router-dom";
import Tooltip from "../../common/Tooltip";
import { IoEyeOutline } from "react-icons/io5";
import { LiaEdit } from "react-icons/lia";

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
    emailsSent: "Ravi Sharma, Ankit Shukla, Gaurav Kapoor, Manoj........",
    scheduled_on: "01/01/2026 12:30 pm",
    status: "Sent",
  },
  {
    id: 2,
    campaignName: "Trial Follow-up Reminder",
    emailsSent: "Summit Palza, Active Members, Male, 31-40",
    scheduled_on: "06/01/2026 12:30 pm",
    status: "Scheduled",
  },
  {
    id: 3,
    campaignName: "Membership Expiry Reminder",
    emailsSent: "Summit Palza, Active Members, Male, 31-40, Pilates",
    scheduled_on: "09/01/2026 12:30 pm",
    status: "Scheduled",
  },
];

const EmailList = () => {
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
            {`Home > Reports > Marketing Reports > Email`}
          </p>
          <h1 className="text-3xl font-semibold">Email</h1>
        </div>
        <div className="flex items-end gap-2">
          <Link
            to="/send-mail-list"
            className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
          >
            <BsSend /> Send Email
          </Link>
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
                <th className="px-2 py-4">Sent to</th>
                <th className="px-2 py-4">Scheduled on</th>
                <th className="px-2 py-4">Status</th>
                <th className="px-2 py-4">Action</th>
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
                    <td className="px-2 py-3">{item.scheduled_on}</td>
                    <td className="px-2 py-3">{item.status}</td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-1">
                        <Tooltip
                          id={`tooltip-edit-${item.id}`}
                          content="View Email"
                          place="left"
                        >
                          <Link
                            to={`/send-mail-list/${item.id}`}
                            className={`p-1 cursor-pointer ${
                              item?.status === "ONGOING" ||
                              item?.status === "COMPLETED"
                                ? ""
                                : "opacity-[0.5] pointer-events-none"
                            }`}
                          >
                            <IoEyeOutline className="text-[25px] text-black" />
                          </Link>
                        </Tooltip>

                        <Tooltip
                          id={`tooltip-edit-${item.id}`}
                          content="Edit Email"
                          place="left"
                        >
                          <Link
                            to={`/send-mail-list/${item.id}`}
                            className={`p-1 cursor-pointer ${
                              item?.status === "Scheduled"
                                ? ""
                                : "opacity-[0.5] pointer-events-none"
                            }`}
                          >
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

export default EmailList;
