import React, { useEffect, useState } from "react";
import { FaAngleLeft, FaAngleRight, FaCircle } from "react-icons/fa";
import Select from "react-select";
import { customStyles, formatAutoDate } from "../Helper/helper";
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

export const memberFilters = {
  membershipType: ["Gold", "Silver", "Platinum"],
  trainer: ["Trainer A", "Trainer B", "Trainer C"],
  fohAssigned: ["FOH A", "FOH B", "FOH C"],
};

const getUniqueOptions = (data, key) => {
  return [...new Set(data.map((item) => item[key]))].map((value) => ({
    label: value,
    value: value,
  }));
};

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last7", label: "Last 7 Days" },
  { value: "monthTillDate", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const MemberList = () => {
  const [search, setSearch] = useState("");
  const [memberList, setMemberList] = useState([]);
  const [membershipFilter, setMembershipFilter] = useState(null);
  const [trainerTypeFilter, setTrainerTypeFilter] = useState(null);
  const [fohFilter, setFohFilter] = useState(null);
  const [dateFilter, setDateFilter] = useState(null);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);
  const [memberModal, setMemberModal] = useState(false);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [selectedIds, setSelectedIds] = useState([]);
  const [assignedOwners, setAssignedOwners] = useState({});
  const [bulkOwner, setBulkOwner] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);

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
        <div className="flex items-end gap-2">
            <button
              onClick={() => {
                setMemberModal(true);
              }}
              type="button"
              className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
            >
              <FiPlus /> Add New Member
            </button>
          </div>
      </div>

      <div className="flex w-full gap-2 justify-between items-center mb-4">
        {/* <div className="flex flex-1 gap-2 items-center flex-wrap">
          <Select
            placeholder="Membership Type"
            options={getUniqueOptions(memberMockData, "membershipType")}
            value={membershipFilter}
            onChange={setMembershipFilter}
            isClearable
            styles={customStyles}
          />
          <Select
            placeholder="Trainer Type"
            options={getUniqueOptions(memberMockData, "trainerType")}
            value={trainerTypeFilter}
            onChange={setTrainerTypeFilter}
            isClearable
            styles={customStyles}
          />
          <Select
            placeholder="FOH"
            options={getUniqueOptions(memberMockData, "fohAssigned")}
            value={fohFilter}
            onChange={setFohFilter}
            isClearable
            styles={customStyles}
            className="w-40"
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
        </div> */}
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
            Assign {selectedIds.length} selected member(s) to:
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

      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-2 py-4">#</th>
              <th className="px-2 py-4">Member Name</th>
              <th className="px-2 py-4">Membership Duration</th>
              <th className="px-2 py-4">Membership Status</th>
              <th className="px-2 py-4">Expiry Date</th>
              <th className="px-2 py-4">Trainer Name</th>
            </tr>
          </thead>
          <tbody>
            {memberList.map((member, index) => (
              <tr
                key={member.id}
                className="group bg-white border-b relative hover:bg-gray-50"
              >
                {/* <td className="px-2 py-4">
                  {index + 1 + (page - 1) * rowsPerPage}
                </td> */}
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
                  {/* {formatAutoDate(member?.createdAt)} */}
                  6 Months
                </td>
                <td className="px-2 py-4">
                  <div className="flex gap-1 items-center text-green-500">
                  <FaCircle /> Active
                  </div>
                  </td>
                <td className="px-2 py-4">
                  {formatAutoDate(member?.updatedAt)}
                </td>
                <td className="px-2 py-4">{member?.trainer ? member?.trainer : '--'}</td>
                {/* <td className="px-2 py-4">{member?.memberFrom}</td>
                <td className="px-2 py-4">{member?.memberTill}</td>
                <td className="px-2 py-4">{member?.fohAssigned}</td> */}
                <div className="absolute hidden group-hover:flex gap-2 items-center right-0 h-full top-0 w-[50%] flex items-center justify-end bg-[linear-gradient(269deg,_#ffffff_30%,_transparent)] pr-5 transition duration-700">
                  <div className="flex gap-1">
                    <Tooltip
                      id={`edit-member-${member?.id}`}
                      content="Edit Member"
                      place="top"
                    >
                      <div className="p-1 cursor-pointer">
                        <Link to={`/member/${member?.id}`} className="p-0">
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
