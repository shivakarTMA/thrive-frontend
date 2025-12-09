// Import React and necessary hooks
import React, { useEffect, useRef, useState } from "react";
// Import icons and utilities
import { FiPlus } from "react-icons/fi";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Tooltip from "../common/Tooltip";
import { LiaEdit } from "react-icons/lia";
import CreateService from "./CreateService";
import { authAxios } from "../../config/config";
import { IoSearchOutline } from "react-icons/io5";
import Select from "react-select";
import { customStyles, formatText } from "../../Helper/helper";
import { FaCircle } from "react-icons/fa6";

// Main Services component
const Services = () => {
  // State to control modal visibility
  const [showModal, setShowModal] = useState(false);
  // State to hold list of services
  const [module, setModule] = useState([]);
  // State to hold list of clubs
  const [club, setClub] = useState([]);
  // State to hold list of studios
  const [studio, setStudio] = useState([]);
  // State to hold editing option data
  const [editingOption, setEditingOption] = useState(null);
  // Ref to handle modal close on outside click
  const leadBoxRef = useRef(null);
  // State for search input
  const [searchTerm, setSearchTerm] = useState("");
  // State for status filter
  const [statusFilter, setStatusFilter] = useState(null);

  // Function to fetch clubs
  const fetchClub = async (search = "") => {
    try {
      const res = await authAxios().get("/club/list", {
        params: search ? { search } : {},
      });
      let data = res.data?.data || res.data || [];
      if (statusFilter?.value) {
        data = data.filter((item) => item.status === statusFilter.value);
      }
      setClub(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch companies");
    }
  };

  // Function to fetch studios
  const fetchStudio = async (search = "") => {
    try {
      const res = await authAxios().get("/studio/list", {
        params: search ? { search } : {},
      });
      let data = res.data?.data || res.data || [];
      if (statusFilter?.value) {
        data = data.filter((item) => item.status === statusFilter.value);
      }
      setStudio(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch companies");
    }
  };

  // Function to fetch services
  const fetchServices = async (search = "") => {
    try {
      const res = await authAxios().get("/service/list", {
        params: search ? { search } : {},
      });
      let data = res.data?.data || res.data || [];
      if (statusFilter?.value) {
        data = data.filter((item) => item.status === statusFilter.value);
      }
      setModule(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch companies");
    }
  };

  // Handle edit service action
  const handleEdit = (id) => {
    const data = module.find((item) => item.id === id);

    if (data) {
      setEditingOption(data);

      formik.setValues({
        id: data.id || "",
        name: data.name || "",
        // Keep existing image if already present
        image: data.image || null,
        club_id: data.club_id || "",
        // studio_id: data.studio_id || "",
        type: data.type || "",
        position: data.position || "",
        status: data.status || "ACTIVE",
      });

      setShowModal(true);
    } else {
      toast.error("Service not found in list");
    }
  };

  // Load initial data
  useEffect(() => {
    fetchServices();
    fetchClub();
    fetchStudio();
  }, []);

  // Prepare dropdown options for clubs
  const clubOptions =
    club?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];

  // Prepare dropdown options for studios
  const studioOptions =
    studio?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];

  // Debounced search for services
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchServices(searchTerm);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, statusFilter]);

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
      name: "",
      club_id: "",
      // studio_id: "",
      type: "",
      position: "",
      status: "ACTIVE",
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
      name: Yup.string().required("Title is required"),
      club_id: Yup.string().required("Club is required"),
      // studio_id: Yup.string().required("Studio is required"),
      type: Yup.string().required("Type is required"),
      position: Yup.string().required("Position is required"),
      status: Yup.string().required("Status is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        // Create form data for API request
        const formData = new FormData();

        Object.keys(values).forEach((key) => {
          // Only append image if it's a new file
          if (key === "imageFile") {
            if (values.imageFile && typeof values.imageFile !== "string") {
              formData.append("image", values.imageFile);
            }
          } else {
            formData.append(key, values[key]);
          }
        });
        if (editingOption && editingOption.id) {
          await authAxios().put(`/service/${editingOption.id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Updated Successfully");
        } else {
          await authAxios().post("/service/create", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Created Successfully");
        }

        fetchServices();
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
          <p className="text-sm">{`Home > All Services`}</p>
          <h1 className="text-3xl font-semibold">All Services</h1>
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
            <FiPlus /> Create Services
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="flex gap-3 mb-4">
        <div className="mb-4 w-full max-w-[250px]">
          <div className="relative">
            <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
              <IoSearchOutline />
            </span>
            <input
              type="text"
              placeholder="Search Services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="custom--input w-full input--icon"
            />
          </div>
        </div>
        <div className="w-full max-w-[200px]">
          <Select
            placeholder="Filter by Status"
            options={[
              { label: "Active", value: "ACTIVE" },
              { label: "Inactive", value: "INACTIVE" },
            ]}
            value={statusFilter}
            onChange={(option) => setStatusFilter(option)}
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
                <th className="px-2 py-4">Name</th>
                <th className="px-2 py-4">Club Name</th>
                <th className="px-2 py-4">Type</th>
                <th className="px-2 py-4">Position</th>
                <th className="px-2 py-4">Status</th>
                <th className="px-2 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {module.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    No Services added yet.
                  </td>
                </tr>
              ) : (
                module.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className="group bg-white border-b hover:bg-gray-50 relative transition duration-700"
                  >
                    <td className="px-2 py-4">
                      <div className="bg-black rounded-lg w-14 h-14 overflow-hidden">
                        {item.image ? (
                          <img
                            src={item.image}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          "--"
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-4">{item?.name}</td>
                    <td className="px-2 py-4">{item?.club_name}</td>
                    <td className="px-2 py-4">{formatText(item?.type)}</td>
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
                        {item?.status
                          ? item.status.charAt(0) +
                            item.status.slice(1).toLowerCase()
                          : ""}
                      </div>
                    </td>
                    <td className="px-2 py-4">
                      <div className="w-fit">
                        <Tooltip
                          id={`tooltip-edit-${item.id || index}`}
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
      </div>

      {/* Modal for Create/Update Service */}
      {showModal && (
        <CreateService
          setShowModal={setShowModal}
          editingOption={editingOption}
          formik={formik}
          handleOverlayClick={handleOverlayClick}
          leadBoxRef={leadBoxRef}
          clubOptions={clubOptions}
          studioOptions={studioOptions}
        />
      )}
    </div>
  );
};

export default Services;
