import React, { useEffect, useRef, useState } from "react";
import { FiClock, FiPlus, FiTrash2 } from "react-icons/fi";
import { IoCloseCircle } from "react-icons/io5";
import Select from "react-select";
import { customStyles } from "../../Helper/helper";
import DatePicker from "react-datepicker"; // Date picker component
import "react-datepicker/dist/react-datepicker.css"; // Date picker styles
import { FaCalendarDays } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { fetchOptionList } from "../../Redux/Reducers/optionListSlice";
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
// Booking type options for dropdown
const ptType = [
  { label: "Solo Plan", value: "SINGLE" },
  { label: "Duo Plan (2 members)", value: "DOUBLE" },
  { label: "Trio Plan (3 members)", value: "TRIPLE" },
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
  const leadBoxRef = useRef(null);
  const [studio, setStudio] = useState([]);
  const [club, setClub] = useState([]);
  const [packageCategory, setPackageCategory] = useState([]);
  const getServiceType = (service_id, serviceOptions) => {
    const found = serviceOptions.find((s) => s.value === service_id);
    return found?.type || null;
  };
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    index: null,
    id: null,
  });

  const dispatch = useDispatch();
  const { lists } = useSelector((state) => state.optionList);

  // Fetch option lists
  useEffect(() => {
    dispatch(fetchOptionList("SESSION_LEVEL"));
  }, [dispatch]);

  const sessionLevel = lists["SESSION_LEVEL"] || [];

  const fetchClub = async (search = "") => {
    try {
      const res = await authAxios().get("/club/list", {
        params: search ? { search } : {},
      });
      let data = res.data?.data || res.data || [];
      setClub(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch companies");
    }
  };

  const fetchStudio = async (search = "") => {
    try {
      const res = await authAxios().get("/studio/list", {
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
    fetchStudio();
    fetchClub();
    fetchPackageCategory();
  }, []);

  const clubOptions =
    club?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];

  const filteredStudioOptions = studio.filter(
    (item) => item.club_id === formik.values.club_id
  );

  const studioOptions =
    filteredStudioOptions?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];

  const packageCategoryOptions =
    packageCategory?.map((item) => ({
      label: item.title,
      value: item.id,
    })) || [];

  const fetchVariationList = async (packageId) => {
    try {
      const res = await authAxios().get(`/package/variation/list`, {
        params: { package_id: packageId },
      });

      const data = res.data?.data || [];

      // set variations in Formik
      formik.setFieldValue(
        "variation",
        data.length > 0
          ? data
          : [
              {
                name: "",
                image: "",
                recovery_goals: "",
                caption: "",
                description: "",
                no_of_sessions: "",
                session_duration: "",
                session_validity: "",
                amount: "",
                discount: "",
                gst: "",
                earn_coin: "",
                position: "",
              },
            ]
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch variation list");
    }
  };

  // ✅ Reset fields except image when service_id changes
  useEffect(() => {
    const fetchPackageById = async (id) => {
      try {
        const res = await authAxios().get(`/package/${id}`);
        const data = res.data?.data || res.data || null;
        console.log(data, "SHIVAKAR");

        if (data) {
          formik.setValues({
            name: data?.name || "",
            service_id: data?.service_id || "",
            club_id: data?.club_id || "",
            buddy_pt: data?.buddy_pt || "",
            studio_id: data?.studio_id || null,
            package_category_id: data?.package_category_id || "",
            caption: data?.caption || "",
            description: data?.description || "",
            image: data?.image || null,
            session_level: data?.session_level || "",
            no_of_sessions:
              data?.no_of_sessions !== undefined ? data.no_of_sessions : "",
            session_duration:
              data?.session_duration !== undefined ? data.session_duration : "",
            session_validity:
              data?.session_validity !== undefined ? data.session_validity : "",
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
            position: data?.position !== undefined ? data.position : "",
            hsn_sac_code: data?.hsn_sac_code || "",
            is_featured: data?.is_featured || "",
            equipment: data?.equipment || "",
            earn_coin: data?.earn_coin || "",
            status: data?.status || "",
            variation: [],
          });

          fetchVariationList(id);
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

  const deletePackageVariation = async (id) => {
    return authAxios().delete(`/package/variation/${id}`);
  };

  const handleConfirmDelete = async () => {
    const { index, id } = confirmDelete;

    try {
      // If variation exists in DB → call API
      if (id) {
        await deletePackageVariation(id);
        toast.success("Variation deleted successfully");
      }

      // Remove from Formik list
      const updated = formik.values.variation.filter((_, i) => i !== index);
      formik.setFieldValue("variation", updated);
    } catch (err) {
      toast.error("Failed to delete variation");
    }

    // Close modal
    setConfirmDelete({ open: false, index: null, id: null });
  };

  const service_type_check = getServiceType(
    formik.values?.service_id,
    serviceOptions
  );

  console.log(service_type_check, "service_type_check");

  // Add new row
  const handleAddSessionRow = () => {
    formik.setFieldValue("variation", [
      ...formik.values.variation,
      {
        name: "",
        image: "",
        recovery_goals: "",
        caption: "",
        description: "",
        no_of_sessions: "",
        session_duration: "",
        session_validity: "",
        amount: "",
        discount: "",
        gst: "",
        earn_coin: "",
        position: "",
      },
    ]);
  };

  useEffect(() => {
    if (!formik.values.variation || formik.values.variation.length === 0) {
      formik.setFieldValue("variation", [
        {
          name: "",
          image: "",
          recovery_goals: "",
          caption: "",
          description: "",
          no_of_sessions: "",
          session_duration: "",
          session_validity: "",
          amount: "",
          discount: "",
          gst: "",
          earn_coin: "",
          position: "",
        },
      ]);
    }
  }, [formik.values.variation]);

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

  console.log(formik.values, "shviakar CHECK VALUE");

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
                    {/* Service ID */}
                    <div>
                      <label className="mb-2 block">
                        Service<span className="text-red-500">*</span>
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

                    {/* PT Type */}
                    {service_type_check &&
                      service_type_check === "PERSONAL_TRAINER" && (
                        <div>
                          <label className="mb-2 block">
                            PT Type<span className="text-red-500">*</span>
                          </label>
                          <Select
                            name="buddy_pt"
                            value={
                              ptType.find(
                                (opt) => opt.value === formik.values.buddy_pt
                              ) || null
                            }
                            options={ptType}
                            onChange={(option) => {
                              formik.setFieldValue("buddy_pt", option.value);
                            }}
                            onBlur={() =>
                              formik.setFieldTouched("buddy_pt", true)
                            }
                            styles={customStyles}
                          />
                          {formik.touched.buddy_pt &&
                            formik.errors.buddy_pt && (
                              <div className="text-red-500 text-sm">
                                {formik.errors.buddy_pt}
                              </div>
                            )}
                        </div>
                      )}

                    {service_type_check &&
                      service_type_check === "GROUP_CLASS" && (
                        <div>
                          <label className="mb-2 block">
                            Category<span className="text-red-500">*</span>
                          </label>

                          <Select
                            name="package_category_id"
                            value={
                              packageCategoryOptions.find(
                                (opt) =>
                                  opt.value ===
                                  formik.values.package_category_id
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
                              formik.setFieldTouched(
                                "package_category_id",
                                true
                              )
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
                        Caption
                        {formik.values.service_id === 1 ? (
                          ""
                        ) : (
                          <span className="text-red-500">*</span>
                        )}
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
                                formik.values.club_id?.toString()
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

                    {/* Studio */}
                    {service_type_check === "RECOVERY" ||
                    service_type_check === "GROUP_CLASS" ? (
                      <div>
                        <label className="mb-2 block">
                          Studio <span className="text-red-500">*</span>
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
                          onBlur={() =>
                            formik.setFieldTouched("studio_id", true)
                          }
                          styles={customStyles}
                        />
                        {formik.touched.studio_id &&
                          formik.errors.studio_id && (
                            <div className="text-red-500 text-sm">
                              {formik.errors.studio_id}
                            </div>
                          )}
                      </div>
                    ) : null}

                    {service_type_check !== "GROUP_CLASS" &&
                    service_type_check !== "RECOVERY" ? (
                      <>
                        <div>
                          <label className="mb-2 block">
                            No. of Sessions
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              name="no_of_sessions"
                              value={
                                formik.values.no_of_sessions !== null
                                  ? formik.values.no_of_sessions
                                  : ""
                              }
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
                              value={
                                formik.values.session_duration !== null
                                  ? formik.values.session_duration
                                  : ""
                              }
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
                              value={
                                formik.values.session_validity !== null
                                  ? formik.values.session_validity
                                  : ""
                              }
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
                      </>
                    ) : null}

                    {/* Session Level */}
                    <div>
                      <label className="mb-2 block">
                        Level<span className="text-red-500">*</span>
                      </label>
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
                      {formik.touched.session_level &&
                        formik.errors.session_level && (
                          <div className="text-red-500 text-sm">
                            {formik.errors.session_level}
                          </div>
                        )}
                    </div>
                    {/* {service_type_check &&
                    service_type_check !== "GROUP_CLASS" ? (
                      <>
                        <div>
                          <label className="mb-2 block">Level</label>
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
                    ) : null} */}

                    {service_type_check &&
                    service_type_check === "GROUP_CLASS" ? (
                      <>
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
                                    date.toLocaleDateString("en-CA")
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
                                    hour12: true,
                                  })
                                )
                              }
                              onBlur={() =>
                                formik.setFieldTouched("start_time", true)
                              }
                              showTimeSelect
                              showTimeSelectOnly
                              timeIntervals={30}
                              timeCaption="Time"
                              dateFormat="hh:mm aa"
                              className="custom--input w-full input--icon"
                              minTime={
                                formik.values.start_date &&
                                new Date(
                                  formik.values.start_date
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
                                    hour12: true,
                                  })
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
                                formik.values.start_date &&
                                new Date(
                                  formik.values.start_date
                                ).toDateString() === new Date().toDateString()
                                  ? new Date()
                                  : new Date(0, 0, 0, 0, 0)
                              }
                              maxTime={new Date(0, 0, 0, 23, 59)}
                            />
                          </div>
                          {/* Display validation error if any */}
                          {formik.touched.end_time &&
                            formik.errors.end_time && (
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
                              value={
                                formik.values.waitlist_capacity !== null
                                  ? formik.values.waitlist_capacity
                                  : ""
                              }
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
                    {service_type_check !== "RECOVERY" && (
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
                                  opt.value === formik.values?.booking_type
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
                    )}

                    {formik.values?.booking_type === "PAID" &&
                      service_type_check !== "RECOVERY" && (
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

                    {formik.values?.booking_type === "PAID" &&
                      service_type_check !== "RECOVERY" && (
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
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              className="custom--input w-full"
                            />
                          </div>
                          {formik.touched.discount &&
                            formik.errors.discount && (
                              <div className="text-red-500 text-sm">
                                {formik.errors.discount}
                              </div>
                            )}
                        </div>
                      )}

                    {formik.values?.booking_type === "PAID" &&
                      service_type_check !== "RECOVERY" && (
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

                    {service_type_check &&
                      service_type_check === "GROUP_CLASS" && (
                        <div>
                          <label className="mb-2 block">
                            Featured Event
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Select
                              name="is_featured"
                              value={
                                featureType.find(
                                  (opt) =>
                                    opt.value === formik.values?.is_featured
                                ) || null
                              }
                              options={featureType}
                              onChange={(option) =>
                                formik.setFieldValue(
                                  "is_featured",
                                  option.value
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
                      )}
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

                    {/* Earn Coins */}
                    {service_type_check !== "RECOVERY" && (
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
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="custom--input w-full"
                          />
                        </div>
                        {formik.touched.earn_coin &&
                          formik.errors.earn_coin && (
                            <div className="text-red-500 text-sm">
                              {formik.errors.earn_coin}
                            </div>
                          )}
                      </div>
                    )}

                    {/* Status */}
                    {editingOption && editingOption && (
                      <div>
                        <label className="mb-2 block">Status</label>
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
                  {service_type_check === "RECOVERY" && (
                    <div className="space-y-3">
                      {(formik.values.variation || []).map((row, index) => (
                        <div
                          key={index}
                          className="relative flex items-end gap-4 border-2 border-dashed border-gray-300 bg-gray-100 rounded-lg p-4 mt-5"
                        >
                          <div className="grid md:grid-cols-4 grid-cols-1 gap-4 gap-y-2 w-full">
                            {/* Image Preview */}
                            <div className="row-span-2">
                              <div className="bg-white rounded-lg w-full h-[160px] overflow-hidden">
                                {formik.values?.variation?.[index]?.image ? (
                                  <img
                                    src={
                                      formik.values?.variation?.[index]?.image
                                    }
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
                            {/* Image */}
                            <div>
                              <label className="mb-2 block">
                                Image <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="file"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    const previewURL =
                                      URL.createObjectURL(file);

                                    formik.setFieldValue(
                                      `variation[${index}].image`,
                                      previewURL
                                    ); // preview
                                    formik.setFieldValue(
                                      `variation[${index}].imageFile`,
                                      file
                                    ); // actual file
                                  }
                                }}
                                onBlur={() =>
                                  formik.setFieldTouched(
                                    `variation[${index}].image`,
                                    true
                                  )
                                }
                                className="custom--input w-full"
                              />
                              {formik.touched.variation?.[index]?.image &&
                                formik.errors.variation?.[index]?.image && (
                                  <div className="text-red-500 text-sm">
                                    {formik.errors.variation[index].image}
                                  </div>
                                )}
                            </div>

                            {/* Name */}
                            <div>
                              <label className="mb-2 block">
                                Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                name={`variation[${index}].name`}
                                value={
                                  formik.values.variation[index]?.name || ""
                                }
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="custom--input w-full"
                              />
                              {formik.touched.variation?.[index]?.name &&
                                formik.errors.variation?.[index]?.name && (
                                  <div className="text-red-500 text-sm">
                                    {formik.errors.variation[index].name}
                                  </div>
                                )}
                            </div>

                            {/* Recovery Goals */}
                            <div>
                              <label className="mb-2 block">
                                Recovery Goals{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                name={`variation[${index}].recovery_goals`}
                                value={
                                  formik.values.variation[index]
                                    ?.recovery_goals || ""
                                }
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="custom--input w-full"
                              />
                              {formik.touched.variation?.[index]
                                ?.recovery_goals &&
                                formik.errors.variation?.[index]
                                  ?.recovery_goals && (
                                  <div className="text-red-500 text-sm">
                                    {
                                      formik.errors.variation[index]
                                        .recovery_goals
                                    }
                                  </div>
                                )}
                            </div>

                            {/* Caption */}
                            <div>
                              <label className="mb-2 block">
                                Caption <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                name={`variation[${index}].caption`}
                                value={
                                  formik.values.variation[index]?.caption || ""
                                }
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="custom--input w-full"
                              />
                              {formik.touched.variation?.[index]?.caption &&
                                formik.errors.variation?.[index]?.caption && (
                                  <div className="text-red-500 text-sm">
                                    {formik.errors.variation[index].caption}
                                  </div>
                                )}
                            </div>

                            {/* No. of Sessions */}
                            <div>
                              <label className="mb-2 block">
                                No. of Sessions{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                name={`variation[${index}].no_of_sessions`}
                                value={
                                  formik.values.variation[index]?.no_of_sessions ?? ""
                                }
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="custom--input w-full"
                              />
                              {formik.touched.variation?.[index]
                                ?.no_of_sessions &&
                                formik.errors.variation?.[index]
                                  ?.no_of_sessions && (
                                  <div className="text-red-500 text-sm">
                                    {
                                      formik.errors.variation[index]
                                        .no_of_sessions
                                    }
                                  </div>
                                )}
                            </div>

                            {/* Session Duration */}
                            <div>
                              <label className="mb-2 block">
                                Session Duration (Mins){" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                name={`variation[${index}].session_duration`}
                                value={
                                  formik.values.variation[index]?.session_duration ?? ""
                                }
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="custom--input w-full"
                              />
                              {formik.touched.variation?.[index]
                                ?.session_duration &&
                                formik.errors.variation?.[index]
                                  ?.session_duration && (
                                  <div className="text-red-500 text-sm">
                                    {
                                      formik.errors.variation[index]
                                        .session_duration
                                    }
                                  </div>
                                )}
                            </div>
                            {/* Session Duration */}
                            <div>
                              <label className="mb-2 block">
                                Validity (In Days){" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                name={`variation[${index}].session_validity`}
                                value={
                                  formik.values.variation[index]?.session_validity ?? ""
                                }
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="custom--input w-full"
                              />
                              {formik.touched.variation?.[index]
                                ?.session_validity &&
                                formik.errors.variation?.[index]
                                  ?.session_validity && (
                                  <div className="text-red-500 text-sm">
                                    {
                                      formik.errors.variation[index]
                                        .session_validity
                                    }
                                  </div>
                                )}
                            </div>

                            {/* Amount */}
                            <div>
                              <label className="mb-2 block">
                                Amount (₹){" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                name={`variation[${index}].amount`}
                                value={
                                  formik.values.variation[index]?.amount ?? ""
                                }
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="custom--input w-full"
                              />
                              {formik.touched.variation?.[index]?.amount &&
                                formik.errors.variation?.[index]?.amount && (
                                  <div className="text-red-500 text-sm">
                                    {formik.errors.variation[index].amount}
                                  </div>
                                )}
                            </div>

                            {/* Discount */}
                            <div>
                              <label className="mb-2 block">
                                Discount (₹){" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                name={`variation[${index}].discount`}
                                value={
                                  formik.values.variation[index]?.discount ?? ""
                                }
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="custom--input w-full"
                              />
                              {formik.touched.variation?.[index]?.discount &&
                                formik.errors.variation?.[index]?.discount && (
                                  <div className="text-red-500 text-sm">
                                    {formik.errors.variation[index].discount}
                                  </div>
                                )}
                            </div>

                            {/* GST */}
                            <div>
                              <label className="mb-2 block">
                                GST (%) <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                name={`variation[${index}].gst`}
                                value={
                                  formik.values.variation[index]?.gst ?? ""
                                }
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="custom--input w-full"
                              />
                              {formik.touched.variation?.[index]?.gst &&
                                formik.errors.variation?.[index]?.gst && (
                                  <div className="text-red-500 text-sm">
                                    {formik.errors.variation[index].gst}
                                  </div>
                                )}
                            </div>
                            {/* Earn Coins */}
                            <div>
                              <label className="mb-2 block">
                                Earn Coins{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                name={`variation[${index}].earn_coin`}
                                value={
                                  formik.values.variation[index]?.earn_coin ?? ""
                                }
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="custom--input w-full"
                              />
                              {formik.touched.variation?.[index]?.earn_coin &&
                                formik.errors.variation?.[index]?.earn_coin && (
                                  <div className="text-red-500 text-sm">
                                    {formik.errors.variation[index].earn_coin}
                                  </div>
                                )}
                            </div>

                            {/* Position */}
                            <div>
                              <label className="mb-2 block">
                                Position <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                name={`variation[${index}].position`}
                                value={
                                  formik.values.variation[index]?.position ?? ""
                                }
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="custom--input w-full"
                              />
                              {formik.touched.variation?.[index]?.position &&
                                formik.errors.variation?.[index]?.position && (
                                  <div className="text-red-500 text-sm">
                                    {formik.errors.variation[index].position}
                                  </div>
                                )}
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                              <label className="mb-2 block">
                                Description{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                name={`variation[${index}].description`}
                                value={
                                  formik.values.variation[index]?.description ||
                                  ""
                                }
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="custom--input w-full"
                              />
                              {formik.touched.variation?.[index]?.description &&
                                formik.errors.variation?.[index]
                                  ?.description && (
                                  <div className="text-red-500 text-sm">
                                    {formik.errors.variation[index].description}
                                  </div>
                                )}
                            </div>
                          </div>

                          {/* Delete Button */}
                          {index !== 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmDelete({
                                  open: true,
                                  index,
                                  id: row.id || null, // If exists in DB, it has ID
                                });
                              }}
                              className="absolute flex items-center justify-center px-1 py-1 bg-red-600 text-white rounded-full w-9 h-9 top-[-5px] right-[-5px]"
                            >
                              <FiTrash2 />
                            </button>
                          )}
                        </div>
                      ))}

                      {/* Add Variation */}
                      <button
                        type="button"
                        onClick={handleAddSessionRow}
                        className="flex items-center justify-center px-2 py-1 bg-black text-white rounded text-sm"
                      >
                        <FiPlus /> Add Variation
                      </button>
                    </div>
                  )}

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
      {confirmDelete.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[350px]">
            <h3 className="text-lg font-semibold mb-4">Delete Variation?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this variation? This action cannot
              be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded"
                onClick={() =>
                  setConfirmDelete({ open: false, index: null, id: null })
                }
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-red-600 text-white rounded"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreatePackage;
