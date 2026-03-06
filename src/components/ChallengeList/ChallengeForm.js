// Import required libraries and components
import React, { useEffect, useRef, useState } from "react";
import { IoCloseCircle } from "react-icons/io5";
import { FaListUl, FaHashtag } from "react-icons/fa";
import { LuCalendar } from "react-icons/lu";
import { FiImage } from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { RiMedalLine } from "react-icons/ri";
import { toast } from "react-toastify";
import { authAxios } from "../../config/config";
import { FaListCheck } from "react-icons/fa6";
import Select from "react-select";
import {
  blockInvalidNumberKeys,
  customStyles,
  filterActiveItems,
  sanitizePositiveInteger,
} from "../../Helper/helper";
import { PiImageFill } from "react-icons/pi";
import { format } from "date-fns";

const challengeType = [
  { label: "Steps", value: "STEPS" },
  { label: "Distance Travelled", value: "DISTANCE_TRAVELLED" },
  { label: "Calories Burnt", value: "CALORIES_BURNT" },
  { label: "Active Minutes", value: "ACTIVE_MINUTES" },
];
const frequencyType = [
  { label: "Daily", value: "DAILY" },
  { label: "Cumulative", value: "CUMULATIVE" },
];
const statusType = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
  { label: "Ongoing", value: "ONGOING" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Upcoming", value: "UPCOMING" },
];

// Define the ChallengeForm component
const ChallengeForm = ({ setShowModal, editingOption, formik }) => {
  const leadBoxRef = useRef();
  const [club, setClub] = useState([]);

  // 👉 Local states for Terms of Play
  const [conditionList, setConditionList] = useState([]);
  const [tempCondition, setTempCondition] = useState("");

  const now = new Date();
  const minTimeDefault = new Date();
  minTimeDefault.setHours(6, 0, 0, 0);

  const maxTimeDefault = new Date();
  maxTimeDefault.setHours(22, 0, 0, 0);

  // Helper to round up current time to next interval
  const roundUpTime = (date, interval) => {
    const ms = 1000 * 60 * interval; // interval in ms
    return new Date(Math.ceil(date.getTime() / ms) * ms);
  };

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

  useEffect(() => {
    fetchClub();
  }, []);

  const clubOptions =
    club?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];

  const availableStatus = editingOption
    ? statusType // all options when editing
    : statusType.filter(
        (opt) => opt.value === "ACTIVE" || opt.value === "INACTIVE",
      ); // only ACTIVE/INACTIVE when creating

  // Fetch exercise by ID when editingExercise changes
  useEffect(() => {
    const fetchChallengeById = async () => {
      if (editingOption) {
        try {
          const response = await authAxios().get(`/challenge/${editingOption}`);
          const exerciseData = response.data?.data || response.data || null;

          console.log(exerciseData, "exerciseData");

          // Set form values from fetched data
          formik.setValues({
            club_id: exerciseData?.club_id || "",
            name: exerciseData?.name || "",
            caption: exerciseData?.caption || "",
            description: exerciseData?.description || "",
            challenge_type: exerciseData?.challenge_type || "",
            image: exerciseData?.image || "",
            goal: exerciseData?.goal || "",
            start_date_time: exerciseData?.start_date_time
              ? new Date(exerciseData.start_date_time)
              : null,
            end_date_time: exerciseData?.end_date_time || "",
            frequency: exerciseData?.frequency || "",
            target_value: exerciseData?.target_value || "",
            target_unit: exerciseData?.target_unit || "",
            condition: exerciseData?.condition || "[]",
            reward_first: exerciseData?.reward_first || "",
            reward_second: exerciseData?.reward_second || "",
            reward_third: exerciseData?.reward_third || "",
            about_challenge: exerciseData?.about_challenge || "",
            position: exerciseData?.position || "",
            status: exerciseData?.status || "",
            join_in_between: exerciseData?.join_in_between || null,
            winning_caption_heading:
              exerciseData?.winning_caption_heading || "",
            winning_caption_subheading:
              exerciseData?.winning_caption_subheading || "",
            progress_caption_heading:
              exerciseData?.progress_caption_heading || "",
            progress_caption_subheading:
              exerciseData?.progress_caption_subheading || "",
          });
          try {
            setConditionList(JSON.parse(exerciseData?.condition || "[]"));
          } catch {
            setConditionList([]);
          }
        } catch (error) {
          toast.error("Failed to fetch exercise data.");
          console.error("Error fetching exercise:", error);
        }
      }
    };

    fetchChallengeById();
  }, [editingOption]);

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setShowModal(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewURL = URL.createObjectURL(file);

      formik.setFieldValue("image", previewURL); // for preview
      formik.setFieldValue("imageFile", file); // actual file to upload
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
        {/* Header Section */}
        <div className="bg-white rounded-t-[10px] flex gap-3 items-center justify-between py-4 px-4 border-b">
          <h2 className="text-xl font-semibold">
            {editingOption ? "Edit Challenge" : "Create Challenge"}
          </h2>
          <IoCloseCircle
            className="text-3xl cursor-pointer"
            onClick={() => {
              formik.resetForm({ values: formik.initialValues });
              setShowModal(false);
            }}
          />
        </div>

        {/* Form Section */}
        <div className="flex-1">
          <form onSubmit={formik.handleSubmit} className="p-0 space-y-0">
            <div className="flex bg-white rounded-b-[10px]">
              <div className="p-6 flex-1">
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

                  {/* Image Upload Field */}
                  <div>
                    <label className="mb-2 block">
                      Image<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FiImage />
                      </span>
                      <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleFileChange} // ✅ no value prop here
                        onBlur={() => formik.setFieldTouched("image", true)}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.image && formik.errors.image && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.image}
                      </p>
                    )}
                  </div>

                  {/* Club Field */}
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
                      <p className="text-red-500 text-sm">
                        {formik.errors.club_id}
                      </p>
                    )}
                  </div>

                  {/* Name Field */}
                  <div>
                    <label className="mb-2 block">
                      Challenge Name<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaListUl className="absolute top-[50%] translate-y-[-50%] left-[15px]" />
                      <input
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.name && formik.errors.name && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.name}
                      </p>
                    )}
                  </div>

                  {/* Caption Field */}
                  <div>
                    <label className="mb-2 block">
                      Caption<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaListUl className="absolute top-[50%] translate-y-[-50%] left-[15px]" />
                      <input
                        name="caption"
                        value={formik.values.caption}
                        onChange={formik.handleChange}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.caption && formik.errors.caption && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.caption}
                      </p>
                    )}
                  </div>

                  {/* Challenge Type Field */}
                  <div>
                    <label className="mb-2 block">
                      Challenge Type<span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <Select
                        name="challenge_type"
                        value={
                          challengeType.find(
                            (opt) =>
                              opt.value === formik.values?.challenge_type,
                          ) || null
                        }
                        options={challengeType}
                        onChange={(option) =>
                          formik.setFieldValue("challenge_type", option.value)
                        }
                        onBlur={() =>
                          formik.setFieldTouched("challenge_type", true)
                        }
                        styles={customStyles}
                      />
                    </div>
                    {formik.touched.challenge_type &&
                      formik.errors.challenge_type && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.challenge_type}
                        </p>
                      )}
                  </div>

                  {/* Start Date Field */}
                  {/* <div>
                    <label className="mb-2 block">
                      Start Date & Time<span className="text-red-500">*</span>
                    </label>
                    <div className="custom--date">
                      <span className="absolute mt-[10px] ml-[15px] z-[1]">
                        <LuCalendar />
                      </span>
                      <DatePicker
                        onChangeRaw={(e) => e.preventDefault()}
                        selected={formik.values.start_date_time}
                        onChange={(date) => {
                          formik.setFieldValue("start_date_time", date || null);

                          const currentEnd = formik.values.end_date_time
                            ? new Date(formik.values.end_date_time)
                            : null;
                          if (currentEnd && date && currentEnd <= date) {
                            formik.setFieldValue("end_date_time", null);
                          }
                        }}
                        showTimeSelect
                        timeFormat="hh:mm aa"
                        dateFormat="dd/MM/yyyy hh:mm aa"
                        timeIntervals={30}
                        placeholderText="Select date & time"
                        minDate={new Date()} // ✅ always fresh "now", not stale
                        // ✅ KEY FIX: compute fresh minTime inline every render
                        minTime={(() => {
                          const freshNow = new Date(); // always current time
                          const selectedDate = formik.values.start_date_time
                            ? new Date(formik.values.start_date_time)
                            : null;

                          const isToday = selectedDate
                            ? selectedDate.toDateString() ===
                              freshNow.toDateString()
                            : true; // no date selected yet → treat as today

                          if (isToday) {
                            return roundUpTime(freshNow, 30); // ✅ blocks all past time slots
                          }

                          // Future date selected → allow from 6:00 AM
                          return minTimeDefault;
                        })()}
                        maxTime={maxTimeDefault}
                        className="input--icon"
                      />
                    </div>
                    {formik.touched.start_date_time &&
                      formik.errors.start_date_time && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.start_date_time}
                        </p>
                      )}
                  </div> */}

                  {/* End Date Field */}
                  {/* <div>
                    <label className="mb-2 block">
                      End Date & Time<span className="text-red-500">*</span>
                    </label>
                    <div className="custom--date ">
                      <span className="absolute mt-[12px] ml-[15px] z-[1]">
                        <LuCalendar />
                      </span>
                      <DatePicker
                        selected={
                          formik.values.end_date_time
                            ? new Date(formik.values.end_date_time)
                            : null
                        }
                        onChange={
                          (date) => formik.setFieldValue("end_date_time", date)
                          // formik.setFieldValue(
                          //   "end_date_time",
                          //   format(date, "yyyy-MM-dd hh:mm aa"),
                          // )
                        }
                        showTimeSelect
                        timeFormat="hh:mm aa"
                        dateFormat="dd/MM/yyyy hh:mm aa"
                        minDate={
                          formik.values.start_date_time
                            ? new Date(formik.values.start_date_time)
                            : new Date()
                        }
                        className="input--icon"
                      />
                    </div>

                    {formik.touched.end_date_time &&
                      formik.errors.end_date_time && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.end_date_time}
                        </p>
                      )}
                  </div> */}

                  {/* Start Date Field */}
