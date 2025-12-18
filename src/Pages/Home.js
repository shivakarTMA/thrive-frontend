import React, { useState } from "react";
import StatCard from "../components/StatCard";
import { Link } from "react-router-dom";
import Select from "react-select";
import {
  followUpsData,
  trialScheduledUsers,
  groupClasses,
  assignedLeadsData,
} from "../DummyData/DummyData";
import { customStyles } from "../Helper/helper";
import { FaUserCircle } from "react-icons/fa";
import ScrollableTabs from "../components/common/ScrollableTabs";
import { GoPlusCircle } from "react-icons/go";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import TrialUserCard from "../components/TrialUserCard";
import DatePicker from "react-datepicker";
import PendingOrderTable from "../components/PendingOrderTable";
import { useNavigate } from "react-router-dom";
import { FaCalendarDays } from "react-icons/fa6";
import { addYears, subYears } from "date-fns";

const callOptions = [
  { value: "enquiry calls", label: "Enquiry Calls" },
  { value: "welcome calls", label: "Welcome Calls" },
  { value: "induction calls", label: "Induction Calls" },
  { value: "payment calls", label: "Payment Calls" },
  { value: "upgrade calls", label: "Upgrade Calls" },
  { value: "renewal calls", label: "Renewal Calls" },
  { value: "irregular member calls", label: "Irregular Member Calls" },
  { value: "courtesy calls", label: "Courtesy Calls" },
  { value: "inbound calls", label: "Inbound Calls" },
  {
    value: "birthday anniversary calls",
    label: "Birthday & Anniversary Calls",
  },
];

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const tabs = ["Scheduled", "Attempted", "Contacted", "Not Contacted", "Missed"];

