// Import React
import React, { useEffect } from "react";
// Import close icon
import { IoCloseCircle } from "react-icons/io5";
// Import icons for input fields
import { FaListUl } from "react-icons/fa6";
import Select from "react-select";
// Import custom styles for select input
import { selectIcon } from "../../Helper/helper";
import { toast } from "react-toastify";
import { authAxios } from "../../config/config";
import { LuCalendar } from "react-icons/lu";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// CreateCoupon component
const CreateCoupon = ({
  setShowModal,
  editingOption,
  formik,
  handleOverlayClick,
  leadBoxRef,
}) => {

  const discountType = [
    { label: "Percentage", value: "PERCENTAGE" },
    { label: "Fixed", value: "FIXED" },
  ];

  useEffect(() => {
    if (!editingOption) return;

    const fetchCouponById = async (id) => {
      try {
        const res = await authAxios().get(`/coupon/${id}`);
        const data = res.data?.data || res.data || null;

        if (data) {
          // ✅ Prefill formik fields with fetched data
          formik.setValues({
            id: data.id || "",
            code: data.code || "",
            description: data.description || "",
            discount_type: data.discount_type || "",
            discount_value: data.discount_value || null,
            min_order_amt: data.min_order_amt || null,
            max_user_limit: data.max_user_limit || null,
            start_date: data?.start_date,
            end_date: data?.end_date,
            position: data.position || null,
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
                        name="code"
                        value={formik.values.code}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.code && formik.errors.code && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.code}
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
                        name="discount_type"
                        value={
                          discountType.find(
                            (option) =>
                              option.value.toString() ===
                              formik.values.discount_type?.toString()
                          ) || null
                        }
                        options={discountType}
                        onChange={(option) =>
                          formik.setFieldValue("discount_type", option.value)
                        }
                        onBlur={() =>
                          formik.setFieldTouched("discount_type", true)
                        }
                        styles={selectIcon}
                        className="!capitalize"
                      />
                    </div>
                    {formik.touched.discount_type &&
                      formik.errors.discount_type && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.discount_type}
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
                        name="discount_value"
                        value={formik.values.discount_value}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.discount_value && formik.errors.discount_value && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.discount_value}
                      </p>
                    )}
                  </div>
                  {/* Min Order Amount Input */}
                  <div>
                    <label className="mb-2 block">
                      Min Order Amount
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <FaListUl />
                      </span>
                      <input
                        type="number"
                        name="min_order_amt"
                        value={formik.values.min_order_amt}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.min_order_amt && formik.errors.min_order_amt && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.min_order_amt}
                      </p>
                    )}
                  </div>

                  {/* Max User Limit Input */}
                  <div>
                    <label className="mb-2 block">
                      Max User Limit
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <FaListUl />
                      </span>
                      <input
                        type="number"
                        name="max_user_limit"
                        value={formik.values.max_user_limit}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.max_user_limit && formik.errors.max_user_limit && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.max_user_limit}
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
                        name="position"
                        value={formik.values.position}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.position && formik.errors.position && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.position}
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
                          formik.values.start_date
                            ? new Date(formik.values.start_date)
                            : null
                        }
                        onChange={(date) =>
                          formik.setFieldValue(
                            "start_date",
                            date ? date.toISOString() : ""
                          )
                        }
                        dateFormat="yyyy-MM-dd"
                        minDate={new Date()}
                        className="input--icon"
                      />
                    </div>
                    {formik.touched.start_date && formik.errors.start_date && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.start_date}
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
                          formik.values.end_date
                            ? new Date(formik.values.end_date)
                            : null
                        }
                        onChange={(date) =>
                          formik.setFieldValue(
                            "end_date",
                            date ? date.toISOString() : ""
                          )
                        }
                        dateFormat="yyyy-MM-dd"
                        minDate={
                          formik.values.start_date
                            ? new Date(formik.values.start_date)
                            : new Date()
                        }
                        className="input--icon"
                      />
                    </div>
                    {formik.touched.end_date && formik.errors.end_date && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.end_date}
                      </p>
                    )}
                  </div>

                  {/* Description Input */}
                  <div className="col-span-3">
                    <label className="mb-2 block">
                      Description<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaListUl className="absolute top-[15px] left-[15px]" />
                      <textarea
                        name="description"
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.description &&
                      formik.errors.description && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.description}
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
