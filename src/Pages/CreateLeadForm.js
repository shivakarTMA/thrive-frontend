import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-phone-number-input/style.css";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import {
  FaMale,
  FaFemale,
  FaUser,
  FaEnvelope,
  FaBuilding,
  FaBirthdayCake,
} from "react-icons/fa";
import {
  servicesName,
  leadsSources,
  leadTypes,
  trainerAvailability,
  mockData,
  // leadSubTypes,
} from "../DummyData/DummyData";

import { convertToISODate, customStyles, selectIcon } from "../Helper/helper";
import { IoCloseCircle } from "react-icons/io5";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import ConfirmUnderAge from "../components/modal/ConfirmUnderAge";
import { FaCalendarDays, FaListCheck, FaLocationDot } from "react-icons/fa6";

const assignTrainers = [
  { value: "shivakar", label: "Shivakar" },
  { value: "nitin", label: "Nitin" },
  { value: "esha", label: "Esha" },
  { value: "apporva", label: "Apporva" },
];

const leadSourceTypes = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "others", label: "Others" },
];

const validationSchema = Yup.object({
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
  leadInformation: Yup.object({
    leadSource: Yup.string().required("Lead Source is required"),
    leadType: Yup.string().required("Lead Type is required"),
    leadSourceType: Yup.string().when("leadSource", {
      is: (val) => ["social media", "events / campaigns"].includes(val),
      then: () => Yup.string().required("This is required"),
    }),
    otherSource: Yup.string().when("leadSourceType", {
      is: "others",
      then: () => Yup.string().required("This is required"),
    }),
  }),
});

