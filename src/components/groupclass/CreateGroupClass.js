import React, { useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { customStyles, selectIcon } from "../../Helper/helper";
import { toast } from "react-toastify";
import { IoCloseCircle } from "react-icons/io5";
import { FaListCheck } from "react-icons/fa6";
import { LuCalendar } from "react-icons/lu";
import { FiClock } from "react-icons/fi";
import CreatableSelect from "react-select/creatable";

// Mock options (Replace with actual API data)
const trainerList = [
  { value: "vishal", label: "Vishal" },
  { value: "nitin", label: "Nitin" },
  { value: "jatin", label: "Jatin" },
];

const centreList = [
  { value: "delhi", label: "Delhi" },
  { value: "gurugram", label: "Gurugram" },
  { value: "noida", label: "Noida" },
];

const tagOptions = [
  { value: "cardio", label: "Cardio" },
  { value: "hiit", label: "HIIT" },
  { value: "yoga", label: "Yoga" },
  { value: "strength", label: "Strength" },
];

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const paymentTypeOptions = [
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
];

const convertToDateTime = (timeStr, dateStr) => {
  // timeStr: "07:00 AM", dateStr: "2025-07-10"
  const combined = `${dateStr} ${timeStr}`;
  const date = new Date(combined);
  return isNaN(date) ? null : date;
};

const validationSchema = Yup.object().shape({
  classTitle: Yup.string().required("Class title is required"),
  centreName: Yup.object().required("Centre is required"),
  classTrainer: Yup.object().required("Trainer is required"),
  classDate: Yup.date().required("Class date is required"),
  startTime: Yup.date().required("Start time is required"),
  endTime: Yup.date().required("End time is required"),
  maxCapacity: Yup.number().required("Max capacity is required").min(1),
  waitlistCapacity: Yup.number().min(0),
  classDescription: Yup.string(),
  classTags: Yup.array(),
  listingStatus: Yup.object().required("Listing status is required"),
  paymentType: Yup.string().required("Please select payment type"),
  price: Yup.number()
    .nullable()
    .when("paymentType", {
      is: "paid",
      then: (schema) => schema.required("Price is required").min(0),
      otherwise: (schema) => schema.nullable(),
    }),
  classImage: Yup.mixed()
    .nullable()
    .test("fileType", "Unsupported File Format", (value) => {
      if (!value) return true;
      if (typeof value === "string") return true; // image already uploaded (string URL)
      return ["image/jpeg", "image/png", "image/jpg"].includes(value.type);
    }),
});

const CreateGroupClass = ({ onClassCreated, initialData, setShowModal }) => {
  console.log(initialData, "initialData");
  const [availableTags, setAvailableTags] = useState(tagOptions);
  const leadBoxRef = useRef(null);
  const formik = useFormik({
    initialValues: {
      classTitle: initialData?.classTitle || "",
      centreName: initialData?.centreName
        ? centreList.find((c) => c.value === initialData.centreName)
        : null,
      classTrainer: initialData?.classTrainer
        ? trainerList.find((c) => c.value === initialData.classTrainer)
        : null,
      classDate: initialData?.classDate
        ? new Date(initialData?.classDate)
        : null,
      startTime: initialData
        ? convertToDateTime(initialData?.startTime, initialData?.classDate)
        : null,
      endTime: initialData
        ? convertToDateTime(initialData?.endTime, initialData?.classDate)
        : null,
      maxCapacity: initialData?.maxCapacity || "",
      waitlistCapacity: initialData?.waitlistCapacity || "",
      classImage: initialData?.classImage || "",
      classDescription: initialData?.classDescription || "",
      classTags: initialData?.classTags
  ? initialData.classTags.map((tag) => ({
      label: tag,
      value: tag.toLowerCase(),
    }))
  : [],

      listingStatus: initialData?.listingStatus
        ? statusOptions.find((c) => c.value === initialData.listingStatus)
        : null,
      paymentType: initialData?.paymentType || "free",
      price: initialData?.price || "",
    },
    validationSchema,
    onSubmit: (values) => {
      const formatDate = (date) => {
        return date ? date.toISOString().split("T")[0] : null; // YYYY-MM-DD
      };

      const formatTime = (date) => {
        return date
          ? date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
          : null; // hh:mm AM/PM
      };

      const payload = {
        id: initialData?.id || Date.now(),
        classTitle: values.classTitle,
        centreName: values.centreName?.value,
        classTrainer: values.classTrainer?.value,
        classDate: formatDate(values.classDate),
        startTime: formatTime(values.startTime),
        endTime: formatTime(values.endTime),
        maxCapacity: Number(values.maxCapacity),
        waitlistCapacity:
          values.waitlistCapacity !== ""
            ? Number(values.waitlistCapacity)
            : null,
        classImage: values.classImage,
        classDescription: values.classDescription,
        classTags: values.classTags?.map((tag) => tag.value),
        listingStatus: values.listingStatus?.value,
        paymentType: values.paymentType,
        price: values.paymentType === "paid" ? Number(values.price) : null,
      };

      console.log("Final Payload:", payload);
      onClassCreated(payload);
      toast.success("Class created successfully");
      // setShowModal(false);
    },
  });

  const handleTagChange = (newValue, actionMeta) => {
    if (actionMeta.action === "create-option") {
      const newTag = {
        label: newValue[newValue.length - 1].label,
        value: newValue[newValue.length - 1].label,
      };
      setAvailableTags((prev) => [...prev, newTag]);
      formik.setFieldValue("classTags", [...newValue.slice(0, -1), newTag]);
    } else {
      formik.setFieldValue("classTags", newValue);
    }
  };

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setShowModal(false);
    }
  };

  const handleClassModal = () => {
    setShowModal(false);
  };

  return (
    <div
      className="bg--blur create--lead--container overflow-auto hide--overflow fixed top-0 left-0 z-[999] w-full bg-black bg-opacity-60 h-full"
      onClick={handleOverlayClick}
    >
      <div
        className="min-h-[70vh]  w-[95%] max-w-5xl mx-auto mt-[100px] mb-[100px] container--leadbox rounded-[10px] flex flex-col"
        ref={leadBoxRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-t-[10px] flex gap-3 items-center justify-between py-4 px-4 border-b">
          <h2 className="text-xl font-semibold">Create a Class</h2>
          <div
            className="close--lead cursor-pointer"
            onClick={handleClassModal}
          >
            <IoCloseCircle className="text-3xl" />
          </div>
        </div>
        <div className="flex-1s flexs">
          <form onSubmit={formik.handleSubmit}>
            <div className="flex bg-white rounded-b-[10px]">
              <div className="p-6 flex-1">
                <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block">
                      Class Title<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FaListCheck />
                      </span>
                      <input
                        type="text"
                        name="classTitle"
                        value={formik.values.classTitle}
                        onChange={formik.handleChange}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.classTitle && formik.errors.classTitle && (
                      <p className="text-red-500">{formik.errors.classTitle}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block">
                      Centre Name<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FaListCheck />
                      </span>
                      <Select
                        options={centreList}
                        value={formik.values.centreName}
                        onChange={(val) =>
                          formik.setFieldValue("centreName", val)
                        }
                        styles={selectIcon}
                      />
                    </div>
                    {formik.touched.centreName && formik.errors.centreName && (
                      <p className="text-red-500">{formik.errors.centreName}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block">
                      Trainer Name<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FaListCheck />
                      </span>
                      <Select
                        options={trainerList}
                        value={formik.values.classTrainer}
                        onChange={(val) =>
                          formik.setFieldValue("classTrainer", val)
                        }
                        styles={selectIcon}
                      />
                    </div>
                    {formik.touched.classTrainer &&
                      formik.errors.classTrainer && (
                        <p className="text-red-500">
                          {formik.errors.classTrainer}
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="mb-2 block">
                      Class Date<span className="text-red-500">*</span>
                    </label>
                    <div className="custom--date dob-format relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <LuCalendar />
                      </span>
                      <DatePicker
                        selected={formik.values.classDate}
                        onChange={(date) =>
                          formik.setFieldValue("classDate", date)
                        }
                        showMonthDropdown
                        showYearDropdown
                        minDate={new Date()} // ✅ Prevent past dates
                        dateFormat="dd MMM yyyy"
                        dropdownMode="select"
                        placeholderText="Select date"
                        className="input--icon"
                      />
                    </div>
                    {formik.touched.classDate && formik.errors.classDate && (
                      <p className="text-red-500">{formik.errors.classDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block">
                      Start Time<span className="text-red-500">*</span>
                    </label>

                    <div className="custom--date dob-format relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FiClock />
                      </span>

                      <DatePicker
                        selected={formik.values.startTime}
                        onChange={(date) =>
                          formik.setFieldValue("startTime", date)
                        }
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        timeCaption="Time"
                        dateFormat="hh:mm aa"
                        placeholderText="Select time"
                        className="input--icon"
                      />
                    </div>

                    {formik.touched.startTime && formik.errors.startTime && (
                      <p className="text-red-500">{formik.errors.startTime}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block">
                      End Time<span className="text-red-500">*</span>
                    </label>

                    <div className="custom--date dob-format relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FiClock />
                      </span>

                      <DatePicker
                        selected={formik.values.endTime}
                        onChange={(date) =>
                          formik.setFieldValue("endTime", date)
                        }
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        timeCaption="Time"
                        dateFormat="hh:mm aa"
                        placeholderText="Select time"
                        className="input--icon"
                      />
                    </div>

                    {formik.touched.startTime && formik.errors.startTime && (
                      <p className="text-red-500">{formik.errors.startTime}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block">
                      Max Capacity<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FaListCheck />
                      </span>
                      <input
                        type="number"
                        name="maxCapacity"
                        value={formik.values.maxCapacity}
                        onChange={formik.handleChange}
                        className="custom--input w-full input--icon"
                      />
                    </div>

                    {formik.touched.maxCapacity &&
                      formik.errors.maxCapacity && (
                        <p className="text-red-500">
                          {formik.errors.maxCapacity}
                        </p>
                      )}
                  </div>
                  <div>
                    <label className="mb-2 block">Waitlist Capacity</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FaListCheck />
                      </span>
                      <input
                        type="number"
                        name="waitlistCapacity"
                        value={formik.values.waitlistCapacity}
                        onChange={formik.handleChange}
                        className="custom--input w-full input--icon"
                      />
                    </div>

                    {formik.touched.waitlistCapacity &&
                      formik.errors.waitlistCapacity && (
                        <p className="text-red-500">
                          {formik.errors.waitlistCapacity}
                        </p>
                      )}
                  </div>
                  <div>
                    <label className="mb-2 block">Class Image</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FaListCheck />
                      </span>
                      <input
                        type="file"
                        name="classImage"
                        accept="image/*"
                        onChange={(event) => {
                          const file = event.currentTarget.files[0];
                          formik.setFieldValue("classImage", file);
                        }}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.classImage && formik.errors.classImage && (
                      <p className="text-red-500">{formik.errors.classImage}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-2 block">Class Tags</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FaListCheck />
                      </span>
                      {/* <Select
                        options={tagOptions}
                        isMulti
                        value={formik.values.classTags}
                        onChange={(val) =>
                          formik.setFieldValue("classTags", val)
                        }
                        styles={selectIcon}
                      /> */}
                      <CreatableSelect
                        options={availableTags}
                        isMulti
                        value={formik.values.classTags}
                        onChange={handleTagChange}
                        styles={selectIcon}
                      />
                    </div>
                    {formik.touched.classTags && formik.errors.classTags && (
                      <p className="text-red-500">{formik.errors.classTags}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block">
                      Listing Status<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FaListCheck />
                      </span>
                      <Select
                        options={statusOptions}
                        value={formik.values.listingStatus}
                        onChange={(val) =>
                          formik.setFieldValue("listingStatus", val)
                        }
                        styles={selectIcon}
                      />
                    </div>
                    {formik.touched.listingStatus &&
                      formik.errors.listingStatus && (
                        <p className="text-red-500">
                          {formik.errors.listingStatus}
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="mb-2 block">
                      Class Type<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FaListCheck />
                      </span>
                      <Select
                        options={paymentTypeOptions}
                        value={paymentTypeOptions.find(
                          (opt) => opt.value === formik.values.paymentType
                        )}
                        onChange={(val) =>
                          formik.setFieldValue("paymentType", val.value)
                        }
                        styles={selectIcon}
                      />
                    </div>
                    {formik.touched.paymentType &&
                      formik.errors.paymentType && (
                        <p className="text-red-500">
                          {formik.errors.paymentType}
                        </p>
                      )}
                  </div>

                  {formik.values.paymentType === "paid" && (
                    <div>
                      <label className="mb-2 block">
                        Price (₹)<span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                          <FaListCheck />
                        </span>
                        <input
                          type="number"
                          name="price"
                          value={formik.values.price}
                          onChange={formik.handleChange}
                          className="custom--input w-full input--icon"
                        />
                      </div>
                      {formik.touched.price && formik.errors.price && (
                        <p className="text-red-500">{formik.errors.price}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="mb-2 block">Description</label>
                    <textarea
                      name="classDescription"
                      value={formik.values.classDescription}
                      onChange={formik.handleChange}
                      className="custom--input w-full "
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-4 py-5 justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-transparent border border-white text-white font-semibold rounded max-w-[150px] w-full"
                onClick={() => {
                  formik.resetForm();
                  setShowModal(false);
                }}
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

export default CreateGroupClass;
