import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { FaFilter } from "react-icons/fa";
import { RiResetLeftFill } from "react-icons/ri";
import { IoClose, IoTriangle } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { fetchOptionList } from "../../Redux/Reducers/optionListSlice";
import { customStyles } from "../../Helper/helper";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { toast } from "react-toastify";
import { apiAxios } from "../../config/config";

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
}) {
  const [showFilters, setShowFilters] = useState(false);
  const panelRef = useRef(null);
  const [staffList, setStaffList] = useState([]);

  const [appliedFilters, setAppliedFilters] = useState({
    leadSource: selectedLeadSource,
    lastCallType: selectedLastCallType,
    leadStatus: selectedLeadStatus,
    callTag: selectedCallTag,
    gender: selectedGender,
    serviceName: selectedServiceName,
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
    dispatch(fetchOptionList("LEAD_CALL_STATUS"));
    dispatch(fetchOptionList("INTERESTED_IN"));
  }, [dispatch]);

  // Extract Redux lists
  const leadsSources = lists["LEAD_SOURCE"] || [];
  const lastCallStatusOptions = lists["LEAD_CALL_STATUS"] || [];
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
      leadSource: selectedLeadSource,
      lastCallType: selectedLastCallType,
      leadStatus: selectedLeadStatus,
      callTag: selectedCallTag,
      gender: selectedGender,
      serviceName: selectedServiceName,
    });
    setShowFilters(false);
  };

  const removeFilter = (filter) => {
    if (filter === "leadSource") {
      setSelectedLeadSource(null);
      setAppliedFilters((prev) => ({ ...prev, leadSource: null }));
    } else if (filter === "lastCallType") {
      setSelectedLastCallType(null);
      setAppliedFilters((prev) => ({ ...prev, lastCallType: null }));
    } else if (filter === "leadStatus") {
      setSelectedLeadStatus(null);
      setAppliedFilters((prev) => ({ ...prev, leadStatus: null }));
    } else if (filter === "callTag") {
      setSelectedCallTag(null);
      setAppliedFilters((prev) => ({ ...prev, callTag: null }));
    } else if (filter === "gender") {
      setSelectedGender(null);
      setAppliedFilters((prev) => ({ ...prev, gender: null }));
    } else if (filter === "serviceName") {
      setSelectedServiceName(null);
      setAppliedFilters((prev) => ({ ...prev, serviceName: null }));
    }
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
              {/* Lead Source */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lead Source
                </label>
                <Select
                  value={selectedLeadSource}
                  onChange={setSelectedLeadSource}
                  options={leadsSources}
                  // isClearable
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
                  // isClearable
                  placeholder="Select Lead Status"
                  styles={customStyles}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Call Status
                </label>
                <Select
                  value={selectedLastCallType}
                  onChange={setSelectedLastCallType}
                  options={lastCallStatusOptions}
                  // isClearable
                  placeholder="Select Lead Type"
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
                  // isClearable
                  placeholder="Select Lead Owner"
                  styles={customStyles}
                />
              </div>
              {/* Service Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Name
                </label>
                <Select
                  value={selectedServiceName}
                  onChange={setSelectedServiceName}
                  options={leadServiceOptions}
                  // isClearable
                  placeholder="Select Service"
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
        <div className={`gap-2 mt-4 ${Object.keys(appliedFilters).some(key => appliedFilters[key]) ? 'flex' : 'hidden'}`}>
          {Object.entries(appliedFilters).map(
            ([key, value]) =>
              value && (
                <div
                  key={key}
                  className="flex items-center justify-between gap-1 border rounded-full bg-[#EEEEEE] min-h-[30px] px-3 text-sm"
                >
                  <span>{value.label || value}</span>
                  <IoClose onClick={() => removeFilter(key)} className="cursor-pointer text-xl" />
                </div>
              )
          )}
        </div>
      )}
    </div>
  );
}
