import React, { useEffect, useState } from "react";
import { FaCircle } from "react-icons/fa";
import Select from "react-select";
import { dasboardStyles, formatAutoDate } from "../Helper/helper";
import { Link, useParams, useLocation } from "react-router-dom";
import { IoIosAddCircleOutline } from "react-icons/io";
import { MdCall } from "react-icons/md";
import "react-datepicker/dist/react-datepicker.css";
import { LiaEdit } from "react-icons/lia";
import Tooltip from "../components/common/Tooltip";
import { apiAxios } from "../config/config";
import { toast } from "react-toastify";
import Pagination from "../components/common/Pagination";
import CreateMemberForm from "./CreateMemberForm";
import MailIcon from "../assets/images/icons/mail.png";
import SmsIcon from "../assets/images/icons/sms.png";
import AssignIcon from "../assets/images/icons/assign.png";
import MemberFilterPanel from "../components/FilterPanel/MemberFilterPanel";

const MemberList = () => {
  const { id } = useParams();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [memberList, setMemberList] = useState([]);
  const [memberModal, setMemberModal] = useState(false);
  const [stats, setStats] = useState({
    total_members: 0,
    active_members: 0,
    inactive_members: 0,
  });

  const [filterStatus, setFilterStatus] = useState(null);
  const [filterService, setFilterService] = useState(null);
  const [filterServiceVariation, setFilterServiceVariation] = useState(null);
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

  const [selectedIds, setSelectedIds] = useState([]);
  const [assignedOwners, setAssignedOwners] = useState({});
  const [bulkOwner, setBulkOwner] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const fetchMemberList = async (
    search = searchTerm,
    currentPage = page,
    overrideSelected = {}
  ) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };
      // Search param
      if (id) {
        params.id = id;
      } else {
        if (search) params.search = search;
        const filters = {
          status: overrideSelected.hasOwnProperty("status")
            ? overrideSelected.status
            : filterStatus,
          serviceName: overrideSelected.hasOwnProperty("serviceName")
            ? overrideSelected.serviceName
            : filterService,
          service_variation: overrideSelected.hasOwnProperty(
            "service_variation"
          )
            ? overrideSelected.service_variation
            : filterServiceVariation,
          ageGroup: overrideSelected.hasOwnProperty("ageGroup")
            ? overrideSelected.ageGroup
            : filterAgeGroup,
          leadSource: overrideSelected.hasOwnProperty("leadSource")
            ? overrideSelected.leadSource
            : filterLeadSource,
          created_by: overrideSelected.hasOwnProperty("created_by")
            ? overrideSelected.created_by
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
        };

        Object.entries(filters).forEach(([key, val]) => {
          if (val?.value) params[key] = val.value;
        });
      }

      const res = await apiAxios().get("/member/list", { params });

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
      const response = await apiAxios().get("/member/stats/count"); // Update with your actual endpoint
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

  useEffect(() => {
    // When 'id' changes, fetch data based on the new 'id'
    if (id) {
      fetchMemberList("", 1, { id });
    } else {
      fetchMemberList();
    }
  }, [id]);

  const handleMemberUpdate = () => {
    fetchMemberList();
  };

  console.log(memberList, "memberList");
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchMemberList(searchTerm, 1);
      setPage(1);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const ownerOptions = [
    {
      label: "GT", // Group label
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
      toast.error("Please select the Member to change the Trainers.");
      setShowOwnerDropdown(false);
    } else {
      // If there are selected leads, show the dropdown to select an owner
      setShowOwnerDropdown((prev) => !prev);
    }
  };

  // Confirm assignment
  const confirmAssign = () => {
    console.log("Assigned Members:", selectedIds); // Log selected lead IDs
    console.log("Assigned Owner:", bulkOwner); // Log assigned owner
    setShowOwnerDropdown(false); // Hide the dropdown
    setSelectedIds([]); // Clear selection
    setBulkOwner(null); // Clear bulk owner
  };

  const handleCommunicate = (type) => {
  if (selectedIds.length === 0) {
    toast.error(`Please select the Member to ${type} owners.`);
    return;
  }

  const queryParams = new URLSearchParams({
    type: "member",
    ids: selectedIds.join(","),
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
    const setterMap = {
      status: setFilterStatus,
      serviceName: setFilterService,
      service_variation: setFilterServiceVariation,
      ageGroup: setFilterAgeGroup,
      leadSource: setFilterLeadSource,
      created_by: setFilterLeadOwner,
      staff: setFilterTrainer,
      fitness: setFilterFitness,
      gender: setFilterGender,
    };

    // Clear that specific filter state
    setterMap[filterKey]?.(null);

    // Pass null to force API refresh excluding that filter
    const overrideSelected = { [filterKey]: null };
    fetchMemberList("", 1, overrideSelected);
  };

  const handleApplyFiltersFromChild = () => {
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
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-5 border-r">
                <div className="text-md font-medium text-gray-600 flex gap-2 items-center">
                  <FaCircle className="text-[10px] text-[#009EB2]" /> Total
                  Members
                </div>
                <div className="flex flex-wrap items-center justify-between">
                  <span className="text-md font-semibold">
                    {stats?.total_members}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-5 border-r">
                <div className="text-md font-medium text-gray-600 flex gap-2 items-center">
                  <FaCircle className="text-[10px] text-[#1F9254]" />
                  Active Members
                </div>
                <div className="flex flex-wrap items-center justify-between">
                  <span className="text-md font-semibold">
                    {stats?.active_members}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="text-md font-medium text-gray-600 flex gap-2 items-center">
                  <FaCircle className="text-[10px] text-[#FF0000]" />
                  Inactive Members
                </div>
                <div className="flex flex-wrap items-center justify-between">
                  <span className="text-md font-semibold">
                    {stats?.inactive_members}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* )} */}

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
        <div className="w-full p-3 border bg-white shodow--box rounded-[10px]">
          <div className="flex items-start gap-3 justify-between w-full mb-3 border-b border-b-[#D4D4D4] pb-3">
            <div>
              <MemberFilterPanel
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                filterService={filterService}
                setFilterService={setFilterService}
                filterServiceVariation={filterServiceVariation}
                setFilterServiceVariation={setFilterServiceVariation}
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
                        Are you sure you want to change{" "}
                        <strong>{selectedIds.length}</strong> Trainer to{" "}
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
                    <th className="px-2 py-4">Name</th>
                    <th className="px-2 py-4">MemeberShip Duration</th>
                    <th className="px-2 py-4">Status</th>
                    <th className="px-2 py-4">Expired On</th>
                    <th className="px-2 py-4">Trainer Name</th>
                    <th className="px-2 py-4">Profile Completion</th>
                  </tr>
                </thead>
                <tbody>
                  {memberList.map((member, index) => (
                    <tr
                      key={member.id}
                      className="group bg-white border-b relative hover:bg-gray-50"
                    >
                      <td className="px-2 py-4">
                        <div className="flex items-center custom--checkbox--2">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            checked={selectedIds.includes(member.id)}
                            onChange={() => handleCheckboxChange(member.id)}
                          />
                          <span className="checkmark--custom"></span>
                        </div>
                      </td>
                      <td className="px-2 py-4">{member?.full_name}</td>
                      <td className="px-2 py-4">
                        {/* {formatAutoDate(member?.createdAt)} */}6 Months
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
                        <div className="flex gap-2 items-center">
                          <div className="progress--bar bg-[#E5E5E5] rounded-full h-[10px] w-full max-w-[150px]">
                            <div
                              className="bg--color w-full rounded-full h-full"
                              style={{ width: "40%" }}
                            ></div>
                          </div>
                          40%
                        </div>
                      </td>

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
                            content="Send Payment Link"
                            place="top"
                          >
                            <div className="p-1 cursor-pointer">
                              <Link to="#" className="p-0">
                                <IoIosAddCircleOutline className="text-[25px] text-black" />
                              </Link>
                            </div>
                          </Tooltip>
                        </div>
                      </div>
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
                fetchMemberList(searchTerm, newPage);
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
    </>
  );
};

export default MemberList;
