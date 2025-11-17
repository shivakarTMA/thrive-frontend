import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { FaFilter } from "react-icons/fa";
import { RiResetLeftFill } from "react-icons/ri";
import { IoClose, IoTriangle } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { fetchOptionList } from "../../Redux/Reducers/optionListSlice";
import { customStyles } from "../../Helper/helper";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { apiAxios } from "../../config/config";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const memberStatus = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

const ageGroupOptions = [
  { value: "15-20", label: "15-20" },
  { value: "21-30", label: "21-30" },
  { value: "31-40", label: "31-40" },
  { value: "41-50", label: "41-50" },
  { value: "51+", label: "51+" },
  { value: "Not Mentioned", label: "Not Mentioned" },
];

export default function MemberFilterPanel({
  filterStatus,
  setFilterStatus,
  filterService,
  setFilterService,
  filterServiceVariation,
  setFilterServiceVariation,
  filterAgeGroup,
  setFilterAgeGroup,
  filterLeadSource,
  setFilterLeadSource,
  filterLeadOwner,
  setFilterLeadOwner,
  filterTrainer,
  setFilterTrainer,
  filterFitness,
  setFilterFitness,
  filterGender,
  setFilterGender,
  onApplyFilters,
  onRemoveFilter,
}) {
  const [showFilters, setShowFilters] = useState(false);
  const panelRef = useRef(null);
  const [staffList, setStaffList] = useState([]);
  const navigate = useNavigate();

  const [appliedFilters, setAppliedFilters] = useState({});

  const fetchStaff = async (search = "") => {
    try {
      const res = await apiAxios().get("/staff/list", {
        params: search ? { search } : {},
      });
      let data = res.data?.data || res?.data || [];
      const activeService = data?.filter((item) => item?.status === "ACTIVE");
      setStaffList(activeService);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch club");
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Redux state
  const dispatch = useDispatch();
  const { lists, loading } = useSelector((state) => state.optionList);

  // Fetch option lists
  useEffect(() => {
    dispatch(fetchOptionList("LEAD_SOURCE"));
    dispatch(fetchOptionList("INTERESTED_IN"));
  }, [dispatch]);

  // Extract Redux lists
  const leadsSources = lists["LEAD_SOURCE"] || [];
  const leadServiceOptions = lists["INTERESTED_IN"] || [];
  const leadOwnerOptions =
    staffList?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];
  const genderOptions = [
    { value: "MALE", label: "Male" },
    { value: "FEMALE", label: "Female" },
    { value: "NOTDISCLOSE", label: "Not to Disclose" },
  ];

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

  const leadStatusOptions = [
    { value: "new", label: "New" },
    { value: "lead", label: "Lead" },
    { value: "opportunity", label: "Opportunity" },
    { value: "won", label: "Won" },
    { value: "closed", label: "Closed" },
    { value: "lost", label: "Lost" },
    { value: "future prospect", label: "Future Prospect" },
  ];

  // Handle Submit (apply filters)
  const handleSubmitFilters = () => {
    setAppliedFilters({
      status: filterStatus,
      serviceName: filterService,
      service_variation: filterServiceVariation,
      ageGroup: filterAgeGroup,
      leadSource: filterLeadSource,
      created_by: filterLeadOwner,
      staff: filterTrainer,
      fitness: filterFitness,
      gender: filterGender,
    });
    setShowFilters(false);

    setShowFilters(false);
    if (onApplyFilters) onApplyFilters();
    navigate(`/all-members/`);
  };


  // Handle remove filter chip
 const removeFilter = (filterKey) => {
  const setterMap = {
    status: setFilterStatus,
    serviceName: setFilterService,
    service_variation: setFilterServiceVariation,
    ageGroup: setFilterAgeGroup,
    leadSource: setFilterLeadSource,
    created_by: setFilterLeadOwner,
    staff: setFilterTrainer,
    fitness: setFilterFitness,
    gender: setFilterGender,
  };

  // Clear UI state
  setterMap[filterKey]?.(null);

  // Remove from appliedFilters
  setAppliedFilters((prev) => ({ ...prev, [filterKey]: null }));

  // Trigger parent to refetch API
  if (onRemoveFilter) onRemoveFilter(filterKey);
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
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Member Status
                </label>
                <Select
                  value={filterStatus}
                  onChange={setFilterStatus}
                  options={memberStatus}
                  // isClearable
                  placeholder="Select Status"
                  styles={customStyles}
                />
              </div>
              {/* Service */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Name
                </label>
                <Select
                  value={filterService}
                  onChange={setFilterService}
                  options={leadServiceOptions}
                  // isClearable
                  placeholder="Select Service"
                  styles={customStyles}
                />
              </div>
              {/* Service Variations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Variations
                </label>
                <Select
                  value={filterServiceVariation}
                  onChange={setFilterServiceVariation}
                  options={leadStatusOptions}
                  // isClearable
                  placeholder="Select Service Variations"
                  styles={customStyles}
                />
              </div>
              {/* Age Group */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age Group
                </label>
                <Select
                  value={filterAgeGroup}
                  onChange={setFilterAgeGroup}
                  options={ageGroupOptions}
                  // isClearable
                  placeholder="Select Age Group"
                  styles={customStyles}
                />
              </div>
              {/* Lead Source */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lead Source
                </label>
                <Select
                  value={filterLeadSource}
                  onChange={setFilterLeadSource}
                  options={leadsSources}
                  // isClearable
                  placeholder="Select Lead Source"
                  styles={customStyles}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lead Owner
                </label>
                <Select
                  value={filterLeadOwner}
                  onChange={setFilterLeadOwner}
                  options={leadOwnerOptions}
                  // isClearable
                  placeholder="Select Lead Owner"
                  styles={customStyles}
                />
              </div>

              {/* Trainer Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trainer Name
                </label>
                <Select
                  value={filterTrainer}
                  onChange={setFilterTrainer}
                  options={leadOwnerOptions}
                  // isClearable
                  placeholder="Select Trainer Name"
                  styles={customStyles}
                />
              </div>
              {/* Fitness Goal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fitness Goal
                </label>
                <Select
                  value={filterFitness}
                  onChange={setFilterFitness}
                  options={leadOwnerOptions}
                  // isClearable
                  placeholder="Select Fitness Goal"
                  styles={customStyles}
                />
              </div>
              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <Select
                  value={filterGender}
                  onChange={setFilterGender}
                  options={genderOptions}
                  // isClearable
                  placeholder="Select Gender"
                  styles={customStyles}
                />
              </div>
            </div>

            {/* Reset */}
            <div className="flex justify-between pt-3">
              <button
                onClick={handleSubmitFilters}
                className="px-4 py-2 bg-black text-white rounded flex items-center gap-2 cursor-pointer ml-auto"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

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
