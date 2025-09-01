import React, { useEffect, useRef, useState } from "react";
import { FaCamera, FaRegImage } from "react-icons/fa";
import { FiEdit2, FiSave } from "react-icons/fi";
import Select from "react-select";
import { customStyles } from "../../Helper/helper";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parse, isValid, format } from "date-fns";
import { leadsSources, leadTypes } from "../../DummyData/DummyData";
import Webcam from "react-webcam";
import { IoCheckmark, IoClose } from "react-icons/io5";

const parseDOB = (dateStr) => {
  const parsed = parse(dateStr, "dd-MM-yyyy", new Date());
  return isValid(parsed) ? parsed : null;
};
const parseDateTime = (dateStr) => {
  const parsed = new Date(dateStr);
  return isValid(parsed) ? parsed : null;
};

const fields = [
  { label: "Personal Information", value: true },
  { label: "Consent to terms", value: true },
  { label: "Emergency Contact", value: false },
  { label: "KYC Submission", value: false },
  { label: "Parq Information", value: false },
];

// Count completed fields
const completedCount = fields.filter((f) => f.value).length;

// Calculate percentage (each field = 20%)
const completionPercentage = (completedCount / fields.length) * 100;

const ProfileDetails = ({ member }) => {
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState(member);
  const [showModal, setShowModal] = useState(false);
  const webcamRef = useRef(null);

  const SelectOptions = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ];

  const kycDocumentsOptions = [
    { value: "Aadhar Card", label: "Aadhar Card" },
    { value: "PAN Card", label: "PAN Card" },
    { value: "Passport", label: "Passport" },
    { value: "Voter ID", label: "Voter ID" },
  ];

  useEffect(() => {
    setProfile(member);
  }, [member]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      leadInformation: {
        ...prev.leadInformation,
        [field]: value,
      },
    }));
  };

  // Capture from webcam
  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setProfile((prev) => ({ ...prev, profileImage: imageSrc }));
    setShowModal(false);
  };

  // Handle file upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfile((prev) => ({ ...prev, profileImage: imageUrl }));
      setShowModal(false);
    }
  };

  const handleSave = () => {
    // Optional: Trigger backend save here
    console.log("Saved profile:", profile);
    setEditMode(false);
  };

  return (
    <div className="bg-primarylight p-4 rounded">
      <div className="flex gap-6">
        {/* Left section - Image & Basic Info */}
        <div className="w-full lg:max-w-[220px]">
          <div className="w-full h-[255px] bg-primarycolor mb-2 rounded relative">
            <img
              src={profile.profileImage}
              alt="Profile"
              className="w-full h-full object-cover object-center"
            />
            {/* Camera button */}
            <div className="absolute bottom-[-10px] right-[-10px]">
              <label className="cursor-pointer w-[45px] h-[45px] flex items-center justify-center bg-white rounded-full shadow">
                <FaCamera
                  className="text-2xl"
                  onClick={() => setShowModal(true)}
                />
                {/* <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                /> */}
              </label>
            </div>
          </div>
          <div className="progress-container">
            <div
              className="progress-bar"
              style={{ width: `${completionPercentage}%` }}
            >
              <span className="progress-text text-sm">
                {Math.round(completionPercentage)}%
              </span>
            </div>
          </div>

          {/* Webcam Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
                {/* Webcam Preview */}
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="rounded-lg"
                  videoConstraints={{
                    facingMode: "user", // use front camera
                  }}
                />

                {/* Action buttons */}
                <div className="flex gap-3 mt-4 items-center justify-between w-full">
                  <div className="flex gap-3 items-center">
                    <button
                      onClick={capturePhoto}
                      className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
                    >
                      <FaCamera /> Take Photo
                    </button>

                    <label className="px-4 py-2 bg-black text-white rounded flex items-center gap-2">
                      <FaRegImage /> Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
                  >
                    <IoClose /> Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="text-xs text-left mt-3">
            <p className="mb-2 text-sm">
              <strong>Membership IDs:</strong> 1234566
            </p>
            <p className="mb-2 text-sm">
              <strong>Centre ID:</strong> 098567
            </p>
            <p className="mb-2 text-sm">
              <strong>Centre Name:</strong> Gurugram
            </p>
          </div>

          <div className="text-xs text-left mt-3 border rounded p-3 bg-primarycolor text-white">
            <p className="mb-2 text-sm">
              <strong>Referred By: Puneet Kumar</strong>
            </p>
            <p className="mb-2 text-sm">
              <strong>Referrer ID:</strong> 123456789
            </p>
          </div>
        </div>

        {/* Right section - All Details */}
        <div className="flex-1 space-y-4">
          {/* Personal Details */}
          <div className="relative">
            <h3 className="font-semibold mb-3">Personal Details</h3>
            <div className="grid--profile--details text-sm gap-4">
              <div className="flex flex-col text-sm">
                <label className="font-semibold mb-2 block capitalize">
                  name:
                </label>
                {editMode ? (
                  <input
                    type="text"
                    name="name"
                    value={profile.name || ""}
                    onChange={handleChange}
                    className="custom--input w-full"
                  />
                ) : (
                  <span>{profile.name || "—"}</span>
                )}
              </div>

              <div className="flex flex-col text-sm">
                <label className="font-semibold mb-2 block capitalize">
                  contact:
                </label>
                <span>{profile.contact || "—"}</span>
              </div>

              <div className="flex flex-col text-sm">
                <label className="font-semibold mb-2 block capitalize">
                  email:
                </label>
                <span>{profile.email || "—"}</span>
              </div>

              <div className="flex flex-col text-sm">
                <label className="font-semibold mb-2 block capitalize">
                  dob:
                </label>
                {editMode ? (
                  <div className="custom--date dob-format">
                    <DatePicker
                      selected={parseDOB(profile.dob)}
                      onChange={(date) =>
                        handleChange({
                          target: {
                            name: "dob",
                            value: date ? format(date, "dd-MM-yyyy") : "",
                          },
                        })
                      }
                      showMonthDropdown
                      showYearDropdown
                      maxDate={new Date()}
                      dateFormat="dd MMM yyyy"
                      dropdownMode="select"
                      placeholderText="Select date"
                      className="custom--input w-full"
                    />
                  </div>
                ) : (
                  <span>{profile.dob || "—"}</span>
                )}
              </div>

              <div className="flex flex-col text-sm">
                <label className="font-semibold mb-2 block capitalize">
                  gender:
                </label>
                {editMode ? (
                  <input
                    type="text"
                    name="gender"
                    value={profile.gender || ""}
                    onChange={handleChange}
                    className="custom--input w-full"
                  />
                ) : (
                  <span>{profile.gender || "—"}</span>
                )}
              </div>

              <div className="flex flex-col text-sm">
                <label className="font-semibold mb-2 block capitalize">
                  age:
                </label>
                {editMode ? (
                  <input
                    type="text"
                    name="age"
                    value={profile.age || ""}
                    onChange={handleChange}
                    className="custom--input w-full"
                  />
                ) : (
                  <span>{profile.age || "—"}</span>
                )}
              </div>

              <div className="flex flex-col text-sm">
                <label className="font-semibold mb-2 block capitalize">
                  address:
                </label>
                {editMode ? (
                  <input
                    type="text"
                    name="address"
                    value={profile.address || ""}
                    onChange={handleChange}
                    className="custom--input w-full"
                  />
                ) : (
                  <span>{profile.address || "—"}</span>
                )}
              </div>

              <div className="flex flex-col text-sm">
                <label className="font-semibold mb-2 block capitalize">
                  Location:
                </label>
                {editMode ? (
                  <input
                    type="text"
                    name="locality"
                    value={profile.locality || ""}
                    onChange={handleChange}
                    className="custom--input w-full"
                  />
                ) : (
                  <span>{profile.locality || "—"}</span>
                )}
              </div>
            </div>
            <button
              className="absolute top-0 right-0 text-primarycolor border border-primarycolor bg-white px-2 py-1 rounded-lg flex items-center gap-2"
              onClick={() => (editMode ? handleSave() : setEditMode(true))}
            >
              {editMode ? "Save" : "Edit"} {editMode ? <FiSave /> : <FiEdit2 />}
            </button>
          </div>

          <hr />

          {/* Lead Information */}
          <div>
            <h3 className="font-semibold mb-3">Lead Information</h3>
            <div className="grid--profile--details text-sm gap-4">
              <p className="flex flex-col">
                <label className="font-semibold mb-2 block">Lead Owner:</label>
                <span>{profile.staff || "—"}</span>
              </p>

              <p className="flex flex-col">
                <label className="font-semibold mb-2 block">Lead Type:</label>
                {editMode ? (
                  <Select
                    name="leadType"
                    value={leadTypes.find(
                      (opt) => opt.value === profile?.leadInformation?.leadType
                    )}
                    onChange={(option) =>
                      handleNestedChange("leadType", option.value)
                    }
                    options={leadTypes}
                    styles={customStyles}
                  />
                ) : (
                  <span>{profile?.leadInformation?.leadType || "—"}</span>
                )}
              </p>

              <p className="flex flex-col">
                <label className="font-semibold mb-2 block">Lead Source:</label>

                {editMode ? (
                  <Select
                    name="leadSource"
                    value={leadsSources.find(
                      (opt) =>
                        opt.value === profile?.leadInformation?.leadSource
                    )}
                    onChange={(option) =>
                      handleNestedChange("leadSource", option.value)
                    }
                    options={leadsSources}
                    styles={customStyles}
                  />
                ) : (
                  <span>{profile?.leadInformation?.leadSource || "—"}</span>
                )}
              </p>
            </div>
          </div>

          <hr />
          {/* Professional Info */}
          <div>
            <h3 className="font-semibold mb-3">Professional Information</h3>
            <div className="grid--profile--details text-sm gap-4">
              {["company", "designation", "officialEmail"].map((field) => (
                <p className="flex flex-col" key={field}>
                  <label className="font-semibold mb-2 block capitalize">
                    {field}:
                  </label>
                  {editMode ? (
                    <input
                      name={field}
                      value={profile[field] || ""}
                      onChange={handleChange}
                      className="custom--input w-full"
                    />
                  ) : (
                    <span>{profile[field] || "—"}</span>
                  )}
                </p>
              ))}
            </div>
          </div>

          <hr />

          {/* Emergency Contact */}
          <div>
            <h3 className="font-semibold mb-3">Emergency Contact</h3>
            <div className="grid--profile--details text-sm gap-4">
              {["emergencyName", "emergencyContact", "emergencyRelation"].map(
                (field) => (
                  <p className="flex flex-col" key={field}>
                    <label className="font-semibold mb-2 block capitalize">
                      {field.replace("emergency", "")}:
                    </label>
                    {editMode ? (
                      <input
                        name={field}
                        value={profile[field] || ""}
                        onChange={handleChange}
                        className="custom--input w-full"
                      />
                    ) : (
                      <span>{profile[field] || "—"}</span>
                    )}
                  </p>
                )
              )}
            </div>
          </div>
          <hr />

          {/* Professional Info */}
          <div>
            <h3 className="font-semibold mb-3">Profile Completion</h3>
            <div className="grid--profile--details text-sm gap-4">
              <p className="flex flex-col">
                <label className="font-semibold mb-2 block">
                  Personal Information:
                </label>
                <span className="bg-green-500 text-white w-auto flex items-center justify-center max-w-fit px-3 py-1 rounded">
                  <IoCheckmark /> Yes
                </span>
              </p>

              <p className="flex flex-col">
                <label className="font-semibold mb-2 block">
                  Consent to terms:
                </label>
                <span className="bg-red-500 text-white w-auto flex items-center justify-center max-w-fit px-3 py-1 rounded">
                  <IoClose /> No
                </span>
              </p>
              <p className="flex flex-col">
                <label className="font-semibold mb-2 block">
                  Emergency Contact:
                </label>
                <span className="bg-red-500 text-white w-auto flex items-center justify-center max-w-fit px-3 py-1 rounded">
                  <IoClose /> No
                </span>
              </p>
              <p className="flex flex-col">
                <label className="font-semibold mb-2 block">
                  KYC Submission:
                </label>
                <span className="bg-red-500 text-white w-auto flex items-center justify-center max-w-fit px-3 py-1 rounded">
                  <IoClose /> No
                </span>
              </p>
              <p className="flex flex-col">
                <label className="font-semibold mb-2 block">
                  Parq Information:
                </label>
                <span className="bg-red-500 text-white w-auto flex items-center justify-center max-w-fit px-3 py-1 rounded">
                  <IoClose /> No
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails;
