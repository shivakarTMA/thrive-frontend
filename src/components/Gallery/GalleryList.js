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
import CreateGallery from "./CreateGallery";
import { authAxios } from "../../config/config";
import { customStyles, filterActiveItems } from "../../Helper/helper";
import { RiDeleteBin6Line } from "react-icons/ri";

// Define display position options
const displayPosition = [
  { label: "Top", value: "TOP" },
  { label: "Bottom", value: "BOTTOM" },
  { label: "Both", value: "BOTH" },
];

// Define the main GalleryList component
const GalleryList = () => {
  // Component state management
  const [showModal, setShowModal] = useState(false);
  const [galleryList, setGalleryList] = useState([]);
  const [club, setClub] = useState([]);
  const [editingOption, setEditingOption] = useState(null);
  const [clubFilter, setClubFilter] = useState(null);
  const [positionFilter, setPositionFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const leadBoxRef = useRef(null);

  // Function to fetch club list
  const fetchClub = async (search = "") => {
    try {
      const response = await authAxios().get("/club/list", {
        params: search ? { search } : {},
      });
      const data = response.data?.data || response.data || [];
      const activeOnly = filterActiveItems(data);
      setClub(activeOnly);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch clubs");
    }
  };

  // Function to fetch gallery list with filters applied
  const fetchGallery = async (currentPage = page) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };

      // Add filter parameters if they exist
      if (positionFilter?.value) {
        params.display_position = positionFilter.value;
      }
      if (clubFilter?.value) {
        params.club_id = clubFilter.value;
      }

      // API request to get filtered gallery data
      const response = await authAxios().get("/club/gallery/list", { params });

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
  useEffect(() => {
    fetchClub();
    fetchGallery();
  }, []);

  // Fetch gallery list when filters change
  useEffect(() => {
    fetchGallery();
  }, [positionFilter, clubFilter]);

  // Club dropdown options
  const clubOptions =
    club?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];

  // Overlay click handler to close modal
  const handleOverlayClick = (event) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(event.target)) {
      setShowModal(false);
    }
  };

  // Formik setup for form validation and submission
  const formik = useFormik({
    initialValues: {
      image: "",
      title: "",
      club_id: "",
      display_position: "",
      position: "",
    },
    validationSchema: Yup.object({
      image: Yup.string().required("Image is required"),
      title: Yup.string().required("Title is required"),
      club_id: Yup.string().required("Club is required"),
      position: Yup.string().required("Position is required"),
      display_position: Yup.string().required("Display Position is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const formData = new FormData();
        Object.keys(values).forEach((key) => {
          if (key === "imageFile") {
            if (values.imageFile && typeof values.imageFile !== "string") {
              formData.append("image", values.imageFile);
            }
          } else {
            formData.append(key, values[key]);
          }
        });

        if (editingOption && editingOption) {
          // Update
          await authAxios().put(`/club/gallery/${editingOption}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Updated Successfully");
        } else {
          // Create
          await authAxios().post("/club/gallery/create", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Created Successfully");
        }

        fetchGallery();
      } catch (error) {
        console.error("API Error:", error.response?.data || error.message);
        toast.error("Failed to save gallery item");
      }

      resetForm();
      setEditingOption(null);
      setShowModal(false);
    },
  });

  const handleDelete = async (id) => {
    try {
      await authAxios().delete(`/club/gallery/${id}`);
      toast.success("Gallery item deleted successfully");
      fetchGallery(); // refresh list
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete gallery item");
    }
  };

  // Component render
  return (
    <div className="page--content">
      {/* Header section */}
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > Club Gallery`}</p>
          <h1 className="text-3xl font-semibold">Club Gallery</h1>
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
            <FiPlus /> Create Gallery
          </button>
        </div>
      </div>

      {/* Filter section */}
      <div className="flex gap-3 mb-4">
        <div className="w-full max-w-[200px]">
          <Select
            placeholder="Filter by Club"
            value={clubFilter}
            options={clubOptions}
            onChange={(option) => setClubFilter(option)}
            isClearable
            styles={customStyles}
          />
        </div>
        <div className="w-full max-w-[200px]">
          <Select
            placeholder="Display Position"
            value={positionFilter}
            options={displayPosition}
            onChange={(option) => setPositionFilter(option)}
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
                <th className="px-2 py-4">Image</th>
                <th className="px-2 py-4">Title</th>
                <th className="px-2 py-4">Club Name</th>
                <th className="px-2 py-4">Position</th>
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
                    <td className="px-2 py-4">
                      <div className="bg-black rounded-lg w-14 h-14 overflow-hidden">
                        {item.image ? (
                          <img
                            src={item.image}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          "--"
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-4">{item?.title}</td>
                    <td className="px-2 py-4">{item?.club_name}</td>
                    <td className="px-2 py-4">{item?.position}</td>
                    <td className="px-2 py-4">
                      <div className="flex items-center">
                        <Tooltip
                          id={`tooltip-edit-${item.id}`}
                          content="Edit Gallery"
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
                          content="Delete Gallery"
                          place="left"
                        >
                          <div
                            className="p-1 cursor-pointer"
                            onClick={() => handleDelete(item.id)}
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
            fetchGallery(newPage);
          }}
        />
      </div>

      {/* Modal Component */}
      {showModal && (
        <CreateGallery
          setShowModal={setShowModal}
          editingOption={editingOption}
          formik={formik}
          handleOverlayClick={handleOverlayClick}
          leadBoxRef={leadBoxRef}
          clubOptions={clubOptions}
        />
      )}
    </div>
  );
};

export default GalleryList;
