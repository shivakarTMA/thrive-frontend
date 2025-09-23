import React, { useEffect, useRef, useState } from "react";
import PhoneInput from "react-phone-number-input";
import DatePicker from "react-datepicker";
import Select from "react-select";
import { customStyles } from "../../Helper/helper";
import { useDispatch, useSelector } from "react-redux";
import { fetchOptionList } from "../../Redux/Reducers/optionListSlice";
import DummyProfile from "../../assets/images/dummy-profile.png";
import { CiCamera } from "react-icons/ci";
import Webcam from "react-webcam";
import { IoCheckmark, IoClose } from "react-icons/io5";
import { FaRegImage } from "react-icons/fa";
import { apiAxios } from "../../config/config";

const ProfileDetails = ({ member }) => {
  console.log(member, "membershivakar");
  const [showModal, setShowModal] = useState(false);
  const webcamRef = useRef(null);
  const [formData, setFormData] = useState({
    profileImage: "",
    contactNumber: "",
    fullName: "",
    dob: "",
    gender: null,
    email: "",
    location: "",
    address: "",
    leadOwner: "",
    leadType: "",
    leadSource: null,
    company: "",
    designation: "",
    officialEmail: "",
    emergencyName: "",
    emergencyContact: "",
    emergencyEmail: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Lead source types
  const genderOptions = [
    { value: "MALE", label: "Male" },
    { value: "FEMALE", label: "Female" },
    { value: "NOTDISCLOSE", label: "Not to Disclose" },
  ];

  // Redux state
  const dispatch = useDispatch();
  const { lists, loading } = useSelector((state) => state.optionList);

  // Fetch option lists
  useEffect(() => {
    dispatch(fetchOptionList("LEAD_SOURCE"));
    dispatch(fetchOptionList("LEAD_TYPE"));
    dispatch(fetchOptionList("INTERESTED_IN"));
  }, [dispatch]);

  // Extract Redux lists
  const leadsSources = lists["LEAD_SOURCE"] || [];
  const leadTypes = lists["LEAD_TYPE"] || [];
  const servicesName = lists["INTERESTED_IN"] || [];

  // Capture from webcam
  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setFormData((prev) => ({ ...prev, profileImage: imageSrc }));
    setShowModal(false);
  };

  // Handle file upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, profileImage: imageUrl }));
      setShowModal(false);
    }
  };

  const fetchCompanyDetails = async (companyId) => {
    try {
      const res = await apiAxios().get(`/company/${companyId}`);
      return res.data?.data || res.data || null;
    } catch (error) {
      console.error("Failed to fetch company details:", error);
      return null;
    }
  };

  useEffect(() => {
    const populateFormData = async () => {
      // Fetch company details if company_name is actually an ID
      let companyName = "";
      if (member.company_name) {
        const companyDetails = await fetchCompanyDetails(member.company_name);
        companyName = companyDetails?.name || ""; // fallback to empty if not found
      }
    

    setFormData({
      profileImage: member.profile_pic || DummyProfile,
      contactNumber:
        member.country_code && member.mobile
          ? `+${member.country_code}${member.mobile}`
          : "",
      fullName: member.full_name || "",
      dob: member.date_of_birth || "",
      gender: genderOptions.find((g) => g.value === member.gender) || null,
      email: member.email || "",
      location: member.location || "",
      address: member.address || "",
      leadOwner: member.created_by || "",
      leadType:
        leadTypes.find((g) => g.value === member.lead_type) || null || "",
      leadSource: member.lead_source || "",
      company: companyName || "",
      designation: member.designation || "",
      officialEmail: member.official_email || "",
      emergencyName: member.emergency_name || "",
      emergencyContact: member.emergency_contact || "",
      emergencyEmail: member.emergency_email || "",
    });

  };

    populateFormData();
  }, [member]);

  return (
    <div className="min-h-screen">
      <div className="flex gap-5">
        {/* Left Sidebar */}
        <div className="w-full max-w-[280px]">
          <div className="bg-white p-4 rounded-[10px] w-full box--shadow">
            {/* Profile Image and Progress */}
            <div className="text-center mb-6">
              <div className="w-full bg-gray-100 rounded-lg mx-auto mb-4 overflow-hidden relative group">
                <img
                  // src={formData.profileImage}
                  src={member?.profile_pic || formData.profileImage}
                  alt="Profile"
                  className="w-full h-[300px] object-cover"
                />
                <div
                  className="bg-black bg-opacity-25 flex items-center justify-center absolute w-full h-full top-0 left-0 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-300"
                  onClick={() => setShowModal(true)}
                >
                  <div className="bg-white bg-opacity-25 w-[60px] h-[60px] flex items-center justify-center rounded-full">
                    <CiCamera className="text-white text-4xl" />
                  </div>
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
                          <CiCamera /> Take Photo
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

              <div className="mb-4 flex items-center gap-2 justify-between">
                <div className="text-lg font-bold text-gray-900">
                  Profile Completion
                </div>
                <div className="text-lg font-bold text-gray-900">40%</div>
              </div>

              <div className="progress--bar bg-[#E5E5E5] rounded-full h-[10px] w-full">
                <div
                  className="bg--color w-full rounded-full h-full"
                  style={{ width: "40%" }}
                ></div>
              </div>
            </div>

            {/* Details Section */}
            <div className="border-t border-t-[#D4D4D4] py-5">
              <div className="text-md font-semibold text-black mb-2">
                Details:
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#6F6F6F] font-[500] text-[15px]">
                    Membership ID:
                  </span>
                  <span className="text-[#6F6F6F] font-[500] text-[15px]">
                    {member?.membership_number || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6F6F6F] font-[500] text-[15px]">
                    Centre ID:
                  </span>
                  <span className="text-[#6F6F6F] font-[500] text-[15px]">
                    {member?.club_id || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6F6F6F] font-[500] text-[15px]">
                    Centre Name:
                  </span>
                  <span className="text-[#6F6F6F] font-[500] text-[15px]">
                    {member?.location || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Referred By Section */}
            <div className="border-t border-t-[#D4D4D4] pt-5">
              <div className="text-md font-semibold text-black mb-2">
                Referred By:
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#6F6F6F] font-[500] text-[15px]">
                    Name:
                  </span>
                  <span className="text-[#6F6F6F] font-[500] text-[15px]">
                    {member?.referred_by_name || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6F6F6F] font-[500] text-[15px]">
                    Referrer ID:
                  </span>
                  <span className="text-[#6F6F6F] font-[500] text-[15px]">
                    {member?.referred_by_id || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full">
          <div className="bg-white p-6 rounded-[10px] box--shadow w-full">
            {/* Basic Information */}
            <div className="border-b border-b[#D4D4D4] pb-5">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Basic Information
              </h2>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Contact Number<span className="text-red-500">*</span>
                  </label>
                  <PhoneInput
                    name="text"
                    value={formData.contactNumber}
                    onChange={(e) =>
                      handleInputChange("contactNumber", e.target.value)
                    }
                    international
                    defaultCountry="IN"
                    countryCallingCodeEditable={false}
                    className="custom--input w-full custom--phone"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Full Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    className="custom--input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    DOB<span className="text-red-500">*</span>
                  </label>
                  <div className="custom--date dob-format relative">
                    <DatePicker
                      value={formData.dob}
                      onChange={(value) => handleInputChange("dob", value)}
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      dateFormat="dd MMM yyyy"
                      yearDropdownItemNumber={100}
                      placeholderText="Select date"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Gender<span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="gender"
                    value={formData.gender}
                    options={genderOptions}
                    onChange={(value) => handleInputChange("gender", value)}
                    styles={customStyles}
                    className="!capitalize"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Email<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="custom--input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Location<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    className="custom--input w-full"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-black mb-2">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    rows={1}
                    className="custom--input w-full"
                  />
                </div>
              </div>
            </div>

            {/* Lead Information */}
            <div className="border-b border-b[#D4D4D4] pb-5 pt-5">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Lead Information
              </h2>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Lead Owner<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.leadOwner}
                    onChange={(e) =>
                      handleInputChange("leadOwner", e.target.value)
                    }
                    disabled={true}
                    className="custom--input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Interested In
                  </label>
                  <Select
                    name="leadType"
                    value={formData.leadType}
                    options={servicesName}
                    onChange={(value) => handleInputChange("leadType", value)}
                    styles={customStyles}
                    className="!capitalize"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Lead Type<span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="leadType"
                    value={formData.leadType}
                    options={leadTypes}
                    onChange={(value) => handleInputChange("leadType", value)}
                    styles={customStyles}
                    className="!capitalize"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Lead Source<span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="leadSource"
                    value={formData.leadSource}
                    options={leadsSources}
                    onChange={(value) => handleInputChange("leadSource", value)}
                    styles={customStyles}
                    className="!capitalize"
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="border-b border-b[#D4D4D4] pb-5 pt-5">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Professional Information
              </h2>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Company<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) =>
                      handleInputChange("company", e.target.value)
                    }
                    className="custom--input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) =>
                      handleInputChange("designation", e.target.value)
                    }
                    className="custom--input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Official Email
                  </label>
                  <input
                    type="email"
                    value={formData.officialEmail}
                    onChange={(e) =>
                      handleInputChange("officialEmail", e.target.value)
                    }
                    className="custom--input w-full"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="pb-5 pt-5">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Emergency Contact
              </h2>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Full Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyName}
                    onChange={(e) =>
                      handleInputChange("emergencyName", e.target.value)
                    }
                    className="custom--input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Contact<span className="text-red-500">*</span>
                  </label>
                  <PhoneInput
                    name="text"
                    value={formData.emergencyContact}
                    onChange={(e) =>
                      handleInputChange("emergencyContact", e.target.value)
                    }
                    international
                    defaultCountry="IN"
                    countryCallingCodeEditable={false}
                    className="custom--input w-full custom--phone"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Official Email
                  </label>
                  <input
                    type="email"
                    value={formData.emergencyEmail}
                    onChange={(e) =>
                      handleInputChange("emergencyEmail", e.target.value)
                    }
                    className="custom--input w-full"
                  />
                </div>
              </div>
            </div>

            {/* Profile Completion */}
            <div className="bg-[#F1F1F1] p-5 mt-5 rounded-[10px]">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b border-b-[#D4D4D4] pb-3">
                Profile Completion
              </h2>

              <div className="grid grid-cols-4 gap-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg--color flex items-center justify-center">
                    <IoCheckmark className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Personal Information
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#D4D4D4] flex items-center justify-center">
                    <IoCheckmark className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Consent on terms
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg--color flex items-center justify-center">
                    <IoCheckmark className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    ParQ Information
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#D4D4D4] flex items-center justify-center">
                    <IoCheckmark className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    KYC Submission
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Save Button */}
          <div className="flex justify-end mt-5">
            <button className="px-4 py-2 bg-black text-white rounded flex items-center gap-2">
              SAVE CHANGES
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails;
