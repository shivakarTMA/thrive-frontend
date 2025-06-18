import React, { useEffect, useState } from "react";
import { FaCamera } from "react-icons/fa";
import { FiEdit2, FiSave } from "react-icons/fi";
import Select from "react-select";
import { customStyles } from "../../Helper/helper";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parse, isValid, format } from "date-fns";
import { leadsSources, leadTypes } from "../../DummyData/DummyData";

const parseDOB = (dateStr) => {
  const parsed = parse(dateStr, "dd-MM-yyyy", new Date());
  return isValid(parsed) ? parsed : null;
};
const parseDateTime = (dateStr) => {
  const parsed = new Date(dateStr);
  return isValid(parsed) ? parsed : null;
};

const ProfileDetails = ({ member }) => {
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState(member);
  console.log(profile, "profile");

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfile((prev) => ({ ...prev, profileImage: imageUrl }));
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
        <div className="w-full lg:max-w-[200px]">
          <div className="w-full h-[255px] bg-primarycolor mb-2 rounded relative">
            <img
              src={profile.profileImage}
              alt="Profile"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute bottom-[-10px] right-[-10px]">
              <label className="cursor-pointer w-[45px] h-[45px] flex items-center justify-center bg-white rounded-full shadow">
                <FaCamera className="text-2xl" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

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
              <strong>Referred By</strong>
            </p>
            <p className="mb-2 text-sm">
              <strong>Referrer ID:</strong> 123456789
            </p>
            <p className="mb-2 text-sm">
              <strong>Referrer Name:</strong> Shivakar
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
                {editMode ? (
                  <input
                    type="text"
                    name="contact"
                    value={profile.contact || ""}
                    onChange={handleChange}
                    className="custom--input w-full"
                  />
                ) : (
                  <span>{profile.contact || "—"}</span>
                )}
              </div>

              <div className="flex flex-col text-sm">
                <label className="font-semibold mb-2 block capitalize">
                  email:
                </label>
                {editMode ? (
                  <input
                    type="text"
                    name="email"
                    value={profile.email || ""}
                    onChange={handleChange}
                    className="custom--input w-full"
                  />
                ) : (
                  <span>{profile.email || "—"}</span>
                )}
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
                  locality:
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

              <p className="flex flex-col">
                <label className="font-semibold mb-2 block">
                  Multi Club Access:
                </label>
                {editMode ? (
                  <Select
                    name="multiClubAccess"
                    value={SelectOptions.find(
                      (opt) =>
                        opt.value === profile?.leadInformation?.multiClubAccess
                    )}
                    onChange={(option) =>
                      handleNestedChange("multiClubAccess", option.value)
                    }
                    options={SelectOptions}
                    styles={customStyles}
                  />
                ) : (
                  <span>
                    {profile?.leadInformation?.multiClubAccess || "—"}
                  </span>
                )}
              </p>

              <p className="flex flex-col">
                <label className="font-semibold mb-2 block">
                  KYC Submitted:
                </label>
                {editMode ? (
                  <Select
                    name="kycSubmitted"
                    value={SelectOptions.find(
                      (opt) =>
                        opt.value === profile?.leadInformation?.kycSubmitted
                    )}
                    onChange={(option) =>
                      handleNestedChange("kycSubmitted", option.value)
                    }
                    options={SelectOptions}
                    styles={customStyles}
                  />
                ) : (
                  <span>{profile?.leadInformation?.kycSubmitted || "—"}</span>
                )}
              </p>

              {profile?.leadInformation?.kycSubmitted === "yes" && (
                <p className="flex flex-col col-span-2">
                  <label className="font-semibold mb-2 block">
                    KYC Documents:
                  </label>
                  {editMode ? (
                    <Select
                      isMulti
                      name="kycDocuments"
                      value={(profile?.leadInformation?.kycDocuments || []).map(
                        (val) =>
                          kycDocumentsOptions.find((opt) => opt.value === val)
                      )}
                      onChange={(selectedOptions) =>
                        handleNestedChange(
                          "kycDocuments",
                          selectedOptions.map((opt) => opt.value)
                        )
                      }
                      options={kycDocumentsOptions}
                      styles={customStyles}
                      isClearable={false}
                    />
                  ) : (
                    <span>
                      {(profile?.leadInformation?.kycDocuments || []).join(
                        ", "
                      ) || "—"}
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          <hr />

          {/* Emergency Contact */}
          <div>
            <h3 className="font-semibold mb-3">Emergency Contact</h3>
            <div className="grid--profile--details text-sm gap-4">
              {["emergencyContact", "emergencyNumber", "emergencyRelation"].map(
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
            <h3 className="font-semibold mb-3">Professional Information</h3>
            <div className="grid--profile--details text-sm gap-4">
              {["designation", "company", "officialEmail"].map((field) => (
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

          {/* Professional Info */}
          <div>
            <h3 className="font-semibold mb-3">Additional Information</h3>
            <div className="grid--profile--details text-sm gap-4">
              <p className="flex flex-col">
                <label className="font-semibold mb-2 block">
                  Consent Provided:
                </label>
                {editMode ? (
                  <Select
                    name="consentProvided"
                    value={SelectOptions.find(
                      (opt) =>
                        opt.value === profile?.leadInformation?.consentProvided
                    )}
                    onChange={(option) =>
                      handleNestedChange("consentProvided", option.value)
                    }
                    options={SelectOptions}
                    styles={customStyles}
                  />
                ) : (
                  <span>
                    {profile?.leadInformation?.consentProvided || "—"}
                  </span>
                )}
              </p>

              <p className="flex flex-col">
                <label className="font-semibold mb-2 block">
                  Consent Timestamp:
                </label>
               <span>
                    14-02-1988
                  </span>
              </p>
              <p className="flex flex-col">
                <label className="font-semibold mb-2 block">
                  Trainer Information:
                </label>
               <span>
                    Shivakar(GT)
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
