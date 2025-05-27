import React, { useState } from "react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import Select from "react-select";
import { customStyles } from "../Helper/helper";
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
} from "date-fns";
import { LiaEdit } from "react-icons/lia";
import { MdCall, MdModeEdit } from "react-icons/md";

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
  const [membershipFilter, setMembershipFilter] = useState(null);
  const [trainerTypeFilter, setTrainerTypeFilter] = useState(null); // ✅ renamed to trainerTypeFilter
  const [fohFilter, setFohFilter] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;
  const [dateFilter, setDateFilter] = useState(null);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const applyDateFilter = (memberDate) => {
    if (!dateFilter) return true;
    const date = parseISO(memberDate);
    const today = startOfToday();

    switch (dateFilter.value) {
      case "today":
        return format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
      case "last7":
        return isWithinInterval(date, { start: subDays(today, 6), end: today });
      case "monthTillDate":
        return isWithinInterval(date, {
          start: startOfMonth(today),
          end: today,
        });
      case "custom":
        if (!customFrom || !customTo) return true;
        return isWithinInterval(date, {
          start: parseISO(customFrom),
          end: parseISO(customTo),
        });
      default:
        return true;
    }
  };

  // ✅ Updated filtering logic
  const filteredData = memberMockData.filter((member) => {
    const matchesSearch =
      search === "" || member.name.toLowerCase().includes(search.toLowerCase());
    const matchesMembership =
      !membershipFilter || member.membershipType === membershipFilter.value;
    const matchesTrainerType =
      !trainerTypeFilter || member.trainerType === trainerTypeFilter.value;
    const matchesFoh = !fohFilter || member.fohAssigned === fohFilter.value;
    const matchesDate = applyDateFilter(member.memberFrom);

    return (
      matchesSearch &&
      matchesMembership &&
      matchesTrainerType &&
      matchesFoh &&
      matchesDate
    );
  });

  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  console.log("Date Filter Range:", { customFrom, customTo });
  paginatedData.forEach((member) => {
    const date = new Date(member.memberFrom);
    console.log(
      `Member ${member.name} joined on ${member.memberFrom}`,
      date >= new Date(customFrom) && date <= new Date(customTo)
    );
  });

  return (
    <div className="page--content">
      <div className=" flex items-end justify-between gap-2 mb-5">
          <div className="title--breadcrumbs">
            <p className="text-sm">{`Home > Members > All Members`}</p>
            <h1 className="text-3xl font-semibold">All Members</h1>
          </div>
        </div>
        {/* end title */}

      <div className="flex w-full gap-2 justify-between items-center mb-4">
        <div className="flex flex-1 gap-2 items-center">
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
          />
          <Select
            placeholder="Date Filter"
            options={dateFilterOptions}
            value={dateFilter}
            onChange={(selected) => {
              setDateFilter(selected);
              if (selected?.value !== "custom") {
                setCustomFrom("");
                setCustomTo("");
              }
            }}
            isClearable
            styles={customStyles}
          />
          {dateFilter?.value === "custom" && (
            <>
              <input
                type="date"
                className="custom--input w-full max-w-[170px]"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
              />
              <input
                type="date"
                className="custom--input w-full max-w-[170px]"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
              />
            </>
          )}
        </div>
        <div className="flex items-center gap-2 border rounded-[50px] px-2 bg-white">
          <IoIosSearch className="text-xl" />
          <input
            type="text"
            value={search}
            placeholder="Search"
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xs px-3 py-2 border-none rounded-[50px] focus:outline-none"
          />
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-4 py-4">#</th>
              <th className="px-4 py-4">Member ID</th>
              <th className="px-4 py-4">Member Name</th>
              <th className="px-4 py-4">Membership Type</th>
              <th className="px-4 py-4">Member From</th>
              <th className="px-4 py-4">Member Till</th>
              <th className="px-4 py-4">Trainer</th>
              <th className="px-4 py-4">FOH Assigned</th>
              <th className="px-4 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((member, index) => (
              <tr
                key={member.id}
                className="bg-white border-b hover:bg-gray-50"
              >
                <td className="px-2 py-4">
                  {index + 1 + (page - 1) * rowsPerPage}
                </td>
                <td className="px-2 py-4">{member.memberId}</td>
                <td className="px-2 py-4">{member.name}</td>
                <td className="px-2 py-4">{member.membershipType}</td>
                <td className="px-2 py-4">{member.memberFrom}</td>
                <td className="px-2 py-4">{member.memberTill}</td>
                <td className="px-2 py-4">{member.trainer}</td>
                <td className="px-2 py-4">{member.fohAssigned}</td>
                <td className="px-2 py-4">
                  <div className="flex gap-1">
                    <Link
                      to={`/member/${member.id}`}
                      className="p-1"
                    >
                      <MdModeEdit className="text-2xl text-black" />
                    </Link>

                    <Link to={`#`} className="p-1">
                      <MdCall className="text-2xl text-black" />
                    </Link>
                    <button className="p-1" title="Send Payment Link">
                      <IoIosAddCircleOutline className="text-2xl text-black" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paginatedData.length === 0 && (
          <p className="text-center p-4">No matching members found.</p>
        )}
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div>
          Showing {filteredData.length === 0 ? 0 : (page - 1) * rowsPerPage + 1}{" "}
          to {Math.min(page * rowsPerPage, filteredData.length)} of{" "}
          {filteredData.length}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(Math.max(page - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 border rounded ${
                page === i + 1 ? "bg-gray-300" : ""
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage(Math.min(page + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberList;
