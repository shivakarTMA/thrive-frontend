import React, { useCallback, useEffect, useState } from "react";
import SalesSummary from "../components/common/SalesSummary";
import totalSalesIcon from "../assets/images/icons/rupee-box.png";
import newClientIcon from "../assets/images/icons/clients.png";
import renewalIcon from "../assets/images/icons/renewal.png";
import enquiriesIcon from "../assets/images/icons/conversion.png";
import trialIcon from "../assets/images/icons/trial.png";
import checkInIcon from "../assets/images/icons/checkin.png";
import eyeIcon from "../assets/images/icons/eye.svg";
import PendingOrderTable from "../components/PendingOrderTable";
import { FaCircle } from "react-icons/fa";
import { FaCalendarDays } from "react-icons/fa6";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  customStyles,
  filterActiveItems,
  formatIndianNumber,
} from "../Helper/helper";
import { addYears, format, subYears } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import { CiLocationOn } from "react-icons/ci";
import SummaryDashboard from "../components/common/SummaryDashboard";
import { LiaAngleLeftSolid, LiaAngleRightSolid } from "react-icons/lia";
import SolidGaugeChart from "../components/ClubManagerChild/SolidGaugeChart";
import { authAxios } from "../config/config";
import { toast } from "react-toastify";

const summaryData = {
  Yesterday: {
    FollowUps: "10/50",
    Appointments: "0/0",
    Classes: "4/5",
    MembershipExpiry: 12,
    ServiceExpiry: 3,

    ClientBirthdays: 1,
    ClientAnniversaries: 0,
  },
  Today: {
    FollowUps: "17/50",
    Appointments: "0/0",
    Classes: "5/5",
    MembershipExpiry: 11,
    ServiceExpiry: 2,

    ClientBirthdays: 3,
    ClientAnniversaries: 0,
  },
  Tomorrow: {
    FollowUps: "8/50",
    Appointments: "1/2",
    Classes: "2/5",
    MembershipExpiry: 10,
    ServiceExpiry: 1,

    ClientBirthdays: 0,
    ClientAnniversaries: 1,
  },
};

const routeMap = {
  FollowUps: "/my-follow-ups",
  Appointments: "",
  Classes: "",
  MembershipExpiry: "",
  ServiceExpiry: "",
  ClientBirthdays: "",
  ClientAnniversaries: "",
};

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const classPerformance = [
  {
    id: 1,
    classType: "Group Classes",
    bookings: 4,
    reservations: 95,
    cancellations: 3,
    url: "/group-class",
  },
  {
    id: 2,
    classType: "Sessions",
    bookings: 10,
    reservations: 10,
    cancellations: 0,
    url: "/reports/all-bookings",
  },
];

