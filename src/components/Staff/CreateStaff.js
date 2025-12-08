import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import { IoAppsSharp, IoCloseCircle, IoPricetagSharp } from "react-icons/io5";
import { selectIcon } from "../../Helper/helper";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import PhoneInput from "react-phone-number-input";
import {
  FaBusinessTime,
  FaEnvelope,
  FaListCheck,
  FaRegBuilding,
  FaUser,
} from "react-icons/fa6";
import { MdInsertPhoto } from "react-icons/md";
import { LuPlug } from "react-icons/lu";
import { authAxios } from "../../config/config";
import parsePhoneNumberFromString from "libphonenumber-js";
import { FaBirthdayCake } from "react-icons/fa";
import { PiGenderIntersexBold } from "react-icons/pi";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import MultiSelect from "react-multi-select-component";
import { useSelector } from "react-redux";



const yesNoOptions = [
  { value: true, label: "Active" },
  { value: false, label: "Inactive" },
];

const today = new Date();
const adultLimitDate = new Date(
  today.getFullYear() - 18,
  today.getMonth(),
  today.getDate()
);

const oldestYearLimit = new Date(
  today.getFullYear() - 50,
  today.getMonth(),
  today.getDate()
);

const genderOptions = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
];

const CreateStaff = ({ setShowModal, formik, editingOption, roleOptionsByUser }) => {
  const leadBoxRef = useRef(null);
  const [club, setClub] = useState([]);
  const [selected, setSelected] = useState([]);
  const { user } = useSelector((state) => state.auth);
  const currentUserRole = user.role; // Example, dynamically from user info
  const roleOptions = roleOptionsByUser[currentUserRole] || [];

  // Function to fetch club list
  const fetchClub = async () => {
    try {
      const response = await authAxios().get("/club/list");
      const data = response.data?.data || response.data || [];
      setClub(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch clubs");
    }
  };

  // Fetch clubs and gallery list on component mount
  useEffect(() => {
    fetchClub();
  }, []);

  const clubOptions =
    club?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];

  useEffect(() => {
    if (!editingOption) return;
    if (!formik || !formik.setValues) return;
    if (!club || club.length === 0) return; // wait until clubs are loaded

    const fetchStaffById = async (id) => {
      try {
        const res = await authAxios().get(`/staff/${id}`);
        const data = res.data?.data || res.data || null;

        console.log("SHIVAKAR", data);

        if (data) {
          const clubIds = Array.isArray(data.staff_clubs)
            ? data.staff_clubs.map((c) => c.club_id)
            : [];

          // set Formik values
          formik.setValues({
            profile_image: data?.profile_image || "",
            logo: data?.logo || "",
            name: data?.name || "",
            email: data?.email || "",
            experience: data?.experience || "",
            mobile: data.mobile || "",
            country_code: data.country_code || "",
            show_on_app: data.show_on_app || false,
            phoneFull: data.country_code
              ? `+${data.country_code}${data.mobile}` // add the "+"
              : "",
            date_of_birth: data?.date_of_birth || null,
            gender: data?.gender || "",
            tags: data?.tags || "",
            role: data?.role || "",
            club_id: clubIds,
            status: data?.status || "",
            position: data?.position || "",
            description: data?.description || "",
            content:
              Array.isArray(data?.content) && data.content.length > 0
                ? data.content
                : [{ title: "", description: "" }],
          });

          // Now set selected options for MultiSelect
          const selectedOptions = club
            .map((item) =>
              clubIds.includes(item.id)
                ? { label: item.name, value: item.id }
                : null
            )
            .filter(Boolean);

          setSelected(selectedOptions);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch staff details");
      }
    };

    fetchStaffById(editingOption);
  }, [editingOption, club]);


  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setShowModal(false);
    }
  };

  const handleLeadModal = () => {
    setShowModal(false);
  };

  const handlePhoneChange = (value) => {
    formik.setFieldValue("phoneFull", value);
    if (!value) {
      formik.setFieldValue("mobile", "");
      formik.setFieldValue("country_code", "");
      return;
    }
    const phoneNumber = parsePhoneNumberFromString(value);
    if (phoneNumber) {
      formik.setFieldValue("mobile", phoneNumber.nationalNumber);
      formik.setFieldValue("country_code", phoneNumber.countryCallingCode);
    }
    formik.setFieldError("mobile", "");
  };

  return (
    <div
      className="bg--blur create--lead--container overflow-auto hide--overflow fixed top-0 left-0 z-[999] w-full bg-black bg-opacity-60 h-full"
      onClick={handleOverlayClick}
    >
      <div
        className="min-h-[70vh] w-[95%] max-w-5xl mx-auto mt-[100px] mb-[100px] container--leadbox rounded-[10px] flex flex-col"
        ref={leadBoxRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-t-[10px] flex gap-3 items-center justify-between py-4 px-4 border-b">
          <h2 className="text-xl font-semibold">Create a Staff</h2>
          <div className="close--lead cursor-pointer" onClick={handleLeadModal}>
            <IoCloseCircle className="text-3xl" />
          </div>
        </div>
        <div className="flex-1s flexs">
          <form onSubmit={formik.handleSubmit}>
            <div className="flex bg-white rounded-b-[10px]">
              <div className="p-6 flex-1">
                <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="mb-2 block">
                      Full Name<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FaUser />
                      </span>
                      <input
                        type="text"
                        name="name"
                        className="custom--input w-full input--icon"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </div>
                    {formik.touched.name && formik.errors.name && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-2 block">
                      Email<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FaEnvelope />
                      </span>
                      <input
                        type="email"
                        name="email"
                        className="custom--input w-full input--icon"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </div>
                    {formik.touched.email && formik.errors.email && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="mb-2 block">
                      Phone Number<span className="text-red-500">*</span>
                    </label>
                    <PhoneInput
                      name="phoneFull"
                      value={formik.values.phoneFull}
                      onChange={handlePhoneChange}
                      international
                      defaultCountry="IN"
                      countryCallingCodeEditable={false}
                      className="custom--input w-full custom--phone"
                    />

                    {formik.touched.mobile && formik.errors.mobile && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.mobile}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block">DOB</label>

                    <div className="custom--date dob-format relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FaBirthdayCake />
                      </span>
                      <DatePicker
                        selected={
                          formik.values.date_of_birth
                            ? new Date(formik.values.date_of_birth)
                            : null
                        }
                        onChange={(date) =>
                          formik.setFieldValue("date_of_birth", date)
                        }
                        dateFormat="dd MMM yyyy"
                        showMonthDropdown
                        showYearDropdown
                        scrollableYearDropdown
                        dropdownMode="select"
                        placeholderText="Select date of birth"
                        className="input--icon"
                        // Adult-only limits
                        maxDate={adultLimitDate} // cannot select a date younger than 18
                        minDate={oldestYearLimit} // limit oldest possible age to 100 years
                        yearDropdownItemNumber={100}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-gray-700">
                      Gender<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <PiGenderIntersexBold />
                      </span>
                      <Select
                        name="gender"
                        value={genderOptions.find(
                          (opt) => opt.value === formik.values.gender
                        )}
                        options={genderOptions}
                        onChange={(option) =>
                          formik.setFieldValue("gender", option.value)
                        }
                        styles={selectIcon}
                        className="!capitalize"
                      />
                    </div>
                    {formik.touched.gender && formik.errors.gender && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.gender}
                      </p>
                    )}
                  </div>

                  {/* Role */}
                  <div>
                    <label className="mb-2 block">
                      Role<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FaUser />
                      </span>
                      <Select
                        name="role"
                        value={
                          roleOptions.find(
                            (option) =>
                              option.value.toString() ===
                              formik.values.role?.toString()
                          ) || null
                        }
                        options={roleOptions}
                        onChange={(option) =>
                          formik.setFieldValue("role", option.value)
                        }
                        onBlur={() => formik.setFieldTouched("role", true)}
                        styles={selectIcon}
                        className="!capitalize"
                      />
                    </div>
                    {formik.touched.role && formik.errors.role && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.role}
                      </p>
                    )}
                  </div>

                  <div
                    className={`col-span-3 ${
                      editingOption ? "grid-cols-4" : "grid-cols-3"
                    }  grid  gap-4 "`}
                  >
                    {/* Experience */}
                    <div>
                      <label className="mb-2 block">
                        Experience<span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                          <FaBusinessTime />
                        </span>
                        <input
                          type="number"
                          name="experience"
                          className="custom--input w-full input--icon"
                          value={formik.values.experience}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      </div>
                      {formik.touched.experience &&
                        formik.errors.experience && (
                          <p className="text-red-500 text-sm">
                            {formik.errors.experience}
                          </p>
                        )}
                    </div>

                    {/* Club */}
                    <div>
                      <label className="mb-2 block">
                        Club<span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                          <FaRegBuilding />
                        </span>
                        <MultiSelect
                          options={clubOptions}
                          value={selected} // selected objects
                          onChange={(selectedOptions) => {
                            setSelected(selectedOptions); // set objects
                            const values = selectedOptions.map(
                              (opt) => opt.value
                            ); // only IDs
                            formik.setFieldValue("club_id", values);
                          }}
                          labelledBy="Select Clubs"
                          hasSelectAll={false}
                          overrideStrings={{
                            selectSomeItems: "Select Clubs...",
                            allItemsAreSelected: "All Clubs Selected",
                            search: "Search",
                          }}
                          className="custom--input w-full input--icon multi--select--new"
                        />
                      </div>
                      {formik.touched.club_id && formik.errors.club_id && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.club_id}
                        </p>
                      )}
                    </div>
                    {/* Status */}
                    {editingOption && (
                      <div>
                        <label className="mb-2 block">Staff Status</label>
                        <div className="relative">
                          <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                            <LuPlug />
                          </span>
                          <Select
                            name="status"
                            value={{
                              label: formik.values.status,
                              value: formik.values.status,
                            }}
                            options={[
                              { label: "Active", value: "ACTIVE" },
                              { label: "Inactive", value: "INACTIVE" },
                            ]}
                            onChange={(option) =>
                              formik.setFieldValue("status", option.value)
                            }
                            onBlur={() =>
                              formik.setFieldTouched("status", true)
                            }
                            styles={selectIcon}
                            className="!capitalize"
                          />
                        </div>
                        {formik.touched.status && formik.errors.status && (
                          <p className="text-red-500 text-sm mt-1">
                            {formik.errors.status}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Show on App */}
                    <div>
                      <label className="mb-2 block">Show on App</label>
                      <div className="relative">
                        <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                          <IoAppsSharp />
                        </span>

                        <Select
                          name="show_on_app"
                          value={
                            yesNoOptions.find(
                              (opt) => opt.value === formik.values?.show_on_app
                            ) || null
                          }
                          options={yesNoOptions}
                          onChange={(option) =>
                            formik.setFieldValue("show_on_app", option.value)
                          }
                          onBlur={() =>
                            formik.setFieldTouched("show_on_app", true)
                          }
                          styles={selectIcon}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-span-3 space-y-4">
                    <label className="mb-0 block">
                      Profile Info.<span className="text-red-500">*</span>
                    </label>
                    {formik.values.content.map((item, index) => {
                      return (
                        <div
                          key={index}
                          className="grid grid-cols-3 gap-4 border p-4 rounded-md bg-gray-50 relative"
                        >
                          {/* Title */}
                          <div className="mb-3">
                            <label className="block mb-1">Title</label>
                            <input
                              type="text"
                              className="custom--input w-full"
                              value={item.title}
                              onChange={(e) =>
                                formik.setFieldValue(
                                  `content[${index}].title`,
                                  e.target.value
                                )
                              }
                            />
                            {formik.touched.content?.[index]?.title &&
                              formik.errors.content?.[index]?.title && (
                                <p className="text-red-500 text-sm">
                                  {formik.errors.content[index].title}
                                </p>
                              )}
                          </div>

                          {/* Description */}
                          <div className="col-span-2 mb-3">
                            <label className="block mb-1">Description</label>
                            <input
                              type="text"
                              className="custom--input w-full"
                              value={item.description}
                              onChange={(e) =>
                                formik.setFieldValue(
                                  `content[${index}].description`,
                                  e.target.value
                                )
                              }
                            />
                            {formik.touched.content?.[index]?.description &&
                              formik.errors.content?.[index]?.description && (
                                <p className="text-red-500 text-sm">
                                  {formik.errors.content[index].description}
                                </p>
                              )}
                          </div>

                          {/* Remove Button */}
                          {formik.values.content.length > 1 && (
                            <button
                              type="button"
                              className="absolute flex items-center justify-center px-1 py-1 bg-red-600 text-white rounded-full w-9 h-9 top-[-5px] right-[-5px]"
                              onClick={() => {
                                const updated = [...formik.values.content];
                                updated.splice(index, 1);
                                formik.setFieldValue("content", updated);
                              }}
                            >
                              <FiTrash2 />
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {/* Add New Item */}
                    <button
                      type="button"
                      onClick={() => {
                        formik.setFieldValue("content", [
                          ...formik.values.content,
                          { title: "", description: "" },
                        ]);
                      }}
                      className="flex items-center justify-center px-2 py-1 bg-black text-white rounded text-sm"
                    >
                      <FiPlus /> Add Content
                    </button>
                  </div>

                  {/* Conditionally rendered fields */}
                  {formik.values?.show_on_app === true && (
                    <>
                      {/* Profile Picture */}
                      <div>
                        <label className="mb-2 block">
                          Profile Picture<span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                            <MdInsertPhoto />
                          </span>

                          <input
                            type="file"
                            name="profile_image"
                            accept="image/*"
                            onChange={(event) => {
                              const file = event.currentTarget.files[0];
                              formik.setFieldValue("profile_image", file);
                            }}
                            className="custom--input w-full input--icon"
                          />
                        </div>
                        {formik.touched.profile_image &&
                          formik.errors.profile_image && (
                            <p className="text-red-500 text-sm">
                              {formik.errors.profile_image}
                            </p>
                          )}
                      </div>

                      {/* Tags */}
                      <div>
                        <label className="mb-2 block">
                          Tags<span className="text-red-500">*</span>
                        </label>

                        <div className="relative">
                          <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                            <IoPricetagSharp />
                          </span>
                          <input
                            type="text"
                            name="tags"
                            className="custom--input w-full input--icon"
                            value={formik.values.tags}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          />
                        </div>
                        {formik.touched.tags && formik.errors.tags && (
                          <p className="text-red-500 text-sm">
                            {formik.errors.tags}
                          </p>
                        )}
                      </div>

                      {/* Description */}
                      <div className="col-span-3">
                        <label className="mb-2 block">
                          Description
                          <span className="text-red-500">*</span>
                        </label>

                        <textarea
                          rows={3}
                          name="description"
                          value={formik.values.description}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="custom--input w-full"
                        />
                        {formik.touched.description &&
                          formik.errors.description && (
                            <p className="text-red-500 text-sm">
                              {formik.errors.description}
                            </p>
                          )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 py-5 justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-transparent border border-white text-white font-semibold rounded max-w-[150px] w-full"
                onClick={() => {
                  formik.resetForm();
                  setShowModal(false);
                }}
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
  );
};

export default CreateStaff;
