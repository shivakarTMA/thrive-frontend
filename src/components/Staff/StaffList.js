import React, { useState, useEffect } from "react";
import { FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import { LiaEdit } from "react-icons/lia";
import Tooltip from "../common/Tooltip";
import Select from "react-select";
import {
  customStyles,
  filterActiveItems,
  formatText,
} from "../../Helper/helper";
import CreateStaff from "./CreateStaff";
import { authAxios } from "../../config/config";
import Pagination from "../common/Pagination";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  parsePhoneNumberFromString,
  isPossiblePhoneNumber,
} from "libphonenumber-js";
import { FaCircle } from "react-icons/fa6";
import { useSelector } from "react-redux";
import ConfirmPopup from "../common/ConfirmPopup";
import { RiDeleteBin6Fill } from "react-icons/ri";

// Roles for ADMIN
export const roleOptionsByUser = {
  ADMIN: [
    { value: "ADMIN", label: "Admin" },
    { value: "FOH", label: "FOH (Front of House)" },
    { value: "TRAINER", label: "Trainer" },
    { value: "CLUB_MANAGER", label: "Club Manager" },
    { value: "FITNESS_MANAGER", label: "Fitness Manager" },
    { value: "FINANCE_MANAGER", label: "Finance Manager" },
    { value: "MARKETING_MANAGER", label: "Marketing Manager" },
    { value: "GENERAL_MANAGER", label: "General Manager" },
  ],
  CLUB_MANAGER: [
    { value: "FOH", label: "FOH (Front of House)" },
    { value: "TRAINER", label: "Trainer" },
    { value: "FITNESS_MANAGER", label: "Fitness Manager" },
  ],
  GENERAL_MANAGER: [
    { value: "FOH", label: "FOH (Front of House)" },
    { value: "TRAINER", label: "Trainer" },
    { value: "CLUB_MANAGER", label: "Club Manager" },
    { value: "FITNESS_MANAGER", label: "Fitness Manager" },
    { value: "FINANCE_MANAGER", label: "Finance Manager" },
    { value: "MARKETING_MANAGER", label: "Marketing Manager" },
    { value: "GENERAL_MANAGER", label: "General Manager" },
  ],
};

