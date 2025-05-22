import React, { useState } from "react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import Select from "react-select";
import { customStyles } from "../Helper/helper";
import { IoIosSearch } from "react-icons/io";
import { FiPlus } from "react-icons/fi";
import { lostFoundData } from "../DummyData/DummyData";


const getUniqueOptions = (data, key) => {
  return Array.from(new Set(data.map((item) => item[key]))).map((val) => ({
    value: val,
    label: val,
  }));
};

const AllLostFound = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [LostFoundModal, setLostFoundModal] = useState(false);
  const [lostItemName, setLostItemName] = useState(null);
  const [selectedLostStatus, setSelectedLostStatus] = useState(null);
  const rowsPerPage = 5;

  const filteredData = lostFoundData.filter((row) => {
    return (
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(search.toLowerCase())
      ) &&
      (!lostItemName || row.item === lostItemName.value) &&
      (!selectedLostStatus || row.status === selectedLostStatus.value)
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
        <div className=" flex items-end justify-between gap-2 mb-5">
          <div className="title--breadcrumbs">
            <p className="text-sm">{`Home > Lost & Found`}</p>
            <h1 className="text-3xl font-semibold">Lost & Found</h1>
          </div>
          <div className="flex items-end gap-2">
            <button
              // onClick={() => setLostFoundModal(true)}
              type="button"
              className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
            >
              <FiPlus /> Add New Item
            </button>
          </div>
        </div>
        {/* end title */}
        <div className="flex flex-wrap gap-4 mb-4 items-center justify-between">
          <div className="flex gap-2 items-center">
            <Select
              placeholder="Item Name"
              options={getUniqueOptions(lostFoundData, "item")}
              value={lostItemName}
              onChange={setLostItemName}
              isClearable
              styles={customStyles}
            />
            <Select
              placeholder="Status"
              options={getUniqueOptions(lostFoundData, "status")}
              value={selectedLostStatus}
              onChange={setSelectedLostStatus}
              isClearable
              styles={customStyles}
            />
          </div>

          <div className="flex items-center gap-2 border rounded-[50px] px-2 bg-white">
            <IoIosSearch className="text-xl" />
            <input
              type="text"
              value={search}
              placeholder="Search"
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-xs px-3 py-2 border-none rounded-[50px] focus:outline-none focus:border-none focus:shadow-none"
            />
          </div>
        </div>

        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-2 py-4">
                  #
                </th>
                <th scope="col" className="px-2 py-4">
                  Item
                </th>
                <th scope="col" className="px-2 py-4">
                  Status
                </th>
                <th scope="col" className="px-2 py-4">
                  Date
                </th>
                <th scope="col" className="px-2 py-4">
                  Description
                </th>
                <th scope="col" className="px-2 py-4">
                  Image
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, idx) => (
                <tr
                  key={row.id}
                  className="bg-white border-b hover:bg-gray-50 border-gray-200"
                >
                  <td className="px-2 py-4">
                    {idx + 1 + (page - 1) * rowsPerPage}
                  </td>
                  <td className="px-2 py-4">{row.item}</td>
                  <td className="px-2 py-4">{row.status}</td>
                  <td className="px-2 py-4">{row.date}</td>
                  <td className="px-2 py-4">{row.description}</td>
                  <td className="px-2 py-4">
                    <img src={row.itemImage} width={40} height={40} />
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4 gap-2">
          <div>
            <p className="text-gray-700">
              Showing{" "}
              {filteredData.length === 0 ? 0 : (page - 1) * rowsPerPage + 1} to{" "}
              {Math.min(page * rowsPerPage, filteredData.length)} of{" "}
              {filteredData.length} entries
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-2 border rounded disabled:opacity-50"
            >
              <FaAngleLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={`px-3 py-1 border rounded ${
                    page === i + 1 ? "bg-gray-200" : ""
                  }`}
                  onClick={() => setPage(i + 1)}
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
              <FaAngleRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </>
  );
};

export default AllLostFound;
