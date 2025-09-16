import React, { useEffect, useState } from "react";
import { IoCloseCircle } from "react-icons/io5";
import { FaCalendarDays, FaListUl } from "react-icons/fa6";
import { LuPlug } from "react-icons/lu";
import Select from "react-select";
import { selectIcon } from "../../Helper/helper";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiClock } from "react-icons/fi";

const packageType = [
  { label: "Class", value: "CLASS" },
  { label: "Session", value: "SESSION" },
];

const bookingType = [
  { label: "Free", value: "FREE" },
  { label: "Paid", value: "PAID" },
];

const CreatePackage = ({
  setShowModal,
  editingOption,
  formik,
  handleOverlayClick,
  leadBoxRef,
  serviceOptions,
  studioOptions,
  staffListOptions,
  sessionLevel,
  packageCategoryOptions,
}) => {
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      formik.setFieldValue("image", file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    formik.setFieldValue("image", null);
    setPreview(null);
  };
  useEffect(() => {
    if (formik.values.package_type !== "SESSION") {
      formik.setFieldValue("session_level", "");
      formik.setFieldValue("no_of_sessions", "");
      formik.setFieldValue("session_duration", "");
      formik.setFieldValue("session_validity", "");
    }
  }, [formik.values.package_type]);


    useEffect(() => {
      if (editingOption) {
        formik.setValues({
          id: editingOption.id || "",
          studio_id: editingOption.studio_id || "",
          service_id: editingOption.service_id || "",
          staff_id: editingOption.staff_id || "",
          package_category_id: editingOption.package_category_id || "",
          name: editingOption.name || "",
          caption: editingOption.caption || "",
          description: editingOption.description || "",
          image: editingOption.image || "",
          package_type: editingOption.package_type || "",
          session_level: editingOption.session_level || "",
          no_of_sessions: editingOption.no_of_sessions || "",
          session_duration: editingOption.session_duration || "",
          session_validity: editingOption.session_validity || "",
          start_date: editingOption.start_date || "",
          start_time: editingOption.start_time || "",
          end_time: editingOption.end_time || "",
          max_capacity: editingOption.max_capacity || "",
          waitlist_capacity: editingOption.waitlist_capacity || "",
          tags: editingOption.tags || "",
          amount: editingOption.amount || "",
          discount: editingOption.discount || "",
          gst: editingOption.gst || "",
          position: editingOption.position || "",
          trainer_id: editingOption.trainer_id || "",
          booking_type: editingOption.booking_type || "",
          status: editingOption.status || "ACTIVE",
        });
        if (editingOption.image) {
          // If image is a URL string
          setPreview(editingOption.image);
        } else {
          setPreview(null);
        }
      }
    }, [editingOption]);


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
                  {/* Image */}
                  <div className="row-span-3">
                    <div
                      className={`${
                        preview ? "" : "border-2 border-dashed border-gray-300"
                      } bg-gray-100 rounded-lg ${
                        preview ? "p-0" : "p-6"
                      }text-center relative group hover:border-blue-400 transition-all overflow-hidden h-[260px]`}
                    >
                      {preview ? (
                        <div className="relative h-full">
                          <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-cover object-center"
                          />
                          <button
                            onClick={removeImage}
                            type="button"
                            className="absolute top-2 right-2 bg-red-500 text-white text-sm px-2 py-1 rounded hover:bg-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center text-center justify-center p-6 h-full">
                          <p className="text-gray-500">
                            Drag & drop or click to upload an image
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>
                      )}
                    </div>
                  </div>
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
                     {formik.errors?.name &&
                        formik.touched?.name && (
                          <div className="text-red-500 text-sm">
                            {formik.errors.name}
                          </div>
                        )}
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
                          studioOptions.find(
                            (opt) => opt.value === formik.values.studio_id
                          ) || null
                        }
                        options={studioOptions}
                        onChange={(option) =>
                          formik.setFieldValue("studio_id", option.value)
                        }
                        onBlur={() => formik.setFieldTouched("studio_id", true)}
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
                  {/* Staff */}
                  <div>
                    <label className="mb-2 block">
                      Staff<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <FaListUl />
                      </span>
                      <Select
                        name="staff_id"
                        value={
                          staffListOptions.find(
                            (opt) => opt.value === formik.values.staff_id
                          ) || null
                        }
                        options={staffListOptions}
                        onChange={(option) =>
                          formik.setFieldValue("staff_id", option.value)
                        }
                        onBlur={() => formik.setFieldTouched("staff_id", true)}
                        styles={selectIcon}
                      />
                    </div>
                  </div>

                  {/* Package Category */}
                  <div>
                    <label className="mb-2 block">Package Category</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <FaListUl />
                      </span>
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
                  </div>

                  {/* Package Type */}
                  <div>
                    <label className="mb-2 block">Package Type</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <FaListUl />
                      </span>
                      <Select
                        name="package_type"
                        value={
                          packageType.find(
                            (opt) => opt.value === formik.values.package_type
                          ) || null
                        }
                        options={packageType}
                        onChange={(option) =>
                          formik.setFieldValue("package_type", option.value)
                        }
                        onBlur={() =>
                          formik.setFieldTouched("package_type", true)
                        }
                        styles={selectIcon}
                      />
                    </div>
                  </div>

                  {formik.values?.package_type === "SESSION" && (
                    <>
                      {/* Session Level */}
                      <div>
                        <label className="mb-2 block">Session Level</label>
                        <div className="relative">
                          <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                            <FaListUl />
                          </span>
                          <Select
                            name="session_level"
                            value={
                              sessionLevel.find(
                                (opt) =>
                                  opt.value === formik.values.session_level
                              ) || null
                            }
                            options={sessionLevel}
                            onChange={(option) =>
                              formik.setFieldValue(
                                "session_level",
                                option.value
                              )
                            }
                            onBlur={() =>
                              formik.setFieldTouched("session_level", true)
                            }
                            styles={selectIcon}
                          />
                        </div>
                      </div>

                      {/* No of Sessions */}
                      <div>
                        <label className="mb-2 block">No of Sessions</label>
                        <div className="relative">
                          <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                            <FaListUl />
                          </span>
                          <input
                            type="number"
                            name="no_of_sessions"
                            value={formik.values.no_of_sessions}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="custom--input w-full input--icon"
                          />
                        </div>
                      </div>

                      {/* Session Duration */}
                      <div>
                        <label className="mb-2 block">Session Duration</label>
                        <div className="relative">
                          <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                            <FaListUl />
                          </span>
                          <input
                            type="number"
                            name="session_duration"
                            value={formik.values.session_duration}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="custom--input w-full input--icon"
                          />
                        </div>
                      </div>

                      {/* Session Validity */}
                      <div>
                        <label className="mb-2 block">
                          Session Validity <span className="">Days</span>
                        </label>
                        <div className="relative">
                          <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                            <FaListUl />
                          </span>
                          <input
                            type="number"
                            name="session_validity"
                            value={formik.values.session_validity}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="custom--input w-full input--icon"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Start Date Field */}
                  <div>
                    <label className="mb-2 block">Start Date</label>
                    <div className="custom--date relative">
                      {/* Calendar Icon */}
                      <span className="absolute z-[1] mt-[15px] ml-[15px]">
                        <FaCalendarDays />
                      </span>
                      <DatePicker
                        selected={
                          formik.values.start_date
                            ? new Date(formik.values.start_date) // ✅ Ensure valid Date object
                            : null
                        }
                        onChange={
                          (date) =>
                            formik.setFieldValue(
                              "start_date",
                              date.toISOString().split("T")[0]
                            ) // ✅ Save as YYYY-MM-DD
                        }
                        onBlur={() =>
                          formik.setFieldTouched("start_date", true)
                        }
                        dateFormat="yyyy-MM-dd"
                        minDate={new Date()} // ✅ Prevent selecting past dates
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {/* Display validation error if any */}
                    {formik.touched.start_date && formik.errors.start_date && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.start_date}
                      </p>
                    )}
                  </div>

                  {/* Start Time Field */}
                  <div>
                    <label className="mb-2 block">Start Time</label>
                    <div className="custom--date relative">
                      {/* Clock Icon */}
                      <span className="absolute z-[1] mt-[15px] ml-[15px]">
                        <FiClock />
                      </span>
                      <DatePicker
                        selected={
                          formik.values.start_time
                            ? new Date(`1970-01-01T${formik.values.start_time}`) // ✅ Convert string to Date
                            : null
                        }
                        onChange={(date) =>
                          formik.setFieldValue(
                            "start_time",
                            date.toLocaleTimeString([], {
                              hour12: false, // ✅ Ensure 24-hour format
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          )
                        }
                        onBlur={() =>
                          formik.setFieldTouched("start_time", true)
                        }
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        timeCaption="Time"
                        dateFormat="HH:mm"
                        className="custom--input w-full input--icon"
                        minTime={
                          formik.values.start_date &&
                          new Date(formik.values.start_date).toDateString() ===
                            new Date().toDateString()
                            ? new Date() // ✅ Block past times if selected date is today
                            : new Date(0, 0, 0, 0, 0)
                        }
                        maxTime={new Date(0, 0, 0, 23, 59)}
                      />
                    </div>
                    {/* Display validation error if any */}
                    {formik.touched.start_time && formik.errors.start_time && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.start_time}
                      </p>
                    )}
                  </div>

                  {/* End Time Field */}
                  <div>
                    <label className="mb-2 block">End Time</label>
                    <div className="custom--date relative">
                      {/* Clock Icon */}
                      <span className="absolute z-[1] mt-[15px] ml-[15px]">
                        <FiClock />
                      </span>
                      <DatePicker
                        selected={
                          formik.values.end_time
                            ? new Date(`1970-01-01T${formik.values.end_time}`) // ✅ Convert string to Date
                            : null
                        }
                        onChange={(date) =>
                          formik.setFieldValue(
                            "end_time",
                            date.toLocaleTimeString([], {
                              hour12: false, // ✅ Ensure 24-hour format
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          )
                        }
                        onBlur={() => formik.setFieldTouched("end_time", true)}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        timeCaption="Time"
                        dateFormat="HH:mm"
                        className="custom--input w-full input--icon"
                        minTime={
                          formik.values.start_date &&
                          new Date(formik.values.start_date).toDateString() ===
                            new Date().toDateString()
                            ? new Date() // ✅ Block past times if selected date is today
                            : new Date(0, 0, 0, 0, 0)
                        }
                        maxTime={new Date(0, 0, 0, 23, 59)}
                      />
                    </div>
                    {/* Display validation error if any */}
                    {formik.touched.end_time && formik.errors.end_time && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.end_time}
                      </p>
                    )}
                  </div>

                  {/* Max Capacity */}
                  <div>
                    <label className="mb-2 block">Max Capacity</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <FaListUl />
                      </span>
                      <input
                        type="number"
                        name="max_capacity"
                        value={formik.values.max_capacity}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                  </div>

                  {/* Waitlist Capacity */}
                  <div>
                    <label className="mb-2 block">Waitlist Capacity</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <FaListUl />
                      </span>
                      <input
                        type="number"
                        name="waitlist_capacity"
                        value={formik.values.waitlist_capacity}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="mb-2 block">Tags</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <FaListUl />
                      </span>
                      <input
                        type="text"
                        name="tags"
                        value={formik.values.tags}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="mb-2 block">Amount (₹)</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
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
                  </div>

                  {/* Discount */}
                  <div>
                    <label className="mb-2 block">Discount (₹)</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
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
                  </div>

                  {/* GST */}
                  <div>
                    <label className="mb-2 block">GST (%)</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
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
                  </div>

                  {/* Position */}
                  <div>
                    <label className="mb-2 block">Position</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
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
                  </div>

                  {/* Trainer */}
                  <div>
                    <label className="mb-2 block">Trainer ID</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <FaListUl />
                      </span>
                      <Select
                        name="trainer_id"
                        value={
                          staffListOptions.find(
                            (opt) => opt.value === formik.values.trainer_id
                          ) || null
                        }
                        options={staffListOptions}
                        onChange={(option) =>
                          formik.setFieldValue("trainer_id", option.value)
                        }
                        onBlur={() =>
                          formik.setFieldTouched("trainer_id", true)
                        }
                        styles={selectIcon}
                      />
                    </div>
                  </div>

                  {/* Booking Type */}
                  <div>
                    <label className="mb-2 block">Booking Type</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <FaListUl />
                      </span>
                      <Select
                        name="booking_type"
                        value={
                          bookingType.find(
                            (opt) => opt.value === formik.values.booking_type
                          ) || null
                        }
                        options={bookingType}
                        onChange={(option) =>
                          formik.setFieldValue("booking_type", option.value)
                        }
                        onBlur={() =>
                          formik.setFieldTouched("booking_type", true)
                        }
                        styles={selectIcon}
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="mb-2 block">Status</label>
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
                      />
                    </div>
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
                      rows={1}
                    />
                  </div>
                  {/* Description */}
                  <div className="col-span-4">
                    <label className="mb-2 block">Description</label>
                    <textarea
                      name="description"
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="custom--input w-full"
                      rows={3}
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
