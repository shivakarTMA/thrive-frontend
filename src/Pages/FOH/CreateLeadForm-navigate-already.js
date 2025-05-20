import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import {
  servicesName,
  leadsSources,
  leadTypes,
  companies,
  trainerAvailability,
  mockData,
} from "../../DummyData/DummyData";

import { customStyles, formatDateTime, formatTime } from "../../Helper/helper";
import { IoCloseCircle } from "react-icons/io5";
import { Formik, Field, Form, ErrorMessage, useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";

const assignTrainers = [
  { value: "shivakar", label: "Shivakar" },
  { value: "nitin", label: "Nitin" },
  { value: "esha", label: "Esha" },
  { value: "apporva", label: "Apporva" },
];

const validationSchema = Yup.object({
  personalDetails: Yup.object({
    name: Yup.string()
      .min(3, "Name must be at least 3 characters")
      .required("Name is required"),
    contactNumber: Yup.string()
      // .matches(/^\d{10}$/, "Contact Number must be 10 digits")
      .required("Contact Number is required"),
    // email: Yup.string()
    //   .email("Invalid email address")
    //   .required("Email is required"),
    // gender: Yup.string().required("Gender is required"),
    // address: Yup.string().required("address is required"),
  }),

  leadInformation: Yup.object({
    // enquiryDate: Yup.date().required("Enquiry Date is required"),
    // serviceName: Yup.string().required("Service Name is required"),
    leadSource: Yup.string().required("Lead Source is required"),
    leadType: Yup.string().required("Lead Type is required"),
    // companyName: Yup.string().required("Company Name is required"),
    // officialEmail: Yup.string()
    //   .email("Invalid email address")
    //   .required("Official Email is required"),
  }),

  // schedule: Yup.object({
  //   type: Yup.string().required("Schedule Type is required"),
  //   date: Yup.date().required("Schedule Date is required"),
  //   time: Yup.string().required("Schedule Time is required"),
  //   trainer: Yup.string().required("Trainer is required"),
  // }),

  // scheduleLeadFollowUp: Yup.object({
  //   staffName: Yup.string().required("Staff Name is required"),
  //   date: Yup.date().required("Follow-up Date is required"),
  //   time: Yup.string().required("Follow-up Time is required"),
  //   callTag: Yup.string().required("Call Tag is required"),
  //   message: Yup.string().required("Message is required"),
  // }),

  // professionalInfoPrimaryContact: Yup.object({
  //   designation: Yup.string().required("designation is required"),
  //   companyName: Yup.string().required("Company Name is required"),
  //   officialEmail: Yup.string()
  //     .email("Invalid email address")
  //     .required("Official Email is required"),
  // }),

  // hrDetails: Yup.object({
  //   companyName: Yup.string().required("HR Company Name is required"),
  //   hrContact: Yup.string()
  //     .matches(/^\d{10}$/, "HR Contact must be 10 digits")
  //     .required("HR Contact is required"),
  //   hrEmail: Yup.string()
  //     .email("Invalid email address")
  //     .required("HR Email is required"),
  // }),
});

const CreateLeadForm = ({ setLeadModal }) => {
  const [activeTab, setActiveTab] = useState("personal");
  const leadBoxRef = useRef(null);

  const navigate = useNavigate();
  const [matchingUsers, setMatchingUsers] = useState([]);

  const initialValues = {
    personalDetails: {
      name: "",
      contactNumber: "",
      email: "",
      gender: "",
      dob: "",
      address: "",
    },
    leadInformation: {
      enquiryDate: new Date(),
      serviceName: "",
      leadSource: "",
      leadType: "",
      companyName: "",
      officialEmail: "",
    },
    schedule: {
      type: "tour",
      date: null,
      time: null,
      trainer: "",
    },
    scheduleLeadFollowUp: {
      staffName: "",
      date: null,
      time: null,
      callTag: "",
      message: "",
    },
    professionalInfoPrimaryContact: {
      designation: "",
      companyName: "",
      officialEmail: "",
    },
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      console.log(values, "values");
    },
  });

  const handlePhoneChange = (value) => {
    formik.setFieldValue("personalDetails.contactNumber", value);

    if (value && value.length >= 5) {
      const matches = mockData.filter((user) =>
        user.contact.replace(/\s/g, "").includes(value.replace(/\s/g, ""))
      );
      setMatchingUsers(matches);
    } else {
      setMatchingUsers([]);
    }
  };

  const handleUserSelect = (user) => {
    navigate(`/lead-details/${user.id}`, { state: user });
    setLeadModal(false);
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    const keys = name.split(".");
    formik.setFieldValue(name, value); // Directly set the field value in Formik
  };

  const handleTimeSchedule = (sectionKey, time) => {
    const formattedTime = formatTime(time);
    formik.setFieldValue(`${sectionKey}.time`, formattedTime);

    // If a trainer is already assigned, clear it
    if (formik.values[sectionKey]?.trainer !== undefined) {
      formik.setFieldValue(`${sectionKey}.trainer`, "");
    }
  };

  const handleSelectSchedule = (name, selectedOption) => {
    formik.setFieldValue("schedule.trainer", selectedOption.value);
  };

  const getAvailableTrainers = () => {
    const { date, time } = formik.values.schedule;
    if (!date || !time) return [];
    const combinedDateTime = new Date(`${date}T${time}`);

    if (isNaN(combinedDateTime)) return [];

    return assignTrainers.filter((trainer) =>
      trainerAvailability[trainer.value]?.some((slot) => {
        const slotDateTime = new Date(`${slot.date}T${slot.time}`);
        return slotDateTime.getTime() === combinedDateTime.getTime();
      })
    );
  };

  const handleDateSchedule = (date) => {
    const formattedDate = formatDateTime(date);
    formik.setFieldValue("schedule.date", formattedDate);
    formik.setFieldValue("schedule.time", null); // Clear time on date change
    formik.setFieldValue("schedule.trainer", ""); // Clear trainer
  };

  const handleDateChange = (fieldPath, date, withTime = false) => {
    const formatted = formatDateTime(date, withTime);
    formik.setFieldValue(fieldPath, formatted);
  };

  const handleSelectChange = (name, selectedOption) => {
    formik.setFieldValue(name, selectedOption.value);
  };

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setLeadModal(false);
    }
  };

  const handleLeadModal = () => {
    setLeadModal(false);
  };

  useEffect(() => {
    if (!formik.values.leadInformation.enquiryDate) {
      formik.setFieldValue("leadInformation.enquiryDate", new Date());
    }
  }, []);

  return (
    <div
      className="create--lead--container fixed top-0 left-0 z-[999] w-full bg-black bg-opacity-60 h-full"
      onClick={handleOverlayClick}
    >
      <div
        className="max-w-5xl border shadow bg-white ms-auto h-full overflow-auto hide--overflow container--leadbox"
        ref={leadBoxRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-3 items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Create a Lead</h2>
          <div className="close--lead cursor-pointer" onClick={handleLeadModal}>
            <IoCloseCircle className="text-3xl" />
          </div>
        </div>

        <div className="p-6">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab("personal")}
              className={`px-4 py-2 rounded border ${
                activeTab === "personal"
                  ? "bg-black text-white"
                  : "bg-white text-black"
              }`}
            >
              Personal Information
            </button>
            <button
              onClick={() => setActiveTab("professional")}
              className={`px-4 py-2 rounded border ${
                activeTab === "professional"
                  ? "bg-black text-white"
                  : "bg-white text-black"
              }`}
            >
              Professional Information
            </button>
          </div>

          <form className="space-y-6" onSubmit={formik.handleSubmit}>
            {activeTab === "personal" && (
              <>
                <h3 className="text-2xl font-semibold">Personal Details</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="relative">
                    <label className="mb-2 block">
                      Contact Number<span className="text-red-500">*</span>
                    </label>
                    <PhoneInput
                      name="personalDetails.contactNumber"
                      value={formik.values.personalDetails.contactNumber}
                      onChange={handlePhoneChange}
                      international
                      defaultCountry="IN"
                      className="custom--input w-full custom--phone"
                    />

                    {/* Dropdown: Matching Users */}
                    {matchingUsers.length > 0 && (
                      <div className="border mt-2 bg-white shadow rounded p-2 max-h-40 overflow-y-auto z-10 absolute w-full">
                        {matchingUsers.map((user) => (
                          <div
                            key={user.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                            onClick={() => handleUserSelect(user)}
                          >
                            <img
                              src={user.profileImage}
                              alt={user.name}
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-gray-500 text-xs">
                                {user.email}
                              </div>
                              <div className="text-gray-400 text-xs">
                                {user.contact}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {formik.errors.personalDetails?.contactNumber &&
                      formik.touched.personalDetails?.contactNumber && (
                        <div className="text-red-500 text-sm">
                          {formik.errors.personalDetails.contactNumber}
                        </div>
                      )}
                  </div>
                  <div>
                    <label className="mb-2 block">
                      Full Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      name="personalDetails.name"
                      value={formik.values.personalDetails.name}
                      onChange={formik.handleChange}
                      className="custom--input w-full"
                    />
                    {formik.errors.personalDetails?.name &&
                      formik.touched.personalDetails?.name && (
                        <div className="text-red-500 text-sm">
                          {formik.errors.personalDetails.name}
                        </div>
                      )}
                    {/* <ErrorMessage
                      name="personalDetails.name"
                      component="div"
                      className="text-red-500 text-sm"
                    /> */}
                  </div>

                  <div>
                    <label className="mb-2 block">Email</label>
                    <input
                      type="email"
                      name="personalDetails.email"
                      value={formik.values.personalDetails.email}
                      onChange={formik.handleChange}
                      className="custom--input w-full"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block">DOB</label>
                    <div className="custom--date">
                      <DatePicker
                        selected={
                          formik.values.personalDetails.dob
                            ? new Date(formik.values.personalDetails.dob)
                            : null
                        }
                        onChange={(date) =>
                          formik.setFieldValue("personalDetails.dob", date)
                        }
                        dateFormat="dd MMM yyyy"
                        placeholderText="Select date"
                      />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="mb-2 block">Address</label>
                    <input
                      name="personalDetails.address"
                      value={formik.values.personalDetails.address}
                      onChange={formik.handleChange}
                      className="custom--input w-full"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block">Gender</label>
                    <div className="flex gap-2">
                      <label className="custom--radio">
                        Male
                        <input
                          type="radio"
                          name="personalDetails.gender"
                          value="Male"
                          checked={
                            formik.values.personalDetails.gender === "Male"
                          }
                          className="w-4 h-4"
                          onChange={formik.handleChange}
                        />
                        <span className="radio-checkmark"></span>
                      </label>
                      <label className="custom--radio">
                        Female
                        <input
                          type="radio"
                          name="personalDetails.gender"
                          value="Female"
                          checked={
                            formik.values.personalDetails.gender === "Female"
                          }
                          className="w-4 h-4"
                          onChange={formik.handleChange}
                        />
                        <span className="radio-checkmark"></span>
                      </label>
                    </div>
                  </div>
                </div>

                <hr />
                <h3 className="text-2xl font-semibold">Lead Information</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="mb-2 block">Enquiry Date</label>
                    <div className="custom--date">
                      <DatePicker
                        selected={
                          formik.values.leadInformation.enquiryDate
                            ? new Date(
                                formik.values.leadInformation.enquiryDate
                              )
                            : null
                        }
                        onChange={(date) =>
                          formik.setFieldValue(
                            "leadInformation.enquiryDate",
                            date
                          )
                        }
                        dateFormat="dd MMM yyyy"
                        placeholderText="Select date"
                        readOnly={true}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block">Service Name</label>
                    <Select
                      name="leadInformation.serviceName"
                      value={servicesName.find(
                        (opt) =>
                          opt.value ===
                          formik.values.leadInformation.serviceName
                      )}
                      onChange={(option) =>
                        formik.setFieldValue(
                          "leadInformation.serviceName",
                          option.value
                        )
                      }
                      options={servicesName}
                      styles={customStyles}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block">
                      Lead Source<span className="text-red-500">*</span>
                    </label>
                    <Select
                      name="leadInformation.leadSource"
                      value={leadsSources.find(
                        (opt) =>
                          opt.value === formik.values.leadInformation.leadSource
                      )}
                      onChange={(option) =>
                        formik.setFieldValue(
                          "leadInformation.leadSource",
                          option.value
                        )
                      }
                      options={leadsSources}
                      styles={customStyles}
                    />
                    {formik.errors.leadInformation?.leadSource &&
                      formik.touched.leadInformation?.leadSource && (
                        <div className="text-red-500 text-sm">
                          {formik.errors.leadInformation.leadSource}
                        </div>
                      )}
                  </div>
                  <div>
                    <label className="mb-2 block">
                      Lead Type<span className="text-red-500">*</span>
                    </label>
                    <Select
                      name="leadInformation.leadType"
                      value={leadTypes.find(
                        (opt) =>
                          opt.value === formik.values.leadInformation.leadType
                      )}
                      onChange={(option) =>
                        formik.setFieldValue(
                          "leadInformation.leadType",
                          option.value
                        )
                      }
                      options={leadTypes}
                      styles={customStyles}
                    />
                    {formik.errors.leadInformation?.leadType &&
                      formik.touched.leadInformation?.leadType && (
                        <div className="text-red-500 text-sm">
                          {formik.errors.leadInformation.leadType}
                        </div>
                      )}
                  </div>
                  <div>
                    <label className="mb-2 block">Company</label>
                    <Select
                      name="leadInformation.companyName"
                      value={companies.find(
                        (opt) =>
                          opt.value ===
                          formik.values.leadInformation.companyName
                      )}
                      onChange={(option) =>
                        formik.setFieldValue(
                          "leadInformation.companyName",
                          option.value
                        )
                      }
                      options={companies}
                      styles={customStyles}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block">Official Email Id</label>
                    <input
                      type="email"
                      name="leadInformation.officialEmail"
                      value={formik.values.leadInformation.officialEmail}
                      onChange={formik.handleChange}
                      className="custom--input w-full"
                    />
                  </div>
                </div>
                <hr />
                <h3 className="text-2xl font-semibold">Schedule</h3>
                <div>
                  <label className="mb-2 block">Schedule</label>
                  <div className="flex gap-4">
                    <label className="custom--radio">
                      Tour
                      <input
                        type="radio"
                        name="schedule.type"
                        value="tour"
                        checked={formik.values.schedule.type === "tour"}
                        onChange={handleInput}
                        className="w-4 h-4 mr-1"
                      />
                      <span className="radio-checkmark"></span>
                    </label>
                    <label className="custom--radio">
                      Trial
                      <input
                        type="radio"
                        name="schedule.type"
                        value="trial"
                        checked={formik.values.schedule.type === "trial"}
                        onChange={handleInput}
                        className="w-4 h-4 custom--radio mr-1"
                      />
                      <span className="radio-checkmark"></span>
                    </label>
                    <label className="custom--radio">
                      Nothing
                      <input
                        type="radio"
                        name="schedule.type"
                        value="nothing"
                        checked={formik.values.schedule.type === "nothing"}
                        onChange={handleInput}
                        className="w-4 h-4 custom--radio mr-1"
                      />
                      <span className="radio-checkmark"></span>
                    </label>
                  </div>
                  {formik.values.schedule.type === "nothing" ? null : (
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      <div className="col-span-2">
                        <label className="mb-2 block">Date & Time</label>
                        <div className="flex gap-4">
                          <div className="custom--date flex-1">
                            <DatePicker
                              selected={formik.values.schedule.date}
                              onChange={handleDateSchedule}
                              minDate={new Date()}
                              dateFormat="dd MMM yyyy"
                              placeholderText="Choose a date"
                              className="border px-3 py-2 w-full"
                            />
                          </div>
                          <div className="custom--date flex-1">
                            <DatePicker
                              selected={
                                formik.values.schedule.time
                                  ? new Date(
                                      `${formik.values.schedule.date}T${formik.values.schedule.time}`
                                    )
                                  : null
                              }
                              onChange={(time) =>
                                handleTimeSchedule("schedule", time)
                              }
                              showTimeSelect
                              showTimeSelectOnly
                              timeIntervals={30}
                              timeCaption="Time"
                              dateFormat="h:mm aa"
                              placeholderText="Choose a time"
                              className="border px-3 py-2 w-full"
                              filterTime={(time) => {
                                const now = new Date();
                                const selectedDate = formik.values.schedule.date
                                  ? new Date(formik.values.schedule.date)
                                  : null;

                                if (!selectedDate) return true;

                                const combined = new Date(
                                  selectedDate.getFullYear(),
                                  selectedDate.getMonth(),
                                  selectedDate.getDate(),
                                  time.getHours(),
                                  time.getMinutes()
                                );

                                return combined > now;
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {formik.values.schedule.date &&
                        formik.values.schedule.time && (
                          <div className="mb-4">
                            <label className="mb-2 block">
                              Available Trainers
                            </label>
                            <Select
                              name="schedule.trainer"
                              value={assignTrainers.find(
                                (opt) =>
                                  opt.value === formik.values.schedule.trainer
                              )}
                              onChange={(option) =>
                                handleSelectSchedule("schedule.trainer", option)
                              }
                              options={getAvailableTrainers()}
                              placeholder="Select available trainer"
                              styles={customStyles}
                              isDisabled={!getAvailableTrainers().length}
                            />
                            {!getAvailableTrainers().length && (
                              <p className="text-sm text-red-500 mt-1">
                                No trainers available at this date and time.
                              </p>
                            )}
                          </div>
                        )}
                    </div>
                  )}
                </div>

                <hr />
                <h3 className="text-2xl font-semibold">
                  Schedule Lead follow-up
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="mb-2 block">Staff Name</label>
                    <Select
                      name="scheduleLeadFollowUp.staffName"
                      value={servicesName.find(
                        (opt) =>
                          opt.value ===
                          formik.values.scheduleLeadFollowUp.staffName
                      )}
                      onChange={(option) =>
                        handleSelectChange(
                          "scheduleLeadFollowUp.staffName",
                          option
                        )
                      }
                      options={servicesName}
                      styles={customStyles}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block">Date & Time</label>
                    <div className="flex gap-4">
                      <div className="custom--date flex-1">
                        <DatePicker
                          selected={
                            formik.values.scheduleLeadFollowUp.date
                              ? new Date(
                                  formik.values.scheduleLeadFollowUp.date
                                )
                              : null
                          }
                          onChange={(date) =>
                            handleDateChange("scheduleLeadFollowUp.date", date)
                          }
                          dateFormat="dd MMM yyyy"
                          placeholderText="Select date"
                        />
                      </div>
                      <div className="custom--date flex-1">
                        <DatePicker
                          selected={
                            formik.values.scheduleLeadFollowUp.time
                              ? new Date(
                                  `${formik.values.scheduleLeadFollowUp.date}T${formik.values.scheduleLeadFollowUp.time}`
                                )
                              : null
                          }
                          onChange={(time) =>
                            handleTimeSchedule("scheduleLeadFollowUp", time)
                          }
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={30}
                          timeCaption="Time"
                          dateFormat="h:mm aa"
                          placeholderText="Choose a time"
                          className="border px-3 py-2 w-full"
                          filterTime={(time) => {
                            const now = new Date();
                            const selectedDate = formik.values
                              .scheduleLeadFollowUp.date
                              ? new Date(
                                  formik.values.scheduleLeadFollowUp.date
                                )
                              : null;

                            if (!selectedDate) return true;

                            const combined = new Date(
                              selectedDate.getFullYear(),
                              selectedDate.getMonth(),
                              selectedDate.getDate(),
                              time.getHours(),
                              time.getMinutes()
                            );

                            return combined > now;
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block">Call Tag</label>
                    <div className="flex gap-2">
                      <label
                        className="custom--radio"
                        style={{ color: "#00f" }}
                      >
                        Cold
                        <input
                          type="radio"
                          name="scheduleLeadFollowUp.callTag"
                          value="cold"
                          checked={
                            formik.values.scheduleLeadFollowUp.callTag ===
                            "cold"
                          }
                          className="w-4 h-4"
                          onChange={handleInput}
                        />
                        <span className="radio-checkmark cold"></span>
                      </label>
                      <label
                        className="custom--radio"
                        style={{ color: "#ffa500" }}
                      >
                        Warm
                        <input
                          type="radio"
                          name="scheduleLeadFollowUp.callTag"
                          className="w-4 h-4"
                          value="warm"
                          checked={
                            formik.values.scheduleLeadFollowUp.callTag ===
                            "warm"
                          }
                          onChange={handleInput}
                        />
                        <span className="radio-checkmark warm"></span>
                      </label>
                      <label
                        className="custom--radio"
                        style={{ color: "#f00" }}
                      >
                        Hot
                        <input
                          type="radio"
                          name="scheduleLeadFollowUp.callTag"
                          className="w-4 h-4"
                          value="hot"
                          checked={
                            formik.values.scheduleLeadFollowUp.callTag === "hot"
                          }
                          onChange={handleInput}
                        />
                        <span className="radio-checkmark hot"></span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block">Message</label>
                  <textarea
                    name="scheduleLeadFollowUp.message"
                    value={formik.values.scheduleLeadFollowUp.message}
                    onChange={handleInput}
                    className="custom--input w-full"
                  />
                </div>
              </>
            )}

            {/* Professional tab is intentionally skipped as requested */}
            {activeTab === "professional" && (
              <>
                <h3 className="text-2xl font-semibold">
                  Professional Information Primary Contact
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="mb-2 block">Company name</label>
                    <input
                      name="professionalInfoPrimaryContact.companyName"
                      value={
                        formik.values.professionalInfoPrimaryContact.companyName
                      }
                      onChange={handleInput}
                      className="custom--input w-full"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block">Designation</label>
                    <input
                      name="professionalInfoPrimaryContact.designation"
                      value={
                        formik.values.professionalInfoPrimaryContact.designation
                      }
                      onChange={handleInput}
                      className="custom--input w-full"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block">Official Email</label>
                    <input
                      type="email"
                      name="professionalInfoPrimaryContact.officialEmail"
                      value={
                        formik.values.professionalInfoPrimaryContact
                          .officialEmail
                      }
                      onChange={handleInput}
                      className="custom--input w-full"
                    />
                  </div>
                </div>

                {/* <hr /> */}

                {/* <h3 className="text-2xl font-semibold">HR Details</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="mb-2 block">Company address</label>
                    <input
                      name="hrDetails.companyAddress"
                      value={formik.values.hrDetails.companyAddress}
                      onChange={handleInput}
                      className="custom--input w-full"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block">Contact Number</label>
                    <PhoneInput
                      name="hrDetails.contactNumber"
                      value={formik.values.hrDetails.contactNumber}
                      onChange={(value) =>
                        formik.setFieldValue("hrDetails.contactNumber", value)
                      }
                      international
                      defaultCountry="IN"
                      countryCallingCodeEditable={false}
                      className="custom--input w-full custom--phone"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block">Email</label>
                    <input
                      type="email"
                      name="hrDetails.hrEmail"
                      value={formik.values.hrDetails.hrEmail}
                      onChange={handleInput}
                      className="custom--input w-full"
                    />
                  </div>
                </div> */}
              </>
            )}

            <div className="flex gap-4 justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white rounded"
              >
                Submit
              </button>
              <button
                type="button"
                className="px-4 py-2 border rounded"
                onClick={() => {
                  formik.resetForm();
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateLeadForm;
