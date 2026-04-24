import React, { useEffect, useMemo, useRef, useState } from "react";
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

const CreateLeadAppointment = ({
  setAppointmentModal,
  defaultCategory,
  memberID,
  handleLeadUpdate,
  clubId,
  memberType,
}) => {
  const leadBoxRef = useRef(null);

  const [staffList, setStaffList] = useState([]);
  const [serviceList, setServiceList] = useState([]);
  const [clubTiming, setClubTiming] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [checkTrial, setCheckTrial] = useState(false);

  // ===============================
  // FETCH CLUB TIMING
  // ===============================
  const fetchClubTiming = async () => {
    try {
      const res = await authAxios().get(`/club/fetch/timing/${clubId}`);
      setClubTiming(res.data?.data?.time || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ===============================
  // FETCH TRAINER SLOTS
  // ===============================
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
      console.error(err);
      setBookedSlots([]);
    }
  };

  // ===============================
  // MATCH DATE → SLOTS
  // ===============================
  const getBookedSlotsForSelectedDate = (date) => {
    if (!date || !bookedSlots.length) return [];

    const dateStr = date.toLocaleDateString("en-CA");

    const matched = bookedSlots.find((d) => d.date === dateStr);

    return matched?.slots || [];
  };

  // ===============================
  // FORMAT TIME
  // ===============================
  const formatTo12Hour = (time24) => {
    const [h, m] = time24.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
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

  // ===============================
  // FORM OPTIONS
  // ===============================
  const staffOptions = staffList.map((s) => ({
    label: s.name,
    value: s.id,
  }));

  const serviceOptions = serviceList.map((s) => ({
    label: s.name,
    value: s.id,
  }));

  const appointmentTypes = [
    ...(serviceList
      ?.filter((item) => item.type !== "PRODUCT" && item.type !== "GROUP_CLASS")
      .map((item) => ({
        label: item.name,
        value: item.id,
      })) || []),
    ...(memberType === "LEAD"
      ? !checkTrial
        ? [{ label: "Tour / Trial", value: "TOURTRIAL" }]
        : []
      : []),
  ];

  const appointmentCategories = [
    { value: "service", label: "Service Appointment" },
    { value: "complementary", label: "Complimentary Appointment" },
  ];

  // ===============================
  // VALIDATION
  // ===============================
  const validationSchema = Yup.object({
    service_id: Yup.string().required("Appointment type is required"),
    appointment_date: Yup.string().required("Date & Time is required"),
    trainer_id: Yup.string().required("Trainer is required"),
  });

  // ===============================
  // FORMIK
  // ===============================
  const formik = useFormik({
    initialValues: {
      service_id: null,
      trainer_id: null,
      appointment_date_only: null,
      appointment_time: null,
      appointment_date: null,
      remarks: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!values.appointment_date) {
        formik.setFieldTouched("appointment_date", true);
        return;
      }

      try {
        await authAxios().post("/appointment/complimentary/create", {
          member_id: memberID,
          service_id: values.service_id,
          trainer_id: values.trainer_id,
          club_id: clubId,
          appointment_date: values.appointment_date,
          remarks: values.remarks,
        });

        toast.success("Appointment booked successfully!");
        resetForm();
        handleLeadUpdate();
        setAppointmentModal(false);
      } catch (err) {
        toast.error(err.response?.data?.message);
      }
    },
  });

  // ===============================
  // COMBINE DATE + TIME
  // ===============================
  const combineDateTime = (date, time) => {
    if (!date || !time) return;

    const [h, m] = time.split(":").map(Number);

    const combined = new Date(date);
    combined.setHours(h, m, 0, 0);

    formik.setFieldValue("appointment_date", combined.toISOString());
  };

  // ===============================
  // TIME OPTIONS
  // ===============================
  const timeOptions = useMemo(() => {
    const booked = getBookedSlotsForSelectedDate(
      formik.values.appointment_date_only,
    );

    return clubTiming.map((time) => {
      const isBooked = booked.includes(time);

      // ── Past-time-of-day check ──────────────────────────────────────────
      let isPastTime = false;
      const selectedDate = formik.values.appointment_date_only;

      if (selectedDate) {
        const now = new Date();
        const [h, m] = time.split(":").map(Number);

        const tom = new Date();
        tom.setDate(tom.getDate() + 1);

        const selectedIsToday =
          new Date(selectedDate).toDateString() === now.toDateString();
        const selectedIsTomorrow =
          new Date(selectedDate).toDateString() === tom.toDateString();

        if (selectedIsToday) {
          // safety guard (minDate should prevent today from being picked)
          const slotTime = new Date(selectedDate);
          slotTime.setHours(h, m, 0, 0);
          if (slotTime <= now) isPastTime = true;
        }

        if (selectedIsTomorrow) {
          // compare slot HH:mm against current time-of-day only
          const slotTimeOnly = new Date();
          slotTimeOnly.setHours(h, m, 0, 0);
          if (slotTimeOnly <= now) isPastTime = true;
        }

        // 25th and beyond → isPastTime stays false, all slots open
      }
      // ───────────────────────────────────────────────────────────────────

      return {
        label: formatTo12Hour(time),
        value: time,
        isDisabled: isBooked || isPastTime, // ✅ both combined
      };
    });
  }, [clubTiming, bookedSlots, formik.values.appointment_date_only]);

  // ===============================
  // FETCH INITIAL DATA
  // ===============================

  const fetchStaff = async () => {
    const res = await authAxios().get(
      `/staff/list?club_id=${clubId}&role=TRAINER`,
    );
    setStaffList(res.data?.data || []);
  };

  const fetchService = async () => {
    const res = await authAxios().get(`/service/list?club_id=${clubId}`);
    setServiceList(res.data?.data || []);
  };

  useEffect(() => {
    if (!clubId) return;

    fetchLeadTrial();
    fetchStaff();
    fetchService();
    fetchClubTiming();
  }, [clubId]);

  useEffect(() => {
    formik.setFieldValue("trainer_id", null);
    formik.setFieldValue("appointment_date_only", null);
    formik.setFieldValue("appointment_time", null);
    formik.setFieldValue("appointment_date", null);

    setBookedSlots([]);
  }, [clubId]);

  useEffect(() => {
    if (defaultCategory) {
      formik.setFieldValue("appointment_category", defaultCategory);
    }
  }, [defaultCategory]);

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setAppointmentModal(false);
    }
  };

  const handleAppointmentModal = () => {
    setAppointmentModal(false);
  };
  return (
    <div className="bg--blur create--lead--container overflow-auto fixed top-0 left-0 z-[999] w-full bg-black bg-opacity-60 h-full" onClick={handleOverlayClick}>
      <div className="min-h-[70vh] w-[95%] max-w-lg mx-auto mt-[100px] mb-[100px] container--leadbox rounded-[10px] flex flex-col" ref={leadBoxRef}>
        <div className="bg-white rounded-t-[10px] flex gap-3 items-center justify-between py-4 px-4 border-b">
          <h2 className="text-xl font-semibold">Add Appointment</h2>
          <div
            className="close--lead cursor-pointer"
            onClick={handleAppointmentModal}
          >
            <IoCloseCircle className="text-3xl" />
          </div>
        </div>
        <form onSubmit={formik.handleSubmit}>
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

            {/* SERVICE */}
            <div className="flex gap-2">
              <div className="mb-4 w-[50%]">
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
                />
                {formik.errors.service_id && formik.touched.service_id && (
                  <div className="text-red-500 text-sm">
                    {formik.errors.service_id}
                  </div>
                )}
              </div>

              {/* TRAINER */}
              <div className="mb-4 w-[50%]">
                <label className="block text-sm font-medium text-black mb-2">
                  Trainer<span className="text-red-500">*</span>
                </label>
                <Select
                  value={
                    formik.values.trainer_id
                      ? staffOptions.find(
                          (o) => o.value === formik.values.trainer_id,
                        )
                      : null
                  }
                  onChange={(opt) => {
                    const trainerId = opt?.value || null;

                    formik.setFieldValue("trainer_id", trainerId);

                    formik.setFieldValue("appointment_date_only", null);
                    formik.setFieldValue("appointment_time", null);
                    formik.setFieldValue("appointment_date", null);

                    setBookedSlots([]);

                    if (trainerId) fetchTrainerBookedSlots(trainerId);
                  }}
                  options={staffOptions}
                  styles={customStyles}
                  placeholder="Select trainer"
                />
                {formik.errors.trainer_id && formik.touched.trainer_id && (
                  <div className="text-red-500 text-sm">
                    {formik.errors.trainer_id}
                  </div>
                )}
              </div>
            </div>

            {/* DATE */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-black mb-2">
                Date & Time<span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="custom--date w-[50%]">
                  <DatePicker
                    selected={formik.values.appointment_date_only}
                    onChange={(date) => {
                      formik.setFieldValue("appointment_date_only", date);

                      formik.setFieldValue("appointment_time", null);
                      formik.setFieldValue("appointment_date", null);
                    }}
                    dateFormat="dd/MM/yyyy" 
                    minDate={new Date(new Date().setDate(new Date().getDate() + 1))} // ✅ disables today + past
                    onKeyDown={(e) => {
                      e.preventDefault();
                    }}
                    disabled={!formik.values.trainer_id}
                    placeholderText="Select Date"
                    className="custom--input !w-full"
                  />
                </div>
                <div className=" w-[50%]">
                  {/* TIME */}
                  <Select
                    key={`${formik.values.trainer_id}-${formik.values.appointment_date_only}`}
                    value={
                      formik.values.appointment_time
                        ? timeOptions.find(
                            (o) => o.value === formik.values.appointment_time,
                          )
                        : null
                    }
                    onChange={(opt) => {
                      formik.setFieldValue("appointment_time", opt.value);

                      combineDateTime(
                        formik.values.appointment_date_only,
                        opt.value,
                      );
                    }}
                    options={timeOptions}
                    isDisabled={!formik.values.appointment_date_only}
                    placeholder="Select Time"
                    styles={customStyles}
                  />
                </div>
              </div>
              {formik.touched.appointment_date &&
                formik.errors.appointment_date && (
                  <div className="text-red-500">
                    {formik.errors.appointment_date}
                  </div>
                )}
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
          <div className="flex gap-4 justify-end mt-2">
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
