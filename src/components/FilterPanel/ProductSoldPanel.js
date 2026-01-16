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
  { value: "NEW", label: "New" },
  { value: "RENEWAL", label: "Renewal" },
];

const packageTypeOptions = [
  { value: "SUBSCRIPTION", label: "Membership" },
  { value: "PACKAGE", label: "Package" },
  { value: "PRODUCT", label: "Product" },
];

const payModeTypeOptions = [
  { value: "UPI", label: "UPI" },
  { value: "Credit Card", label: "Credit Card" },
  { value: "Net Banking", label: "Net Banking" },
];

export default function ProductSoldPanel({
  filterBillType,
  filterServiceType,
  filterPackageType,
  filterLeadSource,
  filterLeadOwner,
  filterPayMode,
  formik,
  setFilterValue,
  appliedFilters, // ✅ Receive from parent
  setAppliedFilters, // ✅ Receive from parent
  userRole,
  clubId,
}) {
  const [showFilters, setShowFilters] = useState(false);
  const panelRef = useRef(null);
  const [staffList, setStaffList] = useState([]);
  const [serviceList, setServiceList] = useState([]);

  // Fetch staff list from API
  const fetchStaffList = async (clubId) => {
    try {
      const requests = [
        authAxios().get("/staff/list", {
          params: { role: "FOH", club_id: clubId },
        }),
      ];

      if (userRole === "CLUB_MANAGER" || userRole === "ADMIN") {
        requests.push(
          authAxios().get("/staff/list", {
            params: { role: "CLUB_MANAGER", club_id: clubId },
          })
        );
      }

      const responses = await Promise.all(requests);

      let mergedData = [];

      responses.forEach((res) => {
        const role = res.config.params.role;

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
        (item) => item.status === "ACTIVE" && item.service_type !== "PRODUCT"
      );

      setServiceList(activeProductServices);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch services");
    }
  };

  useEffect(() => {
    if (clubId) {
      fetchStaffList(clubId);
      fetchService(clubId);

      // Reset dependent filters
      setFilterValue("filterServiceType", null);
      setFilterValue("filterLeadOwner", null);
    }
  }, [clubId]);

  const dispatch = useDispatch();
  const { lists, loading } = useSelector((state) => state.optionList);

  useEffect(() => {
    dispatch(fetchOptionList("LEAD_SOURCE"));
  }, [dispatch]);

  const leadSourceOptions = lists["LEAD_SOURCE"] || [];
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
  ].filter((group) => group.options.length > 0);

  const serviceOptions = serviceList.map((item) => ({
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

  useEffect(() => {
    if (filterPackageType !== "PACKAGE") {
      // Clear service type if package type is not PACKAGE
      setFilterValue("filterServiceType", null);
    }
  }, [filterPackageType]);

  // ✅ Apply button - update parent's appliedFilters
  const handleApply = () => {
    setAppliedFilters({
      bill_type: formik.values.filterBillType,
      service_type: formik.values.filterServiceType,
      package_type: formik.values.filterPackageType,
      lead_source: formik.values.filterLeadSource,
      lead_owner: formik.values.filterLeadOwner,
      pay_mode: formik.values.filterPayMode,
    });

    setShowFilters(false);
  };

  // ✅ Remove filter chip - update both parent state and formik
  const handleRemoveFilter = (key) => {
    const keyMap = {
      bill_type: "filterBillType",
      service_type: "filterServiceType",
      package_type: "filterPackageType",
      lead_source: "filterLeadSource",
      lead_owner: "filterLeadOwner",
      pay_mode: "filterPayMode",
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

    if (key === "bill_type") {
      const billType = BillTypeOptions.find((opt) => opt.value === value);
      return billType ? billType.label : value;
    }

    if (key === "service_type") {
      const service = serviceOptions.find((opt) => opt.value === value);
      return service ? service.label : value;
    }
    if (key === "package_type") {
      const packageType = packageTypeOptions.find((opt) => opt.value === value);
      return packageType ? packageType.label : value;
    }

    if (key === "lead_source") {
      const leadSource = leadSourceOptions.find((opt) => opt.value === value);
      return leadSource ? leadSource.label : value;
    }

    if (key === "lead_owner") {
      const allOwners = leadOwnerOptions.flatMap((group) => group.options);
      const owner = allOwners.find((opt) => opt.value === value);
      return owner ? owner.label : value;
    }

    if (key === "pay_mode") {
      const payMode = payModeTypeOptions.find((opt) => opt.value === value);
      return payMode ? payMode.label : value;
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
                  placeholder="Select Bill"
                  styles={customStyles}
                  // isClearable
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Package Type
                </label>
                <Select
                  value={
                    packageTypeOptions.find(
                      (opt) => opt.value === filterPackageType
                    ) || null
                  }
                  onChange={(option) => {
                    const serviceType = option ? option.value : null;
                    // Set service type
                    setFilterValue("filterPackageType", serviceType);
                  }}
                  options={packageTypeOptions}
                  placeholder="Select Package"
                  styles={customStyles}
                  // isClearable
                />
              </div>

              {filterPackageType === "PACKAGE" && (
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
                    placeholder="Select Service Type"
                    styles={customStyles}
                  />
                </div>
              )}

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
                  // isClearable
                />
              </div>

              {userRole === "FOH" ? null : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lead Owner
                  </label>
                  <Select
                    value={
                      leadOwnerOptions
                        .flatMap((group) => group.options)
                        .find((opt) => opt.value === filterLeadOwner) || null
                    }
                    onChange={(option) =>
                      setFilterValue(
                        "filterLeadOwner",
                        option ? option.value : null
                      )
                    }
                    options={leadOwnerOptions}
                    placeholder="Select Lead Owner"
                    styles={customStyles}
                    // isClearable
                  />
                </div>
              )}
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Pay Mode
                </label>
                <Select
                  value={
                    payModeTypeOptions.find(
                      (opt) => opt.value === filterPayMode
                    ) || null
                  }
                  onChange={(option) =>
                    setFilterValue(
                      "filterPayMode",
                      option ? option.value : null
                    )
                  }
                  options={payModeTypeOptions}
                  placeholder="Select Pay Mode"
                  styles={customStyles}
                  // isClearable
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

      {/* ✅ Applied Filters Chips - using parent's appliedFilters */}
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
