import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, subYears } from "date-fns";
import { FaCalendarDays } from "react-icons/fa6";
import Select from "react-select";
import { customStyles } from "../../../Helper/helper";

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const dummyData = [
  {
    name: "Rahul Sharma",
    mobile: "9876543210",
    emailId: "rahul.sharma@gmail.com",
    sequence: "SEQ-001",
    service: "Gym Membership",
    serviceVariation: "12 Months",
    proformaInvoiceNo: "PF-INV-001",
    type: "Sale",
    baseValue: 20000,
    tax: 3600,
    total: 23600,
    paid: 23600,
    balance: 0,
    utilisedValue: 18000,
    unutilisedValue: 2000,
    deduction: 0,
    refundAmount: 0,
    staffName: "Neha Singh",
    dateTime: "2025-05-01 10:30 AM",
    instrument: "Credit Card",
    transactionId: "TXN123456",
    note: "Full payment received",
    creditNoteNo: "-",
  },
  {
    name: "Anjali Verma",
    mobile: "9123456789",
    emailId: "anjali.verma@gmail.com",
    sequence: "SEQ-002",
    service: "Gym + PT",
    serviceVariation: "6 Months",
    proformaInvoiceNo: "PF-INV-002",
    type: "Refund",
    baseValue: 15000,
    tax: 2700,
    total: 17700,
    paid: 10000,
    balance: 7700,
    utilisedValue: 8000,
    unutilisedValue: 2000,
    deduction: 500,
    refundAmount: 1500,
    staffName: "Aakash Jain",
    dateTime: "2025-05-10 04:15 PM",
    instrument: "UPI",
    transactionId: "TXN654321",
    note: "Partial refund processed",
    creditNoteNo: "CN-002",
  },
];

const RefundReport = () => {
  const [data] = useState(dummyData);
  const [dateFilter, setDateFilter] = useState(dateFilterOptions[1]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  return (
    <div className="page--content">
      {/* Header */}
      <div className="flex items-end justify-between gap-2 mb-2">
        <div className="title--breadcrumbs">
          <p className="text-sm">
            {`Home > Reports > Finance Reports > Refund Report`}
          </p>
          <h1 className="text-3xl font-semibold">Refund Report</h1>
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
                  onChange={setCustomFrom}
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
                  onChange={setCustomTo}
                  placeholderText="To Date"
                  className="custom--input w-full input--icon"
                  minDate={subYears(new Date(), 20)}
                  maxDate={addYears(new Date(), 0)}
                  dateFormat="dd-MM-yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="w-full p-3 border bg-white shodow--box rounded-[10px]">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-2 py-4 min-w-[50px]">S.No</th>
                <th className="px-2 py-4 min-w-[120px]">name</th>
                <th className="px-2 py-4 min-w-[120px]">mobile</th>
                <th className="px-2 py-4 min-w-[150px]">email id</th>
                <th className="px-2 py-4 min-w-[100px]">sequence</th>
                <th className="px-2 py-4 min-w-[150px]">service</th>
                <th className="px-2 py-4 min-w-[150px]">service variation</th>
                <th className="px-2 py-4 min-w-[180px]">
                  pro-forma invoice no
                </th>
                <th className="px-2 py-4 min-w-[80px]">type</th>
                <th className="px-2 py-4 min-w-[100px]">base value</th>
                <th className="px-2 py-4 min-w-[80px]">tax</th>
                <th className="px-2 py-4 min-w-[80px]">total</th>
                <th className="px-2 py-4 min-w-[80px]">paid</th>
                <th className="px-2 py-4 min-w-[80px]">balance</th>
                <th className="px-2 py-4 min-w-[120px]">utilised value</th>
                <th className="px-2 py-4 min-w-[150px]">unutilised value</th>
                <th className="px-2 py-4 min-w-[100px]">deduction</th>
                <th className="px-2 py-4 min-w-[120px]">refund amount</th>
                <th className="px-2 py-4 min-w-[120px]">staff name</th>
                <th className="px-2 py-4 min-w-[150px]">date and time</th>
                <th className="px-2 py-4 min-w-[120px]">instrument</th>
                <th className="px-2 py-4 min-w-[150px]">transaction id</th>
                <th className="px-2 py-4 min-w-[150px]">note</th>
                <th className="px-2 py-4 min-w-[150px]">credit note no</th>
                <th className="px-2 py-4 min-w-[100px]">view</th>
              </tr>
            </thead>

            <tbody>
              {data.length ? (
                data.map((row, index) => (
                  <tr
                    key={index}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <td className="px-2 py-4">{index + 1}</td>
                    <td className="px-2 py-4">{row.name}</td>
                    <td className="px-2 py-4">{row.mobile}</td>
                    <td className="px-2 py-4">{row.emailId}</td>
                    <td className="px-2 py-4">{row.sequence}</td>
                    <td className="px-2 py-4">{row.service}</td>
                    <td className="px-2 py-4">{row.serviceVariation}</td>
                    <td className="px-2 py-4">{row.proformaInvoiceNo}</td>
                    <td className="px-2 py-4">{row.type}</td>
                    <td className="px-2 py-4">₹{row.baseValue}</td>
                    <td className="px-2 py-4">₹{row.tax}</td>
                    <td className="px-2 py-4">₹{row.total}</td>
                    <td className="px-2 py-4">₹{row.paid}</td>
                    <td className="px-2 py-4">₹{row.balance}</td>
                    <td className="px-2 py-4">₹{row.utilisedValue}</td>
                    <td className="px-2 py-4">₹{row.unutilisedValue}</td>
                    <td className="px-2 py-4">₹{row.deduction}</td>
                    <td className="px-2 py-4">₹{row.refundAmount}</td>
                    <td className="px-2 py-4">{row.staffName}</td>
                    <td className="px-2 py-4">{row.dateTime}</td>
                    <td className="px-2 py-4">{row.instrument}</td>
                    <td className="px-2 py-4">{row.transactionId}</td>
                    <td className="px-2 py-4">{row.note}</td>
                    <td className="px-2 py-4">{row.creditNoteNo}</td>
                    <td className="px-2 py-4">
                      <button className="px-4 py-2 bg-black text-white font-semibold rounded max-w-[150px] w-full">
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={25} className="text-center py-4">
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

export default RefundReport;
