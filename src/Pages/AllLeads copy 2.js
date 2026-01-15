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
import { addYears, format, subYears } from "date-fns";
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
import { useFormik } from "formik";

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

  const leadModalPage = "ALLLEAD";
  const [leadTopModal, setLeadTopModal] = useState(false);

  const [selectedUserId, setSelectedUserId] = useState([]);
  const [assignedOwners, setAssignedOwners] = useState({});
  const [bulkOwner, setBulkOwner] = useState(null);
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);

  const [searchParams] = useSearchParams();
  const [dateFilter, setDateFilter] = useState(dateFilterOptions[1]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);
  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);

  const [allLeads, setAllLeads] = useState([]);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [staffList, setStaffList] = useState([]);
  const [filtersInitialized, setFiltersInitialized] = useState(false);

  // Applied filters state (like TrialAppointments)
  const [appliedFilters, setAppliedFilters] = useState({
    lead_source: null,
    lead_status: null,
    last_call_status: null,
    lead_owner: null,
    interested_in: null,
    gender: null,
  });

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

  // Formik for panel filters (like TrialAppointments)
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      filterLeadSource: null,
      filterLastCallType: null,
      filterLeadStatus: null,
      filterCallTag: null,
      filterGender: null,
      filterServiceName: null,
    },
    onSubmit: (values) => {
      console.log(values);
    },
  });

  // Helper to set formik values
  const setFilterValue = (key, value) => {
    formik.setFieldValue(key, value);
  };

  // ---------------------------
  // UPDATE URL WITH PARAMS
  // ---------------------------
  const updateURLParams = (filters) => {
    const params = new URLSearchParams();

    // Date filter
    if (dateFilter?.value && dateFilter.value !== "custom") {
      params.set("dateFilter", dateFilter.value);
    }

    if (dateFilter?.value === "custom" && customFrom && customTo) {
      params.set("startDate", format(customFrom, "yyyy-MM-dd"));
      params.set("endDate", format(customTo, "yyyy-MM-dd"));
    }

    // Club filter
    if (clubFilter?.value) {
      params.set("club_id", clubFilter.value);
    }

    // Applied filters (panel filters)
    if (filters.lead_source) {
      params.set("lead_source", filters.lead_source);
    }
    if (filters.lead_status) {
      params.set("lead_status", filters.lead_status);
    }
    if (filters.last_call_status) {
      params.set("last_call_status", filters.last_call_status);
    }
    if (filters.lead_owner) {
      params.set("lead_owner", filters.lead_owner);
    }
    if (filters.interested_in) {
      params.set("interested_in", filters.interested_in);
    }
    if (filters.gender) {
      params.set("gender", filters.gender);
    }

    navigate(`?${params.toString()}`, { replace: true });
  };

  // ---------------------------
  // FETCH LEADS
  // ---------------------------
  const fetchLeadList = async (currentPage = page) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };

      // Date Filter
      if (dateFilter?.value && dateFilter.value !== "custom") {
        params.dateFilter = dateFilter.value;
      }

      if (dateFilter?.value === "custom" && customFrom && customTo) {
        params.startDate = format(customFrom, "yyyy-MM-dd");
        params.endDate = format(customTo, "yyyy-MM-dd");
      }

      // Club filter
      if (clubFilter?.value) {
        params.club_id = clubFilter.value;
      }

      // Applied Filters (from panel)
      if (appliedFilters.lead_source) {
        params.lead_source = appliedFilters.lead_source;
      }
      if (appliedFilters.lead_status) {
        params.lead_status = appliedFilters.lead_status;
      }
      if (appliedFilters.last_call_status) {
        params.last_call_status = appliedFilters.last_call_status;
      }
      if (appliedFilters.lead_owner) {
        params.lead_owner = appliedFilters.lead_owner;
      }
      if (appliedFilters.interested_in) {
        params.interested_in = appliedFilters.interested_in;
      }
      if (appliedFilters.gender) {
        params.gender = appliedFilters.gender;
      }

      console.log("🔍 API Request Params:", params);

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

  // Fetch staff list from API
  const fetchStaff = async () => {
    try {
      const requests = [authAxios().get("/staff/list?role=FOH")];

      if (
        userRole === "CLUB_MANAGER" ||
        userRole === "ADMIN" ||
        userRole === "FOH"
      ) {
        requests.push(authAxios().get("/staff/list?role=CLUB_MANAGER"));
      }

      const responses = await Promise.all(requests);

      let mergedData = [];

      responses.forEach((res) => {
        const role = res.config.url.includes("FOH") ? "FOH" : "CLUB_MANAGER";

        const users = (res.data?.data || []).map((user) => ({
          ...user,
          role,
        }));

        mergedData.push(...users);
      });

      const uniqueData = Array.from(
        new Map(mergedData.map((user) => [user.id, user])).values()
      );

      const activeOnly = filterActiveItems(uniqueData);
      setStaffList(activeOnly);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch staff");
    }
  };

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

  const clubOptions = clubList.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  // Initial load effect
  useEffect(() => {
    fetchStaff();
    fetchClub();
  }, []);

  const staffOptions = [
    {
      label: "FOH",
      options: staffList
        .filter((user) => user.role === "FOH")
        .map((user) => ({
          value: user.id,
          label: user.name,
        })),
    },
    {
      label: "CLUB MANAGER",
      options: staffList
        .filter((user) => user.role === "CLUB_MANAGER")
        .map((user) => ({
          value: user.id,
          label: user.name,
        })),
    },
  ].filter((group) => group.options.length > 0);

  // ---------------------------
  // INITIALIZE FROM URL (RUNS ONCE)
  // ---------------------------
  useEffect(() => {
    // Wait for clubList to be loaded
    if (clubList.length === 0) return;

    // Only run initialization once
    if (filtersInitialized) return;

    const params = new URLSearchParams(location.search);

    // Date filter
    const dateFilterValue = params.get("dateFilter");
    if (dateFilterValue) {
      const matchedDate = dateFilterOptions.find(
        (opt) => opt.value === dateFilterValue
      );
      if (matchedDate) {
        setDateFilter(matchedDate);
      }
    }

    // Custom date filter
    const startDate = params.get("startDate");
    const endDate = params.get("endDate");
    if (startDate && endDate) {
      setDateFilter(dateFilterOptions.find((d) => d.value === "custom"));
      setCustomFrom(new Date(startDate));
      setCustomTo(new Date(endDate));
    }

    // Club filter - only set from URL if present, otherwise default to first club
    const clubId = params.get("club_id");
    if (clubId) {
      const club = clubList.find((c) => c.id === Number(clubId));
      if (club) {
        setClubFilter({ label: club.name, value: club.id });
      }
    } else {
      // Set default club only on initial load
      setClubFilter({
        label: clubList[0].name,
        value: clubList[0].id,
      });
    }

    // Applied filters from URL
    const urlFilters = {
      lead_source: params.get("lead_source") || null,
      lead_status: params.get("lead_status") || null,
      last_call_status: params.get("last_call_status") || null,
      lead_owner: params.get("lead_owner")
        ? Number(params.get("lead_owner"))
        : null,
      interested_in: params.get("interested_in") || null,
      gender: params.get("gender") || null,
    };

    setAppliedFilters(urlFilters);

    // Sync with formik
    formik.setValues({
      filterLeadSource: urlFilters.lead_source,
      filterLeadStatus: urlFilters.lead_status,
      filterLastCallType: urlFilters.last_call_status,
      filterCallTag: urlFilters.lead_owner,
      filterServiceName: urlFilters.interested_in,
      filterGender: urlFilters.gender,
    });

    setFiltersInitialized(true);
  }, [clubList]);

  // ---------------------------
  // FETCH WHEN FILTERS CHANGE
  // ---------------------------
  useEffect(() => {
    if (!filtersInitialized) return;

    setPage(1);
    fetchLeadList(1);
    updateURLParams(appliedFilters);
  }, [
    filtersInitialized,
    dateFilter?.value,
    customFrom,
    customTo,
    clubFilter?.value,
    appliedFilters.lead_source,
    appliedFilters.lead_status,
    appliedFilters.last_call_status,
    appliedFilters.lead_owner,
    appliedFilters.interested_in,
    appliedFilters.gender,
  ]);

  const handleLeadUpdate = () => {
    fetchLeadList();
  };

  const handleCheckboxChange = (id) => {
    setSelectedUserId((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleBulkAssign = (selectedOption) => {
    setBulkOwner(selectedOption);
    const updatedAssignments = { ...assignedOwners };
    selectedUserId.forEach((id) => {
      updatedAssignments[id] = selectedOption;
    });
    setAssignedOwners(updatedAssignments);
  };

  const handleSubmitAssign = () => {
    if (selectedUserId.length === 0) {
      toast.error("Please select the Lead to assign owners.");
      setShowOwnerDropdown(false);
    } else {
      setShowOwnerDropdown((prev) => !prev);
    }
  };

  const confirmAssign = async () => {
    if (!bulkOwner) {
      toast.error("Please select an owner.");
      return;
    }

    const bulkAssignmentData = {
      member_ids: selectedUserId,
      owner_id: bulkOwner.value,
    };

    try {
      const res = await authAxios().put(
        "/lead/assign/owner",
        bulkAssignmentData
      );

      toast.success("Owner assigned successfully!");

      setShowOwnerDropdown(false);
      setSelectedUserId([]);
      setBulkOwner(null);

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
                      onChange={(selected) => {
                        setDateFilter(selected);
                        if (selected?.value !== "custom") {
                          setCustomFrom(null);
                          setCustomTo(null);
                        }
                      }}
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
                          onChange={(date) => {
                            setCustomFrom(date);
                            setCustomTo(null);
                          }}
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
                          minDate={customFrom || subYears(new Date(), 20)}
                          maxDate={addYears(new Date(), 0)}
                          showMonthDropdown
                          showYearDropdown
                          dropdownMode="select"
                          dateFormat="dd-MM-yyyy"
                          disabled={!customFrom}
                        />
                      </div>
                    </>
                  )}
                  <div className="w-fit min-w-[180px]">
                    <Select
                      placeholder="Filter by club"
                      value={clubFilter}
                      options={clubOptions}
                      onChange={(option) => setClubFilter(option)}
                      isClearable={userRole === "ADMIN" ? true : false}
                      styles={customStyles}
                    />
                  </div>
                </div>
              </div>

              <div className="w-full p-3 border bg-white shodow--box rounded-[10px]">
                <div className="flex items-start gap-3 justify-between w-full mb-3 border-b border-b-[#D4D4D4] pb-3">
                  <div>
                    <LeadFilterPanel
                      formik={formik}
                      filterLeadSource={formik.values.filterLeadSource}
                      filterLeadStatus={formik.values.filterLeadStatus}
                      filterLastCallType={formik.values.filterLastCallType}
                      filterCallTag={formik.values.filterCallTag}
                      filterServiceName={formik.values.filterServiceName}
                      filterGender={formik.values.filterGender}
                      setFilterValue={setFilterValue}
                      appliedFilters={appliedFilters}
                      setAppliedFilters={setAppliedFilters}
                      userRole={userRole}
                      clubId={clubFilter?.value}
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
                                {row?.lead_status ?? "--"}
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

                              {(userRole === "CLUB_MANAGER" ||
                                userRole === "GENERAL_MANAGER" ||
                                userRole === "ADMIN" ||
                                userRole === "FOH") && (
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
                                        setSelectedLeadMember(row?.id);
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
                                        setSelectedLeadMember(row.id);
                                        setSendPaymentModal(true);
                                      }}
                                      className="p-1 cursor-pointer"
                                    >
                                      <IoIosAddCircleOutline className="text-[25px] text-black" />
                                    </div>
                                  </Tooltip>
                                </div>
                              )}
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


                      fetchLeadList(newPage);
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
          selectedLeadMember={selectedLeadMember}
          setInvoiceModal={setInvoiceModal}
        />
      )}
      {sendPaymentModal && (
        <SendPaymentLink
          setSendPaymentModal={setSendPaymentModal}
          selectedLeadMember={selectedLeadMember}
        />
      )}
      {appointmentModal && (
        <CreateLeadAppointment
          setAppointmentModal={setAppointmentModal}
          memberID={selectedLeadMember}
          defaultCategory="complementary"
          memberType="LEAD"
          handleLeadUpdate={fetchLeadList}
        />
      )}
    </>
  );
};

export default AllLeads;
