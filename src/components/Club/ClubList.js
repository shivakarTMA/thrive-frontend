import React, { useEffect, useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import Tooltip from "../common/Tooltip";
import { LiaEdit } from "react-icons/lia";
import { FaCircle } from "react-icons/fa6";
import CreateClub from "./CreateClub";
import axios from "axios";
import { apiAxios } from "../../config/config";
import { IoSearchOutline } from "react-icons/io5";
import Select from "react-select";
import { customStyles } from "../../Helper/helper";
import Pagination from "../common/Pagination";

const indianStates = [
  { label: "Haryana", value: "Haryana" },
  { label: "Andhra Pradesh", value: "Andhra Pradesh" },
  { label: "Arunachal Pradesh", value: "Arunachal Pradesh" },
  { label: "Assam", value: "Assam" },
  { label: "Bihar", value: "Bihar" },
  { label: "Chhattisgarh", value: "Chhattisgarh" },
  { label: "Goa", value: "Goa" },
  { label: "Gujarat", value: "Gujarat" },
  { label: "Himachal Pradesh", value: "Himachal Pradesh" },
  { label: "Jammu and Kashmir", value: "Jammu and Kashmir" },
  { label: "Jharkhand", value: "Jharkhand" },
  { label: "Karnataka", value: "Karnataka" },
  { label: "Kerala", value: "Kerala" },
  { label: "Madhya Pradesh", value: "Madhya Pradesh" },
  { label: "Maharashtra", value: "Maharashtra" },
  { label: "Manipur", value: "Manipur" },
  { label: "Meghalaya", value: "Meghalaya" },
  { label: "Mizoram", value: "Mizoram" },
  { label: "Nagaland", value: "Nagaland" },
  { label: "Odisha", value: "Odisha" },
  { label: "Punjab", value: "Punjab" },
  { label: "Rajasthan", value: "Rajasthan" },
  { label: "Sikkim", value: "Sikkim" },
  { label: "Tamil Nadu", value: "Tamil Nadu" },
  { label: "Telangana", value: "Telangana" },
  { label: "Tripura", value: "Tripura" },
  { label: "Uttar Pradesh", value: "Uttar Pradesh" },
  { label: "Uttarakhand", value: "Uttarakhand" },
  { label: "West Bengal", value: "West Bengal" },
  {
    label: "Andaman and Nicobar Islands",
    value: "Andaman and Nicobar Islands",
  },
  { label: "Chandigarh", value: "Chandigarh" },
  {
    label: "Dadra and Nagar Haveli and Daman and Diu",
    value: "Dadra and Nagar Haveli and Daman and Diu",
  },
  { label: "Delhi", value: "Delhi" },
  { label: "Lakshadweep", value: "Lakshadweep" },
  { label: "Puducherry", value: "Puducherry" },
];

const ClubList = () => {
  const [showModal, setShowModal] = useState(false);
  const [club, setClub] = useState([]);
  const [editingClub, setEditingClub] = useState(null);
  const leadBoxRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

    const fetchClubs = async (search = "", currentPage = page) => {
    try {
      const res = await apiAxios().get("/club/list", {
        params: {
          page: currentPage,
          limit: rowsPerPage,
          ...(search ? { search } : {}),
        },
      });

      let data = res.data?.data || [];
      if (statusFilter?.value) {
        data = data.filter((item) => item.status === statusFilter.value);
      }

      setClub(data);
      setPage(res.data?.currentPage || 1);
      setTotalPages(res.data?.totalPage || 1);
      setTotalCount(res.data?.totalCount || data.length);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch club");
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchClubs(searchTerm);
      setPage(1);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, statusFilter]);

  console.log(club, "club");

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setShowModal(false);
    }
  };

  const formik = useFormik({
  initialValues: {
    logo: null,
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: indianStates[0],
    country: "India",
    zipcode: "",
    status: "",
  },
  validationSchema: Yup.object({
    name: Yup.string().required("Club name is required"),
    email: Yup.string().required("Club email is required"),
    phone: Yup.string()
      .required("Contact number is required")
      .test("is-valid-phone", "Invalid contact number", (value) => {
        if (!value) return false;
        return isValidPhoneNumber(value);
      }),
    city: Yup.string().required("City is required"),
    state: Yup.mixed()
      .test(
        "is-valid-state",
        "State/Province is required",
        (value) =>
          value && (typeof value === "object" || typeof value === "string")
      )
      .required("State/Province is required"),
    country: Yup.string().required("Country is required"),
    zipcode: Yup.string().required("ZIP or Postal is required"),
    status: Yup.string().required("Status is required"),
  }),
  onSubmit: async (values, { resetForm }) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("phone", values.phone?.startsWith("+") ? values.phone.slice(1) : values.phone);
      formData.append("address", values.address);
      formData.append("city", values.city);
      formData.append("state", values.state?.value || values.state);
      formData.append("country", values.country);
      formData.append("zipcode", values.zipcode);
      formData.append("status", values.status);

      // ✅ Append logo only if it's a file
      if (values.logo instanceof File) {
        formData.append("logo", values.logo);
      }

      if (editingClub && editingClub.id) {
        // Update
        await apiAxios().put(`/club/${editingClub.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Updated Successfully");
      } else {
        // Create
        await apiAxios().post("/club/create", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Created Successfully");
      }

      // 🔄 Re-fetch after save
      fetchClubs();
    } catch (err) {
      console.error("API Error:", err.response?.data || err.message);
      toast.error("Failed to save club");
    }

    resetForm();
    setEditingClub(null);
    // setShowModal(false);
  },
});


  const handlePhoneChange = (value) => {
    formik.setFieldValue("phone", value);
  };

  console.log(club, "club");

  return (
    <div className="page--content">
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > All Club`}</p>
          <h1 className="text-3xl font-semibold">All Club</h1>
        </div>
        <div className="flex items-end gap-2">
          <button
            type="button"
            className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
            onClick={() => {
              setEditingClub(null);
              formik.resetForm();
              setShowModal(true);
            }}
          >
            <FiPlus /> Create Club
          </button>
        </div>
      </div>

            {/* Filters */}
      <div className="flex gap-3 mb-4">
        {/* Search */}
        <div className="w-full max-w-[200px] relative">
          <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
            <IoSearchOutline />
          </span>
          <input
            type="text"
            placeholder="Search club..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="custom--input w-full input--icon"
          />
        </div>


        {/* Status filter */}
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

      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              {/* <th className="px-2 py-4">Club ID</th> */}
              <th className="px-2 py-4">Name</th>
              <th className="px-2 py-4">Email</th>
              <th className="px-2 py-4">City</th>
              <th className="px-2 py-4">State</th>
              <th className="px-2 py-4">Country</th>
              <th className="px-2 py-4">Status</th>
              <th className="px-2 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {club.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4">
                  No club added yet.
                </td>
              </tr>
            ) : (
              club.map((club, index) => (
                <tr
                  key={club.id || index}
                  className="group bg-white border-b hover:bg-gray-50 relative transition duration-700"
                >
                  {/* <td className="px-2 py-4">{club?.id || "—"}</td> */}
                  <td className="px-2 py-4">{club?.name}</td>
                  <td className="px-2 py-4">{club?.email}</td>
                  <td className="px-2 py-4">{club?.city}</td>
                  <td className="px-2 py-4">
                    {club?.state?.label || club?.state}
                  </td>
                  <td className="px-2 py-4">{club?.country}</td>
                  <td className="px-2 py-4">
                    <div
                      className={`flex gap-1 items-center ${
                        club?.status === "ACTIVE"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      <FaCircle />
                      {club?.status
                        ? club.status.charAt(0) +
                          club.status.slice(1).toLowerCase()
                        : ""}
                    </div>
                  </td>
                  <td className="px-2 py-4">
                    <Tooltip
                      id={`tooltip-edit-${club.id || index}`}
                      content="Edit Club"
                      place="top"
                    >
                      <div
                        className="p-1 cursor-pointer"
                        onClick={() => {
                          setEditingClub(club);
                          formik.setValues({
                            ...club,
                            state:
                              typeof club.state === "string"
                                ? { label: club.state, value: club.state }
                                : club.state,
                          });
                          setShowModal(true);
                        }}
                      >
                        <LiaEdit className="text-[25px] text-black" />
                      </div>
                    </Tooltip>
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
        currentDataLength={club.length}
        onPageChange={(newPage) => {
          setPage(newPage);
          fetchClubs(searchTerm, newPage);
        }}
      />

      {showModal && (
        <CreateClub
          setShowModal={setShowModal}
          editingClub={editingClub}
          formik={formik}
          handleOverlayClick={handleOverlayClick}
          leadBoxRef={leadBoxRef}
          handlePhoneChange={handlePhoneChange}
          indianStates={indianStates}
        />
      )}
    </div>
  );
};

export default ClubList;
