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
    purchaseDate: "2025-04-01",
    branchLocation: "Mumbai - Andheri",
    memberId: "MBR1001",
    memberName: "Rohit Mehta",
    contactNumber: "9876543210",
    email: "rohit.mehta@gmail.com",
    gstNo: "27ABCDE1234F1Z5",
    clubId: "CLB01",
    gender: "Male",
    birthday: "1997-08-12",
    company: "Infosys",
    billNo: "INV-001",
    sequence: "SEQ-001",
    paidInvoice: "Yes",
    cancelledPaidInvoice: "No",
    descriptionService: "Gym Membership 12 Months",
    startDate: "2025-04-01",
    endDate: "2026-03-31",
    ptName: "Amit Trainer",
    salesRepName: "Neha Singh",
    generalTrainer: "Ravi Kumar",
    createdBy: "Admin",
    amount: 20000,
    cgst: 1800,
    sgst: 1800,
    igst: 0,
    finalAmount: 23600,
    paid: 23600,
    tdsAmount: 0,
    pending: 0,
    payMode: "Credit Card",
    cancelledBy: "-",
    reason: "-",
    leadSource: "Walk-in",
    status: "Active",
    discountReason: "New Year Offer",
    note: "Payment completed",
  },
  {
    club_name: "DLF Summit Plaza",
    purchaseDate: "2025-04-10",
    branchLocation: "Delhi - Saket",
    memberId: "MBR1002",
    memberName: "Anjali Verma",
    contactNumber: "9123456789",
    email: "anjali.verma@gmail.com",
    gstNo: "07PQRSX5678L1Z2",
    clubId: "CLB02",
    gender: "Female",
    birthday: "2000-02-18",
    company: "Wipro",
    billNo: "INV-002",
    sequence: "SEQ-002",
    paidInvoice: "No",
    cancelledPaidInvoice: "No",
    descriptionService: "Gym + PT 6 Months",
    startDate: "2025-04-10",
    endDate: "2025-10-09",
    ptName: "Suresh PT",
    salesRepName: "Aakash Jain",
    generalTrainer: "Vikas Singh",
    createdBy: "Staff",
    amount: 15000,
    cgst: 1350,
    sgst: 1350,
    igst: 0,
    finalAmount: 17700,
    paid: 10000,
    tdsAmount: 0,
    pending: 7700,
    payMode: "UPI",
    cancelledBy: "-",
    reason: "-",
    leadSource: "Instagram",
    status: "Active",
    discountReason: "Festival Discount",
    note: "Balance pending",
  },
];

