import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { IoClose, IoTriangle } from "react-icons/io5";
import DatePicker from "react-datepicker";
import { customStyles, filterActiveItems } from "../../Helper/helper";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { LuCalendar } from "react-icons/lu";
import { authAxios } from "../../config/config";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { fetchOptionList } from "../../Redux/Reducers/optionListSlice";

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
  { value: "NOTDISCLOSE", label: "Prefer Not To Say" },
];

const validityMemberOptions = [
  { value: "All Members", label: "All Members" },
  { value: "Active Members", label: "Active Members" },
  { value: "Inactive Members", label: "Inactive Members" },
];
const validityEnquireOptions = [
  { value: "All Enquiries", label: "All Enquiries" },
  { value: "Open Enquiries", label: "Open Enquiries" },
  { value: "Lost Enquiries", label: "Lost Enquiries" },
];

const NotificationFilterPanel = ({
  // ✅ Formik field values (each one is just a string or null)
  formik,
  filterClub,
  filterMemberValidity,
  filterLeadValidity,
  filterAgeGroup,
  filterGender,
  filterLeadSource,
  filterServiceType,
  filterServiceName,
  filterExpiryFrom,
  filterExpiryTo,
  // ✅ Callback to update Formik values
  setFilterValue,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const panelRef = useRef(null);

  const [serviceList, setServiceList] = useState([]);
  const [servicesType, setServicesType] = useState([]);

  const [clubList, setClubList] = useState([]);

  const fetchService = async () => {
    try {
      const res = await authAxios().get("/service/list");
      let data = res.data?.data || res?.data || [];
      const activeOnly = filterActiveItems(data);
      setServiceList(activeOnly);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch club");
    }
  };

  const fetchServiceNames = async (serviceId) => {
    try {
      const res = await authAxios().get(
        `/package/list?page=1&limit=10&service_id=${serviceId}`
      );

      const data = res.data?.data || [];

      const activeOnly = filterActiveItems(data);

      const options = activeOnly.map((item) => ({
        label: item.name,
        value: item.id,
      }));

      setServicesType(options);
    } catch (error) {
      toast.error("Failed to fetch service names");
    }
  };

  // Function to fetch club list
  const fetchClub = async () => {
    try {
      const response = await authAxios().get("/club/list");
      const data = response.data?.data || [];
      const activeOnly = filterActiveItems(data);
      setClubList(activeOnly);
    } catch (error) {
      toast.error("Failed to fetch clubs");
    }
  };

  // Redux state
  const dispatch = useDispatch();
  const { lists, loading } = useSelector((state) => state.optionList);

  // Fetch option lists
  useEffect(() => {
    dispatch(fetchOptionList("LEAD_SOURCE"));
  }, [dispatch]);

  const leadSourceOptions = lists["LEAD_SOURCE"] || [];

  const serviceOptions = serviceList
    ?.map((item) => ({
      label: item.name,
      value: item.id,
      type: item.type,
    }))
    .filter((item) => item.type !== "PRODUCT");

  // Club dropdown options
  const clubOptions =
    clubList?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];

  useEffect(() => {
    fetchService();
    fetchClub();
  }, []);

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
      club_id: filterClub,
      member_validity: filterMemberValidity,
      lead_validity: filterLeadValidity,
      ageGroup: filterAgeGroup,
      gender: filterGender,
      leadSource: filterLeadSource,
      service_type: filterServiceType,
      service_name: filterServiceName,
      expiry_from: filterExpiryFrom,
      expiry_to: filterExpiryTo,
    };

    console.log(newFilters, "newFilters");

    setAppliedFilters(newFilters);

    // 🔑 Mark fields as touched so Formik validates
    Object.keys(newFilters).forEach((key) => {
      const formikKey = {
        club_id: "filterClub",
        member_validity: "filterMemberValidity",
        lead_validity: "filterLeadValidity",
        ageGroup: "filterAgeGroup",
        gender: "filterGender",
        leadSource: "filterLeadSource",
        service_type: "filterServiceType",
        service_name: "filterServiceName",
        expiry_from: "filterExpiryFrom",
        expiry_to: "filterExpiryTo",
      }[key];

      if (formikKey) {
        formik.setFieldTouched(formikKey, true);
      }
    });

    setShowFilters(false);
  };

  // ✅ Remove specific filter chip
  const handleRemoveFilter = (key) => {
    const keyMap = {
      club_id: "filterClub",
      member_validity: "filterMemberValidity",
      lead_validity: "filterLeadValidity",
      ageGroup: "filterAgeGroup",
      gender: "filterGender",
      leadSource: "filterLeadSource",
      service_type: "filterServiceType",
      service_name: "filterServiceName",
      expiry_from: "filterExpiryFrom",
      expiry_to: "filterExpiryTo",
    };

    setAppliedFilters((prev) => ({ ...prev, [key]: null }));

    if (keyMap[key]) {
      setFilterValue(keyMap[key], null);
      formik.setFieldTouched(keyMap[key], false);
    }
  };

  // ✅ Utility to get readable text for the chips
  const getDisplayValue = (value, options) => {
    if (!value) return "";
    const match = options?.find((opt) => opt.value === value);
    return match ? match.label : value;
  };

  useEffect(() => {
    if (!filterServiceType) {
      setServicesType([]);
      setFilterValue("filterServiceName", null);
    }
  }, [filterServiceType]);

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
                <label className="block mb-1 text-sm font-medium">
                  Club<span className="text-red-500">*</span>
                </label>
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

              {/* Member Validity */}
              {formik?.values?.module === "Member" && (
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Validity<span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={
                      validityMemberOptions.find(
                        (opt) => opt.value === filterMemberValidity
                      ) || null
                    }
                    onChange={(option) =>
                      setFilterValue(
                        "filterMemberValidity",
                        option ? option.value : null
                      )
                    }
                    options={validityMemberOptions}
                    placeholder="Select Validity"
                    styles={customStyles}
                  />
                </div>
              )}
              {/* Enquires Validity */}
              {formik?.values?.module === "Enquiries" && (
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Validity<span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={
                      validityEnquireOptions.find(
                        (opt) => opt.value === filterLeadValidity
                      ) || null
                    }
                    onChange={(option) =>
                      setFilterValue(
                        "filterLeadValidity",
                        option ? option.value : null
                      )
                    }
                    options={validityEnquireOptions}
                    placeholder="Select Validity"
                    styles={customStyles}
                  />
                </div>
              )}

              {/* Age Group */}
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Age Group
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
                <label className="block mb-1 text-sm font-medium">
                  Gender
                </label>
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

              {/* Lead Source */}
              {formik?.values?.module === "Enquiries" && (
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Lead Source
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
              )}

              {formik?.values?.module === "Member" && (
                <>
                  {/* Service */}
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Service Type
                    </label>
                    <Select
                      value={
                        serviceOptions.find(
                          (opt) => opt.value === filterServiceType
                        ) || null
                      }
                      onChange={(option) => {
                        const serviceId = option ? option.value : null;

                        // ✅ UPDATE FORMIK
                        setFilterValue("filterServiceType", serviceId);
                        setFilterValue("filterServiceName", null); // reset dependent field

                        if (serviceId) {
                          fetchServiceNames(serviceId);
                        } else {
                          setServicesType([]);
                        }
                      }}
                      onBlur={() =>
                        setFilterValue("filterServiceType", filterServiceType)
                      }
                      options={serviceOptions}
                      placeholder="Select Service"
                      styles={customStyles}
                    />
                  </div>

                  {/* Service Name */}
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Service Name
                    </label>
                    <Select
                      value={
                        servicesType.find(
                          (opt) => opt.value === filterServiceName
                        ) || null
                      }
                      onChange={(option) =>
                        setFilterValue(
                          "filterServiceName",
                          option ? option.value : null
                        )
                      }
                      onBlur={() =>
                        setFilterValue("filterServiceName", filterServiceName)
                      }
                      options={servicesType}
                      placeholder="Select Category"
                      styles={customStyles}
                      isDisabled={!filterServiceType}
                    />
                  </div>

                  {/* Membership Expiry */}
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Membership Expiry
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
                      Membership Expiry
                    </label>
                    <div className="custom--date relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <LuCalendar />
                      </span>
                      <DatePicker
                        selected={filterExpiryTo}
                        onChange={(date) =>
                          setFilterValue("filterExpiryTo", date)
                        }
                        placeholderText="To"
                        className="input--icon"
                        dateFormat="dd/MM/yyyy"
                        minDate={filterExpiryFrom || null}
                        disabled={!filterExpiryFrom}
                      />
                    </div>
                  </div>
                </>
              )}
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
            if (key === "club_id") options = clubOptions;
            if (key === "member_validity") options = validityMemberOptions;
            if (key === "lead_validity") options = validityEnquireOptions;
            if (key === "ageGroup") options = ageGroupOptions;
            if (key === "gender") options = genderOptions;
            if (key === "leadSource") options = leadSourceOptions;
            if (key === "service_type") options = serviceOptions;
            if (key === "service_name") options = servicesType;

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

export default NotificationFilterPanel;
