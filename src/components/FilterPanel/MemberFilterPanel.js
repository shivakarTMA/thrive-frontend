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

const genderOptions = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "NOTDISCLOSE", label: "Not to Disclose" },
];

export default function MemberFilterPanel({
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
}) {
  const [showFilters, setShowFilters] = useState(false);
  const panelRef = useRef(null);
  const [staffList, setStaffList] = useState([]);

  const [appliedFilters, setAppliedFilters] = useState({
    serviceName: filterService,
    service_variation: filterServiceVariation,
    ageGroup: filterAgeGroup,
    leadSource: filterLeadSource,
    created_by: filterLeadOwner,
    staff: filterTrainer,
    fitness: filterFitness,
    gender: filterGender,
  });

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

  const lastCallStatusOptions = [
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
  };

  const removeFilter = (filter) => {
    if (filter === "serviceName") {
      setFilterService(null); // Reset filterService state
      setAppliedFilters((prev) => ({ ...prev, serviceName: null })); // Update appliedFilters
    } else if (filter === "service_variation") {
      setFilterServiceVariation(null); // Reset filterServiceVariation state
      setAppliedFilters((prev) => ({ ...prev, service_variation: null })); // Update appliedFilters
    } else if (filter === "filterAgeGroup") {
      setFilterAgeGroup(null); // Reset filterAgeGroup state
      setAppliedFilters((prev) => ({ ...prev, ageGroup: null })); // Update appliedFilters
    } else if (filter === "filterLeadSource") {
      setFilterLeadSource(null); // Reset filterLeadSource state
      setAppliedFilters((prev) => ({ ...prev, leadSource: null })); // Update appliedFilters
    } else if (filter === "filterLeadOwner") {
      setFilterLeadOwner(null); // Reset filterLeadOwner state
      setAppliedFilters((prev) => ({ ...prev, created_by: null })); // Update appliedFilters
    } else if (filter === "filterTrainer") {
      setFilterTrainer(null); // Reset selectedServiceName state
      setAppliedFilters((prev) => ({ ...prev, staff: null })); // Update appliedFilters
    } else if (filter === "filterFitness") {
      setFilterFitness(null); // Reset filterFitness state
      setAppliedFilters((prev) => ({ ...prev, fitness: null })); // Update appliedFilters
    } else if (filter === "filterGender") {
      setFilterGender(null); // Reset filterGender state
      setAppliedFilters((prev) => ({ ...prev, gender: null })); // Update appliedFilters
    }
  };

  const resetFilters = () => {
    setFilterService(null);
    setFilterServiceVariation(null);
    setFilterAgeGroup(null);
    setFilterLeadSource(null);
    setFilterLeadOwner(null);
    setFilterTrainer(null);
    setFilterFitness(null);
    setFilterGender(null);
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
                  options={leadStatusOptions}
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
              {/* <button
                onClick={resetFilters}
                className="text-[12px] flex items-center gap-1 justify-end ml-auto bg-black text-white p-1 rounded-[5px]"
              >
                <RiResetLeftFill className="mt-[1px]" />
                <span>Reset Filters</span>
              </button> */}
            </div>
          </div>
        </div>
      )}

      {Object.keys(appliedFilters).length > 0 && (
        <div
          className={`gap-2 mt-4 ${
            Object.keys(appliedFilters).some((key) => appliedFilters[key])
              ? "flex"
              : "hidden"
          }`}
        >
          {Object.entries(appliedFilters).map(
            ([key, value]) =>
              value && (
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
              )
          )}
        </div>
      )}
    </div>
  );
}
