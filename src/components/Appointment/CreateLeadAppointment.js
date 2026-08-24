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
import { useSelector } from "react-redux";

function toCapitalizedCase(inputString) {
  return inputString
    .replace(/_/g, " ") // Replace underscores with spaces
    .split(" ") // Split string by spaces
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
    .join(" "); // Join words back into a single string with spaces
}

const NO_SLOTS_OPTION = { label: "No time Slots", value: "", isDisabled: true };

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
  const [checkTrial, setCheckTrial] = useState(false);

  // Raw package data (needed for session_duration) + react-select formatted options
  const [packageList, setPackageList] = useState([]);
  const [memberPurchasedServices, setMemberPurchasedServices] = useState([]);

  // Response from /staff/operating/hours/trainer/slots
  const [trainerSlotsData, setTrainerSlotsData] = useState([]);

  // Guards against out-of-order responses: only the response matching the
  // most recently *issued* request is allowed to update state.
  const slotsRequestIdRef = useRef(0);

  const { user } = useSelector((state) => state.auth);
  const userRole = user.role;

  // ===============================
  // FETCH TRAINER SLOTS (new API)
  // ===============================
  const fetchTrainerSlots = async (trainerId, category, duration) => {
    if (!trainerId || !clubId) {
      setTrainerSlotsData([]);
      return;
    }

    // Mark this call as the latest in-flight request
    const requestId = ++slotsRequestIdRef.current;

    try {
      const bookingType =
        category === "complementary" ? "COMPLIMENTARY" : "PACKAGE";

      const body = {
        trainer_id: trainerId,
        club_id: clubId,
        booking_type: bookingType,
      };

      if (bookingType === "PACKAGE") {
        body.duration = duration;
      }

      const res = await authAxios().post(
        "/staff/operating/hours/trainer/slots",
        body,
      );

      // Ignore this response if a newer request has been issued since
      if (requestId !== slotsRequestIdRef.current) return;

      setTrainerSlotsData(res.data?.data || []);
    } catch (err) {
      if (requestId !== slotsRequestIdRef.current) return;

      console.error(err);
      setTrainerSlotsData([]);
    }
  };

  const fetchPackageAvailable = async () => {
    try {
      // Make the API call with query parameters
      const res = await authAxios().get(
        `/package/available/session/${memberID}`,
      );
      const data = res.data?.data || [];
      console.log("Fetched member purchased services:", data);
      // keep raw data around so we can read session_duration later
      setPackageList(data);

      // Convert to react-select format
      const formattedOptions = data.map((item) => ({
        value: item.id, // what you want to store in Formik
        label: `${toCapitalizedCase(item.package_name)} - ${
          item.no_of_sessions
        } Sessions (${item.available_no_of_sessions} left)`, // what you want to show in dropdown
      }));
      setMemberPurchasedServices(formattedOptions);
    } catch (err) {
      console.error(err);
    }
  };

  // ===============================
  // DATE HELPERS
  // ===============================
  // API returns/expects dates as dd-mm-yyyy
  const formatDateForApi = (date) => {
    if (!date) return null;
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
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
    appointment_category: Yup.string().required(
      "Appointment category is required",
    ),

    package_booking_id: Yup.string().when("appointment_category", {
      is: "service",
      then: (schema) => schema.required("Please select a service"),
      otherwise: (schema) => schema.nullable(),
    }),

    service_id: Yup.string().when("appointment_category", {
      is: "complementary",
      then: (schema) => schema.required("Please select appointment type"),
      otherwise: (schema) => schema.nullable(),
    }),

    appointment_date: Yup.string().required("Date & Time is required"),

    trainer_id: Yup.string().required("Trainer selection is required"),
  });

  // ===============================
  // FORMIK
  // ===============================

  const formik = useFormik({
    initialValues: {
      appointment_category: "complementary",
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

      const payload = {
        member_id: memberID,
        appointment_category: values.appointment_category,
        service_id: values.service_id,
        trainer_id: values.trainer_id,
        club_id: clubId,
        appointment_date: values.appointment_date,
        remarks: values.remarks,
      };

      try {
        await authAxios().post("/appointment/complimentary/create", payload);

        toast.success("Appointment booked successfully!");
        resetForm();
        handleLeadUpdate();
        handleReset(values.appointment_category);
        setAppointmentModal(false);
      } catch (err) {
        toast.error(err.response?.data?.message);
      }
    },
  });

  // Reset logic based on appointment_category
  const handleReset = (category) => {
    setTrainerSlotsData([]);

    formik.setValues({
      ...formik.values,
      appointment_category: category,
      package_booking_id: null,
      service_id: null,
      trainer_id: null,
      appointment_date_only: null,
      appointment_time: null,
      appointment_date: null,
      remarks: "",
    });
  };

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
  // DATES ALLOWED IN THE CALENDAR (must be present in API response)
  // ===============================
  const availableDatesSet = useMemo(() => {
    return new Set(trainerSlotsData.map((d) => d.date));
  }, [trainerSlotsData]);

  // react-datepicker calls this per rendered day; only dates present in
  // the API response (regardless of their slots) are selectable.
  const filterAvailableDate = (date) => {
    const dateStr = formatDateForApi(date);
    return availableDatesSet.has(dateStr);
  };

  // ===============================
  // SELECTED DAY'S SLOT DATA (from new API response)
  // ===============================
  const selectedDayData = useMemo(() => {
    if (!formik.values.appointment_date_only || !trainerSlotsData.length) {
      return null;
    }

    const dateStr = formatDateForApi(formik.values.appointment_date_only);

    return trainerSlotsData.find((d) => d.date === dateStr) || null;
  }, [formik.values.appointment_date_only, trainerSlotsData]);

  // ===============================
  // TIME OPTIONS (driven entirely by server `enable` + holiday flags)
  // ===============================
  const timeOptions = useMemo(() => {
    if (!formik.values.appointment_date_only) return [];

    // No matching day found in the response for the picked date
    if (!selectedDayData) return [NO_SLOTS_OPTION];

    const { slots } = selectedDayData;

    // No slots for this date -> No time Slots
    if (!slots || slots.length === 0) {
      return [NO_SLOTS_OPTION];
    }

    // Normal case: trust server's `enable` flag for each slot
    return slots.map((slot) => ({
      label: formatTo12Hour(slot.time),
      value: slot.time,
      isDisabled: !slot.enable,
    }));
  }, [selectedDayData, formik.values.appointment_date_only]);

  // ===============================
  // FETCH INITIAL DATA
  // ===============================

  const fetchStaff = async (role) => {
    try {
      const res = await authAxios().get("/staff/list", {
        params: {
          club_id: clubId,
          // role: "TRAINER,FITNESS_MANAGER,ASS_FITNESS_MANAGER",
          role,
        },
      });

      setStaffList(res.data?.data || []);
    } catch (err) {
      console.error("fetchStaff error:", err);
    }
  };

  const getSelectedServiceType = () => {
    const category = formik.values.appointment_category;

    // Service Appointment
    if (category === "service") {
      const selectedPackage = packageList.find(
        (p) => p.id === formik.values.package_booking_id
      );

      return selectedPackage?.serviceType || null;
    }

    // Complimentary Appointment
    if (category === "complementary") {
      const selectedService = serviceList.find(
        (s) => s.id === formik.values.service_id
      );

      // Your current API response uses `type`
      // If backend changes/provides `service_type`, this also supports it.
      return selectedService?.type || selectedService?.service_type || null;
    }

    return null;
  };

  const fetchService = async () => {
    const res = await authAxios().get(`/service/list?club_id=${clubId}`);
    setServiceList(res.data?.data || []);
  };

  useEffect(() => {
    fetchPackageAvailable();
  }, []);

  useEffect(() => {
    if (!clubId) return;

    if (memberType === "LEAD") {
      fetchLeadTrial(); // ✅ only for lead
    }

    // fetchStaff();
    fetchService();
  }, [clubId]);

  useEffect(() => {
    formik.setFieldValue("trainer_id", null);
    formik.setFieldValue("appointment_date_only", null);
    formik.setFieldValue("appointment_time", null);
    formik.setFieldValue("appointment_date", null);

    setTrainerSlotsData([]);
  }, [clubId]);

  useEffect(() => {
    if (defaultCategory) {
      formik.setFieldValue("appointment_category", defaultCategory);
    }
  }, [defaultCategory]);

  // Refetch trainer slots whenever trainer, category, or the selected
  // package (which determines duration for PACKAGE bookings) changes.
  useEffect(() => {
    const trainerId = formik.values.trainer_id;
    const category = formik.values.appointment_category;

    if (!trainerId) {
      slotsRequestIdRef.current += 1; // invalidate any in-flight request
      setTrainerSlotsData([]);
      return;
    }

    if (category === "complementary") {
      fetchTrainerSlots(trainerId, "complementary");
      return;
    }

    // category === "service" -> PACKAGE booking, needs duration
    const selectedPackage = packageList.find(
      (p) => p.id === formik.values.package_booking_id,
    );

    if (!selectedPackage) {
      slotsRequestIdRef.current += 1; // invalidate any in-flight request
      setTrainerSlotsData([]);
      return;
    }

    fetchTrainerSlots(trainerId, "service", selectedPackage.session_duration);
  }, [
    formik.values.trainer_id,
    formik.values.package_booking_id,
    formik.values.appointment_category,
    packageList,
    clubId,
  ]);

  // Warn when the picked date has no bookable slots at all
  useEffect(() => {
    if (!formik.values.appointment_date_only) return;

    if (timeOptions.length === 1 && timeOptions[0].value === "") {
      toast.error("No slots available for selected date");
    }
  }, [selectedDayData]);

  useEffect(() => {
    if (!clubId || !formik.values.appointment_category) return;

    const serviceType = getSelectedServiceType();

    if (serviceType === "RECOVERY") {
      fetchStaff("RECOVERY");
    } else {
      fetchStaff("TRAINER,FITNESS_MANAGER,ASS_FITNESS_MANAGER");
    }
  }, [
    clubId,
    formik.values.appointment_category,
    formik.values.package_booking_id,
    formik.values.service_id,
    packageList,
    serviceList,
  ]);

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setAppointmentModal(false);
    }
  };

  const handleAppointmentModal = () => {
    setAppointmentModal(false);
  };
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
              {formik.values.appointment_category === "service" && (
                <div className="mb-4 w-[50%]">
                  <label className="block text-sm font-medium text-black mb-2">
                    Service<span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={memberPurchasedServices.find(
                      (option) =>
                        option.value === formik.values.package_booking_id,
                    )}
                    onChange={(selectedOption) => {
                      formik.setFieldValue(
                        "package_booking_id",
                        selectedOption?.value,
                      );
                      // duration changes with package -> slots must be recomputed
                      formik.setFieldValue("appointment_date_only", null);
                      formik.setFieldValue("appointment_time", null);
                      formik.setFieldValue("appointment_date", null);
                    }}
                    options={memberPurchasedServices}
                    styles={customStyles}
                    placeholder="Select purchased service..."
                  />
                  {formik.errors.package_booking_id &&
                    formik.touched.package_booking_id && (
                      <div className="text-red-500 text-sm">
                        {formik.errors.package_booking_id}
                      </div>
                    )}
                </div>
              )}
              {formik.values.appointment_category === "complementary" && (
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
              )}

              {/* TRAINER */}
              <div className="mb-4 w-[50%]">
                <label className="block text-sm font-medium text-black mb-2">
                  {getSelectedServiceType() === "RECOVERY" ? "Recovery" : "Trainer"}<span className="text-red-500">*</span>
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

                    // slots refetch happens via the useEffect watching trainer_id
                  }}
                  options={staffOptions}
                  styles={customStyles}
                  placeholder={
                    getSelectedServiceType() === "RECOVERY"
                      ? "Select recovery"
                      : "Select trainer"
                  }
                  isDisabled={!formik.values.appointment_category}
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
                    minDate={new Date()}
                    filterDate={filterAvailableDate}
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
                      if (!opt || opt.value === "") return;

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
