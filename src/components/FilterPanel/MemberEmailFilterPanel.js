import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { IoClose, IoTriangle } from "react-icons/io5";
import DatePicker from "react-datepicker";
import { customStyles } from "../../Helper/helper";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { LuCalendar } from "react-icons/lu";

const ageGroupOptions = [
  { value: "15-20", label: "15-20" },
  { value: "21-30", label: "21-30" },
  { value: "31-40", label: "31-40" },
  { value: "41-50", label: "41-50" },
  { value: "51+", label: "51+" },
  { value: "Not Mentioned", label: "Not Mentioned" },
];

const genderOptions = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "NOTDISCLOSE", label: "Not to Disclose" },
];

const validityOptions = [
  { value: "new", label: "New" },
  { value: "lead", label: "Lead" },
  { value: "opportunity", label: "Opportunity" },
  { value: "won", label: "Won" },
  { value: "closed", label: "Closed" },
  { value: "lost", label: "Lost" },
];

const clubOptions = [
  { value: "club1", label: "Club One" },
  { value: "club2", label: "Club Two" },
  { value: "club3", label: "Club Three" },
];

const serviceOptions = [
  { value: "gym", label: "Gym" },
  { value: "yoga", label: "Yoga" },
  { value: "swimming", label: "Swimming" },
];

const leadSourceOptions = [
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "walkin", label: "Walk-In" },
];

