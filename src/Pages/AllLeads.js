import React, { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import { useDropzone } from "react-dropzone";
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
import { RiResetLeftFill } from "react-icons/ri";
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

// const getUniqueOptions = (data, key) => {
//   return Array.from(new Set(data.map((item) => item[key]))).map((val) => ({
//     value: val,
//     label: val,
//   }));
// };

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last7", label: "Last 7 Days" },
  { value: "monthTillDate", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const AllLeads = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [leadModal, setLeadModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const [selectedService, setSelectedService] = useState(null);
  const [selectedLeadSource, setSelectedLeadSource] = useState(null);
  const [selectedCallTag, setSelectedCallTag] = useState(null);
  const [selectedLeadStatus, setSelectedLeadStatus] = useState(null);
  const [selectedLeadType, setSelectedLeadType] = useState(null);
  const [dateFilter, setDateFilter] = useState(null);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  const [allLeads, setAllLeads] = useState(mockData); // this replaces direct use of mockData
  // const [uploadErrors, setUploadErrors] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewNewLeads, setPreviewNewLeads] = useState([]);
  const [previewDuplicateLeads, setPreviewDuplicateLeads] = useState([]);

  const query = useQuery();
  const selectedStatus = query.get("leadStatus");
  console.log(selectedStatus, "selectedStatus");

  useEffect(() => {
    if (selectedStatus) {
      const filtered = mockData.filter(
        (lead) => lead.leadStatus.toLowerCase() === selectedStatus.toLowerCase()
      );
      setAllLeads(filtered);
    } else {
      setAllLeads(mockData);
    }
  }, [selectedStatus]);

  const rowsPerPage = 5;

  useEffect(() => {
    setPage(1); // Reset to page 1 when filters change
  }, [selectedLeadStatus, selectedLeadType, selectedLeadSource]);

  const filteredData = useMemo(() => {
    const today = startOfToday();

    let fromDate = null;
    let toDate = null;

    switch (dateFilter?.value) {
      case "today":
        fromDate = today;
        toDate = today;
        break;
      case "last7":
        fromDate = subDays(today, 6);
        toDate = today;
        break;
      case "monthTillDate":
        fromDate = startOfMonth(today);
        toDate = today;
        break;
      case "custom":
        fromDate = customFrom;
        toDate = customTo;
        break;
      default:
        fromDate = null;
        toDate = null;
        break;
    }

    return allLeads.filter((row) => {
      // Parse createdOn from "DD-MM-YYYY"
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
        (!selectedLeadStatus ||
          row.leadStatus?.toLowerCase() ===
            selectedLeadStatus.value?.toLowerCase()) &&
        (!selectedLeadType || row.leadType === selectedLeadType.value) &&
        isAfterFromDate &&
        isBeforeToDate
      );
    });
  }, [
    allLeads,
    search,
    selectedService,
    selectedLeadSource,
    selectedCallTag,
    selectedLeadStatus,
    selectedLeadType,
    dateFilter,
    customFrom,
    customTo,
  ]);

  console.log(selectedLeadStatus, "selectedLeadStatus");

  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

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
            enquiryStage: row["Lead Status"] || "New",
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
              selectedLeadType={selectedLeadType}
              setSelectedLeadType={setSelectedLeadType}
              selectedLeadStatus={selectedLeadStatus}
              setSelectedLeadStatus={setSelectedLeadStatus}
              selectedCallTag={selectedCallTag}
              setSelectedCallTag={setSelectedCallTag}
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

            {selectedStatus && (
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
                        onClick={() => {
                          setSelectedLead(row);
                          setLeadModal(true);
                        }}
                        className="p-1 cursor-pointer"
                      >
                        <LiaEdit className="text-2xl text-black" />
                      </div>
                      {/* <Link to={`/edit-lead-details/${row.id}`} className="p-1">
                        <LiaEdit className="text-2xl text-black" />
                      </Link> */}
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
                      <th className="p-2 border">Lead Type</th>
                      <th className="p-2 border">Lead Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewDuplicateLeads.map((lead, idx) => (
                      <tr key={idx}>
                        <td className="p-2 border">{lead.name}</td>
                        <td className="p-2 border">{lead.leadType}</td>
                        <td className="p-2 border">{lead.leadSource}</td>
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
                      <th className="p-2 border">Lead Type</th>
                      <th className="p-2 border">Lead Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewNewLeads.map((lead, idx) => (
                      <tr key={idx}>
                        <td className="p-2 border">{lead.name}</td>
                        <td className="p-2 border">{lead.leadType}</td>
                        <td className="p-2 border">{lead.leadSource}</td>
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
    </>
  );
};

export default AllLeads;
