import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, subYears } from "date-fns";
import { FaCalendarDays } from "react-icons/fa6";
import Select from "react-select";
import { customStyles, filterActiveItems } from "../../../Helper/helper";
import { authAxios } from "../../../config/config";
import { toast } from "react-toastify";

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const dummyData = [
  {
    club_name: "DLF Summit Plaza",
    branch: "Mumbai",
    sequence: "SEQ-001",
    billNo: "BILL-1001",
    billType: "Tax Invoice",
    paidInvoiceNo: "PINV-5001",
    receiptNo: "RCPT-9001",
    purchaseDate: "2025-06-01",
    paidDate: "2025-06-01",
    type: "Membership",
    branchLocation: "Andheri West",
    memberId: "MBR-001",
    clubId: "CLB-01",
    memberName: "Rahul Sharma",
    mobile: "9876543210",
    mail: "rahul.sharma@gmail.com",
    amount: 20000,
    taxAmount: 3600,
    finalAmount: 23600,
    paidAmount: 23600,
    pending: 0,
    serviceName: "Annual Gym Membership",
    salesRepName: "Neha Singh",
    ptStaff: "Amit Trainer",
    paymodeDetails: "Credit Card",
  },
  {
    club_name: "DLF Summit Plaza",
    branch: "Delhi",
    sequence: "SEQ-002",
    billNo: "BILL-1002",
    billType: "Proforma Invoice",
    paidInvoiceNo: "PINV-5002",
    receiptNo: "RCPT-9002",
    purchaseDate: "2025-06-05",
    paidDate: "2025-06-06",
    type: "Gym + PT",
    branchLocation: "Saket",
    memberId: "MBR-002",
    clubId: "CLB-02",
    memberName: "Anjali Verma",
    mobile: "9123456789",
    mail: "anjali.verma@gmail.com",
    amount: 15000,
    taxAmount: 2700,
    finalAmount: 17700,
    paidAmount: 10000,
    pending: 7700,
    serviceName: "6 Months Gym + PT",
    salesRepName: "Aakash Jain",
    ptStaff: "Suresh PT",
    paymodeDetails: "UPI",
  },
];

const CollectionReport = () => {
  const [data] = useState(dummyData);
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

  return (
    <div className="page--content">
      {/* Header */}
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">
            {`Home > Reports > Finance Reports > Collection Report`}
          </p>
          <h1 className="text-3xl font-semibold">Collection Report</h1>
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

          <div className="w-full max-w-[200px]">
            <Select
              placeholder="Filter by club"
              value={clubOptions.find((o) => o.value === clubFilter) || null}
              options={clubOptions}
              onChange={(option) => setClubFilter(option?.value)}
              isClearable
              styles={customStyles}
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
                <th className="px-2 py-4 min-w-[50px]">s.no</th>
                <th className="px-2 py-4 min-w-[150px]">Club Name</th>
                <th className="px-2 py-4 min-w-[100px]">branch</th>
                <th className="px-2 py-4 min-w-[100px]">sequence</th>
                <th className="px-2 py-4 min-w-[100px]">bill no</th>
                <th className="px-2 py-4 min-w-[130px]">bill type</th>
                <th className="px-2 py-4 min-w-[120px]">paid invoice no</th>
                <th className="px-2 py-4 min-w-[110px]">receipt no</th>
                <th className="px-2 py-4 min-w-[120px]">purchase date</th>
                <th className="px-2 py-4 min-w-[120px]">paid date</th>
                <th className="px-2 py-4 min-w-[120px]">type</th>
                <th className="px-2 py-4 min-w-[140px]">branch location</th>
                <th className="px-2 py-4 min-w-[100px]">member id</th>
                <th className="px-2 py-4 min-w-[80px]">club id</th>
                <th className="px-2 py-4 min-w-[120px]">member name</th>
                <th className="px-2 py-4 min-w-[120px]">mobile</th>
                <th className="px-2 py-4 min-w-[120px]">mail</th>
                <th className="px-2 py-4 min-w-[80px]">amount</th>
                <th className="px-2 py-4 min-w-[100px]">tax amount</th>
                <th className="px-2 py-4 min-w-[110px]">final amount</th>
                <th className="px-2 py-4 min-w-[100px]">paid amount</th>
                <th className="px-2 py-4 min-w-[80px]">pending</th>
                <th className="px-2 py-4 min-w-[150px]">service name</th>
                <th className="px-2 py-4 min-w-[130px]">sales rep name</th>
                <th className="px-2 py-4 min-w-[120px]">pt staff</th>
                <th className="px-2 py-4 min-w-[120px]">paymode details</th>
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
                    <td className="px-2 py-4">{row.club_name || "-"}</td>
                    <td className="px-2 py-4">{row.branch}</td>
                    <td className="px-2 py-4">{row.sequence}</td>
                    <td className="px-2 py-4">{row.billNo}</td>
                    <td className="px-2 py-4">{row.billType}</td>
                    <td className="px-2 py-4">{row.paidInvoiceNo}</td>
                    <td className="px-2 py-4">{row.receiptNo}</td>
                    <td className="px-2 py-4">{row.purchaseDate}</td>
                    <td className="px-2 py-4">{row.paidDate}</td>
                    <td className="px-2 py-4">{row.type}</td>
                    <td className="px-2 py-4">{row.branchLocation}</td>
                    <td className="px-2 py-4">{row.memberId}</td>
                    <td className="px-2 py-4">{row.clubId}</td>
                    <td className="px-2 py-4">{row.memberName}</td>
                    <td className="px-2 py-4">{row.mobile}</td>
                    <td className="px-2 py-4">{row.mail}</td>
                    <td className="px-2 py-4">₹{row.amount}</td>
                    <td className="px-2 py-4">₹{row.taxAmount}</td>
                    <td className="px-2 py-4">₹{row.finalAmount}</td>
                    <td className="px-2 py-4">₹{row.paidAmount}</td>
                    <td className="px-2 py-4">₹{row.pending}</td>
                    <td className="px-2 py-4">{row.serviceName}</td>
                    <td className="px-2 py-4">{row.salesRepName}</td>
                    <td className="px-2 py-4">{row.ptStaff}</td>
                    <td className="px-2 py-4">{row.paymodeDetails}</td>
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

export default CollectionReport;
