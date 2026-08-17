import React, { useEffect, useState } from "react";
import { IoCloseCircle } from "react-icons/io5";
import { FaListUl } from "react-icons/fa6";
import { LuCalendar, LuPlug } from "react-icons/lu";
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

const workingOption = [
  { value: true, label: "Yes" },
  { value: false, label: "No" },
];

const statusOptions = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

// "2026-07-28" -> local Date, avoiding UTC/timezone day-shift bugs
const parseDate = (v) => {
  if (!v) return null;
  const [y, m, d] = v.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

// Date -> "2026-07-28" (local, matches what the API expects)
const formatDateForApi = (date) => {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// "13:00:00" / "13:00" -> Date object (today's date, given time set)
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

// Date -> "13:00:00" (24h, matches what the API expects)
const formatTimeForApi = (date) => {
  if (!date) return "";
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}:00`;
};

const CreateStaffHoliday = ({
  setShowModal,
  editingStaffHoliday,
  formik,
  handleOverlayClick,
  leadBoxRef,
}) => {
  const [club, setClub] = useState([]);
  const [staff, setStaff] = useState([]);

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

  const fetchStaff = async () => {
    try {
      const selectedClubId = formik.values?.club_id;

      // Don't call API if no club is selected
      if (!selectedClubId) {
        setStaff([]);
        return;
      }

      const roles = ["FOH", "TRAINER", "FITNESS_MANAGER", "ASS_FITNESS_MANAGER"];

      const res = await authAxios().get("/staff/list", {
        params: {
          club_id: selectedClubId,
          role: roles.join(","),
        },
      });

      const data = res.data?.data || res.data || [];

      const activeOnly = filterActiveItems(data);

      setStaff(activeOnly);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClub();
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [formik.values.club_id]);

  const clubOptions =
    club?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];

  const roleLabels = {
    FOH: "FOH",
    TRAINER: "Trainer",
    FITNESS_MANAGER: "Fitness Manager",
    ASS_FITNESS_MANAGER: "Assistant Fitness Manager",
  };

  const staffOptions = Object.values(
    staff.reduce((acc, item) => {
      if (!acc[item.role]) {
        acc[item.role] = {
          label: roleLabels[item.role] || item.role,
          options: [],
        };
      }

      acc[item.role].options.push({
        label: item.name,
        value: item.id,
      });

      return acc;
    }, {}),
  );

  useEffect(() => {
    if (!editingStaffHoliday) return;

    const fetchStaffHolidayById = async (id) => {
      try {
        const res = await authAxios().get(`/staff/holiday/${id}`);
        const data = res.data?.data || res.data || null;

        if (data) {
          formik.setValues({
            club_id: data?.club_id ?? "",
            staff_id: data?.staff_id ?? "",
            holiday_date: data?.holiday_date || "",
            is_working: data?.is_working !== undefined ? !!data.is_working : "",
            start_time: data?.start_time || "",
            end_time: data?.end_time || "",
            reason: data?.reason || "",
            status: data?.status || "",
            position: data?.position ?? "",
          });
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchStaffHolidayById(editingStaffHoliday);
  }, [editingStaffHoliday]);

  // Clear start/end time whenever "working" is switched to false
  useEffect(() => {
    if (formik.values.is_working === false) {
      if (formik.values.start_time) formik.setFieldValue("start_time", "");
      if (formik.values.end_time) formik.setFieldValue("end_time", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.is_working]);

  const isWorking = formik.values.is_working === true;

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
            {editingStaffHoliday
              ? "Edit Staff Holiday"
              : "Create Staff Holiday"}
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
                        options={clubOptions}
                        value={
                          clubOptions.find(
                            (option) =>
                              option.value ===
                              formik.values.club_id
                          ) || null
                        }
                        onChange={(option) => {
                          formik.setFieldValue("club_id", option.value);
                          // staff list depends on the club, so clear any
                          // previously selected staff member
                          formik.setFieldValue("staff_id", "");
                        }}
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

                  {/* Staff Dropdown */}
                  <div>
                    <label className="mb-2 block">
                      Staff<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Select
                        name="staff_id"
                        value={
                          staffOptions
                            .flatMap((group) => group.options)
                            .find(
                              (option) =>
                                option.value ===
                                formik.values.staff_id
                            ) || null
                        }
                        options={staffOptions}
                        onChange={(option) =>
                          formik.setFieldValue("staff_id", option.value)
                        }
                        onBlur={() => formik.setFieldTouched("staff_id", true)}
                        styles={customStyles}
                        className="!capitalize"
                        isDisabled={!formik.values.club_id}
                        noOptionsMessage={() =>
                          formik.values.club_id
                            ? "No staff found"
                            : "Select a club first"
                        }
                      />
                    </div>
                    {formik.touched.staff_id && formik.errors.staff_id && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.staff_id}
                      </p>
                    )}
                  </div>

                  {/* Date */}
                  <div>
                    <label className="mb-2 block">
                      Date<span className="text-red-500">*</span>
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
                        minDate={new Date()}
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

                  {/* Working */}
                  <div>
                    <label className="mb-2 block">
                      Working<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Select
                        name="is_working"
                        value={
                          workingOption.find(
                            (option) =>
                              option.value === formik.values?.is_working,
                          ) || null
                        }
                        onChange={(option) =>
                          formik.setFieldValue("is_working", option.value)
                        }
                        onBlur={() =>
                          formik.setFieldTouched("is_working", true)
                        }
                        options={workingOption}
                        classNamePrefix="custom--select"
                        styles={customStyles}
                      />
                    </div>
                    {formik.touched.is_working && formik.errors.is_working && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.is_working}
                      </p>
                    )}
                  </div>

                  {/* Start Time */}
                  <div>
                    <label className="mb-2 block">
                      Start Time
                      {isWorking && <span className="text-red-500">*</span>}
                    </label>
                    <div className="custom--date relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <GoClock />
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
                            date ? formatTimeForApi(date) : "",
                          )
                        }
                        onBlur={() =>
                          formik.setFieldTouched("start_time", true)
                        }
                        disabled={!isWorking}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={30}
                        dateFormat="hh:mm aa"
                        className="custom--input w-full input--icon"
                        placeholderText="Select Start Time"
                        onKeyDown={(e) => {
                          e.preventDefault();
                        }}
                      />
                    </div>
                    {formik.touched.start_time && formik.errors.start_time && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.start_time}
                      </p>
                    )}
                  </div>

                  {/* End Time */}
                  <div>
                    <label className="mb-2 block">
                      End Time
                      {isWorking && <span className="text-red-500">*</span>}
                    </label>
                    <div className="custom--date relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <GoClock />
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
                            date ? formatTimeForApi(date) : "",
                          )
                        }
                        onBlur={() => formik.setFieldTouched("end_time", true)}
                        disabled={!isWorking}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={30}
                        dateFormat="hh:mm aa"
                        className="custom--input w-full input--icon"
                        placeholderText="Select End Time"
                        minTime={
                          formik.values.start_time
                            ? parseTime(formik.values.start_time)
                            : new Date(0, 0, 0, 0, 0)
                        }
                        maxTime={new Date(0, 0, 0, 23, 59)}
                        onKeyDown={(e) => {
                          e.preventDefault();
                        }}
                      />
                    </div>
                    {formik.touched.end_time && formik.errors.end_time && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.end_time}
                      </p>
                    )}
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="mb-2 block">
                      Reason<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="reason"
                        value={formik.values.reason}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full"
                      />
                    </div>
                    {formik.touched.reason && formik.errors.reason && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.reason}
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
                  : editingStaffHoliday
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

export default CreateStaffHoliday;
