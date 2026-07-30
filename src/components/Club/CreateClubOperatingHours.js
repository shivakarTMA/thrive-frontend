import React, { useEffect, useState } from "react";
import { IoCloseCircle } from "react-icons/io5";
import { FaListUl } from "react-icons/fa6";
import { LuPlug } from "react-icons/lu";
import Select from "react-select";
import {
  blockInvalidNumberKeys,
  customStyles,
  filterActiveItems,
  sanitizePositiveInteger,
  selectIcon,
} from "../../Helper/helper";
import { authAxios } from "../../config/config";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { GoClock } from "react-icons/go";

const closedOption = [
  { value: true, label: "Yes" },
  { value: false, label: "No" },
];

const statusOptions = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

const weekdayOptions = [
  { label: "Monday", value: "MONDAY" },
  { label: "Tuesday", value: "TUESDAY" },
  { label: "Wednesday", value: "WEDNESDAY" },
  { label: "Thursday", value: "THURSDAY" },
  { label: "Friday", value: "FRIDAY" },
  { label: "Saturday", value: "SATURDAY" },
  { label: "Sunday", value: "SUNDAY" },
];

// "04:00:00" / "04:00" -> Date object (today's date, given time set)
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

// Date -> "04:00:00" (24h, matches what the API expects)
const formatTimeForApi = (date) => {
  if (!date) return "";
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}:00`;
};

const CreateClubOperatingHours = ({
  setShowModal,
  editingOperatingHours,
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
      console.log(activeOnly,'activeOnly')
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
    if (!editingOperatingHours) return;

    const fetchOperatingHoursById = async (id) => {
      try {
        const res = await authAxios().get(`/club/operating/hours/${id}`);
        const data = res.data?.data || res.data || null;

        if (data) {
          formik.setValues({
            club_id: data?.club_id ?? "",
            weekday: data?.weekday || "",
            is_closed: data?.is_closed !== undefined ? !!data.is_closed : "",
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

    fetchOperatingHoursById(editingOperatingHours);
  }, [editingOperatingHours]);

  // Clear open/close time whenever "closed" is switched to true
  useEffect(() => {
    if (formik.values.is_closed === true) {
      if (formik.values.open_time) formik.setFieldValue("open_time", "");
      if (formik.values.close_time) formik.setFieldValue("close_time", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.is_closed]);

  const isClosed = formik.values.is_closed === true;

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
            {editingOperatingHours
              ? "Edit Operating Hours"
              : "Create Operating Hours"}
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

                  {/* Weekday */}
                  <div>
                    <label className="mb-2 block">
                      Weekday<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Select
                        name="weekday"
                        value={
                          weekdayOptions.find(
                            (option) =>
                              option.value === formik.values.weekday,
                          ) || null
                        }
                        options={weekdayOptions}
                        onChange={(option) =>
                          formik.setFieldValue("weekday", option.value)
                        }
                        onBlur={() => formik.setFieldTouched("weekday", true)}
                        styles={customStyles}
                        className="!capitalize"
                      />
                    </div>
                    {formik.touched.weekday && formik.errors.weekday && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.weekday}
                      </p>
                    )}
                  </div>

                  {/* Closed */}
                  <div>
                    <label className="mb-2 block">
                      Closed<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Select
                        name="is_closed"
                        value={
                          closedOption.find(
                            (option) =>
                              option.value === formik.values?.is_closed,
                          ) || null
                        }
                        onChange={(option) =>
                          formik.setFieldValue("is_closed", option.value)
                        }
                        onBlur={() =>
                          formik.setFieldTouched("is_closed", true)
                        }
                        options={closedOption}
                        classNamePrefix="custom--select"
                        styles={customStyles}
                      />
                    </div>
                    {formik.touched.is_closed && formik.errors.is_closed && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.is_closed}
                      </p>
                    )}
                  </div>

                  {/* Open Time */}
                  <div>
                    <label className="mb-2 block">
                      Open Time
                      {!isClosed && <span className="text-red-500">*</span>}
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
                        disabled={isClosed}
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
                      {!isClosed && <span className="text-red-500">*</span>}
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
                        disabled={isClosed}
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
                  : editingOperatingHours
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

export default CreateClubOperatingHours;