<div>
  <label className="mb-2 block">
    Start Date & Time<span className="text-red-500">*</span>
  </label>
  <div className="custom--date">
    <span className="absolute mt-[10px] ml-[15px] z-[1]">
      <LuCalendar />
    </span>
    <DatePicker
      onChangeRaw={(e) => e.preventDefault()}
      selected={formik.values.start_date_time}
      onChange={(date) => {
        if (!date) {
          formik.setFieldValue("start_date_time", null);
          formik.setFieldValue("end_date_time", null);
          return;
        }

        const freshNow = new Date();
        const selectedDate = new Date(date);
        const isToday =
          selectedDate.toDateString() === freshNow.toDateString();

        if (isToday) {
          const minAllowed = roundUpTime(freshNow, 30);
          // ✅ Issue 1 Fix: If selected time is in the past for today, force it to minAllowed
          if (selectedDate < minAllowed) {
            formik.setFieldValue("start_date_time", minAllowed);
            formik.setFieldValue("end_date_time", null);
            return;
          }
        }

        formik.setFieldValue("start_date_time", selectedDate);
        // ✅ Always reset end date when start changes
        formik.setFieldValue("end_date_time", null);
      }}
      showTimeSelect
      timeFormat="hh:mm aa"
      dateFormat="dd/MM/yyyy hh:mm aa"
      timeIntervals={30}
      placeholderText="Select date & time"
      minDate={new Date()}
      minTime={(() => {
        const freshNow = new Date();
        const selectedDate = formik.values.start_date_time
          ? new Date(formik.values.start_date_time)
          : null;

        const isToday = selectedDate
          ? selectedDate.toDateString() === freshNow.toDateString()
          : true;

        return isToday ? roundUpTime(freshNow, 30) : minTimeDefault;
      })()}
      maxTime={maxTimeDefault}
      className="input--icon"
    />
  </div>
  {formik.touched.start_date_time && formik.errors.start_date_time && (
    <p className="text-red-500 text-sm">{formik.errors.start_date_time}</p>
  )}
</div>

