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

export default function AllAppointmentPanel({
  formik,
  filterTrainer,
  filterBookingStatus,
  filterServiceType,
  filterServiceName,
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

  const [serviceList, setServiceList] = useState([]);
  const [packageList, setPackageList] = useState([]);

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
      toast.error("Failed to fetch trainers");
    }
  };

  const fetchService = async (club_id = null) => {
    try {
      const params = {};
      if (club_id) {
        params.club_id = club_id;
      }
      const res = await authAxios().get("/service/list", { params });

      const data = res.data?.data || [];

      // ✅ Only ACTIVE + PRODUCT services
      const activeProductServices = data.filter(
        (item) => item.status === "ACTIVE" && item.type !== "PRODUCT" && item.type !== "GROUP_CLASS"
      );

      setServiceList(activeProductServices);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch services");
    }
  };

  const fetchPackages = async (serviceId) => {
    if (!serviceId) {
      setPackageList([]);
      return;
    }

    try {
      const response = await authAxios().get("/package/list", {
        params: { service_id: serviceId },
      });

      const data = response.data?.data || [];

      // ✅ ACTIVE packages only
      const activePackages = data.filter((item) => item.status === "ACTIVE");

      setPackageList(activePackages);
    } catch (err) {
      toast.error("Failed to fetch packages");
      setPackageList([]);
    }
  };

  // ✅ Refetch trainers when clubId changes
  useEffect(() => {
    fetchTrainer(clubId);
    fetchService(clubId);

    setFilterValue("filterTrainer", null);
    setFilterValue("filterServiceType", null);
    setFilterValue("filterServiceName", null);
  }, [clubId]);

  useEffect(() => {
    fetchPackages(filterServiceType);

    // ✅ Correct way to reset package
    setFilterValue("filterServiceName", null);
  }, [filterServiceType]);

  const trainerOptions =
    trainerList?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];

  const serviceOptions = serviceList.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  const packageOptions = packageList.map((item) => ({
    label: item.name,
    value: item.id,
  }));

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
      service_type: formik.values.filterServiceType,
      service_name: formik.values.filterServiceName,
      booking_status: formik.values.filterBookingStatus,
      appointment_date: formatDateForApi(formik.values.filterAppointmentDate),
    });

    setShowFilters(false);
  };

  // ✅ Remove filter chip - update both parent state and formik
  const handleRemoveFilter = (key) => {
    const keyMap = {
      assigned_staff_id: "filterTrainer",
      service_type: "filterServiceType",
      service_name: "filterServiceName",
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

    if (key === "service_type") {
      const service = serviceOptions.find((opt) => opt.value === value);
      return service ? service.label : value;
    }

    if (key === "service_name") {
      const pkg = packageOptions.find((opt) => opt.value === value);
      return pkg ? pkg.label : value;
    }

    if (key === "booking_status") {
      const status = filteredStatusOptions.find((opt) => opt.value === value);
      return status ? status.label : value;
    }

    if (key === "appointment_date") {
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
                  Service Type
                </label>
                <Select
                  options={serviceOptions}
                  value={
                    serviceOptions.find(
                      (opt) => opt.value === filterServiceType
                    ) || null
                  }
                  onChange={(option) =>
                    setFilterValue(
                      "filterServiceType",
                      option ? option.value : null
                    )
                  }
                  placeholder="Select Service"
                  styles={customStyles}
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Service Name
                </label>
                <Select
                  options={packageOptions}
                  value={
                    packageOptions.find(
                      (opt) => opt.value === filterServiceName
                    ) || null
                  }
                  onChange={(option) =>
                    setFilterValue(
                      "filterServiceName",
                      option ? option.value : null
                    )
                  }
                  placeholder="Select Package"
                  styles={customStyles}
                  isDisabled={!filterServiceType}
                />
              </div>
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
