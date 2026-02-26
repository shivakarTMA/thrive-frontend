import React, { useEffect, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { IoCloseCircle } from "react-icons/io5";
import { toast } from "react-toastify";
import { FaCalendarDays } from "react-icons/fa6";

// Main component
const SuspendAndPause = ({ setSuspendPause, actionType }) => {
  const leadBoxRef = useRef(null);

  const getTitle = () => {
    switch (actionType) {
      case "suspend":
        return "Cancel Membership";
      case "pause":
        return "Pause Membership";
      default:
        return "Membership Action";
    }
  };

  const showDatePicker = actionType === "pause";

  // Formik setup
  const formik = useFormik({
    initialValues: {
      reason: "",
      pause_date: null,
    },
    validationSchema: Yup.object({
      reason: Yup.string().required("Reason is required"),
      pause_date: showDatePicker
        ? Yup.date().required("Pause date is required")
        : Yup.date().nullable(),
    }),
    onSubmit: (values, { resetForm }) => {
      console.log("Membership Action Submitted:", { actionType, ...values });
      toast.success(`${getTitle()} submitted successfully!`);
      resetForm();
      setSuspendPause(false);
    },
  });

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setSuspendPause(false);
    }
  };

  const handleLeadModal = () => {
    setSuspendPause(false);
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
          <h2 className="text-xl font-semibold">{getTitle()}</h2>
          <div className="close--lead cursor-pointer" onClick={handleLeadModal}>
            <IoCloseCircle className="text-3xl" />
          </div>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className=" p-6 bg-white rounded-b-[10px]">
            {/* Reason */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-black mb-2">
                Reason<span className="text-red-500">*</span>
              </label>
              <textarea
                name="reason"
                value={formik.values.reason}
                onChange={formik.handleChange}
                className="custom--input w-full"
                rows={4}
                placeholder="Write the reason..."
              />
              {formik.errors.reason && formik.touched.reason && (
                <div className="text-red-500 text-sm">
                  {formik.errors.reason}
                </div>
              )}
            </div>

            {/* Date Picker */}
            {showDatePicker && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-2">
                  Pause Until<span className="text-red-500">*</span>
                </label>
                <div className="custom--date flex-1">
                  <span className="absolute z-[1] mt-[11px] ml-[15px]">
                    <FaCalendarDays />
                  </span>
                  <div className="custom--date">
                    <DatePicker
                      selected={formik.values.pause_date}
                      onChange={(date) =>
                        formik.setFieldValue("pause_date", date)
                      }
                      minDate={new Date()}
                      dateFormat="dd MMM yyyy"
                      placeholderText="Select pause end date"
                      className="border px-3 py-2 w-full input--icon"
                    />
                  </div>
                  {formik.errors.pause_date && formik.touched.pause_date && (
                    <div className="text-red-500 text-sm">
                      {formik.errors.pause_date}
                    </div>
                  )}
                </div>
              </div>
            )}
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

export default SuspendAndPause;
