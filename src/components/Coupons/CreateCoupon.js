// Import React
import React, { useEffect, useState } from "react";
// Import close icon
import { IoCloseCircle } from "react-icons/io5";
// Import icons for input fields
import { FaListUl } from "react-icons/fa6";
import Select from "react-select";
// Import custom styles for select input
import { selectIcon } from "../../Helper/helper";
import { toast } from "react-toastify";
import { authAxios } from "../../config/config";
import { LuCalendar, LuPlug } from "react-icons/lu";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const discountType = [
  { label: "Percentage", value: "PERCENTAGE" },
  { label: "Fixed", value: "FIXED" },
];
const statusOptions = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

// CreateCoupon component
const CreateCoupon = ({
  setShowModal,
  editingOption,
  formik,
  handleOverlayClick,
  leadBoxRef,
}) => {
  const [club, setClub] = useState([]);

  // Function to fetch club list
  const fetchClub = async () => {
    try {
      const response = await authAxios().get("/club/list");
      const data = response.data?.data || response.data || [];
      setClub(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch clubs");
    }
  };

  // Fetch clubs and gallery list on component mount
  useEffect(() => {
    fetchClub();
  }, []);

  const clubOptions =
    club?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];

  useEffect(() => {
    if (!editingOption) return;

    const fetchCouponById = async (id) => {
      try {
        const res = await authAxios().get(`/coupon/${id}`);
        const data = res.data?.data || res.data || null;

        if (data) {
          formik.setValues({
            coupon: {
              id: data.id || "",
              club_id: data.club_id || "",
              code: data.code || "",
              description: data.description || "",
              discount_type: data.discount_type || "",
              discount_value: data.discount_value || "",
              max_usage: data.max_usage || "",
              per_user_limit: data.per_user_limit || "",
              start_date: data.start_date || "",
              end_date: data.end_date || "",
              position: data.position || "",
              status: data.status || "",
            },
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch module details");
      }
    };

    fetchCouponById(editingOption);
  }, [editingOption]);

  return (
    // Modal overlay
    <div
      className="bg--blur create--lead--container overflow-auto hide--overflow fixed top-0 left-0 z-[999] w-full bg-black bg-opacity-60 h-full"
      onClick={handleOverlayClick}
    >
      {/* Modal container */}
      <div
        className="min-h-[70vh] w-[95%] max-w-3xl mx-auto mt-[100px] mb-[100px] container--leadbox rounded-[10px] flex flex-col"
        ref={leadBoxRef}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="bg-white rounded-t-[10px] flex gap-3 items-center justify-between py-4 px-4 border-b">
          <h2 className="text-xl font-semibold">
            {editingOption ? "Edit Coupon" : "Create Coupon"}
          </h2>
          <div
            className="close--lead cursor-pointer"
            onClick={() => {
              formik.resetForm();
              setShowModal(false);
            }}
          >
            <IoCloseCircle className="text-3xl" />
          </div>
        </div>

        {/* Modal body */}
        <div className="flex-1">
          <form onSubmit={formik.handleSubmit} className="p-0 space-y-0">
            <div className="flex bg-white rounded-b-[10px]">
              <div className="p-6 flex-1">
                <div className="grid grid-cols-3 gap-4">
                  {/* Club Name */}
                  <div>
                    <label className="mb-2 block">
                      Club Name<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <FaListUl />
                      </span>
                      <Select
                        name="club_id"
                        value={
                          clubOptions.find(
                            (option) =>
                              option.value.toString() ===
                              formik.values.coupon.club_id?.toString()
                          ) || null
                        }
                        options={clubOptions}
                        onChange={(option) =>
                          formik.setFieldValue("coupon.club_id", option.value)
                        }
                        onBlur={() =>
                          formik.setFieldTouched("coupon.club_id", true)
                        }
                        styles={selectIcon}
                        className="!capitalize"
                      />
                    </div>
                    {formik.touched.coupon?.club_id &&
                      formik.errors.coupon?.club_id && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.coupon?.club_id}
                        </p>
                      )}
                  </div>
                  {/* Code Input */}
                  <div>
                    <label className="mb-2 block">
                      Code<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <FaListUl />
                      </span>
                      <input
                        type="text"
                        name="coupon.code"
                        value={formik.values.coupon?.code}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.coupon?.code &&
                      formik.errors.coupon?.code && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.coupon?.code}
                        </p>
                      )}
                  </div>

                  {/* Type */}
                  <div>
                    <label className="mb-2 block">
                      Type<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <FaListUl />
                      </span>
                      <Select
                        name="coupon.discount_type"
                        value={
                          discountType.find(
                            (option) =>
                              option.value.toString() ===
                              formik.values.coupon?.discount_type?.toString()
                          ) || null
                        }
                        options={discountType}
                        onChange={(option) =>
                          formik.setFieldValue(
                            "coupon.discount_type",
                            option.value
                          )
                        }
                        onBlur={() =>
                          formik.setFieldTouched("coupon.discount_type", true)
                        }
                        styles={selectIcon}
                        className="!capitalize"
                      />
                    </div>
                    {formik.touched.coupon?.discount_type &&
                      formik.errors.coupon?.discount_type && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.coupon?.discount_type}
                        </p>
                      )}
                  </div>

                  {/* Value Input */}
                  <div>
                    <label className="mb-2 block">
                      Value<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <FaListUl />
                      </span>
                      <input
                        type="number"
                        name="coupon.discount_value"
                        value={formik.values.coupon?.discount_value}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.coupon?.discount_value &&
                      formik.errors.coupon?.discount_value && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.coupon?.discount_value}
                        </p>
                      )}
                  </div>

                  {/* Max Usage */}
                  <div>
                    <label className="mb-2 block">
                      Max Usage<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <FaListUl />
                      </span>
                      <input
                        type="number"
                        name="coupon.max_usage"
                        value={formik.values.coupon.max_usage}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.coupon?.max_usage &&
                      formik.errors.coupon?.max_usage && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.coupon?.max_usage}
                        </p>
                      )}
                  </div>
                  {/* Per User Limit */}
                  <div>
                    <label className="mb-2 block">
                      Per User Limit<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <FaListUl />
                      </span>
                      <input
                        type="number"
                        name="coupon.per_user_limit"
                        value={formik.values.coupon?.per_user_limit}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.coupon?.per_user_limit &&
                      formik.errors.coupon?.per_user_limit && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.coupon?.per_user_limit}
                        </p>
                      )}
                  </div>
                  {/* Position Input */}
                  <div>
                    <label className="mb-2 block">
                      Position<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <FaListUl />
                      </span>
                      <input
                        type="number"
                        name="coupon.position"
                        value={formik.values.coupon?.position}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.coupon?.position &&
                      formik.errors.coupon?.position && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.coupon?.position}
                        </p>
                      )}
                  </div>

                  {/* Start Date Field */}
                  <div>
                    <label className="mb-2 block">
                      Start Date<span className="text-red-500">*</span>
                    </label>
                    <div className="custom--date relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <LuCalendar />
                      </span>
                      <DatePicker
                        selected={
                          formik.values.coupon?.start_date
                            ? new Date(formik.values.coupon?.start_date)
                            : null
                        }
                        onChange={(date) =>
                          formik.setFieldValue(
                            "coupon.start_date",
                            date ? date.toISOString() : ""
                          )
                        }
                        dateFormat="dd-MM-yyyy"
                        minDate={new Date()}
                        className="input--icon"
                      />
                    </div>
                    {formik.touched.coupon?.start_date &&
                      formik.errors.coupon?.start_date && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.coupon?.start_date}
                        </p>
                      )}
                  </div>

                  {/* End Date Field */}
                  <div>
                    <label className="mb-2 block">
                      End Date<span className="text-red-500">*</span>
                    </label>
                    <div className="custom--date relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <LuCalendar />
                      </span>
                      <DatePicker
                        selected={
                          formik.values.coupon?.end_date
                            ? new Date(formik.values.coupon?.end_date)
                            : null
                        }
                        onChange={(date) =>
                          formik.setFieldValue(
                            "coupon.end_date",
                            date ? date.toISOString() : ""
                          )
                        }
                        dateFormat="dd-MM-yyyy"
                        minDate={
                          formik.values.coupon?.start_date
                            ? new Date(formik.values.coupon?.start_date)
                            : new Date()
                        }
                        className="input--icon"
                      />
                    </div>
                    {formik.touched.coupon?.end_date &&
                      formik.errors.coupon?.end_date && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.coupon?.end_date}
                        </p>
                      )}
                  </div>

                  {/* Status Dropdown */}
                  {editingOption && editingOption && (
                    <div>
                      <label className="mb-2 block">Status</label>
                      <div className="relative">
                        <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                          <LuPlug />
                        </span>
                        <Select
                          name="coupon.status"
                          value={
                            statusOptions.find(
                              (opt) =>
                                opt.value === formik.values.coupon?.status
                            ) || null
                          }
                          options={statusOptions}
                          onChange={(option) =>
                            formik.setFieldValue("coupon.status", option.value)
                          }
                          onBlur={() =>
                            formik.setFieldTouched("coupon.status", true)
                          }
                          styles={selectIcon}
                          className="!capitalize"
                        />
                      </div>
                    </div>
                  )}

                  {/* Description Input */}
                  <div className="col-span-3">
                    <label className="mb-2 block">
                      Description<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaListUl className="absolute top-[15px] left-[15px]" />
                      <textarea
                        name="coupon.description"
                        value={formik.values.coupon?.description}
                        onChange={formik.handleChange}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.coupon?.description &&
                      formik.errors.coupon?.description && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.coupon?.description}
                        </p>
                      )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal action buttons */}
            <div className="flex gap-4 py-5 justify-end">
              <button
                type="button"
                onClick={() => {
                  formik.resetForm();
                  setShowModal(false);
                }}
                className="px-4 py-2 bg-transparent border border-gray-400 text-white rounded max-w-[150px] w-full"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white  rounded max-w-[150px] w-full"
              >
                {editingOption ? "Update" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCoupon;
