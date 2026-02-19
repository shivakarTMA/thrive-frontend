import React, { useEffect, useState } from "react";
import Select from "react-select";
import PhoneInput, {
  isValidPhoneNumber,
  parsePhoneNumber,
} from "react-phone-number-input";
import { useFormik } from "formik";
import * as Yup from "yup";
import "react-phone-number-input/style.css";
import { IoCloseCircle } from "react-icons/io5";
import { formatAutoDate, selectIcon } from "../../Helper/helper";
import { FaEnvelope, FaUser } from "react-icons/fa";
import { MdOutlineFamilyRestroom } from "react-icons/md";
import { FiPlus } from "react-icons/fi";
import { authAxios } from "../../config/config";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { fetchOptionList } from "../../Redux/Reducers/optionListSlice";
import {
  parsePhoneNumberFromString,
  isPossiblePhoneNumber,
} from "libphonenumber-js";

/* ---------------- VALIDATION ---------------- */

const validationSchema = Yup.object({
  full_name: Yup.string().required("Full Name is required"),

  // mobile: Yup.string().required("Contact number is required"),
    mobile: Yup.string()
      .required("Contact number is required")
      .test("is-valid-phone", "Invalid phone number", function (value) {
        const { country_code } = this.parent;
        if (!value || !country_code) return false;
  
        // Combine country code and number to full international format
        const phoneNumberString = `+${country_code}${value}`;
  
        // First check if the number is even possible (not just valid)
        if (!isPossiblePhoneNumber(phoneNumberString)) return false;
  
        // Parse and check validity strictly according to country
        const phoneNumber = parsePhoneNumberFromString(phoneNumberString);
        return phoneNumber?.isValid() || false;
      }),

  country_code: Yup.string().required(),

  referrer_relationship: Yup.string().required("Relationship is required"),
}).test("valid-phone", "Invalid phone number", function (values) {
  const { mobile, country_code } = values || {};
  if (!mobile || !country_code) return false;
  return isValidPhoneNumber(`+${country_code}${mobile}`);
});

/* ---------------- COMPONENT ---------------- */

const Relations = ({ details }) => {
  const [referredBy, setReferredBy] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dispatch = useDispatch();
  const { lists } = useSelector((state) => state.optionList);

  /* -------- Fetch relationship options -------- */
  useEffect(() => {
    dispatch(fetchOptionList("RELATIONSHIP"));
  }, [dispatch]);

  const relationshipOptions = lists["RELATIONSHIP"] || [];

  /* -------- Fetch referrals -------- */
  const fetchMemberReferrals = async () => {
    if (!details?.id) return;

    try {
      const res = await authAxios().get(`/member/referral/list/${details.id}`);
      setReferredBy(res.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch referrals");
    }
  };

  useEffect(() => {
    fetchMemberReferrals();
  }, [details?.id]);

  /* ---------------- FORMIK ---------------- */

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      member_id: details?.id,
      full_name: "",
      country_code: "",
      mobile: "",
      email: "",
      referrer_relationship: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = {
          member_id: values.member_id,
          full_name: values.full_name,
          mobile: values.mobile,
          country_code: values.country_code,
          email: values.email,
          referrer_relationship: values.referrer_relationship,
        };

        const res = await authAxios().post("/member/referral/create", payload);

        if (res?.data?.status === true) {
          toast.success(res.data.message);
          resetForm();
          setIsModalOpen(false);
          fetchMemberReferrals();
        } else {
          toast.error(res?.data?.message || "Something went wrong");
        }
      } catch (error) {
        toast.error(
          error?.response?.data?.message ||
            "Something went wrong. Please try again."
        );
      }
    },
  });

  const columns = ["Name", "Relationship", "Referred On", "Current Status"];

  /* ---------------- UI ---------------- */

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-end mb-3">
        <button
         onClick={() => {
            setIsModalOpen(true);
            formik.resetForm();
          }}
          className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
        >
          <FiPlus /> Add Referral
        </button>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((col) => (
                <th key={col} className="border px-3 py-2 text-left">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {referredBy.length ? (
              referredBy.map((item, idx) => (
                <tr key={idx}>
                  <td className="border px-3 py-2">{item.full_name}</td>
                  <td className="border px-3 py-2">
                    {item.referrer_relationship}
                  </td>
                  <td className="border px-3 py-2">
                    {formatAutoDate(item.createdAt)}
                  </td>
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

      {/* ---------------- MODAL ---------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] bg-black bg-opacity-60 overflow-auto">
          <div className="min-h-[70vh] w-[95%] max-w-sm mx-auto mt-[100px] mb-[100px] rounded-lg flex flex-col">
            <div className="bg-white rounded-t-lg flex justify-between items-center py-4 px-4 border-b">
              <h2 className="text-xl font-semibold">Refer Someone</h2>
              <IoCloseCircle
                className="text-3xl cursor-pointer"
                onClick={() => setIsModalOpen(false)}
              />
            </div>

            <form
              onSubmit={formik.handleSubmit}
              className="bg-white rounded-b-lg p-6 space-y-4"
            >
              {/* Name */}
              <div>
                <label>
                  Name<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                    <FaUser />
                  </span>
                  <input
                    name="full_name"
                    value={formik.values.full_name}
                    onChange={formik.handleChange}
                    className="custom--input w-full input--icon"
                  />
                </div>
                {formik.errors.full_name && (
                  <p className="text-red-500 text-xs">
                    {formik.errors.full_name}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label>
                  Phone Number<span className="text-red-500">*</span>
                </label>
                <PhoneInput
                  international
                  defaultCountry="IN"
                  countryCallingCodeEditable={false}
                  value={
                    formik.values.country_code && formik.values.mobile
                      ? `+${formik.values.country_code}${formik.values.mobile}`
                      : ""
                  }
                  onChange={(value) => {
                    if (!value) {
                      formik.setFieldValue("mobile", "");
                      formik.setFieldValue("country_code", "");
                      return;
                    }
                    const phone = parsePhoneNumber(value);
                    if (phone) {
                      formik.setFieldValue("mobile", phone.nationalNumber);
                      formik.setFieldValue(
                        "country_code",
                        phone.countryCallingCode
                      );
                    }
                  }}
                  className="custom--input w-full custom--phone"
                />
                {formik.errors.mobile && (
                  <p className="text-red-500 text-xs">{formik.errors.mobile}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label>Email</label>
                <div className="relative">
                  <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                    <FaEnvelope />
                  </span>
                  <input
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    className="custom--input w-full input--icon"
                  />
                </div>
              </div>

              {/* Relationship */}
              <div>
                <label>
                  Relationship<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                    <MdOutlineFamilyRestroom />
                  </span>
                  <Select
                    options={relationshipOptions}
                    value={relationshipOptions.find(
                      (o) => o.value === formik.values.referrer_relationship
                    )}
                    onChange={(opt) =>
                      formik.setFieldValue("referrer_relationship", opt.value)
                    }
                    styles={selectIcon}
                  />
                </div>
                {formik.errors.referrer_relationship && (
                  <p className="text-red-500 text-xs">
                    {formik.errors.referrer_relationship}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded"
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