const CancelledPaidInvioceReport = () => {
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
            {`Home > Reports > Finance Reports > Cancelled Paid Invoice`}
          </p>
          <h1 className="text-3xl font-semibold">Cancelled Paid Invoice</h1>
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
                <th className="px-2 py-4 min-w-[150px]">club name</th>
                <th className="px-2 py-4 min-w-[120px]">purchase date</th>
                <th className="px-2 py-4 min-w-[150px]">branch location</th>
                <th className="px-2 py-4 min-w-[120px]">member id</th>
                <th className="px-2 py-4 min-w-[150px]">member name</th>
                <th className="px-2 py-4 min-w-[150px]">contact number</th>
                <th className="px-2 py-4 min-w-[150px]">e-mail</th>
                <th className="px-2 py-4 min-w-[120px]">gst no</th>
                <th className="px-2 py-4 min-w-[120px]">club id</th>
                <th className="px-2 py-4 min-w-[100px]">gender</th>
                <th className="px-2 py-4 min-w-[120px]">birthday</th>
                <th className="px-2 py-4 min-w-[120px]">company</th>
                <th className="px-2 py-4 min-w-[120px]">bill no</th>
                <th className="px-2 py-4 min-w-[100px]">sequence</th>
                <th className="px-2 py-4 min-w-[120px]">paid invoice</th>
                <th className="px-2 py-4 min-w-[170px]">
                  cancelled paid invoice
                </th>
                <th className="px-2 py-4 min-w-[200px]">description service</th>
                <th className="px-2 py-4 min-w-[120px]">start date</th>
                <th className="px-2 py-4 min-w-[120px]">end date</th>
                <th className="px-2 py-4 min-w-[120px]">pt name</th>
                <th className="px-2 py-4 min-w-[150px]">sales rep name</th>
                <th className="px-2 py-4 min-w-[150px]">general trainer</th>
                <th className="px-2 py-4 min-w-[120px]">created by</th>
                <th className="px-2 py-4 min-w-[100px]">amount</th>
                <th className="px-2 py-4 min-w-[80px]">cgst</th>
                <th className="px-2 py-4 min-w-[80px]">sgst</th>
                <th className="px-2 py-4 min-w-[80px]">igst</th>
                <th className="px-2 py-4 min-w-[120px]">final amount</th>
                <th className="px-2 py-4 min-w-[100px]">paid</th>
                <th className="px-2 py-4 min-w-[100px]">tds amount</th>
                <th className="px-2 py-4 min-w-[100px]">pending</th>
                <th className="px-2 py-4 min-w-[120px]">pay mode</th>
                <th className="px-2 py-4 min-w-[120px]">cancelled by</th>
                <th className="px-2 py-4 min-w-[120px]">reason</th>
                <th className="px-2 py-4 min-w-[120px]">lead source</th>
                <th className="px-2 py-4 min-w-[120px]">status</th>
                <th className="px-2 py-4 min-w-[150px]">discount reason</th>
                <th className="px-2 py-4 min-w-[150px]">note</th>
              </tr>
            </thead>

            <tbody>
              {data.length ? (
                data.map((row, index) => (
                  <tr
                    key={index}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <td className="px-2 py-4">{row.club_name || "-"}</td>
                    <td className="px-2 py-4">{row.purchaseDate}</td>
                    <td className="px-2 py-4">{row.branchLocation}</td>
                    <td className="px-2 py-4">{row.memberId}</td>
                    <td className="px-2 py-4">{row.memberName}</td>
                    <td className="px-2 py-4">{row.contactNumber}</td>
                    <td className="px-2 py-4">{row.email}</td>
                    <td className="px-2 py-4">{row.gstNo}</td>
                    <td className="px-2 py-4">{row.clubId}</td>
                    <td className="px-2 py-4">{row.gender}</td>
                    <td className="px-2 py-4">{row.birthday}</td>
                    <td className="px-2 py-4">{row.company}</td>
                    <td className="px-2 py-4">{row.billNo}</td>
                    <td className="px-2 py-4">{row.sequence}</td>
                    <td className="px-2 py-4">{row.paidInvoice}</td>
                    <td className="px-2 py-4">{row.cancelledPaidInvoice}</td>
                    <td className="px-2 py-4">{row.descriptionService}</td>
                    <td className="px-2 py-4">{row.startDate}</td>
                    <td className="px-2 py-4">{row.endDate}</td>
                    <td className="px-2 py-4">{row.ptName}</td>
                    <td className="px-2 py-4">{row.salesRepName}</td>
                    <td className="px-2 py-4">{row.generalTrainer}</td>
                    <td className="px-2 py-4">{row.createdBy}</td>
                    <td className="px-2 py-4">₹{row.amount}</td>
                    <td className="px-2 py-4">₹{row.cgst}</td>
                    <td className="px-2 py-4">₹{row.sgst}</td>
                    <td className="px-2 py-4">₹{row.igst}</td>
                    <td className="px-2 py-4">₹{row.finalAmount}</td>
                    <td className="px-2 py-4">₹{row.paid}</td>
                    <td className="px-2 py-4">₹{row.tdsAmount}</td>
                    <td className="px-2 py-4">₹{row.pending}</td>
                    <td className="px-2 py-4">{row.payMode}</td>
                    <td className="px-2 py-4">{row.cancelledBy}</td>
                    <td className="px-2 py-4">{row.reason}</td>
                    <td className="px-2 py-4">{row.leadSource}</td>
                    <td className="px-2 py-4">{row.status}</td>
                    <td className="px-2 py-4">{row.discountReason}</td>
                    <td className="px-2 py-4">{row.note}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={38} className="text-center py-4">
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

export default CancelledPaidInvioceReport;
