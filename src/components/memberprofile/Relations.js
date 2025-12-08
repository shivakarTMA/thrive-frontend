import React, { useEffect, useState } from "react";
import Select from "react-select";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { useFormik } from "formik";
import * as Yup from "yup";
import "react-phone-number-input/style.css";
import "react-datepicker/dist/react-datepicker.css";
import { FaListCheck } from "react-icons/fa6";
import { IoCloseCircle } from "react-icons/io5";
import { formatAutoDate, selectIcon } from "../../Helper/helper";
import { FaEnvelope, FaUser } from "react-icons/fa";
import { MdOutlineFamilyRestroom } from "react-icons/md";
import { FiPlus } from "react-icons/fi";
import { authAxios } from "../../config/config";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { fetchOptionList } from "../../Redux/Reducers/optionListSlice";

const validationSchema = Yup.object({
  full_name: Yup.string().required("Full Name is required"),

  mobile: Yup.string()
    .required("Contact number is required")
    .test("is-valid-phone", "Invalid phone number", function (value) {
      return isValidPhoneNumber(value || "");
    }),
  referrer_relationship: Yup.string().required("Relationship is required"),
});

const Relations = ({ details }) => {
  const [referredBy, setReferredBy] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dispatch = useDispatch();
  const { lists } = useSelector((state) => state.optionList);

  useEffect(() => {
    dispatch(fetchOptionList("RELATIONSHIP"));
  }, []);

  const relationshipOptions = lists["RELATIONSHIP"] || [];

  const fetchMemberReferrals = async () => {
    try {
      // Make the API call with query parameters
      const res = await authAxios().get(`/member/referral/list/${details?.id}`);
      const data = res.data?.data || [];
      setReferredBy(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch coins");
    }
  };

  const formik = useFormik({
    initialValues: {
      member_id: details?.id,
      full_name: "",
      mobile: "",
      email: "",
      referrer_relationship: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const res = await authAxios().post("/member/referral/create", values);
        console.log(res?.data?.status, "res?.data?");

        if (res?.data?.status === true) {
          toast.success(res?.data?.message);
          resetForm();
          setIsModalOpen(false);
          fetchMemberReferrals();
        } else {
          toast.error(res?.data?.message || "Something went wrong.");
        }
      } catch (error) {
        const errorMessage =
          error?.response?.data?.message ||
          "Something went wrong. Please try again.";
        toast.error(errorMessage);
        console.error("Error submitting form:", error);
      }
    },
  });

  useEffect(() => {
    fetchMemberReferrals();
  }, []);


  // const columns = ["Name", "Referred On", "Current Status"];
  const columns = ["Name", "Relationship", "Referred On", "Current Status"];

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-end mb-3">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-black text-white rounded flex items-center gap-2 cursor-pointer"
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
                  <td className="border px-3 py-2">{item.full_name}</td>
                  <td className="border px-3 py-2">
                    {item.referrer_relationship}
                  </td>
                  <td className="border px-3 py-2">{formatAutoDate(item.createdAt)}</td>
                  <td className="border px-3 py-2">{item.entity_type}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-4 text-gray-500"
                >
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
              <div
                className="cursor-pointer"
                onClick={() => setIsModalOpen(false)}
              >
                <IoCloseCircle className="text-3xl" />
              </div>
            </div>

            <form
              onSubmit={formik.handleSubmit}
              className="bg-white rounded-b-[10px] p-6 space-y-4"
            >
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="mb-2 block">
                    Name<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                      <FaUser />
                    </span>
                    <input
                      type="text"
                      name="full_name"
                      placeholder="Full Name"
                      value={formik.values.full_name}
                      onChange={formik.handleChange}
                      className="custom--input w-full input--icon"
                    />
                    {formik.touched.full_name && formik.errors.full_name && (
                      <p className="text-red-500 text-xs">
                        {formik.errors.full_name}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block">
                    Phone Number<span className="text-red-500">*</span>
                  </label>
                  <PhoneInput
                    name="mobile"
                    value={formik.values.mobile}
                    onChange={(value) => formik.setFieldValue("mobile", value)}
                    international
                    defaultCountry="IN"
                    className="custom--input w-full custom--phone"
                    countryCallingCodeEditable={false}
                  />
                  {formik.touched.mobile && formik.errors.mobile && (
                    <p className="text-red-500 text-xs">
                      {formik.errors.mobile}
                    </p>
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
                      <p className="text-red-500 text-xs">
                        {formik.errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block">
                    Relationship<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                      <MdOutlineFamilyRestroom />
                    </span>
                    <Select
                      name="referrer_relationship"
                      options={relationshipOptions}
                      value={relationshipOptions.find(
                        (option) =>
                          option.value === formik.values.referrer_relationship
                      )}
                      onChange={(selected) =>
                        formik.setFieldValue(
                          "referrer_relationship",
                          selected.value
                        )
                      }
                      styles={selectIcon}
                    />
                  </div>
                  {formik.touched.referrer_relationship &&
                    formik.errors.referrer_relationship && (
                      <p className="text-red-500 text-xs">
                        {formik.errors.referrer_relationship}
                      </p>
                    )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
                >
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
