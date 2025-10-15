import React, { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { customStyles } from "../../Helper/helper";
import { IoCloseCircle } from "react-icons/io5";
import { toast } from "react-toastify";
import { apiAxios } from "../../config/config";

function toCapitalizedCase(inputString) {
  return inputString
    .replace(/_/g, " ") // Replace underscores with spaces
    .split(" ") // Split string by spaces
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
    .join(" "); // Join words back into a single string with spaces
}

// Main component
const CreateAppointment = ({
  setAppointmentModal,
  defaultCategory,
  memberID,
}) => {
  console.log(memberID, "details");
  const leadBoxRef = useRef(null);
  const [packageList, setPackageList] = useState([]);
  const [memberPurchasedServices, setMemberPurchasedServices] = useState([]);
  const [staffList, setStaffList] = useState([]);

  const now = new Date();
  const minTime = new Date();
  minTime.setHours(6, 0, 0, 0);

  const maxTime = new Date();
  maxTime.setHours(22, 0, 0, 0);

  const fetchPackageAvailable = async () => {
    try {
      // Make the API call with query parameters
      const res = await apiAxios().get(
        `/package/available/session/${memberID?.id}`
      );
      const data = res.data?.data || [];
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
      toast.error("Failed to fetch coins");
    }
  };

  const fetchStaff = async (search = "") => {
    try {
      const res = await apiAxios().get("/staff/list", {
        params: search ? { search } : {},
      });
      let data = res.data?.data || res?.data || [];
      const activeService = data?.filter((item) => item?.status === "ACTIVE");
      setStaffList(activeService);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch club");
    }
  };

  useEffect(() => {
    fetchPackageAvailable();
    fetchStaff();
  }, []);

  console.log(packageList, "packageList");

  const staffListOptions =
    staffList?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];

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
      member_id: memberID?.id,
      appointmentCategory: "service",
      package_booking_id: null,
      // serviceVariation: null,
      complementaryType: null,
      date: "2025-10-21",
      time: "11:20",
      appointment_date: "",
      staff_id: null,
      remarks: "",
    },
    validationSchema: Yup.object({
      appointmentCategory: Yup.string().required(
        "Appointment category is required"
      ),
      package_booking_id: Yup.string().when("appointmentCategory", {
        is: "service",
        then: (schema) => schema.required("Please select a service"),
        otherwise: (schema) => schema.nullable(),
      }),
      // serviceVariation: Yup.object().when("appointmentCategory", {
      //   is: "service",
      //   then: (schema) => schema.required("Please select a service variation"),
      //   otherwise: (schema) => schema.nullable(),
      // }),
      complementaryType: Yup.object().when("appointmentCategory", {
        is: "complementary",
        then: (schema) => schema.required("Please select appointment type"),
        otherwise: (schema) => schema.nullable(),
      }),
      appointment_date: Yup.date().required("Date & Time is required"),
      staff_id: Yup.string().required("Trainer selection is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        await apiAxios().post("/package/slot/booking", values);
        toast.success("Appointment booked successfully!");
        console.log("Submitting package ID:", values.package_booking_id);
        console.log("Submitting staff_id ID:", values.staff_id);
        console.log("Submitting remarks ID:", values.remarks);

        // Reset form and close modal
        resetForm();
        handleReset(values.appointmentCategory);
        handleAppointmentModal();
      } catch (error) {
        toast.error("Something went wrong. Please try again.");
        console.error("Error submitting form:", error);
      }
    },
  });

  // Reset logic based on appointmentCategory
  const handleReset = (category) => {
    if (category === "service") {
      formik.setValues({
        appointmentCategory: "service",
        package_booking_id: null,
        // serviceVariation: null,
        complementaryType: null,
        appointment_date: "",
        staff_id: null,
        remarks: "",
      });
    } else if (category === "complementary") {
      formik.setValues({
        appointmentCategory: "complementary",
        package_booking_id: null,
        // serviceVariation: null,
        complementaryType: null,
        appointment_date: "",
        staff_id: null,
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

  const handleAppointmentModal = () => {
    setAppointmentModal(false);
  };

  useEffect(() => {
    if (defaultCategory) {
      formik.setFieldValue("appointmentCategory", defaultCategory);
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
                        name="appointmentCategory"
                        value={cat.value}
                        checked={
                          formik.values.appointmentCategory === cat.value
                        }
                        onChange={() => {
                          if (!isServiceDisabled) {
                            formik.setFieldValue(
                              "appointmentCategory",
                              cat.value
                            );
                            handleReset(cat.value);
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

            {/* Service Appointment Inputs */}
            {formik.values.appointmentCategory === "service" && (
              <>
                {/* Service Select */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black mb-2">
                    Service<span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={memberPurchasedServices.find(
                      (option) =>
                        option.value === formik.values.package_booking_id
                    )}
                    onChange={(selectedOption) =>
                      formik.setFieldValue(
                        "package_booking_id",
                        selectedOption?.value
                      )
                    }
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

                {/* Service Variation */}
                {/* <div className="mb-4">
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
                </div> */}
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
                  selected={formik.values.appointment_date}
                  onChange={(date) =>
                    formik.setFieldValue("appointment_date", date)
                  }
                  showTimeSelect
                  timeFormat="hh:mm aa"
                  dateFormat="dd/MM/yyyy hh:mm aa"
                  placeholderText="Select date & time"
                  className="custom--input !w-full"
                  minDate={now}
                  minTime={minTime}
                  maxTime={maxTime}
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
                Staff<span className="text-red-500">*</span>
              </label>

              <Select
                value={staffListOptions.find(
                  (option) => option.value === formik.values.staff_id
                )}
                onChange={(selectedOption) =>
                  formik.setFieldValue("staff_id", selectedOption?.value)
                }
                options={staffListOptions}
                styles={customStyles}
                placeholder="Select purchased service..."
              />

              {formik.errors.staff_id && formik.touched.staff_id && (
                <div className="text-red-500 text-sm">
                  {formik.errors.staff_id}
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

export default CreateAppointment;