{/* End Date Field */}
{/* End Date Field */}
<div>
  <label className="mb-2 block">
    End Date & Time<span className="text-red-500">*</span>
  </label>
  <div className="custom--date">
    <span className="absolute mt-[10px] ml-[15px] z-[1]">
      <LuCalendar />
    </span>
    <DatePicker
      onChangeRaw={(e) => e.preventDefault()}
      disabled={!formik.values.start_date_time}
      selected={
        formik.values.end_date_time
          ? new Date(formik.values.end_date_time)
          : null
      }
      // ✅ KEY FIX: Open calendar on start date, not today
      openToDate={
        formik.values.start_date_time
          ? new Date(formik.values.start_date_time)
          : new Date()
      }
      onChange={(date) => {
        if (!date) {
          formik.setFieldValue("end_date_time", null);
          return;
        }

        const freshNow = new Date();
        const selectedEnd = new Date(date);
        const startDate = formik.values.start_date_time
          ? new Date(formik.values.start_date_time)
          : null;

        // ✅ KEY FIX: If user picks a time without picking a date first,
        // the picker defaults to today — force it to start date instead
        if (
          startDate &&
          selectedEnd.toDateString() === freshNow.toDateString() &&
          selectedEnd.toDateString() !== startDate.toDateString()
        ) {
          // Replace today's date with start date, keep the chosen time
          const corrected = new Date(startDate);
          corrected.setHours(
            selectedEnd.getHours(),
            selectedEnd.getMinutes(),
            0,
            0,
          );

          // Make sure corrected time is still after start time
          if (corrected <= startDate) {
            const afterStart = new Date(
              startDate.getTime() + 30 * 60 * 1000,
            );
            formik.setFieldValue("end_date_time", afterStart);
          } else {
            formik.setFieldValue("end_date_time", corrected);
          }
          return;
        }

        const isEndSameAsStart =
          startDate &&
          selectedEnd.toDateString() === startDate.toDateString();

        const isEndToday =
          selectedEnd.toDateString() === freshNow.toDateString();

        // End same day as start → must be after start time
        if (isEndSameAsStart && selectedEnd <= startDate) {
          const corrected = new Date(startDate.getTime() + 30 * 60 * 1000);
          formik.setFieldValue("end_date_time", corrected);
          return;
        }

        // End is today → must not be past
        if (isEndToday) {
          const minAllowed = roundUpTime(freshNow, 30);
          if (selectedEnd < minAllowed) {
            formik.setFieldValue("end_date_time", minAllowed);
            return;
          }
        }

        formik.setFieldValue("end_date_time", selectedEnd);
      }}
      showTimeSelect
      timeFormat="hh:mm aa"
      dateFormat="dd/MM/yyyy hh:mm aa"
      timeIntervals={30}
      placeholderText={
        !formik.values.start_date_time
          ? "Select start date first"
          : "Select date & time"
      }
      minDate={
        formik.values.start_date_time
          ? new Date(formik.values.start_date_time)
          : new Date()
      }
      minTime={(() => {
        const freshNow = new Date();
        const startDate = formik.values.start_date_time
          ? new Date(formik.values.start_date_time)
          : null;
        const endDate = formik.values.end_date_time
          ? new Date(formik.values.end_date_time)
          : null;

        // End same day as start
        if (
          startDate &&
          endDate &&
          endDate.toDateString() === startDate.toDateString()
        ) {
          return startDate > freshNow ? startDate : roundUpTime(freshNow, 30);
        }

        // End is today
        if (endDate && endDate.toDateString() === freshNow.toDateString()) {
          return roundUpTime(freshNow, 30);
        }

        // No end date yet — base on start date
        if (!endDate && startDate) {
          if (startDate.toDateString() === freshNow.toDateString()) {
            return startDate > freshNow
              ? startDate
              : roundUpTime(freshNow, 30);
          }
          return minTimeDefault; // start is future day → 6 AM
        }

        // End is a future day → 6 AM
        return minTimeDefault;
      })()}
      maxTime={maxTimeDefault}
      className={`input--icon ${
        !formik.values.start_date_time ? "opacity-50 cursor-not-allowed" : ""
      }`}
    />
  </div>
  {formik.touched.end_date_time && formik.errors.end_date_time && (
    <p className="text-red-500 text-sm">{formik.errors.end_date_time}</p>
  )}
