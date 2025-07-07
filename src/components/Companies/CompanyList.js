import React, { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FaRegBuilding } from "react-icons/fa6";
import { toast } from "react-toastify";

const CompanyList = () => {
  const [showModal, setShowModal] = useState(false);
  const [companies, setCompanies] = useState([]);

  const formik = useFormik({
    initialValues: {
      companyName: "",
      state: "",
      city: "",
    },
    validationSchema: Yup.object({
      companyName: Yup.string().required("Company name is required"),
      state: Yup.string().required("State is required"),
      city: Yup.string().required("City is required"),
    }),
    onSubmit: (values, { resetForm }) => {
      setCompanies([...companies, values]);
      resetForm();
      setShowModal(false);
      toast.success("Created Successfully");
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
            onClick={() => setShowModal(true)}
          >
            <FiPlus /> Create Company
          </button>
        </div>
      </div>

      {/* Company List */}
      <div className="mt-4">
        {companies.length === 0 ? (
          <p>No companies added yet.</p>
        ) : (
          <ul className="grid lg:grid-cols-5 md:grid-cols-2 gap-4">
            {companies.map((name, idx) => (
              <li
                key={idx}
                className="border p-3 flex items-center gap-2 rounded-lg transition hover:bg-black hover:text-white leading-[20px]"
              >
                <FaRegBuilding />
                {name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md shadow-lg">
            <div className="p-3 border-b">
              <h2 className="text-xl font-semibold ">Create Company</h2>
            </div>
            <form onSubmit={formik.handleSubmit} className="p-3">
              <div className="mb-4">
                <label className="mb-2 block">Company Name</label>
                <div className="relative">
                  <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                    <FaRegBuilding />
                  </span>
                  <input
                    type="text"
                    name="companyName"
                    value={formik.values.companyName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="custom--input w-full input--icon"
                  />
                </div>
                {formik.touched.companyName && formik.errors.companyName && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.companyName}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="mb-2 block">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formik.values.city}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="custom--input w-full"
                  />
                  {formik.touched.city && formik.errors.city && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.city}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="mb-2 block">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formik.values.state}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="custom--input w-full"
                  />
                  {formik.touched.state && formik.errors.state && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.state}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    formik.resetForm();
                    setShowModal(false);
                  }}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyList;
