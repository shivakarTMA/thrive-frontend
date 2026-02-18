import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, subYears } from "date-fns";
import { FaCalendarDays } from "react-icons/fa6";
import Select from "react-select";
import { customStyles, filterActiveItems } from "../../../Helper/helper";
import { authAxios } from "../../../config/config";
import { toast } from "react-toastify";
import { FaCircle } from "react-icons/fa";

import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { IoCloseCircle } from "react-icons/io5";
import { useSelector } from "react-redux";

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const dummyData = [
  {
    ClubName: "Summit Plaza",
    SupplierGSTIN: "07AAACD1234F1Z2",
    InvoiceDate: "05-Dec-2025",
    InvoiceNo: "DLF202600029",
    MemberID: "MB-784512",
    MemberName: "Rahul Mehta",
    TypeOfService: "Membership",
    Description: "12-Month",
    ValueOfService: "48000",
    Taxes: "8640",
    UtilisedValueOfService: "18000",
    BalanceValueOfService: "30000",

    // 🔽 New fields from attachment
    RequestedRefundAmount: "48000",
    DeferredRevenue: "30000",
    Reason: "Medical issue",
    ClubManagerRemarks: "Member injured, medical certificate submitted",
    ApprovedBy: "—",
    Status: "Pending",
  },
  {
    ClubName: "Cybepark",
    SupplierGSTIN: "07BBBCD5678G2Z3",
    InvoiceDate: "09-Dec-2025",
    InvoiceNo: "DLF202600030",
    MemberID: "MB-562341",
    MemberName: "Ananya Verma",
    TypeOfService: "PT Package",
    Description: "24-Session PT Pack",
    ValueOfService: "36000",
    Taxes: "6480",
    UtilisedValueOfService: "18000",
    BalanceValueOfService: "18000",

    RequestedRefundAmount: "18000",
    DeferredRevenue: "18000",
    Reason: "Relocation",
    ClubManagerRemarks: "Member relocating out of city",
    ApprovedBy: "—",
    Status: "Pending",
  },
  {
    ClubName: "Summit Plaza",
    SupplierGSTIN: "07AAACD1234F1Z2",
    InvoiceDate: "20-Dec-2025",
    InvoiceNo: "DLF202600031",
    MemberID: "MB-774521",
    MemberName: "Neha Kapoor",
    TypeOfService: "Membership",
    Description: "6-Month",
    ValueOfService: "30000",
    Taxes: "5400",
    UtilisedValueOfService: "10000",
    BalanceValueOfService: "20000",

    RequestedRefundAmount: "30000",
    DeferredRevenue: "20000",
    Reason: "Policy exception",
    ClubManagerRemarks: "Outside refund window",
    ApprovedBy: "Sakshi",
    Status: "Denied",
  },
];