const StaffList = () => {
  const [showModal, setShowModal] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);
  const [roleFilter, setRoleFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [editingOption, setEditingOption] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const currentUserRole = user?.role; // Example, dynamically from user info
  const roleOptions = roleOptionsByUser[currentUserRole] || [];

  const [staffToDelete, setStaffToDelete] = useState(null);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // 🚀 Fetch staff list from API
  const fetchStaff = async (search = "", currentPage = page) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
        ...(search ? { search } : {}),
      };

      if (clubFilter) {
        params.club_id = clubFilter.value;
      }
      if (roleFilter) {
        params.role = roleFilter.value;
      }
      if (statusFilter) {
        params.status = statusFilter.value;
      }

      const res = await authAxios().get("/staff/list", { params });

      let data = res.data?.data || [];

      setStaffList(data);
      setPage(res.data?.currentPage || 1);
      setTotalPages(res.data?.totalPage || 1);
      setTotalCount(res.data?.totalCount || data.length);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch staff");
    }
  };

  // Function to fetch club list
  const fetchClub = async (search = "") => {
    try {
      const response = await authAxios().get("/club/list", {
        params: search ? { search } : {},
      });
      const data = response.data?.data || [];
      const activeOnly = filterActiveItems(data);
      setClubList(activeOnly);
    } catch (error) {
      toast.error("Failed to fetch clubs");
    }
  };
  // Function to fetch role list

  useEffect(() => {
    fetchStaff();
    fetchClub();
  }, []);

  const clubOptions = clubList.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setPage(1);
      fetchStaff(searchTerm, 1);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, statusFilter, clubFilter, roleFilter]);

  const validationSchema = Yup.object({
    name: Yup.string().required("Full Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    mobile: Yup.string()
      .required("Contact number is required")
      .test("is-valid-phone", "Invalid phone number", function (value) {
        const { country_code } = this.parent;
        if (!value || !country_code) return false;

        // Combine country code and number to full international format
        const phoneNumberString = `+${country_code}${value}`;

        // First check if the number is even possible (not just valid)
        if (!isPossiblePhoneNumber(phoneNumberString)) return false;

        // Parse and check validity strictly according to country
        const phoneNumber = parsePhoneNumberFromString(phoneNumberString);
        return phoneNumber?.isValid() || false;
      }),
    gender: Yup.string().required("Gender is required"),
    experience: Yup.string().required("Experience is required"),
    role: Yup.string().required("Role is required"),
    club_id: Yup.array()
      .min(1, "Please select at least one club")
      .required("Club selection is required"),

    profile_image: Yup.string().when("show_on_app", {
      is: true,
      then: () => Yup.string().required("Image is required"),
    }),

    description: Yup.string().when("show_on_app", {
      is: true,
      then: () => Yup.string().required("Long Description is required"),
    }),
    tags: Yup.string().when("show_on_app", {
      is: true,
      then: () => Yup.string().required("Tags are required"),
    }),
    content: Yup.array()
      .of(
        Yup.object({
          title: Yup.string().required("Title is required"),
          description: Yup.string().required("Description is required"),
        }),
      )
      .min(1, "At least one content item is required"),
  });

  const initialValues = {
    name: "",
    phoneFull: "",
    mobile: "",
    experience: "",
    country_code: "",
    email: "",
    gender: "",
    date_of_birth: null,
    role: "",
    bio_pic: "",
    description: "",
    club_id: [],
    status: "ACTIVE",
    show_on_app: false,
    tags: "",
    profile_image: "",
    content: [
      {
        title: "",
        description: "",
      },
    ],
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const formData = new FormData();

        // --- Basic fields ---
        formData.append("name", values.name);
        formData.append("email", values.email);
        formData.append("gender", values.gender);
        formData.append("date_of_birth", values.date_of_birth);
        formData.append("role", values.role);
        formData.append("description", values.description);
        // formData.append("club_id", values.club_id);
        formData.append("status", values.status);
        formData.append("show_on_app", values.show_on_app);
        formData.append("experience", values.experience);
        formData.append("tags", values.tags);
        //   // --- Club IDs ---
        if (values.club_id?.length > 0) {
          formData.append("club_id", JSON.stringify(values.club_id));
        }

        // --- Content ---
        if (values.content?.length > 0) {
          formData.append("content", JSON.stringify(values.content));
        }

        // --- International phone parsing ---
        if (values.phoneFull) {
          const phoneNumber = parsePhoneNumberFromString(values.phoneFull);
          if (phoneNumber) {
            formData.append("country_code", phoneNumber.countryCallingCode);
            formData.append("mobile", phoneNumber.nationalNumber);
          }
        }

        // --- Image file ---
        if (values.profile_imageFile instanceof File) {
          formData.append("profile_image", values.profile_imageFile);
        }

        // --- API call ---
        if (editingOption) {
          await authAxios().put(`/staff/${editingOption}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Updated Successfully");
        } else {
          await authAxios().post(`/staff/create`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Created Successfully");
        }

        setShowModal(false);
        fetchStaff();
        resetForm();
        setEditingOption(null);
      } catch (err) {
        console.error("API Error:", err.response?.data || err.message);
        toast.error(err.response?.data?.message);
      }
    },
  });

  const handleDeleteClick = (exercise) => {
    setStaffToDelete(exercise);
    setShowConfirmPopup(true);
  };

  // Confirm deletion
  const handleConfirmDelete = async () => {
    if (staffToDelete) {
      try {
        await authAxios().delete(`/staff/${staffToDelete.id}`);
        // const updatedExercises = exerciseList.filter(
        //   (ex) => ex.id !== staffToDelete.id
        // );
        // setExercisesList(updatedExercises);
        toast.success("Staff deleted successfully");
        fetchStaff();
      } catch (error) {
        toast.error("Failed to delete Staff.");
        console.error("Error deleting Staff:", error);
      }
    }
    setStaffToDelete(null);
    setShowConfirmPopup(false);
  };

  // Cancel deletion
  const handleCancelDelete = () => {
    setStaffToDelete(null);
    setShowConfirmPopup(false);
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
            setEditingOption(null);
            formik.resetForm();
            setShowModal(true);
          }}
        >
          <FiPlus /> Add Staff
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 items-center justify-between">
        <div className="flex gap-2 w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or mobile"
            className="custom--input w-full max-w-[210px]"
          />
          <div className="w-full max-w-[200px]">
            <Select
              placeholder="Filter by status"
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
          <div className="w-fit min-w-[200px]">
            <Select
              placeholder="Filter by role"
              value={roleFilter}
              options={roleOptions}
              onChange={(option) => setRoleFilter(option)}
              isClearable={currentUserRole === "ADMIN" ? true : false}
              styles={customStyles}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="box--shadow bg-white rounded-[15px] p-4">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-2 py-4">Staff Name</th>
                {currentUserRole === "ADMIN" && (
                  <th className="px-2 py-4">Mobile</th>
                )}
                <th className="px-2 py-4">Role</th>
                <th className="px-2 py-4">Assigned Club</th>
                <th className="px-2 py-4">Status</th>
                <th className="px-2 py-4">Show on App</th>
                <th className="px-2 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {staffList.length === 0 ? (
                <tr>
                  <td
                    colSpan={`${currentUserRole === "ADMIN" ? "7" : "6"}`}
                    className="text-center py-4"
                  >
                    No staff found.
                  </td>
                </tr>
              ) : (
                staffList.map((row, idx) => (
                  <tr
                    key={row?.id}
                    className="group bg-white border-b hover:bg-gray-50 transition duration-700"
                  >
                    <td className="px-2 py-4">{row?.name}</td>
                    {currentUserRole === "ADMIN" && (
                      <td className="px-2 py-4">{row?.mobile}</td>
                    )}
                    <td className="px-2 py-4">{formatText(row?.role)}</td>
                    <td className="px-2 py-4">
                      <div className="max-w-[200px]">
                        {row?.staff_clubs?.length > 0 ? (
                          <p>
                            {row.staff_clubs
                              .map((club) => club.club_name)
                              .join(", ")}
                          </p>
                        ) : (
                          <p>No clubs found</p>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-4">
                      <div
                        className={`flex gap-1 items-center ${
                          row?.status === "ACTIVE"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        <FaCircle />
                        {row?.status
                          ? row.status.charAt(0) +
                            row.status.slice(1).toLowerCase()
                          : ""}
                      </div>
                    </td>
                    <td className="px-2 py-4">
                      {row?.role === "TRAINER" ? (
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            row?.show_on_app === true
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {row?.show_on_app === true ? "Active" : "Inactive"}
                        </span>
                      ) : (
                        "--"
                      )}
                    </td>

                    <td className="px-2 py-4">
                      <div className="flex">
                        <Tooltip
                          id={`edit-product-${row?.id}`}
                          content="Edit User"
                          place="left"
                        >
                          <div
                            onClick={() => {
                              setEditingOption(row?.id);
                              setShowModal(true);
                            }}
                            className="p-1 cursor-pointer"
                          >
                            <LiaEdit className="text-[25px] text-black" />
                          </div>
                        </Tooltip>
                        {row?.role !== "ADMIN" && (
                          <Tooltip
                            id={`delete-staff-${row.id}`}
                            content="Delete Staff"
                            place="top"
                          >
                            <div
                              onClick={() => handleDeleteClick(row)}
                              className="p-1 cursor-pointer"
                            >
                              <RiDeleteBin6Fill className="text-[25px] text-black" />
                            </div>
                          </Tooltip>
                        )}
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
          currentDataLength={staffList.length}
          onPageChange={(newPage) => {
            setPage(newPage);
            fetchStaff(searchTerm, newPage);
          }}
        />
      </div>

      {/* Modal */}
      {showModal && (
        <CreateStaff
          setShowModal={setShowModal}
          formik={formik}
          editingOption={editingOption}
          roleOptionsByUser={roleOptionsByUser}
        />
      )}

      {/* Confirm Delete */}
      {showConfirmPopup && staffToDelete && (
        <ConfirmPopup
          message={`Are you sure you want to delete <br /> "${staffToDelete?.name}"?`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
};

export default StaffList;
