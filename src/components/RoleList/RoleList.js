import React, { useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Tooltip from "../common/Tooltip";
import { LiaEdit } from "react-icons/lia";
import { FaCircle } from "react-icons/fa6";
import CreateRole from "./CreateRole";

const RoleList = () => {
  const [showModal, setShowModal] = useState(false);
  const [role, setRole] = useState([]);
  const [editingOption, setEditingOption] = useState(null);
  const leadBoxRef = useRef(null);

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setShowModal(false);
    }
  };

  console.log(role,'role')

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      status: "ACTIVE",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Role name is required"),
      status: Yup.string().required("Status is required"),
    }),
    onSubmit: (values, { resetForm }) => {
      if (editingOption) {
        setRole((prev) =>
          prev.map((c) => (c.id === editingOption.id ? { ...c, ...values } : c))
        );
        toast.success("Updated Successfully");
      } else {
        const newCompany = { id: Date.now(), ...values };
        setRole((prev) => [...prev, newCompany]);
        toast.success("Created Successfully");
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
          <p className="text-sm">{`Home > All Role`}</p>
          <h1 className="text-3xl font-semibold">All Role</h1>
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
            <FiPlus /> Create Role
          </button>
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-2 py-4">Role ID</th>
              <th className="px-2 py-4">Name</th>
              <th className="px-2 py-4">Description</th>
              <th className="px-2 py-4">Status</th>
              <th className="px-2 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {role.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4">
                  No role added yet.
                </td>
              </tr>
            ) : (
              role.map((company, index) => (
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
        <CreateRole
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

export default RoleList;
