import React, { useEffect, useMemo, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, subYears } from "date-fns";
import { FaCalendarDays } from "react-icons/fa6";
import { customStyles, filterActiveItems } from "../../../Helper/helper";
import Select from "react-select";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { IoClose, IoTriangle } from "react-icons/io5";
import { authAxios } from "../../../config/config";
import { toast } from "react-toastify";

const attendanceDummyData = [
  {
    member_id: 2030657,
    club_name: "DLF Summit Plaza",
    name: "Avantika",
    profile_image: "https://i.pravatar.cc/150?img=47",
    mobile: "7681972497",
    service_name: "Personal Training",
    date: "14-05-2025",
    location: "DLF Thrive, Cyberpark",
    clock_in: "05:11 PM",
    clock_out: "05:11 PM",
    medium_staff: "White_Label",
    current_pt: "Rakhi Chauhan",
    conducted_by: "Rakhi Chauhan Accepted",
    pt_no_show: "No",
  },
  {
    member_id: 2030657,
    club_name: "DLF Summit Plaza",
    name: "Avantika",
    profile_image: "https://i.pravatar.cc/150?img=47",
    mobile: "7681972497",
    service_name: "Personal Training",
    date: "14-05-2025",
    location: "DLF Thrive, Cyberpark",
    clock_in: "05:11 PM",
    clock_out: "10:00 PM",
    medium_staff: "White_Label",
    current_pt: "Rakhi Chauhan",
    conducted_by: "Rakhi Chauhan Accepted",
    pt_no_show: "No",
  },
  {
    member_id: 2030657,
    club_name: "DLF Summit Plaza",
    name: "Avantika",
    profile_image: "https://i.pravatar.cc/150?img=47",
    mobile: "7681972497",
    service_name: "Personal Training",
    date: "06-05-2025",
    location: "DLF Thrive, Cyberpark",
    clock_in: "10:30 AM",
    clock_out: "10:00 PM",
    medium_staff: "White_Label",
    current_pt: "Rakhi Chauhan",
    conducted_by: "Rakhi Chauhan Accepted",
    pt_no_show: "No",
  },
  {
    member_id: 2030657,
    club_name: "DLF Summit Plaza",
    name: "Avantika",
    profile_image: "https://i.pravatar.cc/150?img=47",
    mobile: "7681972497",
    service_name: "Personal Training",
    date: "05-05-2025",
    location: "DLF Thrive, Cyberpark",
    clock_in: "10:38 AM",
    clock_out: "10:00 PM",
    medium_staff: "White_Label",
    current_pt: "Rakhi Chauhan",
    conducted_by: "Rakhi Chauhan Accepted",
    pt_no_show: "No",
  },
  {
    member_id: 2030657,
    club_name: "DLF Summit Plaza",
    name: "Avantika",
    profile_image: "https://i.pravatar.cc/150?img=47",
    mobile: "7681972497",
    service_name: "Personal Training",
    date: "01-05-2025",
    location: "DLF Thrive, Cyberpark",
    clock_in: "12:44 PM",
    clock_out: "10:00 PM",
    medium_staff: "White_Label",
    current_pt: "Rakhi Chauhan",
    conducted_by: "Rakhi Chauhan Accepted",
    pt_no_show: "No",
  },
  {
    member_id: 2030657,
    club_name: "DLF Summit Plaza",
    name: "Avantika",
    profile_image: "https://i.pravatar.cc/150?img=47",
    mobile: "7681972497",
    service_name: "Personal Training",
    date: "29-04-2025",
    location: "DLF Thrive, Cyberpark",
    clock_in: "10:19 AM",
    clock_out: "10:00 PM",
    medium_staff: "White_Label",
    current_pt: "Rakhi Chauhan",
    conducted_by: "Rakhi Chauhan Accepted",
    pt_no_show: "No",
  },
];

// Date filter dropdown options
const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const ServiceTypeOptions = [
  { value: "Membership", label: "Membership" },
  { value: "Package", label: "Package" },
  { value: "Product", label: "Product" },
];

