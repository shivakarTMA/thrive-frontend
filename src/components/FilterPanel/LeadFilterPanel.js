import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { IoClose, IoTriangle } from "react-icons/io5";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { authAxios } from "../../config/config";
import { fetchOptionList } from "../../Redux/Reducers/optionListSlice";
import { customStyles, filterActiveItems } from "../../Helper/helper";

export default function LeadFilterPanel({
  formik,
  filterLeadSource,
  filterLeadStatus,
  filterLastCallType,
  filterLeadType,
  filterCallTag,
  filterServiceName,
  filterGender,
  setFilterValue,
  appliedFilters,
  setAppliedFilters,
  userRole,
  clubId,
}) {
  const [showFilters, setShowFilters] = useState(false);
  const panelRef = useRef(null);
  const [staffList, setStaffList] = useState([]);
  console.log(clubId,'SELECTED CLUB')

  const dispatch = useDispatch();
  const { lists, loading } = useSelector((state) => state.optionList);

  // Fetch dropdown options from Redux
  useEffect(() => {
    dispatch(fetchOptionList("LEAD_SOURCE"));
    dispatch(fetchOptionList("LEAD_CALL_STATUS"));
    dispatch(fetchOptionList("LEAD_TYPE"));
    dispatch(fetchOptionList("GOAL"));
  }, [dispatch]);

  // Fetch staff list from API
  const fetchStaff = async () => {
    try {
      const requests = [authAxios().get(`/staff/list?role=FOH&club_id${clubId}`)];

      if (userRole === "CLUB_MANAGER" || userRole === "ADMIN") {
        requests.push(authAxios().get(`/staff/list?role=CLUB_MANAGER&club_id${clubId}`));
      }

      const responses = await Promise.all(requests);

      let mergedData = [];

      responses.forEach((res) => {
        const role = res.config.url.includes("FOH") ? "FOH" : "CLUB_MANAGER";

        const users = (res.data?.data || []).map((user) => ({
          ...user,
          role,
        }));

        mergedData.push(...users);
      });

      const uniqueData = Array.from(
        new Map(mergedData.map((user) => [user.id, user])).values()
      );

      const activeOnly = filterActiveItems(uniqueData);
      setStaffList(activeOnly);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch staff");
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const leadsSources = lists["LEAD_SOURCE"] || [];
  const lastCallStatusOptions = lists["LEAD_CALL_STATUS"] || [];
  const leadServiceOptions = lists["GOAL"] || [];
  const lead_typeOptions = lists["LEAD_TYPE"] || [];

  const leadOwnerOptions = [
    {
      label: "FOH",
      options: staffList
        .filter((user) => user.role === "FOH")
        .map((user) => ({
          value: user.id,
          label: user.name,
        })),
    },
    {
      label: "CLUB MANAGER",
      options: staffList
        .filter((user) => user.role === "CLUB_MANAGER")
        .map((user) => ({
          value: user.id,
          label: user.name,
        })),
    },
  ].filter((group) => group.options.length > 0);

  const genderOptions = [
    { value: "MALE", label: "Male" },
    { value: "FEMALE", label: "Female" },
    { value: "NOTDISCLOSE", label: "Prefer Not To Say" },
  ];

  const lead_statusOptions = [
    { value: "new", label: "New" },
    { value: "lead", label: "Lead" },
    { value: "opportunity", label: "Opportunity" },
    { value: "won", label: "Won" },
    { value: "closed", label: "Closed" },
    { value: "lost", label: "Lost" },
    { value: "future prospect", label: "Future Prospect" },
  ];

  // Apply button - update parent's appliedFilters
  const handleApply = () => {
    setAppliedFilters({
      ...appliedFilters,
      lead_source: formik.values.filterLeadSource,
      lead_status: formik.values.filterLeadStatus,
      lead_type: formik.values.filterLeadType,
      last_call_status: formik.values.filterLastCallType,
      lead_owner: formik.values.filterCallTag,
      interested_in: formik.values.filterServiceName,
      gender: formik.values.filterGender,
    });

    setShowFilters(false);
  };

  // Remove filter chip - update both parent state and formik
  const handleRemoveFilter = (key) => {
    const keyMap = {
      lead_source: "filterLeadSource",
      lead_status: "filterLeadStatus",
      lead_type: "filterLeadType",
      last_call_status: "filterLastCallType",
      lead_owner: "filterCallTag",
      interested_in: "filterServiceName",
      gender: "filterGender",
    };

    // Update parent's applied filters
    setAppliedFilters((prev) => ({ ...prev, [key]: null }));

    // Update formik
    if (keyMap[key]) {
      setFilterValue(keyMap[key], null);
    }
  };

  // Get display labels for filter chips
  const getFilterLabel = (key, value) => {
    if (!value) return "";

    if (key === "lead_source") {
      const source = leadsSources.find((opt) => opt.value === value);
      return source ? source.label : value;
    }

    if (key === "lead_status") {
      const status = lead_statusOptions.find((opt) => opt.value === value);
      return status ? status.label : value;
    }

    if (key === "lead_type") {
      const type = lead_typeOptions.find((opt) => opt.value === value);
      return type ? type.label : value;
    }

    if (key === "last_call_status") {
      const callStatus = lastCallStatusOptions.find(
        (opt) => opt.value === value
      );
      return callStatus ? callStatus.label : value;
    }

    if (key === "lead_owner") {
      // Flatten grouped options
      const allOwners = leadOwnerOptions.flatMap((group) => group.options);
      const owner = allOwners.find((opt) => opt.value === value);
      return owner ? owner.label : value;
    }

    if (key === "interested_in") {
      const service = leadServiceOptions.find((opt) => opt.value === value);
      return service ? service.label : value;
    }

    if (key === "gender") {
      const gender = genderOptions.find((opt) => opt.value === value);
      return gender ? gender.label : value;
    }

    return String(value);
  };

  // Close filter panel if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    }

    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilters]);

  return (
    <div className="relative max-w-fit w-full" ref={panelRef}>
      <div className="flex gap-2 items-center">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-[34px] h-[30px] bg-white text-black rounded-[5px] flex items-center justify-center gap-2 min-h-[30px] border-[#D4D4D4] border-[2px]"
        >
          <HiOutlineAdjustmentsHorizontal className="text-lg" />
        </button>
        <span className="text-md">Filters</span>
      </div>

      {showFilters && (
        <div className="absolute top-[100%] mt-4 z-[333] bg-white border rounded-lg shadow-md animate-fade-in">
          <div className="absolute top-[-15px] left-[20px]">
            <IoTriangle />
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4 min-w-[500px]">
              {/* Lead Source */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lead Source
                </label>
                <Select
                  value={
                    leadsSources.find(
                      (opt) => opt.value === filterLeadSource
                    ) || null
                  }
                  onChange={(option) =>
                    setFilterValue(
                      "filterLeadSource",
                      option ? option.value : null
                    )
                  }
                  options={leadsSources}
                  placeholder="Select Lead Source"
                  styles={customStyles}
                  // isClearable
                />
              </div>

              {/* Lead Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lead Type
                </label>
                <Select
                  value={
                    lead_typeOptions.find(
                      (opt) => opt.value === filterLeadType
                    ) || null
                  }
                  onChange={(option) =>
                    setFilterValue(
                      "filterLeadType",
                      option ? option.value : null
                    )
                  }
                  options={lead_typeOptions}
                  placeholder="Select Lead Type"
                  styles={customStyles}
                  // isClearable
                />
              </div>
              {/* Lead Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lead Status
                </label>
                <Select
                  value={
                    lead_statusOptions.find(
                      (opt) => opt.value === filterLeadStatus
                    ) || null
                  }
                  onChange={(option) =>
                    setFilterValue(
                      "filterLeadStatus",
                      option ? option.value : null
                    )
                  }
                  options={lead_statusOptions}
                  placeholder="Select Lead Status"
                  styles={customStyles}
                  // isClearable
                />
              </div>

              {/* Last Call Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Call Status
                </label>
                <Select
                  value={
                    lastCallStatusOptions.find(
                      (opt) => opt.value === filterLastCallType
                    ) || null
                  }
                  onChange={(option) =>
                    setFilterValue(
                      "filterLastCallType",
                      option ? option.value : null
                    )
                  }
                  options={lastCallStatusOptions}
                  placeholder="Select Last Call Type"
                  styles={customStyles}
                  // isClearable
                />
              </div>

              {/* Lead Owner */}
              {userRole === "FOH" ? null : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lead Owner
                  </label>
                  <Select
                    value={
                      leadOwnerOptions
                        .flatMap((group) => group.options)
                        .find((opt) => opt.value === filterCallTag) || null
                    }
                    onChange={(option) =>
                      setFilterValue(
                        "filterCallTag",
                        option ? option.value : null
                      )
                    }
                    options={leadOwnerOptions}
                    placeholder="Select Lead Owner"
                    styles={customStyles}
                    // isClearable
                  />
                </div>
              )}

              {/* Service Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interested In
                </label>
                <Select
                  value={
                    leadServiceOptions.find(
                      (opt) => opt.value === filterServiceName
                    ) || null
                  }
                  onChange={(option) =>
                    setFilterValue(
                      "filterServiceName",
                      option ? option.value : null
                    )
                  }
                  options={leadServiceOptions}
                  placeholder="Select Interested"
                  styles={customStyles}
                  // isClearable
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  // isClearable
                />
              </div>
            </div>

            {/* Apply Button */}
            <div className="flex justify-end pt-3">
              <button
                onClick={handleApply}
                className="px-4 py-2 bg-black text-white rounded flex items-center gap-2 cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Chips */}
      {Object.values(appliedFilters).some((v) => v) && (
        <div className="flex flex-wrap gap-2 mt-4">
          {Object.entries(appliedFilters).map(([key, value]) => {
            if (!value || key === "club_id") return null;

            const displayValue = getFilterLabel(key, value);

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
}
