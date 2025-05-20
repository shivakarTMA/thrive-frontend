import React, { useEffect, useState } from "react";
import { FaCamera } from "react-icons/fa";
import { FiEdit2, FiSave } from "react-icons/fi";
import { companies } from "../../DummyData/DummyData";
import { customStyles } from "../../Helper/helper";
import Select from "react-select";

const ProfileDetails = ({ member }) => {
  console.log(member, "member");
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState(member);
  const [activeTab, setActiveTab] = useState("personal");

  const medicalConditions = [
    "Asthma/COPD",
    "Digestive Disorder",
    "Heart Disease/Condition",
    "Hip Replacement",
    "Metabolic Disorders (thyroid,kidney,etc)",
    "Parkinson's Disease",
    "Stroke",
    "Back Pain",
    "Dizziness/Vertigo",
    "Hernia/Diastasis Recti",
    "Injury Recent",
    "Multiple Sclerosis",
    "Pregnancy",
    "Surgery",
    "Bone Fracture",
    "Epilepsy",
    "High Blood Pressure",
    "Joint Pain",
    "Neck Pain/Disorder",
    "Scoliosis",
    "Carpal Tunnel",
    "Foot Pain",
    "High Cholestrol",
    "Knee Replacement",
    "Osteopenia/Osteoporosis",
    "Shoulder Pain/Condition",
    "Diabetes",
    "Glaucoma",
    "Hip Pain",
    "Leg Pain",
    "Pacemaker",
    "Smoking",
  ];

  useEffect(() => {
    setProfile(member);
  }, [member]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfile((prev) => ({ ...prev, profileImage: imageUrl }));
    }
  };

  console.log(profile, "profile");

  return (
    <>
      <div className="flex gap-2 mb-3">
        {[
          { label: "Personal Information", value: "personal" },
          { label: "Professional Information", value: "professional" },
          { label: "Fitness Information", value: "fitness" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-1.5 rounded ${
              activeTab === tab.value
                ? "bg-primarycolor text-white"
                : "bg-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-primarylight p-4 rounded">
        {activeTab === "personal" && (
          <div className="flex gap-6">
            <div className="w-full lg:max-w-[200px]">
              <div className="w-full h-[255px] bg-primarycolor mb-2 rounded relative">
                <img
                  src={profile.profileImage}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover object-center"
                />

                <div className="absolute bottom-[-10px] right-[-10px]">
                  <label className="cursor-pointer  w-[45px] h-[45px] flex items-center justify-center bg-white text-sm px-2 py-1 rounded-full shadow">
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

              <div className="w-full bg-white">
                <div className="w-[45%] bg-primarycolor text-xs font-medium text-blue-100 text-center p-1 leading-none">
                  45%
                </div>
              </div>

              <h2 className="font-bold mt-2">{member.name.toUpperCase()}</h2>
              <div className="text-xs text-left mt-2">
                <p className="mb-1 text-sm">Membership no: 1234566</p>
                <p className="mb-1 text-sm">Attendance ID: 098567</p>
                <p className="mb-1 text-sm">Club ID: 746434</p>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div className="relative">
                <h3 className="font-semibold mb-3">Personal Details</h3>
                <div className="flex text-sm gap-4 grid--profile--details">
                  {[
                    ["Email", "email"],
                    ["DOB", "dob"],
                    ["Gender", "gender"],
                    ["Age", "age"],
                    ["Address", "address"],
                    ["Locality", "locality"],
                    ["Contact", "contact"],
                  ].map(([label, key]) => (
                    <div className="flex flex-col text-sm" key={key}>
                      <label className="font-semibold mb-2 block">
                        {label}:
                      </label>
                      {editMode ? (
                        <input
                          type="text"
                          name={key}
                          value={profile[key] || ""}
                          onChange={handleChange}
                          className="custom--input w-full"
                        />
                      ) : (
                        <span>{profile[key] || "—"}</span>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  className="absolute top-0 right-0 text-primarycolor border border-primarycolor bg-white px-2 py-1 rounded-lg flex items-center gap-2 justify-center"
                  onClick={() => setEditMode((prev) => !prev)}
                >
                  {editMode ? "Save" : "Edit"}{" "}
                  {editMode ? <FiSave /> : <FiEdit2 />}
                </button>
              </div>
              <hr />
              <div className="">
                <h3 className="font-semibold mb-3">Lead Information</h3>
                <div className="grid--profile--details text-sm gap-4">
                  {[
                    ["Lead Source", "leadSource"],
                    ["Company", "company"],
                  ].map(([label, key]) => (
                    <p className="flex flex-col" key={key}>
                      <label className="font-semibold mb-2 block">
                        {label}:
                      </label>
                      {editMode ? (
                        <input
                          name={key}
                          value={profile[key]}
                          onChange={handleChange}
                          className="custom--input w-full"
                        />
                      ) : (
                        <span>{profile[key] || "—"}</span>
                      )}
                    </p>
                  ))}
                </div>
              </div>
              <hr />
              <div className="">
                <h3 className="font-semibold mb-3">Emergency Contact</h3>
                <div className="grid--profile--details gap-4 text-sm">
                  {[
                    ["Name", "emergencyName"],
                    ["Contact", "emergencyContact"],
                    ["Relationship", "emergencyRelation"],
                  ].map(([label, key]) => (
                    <p className="flex flex-col" key={key}>
                      <label className="font-semibold mb-2 block">
                        {label}:
                      </label>
                      {editMode ? (
                        <input
                          name={key}
                          value={profile[key]}
                          onChange={handleChange}
                          className="custom--input w-full"
                        />
                      ) : (
                        <span>{profile[key] || "—"}</span>
                      )}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === "professional" && (
          <div className="flex gap-6">
            <div className="flex-1 space-y-4">
              <div className="relative">
                <h3 className="font-semibold mb-3">
                  Professional Information Primary Contact
                </h3>
                <div className="flex text-sm gap-4">
                  {[
                    ["Company Name", "companyname"],
                    ["Occupation", "occupation"],
                    ["Official Email", "officialemail"],
                  ].map(([label, key]) => (
                    <div className="flex flex-col text-sm w-full" key={key}>
                      <label className="font-semibold mb-2 block">
                        {label}:
                      </label>
                      {editMode ? (
                        key === "companyname" ? (
                          <Select
                            options={companies}
                            value={companies.find(
                              (opt) => opt.value === profile[key]
                            )}
                            onChange={(selectedOption) =>
                              setProfile((prev) => ({
                                ...prev,
                                [key]: selectedOption
                                  ? selectedOption.value
                                  : "",
                              }))
                            }
                            name={key}
                            styles={customStyles}
                          />
                        ) : (
                          <input
                            type="text"
                            name={key}
                            value={profile[key] || ""}
                            onChange={handleChange}
                            className="custom--input w-full"
                          />
                        )
                      ) : (
                        <span>{profile[key] || "—"}</span>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  className="absolute top-0 right-0 text-primarycolor border border-primarycolor bg-white px-2 py-1 rounded-lg flex items-center gap-2 justify-center"
                  onClick={() => setEditMode((prev) => !prev)}
                >
                  {editMode ? "Save" : "Edit"}{" "}
                  {editMode ? <FiSave /> : <FiEdit2 />}
                </button>
              </div>
            </div>
          </div>
        )}
        {activeTab === "fitness" && (
          <div className="flex gap-6">
            <div className="flex-1 space-y-4">
              <div className="relative">
                <h3 className="font-semibold mb-3">Fitness Log</h3>
                <div className="flex text-sm gap-4">
                  <div className="flex flex-col text-sm w-full">
                    <label className="font-semibold mb-2 block">Name:</label>
                    {profile?.name}
                  </div>
                  <div className="flex flex-col text-sm w-full">
                    <label className="font-semibold mb-2 block">Gender:</label>
                    {profile?.gender}
                  </div>
                  <div className="flex flex-col text-sm w-full">
                    <label className="font-semibold mb-2 block">
                      Age(latest):
                    </label>
                    {profile?.age}
                  </div>
                  <div className="flex flex-col text-sm w-full">
                    <label className="font-semibold mb-2 block">
                      Height(latest):
                    </label>
                    {profile?.height}
                  </div>
                </div>
                <button
                  className="absolute top-0 right-0 text-primarycolor border border-primarycolor bg-white px-2 py-1 rounded-lg flex items-center gap-2 justify-center"
                  onClick={() => setEditMode((prev) => !prev)}
                >
                  {editMode ? "Save" : "Edit"}{" "}
                  {editMode ? <FiSave /> : <FiEdit2 />}
                </button>
              </div>

<hr />
              <h3 className="font-semibold mb-3">Fitness Log</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {medicalConditions.map((condition) => (
                  <label
                    key={condition}
                    className="flex items-center gap-2 text-sm"
                  >
                    {editMode ? (
                      <label className="custom--checkbox">
                        <input
                          type="checkbox"
                          checked={profile.conditions?.includes(condition)}
                        />
                        <span className="checkbox--custom--check"></span>
                      </label>
                    ) : (

                      <label className="custom--checkbox">
                        <input
                         type="checkbox"
                         checked={profile.conditions?.includes(condition)}
                         readOnly
                         disabled
                        />
                        <span className="checkbox--custom--check"></span>
                      </label>
                    )}
                    {condition}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfileDetails;
