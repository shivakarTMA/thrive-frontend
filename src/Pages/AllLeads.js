import React, { useState } from "react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { IoIosAddCircleOutline, IoIosSearch } from "react-icons/io";
import { FiPlus } from "react-icons/fi";
import { LiaEdit } from "react-icons/lia";
import { MdCall } from "react-icons/md";
import Select from "react-select";
import { customStyles } from "../Helper/helper";
import { mockData } from "../DummyData/DummyData";
import CreateLeadForm from "./CreateLeadForm";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const getUniqueOptions = (data, key) => {
  return Array.from(new Set(data.map((item) => item[key]))).map((val) => ({
    value: val,
    label: val,
  }));
};

const leadStatusOptions = [
  "New",
  "Lead",
  "Opportunity",
  "Won",
  "Closed",
  "Lost",
].map((val) => ({
  value: val,
  label: val,
}));

const leadTypeOptions = ["Walk-in", "Phone", "Email", "WhatsApp"].map(
  (val) => ({
    value: val,
    label: val,
  })
);

const AllLeads = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [leadModal, setLeadModal] = useState(false);

  const [selectedService, setSelectedService] = useState(null);
  const [selectedLeadSource, setSelectedLeadSource] = useState(null);
  const [selectedCallTag, setSelectedCallTag] = useState(null);
  const [selectedLeadStatus, setSelectedLeadStatus] = useState(null);
  const [selectedLeadType, setSelectedLeadType] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const rowsPerPage = 5;

  const filteredData = mockData.filter((row) => {
    const [day, month, year] = row.createdOn.split("-");
    const createdOnDate = new Date(`${year}-${month}-${day}`);

    const isAfterFromDate = fromDate
      ? createdOnDate >= new Date(fromDate)
      : true;
    const isBeforeToDate = toDate ? createdOnDate <= new Date(toDate) : true;

    return (
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(search.toLowerCase())
      ) &&
      (!selectedService || row.service === selectedService.value) &&
      (!selectedLeadSource || row.leadSource === selectedLeadSource.value) &&
      (!selectedCallTag || row.staff === selectedCallTag.value) &&
      (!selectedLeadStatus || row.enquiryStage === selectedLeadStatus.value) &&
      (!selectedLeadType || row.leadType === selectedLeadType.value) &&
      isAfterFromDate &&
      isBeforeToDate
    );
  });

  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  return (
    <>
      <div className="page--content">
        <div className="flex items-end justify-between gap-2 mb-5">
          <div className="title--breadcrumbs">
            <p className="text-sm">{`Home > My Leads > All Leads`}</p>
            <h1 className="text-3xl font-semibold">All Leads</h1>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={() => setLeadModal(true)}
              type="button"
              className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
            >
              <FiPlus /> Add New Lead
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <Select
              placeholder="Lead Status"
              options={leadStatusOptions}
              value={selectedLeadStatus}
              onChange={setSelectedLeadStatus}
              isClearable
              styles={customStyles}
            />
            <Select
              placeholder="Lead Type"
              options={leadTypeOptions}
              value={selectedLeadType}
              onChange={setSelectedLeadType}
              isClearable
              styles={customStyles}
            />
            <Select
              placeholder="Lead Source"
              options={getUniqueOptions(mockData, "leadSource")}
              value={selectedLeadSource}
              onChange={setSelectedLeadSource}
              isClearable
              styles={customStyles}
            />
            {/* <Select
            placeholder="Service"
            options={getUniqueOptions(mockData, "service")}
            value={selectedService}
            onChange={setSelectedService}
            isClearable
            styles={customStyles}
          /> */}
            <Select
              placeholder="Staff"
              options={getUniqueOptions(mockData, "staff")}
              value={selectedCallTag}
              onChange={setSelectedCallTag}
              isClearable
              styles={customStyles}
            />
            <div className="custom--date">
              <DatePicker
                selected={fromDate}
                onChange={(date) => setFromDate(date)}
                placeholderText="From Date"
                className="border px-3 py-2 rounded"
                dateFormat="dd-MM-yyyy"
                isClearable
              />
            </div>
            <div className="custom--date">
              <DatePicker
                selected={toDate}
                onChange={(date) => setToDate(date)}
                placeholderText="To Date"
                className="border px-3 py-2 rounded"
                dateFormat="dd-MM-yyyy"
                isClearable
              />
            </div>
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

        {/* Table */}
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-2 py-4">#</th>
                <th className="px-2 py-4">Lead ID</th>
                <th className="px-2 py-4">Created on</th>
                <th className="px-2 py-4">Name</th>
                <th className="px-2 py-4">Lead Type</th>
                <th className="px-2 py-4">Lead Source</th>
                <th className="px-2 py-4">Lead Status</th>
                <th className="px-2 py-4">Last Updated</th>
                <th className="px-2 py-4">Lead Call Status</th>
                <th className="px-2 py-4">Staff</th>
                <th className="px-2 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, idx) => (
                <tr key={row.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-2 py-4">
                    {idx + 1 + (page - 1) * rowsPerPage}
                  </td>
                  <td className="px-2 py-4">{row.enquiryId}</td>
                  <td className="px-2 py-4">{row.createdOn}</td>
                  <td className="px-2 py-4">{row.name}</td>
                  <td className="px-2 py-4">{row.leadType}</td>
                  <td className="px-2 py-4">{row.leadSource}</td>
                  <td className="px-2 py-4">{row.enquiryStage}</td>
                  <td className="px-2 py-4">{row.lastUpdated}</td>
                  <td className="px-2 py-4">{row.callTag}</td>
                  <td className="px-2 py-4">{row.staff}</td>
                  <td className="px-2 py-4">
                    <div className="flex gap-1">
                      <div
                        onClick={() => setLeadModal(true)}
                        className="p-1 cursor-pointer"
                      >
                        <LiaEdit className="text-2xl text-black" />
                      </div>
                      <Link to={`/lead-follow-up/${row.id}`} className="p-1">
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
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4 gap-2">
          <p className="text-gray-700">
            Showing{" "}
            {filteredData.length === 0 ? 0 : (page - 1) * rowsPerPage + 1} to{" "}
            {Math.min(page * rowsPerPage, filteredData.length)} of{" "}
            {filteredData.length} entries
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-2 border rounded disabled:opacity-50"
            >
              <FaAngleLeft />
            </button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 border rounded ${
                    page === i + 1 ? "bg-gray-200" : ""
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-2 border rounded disabled:opacity-50"
            >
              <FaAngleRight />
            </button>
          </div>
        </div>
      </div>

      {leadModal && <CreateLeadForm setLeadModal={setLeadModal} />}
    </>
  );
};

export default AllLeads;
