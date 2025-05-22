import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-phone-number-input/style.css";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { FaMale, FaFemale } from "react-icons/fa";
import {
  servicesName,
  leadsSources,
  leadTypes,
  companies,
  trainerAvailability,
  mockData,
  leadSubTypes,
} from "../DummyData/DummyData";

import {
  convertToISODate,
  customStyles,
  formatDateTime,
  formatTime,
} from "../Helper/helper";
import { IoCloseCircle } from "react-icons/io5";
import { Formik, Field, Form, ErrorMessage, useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const assignTrainers = [
  { value: "shivakar", label: "Shivakar" },
  { value: "nitin", label: "Nitin" },
  { value: "esha", label: "Esha" },
  { value: "apporva", label: "Apporva" },
];

const leadSourceTypes = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
];

const stepValidationSchemas = [
  Yup.object({
    personalDetails: Yup.object({
      name: Yup.string()
        .min(3, "Name must be at least 3 characters")
        .required("Name is required"),
      contactNumber: Yup.string()
        .required("Contact number is required")
        .test("is-valid-phone", "Invalid phone number", function (value) {
          return isValidPhoneNumber(value || "");
        }),
    }),
  }),
  Yup.object({
    leadInformation: Yup.object({
      leadSource: Yup.string().required("Lead Source is required"),
      leadType: Yup.string().required("Lead Type is required"),
      leadSubType: Yup.string().when("leadType", {
        is: "phone",
        then: () => Yup.string().required("This is required"),
      }),
      leadSourceType: Yup.string().when("leadSource", {
        is: (val) => ["social media", "events / campaigns"].includes(val),
        then: () => Yup.string().required("This is required"),
      }),
    }),
  }),
  Yup.object({}),
  Yup.object({}),
];

