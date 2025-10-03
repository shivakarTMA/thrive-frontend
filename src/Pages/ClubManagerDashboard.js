import React, { useState } from "react";
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
import { customStyles } from "../Helper/helper";
import { addYears, subYears } from "date-fns";
import { useNavigate } from "react-router-dom";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import { CiLocationOn } from "react-icons/ci";
import SummaryDashboard from "../components/common/SummaryDashboard";
import { LiaAngleLeftSolid, LiaAngleRightSolid } from "react-icons/lia";
import SolidGaugeChart from "../components/ClubManagerChild/SolidGaugeChart";

const summaryData = {
  Yesterday: {
    FollowUps: "10/50",
    Appointments: "0/0",
    Classes: "4/5",
    ServiceExpiry: 12,
    PTExpiry: 3,
    Upgrades: 2,
    ClientBirthdays: 1,
    ClientAnniversaries: 0,
    StaffBirthdays: 0,
    StaffAnniversaries: 0,
  },
  Today: {
    FollowUps: "17/50",
    Appointments: "0/0",
    Classes: "5/5",
    ServiceExpiry: 11,
    PTExpiry: 2,
    Upgrades: 5,
    ClientBirthdays: 3,
    ClientAnniversaries: 0,
    StaffBirthdays: 0,
    StaffAnniversaries: 0,
  },
  Tomorrow: {
    FollowUps: "8/50",
    Appointments: "1/2",
    Classes: "2/5",
    ServiceExpiry: 10,
    PTExpiry: 1,
    Upgrades: 0,
    ClientBirthdays: 0,
    ClientAnniversaries: 1,
    StaffBirthdays: 0,
    StaffAnniversaries: 0,
  },
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
  },
  {
    id: 2,
    classType: "Pilates",
    bookings: 10,
    reservations: 10,
    cancellations: 0,
  },
  {
    id: 3,
    classType: "Recovery",
    bookings: 5,
    reservations: 5,
    cancellations: 1,
  },
  {
    id: 4,
    classType: "Personal Training",
    bookings: 8,
    reservations: 8,
    cancellations: 2,
  },
];

const formatIndianNumber = (num) => new Intl.NumberFormat("en-IN").format(num);

