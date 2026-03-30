import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, format, subYears } from "date-fns";
import { FaCalendarDays, FaCircle } from "react-icons/fa6";
import Select from "react-select";
import {
  capitalizeText,
  customStyles,
  filterActiveItems,
  formatAutoDate,
  formatDateTimeLead,
  formatText,
  formatTextProper,
  formatTextTitleCase,
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

const NotificationList = () => {
  const [emailCampaignList, setEmailCampaignList] = useState([]);
  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [serviceList, setServiceList] = useState([]);
  const [serviceMap, setServiceMap] = useState({});
  const [packageMap, setPackageMap] = useState({});

  const { user } = useSelector((state) => state.auth);
  const userRole = user.role;

  const [dateFilter, setDateFilter] = useState(dateFilterOptions[0]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);
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
      console.error(error);
    }
  };

  // Function to fetch service list (for service_type lookup)
  const fetchServiceList = async (clubId = null) => {
    try {
      const params = clubId ? { club_id: clubId } : {};
      const response = await authAxios().get("/service/list", { params });
      const data = filterActiveItems(response.data?.data || response.data?.data || []);
      setServiceList(data);
      const map = data.reduce((acc, item) => ({ ...acc, [String(item.id)]: item.name }), {});
      setServiceMap(map);
      return data;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  // Function to fetch package list (for service_name lookup) by service_type id
  const fetchPackageList = async (serviceId) => {
    if (!serviceId) return [];

    try {
      const response = await authAxios().get(`/package/list`, {
        params: {
          page: 1,
          limit: 200,
          service_id: serviceId,
        },
      });
      const data = filterActiveItems(response.data?.data || []);
      const map = data.reduce((acc, item) => ({ ...acc, [String(item.id)]: item.name }), {});
      setPackageMap((prev) => ({ ...prev, ...map }));
      return data;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  // Function to fetch role list

  useEffect(() => {
    fetchClub();
  }, []);

  useEffect(() => {
    fetchServiceList(clubFilter);
  }, [clubFilter]);

  useEffect(() => {
    const ids = [
      ...new Set(
        emailCampaignList
          .map((item) => item?.service_type)
          .filter((id) => id !== undefined && id !== null && id !== "")
      ),
    ];

    ids.forEach((id) => {
      const numeric = Number(id);
      if (!Number.isNaN(numeric)) fetchPackageList(numeric);
    });
  }, [emailCampaignList]);

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

      const response = await authAxios().get("/notificationcampaign/list", { params });
      const data = response.data?.data || [];

      setEmailCampaignList(data);
      setPage(response.data?.currentPage || 1);
      setTotalPages(response.data?.totalPage || 1);
      setTotalCount(response.data?.totalCount || data.length);
    } catch (err) {
      console.error(err);
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

  const getCriteriaText = (item) => {
    const elements = [];

    const isLead = item?.email_for === "LEAD";
    const validityText = item?.validity
      ? `${capitalizeText(item.validity)} ${isLead ? "" : "Members"}`
      : `All ${isLead ? "" : "Members"}`;

    elements.push(<span key="validity">{validityText}</span>);
    if (item?.age_group)
      elements.push(<span key="age_group">{formatText(item.age_group)}</span>);
    if (item?.gender)
      elements.push(<span key="gender">{formatText(item.gender)}</span>);
    if (item?.service_type) {
      const label =
        serviceMap[String(item.service_type)] || formatText(item.service_type);
      elements.push(<span key="service_type">{label}</span>);
    }
    if (item?.service_name) {
      const label =
        packageMap[String(item.service_name)] || formatText(item.service_name);
      elements.push(<span key="service_name">{label}</span>);
    }
    if (item?.lead_source)
      elements.push(<span key="lead_source">{formatText(item.lead_source)}</span>);
    
    if (item?.membership_expiry_from && item?.membership_expiry_to)
      elements.push(
        <span key="membership_expiry" className="block">
          {formatAutoDate(item.membership_expiry_from)} to {formatAutoDate(item.membership_expiry_to)}
        </span>
      );
    
    // if (item?.email_for)
    //   elements.push(
    //     <span key="email_for">{item.email_for === "LEAD" ? "Enquiries" : formatText(item.email_for)}</span>
    //   );

    if (!elements.length) return "--";

    return elements.map((element, idx) => (
      <React.Fragment key={idx}>
        {element}
        {idx < elements.length - 1 && ", "}
      </React.Fragment>
    ));
  };

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
            {`Home > Reports > Marketing Reports > Notification`}
          </p>
          <h1 className="text-3xl font-semibold">Notification</h1>
        </div>
        <div className="flex items-end gap-2">
          <Link
            to="/reports/marketing-reports/send-notification"
            className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
          >
            <BsSend /> Send Notification
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
                <th className="px-2 py-4 min-w-[200px]">Sent To (Member / Enquiries)</th>
                <th className="px-2 py-4 min-w-[170px]">Criteria</th>
                <th className="px-2 py-4 min-w-[150px]">Recipient Count</th>
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
                    <td className="px-2 py-4">{getCriteriaText(item)}</td>
                    <td className="px-2 py-4">
                     {item?.members?.length ? item.members.length : "--"}
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
                            to={`/reports/marketing-reports/send-notification/${item?.id}`}
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
                            to={`/reports/marketing-reports/send-notification/${item?.id}`}
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

export default NotificationList;
