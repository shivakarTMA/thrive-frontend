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
} from "../../Helper/helper";
import Select from "react-select";
import { FaCalendarDays } from "react-icons/fa6";
import { toast } from "react-toastify";
import { authAxios } from "../../config/config";
import { useClubDateTime } from "../../hooks/useClubDateTime";
import { useDateTimePicker } from "../../hooks/useDateTimePicker";
import { PiImageFill } from "react-icons/pi";

const AddNewItemModal = ({
  onClose,
  clubOptions,
  editingOption,
  fetchLostFoundList,
}) => {
  const leadBoxRef = useRef(null);
  const { user } = useSelector((state) => state.auth);

  // const dateClickedRef = useRef(false);
  // const [dateOnlySelected, setDateOnlySelected] = useState(false);

  // AFTER — add a ref mirror so onSubmit reads live value
  const dateClickedRef = useRef(false);
  const dateOnlySelectedRef = useRef(false);           // ← ADD THIS
  const [dateOnlySelected, setDateOnlySelected] = useState(false);

  const formik = useFormik({
    initialValues: {
      image: null,
      club_id: null,
      item_name: "",
      category: null,
      description: "",
      found_at_location: null,
      found_date_time: null,
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
      // found_date_time: Yup.date().required("Date & Time is required"),
      found_date_time: Yup.date()
        .nullable()
        .required("Date & Time is required")
        .typeError("Invalid Date & Time")
        .test(
          "is-valid-date",
          "Invalid Date & Time",
          (value) => value instanceof Date && !isNaN(value)
        ),
    }),
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { resetForm }) => {
      if (dateOnlySelectedRef.current) {               // ← was dateOnlySelected
        toast.error("Please select time as well");
        return;
      }
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

  useEffect(() => {
    const fetchProductById = async (id) => {
      try {
        const res = await authAxios().get(`/lost/found/${id}`);
        const data = res.data?.data || res.data || null;

        if (data) {
          formik.setValues({
            image: data?.image || null,
            club_id: data?.club_id || null,
            item_name: data?.item_name || "",
            category: data?.category || null,
            description: data?.description || "",
            found_at_location: data?.found_at_location || null,
            found_date_time: data?.found_date_time
              ? new Date(data.found_date_time)
              : null,
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
      fetchProductById(editingOption);
    }
  }, [editingOption]);

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

  const now = new Date();

  const selectedClub = clubOptions.find(
    (club) => club.value?.toString() === formik.values.club_id?.toString(),
  );

  const { filterTime: followUpFilterTime } = useClubDateTime(
    formik.values.found_date_time,
    selectedClub,
  );

  const followUpDT = useDateTimePicker(
    formik,
    "found_date_time",
    followUpFilterTime,
  );

now.setSeconds(0);
now.setMilliseconds(0);

const isToday =
  !followUpDT.selected ||
  new Date(followUpDT.selected).toDateString() === now.toDateString();

  const maxTime = isToday
  ? now
  : new Date(0, 0, 0, 23, 59, 59);

// ✅ NEW: Combine club filter + past time restriction
const combinedFilterTime = (time) => {
  // First apply club timing filter
  if (followUpFilterTime && !followUpFilterTime(time)) {
    return false;
  }

  // Then apply "no future time for today"
  if (isToday) {
    return time <= now;
  }

  return true;
};

const handleDateTimeChange = (date) => {
  const prev = followUpDT.selected;

  if (!date) {
    setDateOnlySelected(false);
    dateOnlySelectedRef.current = false;
    followUpDT.handleDateTime(date);
    return;
  }

  // If no previous value OR the date portion changed → it's a date click (no time yet)
  const isDateChange =
    !prev ||
    new Date(prev).toDateString() !== new Date(date).toDateString();

  if (isDateChange) {
    setDateOnlySelected(true);
    dateOnlySelectedRef.current = true;
  } else {
    // Same date, different time → user picked a time slot
    setDateOnlySelected(false);
    dateOnlySelectedRef.current = false;
  }

  followUpDT.handleDateTime(date);
};

// const handleDateTimeChange = (date) => {
//   if (dateClickedRef.current) {
//     dateClickedRef.current = false;
//     dateOnlySelectedRef.current = true;              // ← ADD THIS
//     setDateOnlySelected(true);
//   } else {
//     dateOnlySelectedRef.current = false;             // ← ADD THIS
//     setDateOnlySelected(false);
//   }
//   followUpDT.handleDateTime(date);
// };

useEffect(() => {
  formik.setFieldValue("found_date_time", null);
  dateOnlySelectedRef.current = false;              // ← ADD THIS
  setDateOnlySelected(false);
}, [formik.values.club_id]);

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
        className="min-h-[70vh]  w-[95%] max-w-xl mx-auto mt-[100px] mb-[100px] container--leadbox rounded-[10px] flex flex-col"
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
            <div className="p-6 flex-1 bg-white rounded-b-[10px]">
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
                <div>
                  <label className="mb-2 block">
                    Date & Time <span className="text-red-500">*</span>
                  </label>
                  <div className="custom--date flex-1">
                    <span className="absolute z-[1] mt-[9px] ml-[15px]">
                      <FaCalendarDays />
                    </span>
                    {/* <DatePicker
                      selected={followUpDT.selected}
                      onChange={followUpDT.handleDateTime}
                      onChangeRaw={followUpDT.handleChangeRaw}
                      showTimeSelect
                      timeFormat="hh:mm aa"
                      dateFormat={followUpDT.dateFormat}
                      placeholderText="Select date & time"
                      maxDate={now}
                      maxTime={maxTime} // ✅ ADD THIS
                      minTime={new Date(0, 0, 0, 0, 0)} // optional but safe
                      filterTime={combinedFilterTime}
                      disabled={editingOption || formik.values.club_id === null}
                      className="border px-3 py-2 w-full input--icon"
                      onKeyDown={(e) => e.preventDefault()}
                    /> */}
                    <DatePicker
                      selected={followUpDT.selected}
                      onChange={handleDateTimeChange}                   
                      onChangeRaw={followUpDT.handleChangeRaw}
                      showTimeSelect
                      timeFormat="hh:mm aa"
                      dateFormat={followUpDT.dateFormat}
                      placeholderText="Select date & time"
                      maxDate={now}
                      maxTime={maxTime}
                      minTime={new Date(0, 0, 0, 0, 0)}
                      filterTime={combinedFilterTime}
                      disabled={editingOption || formik.values.club_id === null}
                      className="border px-3 py-2 w-full input--icon"
                      onKeyDown={(e) => e.preventDefault()}
                    />
                  </div>
                  {/* {formik.touched.found_date_time &&
                    formik.errors.found_date_time && (
                      <p className="text-sm text-red-500 mt-1">
                        {formik.errors.found_date_time}
                      </p>
                    )} */}
                    {dateOnlySelected ? (
                      <p className="text-sm text-red-500 mt-1">Please select time as well</p>
                    ) : (
                      formik.touched.found_date_time && formik.errors.found_date_time && (
                        <p className="text-sm text-red-500 mt-1">
                          {formik.errors.found_date_time}
                        </p>
                      )
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
