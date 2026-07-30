import React, { useEffect, useState } from "react";
import {
  IoCloseCircle,
  IoDocumentTextOutline,
  IoLocationOutline,
} from "react-icons/io5";
import {
  FaEnvelope,
  FaListCheck,
  FaListUl,
  FaRegBuilding,
} from "react-icons/fa6";
import { LuCalendar, LuPlug } from "react-icons/lu";
import Select from "react-select";
import {
  blockInvalidNumberKeys,
  blockNonLettersAndNumbers,
  customStyles,
  filterActiveItems,
  sanitizePositiveInteger,
  sanitizeTextWithNumbers,
  selectIcon,
} from "../../Helper/helper";
import { authAxios } from "../../config/config";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { GoClock } from "react-icons/go";

const fullDayOption = [
  { value: true, label: "Yes" },
  { value: false, label: "No" },
];

const statusOptions = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

// "2026-07-20" -> local Date, avoiding UTC/timezone day-shift bugs
const parseDate = (v) => {
  if (!v) return null;
  const [y, m, d] = v.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

// Date -> "2026-07-20" (local, matches what the API expects)
const formatDateForApi = (date) => {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// "10:00:00" / "10:00" -> Date object (today's date, given time set)
const parseTime = (timeString) => {
  if (!timeString) return null;
  const [h, m] = timeString.split(":");
  const hours = parseInt(h, 10);
  const minutes = parseInt(m, 10);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
};

// Date -> "10:00:00" (24h, matches what the API expects)
const formatTimeForApi = (date) => {
  if (!date) return "";
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}:00`;
};

const CreateClubHoliday = ({
  setShowModal,
  editingClubHoliday,
  formik,
  handleOverlayClick,
  leadBoxRef,
}) => {
  const [club, setClub] = useState([]);

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

  useEffect(() => {
    if (!editingClubHoliday) return;

    const fetchHolidayById = async (id) => {
      try {
        const res = await authAxios().get(`/club/holiday/${id}`);
        const data = res.data?.data || res.data || null;

        if (data) {
          formik.setValues({
            club_id: data?.club_id ?? "",
            holiday_name: data?.holiday_name || "",
            holiday_date: data?.holiday_date || "",
            is_full_day:
              data?.is_full_day !== undefined ? data.is_full_day : "",
            open_time: data?.open_time || "",
            close_time: data?.close_time || "",
            status: data?.status || "",
            position: data?.position ?? "",
          });
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchHolidayById(editingClubHoliday);
  }, [editingClubHoliday]);

  // Clear open/close time whenever "full day" is switched to true
  useEffect(() => {
    if (formik.values.is_full_day === true) {
      if (formik.values.open_time) formik.setFieldValue("open_time", "");
      if (formik.values.close_time) formik.setFieldValue("close_time", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.is_full_day]);

  const isFullDay = formik.values.is_full_day === true;

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
            {editingClubHoliday ? "Edit Holiday" : "Create Holiday"}
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
                <div className="grid grid-cols-3 lg:gap-4 gap-2">
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

                  {/* Holiday Name */}
                  <div>
                    <label className="mb-2 block">
                      Holiday Name<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="holiday_name"
                        value={formik.values.holiday_name}
                        onKeyDown={blockNonLettersAndNumbers}
                        onChange={(e) => {
                          const cleaned = sanitizeTextWithNumbers(
                            e.target.value,
                          );
                          formik.setFieldValue("holiday_name", cleaned);
                        }}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full"
                      />
                    </div>
                    {formik.touched.holiday_name &&
                      formik.errors.holiday_name && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.holiday_name}
                        </p>
                      )}
                  </div>

                  {/* Holiday Full Day */}
                  <div>
                    <label className="mb-2 block">
                      Holiday Full Day<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Select
                        name="is_full_day"
                        value={
                          fullDayOption.find(
                            (option) =>
                              option.value === formik.values?.is_full_day,
                          ) || null
                        }
                        onChange={(option) =>
                          formik.setFieldValue("is_full_day", option.value)
                        }
                        onBlur={() =>
                          formik.setFieldTouched("is_full_day", true)
                        }
                        options={fullDayOption}
                        classNamePrefix="custom--select"
                        styles={customStyles}
                      />
                    </div>
                    {formik.touched.is_full_day &&
                      formik.errors.is_full_day && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.is_full_day}
                        </p>
                      )}
                  </div>

                  {/* Holiday Date */}
                  <div>
                    <label className="mb-2 block">
                      Holiday Date<span className="text-red-500">*</span>
                    </label>
                    <div className="custom--date relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <LuCalendar />
                      </span>
                      <DatePicker
                        selected={parseDate(formik.values.holiday_date)}
                        onChange={(date) =>
                          formik.setFieldValue(
                            "holiday_date",
                            date ? formatDateForApi(date) : "",
                          )
                        }
                        onBlur={() =>
                          formik.setFieldTouched("holiday_date", true)
                        }
                        dateFormat="dd-MM-yyyy"
                        // minDate={new Date()}
                        className="input--icon"
                      />
                    </div>
                    {formik.touched.holiday_date &&
                      formik.errors.holiday_date && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.holiday_date}
                        </p>
                      )}
                  </div>

                  {/* Open Time */}
                  <div>
                    <label className="mb-2 block">
                      Open Time
                      {!isFullDay && <span className="text-red-500">*</span>}
                    </label>
                    <div className="custom--date relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <GoClock />
                      </span>
                      <DatePicker
                        selected={
                          formik.values.open_time
                            ? parseTime(formik.values.open_time)
                            : null
                        }
                        onChange={(date) =>
                          formik.setFieldValue(
                            "open_time",
                            date ? formatTimeForApi(date) : "",
                          )
                        }
                        onBlur={() =>
                          formik.setFieldTouched("open_time", true)
                        }
                        disabled={isFullDay}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={30}
                        dateFormat="hh:mm aa"
                        className="custom--input w-full input--icon"
                        placeholderText="Select Open Time"
                        onKeyDown={(e) => {
                          e.preventDefault();
                        }}
                      />
                    </div>
                    {formik.touched.open_time && formik.errors.open_time && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.open_time}
                      </p>
                    )}
                  </div>

                  {/* Close Time */}
                  <div>
                    <label className="mb-2 block">
                      Close Time
                      {!isFullDay && <span className="text-red-500">*</span>}
                    </label>
                    <div className="custom--date relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <GoClock />
                      </span>
                      <DatePicker
                        selected={
                          formik.values.close_time
                            ? parseTime(formik.values.close_time)
                            : null
                        }
                        onChange={(date) =>
                          formik.setFieldValue(
                            "close_time",
                            date ? formatTimeForApi(date) : "",
                          )
                        }
                        onBlur={() =>
                          formik.setFieldTouched("close_time", true)
                        }
                        disabled={isFullDay}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={30}
                        dateFormat="hh:mm aa"
                        className="custom--input w-full input--icon"
                        placeholderText="Select Close Time"
                        minTime={
                          formik.values.open_time
                            ? parseTime(formik.values.open_time)
                            : new Date(0, 0, 0, 0, 0)
                        }
                        maxTime={new Date(0, 0, 0, 23, 59)}
                        onKeyDown={(e) => {
                          e.preventDefault();
                        }}
                      />
                    </div>
                    {formik.touched.close_time &&
                      formik.errors.close_time && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.close_time}
                        </p>
                      )}
                  </div>

                  {/* Position */}
                  <div>
                    <label className="mb-2 block">
                      Position<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <FaListUl />
                      </span>
                      <input
                        type="number"
                        name="position"
                        value={formik.values.position}
                        onKeyDown={blockInvalidNumberKeys}
                        onChange={(e) => {
                          const cleanValue = sanitizePositiveInteger(
                            e.target.value,
                          );
                          formik.setFieldValue("position", cleanValue);
                        }}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.position && formik.errors.position && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.position}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <label className="mb-2 block">
                      Status<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <LuPlug />
                      </span>
                      <Select
                        name="status"
                        value={
                          statusOptions.find(
                            (option) => option.value === formik.values.status,
                          ) || null
                        }
                        options={statusOptions}
                        onChange={(option) =>
                          formik.setFieldValue("status", option.value)
                        }
                        onBlur={() => formik.setFieldTouched("status", true)}
                        styles={selectIcon}
                        className="!capitalize"
                      />
                    </div>
                    {formik.touched.status && formik.errors.status && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.status}
                      </p>
                    )}
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
                disabled={formik.isSubmitting}
                className="px-4 py-2 bg-white text-black font-semibold rounded max-w-[150px] w-full disabled:opacity-60"
              >
                {formik.isSubmitting
                  ? "Saving..."
                  : editingClubHoliday
                    ? "Update"
                    : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateClubHoliday;