import React, { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { IoCloseCircle } from "react-icons/io5";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchOptionList } from "../../Redux/Reducers/optionListSlice";
import {
  blockNonLettersAndNumbers,
  customStyles,
  sanitizeTextWithNumbers,
  selectIcon,
} from "../../Helper/helper";
import Select from "react-select";
import { FaCalendarDays } from "react-icons/fa6";
import { toast } from "react-toastify";
import { authAxios } from "../../config/config";
import { useClubDateTime } from "../../hooks/useClubDateTime";
import { useDateTimePicker } from "../../hooks/useDateTimePicker";
import { PiImageFill } from "react-icons/pi";
import { FiClock } from "react-icons/fi";

const AddNewItemModal = ({
  onClose,
  clubOptions,
  editingOption,
  fetchLostFoundList,
}) => {
  const leadBoxRef = useRef(null);
  const { user } = useSelector((state) => state.auth);
  const [clubTiming, setClubTiming] = useState([]);

  const formik = useFormik({
    initialValues: {
      image: null,
      club_id: null,
      item_name: "",
      category: null,
      description: "",
      found_at_location: null,
      found_date: "",
      found_time: "",
      found_date_time: "",
      loggedBy: user?.name,
      verification_notes: "",
      status: "AVAILABLE",
    },
    validationSchema: Yup.object({
      image: Yup.mixed()
        .required("Image is required")
        .test("fileType", "Only JPG, PNG, or WEBP allowed", (value) => {
          if (!value || typeof value === "string") return true;
          return ["image/jpeg", "image/png", "image/webp"].includes(value.type);
        }),
      item_name: Yup.string().required("Item Name is required"),
      category: Yup.string().required("Category Name is required"),
      found_at_location: Yup.string().required("Location is required"),
      found_date_time: Yup.string().required("Date & Time is required"),
    }),
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { resetForm }) => {
      console.log("Submitting with values:", values);

      try {
        // Create FormData instance
        const formData = new FormData();

        // Append each value to FormData
        formData.append("image", values.image); // file
        formData.append("club_id", values.club_id || ""); // optional fallback
        formData.append("item_name", values.item_name);
        formData.append("category", values.category);
        formData.append("description", values.description || "");
        formData.append("found_at_location", values.found_at_location);
        formData.append("found_date_time", values.found_date_time);
        formData.append("loggedBy", values.loggedBy || "");
        formData.append("verification_notes", values.verification_notes || "");
        formData.append("status", values.status);

        // Send FormData
        await authAxios().post("/lost/found/create", formData, {
          headers: {
            "Content-Type": "multipart/form-data", // important for file upload
          },
        });

        toast.success("Item Successfully Added");

        // Reset form and close modal
        resetForm();
        onClose();
        fetchLostFoundList();
      } catch (error) {
        console.error("Error submitting form:", error);
        toast.error(
          error.response?.data?.errors || error.response?.data?.message,
        );
      }
    },
  });

  const fetchClubTimingAPI = async () => {
    try {
      if (!formik.values.club_id) return;

      const res = await authAxios().get(
        `/club/fetch/timing/${formik.values.club_id}`,
      );

      setClubTiming(res.data?.data?.time || []);
    } catch (err) {
      console.error("Club timing error:", err);
      setClubTiming([]);
    }
  };

  useEffect(() => {
    if (formik.values.club_id) {
      fetchClubTimingAPI();
    }
  }, [formik.values.club_id]);

  const formatTo12Hour = (time24) => {
    const [h, m] = time24.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;

    return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  const startTimeOptions = clubTiming.map((time) => {
    const now = new Date();
    const selectedDate = formik.values.found_date;
    let isDisabled = false;

    if (selectedDate) {
      const [h, m] = time.split(":").map(Number);
      const slotTime = new Date();
      slotTime.setHours(h, m, 0, 0);

      const isToday =
        new Date(selectedDate).toDateString() === now.toDateString();

      // ✅ For today: only past/current slots are valid (item was already found)
      // Disable future slots
      if (isToday && slotTime > now) {
        isDisabled = true;
      }
      // Past dates → all slots enabled (item could have been found any time)
    }

    return { label: formatTo12Hour(time), value: time, isDisabled };
  });

  useEffect(() => {
    const fetchLostItemById = async (id) => {
      try {
        const res = await authAxios().get(`/lost/found/${id}`);
        const data = res.data?.data || res.data || null;

        if (data) {
          // ✅ Parse found_date_time → found_date + found_time
          let parsedDate = "";
          let parsedTime = "";

          if (data?.found_date_time) {
            const dt = new Date(data.found_date_time);
            parsedDate = dt.toLocaleDateString("en-CA"); // "YYYY-MM-DD"
            const hh = String(dt.getHours()).padStart(2, "0");
            const mm = String(dt.getMinutes()).padStart(2, "0");
            parsedTime = `${hh}:${mm}`; // "HH:mm"
          }

          formik.setValues({
            image: data?.image || null,
            club_id: data?.club_id || null,
            item_name: data?.item_name || "",
            category: data?.category || null,
            description: data?.description || "",
            found_at_location: data?.found_at_location || null,
            found_date: parsedDate, // ✅ "YYYY-MM-DD"
            found_time: parsedTime, // ✅ "HH:mm"
            found_date_time: data?.found_date_time || "", // ✅ original ISO string
            loggedBy: data?.loggedBy || user?.name,
            verification_notes: data?.verification_notes || "",
            status: data?.status || "AVAILABLE",
          });
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (editingOption) {
      fetchLostItemById(editingOption);
    }
  }, [editingOption]);

  useEffect(() => {
    const { found_date, found_time } = formik.values;

    if (found_date && found_time) {
      const [h, m] = found_time.split(":").map(Number);
      const combined = new Date(found_date);
      combined.setHours(h, m, 0, 0);
      // ✅ ISO format: 2026-03-18T16:45:00Z
      formik.setFieldValue("found_date_time", combined.toISOString());
    } else {
      formik.setFieldValue("found_date_time", "");
    }
  }, [formik.values.found_date, formik.values.found_time]);

  // Redux state
  const dispatch = useDispatch();
  const { lists, loading } = useSelector((state) => state.optionList);

  // Fetch option lists
  useEffect(() => {
    dispatch(fetchOptionList("FOUND_LOCATION"));
    dispatch(fetchOptionList("LOST_CATEGORY"));
  }, [dispatch]);

  // Extract Redux lists
  const foundLocation = lists["FOUND_LOCATION"] || [];
  const lostCategory = lists["LOST_CATEGORY"] || [];

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      onClose();
    }
  };

  const handleFileChange = (e, formik) => {
    const file = e.target.files[0];
    if (!file) return;
    formik.setFieldValue("image", file); // for preview
  };

  return (
    <div
      className="bg--blur create--lead--container overflow-auto hide--overflow fixed top-0 left-0 z-[999] w-full bg-black bg-opacity-60 h-full"
      onClick={handleOverlayClick}
    >
      <div
        className="min-h-[70vh]  w-[95%] max-w-[630px] mx-auto mt-[100px] mb-[100px] container--leadbox rounded-[10px] flex flex-col"
        ref={leadBoxRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-t-[10px] flex gap-3 items-center justify-between py-4 px-4 border-b">
          <h2 className="text-xl font-semibold">
            {editingOption ? "View Lost Item" : "Add Lost Item"}
          </h2>
          <div className="close--lead cursor-pointer" onClick={onClose}>
            <IoCloseCircle className="text-3xl" />
          </div>
        </div>
        <div className="flex-1s flexs ">
          <form
            onSubmit={formik.handleSubmit}
            className="flex flex-col gap-3 mt-0"
          >
            <div className="p-4 flex-1 bg-white rounded-b-[10px]">
              <div className="grid grid-cols-2 gap-4">
                {/* Image Preview */}
                <div className="row-span-2">
                  <div className="bg-gray-100 rounded-lg w-full h-[160px] overflow-hidden">
                    {formik.values?.image ? (
                      <img
                        src={
                          formik.values.image instanceof File
                            ? URL.createObjectURL(formik.values.image)
                            : formik.values.image
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

                {/* Image Upload */}
                {editingOption ? null : (
                  <div>
                    <label className="mb-2 block">
                      Image<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        name="image"
                        // onChange={handleFileChange} // ✅ no value prop here
                        onChange={(e) => handleFileChange(e, formik)}
                        onBlur={() => formik.setFieldTouched("image", true)}
                        className={`custom--input w-full ${
                          editingOption
                            ? "!bg-gray-100 pointer-events-none text-gray-500"
                            : ""
                        }`}
                        disabled={editingOption}
                      />
                    </div>

                    {formik.touched.image && formik.errors.image && (
                      <div className="text-red-500 text-sm">
                        {formik.errors.image}
                      </div>
                    )}
                  </div>
                )}

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
                      isDisabled={editingOption}
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
                    Item Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="item_name"
                    value={formik.values.item_name}
                    // onChange={formik.handleChange}
                    onKeyDown={blockNonLettersAndNumbers}
                    onChange={(e) => {
                      const cleaned = sanitizeTextWithNumbers(e.target.value);
                      formik.setFieldValue("item_name", cleaned);
                    }}
                    onBlur={formik.handleBlur}
                    placeholder="Item Name"
                    className={`custom--input w-full ${
                      editingOption
                        ? "!bg-gray-100 pointer-events-none text-gray-500"
                        : ""
                    }`}
                    disabled={editingOption}
                  />
                  {formik.touched.item_name && formik.errors.item_name && (
                    <div className="text-red-500 text-sm">
                      {formik.errors.item_name}
                    </div>
                  )}
                </div>
                <div>
                  <label className="mb-2 block">
                    Category<span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="category"
                    value={
                      lostCategory.find(
                        (option) => option.value === formik.values.category,
                      ) || null
                    }
                    onChange={(option) =>
                      formik.setFieldValue(
                        "category",
                        option ? option.value : "",
                      )
                    }
                    options={lostCategory}
                    placeholder="Select Category"
                    styles={customStyles}
                    isDisabled={editingOption}
                  />
                  {formik.touched.category && formik.errors.category && (
                    <div className="text-red-500 text-sm">
                      {formik.errors.category}
                    </div>
                  )}
                </div>
                <div>
                  <label className="mb-2 block">
                    Found At (Location)<span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="found_at_location"
                    value={
                      foundLocation.find(
                        (option) =>
                          option.value === formik.values.found_at_location,
                      ) || null
                    }
                    onChange={(option) =>
                      formik.setFieldValue(
                        "found_at_location",
                        option ? option.value : "",
                      )
                    }
                    options={foundLocation}
                    placeholder="Select Location"
                    styles={customStyles}
                    isDisabled={editingOption}
                  />
                  {formik.touched.found_at_location &&
                    formik.errors.found_at_location && (
                      <div className="text-red-500 text-sm">
                        {formik.errors.found_at_location}
                      </div>
                    )}
                </div>

                {/* Start Date Field */}
                <div>
                  <label className="mb-2 block">
                    Date & Time<span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="custom--date relative">
                      {/* Calendar Icon */}
                      <span className="absolute z-[1] mt-[11px] ml-[15px]">
                        <FaCalendarDays />
                      </span>
                      <DatePicker
                        selected={
                          formik.values.found_date
                            ? new Date(formik.values.found_date)
                            : null
                        }
                        onChange={(date) => {
                          formik.setFieldValue(
                            "found_date",
                            date.toLocaleDateString("en-CA"),
                          );
                          formik.setFieldValue("found_time", ""); // reset time on date change
                        }}
                        onBlur={() =>
                          formik.setFieldTouched("found_date", true)
                        }
                        dateFormat="dd-MM-yyyy"
                        maxDate={new Date()} // ✅ no future dates
                        placeholderText="Date"
                        className="custom--input w-full input--icon"
                        onKeyDown={(e) => e.preventDefault()}
                        disabled={editingOption}
                      />
                    </div>
                    <div className="custom--date relative">
                      <span className="absolute z-[1] mt-[11px] ml-[15px]">
                        <FiClock />
                      </span>
                      <Select
                        name="found_time"
                        value={
                          startTimeOptions.find(
                            (opt) => opt.value === formik.values.found_time,
                          ) || null
                        }
                        onChange={(option) => {
                          formik.setFieldValue("found_time", option.value);
                        }}
                        options={startTimeOptions}
                        placeholder="Time"
                        isDisabled={!formik.values.found_date || editingOption}
                        styles={selectIcon}
                      />
                    </div>
                  </div>
                  {formik.touched.found_date_time &&
                    formik.errors.found_date_time && (
                      <div className="text-red-500 text-sm mt-1">
                        {formik.errors.found_date_time}
                      </div>
                    )}
                </div>

                <div>
                  <label className="mb-2 block">Logged By</label>
                  <input
                    name="loggedBy"
                    type="text"
                    value={formik.values.loggedBy}
                    disabled={true}
                    className="custom--input w-full !bg-gray-100 pointer-events-none text-gray-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="mb-2 block">Description</label>

                  <textarea
                    name="description"
                    value={formik.values.description}
                    // onChange={formik.handleChange}
                    onKeyDown={blockNonLettersAndNumbers}
                    onChange={(e) => {
                      const cleaned = sanitizeTextWithNumbers(e.target.value);
                      formik.setFieldValue("description", cleaned);
                    }}
                    placeholder="Description"
                    className={`custom--input w-full ${
                      editingOption
                        ? "!bg-gray-100 pointer-events-none text-gray-500"
                        : ""
                    }`}
                    disabled={editingOption}
                  />
                </div>

                {editingOption && editingOption && (
                  <div className="col-span-2">
                    <label className="mb-2 block">Verification Notes</label>

                    <textarea
                      name="verification_notes"
                      value={formik.values.verification_notes}
                      onChange={formik.handleChange}
                      placeholder="Any additional remarks"
                      className={`custom--input w-full ${
                        editingOption
                          ? "!bg-gray-100 pointer-events-none text-gray-500"
                          : ""
                      }`}
                      disabled={editingOption}
                    />
                  </div>
                )}
              </div>
            </div>
            {!editingOption && (
              <div className="flex gap-4 py-5 pt-0 justify-end">
                <button
                  type="button"
                  className="px-4 py-2 bg-transparent border border-white text-white font-semibold rounded max-w-[150px] w-full"
                  onClick={onClose}
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
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddNewItemModal;
