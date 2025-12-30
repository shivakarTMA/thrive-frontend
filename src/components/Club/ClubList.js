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
import { authAxios } from "../../config/config";
import { IoSearchOutline } from "react-icons/io5";
import Select from "react-select";
import { customStyles } from "../../Helper/helper";
import Pagination from "../common/Pagination";
import { QRCodeCanvas } from "qrcode.react";

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
  const qrRefs = useRef({});
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

  const formatTime = (timeString) => {
    if (!timeString) return "--";

    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(Number(hours));
    date.setMinutes(Number(minutes));

    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const fetchClubs = async (search = "", currentPage = page) => {
    try {
      const res = await authAxios().get("/club/list", {
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
      gstno: "",
      state: indianStates[0],
      country: "India",
      zipcode: "",
      status: "",
      club_available_service: [],
      description: "",
      map_url: "",
      open_time: "",
      close_time: "",
      trial_duration: "",
      position: "",
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
      gstno: Yup.string().required("GST No. is required"),
      zipcode: Yup.string().required("ZIP or Postal is required"),
      status: Yup.string().required("Status is required"),
      address: Yup.string().required("Address is required"),
      description: Yup.string().required("Description is required"),
      position: Yup.string().required("Position is required"),

      map_url: Yup.string()
        .url("Invalid URL format")
        .required("Map URL is required"),

      // open_time is a time (Date object)
      open_time: Yup.string().required("Open time is required"),
      close_time: Yup.string().required("Close time is required"),

      // Number (minutes)
      trial_duration: Yup.number()
        .typeError("Trial duration is required")
        .required("Trial duration is required"),

      // Club services array
      club_available_service: Yup.array()
        .of(Yup.string())
        .min(1, "At least one service is required"), // If you want optional, remove .min()
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("email", values.email);
        formData.append(
          "phone",
          values.phone?.startsWith("+") ? values.phone.slice(1) : values.phone
        );
        formData.append("address", values.address);
        formData.append("city", values.city);
        formData.append("state", values.state?.value || values.state);
        formData.append("country", values.country);
        formData.append("zipcode", values.zipcode);
        formData.append("status", values.status);
        formData.append("map_url", values.map_url);
        formData.append("position", values.position);
        formData.append("open_time", values.open_time);
        formData.append("close_time", values.close_time);
        formData.append("gstno", values.gstno);
        formData.append(
          "club_available_service",
          JSON.stringify(values.club_available_service)
        );

        formData.append("trial_duration", values.trial_duration);

        // ✅ Append logo only if it's a file
        if (values.logoFile instanceof File) {
          formData.append("logo", values.logoFile);
        }

        if (editingClub && editingClub) {
          // Update
          await authAxios().put(`/club/${editingClub}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Updated Successfully");
        } else {
          // Create
          await authAxios().post("/club/create", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Created Successfully");
        }

        setShowModal(false);

        // 🔄 Re-fetch after save
        fetchClubs();
        resetForm();
        setEditingClub(null);
      } catch (err) {
        console.error("API Error:", err.response?.data || err.message);
        toast.error("Failed to save club");
      }
    },
  });

  const handlePhoneChange = (value) => {
    formik.setFieldValue("phone", value);
  };

  const downloadQRCode = (clubId) => {
    const canvas = document.getElementById(`qr-download-${clubId}`);

    if (!canvas) {
      toast.error("QR code not found");
      return;
    }

    const pngUrl = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = `club_${clubId}_qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      <div className="box--shadow bg-white rounded-[15px] p-4">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                {/* <th className="px-2 py-4">Club ID</th> */}
                <th className="px-2 py-4">QR Code</th>
                <th className="px-2 py-4">Name</th>
                <th className="px-2 py-4">Email</th>
                <th className="px-2 py-4">GST No.</th>
                <th className="px-2 py-4">City</th>
                <th className="px-2 py-4">Open Time</th>
                <th className="px-2 py-4">Close Time</th>
                <th className="px-2 py-4">Trial Duration</th>
                <th className="px-2 py-4 text-center">Position</th>
                <th className="px-2 py-4">Status</th>
                <th className="px-2 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {club.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-4">
                    No club found.
                  </td>
                </tr>
              ) : (
                club.map((club, index) => (
                  <tr
                    key={club.id || index}
                    className="group bg-white border-b hover:bg-gray-50 relative transition duration-700"
                  >
                    {/* <td className="px-2 py-4">{club?.id || "—"}</td> */}
                    <td className="px-2 py-4">
                      <div className="relative">
                        <QRCodeCanvas
                          id={`qr-view-${club.id}`}
                          value={JSON.stringify({
                            club_id: club.id,
                            type: "ATTENDANCE",
                          })}
                          size={50}
                          level="H"
                        />

                        <div className="w-full h-full absolute top-0 left-0">
                          <Tooltip
                            id={`tooltip-qr-${club.id || index}`}
                            content="Download QR Code"
                            place="top"
                          >
                            <button
                              className="w-full h-full opacity-0"
                              onClick={() => downloadQRCode(club.id)}
                            >
                              QR
                            </button>
                          </Tooltip>

                          {/* Hidden QR Code */}
                          <div style={{ display: "none" }}>
                            <QRCodeCanvas
                              id={`qr-download-${club.id}`}
                              value={JSON.stringify({
                                club_id: club.id,
                                type: "ATTENDANCE",
                              })}
                              size={250}
                              level="H"
                            />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-4">{club?.name}</td>
                    <td className="px-2 py-4">{club?.email}</td>
                    <td className="px-2 py-4">
                      {club?.gstno ? club?.gstno : "--"}
                    </td>
                    <td className="px-2 py-4">{club?.city}</td>
                    <td className="px-2 py-4">
                      {club?.open_time ? formatTime(club?.open_time) : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {club?.close_time ? formatTime(club?.close_time) : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {club?.trial_duration
                        ? club?.trial_duration + " Minutes"
                        : "--"}
                    </td>
                    <td className="px-2 py-4 text-center">{club?.position}</td>
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
                            setEditingClub(club?.id);
                            // formik.setValues({
                            //   ...club,
                            //   state:
                            //     typeof club.state === "string"
                            //       ? { label: club.state, value: club.state }
                            //       : club.state,
                            // });
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