</div>

                  {/* Frequency Field */}
                  <div>
                    <label className="mb-2 block">
                      Frequency<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Select
                        name="frequency"
                        value={
                          frequencyType.find(
                            (opt) => opt.value === formik.values?.frequency,
                          ) || null
                        }
                        options={frequencyType}
                        onChange={(option) =>
                          formik.setFieldValue("frequency", option.value)
                        }
                        onBlur={() => formik.setFieldTouched("frequency", true)}
                        styles={customStyles}
                      />
                    </div>
                    {formik.touched.frequency && formik.errors.frequency && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.frequency}
                      </p>
                    )}
                  </div>

                  {/* Target Value & Unit */}
                  <div>
                    <label className="mb-2 block">
                      Target Value<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="target_value"
                      value={formik.values.target_value}
                      // onChange={formik.handleChange}
                      onKeyDown={blockInvalidNumberKeys} // ⛔ blocks typing -, e, etc.
                      onChange={(e) => {
                        const cleanValue = sanitizePositiveInteger(
                          e.target.value,
                        );
                        formik.setFieldValue("target_value", cleanValue);
                      }}
                      className="custom--input w-full number--appearance-none"
                    />
                    {formik.touched.target_value &&
                      formik.errors.target_value && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.target_value}
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="mb-2 block">
                      Target Unit<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="target_unit"
                      value={formik.values.target_unit}
                      // onChange={formik.handleChange}
                      onKeyDown={blockInvalidNumberKeys} // ⛔ blocks typing -, e, etc.
                      onChange={(e) => {
                        const cleanValue = sanitizePositiveInteger(
                          e.target.value,
                        );
                        formik.setFieldValue("target_unit", cleanValue);
                      }}
                      className="custom--input w-full number--appearance-none"
                    />
                    {formik.touched.target_unit &&
                      formik.errors.target_unit && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.target_unit}
                        </p>
                      )}
                  </div>
                  {/* Join In Between Field */}
                  <div>
                    <label className="mb-2 block">
                      Join In Between<span className="text-red-500">*</span>
                    </label>
                    <Select
                      name="join_in_between"
                      value={
                        formik.values.join_in_between
                          ? { value: true, label: "Yes" }
                          : { value: false, label: "No" }
                      }
                      onChange={(option) =>
                        formik.setFieldValue("join_in_between", option.value)
                      }
                      options={[
                        { value: true, label: "Yes" },
                        { value: false, label: "No" },
                      ]}
                      classNamePrefix="custom--select"
                      styles={customStyles}
                    />
                  </div>

                  {/* Position Field */}
                  <div>
                    <label className="mb-2 block">Position</label>
                    <input
                      type="number"
                      name="position"
                      value={formik.values.position}
                      // onChange={formik.handleChange}
                      onKeyDown={blockInvalidNumberKeys} // ⛔ blocks typing -, e, etc.
                      onChange={(e) => {
                        const cleanValue = sanitizePositiveInteger(
                          e.target.value,
                        );
                        formik.setFieldValue("position", cleanValue);
                      }}
                      className="custom--input w-full"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block">
                      First Prize Coins<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <RiMedalLine className="absolute top-[50%] translate-y-[-50%] left-[15px]" />
                      <input
                        type="text"
                        name="reward_first"
                        value={formik.values.reward_first}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.reward_first &&
                      formik.errors.reward_first && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.reward_first}
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="mb-2 block">
                      Second Prize Coins<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <RiMedalLine className="absolute top-[50%] translate-y-[-50%] left-[15px]" />
                      <input
                        type="text"
                        name="reward_second"
                        value={formik.values.reward_second}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.reward_second &&
                      formik.errors.reward_second && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.reward_second}
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="mb-2 block">
                      Third Prize Coins<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <RiMedalLine className="absolute top-[50%] translate-y-[-50%] left-[15px]" />
                      <input
                        type="text"
                        name="reward_third"
                        value={formik.values.reward_third}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.reward_third &&
                      formik.errors.reward_third && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.reward_third}
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="mb-2 block">
                      Winning caption heading
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="winning_caption_heading"
                        value={formik.values.winning_caption_heading}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full"
                      />
                    </div>
                    {formik.touched.winning_caption_heading &&
                      formik.errors.winning_caption_heading && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.winning_caption_heading}
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="mb-2 block">
                      Winning caption subheading
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="winning_caption_subheading"
                        value={formik.values.winning_caption_subheading}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full"
                      />
                    </div>
                    {formik.touched.winning_caption_subheading &&
                      formik.errors.winning_caption_subheading && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.winning_caption_subheading}
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="mb-2 block">
                      Progress caption heading
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="progress_caption_heading"
                        value={formik.values.progress_caption_heading}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full"
                      />
                    </div>
                    {formik.touched.progress_caption_heading &&
                      formik.errors.progress_caption_heading && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.progress_caption_heading}
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="mb-2 block">
                      Progress caption subheading
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="progress_caption_subheading"
                        value={formik.values.progress_caption_subheading}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full"
                      />
                    </div>
                    {formik.touched.progress_caption_subheading &&
                      formik.errors.progress_caption_subheading && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.progress_caption_subheading}
                        </p>
                      )}
                  </div>

                  {/* Status Field */}
                  <div>
                    <label className="mb-2 block">
                      Status<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      {/* <Select
                        name="status"
                        value={
                          statusType.find(
                            (opt) => opt.value === formik.values?.status
                          ) || null
                        }
                        options={statusType}
                        onChange={(option) =>
                          formik.setFieldValue("status", option.value)
                        }
                        onBlur={() => formik.setFieldTouched("status", true)}
                        styles={customStyles}
                      /> */}
                      <Select
                        name="status"
                        value={
                          availableStatus.find(
                            (opt) => opt.value === formik.values?.status,
                          ) || null
                        }
                        options={availableStatus}
                        onChange={(option) =>
                          formik.setFieldValue("status", option.value)
                        }
                        onBlur={() => formik.setFieldTouched("status", true)}
                        styles={customStyles}
                      />
                    </div>
                    {formik.touched.status && formik.errors.status && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.status}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-4 grid md:grid-cols-2 grid-cols-1 gap-4 gap-y-2">
                    {/* Description Field */}
                    <div>
                      <label className="mb-2 block">
                        Description<span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="description"
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        className="custom--input w-full"
                      />
                      {formik.touched.description &&
                        formik.errors.description && (
                          <p className="text-red-500 text-sm">
                            {formik.errors.description}
                          </p>
                        )}
                    </div>

                    {/* Challenge Essentials Field */}
                    <div>
                      <label className="mb-2 block">
                        Challenge Essentials
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="about_challenge"
                        value={formik.values.about_challenge}
                        onChange={formik.handleChange}
                        className="custom--input w-full"
                      />
                      {formik.touched.about_challenge &&
                        formik.errors.about_challenge && (
                          <p className="text-red-500 text-sm">
                            {formik.errors.about_challenge}
                          </p>
                        )}
                    </div>
                  </div>

                  {/* ======================================
                       TERMS OF PLAY (TODO LIST)
                  ======================================= */}
                  <div className="md:col-span-4">
                    <label className="mb-2 block">
                      Terms of play <span className="text-red-500">*</span>
                    </label>

                    {/* Add item */}
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={tempCondition}
                        onChange={(e) => setTempCondition(e.target.value)}
                        className="custom--input flex-1"
                        placeholder="Add a rule..."
                      />

                      <button
                        type="button"
                        className="px-3 py-2 bg-blue-500 text-white rounded"
                        onClick={() => {
                          if (!tempCondition.trim()) return;

                          const updated = [
                            ...conditionList,
                            tempCondition.trim(),
                          ];
                          setConditionList(updated);

                          // Save to Formik as JSON string
                          formik.setFieldValue(
                            "condition",
                            JSON.stringify(updated),
                          );

                          setTempCondition("");
                        }}
                      >
                        Add
                      </button>
                    </div>

                    {/* List display */}
                    <ul className="space-y-1">
                      {conditionList.map((rule, index) => (
                        <li
                          key={index}
                          className="flex justify-between bg-gray-100 p-2 rounded gap-2"
                        >
                          <span className="text-sm">{rule}</span>
                          <button
                            type="button"
                            className="text-red-500 text-sm"
                            onClick={() => {
                              const updated = conditionList.filter(
                                (_, i) => i !== index,
                              );
                              setConditionList(updated);
                              formik.setFieldValue(
                                "condition",
                                JSON.stringify(updated),
                              );
                            }}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>

                    {formik.touched.condition && formik.errors.condition && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.condition}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 py-5 justify-end">
              <button
                type="button"
                onClick={() => {
                  formik.resetForm({ values: formik.initialValues });
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

// Export the ChallengeForm component
export default ChallengeForm;
