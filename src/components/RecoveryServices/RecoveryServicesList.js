// Import React and necessary hooks
import React, { useEffect, useRef, useState } from "react";
// Import icons and utilities
import { FiPlus } from "react-icons/fi";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Tooltip from "../common/Tooltip";
import { LiaEdit } from "react-icons/lia";
import CreateRecoveryServices from "./CreateRecoveryServices";
import { authAxios } from "../../config/config";
import { IoSearchOutline } from "react-icons/io5";
import Select from "react-select";
import {
  customStyles,
  filterActiveItems,
  formatText,
} from "../../Helper/helper";
import { FaCircle } from "react-icons/fa6";
import Pagination from "../common/Pagination";
import { useSelector } from "react-redux";

// Main Services component
const RecoveryServicesList = () => {
  const [showModal, setShowModal] = useState(false);
  const [recoveryServiceList, setRecoveryServiceList] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [club, setClub] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);
  const [packageList, setPackageList] = useState([]);
  const [editingOption, setEditingOption] = useState(null);
  const leadBoxRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);

  const { user } = useSelector((state) => state.auth);
  const currentUserRole = user?.role; // Example, dynamically from user info

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Function to fetch clubs
  const fetchServices = async () => {
    try {
      const res = await authAxios().get("/service/list");
      let data = res.data?.data || res.data || [];
      if (statusFilter?.value) {
        data = data.filter((item) => item.status === statusFilter.value);
      }
      const activeOnly = filterActiveItems(data);
      setServicesList(activeOnly);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch companies");
    }
  };
  // club list
  const fetchClub = async () => {
    try {
      const response = await authAxios().get("/club/list");
      const data = response.data?.data || response.data || [];
      const activeOnly = filterActiveItems(data);
      setClub(activeOnly);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch clubs");
    }
  };

  // Function to fetch services
  const fetchRecoveryServices = async (search = "", currentPage = page) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
        ...(search ? { search } : {}),
      };

      if (clubFilter) {
        params.club_id = clubFilter.value;
      }
      if (statusFilter) {
        params.status = statusFilter.value;
      }

      const res = await authAxios().get("/ourservices/list", {params});

      let data = res.data?.data || res.data || [];

      setRecoveryServiceList(data);
      setPage(res.data?.currentPage || 1);
      setTotalPages(res.data?.totalPage || 1);
      setTotalCount(res.data?.totalCount || data.length);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch recovery services");
    }
  };

  // Load initial data
  useEffect(() => {
    fetchServices();
    fetchClub();
    fetchRecoveryServices();
  }, []);

  const servicesOptions =
    servicesList?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];

  // Club dropdown options
  const clubOptions =
    club?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];

  // Debounced search for services

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setPage(1);
      fetchRecoveryServices(searchTerm, 1);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, statusFilter, clubFilter]);

  // Handle overlay click to close modal
  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setShowModal(false);
    }
  };

  // Formik initialization
  const formik = useFormik({
    initialValues: {
      club_id: "",
      name: "",
      service_id: "3",
      // package_id: "",
      image: null,
      tags: "",
      // caption: "",
      description: "",
      position: "",
      status: "ACTIVE",
    },
    validationSchema: Yup.object({
      club_id: Yup.string().required("Club is required"),
      image: Yup.mixed().test(
        "required-image",
        "Image is required",
        function (value) {
          if (!editingOption) {
            return value !== null;
          }
          return true;
        },
      ),
      name: Yup.string().required("Title is required"),
      service_id: Yup.string().required("Service is required"),
      // package_id: Yup.string().required("Package is required"),
      tags: Yup.string().required("Type is required"),
      // caption: Yup.string().required("Caption is required"),
      description: Yup.string().required("Description is required"),
      position: Yup.string().required("Position is required"),
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
        if (editingOption && editingOption) {
          await authAxios().put(`/ourservices/${editingOption}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Updated Successfully");
        } else {
          await authAxios().post("/ourservices/create", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Created Successfully");
        }

        fetchRecoveryServices();
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
          <p className="text-sm">{`Home > Recovery Services`}</p>
          <h1 className="text-3xl font-semibold">Recovery Services</h1>
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
            <FiPlus /> Create Service
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

        <div className="w-fit min-w-[200px]">
                    <Select
                      placeholder="Filter by club"
                      value={clubFilter}
                      options={clubOptions}
                      onChange={(option) => setClubFilter(option)}
                      isClearable={currentUserRole === "ADMIN" ? true : false}
                      styles={customStyles}
                      className="w-full"
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
                <th className="px-2 py-4">Tags</th>
                <th className="px-2 py-4">Club</th>
                <th className="px-2 py-4">Service</th>
                {/* <th className="px-2 py-4">Package</th> */}
                <th className="px-2 py-4">Position</th>
                <th className="px-2 py-4">Status</th>
                <th className="px-2 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {recoveryServiceList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    No recovery services found.
                  </td>
                </tr>
              ) : (
                recoveryServiceList.map((item, index) => (
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
                    <td className="px-2 py-4">
                      <div className="max-w-[200px]">{item?.name}</div>
                    </td>

                    <td className="px-2 py-4">
                      {item?.tags ? item?.tags : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {item?.club_name ? item?.club_name : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {item?.service_name ? item?.service_name : "--"}
                    </td>
                    {/* <td className="px-2 py-4">
                      {item?.package_name ? item?.package_name : "--"}
                    </td> */}
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
                            onClick={() => {
                              setEditingOption(item?.id);
                              setShowModal(true);
                            }}
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
        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          currentDataLength={recoveryServiceList.length}
          onPageChange={(newPage) => {
            setPage(newPage);
            fetchRecoveryServices(searchTerm, newPage);
          }}
        />
      </div>

      {/* Modal for Create/Update Service */}
      {showModal && (
        <CreateRecoveryServices
          setShowModal={setShowModal}
          editingOption={editingOption}
          formik={formik}
          handleOverlayClick={handleOverlayClick}
          leadBoxRef={leadBoxRef}
          servicesOptions={servicesOptions}
          clubOptions={clubOptions}
        />
      )}
    </div>
  );
};

export default RecoveryServicesList;
