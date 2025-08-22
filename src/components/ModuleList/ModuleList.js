import React, { useEffect, useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Tooltip from "../common/Tooltip";
import { LiaEdit } from "react-icons/lia";
import { FaCircle } from "react-icons/fa6";
import CreateModule from "./CreateModule";
import { apiAxios } from "../../config/config";
import { IoSearchOutline } from "react-icons/io5";
import Select from "react-select";
import { customStyles } from "../../Helper/helper";

const ModuleList = () => {
  const [showModal, setShowModal] = useState(false);
  const [module, setModule] = useState([]);
  const [editingOption, setEditingOption] = useState(null);
  const leadBoxRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);

  const fetchModuleList = async (search = "") => {
    try {
      const res = await apiAxios().get("/module/list", {
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

  useEffect(() => {
    fetchModuleList();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchModuleList(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, statusFilter]);

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setShowModal(false);
    }
  };

  console.log(module, "module");

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      status: "ACTIVE",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Module name is required"),
      status: Yup.string().required("Status is required"),
    }),
    // onSubmit: (values, { resetForm }) => {
    //   const now = new Date().toISOString(); // ISO format, easy to format later

    //   if (editingOption) {
    //     setModule((prev) =>
    //       prev.map((c) =>
    //         c.id === editingOption.id ? { ...c, ...values, updated_at: now } : c
    //       )
    //     );
    //     toast.success("Updated Successfully");
    //   } else {
    //     const newCompany = {
    //       id: Date.now(),
    //       ...values,
    //       created_at: now,
    //       updated_at: now,
    //     };
    //     setModule((prev) => [...prev, newCompany]);
    //     toast.success("Created Successfully");
    //   }

    //   resetForm();
    //   setEditingOption(null);
    //   setShowModal(false);
    // },
     onSubmit: async (values, { resetForm }) => {
      try {
        const payload = {
          ...values,
          state: values.state?.value || values.state,
        };

        if (editingOption && editingOption.id) {
          // Update
          await apiAxios().put(`/module/${editingOption.id}`, payload);
          toast.success("Updated Successfully");
        } else {
          // Create
          await apiAxios().post("/module/create", payload);
          toast.success("Created Successfully");
        }

        // 🔄 Re-fetch after save
        fetchModuleList();
      } catch (err) {
        console.error(err);
        toast.error("Failed to save module");
      }

      resetForm();
      setEditingOption(null);
      setShowModal(false);
    },
  });

  return (
    <div className="page--content">
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > All Module`}</p>
          <h1 className="text-3xl font-semibold">All Module</h1>
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
            <FiPlus /> Create Module
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

      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-2 py-4">Module ID</th>
              <th className="px-2 py-4">Name</th>
              <th className="px-2 py-4">Description</th>
              <th className="px-2 py-4">Status</th>
              <th className="px-2 py-4">Created At</th>
              <th className="px-2 py-4">Updated At</th>
              <th className="px-2 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {module.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4">
                  No module added yet.
                </td>
              </tr>
            ) : (
              module.map((company, index) => (
                <tr
                  key={company.id || index}
                  className="group bg-white border-b hover:bg-gray-50 relative transition duration-700"
                >
                  <td className="px-2 py-4">{company?.id || "—"}</td>
                  <td className="px-2 py-4">{company?.name}</td>
                  <td>{company.description ?? "—"}</td>
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
                  <td>{company.created_at ? new Date(company.created_at).toLocaleString() : "—"}</td>
                  <td>{company.updated_at ? new Date(company.updated_at).toLocaleString() : "—"}</td>
                  <td className="px-2 py-4">
                    <div className="w-fit">
                      <Tooltip
                        id={`tooltip-edit-${company.id || index}`}
                        content="Edit Club"
                        place="left"
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
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <CreateModule
          setShowModal={setShowModal}
          editingOption={editingOption}
          formik={formik}
          handleOverlayClick={handleOverlayClick}
          leadBoxRef={leadBoxRef}
        />
      )}
    </div>
  );
};

export default ModuleList;
