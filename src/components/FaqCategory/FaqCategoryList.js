import React, { useEffect, useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Tooltip from "../common/Tooltip";
import { LiaEdit } from "react-icons/lia";
import { FaCircle } from "react-icons/fa6";
import CreateFaqCategory from "./CreateFaqCategory";
import { authAxios } from "../../config/config";

const FaqCategoryList = () => {
  const [showModal, setShowModal] = useState(false);
  const [faqCategory, setFaqCategory] = useState([]);
  const [editingOption, setEditingOption] = useState(null);
  const leadBoxRef = useRef(null);

  const fetchFaqCategoryList = async () => {
    try {
      const res = await authAxios().get("/faqcategory/list");
      let data = res.data?.data || res.data || [];
      setFaqCategory(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch companies");
    }
  };

  useEffect(() => {
    fetchFaqCategoryList();
  }, []);

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setShowModal(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      title: "",
      icon: "",
      position: null,
      status: "ACTIVE",
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
      position: Yup.number().required("Position is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = { ...values };

        if (editingOption && editingOption) {
          await authAxios().put(`/faqcategory/${editingOption}`, payload);
          toast.success("Updated Successfully");
        } else {
          await authAxios().post("/faqcategory/create", payload);
          toast.success("Created Successfully");
        }

        fetchFaqCategoryList();
      } catch (err) {
        console.error("API Error:", err.response?.data || err.message);
        toast.error("Failed to save faq category");
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
          <p className="text-sm">{`Home > FAQ Category`}</p>
          <h1 className="text-3xl font-semibold">FAQ Category</h1>
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
            <FiPlus /> Create Category
          </button>
        </div>
      </div>
      <div className="box--shadow bg-white rounded-[15px] p-4">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-2 py-4">Title</th>
                <th className="px-2 py-4">Position</th>
                <th className="px-2 py-4">Status</th>
                <th className="px-2 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {faqCategory.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    No data found.
                  </td>
                </tr>
              ) : (
                faqCategory.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className="group bg-white border-b hover:bg-gray-50 relative transition duration-700"
                  >
                    <td className="px-2 py-4">{item?.title}</td>
                    <td className="px-2 py-4">{item.position}</td>
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
                      <div className="w-fit">
                        <Tooltip
                          id={`tooltip-edit-${item.id || index}`}
                          content="Edit Category"
                          place="left"
                        >
                          <div
                            className="p-1 cursor-pointer"
                            onClick={() => {
                              setEditingOption(item?.id);
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
      </div>
      {showModal && (
        <CreateFaqCategory
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

export default FaqCategoryList;
