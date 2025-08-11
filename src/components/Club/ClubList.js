import React, { useRef, useState } from "react";
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
      status: "ACTIVE",
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
      state: Yup.object().required("State/Province is required"),
      country: Yup.string().required("Country is required"),
      zipcode: Yup.string().required("ZIP or Postal is required"),
      status: Yup.string().required("Status is required"),
    }),
    onSubmit: (values, { resetForm }) => {
      if (editingClub) {
        setClub((prev) =>
          prev.map((c) =>
            c.id === editingClub.id ? { ...c, ...values } : c
          )
        );
        toast.success("Updated Successfully");
      } else {
        const newCompany = { ...values }; // no id here
        setClub((prev) => [...prev, newCompany]);
        toast.success("Created Successfully");
      }

      resetForm();
      setEditingClub(null);
      setShowModal(false);
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

      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-2 py-4">Club ID</th>
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
                  <td className="px-2 py-4">{club?.id || "—"}</td>
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
                          formik.setValues(club);
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