const CreateLeadForm = ({ setLeadModal }) => {
  const [activeTab, setActiveTab] = useState("personal");
  const leadBoxRef = useRef(null);
  const [step, setStep] = useState(0);
  const steps = [0, 1, 2, 3];
  const currentStep = 2;
  const navigate = useNavigate();
  const [matchingUsers, setMatchingUsers] = useState([]);
  const now = new Date();

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
      leadSourceType:"",
      leadType: "",
      leadSubType: "",
      companyName: "",
      officialEmail: "",
    },
    schedule: {
      type: "",
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
    validationSchema: stepValidationSchemas[step],
    onSubmit: (values) => {
      if (step === stepValidationSchemas.length - 1) {
        toast.success("Lead created successfully!");
        setLeadModal(false);
        console.log("Submitting full form", values);
      } else {
        setStep(step + 1);
      }
    },
  });

  const selectedDateTime = (() => {
    const { date, time } = formik.values.schedule;
    if (date && time) {
      const fullDate = new Date(`${date}T${time}`);
      return isNaN(fullDate.getTime()) ? now : fullDate;
    }
    return now;
  })();

  const handleDateTrainerChange = (val) => {
    if (!val) return;

    const dateOnly = val.toISOString().split("T")[0];
    const hours = val.getHours().toString().padStart(2, "0");
    const minutes = val.getMinutes().toString().padStart(2, "0");
    const timeOnly = `${hours}:${minutes}`;

    formik.setFieldValue("schedule.date", dateOnly);
    formik.setFieldValue("schedule.time", timeOnly);
  };

  const isTodaySelected =
    selectedDateTime.toDateString() === now.toDateString();

  // minTime logic: current time if today, else 12:00 AM
  const minTime = new Date(selectedDateTime);
  if (isTodaySelected) {
    minTime.setHours(now.getHours(), now.getMinutes(), 0, 0);
  } else {
    minTime.setHours(0, 0, 0, 0); // 12:00 AM
  }

  // maxTime: always 11:59 PM
  const maxTime = new Date(selectedDateTime);
  maxTime.setHours(23, 59, 59, 999);
  // const isTodaySelected =
  //   selectedDateTime.toDateString() === now.toDateString();

  // const minTime = isTodaySelected ? now : new Date(0, 0, 0, 0, 0); // midnight
  // const maxTime = new Date(0, 0, 0, 23, 59, 59); // 11:59 PM

  const handleNextStep = async () => {
    const errors = await formik.validateForm();

    // Check if contact is duplicated
    if (
      step === 0 && // assuming step 0 is where phone is entered
      matchingUsers.length > 0
    ) {
      toast.error("This contact number is already registered.");
      return; // prevent moving to the next step
    }

    if (Object.keys(errors).length === 0) {
      if (step === stepValidationSchemas.length - 1) {
        formik.handleSubmit();
      } else {
        setStep(step + 1);
      }
    } else {
      console.log("Validation Errors:", errors);

      const touchedFields = {};
      Object.keys(errors).forEach((section) => {
        touchedFields[section] = {};
        Object.keys(errors[section] || {}).forEach((field) => {
          touchedFields[section][field] = true;
        });
      });

      formik.setTouched(touchedFields);
    }
  };

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
    // navigate(`/edit-lead-details/${user.id}`, { state: user });
    // setLeadModal(false);
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
      className="create--lead--container overflow-auto hide--overflow fixed top-0 left-0 z-[999] w-full bg-black bg-opacity-60 h-full"
      onClick={handleOverlayClick}
    >
      <div
        className="min-h-[70vh]  w-full max-w-5xl border shadow bg-white mx-auto mt-[100px] mb-[100px] container--leadbox rounded-[10px] flex flex-col"
        ref={leadBoxRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-3 items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Create a Lead</h2>
          <div className="close--lead cursor-pointer" onClick={handleLeadModal}>
            <IoCloseCircle className="text-3xl" />
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {/* <div className="relative mb-6 max-w-[800px] mx-auto w-full">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-300 -translate-y-1/2 z-0"></div>
            <div
              className="absolute top-1/2 left-0 h-1 bg-blue-500 z-10 transition-all duration-300"
              style={{
                width: `${(step / (steps.length - 1)) * 100}%`,
                transform: "translateY(-50%)",
              }}
            ></div>

            <div className="relative flex justify-between z-20">
              {steps.map((s, index) => (
                <div
                  key={index}
                  className={`w-8 h-8 flex items-center justify-center rounded-full font-semibold border transition
                ${
                  step > s
                    ? "bg-black text-white border-black"
                    : step === s
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-700 border-gray-400"
                }
              `}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          </div> */}

          <form
            className="space-y-6 flex-1 flex flex-col justify-between"
            onSubmit={formik.handleSubmit}
          >
            <div className="p-6">
              {step === 0 && (
                <>
                  <h3 className="text-2xl font-semibold mb-2">
                    Personal Details
                  </h3>
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
                              {/* <img
                                src={user.profileImage}
                                alt={user.name}
                                className="w-8 h-8 rounded-full"
                              /> */}
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

                      <div className="custom--date dob-format">
                        <DatePicker
                          selected={
                            formik.values.personalDetails.dob
                              ? convertToISODate(
                                  formik.values.personalDetails.dob
                                )
                              : null
                          }
                          onChange={(date) => {
                            formik.setFieldValue("personalDetails.dob", date);
                          }}
                          showMonthDropdown
                          showYearDropdown
                          maxDate={new Date()}
                          dateFormat="dd MMM yyyy"
                          dropdownMode="select"
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
                      <label className="mb-2 block font-medium text-gray-700">
                        Gender
                      </label>
                      <div className="flex gap-4">
                        <label
                          className={`flex items-center gap-2 px-4 py-2 rounded-[10px] border cursor-pointer shadow-sm transition
                          ${
                            formik.values.personalDetails.gender === "Male"
                              ? "bg-black text-white border-black"
                              : "bg-white text-gray-700 border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="personalDetails.gender"
                            value="Male"
                            checked={
                              formik.values.personalDetails.gender === "Male"
                            }
                            onChange={formik.handleChange}
                            className="hidden"
                          />
                          <FaMale />
                          Male
                        </label>

                        <label
                          className={`flex items-center gap-2 px-4 py-2 rounded-[10px] border cursor-pointer shadow-sm transition
                          ${
                            formik.values.personalDetails.gender === "Female"
                              ? "bg-black text-white border-black"
                              : "bg-white text-gray-700 border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="personalDetails.gender"
                            value="Female"
                            checked={
                              formik.values.personalDetails.gender === "Female"
                            }
                            onChange={formik.handleChange}
                            className="hidden"
                          />
                          <FaFemale />
                          Female
                        </label>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <h3 className="text-2xl font-semibold mb-2">
                    Lead Information
                  </h3>
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

                    {formik.values.leadInformation.leadType === "phone" && (
                      <div>
                        <label className="mb-2 block">
                          Lead Sub-type<span className="text-red-500">*</span>
                        </label>
                        <Select
                        name="leadInformation.leadSubType"
                        value={leadSubTypes.find(
                          (opt) =>
                            opt.value === formik.values.leadInformation.leadSubType
                        )}
                        onChange={(option) =>
                          formik.setFieldValue(
                            "leadInformation.leadSubType",
                            option.value
                          )
                        }
                        options={leadSubTypes}
                        styles={customStyles}
                      />
                        {formik.errors.leadInformation?.leadSubType &&
                          formik.touched.leadInformation?.leadSubType && (
                            <div className="text-red-500 text-sm">
                              {formik.errors.leadInformation.leadSubType}
                            </div>
                          )}
                      </div>
                    )}

                    <div>
                      <label className="mb-2 block">
                        Lead Source<span className="text-red-500">*</span>
                      </label>
                      <Select
                        name="leadInformation.leadSource"
                        value={leadsSources.find(
                          (opt) =>
                            opt.value ===
                            formik.values.leadInformation.leadSource
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

                    {formik.values.leadInformation.leadSource === "social media" && (
                      <div>
                        <label className="mb-2 block">
                          Lead Sub-Source<span className="text-red-500">*</span>
                        </label>
                        <Select
                        name="leadInformation.leadSourceType"
                        value={leadSourceTypes.find(
                          (opt) =>
                            opt.value === formik.values.leadInformation.leadSourceType
                        )}
                        onChange={(option) =>
                          formik.setFieldValue(
                            "leadInformation.leadSourceType",
                            option.value
                          )
                        }
                        options={leadSourceTypes}
                        styles={customStyles}
                      />
                        {formik.errors.leadInformation?.leadSourceType &&
                          formik.touched.leadInformation?.leadSourceType && (
                            <div className="text-red-500 text-sm">
                              {formik.errors.leadInformation.leadSourceType}
                            </div>
                          )}
                      </div>
                    )}

                    {formik.values.leadInformation.leadSource === "events / campaigns" && (
                      <div>
                        <label className="mb-2 block">
                          Lead Sub-Source<span className="text-red-500">*</span>
                        </label>
                        <input
                        type="text"
                        name="leadInformation.leadSourceType"
                        value={formik.values.leadInformation.leadSourceType}
                        onChange={formik.handleChange}
                        className="custom--input w-full"
                      />
                        {formik.errors.leadInformation?.leadSourceType &&
                          formik.touched.leadInformation?.leadSourceType && (
                            <div className="text-red-500 text-sm">
                              {formik.errors.leadInformation.leadSourceType}
                            </div>
                          )}
                      </div>
                    )}

                    <div>
                      <label className="mb-2 block">Company</label>
                      <input
                        type="text"
                        name="leadInformation.companyName"
                        value={formik.values.leadInformation.companyName}
                        onChange={formik.handleChange}
                        className="custom--input w-full"
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
                </>
              )}

              {step === 2 && (
                <>
                  <h3 className="text-2xl font-semibold mb-2">Schedule</h3>
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
                    </div>

                    <div className="grid grid-cols-4 gap-4 mt-4">
                      <div>
                        <label className="mb-2 block">Date & Time</label>
                        <div className="custom--date flex-1">
                          <DatePicker
                            selected={selectedDateTime}
                            onChange={handleDateTrainerChange}
                            showTimeSelect
                            timeFormat="hh:mm aa" // ✅ 12-hour format
                            dateFormat="MMMM d, yyyy hh:mm aa"
                            placeholderText="Select date & time"
                            className="border px-3 py-2 w-full"
                            minDate={now} // disables all past days
                            minTime={minTime} // disables past times today
                            maxTime={maxTime}
                          />
                        </div>
                      </div>

                      {formik.values.schedule.date &&
                        formik.values.schedule.time && (
                          <div className="mb-4">
                            <label className="mb-2 block">Staff Name</label>
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
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <h3 className="text-2xl font-semibold mb-2">
                    Primary Contact
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="mb-2 block">Company name</label>
                      <input
                        name="professionalInfoPrimaryContact.companyName"
                        value={
                          formik.values.professionalInfoPrimaryContact
                            .companyName
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
                          formik.values.professionalInfoPrimaryContact
                            .designation
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
                </>
              )}
            </div>

            <div
              className={`flex gap-4 bg-gray-50 rounded mt-6 p-5 ${
                step > 0 ? "justify-between" : "justify-end"
              }`}
            >
              {step > 0 && (
                <button
                  type="button"
                  className="px-4 py-2 border rounded max-w-[150px] w-full"
                  onClick={() => setStep(step - 1)}
                >
                  Back
                </button>
              )}

              <button
                type="button"
                className="px-4 py-2 bg-black text-white rounded max-w-[150px] w-full"
                onClick={handleNextStep}
              >
                {step === stepValidationSchemas.length - 1
                  ? "Create Lead"
                  : "Next"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateLeadForm;
