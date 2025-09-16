import React, { useState } from "react";
import Select from "react-select";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { useFormik } from "formik";
import * as Yup from "yup";
import "react-phone-number-input/style.css";
import "react-datepicker/dist/react-datepicker.css";
import { FaListCheck } from "react-icons/fa6";
import { IoCloseCircle } from "react-icons/io5";
import { selectIcon } from "../../Helper/helper";
import { FaEnvelope, FaUser } from "react-icons/fa";
import { MdOutlineFamilyRestroom } from "react-icons/md";
import { FiPlus } from "react-icons/fi";

const relationshipOptions = [
  { value: "Family Member", label: "Family Member" },
  { value: "Friend", label: "Friend" },
  { value: "Colleague", label: "Colleague" },
  { value: "Acquaintance", label: "Acquaintance" },
];

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
 
     phone: Yup.string()
          .required("Contact number is required")
          .test("is-valid-phone", "Invalid phone number", function (value) {
            return isValidPhoneNumber(value || "");
          }),
  // email: Yup.string().email("Invalid email").required("Email is required"),
  relationship: Yup.object().required("Relationship is required"),
});

const Relations = () => {
  const [referredBy, setReferredBy] = useState([
    { name: "Amit Sharma", relationship: "Friend", referredOn: "2025-01-15", status: "Member" },
    { name: "Neha Verma", relationship: "Colleague", referredOn: "2025-02-01", status: "Lead" },
    { name: "Rohit Singh", relationship: "Sibling", referredOn: "2025-02-20", status: "Member" },
    { name: "Divya Patel", relationship: "Neighbor", referredOn: "2025-03-05", status: "Lead" },
    { name: "Sanjay Kumar", relationship: "Trainer", referredOn: "2025-03-22", status: "Member" },
    { name: "Priya Das", relationship: "Cousin", referredOn: "2025-04-10", status: "Lead" },
    { name: "Rahul Mehta", relationship: "Spouse", referredOn: "2025-04-18", status: "Member" },
    { name: "Sneha Rao", relationship: "Friend", referredOn: "2025-05-01", status: "Lead" },
    { name: "Karan Malhotra", relationship: "Classmate", referredOn: "2025-05-12", status: "Lead" },
    { name: "Tina George", relationship: "Coworker", referredOn: "2025-06-01", status: "Member" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      phone: "",
      email: "",
      relationship: "",
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      const newReferral = {
        name: values.name,
        relationship: values.relationship.value,
        referredOn: new Date().toISOString().split("T")[0],
        status: "Lead",
      };
      setReferredBy([newReferral, ...referredBy]);
      resetForm();
      setIsModalOpen(false);
    },
  });

  // const columns = ["Name", "Referred On", "Current Status"];
  const columns = ["Name", "Relationship", "Referred On", "Current Status"];

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-end mb-3">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-white text-black flex items-center gap-2 cursor-pointer"
        >
         <FiPlus /> Add Referral
        </button>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="border px-3 py-2">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {referredBy.length > 0 ? (
              referredBy.map((item, idx) => (
                <tr key={idx}>
                  <td className="border px-3 py-2">{item.name}</td>
                  <td className="border px-3 py-2">{item.relationship}</td>
                  <td className="border px-3 py-2">{item.referredOn}</td>
                  <td className="border px-3 py-2">{item.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-4 text-gray-500">
                  No data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed top-0 left-0 z-[999] w-full h-full bg-black bg-opacity-60 overflow-auto">
          <div className="min-h-[70vh] w-[95%] max-w-sm mx-auto mt-[100px] mb-[100px] rounded-[10px] flex flex-col">
            <div className="bg-white rounded-t-[10px] flex justify-between items-center py-4 px-4 border-b">
              <h2 className="text-xl font-semibold">Refer Someone</h2>
              <div className="cursor-pointer" onClick={() => setIsModalOpen(false)}>
                <IoCloseCircle className="text-3xl" />
              </div>
            </div>

            <form onSubmit={formik.handleSubmit} className="bg-white rounded-b-[10px] p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="mb-2 block">Name<span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                      <FaUser />
                    </span>
                    <input
                      type="text"
                      name="name"
                      placeholder="Name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      className="custom--input w-full input--icon"
                    />
                    {formik.touched.name && formik.errors.name && (
                      <p className="text-red-500 text-xs">{formik.errors.name}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block">Phone Number<span className="text-red-500">*</span></label>
                  <PhoneInput
                    name="phone"
                    value={formik.values.phone}
                    onChange={(value) => formik.setFieldValue("phone", value)}
                    international
                    defaultCountry="IN"
                    className="custom--input w-full custom--phone"
                    countryCallingCodeEditable={false}
                  />
                  {formik.touched.phone && formik.errors.phone && (
                    <p className="text-red-500 text-xs">{formik.errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block">Email</label>
                  <div className="relative">
                    <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                      <FaEnvelope />
                    </span>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      className="custom--input w-full input--icon"
                    />
                    {formik.touched.email && formik.errors.email && (
                      <p className="text-red-500 text-xs">{formik.errors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block">Relationship<span className="text-red-500">*</span></label>
                   <div className="relative">
                    <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                      <MdOutlineFamilyRestroom />
                    </span>
                  <Select
                    name="relationship"
                    options={relationshipOptions}
                    value={formik.values.relationship}
                    onChange={(selected) => formik.setFieldValue("relationship", selected)}
                    styles={selectIcon}
                  />
                  </div>
                  {formik.touched.relationship && formik.errors.relationship && (
                    <p className="text-red-500 text-xs">{formik.errors.relationship}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" className="px-4 py-2 bg-black text-white rounded flex items-center gap-2">
                  Submit Referral
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Relations;
