import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import RichTextEditor from "../common/RichTextEditor";
import { toast } from "react-toastify";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { authAxios } from "../../config/config";
import { blockNonLettersAndNumbers, customStyles, filterActiveItems, sanitizeTextWithNumbers } from "../../Helper/helper";
import Select from "react-select";
import { sanitizeHtml } from "../../Helper/sanitizeHtml";

// ✅ Define validation schema using Yup
const validationSchema = Yup.object({
  club_id: Yup.string().required("Club Name is required"),
  name: Yup.string().required("Template Name is required"),
  subject: Yup.string().required("Subject is required"),
  body_html: Yup.string()
  .test(
    "not-empty",
    "Message is required",
    (value) => value && value.replace(/<[^>]+>/g, "").trim().length > 0
  )
  .required("Message is required"),
});

const CreateEmailTemplate = () => {
  const navigate = useNavigate();
  const { id: editingOption } = useParams();
  const [clubList, setClubList] = useState([]);

  // Function to fetch club list
  const fetchClub = async () => {
    try {
      const response = await authAxios().get("/club/list");
      const data = response.data?.data || [];
      const activeOnly = filterActiveItems(data);
      setClubList(activeOnly);
    } catch (error) {
      console.log(error)
    }
  };
  // Function to fetch role list

  useEffect(() => {
    fetchClub();
  }, []);

  const clubOptions = clubList.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  const formik = useFormik({
    initialValues: {
      club_id: "",
      name: "",
      subject: "",
      body_html: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = { ...values };

        if (editingOption) {
          await authAxios().put(`/emailtemplate/${editingOption}`, payload);
          toast.success("Updated Successfully");
        } else {
          await authAxios().post("/emailtemplate/create", payload);
          toast.success("Created Successfully");
        }
        resetForm();
        navigate("/email-template-list", {
          replace: true,
        });

      } catch (err) {
        console.error("API Error:", err.response?.data || err.message);
        toast.error(err.response?.data?.errors)
      }

      
    },
  });

  // ✅ Fetch role details when selectedId changes
  useEffect(() => {
    if (!editingOption) return;

    const fetchTemplateById = async (id) => {
      try {
        const res = await authAxios().get(`/emailtemplate/${id}`);
        const data = res.data?.data || res.data || null;

        if (data) {
          // ✅ Prefill formik fields with fetched data
          formik.setValues({
            club_id: data.club_id || "",
            name: data.name || "",
            subject: data.subject || "",
            body_html: data.body_html || "",
          });
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchTemplateById(editingOption);
  }, [editingOption]);

  return (
    <div className="page--content">
      <div className=" flex items-end justify-between gap-2 mb-0">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home >  Marketing > Create Email Template`}</p>
          <h1 className="text-3xl font-semibold">Create Email Template</h1>
        </div>
      </div>
      <Link
        to="/email-template-list"
        className="flex items-center gap-2 mt-5 cursor-pointer border rounded-full w-fit border-black px-3 py-1 bg-black text-white"
      >
        <MdOutlineKeyboardBackspace /> <span>Back</span>
      </Link>
      <div className="w-full p-4 border bg-white shadow-box rounded-[10px] mt-5">
        {/* ✅ Regular form tag using formik.handleSubmit */}
        <form onSubmit={formik.handleSubmit}>
          {/* --- EMAIL TEMPLATE SECTION --- */}
          <div>
            <div className="grid grid-cols-3 gap-2">
              {/* Template Name */}
              <div>
                <label className="mb-2 block">
                  Club Name<span className="text-red-500">*</span>
                </label>
                <Select
                  placeholder="Club Name"
                  name="club_id"
                  value={
                    clubOptions.find(
                      (option) =>
                        option.value.toString() ===
                        formik.values.club_id?.toString(),
                    ) || null
                  }
                  options={clubOptions}
                  onChange={(option) =>
                    formik.setFieldValue("club_id", option.value)
                  }
                  onBlur={() => formik.setFieldTouched("club_id", true)}
                  styles={customStyles}
                />
                {formik.touched.club_id && formik.errors.club_id && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.club_id}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-2 block">
                  Template Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="custom--input w-full"
                  value={formik.values.name}
                  // onChange={formik.handleChange}
                  onKeyDown={blockNonLettersAndNumbers}
                  onChange={(e) => {
                    const cleaned = sanitizeTextWithNumbers(e.target.value);
                    formik.setFieldValue("name", cleaned);
                  }}
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
                  // onChange={formik.handleChange}
                  // onKeyDown={blockNonLetters}
                  // onChange={(e) => {
                  //   const cleaned = allowOnlyLetters(e.target.value);
                  //   formik.setFieldValue("subject", cleaned);
                  // }}
                  onKeyDown={blockNonLettersAndNumbers}
                  onChange={(e) => {
                    const cleaned = sanitizeTextWithNumbers(e.target.value);
                    formik.setFieldValue("subject", cleaned);
                  }}
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
                value={formik.values.body_html}
                label="Message"
                // onChange={(content) => formik.setFieldValue("body_html", content)}
                onChange={(content) => {
                  formik.setFieldValue("body_html", sanitizeHtml(content));
                  formik.setFieldTouched("body_html", true);
                }}
                placeholder="Enter your email message..."
                height={300}
              />

              {formik.touched.body_html && formik.errors.body_html && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.body_html}
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
