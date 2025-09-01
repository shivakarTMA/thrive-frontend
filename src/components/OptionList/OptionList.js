import React, { useEffect, useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Tooltip from "../common/Tooltip";
import { LiaEdit } from "react-icons/lia";
import { FaCircle } from "react-icons/fa6";
import CreateClub from "./CreateOption";
import { apiAxios } from "../../config/config";
import { IoSearchOutline } from "react-icons/io5";
import Select from "react-select";
import { customStyles } from "../../Helper/helper";
import Pagination from "../common/Pagination";

const OptionList = () => {
  const [editOptionModal, setEditOptionModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [option, setOption] = useState([]);
  const [editingOption, setEditingOption] = useState(null);
  const leadBoxRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [optionTypes, setOptionTypes] = useState([]);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchOptions = async (search = "", currentPage = page) => {
    try {
      const res = await apiAxios().get("/option-list/get", {
        params: {
          page: currentPage,
          limit: rowsPerPage,
          ...(search ? { search } : {}),
          ...(selectedType?.value ? { optionListType: selectedType.value } : {}),
          ...(statusFilter?.value ? { status: statusFilter.value } : {}),
        },
      });

      let data = res.data?.data || res.data || [];

      setOption(data);
      setPage(res.data?.currentPage || 1);
      setTotalPages(res.data?.totalPage || 1);
      setTotalCount(res.data?.totalCount || data.length);

    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch options");
    }
  };

  const fetchOptionTypes = async () => {
  try {
    const res = await apiAxios().get("/option-list/type");
    const types = res.data?.data || [];

    setOptionTypes(
      types.map((item) => ({
        label: item.option_list_type,
        value: item.option_list_type,
      }))
    );
  } catch (err) {
    console.error(err);
    toast.error("Failed to fetch option types");
  }
};

  // 🔄 Run on first load
  useEffect(() => {
    fetchOptions();
    fetchOptionTypes();
  }, []);

  // 🔄 Run when search/type/status changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchOptions(searchTerm, 1);
      setPage(1);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, selectedType, statusFilter]);

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setShowModal(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      option_list_type: "",
      position: "",
      status: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Option name is required"),
      option_list_type: Yup.string().required("Option Type is required"),
      status: Yup.string().required("Status is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = { ...values };

        if (editingOption && editingOption.id) {
          await apiAxios().put(`/option-list/${editingOption.id}`, payload);
          toast.success("Updated Successfully");
        } else {
          await apiAxios().post("/option-list/create", payload);
          toast.success("Created Successfully");
        }

        fetchOptions();
      } catch (err) {
        console.error(err);
        toast.error("Failed to save option");
      }

      resetForm();
      setEditingOption(null);
      setShowModal(false);
    },
  });

  return (
    <div className="page--content">
      {/* Header */}
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > All Options`}</p>
          <h1 className="text-3xl font-semibold">All Options</h1>
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
          <FiPlus /> Create Option
        </button>
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
            placeholder="Search options..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="custom--input w-full input--icon"
          />
        </div>

        {/* Type filter */}
        <div className="w-full max-w-[200px]">
          <Select
            placeholder="Filter by Type"
            options={optionTypes}
            value={selectedType}
            onChange={(option) => setSelectedType(option)}
            isClearable
            styles={customStyles}
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

      {/* Table */}
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-2 py-4">Name</th>
              <th className="px-2 py-4">Type of list</th>
              <th className="px-2 py-4">Position</th>
              <th className="px-2 py-4">Status</th>
              <th className="px-2 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {option.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4">
                  No option added yet.
                </td>
              </tr>
            ) : (
              option.map((company, index) => (
                <tr
                  key={company.id || index}
                  className="group bg-white border-b hover:bg-gray-50 transition duration-700"
                >
                  <td className="px-2 py-4">{company?.name}</td>
                  <td className="px-2 py-4">
                    {company.option_list_type || "—"}
                  </td>
                  <td>{company.position ?? "—"}</td>
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
                      content="Edit Option"
                      place="top"
                    >
                      <div
                        className="p-1 cursor-pointer"
                        onClick={() => {
                          setEditingOption(company);
                          formik.setValues(company);
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
        currentDataLength={option.length}
        onPageChange={(newPage) => {
          setPage(newPage);
          fetchOptions(searchTerm, newPage);
        }}
      />

      {showModal && (
        <CreateClub
          setShowModal={setShowModal}
          editingOption={editingOption}
          formik={formik}
          handleOverlayClick={handleOverlayClick}
          leadBoxRef={leadBoxRef}
          optionTypes={optionTypes}
        />
      )}
    </div>
  );
};

export default OptionList;
