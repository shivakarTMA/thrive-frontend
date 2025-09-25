import React, { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import { useDropzone } from "react-dropzone";
import { FaAngleLeft, FaAngleRight, FaCircle } from "react-icons/fa";
import { IoIosAddCircleOutline, IoIosSearch } from "react-icons/io";
import { FiPlus } from "react-icons/fi";
import { LiaEdit } from "react-icons/lia";
import { MdCall } from "react-icons/md";
import Select from "react-select";
import { customStyles, formatAutoDate } from "../Helper/helper";
import { assignLead, leadList } from "../DummyData/DummyData";
import CreateLeadForm from "./CreateLeadForm";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  addYears,
  subYears,
  startOfToday,
  subDays,
  startOfMonth,
} from "date-fns";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { RiCalendarScheduleLine, RiResetLeftFill } from "react-icons/ri";
import { TbArrowsExchange } from "react-icons/tb";
import Tooltip from "../components/common/Tooltip";
import ConvertMemberForm from "./ConvertMemberForm";
import CreateInvoice from "./CreateInvoice";
import SendPaymentLink from "./SendPaymentLink";
import { toast } from "react-toastify";
import { apiAxios } from "../config/config";
import Pagination from "../components/common/Pagination";
import { LuCalendarPlus } from "react-icons/lu";
import CreateAppointment from "../components/Appointment/CreateAppointment";
import LeadFilterPanel from "../components/common/LeadFilterPanel";
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "last_30_days", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];
const communicateOptions = [
  { value: "sms", label: "Send SMS" },
  { value: "email", label: "Send Email" },
];

