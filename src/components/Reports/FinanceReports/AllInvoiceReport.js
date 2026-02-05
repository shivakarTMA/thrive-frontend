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
    purchaseDate: "2024-01-10",
    branchLocation: "Mumbai - Andheri",
    memberId: "M001",
    memberName: "Rahul Sharma",
    contactNumber: "9876543210",
    email: "rahul.sharma@gmail.com",
    gstNo: "27ABCDE1234F1Z5",
    clubId: "CLB101",
    gender: "Male",
    birthday: "1995-06-15",
    company: "Infosys",
    billNo: "BILL-1001",
    sequence: "SEQ-01",
    paidInvoice: "Yes",
    cancelledPaidInvoice: "No",
    descriptionService: "Annual Gym Membership",
    startDate: "2024-01-10",
    endDate: "2025-01-09",
    ptName: "Amit Verma",
    salesRepName: "Neha Singh",
    generalTrainer: "Rohit Patel",
    createdBy: "Admin",
    amount: 20000,
    cgst: 1800,
    sgst: 1800,
    igst: 0,
    finalAmount: 23600,
    paid: 20000,
    tdsAmount: 0,
    pending: 3600,
    payMode: "Card",
    leadSource: "Website",
    activeInactive: "Active",
    discountReason: "New Year Offer",
    note: "Paid partially",
  },
  {
    club_name: "DLF Summit Plaza",
    purchaseDate: "2024-02-05",
    branchLocation: "Delhi - CP",
    memberId: "M002",
    memberName: "Anjali Mehta",
    contactNumber: "9123456789",
    email: "anjali.mehta@gmail.com",
    gstNo: "07PQRSX5678L1Z2",
    clubId: "CLB102",
    gender: "Female",
    birthday: "1998-11-22",
    company: "TCS",
    billNo: "BILL-1002",
    sequence: "SEQ-02",
    paidInvoice: "Yes",
    cancelledPaidInvoice: "No",
    descriptionService: "Personal Training - 3 Months",
    startDate: "2024-02-05",
    endDate: "2024-05-04",
    ptName: "Suresh Kumar",
    salesRepName: "Aakash Jain",
    generalTrainer: "Pooja Nair",
    createdBy: "Staff",
    amount: 15000,
    cgst: 1350,
    sgst: 1350,
    igst: 0,
    finalAmount: 17700,
    paid: 17700,
    tdsAmount: 0,
    pending: 0,
    payMode: "UPI",
    leadSource: "Walk-in",
    activeInactive: "Active",
    discountReason: "None",
    note: "Fully paid",
  },
];

const AllInvoiceReport = () => {
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
            {`Home > Reports > Finance Reports > All Invoice Report`}
          </p>
          <h1 className="text-3xl font-semibold">All Invoice Report</h1>
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
                <th className="px-2 py-4 min-w-[150px]">Club Name</th>
                <th className="px-2 py-4 min-w-[120px]">purchase date</th>
                <th className="px-2 py-4 min-w-[150px]">branch location</th>
                <th className="px-2 py-4 min-w-[120px]">member id</th>
                <th className="px-2 py-4 min-w-[150px]">member name</th>
                <th className="px-2 py-4 min-w-[150px]">contact number</th>
                <th className="px-2 py-4 min-w-[150px]">e-mail</th>
                <th className="px-2 py-4 min-w-[100px]">gst no</th>
                <th className="px-2 py-4 min-w-[100px]">club id</th>
                <th className="px-2 py-4 min-w-[120px]">gender</th>
                <th className="px-2 py-4 min-w-[120px]">birthday</th>
                <th className="px-2 py-4 min-w-[120px]">company</th>
                <th className="px-2 py-4 min-w-[120px]">bill no</th>
                <th className="px-2 py-4 min-w-[120px]">sequence</th>
                <th className="px-2 py-4 min-w-[120px]">paid invoice</th>
                <th className="px-2 py-4 min-w-[170px]">
                  cancelled paid invoice
                </th>
                <th className="px-2 py-4 min-w-[200px]">description service</th>
                <th className="px-2 py-4 min-w-[120px]">start date</th>
                <th className="px-2 py-4 min-w-[120px]">end date</th>
                <th className="px-2 py-4 min-w-[120px]">pt name</th>
                <th className="px-2 py-4 min-w-[120px]">sales rep name</th>
                <th className="px-2 py-4 min-w-[120px]">general trainer</th>
                <th className="px-2 py-4 min-w-[100px]">created by</th>
                <th className="px-2 py-4 min-w-[80px]">amount</th>
                <th className="px-2 py-4 min-w-[80px]">cgst</th>
                <th className="px-2 py-4 min-w-[80px]">sgst</th>
                <th className="px-2 py-4 min-w-[50px]">igst</th>
                <th className="px-2 py-4 min-w-[110px]">final amount</th>
                <th className="px-2 py-4 min-w-[100px]">paid</th>
                <th className="px-2 py-4 min-w-[100px]">tds amount</th>
                <th className="px-2 py-4 min-w-[100px]">pending</th>
                <th className="px-2 py-4 min-w-[100px]">pay mode</th>
                <th className="px-2 py-4 min-w-[100px]">lead source</th>
                <th className="px-2 py-4 min-w-[100px]">status</th>
                <th className="px-2 py-4 min-w-[150px]">discount reason</th>
                <th className="px-2 py-4 min-w-[130px]">note</th>
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
                    <td className="px-2 py-4">{row.leadSource}</td>
                    <td className="px-2 py-4">{row.activeInactive}</td>
                    <td className="px-2 py-4">{row.discountReason}</td>
                    <td className="px-2 py-4">{row.note}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={36} className="text-center py-4">
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

export default AllInvoiceReport;
