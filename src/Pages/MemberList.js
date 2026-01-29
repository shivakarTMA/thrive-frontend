import React, { useEffect, useState } from "react";
import { FaCircle } from "react-icons/fa";
import Select from "react-select";
import {
  customStyles,
  dasboardStyles,
  filterActiveItems,
  formatAutoDate,
  formatText,
} from "../Helper/helper";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { IoIosAddCircleOutline } from "react-icons/io";
import { MdCall } from "react-icons/md";
import "react-datepicker/dist/react-datepicker.css";
import { LiaEdit } from "react-icons/lia";
import Tooltip from "../components/common/Tooltip";
import { authAxios } from "../config/config";
import { toast } from "react-toastify";
import Pagination from "../components/common/Pagination";
import CreateMemberForm from "./CreateMemberForm";
import MailIcon from "../assets/images/icons/mail.png";
import SmsIcon from "../assets/images/icons/sms.png";
import AssignIcon from "../assets/images/icons/assign.png";
import MemberFilterPanel from "../components/FilterPanel/MemberFilterPanel";
import { useSelector } from "react-redux";
import DummyProfile from "../assets/images/dummy-profile.png";
import CreateNewInvoice from "./CreateNewInvoice";
import { IoEyeOutline } from "react-icons/io5";

const MemberList = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const userRole = user.role;
  const [staffList, setStaffList] = useState([]);

  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);

  const [invoiceModal, setInvoiceModal] = useState(false);
  const [selectedLeadMember, setSelectedLeadMember] = useState(null);

  const [memberList, setMemberList] = useState([]);
  const [memberModal, setMemberModal] = useState(false);
  const [stats, setStats] = useState({
    total_members: 0,
    active_members: 0,
    inactive_members: 0,
  });

  const [filterStatus, setFilterStatus] = useState(null);
  const [filterService, setFilterService] = useState(null);
  const [filterAgeGroup, setFilterAgeGroup] = useState(null);
  const [filterLeadSource, setFilterLeadSource] = useState(null);
  const [filterLeadOwner, setFilterLeadOwner] = useState(null);
  const [filterTrainer, setFilterTrainer] = useState(null);
  const [filterFitness, setFilterFitness] = useState(null);
  const [filterGender, setFilterGender] = useState(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [selectedUserId, setSelectedUserId] = useState([]);
  const [assignedOwners, setAssignedOwners] = useState({});
  const [bulkOwner, setBulkOwner] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);

  /* ---------------- URL PARAMS ---------------- */
  const searchParams = new URLSearchParams(location.search);
  const memberIdFromUrl = searchParams.get("id");
  const clubIdFromUrl = searchParams.get("club_id");

  const isSearchMode = Boolean(memberIdFromUrl);

  const [initialized, setInitialized] = useState(false);

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

  const fetchMemberList = async (currentPage = page, overrideSelected = {}) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };

      // 🔹 Check if we're in search mode (id exists in URL)
      if (memberIdFromUrl) {
        // ✅ SEARCH MODE (ID + CLUB)
        params.id = memberIdFromUrl;
        if (clubIdFromUrl) params.club_id = clubIdFromUrl;
      } else {
        const filters = {
          is_subscribed: overrideSelected.hasOwnProperty("is_subscribed")
            ? overrideSelected.is_subscribed
            : filterStatus,
          service_id: overrideSelected.hasOwnProperty("service_id")
            ? overrideSelected.service_id
            : filterService,
          age_range: overrideSelected.hasOwnProperty("age_range")
            ? overrideSelected.age_range
            : filterAgeGroup,
          lead_source: overrideSelected.hasOwnProperty("lead_source")
            ? overrideSelected.lead_source
            : filterLeadSource,
          lead_owner: overrideSelected.hasOwnProperty("lead_owner")
            ? overrideSelected.lead_owner
            : filterLeadOwner,
          staff: overrideSelected.hasOwnProperty("staff")
            ? overrideSelected.staff
            : filterTrainer,
          fitness: overrideSelected.hasOwnProperty("fitness")
            ? overrideSelected.fitness
            : filterFitness,
          gender: overrideSelected.hasOwnProperty("gender")
            ? overrideSelected.gender
            : filterGender,
          club_id: overrideSelected.hasOwnProperty("club_id")
            ? overrideSelected.club_id
            : clubFilter,
        };

        // Add filters to API params
        Object.entries(filters).forEach(([key, val]) => {
          if (val !== null && val !== undefined) {
            params[key] = val?.value !== undefined ? val.value : val;
          }
        });
      }

      console.log("🔍 API Request Params:", params);

      const res = await authAxios().get("/member/list", { params });

      const responseData = res.data;
      const data = responseData?.data || [];

      setMemberList(data);
      setPage(responseData?.currentPage || 1);
      setTotalPages(responseData?.totalPage || 1);
      setTotalCount(responseData?.totalCount || data.length);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch member");
    }
  };

  const fetchMemberStats = async () => {
    try {
      const response = await authAxios().get("/member/stats/count");
      if (response.data.status) {
        setStats(response.data.data);
      } else {
        console.error("Failed to fetch stats:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchMemberStats();
  }, []);

  /* ---------------- INIT FROM URL ---------------- */
  useEffect(() => {
    if (!clubList.length) return;

    if (clubIdFromUrl) {
      const club = clubList.find((c) => c.id === Number(clubIdFromUrl));
      if (club) {
        setClubFilter({ label: club.name, value: club.id });
      }
    } else if (!initialized) {
      setClubFilter({
        label: clubList[0].name,
        value: clubList[0].id,
      });
    }

    if (!initialized) {
      setInitialized(true);
    }
  }, [clubList, clubIdFromUrl]);

  /* ---------------- 🔥 MAIN FIX ---------------- */
  useEffect(() => {
    if (!initialized) return;

    fetchMemberList(1);
    setPage(1);
  }, [location.search, initialized]);

  // 🔹 Handle club filter change - clear URL id parameter
  const handleClubFilterChange = (option) => {
    setClubFilter(option);

    navigate("/all-members", { replace: true });
  };

  // -------------------------------
  // INITIAL LOAD
  // -------------------------------
  useEffect(() => {
    fetchClub();
  }, []);

  // -------------------------------
  // FETCH WHEN CLUB CHANGES (NORMAL MODE)
  // -------------------------------
  useEffect(() => {
    if (!initialized || isSearchMode) return;
    fetchMemberList(1);
    setPage(1);
  }, [clubFilter]);

  const handleMemberUpdate = () => {
    fetchMemberList();
  };

  const handleCheckboxChange = (id) => {
    setSelectedUserId((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  // 🚀 Fetch staff list from API
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
        new Map(mergedData.map((user) => [user.id, user])).values(),
      );

      const activeOnly = filterActiveItems(uniqueData);
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

  // Handle bulk assigning owner to selected leads only
  const handleBulkAssign = (selectedOption) => {
    setBulkOwner(selectedOption);
    const updatedAssignments = { ...assignedOwners };
    selectedUserId.forEach((id) => {
      updatedAssignments[id] = selectedOption;
    });
    setAssignedOwners(updatedAssignments);
  };

  // Handle submit bulk assignment (Assign Icon click logic)
  const handleSubmitAssign = () => {
    if (selectedUserId.length === 0) {
      toast.error("Please select the Member to change the Owner.");
      setShowOwnerDropdown(false);
    } else {
      setShowOwnerDropdown((prev) => !prev);
    }
  };

  // Confirm assignment
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
        bulkAssignmentData,
      );

      toast.success("Owner assigned successfully!");

      setShowOwnerDropdown(false);
      setSelectedUserId([]);
      setBulkOwner(null);

      fetchMemberList();
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to assign owner. Try again.",
      );
    }
  };

  const handleCommunicate = (type) => {
    if (selectedUserId.length === 0) {
      toast.error(`Please select the Member for ${type}.`);
      return;
    }

    const queryParams = new URLSearchParams({
      type: "member",
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

  const handleRemoveFilter = (filterKey) => {
    // Exit search mode when removing filters
    if (isSearchMode) {
      navigate("/all-members/", { replace: true });
    }

    const setterMap = {
      is_subscribed: setFilterStatus,
      service_id: setFilterService,
      age_range: setFilterAgeGroup,
      lead_source: setFilterLeadSource,
      lead_owner: setFilterLeadOwner,
      staff: setFilterTrainer,
      fitness: setFilterFitness,
      gender: setFilterGender,
    };

    setterMap[filterKey]?.(null);

    const overrideSelected = {
      is_subscribed: filterKey === "is_subscribed" ? null : filterStatus,
      service_id: filterKey === "service_id" ? null : filterService,
      age_range: filterKey === "age_range" ? null : filterAgeGroup,
      lead_source: filterKey === "lead_source" ? null : filterLeadSource,
      lead_owner: filterKey === "lead_owner" ? null : filterLeadOwner,
      staff: filterKey === "staff" ? null : filterTrainer,
      fitness: filterKey === "fitness" ? null : filterFitness,
      gender: filterKey === "gender" ? null : filterGender,
      club_id: clubFilter,
    };

    fetchMemberList(1, overrideSelected);
  };

  const handleApplyFiltersFromChild = () => {
    // Exit search mode when applying filters
    if (isSearchMode) {
      navigate("/all-members/", { replace: true });
    }

    fetchMemberList("", 1);
  };

  return (
    <>
      <div className="page--content">
        <div className="flex items-end justify-between gap-2 mb-5">
          <div className="title--breadcrumbs">
            <p className="text-sm">Home &gt; Members &gt; All Members</p>
            <h1 className="text-3xl font-semibold">All Members</h1>
          </div>

          <div className="w-fit bg-white shodow--box rounded-[10px] px-5 py-2">
            <div className="flex items-center">
              <div className="w-fit flex items-center gap-2 border-r">
                <div className="text-md font-medium text-gray-600 flex gap-2 items-center">
                  <FaCircle className="text-[10px] text-[#009EB2]" /> Total
                  Members
                </div>
                <div className="pr-2">
                  <span className="text-md font-semibold">
                    {stats?.total_members}
                  </span>
                </div>
              </div>
              <div className="w-fit flex items-center gap-2 border-r pl-2">
                <div className="text-md font-medium text-gray-600 flex gap-2 items-center">
                  <FaCircle className="text-[10px] text-[#1F9254]" />
                  Active Members
                </div>
                <div className="pr-2">
                  <span className="text-md font-semibold">
                    {stats?.active_members}
                  </span>
                </div>
              </div>
              <div className="w-fit flex items-center gap-2 border-r pl-2">
                <div className="text-md font-medium text-gray-600 flex gap-2 items-center">
                  <FaCircle className="text-[10px] text-[#ff9900]" />
                  Inactive Members
                </div>
                <div className="pr-2">
                  <span className="text-md font-semibold">
                    {stats?.inactive_members}
                  </span>
                </div>
              </div>
              <div className="w-fit flex items-center gap-2 pl-2">
                <div className="text-md font-medium text-gray-600 flex gap-2 items-center">
                  <FaCircle className="text-[10px] text-[#FF0000]" />
                  Expired Members
                </div>
                <div>
                  <span className="text-md font-semibold">
                    {stats?.expired_members ? stats?.expired_members : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mb-4 items-center justify-between">
          <div className="flex gap-2 w-full">
            <div className="w-fit min-w-[180px]">
              <Select
                placeholder="Filter by club"
                value={clubFilter}
                options={clubOptions}
                onChange={handleClubFilterChange}
                isClearable={userRole === "ADMIN" ? true : false}
                styles={customStyles}
              />
            </div>
          </div>
        </div>

        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-96 text-center">
              <h2 className="text-lg font-semibold mb-4">Confirm Assignment</h2>
              <p className="mb-4">
                Are you sure you want to assign{" "}
                <strong>{selectedUserId.length}</strong> lead(s) to{" "}
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

        <div className="w-full p-3 border bg-white shodow--box rounded-[10px]">
          <div className="flex items-start gap-3 justify-between w-full mb-3 border-b border-b-[#D4D4D4] pb-3">
            <div>
              <MemberFilterPanel
                userRole={userRole}
                clubFilter={clubFilter}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                filterService={filterService}
                setFilterService={setFilterService}
                filterAgeGroup={filterAgeGroup}
                setFilterAgeGroup={setFilterAgeGroup}
                filterLeadSource={filterLeadSource}
                setFilterLeadSource={setFilterLeadSource}
                filterLeadOwner={filterLeadOwner}
                setFilterLeadOwner={setFilterLeadOwner}
                filterTrainer={filterTrainer}
                setFilterTrainer={setFilterTrainer}
                filterFitness={filterFitness}
                setFilterFitness={setFilterFitness}
                filterGender={filterGender}
                setFilterGender={setFilterGender}
                onApplyFilters={handleApplyFiltersFromChild}
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
                      content="Change Member Owner"
                      place="top"
                    >
                      <img
                        src={AssignIcon}
                        className="w-8 cursor-pointer"
                        onClick={handleSubmitAssign}
                        alt="assign"
                      />
                    </Tooltip>
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
                  </>
                )}

                {/* Show confirm button after selecting an owner */}

                {bulkOwner && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-lg w-96 text-center">
                      <h2 className="text-lg font-semibold mb-4">
                        Confirm Assignment
                      </h2>
                      <p className="mb-4">
                        Are you sure you want to change{" "}
                        <strong>{selectedUserId.length}</strong> Trainer to{" "}
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
                    {(userRole === "CLUB_MANAGER" ||
                      userRole === "GENERAL_MANAGER" ||
                      userRole === "ADMIN") && <th className="px-2 py-4">#</th>}
                    <th className="px-2 py-4">Profile Image</th>
                    <th className="px-2 py-4">Name</th>
                    <th className="px-2 py-4">Club Name</th>
                    <th className="px-2 py-4">Gender</th>
                    <th className="px-2 py-4">MemeberShip Duration</th>
                    <th className="px-2 py-4">Status</th>
                    <th className="px-2 py-4">Expired On</th>
                    <th className="px-2 py-4">Trainer Name</th>
                    <th className="px-2 py-4">App Downloaded</th>
                    <th className="px-2 py-4">Profile Completion</th>
                  </tr>
                </thead>
                <tbody>
                  {memberList.map((member, index) => (
                    <tr
                      key={member.id}
                      className="group bg-white border-b relative hover:bg-gray-50"
                    >
                      {(userRole === "CLUB_MANAGER" ||
                        userRole === "GENERAL_MANAGER" ||
                        userRole === "ADMIN") && (
                        <td className="px-2 py-4">
                          <div className="flex items-center custom--checkbox--2">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                              checked={selectedUserId.includes(member.id)}
                              onChange={() => handleCheckboxChange(member.id)}
                            />
                            <span className="checkmark--custom"></span>
                          </div>
                        </td>
                      )}
                      <td className="px-2 py-4">
                        <div className="bg-gray-100 rounded-lg w-14 h-14 overflow-hidden">
                          {member?.profile_pic ? (
                            <img
                              src={member?.profile_pic}
                              className="w-full h-full object-cover object-center"
                            />
                          ) : (
                            <img
                              src={DummyProfile}
                              className="w-full h-full object-cover object-center"
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-4">
                        {member?.full_name ? member?.full_name : "--"}
                      </td>
                      <td className="px-2 py-4">
                        {member?.club_name ? member?.club_name : "--"}
                      </td>
                      <td className="px-2 py-4">
                        {formatText(
                          member?.gender === "NOTDISCLOSE"
                            ? "Prefer Not To Say"
                            : member?.gender,
                        )}
                      </td>
                      <td className="px-2 py-4">
                        {member?.membership_duration
                          ? member?.membership_duration
                          : "--"}
                      </td>
                      <td className="px-2 py-4">
                        <span
                          className={`
                            flex items-center justify-between gap-1 rounded-full min-h-[30px] px-3 text-sm w-fit
                          ${
                            member?.is_subscribed !== true
                              ? "bg-[#EEEEEE]"
                              : "bg-[#E8FFE6] text-[#138808]"
                          }
                          `}
                        >
                          <FaCircle className="text-[10px]" />{" "}
                          {member?.is_subscribed !== true
                            ? "Inactive"
                            : "Active"}
                        </span>
                      </td>
                      <td className="px-2 py-4">
                        {member?.subscription_expiry_date
                          ? formatAutoDate(member?.subscription_expiry_date)
                          : "--"}
                      </td>
                      <td className="px-2 py-4">
                        {member?.trainer ? member?.trainer : "--"}
                      </td>
                      <td className="px-2 py-4">
                        {member?.app_downloaded ? member?.app_downloaded : "--"}
                      </td>
                      <td className="px-2 py-4">
                        <div className="flex flex-col gap-1">
                          {member?.lead_source === "APP" ? "100%" : "25%"}
                          <div className="progress--bar bg-[#E5E5E5] rounded-full h-[10px] w-full max-w-[150px]">
                            <div
                              className="bg--color w-full rounded-full h-full flex items-center"
                              style={{
                                width:
                                  member?.lead_source === "APP"
                                    ? "100%"
                                    : "25%",
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      {(userRole === "CLUB_MANAGER" ||
                        userRole === "GENERAL_MANAGER" ||
                        userRole === "ADMIN" ||
                        userRole === "FOH") && (
                        <div className="absolute hidden group-hover:flex gap-2 right-0 h-full top-0 w-[50%] items-center justify-end bg-[linear-gradient(269deg,_#ffffff_30%,_transparent)] pr-5 transition duration-700">
                          <div className="flex gap-1">
                            <Tooltip
                              id={`edit-member-${member?.id}`}
                              content="Edit Member"
                              place="top"
                            >
                              <div className="p-1 cursor-pointer">
                                <Link
                                  to={`/member/${member?.id}`}
                                  className="p-0"
                                >
                                  <LiaEdit className="text-[25px] text-black" />
                                </Link>
                              </div>
                            </Tooltip>

                            <Tooltip
                              id={`member-call-${member?.id}`}
                              content="Call Logs"
                              place="top"
                            >
                              <div className="p-1 cursor-pointer">
                                <Link
                                  to={`/member/${member?.id}?view=call-logs`}
                                  className="p-0"
                                >
                                  <MdCall className="text-[25px] text-black" />
                                </Link>
                              </div>
                            </Tooltip>

                            <Tooltip
                              id={`send-payment-${member?.id}`}
                              content="Buy services"
                              place="top"
                            >
                              <div
                                className="p-1 cursor-pointer"
                                onClick={() => {
                                  setSelectedLeadMember(member.id);
                                  setInvoiceModal(true);
                                }}
                              >
                                <Link to="#" className="p-0">
                                  <IoIosAddCircleOutline className="text-[25px] text-black" />
                                </Link>
                              </div>
                            </Tooltip>
                          </div>
                        </div>
                      )}
                      {userRole === "TRAINER" && (
                        <div className="absolute hidden group-hover:flex gap-2 right-0 h-full top-0 w-[50%] items-center justify-end bg-[linear-gradient(269deg,_#ffffff_30%,_transparent)] pr-5 transition duration-700">
                          <div className="flex gap-1">
                            <Tooltip
                              id={`edit-member-${member?.id}`}
                              content="View Profile"
                              place="top"
                            >
                              <div className="p-1 cursor-pointer">
                                <Link
                                  to={`/member/${member?.id}`}
                                  className="p-0"
                                >
                                  <IoEyeOutline className="text-[25px] text-black" />
                                </Link>
                              </div>
                            </Tooltip>

                            <Tooltip
                              id={`member-call-${member?.id}`}
                              content="Call Logs"
                              place="top"
                            >
                              <div className="p-1 cursor-pointer">
                                <Link
                                  to={`/member/${member?.id}?view=call-logs`}
                                  className="p-0"
                                >
                                  <MdCall className="text-[25px] text-black" />
                                </Link>
                              </div>
                            </Tooltip>
                          </div>
                        </div>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {memberList.length === 0 && (
                <p className="text-center p-4">No matching members found.</p>
              )}
            </div>
            {/* Pagination */}
            <Pagination
              page={page}
              totalPages={totalPages}
              rowsPerPage={rowsPerPage}
              totalCount={totalCount}
              currentDataLength={memberList.length}
              onPageChange={(newPage) => {
                setPage(newPage);
                fetchMemberList(newPage);
              }}
            />
          </div>
        </div>
      </div>

      {memberModal && (
        <CreateMemberForm
          setMemberModal={setMemberModal}
          onMemberUpdate={handleMemberUpdate}
        />
      )}

      {invoiceModal && (
        <CreateNewInvoice
          setInvoiceModal={setInvoiceModal}
          selectedLeadMember={selectedLeadMember}
        />
      )}
    </>
  );
};

export default MemberList;
