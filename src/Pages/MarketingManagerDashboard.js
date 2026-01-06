import React, { useEffect, useMemo, useState } from "react";
import SalesSummary from "../components/common/SalesSummary";
import totalSalesIcon from "../assets/images/icons/rupee-box.png";
import newClientIcon from "../assets/images/icons/clients.png";
import renewalIcon from "../assets/images/icons/renewal.png";
import enquiriesIcon from "../assets/images/icons/conversion.png";
import trialIcon from "../assets/images/icons/trial.png";
import checkInIcon from "../assets/images/icons/checkin.png";
import { FaCircle } from "react-icons/fa";
import { FaCalendarDays } from "react-icons/fa6";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { customStyles, filterActiveItems } from "../Helper/helper";
import { addYears, subYears } from "date-fns";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import SolidGaugeChart from "../components/ClubManagerChild/SolidGaugeChart";
import { authAxios } from "../config/config";
import { toast } from "react-toastify";

import {
  parse,
  isWithinInterval,
  startOfDay,
  endOfDay,
  subDays,
} from "date-fns";
import { productsSold } from "../DummyData/DummyData";
import { useNavigate } from "react-router-dom";

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const formatIndianNumber = (num) => new Intl.NumberFormat("en-IN").format(num);

const MarketingManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState("Snapshot");
  const [dateFilter, setDateFilter] = useState(dateFilterOptions[1]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  const [club, setClub] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);

  const navigate = useNavigate();

  // Function to fetch club list
  const fetchClub = async () => {
    try {
      const response = await authAxios().get("/club/list");
      const data = response.data?.data || [];
      const activeOnly = filterActiveItems(data);
      setClub(activeOnly);

      if (activeOnly.length === 1) {
        setSelectedClub(activeOnly[0].id);
      }
    } catch (error) {
      toast.error("Failed to fetch clubs");
    }
  };

  useEffect(() => {
    fetchClub();
  }, []);

  // Club dropdown options
  const clubOptions =
    club?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];

  const dataSeries = [2, 1, 0, 0, 0];
  const totalValue = dataSeries.reduce((sum, value) => sum + value, 0);

  const leadsStatus = {
    chart: {
      type: "column",
      height: 300,
    },
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
      categories: ["New", "Opportunity", "Lead", "Won", "Lost"],
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
      gridLineColor: "#e5e5e5",
      title: {
        text: null,
      },
      maxPadding: 0.1, // adds space at the top
      tickInterval: 1,
    },
    legend: {
      enabled: false,
    },
    tooltip: {
      pointFormat: "Count: <b>{point.y}</b>",
    },
    plotOptions: {
      column: {
        pointWidth: 40,
        borderRadius: 0,
        pointPadding: 0.1,
        groupPadding: 0.05,
        borderWidth: 0,
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
              // Example: open a link based on category
              const linkMap = {
                New: generateUrl(`/all-leads?lead_status=New`),
                Opportunity: generateUrl(`/all-leads?lead_status=Opportunity`),
                Lead: generateUrl(`/all-leads?lead_status=Lead`),
                Won: generateUrl(`/all-leads?lead_status=Won`),
                Lost: generateUrl(`/all-leads?lead_status=Lost`),
              };
              const targetLink = linkMap[this.category];
              if (targetLink) {
                window.location.href = targetLink; // navigate to link
              }
            },
          },
        },
      },
    },

    series: [
      {
        name: "Leads",
        data: dataSeries,
      },
    ],
    credits: {
      enabled: false,
    },
  };

  // Calculate product counts for last 7 days
  const dataProductSeries = useMemo(() => {
    if (!productsSold.length) return [0, 0, 0, 0, 0];

    // 🔑 Find latest date in data
    const parsedDates = productsSold
      .map((item) => parse(item.purchaseDate, "dd/MM/yyyy", new Date()))
      .filter((d) => !isNaN(d));

    const latestDate = new Date(Math.max(...parsedDates));

    const from = startOfDay(subDays(latestDate, 6));
    const to = endOfDay(latestDate);

    const counts = {
      Membership: 0,
      "Personal Training": 0,
      Pilates: 0,
      Recovery: 0,
      Cafe: 0,
    };

    productsSold.forEach((item) => {
      const purchaseDate = parse(item.purchaseDate, "dd/MM/yyyy", new Date());

      if (
        !isNaN(purchaseDate) &&
        isWithinInterval(purchaseDate, { start: from, end: to })
      ) {
        if (counts[item.servicesName] !== undefined) {
          counts[item.servicesName]++;
        }
      }
    });

    return [
      counts.Membership,
      counts["Personal Training"],
      counts.Pilates,
      counts.Recovery,
      counts.Cafe,
    ];
  }, [productsSold]);

  const totalProcutValue = useMemo(
    () => dataProductSeries.reduce((a, b) => a + b, 0),
    [dataProductSeries]
  );

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
      categories: [
        "Membership",
        "Personal Training",
        "Pilates",
        "Recovery",
        "Cafe",
      ],
      labels: {
        style: {
          fontSize: "13px",
          fontWeight: "700",
          fontFamily: "Roboto, sans-serif",
        },
        rotation: 0,
        formatter: function () {
          return this.value.replace(" ", "<br>");
        },
      },
    },
    yAxis: {
      min: 0,
      gridLineColor: "#e5e5e5",
      title: {
        text: null,
      },
      maxPadding: 0.1,
      tickInterval: 1,
    },
    legend: {
      enabled: false,
    },
    tooltip: {
      pointFormat: "Count: <b>{point.y}</b>",
    },
    plotOptions: {
      column: {
        pointWidth: 40,
        borderRadius: 0,
        pointPadding: 0.1,
        groupPadding: 0.05,
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
              const serviceTypeMap = {
                Membership: "Membership",
                "Personal Training": "Package",
                Pilates: "Package",
                Recovery: "Package",
                Cafe: "Product",
              };

              const serviceType = serviceTypeMap[this.category];

              // Navigate with date filter
              navigate(
                `/reports/products-sold?date=last_7_days&service_name=${encodeURIComponent(
                  this.category
                )}`
              );
            },
          },
        },
      },
    },
    series: [
      {
        name: "Product",
        data: dataProductSeries,
      },
    ],
    credits: {
      enabled: false,
    },
  };

  // Memoize the URL generation
  const generateUrl = (baseUrl) => {
    let url = `${baseUrl}&date=${encodeURIComponent(dateFilter?.value)}`;

    // If custom dates are selected, append customFrom and customTo to the URL
    if (dateFilter?.value === "custom") {
      url += `&customFrom=${encodeURIComponent(
        customFrom
      )}&customTo=${encodeURIComponent(customTo)}`;
    }

    return url;
  };

  return (
    <div className="page--content">
      <div className=" flex items-start justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > Dashboard`}</p>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
        </div>
        <div className="min-w-[180px] w-fit">
          <Select
            name="club_id"
            value={
              clubOptions.find((opt) => opt.value === selectedClub) || null
            }
            onChange={(option) => setSelectedClub(option ? option.value : null)}
            options={clubOptions}
            styles={customStyles}
            placeholder="Choose Club"
            className="w-full"
          />
        </div>
      </div>
      {/* end title */}

      <div className="w-full bg-white box--shadow rounded-[10px] px-3 py-3 flex gap-3 justify-between items-center mb-4">
        <div className="flex gap-3">
          <button
            type="button"
            className={`px-4 py-2 rounded ${
              activeTab === "Snapshot" ? "bg--color text-white" : ""
            }`}
            onClick={() => setActiveTab("Snapshot")}
          >
            Snapshot
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-5 border-r pr-3">
            <div className="text-md font-medium text-gray-600 flex gap-2 items-center">
              <FaCircle className="text-[10px] text-[#009EB2]" /> Total Members
            </div>
            <div className="flex flex-wrap items-center justify-between">
              <span className="text-md font-semibold">2315</span>
            </div>
          </div>
          <div className="flex items-center gap-5 border-r pr-3">
            <div className="text-md font-medium text-gray-600 flex gap-2 items-center">
              <FaCircle className="text-[10px] text-[#1F9254]" />
              Active Members
            </div>
            <div className="flex flex-wrap items-center justify-between">
              <span className="text-md font-semibold">590</span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-md font-medium text-gray-600 flex gap-2 items-center">
              <FaCircle className="text-[10px] text-[#FF0000]" />
              Inactive Members
            </div>
            <div className="flex flex-wrap items-center justify-between">
              <span className="text-md font-semibold">1725</span>
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
              titleLink={generateUrl(
                `/reports/sales-reports/new-joinees-report?`
              )}
              totalSales={`₹${formatIndianNumber(20900)}`}
              items={[
                {
                  label: "Memberships",
                  value: `₹${formatIndianNumber(5700)}`,
                  link: generateUrl(
                    `/reports/sales-reports/new-joinees-report?serviceType=Membership`
                  ),
                },
                {
                  label: "Packages",
                  value: `₹${formatIndianNumber(12000)}`,
                  link: generateUrl(
                    `/reports/sales-reports/new-joinees-report?serviceType=Package`
                  ),
                },
                {
                  label: "Products",
                  value: `₹${formatIndianNumber(3200)}`,
                  link: generateUrl(
                    `/reports/sales-reports/new-joinees-report?serviceType=Product`
                  ),
                },
              ]}
            />

            <SalesSummary
              icon={newClientIcon}
              title="New Clients"
              titleLink={generateUrl(
                `/reports/sales-reports/new-joinees-report?billType=New`
              )}
              totalSales="02"
              items={[
                {
                  label: "Memberships",
                  value: "01",
                  link: generateUrl(
                    `/reports/sales-reports/new-joinees-report?billType=New&serviceType=Membership`
                  ),
                },
                {
                  label: "Packages",
                  value: "00",
                  link: generateUrl(
                    `/reports/sales-reports/new-joinees-report?billType=New&serviceType=Package`
                  ),
                },
                {
                  label: "Products",
                  value: "01",
                  link: generateUrl(
                    `/reports/sales-reports/new-joinees-report?billType=New&serviceType=Product`
                  ),
                },
              ]}
            />
            <SalesSummary
              icon={renewalIcon}
              title="Renewal"
              titleLink={generateUrl(
                `/reports/sales-reports/new-joinees-report?billType=Renewal`
              )}
              totalSales="01"
              items={[
                {
                  label: "Memberships",
                  value: "00",
                  link: generateUrl(
                    `/reports/sales-reports/new-joinees-report?billType=Renewal&serviceType=Membership`
                  ),
                },
                {
                  label: "Packages",
                  value: "01",
                  link: generateUrl(
                    `/reports/sales-reports/new-joinees-report?billType=Renewal&serviceType=Package`
                  ),
                },
                {
                  label: "Products",
                  value: "00",
                  link: generateUrl(
                    `/reports/sales-reports/new-joinees-report?billType=Renewal&serviceType=Product`
                  ),
                },
              ]}
            />

            <SalesSummary
              icon={trialIcon}
              title="Trials"
              titleLink={generateUrl(`/reports/appointments/all-appointments?`)}
              totalSales="03"
              items={[
                {
                  label: "Scheduled",
                  value: "01",
                  link: generateUrl(
                    `/reports/appointments/all-appointments?status=Scheduled`
                  ),
                },
                {
                  label: "Completed",
                  value: "01",
                  link: generateUrl(
                    `/reports/appointments/all-appointments?status=Completed`
                  ),
                },
                {
                  label: "No-Show",
                  value: "01",
                  link: generateUrl(
                    `/reports/appointments/all-appointments?status=No-Show`
                  ),
                },
              ]}
            />
            <SalesSummary
              icon={checkInIcon}
              title="Check-ins"
              titleLink={generateUrl(
                `/reports/operations-reports/member-checkins-report?`
              )}
              totalSales="09"
              items={[
                {
                  label: "Unique Check-ins",
                  value: "03",
                  link: generateUrl(
                    `/reports/operations-reports/member-checkins-report?checkin-type=unique-check-in`
                  ),
                },
                {
                  label: "Unique Members",
                  value: "03",
                  link: generateUrl(
                    `/reports/operations-reports/member-checkins-report?checkin-type=unique-members`
                  ),
                },
              ]}
            />
            <SalesSummary
              icon={enquiriesIcon}
              title="Conversion"
              titleLink="/reports/sales-reports/new-joinees-report?data=memberships"
              totalSales="2%"
              items={[
                { label: "Lead To Trial", value: "13%", link: "#" },
                { label: "Trial To Membership", value: "18%", link: "#" },
              ]}
            />
          </div>
          <div className="mt-3 w-full grid grid-cols-8 gap-3">
            <div className="border border-[#D4D4D4] rounded-[5px] bg-white p-2 pb-1 w-full relative col-span-4">
              <span className="absolute top-[10px] right-[20px] z-[2] text-lg font-bold">
                {totalProcutValue}
              </span>
              <HighchartsReact
                highcharts={Highcharts}
                options={productStatus}
              />
            </div>
            <div className="border border-[#D4D4D4] rounded-[5px] bg-white p-2 pb-1 w-full relative col-span-4">
              <span className="absolute top-[10px] right-[20px] z-[2] text-lg font-bold">
                {totalValue}
              </span>
              <HighchartsReact highcharts={Highcharts} options={leadsStatus} />
            </div>
          </div>
        </div>
        <div className="w-[25%]">
          <div className="rounded-[15px] p-4 box--shadow bg-white">
            <SolidGaugeChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingManagerDashboard;
