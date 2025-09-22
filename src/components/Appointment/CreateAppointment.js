import React, { useEffect, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { customStyles } from "../../Helper/helper";
import { IoCloseCircle } from "react-icons/io5";
import { toast } from "react-toastify";

// Main component
const CreateAppointment = ({ setAppointmentModal }) => {
  const leadBoxRef = useRef(null);
  const memberPurchasedServices = [
    {
      value: "pt-001",
      label: "Personal Training - 12 Sessions (8 left)",
      type: "PT",
      trainer: "John Smith",
      sessionsLeft: 8,
    },
    {
      value: "pt-002",
      label: "Personal Training - 24 Sessions (15 left)",
      type: "PT",
      trainer: "Sarah Wilson",
      sessionsLeft: 15,
    },
    {
      value: "rec-001",
      label: "Recovery Sessions - 8 Sessions (5 left)",
      type: "Recovery",
      trainer: "Mike Johnson",
      sessionsLeft: 5,
    },
  ];

  const serviceVariations = [
    { value: "morning", label: "Morning" },
    { value: "afternoon", label: "Afternoon" },
    { value: "evening", label: "Evening" },
  ];

  const trainers = [
    { value: "trainer1", label: "John Smith" },
    { value: "trainer2", label: "Sarah Wilson" },
    { value: "trainer3", label: "Mike Johnson" },
    { value: "trainer4", label: "Emma Davis" },
    { value: "trainer5", label: "David Brown" },
  ];

  const complementaryTypes = [
    { value: "pt", label: "Personal Training" },
    { value: "group-class", label: "Group Class" },
    { value: "assessment", label: "Assessment" },
    { value: "tour", label: "Tour" },
  ];

  const appointmentCategories = [
    { value: "service", label: "Service Appointment" },
    { value: "complementary", label: "Complimentary Appointment" },
  ];

  // Formik setup
  const formik = useFormik({
    initialValues: {
      appointmentCategory: "service",
      selectedService: null,
      serviceVariation: null,
      complementaryType: null,
      selectedDateTime: null,
      selectedTrainer: null,
      remarks: "",
    },
    validationSchema: Yup.object({
      appointmentCategory: Yup.string().required(
        "Appointment category is required"
      ),
      selectedService: Yup.object().when("appointmentCategory", {
        is: "service",
        then: (schema) => schema.required("Please select a service"),
        otherwise: (schema) => schema.nullable(),
      }),
      serviceVariation: Yup.object().when("appointmentCategory", {
        is: "service",
        then: (schema) => schema.required("Please select a service variation"),
        otherwise: (schema) => schema.nullable(),
      }),
      complementaryType: Yup.object().when("appointmentCategory", {
        is: "complementary",
        then: (schema) => schema.required("Please select appointment type"),
        otherwise: (schema) => schema.nullable(),
      }),
      selectedDateTime: Yup.date().required("Date & Time is required"),
      selectedTrainer: Yup.object().required("Trainer selection is required"),
    }),
    onSubmit: (values, { resetForm }) => {
      const appointmentData = {
        appointmentCategory: values.appointmentCategory,
        ...(values.appointmentCategory === "service"
          ? {
              service: values.selectedService,
              serviceVariation: values.serviceVariation,
            }
          : { complementaryType: values.complementaryType }),
        date: values.selectedDate,
        dateTime: values.selectedDateTime,
        trainer: values.selectedTrainer.label,
        remarks: values.remarks,
      };
      console.log("Appointment booked:", appointmentData);
      toast.success("Appointment booked successfully!");
      handleReset(values.appointmentCategory);
      handleLeadModal();
    },
  });

  // Auto-select PT trainer if service is PT
  useEffect(() => {
    if (formik.values.selectedService?.type === "PT") {
      const defaultTrainer = trainers.find(
        (trainer) => trainer.label === formik.values.selectedService.trainer
      );
      if (defaultTrainer) {
        formik.setFieldValue("selectedTrainer", defaultTrainer);
      }
    }
  }, [formik.values.selectedService]);

  // Reset logic based on appointmentCategory
  const handleReset = (category) => {
    if (category === "service") {
      formik.setValues({
        appointmentCategory: "service",
        selectedService: null,
        serviceVariation: null,
        complementaryType: null,
        selectedDate: null,
        selectedDateTime: null,
        selectedTrainer: null,
        remarks: "",
      });
    } else if (category === "complementary") {
      formik.setValues({
        appointmentCategory: "complementary",
        selectedService: null,
        serviceVariation: null,
        complementaryType: null,
        selectedDate: null,
        selectedDateTime: null,
        selectedTrainer: null,
        remarks: "",
      });
    } else {
      formik.resetForm();
    }
  };

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setAppointmentModal(false);
    }
  };

  const handleLeadModal = () => {
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
          <div className="close--lead cursor-pointer" onClick={handleLeadModal}>
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
                {appointmentCategories.map((cat) => (
                  <label key={cat.value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="appointmentCategory"
                      value={cat.value}
                      checked={formik.values.appointmentCategory === cat.value}
                      onChange={() => {
                        formik.setFieldValue("appointmentCategory", cat.value);
                        handleReset(cat.value);
                      }}
                      className="w-auto custom--input"
                    />
                    {cat.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Service Appointment Inputs */}
            {formik.values.appointmentCategory === "service" && (
              <>
                {/* Service Select */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black mb-2">
                    Service<span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formik.values.selectedService}
                    onChange={(value) =>
                      formik.setFieldValue("selectedService", value)
                    }
                    options={memberPurchasedServices}
                    styles={customStyles}
                    placeholder="Select purchased service..."
                  />
                  {formik.errors.selectedService &&
                    formik.touched.selectedService && (
                      <div className="text-red-500 text-sm">
                        {formik.errors.selectedService}
                      </div>
                    )}
                </div>

                {/* Service Variation */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black mb-2">
                    Service Variation <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formik.values.serviceVariation}
                    onChange={(value) =>
                      formik.setFieldValue("serviceVariation", value)
                    }
                    options={serviceVariations}
                    styles={customStyles}
                    placeholder="Select service variation..."
                  />
                  {formik.errors.serviceVariation &&
                    formik.touched.serviceVariation && (
                      <div className="text-red-500 text-sm">
                        {formik.errors.serviceVariation}
                      </div>
                    )}
                </div>
              </>
            )}

            {/* Complimentary Appointment Inputs */}
            {formik.values.appointmentCategory === "complementary" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-2">
                  Appointment Type<span className="text-red-500">*</span>
                </label>
                <Select
                  value={formik.values.complementaryType}
                  onChange={(value) =>
                    formik.setFieldValue("complementaryType", value)
                  }
                  options={complementaryTypes}
                  styles={customStyles}
                  placeholder="Select complementary appointment type..."
                />
                {formik.errors.complementaryType &&
                  formik.touched.complementaryType && (
                    <div className="text-red-500 text-sm">
                      {formik.errors.complementaryType}
                    </div>
                  )}
              </div>
            )}

            {/* DateTime Picker */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-black mb-2">
                Date & Time<span className="text-red-500">*</span>
              </label>
              <div className="custom--date">
                <DatePicker
                  selected={formik.values.selectedDateTime}
                  onChange={(date) =>
                    formik.setFieldValue("selectedDateTime", date)
                  }
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={60}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  placeholderText="Select date and time..."
                  className="custom--input !w-full"
                />
                {formik.errors.selectedDateTime &&
                  formik.touched.selectedDateTime && (
                    <div className="text-red-500 text-sm">
                      {formik.errors.selectedDateTime}
                    </div>
                  )}
              </div>
            </div>

            {/* Trainer Select */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-black mb-2">
                Staff<span className="text-red-500">*</span>
              </label>
              <Select
                value={formik.values.selectedTrainer}
                onChange={(value) =>
                  formik.setFieldValue("selectedTrainer", value)
                }
                options={trainers}
                styles={customStyles}
                placeholder="Select staff..."
              />
              {formik.errors.selectedTrainer &&
                  formik.touched.selectedTrainer && (
                    <div className="text-red-500 text-sm">
                      {formik.errors.selectedTrainer}
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
              onClick={handleLeadModal}
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

export default CreateAppointment;
