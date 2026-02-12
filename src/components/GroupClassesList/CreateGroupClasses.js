import React, { useEffect, useRef, useState } from "react";
import { FiClock, FiPlus, FiTrash2 } from "react-icons/fi";
import { IoCloseCircle } from "react-icons/io5";
import Select from "react-select";
import {
  blockInvalidNumberKeys,
  customStyles,
  filterActiveItems,
  sanitizePositiveInteger,
} from "../../Helper/helper";
import DatePicker from "react-datepicker"; // Date picker component
import "react-datepicker/dist/react-datepicker.css"; // Date picker styles
import { FaCalendarDays } from "react-icons/fa6";
import { authAxios } from "../../config/config";
import { toast } from "react-toastify";
import { PiImageFill } from "react-icons/pi";

// status type options for dropdown
const statusType = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];
// Booking type options for dropdown
const bookingType = [
  { label: "Paid", value: "PAID" },
  { label: "Free", value: "FREE" },
];

// Is Feature type options for dropdown
const featureType = [
  { label: "Yes", value: true },
  { label: "No", value: false },
];

const CreateGroupClasses = ({ setShowModal, editingOption, formik }) => {
  console.log(formik.values, "formik");
  const leadBoxRef = useRef(null);
  const [studio, setStudio] = useState([]);
  const [club, setClub] = useState([]);
  const [service, setService] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [packageCategory, setPackageCategory] = useState([]);

  const fetchClub = async (search = "") => {
    try {
      const res = await authAxios().get("/club/list", {
        params: search ? { search } : {},
      });
      let data = res.data?.data || res.data || [];
      const activeOnly = filterActiveItems(data);
      setClub(activeOnly);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch companies");
    }
  };

  const fetchService = async (clubId = null) => {
    try {
      const params = {};
      if (clubId) params.club_id = clubId;
      const res = await authAxios().get("/service/list", { params });
      let data = res.data?.data || res.data || [];

      const activeService = data.filter(
        (item) => item.status === "ACTIVE" && item.type === "GROUP_CLASS",
      );

      console.log(activeService, "activeService");
      setService(activeService);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch service");
    }
  };

  const fetchStaff = async (clubId = null) => {
    try {
      const params = {};
      if (clubId) params.club_id = clubId;
      const res = await authAxios().get("/staff/list?role=TRAINER", { params });
      let data = res.data?.data || res.data || [];
      const activeService = data.filter((item) => item.status === "ACTIVE");
      console.log(activeService, "activeService");
      setStaffList(activeService);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch service");
    }
  };

  const fetchStudio = async (clubId = null) => {
    try {
      const params = {};
      if (clubId) params.club_id = clubId;
      const res = await authAxios().get("/studio/list", { params });
      let data = res.data?.data || res.data || [];
      const activeService = data.filter((item) => item.status === "ACTIVE");
      setStudio(activeService);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch club");
    }
  };

  const fetchPackageCategory = async (search = "") => {
    try {
      const res = await authAxios().get("/package-category/list", {
        params: search ? { search } : {},
      });
      let data = res.data?.data || res.data || [];
      // filter only ACTIVE categories
      const activeCategories = data.filter((item) => item.status === "ACTIVE");
      setPackageCategory(activeCategories);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch Classes category");
    }
  };

  useEffect(() => {
    fetchClub();
    fetchPackageCategory();
  }, []);

  useEffect(() => {
    if (formik.values.club_id) {
      fetchService(formik.values.club_id);
      fetchStudio(formik.values.club_id);
      fetchStaff(formik.values.club_id);

      // ❌ reset ONLY when NOT editing
      if (!editingOption) {
        formik.setFieldValue("service_id", "");
        formik.setFieldValue("studio_id", "");
        formik.setFieldValue("trainer_id", "");
      }
    } else {
      setService([]);
      setStudio([]);
      setStaffList([]);
    }
  }, [formik.values.club_id]);

  const trainerOptions =
    staffList?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];

  const clubOptions =
    club?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];

  const studioOptions =
    studio?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];

  const serviceOptions =
    service
      ?.map((item) => ({
        label: item.name,
        value: item.id,
        type: item.type,
      }))
      .filter((item) => item.type !== "PRODUCT") || [];

  const packageCategoryOptions =
    packageCategory?.map((item) => ({
      label: item.title,
      value: item.id,
    })) || [];

  // ✅ Reset fields except image when service_id changes
  useEffect(() => {
    const fetchPackageById = async (id) => {
      try {
        const res = await authAxios().get(`/package/${id}`);
        const data = res.data?.data || res.data || null;

        if (data) {
          formik.setValues({
            name: data?.name || "",
            service_id: data?.service_id || "",
            trainer_id: data?.trainer_id || "",
            club_id: data?.club_id || null,
            studio_id: data?.studio_id || null,
            package_category_id: data?.package_category_id || "",
            description: data?.description || "",
            image: data?.image || null,
            start_date: data?.start_date || "",
            start_time: data?.start_time || "",
            end_time: data?.end_time || "",
            max_capacity:
              data?.max_capacity !== undefined ? data.max_capacity : "",
            waitlist_capacity:
              data?.waitlist_capacity !== undefined
                ? data.waitlist_capacity
                : "",
            tags: data?.tags || "",
            amount: data?.amount !== undefined ? data.amount : "",
            discount: data?.discount !== undefined ? data.discount : "",
            booking_type: data?.booking_type || "",
            gst: data?.gst !== undefined ? data.gst : "",
            earn_coin: data?.earn_coin !== undefined ? data.earn_coin : "",
            position: data?.position !== undefined ? data.position : "",
            hsn_sac_code: data?.hsn_sac_code || "",
            is_featured:
              data?.is_featured === true
                ? true
                : data?.is_featured === false
                  ? false
                  : null,
            equipment: data?.equipment || "",
            status: data?.status || "",
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch package details");
      }
    };

    if (editingOption) {
      fetchPackageById(editingOption);
    }
  }, [editingOption]);

  const parseTime = (timeString) => {
    if (!timeString) return null;

    let d = new Date();
    let [time, modifier] = timeString.split(" ");

    let [hours, minutes] = time.split(":");

    hours = parseInt(hours);
    minutes = parseInt(minutes);

    // Handle AM/PM
    if (modifier) {
      if (modifier === "PM" && hours !== 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;
    }

    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewURL = URL.createObjectURL(file);

      formik.setFieldValue("image", previewURL); // for preview
      formik.setFieldValue("imageFile", file); // actual file to upload
    }
  };

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setShowModal(false);
    }
  };

  useEffect(() => {
    if (
      formik.values.start_time &&
      formik.values.end_time &&
      parseTime(formik.values.end_time) < parseTime(formik.values.start_time)
    ) {
      formik.setFieldValue("end_time", "");
    }
  }, [formik.values.start_time]);

  return (
    <>
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
              {editingOption ? "Edit Class" : "Create Class"}
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
                  {/* <div className="flex gap-3"> */}

                  <div className="grid md:grid-cols-4 grid-cols-1 gap-4 gap-y-2">
                    {/* Image Preview */}
                    <div className="row-span-2">
                      <div className="bg-gray-100 rounded-lg w-full h-[160px] overflow-hidden">
                        {formik.values?.image ? (
                          <img
                            src={formik.values?.image}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <PiImageFill className="text-gray-300 text-7xl" />
                            <span className="text-gray-500 text-sm">
                              Upload Image
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

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

                      {formik.touched.image && formik.errors.image && (
                        <div className="text-red-500 text-sm">
                          {formik.errors.image}
                        </div>
                      )}
                    </div>
                    {/* Club Dropdown */}
                    <div>
                      <label className="mb-2 block">
                        Club<span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Select
                          name="club_id"
                          value={
                            clubOptions.find(
                              (option) =>
                                option.value.toString() ===
                                formik.values.club_id?.toString(),
                            ) || null
                          }
                          options={clubOptions}
                          onChange={(option) =>
                            formik.setFieldValue("club_id", option.value)
                          }
                          onBlur={() => formik.setFieldTouched("club_id", true)}
                          styles={customStyles}
                          className="!capitalize"
                        />
                      </div>
                      {formik.touched.club_id && formik.errors.club_id && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.club_id}
                        </p>
                      )}
                    </div>
                    {/* Service ID */}
                    <div>
                      <label className="mb-2 block">
                        Service<span className="text-red-500">*</span>
                      </label>
                      <Select
                        name="service_id"
                        value={
                          serviceOptions.find(
                            (opt) => opt.value === formik.values.service_id,
                          ) || null
                        }
                        options={serviceOptions}
                        onChange={(option) => {
                          formik.setFieldValue("service_id", option.value);
                        }}
                        onBlur={() =>
                          formik.setFieldTouched("service_id", true)
                        }
                        styles={customStyles}
                      />
                      {formik.touched.service_id &&
                        formik.errors.service_id && (
                          <div className="text-red-500 text-sm">
                            {formik.errors.service_id}
                          </div>
                        )}
                    </div>

                    <div>
                      <label className="mb-2 block">
                        Category<span className="text-red-500">*</span>
                      </label>

                      <Select
                        name="package_category_id"
                        value={
                          packageCategoryOptions.find(
                            (opt) =>
                              opt.value === formik.values.package_category_id,
                          ) || null
                        }
                        options={packageCategoryOptions}
                        onChange={(option) =>
                          formik.setFieldValue(
                            "package_category_id",
                            option.value,
                          )
                        }
                        onBlur={() =>
                          formik.setFieldTouched("package_category_id", true)
                        }
                        styles={customStyles}
                      />

                      {formik.touched.package_category_id &&
                        formik.errors.package_category_id && (
                          <div className="text-red-500 text-sm">
                            {formik.errors.package_category_id}
                          </div>
                        )}
                    </div>
                    <div>
                      <label className="mb-2 block">
                        Trainer Name
                        <span className="text-red-500">*</span>
                      </label>

                      <Select
                        name="trainer_id"
                        value={
                          trainerOptions.find(
                            (opt) => opt.value === formik.values.trainer_id,
                          ) || null
                        }
                        options={trainerOptions}
                        onChange={(option) =>
                          formik.setFieldValue("trainer_id", option.value)
                        }
                        onBlur={() =>
                          formik.setFieldTouched("trainer_id", true)
                        }
                        styles={customStyles}
                      />

                      {formik.touched.trainer_id &&
                        formik.errors.trainer_id && (
                          <div className="text-red-500 text-sm">
                            {formik.errors.trainer_id}
                          </div>
                        )}
                    </div>

                    {/* Name */}
                    <div>
                      <label className="mb-2 block">
                        Name<span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="name"
                          value={formik.values.name}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="custom--input w-full"
                        />
                      </div>

                      {formik.touched.name && formik.errors.name && (
                        <div className="text-red-500 text-sm">
                          {formik.errors.name}
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="mb-2 block">
                        Tags<span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="tags"
                          value={formik.values.tags}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="custom--input w-full"
                        />
                      </div>
                      {formik.touched.tags && formik.errors.tags && (
                        <div className="text-red-500 text-sm">
                          {formik.errors.tags}
                        </div>
                      )}
                    </div>

                    {/* Studio */}
                    <div>
                      <label className="mb-2 block">
                        Studio <span className="text-red-500">*</span>
                      </label>
                      <Select
                        name="studio_id"
                        value={
                          studioOptions.find(
                            (opt) => opt.value === formik.values.studio_id,
                          ) || null
                        }
                        options={studioOptions}
                        onChange={(option) =>
                          formik.setFieldValue("studio_id", option.value)
                        }
                        onBlur={() => formik.setFieldTouched("studio_id", true)}
                        styles={customStyles}
                      />
                      {formik.touched.studio_id && formik.errors.studio_id && (
                        <div className="text-red-500 text-sm">
                          {formik.errors.studio_id}
                        </div>
                      )}
                    </div>

                    {/* Start Date Field */}
                    <div>
                      <label className="mb-2 block">
                        Start Date<span className="text-red-500">*</span>
                      </label>
                      <div className="custom--date relative">
                        {/* Calendar Icon */}
                        <span className="absolute z-[1] mt-[11px] ml-[15px]">
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
                                // date.toISOString().split("T")[0]
                                date.toLocaleDateString("en-CA"),
                              ) // ✅ Save as YYYY-MM-DD
                          }
                          onBlur={() =>
                            formik.setFieldTouched("start_date", true)
                          }
                          dateFormat="dd-MM-yyyy"
                          minDate={new Date()} // ✅ Prevent selecting past dates
                          className="custom--input w-full input--icon"
                        />
                      </div>
                      {/* Display validation error if any */}
                      {formik.touched.start_date &&
                        formik.errors.start_date && (
                          <div className="text-red-500 text-sm">
                            {formik.errors.start_date}
                          </div>
                        )}
                    </div>

                    {/* Start Time Field */}
                    <div>
                      <label className="mb-2 block">
                        Start Time<span className="text-red-500">*</span>
                      </label>
                      <div className="custom--date relative">
                        {/* Clock Icon */}
                        <span className="absolute z-[1] mt-[11px] ml-[15px]">
                          <FiClock />
                        </span>
                        <DatePicker
                          selected={
                            formik.values.start_time
                              ? parseTime(formik.values.start_time)
                              : null
                          }
                          onChange={(date) =>
                            formik.setFieldValue(
                              "start_time",
                              date.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              }),
                            )
                          }
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={30}
                          dateFormat="hh:mm aa"
                          className="custom--input w-full input--icon"
                          minTime={
                            formik.values.start_date &&
                            new Date(
                              formik.values.start_date,
                            ).toDateString() === new Date().toDateString()
                              ? new Date()
                              : new Date(0, 0, 0, 0, 0)
                          }
                          maxTime={new Date(0, 0, 0, 23, 59)}
                        />
                      </div>
                      {/* Display validation error if any */}
                      {formik.touched.start_time &&
                        formik.errors.start_time && (
                          <div className="text-red-500 text-sm">
                            {formik.errors.start_time}
                          </div>
                        )}
                    </div>

                    {/* End Time Field */}
                    <div>
                      <label className="mb-2 block">
                        End Time<span className="text-red-500">*</span>
                      </label>
                      <div className="custom--date relative">
                        {/* Clock Icon */}
                        <span className="absolute z-[1] mt-[11px] ml-[15px]">
                          <FiClock />
                        </span>
                        <DatePicker
                          selected={
                            formik.values.end_time
                              ? parseTime(formik.values.end_time)
                              : null
                          }
                          onChange={(date) =>
                            formik.setFieldValue(
                              "end_time",
                              date.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              }),
                            )
                          }
                          onBlur={() =>
                            formik.setFieldTouched("end_time", true)
                          }
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={30}
                          timeCaption="Time"
                          dateFormat="hh:mm aa"
                          className="custom--input w-full input--icon"
                          minTime={
                            formik.values.start_time
                              ? parseTime(formik.values.start_time)
                              : new Date(0, 0, 0, 0, 0)
                          }
                          maxTime={new Date(0, 0, 0, 23, 59)}
                        />
                      </div>
                      {/* Display validation error if any */}
                      {formik.touched.end_time && formik.errors.end_time && (
                        <div className="text-red-500 text-sm">
                          {formik.errors.end_time}
                        </div>
                      )}
                    </div>
                    {/* Max Capacity Field */}
                    <div>
                      <label className="mb-2 block">
                        Max Capacity
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="max_capacity"
                          value={
                            formik.values.max_capacity !== null
                              ? formik.values.max_capacity
                              : ""
                          }
                          // onChange={formik.handleChange}
                          onKeyDown={blockInvalidNumberKeys} // ⛔ blocks typing -, e, etc.
                          onChange={(e) => {
                            const cleanValue = sanitizePositiveInteger(
                              e.target.value,
                            );
                            formik.setFieldValue("max_capacity", cleanValue);
                          }}
                          onBlur={formik.handleBlur}
                          className="custom--input w-full number--appearance-none"
                        />
                      </div>
                      {formik.touched.max_capacity &&
                        formik.errors.max_capacity && (
                          <div className="text-red-500 text-sm">
                            {formik.errors.max_capacity}
                          </div>
                        )}
                    </div>
                    {/* Waitlist Capacity Field */}
                    <div>
                      <label className="mb-2 block">
                        Waitlist Capacity
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="waitlist_capacity"
                          value={
                            formik.values.waitlist_capacity !== null
                              ? formik.values.waitlist_capacity
                              : ""
                          }
                          // onChange={formik.handleChange}
                          onKeyDown={blockInvalidNumberKeys} // ⛔ blocks typing -, e, etc.
                          onChange={(e) => {
                            const cleanValue = sanitizePositiveInteger(
                              e.target.value,
                            );
                            formik.setFieldValue(
                              "waitlist_capacity",
                              cleanValue,
                            );
                          }}
                          onBlur={formik.handleBlur}
                          className="custom--input w-full number--appearance-none"
                        />
                      </div>
                      {formik.touched.waitlist_capacity &&
                        formik.errors.waitlist_capacity && (
                          <div className="text-red-500 text-sm">
                            {formik.errors.waitlist_capacity}
                          </div>
                        )}
                    </div>

                    {/* Booking Type */}
                    <div>
                      <label className="mb-2 block">
                        Booking Type<span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Select
                          name="booking_type"
                          value={
                            bookingType.find(
                              (opt) =>
                                opt.value === formik.values?.booking_type,
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
                      {formik.touched.booking_type &&
                        formik.errors.booking_type && (
                          <div className="text-red-500 text-sm">
                            {formik.errors.booking_type}
                          </div>
                        )}
                    </div>

                    {formik.values?.booking_type === "PAID" && (
                      <>
                        <div>
                          <label className="mb-2 block">
                            Amount (₹)<span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              name="amount"
                              value={
                                formik.values.amount !== null
                                  ? formik.values.amount
                                  : ""
                              }
                              // onChange={formik.handleChange}
                              onKeyDown={blockInvalidNumberKeys} // ⛔ blocks typing -, e, etc.
                              onChange={(e) => {
                                const cleanValue = sanitizePositiveInteger(
                                  e.target.value,
                                );
                                formik.setFieldValue("amount", cleanValue);
                              }}
                              onBlur={formik.handleBlur}
                              className="custom--input w-full number--appearance-none"
                            />
                          </div>

                          {formik.touched.amount && formik.errors.amount && (
                            <div className="text-red-500 text-sm">
                              {formik.errors.amount}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="mb-2 block">
                            Discount (₹)
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              name="discount"
                              value={
                                formik.values.discount !== null
                                  ? formik.values.discount
                                  : ""
                              }
                              // onChange={formik.handleChange}
                              onKeyDown={blockInvalidNumberKeys} // ⛔ blocks typing -, e, etc.
                              onChange={(e) => {
                                const cleanValue = sanitizePositiveInteger(
                                  e.target.value,
                                );
                                formik.setFieldValue("discount", cleanValue);
                              }}
                              onBlur={formik.handleBlur}
                              className="custom--input w-full number--appearance-none"
                            />
                          </div>
                          {formik.touched.discount &&
                            formik.errors.discount && (
                              <div className="text-red-500 text-sm">
                                {formik.errors.discount}
                              </div>
                            )}
                        </div>

                        <div>
                          <label className="mb-2 block">
                            GST{" "}
                            <span>
                              (%)<span className="text-red-500">*</span>
                            </span>
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              name="gst"
                              value={
                                formik.values.gst !== null
                                  ? formik.values.gst
                                  : ""
                              }
                              // onChange={formik.handleChange}
                              onKeyDown={blockInvalidNumberKeys} // ⛔ blocks typing -, e, etc.
                              onChange={(e) => {
                                const cleanValue = sanitizePositiveInteger(
                                  e.target.value,
                                );
                                formik.setFieldValue("gst", cleanValue);
                              }}
                              onBlur={formik.handleBlur}
                              className="custom--input w-full number--appearance-none"
                            />
                          </div>
                          {formik.touched.gst && formik.errors.gst && (
                            <div className="text-red-500 text-sm">
                              {formik.errors.gst}
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    <div>
                      <label className="mb-2 block">
                        Featured Event
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Select
                          name="is_featured"
                          value={featureType.find(
                            (opt) => opt.value === formik.values.is_featured,
                          )}
                          options={featureType}
                          onChange={(option) =>
                            formik.setFieldValue(
                              "is_featured",
                              option?.value ?? null,
                            )
                          }
                          onBlur={() =>
                            formik.setFieldTouched("is_featured", true)
                          }
                          styles={customStyles}
                        />
                      </div>
                      {formik.touched.is_featured &&
                        formik.errors.is_featured && (
                          <div className="text-red-500 text-sm">
                            {formik.errors.is_featured}
                          </div>
                        )}
                    </div>
                    {/* HSN SAC Code */}
                    <div>
                      <label className="mb-2 block">HSN SAC Code</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="hsn_sac_code"
                          value={formik.values.hsn_sac_code}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="custom--input w-full"
                        />
                      </div>
                      {formik.touched.hsn_sac_code &&
                        formik.errors.hsn_sac_code && (
                          <div className="text-red-500 text-sm">
                            {formik.errors.hsn_sac_code}
                          </div>
                        )}
                    </div>

                    {/* Position */}
                    <div>
                      <label className="mb-2 block">
                        Position<span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="position"
                          value={
                            formik.values.position !== null
                              ? formik.values.position
                              : ""
                          }
                          // onChange={formik.handleChange}
                          onKeyDown={blockInvalidNumberKeys} // ⛔ blocks typing -, e, etc.
                          onChange={(e) => {
                            const cleanValue = sanitizePositiveInteger(
                              e.target.value,
                            );
                            formik.setFieldValue("position", cleanValue);
                          }}
                          onBlur={formik.handleBlur}
                          className="custom--input w-full"
                        />
                      </div>
                      {formik.touched.position && formik.errors.position && (
                        <div className="text-red-500 text-sm">
                          {formik.errors.position}
                        </div>
                      )}
                    </div>

                    {/* Earn Coins */}

                    <div>
                      <label className="mb-2 block">
                        Earn Coins<span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="earn_coin"
                          value={
                            formik.values.earn_coin !== null
                              ? formik.values.earn_coin
                              : ""
                          }
                          // onChange={formik.handleChange}
                          onKeyDown={blockInvalidNumberKeys} // ⛔ blocks typing -, e, etc.
                          onChange={(e) => {
                            const cleanValue = sanitizePositiveInteger(
                              e.target.value,
                            );
                            formik.setFieldValue("earn_coin", cleanValue);
                          }}
                          onBlur={formik.handleBlur}
                          className="custom--input w-full number--appearance-none"
                        />
                      </div>
                      {formik.touched.earn_coin && formik.errors.earn_coin && (
                        <div className="text-red-500 text-sm">
                          {formik.errors.earn_coin}
                        </div>
                      )}
                    </div>

                    {/* Status */}
                    {editingOption && editingOption && (
                      <div>
                        <label className="mb-2 block">Status</label>
                        <div className="relative">
                          <Select
                            name="status"
                            value={
                              statusType.find(
                                (opt) => opt.value === formik.values.status,
                              ) || null
                            }
                            options={statusType}
                            onChange={(option) =>
                              formik.setFieldValue(
                                "status",
                                option ? option.value : "",
                              )
                            }
                            onBlur={() =>
                              formik.setFieldTouched("status", true)
                            }
                            styles={customStyles}
                            placeholder="Select Status"
                          />
                        </div>
                        {formik.touched.status && formik.errors.status && (
                          <div className="text-red-500 text-sm">
                            {formik.errors.status}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {/* </div> */}

                  {/* Equipment */}
                  <div className="my-3">
                    <label className="mb-2 block">Equipment</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="equipment"
                        value={formik.values.equipment}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="mb-2 block">
                      Description<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <textarea
                        rows={3}
                        name="description"
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full"
                      />
                    </div>

                    {formik.touched.description &&
                      formik.errors.description && (
                        <div className="text-red-500 text-sm">
                          {formik.errors.description}
                        </div>
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
    </>
  );
};

export default CreateGroupClasses;
