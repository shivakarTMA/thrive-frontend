import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { FaFilter } from "react-icons/fa";
import { RiResetLeftFill } from "react-icons/ri";
import { IoTriangle } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { fetchOptionList } from "../../Redux/Reducers/optionListSlice";
import { customStyles } from "../../Helper/helper";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";

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

  // Redux state
  const dispatch = useDispatch();
  const { lists, loading } = useSelector((state) => state.optionList);

  // Fetch option lists
  useEffect(() => {
    dispatch(fetchOptionList("LEAD_SOURCE"));
    dispatch(fetchOptionList("LEAD_SOURCE"));
  }, [dispatch]);

  // Extract Redux lists
  const leadsSources = lists["LEAD_SOURCE"] || [];

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

  const leadOwnerOptions = [
    { label: "Alice Johnson", value: "Alice Johnson" },
    { label: "Bob Thompson", value: "Bob Thompson" },
    { label: "Cara White", value: "Cara White" },
    { label: "Derek Miles", value: "Derek Miles" },
    { label: "Emily Watson", value: "Emily Watson" },
    { label: "Nina Brown", value: "Nina Brown" },
    { label: "Zack Lee", value: "Zack Lee" },
    { label: "Linda Marks", value: "Linda Marks" },
    { label: "Raj Mehta", value: "Raj Mehta" },
    { label: "Sofia Green", value: "Sofia Green" },
  ];

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
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="w-12 h-10 bg-black text-white rounded-lg flex items-center justify-center gap-2 min-h-[44px]"
      >
        <HiOutlineAdjustmentsHorizontal className="text-2xl" />
        {/* {showFilters ? "Hide Filters" : "Show Filters"} */}
      </button>

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
                  Service
                </label>
                <Select
                  value={filterService}
                  onChange={setFilterService}
                  options={leadStatusOptions}
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
                  options={lastCallStatusOptions}
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
            <div className="pt-3">
              <button
                onClick={resetFilters}
                className="text-[12px] flex items-center gap-1 justify-end ml-auto bg-black text-white p-1 rounded-[5px]"
              >
                <RiResetLeftFill className="mt-[1px]" />
                <span>Reset Filters</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
