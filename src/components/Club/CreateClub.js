import React, { useEffect, useState } from "react";
import {
  IoCloseCircle,
  IoDocumentTextOutline,
  IoLocationOutline,
} from "react-icons/io5";
import {
  FaEnvelope,
  FaListCheck,
  FaListUl,
  FaRegBuilding,
} from "react-icons/fa6";
import { GrDocument } from "react-icons/gr";
import { LuPlug } from "react-icons/lu";
import Select from "react-select";
import {
  blockInvalidNumberKeys,
  multiRowStyles,
  sanitizePositiveInteger,
  selectIcon,
} from "../../Helper/helper";
import PhoneInput from "react-phone-number-input";
import { authAxios } from "../../config/config";
import { toast } from "react-toastify";
import CreatableSelect from "react-select/creatable";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { GoClock } from "react-icons/go";
import { PiImageFill } from "react-icons/pi";

const CreateClub = ({
  setShowModal,
  editingClub,
  formik,
  handleOverlayClick,
  leadBoxRef,
  handlePhoneChange,
  indianStates,
}) => {
  const [logoError, setLogoError] = useState("");
  // Remove leading/trailing double quotes, single quotes and whitespace
  const sanitizeServiceString = (s) => {
    if (typeof s !== "string") return s;
    let str = s.trim();

    // If string looks like a JSON array (with double quotes), try parse
    try {
      const parsed = JSON.parse(str);
      if (typeof parsed === "string") return parsed.trim();
    } catch (e) {
      // ignore
    }

    // If it's like "['a','b']" or "['a', 'b']" (single quotes), strip outer [ ] then split
    // But this function only handles single values, so remove any surrounding quotes
    str = str.replace(/^"+|"+$/g, ""); // remove double quotes on ends
    str = str.replace(/^'+|'+$/g, ""); // remove single quotes on ends

    return str;
  };

  // Normalize input which might be:
  // - actual array: ["a","b"]
  // - single string containing single-quoted array: "['a','b']"
  // - single string containing double-quoted JSON array: '["a","b"]'
  // - single raw string "a"
  const normalizeServicesArray = (arrOrString) => {
    if (!arrOrString && arrOrString !== "") return [];

    // If it's already an array, sanitize each element
    if (Array.isArray(arrOrString)) {
      return arrOrString.map((it) => sanitizeServiceString(it));
    }

    // If it's a string...
    if (typeof arrOrString === "string") {
      const trimmed = arrOrString.trim();

      // Try JSON parse (works for '["a","b"]')
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((it) => sanitizeServiceString(it));
        }
      } catch (e) {
        // not valid JSON
      }

      // If looks like single-quoted array: "['a','b']" or "['a', 'b']"
      const singleQuoteArrayMatch = trimmed.match(/^\[.*\]$/);
      if (singleQuoteArrayMatch) {
        // remove outer [ ]
        const inside = trimmed.slice(1, -1).trim();
        if (inside.length === 0) return [];
        // split by comma that may have spaces
        const parts = inside.split(",").map((p) => p.trim());
        return parts.map((p) => {
          // strip surrounding single/double quotes
          let cleaned = p.replace(/^'+|'+$/g, "");
          cleaned = cleaned.replace(/^"+|"+$/g, "");
          return cleaned.trim();
        });
      }

      // Fallback: treat as single item
      return [sanitizeServiceString(trimmed)];
    }

    // otherwise, can't parse -> empty
    return [];
  };

  const parseTime = (timeString) => {
    if (!timeString) return null;

    let d = new Date();
    let [time, modifier] = timeString.split(" ");

    let [hours, minutes] = time.split(":");

    hours = parseInt(hours);
    minutes = parseInt(minutes);

    // Handle AM/PM
    if (modifier) {
      if (modifier === "PM" && hours !== 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;
    }

    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  useEffect(() => {
    if (!editingClub) return;

    const fetchCompanyById = async (id) => {
      try {
        const res = await authAxios().get(`/club/${id}`);
        const data = res.data?.data || res.data || null;

        console.log(data, "SHIVAKAR");

        if (data) {
          const normalizedServices = normalizeServicesArray(
            data.club_available_service,
          );
          // ✅ Prefill formik fields with fetched data
          formik.setValues({
            logo: data?.logo || null,
            name: data?.name || "",
            email: data?.email || "",
            phone: "+" + data?.phone || "",
            address: data?.address || "",
            gstno: data?.gstno || "",
            city: data?.city || "",
            state:
              typeof data?.state === "string"
                ? { label: data?.state, value: data?.state }
                : data?.state || "",
            country: data?.country || "",
            zipcode: data?.zipcode || "",
            status: data?.status || "",
            position: data?.position || "",
            club_available_service: normalizedServices,
            description: data?.description || "",
            map_url: data?.map_url || "",
            open_time: data?.open_time || "",
            close_time: data?.close_time || "",
            trial_duration: data?.trial_duration || "",
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch module details");
      }
    };

    fetchCompanyById(editingClub);
  }, [editingClub]);

  const generateTimes = () => {
    let times = [];
    let start = new Date();
    start.setHours(6, 0, 0, 0); // 6:00 AM

    let end = new Date();
    end.setHours(22, 0, 0, 0); // 10:00 PM

    while (start <= end) {
      times.push(new Date(start));
      start = new Date(start.getTime() + 15 * 60000); // 15-minute step
    }

    return times;
  };

  const allowedTimes = generateTimes();

  const handleCreateService = (inputValue) => {
    if (!inputValue) return;
    const clean = sanitizeServiceString(inputValue);
    const current = Array.isArray(formik.values.club_available_service)
      ? formik.values.club_available_service
      : [];
    formik.setFieldValue("club_available_service", [...current, clean]);
  };

  /* -------------------------
     Helper to convert formik.values to options for Select components
     ------------------------- */
  const servicesToOptions = (arr) =>
    (Array.isArray(arr) ? arr : []).map((s) => ({ label: s, value: s }));

  const handleLogoChange = (e) => {
  const file = e.target.files[0];

  if (!file) {
    setLogoError("Logo is required");
    formik.setFieldValue("logo", null);
    formik.setFieldValue("logoFile", null);
    return;
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  const maxSize = 2 * 1024 * 1024; // 2MB

  // ❌ Invalid type
  if (!allowedTypes.includes(file.type)) {
    setLogoError("Only JPG, PNG, or WEBP files are allowed");
    formik.setFieldValue("logo", null);
    formik.setFieldValue("logoFile", null);
    e.target.value = null;
    return;
  }

  // ❌ Invalid size
  // if (file.size > maxSize) {
  //   setLogoError("Image size must be less than 2MB");
  //   formik.setFieldValue("logo", null);
  //   formik.setFieldValue("logoFile", null);
  //   e.target.value = null;
  //   return;
  // }

  // ✅ Valid file
  setLogoError("");
  const previewURL = URL.createObjectURL(file);

  formik.setFieldValue("logo", previewURL);
  formik.setFieldValue("logoFile", file);
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
          <h2 className="text-xl font-semibold">
            {editingClub ? "Edit Club" : "Create Club"}
          </h2>
          <div
            className="close--lead cursor-pointer"
            onClick={() => {
              formik.resetForm();
              setShowModal(false);
            }}
          >
            <IoCloseCircle className="text-3xl" />
          </div>
        </div>

        <div className="flex-1">
          <form onSubmit={formik.handleSubmit} className="p-0 space-y-0">
            <div className="flex bg-white rounded-b-[10px]">
              <div className="p-6 flex-1">
                <div className="grid lg:grid-cols-3 grid-cols-1 lg:gap-4 gap-2">
                  {/* Image Preview */}
                  <div className="row-span-2">
                    <div className="bg-gray-100 rounded-lg w-full h-[160px] overflow-hidden p-4">
                      {formik.values?.logo ? (
                        <img
                          src={formik.values?.logo}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <PiImageFill className="text-gray-300 text-7xl" />
                          <span className="text-gray-500 text-sm">
                            Upload Image
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block">Club Logo</label>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleLogoChange}
                      onBlur={() => formik.setFieldTouched("logo", true)}
                      className="custom--input w-full"
                    />
                    {logoError && (
                      <p className="text-red-500 text-sm mt-1">{logoError}</p>
                    )}
                  </div>
                  {/* Company Name */}
                  <div>
                    <label className="mb-2 block">
                      Club Name<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <FaRegBuilding />
                      </span>
                      <input
                        type="text"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.name && formik.errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-2 block">
                      Club Email<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <FaEnvelope />
                      </span>
                      <input
                        type="email"
                        name="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.email && formik.errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="mb-2 block">
                      Contact Number<span className="text-red-500">*</span>
                    </label>
                    <PhoneInput
                      name="phone"
                      value={
                        formik.values.phone
                          ? formik.values.phone.startsWith("+")
                            ? formik.values.phone
                            : `+${formik.values.phone}`
                          : ""
                      }
                      onChange={handlePhoneChange}
                      onBlur={() => formik.setFieldTouched("phone", true)}
                      international
                      defaultCountry="IN"
                      countryCallingCodeEditable={false}
                      className="custom--input w-full custom--phone"
                    />
                    {formik.touched.phone && formik.errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.phone}
                      </p>
                    )}
                  </div>

                  {/* GST No. */}
                  <div>
                    <label className="mb-2 block">
                      GST No.<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <IoDocumentTextOutline />
                      </span>
                      <input
                        type="text"
                        name="gstno"
                        value={formik.values.gstno}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.gstno && formik.errors.gstno && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.gstno}
                      </p>
                    )}
                  </div>
                  {/* City */}
                  <div>
                    <label className="mb-2 block">
                      City<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <IoLocationOutline />
                      </span>
                      <input
                        type="text"
                        name="city"
                        value={formik.values.city}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.city && formik.errors.city && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.city}
                      </p>
                    )}
                  </div>

                  {/* State */}
                  <div>
                    <label className="mb-2 block">
                      State/Province<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <IoLocationOutline />
                      </span>
                      <Select
                        name="state"
                        value={formik.values.state} // ✅ should be an object { label, value }
                        options={indianStates}
                        onChange={(option) =>
                          formik.setFieldValue("state", option)
                        } // ✅ store whole object
                        onBlur={() => formik.setFieldTouched("state", true)}
                        styles={selectIcon}
                      />
                    </div>
                    {formik.touched.state && formik.errors.state && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.state}
                      </p>
                    )}
                  </div>

                  {/* Country */}
                  <div>
                    <label className="mb-2 block">
                      Country<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <IoLocationOutline />
                      </span>
                      <input
                        type="text"
                        name="country"
                        value={formik.values.country}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.country && formik.errors.country && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.country}
                      </p>
                    )}
                  </div>

                  {/* Zip */}
                  <div>
                    <label className="mb-2 block">
                      Zip or Postal Code<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <IoLocationOutline />
                      </span>
                      <input
                        type="text"
                        name="zipcode"
                        value={formik.values.zipcode}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.zipcode && formik.errors.zipcode && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.zipcode}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-2 block">
                      Map Url<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <IoLocationOutline />
                      </span>
                      <input
                        type="text"
                        name="map_url"
                        value={formik.values.map_url}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.map_url && formik.errors.map_url && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.map_url}
                      </p>
                    )}
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="mb-2 block">
                      Tags<span className="text-red-500">*</span>
                    </label>
                    <CreatableSelect
                      isMulti
                      isClearable={false}
                      name="club_available_service"
                      value={servicesToOptions(
                        formik.values.club_available_service,
                      )}
                      onChange={(selected) =>
                        formik.setFieldValue(
                          "club_available_service",
                          selected ? selected.map((i) => i.value) : [],
                        )
                      }
                      onCreateOption={handleCreateService}
                      styles={multiRowStyles}
                      placeholder="Create or select services"
                    />
                    {formik.touched.club_available_service &&
                      formik.errors.club_available_service && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.club_available_service}
                        </p>
                      )}
                  </div>

                  {/* Open Time */}
                  <div>
                    <label className="mb-2 block">
                      Open Time<span className="text-red-500">*</span>
                    </label>
                    <div className="custom--date relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <GoClock />
                      </span>
                      <DatePicker
                        selected={
                          formik.values.open_time
                            ? parseTime(formik.values.open_time)
                            : null
                        }
                        onChange={(date) =>
                          formik.setFieldValue(
                            "open_time",
                            date.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            }),
                          )
                        }
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={30}
                        dateFormat="hh:mm aa"
                        className="custom--input w-full input--icon"
                        placeholderText="Select Open Time"
                      />
                    </div>
                    {formik.touched.open_time && formik.errors.open_time && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.open_time}
                      </p>
                    )}
                  </div>

                  {/* Close Time */}
                  <div>
                    <label className="mb-2 block">
                      Close Time<span className="text-red-500">*</span>
                    </label>
                    <div className="custom--date relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <GoClock />
                      </span>
                      <DatePicker
                        selected={
                          formik.values.close_time
                            ? parseTime(formik.values.close_time)
                            : null
                        }
                        onChange={(date) =>
                          formik.setFieldValue(
                            "close_time",
                            date.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            }),
                          )
                        }
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={30}
                        dateFormat="hh:mm aa"
                        className="custom--input w-full input--icon"
                        placeholderText="Select Close Time"
                        minTime={
                          formik.values.open_time
                            ? parseTime(formik.values.open_time)
                            : new Date(0, 0, 0, 0, 0)
                        }
                        maxTime={new Date(0, 0, 0, 23, 59)}
                      />
                    </div>
                    {formik.touched.close_time && formik.errors.close_time && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.close_time}
                      </p>
                    )}
                  </div>

                  {/* Trial Duration */}
                  <div>
                    <label className="mb-2 block">
                      Trial Duration (Minutes)
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <GoClock />
                      </span>
                      <Select
                        name="trial_duration"
                        value={
                          formik.values.trial_duration
                            ? {
                                label: formik.values.trial_duration,
                                value: formik.values.trial_duration,
                              }
                            : null
                        }
                        options={[
                          { label: "15", value: 15 },
                          { label: "30", value: 30 },
                          { label: "45", value: 45 },
                          { label: "60", value: 60 },
                          { label: "90", value: 90 },
                          { label: "120", value: 120 },
                        ]}
                        onChange={(opt) =>
                          formik.setFieldValue("trial_duration", opt.value)
                        }
                        styles={selectIcon}
                        placeholder="Select Duration"
                      />
                    </div>
                    {formik.touched.trial_duration &&
                      formik.errors.trial_duration && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.trial_duration}
                        </p>
                      )}
                  </div>

                  {/* Position */}
                  <div>
                    <label className="mb-2 block">
                      Position<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <FaListUl />
                      </span>
                      <input
                        type="number"
                        name="position"
                        value={formik.values.position}
                        // onChange={formik.handleChange}
                        onKeyDown={blockInvalidNumberKeys} // ⛔ blocks typing -, e, etc.
                        onChange={(e) => {
                          const cleanValue = sanitizePositiveInteger(
                            e.target.value,
                          );
                          formik.setFieldValue("position", cleanValue);
                        }}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.position && formik.errors.position && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.position}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <label className="mb-2 block">
                      Club Status<span className="text-red-500">*</span>
                    </label>
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
                        onBlur={() => formik.setFieldTouched("status", true)}
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

                  {/* Address */}
                  <div className="lg:col-span-3 grid lg:grid-cols-2 grid-cols-1 lg:gap-4 gap-2">
                    <div>
                      <label className="mb-2 block">
                        Physical Address<span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute top-[15px] left-[15px]">
                          <IoLocationOutline />
                        </span>
                        <textarea
                          rows={3}
                          name="address"
                          value={formik.values.address}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="custom--input w-full input--icon"
                        />
                        {formik.touched.address && formik.errors.address && (
                          <p className="text-red-500 text-sm mt-1">
                            {formik.errors.address}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block">
                        Description<span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute top-[15px] left-[15px]">
                          <FaListCheck />
                        </span>
                        <textarea
                          rows={3}
                          name="description"
                          value={formik.values.description}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="custom--input w-full input--icon"
                        />
                        {formik.touched.description &&
                          formik.errors.description && (
                            <p className="text-red-500 text-sm mt-1">
                              {formik.errors.description}
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 py-5 justify-end">
              <button
                type="button"
                onClick={() => {
                  formik.resetForm();
                  setShowModal(false);
                }}
                className="px-4 py-2 bg-transparent border border-white text-white font-semibold rounded max-w-[150px] w-full"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-white text-black font-semibold rounded max-w-[150px] w-full"
              >
                {editingClub ? "Update" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateClub;
