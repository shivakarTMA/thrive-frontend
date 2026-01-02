import React, { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import { useDropzone } from "react-dropzone";
import { FaAngleLeft, FaAngleRight, FaCircle } from "react-icons/fa";
import { IoIosAddCircleOutline, IoIosSearch } from "react-icons/io";
import { FiPlus } from "react-icons/fi";
import { LiaEdit } from "react-icons/lia";
import { MdCall } from "react-icons/md";
import Select from "react-select";
import {
  customStyles,
  dasboardStyles,
  filterActiveItems,
  formatAutoDate,
} from "../Helper/helper";
import CreateLeadForm from "./CreateLeadForm";
import { Link, useParams, useSearchParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import MailIcon from "../assets/images/icons/mail.png";
import SmsIcon from "../assets/images/icons/sms.png";
import AssignIcon from "../assets/images/icons/assign.png";
import { addYears, subYears } from "date-fns";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { RiCalendarScheduleLine } from "react-icons/ri";
import { TbArrowsExchange } from "react-icons/tb";
import Tooltip from "../components/common/Tooltip";
import ConvertMemberForm from "./ConvertMemberForm";
import CreateInvoice from "./CreateInvoice";
import SendPaymentLink from "./SendPaymentLink";
import { toast } from "react-toastify";
import { authAxios } from "../config/config";
import Pagination from "../components/common/Pagination";
import { LuCalendarPlus } from "react-icons/lu";
import CreateLeadAppointment from "../components/Appointment/CreateLeadAppointment";
import { FaCalendarDays } from "react-icons/fa6";
import LeadFilterPanel from "../components/FilterPanel/LeadFilterPanel";
import { useSelector } from "react-redux";
import Sidebar from "../components/common/Sidebar";
import Topbar from "../components/common/Topbar";

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const AllLeads = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const [toggleMenuBar, setToggleMenuBar] = useState(false);

  const userRole = user.role;
  const [leadModal, setLeadModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [memberModal, setMemberModal] = useState(false);
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [selectedLeadMember, setSelectedLeadMember] = useState(null);
  const [sendPaymentModal, setSendPaymentModal] = useState(false);
  const [appointmentModal, setAppointmentModal] = useState(false);
  const [leadPaymentSend, setLeadPaymentSend] = useState(null);
  const leadModalPage = "ALLLEAD";
  const [leadTopModal, setLeadTopModal] = useState(false);

  const [selectedUserId, setSelectedUserId] = useState([]);
  const [assignedOwners, setAssignedOwners] = useState({});
  const [bulkOwner, setBulkOwner] = useState(null);
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);

  const [selectedClub, setSelectedClub] = useState(null);
  const [selectedLeadSource, setSelectedLeadSource] = useState(null);
  const [selectedLeadStatus, setSelectedLeadStatus] = useState(null);
  const [selectedLastCallType, setSelectedLastCallType] = useState(null);
  const [selectedCallTag, setSelectedCallTag] = useState(null);
  const [selectedServiceName, setSelectedServiceName] = useState(null);
  const [selectedGender, setSelectedGender] = useState(null);

  const [searchParams] = useSearchParams();
  const [dateFilter, setDateFilter] = useState(dateFilterOptions[1]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  const [allLeads, setAllLeads] = useState([]);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [staffList, setStaffList] = useState([]);

  const handleCommunicate = (type) => {
    if (selectedUserId.length === 0) {
      toast.error(`Please select the Lead for ${type}.`);
      return;
    }

    const queryParams = new URLSearchParams({
      type: "lead",
      ids: selectedUserId.join(","),
    }).toString();

    let url = "";

    if (type === "sms") {
      url = `/send-sms?${queryParams}`;
    } else if (type === "email") {
      url = `/send-mail?${queryParams}`;
    }

    if (url) {
      window.location.href = url;
    }
  };

  useEffect(() => {
    const dateParam = searchParams.get("date");
    const customFromParam = searchParams.get("customFrom");
    const customToParam = searchParams.get("customTo");

    if (dateParam) {
      // Find the matching option from your dropdown
      const foundOption =
        dateFilterOptions.find((opt) => opt.value === dateParam) ||
        dateFilterOptions[1];
      setDateFilter(foundOption);

      if (dateParam === "custom" && customFromParam && customToParam) {
        // Decode and convert to JS Date
        const fromDate = new Date(decodeURIComponent(customFromParam));
        const toDate = new Date(decodeURIComponent(customToParam));

        setCustomFrom(fromDate);
        setCustomTo(toDate);
      }
    }
  }, []);

  const urlLastCallType = searchParams.get("last_call_status");
  const last_call_status = urlLastCallType
    ? decodeURIComponent(urlLastCallType)
    : null;

  const fetchLeadList = async (currentPage = page, overrideSelected = {}) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };

      if (id) {
        params.id = id;
        setDateFilter("");
      } else {
        const urlLeadStatus = searchParams.get("lead_status");
        const urlDate = searchParams.get("date");
        const urlCustomFrom = searchParams.get("customFrom");
        const urlCustomTo = searchParams.get("customTo");

        // ✅ Use overrideSelected first, then selected state, then URL, otherwise null
        const selLeadSource = overrideSelected.hasOwnProperty("lead_source")
          ? overrideSelected.lead_source
          : selectedLeadSource;
        const selLeadStatus = overrideSelected.hasOwnProperty("lead_status")
          ? overrideSelected.lead_status
          : selectedLeadStatus
          ? selectedLeadStatus
          : urlLeadStatus
          ? { label: urlLeadStatus, value: urlLeadStatus }
          : null;
        // const selLastCallType = overrideSelected.hasOwnProperty("last_call_status")
        //   ? overrideSelected.last_call_status
        //   : selectedLastCallType;
        const selLastCallType = overrideSelected.hasOwnProperty("last_call_status")
          ? overrideSelected.last_call_status
          : selectedLastCallType
          ? selectedLastCallType
          : last_call_status
          ? { label: last_call_status, value: last_call_status }
          : null;
        const selCallTag = overrideSelected.hasOwnProperty("created_by")
          ? overrideSelected.created_by
          : selectedCallTag;
        const selServiceName = overrideSelected.hasOwnProperty("interested_in")
          ? overrideSelected.interested_in
          : selectedServiceName;
        const selGender = overrideSelected.hasOwnProperty("gender")
          ? overrideSelected.gender
          : selectedGender;
        const selClub = overrideSelected.hasOwnProperty("club_id")
          ? overrideSelected.club_id
          : selectedClub;

        let selDateFilter =
          overrideSelected.dateFilter?.value || dateFilter?.value || urlDate;

        let selCustomFrom =
          overrideSelected.customFrom ||
          customFrom ||
          (urlCustomFrom ? new Date(decodeURIComponent(urlCustomFrom)) : null);
        let selCustomTo =
          overrideSelected.customTo ||
          customTo ||
          (urlCustomTo ? new Date(decodeURIComponent(urlCustomTo)) : null);

        // 🚫 Only use URL custom range if no manual override
        if (
          !overrideSelected.dateFilter &&
          !customFrom &&
          !customTo &&
          urlDate === "custom" &&
          urlCustomFrom &&
          urlCustomTo
        ) {
          selDateFilter = "custom";
          selCustomFrom = new Date(decodeURIComponent(urlCustomFrom));
          selCustomTo = new Date(decodeURIComponent(urlCustomTo));
        }

        // ✅ Build query params (only if value exists)

        if (selLeadSource?.value) params.lead_source = selLeadSource.value;
        if (selLeadStatus?.value) params.lead_status = selLeadStatus.value;
        if (selLastCallType?.value)
          params.last_call_status = selLastCallType.value;
        if (selCallTag?.value) params.created_by = selCallTag.value;
        if (selServiceName?.value) params.interested_in = selServiceName.value;
        if (selGender?.value) params.gender = selGender.value;
        if (selClub?.value) params.club_id = selClub.value;

        // ✅ Date filter
        if (selDateFilter && selDateFilter !== "custom") {
          params.dateFilter = selDateFilter;
        } else if (selDateFilter === "custom" && selCustomFrom && selCustomTo) {
          const formatDate = (date) => {
            const d = new Date(date);
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return `${d.getFullYear()}-${month}-${day}`;
          };

          params.startDate = formatDate(selCustomFrom);
          params.endDate = formatDate(selCustomTo);
        }
      }

      const res = await authAxios().get("/lead/list", { params });

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

  // 🚀 Fetch staff list from API
  const fetchStaff = async () => {
    try {
      const res = await authAxios().get("/staff/list?role=FOH");

      let data = res.data?.data || [];
      const activeOnly = filterActiveItems(data);
      setStaffList(activeOnly);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch staff");
    }
  };

  // Initial load effect
  useEffect(() => {
    fetchStaff();
  }, []);

  const staffOptions =
    staffList?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlDateFilter = searchParams.get("date");

    const foundDateOption = dateFilterOptions.find(
      (option) => option.value === urlDateFilter
    );

    if (id) {
      // If id exists, fetch by id, but also include URL date filter if any
      fetchLeadList(1, { id, dateFilter: foundDateOption });
    } else if (foundDateOption) {
      // If no id, but date filter exists in URL
      setDateFilter(foundDateOption);
      fetchLeadList(1, { dateFilter: foundDateOption });
    } else {
      // Default fetch without id or URL date filter
      fetchLeadList();
    }
  }, [id, location.search]);

  const handleDateFilterChange = (selected) => {
    setDateFilter(selected);

    // If custom date filter is selected, handle the logic for custom dates
    if (selected?.value !== "custom") {
      setCustomFrom(null);
      setCustomTo(null);
      // Navigate to /all-leads, setting the new date filter in the URL
      navigate(`/all-leads?date=${selected.value}`, { replace: true });

      // Re-fetch the lead list based on the selected filter
      fetchLeadList(1, { dateFilter: selected });
    } else {
      // Handle custom date filter logic here (e.g., open a date picker)
      // You may need to update the URL with a custom date range
    }
  };

  // Trigger only for custom range once both dates selected
  useEffect(() => {
    if (dateFilter?.value === "custom" && customFrom && customTo) {
      fetchLeadList(1, { dateFilter, customFrom, customTo });
    }
  }, [dateFilter, customFrom, customTo]);

  const handleLeadUpdate = () => {
    fetchLeadList();
  };

  const handleRemoveFilter = (filterKey) => {
    const setterMap = {
      club_id: setSelectedClub,
      lead_source: setSelectedLeadSource,
      last_call_status: setSelectedLastCallType,
      lead_status: setSelectedLeadStatus,
      created_by: setSelectedCallTag,
      interested_in: setSelectedServiceName,
      gender: setSelectedGender,
    };

    // Clear state
    setterMap[filterKey]?.(null);

    // Pass explicit null in overrideSelected so fetchLeadList knows to skip it
    const overrideSelected = { [filterKey]: null };
    fetchLeadList(1, overrideSelected);
  };

  const handleApplyFiltersFromChild = () => {
    fetchLeadList(1);
  };

  const handleCheckboxChange = (id) => {
    setSelectedUserId((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Handle bulk assigning owner to selected leads only
  const handleBulkAssign = (selectedOption) => {
    setBulkOwner(selectedOption); // Store selected option
    const updatedAssignments = { ...assignedOwners };
    selectedUserId.forEach((id) => {
      updatedAssignments[id] = selectedOption; // Assign same owner to all selected leads
    });
    setAssignedOwners(updatedAssignments);
  };

  // Handle submit bulk assignment (Assign Icon click logic)
  const handleSubmitAssign = () => {
    if (selectedUserId.length === 0) {
      // If no leads are selected, show an alert
      toast.error("Please select the Lead to assign owners.");
      setShowOwnerDropdown(false);
    } else {
      // If there are selected leads, show the dropdown to select an owner
      setShowOwnerDropdown((prev) => !prev);
    }
  };

  // Confirm assignment
  const confirmAssign = async () => {
    if (!bulkOwner) {
      toast.error("Please select an owner.");
      return;
    }

    // FINAL RESULT OBJECT
    const bulkAssignmentData = {
      member_ids: selectedUserId, // selected lead/user IDs
      owner_id: bulkOwner.value, // owner id from dropdown
    };

    try {
      const res = await authAxios().put(
        "/lead/assign/owner",
        bulkAssignmentData
      );

      toast.success("Owner assigned successfully!");

      // Reset after success
      setShowOwnerDropdown(false);
      setSelectedUserId([]);
      setBulkOwner(null);

      // Optional: refresh list
      fetchLeadList();
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to assign owner. Try again."
      );
    }
  };

  return (
    <>
      <div className="flex  h-full w-full">
        <Sidebar
          toggleMenuBar={toggleMenuBar}
          setToggleMenuBar={setToggleMenuBar}
        />
        <div
          className={`${
            toggleMenuBar ? "w-[calc(100%-100px)]" : "w-[calc(100%-250px)]"
          } ml-[auto] side--content--area transition duration-150]`}
        >
          <Topbar
            setToggleMenuBar={setToggleMenuBar}
            toggleMenuBar={toggleMenuBar}
            setLeadModal={setLeadModal}
            setSelectedLead={setSelectedLead}
            leadModalPage={leadModalPage}
          />
          <div className="content--area p-5">
            <div className="page--content">
              <div className="flex items-end justify-between gap-2 mb-5">
                <div className="title--breadcrumbs">
                  <p className="text-sm">{`Home > My Leads > All Leads`}</p>
                  <h1
                    className="text-3xl font-semibold"
                    onClick={handleLeadUpdate}
                  >
                    All Leads
                  </h1>
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-3 mb-4 items-center justify-between">
                <div className="flex gap-2 w-full">
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
                </div>
              </div>
              {/* <div className="grid grid-cols-2 gap-5 mb-5 p-3 border bg-white shodow--box rounded-[10px]">
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
        </div> */}

              <div className="w-full p-3 border bg-white shodow--box rounded-[10px]">
                <div className="flex items-start gap-3 justify-between w-full mb-3 border-b border-b-[#D4D4D4] pb-3">
                  <div>
                    <LeadFilterPanel
                      selectedClub={selectedClub}
                      setSelectedClub={setSelectedClub}
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
                      {(userRole === "CLUB_MANAGER" ||
                        userRole === "GENERAL_MANAGER" ||
                        userRole === "ADMIN") && (
                        <>
                          {showOwnerDropdown && selectedUserId.length > 0 && (
                            <div>
                              <Select
                                options={staffOptions}
                                onChange={handleBulkAssign}
                                placeholder="Select an owner"
                                styles={dasboardStyles}
                                className="min-w-[150px] w-full"
                              />
                            </div>
                          )}
                          <Tooltip
                            id={`tooltip-assin-lead`}
                            content="Change Lead Owner"
                            place="top"
                          >
                            <img
                              src={AssignIcon}
                              className="w-8 cursor-pointer"
                              onClick={handleSubmitAssign}
                              alt="assign"
                            />
                          </Tooltip>
                        </>
                      )}
                      <Tooltip
                        id={`tooltip-send-sms`}
                        content="Bulk Send SMS"
                        place="top"
                      >
                        <img
                          src={SmsIcon}
                          className="w-8 cursor-pointer"
                          onClick={() => handleCommunicate("sms")}
                        />
                      </Tooltip>
                      <Tooltip
                        id={`tooltip-send-mail`}
                        content="Bulk Send Mail"
                        place="top"
                      >
                        <img
                          src={MailIcon}
                          className="w-8 cursor-pointer"
                          onClick={() => handleCommunicate("email")}
                        />
                      </Tooltip>

                      {/* Show confirm button after selecting an owner */}
                      {bulkOwner && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                          <div className="bg-white p-6 rounded-xl shadow-lg w-96 text-center">
                            <h2 className="text-lg font-semibold mb-4">
                              Confirm Assignment
                            </h2>
                            <p className="mb-4">
                              Are you sure you want to assign{" "}
                              <strong>{selectedUserId.length}</strong> lead(s)
                              to <strong>{bulkOwner?.label}</strong>?
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
                          {/* <th className="px-2 py-4">S.No</th> */}
                          <th className="px-2 py-4 min-w-[130px]">Name</th>
                          <th className="px-2 py-4 min-w-[150px]">Club Name</th>
                          <th className="px-2 py-4 min-w-[150px]">
                            Interested In
                          </th>
                          <th className="px-2 py-4 min-w-[90px]">Lead Type</th>
                          <th className="px-2 py-4 min-w-[100px]">
                            Lead Source
                          </th>
                          <th className="px-2 py-4 min-w-[100px]">
                            Lead Status
                          </th>
                          <th className="px-2 py-4 min-w-[150px]">
                            Last Call Status
                          </th>
                          <th className="px-2 py-4 min-w-[140px]">
                            Lead Owner
                          </th>
                          <th className="px-2 py-4 min-w-[100px]">
                            Created on
                          </th>
                          <th className="px-2 py-4 min-w-[120px]">
                            Last Updated On
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {allLeads.length ? (
                          allLeads?.map((row, id) => (
                            <tr
                              key={row.id}
                              className="group bg-white border-b hover:bg-gray-50 relative transition duration-700"
                            >
                              <td className="px-2 py-4">
                                <div className="flex items-center custom--checkbox--2">
                                  <input
                                    type="checkbox"
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                    checked={selectedUserId.includes(row.id)}
                                    onChange={() =>
                                      handleCheckboxChange(row.id)
                                    }
                                  />
                                  <span className="checkmark--custom"></span>
                                </div>
                              </td>
                              {/* <td className="px-2 py-4">{row?.id}</td> */}

                              <td className="px-2 py-4">
                                {row?.full_name ? row?.full_name : "--"}
                              </td>
                              <td className="px-2 py-4">
                                {row?.club_name ? row?.club_name : "--"}
                              </td>
                              <td className="px-2 py-4">
                                <div className="max-w-[200px]">
                                  {row?.interested_in?.length
                                    ? row.interested_in.join(", ")
                                    : "--"}
                                </div>
                              </td>
                              <td className="px-2 py-4">
                                {row?.interested_in ? row?.lead_type : "--"}
                              </td>
                              <td className="px-2 py-4">
                                {row?.lead_source == null
                                  ? "--"
                                  : row?.lead_source}
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
                                  {row?.lead_status == null
                                    ? "--"
                                    : row?.lead_status}
                                </span>
                              </td>
                              <td className="px-2 py-4">
                                {row?.last_call_status == null
                                  ? "--"
                                  : row?.last_call_status}
                              </td>
                              <td className="px-2 py-4">
                                {row?.lead_owner == null
                                  ? "--"
                                  : row?.lead_owner}
                              </td>
                              <td className="px-2 py-4">
                                {formatAutoDate(row?.createdAt)}
                              </td>
                              <td className="px-2 py-4">
                                {formatAutoDate(row?.updatedAt)}
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
                                      setSelectedLeadMember(row?.id);
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
                                      setSelectedLead(row?.id);
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
                          ))
                        ) : (
                          <tr>
                            <td colSpan={10} className="px-2 py-4">
                              <p className="text-center text-sm text-gray-500">
                                No lead found.
                              </p>
                            </td>
                          </tr>
                        )}
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

                      // Prepare overrideSelected for removed filters
                      const overrideSelected = {
                        lead_status: selectedLeadStatus || null,
                        lead_source: selectedLeadSource || null,
                        last_call_status: selectedLastCallType || null,
                        created_by: selectedCallTag || null,
                        interested_in: selectedServiceName || null,
                        gender: selectedGender || null,
                      };

                      fetchLeadList(newPage, overrideSelected);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {leadModal && (
        <CreateLeadForm
          setLeadModal={setLeadModal}
          selectedLead={selectedLead}
          handleLeadUpdate={fetchLeadList}
          setLeadTopModal={setLeadTopModal}
          leadModalPage={leadModalPage}
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
        <CreateLeadAppointment
          setAppointmentModal={setAppointmentModal}
          memberID={selectedLead}
          defaultCategory="complementary"
          memberType="LEAD"
          handleLeadUpdate={fetchLeadList}
        />
      )}
    </>
  );
};

export default AllLeads;
