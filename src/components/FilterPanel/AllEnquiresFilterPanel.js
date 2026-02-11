import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import { IoClose, IoTriangle } from "react-icons/io5";
import { customStyles, filterActiveItems } from "../../Helper/helper";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { authAxios } from "../../config/config";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { fetchOptionList } from "../../Redux/Reducers/optionListSlice";

const callTagOptions = [
  { value: "Warm", label: "Warm" },
  { value: "Hot", label: "Hot" },
  { value: "Cold", label: "Cold" },
];

const genderOptions = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "NOTDISCLOSE", label: "Prefer Not To Say" },
];

const leadStatusOptions = [
  { value: "new", label: "New" },
  { value: "lead", label: "Lead" },
  { value: "opportunity", label: "Opportunity" },
  { value: "won", label: "Won" },
  { value: "closed", label: "Closed" },
  { value: "lost", label: "Lost" },
  { value: "future prospect", label: "Future Prospect" },
];

export default function AllEnquiresFilterPanel({
  filterGender,
  filterEnquiryType,
  filterLeadSource,
  filterLeadStatus,
  filterCallTag,
  filterLeadOwner,
  formik,
  setFilterValue,
  appliedFilters, // ✅ Receive from parent
  setAppliedFilters, // ✅ Receive from parent
  userRole,
  clubId,
}) {
  const [showFilters, setShowFilters] = useState(false);
  const panelRef = useRef(null);
  const [staffList, setStaffList] = useState([]);

  // Fetch staff list from API
  const fetchStaffList = async (clubId) => {
    try {
      const requests = [
        authAxios().get("/staff/list", {
          params: { role: "FOH", club_id: clubId },
        }),
      ];

      if (userRole === "CLUB_MANAGER" || userRole === "ADMIN") {
        requests.push(
          authAxios().get("/staff/list", {
            params: { role: "CLUB_MANAGER", club_id: clubId },
          })
        );
      }

      const responses = await Promise.all(requests);

      let mergedData = [];

      responses.forEach((res) => {
        const role = res.config.params.role;

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
    if (clubId) {
      fetchStaffList(clubId);

      setFilterValue("filterLeadOwner", null);
    }
  }, [clubId]);

  const dispatch = useDispatch();
  const { lists, loading } = useSelector((state) => state.optionList);

  useEffect(() => {
    dispatch(fetchOptionList("LEAD_SOURCE"));
    dispatch(fetchOptionList("LEAD_TYPE"));
  }, [dispatch]);

  const leadSourceOptions = lists["LEAD_SOURCE"] || [];
  const leadTypeOptions = lists["LEAD_TYPE"] || [];
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

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilters]);

  // ✅ Apply button - update parent's appliedFilters
  const handleApply = () => {
    setAppliedFilters({
      gender: formik.values.filterGender,
      lead_type: formik.values.filterEnquiryType,
      lead_status: formik.values.filterLeadStatus,
      lead_source: formik.values.filterLeadSource,
      owner_id: formik.values.filterLeadOwner,
      call_tag: formik.values.filterCallTag,
    });

    setShowFilters(false);
  };

  // ✅ Remove filter chip - update both parent state and formik
  const handleRemoveFilter = (key) => {
    const keyMap = {
      gender: "filterGender",
      lead_type: "filterEnquiryType",
      lead_status: "filterLeadStatus",
      lead_source: "filterLeadSource",
      owner_id: "filterLeadOwner",
      call_tag: "filterCallTag",
    };

    // Update parent's applied filters
    setAppliedFilters((prev) => ({ ...prev, [key]: null }));

    // Update formik
    if (keyMap[key]) {
      setFilterValue(keyMap[key], null);
    }
  };

  // ✅ Get display labels for filter chips
  const getFilterLabel = (key, value) => {
    if (!value) return "";

    if (key === "gender") {
      const billType = genderOptions.find((opt) => opt.value === value);
      return billType ? billType.label : value;
    }
    if (key === "lead_type") {
      const planType = leadTypeOptions.find((opt) => opt.value === value);
      return planType ? planType.label : value;
    }

    if (key === "lead_status") {
      const service = leadStatusOptions.find((opt) => opt.value === value);
      return service ? service.label : value;
    }

    if (key === "lead_source") {
      const leadSource = leadSourceOptions.find((opt) => opt.value === value);
      return leadSource ? leadSource.label : value;
    }

    if (key === "owner_id") {
      const allOwners = leadOwnerOptions.flatMap((group) => group.options);
      const owner = allOwners.find((opt) => opt.value === value);
      return owner ? owner.label : value;
    }

    if (key === "call_tag") {
      const payMode = callTagOptions.find((opt) => opt.value === value);
      return payMode ? payMode.label : value;
    }

    return String(value);
  };

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
              <div>
                <label className="block mb-1 text-sm font-medium">Gender</label>
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

              <div>
                <label className="block mb-1 text-sm font-medium">
                  Enquiry Type
                </label>
                <Select
                  value={
                    leadTypeOptions.find(
                      (opt) => opt.value === filterEnquiryType
                    ) || null
                  }
                  onChange={(option) =>
                    setFilterValue(
                      "filterEnquiryType",
                      option ? option.value : null
                    )
                  }
                  options={leadTypeOptions}
                  placeholder="Select Enquiry Type"
                  styles={customStyles}
                  // isClearable
                />
              </div>

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
                  // isClearable
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">
                  Lead Status
                </label>
                <Select
                  options={leadStatusOptions}
                  value={
                    leadStatusOptions.find(
                      (opt) => opt.value === filterLeadStatus
                    ) || null
                  }
                  onChange={(option) =>
                    setFilterValue(
                      "filterLeadStatus",
                      option ? option.value : null
                    )
                  }
                  placeholder="Select Lead Status"
                  styles={customStyles}
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">
                  Call Tag
                </label>
                <Select
                  value={
                    callTagOptions.find((opt) => opt.value === filterCallTag) ||
                    null
                  }
                  onChange={(option) =>
                    setFilterValue(
                      "filterCallTag",
                      option ? option.value : null
                    )
                  }
                  options={callTagOptions}
                  placeholder="Select Pay Mode"
                  styles={customStyles}
                  // isClearable
                />
              </div>

              {userRole === "FOH" ? null : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lead Owner
                  </label>
                  <Select
                    value={
                      leadOwnerOptions
                        .flatMap((group) => group.options)
                        .find((opt) => opt.value === filterLeadOwner) || null
                    }
                    onChange={(option) =>
                      setFilterValue(
                        "filterLeadOwner",
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
            </div>

            <div className="flex justify-between pt-3">
              <button
                onClick={handleApply}
                className="px-4 py-2 bg-black text-white rounded flex items-center gap-2 cursor-pointer ml-auto"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Applied Filters Chips - using parent's appliedFilters */}
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