const AllLeads = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [leadModal, setLeadModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [memberModal, setMemberModal] = useState(false);
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [selectedLeadMember, setSelectedLeadMember] = useState(null);
  const [sendPaymentModal, setSendPaymentModal] = useState(false);
  const [appointmentModal, setAppointmentModal] = useState(false);
  const [leadPaymentSend, setLeadPaymentSend] = useState(null);

  const [selectedIds, setSelectedIds] = useState([]);
  const [assignedOwners, setAssignedOwners] = useState({});
  const [bulkOwner, setBulkOwner] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const [selectedLeadSource, setSelectedLeadSource] = useState(null);
  const [selectedLeadStatus, setSelectedLeadStatus] = useState(null);
  const [selectedLastCallType, setSelectedLastCallType] = useState(null);
  const [selectedCallTag, setSelectedCallTag] = useState(null);

  const [dateFilter, setDateFilter] = useState(dateFilterOptions[0]);
  const [sendCommunicate, setSendCommunicate] = useState(null);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  const [allLeads, setAllLeads] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewNewLeads, setPreviewNewLeads] = useState([]);
  const [previewDuplicateLeads, setPreviewDuplicateLeads] = useState([]);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const query = useQuery();
  const selectedStatus = query.get("leadStatus");
  const selectedView = query.get("view");

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const ownerOptions = [
    {
      label: "FOH", // Group label
      options: [
        { value: "shivakar", label: "Shivakar" },
        { value: "divakar", label: "Divakar" },
        { value: "parbhakar", label: "Parbhakar" },
      ],
    },
  ];

  // Handle bulk assigning owner to selected leads only
  const handleBulkAssign = (selectedOption) => {
    setBulkOwner(selectedOption); // Store selected option
    const updatedAssignments = { ...assignedOwners };
    selectedIds.forEach((id) => {
      updatedAssignments[id] = selectedOption; // Assign same owner to all selected leads
    });
    setAssignedOwners(updatedAssignments);
  };

  // Handle submit bulk assignment
  const handleSubmitAssign = () => {
    if (!bulkOwner) return; // Prevent submission without owner
    setShowConfirm(true); // Show confirmation popup
  };

  // Confirm assignment
  const confirmAssign = () => {
    console.log("Assigned Leads:", selectedIds); // Log selected lead IDs
    console.log("Assigned Owner:", bulkOwner); // Log assigned owner
    setShowConfirm(false); // Close popup
    setSelectedIds([]); // Clear selection
    setBulkOwner(null); // Clear bulk owner
  };

  const fetchLeadList = async (search = searchTerm, currentPage = page) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };

      // Search param
      if (search) params.search = search;

      // Lead Source
      if (selectedLeadSource?.value) {
        params.lead_source = selectedLeadSource.value;
      }

      // Lead Status
      if (selectedLeadStatus?.value) {
        params.lead_status = selectedLeadStatus.value;
      }

      // Last Call Status
      if (selectedLastCallType?.value) {
        params.last_call_status = selectedLastCallType.value;
      }

      // Lead Owner
      if (selectedCallTag?.value) {
        params.created_by = selectedCallTag.value;
      }

      // Date Filter
      if (dateFilter?.value && dateFilter.value !== "custom") {
        params.dateFilter = dateFilter.value; // today, last_7_days, etc.
      } else if (dateFilter?.value === "custom" && customFrom && customTo) {
        params.startDate = customFrom.toISOString().split("T")[0];
        params.endDate = customTo.toISOString().split("T")[0];
      }

      const res = await apiAxios().get("/lead/list", { params });

      const responseData = res.data;
      const data = responseData?.data || [];

      setAllLeads(data);
      setPage(responseData?.currentPage || 1);
      setTotalPages(responseData?.totalPage || 1);
      setTotalCount(responseData?.totalCount || data.length);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch leads");
    }
  };

  const handleLeadUpdate = () => {
    fetchLeadList();
  };

  useEffect(() => {
    fetchLeadList();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchLeadList(searchTerm, 1);
      setPage(1);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  useEffect(() => {
    fetchLeadList(searchTerm, 1);
  }, [
    selectedLeadSource,
    selectedLeadStatus,
    selectedLastCallType,
    selectedCallTag,
    dateFilter,
    customFrom,
    customTo,
  ]);

  const handleBulkUpload = (acceptedFiles) => {
    const file = acceptedFiles[0];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const existingPhones = new Set(
          allLeads.map((lead) => lead.phoneNumber)
        );
        const newLeads = [];
        const duplicates = [];
        const errors = [];

        results.data.forEach((row, idx) => {
          const name = row["Name"]?.trim();
          const phone = row["Phone Number"]?.trim();
          const email = row["Email"]?.trim();

          // Check required fields
          if (!name || !phone || !email) {
            errors.push({
              row: idx + 2,
              reason: "Missing Name, Phone, or Email",
            });
            return;
          }

          const isDuplicatePhone = existingPhones.has(phone);

          const leadObj = {
            id: allLeads.length + newLeads.length + 1,
            enquiryId: `ENQ${allLeads.length + newLeads.length + 1000}`,
            createdOn: new Date().toLocaleDateString("en-GB"),
            name,
            phoneNumber: phone,
            email,
            leadType: row["Lead Type"] || "Phone",
            leadSource: row["Lead Source"] || "Unknown",
            leadStatus: row["Lead Status"] || "New",
            lastUpdated: new Date().toLocaleDateString("en-GB"),
            callTag: "Not Called",
            staff: row["Staff"] || "Unassigned",
          };

          if (isDuplicatePhone) {
            duplicates.push(leadObj); // Only duplicates by phone
          } else {
            newLeads.push(leadObj);
          }
        });

        // setUploadErrors(errors);
        setPreviewNewLeads(newLeads);
        setPreviewDuplicateLeads(duplicates);
        setShowUploadModal(true);
      },
    });
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleBulkUpload,
    accept: ".csv",
  });

  console.log(allLeads, "cikid");

  const handleCommunicate = () => {
    if (!sendCommunicate) {
      toast.error("Please select a communication method.");
      return;
    }

    // Check if at least one lead is selected
    if (selectedIds.length === 0) {
      toast.error("Please select at least one lead.");
      return;
    }

    // If both conditions are met, proceed with submission logic
    console.log("Form Submitted", { sendCommunicate, selectedIds });
  };

  return (
    <>
      <div className="page--content">
        <div className="flex items-end justify-between gap-2 mb-5">
          <div className="title--breadcrumbs">
            <p className="text-sm">{`Home > My Leads > All Leads`}</p>
            <h1 className="text-3xl font-semibold">All Leads</h1>
          </div>
          <div className="flex items-end gap-2">
            <div
              {...getRootProps()}
              className="px-4 py-2 bg-white text-black rounded flex items-center gap-2 cursor-pointer border"
            >
              <input {...getInputProps()} />
              <FiPlus /> Bulk Upload
            </div>

            <button
              onClick={() => {
                setSelectedLead(null);
                setLeadModal(true);
              }}
              type="button"
              className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
            >
              <FiPlus /> Add New Lead
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4 items-center justify-between">
          <div className="flex gap-2 w-full">
            <LeadFilterPanel
              selectedLeadSource={selectedLeadSource}
              setSelectedLeadSource={setSelectedLeadSource}
              selectedLastCallType={selectedLastCallType}
              selectedLeadStatus={selectedLeadStatus}
              setSelectedLeadStatus={setSelectedLeadStatus}
              selectedCallTag={selectedCallTag}
              setSelectedCallTag={setSelectedCallTag}
              setSelectedLastCallType={setSelectedLastCallType}
            />

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
                <div className="custom--date dob-format">
                  <DatePicker
                    selected={customFrom}
                    onChange={(date) => setCustomFrom(date)}
                    placeholderText="From Date"
                    className="custom--input w-full max-w-[170px]"
                    minDate={subYears(new Date(), 20)}
                    maxDate={addYears(new Date(), 0)}
                    dateFormat="dd-MM-yyyy"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                  />
                </div>
                <div className="custom--date dob-format">
                  <DatePicker
                    selected={customTo}
                    onChange={(date) => setCustomTo(date)}
                    placeholderText="To Date"
                    className="custom--input w-full max-w-[170px]"
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

            {(selectedStatus || selectedView) && (
              <button
                onClick={() => navigate("/all-leads")}
                className="px-4 py-2 bg-white text-black rounded flex items-center gap-2"
              >
                <RiResetLeftFill className="mt-[1px]" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* <div className="flex items-center gap-2 border rounded-[50px] px-2 bg-white">
            <IoIosSearch className="text-xl" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-xs px-3 py-2 border-none rounded-[50px] focus:outline-none"
            />
          </div> */}
          <div className="flex gap-1 items-center w-full justify-end">
            <div className="max-w-[180px] w-full">
              <Select
                placeholder="Communicate"
                options={communicateOptions}
                value={sendCommunicate}
                onChange={(selected) => {
                  setSendCommunicate(selected);
                }}
                styles={customStyles}
                className="w-full"
                isClearable
              />
            </div>

            <button
              type="button"
              onClick={handleCommunicate} // Corrected to onClick
              className="px-4 py-2 bg-black text-white rounded-lg flex items-center gap-2 min-h-[44px]"
            >
              Submit
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-5 mb-5">
          <div className="border rounded p-4 w-full">
            <div className="flex gap-1 justify-between">
              <div className="text-2xl font-bold">Total Enquiries</div>
              <div className="text-2xl font-bold">15</div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="flex flex-col border rounded p-3 w-full">
                <div className="text-sm font-medium text-gray-600">Open</div>
                <div className="flex flex-wrap items-center justify-between mt-2">
                  <span className="text-lg font-semibold">10</span>
                </div>
              </div>
              <div className="flex flex-col border rounded p-3 w-full">
                <div className="text-sm font-medium text-gray-600">
                  Converted
                </div>
                <div className="flex flex-wrap items-center justify-between mt-2">
                  <span className="text-lg font-semibold">5</span>
                </div>
              </div>
              <div className="flex flex-col border rounded p-3 w-full">
                <div className="text-sm font-medium text-gray-600">Lost</div>
                <div className="flex flex-wrap items-center justify-between mt-2">
                  <span className="text-lg font-semibold">0</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border rounded p-4 w-full">
             <div className="flex gap-1 justify-between">
              <div className="text-2xl font-bold">Open Enquiries</div>
              <div className="text-2xl font-bold">15</div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="flex flex-col border rounded p-3 w-full">
                <div className="text-sm font-medium text-gray-600">Enquiry</div>
                <div className="flex flex-wrap items-center justify-between mt-2">
                  <span className="text-lg font-semibold">10</span>
                </div>
              </div>
              <div className="flex flex-col border rounded p-3 w-full">
                <div className="text-sm font-medium text-gray-600">
                  Trial Scheduled
                </div>
                <div className="flex flex-wrap items-center justify-between mt-2">
                  <span className="text-lg font-semibold">5</span>
                </div>
              </div>
              <div className="flex flex-col border rounded p-3 w-full">
                <div className="text-sm font-medium text-gray-600">Won</div>
                <div className="flex flex-wrap items-center justify-between mt-2">
                  <span className="text-lg font-semibold">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <span className="font-medium text-gray-700">
            Assign {selectedIds.length} selected lead(s) to:
          </span>
          <div className="max-w-[180px] w-full">
            <Select
              options={ownerOptions}
              value={bulkOwner}
              onChange={handleBulkAssign}
              placeholder="Assign Owner"
              styles={customStyles}
              className="w-full"
            />
          </div>
          <button
            onClick={handleSubmitAssign}
            className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
          >
            Submit
          </button>
        </div>

        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-96 text-center">
              <h2 className="text-lg font-semibold mb-4">Confirm Assignment</h2>
              <p className="mb-4">
                Are you sure you want to assign{" "}
                <strong>{selectedIds.length}</strong> lead(s) to{" "}
                <strong>{bulkOwner?.label}</strong>?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAssign}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-2 py-4">#</th>
                <th className="px-2 py-4">S.No</th>
                <th className="px-2 py-4">Enquiry ID</th>
                <th className="px-2 py-4">Created on</th>
                {/* <th className="px-2 py-4">Last Updated</th> */}
                <th className="px-2 py-4">Name</th>
                <th className="px-2 py-4">Service Name</th>
                <th className="px-2 py-4">Lead Source</th>
                <th className="px-2 py-4">Lead Status</th>
                <th className="px-2 py-4">Last Call Status</th>
                <th className="px-2 py-4">Lead Owner</th>
                {/* <th className="px-2 py-4">Action</th> */}
              </tr>
            </thead>
            <tbody>
              {allLeads.map((row, id) => (
                <tr
                  key={row.id}
                  className="group bg-white border-b hover:bg-gray-50 relative transition duration-700"
                >
                  <td className="px-2 py-4">
                    <div className="flex items-center custom--checkbox--2">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        checked={selectedIds.includes(row.id)}
                        onChange={() => handleCheckboxChange(row.id)}
                      />
                      <span className="checkmark--custom"></span>
                    </div>
                  </td>
                  <td className="px-2 py-4">{row?.id}</td>
                  <td className="px-2 py-4">4339161</td>

                  <td className="px-2 py-4">
                    {formatAutoDate(row?.createdAt)}
                  </td>
                  {/* <td className="px-2 py-4">
                        {formatAutoDate(row?.updatedAt)}
                      </td> */}
                  <td className="px-2 py-4">{row?.full_name}</td>
                  <td className="px-2 py-4">
                    {row?.interested_in ? row?.interested_in : "--"}
                  </td>
                  <td className="px-2 py-4">
                    {row?.lead_source == null ? "--" : row?.lead_source}
                  </td>
                  <td className="px-2 py-4">
                    {row?.lead_status == null ? "--" : row?.lead_status}
                  </td>
                  <td className="px-2 py-4">
                    {row?.last_call_status == null
                      ? "--"
                      : row?.last_call_status}
                  </td>
                  <td className="px-2 py-4">
                    {row?.created_by == null ? "--" : row?.created_by}
                  </td>

                  <div className="absolute hidden group-hover:flex gap-2 right-0 h-full top-0 w-[50%] items-center justify-end bg-[linear-gradient(269deg,_#ffffff_30%,_transparent)] pr-5 transition duration-700">
                    <Tooltip
                      id={`tooltip-edit-${row.id}`}
                      content="Edit Lead"
                      place="top"
                    >
                      <div
                        onClick={() => {
                          setSelectedLead(row?.id);
                          setLeadModal(true);
                        }}
                        className="p-1 cursor-pointer"
                      >
                        <LiaEdit className="text-[25px] text-black" />
                      </div>
                    </Tooltip>
                    <Tooltip
                      id={`tooltip-call-${row.id}`}
                      content="Add Call log"
                      place="top"
                    >
                      <div className="p-1 cursor-pointer">
                        <Link to={`/lead-follow-up/${row.id}`} className="p-0">
                          <MdCall className="text-[25px] text-black" />
                        </Link>
                      </div>
                    </Tooltip>
                    <Tooltip
                      id={`tooltip-convert-${row.id}`}
                      content="Convert to member"
                      place="top"
                    >
                      <div
                        onClick={() => {
                          setSelectedLeadMember(row);
                          setMemberModal(true);
                        }}
                        className="p-1 cursor-pointer"
                      >
                        <TbArrowsExchange className="text-[25px] text-black" />
                      </div>
                    </Tooltip>
                    <Tooltip
                      id={`tooltip-schedule-${row.id}`}
                      content="Schedule Trial"
                      place="top"
                    >
                      <div className="p-1 cursor-pointer">
                        <Link
                          to={`/lead-follow-up/${row.id}?action=schedule-tour-trial`}
                          className="p-0"
                        >
                          <RiCalendarScheduleLine className="text-[25px] text-black" />
                        </Link>
                      </div>
                    </Tooltip>

                    <Tooltip
                      id={`tooltip-appointment-${row.id}`}
                      content="Add Appointment"
                      place="top"
                    >
                      <div
                        onClick={() => {
                          setAppointmentModal(true);
                        }}
                        className="p-1 cursor-pointer"
                      >
                        <LuCalendarPlus className="text-[25px] text-black" />
                      </div>
                    </Tooltip>

                    <Tooltip
                      id={`tooltip-send-${row.id}`}
                      content="Send Payment Link"
                      place="top"
                    >
                      <div
                        onClick={() => {
                          setLeadPaymentSend(row.id);
                          setSendPaymentModal(true);
                        }}
                        className="p-1 cursor-pointer"
                      >
                        <IoIosAddCircleOutline className="text-[25px] text-black" />
                      </div>
                    </Tooltip>
                  </div>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          currentDataLength={allLeads.length}
          onPageChange={(newPage) => {
            setPage(newPage);
            fetchLeadList(searchTerm, newPage);
          }}
        />
      </div>

      {leadModal && (
        <CreateLeadForm
          setLeadModal={setLeadModal}
          selectedLead={selectedLead}
          onLeadUpdate={handleLeadUpdate}
        />
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">CSV Upload Preview</h2>

            {previewDuplicateLeads.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-red-600 mb-1">
                  ❗ Duplicate Phone Numbers Found:
                </h3>
                <table className="w-full text-sm border">
                  <thead className="bg-red-100">
                    <tr>
                      <th className="p-2 border">Name</th>
                      <th className="p-2 border">Phone Number</th>
                      <th className="p-2 border">Email</th>
                      <th className="p-2 border">Lead Type</th>
                      <th className="p-2 border">Lead Source</th>
                      <th className="p-2 border">Lead Status</th>
                      <th className="p-2 border">Staff</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewDuplicateLeads.map((lead, idx) => (
                      <tr key={idx}>
                        <td className="p-2 border">{lead?.name}</td>
                        <td className="p-2 border">{lead?.phone}</td>
                        <td className="p-2 border">{lead?.email}</td>
                        <td className="p-2 border">{lead?.leadType}</td>
                        <td className="p-2 border">{lead?.leadSource}</td>
                        <td className="p-2 border">{lead?.leadStatus}</td>
                        <td className="p-2 border">{lead?.staff}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {previewNewLeads.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-green-700 mb-1">
                  ✅ Leads Ready to Import:
                </h3>
                <table className="w-full text-sm border">
                  <thead className="bg-green-100">
                    <tr>
                      <th className="p-2 border">Name</th>
                      <th className="p-2 border">Phone Number</th>
                      <th className="p-2 border">Email</th>
                      <th className="p-2 border">Lead Type</th>
                      <th className="p-2 border">Lead Source</th>
                      <th className="p-2 border">Lead Status</th>
                      <th className="p-2 border">Staff</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewNewLeads.map((lead, idx) => (
                      <tr key={idx}>
                        <td className="p-2 border">{lead?.name}</td>
                        <td className="p-2 border">{lead?.phone}</td>
                        <td className="p-2 border">{lead?.email}</td>
                        <td className="p-2 border">{lead?.leadType}</td>
                        <td className="p-2 border">{lead?.leadSource}</td>
                        <td className="p-2 border">{lead?.leadStatus}</td>
                        <td className="p-2 border">{lead?.staff}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setPreviewNewLeads([]);
                  setPreviewDuplicateLeads([]);
                }}
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Cancel
              </button>
              {previewDuplicateLeads.length > 0 ? null : (
                <button
                  onClick={() => {
                    setAllLeads((prev) => [...prev, ...previewNewLeads]);
                    setShowUploadModal(false);
                    setPreviewNewLeads([]);
                    setPreviewDuplicateLeads([]);
                  }}
                  className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800"
                >
                  Confirm Upload
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {memberModal && (
        <ConvertMemberForm
          selectedLeadMember={selectedLeadMember}
          setMemberModal={setMemberModal}
          setSelectedLead={setSelectedLead}
          onLeadUpdate={handleLeadUpdate}
        />
      )}
      {invoiceModal && (
        <CreateInvoice
          leadPaymentSend={leadPaymentSend}
          setInvoiceModal={setInvoiceModal}
        />
      )}
      {sendPaymentModal && (
        <SendPaymentLink
          leadPaymentSend={leadPaymentSend}
          setSendPaymentModal={setSendPaymentModal}
        />
      )}
      {appointmentModal && (
        <CreateAppointment
          setAppointmentModal={setAppointmentModal}
          defaultCategory="complementary"
        />
      )}
    </>
  );
};

export default AllLeads;