const MemberCheckInsReport = () => {
  const [data, setData] = useState([]);
  const [dateFilter, setDateFilter] = useState(dateFilterOptions[1]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);
  const [itemServiceType, setItemServiceType] = useState(null);

  const [showFilters, setShowFilters] = useState(false);
  const panelRef = useRef(null);

  const [appliedFilters, setAppliedFilters] = useState({
    club_id: clubFilter,
    service_type: itemServiceType,
  });

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

  const handleSubmitFilters = () => {
    const filters = {
      club_id: clubFilter,
      service_type: itemServiceType,
    };

    // For club_id, find the label corresponding to the clubFilter (ID)
    const clubLabel =
      clubOptions.find((o) => o.value === clubFilter)?.label || "";

    // Update filters to use the label for club_id
    setAppliedFilters({
      club_id: clubLabel, // Store the label, not the ID
      service_type: itemServiceType,
    });

    console.log(filters, "✅ Submitted Filters");
    setShowFilters(false);
  };

  const removeFilter = (filter) => {
    if (filter === "club_id") {
      setClubFilter(null);
      setAppliedFilters((prev) => ({ ...prev, club_id: null }));
    } else if (filter === "service_type") {
      setItemServiceType(null);
      setAppliedFilters((prev) => ({ ...prev, service_type: null }));
    }
  };

  // Function to fetch club list
  const fetchClub = async (search = "") => {
    try {
      const response = await authAxios().get("/club/list", {
        params: search ? { search } : {},
      });
      const data = response.data?.data || [];
      const activeOnly = filterActiveItems(data);
      setClubList(activeOnly);
    } catch (error) {
      toast.error("Failed to fetch clubs");
    }
  };
  // Function to fetch role list

  useEffect(() => {
    fetchClub();
  }, []);

  const clubOptions = clubList.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  return (
    <>
      <div className="page--content">
        {/* Page heading */}
        <div className="flex items-end justify-between gap-2 mb-2">
          <div className="title--breadcrumbs">
            <p className="text-sm">{`Home >  Reports > Operations Reports > Member Check-ins`}</p>
            <h1 className="text-3xl font-semibold">Member Check-ins</h1>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4 items-center justify-between">
          <div className="flex gap-2 w-full">
            <div className="max-w-[180px] w-full">
              <Select
                placeholder="Date Filter"
                options={dateFilterOptions}
                value={dateFilter}
                onChange={(selected) => {
                  setDateFilter(selected);
                  if (selected?.value !== "custom") {
                    setCustomFrom(null);
                    setCustomTo(null);
                  }
                }}
                styles={customStyles}
                className="w-full"
              />
            </div>

            {/* Custom Date Range */}
            {dateFilter?.value === "custom" && (
              <>
                <div className="custom--date dob-format flex-1 max-w-[180px] w-full">
                  <span className="absolute z-[1] mt-[11px] ml-[15px]">
                    <FaCalendarDays />
                  </span>
                  <DatePicker
                    selected={customFrom}
                    onChange={(date) => setCustomFrom(date)}
                    placeholderText="From Date"
                    className="custom--input w-full input--icon"
                    minDate={subYears(new Date(), 20)}
                    maxDate={addYears(new Date(), 0)}
                    dateFormat="dd/MM/yyyy"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                  />
                </div>
                <div className="custom--date dob-format flex-1 max-w-[180px] w-full">
                  <span className="absolute z-[1] mt-[11px] ml-[15px]">
                    <FaCalendarDays />
                  </span>
                  <DatePicker
                    selected={customTo}
                    onChange={(date) => setCustomTo(date)}
                    placeholderText="To Date"
                    className="custom--input w-full input--icon"
                    minDate={subYears(new Date(), 20)}
                    maxDate={addYears(new Date(), 0)}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    dateFormat="dd/MM/yyyy"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Statistics */}
        <div className="grid grid-cols-3 gap-5 mb-5 p-3 border bg-white shodow--box rounded-[10px]">
          <div className="border rounded-[5px] overflow-hidden w-full">
            <div className="flex gap-1 justify-center bg-[#F1F1F1] p-4 py-3">
              <div className="text-lg font-bold">Total Check-ins</div>
            </div>
            <div>
              <p className="text-3xl font-bold p-2 text-center py-5">10</p>
            </div>
          </div>
          <div className="border rounded-[5px] overflow-hidden w-full">
            <div className="flex gap-1 justify-center bg-[#F1F1F1] p-4 py-3">
              <div className="text-lg font-bold">Total Unique Check-ins</div>
            </div>
            <div>
              <p className="text-3xl font-bold p-2 text-center py-5">10</p>
            </div>
          </div>
          <div className="border rounded-[5px] overflow-hidden w-full">
            <div className="flex gap-1 justify-center bg-[#F1F1F1] p-4 py-3">
              <div className="text-lg font-bold">Total Unique Members</div>
            </div>
            <div>
              <p className="text-3xl font-bold p-2 text-center py-5">10</p>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="w-full p-3 border bg-white shodow--box rounded-[10px]">
          <div className="flex items-start gap-3 justify-between w-full mb-3 border-b border-b-[#D4D4D4] pb-3">
            <div>
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Club
                          </label>
                          <Select
                            placeholder="Filter by club"
                            value={
                              clubOptions.find((o) => o.value === clubFilter) ||
                              null
                            }
                            options={clubOptions}
                            onChange={(option) => setClubFilter(option?.value)}
                            styles={customStyles}
                          />
                        </div>
                        {/* Service Type */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Service Type
                          </label>
                          <Select
                            value={
                              ServiceTypeOptions.find(
                                (o) => o.value === itemServiceType
                              ) || null
                            }
                            onChange={(option) =>
                              setItemServiceType(option?.value)
                            }
                            options={ServiceTypeOptions}
                            placeholder="Select Type"
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
                {Object.keys(appliedFilters).length > 0 && (
                  <div
                    className={`gap-2 mt-4 ${
                      Object.keys(appliedFilters).some(
                        (key) => appliedFilters[key]
                      )
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
            </div>
          </div>

          <div className="table--data--bottom w-full">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-2 py-4 min-w-[50px]">S.No</th>
                    <th className="px-2 py-4 min-w-[150px]">Club Name</th>
                    <th className="px-2 py-4 min-w-[100px]">Member ID</th>
                    <th className="px-2 py-4 min-w-[120px]">Member Name</th>
                    <th className="px-2 py-4 min-w-[150px]">Service Name</th>
                    <th className="px-2 py-4 min-w-[100px]">Date</th>
                    <th className="px-2 py-4 min-w-[160px]">Location</th>
                    <th className="px-2 py-4 min-w-[100px]">Clock In</th>
                    <th className="px-2 py-4 min-w-[100px]">Clock Out</th>

                    <th className="px-2 py-4 min-w-[140px]">Current PT</th>
                    <th className="px-2 py-4 min-w-[150px]">Conducted By</th>
                    <th className="px-2 py-4 min-w-[120px]">PT No Show</th>
                  </tr>
                </thead>

                <tbody>
                  {data.length ? (
                    data.map((row, index) => {
                      return (
                        <tr key={index}>
                          <td className="px-2 py-4">{index + 1}</td>
                          <td className="px-2 py-4">{row.club_name}</td>
                          <td className="px-2 py-4">{row.member_id}</td>
                          <td className="flex items-center gap-2 px-2 py-4">
                            <img
                              src={row.profile_image}
                              alt={row.name}
                              className="w-8 h-8 rounded-full"
                            />
                            <span className="text-black">{row.name}</span>
                          </td>
                          <td className="px-2 py-4">{row.service_name}</td>
                          <td className="px-2 py-4">{row.date}</td>
                          <td className="px-2 py-4">{row.location}</td>
                          <td className="text-green-600 px-2 py-4">
                            {row.clock_in}
                          </td>
                          <td className="text-orange-500 px-2 py-4">
                            {row.clock_out}
                          </td>
                          <td className="px-2 py-4">--</td>
                          <td className="px-2 py-4">--</td>
                          <td className="px-2 py-4">{row.pt_no_show}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={13} className="text-center px-2 py-4">
                        No data found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MemberCheckInsReport;
