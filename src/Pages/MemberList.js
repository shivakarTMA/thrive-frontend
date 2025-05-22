import React, { useState } from "react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import Select from "react-select";
import { customStyles } from "../Helper/helper";
import { mockData } from "../DummyData/DummyData";
import { Link } from "react-router-dom";

const getUniqueOptions = (data, key) => {
  return Array.from(new Set(data.map((item) => item[key]))).map((val) => ({
    value: val,
    label: val,
  }));
};

const filterOptions = {
  service: ["Membership Plan", "Personal Training"],
  serviceVariation: ["1 Month", "6 Month"],
  ageGroup: ["0-5 years", "5-8 years"],
  gender: ["Male", "Female", "Not Specified"],
  salesRep: ["Kritika", "Ravinder"],
  memberManager: ["Kritika", "Ravinder"],
  generalTrainer: ["Kritika", "Ravinder"],
  leadSource: ["Corporate", "Email", "Google"],
  invoice: ["Not Billed Members", "Expired Invoice"],
  serviceCategory: ["Trial", "PT Trial"],
  purchaseType: ["Membership", "Events"],
  behaviourBased: ["Referrers", "Irregular Member"],
  fitnessGoal: ["Sport", "Fat Loss"],
  customGroups: [],
};

const statusOptions = ["Active", "Inactive"];

const toOptions = (arr) => arr.map((item) => ({ label: item, value: item }));

const MemberList = () => {
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [lostItemName, setLostItemName] = useState(null);
  const [selectedLostStatus, setSelectedLostStatus] = useState(null);
  const rowsPerPage = 5;
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedServiceStatus, setSelectedServiceStatus] = useState(null);
  const [selectedServiceVariation, setSelectedServiceVariation] =
    useState(null); // NEW: for "serviceVariation"
  const [selectedVariationStatus, setSelectedVariationStatus] = useState(null); // NEW: for variation status
  console.log(
    "Filter values:",
    selectedService?.value,
    selectedServiceStatus?.value
  );

  const topLevelFilters = Object.keys(filterOptions).map((key) => ({
    label: key.charAt(0).toUpperCase() + key.slice(1),
    value: key,
  }));

  const handleFilterChange = (option) => {
    setSelectedFilter(option);
    setSelectedValue(null);
    setSelectedService(null);
    setSelectedServiceStatus(null);
    console.log("service option ", option);
  };

  const filteredData = mockData.filter((row) => {
    const serviceMatch =
      !selectedService ||
      row.service?.toLowerCase().trim() ===
        selectedService.value.toLowerCase().trim();

    const variationMatch =
      !selectedServiceVariation ||
      row.serviceVariation?.toLowerCase().trim() ===
        selectedServiceVariation.value.toLowerCase().trim();

    const serviceStatusMatch =
      !selectedServiceStatus ||
      row.status?.toLowerCase().trim() ===
        selectedServiceStatus.value.toLowerCase().trim();

    const variationStatusMatch =
      !selectedVariationStatus ||
      row.status?.toLowerCase().trim() ===
        selectedVariationStatus.value.toLowerCase().trim();

    const lostStatusMatch =
      !selectedLostStatus ||
      row.status?.toLowerCase().trim() ===
        selectedLostStatus.value.toLowerCase().trim();

    const genericFilterMatch =
      !selectedFilter ||
      !selectedValue ||
      row[selectedFilter.value]?.toLowerCase().trim() ===
        selectedValue.value.toLowerCase().trim();

    const searchMatch = Object.values(row).some((val) =>
      String(val).toLowerCase().includes(search.toLowerCase())
    );

    if (selectedFilter?.value === "service") {
      return (
        searchMatch && serviceMatch && serviceStatusMatch && lostStatusMatch
      );
    } else if (selectedFilter?.value === "serviceVariation") {
      return (
        searchMatch && variationMatch && variationStatusMatch && lostStatusMatch
      );
    } else if (selectedFilter) {
      return searchMatch && genericFilterMatch && lostStatusMatch;
    } else {
      return searchMatch && lostStatusMatch;
    }
  });

  console.log("Filtered Data:", filteredData);

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
            <p className="text-sm">{`Home > Members > All Members`}</p>
            <h1 className="text-3xl font-semibold">All Members</h1>
          </div>
        </div>
        {/* end title */}

        <div className="flex flex-wrap gap-4 mb-4 items-center justify-between">
          <div className="flex gap-2 items-center">
            <Select
              placeholder="Status"
              options={getUniqueOptions(mockData, "status")}
              value={selectedLostStatus}
              onChange={setSelectedLostStatus}
              isClearable
              styles={customStyles}
            />

            <Select
              placeholder="Select Filter"
              options={topLevelFilters}
              value={selectedFilter}
              onChange={handleFilterChange}
              isClearable
              styles={customStyles}
            />

            {/* If service, show two dropdowns */}
            {selectedFilter?.value === "service" && (
              <>
                <Select
                  placeholder="Select Service Type"
                  options={toOptions(filterOptions.service)}
                  value={selectedService}
                  onChange={setSelectedService}
                  isClearable
                  styles={customStyles}
                />
                <Select
                  placeholder="Select Status"
                  options={toOptions(statusOptions)}
                  value={selectedServiceStatus}
                  onChange={setSelectedServiceStatus}
                  isClearable
                  styles={customStyles}
                />
              </>
            )}

            {selectedFilter?.value === "serviceVariation" && (
              <>
                <Select
                  placeholder="Select Service Variation"
                  options={toOptions(filterOptions.serviceVariation)}
                  value={selectedServiceVariation}
                  onChange={setSelectedServiceVariation}
                  isClearable
                  styles={customStyles}
                />
                <Select
                  placeholder="Select Status"
                  options={toOptions(statusOptions)}
                  value={selectedVariationStatus}
                  onChange={setSelectedVariationStatus}
                  isClearable
                  styles={customStyles}
                />
              </>
            )}

            {selectedFilter?.value &&
              selectedFilter.value !== "service" &&
              selectedFilter.value !== "serviceVariation" &&
              filterOptions[selectedFilter.value]?.length > 0 && (
                <Select
                  placeholder={`Select ${selectedFilter.label}`}
                  options={toOptions(filterOptions[selectedFilter.value])}
                  value={selectedValue}
                  onChange={setSelectedValue}
                  isClearable
                  styles={customStyles}
                />
              )}
          </div>

          <div>
            <input
              type="text"
              placeholder="Search by name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-64"
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
                  Profile
                </th>
                <th scope="col" className="px-2 py-4">
                  Status
                </th>
                <th scope="col" className="px-2 py-4">
                  Billing
                </th>
                <th scope="col" className="px-2 py-4">
                  Action
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
                  <td className="px-2 py-4">
                    <div className="flex gap-2 items-center">
                      <img
                        src={row.profileImage}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />{" "}
                      {row.name}
                    </div>
                  </td>
                  <td className="px-2 py-4 capitalize">{row.status}</td>
                  <td className="px-2 py-4">{row.createdOn}</td>
                  <td className="px-2 py-4">
                    <Link
                      to={`/member/${row.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {paginatedData.length === 0 && (
          <p className="p-2 w-full block text-center">No data found</p>
        )}

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

export default MemberList;
