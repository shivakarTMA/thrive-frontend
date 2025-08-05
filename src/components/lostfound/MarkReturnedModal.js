import React, { useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { IoCloseCircle } from "react-icons/io5";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const MarkReturnedModal = ({ item, onClose, onSubmit }) => {
  const leadBoxRef = useRef(null);
  const formik = useFormik({
    initialValues: {
      memberName: "",
      returnedBy: "",
      remarks: "",
      returnDate: new Date(),
    },
    validationSchema: Yup.object({
      memberName: Yup.string().required("Member Name is required"),
      returnedBy: Yup.string().required("Returned By is required"),
      remarks: Yup.string(),
    }),
    onSubmit: (values) => {
      const returnInfo = {
        returnDateTime: values.returnDate.toISOString(),
        memberName: values.memberName,
        returnedBy: values.returnedBy,
        remarks: values.remarks,
      };
      onSubmit(item.id, returnInfo);
    },
  });

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    <div
      className="bg--blur create--lead--container overflow-auto hide--overflow fixed top-0 left-0 z-[999] w-full bg-black bg-opacity-60 h-full"
      onClick={handleOverlayClick}
    >
      <div
        className="min-h-[70vh]  w-[95%] max-w-xl mx-auto mt-[100px] mb-[100px] container--leadbox rounded-[10px] flex flex-col"
        ref={leadBoxRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-t-[10px] flex gap-3 items-center justify-between py-4 px-4 border-b">
          <h2 className="text-xl font-semibold">
            {item.item} Mark as Returned
          </h2>
          <div className="close--lead cursor-pointer" onClick={onClose}>
            <IoCloseCircle className="text-3xl" />
          </div>
        </div>
        <div className="flex-1s flexs ">
          <form
            onSubmit={formik.handleSubmit}
            className="flex flex-col gap-3 mt-0"
          >
            <div className="p-6 flex-1 bg-white rounded-b-[10px]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block">
                    Member Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="memberName"
                    value={formik.values.memberName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Member Name"
                    className="custom--input w-full"
                  />
                  {formik.touched.memberName && formik.errors.memberName && (
                    <div className="text-red-500 text-sm">
                      {formik.errors.memberName}
                    </div>
                  )}
                </div>
                <div>
                  <label className="mb-2 block">
                    Invoice Date<span className="text-red-500">*</span>
                  </label>
                  <div className="custom--date relative">
                    <DatePicker
                      selected={formik.values.returnDate}
                      onChange={(date) =>
                        formik.setFieldValue("returnDate", date)
                      }
                    />
                  </div>
                  {formik.touched.returnedBy && formik.errors.returnedBy && (
                    <div className="text-red-500 text-sm">
                      {formik.errors.returnedBy}
                    </div>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="mb-2 block">Remarks (Optional)</label>

                  <textarea
                    name="remarks"
                    value={formik.values.remarks}
                    onChange={formik.handleChange}
                    placeholder="Add Remarks"
                    className="custom--input w-full"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-4 py-5 pt-0 justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-black border border-black text-white font-semibold rounded max-w-[150px] w-full"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-white text-black font-semibold rounded max-w-[150px] w-full"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MarkReturnedModal;
