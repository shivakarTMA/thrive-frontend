// Import React and hooks
import React, { useEffect, useRef, useState } from "react";
// Import icons and external libraries
import { FiPlus } from "react-icons/fi";
import { LiaEdit } from "react-icons/lia";
import { IoSearchOutline } from "react-icons/io5";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Select from "react-select";
// Import internal components and utilities
import Tooltip from "../common/Tooltip";
import Pagination from "../common/Pagination";
import CreateExerciesCategory from "./CreateExerciesCategory";
import { authAxios } from "../../config/config";
import {
  customStyles,
  filterActiveItems,
  formatAutoDate,
  formatText,
} from "../../Helper/helper";
import { RiDeleteBin6Line } from "react-icons/ri";
import ConfirmPopup from "../common/ConfirmPopup";
import { FaCircle } from "react-icons/fa";

// Define display position options
const displayPosition = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

// Define the main GalleryList component
const ExerciesCategoryList = () => {
  // Component state management
  const [showModal, setShowModal] = useState(false);
  const [galleryList, setGalleryList] = useState([]);
  const [editingOption, setEditingOption] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const leadBoxRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);

  // Function to fetch gallery list with filters applied
  const fetchExerciesCategory = async (search = "", currentPage = page) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
        ...(search ? { search } : {}),
      };

      // Add filter parameters if they exist
      if (statusFilter?.value) {
        params.status = statusFilter.value;
      }

      // API request to get filtered gallery data
      const response = await authAxios().get("/exercise/category/list", {
        params,
      });

      const data = response.data?.data || [];
      setGalleryList(data);
      setPage(response.data?.currentPage || 1);
      setTotalPages(response.data?.totalPage || 1);
      setTotalCount(response.data?.totalCount || data.length);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch gallery list");
    }
  };

  // Fetch clubs and gallery list on component mount
  // useEffect(() => {
  //   fetchExerciesCategory();
  // }, []);

  // Fetch gallery list when filters change
  // useEffect(() => {
  //   setPage(1);
  //   fetchExerciesCategory(1);
  // }, [statusFilter]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setPage(1);
      fetchExerciesCategory(searchTerm, 1);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, statusFilter]);

  // Overlay click handler to close modal
  const handleOverlayClick = (event) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(event.target)) {
      setShowModal(false);
    }
  };

  // Formik setup for form validation and submission
  const formik = useFormik({
    initialValues: {
      // club_id: "",
      title: "",
      position: "",
      status: "ACTIVE",
    },
    validationSchema: Yup.object({
      // club_id: Yup.string().required("Club is required"),
      title: Yup.string().required("Title is required"),
      position: Yup.string().required("Position is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        if (editingOption) {
          // Update
          await authAxios().put(`/exercise/category/${editingOption}`, values);
          toast.success("Updated Successfully");
        } else {
          // Create
          await authAxios().post("/exercise/category/create", values);
          toast.success("Created Successfully");
        }

        fetchExerciesCategory();
      } catch (error) {
        console.error("API Error:", error.response?.data || error.message);
        toast.error("Failed to save exercise category");
      }

      resetForm();
      setEditingOption(null);
      setShowModal(false);
    },
  });

  const handleConfirmDelete = async () => {
    const exerciesID = selectedDeleteId?.id;
    if (!exerciesID) return;

    try {
      await authAxios().delete(`/exercise/category/${exerciesID}`);
      toast.success("Category item deleted successfully");
      fetchExerciesCategory();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete category item");
    } finally {
      setShowDeleteModal(false);
      setSelectedDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setSelectedDeleteId(null);
    setShowDeleteModal(false);
  };

  // Component render
  return (
    <div className="page--content">
      {/* Header section */}
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > Exercises Categories`}</p>
          <h1 className="text-3xl font-semibold">Exercises Categories</h1>
        </div>
        <div className="flex items-end gap-2">
          <button
            type="button"
            className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
            onClick={() => {
              setEditingOption(null);
              formik.resetForm();
              setShowModal(true);
            }}
          >
            <FiPlus /> Create Category
          </button>
        </div>
      </div>

      {/* Filter section */}
      <div className="flex items-center gap-2 mb-4">
        {/* Search Input */}
        <div className="max-w-[200px] w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title"
            className="custom--input w-full"
          />
        </div>
        <div className="w-full max-w-[200px]">
          <Select
            placeholder="Filter by Status"
            value={statusFilter}
            options={displayPosition}
            onChange={(option) => setStatusFilter(option)}
            isClearable
            styles={customStyles}
          />
        </div>
      </div>

      {/* Table section */}
      <div className="box--shadow bg-white rounded-[15px] p-4">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                {/* <th className="px-2 py-4">Club Name</th> */}
                <th className="px-2 py-4">Title</th>
                <th className="px-2 py-4">Position</th>
                <th className="px-2 py-4">Status</th>
                <th className="px-2 py-4">Created At</th>
                <th className="px-2 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {galleryList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    No Gallery items found.
                  </td>
                </tr>
              ) : (
                galleryList.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className="group bg-white border-b hover:bg-gray-50 transition duration-700"
                  >
                    {/* <td className="px-2 py-4">{item?.club_name}</td> */}
                    <td className="px-2 py-4">{item?.title}</td>
                    <td className="px-2 py-4">{item?.position}</td>
                    <td className="px-2 py-4">
                      <div
                        className={`flex gap-1 items-center ${
                          item?.status === "ACTIVE"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        <FaCircle />
                        {item?.status ? formatText(item?.status) : "--"}
                      </div>
                    </td>
                    <td className="px-2 py-4">
                      {formatAutoDate(item?.createdAt)}
                    </td>
                    <td className="px-2 py-4">
                      <div className="flex items-center">
                        <Tooltip
                          id={`tooltip-edit-${item.id}`}
                          content="Edit Category"
                          place="left"
                        >
                          <div
                            className="p-1 cursor-pointer"
                            onClick={() => {
                              setEditingOption(item?.id);
                              setShowModal(true);
                            }}
                          >
                            <LiaEdit className="text-[25px] text-black" />
                          </div>
                        </Tooltip>

                        {/* Delete Button */}
                        <Tooltip
                          id={`tooltip-delete-${item.id}`}
                          content="Delete Category"
                          place="left"
                        >
                          <div
                            className="p-1 cursor-pointer"
                            onClick={() => {
                              setSelectedDeleteId(item);
                              setShowDeleteModal(true);
                            }}
                          >
                            <RiDeleteBin6Line className="text-[22px] text-black" />
                          </div>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Component */}
        <Pagination
          page={page}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          currentDataLength={galleryList.length}
          onPageChange={(newPage) => {
            setPage(newPage);
            fetchExerciesCategory(newPage);
          }}
        />
      </div>

      {/* Modal Component */}
      {showModal && (
        <CreateExerciesCategory
          setShowModal={setShowModal}
          editingOption={editingOption}
          formik={formik}
          handleOverlayClick={handleOverlayClick}
          leadBoxRef={leadBoxRef}
        />
      )}
      {showDeleteModal && selectedDeleteId && (
        <ConfirmPopup
          message={`Confirm deletion of the "${selectedDeleteId?.title}" category?`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
};

export default ExerciesCategoryList;
