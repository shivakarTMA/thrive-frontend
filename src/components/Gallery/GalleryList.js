// Import React and necessary hooks
import React, { useEffect, useRef, useState } from "react";
// Import icons and utilities
import { FiPlus } from "react-icons/fi";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Tooltip from "../common/Tooltip";
import { LiaEdit } from "react-icons/lia";
import { apiAxios } from "../../config/config";
import { IoSearchOutline } from "react-icons/io5";
import CreateGallery from "./CreateGallery";
import Select from "react-select";
import { customStyles } from "../../Helper/helper";
import Pagination from "../common/Pagination";

const displayPosition = [
  { label: "Top", value: "TOP" },
  { label: "Bottom", value: "BOTTOM" },
  { label: "Both", value: "BOTH" },
];

// Main Services component
const GalleryList = () => {
  const [showModal, setShowModal] = useState(false);
  const [galleryList, setGalleryList] = useState([]);
  const [club, setClub] = useState([]);
  const [editingOption, setEditingOption] = useState(null);
  const leadBoxRef = useRef(null);
  const [clubFilter, setClubFilter] = useState(null);
  const [positionFilter, setPositionFilter] = useState(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Function to fetch clubs
  const fetchClub = async (search = "") => {
    try {
      const res = await apiAxios().get("/club/list", {
        params: search ? { search } : {},
      });
      let data = res.data?.data || res.data || [];
      setClub(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch companies");
    }
  };

  // Function to fetch services
  const fetchGallery = async (pageNumber = 1) => {
    try {
      const params = {
        page: pageNumber,
        limit: rowsPerPage,
      };

      if (clubFilter?.value) params.club_id = clubFilter.value;
      if (positionFilter?.value) params.display_position = positionFilter.value;

      const res = await apiAxios().get("/club/gallery/list", { params });

      const data = res.data?.data || res.data || [];
      setGalleryList(data);
      setTotalCount(res.data?.totalCount || data.length);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch gallery");
    }
  };

  // Handle edit service action
  const handleEdit = (id) => {
    const data = galleryList.find((item) => item.id === id);

    if (data) {
      setEditingOption(data);

      formik.setValues({
        id: data.id || "",
        title: data.title || "",
        image: data.image || null,
        club_id: data.club_id || "",
        display_position: data.display_position || "",
        position: data.position || "",
      });

      setShowModal(true);
    } else {
      toast.error("Service not found in list");
    }
  };

  // Load initial data
  useEffect(() => {
    fetchGallery();
    fetchClub();
  }, []);

  // Prepare dropdown options for clubs
  const clubOptions =
    club?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];

  useEffect(() => {
    fetchGallery();
  }, [positionFilter, clubFilter]);

  // Handle overlay click to close modal
  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setShowModal(false);
    }
  };

  // Formik initialization
  const formik = useFormik({
    initialValues: {
      image: null,
      title: "",
      club_id: "",
      display_position: "",
      position: "",
    },
    validationSchema: Yup.object({
      image: Yup.mixed().test(
        "required-image",
        "Image is required",
        function (value) {
          if (!editingOption) {
            return value !== null;
          }
          return true;
        }
      ),
      title: Yup.string().required("Title is required"),
      club_id: Yup.string().required("Club is required"),
      position: Yup.string().required("Position is required"),
      display_position: Yup.string().required("Display Position is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        // Create form data for API request
        const formData = new FormData();

        Object.keys(values).forEach((key) => {
          // Only append image if it's a new file
          if (key === "image") {
            if (values.image && typeof values.image !== "string") {
              formData.append("image", values.image);
            }
          } else {
            formData.append(key, values[key]);
          }
        });
        if (editingOption && editingOption.id) {
          await apiAxios().put(
            `/club/gallery/create/${editingOption.id}`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );
          toast.success("Updated Successfully");
        } else {
          await apiAxios().post("/club/gallery/create", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Created Successfully");
        }

        fetchGallery();
      } catch (err) {
        console.error("API Error:", err.response?.data || err.message);
        toast.error("Failed to save onboarding");
      }

      resetForm();
      setEditingOption(null);
      setShowModal(false);
    },
  });

  return (
    <div className="page--content">
      {/* Header Section */}
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > Gallery`}</p>
          <h1 className="text-3xl font-semibold">Gallery</h1>
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

      {/* Search and Filter Section */}
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

      {/* Table Section */}
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
                    No Services added yet.
                  </td>
                </tr>
              ) : (
                galleryList.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className="group bg-white border-b hover:bg-gray-50 relative transition duration-700"
                  >
                    <td>
                      {item.image ? (
                        <img
                          src={item.image}
                          className="w-14 h-14 object-cover"
                        />
                      ) : (
                        "--"
                      )}
                    </td>
                    <td className="px-2 py-4">{item?.title}</td>
                    <td className="px-2 py-4">{item?.club_id}</td>
                    <td className="px-2 py-4">{item?.position}</td>
                    <td className="px-2 py-4">
                      <div className="w-fit">
                        <Tooltip
                          id={`tooltip-edit-${item.id}`}
                          content="Edit Club"
                          place="left"
                        >
                          <div
                            className="p-1 cursor-pointer"
                            onClick={() => handleEdit(item.id)}
                          >
                            <LiaEdit className="text-[25px] text-black" />
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

      {/* Modal for Create/Update Service */}
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
