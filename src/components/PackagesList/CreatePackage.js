import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { FiClock, FiPlus, FiTrash2 } from "react-icons/fi";
import { IoCloseCircle } from "react-icons/io5";
import Select from "react-select";
import { customStyles } from "../../Helper/helper";
import DatePicker from "react-datepicker"; // Date picker component
import "react-datepicker/dist/react-datepicker.css"; // Date picker styles
import { FaCalendarDays } from "react-icons/fa6";
import CreatableSelect from "react-select/creatable";

// Booking type options for dropdown
const bookingType = [
  { label: "Yes", value: "Yes" },
  { label: "No", value: "No" },
];

const CreatePackage = ({
  setShowModal,
  editingOption,
  handleOverlayClick,
  leadBoxRef,
  serviceOptions,
  packageCategoryOptions,
  staffListOptions,
  studioOptions,
  sessionLevel,
}) => {
  const [sessionRows, setSessionRows] = useState([{ id: 1 }]);

  // 🔍 Helper function to get service_type
  const getServiceType = (service_id, serviceOptions) => {
    const found = serviceOptions.find((s) => s.value === service_id);
    return found?.service_type || null;
  };

  // ✅ Dynamic Yup validation schema
  const getValidationSchema = (serviceOptions) =>
    Yup.lazy((values) => {
      const service_type = getServiceType(values.service_id, serviceOptions);

      let schema = {
        image: Yup.mixed()
          .required("Image is required")
          .test(
            "fileType",
            "Only JPG, PNG or WEBP files are allowed",
            (value) => {
              if (!value) return false;
              return ["image/jpeg", "image/png", "image/webp"].includes(
                value.type
              );
            }
          )
          .test("fileSize", "File size must be less than 2 MB", (value) => {
            if (!value) return false;
            return value.size <= 2 * 1024 * 1024;
          }),

        service_id: Yup.number().required("Service is required"),
        package_name: Yup.string().required("Name is required"),
        description: Yup.string().required("Description is required"),
      };

      if (service_type === "CLASS") {
        schema = {
          ...schema,
          package_category_id: Yup.number().required("Category is required"),
          staff_id: Yup.number().required("Staff is required"),
          start_date: Yup.string().required("Start Date is required"),
          start_time: Yup.string().required("Start Time is required"),
          duration: Yup.number()
            .required("Duration is required")
            .min(1, "Must be at least 1"),
          studio_id: Yup.number().required("Studio is required"),
          max_capacity: Yup.number()
            .required("Capacity is required")
            .min(1, "Must be at least 1"),
          waitlist_capacity: Yup.number()
            .required("Waitlist is required")
            .min(1, "Must be at least 1"),
          tags: Yup.array()
            .of(
              Yup.object().shape({
                label: Yup.string().required(),
                value: Yup.string().required(),
              })
            )
            .min(1, "Please add at least one tag"),
          booking_type: Yup.string().required("Booking type is required"),
        };

        if (values.booking_type === "Yes") {
          schema.amount = Yup.number().required("Amount is required");
          schema.gst = Yup.number().required("GST is required");
          schema.thrive_coins = Yup.number().required("Thrive coins required");
        }
      }

      if (service_type === "SESSION") {
        schema = {
          ...schema,
          session_duration: Yup.number().required(
            "Session duration is required"
          ),
          session_level: Yup.string().required("Session level is required"),
          session_validity: Yup.number().required("Validity is required"),
          session_list: Yup.array().of(
            Yup.object().shape({
              no_of_sessions: Yup.number()
                .required("No of sessions is required")
                .min(1, "Must be at least 1"),
              session_duration: Yup.number()
                .required("Amount is required")
                .min(1, "Must be at least 1"),
              amount: Yup.number()
                .required("Amount is required")
                .min(0, "Must be 0 or more"),
              thrive_coins: Yup.number()
                .required("Thrive coins are required")
                .min(0, "Must be 0 or more"),
              gst: Yup.number()
                .required("GST is required")
                .min(0, "Must be 0 or more"),
            })
          ),
        };
      }

      return Yup.object(schema);
    });

  // ✅ Formik Setup
  const formik = useFormik({
    initialValues: {
      image: null,
      package_name: "",
      service_id: 1,
      package_category_id: null,
      staff_id: null,
      start_date: "",
      start_time: "",
      duration: "",
      studio_id: null,
      max_capacity: "",
      waitlist_capacity: "",
      tags: [],
      booking_type: "",
      session_duration: "",
      session_level: null,
      amount: "",
      session_validity: "",
      gst: "",
      thrive_coins: "",
      session_list: [
        {
          no_of_sessions: "",
          session_duration: "",
          amount: "",
          thrive_coins: "",
          gst: "",
        },
      ],
      description: "",
    },
    validationSchema: getValidationSchema(serviceOptions),
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: (values) => {
      console.log("✅ Form Submitted:", values);
    },
  });

  // ✅ Reset fields except image when service_id changes
  useEffect(() => {
    if (formik.values.service_id) {
      formik.setValues((prev) => ({
        ...prev,
        package_name: "",
        package_category_id: null,
        staff_id: null,
        start_date: "",
        start_time: "",
        duration: "",
        studio_id: null,
        max_capacity: "",
        waitlist_capacity: "",
        tags: [],
        booking_type: "",
        session_duration: "",
        session_level: null,
        amount: "",
        session_validity: "",
        gst: "",
        thrive_coins: "",
        session_list: [
          {
            no_of_sessions: "",
            session_duration: "",
            thrive_coins: "",
            amount: "",
            gst: "",
          },
        ],
        description: "",
      }));
    }
  }, [formik.values.service_id]);

  const service_type_check = getServiceType(
    formik.values?.service_id,
    serviceOptions
  );

  // ✅ Session row handlers
  const handleAddSessionRow = () => {
    setSessionRows([...sessionRows, { id: Date.now() }]);
  };

  const handleDeleteSessionRow = (index) => {
    setSessionRows((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle image file change and set preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      formik.setFieldValue("image", file); // ✅ store file in Formik state
    }
  };

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
        {/* Header */}
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

        {/* Form */}
        <div className="flex-1">
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div className="flex bg-white rounded-b-[10px]">
              <div className="p-6 flex-1">
                <div className="grid grid-cols-4 gap-4">
                  {/* Image Upload */}
                  <div>
                    <label className="mb-2 block">
                      Image<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        name="image"
                        onChange={handleFileChange} // ✅ no value prop here
                        onBlur={() => formik.setFieldTouched("image", true)}
                        className="custom--input w-full"
                      />
                    </div>
                    {(formik.submitCount > 0 || formik.touched.image) &&
                      formik.errors.image && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.image}
                        </p>
                      )}
                  </div>
                  {/* Service ID */}
                  <div>
                    <label className="mb-2 block">Service</label>
                    <Select
                      name="service_id"
                      value={
                        serviceOptions.find(
                          (opt) => opt.value === formik.values.service_id
                        ) || null
                      }
                      options={serviceOptions}
                      onChange={(option) => {
                        formik.setFieldValue("service_id", option.value);
                      }}
                      onBlur={() => formik.setFieldTouched("service_id", true)}
                      styles={customStyles}
                    />
                    {(formik.submitCount > 0 || formik.touched.service_id) &&
                      formik.errors.service_id && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.service_id}
                        </p>
                      )}
                  </div>

                  {service_type_check !== "CLASS" ? null : (
                    <div>
                      <label className="mb-2 block">Category</label>

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
                          styles={customStyles}
                        />
                      {(formik.submitCount > 0 ||
                        formik.touched.package_category_id) &&
                        formik.errors.package_category_id && (
                          <p className="text-red-500 text-sm">
                            {formik.errors.package_category_id}
                          </p>
                        )}
                    </div>
                  )}

                  {/* Name */}
                  <div>
                    <label className="mb-2 block">
                      Name<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="package_name"
                        value={formik.values.package_name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full"
                      />
                    </div>
                    {(formik.submitCount > 0 || formik.touched.package_name) &&
                      formik.errors.package_name && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.package_name}
                        </p>
                      )}
                  </div>


                  {/* Staff Dropdown */}
                  {service_type_check !== "CLASS" ? null : (
                    <div>
                      <label className="mb-2 block">
                        Staff<span className="text-red-500">*</span>
                      </label>
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
                        styles={customStyles}
                      />
                      {(formik.submitCount > 0 || formik.touched.staff_id) &&
                        formik.errors.staff_id && (
                          <p className="text-red-500 text-sm">
                            {formik.errors.staff_id}
                          </p>
                        )}
                    </div>
                  )}

                  {/* Start Date Field */}
                  {service_type_check !== "CLASS" ? null : (
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
                      {(formik.submitCount > 0 || formik.touched.start_date) &&
                        formik.errors.start_date && (
                          <p className="text-red-500 text-sm">
                            {formik.errors.start_date}
                          </p>
                        )}
                    </div>
                  )}

                  {/* Start Time Field */}
                  {service_type_check !== "CLASS" ? null : (
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
                              ? new Date(
                                  `1970-01-01T${formik.values.start_time}`
                                ) // ✅ Convert string to Date
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
                            new Date(
                              formik.values.start_date
                            ).toDateString() === new Date().toDateString()
                              ? new Date() // ✅ Block past times if selected date is today
                              : new Date(0, 0, 0, 0, 0)
                          }
                          maxTime={new Date(0, 0, 0, 23, 59)}
                        />
                      </div>
                      {/* Display validation error if any */}
                      {(formik.submitCount > 0 || formik.touched.start_time) &&
                        formik.errors.start_time && (
                          <p className="text-red-500 text-sm">
                            {formik.errors.start_time}
                          </p>
                        )}
                    </div>
                  )}

                  {/* Duration */}
                  {service_type_check !== "CLASS" ? null : (
                    <div>
                      <label className="mb-2 block">Duration</label>
                      <div className="relative">
                        <input
                          type="number"
                          name="duration"
                          value={formik.values.duration}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="custom--input w-full"
                        />
                      </div>
                      {(formik.submitCount > 0 || formik.touched.duration) &&
                        formik.errors.duration && (
                          <p className="text-red-500 text-sm">
                            {formik.errors.duration}
                          </p>
                        )}
                    </div>
                  )}

                  {/* Studio Dropdown */}
                  {service_type_check !== "CLASS" ? null : (
                    <div>
                      <label className="mb-2 block">
                        Studio<span className="text-red-500">*</span>
                      </label>
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
                        styles={customStyles}
                      />
                      {(formik.submitCount > 0 || formik.touched.studio_id) &&
                        formik.errors.studio_id && (
                          <p className="text-red-500 text-sm">
                            {formik.errors.studio_id}
                          </p>
                        )}
                    </div>
                  )}

                  {/* Max Capacity */}
                  {service_type_check !== "CLASS" ? null : (
                    <div>
                      <label className="mb-2 block">Capacity</label>
                      <div className="relative">
                        <input
                          type="number"
                          name="max_capacity"
                          value={formik.values.max_capacity}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="custom--input w-full"
                        />
                      </div>
                      {(formik.submitCount > 0 ||
                        formik.touched.max_capacity) &&
                        formik.errors.max_capacity && (
                          <p className="text-red-500 text-sm">
                            {formik.errors.max_capacity}
                          </p>
                        )}
                    </div>
                  )}

                  {/* Waitlist Capacity */}
                  {service_type_check !== "CLASS" ? null : (
                    <div>
                      <label className="mb-2 block">Waitlist</label>
                      <div className="relative">
                        <input
                          type="number"
                          name="waitlist_capacity"
                          value={formik.values.waitlist_capacity}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="custom--input w-full"
                        />
                      </div>
                      {(formik.submitCount > 0 ||
                        formik.touched.waitlist_capacity) &&
                        formik.errors.waitlist_capacity && (
                          <p className="text-red-500 text-sm">
                            {formik.errors.waitlist_capacity}
                          </p>
                        )}
                    </div>
                  )}

                  {/* Tags */}
                  {service_type_check !== "CLASS" ? null : (
                    <div>
                      <label className="mb-2 block">Tags</label>
                      <div className="relative">
                        <CreatableSelect
                          isMulti
                          value={formik.values.tags}
                          onChange={(newValue) => {
                            // ✅ Remove extra quotes from value and label
                            const cleaned = newValue.map((tag) => ({
                              label: tag.label.replace(/"/g, ""),
                              value: tag.value.replace(/"/g, ""),
                            }));
                            formik.setFieldValue("tags", cleaned);
                          }}
                          placeholder="Add Tags"
                          getOptionLabel={(e) => e.label}
                          getOptionValue={(e) => e.value}
                          styles={customStyles}
                          className="multi--select"
                        />

                        {(formik.submitCount > 0 || formik.touched.tags) &&
                          formik.errors.tags && (
                            <p className="text-red-500 text-sm">
                              {formik.errors.tags}
                            </p>
                          )}
                      </div>
                    </div>
                  )}

                  {/* Booking Type */}
                  {service_type_check !== "CLASS" ? null : (
                    <div>
                      <label className="mb-2 block">Paid</label>
                      <div className="relative">
                        <Select
                          name="booking_type"
                          value={
                            bookingType.find(
                              (opt) => opt.value === formik.values?.booking_type
                            ) || null
                          }
                          options={bookingType}
                          onChange={(option) =>
                            formik.setFieldValue("booking_type", option.value)
                          }
                          onBlur={() =>
                            formik.setFieldTouched("booking_type", true)
                          }
                          styles={customStyles}
                        />
                      </div>
                      {(formik.submitCount > 0 ||
                        formik.touched.booking_type) &&
                        formik.errors.booking_type && (
                          <p className="text-red-500 text-sm">
                            {formik.errors.booking_type}
                          </p>
                        )}
                    </div>
                  )}

                  {/* Session Duration */}
                  {service_type_check !== "CLASS" ? (
                    <div>
                      <label className="mb-2 block">
                        Session Duration{" "}
                        <span className="text-sm">(In Mins)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="session_duration"
                          value={formik.values.session_duration}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="custom--input w-full"
                        />
                      </div>
                      {(formik.submitCount > 0 ||
                        formik.touched.session_duration) &&
                        formik.errors.session_duration && (
                          <p className="text-red-500 text-sm">
                            {formik.errors.session_duration}
                          </p>
                        )}
                    </div>
                  ) : null}

                  {/* Level */}
                  {service_type_check !== "CLASS" ? (
                    <div>
                      <label className="mb-2 block">Level</label>
                      <div className="relative">
                        <Select
                          name="session_level"
                          value={
                            sessionLevel.find(
                              (opt) => opt.value === formik.values.session_level
                            ) || null
                          }
                          options={sessionLevel}
                          onChange={(option) =>
                            formik.setFieldValue("session_level", option.value)
                          }
                          onBlur={() =>
                            formik.setFieldTouched("session_level", true)
                          }
                          styles={customStyles}
                        />
                      </div>
                      {(formik.submitCount > 0 ||
                        formik.touched.session_level) &&
                        formik.errors.session_level && (
                          <p className="text-red-500 text-sm">
                            {formik.errors.session_level}
                          </p>
                        )}
                    </div>
                  ) : null}

                  {/* Validity */}
                  {service_type_check !== "CLASS" ? (
                    <div>
                      <label className="mb-2 block">
                        Validity <span className="text-sm">(In Days)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="session_validity"
                          value={formik.values.session_validity}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="custom--input w-full"
                        />
                      </div>
                      {(formik.submitCount > 0 ||
                        formik.touched.session_validity) &&
                        formik.errors.session_validity && (
                          <p className="text-red-500 text-sm">
                            {formik.errors.session_validity}
                          </p>
                        )}
                    </div>
                  ) : null}

                  {formik.values?.booking_type === "Yes" && (
                    <div>
                      <label className="mb-2 block">Amount (₹)</label>
                      <div className="relative">
                        <input
                          type="number"
                          name="amount"
                          value={formik.values.amount}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="custom--input w-full"
                        />
                      </div>
                      {(formik.submitCount > 0 || formik.touched.amount) &&
                        formik.errors.amount && (
                          <p className="text-red-500 text-sm">
                            {formik.errors.amount}
                          </p>
                        )}
                    </div>
                  )}

                  {formik.values?.booking_type === "Yes" && (
                    <div>
                      <label className="mb-2 block">
                        GST <span>(%)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="gst"
                          value={formik.values.gst}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="custom--input w-full"
                        />
                      </div>
                      {(formik.submitCount > 0 || formik.touched.gst) &&
                        formik.errors.gst && (
                          <p className="text-red-500 text-sm">
                            {formik.errors.gst}
                          </p>
                        )}
                    </div>
                  )}

                  {formik.values?.booking_type === "Yes" && (
                    <div>
                      <label className="mb-2 block">Thrive Coins</label>
                      <input
                        type="number"
                        name="thrive_coins"
                        value={formik.values.thrive_coins}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full"
                      />

                      {(formik.submitCount > 0 ||
                        formik.touched.thrive_coins) &&
                        formik.errors.thrive_coins && (
                          <p className="text-red-500 text-sm">
                            {formik.errors.thrive_coins}
                          </p>
                        )}
                    </div>
                  )}
                </div>

                {service_type_check !== "CLASS" && (
                    <div className="col-span-4 space-y-3">
                      {sessionRows.map((row, index) => (
                        <React.Fragment key={index}>
                          <div className="flex items-end gap-4 border-2 border-dashed border-gray-300 bg-gray-100 rounded-lg p-6 mt-5">
                            <div className="grid grid-cols-5 gap-5">
                              {/* No of Sessions */}
                              <div>
                                <label className="mb-2 block">
                                  No. of Sessions
                                </label>
                                <input
                                  type="number"
                                  name={`session_list[${index}].no_of_sessions`}
                                  value={
                                    formik.values.session_list[index]
                                      ?.no_of_sessions || ""
                                  }
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                  className="custom--input w-full"
                                />
                                {formik.touched.session_list?.[index]
                                  ?.no_of_sessions &&
                                  formik.errors.session_list?.[index]
                                    ?.no_of_sessions && (
                                    <p className="text-red-500 text-sm">
                                      {
                                        formik.errors.session_list[index]
                                          .no_of_sessions
                                      }
                                    </p>
                                  )}
                              </div>

                              {/* Session Duration */}
                              <div>
                                <label className="mb-2 block">Session Duration</label>
                                <input
                                  type="number"
                                  name={`session_list[${index}].session_duration`}
                                  value={
                                    formik.values.session_list[index]
                                      ?.session_duration || ""
                                  }
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                  className="custom--input w-full"
                                />
                                {formik.touched.session_list?.[index]
                                  ?.session_duration &&
                                  formik.errors.session_list?.[index]
                                    ?.session_duration && (
                                    <p className="text-red-500 text-sm">
                                      {
                                        formik.errors.session_list[index]
                                          .session_duration
                                      }
                                    </p>
                                  )}
                              </div>

                              {/* GST */}
                              <div>
                                <label className="mb-2 block">
                                  Amount <span>(₹)</span>
                                </label>
                                <div className="relative">
                                  <input
                                    type="number"
                                    name={`session_list[${index}].amount`}
                                    value={
                                      formik.values.session_list[index]
                                        ?.amount || ""
                                    }
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="custom--input w-full"
                                  />
                                </div>
                                {formik.touched.session_list?.[index]?.amount &&
                                  formik.errors.session_list?.[index]
                                    ?.amount && (
                                    <p className="text-red-500 text-sm">
                                      {formik.errors.session_list[index].amount}
                                    </p>
                                  )}
                              </div>

                              {/* Thrive Coins */}
                              <div>
                                <label className="mb-2 block">
                                  Thrive Coins
                                </label>
                                <input
                                  type="number"
                                  name={`session_list[${index}].thrive_coins`}
                                  value={
                                    formik.values.session_list[index]
                                      ?.thrive_coins || ""
                                  }
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                  className="custom--input w-full"
                                />
                                {formik.touched.session_list?.[index]
                                  ?.thrive_coins &&
                                  formik.errors.session_list?.[index]
                                    ?.thrive_coins && (
                                    <p className="text-red-500 text-sm">
                                      {
                                        formik.errors.session_list[index]
                                          .thrive_coins
                                      }
                                    </p>
                                  )}
                              </div>

                              {/* GST */}
                              <div>
                                <label className="mb-2 block">
                                  GST <span>(%)</span>
                                </label>
                                <div className="relative">
                                  <input
                                    type="number"
                                    name={`session_list[${index}].gst`}
                                    value={
                                      formik.values.session_list[index]?.gst ||
                                      ""
                                    }
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="custom--input w-full"
                                  />
                                </div>
                                {formik.touched.session_list?.[index]?.gst &&
                                  formik.errors.session_list?.[index]?.gst && (
                                    <p className="text-red-500 text-sm">
                                      {formik.errors.session_list[index].gst}
                                    </p>
                                  )}
                              </div>
                            </div>

                            <div>
                              {/* Add Row Button */}
                              <button
                                type="button"
                                onClick={handleAddSessionRow}
                                className="flex items-center justify-center px-1 py-1 bg-black text-white rounded gap-2 mb-1 w-10 h-10"
                              >
                                <FiPlus />
                              </button>
                              {/* Delete Row Button */}
                              {index !== 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSessionRow(index)}
                                  className="flex items-center justify-center px-1 py-1 bg-red-600 text-white rounded gap-2 mb-1 w-10 h-10"
                                >
                                  <FiTrash2 />
                                </button>
                              )}
                            </div>
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  )}

                {/* CKEditor for Description */}
                <div className="mt-5">
                  <label className="mb-2 block">Description</label>
                  <CKEditor
                    editor={ClassicEditor}
                    data={formik.values.description || ""}
                    onChange={(event, editor) => {
                      const data = editor.getData(); // ✅ Get HTML string from editor
                      formik.setFieldValue("description", data);
                    }}
                    onBlur={() => formik.setFieldTouched("description", true)}
                  />
                  {(formik.submitCount > 0 || formik.touched.description) &&
                    formik.errors.description && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.description}
                      </p>
                    )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 justify-end">
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
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePackage;
