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
import CreateMarketingBanner from "./CreateMarketingBanner";
import axios from "axios";
import { authAxios } from "../../config/config";
import { IoSearchOutline } from "react-icons/io5";
import Select from "react-select";
import { customStyles } from "../../Helper/helper";
import Pagination from "../common/Pagination";

const MarketingBanner = () => {
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

  const fetchMarketingBanner = async (search = "", currentPage = page) => {
    try {
      const res = await authAxios().get("/marketingbanner/list", {
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
      // setPage(res.data?.currentPage || 1);
      // setTotalPages(res.data?.totalPage || 1);
      // setTotalCount(res.data?.totalCount || data.length);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch club");
    }
  };

  useEffect(() => {
    fetchMarketingBanner();
  }, []);

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setShowModal(false);
    }
  };

  const marketingBannerValidationSchema = Yup.object({
    club_id: Yup.string().required("Club is required"),
    banner_image: Yup.string().required("Image is required"),
    banner_heading: Yup.string().required("Banner heading is required"),
    banner_subheading: Yup.string().required("Banner subheading is required"),
    button_text: Yup.string().required("Button text is required"),
    description_heading: Yup.string().required(
      "Description heading is required"
    ),
    description_subheading: Yup.string().required(
      "Description subheading is required"
    ),
    caption: Yup.string().required("Caption is required"),

    content: Yup.array()
      .of(Yup.string().trim().required("Content item cannot be empty"))
      .min(1, "At least one content item is required"),
  });

  const formik = useFormik({
    initialValues: {
      club_id: null,
      banner_image: null, // Added the banner_image field
      banner_heading: "",
      banner_subheading: "",
      button_text: "",
      external_url: "",
      description_heading: "",
      description_subheading: "",
      caption: "",
      content: [],
      position: "", // This can be a string or number, depending on your use case
      status: "ACTIVE",
    },
    validationSchema: marketingBannerValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const formData = new FormData();

        // Append the values to the FormData
        formData.append("club_id", values.club_id);
        formData.append("banner_heading", values.banner_heading);
        formData.append("banner_subheading", values.banner_subheading);
        formData.append("button_text", values.button_text);
        formData.append("external_url", values.external_url);
        formData.append("description_heading", values.description_heading);
        formData.append(
          "description_subheading",
          values.description_subheading
        );
        formData.append("caption", values.caption);
        formData.append("content", JSON.stringify(values.content)); // Convert content array to string
        formData.append("position", values.position);
        formData.append("status", values.status);

        // ✅ Handle banner_image if it's a file (image)
        if (values.banner_image instanceof File) {
          formData.append("banner_image", values.banner_image);
        }

        // Send the request based on the editing state
        if (editingClub) {
          // Update existing club
          await authAxios().put(`/marketingbanner/${editingClub}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Updated Successfully");
        } else {
          // Create new marketing banner
          await authAxios().post("/marketingbanner/create", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Created Successfully");
        }

        setShowModal(false);

        // 🔄 Re-fetch after save
        fetchMarketingBanner(); // Or use fetchClubs() depending on your setup
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

  console.log(club, "club");

  return (
    <div className="page--content">
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > App Banner`}</p>
          <h1 className="text-3xl font-semibold">App Banner</h1>
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
            <FiPlus /> Create Banner
          </button>
        </div>
      </div>

      {/* Filters */}
      {/* <div className="flex gap-3 mb-4">
   
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
      </div> */}
      <div className="box--shadow bg-white rounded-[15px] p-4">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                {/* <th className="px-2 py-4">Club ID</th> */}
                <th className="px-2 py-4">Image</th>
                <th className="px-2 py-4">Heading</th>
                <th className="px-2 py-4">Sub Heading</th>
                {/* <th className="px-2 py-4">Description Heading</th>
                <th className="px-2 py-4">Description Subheading</th> */}
                <th className="px-2 py-4">Caption</th>
                <th className="px-2 py-4 text-center">Position</th>
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
                club.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className="group bg-white border-b hover:bg-gray-50 relative transition duration-700"
                  >
                    {/* <td className="px-2 py-4">{item?.id || "—"}</td> */}
                    <td className="px-2 py-4">
                      <div className="bg-black rounded-lg w-14 h-14 overflow-hidden">
                        <img
                          src={item?.banner_image}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </td>
                    <td className="px-2 py-4">{item?.banner_heading}</td>
                    <td className="px-2 py-4">{item?.banner_subheading}</td>
                    {/* <td className="px-2 py-4">{item?.description_heading}</td>
                    <td className="px-2 py-4">
                      {item?.description_subheading}
                    </td> */}
                    <td className="px-2 py-4">{item?.caption}</td>
                    <td className="px-2 py-4 text-center">{item?.position}</td>
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
                      <Tooltip
                        id={`tooltip-edit-${item.id || index}`}
                        content="Edit Banner"
                        place="top"
                      >
                        <div
                          className="p-1 cursor-pointer"
                          onClick={() => {
                            setEditingClub(item?.id);
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

        {/* <Pagination
          page={page}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          currentDataLength={club.length}
          onPageChange={(newPage) => {
            setPage(newPage);
            fetchMarketingBanner(searchTerm, newPage);
          }}
        /> */}
      </div>

      {showModal && (
        <CreateMarketingBanner
          setShowModal={setShowModal}
          editingClub={editingClub}
          formik={formik}
          handleOverlayClick={handleOverlayClick}
          leadBoxRef={leadBoxRef}
          handlePhoneChange={handlePhoneChange}
        />
      )}
    </div>
  );
};

export default MarketingBanner;
