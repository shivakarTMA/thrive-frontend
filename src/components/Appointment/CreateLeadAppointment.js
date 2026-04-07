import React, { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  blockNonLettersAndNumbers,
  customStyles,
  sanitizeTextWithNumbers,
} from "../../Helper/helper";
import { IoCloseCircle } from "react-icons/io5";
import { toast } from "react-toastify";
import { authAxios } from "../../config/config";
import { useDispatch } from "react-redux";
import { useClubDatePickerProps } from "../../hooks/useClubDatePickerProps";
import { fetchClubTiming } from "../../Redux/Reducers/clubTimingSlice";

// Main component
const CreateLeadAppointment = ({
  setAppointmentModal,
  defaultCategory,
  memberID,
  memberType,
  handleLeadUpdate,
  clubId,
}) => {
  const leadBoxRef = useRef(null);
  const dispatch = useDispatch();
  const [staffList, setStaffList] = useState([]);
  const [serviceList, setServiceList] = useState([]);
  const [checkTrial, setCheckTrial] = useState(false);

  const [bookedSlots, setBookedSlots] = useState([]);

  const fetchTrainerBookedSlots = async (trainerId) => {
      if (!trainerId || !clubId) {
        setBookedSlots([]);
        return;
      }
      try {
        const res = await authAxios().post("/appointment/trainer/booked/slot", {
          club_id: clubId,
          trainer_id: trainerId,
        });
        setBookedSlots(res.data?.availability || []);
      } catch (err) {
        console.error("Trainer slot fetch error:", err);
        setBookedSlots([]);
      }
    };
  
  
   const getExcludeTimesForDate = (date) => {
    if (!date || !bookedSlots.length) return [];
  
    const dateStr = new Date(date).toISOString().split("T")[0];
    const matchedDay = bookedSlots.find((item) => item.date === dateStr);
    if (!matchedDay) return [];
  
    return [...new Set(matchedDay.slots)].map((timeStr) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      const d = new Date(date); // ← use actual picked date, NOT new Date()
      d.setHours(hours, minutes, 0, 0);
      return d;
    });
  };
  
  const getExcludeTimes = () => getExcludeTimesForDate(formik.values.appointment_date);
  
  const getFirstAvailableTime = (date) => {
    let suggested = datePickerProps.getDefaultTimeForDate(date);
    if (!suggested) return null;
  
    const excludedTimes = getExcludeTimesForDate(date);
    const interval = datePickerProps.timeIntervals; // ← dynamic from hook
    
    // ── Compare only HH:MM to avoid date mismatch with maxTime (which is today's Date) ──
    const toMins = (d) => d.getHours() * 60 + d.getMinutes();
    const maxMins = toMins(datePickerProps.maxTime);
  
    while (toMins(suggested) <= maxMins) {
      const suggestedMins = toMins(suggested);
  
      const isExcluded = excludedTimes.some(
        (excluded) => toMins(excluded) === suggestedMins
      );
  
      if (!isExcluded) return suggested; // ✅ free slot found
  
      // Advance by one interval
      suggested = new Date(suggested.getTime() + interval * 60 * 1000);
    }
  
    return null; // all slots blocked for this date
  };

  const fetchStaff = async (clubId = null) => {
    try {
      const params = {};
      if (clubId) params.club_id = clubId;
      const res = await authAxios().get("/staff/list?role=TRAINER", { params });
      let data = res.data?.data || res?.data || [];
      const activeService = data?.filter((item) => item?.status === "ACTIVE");
      setStaffList(activeService);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchService = async (clubId = null) => {
    try {
      const params = {};
      if (clubId) params.club_id = clubId;
      const res = await authAxios().get("/service/list", { params });
      let data = res.data?.data || res?.data || [];
      const activeService = data?.filter((item) => item?.status === "ACTIVE");
      setServiceList(activeService);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLeadTrial = async () => {
    try {
      const res = await authAxios().get(`/lead/${memberID}`);
      let data = res.data?.data || res?.data || [];
      setCheckTrial(data?.is_trial_booked);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // Fetch services and staff based on clubId if provided
    fetchLeadTrial()
    fetchStaff(clubId);
    fetchService(clubId);
    if (clubId) dispatch(fetchClubTiming(clubId));
  }, [clubId]); // <-- dependency added

  const staffListOptions =
    staffList?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];

  const appointmentTypes = [
    ...(serviceList
      ?.filter((item) => item.type !== "PRODUCT" && item.type !== "GROUP_CLASS")
      .map((item) => ({
        label: item.name,
        value: item.id,
      })) || []),
    ...(memberType === "LEAD"
      ? !checkTrial ? [{ label: "Tour / Trial", value: "TOURTRIAL" }] : []
      : []),
  ];

  const appointmentCategories = [
    { value: "service", label: "Service Appointment" },
    { value: "complementary", label: "Complimentary Appointment" },
  ];

  const formatDateTime = (date) => {
    const pad = (n) => (n < 10 ? "0" + n : n);

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // Months are 0-indexed
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const validationSchema = Yup.object({
    service_id: Yup.string().required("Appointment type is required"),
    club_id: Yup.string().required("Club is required"),
    appointment_date: Yup.date().required("Date & Time is required"),
    trainer_id: Yup.string().required("Trainer is required"),
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      club_id: clubId,
      member_id: memberID,
      appointment_category: "complementary",
      service_id: null,
      appointment_date: "",
      trainer_id: null,
      remarks: "",
    },
    validationSchema: validationSchema,
    context: { memberType },
    onSubmit: async (values, { resetForm }) => {
      console.log(values, "asdefasdf");
      const payload = {
        member_id: memberID,
        service_id: values.service_id,
        appointment_date: formatDateTime(values.appointment_date),
        trainer_id: values.trainer_id,
        club_id: values.club_id,
        remarks: values.remarks,
        appointment_category: values.appointment_category,
      };
      try {
        await authAxios().post("/appointment/complimentary/create", payload);
        toast.success("Appointment booked successfully!");
        // Reset form and close modal
        resetForm();
        handleLeadUpdate();
        handleAppointmentModal();
      } catch (error) {
        console.error("Error submitting form:", error);
        toast.error(error.response?.data?.errors)
      }
    },
  });

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setAppointmentModal(false);
    }
  };

  const handleAppointmentModal = () => {
    setAppointmentModal(false);
  };

  useEffect(() => {
    if (defaultCategory) {
      formik.setFieldValue("appointment_category", defaultCategory);
    }
  }, [defaultCategory]);

  // ── NEW: get ready-to-use DatePicker props from Redux timing ──
  const datePickerProps = useClubDatePickerProps(
    formik?.values?.appointment_date, // pass selected date for minTime logic
  );

  return (
    <div
      className="bg--blur create--lead--container overflow-auto fixed top-0 left-0 z-[999] w-full bg-black bg-opacity-60 h-full"
      onClick={handleOverlayClick}
    >
      <div
        className="min-h-[70vh] w-[95%] max-w-lg mx-auto mt-[100px] mb-[100px] container--leadbox rounded-[10px] flex flex-col"
        ref={leadBoxRef}
      >
        <div className="bg-white rounded-t-[10px] flex gap-3 items-center justify-between py-4 px-4 border-b">
          <h2 className="text-xl font-semibold">Add Appointment</h2>
          <div
            className="close--lead cursor-pointer"
            onClick={handleAppointmentModal}
          >
            <IoCloseCircle className="text-3xl" />
          </div>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className=" p-6 bg-white rounded-b-[10px]">
            {/* Appointment Category Radio */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-black mb-2">
                Appointment Category<span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                {appointmentCategories.map((cat) => {
                  const isServiceDisabled =
                    defaultCategory === "complementary" &&
                    cat.value === "service";

                  return (
                    <label
                      key={cat.value}
                      className={`flex items-center gap-2 ${
                        isServiceDisabled
                          ? "cursor-not-allowed text-gray-400"
                          : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="appointment_category"
                        value={cat.value}
                        checked={
                          formik.values.appointment_category === cat.value
                        }
                        onChange={() => {
                          if (!isServiceDisabled) {
                            formik.setFieldValue(
                              "appointment_category",
                              cat.value,
                            );
                          }
                        }}
                        disabled={isServiceDisabled}
                        className="w-auto custom--input"
                      />
                      {cat.label}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Complimentary Appointment Inputs */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-black mb-2">
                Appointment Type<span className="text-red-500">*</span>
              </label>
              <Select
                value={appointmentTypes.find(
                  (option) => option.value === formik.values.service_id,
                )}
                onChange={(selectedOption) =>
                  formik.setFieldValue(
                    "service_id",
                    selectedOption?.value || null,
                  )
                }
                options={appointmentTypes}
                styles={customStyles}
                placeholder="Select type"
              />
              {formik.errors.service_id && formik.touched.service_id && (
                <div className="text-red-500 text-sm">
                  {formik.errors.service_id}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">

              {/* Trainer Select */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-2">
                  Trainer<span className="text-red-500">*</span>
                </label>

                <Select
                  value={
                    formik.values.trainer_id
                      ? staffListOptions.find(
                          (option) => option.value === formik.values.trainer_id,
                        )
                      : null
                  }
                  // onChange={(selectedOption) =>
                  //   formik.setFieldValue(
                  //     "trainer_id",
                  //     selectedOption?.value || null,
                  //   )
                  // }
                  onChange={(selectedOption) => {
                    formik.setFieldValue("trainer_id", selectedOption?.value || null);
                    formik.setFieldValue("appointment_date", ""); // reset date on trainer change
                    fetchTrainerBookedSlots(selectedOption?.value); // ← NEW
                  }}
                  options={staffListOptions}
                  styles={customStyles}
                  placeholder="Select trainer"
                />

                {formik.errors.trainer_id && formik.touched.trainer_id && (
                  <div className="text-red-500 text-sm">
                    {formik.errors.trainer_id}
                  </div>
                )}
              </div>

              {/* DateTime Picker */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-2">
                  Date & Time<span className="text-red-500">*</span>
                </label>
                <div className="custom--date">
                  <DatePicker
                    selected={formik.values.appointment_date}
                    onChange={(date) => {
                      if (!date) {
                        formik.setFieldValue("appointment_date", null);
                        return;
                      }

                      const prev = formik.values.appointment_date;
                      const isSameDay =
                        prev &&
                        new Date(prev).toDateString() === new Date(date).toDateString();

                      if (isSameDay) {
                        // User changed time manually — accept as-is
                        formik.setFieldValue("appointment_date", date);
                      } else {
                        // ── UPDATED: use getFirstAvailableTime instead of getDefaultTimeForDate ──
                        const dateWithTime = getFirstAvailableTime(date);
                        formik.setFieldValue("appointment_date", dateWithTime ?? null);
                      }
                    }}
                    {...datePickerProps}
                    excludeTimes={getExcludeTimes()}
                    onKeyDown={(e) => {
                      e.preventDefault();
                    }}
                    disabled={!formik.values.trainer_id} // ← NEW
                    placeholderText="Select date & time"
                    className="custom--input !w-full"
                  />
                  {formik.errors.appointment_date &&
                    formik.touched.appointment_date && (
                      <div className="text-red-500 text-sm">
                        {formik.errors.appointment_date}
                      </div>
                    )}
                </div>
              </div>

              
            </div>

            {/* Remarks */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-black mb-2">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={formik.values.remarks}
                onKeyDown={blockNonLettersAndNumbers}
                onChange={(e) => {
                  const cleaned = sanitizeTextWithNumbers(e.target.value);
                  formik.setFieldValue("remarks", cleaned);
                }}
                className="custom--input w-full"
                rows={4}
                placeholder="Add any additional notes..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={handleAppointmentModal}
              className="px-4 py-2 bg-transparent border border-white text-white font-semibold rounded max-w-[150px] w-full"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 bg-white text-black font-semibold rounded max-w-[150px] w-full`}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLeadAppointment;
