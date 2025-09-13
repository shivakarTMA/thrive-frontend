import React from "react";
import { IoCloseCircle } from "react-icons/io5";
import { FaListUl } from "react-icons/fa6";
import { LuPlug } from "react-icons/lu";
import Select from "react-select";
import { selectIcon } from "../../Helper/helper";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CreatePackage = ({
  setShowModal,
  editingOption,
  formik,
  handleOverlayClick,
  leadBoxRef,
  serviceOptions,
  packageCategoryOptions,
}) => {
  return (
    <div
      className="bg--blur create--lead--container overflow-auto hide--overflow fixed top-0 left-0 z-[999] w-full bg-black bg-opacity-60 h-full"
      onClick={handleOverlayClick}
    >
      <div
        className="min-h-[70vh] w-[95%] max-w-5xl mx-auto mt-[100px] mb-[100px] container--leadbox rounded-[10px] flex flex-col"
        ref={leadBoxRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-t-[10px] flex gap-3 items-center justify-between py-4 px-4 border-b">
          <h2 className="text-xl font-semibold">
            {editingOption ? "Edit Package" : "Create Package"}
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
                <div className="grid grid-cols-4 gap-4">
                  {/* Name */}
                  <div>
                    <label className="mb-2 block">
                      Name<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <FaListUl />
                      </span>
                      <input
                        type="text"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                  </div>
                  {/* Studio */}
                  <div>
                    <label className="mb-2 block">
                      Studio<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <FaListUl />
                      </span>
                      <Select
                        name="studio_id"
                        value={
                          serviceOptions.find(
                            (opt) => opt.value === formik.values.studio_id
                          ) || null
                        }
                        options={serviceOptions}
                        onChange={(option) =>
                          formik.setFieldValue("studio_id", option.value)
                        }
                        onBlur={() =>
                          formik.setFieldTouched("studio_id", true)
                        }
                        styles={selectIcon}
                      />
                    </div>
                  </div>

                  {/* Service */}
                  <div>
                    <label className="mb-2 block">
                      Service<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <FaListUl />
                      </span>
                      <Select
                        name="service_id"
                        value={
                          serviceOptions.find(
                            (opt) => opt.value === formik.values.service_id
                          ) || null
                        }
                        options={serviceOptions}
                        onChange={(option) =>
                          formik.setFieldValue("service_id", option.value)
                        }
                        onBlur={() =>
                          formik.setFieldTouched("service_id", true)
                        }
                        styles={selectIcon}
                      />
                    </div>
                  </div>

                  {/* Image */}
                  <div>
                    <label className="mb-2 block">Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) formik.setFieldValue("image", file);
                      }}
                      className="custom--input w-full"
                    />
                  </div>

                  {/* Package Type */}
                  <div>
                    <label className="mb-2 block">Package Type</label>
                    <input
                      type="text"
                      name="package_type"
                      value={formik.values.package_type}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="custom--input w-full"
                    />
                  </div>

                  {/* Session Level */}
                  <div>
                    <label className="mb-2 block">Session Level</label>
                    <input
                      type="text"
                      name="session_level"
                      value={formik.values.session_level}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="custom--input w-full"
                    />
                  </div>

                  {/* No of Sessions */}
                  <div>
                    <label className="mb-2 block">No of Sessions</label>
                    <input
                      type="number"
                      name="no_of_sessions"
                      value={formik.values.no_of_sessions}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="custom--input w-full"
                    />
                  </div>

                  {/* Session Duration */}
                  <div>
                    <label className="mb-2 block">Session Duration</label>
                    <input
                      type="text"
                      name="session_duration"
                      value={formik.values.session_duration}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="custom--input w-full"
                    />
                  </div>

                  {/* Session Validity */}
                  <div>
                    <label className="mb-2 block">Session Validity</label>
                    <input
                      type="text"
                      name="session_validity"
                      value={formik.values.session_validity}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="custom--input w-full"
                    />
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="mb-2 block">Start Date</label>
                    <DatePicker
                      selected={
                        formik.values.start_date
                          ? new Date(formik.values.start_date)
                          : null
                      }
                      onChange={(date) =>
                        formik.setFieldValue("start_date", date)
                      }
                      onBlur={() => formik.setFieldTouched("start_date", true)}
                      dateFormat="yyyy-MM-dd"
                      minDate={new Date()} // ✅ block past dates
                      className="custom--input w-full"
                    />
                    {formik.touched.start_date && formik.errors.start_date && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.start_date}
                      </p>
                    )}
                  </div>

                  {/* Start Time */}
                  <div>
                    <label className="mb-2 block">Start Time</label>
                    <DatePicker
                      selected={
                        formik.values.start_time
                          ? new Date(`1970-01-01T${formik.values.start_time}`)
                          : null
                      }
                      onChange={(date) =>
                        formik.setFieldValue(
                          "start_time",
                          date.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        )
                      }
                      onBlur={() => formik.setFieldTouched("start_time", true)}
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={15}
                      timeCaption="Time"
                      dateFormat="HH:mm"
                      className="custom--input w-full"
                      minTime={
                        formik.values.start_date &&
                        new Date(formik.values.start_date).toDateString() ===
                          new Date().toDateString()
                          ? new Date() // ✅ If today, block past times
                          : new Date(0, 0, 0, 0, 0) // ✅ Otherwise allow from midnight
                      }
                      maxTime={new Date(0, 0, 0, 23, 59)} // ✅ Always allow until 23:59
                    />
                    {formik.touched.start_time && formik.errors.start_time && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.start_time}
                      </p>
                    )}
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="mb-2 block">End Date</label>
                    <DatePicker
                      selected={
                        formik.values.end_date
                          ? new Date(formik.values.end_date)
                          : null
                      }
                      onChange={(date) =>
                        formik.setFieldValue("end_date", date)
                      }
                      onBlur={() => formik.setFieldTouched("end_date", true)}
                      dateFormat="yyyy-MM-dd"
                      minDate={
                        formik.values.start_date
                          ? new Date(formik.values.start_date)
                          : new Date()
                      } // ✅ block dates before start_date
                      className="custom--input w-full"
                    />
                    {formik.touched.end_date && formik.errors.end_date && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.end_date}
                      </p>
                    )}
                  </div>

                  {/* Max Capacity */}
                  <div>
                    <label className="mb-2 block">Max Capacity</label>
                    <input
                      type="number"
                      name="max_capacity"
                      value={formik.values.max_capacity}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="custom--input w-full"
                    />
                  </div>

                  {/* Waitlist Capacity */}
                  <div>
                    <label className="mb-2 block">Waitlist Capacity</label>
                    <input
                      type="number"
                      name="waitlist_capacity"
                      value={formik.values.waitlist_capacity}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="custom--input w-full"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="mb-2 block">Tags</label>
                    <input
                      type="text"
                      name="tags"
                      value={formik.values.tags}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="custom--input w-full"
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="mb-2 block">Amount</label>
                    <input
                      type="number"
                      name="amount"
                      value={formik.values.amount}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="custom--input w-full"
                    />
                  </div>

                  {/* Discount */}
                  <div>
                    <label className="mb-2 block">Discount</label>
                    <input
                      type="number"
                      name="discount"
                      value={formik.values.discount}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="custom--input w-full"
                    />
                  </div>

                  {/* GST */}
                  <div>
                    <label className="mb-2 block">GST</label>
                    <input
                      type="number"
                      name="gst"
                      value={formik.values.gst}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="custom--input w-full"
                    />
                  </div>

                  {/* Position */}
                  <div>
                    <label className="mb-2 block">Position</label>
                    <input
                      type="number"
                      name="position"
                      value={formik.values.position}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="custom--input w-full"
                    />
                  </div>

                  {/* Package Category */}
                  <div>
                    <label className="mb-2 block">Package Category</label>
                    <Select
                      name="package_category_id"
                      value={
                        packageCategoryOptions.find(
                          (opt) =>
                            opt.value === formik.values.package_category_id
                        ) || null
                      }
                      options={packageCategoryOptions}
                      onChange={(option) =>
                        formik.setFieldValue(
                          "package_category_id",
                          option.value
                        )
                      }
                      onBlur={() =>
                        formik.setFieldTouched("package_category_id", true)
                      }
                      styles={selectIcon}
                    />
                  </div>

                  {/* Trainer */}
                  <div>
                    <label className="mb-2 block">Trainer ID</label>
                    <input
                      type="text"
                      name="trainer_id"
                      value={formik.values.trainer_id}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="custom--input w-full"
                    />
                  </div>

                  {/* Booking Type */}
                  <div>
                    <label className="mb-2 block">Booking Type</label>
                    <input
                      type="text"
                      name="booking_type"
                      value={formik.values.booking_type}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="custom--input w-full"
                    />
                  </div>

                  {/* Club ID */}
                  <div>
                    <label className="mb-2 block">Club ID</label>
                    <input
                      type="text"
                      name="club_id"
                      value={formik.values.club_id}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="custom--input w-full"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="mb-2 block">Status</label>
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
                    />
                  </div>
                  {/* Caption */}
                  <div className="col-span-2">
                    <label className="mb-2 block">Caption</label>
                    <textarea
                      name="caption"
                      value={formik.values.caption}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="custom--input w-full"
                    />
                  </div>
                  {/* Description */}
                  <div className="col-span-2">
                    <label className="mb-2 block">Description</label>
                    <textarea
                      name="description"
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="custom--input w-full"
                    />
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

export default CreatePackage;