const RefundRequests = () => {
  const [data] = useState(dummyData);
  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);
  const { user } = useSelector((state) => state.auth);

  const currentRole = user.role

  const [selectedRow, setSelectedRow] = useState(null);
  const [modalType, setModalType] = useState(null); // approve | deny | view

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
  const openApproveModal = (row) => {
    setSelectedRow(row);
    setModalType("approve");
  };

  const openDenyModal = (row) => {
    setSelectedRow(row);
    setModalType("deny");
  };

  const openViewModal = (row) => {
    setSelectedRow(row);
    setModalType("view");
  };

  const closeModal = () => {
    setSelectedRow(null);
    setModalType(null);
  };

  const approveSchema = Yup.object({
    approvalType: Yup.object().required("Required"),
    approvedRefundAmount: Yup.number().required("Required"),
    deferredRevenue: Yup.number().required("Required"),
  });

  const denySchema = Yup.object({
    reason: Yup.object().required("Required"),
    financeRemarks: Yup.string().required("Required"),
  });

  return (
    <div className="page--content">
      {/* Header */}
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">
            {`Home > Reports > Finance Reports > Refund Requests`}
          </p>
          <h1 className="text-3xl font-semibold">Refund Requests</h1>
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
      <div className="w-full p-3 border bg-white shadow--box rounded-[10px]">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-2 py-4 min-w-[150px]">Club Name</th>
                <th className="px-2 py-4 min-w-[160px]">Supplier GSTIN</th>
                <th className="px-2 py-4 min-w-[130px]">Invoice Date</th>
                <th className="px-2 py-4 min-w-[150px]">Invoice No.</th>
                <th className="px-2 py-4 min-w-[120px]">Member ID</th>
                <th className="px-2 py-4 min-w-[140px]">Member Name</th>
                <th className="px-2 py-4 min-w-[130px]">Type of Service</th>
                <th className="px-2 py-4 min-w-[150px]">Description</th>
                <th className="px-2 py-4 min-w-[130px]">Value of Service</th>
                <th className="px-2 py-4 min-w-[100px]">Taxes</th>
                <th className="px-2 py-4 min-w-[170px]">Utilised Service</th>
                <th className="px-2 py-4 min-w-[170px]">Balance Service</th>
                <th className="px-2 py-4 min-w-[160px]">Req. Refund Amount</th>
                <th className="px-2 py-4 min-w-[150px]">Deferred Revenue</th>
                <th className="px-2 py-4 min-w-[150px]">Reason</th>
                <th className="px-2 py-4 min-w-[220px]">
                  Club Manager Remarks
                </th>
                <th className="px-2 py-4 min-w-[120px]">Approved By</th>
                <th className="px-2 py-4 min-w-[120px]">Status</th>
                {currentRole !== "CLUB_MANAGER" && (
                  <th className="px-2 py-4 min-w-[140px]">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.length ? (
                data.map((row, index) => (
                  <tr
                    key={index}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <td className="px-2 py-4">{row.ClubName}</td>
                    <td className="px-2 py-4">{row.SupplierGSTIN}</td>
                    <td className="px-2 py-4">{row.InvoiceDate}</td>
                    <td className="px-2 py-4">{row.InvoiceNo}</td>
                    <td className="px-2 py-4">{row.MemberID}</td>
                    <td className="px-2 py-4">{row.MemberName}</td>
                    <td className="px-2 py-4">{row.TypeOfService}</td>
                    <td className="px-2 py-4">{row.Description}</td>
                    <td className="px-2 py-4">₹{row.ValueOfService}</td>
                    <td className="px-2 py-4">₹{row.Taxes}</td>
                    <td className="px-2 py-4">₹{row.UtilisedValueOfService}</td>
                    <td className="px-2 py-4">₹{row.BalanceValueOfService}</td>
                    <td className="px-2 py-4">₹{row.RequestedRefundAmount}</td>
                    <td className="px-2 py-4">₹{row.DeferredRevenue}</td>
                    <td className="px-2 py-4">{row.Reason}</td>
                    <td className="px-2 py-4">{row.ClubManagerRemarks}</td>
                    <td className="px-2 py-4">{row.ApprovedBy}</td>
                    <td className="px-2 py-4">
                      <span
                        className={`
                                                                      flex items-center justify-between gap-1 rounded-full min-h-[30px] px-3 text-sm w-fit
                                                                    ${
                                                                      row.Status ===
                                                                      "Approved"
                                                                        ? "bg-[#E8FFE6] text-[#138808]"
                                                                        : row.Status ===
                                                                          "Denied"
                                                                        ? "bg-red-100 text-red-700"
                                                                        : "bg-yellow-100 text-yellow-700"
                                                                    }
                                                                    `}
                      >
                        <FaCircle className="text-[10px]" /> {row.Status}
                      </span>
                    </td>
                    {currentRole !== "CLUB_MANAGER" && (
                    <td className="px-2 py-2">
                      {row.Status === "Pending" && (
                        <div className="flex gap-1 text-sm">
                          <button
                            type="button"
                            onClick={() => openApproveModal(row)}
                            className="px-2 py-1 bg-green-200 border border-green-200 text-green-600 rounded w-fit"
                          >
                            Approve
                          </button>

                          <button
                            className="px-2 py-1 bg-red-200 border border-red-200 text-red-600  rounded w-fit"
                            onClick={() => openDenyModal(row)}
                          >
                            Deny
                          </button>
                        </div>
                      )}

                      {row.Status !== "Pending" && (
                        <button
                          className="px-2 py-1 bg-black border border-black text-white rounded w-fit"
                          onClick={() => openViewModal(row)}
                        >
                          View
                        </button>
                      )}
                    </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="text-center py-4">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalType && selectedRow && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className=" max-w-[700px] w-full relative">
            {/* Modal header */}
            <div className="bg-white rounded-t-[10px] flex gap-3 items-center justify-between py-4 px-4 border-b">
              <h2 className="text-xl font-semibold capitalize">
                {modalType} Refund
              </h2>
              <div className="close--lead cursor-pointer" onClick={closeModal}>
                <IoCloseCircle className="text-3xl" />
              </div>
            </div>

            {/* ---------------- APPROVE MODAL ---------------- */}
            {modalType === "approve" && (
              <Formik
                initialValues={{
                  approvalType: null,
                  approvedRefundAmount: selectedRow.BalanceValueOfService,
                  deferredRevenue: selectedRow.BalanceValueOfService,
                  financeRemarks: "",
                }}
                validationSchema={approveSchema}
                onSubmit={(values) => {
                  console.log("APPROVE DATA", values);
                  closeModal();
                }}
              >
                {({ setFieldValue, values, errors }) => (
                  <Form>
                    <div className="bg-white p-6 rounded-b-[10px]">
                      <div className="grid grid-cols-2 gap-4">
                        <Select
                          placeholder="Approval Type"
                          options={[
                            { label: "Partial Refund", value: "partial" },
                            { label: "Full Refund", value: "full" },
                          ]}
                          styles={customStyles}
                          value={values.approvalType}
                          onChange={(val) => setFieldValue("approvalType", val)}
                        />

                        <input
                          disabled
                          value={`₹${selectedRow.ValueOfService}`}
                          className="custom--input w-full cursor-not-allowed pointer-events-none !bg-gray-100 !text-gray-500"
                        />
                        <input
                          disabled
                          value={`₹${selectedRow.UtilisedValueOfService}`}
                          className="custom--input w-full cursor-not-allowed pointer-events-none !bg-gray-100 !text-gray-500"
                        />
                        <input
                          disabled
                          value={`₹${selectedRow.BalanceValueOfService}`}
                          className="custom--input w-full cursor-not-allowed pointer-events-none !bg-gray-100 !text-gray-500"
                        />

                        <Field
                          name="approvedRefundAmount"
                          placeholder="Approved Refund Amount (₹)"
                          className="custom--input w-full cursor-not-allowed pointer-events-none !bg-gray-100 !text-gray-500"
                        />

                        <Field
                          name="deferredRevenue"
                          placeholder="Deferred Revenue (₹)"
                          className="custom--input w-full cursor-not-allowed pointer-events-none !bg-gray-100 !text-gray-500"
                        />

                        <Field
                          as="textarea"
                          name="financeRemarks"
                          placeholder="Finance Remarks"
                          className="col-span-2 custom--input w-full"
                        />
                      </div>
                    </div>

                    <div className={`flex gap-4 py-5 justify-end`}>
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 bg-transparent border border-white text-white font-semibold rounded max-w-[150px] w-full"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-white text-black font-semibold rounded max-w-[150px] w-full"
                      >
                        Approve
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            )}

            {/* ---------------- DENY MODAL ---------------- */}
            {modalType === "deny" && (
              <Formik
                initialValues={{
                  reason: null,
                  financeRemarks: "",
                }}
                validationSchema={denySchema}
                onSubmit={(values) => {
                  console.log("DENY DATA", values);
                  closeModal();
                }}
              >
                {({ setFieldValue, values }) => (
                  <Form>
                    <div className="bg-white p-6 rounded-b-[10px]">
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          disabled
                          value={`₹${selectedRow.RequestedRefundAmount}`}
                          className="custom--input w-full cursor-not-allowed pointer-events-none !bg-gray-100 !text-gray-500"
                        />

                        <Select
                          placeholder="Reason"
                          options={[
                            { label: "Relocation", value: "relocation" },
                            { label: "Policy Exception", value: "policy" },
                          ]}
                          styles={customStyles}
                          value={values.reason}
                          onChange={(val) => setFieldValue("reason", val)}
                        />

                        <textarea
                          disabled
                          value={selectedRow.ClubManagerRemarks}
                          className="col-span-2 custom--input w-full cursor-not-allowed pointer-events-none !bg-gray-100 !text-gray-500"
                        />

                        <Field
                          as="textarea"
                          name="financeRemarks"
                          placeholder="Finance Remarks"
                          className="col-span-2 custom--input w-full"
                        />
                      </div>
                    </div>

                    <div className={`flex gap-4 py-5 justify-end`}>
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 bg-transparent border border-white text-white font-semibold rounded max-w-[150px] w-full"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-white text-black font-semibold rounded max-w-[150px] w-full"
                      >
                        Deny
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            )}

            {/* ---------------- VIEW MODAL ---------------- */}
            {modalType === "view" && (
              <>
                <div className="bg-white p-6 rounded-b-[10px]">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <b>Status:</b> {selectedRow.Status}
                    </div>
                    <div>
                      <b>Approved By:</b> {selectedRow.ApprovedBy}
                    </div>
                    <div>
                      <b>Requested Refund:</b> ₹
                      {selectedRow.RequestedRefundAmount}
                    </div>
                    <div>
                      <b>Deferred Revenue:</b> ₹{selectedRow.DeferredRevenue}
                    </div>
                  </div>
                </div>

                <div className={`flex gap-4 py-5 justify-end`}>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 bg-white border border-white text-black font-semibold rounded max-w-[150px] w-full"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RefundRequests;
