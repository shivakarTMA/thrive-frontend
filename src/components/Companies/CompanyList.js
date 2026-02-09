import React, { useEffect, useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import Tooltip from "../common/Tooltip";
import { LiaEdit } from "react-icons/lia";
import CreateCompany from "./CreateCompany";
import { FaAngleLeft, FaAngleRight, FaCircle } from "react-icons/fa6";
import { authAxios } from "../../config/config";
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

const CompanyList = () => {
  const [showModal, setShowModal] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [editingCompany, setEditingCompany] = useState(null);
  const leadBoxRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchCompanies = async (search = "", currentPage = page) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
        ...(search ? { search } : {}),
      };
      if (statusFilter) {
        params.status = statusFilter.value;
      }

      const res = await authAxios().get("/company/list", { params });

      let data = res.data?.data || [];

      setCompanies(data);
      setPage(res.data?.currentPage || 1);
      setTotalPages(res.data?.totalPage || 1);
      setTotalCount(res.data?.totalCount || data.length);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch companies");
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setPage(1);
      fetchCompanies(searchTerm, 1);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, statusFilter]);

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setShowModal(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      logo: "",
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: null,
      country: {
        label: "India",
        value: "IN",
      },
      zipcode: "",
      gstno: "",
      status: "ACTIVE",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Company name is required"),
      phone: Yup.string()
        .required("Contact number is required")
        .test(
          "is-valid-phone",
          "Please enter a valid phone number",
          (value) => value && isValidPhoneNumber(value),
        ),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("email", values.email);
        formData.append("phone", values.phone);
        // formData.append(
        //   "phone",
        //   values.phone ? values.phone.replace("+", "") : "",
        // );
        formData.append("address", values.address);
        formData.append("city", values.city);
        formData.append("state", values.state?.label || "");
        formData.append("country", values.country?.label || "");
        formData.append("zipcode", values.zipcode);
        formData.append("gstno", values.gstno);
        formData.append("status", values.status);

        // ✅ Append logo file if uploaded
        if (values.logoFile instanceof File) {
          formData.append("logo", values.logoFile);
        }

        if (editingCompany && editingCompany) {
          // Update
          await authAxios().put(`/company/${editingCompany}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Updated Successfully");
        } else {
          // Create
          await authAxios().post("/company/create", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Created Successfully");
        }

        // 🔄 Re-fetch after save
        fetchCompanies();
      } catch (err) {
        console.error("API Error:", err.response?.data || err.message);
        toast.error("Failed to save company");
      }

      resetForm();
      setEditingCompany(null);
      setShowModal(false);
    },
  });

  return (
    <div className="page--content">
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > All Company`}</p>
          <h1 className="text-3xl font-semibold">All Company</h1>
        </div>
        <div className="flex items-end gap-2">
          <button
            type="button"
            className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
            onClick={() => {
              setEditingCompany(null);
              formik.resetForm();
              setShowModal(true);
            }}
          >
            <FiPlus /> Create Company
          </button>
        </div>
      </div>
      <div className="flex gap-3 mb-4">
        <div className="mb-4 w-full max-w-[200px]">
          <div className="relative">
            <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
              <IoSearchOutline />
            </span>
            <input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="custom--input w-full input--icon"
            />
          </div>
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
              {companies.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    No companies found.
                  </td>
                </tr>
              ) : (
                companies.map((company, index) => (
                  <tr
                    key={company.id || index}
                    className="group bg-white border-b hover:bg-gray-50 relative transition duration-700"
                  >
                    <td className="px-2 py-4">
                      {company?.name ? company?.name : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {company?.email ? company?.email : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {company?.city ? company?.city : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {company?.state ? company?.state : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {company?.country ? company?.country : "--"}
                    </td>
                    <td className="px-2 py-4">
                      <div
                        className={`flex gap-1 items-center ${
                          company?.status === "ACTIVE"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        <FaCircle />
                        {company?.status
                          ? company.status.charAt(0) +
                            company.status.slice(1).toLowerCase()
                          : ""}
                      </div>
                    </td>
                    <td className="px-2 py-4">
                      <Tooltip
                        id={`tooltip-edit-${company.id || index}`}
                        content="Edit Company"
                        place="top"
                      >
                        <div
                          className="p-1 cursor-pointer"
                          onClick={() => {
                            setEditingCompany(company?.id);
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
          currentDataLength={companies.length}
          onPageChange={(newPage) => {
            setPage(newPage);
            fetchCompanies(searchTerm, newPage);
          }}
        />
      </div>

      {showModal && (
        <CreateCompany
          setShowModal={setShowModal}
          editingCompany={editingCompany}
          formik={formik}
          handleOverlayClick={handleOverlayClick}
          leadBoxRef={leadBoxRef}
          indianStates={indianStates}
        />
      )}
    </div>
  );
};

export default CompanyList;