const CreateLeadForm = ({ setLeadModal, selectedLead }) => {
  const leadBoxRef = useRef(null);
  const [matchingUsers, setMatchingUsers] = useState([]);
  const now = new Date();
  const [showUnderageModal, setShowUnderageModal] = useState(false);
  const [pendingDob, setPendingDob] = useState(null);
  const [duplicateError, setDuplicateError] = useState("");
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [hasDismissedDuplicateModal, setHasDismissedDuplicateModal] =
      useState(false);

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
      serviceName: "",
      leadSource: "",
      leadSourceType: "",
      otherSource: "",
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
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      
     if (duplicateError) {
        // console.warn("Duplicate number detected:", duplicateError);
        setShowDuplicateModal(true);
        return;
      }

      toast.success("Lead created successfully!");
      setLeadModal(false);
      console.log("Submitting full form", values);
    },
  });

  useEffect(() => {
    if (selectedLead) {
      // Map flat row data to nested formik structure if needed
      formik.setValues({
        personalDetails: {
          name: selectedLead.name || "",
          contactNumber: selectedLead.contact || "",
          email: selectedLead.email || "",
          gender: selectedLead.gender || "",
          dob: selectedLead.dob || "",
          address: selectedLead.address || "",
        },
        leadInformation: {
          serviceName: selectedLead.serviceName?.toLowerCase() || "",
          leadSource: selectedLead.leadSource || "",
          leadSourceType: selectedLead.leadSourceType || "",
          otherSource: selectedLead.otherSource || "",
          leadType: selectedLead.leadType || "",
          leadSubType: selectedLead.leadSubType || "",
          companyName: selectedLead.companyName || "",
          officialEmail: selectedLead.officialEmail || "",
        },
        schedule: {
          type: selectedLead.scheduleType || "",
          date: selectedLead.scheduleDate || null,
          time: selectedLead.scheduleTime || null,
          trainer: selectedLead.trainer || "",
        },
      });
    }
  }, [selectedLead]);

  const handleDobChange = (date) => {
    if (!date) return;

    const today = new Date();
    const birthDate = new Date(date);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    if (age < 18) {
      setPendingDob(date);
      setShowUnderageModal(true);
    } else {
      formik.setFieldValue("personalDetails.dob", date);
    }
  };

  const confirmDob = () => {
    formik.setFieldValue("personalDetails.dob", pendingDob);
    setShowUnderageModal(false);
    setPendingDob(null);
  };

  const cancelDob = () => {
    formik.setFieldValue("personalDetails.dob", "");
    setShowUnderageModal(false);
    setPendingDob(null);
  };

  const selectedDateTime = (() => {
    const { date, time } = formik.values.schedule;
    if (date && time) {
      const [year, month, day] = date.split("-").map(Number);
      const [hours, minutes] = time.split(":").map(Number);
      const fullDate = new Date(year, month - 1, day, hours, minutes);
      return isNaN(fullDate.getTime()) ? null : fullDate;
    }
    return null;
  })();

  const handleDateTrainerChange = (val) => {
    if (!val) return;

    const year = val.getFullYear();
    const month = (val.getMonth() + 1).toString().padStart(2, "0");
    const day = val.getDate().toString().padStart(2, "0");
    const dateOnly = `${year}-${month}-${day}`; // ✅ Local date

    const hours = val.getHours().toString().padStart(2, "0");
    const minutes = val.getMinutes().toString().padStart(2, "0");
    const timeOnly = `${hours}:${minutes}`;

    formik.setFieldValue("schedule.date", dateOnly);
    formik.setFieldValue("schedule.time", timeOnly);
  };

  const isTodaySelected =
    selectedDateTime?.toDateString() === now.toDateString();

  const minTime = new Date(selectedDateTime);
  if (isTodaySelected) {
    minTime.setHours(now.getHours(), now.getMinutes(), 0, 0);
  } else {
    minTime.setHours(0, 0, 0, 0);
  }

  const maxTime = new Date(selectedDateTime);
  maxTime.setHours(23, 59, 59, 999);

  const handlePhoneChange = (value) => {
    formik.setFieldValue("personalDetails.contactNumber", value);
     setHasDismissedDuplicateModal(false);
  };

  const handlePhoneBlur = () => {
    const inputValue = formik.values.personalDetails.contactNumber?.replace(
      /\s/g,
      ""
    );

    if (inputValue && inputValue.length >= 5) {
      const matches = mockData.filter((user) => {
        const userContact = user.contact?.replace(/\s/g, "");
        return userContact === inputValue; // 👈 exact match only
      });
      setMatchingUsers(matches);
      if (matches.length > 0) {
        setDuplicateError(
          "This phone number already exists"
        );
         if (!hasDismissedDuplicateModal) {
          setShowDuplicateModal(true);
        }
      }
    } else {
      setMatchingUsers([]);
    }
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value); // Directly set the field value in Formik
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

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setLeadModal(false);
    }
  };

  const handleLeadModal = () => {
    setLeadModal(false);
  };

  useEffect(() => {
    console.log("Selected lead:", selectedLead);
  }, [selectedLead]);

  return (
    <>
      <div
        className="bg--blur create--lead--container overflow-auto hide--overflow fixed top-0 left-0 z-[999] w-full bg-black bg-opacity-60 h-full"
        onClick={handleOverlayClick}
      >
        <div
          className="min-h-[70vh]  w-[95%] max-w-5xl mx-auto mt-[100px] mb-[100px] container--leadbox rounded-[10px] flex flex-col"
          ref={leadBoxRef}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-t-[10px] flex gap-3 items-center justify-between py-4 px-4 border-b">
            <h2 className="text-xl font-semibold">
              {selectedLead ? "Edit Lead" : "Create a Lead"}
            </h2>
            <div
              className="close--lead cursor-pointer"
              onClick={handleLeadModal}
            >
              <IoCloseCircle className="text-3xl" />
            </div>
          </div>

          <div className="flex-1s flexs ">
            <form onSubmit={formik.handleSubmit}
            >
              <div className="flex bg-white rounded-b-[10px]">
                <div className="p-6 flex-1">
                  <h3 className="text-2xl font-semibold mb-2">
                    Personal Details
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="relative">
                      <label className="mb-2 block">
                        Contact Number
                        <span className="text-red-500">*</span>
                      </label>
                      <PhoneInput
                        name="personalDetails.contactNumber"
                        value={formik.values.personalDetails.contactNumber}
                        onChange={handlePhoneChange}
                        onBlur={handlePhoneBlur}
                        international
                        defaultCountry="IN"
                        countryCallingCodeEditable={false}
                        className="custom--input w-full custom--phone"
                      />

                      {matchingUsers.length > 0 && (
                        <div className="border mt-2 bg-white shadow rounded p-2 max-h-40 overflow-y-auto z-10 absolute w-full">
                          {matchingUsers.map((user) => (
                            <div
                              key={user.id}
                              className="p-2 flex items-center gap-2"
                            >
                              <div>
                                <div className="font-medium">{user.name}</div>
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
                      <div className="relative">
                        <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                          <FaUser />
                        </span>
                        <input
                          name="personalDetails.name"
                          value={formik.values.personalDetails.name}
                          onChange={formik.handleChange}
                          className="custom--input w-full input--icon"
                        />
                      </div>
                      {formik.errors.personalDetails?.name &&
                        formik.touched.personalDetails?.name && (
                          <div className="text-red-500 text-sm">
                            {formik.errors.personalDetails.name}
                          </div>
                        )}
                    </div>

                    <div>
                      <label className="mb-2 block">Email</label>
                      <div className="relative">
                        <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                          <FaEnvelope />
                        </span>
                        <input
                          type="email"
                          name="personalDetails.email"
                          value={formik.values.personalDetails.email}
                          onChange={formik.handleChange}
                          className="custom--input w-full input--icon"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block">DOB</label>

                      <div className="custom--date dob-format relative">
                        <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                          <FaBirthdayCake />
                        </span>
                        <DatePicker
                          selected={
                            formik.values.personalDetails.dob
                              ? convertToISODate(
                                  formik.values.personalDetails.dob
                                )
                              : null
                          }
                          onChange={handleDobChange}
                          showMonthDropdown
                          showYearDropdown
                          maxDate={new Date()}
                          dateFormat="dd MMM yyyy"
                          dropdownMode="select"
                          placeholderText="Select date"
                          className=" input--icon"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block font-medium text-gray-700">
                        Gender
                      </label>
                      <div className="flex gap-4">
                        <label
                          className={`flex items-center gap-2 px-4 py-2 rounded-[10px] border cursor-pointer shadow-sm transition
                          ${
                            formik.values.personalDetails.gender === "male"
                              ? "bg-black text-white border-black"
                              : "bg-white text-gray-700 border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="personalDetails.gender"
                            value="male"
                            checked={
                              formik.values.personalDetails.gender === "male"
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
                            formik.values.personalDetails.gender === "female"
                              ? "bg-black text-white border-black"
                              : "bg-white text-gray-700 border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="personalDetails.gender"
                            value="female"
                            checked={
                              formik.values.personalDetails.gender === "female"
                            }
                            onChange={formik.handleChange}
                            className="hidden"
                          />
                          <FaFemale />
                          Female
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block">Company</label>
                      <div className="relative">
                        <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                          <FaBuilding />
                        </span>

                        <input
                          type="text"
                          name="leadInformation.companyName"
                          value={formik.values.leadInformation.companyName}
                          onChange={formik.handleChange}
                          className="custom--input w-full input--icon"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block">Official Email Id</label>
                      <div className="relative">
                        <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                          <FaEnvelope />
                        </span>
                        <input
                          type="email"
                          name="leadInformation.officialEmail"
                          value={formik.values.leadInformation.officialEmail}
                          onChange={formik.handleChange}
                          className="custom--input w-full input--icon"
                        />
                      </div>
                    </div>

                    <div className="col-span-2">
                      <label className="mb-2 block">Address</label>
                      <div className="relative">
                        <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                          <FaLocationDot />
                        </span>
                        <input
                          name="personalDetails.address"
                          value={formik.values.personalDetails.address}
                          onChange={formik.handleChange}
                          className="custom--input w-full input--icon"
                        />
                      </div>
                    </div>
                  </div>

                  <hr className="my-3 mt-5" />

                  <h3 className="text-2xl font-semibold mb-2">
                    Lead Information
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="mb-2 block">Service Name</label>
                      <div className="relative">
                        <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                          <FaListCheck />
                        </span>
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
                          styles={selectIcon}
                          className="pl-[]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block">
                        Lead Type<span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                          <FaListCheck />
                        </span>
                        <Select
                          name="leadInformation.leadType"
                          value={leadTypes.find(
                            (opt) =>
                              opt.value ===
                              formik.values.leadInformation.leadType
                          )}
                          onChange={(option) =>
                            formik.setFieldValue(
                              "leadInformation.leadType",
                              option.value
                            )
                          }
                          options={leadTypes}
                          styles={selectIcon}
                        />
                      </div>
                      {formik.errors.leadInformation?.leadType &&
                        formik.touched.leadInformation?.leadType && (
                          <div className="text-red-500 text-sm">
                            {formik.errors.leadInformation.leadType}
                          </div>
                        )}
                    </div>

                    <div>
                      <label className="mb-2 block">
                        Lead Source<span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                          <FaListCheck />
                        </span>
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
                          styles={selectIcon}
                        />
                      </div>
                      {formik.errors.leadInformation?.leadSource &&
                        formik.touched.leadInformation?.leadSource && (
                          <div className="text-red-500 text-sm">
                            {formik.errors.leadInformation.leadSource}
                          </div>
                        )}
                    </div>

                    {formik.values.leadInformation.leadSource ===
                      "social media" && (
                      <div>
                        <label className="mb-2 block">
                          Lead Sub-Source
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                            <FaListCheck />
                          </span>
                          <Select
                            name="leadInformation.leadSourceType"
                            value={leadSourceTypes.find(
                              (opt) =>
                                opt.value ===
                                formik.values.leadInformation.leadSourceType
                            )}
                            onChange={(option) =>
                              formik.setFieldValue(
                                "leadInformation.leadSourceType",
                                option.value
                              )
                            }
                            options={leadSourceTypes}
                            styles={selectIcon}
                          />
                        </div>
                        {formik.errors.leadInformation?.leadSourceType &&
                          formik.touched.leadInformation?.leadSourceType && (
                            <div className="text-red-500 text-sm">
                              {formik.errors.leadInformation.leadSourceType}
                            </div>
                          )}
                      </div>
                    )}

                    {formik.values.leadInformation.leadSource ===
                      "events / campaigns" && (
                      <div>
                        <label className="mb-2 block">
                          Lead Sub-Source
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                            <FaListCheck />
                          </span>
                          <input
                            type="text"
                            name="leadInformation.leadSourceType"
                            value={formik.values.leadInformation.leadSourceType}
                            onChange={formik.handleChange}
                            className="custom--input w-full input--icon "
                          />
                        </div>
                        {formik.errors.leadInformation?.leadSourceType &&
                          formik.touched.leadInformation?.leadSourceType && (
                            <div className="text-red-500 text-sm">
                              {formik.errors.leadInformation.leadSourceType}
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                  {!selectedLead && (
                    <>
                      <hr className="my-3 mt-5" />

                      <h3 className="text-2xl font-semibold mb-2">Schedule</h3>
                      <div>
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div>
                            <label className="mb-2 block">Schedule</label>
                            <div className="flex gap-4">
                              <label className="custom--radio">
                                Tour
                                <input
                                  type="radio"
                                  name="schedule.type"
                                  value="tour"
                                  checked={
                                    formik.values.schedule.type === "tour"
                                  }
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
                                  checked={
                                    formik.values.schedule.type === "trial"
                                  }
                                  onChange={handleInput}
                                  className="w-4 h-4 custom--radio mr-1"
                                />
                                <span className="radio-checkmark"></span>
                              </label>
                            </div>
                          </div>
                          <div>
                            <label className="mb-2 block">Date & Time</label>
                            <div className="custom--date flex-1">
                              <span className="absolute z-[1] mt-[15px] ml-[15px]">
                                <FaCalendarDays />
                              </span>
                              <DatePicker
                                selected={selectedDateTime}
                                onChange={handleDateTrainerChange}
                                showTimeSelect
                                timeFormat="hh:mm aa" // ✅ 12-hour format
                                dateFormat="MMMM d, yyyy hh:mm aa"
                                placeholderText="Select date & time"
                                className="border px-3 py-2 w-full input--icon"
                                minDate={now} // disables all past days
                                minTime={minTime} // disables past times today
                                maxTime={maxTime}
                                disabled={!formik.values.schedule.type}
                              />
                            </div>
                          </div>

                          <div className="mb-4">
                            <label className="mb-2 block">Staff Name</label>
                            <div className="relative">
                              <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                                <FaListCheck />
                              </span>
                              <Select
                                name="schedule.trainer"
                                value={assignTrainers.find(
                                  (opt) =>
                                    opt.value === formik.values.schedule.trainer
                                )}
                                onChange={(option) =>
                                  handleSelectSchedule(
                                    "schedule.trainer",
                                    option
                                  )
                                }
                                options={getAvailableTrainers()}
                                placeholder="Select available trainer"
                                styles={selectIcon}
                                isDisabled={!formik.values.schedule.type}
                                // isDisabled={!getAvailableTrainers().length}
                              />
                            </div>
                            {!formik.values.schedule.type ? null : (
                              <>
                                {!getAvailableTrainers().length && (
                                  <p className="text-sm text-red-500 mt-1">
                                    No trainers available at this date and time.
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className={`flex gap-4 py-5 justify-end`}>
                <button
                  type="button"
                  onClick={handleLeadModal}
                  className="px-4 py-2 bg-transparent border border-white text-white font-semibold rounded max-w-[150px] w-full"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-black font-semibold rounded max-w-[150px] w-full"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showUnderageModal && (
        <ConfirmUnderAge
          title="Underage Confirmation"
          message="Lead's age is less than 18. Do you still wish to continue?"
          onConfirm={confirmDob}
          onCancel={cancelDob}
        />
      )}
      {duplicateError && showDuplicateModal && (
        <div className="fixed h-full inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full text-center">
            <h2 className="text-lg font-semibold text-red-600 mb-4">
              Duplicate Entry
            </h2>
            <p className="text-sm text-gray-700 mb-6">{duplicateError}</p>
            <button
              onClick={() => {
                setShowDuplicateModal(false);
                setHasDismissedDuplicateModal(true);
              }}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateLeadForm;
