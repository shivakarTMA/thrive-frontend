import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, format, subYears } from "date-fns";
import { FaCalendarDays, FaCircle } from "react-icons/fa6";
import Select from "react-select";
import {
  customStyles,
  filterActiveItems,
  formatAutoDate,
  formatDateTimeLead,
  formatText,
} from "../../../Helper/helper";
import { authAxios } from "../../../config/config";
import { toast } from "react-toastify";
import { BsSend } from "react-icons/bs";
import { Link } from "react-router-dom";
import Tooltip from "../../common/Tooltip";
import { IoEyeOutline } from "react-icons/io5";
import { LiaEdit } from "react-icons/lia";
import { useSelector } from "react-redux";
import Pagination from "../../common/Pagination";

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const formatDate = (date) => format(date, "yyyy-MM-dd");

const EmailList = () => {
  const [emailCampaignList, setEmailCampaignList] = useState([]);
  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});

  const { user } = useSelector((state) => state.auth);
  const userRole = user.role;

  const [dateFilter, setDateFilter] = useState(dateFilterOptions[1]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

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

  const fetchEmailAutomationReport = async (currentPage = page) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };

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

      const response = await authAxios().get("/emailcampaign/list", { params });
      const data = response.data?.data || [];

      setEmailCampaignList(data);
      setPage(response.data?.currentPage || 1);
      setTotalPages(response.data?.totalPage || 1);
      setTotalCount(response.data?.totalCount || data.length);
    } catch (err) {
      console.error(err);
      toast.error("data not found");
    }
  };
  useEffect(() => {
    if (dateFilter?.value === "custom") {
      if (customFrom && customTo) {
        setPage(1);
        fetchEmailAutomationReport(1);
      }
      return;
    }

    setPage(1);
    fetchEmailAutomationReport(1);
  }, [dateFilter, customFrom, customTo, clubFilter]);

  const toggleMembers = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

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
                <span className="absolute z-[1] mt-[8px] ml-[15px]">
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
                  // maxDate={addYears(new Date(), 0)}
                  dateFormat="dd-MM-yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
              </div>
              <div className="custom--date dob-format flex-1 max-w-[180px] w-full">
                <span className="absolute z-[1] mt-[8px] ml-[15px]">
                  <FaCalendarDays />
                </span>
                <DatePicker
                  selected={customTo}
                  onChange={(date) => setCustomTo(date)}
                  placeholderText="To Date"
                  className="custom--input w-full input--icon"
                  minDate={customFrom || subYears(new Date(), 20)}
                  // maxDate={addYears(new Date(), 0)}
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
              isClearable={userRole === "ADMIN" ? true : false}
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
                <th className="px-2 py-4 min-w-[150px]">Club Name</th>
                <th className="px-2 py-4 min-w-[150px]">Campaign Name</th>
                <th className="px-2 py-4 min-w-[150px]">Sent to</th>
                <th className="px-2 py-4 min-w-[150px]">Created At</th>
                <th className="px-2 py-4 min-w-[150px]">Scheduled on</th>
                <th className="px-2 py-4 min-w-[100px]">Status</th>
                <th className="px-2 py-4 min-w-[100px]">Action</th>
              </tr>
            </thead>

            <tbody>
              {emailCampaignList.length ? (
                emailCampaignList.map((item, index) => (
                  <tr
                    key={index}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <td className="px-2 py-4">
                      {item?.clubname ? item?.clubname : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {item?.name ? item?.name : "--"}
                    </td>
                    <td className="px-2 py-4">
                      <div className="max-w-[350px] w-full">
                        {item?.members?.length ? (
                          <>
                            {expandedRows[item.id]
                              ? item.members.join(", ")
                              : item.members.slice(0, 5).join(", ")}

                            {item.members.length > 5 && (
                              <button
                                onClick={() => toggleMembers(item.id)}
                                className="text-black-600 underline text-[12px] block"
                              >
                                {expandedRows[item.id]
                                  ? "View Less <<"
                                  : "View More >>"}
                              </button>
                            )}
                          </>
                        ) : (
                          "--"
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-4">
                      {item?.created_at
                        ? formatAutoDate(item?.created_at)
                        : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {item?.scheduled_at
                        ? formatDateTimeLead(item?.scheduled_at)
                        : "--"}
                    </td>
                    <td className="px-2 py-4">
                      <span
                        className={`flex items-center justify-between gap-1 rounded-full min-h-[30px] px-3 text-sm w-fit
                        ${
                          item?.status !== "SENT"
                            ? "bg-[#EEEEEE]"
                            : "bg-[#E8FFE6] text-[#138808]"
                        }
                        `}
                      >
                        <FaCircle className="text-[10px]" />{" "}
                        {formatText(item?.status)}
                      </span>
                    </td>
                    <td className="px-2 py-4">
                      <div className="flex">
                        <Tooltip
                          id={`tooltip-edit-${item?.id}`}
                          content="View Email"
                          place="left"
                        >
                          <Link
                            to={`/send-mail-list/${item?.id}`}
                            className={`bg-[#F1F1F1] border border-[#D4D4D4] rounded-l-[5px] w-[32px] h-[32px] flex items-center justify-center cursor-pointer 
                              
                            `}
                          >
                            <IoEyeOutline className="text-[19px] text-black" />
                          </Link>
                        </Tooltip>
                        <Tooltip
                          id={`tooltip-edit-${item?.id}`}
                          content="Edit Email"
                          place="left"
                        >
                          <Link
                            to={`/send-mail-list/${item?.id}`}
                            className={`bg-[#F1F1F1] border border-[#D4D4D4] rounded-r-[5px] w-[32px] h-[32px] flex items-center justify-center cursor-pointer ${
                              item?.status === "SCHEDULED"
                                ? ""
                                : "opacity-[0.5] pointer-events-none"
                            }`}
                          >
                            <LiaEdit className="text-[19px] text-black" />
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
        <Pagination
          page={page}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          currentDataLength={emailCampaignList.length}
          onPageChange={(newPage) => {
            setPage(newPage);
            fetchEmailAutomationReport(newPage);
          }}
        />
      </div>
    </div>
  );
};

export default EmailList;
