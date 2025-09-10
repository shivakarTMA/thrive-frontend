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
import FiltersPanel from "./MultiSelectFilter";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { RiCalendarScheduleLine, RiResetLeftFill } from "react-icons/ri";
import { TbArrowsExchange } from "react-icons/tb";
import Tooltip from "../components/common/Tooltip";
import CreateMemberForm from "./CreateMemberForm";
import CreateInvoice from "./CreateInvoice";
import SendPaymentLink from "./SendPaymentLink";
import { toast } from "react-toastify";
import { apiAxios } from "../config/config";
import Pagination from "../components/common/Pagination";
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last7", label: "Last 7 Days" },
  { value: "monthTillDate", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
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
  const [leadPaymentSend, setLeadPaymentSend] = useState(null);
  const [activeTab, setActiveTab] = useState("Allleads");

  const [selectedIds, setSelectedIds] = useState([]);
  const [assignedOwners, setAssignedOwners] = useState({});
  const [bulkOwner, setBulkOwner] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const [selectedLeadSource, setSelectedLeadSource] = useState(null);
  const [selectedLeadStatus, setSelectedLeadStatus] = useState(null);
  const [selectedLastCallType, setSelectedLastCallType] = useState(null);
  const [selectedCallTag, setSelectedCallTag] = useState(null);

  const [dateFilter, setDateFilter] = useState(null);
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
    {
      label: "PT", // Group label
      options: [
        { value: "nitin", label: "Nitin" },
        { value: "esha", label: "Esha" },
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
        <div className="flex flex-wrap gap-3 mb-4 items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <FiltersPanel
              selectedLeadSource={selectedLeadSource}
              setSelectedLeadSource={setSelectedLeadSource}
              selectedLastCallType={selectedLastCallType}
              selectedLeadStatus={selectedLeadStatus}
              setSelectedLeadStatus={setSelectedLeadStatus}
              selectedCallTag={selectedCallTag}
              setSelectedCallTag={setSelectedCallTag}
              setSelectedLastCallType={setSelectedLastCallType}
            />

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
              isClearable
              styles={customStyles}
            />

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

          <div className="flex items-center gap-2 border rounded-[50px] px-2 bg-white">
            <IoIosSearch className="text-xl" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-xs px-3 py-2 border-none rounded-[50px] focus:outline-none"
            />
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 mb-3">
            <span className="font-medium text-gray-700">
              Assign {selectedIds.length} selected lead(s) to:
            </span>
            <Select
              options={ownerOptions}
              value={bulkOwner}
              onChange={handleBulkAssign}
              placeholder="Assign Owner"
              styles={customStyles}
            />
            <button
              onClick={handleSubmitAssign}
              className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
            >
              Submit
            </button>
          </div>
        )}

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

        <div className="flex gap-3 mb-3 items-center">
          <button
            onClick={() => setActiveTab("Allleads")}
            className={`flex items-center gap-1 ${
              activeTab == "Allleads" ? "text-black underline" : "text-gray-500"
            }`}
          >
            <FaCircle className="text-[10px]" />
            All Leads
          </button>
          <button
            onClick={() => setActiveTab("Assignleads")}
            className={`flex items-center gap-1 ${
              activeTab == "Assignleads"
                ? "text-black underline"
                : "text-gray-500"
            }`}
          >
            <FaCircle className="text-[10px]" />
            Assign Leads
          </button>
        </div>

        {/* Table */}
        {activeTab == "Allleads" && (
          <>
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-2 py-4">#</th>
                    {/* <th className="px-2 py-4">Lead ID</th> */}
                    <th className="px-2 py-4">Created on</th>
                    <th className="px-2 py-4">Last Updated</th>
                    <th className="px-2 py-4">Name</th>
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
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(row.id)}
                          onChange={() => handleCheckboxChange(row.id)}
                        />
                      </td>
                      <td className="px-2 py-4">
                        {formatAutoDate(row?.createdAt)}
                      </td>
                      <td className="px-2 py-4">
                        {formatAutoDate(row?.updatedAt)}
                      </td>
                      <td className="px-2 py-4">{row?.full_name}</td>
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

                      <div className="absolute hidden group-hover:flex gap-2 items-center right-0 h-full top-0 w-[80%] flex items-center justify-end bg-[linear-gradient(269deg,_#ffffff_30%,_transparent)] pr-5 transition duration-700">
                        <Tooltip
                          id={`tooltip-edit-${row.id}`}
                          content="Edit Lead"
                          place="top"
                        >
                          <div
                            onClick={() => {
                              setSelectedLead(row);
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
                            <Link
                              to={`/lead-follow-up/${row.id}`}
                              className="p-0"
                            >
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
                          content="Schedule Tour / Trial"
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
                          id={`tooltip-send-${row.id}`}
                          content="Send Payment Link"
                          place="top"
                        >
                          <div
                            onClick={() => {
                              setLeadPaymentSend(row);
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
          </>
        )}
        {activeTab == "Assignleads" && (
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-2 py-4">Created on</th>
                  <th className="px-2 py-4">Last Updated</th>
                  <th className="px-2 py-4">Name</th>
                  <th className="px-2 py-4">Lead Source</th>
                  <th className="px-2 py-4">Lead Status</th>
                  <th className="px-2 py-4">Last Call Status</th>
                  <th className="px-2 py-4">Lead Owner</th>
                </tr>
              </thead>
              <tbody>
                {assignLead.map((row, id) => (
                  <tr
                    key={row.id}
                    className="group bg-white border-b hover:bg-gray-50 relative transition duration-700"
                  >
                    <td className="px-2 py-4">
                      {formatAutoDate(row?.createdAt)}
                    </td>
                    <td className="px-2 py-4">
                      {formatAutoDate(row?.updatedAt)}
                    </td>
                    <td className="px-2 py-4">
                      {row?.firstname} {row?.lastname}
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

                    <div className="absolute hidden group-hover:flex gap-2 items-center right-0 h-full top-0 w-[80%] flex items-center justify-end bg-[linear-gradient(269deg,_#ffffff_30%,_transparent)] pr-5 transition duration-700">
                      <Tooltip
                        id={`tooltip-edit-${row.id}`}
                        content="Edit Lead"
                        place="top"
                      >
                        <div
                          onClick={() => {
                            setSelectedLead(row);
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
                          <Link
                            to={`/lead-follow-up/${row.id}`}
                            className="p-0"
                          >
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
                        content="Schedule Tour / Trial"
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
                        id={`tooltip-send-${row.id}`}
                        content="Send Payment Link"
                        place="top"
                      >
                        <div
                          onClick={() => {
                            setLeadPaymentSend(row);
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
        )}
      </div>

      {leadModal && (
        <CreateLeadForm
          setLeadModal={setLeadModal}
          selectedLead={selectedLead}
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
        <CreateMemberForm
          selectedLeadMember={selectedLeadMember}
          setMemberModal={setMemberModal}
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
    </>
  );
};

export default AllLeads;
