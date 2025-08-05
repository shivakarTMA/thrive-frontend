import React, { useState, useEffect } from "react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import { IoIosSearch } from "react-icons/io";
import Select from "react-select";
import { lostFoundData as initialData } from "../../DummyData/DummyData";
import AddNewItemModal from "./AddNewItemModal"; // Assume separate component
import MarkReturnedModal from "./MarkReturnedModal"; // Assume separate component
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { customStyles } from "../../Helper/helper";

const getUniqueOptions = (data, key) => {
  return Array.from(new Set(data.map((item) => item[key]))).map((val) => ({
    value: val,
    label: val,
  }));
};

const AllLostFound = () => {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [markReturnedData, setMarkReturnedData] = useState(null);
  const [lostItemName, setLostItemName] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedClub, setSelectedClub] = useState(null);
    const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const rowsPerPage = 5;

  const handleMarkAsReturned = (item) => {
    setMarkReturnedData(item);
  };

  const handleReturnSubmit = (itemId, returnInfo) => {
    const updated = data.map((item) =>
      item.id === itemId
        ? {
            ...item,
            status: "Returned",
            returnedInfo: returnInfo,
          }
        : item
    );
    setData(updated);
    setMarkReturnedData(null);
  };

  const filteredData = data.filter((row) => {
    const matchesSearch =
      row.item.toLowerCase().includes(search.toLowerCase()) ||
      row?.returnedInfo?.memberName?.toLowerCase()?.includes(search.toLowerCase());

    const matchesItem = !lostItemName || row.item === lostItemName.value;
    const matchesStatus = !selectedStatus || row.status === selectedStatus.value;
    const matchesClub = !selectedClub || row.clubName === selectedClub.value;
    const matchesDateRange =
      (!startDate || new Date(row.date) >= startDate) &&
      (!endDate || new Date(row.date) <= endDate);

    return (
      matchesSearch && matchesItem && matchesStatus && matchesClub && matchesDateRange
    );
  });

  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  return (
    <div className="page--content">
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">Home &gt; Lost &amp; Found</p>
          <h1 className="text-3xl font-semibold">Lost &amp; Found</h1>
        </div>
        <div className="flex items-end gap-2">
          <button
            onClick={() => setModalOpen(true)}
            type="button"
            className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
          >
            <FiPlus /> Add New Item
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-4 items-center justify-between">
        <div className="flex gap-2 items-center">
          <Select
            placeholder="Item Name"
            options={getUniqueOptions(data, "item")}
            value={lostItemName}
            onChange={setLostItemName}
            isClearable
            styles={customStyles}
          />
          <Select
            placeholder="Status"
            options={[
              { value: "Lost", label: "Lost" },
              { value: "Returned", label: "Returned" },
            ]}
            value={selectedStatus}
            onChange={setSelectedStatus}
            isClearable
            styles={customStyles}
          />
          <Select
            placeholder="Club Name"
            options={getUniqueOptions(data, "clubName")}
            value={selectedClub}
            onChange={setSelectedClub}
            isClearable
            styles={customStyles}
          />
          <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
            isClearable
            placeholderText="Select date range"
            className="input--icon px-3 py-2 border rounded"
          />
        </div>

        <div className="flex items-center gap-2 border rounded-[50px] px-2 bg-white">
          <IoIosSearch className="text-xl" />
          <input
            type="text"
            value={search}
            placeholder="Search by item/member"
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xs px-3 py-2 border-none rounded-[50px] focus:outline-none"
          />
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-2 py-4">#</th>
              <th className="px-2 py-4">Item</th>
              <th className="px-2 py-4">Status</th>
              <th className="px-2 py-4">Date</th>
              <th className="px-2 py-4">Description</th>
              <th className="px-2 py-4">Image</th>
              <th className="px-2 py-4">Club</th>
              <th className="px-2 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, idx) => (
              <tr
                key={row.id}
                className="bg-white border-b hover:bg-gray-50 border-gray-200"
              >
                <td className="px-2 py-4">{idx + 1 + (page - 1) * rowsPerPage}</td>
                <td className="px-2 py-4">{row.item}</td>
                <td className="px-2 py-4">
                  <span className={`px-2 py-1 rounded text-white text-xs ${
                    row.status === "Lost" ? "bg-red-500" : "bg-green-500"
                  }`}>{row.status}</span>
                </td>
                <td className="px-2 py-4">{row.date}</td>
                <td className="px-2 py-4">{row.description}</td>
                <td className="px-2 py-4">
                  {row.itemImage && (
                    <img src={row.itemImage} alt="item" width={40} height={40} />
                  )}
                </td>
                <td className="px-2 py-4">{row.clubName}</td>
                <td className="px-2 py-4">
                  {row.status === "Lost" ? (
                    <button
                      onClick={() => handleMarkAsReturned(row)}
                      className="text-blue-600 underline text-sm"
                    >
                      Mark as Returned
                    </button>
                  ) : (
                    "--"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4 gap-2">
        <p className="text-gray-700">
          Showing {filteredData.length === 0 ? 0 : (page - 1) * rowsPerPage + 1} to {Math.min(page * rowsPerPage, filteredData.length)} of {filteredData.length} entries
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-2 border rounded disabled:opacity-50"
          >
            <FaAngleLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 border rounded ${page === i + 1 ? "bg-gray-200" : ""}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-2 border rounded disabled:opacity-50"
          >
            <FaAngleRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modals */}
      {modalOpen && (
        <AddNewItemModal
          onClose={() => setModalOpen(false)}
          onSubmit={(newItem) => {
            setData((prev) => [...prev, newItem]);
            setModalOpen(false);
          }}
        />
      )}

      {markReturnedData && (
        <MarkReturnedModal
          item={markReturnedData}
          onClose={() => setMarkReturnedData(null)}
          onSubmit={handleReturnSubmit}
        />
      )}
    </div>
  );
};

export default AllLostFound;
