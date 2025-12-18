import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { IoClose, IoTriangle } from "react-icons/io5";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { authAxios } from "../../config/config";
import { fetchOptionList } from "../../Redux/Reducers/optionListSlice";
import { customStyles } from "../../Helper/helper";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function LeadFilterPanel({
  selectedLeadSource,
  setSelectedLeadSource,
  selectedLastCallType,
  selectedLeadStatus,
  setSelectedLeadStatus,
  selectedCallTag,
  setSelectedCallTag,
  setSelectedLastCallType,
  selectedGender,
  setSelectedGender,
  selectedServiceName,
  setSelectedServiceName,
  onApplyFilters,
  onRemoveFilter,
}) {
  const [searchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const panelRef = useRef(null);
  const [staffList, setStaffList] = useState([]);
  const navigate = useNavigate();

  // Only update appliedFilters when user clicks Apply
  const [appliedFilters, setAppliedFilters] = useState({});

  const fetchStaff = async (search = "") => {
    try {
      const res = await authAxios().get("/staff/list", {
        params: search ? { search } : {},
      });
      const data = res.data?.data || [];
      const activeStaff = data.filter((item) => item.status === "ACTIVE");
      setStaffList(activeStaff);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch staff");
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const dispatch = useDispatch();
  const { lists, loading } = useSelector((state) => state.optionList);

  // Fetch dropdown options from Redux
  useEffect(() => {
    dispatch(fetchOptionList("LEAD_SOURCE"));
    dispatch(fetchOptionList("LEAD_CALL_STATUS"));
    dispatch(fetchOptionList("GOAL"));
  }, [dispatch]);

  const leadsSources = lists["LEAD_SOURCE"] || [];
  const lastCallStatusOptions = lists["LEAD_CALL_STATUS"] || [];
  const leadServiceOptions = lists["GOAL"] || [];
  const leadOwnerOptions =
    staffList.map((item) => ({ label: item.name, value: item.id })) || [];
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

  // Handle Apply click
  const handleSubmitFilters = () => {
    setAppliedFilters({
      leadSource: selectedLeadSource,
      lastCallType: selectedLastCallType,
      leadStatus: selectedLeadStatus,
      callTag: selectedCallTag,
      gender: selectedGender,
      serviceName: selectedServiceName,
    });

    setShowFilters(false);
    if (onApplyFilters) onApplyFilters();
    navigate(`/all-leads`);
  };

  // Handle remove filter chip
  const removeFilter = (filterKey) => {
    const setterMap = {
      leadSource: setSelectedLeadSource,
      lastCallType: setSelectedLastCallType,
      leadStatus: setSelectedLeadStatus,
      callTag: setSelectedCallTag,
      gender: setSelectedGender,
      serviceName: setSelectedServiceName,
    };

    // Clear parent state
    setterMap[filterKey]?.(null);

    // Remove from appliedFilters for UI
    setAppliedFilters((prev) => ({ ...prev, [filterKey]: null }));

    // Call parent API for updated data
    if (onRemoveFilter) onRemoveFilter(filterKey);
    // else if (onApplyFilters) onApplyFilters(); // fallback
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

  useEffect(() => {
    const urlLeadStatus = searchParams.get("leadStatus");

    const initialFilters = {};

    if (urlLeadStatus) {
      initialFilters.leadStatus = {
        label: urlLeadStatus,
        value: urlLeadStatus,
      };
      setSelectedLeadStatus({ label: urlLeadStatus, value: urlLeadStatus });
    }

    // Add other filters if needed (e.g., leadSource, dateFilter)

    setAppliedFilters(initialFilters);
  }, []);

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
                  value={selectedLeadSource}
                  onChange={setSelectedLeadSource}
                  options={leadsSources}
                  placeholder="Select Lead Source"
                  styles={customStyles}
                />
              </div>

              {/* Lead Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lead Status
                </label>
                <Select
                  value={selectedLeadStatus}
                  onChange={setSelectedLeadStatus}
                  options={leadStatusOptions}
                  placeholder="Select Lead Status"
                  styles={customStyles}
                />
              </div>

              {/* Last Call Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Call Status
                </label>
                <Select
                  value={selectedLastCallType}
                  onChange={setSelectedLastCallType}
                  options={lastCallStatusOptions}
                  placeholder="Select Last Call Type"
                  styles={customStyles}
                />
              </div>

              {/* Lead Owner */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lead Owner
                </label>
                <Select
                  value={selectedCallTag}
                  onChange={setSelectedCallTag}
                  options={leadOwnerOptions}
                  placeholder="Select Lead Owner"
                  styles={customStyles}
                />
              </div>

              {/* Service Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interested In
                </label>
                <Select
                  value={selectedServiceName}
                  onChange={setSelectedServiceName}
                  options={leadServiceOptions}
                  placeholder="Select Interested"
                  styles={customStyles}
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <Select
                  value={selectedGender}
                  onChange={setSelectedGender}
                  options={genderOptions}
                  placeholder="Select Gender"
                  styles={customStyles}
                />
              </div>
            </div>

            {/* Apply Button */}
            <div className="flex justify-end pt-3">
              <button
                onClick={handleSubmitFilters}
                className="px-4 py-2 bg-black text-white rounded flex items-center gap-2 cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Applied Filter Chips */}
      {Object.values(appliedFilters).some((value) => value) && (
        <div className="flex gap-2 mt-4">
          {Object.entries(appliedFilters).map(([key, value]) => {
            if (!value) return null;
            return (
              <div
                key={key}
                className="flex items-center justify-between gap-1 border rounded-full bg-[#EEEEEE] min-h-[30px] px-3 text-sm"
              >
                <span>{value.label || value}</span>
                <IoClose
                  onClick={() => removeFilter(key)}
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
