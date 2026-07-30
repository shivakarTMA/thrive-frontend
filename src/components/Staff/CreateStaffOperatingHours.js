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

const CreateStaffOperatingHours = ({
  setShowModal,
  editingOperatingHours,
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
      console.log(activeOnly, "activeOnly");
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

      const roles = ["TRAINER", "FITNESS_MANAGER", "ASS_FITNESS_MANAGER"];

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
    if (!editingOperatingHours) return;

    const fetchOperatingHoursById = async (id) => {
      try {
        const res = await authAxios().get(`/staff/operating/hours/${id}`);
        const data = res.data?.data || res.data || null;

        if (data) {
          formik.setValues({
            club_id: data?.club_id ?? "",
            staff_id: data?.staff_id ?? "",
            weekday: data?.weekday || "",
            available_from: data?.available_from || "",
            available_to: data?.available_to || "",
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
                        options={clubOptions}
                        value={
                          clubOptions.find(
                            (option) => option.value === formik.values.club_id,
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
                                option.value === formik.values.staff_id,
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
                            (option) => option.value === formik.values.weekday,
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

                  {/* Available form */}
                  <div>
                    <label className="mb-2 block">
                      Available form<span className="text-red-500">*</span>
                    </label>
                    <div className="custom--date relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <GoClock />
                      </span>
                      <DatePicker
                        selected={
                          formik.values.available_from
                            ? parseTime(formik.values.available_from)
                            : null
                        }
                        onChange={(date) =>
                          formik.setFieldValue(
                            "available_from",
                            date ? formatTimeForApi(date) : "",
                          )
                        }
                        onBlur={() =>
                          formik.setFieldTouched("available_from", true)
                        }
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={30}
                        dateFormat="hh:mm aa"
                        className="custom--input w-full input--icon"
                        placeholderText="Select Time"
                        onKeyDown={(e) => {
                          e.preventDefault();
                        }}
                      />
                    </div>
                    {formik.touched.available_from &&
                      formik.errors.available_from && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.available_from}
                        </p>
                      )}
                  </div>

                  {/* Available to */}
                  <div>
                    <label className="mb-2 block">
                      Available to<span className="text-red-500">*</span>
                    </label>
                    <div className="custom--date relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <GoClock />
                      </span>
                      <DatePicker
                        selected={
                          formik.values.available_to
                            ? parseTime(formik.values.available_to)
                            : null
                        }
                        onChange={(date) =>
                          formik.setFieldValue(
                            "available_to",
                            date ? formatTimeForApi(date) : "",
                          )
                        }
                        onBlur={() =>
                          formik.setFieldTouched("available_to", true)
                        }
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={30}
                        dateFormat="hh:mm aa"
                        className="custom--input w-full input--icon"
                        placeholderText="Select Time"
                        minTime={
                          formik.values.available_from
                            ? parseTime(formik.values.available_from)
                            : new Date(0, 0, 0, 0, 0)
                        }
                        maxTime={new Date(0, 0, 0, 23, 59)}
                        onKeyDown={(e) => {
                          e.preventDefault();
                        }}
                      />
                    </div>
                    {formik.touched.available_to &&
                      formik.errors.available_to && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.available_to}
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

export default CreateStaffOperatingHours;
