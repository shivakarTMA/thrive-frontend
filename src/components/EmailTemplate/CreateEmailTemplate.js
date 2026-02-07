import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import RichTextEditor from "../common/RichTextEditor";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { MdOutlineKeyboardBackspace } from "react-icons/md";

// ✅ Define validation schema using Yup
const validationSchema = Yup.object({
  name: Yup.string().required("Template Name is required"),
  subject: Yup.string().required("Subject is required"),
  message: Yup.string().required("Message is required"),
});

const CreateEmailTemplate = () => {
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      name: "",
      subject: "",
      message: "",
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      console.log("Form Submitted Data:", values);
      toast.success("Template Created successfully!");
      resetForm();
      navigate("/email-template-list", {
        replace: true,
      });
    },
  });

  return (
    <div className="page--content">
      <div className=" flex items-end justify-between gap-2 mb-0">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home >  Marketing > Create Email Template`}</p>
          <h1 className="text-3xl font-semibold">Create Email Template</h1>
        </div>
      </div>
      <Link to="/email-template-list" className="flex items-center gap-2 mt-5 cursor-pointer border rounded-full w-fit border-black px-3 py-1 bg-black text-white">
        <MdOutlineKeyboardBackspace /> <span>Back</span>
      </Link>
      <div className="w-full p-4 border bg-white shadow-box rounded-[10px] mt-5">
        {/* ✅ Regular form tag using formik.handleSubmit */}
        <form onSubmit={formik.handleSubmit}>
          {/* --- EMAIL TEMPLATE SECTION --- */}
          <div>
            <div className="grid grid-cols-2 gap-2">
              {/* Template Name */}
              <div>
                <label className="mb-2 block">
                  Template Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="custom--input w-full"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter Template Name"
                />
                {formik.touched.name && formik.errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.name}
                  </p>
                )}
              </div>

              {/* Subject Input */}
              <div>
                <label className="mb-2 block">
                  Subject<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  className="custom--input w-full"
                  value={formik.values.subject}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter subject"
                />
                {formik.touched.subject && formik.errors.subject && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.subject}
                  </p>
                )}
              </div>
            </div>

            {/* --- MESSAGE SECTION --- */}
            <div className="mt-4">
              <RichTextEditor
                value={formik.values.message}
                label="Message"
                onChange={(content) => formik.setFieldValue("message", content)}
                placeholder="Enter your email message..."
                height={300}
              />

              {formik.touched.message && formik.errors.message && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.message}
                </p>
              )}
            </div>

            {/* --- SUBMIT BUTTON --- */}
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded flex items-center gap-2 mt-4"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEmailTemplate;
