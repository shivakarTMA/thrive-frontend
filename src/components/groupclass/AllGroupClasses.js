import React, { useState, useEffect } from "react";
import { FiPlus } from "react-icons/fi";
import { FaAngleLeft, FaAngleRight, FaEye } from "react-icons/fa";
import { toast } from "react-toastify";
import { LiaEdit } from "react-icons/lia";
import Tooltip from "../common/Tooltip";
import Select from "react-select";
import { customStyles } from "../../Helper/helper";
// import CreateProduct from "./CreateProduct";
import Switch from "react-switch";
import CreateGroupClass from "./CreateGroupClass";
import BookingList from "./BookingList";

const trainerList = [
  { value: "vishal", label: "Vishal" },
  { value: "nitin", label: "Nitin" },
  { value: "jatin", label: "Jatin" },
];
const centreList = [
  { value: "delhi", label: "Delhi" },
  { value: "gurugram", label: "Gurugram" },
  { value: "noida", label: "Noida" },
];

const listingStatusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];
const bookings = [
  {
    classId: 1,
    memberId: "M101",
    bookingStatus: "Booked",
    bookingChannel: "App",
    bookedOn: "2025-07-05",
    cancelledOn: null,
    booking_date: "2025-07-10",
    booking_start_time: "07:00 AM",
  },
  {
    classId: 1,
    memberId: "M102",
    bookingStatus: "Cancelled",
    bookingChannel: "CRM",
    bookedOn: "2025-07-05",
    cancelledOn: "2025-07-07",
    booking_date: "2025-07-10",
    booking_start_time: "07:00 AM",
  },
  {
    classId: 2,
    memberId: "M201",
    bookingStatus: "Booked",
    bookingChannel: "App",
    bookedOn: "2025-07-06",
    cancelledOn: null,
    booking_date: "2025-07-12",
    booking_start_time: "06:30 PM",
  },
];