const MemberEmailFilterPanel = ({
  // ✅ Formik field values (each one is just a string or null)
  filterClub,
  filterValidity,
  filterAgeGroup,
  filterGender,
  filterService,
  filterServiceCategory,
  filterServiceVariation,
  filterLeadSource,
  filterExpiryFrom,
  filterExpiryTo,
  // ✅ Callback to update Formik values
  setFilterValue,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const panelRef = useRef(null);

  // ✅ Close popup when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Apply current filters to chips
  const handleApply = () => {
    const newFilters = {
      club: filterClub,
      validity: filterValidity,
      ageGroup: filterAgeGroup,
      gender: filterGender,
      service: filterService,
      service_category: filterServiceCategory,
      service_variation: filterServiceVariation,
      leadSource: filterLeadSource,
      expiry_from: filterExpiryFrom,
      expiry_to: filterExpiryTo,
    };
    setAppliedFilters(newFilters);
    setShowFilters(false);
  };

  // ✅ Remove specific filter chip
  const handleRemoveFilter = (key) => {
    const keyMap = {
      club: "filterClub",
      validity: "filterValidity",
      ageGroup: "filterAgeGroup",
      gender: "filterGender",
      service: "filterService",
      service_category: "filterServiceCategory",
      service_variation: "filterServiceVariation",
      leadSource: "filterLeadSource",
      expiry_from: "filterExpiryFrom",
      expiry_to: "filterExpiryTo",
    };
    setAppliedFilters((prev) => ({ ...prev, [key]: null }));
    setFilterValue(keyMap[key], null);
  };

  // ✅ Utility to get readable text for the chips
  const getDisplayValue = (value, options) => {
    if (!value) return "";
    const match = options?.find((opt) => opt.value === value);
    return match ? match.label : value;
  };

  return (
    <div className="relative max-w-fit w-full" ref={panelRef}>
      {/* Button to toggle filter panel */}
      <div className="flex gap-2 items-center">
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="w-[34px] h-[30px] bg-white text-black rounded-[5px] flex items-center justify-center border-[#D4D4D4] border-[2px]"
        >
          <HiOutlineAdjustmentsHorizontal className="text-lg" />
        </button>
        <span className="text-md">Criteria</span>
      </div>

      {/* ✅ Filter Dropdown Panel */}
      {showFilters && (
        <div className="absolute top-[100%] mt-4 z-[333] bg-white border rounded-lg shadow-md animate-fade-in">
          <div className="absolute top-[-15px] left-[20px]">
            <IoTriangle />
          </div>

          <div className="p-4">
            <div className="grid grid-cols-2 gap-4 min-w-[500px]">
              {/* Club */}
              <div>
                <label className="block mb-1 text-sm font-medium">Club<span className="text-red-500">*</span></label>
                <Select
                  value={
                    clubOptions.find((opt) => opt.value === filterClub) || null
                  }
                  onChange={(option) =>
                    setFilterValue("filterClub", option ? option.value : null)
                  }
                  options={clubOptions}
                  placeholder="Select Club"
                  styles={customStyles}
                />
              </div>

              {/* Validity */}
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Validity<span className="text-red-500">*</span>
                </label>
                <Select
                  value={
                    validityOptions.find(
                      (opt) => opt.value === filterValidity
                    ) || null
                  }
                  onChange={(option) =>
                    setFilterValue(
                      "filterValidity",
                      option ? option.value : null
                    )
                  }
                  options={validityOptions}
                  placeholder="Select Validity"
                  styles={customStyles}
                />
              </div>

              {/* Age Group */}
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Age Group<span className="text-red-500">*</span>
                </label>
                <Select
                  value={
                    ageGroupOptions.find(
                      (opt) => opt.value === filterAgeGroup
                    ) || null
                  }
                  onChange={(option) =>
                    setFilterValue(
                      "filterAgeGroup",
                      option ? option.value : null
                    )
                  }
                  options={ageGroupOptions}
                  placeholder="Select Age Group"
                  styles={customStyles}
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block mb-1 text-sm font-medium">Gender<span className="text-red-500">*</span></label>
                <Select
                  value={
                    genderOptions.find((opt) => opt.value === filterGender) ||
                    null
                  }
                  onChange={(option) =>
                    setFilterValue("filterGender", option ? option.value : null)
                  }
                  options={genderOptions}
                  placeholder="Select Gender"
                  styles={customStyles}
                />
              </div>

              {/* Service */}
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Service<span className="text-red-500">*</span>
                </label>
                <Select
                  value={
                    serviceOptions.find((opt) => opt.value === filterService) ||
                    null
                  }
                  onChange={(option) =>
                    setFilterValue(
                      "filterService",
                      option ? option.value : null
                    )
                  }
                  options={serviceOptions}
                  placeholder="Select Service"
                  styles={customStyles}
                />
              </div>

              {/* Service Category */}
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Service Category<span className="text-red-500">*</span>
                </label>
                <Select
                  value={
                    serviceOptions.find((opt) => opt.value === filterServiceCategory) ||
                    null
                  }
                  onChange={(option) =>
                    setFilterValue(
                      "filterServiceCategory",
                      option ? option.value : null
                    )
                  }
                  options={serviceOptions}
                  placeholder="Select Category"
                  styles={customStyles}
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Service Variation<span className="text-red-500">*</span>
                </label>
                <Select
                  value={
                    serviceOptions.find((opt) => opt.value === filterServiceVariation) ||
                    null
                  }
                  onChange={(option) =>
                    setFilterValue(
                      "filterServiceVariation",
                      option ? option.value : null
                    )
                  }
                  options={serviceOptions}
                  placeholder="Select Variation"
                  styles={customStyles}
                />
              </div>

              {/* Lead Source */}
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Lead Source<span className="text-red-500">*</span>
                </label>
                <Select
                  value={
                    leadSourceOptions.find(
                      (opt) => opt.value === filterLeadSource
                    ) || null
                  }
                  onChange={(option) =>
                    setFilterValue(
                      "filterLeadSource",
                      option ? option.value : null
                    )
                  }
                  options={leadSourceOptions}
                  placeholder="Select Lead Source"
                  styles={customStyles}
                />
              </div>

              {/* Membership Expiry */}
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Membership Expiry<span className="text-red-500">*</span>
                </label>
                <div className="custom--date relative">
                  <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                    <LuCalendar />
                  </span>
                  <DatePicker
                    selected={filterExpiryFrom}
                    onChange={(date) => {
                      setFilterValue("filterExpiryFrom", date);
                      if (filterExpiryTo && date && filterExpiryTo < date) {
                        setFilterValue("filterExpiryTo", null);
                      }
                    }}
                    placeholderText="From"
                    className="input--icon"
                    dateFormat="dd/MM/yyyy"
                  />
                </div>
              </div>

              {/* Expiry To */}
              <div>
                <label className="block mb-1 text-sm font-medium opacity-0">
                  Membership Expiry<span className="text-red-500">*</span>
                </label>
                <div className="custom--date relative">
                  <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                    <LuCalendar />
                  </span>
                  <DatePicker
                    selected={filterExpiryTo}
                    onChange={(date) => setFilterValue("filterExpiryTo", date)}
                    placeholderText="To"
                    className="input--icon"
                    dateFormat="dd/MM/yyyy"
                    minDate={filterExpiryFrom || null}
                    disabled={!filterExpiryFrom}
                  />
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={handleApply}
                className="px-4 py-2 bg-black text-white rounded"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Applied Filters Chips */}
      {Object.values(appliedFilters).some((v) => v) && (
        <div className="flex flex-wrap gap-2 mt-4">
          {Object.entries(appliedFilters).map(([key, value]) => {
            if (!value) return null;

            // Choose options for label lookup
            let options;
            if (key === "club") options = clubOptions;
            if (key === "validity") options = validityOptions;
            if (key === "ageGroup") options = ageGroupOptions;
            if (key === "gender") options = genderOptions;
            if (key === "service") options = serviceOptions;
            if (key === "leadSource") options = leadSourceOptions;

            // 🧠 Safely handle Dates and other types
            let displayValue = "";
            if (value instanceof Date) {
              displayValue = value.toLocaleDateString(); // ✅ Convert Date -> readable string
            } else if (options) {
              const matched = options.find((opt) => opt.value === value);
              displayValue = matched ? matched.label : String(value);
            } else {
              displayValue = String(value);
            }

            return (
              <div
                key={key}
                className="flex items-center justify-between gap-1 border rounded-full bg-[#EEEEEE] min-h-[30px] px-3 text-sm"
              >
                <span>{displayValue}</span>
                <IoClose
                  onClick={() => handleRemoveFilter(key)}
                  className="cursor-pointer text-xl"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MemberEmailFilterPanel;
