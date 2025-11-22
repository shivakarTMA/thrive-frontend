import React, { useEffect, useRef, useState } from "react";
import { FiClock} from "react-icons/fi";
import { IoCloseCircle } from "react-icons/io5";
import Select from "react-select";
import { customStyles } from "../../Helper/helper";
import DatePicker from "react-datepicker"; // Date picker component
import "react-datepicker/dist/react-datepicker.css"; // Date picker styles
import { FaCalendarDays } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { fetchOptionList } from "../../Redux/Reducers/optionListSlice";
import { apiAxios, authAxios } from "../../config/config";
import { toast } from "react-toastify";

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

const CreatePackage = ({
  setShowModal,
  editingOption,
  formik,
  serviceOptions,
}) => {
  const [sessionRows, setSessionRows] = useState([{ id: 1 }]);
  const leadBoxRef = useRef(null);
  const [studio, setStudio] = useState([]);
  const [packageCategory, setPackageCategory] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const getServiceType = (service_id, serviceOptions) => {
    const found = serviceOptions.find((s) => s.value === service_id);
    return found?.service_type || null;
  };

  const dispatch = useDispatch();
  const { lists } = useSelector((state) => state.optionList);

  // Fetch option lists
  useEffect(() => {
    dispatch(fetchOptionList("SESSION_LEVEL"));
  }, [dispatch]);

  const sessionLevel = lists["SESSION_LEVEL"] || [];

  const fetchStaff = async (search = "") => {
    try {
      const res = await apiAxios().get("/staff/list", {
        params: search ? { search } : {},
      });
      let data = res.data?.data || res.data || [];
      const activeService = data.filter((item) => item.status === "ACTIVE");
      setStaffList(activeService);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch club");
    }
  };
  const fetchClub = async (search = "") => {
    try {
      const res = await apiAxios().get("/studio/list", {
        params: search ? { search } : {},
      });
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
      const res = await apiAxios().get("/package-category/list", {
        params: search ? { search } : {},
      });
      let data = res.data?.data || res.data || [];
      // filter only ACTIVE categories
      const activeCategories = data.filter((item) => item.status === "ACTIVE");
      setPackageCategory(activeCategories);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch package category");
    }
  };

  useEffect(() => {
    fetchClub();
    fetchStaff();
    fetchPackageCategory();
  }, []);

  const staffListOptions =
    staffList?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];
  const studioOptions =
    studio?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];
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
        console.log(data,'SHIVAKAR')

        if (data) {
          formik.setValues({
            name: data?.name || "",
            service_id: data?.service_id || "",
            studio_id: data?.studio_id || null,
            package_category_id: data?.package_category_id || "",
            caption: data?.caption || "",
            description: data?.description || "",
            image: data?.image || null,
            session_level: data?.session_level || null,
            no_of_sessions: data?.no_of_sessions !== undefined ? data.no_of_sessions : "",
            session_duration: data?.session_duration !== undefined ? data.session_duration : "",
            session_validity: data?.session_validity !== undefined ? data.session_validity : "",
            start_date: data?.start_date || "",
            start_time: data?.start_time || "",
            end_time: data?.end_time || "",
            max_capacity: data?.max_capacity !== undefined ? data.max_capacity : "",
            waitlist_capacity: data?.waitlist_capacity !== undefined ? data.waitlist_capacity : "",
            tags: data?.tags || "",
            amount: data?.amount !== undefined ? data.amount : "",
            discount: data?.discount !== undefined ? data.discount : "",
            booking_type: data?.booking_type || "",
            gst: data?.gst !== undefined ? data.gst : "",
            position: data?.position !== undefined ? data.position : "",
            hsn_sac_code: data?.hsn_sac_code || "",
            is_featured: data?.is_featured || "",
            trainer_id: data?.trainer_id || null,
            status: data?.status || "",

            // staff_id: null,
            // number_of_session: "",
            // session_list: [
            //   {
            //     no_of_sessions: "",
            //     session_duration: "",
            //     thrive_coins: "",
            //     amount: "",
            //     gst: "",
            //   },
            // ],
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

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setShowModal(false);
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

                    {formik.touched.image && formik.errors.image && (
                      <div className="text-red-500 text-sm">
                        {formik.errors.image}
                      </div>
                    )}
                  </div>
                  {/* Service ID */}
                  <div>
                    <label className="mb-2 block">
                      Service
                    </label>
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
                    {formik.touched.service_id && formik.errors.service_id && (
                      <div className="text-red-500 text-sm">
                        {formik.errors.service_id}
                      </div>
                    )}
                  </div>

                  {service_type_check && service_type_check === "CLASS" && (
                    <div>
                      <label className="mb-2 block">
                        Category<span className="text-red-500">*</span>
                      </label>

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

                      {formik.touched.package_category_id &&
                        formik.errors.package_category_id && (
                          <div className="text-red-500 text-sm">
                            {formik.errors.package_category_id}
                          </div>
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

                  {/* Caption */}
                  <div>
                    <label className="mb-2 block">
                      Caption{formik.values.service_id === 1 ? "": <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="caption"
                        value={formik.values.caption}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full"
                      />
                    </div>
                    {formik.touched.caption && formik.errors.caption && (
                      <div className="text-red-500 text-sm">
                        {formik.errors.caption}
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

                  {/* Studio Dropdown */}
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
                    {formik.touched.studio_id && formik.errors.studio_id && (
                      <div className="text-red-500 text-sm">
                        {formik.errors.studio_id}
                      </div>
                    )}
                  </div>

                  {/* Session Duration */}
                  {service_type_check && service_type_check !== "CLASS" ? (
                    <>
                      <div>
                        <label className="mb-2 block">
                          No. of Sessions<span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            name="no_of_sessions"
                            value={formik.values.no_of_sessions !== null ? formik.values.no_of_sessions : ""}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="custom--input w-full"
                          />
                        </div>
                        {formik.touched.no_of_sessions &&
                          formik.errors.no_of_sessions && (
                            <div className="text-red-500 text-sm">
                              {formik.errors.no_of_sessions}
                            </div>
                          )}
                      </div>
                      <div>
                        <label className="mb-2 block">
                          Session Duration{" "}
                          <span className="text-sm">(In Mins)</span>
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            name="session_duration"
                            value={formik.values.session_duration !== null ? formik.values.session_duration : ""}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="custom--input w-full"
                          />
                        </div>
                        {formik.touched.session_duration &&
                          formik.errors.session_duration && (
                            <div className="text-red-500 text-sm">
                              {formik.errors.session_duration}
                            </div>
                          )}
                      </div>
                      <div>
                        <label className="mb-2 block">
                          Validity <span className="text-sm">(In Days)</span>
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            name="session_validity"
                            value={formik.values.session_validity !== null ? formik.values.session_validity : ""}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="custom--input w-full"
                          />
                        </div>
                        {formik.touched.session_validity &&
                          formik.errors.session_validity && (
                            <div className="text-red-500 text-sm">
                              {formik.errors.session_validity}
                            </div>
                          )}
                      </div>
                      <div>
                        <label className="mb-2 block">
                          Level<span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
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
                            styles={customStyles}
                          />
                        </div>
                        {formik.touched.session_level &&
                          formik.errors.session_level && (
                            <div className="text-red-500 text-sm">
                              {formik.errors.session_level}
                            </div>
                          )}
                      </div>
                    </>
                  ) : null}

                  {/* Start Date Field */}
                  <div>
                    <label className="mb-2 block">
                      Start Date<span className="text-red-500">*</span>
                    </label>
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
                      <div className="text-red-500 text-sm">
                        {formik.errors.start_time}
                      </div>
                    )}
                  </div>

                  {service_type_check && service_type_check === "CLASS" ? (
                    <>
                      {/* End Time Field */}
                      <div>
                        <label className="mb-2 block">
                          End Time<span className="text-red-500">*</span>
                        </label>
                        <div className="custom--date relative">
                          {/* Clock Icon */}
                          <span className="absolute z-[1] mt-[15px] ml-[15px]">
                            <FiClock />
                          </span>
                          <DatePicker
                            selected={
                              formik.values.end_time
                                ? new Date(
                                    `1970-01-01T${formik.values.end_time}`
                                  ) // ✅ Convert string to Date
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
                            onBlur={() =>
                              formik.setFieldTouched("end_time", true)
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
                        {formik.touched.end_time && formik.errors.end_time && (
                          <div className="text-red-500 text-sm">
                            {formik.errors.end_time}
                          </div>
                        )}
                      </div>
                      {/* Max Capacity Field */}
                      <div>
                        <label className="mb-2 block">
                          Max Capacity<span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            name="max_capacity"
                            value={formik.values.max_capacity !== null ? formik.values.max_capacity : ""}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="custom--input w-full"
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
                            value={formik.values.waitlist_capacity !== null ? formik.values.waitlist_capacity : ""}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="custom--input w-full"
                          />
                        </div>
                        {formik.touched.waitlist_capacity &&
                          formik.errors.waitlist_capacity && (
                            <div className="text-red-500 text-sm">
                              {formik.errors.waitlist_capacity}
                            </div>
                          )}
                      </div>
                    </>
                  ) : null}

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
                    {formik.touched.booking_type &&
                      formik.errors.booking_type && (
                        <div className="text-red-500 text-sm">
                          {formik.errors.booking_type}
                        </div>
                      )}
                  </div>

                  {formik.values?.booking_type === "PAID" && (
                    <div>
                      <label className="mb-2 block">
                        Amount (₹)<span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="amount"
                          value={formik.values.amount !== null ? formik.values.amount : ""}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="custom--input w-full"
                        />
                      </div>

                      {formik.touched.amount && formik.errors.amount && (
                        <div className="text-red-500 text-sm">
                          {formik.errors.amount}
                        </div>
                      )}
                    </div>
                  )}

                  {formik.values?.booking_type === "PAID" && (
                    <div>
                      <label className="mb-2 block">
                        Discount (₹)<span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="discount"
                          value={formik.values.discount !== null ? formik.values.discount : ""}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="custom--input w-full"
                        />
                      </div>
                      {formik.touched.discount && formik.errors.discount && (
                        <div className="text-red-500 text-sm">
                          {formik.errors.discount}
                        </div>
                      )}
                    </div>
                  )}

                  {formik.values?.booking_type === "PAID" && (
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
                          value={formik.values.gst !== null ? formik.values.gst : ""}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="custom--input w-full"
                        />
                      </div>
                      {formik.touched.gst && formik.errors.gst && (
                        <div className="text-red-500 text-sm">
                          {formik.errors.gst}
                        </div>
                      )}
                    </div>
                  )}

                  {service_type_check && service_type_check === "CLASS" && (
                    <div>
                      <label className="mb-2 block">
                        Featured Event<span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Select
                          name="is_featured"
                          value={
                            featureType.find(
                              (opt) => opt.value === formik.values?.is_featured
                            ) || null
                          }
                          options={featureType}
                          onChange={(option) =>
                            formik.setFieldValue("is_featured", option.value)
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
                  )}
                  {/* Staff Dropdown */}
                  <div>
                    <label className="mb-2 block">
                      Staff<span className="text-red-500">*</span>
                    </label>
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
                      onBlur={() => formik.setFieldTouched("trainer_id", true)}
                      styles={customStyles}
                    />
                    {formik.touched.trainer_id && formik.errors.trainer_id && (
                      <div className="text-red-500 text-sm">
                        {formik.errors.trainer_id}
                      </div>
                    )}
                  </div>
                  {/* HSC SAC Code */}
                  <div>
                    <label className="mb-2 block">
                      HSC SAC Code<span className="text-red-500">*</span>
                    </label>
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
                        value={formik.values.position !== null ? formik.values.position : ""}
                        onChange={formik.handleChange}
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
                  {/* Status */}
                  {editingOption && editingOption && (
                    <div>
                      <label className="mb-2 block">
                        Status<span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Select
                          name="status"
                          value={
                            statusType.find(
                              (opt) => opt.value === formik.values.status
                            ) || null
                          }
                          options={statusType}
                          onChange={(option) =>
                            formik.setFieldValue(
                              "status",
                              option ? option.value : ""
                            )
                          }
                          onBlur={() => formik.setFieldTouched("status", true)}
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

                {/* <div className="col-span-4 space-y-3 hidden">
                  {sessionRows.map((row, index) => (
                    <React.Fragment key={index}>
                      <div className="flex items-end gap-4 border-2 border-dashed border-gray-300 bg-gray-100 rounded-lg p-6 mt-5">
                        <div className="grid grid-cols-5 gap-5">
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
                          <div>
                            <label className="mb-2 block">
                              Session Duration
                            </label>
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
                          <div>
                            <label className="mb-2 block">
                              Amount <span>(₹)</span>
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                name={`session_list[${index}].amount`}
                                value={
                                  formik.values.session_list[index]?.amount ||
                                  ""
                                }
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="custom--input w-full"
                              />
                            </div>
                            {formik.touched.session_list?.[index]?.amount &&
                              formik.errors.session_list?.[index]?.amount && (
                                <p className="text-red-500 text-sm">
                                  {formik.errors.session_list[index].amount}
                                </p>
                              )}
                          </div>
                          <div>
                            <label className="mb-2 block">Thrive Coins</label>
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
                          <div>
                            <label className="mb-2 block">
                              GST <span>(%)</span>
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                name={`session_list[${index}].gst`}
                                value={
                                  formik.values.session_list[index]?.gst || ""
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
                          <button
                            type="button"
                            onClick={handleAddSessionRow}
                            className="flex items-center justify-center px-1 py-1 bg-black text-white rounded gap-2 mb-1 w-10 h-10"
                          >
                            <FiPlus />
                          </button>
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
                </div> */}

                {/* CKEditor for Description */}
                <div className="mt-5">
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

                  {formik.touched.description && formik.errors.description && (
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
  );
};

export default CreatePackage;
