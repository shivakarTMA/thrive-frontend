import React, { useEffect, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { customStyles } from "../../Helper/helper";
import { IoCloseCircle } from "react-icons/io5";
import { toast } from "react-toastify";

// Main component
const AddCoins = ({ setCoinsModal }) => {
  const leadBoxRef = useRef(null);

  const reasonVariations = [
    { value: "Challlenges", label: "Challlenges" },
    { value: "Referral", label: "Referral" },
    { value: "Compensation", label: "Compensation" },
  ];

  // Formik setup
  const formik = useFormik({
    initialValues: {
      no_of_coins: null,
      reasonVariations: "",
      remarks: "",
    },
    validationSchema: Yup.object({
      no_of_coins: Yup.number().required("Coins is required"),
      reasonVariations: Yup.string().required("Product Type is required"),
    }),
    onSubmit: (values, { resetForm }) => {
      toast.success("Appointment booked successfully!");
      resetForm(values);
      handleLeadModal();
    },
  });

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setCoinsModal(false);
    }
  };

  const handleLeadModal = () => {
    setCoinsModal(false);
  };

  return (
    <div
      className="bg--blur create--lead--container overflow-auto fixed top-0 left-0 z-[999] w-full bg-black bg-opacity-60 h-full"
      onClick={handleOverlayClick}
    >
      <div
        className="min-h-[70vh] w-[95%] max-w-lg mx-auto mt-[100px] mb-[100px] container--leadbox rounded-[10px] flex flex-col"
        ref={leadBoxRef}
      >
        <div className="bg-white rounded-t-[10px] flex gap-3 items-center justify-between py-4 px-4 border-b">
          <h2 className="text-xl font-semibold">Add Coins</h2>
          <div className="close--lead cursor-pointer" onClick={handleLeadModal}>
            <IoCloseCircle className="text-3xl" />
          </div>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className=" p-6 bg-white rounded-b-[10px]">
            {/* No of Coins added */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-black mb-2">
                No of Coins added<span className="text-red-500">*</span>
              </label>
              <input
                name="no_of_coins"
                value={formik.values.no_of_coins}
                onChange={formik.handleChange}
                className="custom--input w-full"
              />
              {formik.errors.no_of_coins && formik.touched.no_of_coins && (
                <div className="text-red-500 text-sm">
                  {formik.errors.no_of_coins}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-black mb-2">
                Reason<span className="text-red-500">*</span>
              </label>
              <Select
                value={formik.values.reasonVariations}
                onChange={(value) =>
                  formik.setFieldValue("reasonVariations", value)
                }
                options={reasonVariations}
                styles={customStyles}
              />
              {formik.errors.reasonVariations &&
                formik.touched.reasonVariations && (
                  <div className="text-red-500 text-sm">
                    {formik.errors.reasonVariations}
                  </div>
                )}
            </div>

            {/* Remarks */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-black mb-2">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={formik.values.remarks}
                onChange={formik.handleChange}
                className="custom--input w-full"
                rows={4}
                placeholder="Add any additional notes..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={handleLeadModal}
              className="px-4 py-2 bg-transparent border border-white text-white font-semibold rounded max-w-[150px] w-full"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 bg-white text-black font-semibold rounded max-w-[150px] w-full`}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCoins;