const AllGroupClasses = () => {
  const [showModal, setShowModal] = useState(false);
  const [viewingClassId, setViewingClassId] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [submittedClasses, setSubmittedClasses] = useState([
    {
      id: 1,
      classTitle: "Morning Yoga Flow",
      classTrainer: "vishal",
      centreName: "delhi",
      classDate: "2025-07-10",
      startTime: "07:00 AM",
      endTime: "08:00 AM",
      maxCapacity: 20,
      waitlistCapacity: 5,
      listingStatus: "active",
      classTags: ["yoga", "stretch"],
      paymentType: "free",
      price: null,
    },
    {
      id: 2,
      classTitle: "HIIT Burnout",
      classTrainer: "nitin",
      centreName: "noida",
      classDate: "2025-07-12",
      startTime: "06:30 PM",
      endTime: "07:30 PM",
      maxCapacity: 15,
      waitlistCapacity: 3,
      listingStatus: "inactive",
      classTags: ["hiit", "cardio"],
      paymentType: "paid",
      price: 0,
    },
    {
      id: 3,
      classTitle: "Zumba Dance Blast",
      classTrainer: "jatin",
      centreName: "gurugram",
      classDate: "2025-07-15",
      startTime: "05:00 PM",
      endTime: "06:00 PM",
      maxCapacity: 25,
      waitlistCapacity: 10,
      listingStatus: "active",
      classTags: ["dance", "cardio"],
      paymentType: "free",
      price: null,
    },
    {
      id: 4,
      classTitle: "Strength Training Basics",
      classTrainer: "vishal",
      centreName: "noida",
      classDate: "2025-07-11",
      startTime: "08:00 AM",
      endTime: "09:00 AM",
      maxCapacity: 12,
      waitlistCapacity: 2,
      listingStatus: "active",
      classTags: ["strength", "weights"],
      paymentType: "paid",
      price: 0,
    },
    {
      id: 5,
      classTitle: "Pilates Core",
      classTrainer: "nitin",
      centreName: "delhi",
      classDate: "2025-07-13",
      startTime: "10:00 AM",
      endTime: "11:00 AM",
      maxCapacity: 18,
      waitlistCapacity: 4,
      listingStatus: "inactive",
      classTags: ["pilates", "core"],
      paymentType: "free",
      price: null,
    },
  ]);
  const [editingClasses, setEditingClasses] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  const centreNameOptions = Array.from(
    new Set(submittedClasses.map((p) => p.centreName))
  ).map((name) => ({ value: name, label: name }));

  const [selectedCentre, setSelectedCentre] = useState(null);
  const [selectedListingStatus, setSelectedListingStatus] = useState(null);

  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedTrainer, submittedClasses]);

  // Filtered + paginated data
  const filteredData = submittedClasses.filter((product) => {
    const matchesSearch = product.classTitle
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = selectedTrainer
      ? product.classTrainer === selectedTrainer.value
      : true;
    const matchesCentre = selectedCentre
      ? product.centreName === selectedCentre.value
      : true;
    const matchesListing = selectedListingStatus
      ? product.listingStatus === selectedListingStatus.value
      : true;
    return matchesSearch && matchesType && matchesCentre && matchesListing;
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleClassCreated = (classData) => {
    if (editingClasses) {
      setSubmittedClasses((prev) =>
        prev.map((p) => (p.id === classData.id ? { ...p, ...classData } : p))
      );
      toast.success("Product updated successfully!");
    } else {
      const newClass = { id: Date.now(), ...classData };
      setSubmittedClasses((prev) => [...prev, newClass]);
      toast.success("Product added successfully!");
    }
    setShowModal(false);
    setEditingClasses(null);
  };

  const handleStatusToggle = (productId) => {
    let newStatus = "";

    setSubmittedClasses((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          newStatus = item.listingStatus === "active" ? "inactive" : "active";
          return { ...item, listingStatus: newStatus };
        }
        return item;
      })
    );

    // Toast after state update logic
    toast.success(`Product marked as ${newStatus}`);
  };
  const handleViewClick = (row) => {
    setSelectedClass((prev) => (prev?.id === row.id ? null : row));
  };

  return (
    <div className="page--content">
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > All Group Classes`}</p>
          <h1 className="text-3xl font-semibold">All Group Classes</h1>
        </div>
        <button
          type="button"
          className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
          onClick={() => {
            setEditingClasses(null);
            setShowModal(true);
          }}
        >
          <FiPlus /> Create Group Class
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Product Name Search */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by class name"
          className="custom--input"
        />

        {/* Trainer */}
        <Select
          options={trainerList}
          value={selectedTrainer}
          onChange={setSelectedTrainer}
          isClearable
          placeholder="Trainer"
          styles={customStyles}
        />

        {/* Centre Name */}
        <Select
          options={centreList}
          value={selectedCentre}
          onChange={setSelectedCentre}
          isClearable
          placeholder="Centre Name"
          styles={customStyles}
        />

        {/* Listing Status */}
        <Select
          options={listingStatusOptions}
          value={selectedListingStatus}
          onChange={setSelectedListingStatus}
          isClearable
          placeholder="Class Status"
          styles={customStyles}
        />
      </div>

      {/* Table */}
      <div className="box--shadow bg-white rounded-[15px] p-4">
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-2 py-4">Class ID</th>
              <th className="px-2 py-4">Class Title</th>
              <th className="px-2 py-4">Trainer</th>
              <th className="px-2 py-4">Centre Name</th>
              <th className="px-2 py-4">Class Date</th>
              <th className="px-2 py-4">Start Time</th>
              <th className="px-2 py-4">End Time</th>
              <th className="px-2 py-4">Max Capacity</th>
              <th className="px-2 py-4">Listing Status</th>
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
                <td className="px-2 py-4">{row.classTitle}</td>
                <td className="px-2 py-4">{row.classTrainer}</td>
                <td className="px-2 py-4">{row.centreName}</td>
                <td className="px-2 py-4">{row.classDate}</td>
                <td className="px-2 py-4">{row.startTime}</td>
                <td className="px-2 py-4">{row.endTime}</td>
                <td className="px-2 py-4">{row.maxCapacity}</td>
                <td className="px-2 py-4">
                  <Switch
                    onChange={() => handleStatusToggle(row.id)}
                    checked={row.listingStatus === "active"}
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
                  <div className="flex gap-2 items-center">
                    <Tooltip
                      id={`edit-class-${row.id}`}
                      content="Edit Product"
                      place="left"
                    >
                      <div
                        onClick={() => {
                          console.log("Editing Row:", row);
                          setEditingClasses(row);
                          setShowModal(true);
                        }}
                        className="p-1 cursor-pointer"
                      >
                        <LiaEdit className="text-[25px] text-black" />
                      </div>
                    </Tooltip>
                    <Tooltip
                      id={`view-class-${row.id}`}
                      content="View Class"
                      place="left"
                    >
                      <div
                        onClick={() => handleViewClick(row)}
                        className="p-1 cursor-pointer"
                      >
                        <FaEye className="text-[25px] text-black" />
                      </div>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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

      {showModal && (
        <CreateGroupClass
          setShowModal={setShowModal}
          onClassCreated={handleClassCreated}
          initialData={editingClasses}
        />
      )}
     {selectedClass && (
  <BookingList
    bookings={bookings}
    classId={selectedClass.id}
    classTitle={selectedClass.classTitle}
    onClose={() => setSelectedClass(null)}
  />
)}
    </div>
  );
};

export default AllGroupClasses;
