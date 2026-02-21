import React, { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { customStyles, filterActiveItems } from "../../Helper/helper";
import { IoCloseCircle } from "react-icons/io5";
import { toast } from "react-toastify";
import { authAxios } from "../../config/config";

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
  const [staffList, setStaffList] = useState([]);
  const [serviceList, setServiceList] = useState([]);

  console.log(clubId, "clubId");

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
      toast.error("Failed to fetch club");
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
      toast.error("Failed to fetch club");
    }
  };

  useEffect(() => {
    // Fetch services and staff based on clubId if provided
    fetchStaff(clubId);
    fetchService(clubId);
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
      ? [{ label: "Tour / Trial", value: "TOURTRIAL" }]
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
      console.log(values,'asdefasdf')
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
        toast.error("Something went wrong. Please try again.");
        console.error("Error submitting form:", error);
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

                      const newDate = new Date(date);
                      const isToday =
                        newDate.toDateString() === now.toDateString();

                      if (isToday) {
                        // Round current time to next 30-min slot
                        const roundedNow = roundUpTime(now, 30);
                        newDate.setHours(
                          roundedNow.getHours(),
                          roundedNow.getMinutes(),
                          0,
                          0,
                        );
                      } else {
                        // Future dates → default to 6:00 AM
                        newDate.setHours(6, 0, 0, 0);
                      }

                      formik.setFieldValue("appointment_date", newDate);
                    }}
                    showTimeSelect
                    timeFormat="hh:mm aa"
                    dateFormat="dd/MM/yyyy hh:mm aa"
                    timeIntervals={30} // time slot every 30 minutes
                    placeholderText="Select date & time"
                    className="custom--input !w-full"
                    minDate={now}
                    minTime={
                      formik.values.appointment_date &&
                      formik.values.appointment_date.toDateString() ===
                        now.toDateString()
                        ? roundUpTime(now, 30) // next 30-min slot
                        : minTimeDefault
                    }
                    maxTime={maxTimeDefault}
                  />
                  {formik.errors.appointment_date &&
                    formik.touched.appointment_date && (
                      <div className="text-red-500 text-sm">
                        {formik.errors.appointment_date}
                      </div>
                    )}
                </div>
              </div>

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
                  onChange={(selectedOption) =>
                    formik.setFieldValue(
                      "trainer_id",
                      selectedOption?.value || null,
                    )
                  }
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
            </div>

            {/* Remarks */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-black mb-2">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={formik.values.remarks}
                onChange={formik.handleChange}
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
