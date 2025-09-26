import React, { useEffect, useState } from "react";
import { FaAngleLeft, FaAngleRight, FaCircle } from "react-icons/fa";
import Select from "react-select";
import { customStyles, dasboardStyles, formatAutoDate } from "../Helper/helper";
import { memberMockData } from "../DummyData/DummyData";
import { Link } from "react-router-dom";
import { IoIosAddCircleOutline, IoIosSearch } from "react-icons/io";
import {
  format,
  isWithinInterval,
  parseISO,
  startOfToday,
  subDays,
  startOfMonth,
  subYears,
  addYears,
} from "date-fns";
import { MdCall, MdModeEdit } from "react-icons/md";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { LiaEdit } from "react-icons/lia";
import Tooltip from "../components/common/Tooltip";
import { apiAxios } from "../config/config";
import { toast } from "react-toastify";
import Pagination from "../components/common/Pagination";
import { FiPlus } from "react-icons/fi";
import CreateMemberForm from "./CreateMemberForm";
import MemberFilterPanel from "../components/common/MemberFilterPanel";
import MailIcon from "../assets/images/icons/mail.png";
import SmsIcon from "../assets/images/icons/sms.png";
import AssignIcon from "../assets/images/icons/assign.png";

const communicateOptions = [
  { value: "sms", label: "Send SMS" },
  { value: "email", label: "Send Email" },
];

const MemberList = () => {
  const [search, setSearch] = useState("");
  const [memberList, setMemberList] = useState([]);
  const [memberModal, setMemberModal] = useState(false);
  const [sendCommunicate, setSendCommunicate] = useState(null);
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

  const fetchMemberList = async (search = searchTerm, currentPage = page) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };
      // Search param
      if (search) params.search = search;

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

  useEffect(() => {
    fetchMemberList();
  }, []);

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
      // If no leads are selected, show an alert
      toast.error(`Please select the Member to ${type} owners.`);
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

  // const applyDateFilter = (memberDate) => {
  //   if (!dateFilter) return true;
  //   const date = parseISO(memberDate);
  //   const today = startOfToday();

  //   switch (dateFilter.value) {
  //     case "today":
  //       return format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
  //     case "last7":
  //       return isWithinInterval(date, { start: subDays(today, 6), end: today });
  //     case "monthTillDate":
  //       return isWithinInterval(date, {
  //         start: startOfMonth(today),
  //         end: today,
  //       });
  //     case "custom":
  //       if (!customFrom || !customTo) return true;
  //       return isWithinInterval(date, {
  //         start: customFrom,
  //         end: customTo,
  //       });
  //     default:
  //       return true;
  //   }
  // };

  // const filteredData = memberMockData.filter((member) => {
  //   const matchesSearch =
  //     search === "" || member.name.toLowerCase().includes(search.toLowerCase());
  //   const matchesMembership =
  //     !membershipFilter || member.membershipType === membershipFilter.value;
  //   const matchesTrainerType =
  //     !trainerTypeFilter || member.trainerType === trainerTypeFilter.value;
  //   const matchesFoh = !fohFilter || member.fohAssigned === fohFilter.value;
  //   const matchesDate = applyDateFilter(member.memberFrom);

  //   return (
  //     matchesSearch &&
  //     matchesMembership &&
  //     matchesTrainerType &&
  //     matchesFoh &&
  //     matchesDate
  //   );
  // });

  // const paginatedData = filteredData.slice(
  //   (page - 1) * rowsPerPage,
  //   page * rowsPerPage
  // );
  // const totalPages = Math.ceil(filteredData.length / rowsPerPage);

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
                  <span className="text-md font-semibold">2315</span>
                </div>
              </div>
              <div className="flex items-center gap-5 border-r">
                <div className="text-md font-medium text-gray-600 flex gap-2 items-center">
                  <FaCircle className="text-[10px] text-[#1F9254]" /> 
                  Active Members
                </div>
                <div className="flex flex-wrap items-center justify-between">
                  <span className="text-md font-semibold">590</span>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="text-md font-medium text-gray-600 flex gap-2 items-center">
                  <FaCircle className="text-[10px] text-[#FF0000]" />
                  Inactive Members
                </div>
                <div className="flex flex-wrap items-center justify-between">
                  <span className="text-md font-semibold">1725</span>
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
                            flex items-center justify-between gap-1 rounded-full bg-[#EEEEEE] min-h-[30px] px-3 text-sm w-fit
                          ${
                            member?.status == "inactive"
                              ? "bg-[#EEEEEE]"
                              : "bg-[#E8FFE6] text-[#138808]"
                          }
                          `}
                        >
                          <FaCircle className="text-[10px]" /> Active
                        </span>
                      </td>
                      <td className="px-2 py-4">
                        {formatAutoDate(member?.updatedAt)}
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
