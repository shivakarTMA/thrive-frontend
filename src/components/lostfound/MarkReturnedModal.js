import React, { useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { IoCloseCircle } from "react-icons/io5";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import PhoneInput from "react-phone-number-input";
import {
  parsePhoneNumberFromString,
  isPossiblePhoneNumber,
} from "libphonenumber-js";
import { apiAxios } from "../../config/config";
import { toast } from "react-toastify";

const MarkReturnedModal = ({ data, onClose, onSubmit }) => {
  const leadBoxRef = useRef(null);
  const [mobileError, setMobileError] = useState("");
  const formik = useFormik({
    initialValues: {
      item: "Water Bottle",
      description: "My water bottle lost.",
      date_time: "09/30/2025",
      foundAt: "Locker Room",
      claimant_name: "",
      country_code: "",
      mobile: "",
      phoneFull: "",
      returnDate_time: new Date(),
      returnedBy: "Nitin",
      notes: "My water bottle is red color.",
    },
    validationSchema: Yup.object({
      claimant_name: Yup.string().required("Member Name is required"),
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
      returnedBy: Yup.string().required("Returned By is required"),
      remarks: Yup.string(),
    }),
    onSubmit: (values) => {
      console.log(values, "values returned");

      const payload = {};
      if (values.phoneFull) {
        const phoneNumber = parsePhoneNumberFromString(values.phoneFull);
        if (phoneNumber) {
          payload.country_code = phoneNumber.countryCallingCode;
          payload.mobile = phoneNumber.nationalNumber;
        }
      } else {
        payload.country_code = null;
        payload.mobile = null;
      }
      onClose();
    },
  });

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      onClose();
    }
  };

  const handlePhoneChange = (value) => {
    formik.setFieldValue("phoneFull", value);
    if (!value) {
      formik.setFieldValue("mobile", "");
      formik.setFieldValue("country_code", "");
      return;
    }
    const phoneNumber = parsePhoneNumberFromString(value);
    if (phoneNumber) {
      formik.setFieldValue("mobile", phoneNumber.nationalNumber);
      formik.setFieldValue("country_code", phoneNumber.countryCallingCode);
    }
    formik.setFieldError("mobile", "");
  };

  const handlePhoneBlur = async () => {
    try {
      // Only make API call if both mobile and country code are available
      if (!formik.values.mobile || !formik.values.country_code) return;

      // Call API to fetch member list
      const response = await apiAxios().get("/lead/list");
      const apiData = response.data;

      console.log(apiData, "apiData");

      // Check if response is valid and contains data
      if (apiData.status === true && Array.isArray(apiData.data)) {
        // Normalize types before comparison
        const matchedMember = apiData.data.find(
          (member) =>
            String(member.mobile) === String(formik.values.mobile) &&
            String(member.country_code) === String(formik.values.country_code)
        );
        console.log(matchedMember, "matchedMember");

        if (matchedMember) {
          formik.setFieldValue("claimant_name", matchedMember.full_name);
          formik.setFieldError("claimant_name", "");
          setMobileError("");
        } else {
          formik.setFieldValue("claimant_name", "");
          setMobileError("User not registered");
        }
      }
    } catch (error) {
      console.error("Error fetching member list:", error);
      setMobileError("Something went wrong, try again later.");
    }
  };

  console.log("Mobile error:", formik.errors.mobile);

  console.log(data, "data");

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
          <h2 className="text-xl font-semibold">Mark as Returned</h2>
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
                  <label className="mb-2 block">Item</label>
                  <input
                    type="text"
                    name="item"
                    value={formik.values.item}
                    onChange={formik.handleChange}
                    placeholder="Item"
                    className="custom--input w-full"
                    disabled={true}
                  />
                  {formik.touched.item && formik.errors.item && (
                    <div className="text-red-500 text-sm">
                      {formik.errors.item}
                    </div>
                  )}
                </div>
                <div>
                  <label className="mb-2 block">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    placeholder="Description"
                    className="custom--input w-full"
                    disabled={true}
                  />
                  {formik.touched.description && formik.errors.description && (
                    <div className="text-red-500 text-sm">
                      {formik.errors.description}
                    </div>
                  )}
                </div>
                <div>
                  <label className="mb-2 block">Found date</label>
                  <div className="custom--date relative">
                    <DatePicker
                      selected={formik.values.date_time}
                      onChange={(date) =>
                        formik.setFieldValue("date_time", date)
                      }
                      disabled={true}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block">Found At</label>
                  <input
                    type="text"
                    name="foundAt"
                    value={formik.values.foundAt}
                    onChange={formik.handleChange}
                    placeholder="Description"
                    className="custom--input w-full"
                    disabled={true}
                  />
                </div>
                <div>
                  <label className="mb-2 block">Phone Number</label>
                  <PhoneInput
                    name="phoneFull"
                    value={formik.values.phoneFull}
                    onChange={handlePhoneChange}
                    onBlur={handlePhoneBlur}
                    international
                    defaultCountry="IN"
                    countryCallingCodeEditable={false}
                    className="custom--input w-full custom--phone"
                  />
                  {(formik.errors.mobile || mobileError) && (
                    <div className="text-red-500 text-sm">
                      {mobileError || formik.errors.mobile}
                    </div>
                  )}
                </div>
                <div>
                  <label className="mb-2 block">Claimant Name</label>
                  <input
                    type="text"
                    name="claimant_name"
                    value={formik.values.claimant_name}
                    onChange={formik.handleChange}
                    placeholder="Claimant Name"
                    className="custom--input w-full"
                    disabled={true}
                  />
                  {formik.touched.claimant_name &&
                    formik.errors.claimant_name && (
                      <div className="text-red-500 text-sm">
                        {formik.errors.claimant_name}
                      </div>
                    )}
                </div>
                <div>
                  <label className="mb-2 block">
                    Return Date & Time<span className="text-red-500">*</span>
                  </label>
                  <div className="custom--date relative">
                    <DatePicker
                      selected={formik.values.returnDate_time}
                      onChange={(date) =>
                        formik.setFieldValue("returnDate_time", date)
                      }
                      maxDate={new Date()}
                    />
                  </div>
                  {formik.touched.returnDate_time &&
                    formik.errors.returnDate_time && (
                      <div className="text-red-500 text-sm">
                        {formik.errors.returnDate_time}
                      </div>
                    )}
                </div>
                <div>
                  <label className="mb-2 block">
                    Returned By<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="returnedBy"
                    value={formik.values.returnedBy}
                    onChange={formik.handleChange}
                    placeholder="Returned By"
                    disabled={true}
                    className="custom--input w-full"
                  />
                </div>
                <div className="col-span-2">
                  <label className="mb-2 block">Verification Notes</label>

                  <textarea
                    name="notes"
                    value={formik.values.notes}
                    onChange={formik.handleChange}
                    placeholder="Notes"
                    className="custom--input w-full"
                    readOnly={true}
                    disabled={true}
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
