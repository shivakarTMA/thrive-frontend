import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiPlus } from "react-icons/fi";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { toast } from "react-toastify";
import { LiaEdit } from "react-icons/lia";
import Tooltip from "../common/Tooltip";
import Select from "react-select";
import { customStyles } from "../../Helper/helper";
import CreateStaff from "./CreateStaff";
import Switch from "react-switch";
import { apiAxios } from "../../config/config";

const roleTypeOptions = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "foh", label: "FOH" },
  { value: "pt", label: "PT" },
  { value: "gt", label: "GT" },
  { value: "nutritionist", label: "Nutritionist" },
  { value: "spa", label: "Spa" },
  { value: "salon", label: "Salon" },
  { value: "housekeeping", label: "Housekeeping" },
  { value: "others", label: "Others" },
];

const centerOptions = [
  { value: "center1", label: "Center 1" },
  { value: "center2", label: "Center 2" },
  { value: "center3", label: "Center 3" },
];

const appStatusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];
const listingStatusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const StaffList = () => {
  const [showModal, setShowModal] = useState(false);
  const [submittedServices, setSubmittedServices] = useState([]);
  const [editingService, setEditingService] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServiceType, setSelectedServiceType] = useState(null);
  const [selectedCentre, setSelectedCentre] = useState(null);
  const [selectedStaffStatus, setSelectedStaffStatus] = useState(null);
  const [selectedAppStatus, setSelectedAppStatus] = useState(null);

  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  // 🚀 Fetch staff list from API
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await apiAxios().get("/staff/list");
        if (response.data?.status) {
          const staffList = response.data.data.map((staff) => ({
            id: staff.id,
            fullName: staff.name,
            email: staff.email,
            role: staff.designation || "N/A",
            assignedCenters: ["Center 1"], // dummy data until API provides
            status: "active", // default until API provides
            showOnApp: "inactive", // default until API provides
          }));
          setSubmittedServices(staffList);
        }
      } catch (error) {
        console.error("Error fetching staff:", error);
        toast.error("Failed to fetch staff");
      }
    };
    fetchStaff();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedServiceType, submittedServices]);

  // Filtered + paginated data
  const filteredData = submittedServices.filter((staff) => {
    const lowerSearchTerm = searchTerm.toLowerCase();

    const matchesSearch =
      staff.fullName.toLowerCase().includes(lowerSearchTerm) ||
      staff.email?.toLowerCase().includes(lowerSearchTerm);

    const matchesType = selectedServiceType
      ? staff.role === selectedServiceType.value
      : true;

    const matchesCentre = selectedCentre
      ? staff.assignedCenters?.includes(selectedCentre.value)
      : true;

    const matchesStatus = selectedStaffStatus
      ? staff.status === selectedStaffStatus.value
      : true;

    const matchesShowOnApp = selectedAppStatus
      ? staff.showOnApp === selectedAppStatus.value
      : true;

    return (
      matchesSearch &&
      matchesType &&
      matchesCentre &&
      matchesStatus &&
      matchesShowOnApp
    );
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Add / Update staff locally (replace with POST/PUT API when available)
  const handleStaffCreated = (item) => {
    if (editingService) {
      setSubmittedServices((prev) =>
        prev.map((p) =>
          p.id === item.id ? { ...p, ...item } : p
        )
      );
      toast.success("Staff updated successfully!");
    } else {
      const newProduct = { id: Date.now(), ...item };
      setSubmittedServices((prev) => [...prev, newProduct]);
      toast.success("Staff added successfully!");
    }
    setShowModal(false);
    setEditingService(null);
  };

  // Toggle staff status / showOnApp
  const handleStatusToggle = (productId, key) => {
    let newStatus = "";

    setSubmittedServices((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const currentStatus = item[key] || "inactive";
          newStatus = currentStatus === "active" ? "inactive" : "active";
          return { ...item, [key]: newStatus };
        }
        return item;
      })
    );

    toast.success(
      `${
        key === "status" ? "Staff status" : "Show on App"
      } marked as ${newStatus}`
    );
  };

  return (
    <div className="page--content">
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > All Staff`}</p>
          <h1 className="text-3xl font-semibold">All Staff</h1>
        </div>
        <button
          type="button"
          className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
          onClick={() => {
            setEditingService(null);
            setShowModal(true);
          }}
        >
          <FiPlus /> Add Staff
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Name or Email"
          className="custom--input w-full max-w-[210px]"
        />

        <Select
          options={roleTypeOptions}
          value={selectedServiceType}
          onChange={setSelectedServiceType}
          isClearable
          placeholder="Staff Role"
          styles={customStyles}
          className="min-w-[150px]"
        />

        <Select
          options={centerOptions}
          value={selectedCentre}
          onChange={setSelectedCentre}
          isClearable
          placeholder="Assigned Center"
          styles={customStyles}
          className="min-w-[150px]"
        />

        <Select
          options={appStatusOptions}
          value={selectedAppStatus}
          onChange={setSelectedAppStatus}
          isClearable
          placeholder="App Visibility"
          styles={customStyles}
          className="min-w-[150px]"
        />

        <Select
          options={listingStatusOptions}
          value={selectedStaffStatus}
          onChange={setSelectedStaffStatus}
          isClearable
          placeholder="Staff Status"
          styles={customStyles}
          className="min-w-[150px]"
        />
      </div>

      {/* Table */}
      <div className="relative overflow-x-auto mt-6">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-2 py-4">Staff ID</th>
              <th className="px-2 py-4">Staff Name</th>
              <th className="px-2 py-4">Role</th>
              <th className="px-2 py-4">Assigned Center</th>
              <th className="px-2 py-4">Staff Status</th>
              <th className="px-2 py-4">Show on App</th>
              <th className="px-2 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, idx) => (
              <tr
                key={row.id}
                className="group bg-white border-b hover:bg-gray-50 transition duration-700"
              >
                <td className="px-2 py-4">
                  {(page - 1) * rowsPerPage + idx + 1}
                </td>
                <td className="px-2 py-4">{row.fullName}</td>
                <td className="px-2 py-4">{row.role}</td>
                <td className="px-2 py-4">
                  {row.assignedCenters?.join(", ") || "N/A"}
                </td>
                <td className="px-2 py-4">
                  <Switch
                    onChange={() => handleStatusToggle(row.id, "status")}
                    checked={row.status === "active"}
                    uncheckedIcon={false}
                    checkedIcon={false}
                    onColor="#000"
                    offColor="#e5e7eb"
                    handleDiameter={22}
                    height={25}
                    width={50}
                    className="custom-switch"
                  />
                </td>
                <td className="px-2 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      row.showOnApp === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {row.showOnApp === "active" ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="px-2 py-4">
                  <Tooltip
                    id={`edit-product-${row.id}`}
                    content="Edit Product"
                    place="left"
                  >
                    <div
                      onClick={() => {
                        setEditingService(row);
                        setShowModal(true);
                      }}
                      className="p-1 cursor-pointer"
                    >
                      <LiaEdit className="text-[25px] text-black" />
                    </div>
                  </Tooltip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 gap-2">
        <p className="text-gray-700">
          Showing {filteredData.length === 0 ? 0 : (page - 1) * rowsPerPage + 1}{" "}
          to {Math.min(page * rowsPerPage, filteredData.length)} of{" "}
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

      {/* Modal */}
      {showModal && (
        <CreateStaff
          setShowModal={setShowModal}
          onExerciseCreated={handleStaffCreated}
          initialData={editingService}
        />
      )}
    </div>
  );
};

export default StaffList;
