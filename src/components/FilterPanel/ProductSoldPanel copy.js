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

const BillTypeOptions = [
  { value: "New", label: "New" },
  { value: "Renewal", label: "Renewal" },
];

const ServiceTypeOptions = [
  { value: "Membership", label: "Membership" },
  { value: "Package", label: "Package" },
  { value: "Product", label: "Product" },
];

const getLabelByValue = (options, value) => {
  const found = options?.find((opt) => opt.value === value);
  return found ? found.label : value;
};

export default function ProductSoldPanel({
  filterClub,
  filterBillType,
  filterServiceType,
  filterServiceName,
  filterLeadSource,
  formik,
  setFilterValue,
  queryParams,
  onApply,
}) {
  const [showFilters, setShowFilters] = useState(false);
  const panelRef = useRef(null);

  const [appliedFilters, setAppliedFilters] = useState({});
  const [serviceList, setServiceList] = useState([]);
  const [servicesType, setServicesType] = useState([]);
  const [clubList, setClubList] = useState([]);

  const fetchService = async () => {
    try {
      const res = await authAxios().get("/service/list");
      let data = res.data?.data || res?.data || [];
      const activeOnly = filterActiveItems(data);
      setServiceList(activeOnly);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch services");
    }
  };

  const fetchServiceNames = async (serviceType) => {
    try {
      let endpoint = "";

      if (serviceType === "Membership") {
        endpoint = "/subscription-plan/list";
      } else if (serviceType === "Package") {
        endpoint = "/package/list";
      } else if (serviceType === "Product") {
        endpoint = "/product/list";
      }

      if (!endpoint) return;

      const res = await authAxios().get(endpoint);
      const data = res.data?.data || [];

      const activeOnly = filterActiveItems(data);

      const options = activeOnly.map((item) => ({
        label: item.title || item.name, // ✅ FIX HERE
        value: item.id,
      }));

      setServicesType(options);
    } catch (error) {
      toast.error("Failed to fetch service names");
    }
  };

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

  const dispatch = useDispatch();
  const { lists, loading } = useSelector((state) => state.optionList);

  useEffect(() => {
    dispatch(fetchOptionList("LEAD_SOURCE"));
  }, [dispatch]);

  const leadSourceOptions = lists["LEAD_SOURCE"] || [];

  const serviceOptions = serviceList
    ?.map((item) => ({
      label: item.name,
      value: item.id,
      type: item.type,
    }))
    .filter((item) => item.type !== "PRODUCT");

  const clubOptions =
    clubList?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];

  useEffect(() => {
    fetchService();
    fetchClub();
  }, []);

  // Auto-apply filters from URL params
  useEffect(() => {
    if (queryParams && Object.values(queryParams).some((v) => v)) {
      const newFilters = {
        club_id: queryParams.club_id,
        bill_type: queryParams.bill_type,
        service_type: queryParams.service_type,
        service_name: queryParams.service_name,
        lead_source: queryParams.lead_source,
      };

      // Only set applied filters if there are actual values
      if (Object.values(newFilters).some((v) => v)) {
        setAppliedFilters(newFilters);
      }
    }
  }, [queryParams]);

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

  const handleApply = () => {
    onApply({
      club_id: filterClub,
      bill_type: filterBillType,
      service_type: filterServiceType,
      service_name: filterServiceName,
      lead_source: filterLeadSource,
    });

    setAppliedFilters({
      club_id: filterClub,
      bill_type: filterBillType,
      service_type: filterServiceType,
      service_name: filterServiceName,
      lead_source: filterLeadSource,
    });

    setShowFilters(false);
  };

  const handleRemoveFilter = (key) => {
    const keyMap = {
      club_id: "filterClub",
      bill_type: "filterBillType",
      service_type: "filterServiceType",
      service_name: "filterServiceName",
      lead_source: "filterLeadSource",
    };

    setAppliedFilters((prev) => ({ ...prev, [key]: null }));

    if (keyMap[key]) {
      setFilterValue(keyMap[key], null);
      formik.setFieldTouched(keyMap[key], false);
    }
  };

  useEffect(() => {
    if (!queryParams?.service_type) return;

    fetchServiceNames(queryParams.service_type);
  }, [queryParams?.service_type]);

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
                <label className="block mb-1 text-sm font-medium">Club</label>
                <Select
                  value={
                    clubOptions.find((opt) => opt.value === filterClub) || null
                  }
                  onChange={(option) =>
                    setFilterValue("filterClub", option ? option.value : null)
                  }
                  options={clubOptions}
                  placeholder="Select Club"
                  styles={customStyles}
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">
                  Bill Type
                </label>
                <Select
                  value={
                    BillTypeOptions.find(
                      (opt) => opt.value === filterBillType
                    ) || null
                  }
                  onChange={(option) =>
                    setFilterValue(
                      "filterBillType",
                      option ? option.value : null
                    )
                  }
                  options={BillTypeOptions}
                  placeholder="Select Type"
                  styles={customStyles}
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Service Type
                </label>
                <Select
                  value={
                    ServiceTypeOptions.find(
                      (opt) => opt.value === filterServiceType
                    ) || null
                  }
                  onChange={(option) => {
                    const serviceType = option ? option.value : null;

                    // 1️⃣ Set service type
                    setFilterValue("filterServiceType", serviceType);

                    // 2️⃣ Reset service name
                    setFilterValue("filterServiceName", null);
                    setServicesType([]);

                    // 3️⃣ Load service names
                    if (serviceType) {
                      fetchServiceNames(serviceType);
                    }
                  }}
                  options={ServiceTypeOptions}
                  placeholder="Select Service Type"
                  styles={customStyles}
                />
              </div>
              {/* Service Name */}
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Service Name
                </label>
                <Select
                  value={
                    servicesType.find(
                      (opt) => opt.value === filterServiceName
                    ) || null
                  }
                  onChange={(option) =>
                    setFilterValue(
                      "filterServiceName",
                      option ? option.value : null // 👈 CHANGE HERE
                    )
                  }
                  options={servicesType}
                  placeholder="Select Service Name"
                  styles={customStyles}
                  isDisabled={!filterServiceType}
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
                />
              </div>
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

      {/* Applied Filters Chips */}
      {Object.values(appliedFilters).some((v) => v) && (
        <div className="flex flex-wrap gap-2 mt-4">
          {Object.entries(appliedFilters).map(([key, value]) => {
            if (!value) return null;

            let options;
            let displayValue = "";
            if (key === "club_id") {
              displayValue = getLabelByValue(clubOptions, value);
            }
            if (key === "service_name") {
              displayValue = getLabelByValue(servicesType, value);
            }
            if (key === "bill_type") {
              displayValue = getLabelByValue(BillTypeOptions, value);
            }
            if (key === "service_type") {
              displayValue = getLabelByValue(ServiceTypeOptions, value);
            }
            if (key === "lead_source") {
              displayValue = getLabelByValue(leadSourceOptions, value);
            }

            if (value instanceof Date) {
              displayValue = value.toLocaleDateString();
            } else if (options) {
              const matched = options.find((opt) => opt.value === value);
              displayValue = matched ? matched.label : String(value);
            } else {
              displayValue = String(value);
            }

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