const Home = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(callOptions[0]);
  const [dateFilter, setDateFilter] = useState(dateFilterOptions[1]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);
  const [selectedTab, setSelectedTab] = useState("Scheduled");
  const [trialLeads, setTrialLeads] = useState(trialScheduledUsers);
  const leadsStatus = {
    chart: {
      type: "column",
      height: 300,
    },
    title: {
      text: "Leads Distribution by Status",
      align: "left",
      style: {
        fontSize: "16px",
        fontWeight: "600",
      },
    },
    xAxis: {
      categories: ["New", "Contacted", "Lost", "Trial Scheduled"],
      title: {
        text: null,
      },
      labels: {
        style: {
          fontSize: "10px",
        },
      },
    },
    yAxis: {
      min: 0,
      title: {
        text: null,
      },
      gridLineColor: "#e5e5e5",
    },
    legend: {
      enabled: false,
    },
    tooltip: {
      pointFormat: "Count: <b>{point.y}</b>",
    },
    plotOptions: {
      column: {
        borderRadius: 3,
        pointPadding: 0.2,
        borderWidth: 0,
        cursor: "pointer",
        color: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, // vertical gradient
          stops: [
            [0, "#00BFFF"], // top color
            [1, "#1E90FF"], // bottom color
          ],
        },
      },
      series: {
        point: {
          events: {
            click: function () {
              const statusMap = {
                New: "new",
                Contacted: "contacted",
                Lost: "lost",
                "Trial Scheduled": "trial scheduled",
              };
              const selectedStatus = statusMap[this.category];
              navigate(`/all-leads?leadStatus=${selectedStatus}`);
            },
          },
        },
      },
    },
    series: [
      {
        name: "Leads",
        data: [75, 40, 60, 45],
      },
    ],
    credits: {
      enabled: false,
    },
  };
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

  const handleStatusChange = (id, newStatus) => {
    const updated = trialLeads.map((lead) =>
      lead.id === id ? { ...lead, selectedStatus: newStatus } : lead
    );
    setTrialLeads(updated);
  };

  const filteredData = followUpsData.filter(
    (item) => item.type === selectedType.value && item.status === selectedTab
  );

  const salesData = {
    title: "Total Sales",
    value: "₹1,32,036",
    description: "Yeah! Your sales have surged by 10% from last month!",
    items: [
      { label: "Payments Collected", value: "₹1,20,036", change: "25%" },
      { label: "Payments Pending", value: "₹16,000", change: "2.5%" },
    ],
  };

  const leadsData = {
    title: "Total Leads",
    value: "323",
    description: "Yeah! Your sales have surged by 10% from last month!",
    items: [
      { label: "Converted Leads", value: "200", change: "25%" },
      { label: "Lost Leads", value: "123", change: "-25%" },
    ],
  };

  const handleChange = (selectedOption) => {
    console.log("Selected:", selectedOption);
  };

  const handleDateFilterChange = (selected) => {
    setDateFilter(selected);

    // If custom date filter is selected, handle the logic for custom dates
    if (selected?.value !== "custom") {
      setCustomFrom(null);
      setCustomTo(null);
    } else {
      // Handle custom date filter logic here (e.g., open a date picker)
      // You may need to update the URL with a custom date range
    }
  };

  return (
    <div className="page--content">
      <div className=" flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > Dashboard`}</p>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
        </div>

        <div className="flex justify-end gap-2 w-full">
          {dateFilter?.value === "custom" && (
            <>
              <div className="custom--date dob-format flex-1 max-w-[180px] w-full">
                <span className="absolute z-[1] mt-[11px] ml-[15px]">
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
              <div className="custom--date dob-format flex-1 max-w-[180px] w-full">
                <span className="absolute z-[1] mt-[11px] ml-[15px]">
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
          <div className="max-w-[180px] w-full">
            <Select
              placeholder="Select Date"
              options={dateFilterOptions}
              value={dateFilter}
              onChange={handleDateFilterChange}
              // isClearable
              styles={customStyles}
              className="w-full"
            />
          </div>
        </div>
      </div>
      {/* end title */}

      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2">
          <div className="grid grid-cols-2 gap-2">
            <StatCard {...salesData} />
            <StatCard {...leadsData} />
            <div className="border box--shadow bg-white rounded-[15px] p-4 w-full">
              <HighchartsReact highcharts={Highcharts} options={leadsStatus} />
            </div>
            <div className="border box--shadow bg-white rounded-[15px] p-4 w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold">
                  Trial Scheduled ({trialLeads.length})
                </h2>
                <a href="#" className="text-blue-500 underline text-sm">
                  View All
                </a>
              </div>
              {trialLeads.map((user) => (
                <TrialUserCard
                  key={user.id}
                  user={user}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          </div>

          <div className="border box--shadow bg-white rounded-[15px] p-4 w-full mt-2">
            <HighchartsReact highcharts={Highcharts} options={groupClasses} />
          </div>
        </div>
        <div className="right--side box--shadow bg-white rounded-[15px] p-4">
          <div className="top--side flex items-center gap-2 justify-between">
            <h2>Follow-Ups ({filteredData.length})</h2>
            <Link to="#" className="underline text-blue-500">
              View All
            </Link>
          </div>

          <div className="mt-2">
            <Select
              options={callOptions}
              value={selectedType}
              onChange={(option) => setSelectedType(option)}
              isSearchable={false}
              className="mb-4 custom--select"
              styles={customStyles}
            />
          </div>

          <div className="flex overflow-x-auto whitespace-nowrap gap-2 mb-4">
            <ScrollableTabs
              tabs={tabs}
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
              className="buttons--overflow"
            />
          </div>

          <div className="flex flex-col gap-3">
            {filteredData.length > 0 ? (
              filteredData
                .slice(-3) // get the last 4 items
                .reverse() // show most recent first
                .map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between bg-gray-100 p-3 rounded"
                  >
                    <div className="flex gap-3 items-start">
                      <FaUserCircle className="text-2xl mt-1 text-gray-600" />
                      <div>
                        <h4 className="font-semibold">{user.name}</h4>
                        <p className="text-sm text-gray-500">
                          Contact: {user.contact}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="border text-xs px-2 py-1 rounded bg-white">
                            {user.tag}
                          </span>
                          <span className="border text-xs px-2 py-1 rounded bg-white">
                            {user.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link to="#" className="text-2xl font-bold text-black">
                      <GoPlusCircle />
                    </Link>
                  </div>
                ))
            ) : (
              <p className="text-sm text-gray-500">No records found.</p>
            )}
          </div>

          <div className="top--side flex items-center gap-2 justify-between mt-5">
            <h2>Assigned Leads ({assignedLeadsData.length})</h2>
            <Link
              to={`/all-leads?view=assigned`}
              className="underline text-blue-500"
            >
              View All
            </Link>
          </div>

          <div className="flex flex-col gap-3 mt-5">
            {assignedLeadsData.length > 0 ? (
              assignedLeadsData
                .slice(-4) // Get the last 4 entries
                .reverse() // Optional: to show newest first
                .map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between bg-gray-100 p-3 rounded"
                  >
                    <div className="flex gap-3 items-start">
                      <FaUserCircle className="text-2xl mt-1 text-gray-600" />
                      <div>
                        <h4 className="font-semibold">{user.name}</h4>
                        <p className="text-sm text-gray-500">
                          Contact: {user.contact}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="border text-xs px-2 py-1 rounded bg-white">
                            {user.tag}
                          </span>
                          <span className="border text-xs px-2 py-1 rounded bg-white">
                            {user.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/lead-follow-up/${user.id}?action=add-follow-up`}
                      className="text-2xl font-bold text-black"
                    >
                      <GoPlusCircle />
                    </Link>
                  </div>
                ))
            ) : (
              <p className="text-sm text-gray-500">No records found.</p>
            )}

            {console.log(assignedLeadsData, "assignedLeadsData")}
          </div>
        </div>
      </div>

      <div className="border box--shadow bg-white rounded-[15px] p-4 w-full mt-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">
            Pending Orders {`(${orders.length})`}
          </h2>
          <a href="#" className="text-[#009EB2] underline text-sm">
            View All
          </a>
        </div>
        <PendingOrderTable setOrders={setOrders} orders={orders} />
      </div>
    </div>
  );
};

export default Home;
