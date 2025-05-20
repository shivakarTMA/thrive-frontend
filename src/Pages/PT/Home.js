import React, { useState } from "react";
import { Link } from "react-router-dom";
import Select from "react-select";
import {
  followUpsData,
  todaySessions,
} from "../../DummyData/DummyData";
import { customStyles } from "../../Helper/helper";
import { FaUserCircle } from "react-icons/fa";
import ScrollableTabs from "../../components/common/ScrollableTabs";
import { GoPlusCircle } from "react-icons/go";
import TrialUserCard from "../../components/TrialUserCard";
import DatePicker from "react-datepicker";
import PtCard from "../../components/PtCard";
import Highcharts from 'highcharts';
import HighchartsReact from "highcharts-react-official";

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

const ChartPt = {
  title: {
    text: 'Session Utilization (booked v/s completed s)',
    align: 'left',
    style: {
      fontSize: '14px',
    },
  },
  xAxis: {
    categories: ['1 Apr', '2 Apr', '3 Apr', '4 Apr', '5 Apr', '6 Apr', '7 Apr'],
  },
  yAxis: {
    title: { text: '' },
    min: 0,
    max: 60,
    tickInterval: 20,
  },
  series: [
    {
      name: 'Utilization',
      data: [18, 10, 15, 30, 45, 50, 40], // mock data, adjust as needed
      type: 'spline',
      color: '#000',
    },
  ],
  chart: {
    type: 'spline',
    height: 300,
    backgroundColor: 'transparent',
  },
  legend: {
    enabled: false,
  },
  credits: {
    enabled: false,
  },
};

const filterOptions = [
  { value: "today", label: "Today" },
  { value: "last 7 days", label: "Last 7 Days" },
  { value: "month till date", label: "Month till Date" },
  { value: "custom date range", label: "Custom Date Range" },
];

const tabs = ["Scheduled", "Attempted", "Contacted", "Not Contacted", "Missed"];

const Home = () => {
  const [selectedType, setSelectedType] = useState(callOptions[0]);
  const [filterData, setFilterData] = useState(filterOptions[0]);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [selectedTab, setSelectedTab] = useState("Scheduled");
  const [trialLeads, setTrialLeads] = useState(todaySessions);
 

  const handleStatusChange = (id, newStatus) => {
    const updated = trialLeads.map((lead) =>
      lead.id === id ? { ...lead, selectedStatus: newStatus } : lead
    );
    setTrialLeads(updated);
  };

  const filteredData = followUpsData.filter(
    (item) => item.type === selectedType.value && item.status === selectedTab
  );


  return (
    <div className="page--content">
      <div className=" flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > Dashboard`}</p>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
        </div>
        <div className="flex items-end gap-2">
          {filterData.value === "custom date range" && (
            <div className="flex gap-4 items-center">
              <div className="flex gap-1 items-center">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From
                </label>
                <div className="custom--date">
                  <DatePicker
                    selected={fromDate}
                    onChange={(date) => setFromDate(date)}
                    dateFormat="dd MMM yyyy"
                    className="border rounded px-3 py-2"
                    maxDate={toDate || new Date()}
                    placeholderText="Select start date"
                  />
                </div>
              </div>
              <div className="flex gap-1 items-center">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To
                </label>
                <div className="custom--date">
                  <DatePicker
                    selected={toDate}
                    onChange={(date) => setToDate(date)}
                    dateFormat="dd MMM yyyy"
                    className="border rounded px-3 py-2"
                    minDate={fromDate}
                    maxDate={new Date()}
                    placeholderText="Select end date"
                  />
                </div>
              </div>
            </div>
          )}

          <Select
            options={filterOptions}
            value={filterData}
            onChange={(option) => setFilterData(option)}
            isSearchable={false}
            className="custom--select min-w-[150px]"
            styles={customStyles}
          />
        </div>
      </div>
      {/* end title */}

      <div className="grid grid-cols-5 gap-2">
        <div className="col-span-3">
          <div className="grid grid-cols-3 gap-2">
            <PtCard title="Active Clients" value={138} percent={2.5} />
            <PtCard title="Booked Sessions" value={300} percent={2.5} />
            <PtCard title="Completed Sessions" value={220} percent={-2.5} />
          </div>

          <div className="border rounded p-4 w-full mt-3">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">
                Trial Sessions ({trialLeads.length})
              </h2>
            </div>
            {trialLeads.slice(-9).map((user) => (
  <TrialUserCard
    key={user.id}
    user={user}
    onStatusChange={handleStatusChange}
  />
))}

          </div>
        </div>
        <div className="col-span-2 right--side">
          <div className="top--side flex items-center gap-2 justify-between">
            <h2>Total Follow-Ups ({filteredData.length})</h2>
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

          <div className="border rounded p-4 w-full mt-3">
          <HighchartsReact highcharts={Highcharts} options={ChartPt} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
