import React, { useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Tooltip from "../common/Tooltip";
import { LiaEdit } from "react-icons/lia";
import { FaCircle } from "react-icons/fa6";
import CreateClub from "./CreateOption";

const OptionList = () => {
  const [showModal, setShowModal] = useState(false);
  const [option, setOption] = useState([]);
  const [editingOption, setEditingOption] = useState(null);
  const leadBoxRef = useRef(null);

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setShowModal(false);
    }
  };

  console.log(option,'option')

  const formik = useFormik({
    initialValues: {
      name: "",
      option_list_type: "",
      position: "",
      status: "ACTIVE",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Option name is required"),
      option_list_type: Yup.string().required("Option Type is required"),
      status: Yup.string().required("Status is required"),
    }),
    onSubmit: (values, { resetForm }) => {
      if (editingOption) {
        setOption((prev) =>
          prev.map((c) => (c.id === editingOption.id ? { ...c, ...values } : c))
        );
        toast.success("Updated Successfully");
      } else {
        const newCompany = { id: Date.now(), ...values };
        setOption((prev) => [...prev, newCompany]);
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
          <p className="text-sm">{`Home > All Options`}</p>
          <h1 className="text-3xl font-semibold">All Options</h1>
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
            <FiPlus /> Create Option
          </button>
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-2 py-4">Option ID</th>
              <th className="px-2 py-4">Name</th>
              <th className="px-2 py-4">Type of list</th>
              <th className="px-2 py-4">Postion</th>
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
                  className="group bg-white border-b hover:bg-gray-50 relative transition duration-700"
                >
                  <td className="px-2 py-4">{company?.id || "—"}</td>
                  <td className="px-2 py-4">{company?.name}</td>
                  <td className="px-2 py-4">{company.option_list_type || "—"}</td>
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
                      content="Edit Club"
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

      {showModal && (
        <CreateClub
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

export default OptionList;