const ClubManagerDashboard = () => {
  const navigate = useNavigate();
  const days = ["Yesterday", "Today", "Tomorrow"];
  const [currentDayIndex, setCurrentDayIndex] = useState(1); // Default to Today
  const [activeTab, setActiveTab] = useState("Snapshot");
  const [dateFilter, setDateFilter] = useState(dateFilterOptions[1]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);
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

  const dataProductSeries = [5, 3, 4, 7, 2];
  const totalProcutValue = dataProductSeries.reduce(
    (sum, value) => sum + value,
    0
  );

  const dataSeries = [5, 2, 3, 1];
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
      categories: ["New", "Lead", "Won", "Lost"],
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
                New: "/all-leads?month=jan",
                Lead: "/all-leads?month=feb",
                Won: "/all-leads?month=mar",
                Lost: "/all-leads?month=apr",
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
        rotation: 0, // Prevent rotation even if text is long
        formatter: function () {
          // Just add <br> for line break (manual)
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
                Membership: "/all-leads?month=jan",
                "Personal Training": "/all-leads?month=feb",
                Pilates: "/all-leads?month=mar",
                Recovery: "/all-leads?month=apr",
                Cafe: "/all-leads?month=may",
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
        name: "Product",
        data: dataProductSeries,
      },
    ],
    credits: {
      enabled: false,
    },
  };

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

  return (
    <div className="page--content">
      <div className=" flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > Dashboard`}</p>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
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
          <button
            type="button"
            className={`px-4 py-2 rounded ${
              activeTab === "Leaderboard" ? "bg--color text-white" : ""
            }`}
            onClick={() => setActiveTab("Leaderboard")}
          >
            Leaderboard
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
                <div className="custom--date flex-1 max-w-[180px] w-full">
                  <span className="absolute z-[1] mt-[15px] ml-[15px]">
                    <FaCalendarDays />
                  </span>
                  <DatePicker
                    selected={customFrom}
                    onChange={(date) => setCustomFrom(date)}
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
                <div className="custom--date flex-1 max-w-[180px] w-full">
                  <span className="absolute z-[1] mt-[15px] ml-[15px]">
                    <FaCalendarDays />
                  </span>
                  <DatePicker
                    selected={customTo}
                    onChange={(date) => setCustomTo(date)}
                    placeholderText="To Date"
                    className="custom--input w-full input--icon"
                    minDate={subYears(new Date(), 20)}
                    maxDate={addYears(new Date(), 0)}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    dateFormat="dd-MM-yyyy"
                  />
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <SalesSummary
              icon={totalSalesIcon}
              title="Total Sales"
              titleLink={`/sales-report?date=${dateFilter?.value}`}
              totalSales={`₹${formatIndianNumber(24000000)}`}
              items={[
                {
                  label: "Memberships",
                  value: `₹${formatIndianNumber(20000000)}`,
                  link: `/sales-report?date=${encodeURIComponent(
                    dateFilter?.value
                  )}&serviceType=Membership`,
                },
                {
                  label: "Packages",
                  value: `₹${formatIndianNumber(2000000)}`,
                  link: `/sales-report?date=${encodeURIComponent(
                    dateFilter?.value
                  )}&serviceType=Package`,
                },
                {
                  label: "Products",
                  value: `₹${formatIndianNumber(2000000)}`,
                  link: `/sales-report?date=${encodeURIComponent(
                    dateFilter?.value
                  )}&serviceType=Product`,
                },
              ]}
            />

            <SalesSummary
              icon={newClientIcon}
              title="New Clients"
              titleLink={`/sales-report?date=${dateFilter?.value}&billType=New`}
              totalSales="03"
              items={[
                {
                  label: "Memberships",
                  value: "01",
                  link: `/sales-report?date=${encodeURIComponent(
                    dateFilter?.value
                  )}&billType=New&serviceType=Membership`,
                },
                {
                  label: "Packages",
                  value: "01",
                  link: `/sales-report?date=${encodeURIComponent(
                    dateFilter?.value
                  )}&billType=New&serviceType=Package`,
                },
                {
                  label: "Products",
                  value: "01",
                  link: `/sales-report?date=${encodeURIComponent(
                    dateFilter?.value
                  )}&billType=New&serviceType=Product`,
                },
              ]}
            />
            <SalesSummary
              icon={renewalIcon}
              title="Renewal"
              titleLink={`/sales-report?date=${dateFilter?.value}&billType=Renewal`}
              totalSales="03"
              items={[
                {
                  label: "Memberships",
                  value: "01",
                  link: `/sales-report?date=${encodeURIComponent(
                    dateFilter?.value
                  )}&billType=Renewal&serviceType=Membership`,
                },
                {
                  label: "Packages",
                  value: "01",
                  link: `/sales-report?date=${encodeURIComponent(
                    dateFilter?.value
                  )}&billType=Renewal&serviceType=Package`,
                },
                {
                  label: "Products",
                  value: "01",
                  link: `/sales-report?date=${encodeURIComponent(
                    dateFilter?.value
                  )}&billType=Renewal&serviceType=Product`,
                },
              ]}
            />

            <SalesSummary
              icon={trialIcon}
              title="Trials"
              titleLink={`/trial-appointments?date=${dateFilter?.value}`}
              totalSales="4"
              items={[
                {
                  label: "Scheduled",
                  value: "01",
                  link: `/trial-appointments?date=${encodeURIComponent(
                    dateFilter?.value
                  )}&status=Scheduled`,
                },
                {
                  label: "Completed",
                  value: "02",
                  link: `/trial-appointments?date=${encodeURIComponent(
                    dateFilter?.value
                  )}&status=Completed`,
                },
                {
                  label: "No-Show",
                  value: "01",
                  link: `/trial-appointments?date=${encodeURIComponent(
                    dateFilter?.value
                  )}&status=No-Show`,
                },
              ]}
            />
            <SalesSummary
              icon={checkInIcon}
              title="Check-ins"
              titleLink="/sales-report?data=memberships"
              totalSales="905"
              items={[
                { label: "Unique Check-ins", value: "881", link: "#" },
                { label: "Unique Members", value: "305", link: "#" },
              ]}
            />
            <SalesSummary
              icon={enquiriesIcon}
              title="Conversion"
              titleLink="/sales-report?data=memberships"
              totalSales="2%"
              items={[
                { label: "Lead To Trial", value: "13%", link: "#" },
                { label: "Trial To Membership", value: "18%", link: "#" },
              ]}
            />
          </div>
          <div className="mt-3 w-full grid grid-cols-7 gap-3">
            <div className="border border-[#D4D4D4] rounded-[5px] bg-white p-2 pb-1 w-full relative col-span-4">
              <span className="absolute top-[10px] right-[20px] z-[2] text-lg font-bold">
                {totalProcutValue}
              </span>
              <HighchartsReact
                highcharts={Highcharts}
                options={productStatus}
              />
            </div>
            <div className="border border-[#D4D4D4] rounded-[5px] bg-white p-2 pb-1 w-full relative col-span-3">
              <span className="absolute top-[10px] right-[20px] z-[2] text-lg font-bold">
                {totalValue}
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
                    <th className="p-2">Bookings</th>
                    <th className="p-2">Reservations</th>
                    <th className="p-2">Cancellations</th>
                    <th className="p-2">Action</th>
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
                      <td className="p-2">
                        <div className="bg-[#F1F1F1] border border-[#D4D4D4] rounded-[5px] w-[32px] h-[32px] flex items-center justify-center cursor-pointer">
                          <img src={eyeIcon} />
                        </div>
                      </td>
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
              <div className="flex justify-between gap-3 items-center rounded-full bg-[#F1F1F1] px-3 py-2">
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
              </div>
              <SummaryDashboard data={currentData} />
            </div>
          </div>
          <div className="rounded-[15px] p-4 box--shadow bg-white mt-4">
            <SolidGaugeChart />
          </div>
        </div>
      </div>

      <div className="rounded-[15px] p-4 w-full mt-2 box--shadow bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">Pending Orders</h2>
          <a href="#" className="text-[#009EB2] underline text-sm">
            View All
          </a>
        </div>
        <PendingOrderTable setOrders={setOrders} orders={orders} />
      </div>
    </div>
  );
};

export default ClubManagerDashboard;
