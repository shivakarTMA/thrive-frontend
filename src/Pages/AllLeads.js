import React, { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import { useDropzone } from "react-dropzone";
import { FaAngleLeft, FaAngleRight, FaCircle } from "react-icons/fa";
import { IoIosAddCircleOutline, IoIosSearch } from "react-icons/io";
import { FiPlus } from "react-icons/fi";
import { LiaEdit } from "react-icons/lia";
import { MdCall } from "react-icons/md";
import Select from "react-select";
import { customStyles, dasboardStyles, formatAutoDate } from "../Helper/helper";
import CreateLeadForm from "./CreateLeadForm";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import MailIcon from "../assets/images/icons/mail.png";
import SmsIcon from "../assets/images/icons/sms.png";
import AssignIcon from "../assets/images/icons/assign.png";
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
import { FaCalendarDays } from "react-icons/fa6";
import LeadFilterPanel from "../components/FilterPanel/LeadFilterPanel";
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
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
  const [appointmentModal, setAppointmentModal] = useState(false);
  const [leadPaymentSend, setLeadPaymentSend] = useState(null);

  const [selectedIds, setSelectedIds] = useState([]);
  const [assignedOwners, setAssignedOwners] = useState({});
  const [bulkOwner, setBulkOwner] = useState(null);
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);

  const [selectedLeadSource, setSelectedLeadSource] = useState(null);
  const [selectedLeadStatus, setSelectedLeadStatus] = useState(null);
  const [selectedLastCallType, setSelectedLastCallType] = useState(null);
  const [selectedCallTag, setSelectedCallTag] = useState(null);
  const [selectedServiceName, setSelectedServiceName] = useState(null);
  const [selectedGender, setSelectedGender] = useState(null);

  const [dateFilter, setDateFilter] = useState(dateFilterOptions[0]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  const [allLeads, setAllLeads] = useState([]);

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

  // Handle submit bulk assignment (Assign Icon click logic)
  const handleSubmitAssign = () => {
    if (selectedIds.length === 0) {
      // If no leads are selected, show an alert
      toast.error("Please select the Lead to assign owners.");
      setShowOwnerDropdown(false);
    } else {
      // If there are selected leads, show the dropdown to select an owner
      setShowOwnerDropdown((prev) => !prev);
    }
  };

  // Confirm assignment
  const confirmAssign = () => {
    console.log("Assigned Leads:", selectedIds); // Log selected lead IDs
    console.log("Assigned Owner:", bulkOwner); // Log assigned owner
    setShowOwnerDropdown(false); // Hide the dropdown
    setSelectedIds([]); // Clear selection
    setBulkOwner(null); // Clear bulk owner
  };

  const handleCommunicate = (type) => {
    if (selectedIds.length === 0) {
      // If no leads are selected, show an alert
      toast.error(`Please select the Lead to ${type} owners.`);
    } else {
      let url;
      const dummyData = {
        id: selectedIds[0], // assuming you're sending the first selected id as an example
      };

      const queryParams = new URLSearchParams(dummyData).toString();

      if (type === "sms") {
        url = `/memsssms?${queryParams}`; // URL for sending SMS
      } else if (type === "email") {
        url = `/memssmail?${queryParams}`; // URL for sending Email
      }

      // Redirect to the respective URL
      if (url) {
        window.location.href = url;
      }
    }
  };

  const fetchLeadList = async (
    search = searchTerm,
    currentPage = page,
    overrideSelected = {}
  ) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };

      const selLeadSource = overrideSelected.hasOwnProperty("leadSource")
        ? overrideSelected.leadSource
        : selectedLeadSource;
      const selLeadStatus = overrideSelected.hasOwnProperty("leadStatus")
        ? overrideSelected.leadStatus
        : selectedLeadStatus;
      const selLastCallType = overrideSelected.hasOwnProperty("lastCallType")
        ? overrideSelected.lastCallType
        : selectedLastCallType;
      const selCallTag = overrideSelected.hasOwnProperty("callTag")
        ? overrideSelected.callTag
        : selectedCallTag;
      const selServiceName = overrideSelected.hasOwnProperty("serviceName")
        ? overrideSelected.serviceName
        : selectedServiceName;
      const selGender = overrideSelected.hasOwnProperty("gender")
        ? overrideSelected.gender
        : selectedGender;
      const selDateFilter = overrideSelected.hasOwnProperty("dateFilter")
        ? overrideSelected.dateFilter
        : dateFilter;
      const selCustomFrom = overrideSelected.hasOwnProperty("customFrom")
        ? overrideSelected.customFrom
        : customFrom;
      const selCustomTo = overrideSelected.hasOwnProperty("customTo")
        ? overrideSelected.customTo
        : customTo;

      // Search param
      if (search) params.search = search;

      // Add filters only if the selected value exists (prevents sending removed keys)
      if (selLeadSource?.value) params.lead_source = selLeadSource.value;
      if (selLeadStatus?.value) params.lead_status = selLeadStatus.value;
      if (selLastCallType?.value)
        params.last_call_status = selLastCallType.value;
      if (selCallTag?.value) params.created_by = selCallTag.value;
      if (selServiceName?.value) params.interested_in = selServiceName.value;
      if (selGender?.value) params.gender = selGender.value;

      // Date filter handling (use merged values)
      if (selDateFilter?.value && selDateFilter.value !== "custom") {
        params.dateFilter = selDateFilter.value;
      } else if (
        selDateFilter?.value === "custom" &&
        selCustomFrom &&
        selCustomTo
      ) {
        params.startDate = selCustomFrom.toISOString().split("T")[0];
        params.endDate = selCustomTo.toISOString().split("T")[0];
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
    const delayDebounce = setTimeout(() => {
      fetchLeadList(searchTerm, 1);
      setPage(1);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleRemoveFilter = (filterKey) => {
    const setterMap = {
      leadSource: setSelectedLeadSource,
      lastCallType: setSelectedLastCallType,
      leadStatus: setSelectedLeadStatus,
      callTag: setSelectedCallTag,
      serviceName: setSelectedServiceName,
      gender: setSelectedGender,
    };
    setterMap[filterKey]?.(null);
    const overrideSelected = { [filterKey]: null };
    fetchLeadList("", 1, overrideSelected);
  };

  const handleApplyFiltersFromChild = () => {
    fetchLeadList("", 1);
  };

  useEffect(() => {
    fetchLeadList("", 1);
  }, []);
  useEffect(() => {
    fetchLeadList(searchTerm, 1);
  }, [dateFilter, customFrom, customTo]);

  return (
    <>
      <div className="page--content">
        <div className="flex items-end justify-between gap-2 mb-2">
          <div className="title--breadcrumbs">
            <p className="text-sm">{`Home > My Leads > All Leads`}</p>
            <h1 className="text-3xl font-semibold">All Leads</h1>
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
        </div>
        <div className="grid grid-cols-2 gap-5 mb-5 p-3 border bg-white shodow--box rounded-[10px]">
          <div className="border rounded-[5px] overflow-hidden w-full">
            <div className="flex gap-1 justify-between bg-[#F1F1F1] p-4 py-3">
              <div className="text-xl font-bold">Total Enquiries</div>
              <div className="text-xl font-bold">15</div>
            </div>
            <div className="grid grid-cols-3 h-full">
              <div className="flex flex-col border-r text-center p-3 py-5 w-full">
                <div className="text-lg font-medium text-black">Open</div>
                <div className="">
                  <span className="text-lg font-semibold">10</span>
                </div>
              </div>
              <div className="flex flex-col border-r text-center p-3 py-5 w-full">
                <div className="text-lg font-medium text-black">Converted</div>
                <div className="">
                  <span className="text-lg font-semibold">05</span>
                </div>
              </div>
              <div className="flex flex-col text-center p-3 py-5 w-full">
                <div className="text-lg font-medium text-black">Lost</div>
                <div className="">
                  <span className="text-lg font-semibold">00</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border rounded-[5px] overflow-hidden w-full">
            <div className="flex gap-1 justify-between bg-[#F1F1F1] p-4 py-3">
              <div className="text-xl font-bold">Open Enquiries</div>
              <div className="text-xl font-bold">10</div>
            </div>
            <div className="grid grid-cols-3 h-full">
              <div className="flex flex-col border-r text-center p-3 py-5 w-full">
                <div className="text-lg font-medium text-black">Enquiries</div>
                <div className="">
                  <span className="text-lg font-semibold">07</span>
                </div>
              </div>
              <div className="flex flex-col border-r text-center p-3 py-5 w-full">
                <div className="text-lg font-medium text-black">
                  Trials Scheduled
                </div>
                <div className="">
                  <span className="text-lg font-semibold">02</span>
                </div>
              </div>
              <div className="flex flex-col text-center p-3 py-5 w-full">
                <div className="text-lg font-medium text-black">
                  Trial Completed
                </div>
                <div className="">
                  <span className="text-lg font-semibold">01</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full p-3 border bg-white shodow--box rounded-[10px]">
          <div className="flex items-start gap-3 justify-between w-full mb-3 border-b border-b-[#D4D4D4] pb-3">
            <div>
              <LeadFilterPanel
                selectedLeadSource={selectedLeadSource}
                setSelectedLeadSource={setSelectedLeadSource}
                selectedLastCallType={selectedLastCallType}
                selectedLeadStatus={selectedLeadStatus}
                setSelectedLeadStatus={setSelectedLeadStatus}
                selectedCallTag={selectedCallTag}
                setSelectedCallTag={setSelectedCallTag}
                setSelectedLastCallType={setSelectedLastCallType}
                selectedGender={selectedGender}
                setSelectedGender={setSelectedGender}
                selectedServiceName={selectedServiceName}
                setSelectedServiceName={setSelectedServiceName}
                onApplyFilters={handleApplyFiltersFromChild} // child "Apply" -> parent fetch
                onRemoveFilter={handleRemoveFilter}
              />
            </div>
            <div>
              <div className="flex gap-2 items-center">
                {showOwnerDropdown && (
                  <div>
                    <Select
                      options={ownerOptions}
                      onChange={handleBulkAssign}
                      placeholder="Select an owner"
                      styles={dasboardStyles}
                      className="min-w-[150px] w-full"
                    />
                  </div>
                )}
                <img
                  src={AssignIcon}
                  className="w-8 cursor-pointer"
                  onClick={handleSubmitAssign}
                />
                <img
                  src={SmsIcon}
                  className="w-8 cursor-pointer"
                  onClick={() => handleCommunicate("sms")}
                />
                <img
                  src={MailIcon}
                  className="w-8 cursor-pointer"
                  onClick={() => handleCommunicate("email")}
                />

                {/* Show confirm button after selecting an owner */}
                {bulkOwner && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-lg w-96 text-center">
                      <h2 className="text-lg font-semibold mb-4">
                        Confirm Assignment
                      </h2>
                      <p className="mb-4">
                        Are you sure you want to assign{" "}
                        <strong>{selectedIds.length}</strong> lead(s) to{" "}
                        <strong>{bulkOwner?.label}</strong>?
                      </p>
                      <div className="flex justify-center gap-4">
                        <button
                          onClick={() => setBulkOwner(null)}
                          className="px-4 py-2 bg-white text-black border-black border rounded-[5px] flex items-center gap-2"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={confirmAssign}
                          className="px-4 py-2 bg-black text-white rounded-[5px] border-black border flex items-center gap-2"
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="table--data--bottom w-full">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-2 py-4">#</th>
                    <th className="px-2 py-4">S.No</th>
                    <th className="px-2 py-4">Name</th>
                    <th className="px-2 py-4">Service Name</th>
                    <th className="px-2 py-4">Created on</th>
                    <th className="px-2 py-4">Lead Source</th>
                    <th className="px-2 py-4">Lead Status</th>
                    <th className="px-2 py-4">Last Call Status</th>
                    <th className="px-2 py-4">Lead Owner</th>
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

                      <td className="px-2 py-4">{row?.gender}</td>
                      <td className="px-2 py-4">
                        {row?.interested_in ? row?.interested_in : "--"}
                      </td>
                      <td className="px-2 py-4">
                        {formatAutoDate(row?.createdAt)}
                      </td>

                      <td className="px-2 py-4">
                        {row?.lead_source == null ? "--" : row?.lead_source}
                      </td>
                      <td className="px-2 py-4">
                        <span
                          className={`
                            flex items-center justify-between gap-1 rounded-full bg-[#EEEEEE] min-h-[30px] px-3 text-sm w-fit
                          ${
                            row?.lead_status == "Opportunity"
                              ? "bg-[#EEEEEE]"
                              : ""
                          }
                          ${row?.lead_status == "New" ? "bg-[#E4FCFF]" : ""}
                          `}
                        >
                          <FaCircle className="text-[10px]" />
                          {row?.lead_status == null ? "--" : row?.lead_status}
                        </span>
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
        </div>
      </div>

      {leadModal && (
        <CreateLeadForm
          setLeadModal={setLeadModal}
          selectedLead={selectedLead}
          onLeadUpdate={handleLeadUpdate}
        />
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
