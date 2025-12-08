import React, { useEffect } from "react";
import { IoCalendarClearOutline, IoCloseCircle } from "react-icons/io5";
import { FaListUl } from "react-icons/fa6";
import { LuPlug } from "react-icons/lu";
import Select from "react-select";
import { selectIcon } from "../../Helper/helper";
import { authAxios } from "../../config/config";
import { toast } from "react-toastify";

const subscriptionOption = [
  { label: "Yes", value: true },
  { label: "No", value: false },
];

const CreateSubscriptionPlan = ({
  setShowModal,
  editingOption,
  formik,
  handleOverlayClick,
  leadBoxRef,
  clubOptions,
}) => {
  useEffect(() => {
    const fetchSubscriptionById = async (id) => {
      try {
        const res = await authAxios().get(`/subscription-plan/${id}`);
        const data = res.data?.data || res.data || null;
        console.log(data, "SHIVAKAR");

        if (data) {
          formik.setValues({
            title: data?.title || "",
            description: data?.description || "",
            club_id: data?.club_id || "",
            duration_type: data?.duration_type || "",
            duration_value: data?.duration_value || "",
            booking_type: data?.booking_type || "",
            plan_type: data?.plan_type || "",
            hsn_sac_code: data?.hsn_sac_code || "",
            amount: data?.amount || "",
            discount: data?.discount || "",
            gst: data?.gst || "",
            earn_coin: data?.earn_coin || "",
            is_spouse_plan: data?.is_spouse_plan || false,
            status: data?.status || "ACTIVE",
            position: data?.position || "",
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch subscription details");
      }
    };

    if (editingOption) {
      fetchSubscriptionById(editingOption);
    }
  }, [editingOption]);

  return (
    <div
      className="bg--blur create--lead--container overflow-auto hide--overflow fixed top-0 left-0 z-[999] w-full bg-black bg-opacity-60 h-full"
      onClick={handleOverlayClick}
    >
      <div
        className="min-h-[70vh] w-[95%] max-w-4xl mx-auto mt-[50px] mb-[50px] container--leadbox rounded-[10px] flex flex-col"
        ref={leadBoxRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-t-[10px] flex gap-3 items-center justify-between py-4 px-4 border-b">
          <h2 className="text-xl font-semibold">
            {editingOption ? "Edit On Plan" : "Create On Plan"}
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

        <div className="flex-1">
          <form onSubmit={formik.handleSubmit} className="p-0 space-y-0">
            <div className="flex bg-white rounded-b-[10px]">
              <div className="p-6 flex-1">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="mb-2 block">
                      Title<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <FaListUl />
                      </span>
                      <input
                        type="text"
                        name="title"
                        value={formik.values.title}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.title && formik.errors.title && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.title}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-2 block">
                      Description<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <FaListUl />
                      </span>
                      <input
                        type="text"
                        name="description"
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.description &&
                      formik.errors.description && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.description}
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="mb-2 block">
                      Club<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <FaListUl />
                      </span>
                      <Select
                        name="club_id"
                        value={
                          clubOptions.find(
                            (option) => option.value === formik.values.club_id
                          ) || null
                        }
                        options={clubOptions}
                        onChange={(option) =>
                          formik.setFieldValue("club_id", option.value)
                        }
                        onBlur={() => formik.setFieldTouched("club_id", true)}
                        styles={selectIcon}
                        className="!capitalize"
                      />
                    </div>
                    {formik.touched.club_id && formik.errors.club_id && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.club_id}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block">
                      Duration Type<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <LuPlug />
                      </span>
                      <Select
                        name="duration_type"
                        value={{
                          label: formik.values.duration_type,
                          value: formik.values.duration_type,
                        }}
                        options={[
                          { label: "Day", value: "DAY" },
                          { label: "Week", value: "WEEK" },
                          { label: "Month", value: "MONTH" },
                          { label: "Year", value: "YEAR" },
                        ]}
                        onChange={(option) =>
                          formik.setFieldValue("duration_type", option.value)
                        }
                        onBlur={() =>
                          formik.setFieldTouched("duration_type", true)
                        }
                        styles={selectIcon}
                        className="!capitalize"
                      />
                    </div>
                    {formik.touched.duration_type &&
                      formik.errors.duration_type && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.duration_type}
                        </p>
                      )}
                  </div>

                  <div className="">
                    <label className="mb-2 block">
                      Duration Value<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <IoCalendarClearOutline />
                      </span>
                      <input
                        type="number"
                        name="duration_value"
                        value={formik.values.duration_value}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.duration_value &&
                      formik.errors.duration_value && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.duration_value}
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="mb-2 block">
                      Booking Type<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <LuPlug />
                      </span>
                      <Select
                        name="booking_type"
                        value={{
                          label: formik.values.booking_type,
                          value: formik.values.booking_type,
                        }}
                        options={[
                          { label: "Free", value: "FREE" },
                          { label: "Paid", value: "PAID" },
                        ]}
                        onChange={(option) =>
                          formik.setFieldValue("booking_type", option.value)
                        }
                        onBlur={() =>
                          formik.setFieldTouched("booking_type", true)
                        }
                        styles={selectIcon}
                        className="!capitalize"
                      />
                    </div>
                    {formik.touched.booking_type &&
                      formik.errors.booking_type && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.booking_type}
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="mb-2 block">
                      Plan Type<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <FaListUl />
                      </span>
                      <Select
                        name="plan_type"
                        value={{
                          label: formik.values.plan_type,
                          value: formik.values.plan_type,
                        }}
                        options={[
                          { label: "DLF", value: "DLF" },
                          { label: "NONDLF", value: "NONDLF" },
                        ]}
                        onChange={(option) =>
                          formik.setFieldValue("plan_type", option.value)
                        }
                        onBlur={() => formik.setFieldTouched("plan_type", true)}
                        styles={selectIcon}
                        className="!capitalize"
                      />
                    </div>
                    {formik.touched.plan_type && formik.errors.plan_type && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.plan_type}
                      </p>
                    )}
                  </div>

                  <div className="">
                    <label className="mb-2 block">HSN SAC Code</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <FaListUl />
                      </span>
                      <input
                        type="text"
                        name="hsn_sac_code"
                        value={formik.values.hsn_sac_code}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.hsn_sac_code &&
                      formik.errors.hsn_sac_code && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.hsn_sac_code}
                        </p>
                      )}
                  </div>

                  <div className="">
                    <label className="mb-2 block">
                      Amount (₹)<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <FaListUl />
                      </span>
                      <input
                        type="number"
                        name="amount"
                        value={formik.values.amount}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.amount && formik.errors.amount && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.amount}
                      </p>
                    )}
                  </div>
                  <div className="">
                    <label className="mb-2 block">
                      Discount (₹)<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <FaListUl />
                      </span>
                      <input
                        type="number"
                        name="discount"
                        value={formik.values.discount}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.discount && formik.errors.discount && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.discount}
                      </p>
                    )}
                  </div>

                  <div className="">
                    <label className="mb-2 block">
                      GST (%)<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <FaListUl />
                      </span>
                      <input
                        type="number"
                        name="gst"
                        value={formik.values.gst}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.gst && formik.errors.gst && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.gst}
                      </p>
                    )}
                  </div>

                  <div className="">
                    <label className="mb-2 block">
                      Earn Coins<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <FaListUl />
                      </span>
                      <input
                        type="number"
                        name="earn_coin"
                        value={formik.values.earn_coin}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.earn_coin && formik.errors.earn_coin && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.earn_coin}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block">Is Spouse Plan</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <LuPlug />
                      </span>

                      <Select
                        name="is_spouse_plan"
                        value={
                          subscriptionOption.find(
                            (opt) => opt.value === formik.values?.is_spouse_plan
                          ) || null
                        }
                        options={subscriptionOption}
                        onChange={(option) =>
                          formik.setFieldValue("is_spouse_plan", option.value)
                        }
                        onBlur={() =>
                          formik.setFieldTouched("is_spouse_plan", true)
                        }
                        styles={selectIcon}
                      />
                    </div>
                    {formik.touched.is_spouse_plan &&
                      formik.errors.is_spouse_plan && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.is_spouse_plan}
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="mb-2 block">
                      Status<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <LuPlug />
                      </span>
                      <Select
                        name="status"
                        value={{
                          label: formik.values.status,
                          value: formik.values.status,
                        }}
                        options={[
                          { label: "Active", value: "ACTIVE" },
                          { label: "Inactive", value: "INACTIVE" },
                        ]}
                        onChange={(option) =>
                          formik.setFieldValue("status", option.value)
                        }
                        onBlur={() => formik.setFieldTouched("status", true)}
                        styles={selectIcon}
                        className="!capitalize"
                      />
                    </div>
                    {formik.touched.status && formik.errors.status && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.status}
                      </p>
                    )}
                  </div>

                  <div className="">
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
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 py-5 justify-end">
              <button
                type="button"
                onClick={() => {
                  formik.resetForm();
                  setShowModal(false);
                }}
                className="px-4 py-2 bg-transparent border border-white text-white font-semibold rounded max-w-[150px] w-full"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-white text-black font-semibold rounded max-w-[150px] w-full"
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

export default CreateSubscriptionPlan;
