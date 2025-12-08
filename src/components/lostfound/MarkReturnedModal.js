import React, { useRef, useState, useEffect } from "react";
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
import { authAxios } from "../../config/config";
import { toast } from "react-toastify";
import { FaCalendarDays } from "react-icons/fa6";
import { useSelector } from "react-redux";

const MarkReturnedModal = ({ lostID, onClose, onSuccess }) => {
  const { user } = useSelector((state) => state.auth);
  const leadBoxRef = useRef(null);
  const [mobileError, setMobileError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  const formik = useFormik({
    initialValues: {
      item: "",
      description: "",
      date_time: null,
      foundAt: "",
      claimant_name: "",
      country_code: "",
      mobile: "",
      phoneFull: "",
      returnDate_time: new Date(),
      returnedBy: user?.name || "Nitin",
      notes: "",
      category: "",
      status: "",
    },
    validationSchema: Yup.object({
      claimant_name: Yup.string().required("Member Name is required"),
      mobile: Yup.string()
        .required("Contact number is required")
        .test("is-valid-phone", "Invalid phone number", function (value) {
          const { country_code } = this.parent;
          if (!value || !country_code) return false;

          const phoneNumberString = `+${country_code}${value}`;

          if (!isPossiblePhoneNumber(phoneNumberString)) return false;

          const phoneNumber = parsePhoneNumberFromString(phoneNumberString);
          return phoneNumber?.isValid() || false;
        }),
      returnedBy: Yup.string().required("Returned By is required"),
      returnDate_time: Yup.date().required("Return Date & Time is required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        // Prepare payload for update
        const payload = {
          item_name: values.item,
          category: values.category,
          found_at_location: values.foundAt,
          found_date_time: values.date_time,
          description: values.description,
          claimant_name: values.claimant_name,
          phone_number: values.phoneFull || null,
          return_date_time: values.returnDate_time
            ? values.returnDate_time.toISOString()
            : null,
          returned_by: user?.id || null, // Assuming you have user ID
          verification_notes: values.notes,
          status: "RETURNED",
        };

        // Make PUT request to update the item
        await authAxios().put(`/lost/found/${lostID}`, payload);

        toast.success("Item marked as returned successfully");
        onClose();

        // Trigger parent to refresh data
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Something went wrong. Please try again."
        );
        console.error("Error updating item:", error);
      } finally {
        setLoading(false);
      }
    },
  });

  // Fetch item data on mount
  useEffect(() => {
    if (lostID) {
      fetchItemData();
    }
  }, [lostID]);

  const fetchItemData = async () => {
    setFetchingData(true);
    try {
      const response = await authAxios().get(`/lost/found/${lostID}`);
      const data = response.data.data;

      // Set form values with fetched data
      formik.setValues({
        item: data.item_name || "",
        description: data.description || "",
        date_time: data.found_date_time ? new Date(data.found_date_time) : null,
        foundAt: data.found_at_location || "",
        claimant_name: data.claimant_name || "",
        country_code: "",
        mobile: "",
        phoneFull: data.phone_number || "",
        returnDate_time: data.return_date_time
          ? new Date(data.return_date_time)
          : new Date(),
        returnedBy: user?.name || "Nitin",
        notes: data.verification_notes || "",
        category: data.category || "",
        status: data.status || "",
      });

      // If phone number exists, parse it
      if (data.phone_number) {
        const phoneNumber = parsePhoneNumberFromString(data.phone_number);
        if (phoneNumber) {
          formik.setFieldValue("mobile", phoneNumber.nationalNumber);
          formik.setFieldValue("country_code", phoneNumber.countryCallingCode);
        }
      }
    } catch (error) {
      toast.error("Failed to fetch item data");
      console.error("Error fetching item:", error);
      onClose();
    } finally {
      setFetchingData(false);
    }
  };

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
      if (!formik.values.mobile || !formik.values.country_code) return;

      const response = await authAxios().get("/member/list");
      const apiData = response.data;

      if (apiData.status === true && Array.isArray(apiData.data)) {
        const matchedMember = apiData.data.find(
          (member) =>
            String(member.mobile) === String(formik.values.mobile) &&
            String(member.country_code) === String(formik.values.country_code)
        );

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

  return (
    <div
      className="bg--blur create--lead--container overflow-auto hide--overflow fixed top-0 left-0 z-[999] w-full bg-black bg-opacity-60 h-full"
      onClick={handleOverlayClick}
    >
      <div
        className="min-h-[70vh] w-[95%] max-w-xl mx-auto mt-[100px] mb-[100px] container--leadbox rounded-[10px] flex flex-col"
        ref={leadBoxRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-t-[10px] flex gap-3 items-center justify-between py-4 px-4 border-b">
          <h2 className="text-xl font-semibold">Mark as Returned</h2>
          <div className="close--lead cursor-pointer" onClick={onClose}>
            <IoCloseCircle className="text-3xl" />
          </div>
        </div>

        {fetchingData ? (
          <div className="flex items-center justify-center p-8 bg-white">
            <p>Loading item data...</p>
          </div>
        ) : (
          <div className="flex-1s flexs">
            <form
              onSubmit={formik.handleSubmit}
              className="flex flex-col gap-3 mt-0"
            >
              <div className="p-6 flex-1 bg-white rounded-b-[10px]">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block">Item Name</label>
                    <input
                      type="text"
                      name="item"
                      value={formik.values.item}
                      onChange={formik.handleChange}
                      placeholder="Item"
                      className="custom--input w-full"
                      disabled={true}
                    />
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
                  </div>

                  <div>
                    <label className="mb-2 block">Found Date</label>
                    <div className="custom--date relative">
                      <span className="absolute z-[1] mt-[11px] ml-[15px]">
                        <FaCalendarDays />
                      </span>
                      <DatePicker
                        selected={formik.values.date_time}
                        onChange={(date) =>
                          formik.setFieldValue("date_time", date)
                        }
                        disabled={true}
                        dateFormat="dd/MM/yyyy hh:mm aa"
                        showTimeSelect
                        className="custom--input w-full input--icon"
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
                      placeholder="Found At"
                      className="custom--input w-full"
                      disabled={true}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block">
                      Phone Number<span className="text-red-500">*</span>
                    </label>
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
                    {(formik.touched.mobile &&
                      (formik.errors.mobile || mobileError)) && (
                      <div className="text-red-500 text-sm">
                        {mobileError || formik.errors.mobile}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block">
                      Claimant Name<span className="text-red-500">*</span>
                    </label>
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
                      <span className="absolute z-[1] mt-[11px] ml-[15px]">
                        <FaCalendarDays />
                      </span>
                      <DatePicker
                        selected={formik.values.returnDate_time}
                        onChange={(date) =>
                          formik.setFieldValue("returnDate_time", date)
                        }
                        maxDate={new Date()}
                        showTimeSelect
                        timeFormat="hh:mm aa"
                        dateFormat="dd/MM/yyyy hh:mm aa"
                        className="custom--input w-full input--icon"
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
                      placeholder="Add verification notes"
                      className="custom--input w-full"
                      rows="3"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 py-5 pt-0 justify-end">
                <button
                  type="button"
                  className="px-4 py-2 bg-black border border-black text-white font-semibold rounded max-w-[150px] w-full"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-black font-semibold rounded max-w-[150px] w-full disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkReturnedModal;