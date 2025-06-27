import React, { useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { IoCloseCircle } from "react-icons/io5";
import { toast } from "react-toastify";
import { FaFilePdf } from "react-icons/fa6";

// Validation Schema
const validationSchema = Yup.object({
  dietPlanName: Yup.string().required("Diet Plan name is required"),
  dietPlanFile: Yup.mixed()
    .required("A PDF file is required")
    .test("fileFormat", "Only PDF files are allowed", (value) => {
      return value && value.type === "application/pdf";
    }),
});

const CreateDietPlan = ({ setShowModal, onDietPlanCreated, initialData }) => {
  const leadBoxRef = useRef(null);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      dietPlanName: initialData?.dietPlanName || "",
      dietPlanFile: initialData?.dietPlanFile || null,
    },
    validationSchema,
    onSubmit: (values) => {
      const dataToSend = {
        ...values,
        id: initialData?.id || Date.now(),
      };
      onDietPlanCreated(dataToSend);
      setShowModal(false);
    },
  });

  const handleFileUpload = (event) => {
    const file = event.currentTarget.files[0];
    if (file && file.type === "application/pdf") {
      formik.setFieldValue("dietPlanFile", file);
    } else {
      toast.error("Only PDF files are allowed.");
      formik.setFieldValue("dietPlanFile", null);
      event.target.value = "";
    }
  };

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setShowModal(false);
    }
  };

  return (
    <div
      className="fixed top-0 left-0 z-[999] w-full h-full bg-black bg-opacity-60"
      onClick={handleOverlayClick}
    >
      <div
        ref={leadBoxRef}
        className="mx-auto mt-[100px] mb-[100px] w-[95%] max-w-xl bg-white rounded-[10px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-4 py-4 border-b">
          <h2 className="text-xl font-semibold">Upload Diet Plan</h2>
          <IoCloseCircle
            className="text-3xl cursor-pointer"
            onClick={() => setShowModal(false)}
          />
        </div>
        <form onSubmit={formik.handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block mb-2">
              Diet Plan Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="dietPlanName"
              className="custom--input w-full"
              value={formik.values.dietPlanName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.dietPlanName && formik.errors.dietPlanName && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.dietPlanName}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block mb-2">
              Upload PDF<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                <FaFilePdf />
              </span>
              <input
                type="file"
                name="dietPlanFile"
                accept="application/pdf"
                onChange={handleFileUpload}
                className="custom--input w-full input--icon"
              />
            </div>
            {formik.touched.dietPlanFile && formik.errors.dietPlanFile && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.dietPlanFile}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => {
                formik.resetForm();
                setShowModal(false);
              }}
              className="px-4 py-2 bg-transparent border border-black text-black rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDietPlan;