const ClubManagerDashboard = () => {
  const navigate = useNavigate();
  const days = ["Yesterday", "Today", "Tomorrow"];
  const [dashboardData, setDashboardData] = useState([]);
  const [currentDayIndex, setCurrentDayIndex] = useState(1); // Default to Today
  const [activeTab, setActiveTab] = useState("Snapshot");
  const [dateFilter, setDateFilter] = useState(dateFilterOptions[1]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);
  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);

  // Product Sold
  const [productSeries, setProductSeries] = useState([]);
  const [productCategories, setProductCategories] = useState([]);
  const [totalProductValue, setTotalProductValue] = useState(0);

  // Enquiry
  const [leadCategories, setLeadCategories] = useState([]);
  const [leadSeries, setLeadSeries] = useState([]);
  const [totalLeads, setTotalLeads] = useState(0);

  const [orders, setOrders] = useState([
    {
      id: "ORD001",
      member: "John Doe",
      items: "Latte & Salad",
      placedOn: "2025-04-28",
      isDone: false,
    },
    {
      id: "ORD002",
      member: "Jane Smith",
      items: "Black Coffice",
      placedOn: "2025-04-27",
      isDone: false,
    },
    {
      id: "ORD003",
      member: "Jane Smith",
      items: "Espresso",
      placedOn: "2025-04-27",
      isDone: false,
    },
    {
      id: "ORD004",
      member: "Jane Smith",
      items: "Americano",
      placedOn: "2025-04-27",
      isDone: false,
    },
    {
      id: "ORD005",
      member: "Jane Smith",
      items: "Broccoli Soup",
      placedOn: "2025-04-27",
      isDone: false,
    },
  ]);

  const fetchDashboardData = async () => {
    try {
      const params = {};
      // Date filter (non-custom)
      if (dateFilter?.value && dateFilter.value !== "custom") {
        params.dateFilter = dateFilter.value;
      }

      // Custom date filter
      if (dateFilter?.value === "custom" && customFrom && customTo) {
        params.startDate = format(customFrom, "yyyy-MM-dd");
        params.endDate = format(customTo, "yyyy-MM-dd");
      }

      // Club filter
      if (clubFilter?.value) {
        params.club_id = clubFilter.value;
      }

      const res = await authAxios().get("/dashboard/overview", { params });
      let data = res.data?.data || res.data || [];

      setDashboardData(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch companies");
    }
  };

  const fetchProductStatus = async () => {
    try {
      const params = {};

      // Date filter
      if (dateFilter?.value && dateFilter.value !== "custom") {
        params.dateFilter = dateFilter.value;
      }

      // Custom date filter
      if (dateFilter?.value === "custom" && customFrom && customTo) {
        params.startDate = format(customFrom, "yyyy-MM-dd");
        params.endDate = format(customTo, "yyyy-MM-dd");
      }

      // Club filter
      if (clubFilter?.value) {
        params.club_id = clubFilter.value;
      }

      const res = await authAxios().get("/dashboard/service/count", { params });

      const apiData = res.data?.data || {};
      const services = apiData.service_wise_count || [];

      setTotalProductValue(apiData.total_count || 0);

      // 🟢 Fully dynamic
      const categories = services.map((item) => item.service_name);
      const seriesData = services.map((item) => item.count);

      setProductCategories(categories);
      setProductSeries(seriesData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch product status");
    }
  };

  const fetchLeadStatus = async () => {
    try {
      const params = {};

      // Date filter
      if (dateFilter?.value && dateFilter.value !== "custom") {
        params.dateFilter = dateFilter.value;
      }

      // Custom date filter
      if (dateFilter?.value === "custom" && customFrom && customTo) {
        params.startDate = format(customFrom, "yyyy-MM-dd");
        params.endDate = format(customTo, "yyyy-MM-dd");
      }

      // Club filter
      if (clubFilter?.value) {
        params.club_id = clubFilter.value;
      }

      const res = await authAxios().get("/dashboard/enquiry/count", { params });

      const apiData = res.data?.data || {};
      const statuses = apiData.lead_status_count || [];

      setTotalLeads(apiData.total_count || 0);

      // Optional: Friendly names (capitalize first letter)
      const categories = statuses.map((item) =>
        item.lead_status
          .split(" ")
          .map((w) => w[0].toUpperCase() + w.slice(1))
          .join(" "),
      );
      const seriesData = statuses.map((item) => item.count);

      setLeadCategories(categories);
      setLeadSeries(seriesData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch enquiry status");
    }
  };

  // Function to fetch club list
  const fetchClub = async () => {
    try {
      const response = await authAxios().get("/club/list");
      const data = response.data?.data || [];
      const activeOnly = filterActiveItems(data);
      setClubList(activeOnly);

      if (activeOnly.length > 0) {
        setClubFilter({
          label: activeOnly[0].name,
          value: activeOnly[0].id,
        });
      }
    } catch (error) {
      toast.error("Failed to fetch clubs");
    }
  };
  // Function to fetch role list

  useEffect(() => {
    fetchDashboardData();
  }, [dateFilter, customFrom, customTo, clubFilter]);

  useEffect(() => {
    fetchClub();
  }, []);

  useEffect(() => {
    if (dateFilter?.value !== "custom" || (customFrom && customTo)) {
      fetchDashboardData();
    }
  }, [dateFilter, customFrom, customTo, clubFilter]);

  useEffect(() => {
    if (dateFilter?.value !== "custom" || (customFrom && customTo)) {
      fetchProductStatus();
    }
  }, [dateFilter, customFrom, customTo, clubFilter]);

  useEffect(() => {
    if (dateFilter?.value !== "custom" || (customFrom && customTo)) {
      fetchLeadStatus();
    }
  }, [dateFilter, customFrom, customTo, clubFilter]);

  const clubOptions = clubList.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  // Enquiry line chart
  const maxValueLeads = Math.max(...leadSeries, 0);

  const leadsStatus = {
    chart: { type: "column", height: 300 },
    title: {
      text: "Enquiries",
      align: "left",
      style: {
        fontSize: "1.125rem",
        fontWeight: "700",
        fontFamily: "Roboto, sans-serif",
        color: "#000",
      },
    },
    xAxis: {
      categories: leadCategories,
      labels: {
        style: {
          fontSize: "13px",
          fontWeight: "700",
          fontFamily: "Roboto, sans-serif",
        },
      },
    },
    yAxis: {
      min: 0,
      tickInterval: Math.max(1, Math.ceil(maxValueLeads / 5)),
      title: { text: null },
    },
    legend: { enabled: false },
    tooltip: {
      useHTML: true, // ✅ allows HTML tags like <b>
      formatter: function () {
        const label = this.point.category; // dynamic label
        const value = this.y; // count

        return `<b>${label}</b><br/>Count: <b>${value}</b>`;
      },
    },
    plotOptions: {
      column: {
        pointWidth: 40,
        borderWidth: 0,
        pointPadding: 0.1,
        groupPadding: 0.05,
        width: 50,
        color: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, "#009EB2"],
            [1, "#EC71BC"],
          ],
        },
      },
      series: {
        cursor: "pointer",
        point: {
          events: {
            click: function () {
              const category = this.category;

              let target;

              if (category.toLowerCase() === "won") {
                // 👑 Special case for Won
                target = generateUrl(
                  "/reports/sales-reports/membership-sales-report",
                );
              } else {
                // 🔁 Default for all other statuses
                target = generateUrl(
                  `/reports/sales-reports/all-enquiries-report?lead_status=${category}`,
                );
              }
              window.location.href = target;
            },
          },
        },
      },
    },
    series: [{ name: "Leads", data: leadSeries }],
    credits: { enabled: false },
  };

  // Product Sold Chart
  const maxValue = Math.max(...productSeries, 0);

  const productStatus = {
    chart: {
      type: "column",
      height: 300,
    },
    title: {
      text: "Product Sold",
      align: "left",
      style: {
        fontSize: "1.125rem",
        fontWeight: "700",
        fontFamily: "Roboto, sans-serif",
        color: "#000",
      },
    },
    xAxis: {
      categories: productCategories,
      labels: {
        style: {
          fontSize: "13px",
          fontWeight: "700",
          fontFamily: "Roboto, sans-serif",
        },
        formatter: function () {
          if (this.value === "SUBSCRIPTION") return "Membership";
          if (this.value === "PRODUCT") return "Nourish";
          return this.value; // everything else stays dynamic
        },
      },
    },
    yAxis: {
      min: 0,
      tickInterval: Math.max(1, Math.ceil(maxValue / 5)),
      title: { text: null },
    },
    legend: { enabled: false },
    tooltip: {
      formatter: function () {
        let label = this.point.category;

        console.log(label, "map label");

        if (label === "SUBSCRIPTION") label = "Membership";
        if (label === "PRODUCT") label = "Nourish";

        return `<b>${label}</b><br/>Count: <b>${this.y}</b>`;
      },
    },

    plotOptions: {
      column: {
        pointWidth: 40,
        borderWidth: 0,
        color: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, "#009EB2"],
            [1, "#EC71BC"],
          ],
        },
      },
      series: {
        cursor: "pointer",
        point: {
          events: {
            click: function () {
              const value = this.category;
              const isPackageType =
                value === "SUBSCRIPTION" || value === "PRODUCT";

              const paramKey = isPackageType ? "package_type" : "service_type";
              const target = generateUrl(
                `/reports/all-orders?${paramKey}=${value}`,
              );
              window.location.href = target;
            },
          },
        },
      },
    },
    series: [
      {
        name: "Service",
        data: productSeries,
      },
    ],
    credits: { enabled: false },
  };

  // End Product Sold Chart

  // Handler to move to previous day
  const handlePrevious = () => {
    if (currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1);
    }
  };

  // Handler to move to next day
  const handleNext = () => {
    if (currentDayIndex < days.length - 1) {
      setCurrentDayIndex(currentDayIndex + 1);
    }
  };

  const currentDay = days[currentDayIndex];
  const currentData = summaryData[currentDay];

  // Memoize the URL generation
  // const generateUrl = (baseUrl) => {
  //   let url = `${baseUrl}&date=${encodeURIComponent(dateFilter?.value)}`;

  //   // If custom dates are selected, append customFrom and customTo to the URL
  //   if (dateFilter?.value === "custom") {
  //     url += `&customFrom=${encodeURIComponent(
  //       customFrom
  //     )}&customTo=${encodeURIComponent(customTo)}`;
  //   }

  //   return url;
  // };

  const generateUrl = useCallback(
    (baseUrl) => {
      const params = new URLSearchParams();

      // Club filter
      if (clubFilter?.value) {
        params.append("club_id", clubFilter.value);
      }

      // Date filter (non-custom)
      if (dateFilter?.value && dateFilter.value !== "custom") {
        params.append("dateFilter", dateFilter.value);
      }

      // Custom date filter
      if (dateFilter?.value === "custom" && customFrom && customTo) {
        params.append("startDate", format(customFrom, "yyyy-MM-dd"));
        params.append("endDate", format(customTo, "yyyy-MM-dd"));
      }

      const separator = baseUrl.includes("?") ? "&" : "?";

      return params.toString()
        ? `${baseUrl}${separator}${params.toString()}`
        : baseUrl;
    },
    [clubFilter, dateFilter, customFrom, customTo],
  );

  return (
    <div className="page--content">
      <div className=" flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > Dashboard`}</p>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
        </div>
        <div className="flex gap-3 items-center justify-between">
          <div className="w-fit min-w-[180px]">
            <Select
              placeholder="Filter by club"
              value={clubFilter}
              options={clubOptions}
              onChange={(option) => setClubFilter(option)}
              // isClearable
              styles={customStyles}
            />
          </div>
        </div>
      </div>

      {/* end title */}

      <div className="w-full bg-white box--shadow rounded-[10px] px-3 py-3 flex gap-3 justify-between items-center mb-4">
        <div className="flex gap-3">
          <div
            // type="button"
            className={`px-4 py-2 rounded ${
              activeTab === "Snapshot" ? "bg--color text-white" : ""
            }`}
            onClick={() => setActiveTab("Snapshot")}
          >
            Snapshot
          </div>
          {/* <button
            type="button"
            className={`px-4 py-2 rounded ${
              activeTab === "Leaderboard" ? "bg--color text-white" : ""
            }`}
            onClick={() => setActiveTab("Leaderboard")}
          >
            Leaderboard
          </button> */}
        </div>
        <div className="flex items-center">
          <div className="w-fit flex items-center gap-2 border-r">
            <div className="text-md font-medium text-gray-600 flex gap-2 items-center">
              <FaCircle className="text-[10px] text-[#009EB2]" /> Total Members
            </div>
            <div className="pr-2">
              <span className="text-md font-semibold">
                {dashboardData?.snapshot?.total_members}
              </span>
            </div>
          </div>
          <div className="w-fit flex items-center gap-2 border-r pl-2">
            <div className="text-md font-medium text-gray-600 flex gap-2 items-center">
              <FaCircle className="text-[10px] text-[#1F9254]" />
              Active Members
            </div>
            <div className="pr-2">
              <span className="text-md font-semibold">
                {dashboardData?.snapshot?.active_members}
              </span>
            </div>
          </div>
          <div className="w-fit flex items-center gap-2 border-r pl-2">
            <div className="text-md font-medium text-gray-600 flex gap-2 items-center">
              <FaCircle className="text-[10px] text-[#ff9900]" />
              Inactive Members
            </div>
            <div className="pr-2">
              <span className="text-md font-semibold">
                {dashboardData?.snapshot?.inactive_members}
              </span>
            </div>
          </div>
          <div className="w-fit flex items-center gap-2 pl-2">
            <div className="text-md font-medium text-gray-600 flex gap-2 items-center">
              <FaCircle className="text-[10px] text-[#FF0000]" />
              Expired Members
            </div>
            <div>
              <span className="text-md font-semibold">
                {dashboardData?.snapshot?.expired_members}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="rounded-[15px] p-4 box--shadow bg-white w-[75%]">
          <div className="flex gap-2 w-full mb-4">
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
                // isClearable
                styles={customStyles}
                className="w-full"
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
          </div>

          <div className="grid grid-cols-3 gap-3">
            <SalesSummary
              icon={totalSalesIcon}
              title="Total Sales"
              titleLink={generateUrl(`/reports/all-orders?`)}
              totalSales={`₹${formatIndianNumber(
                dashboardData?.summary_cards?.total_sales?.amount,
              )}`}
              items={[
                {
                  label: "Memberships",
                  value: `₹${formatIndianNumber(
                    dashboardData?.summary_cards?.total_sales?.breakup
                      ?.memberships,
                  )}`,
                  link: generateUrl(
                    `/reports/all-orders?package_type=SUBSCRIPTION`,
                  ),
                },
                {
                  label: "Packages",
                  value: `₹${formatIndianNumber(
                    dashboardData?.summary_cards?.total_sales?.breakup
                      ?.packages,
                  )}`,
                  link: generateUrl(`/reports/all-orders?package_type=PACKAGE`),
                },
                {
                  label: "Nourish",
                  value: `₹${formatIndianNumber(
                    dashboardData?.summary_cards?.total_sales?.breakup
                      ?.products,
                  )}`,
                  link: generateUrl(`/reports/all-orders?package_type=PRODUCT`),
                },
              ]}
            />

            <SalesSummary
              icon={newClientIcon}
              title="New Sales"
              titleLink={generateUrl(`/reports/all-orders?bill_type=NEW`)}
              totalSales={dashboardData?.summary_cards?.new_clients?.total}
              items={[
                {
                  label: "Memberships",
                  value:
                    dashboardData?.summary_cards?.new_clients?.breakup
                      ?.memberships,
                  link: generateUrl(
                    `/reports/all-orders?bill_type=NEW&package_type=SUBSCRIPTION`,
                  ),
                },
                {
                  label: "Packages",
                  value:
                    dashboardData?.summary_cards?.new_clients?.breakup
                      ?.packages,
                  link: generateUrl(
                    `/reports/all-orders?bill_type=NEW&package_type=PACKAGE`,
                  ),
                },
                {
                  label: "Nourish",
                  value:
                    dashboardData?.summary_cards?.new_clients?.breakup
                      ?.products,
                  link: generateUrl(
                    `/reports/all-orders?bill_type=NEW&package_type=PRODUCT`,
                  ),
                },
              ]}
            />
            <SalesSummary
              icon={renewalIcon}
              title="Renewal"
              titleLink={generateUrl(`/reports/all-orders?bill_type=RENEWAL`)}
              totalSales={dashboardData?.summary_cards?.renewals?.total}
              items={[
                {
                  label: "Memberships",
                  value:
                    dashboardData?.summary_cards?.renewals?.breakup
                      ?.memberships,
                  link: generateUrl(
                    `/reports/all-orders?bill_type=RENEWAL&package_type=SUBSCRIPTION`,
                  ),
                },
                {
                  label: "Packages",
                  value:
                    dashboardData?.summary_cards?.renewals?.breakup?.packages,
                  link: generateUrl(
                    `/reports/all-orders?bill_type=RENEWAL&package_type=PACKAGE`,
                  ),
                },
                {
                  label: "Nourish",
                  value:
                    dashboardData?.summary_cards?.renewals?.breakup?.products,
                  link: generateUrl(
                    `/reports/all-orders?bill_type=RENEWAL&package_type=PRODUCT`,
                  ),
                },
              ]}
            />

            <SalesSummary
              icon={trialIcon}
              title="Trials"
              titleLink={generateUrl(
                `/reports/appointments/all-trial-appointments?`,
              )}
              totalSales={dashboardData?.summary_cards?.trials?.total}
              items={[
                {
                  label: "Scheduled",
                  value: dashboardData?.summary_cards?.trials?.scheduled,
                  link: generateUrl(
                    `/reports/appointments/all-trial-appointments?`,
                  ),
                },
                {
                  label: "Completed",
                  value: dashboardData?.summary_cards?.trials?.completed,
                  link: generateUrl(
                    `/reports/appointments/all-trial-appointments?booking_status=COMPLETED`,
                  ),
                },
                {
                  label: "No-Show",
                  value: dashboardData?.summary_cards?.trials?.no_show,
                  link: generateUrl(
                    `/reports/appointments/all-trial-appointments?booking_status=NO_SHOW`,
                  ),
                },
              ]}
            />
            <SalesSummary
              icon={enquiriesIcon}
              title="Conversion"
              titleLink={generateUrl(
                `/reports/sales-reports/membership-sales-report`,
              )}
              totalSales={`${dashboardData?.summary_cards?.conversion?.overall_percentage}%`}
              items={[
                {
                  label: "Lead To Trial",
                  value: `${dashboardData?.summary_cards?.conversion?.lead_to_trial_percentage}%`,
                  link: generateUrl(
                    `/reports/appointments/all-trial-appointments`,
                  ),
                },
                {
                  label: "Trial To Membership",
                  value: `${dashboardData?.summary_cards?.conversion?.trial_to_membership_percentage}%`,
                  link: generateUrl(
                    `/reports/sales-reports/membership-sales-report?trial_type=TRIAL`,
                  ),
                },
              ]}
            />
            <SalesSummary
              icon={checkInIcon}
              title="Check-ins"
              titleLink={generateUrl(
                `/reports/operations-reports/member-checkins-report?`,
              )}
              totalSales={dashboardData?.summary_cards?.check_ins?.total}
              items={[
                {
                  label: "Unique Check-ins",
                  value:
                    dashboardData?.summary_cards?.check_ins?.unique_check_ins,
                  link: generateUrl(
                    `/reports/operations-reports/member-checkins-report?checkin-type=unique-check-in`,
                  ),
                },
                {
                  label: "Unique Members",
                  value:
                    dashboardData?.summary_cards?.check_ins?.unique_members,
                  link: generateUrl(
                    `/reports/operations-reports/member-checkins-report?checkin-type=unique-members`,
                  ),
                },
              ]}
            />
          </div>
          <div className="mt-3 w-full grid grid-cols-8 gap-3">
            <div className="border border-[#D4D4D4] rounded-[5px] bg-white p-2 pb-1 w-full relative col-span-4">
              <span className="absolute top-[10px] right-[20px] z-[2] text-lg font-bold">
                {totalProductValue}
              </span>
              <HighchartsReact
                highcharts={Highcharts}
                options={productStatus}
              />
            </div>
            <div className="border border-[#D4D4D4] rounded-[5px] bg-white p-2 pb-1 w-full relative col-span-4">
              <span className="absolute top-[10px] right-[20px] z-[2] text-lg font-bold">
                {totalLeads}
              </span>
              <HighchartsReact highcharts={Highcharts} options={leadsStatus} />
            </div>
          </div>

          <div className="border border-[#D4D4D4] rounded-[5px] bg-white p-2 pb-1 w-full relative mt-3">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Class Performances Overview</h2>
            </div>
            <div className="relative overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-[#F1F1F1]">
                  <tr>
                    <th className="p-2">Class Type</th>
                    <th className="p-2">Scheduled</th>
                    <th className="p-2">Bookings</th>
                    <th className="p-2">Cancellations</th>
                    {/* <th className="p-2">Action</th> */}
                  </tr>
                </thead>
                <tbody>
                  {classPerformance.map((item, index) => (
                    <tr key={item.id} className="border-t">
                      <td className="p-2">{item.classType}</td>
                      <td className="p-2">
                        {String(item.bookings).padStart(2, "0")}
                      </td>
                      <td className="p-2">
                        {String(item.reservations).padStart(2, "0")}
                      </td>
                      <td className="p-2">
                        {String(item.cancellations).padStart(2, "0")}
                      </td>
                      {/* <td className="p-2">
                        <Link
                          to={generateUrl(item.url)}
                          className="bg-[#F1F1F1] border border-[#D4D4D4] rounded-[5px] w-[32px] h-[32px] flex items-center justify-center cursor-pointer"
                        >
                          <img src={eyeIcon} />
                        </Link>
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="w-[25%]">
          <div className="rounded-[15px] p-4 box--shadow bg-white">
            <div>
              <p className="text-lg font-[600] mb-3 text-center">Summary </p>
              {/* <div className="flex justify-between gap-3 items-center rounded-full bg-[#F1F1F1] px-3 py-2">
                <button
                  onClick={handlePrevious}
                  disabled={currentDayIndex === 0}
                  className={`${
                    currentDayIndex === 0 ? "opacity-0 invisible" : ""
                  }`}
                >
                  <LiaAngleLeftSolid />
                </button>
                <span>{currentDay}</span>
                <button
                  onClick={handleNext}
                  disabled={currentDayIndex === days.length - 1}
                  className={`${
                    currentDayIndex === days.length - 1
                      ? "opacity-0 invisible"
                      : ""
                  }`}
                >
                  <LiaAngleRightSolid />
                </button>
              </div> */}
              <SummaryDashboard data={currentData} routeMap={routeMap} />
            </div>
          </div>
          <div className="rounded-[15px] p-4 box--shadow bg-white mt-4">
            <SolidGaugeChart />
          </div>
        </div>
      </div>

      {/* <div className="rounded-[15px] p-4 w-full mt-2 box--shadow bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">Pending Orders</h2>
          <a href="#" className="text-[#009EB2] underline text-sm">
            View All
          </a>
        </div>
        <PendingOrderTable setOrders={setOrders} orders={orders} />
      </div> */}
    </div>
  );
};

export default ClubManagerDashboard;
