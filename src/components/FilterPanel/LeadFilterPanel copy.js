import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { IoClose, IoTriangle } from "react-icons/io5";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { authAxios } from "../../config/config";
import { fetchOptionList } from "../../Redux/Reducers/optionListSlice";
import { customStyles, filterActiveItems } from "../../Helper/helper";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function LeadFilterPanel({
  selectedClub,
  setSelectedClub,
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
  userRole,
}) {
  const [searchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const panelRef = useRef(null);
  const [staffList, setStaffList] = useState([]);
  const [clubList, setClubList] = useState([]);
  const navigate = useNavigate();

  // Only update appliedFilters when user clicks Apply
  const [appliedFilters, setAppliedFilters] = useState({});

  // const fetchStaff = async () => {
  //   try {
  //     const res = await authAxios().get("/staff/list?role=FOH");
  //     const data = res.data?.data || [];
  //     const activeStaff = data.filter((item) => item.status === "ACTIVE");
  //     setStaffList(activeStaff);
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Failed to fetch staff");
  //   }
  // };

  // 🚀 Fetch staff list from API
  const fetchStaff = async () => {
    try {
      const requests = [authAxios().get("/staff/list?role=FOH")];

      if (userRole === "CLUB_MANAGER" || userRole === "ADMIN") {
        requests.push(authAxios().get("/staff/list?role=CLUB_MANAGER"));
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

  useEffect(() => {
    fetchStaff();
    fetchClub();
  }, []);

  // Club dropdown options
  const clubOptions =
    clubList?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];

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
  // const leadOwnerOptions =
  //   staffList.map((item) => ({ label: item.name, value: item.id })) || [];

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
  ].filter((group) => group.options.length > 0); // remove empty groups

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

  // Handle Apply click
  const handleSubmitFilters = () => {
    setAppliedFilters({
      club_id: selectedClub,
      lead_source: selectedLeadSource,
      last_call_status: selectedLastCallType,
      lead_status: selectedLeadStatus,
      created_by: selectedCallTag,
      gender: selectedGender,
      interested_in: selectedServiceName,
    });

    setShowFilters(false);
    if (onApplyFilters) onApplyFilters();
    navigate(`/all-leads`);
  };

  console.log("appliedFilters", appliedFilters);

  // Handle remove filter chip
  const removeFilter = (filterKey) => {
    const setterMap = {
      club_id: setSelectedClub,
      lead_source: setSelectedLeadSource,
      last_call_status: setSelectedLastCallType,
      lead_status: setSelectedLeadStatus,
      created_by: setSelectedCallTag,
      gender: setSelectedGender,
      interested_in: setSelectedServiceName,
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
    const urlLeadStatus = searchParams.get("lead_status");
    const urlLastCallType = searchParams.get("last_call_status");

    const initialFilters = {};

    if (urlLeadStatus) {
      const decodedStatus = decodeURIComponent(urlLeadStatus);
      initialFilters.lead_status = {
        label: decodedStatus,
        value: decodedStatus,
      };
      setSelectedLeadStatus({ label: decodedStatus, value: decodedStatus });
    }

    if (urlLastCallType) {
      const decodedLastCall = decodeURIComponent(urlLastCallType);
      initialFilters.last_call_status = {
        label: decodedLastCall,
        value: decodedLastCall,
      };
      setSelectedLastCallType({
        label: decodedLastCall,
        value: decodedLastCall,
      });
    }

    // Add other filters if needed (e.g., lead_source, dateFilter)

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
              {/* Club */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Club
                </label>
                <Select
                  value={selectedClub}
                  onChange={setSelectedClub}
                  options={clubOptions}
                  placeholder="Select Club"
                  styles={customStyles}
                />
              </div>
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
                  options={lead_statusOptions}
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
