import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import { IoClose, IoTriangle } from "react-icons/io5";
import { customStyles, filterActiveItems } from "../../Helper/helper";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { authAxios } from "../../config/config";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import { FaCalendarDays } from "react-icons/fa6";

export default function TrialAppointmentPanel({
  formik,
  filterTrainer,
  filterBookingStatus,
  filterAppointmentDate,
  setFilterValue,
  appliedFilters,
  setAppliedFilters,
  filteredStatusOptions,
  clubId, // ✅ Receive clubId from parent
}) {
  const [showFilters, setShowFilters] = useState(false);
  const panelRef = useRef(null);
  const [trainerList, setTrainerList] = useState([]);

  const minTime = new Date();
  minTime.setHours(6, 0, 0, 0);

  const maxTime = new Date();
  maxTime.setHours(22, 0, 0, 0);

  // ✅ Fetch trainers based on club_id (if provided) or all trainers
  const fetchTrainer = async (club_id = null) => {
    try {
      const params = { role: "TRAINER" };

      // ✅ If club_id is provided, filter by club, otherwise show all
      if (club_id) {
        params.club_id = club_id;
      }

      const response = await authAxios().get("/staff/list", { params });
      const data = response.data?.data || [];
      const activeOnly = filterActiveItems(data);
      setTrainerList(activeOnly);
    } catch (error) {
      console.error("Failed to fetch trainers:", error);
    }
  };

  // ✅ Refetch trainers when clubId changes
  useEffect(() => {
    fetchTrainer(clubId);

    // ✅ Reset trainer filter if club changes
    if (filterTrainer) {
      setFilterValue("filterTrainer", null);
    }
  }, [clubId]);

  const trainerOptions =
    trainerList?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];

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

  const formatDateForApi = (date) => {
    if (!date) return null;

    const pad = (n) => String(n).padStart(2, "0");

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
  };

  // ✅ Apply button - update parent's appliedFilters
  const handleApply = () => {
    setAppliedFilters({
      ...appliedFilters,
      assigned_staff_id: formik.values.filterTrainer,
      booking_status: formik.values.filterBookingStatus,
      appointment_date: formatDateForApi(formik.values.filterAppointmentDate),
    });

    setShowFilters(false);
  };

  // ✅ Remove filter chip - update both parent state and formik
  const handleRemoveFilter = (key) => {
    const keyMap = {
      assigned_staff_id: "filterTrainer",
      booking_status: "filterBookingStatus",
      appointment_date: "filterAppointmentDate",
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

    if (key === "assigned_staff_id") {
      const trainer = trainerOptions.find((opt) => opt.value === value);
      return trainer ? trainer.label : value;
    }

    if (key === "booking_status") {
      const status = filteredStatusOptions.find((opt) => opt.value === value);
      return status ? status.label : value;
    }

    if (key === "appointment_date") {
      // value = "2026-01-02 15:10:00"
      const date = new Date(value.replace(" ", "T"));

      return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
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
                <label className="block mb-1 text-sm font-medium">
                  Trainer Name
                </label>
                <Select
                  value={
                    trainerOptions.find((opt) => opt.value === filterTrainer) ||
                    null
                  }
                  onChange={(option) =>
                    setFilterValue(
                      "filterTrainer",
                      option ? option.value : null
                    )
                  }
                  options={trainerOptions}
                  placeholder="Select trainer"
                  styles={customStyles}
                  // isClearable
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Status</label>
                <Select
                  value={
                    filteredStatusOptions.find(
                      (opt) => opt.value === filterBookingStatus
                    ) || null
                  }
                  onChange={(option) =>
                    setFilterValue(
                      "filterBookingStatus",
                      option ? option.value : null
                    )
                  }
                  options={filteredStatusOptions}
                  placeholder="Select Status"
                  styles={customStyles}
                  // isClearable
                />
              </div>
              {/* <div>
                <label className="block mb-1 text-sm font-medium">
                  Appointment Date
                </label>
                <div className="custom--date dob-format w-full">
                  <span className="absolute z-[1] mt-[11px] ml-[15px]">
                    <FaCalendarDays />
                  </span>
                  <DatePicker
                    selected={filterAppointmentDate}
                    onChange={(date) =>
                      setFilterValue("filterAppointmentDate", date)
                    }
                    className="custom--input w-full input--icon"
                    showTimeSelect
                    timeIntervals={60}
                    timeCaption="Time"
                    maxDate={new Date()} // ❌ Disable future dates
                    timeFormat="hh:mm aa"
                    dateFormat="dd/MM/yyyy hh:mm aa"
                    placeholderText="Select date & time"
                    minTime={minTime}
                    maxTime={maxTime}
                    isClearable
                  />
                </div>
              </div> */}
            </div>

            {/* Apply Button */}
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
