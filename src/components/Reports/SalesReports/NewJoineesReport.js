import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, subYears } from "date-fns";
import { FaCalendarDays } from "react-icons/fa6";
import { customStyles, filterActiveItems } from "../../../Helper/helper";
import Select from "react-select";
import { useLocation, useNavigate } from "react-router-dom";
import {
  parse,
  isWithinInterval,
  startOfMonth,
  subDays,
  startOfDay,
  endOfDay,
  format,
} from "date-fns";
import { FaCircle } from "react-icons/fa";
import { IoClose, IoTriangle } from "react-icons/io5";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { authAxios } from "../../../config/config";
import { toast } from "react-toastify";

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const BillTypeOptions = [
  { value: "New", label: "New" },
  { value: "Renewal", label: "Renewal" },
];

const ServiceTypeOptions = [
  { value: "Membership", label: "Membership" },
  { value: "Package", label: "Package" },
  { value: "Product", label: "Product" },
];

const dummyData = [
  {
    id: 1,
    club_id: 16,
    club_name: "DLF Summit Plaza",
    member_id: 2050141,
    member_name: "avantika",
    mobile: "9625997172",
    serviceType: "Membership",
    service_variation: "three months plan",
    company_name: "ogilvy",
    invoice_id: "mar7-2025",
    purchaseDate: "29-12-2025",
    start_date: "05-03-2025",
    end_date: "04-06-2025",
    total_checkins: 5,
    lead_source: "hoardings",
    sales_rep_name: "prerna",
    billType: "Renewal",
    bill_amount: "5700.00",
    status: "ACTIVE",
  },
  {
    id: 2,
    club_id: 16,
    club_name: "DLF Summit Plaza",
    member_id: 2050142,
    member_name: "Rahul Sharma",
    mobile: "9876543210",
    serviceType: "Package",
    service_variation: "Personal Training Package - 12 Sessions",
    company_name: "Tech Solutions Ltd",
    invoice_id: "dec28-2025",
    purchaseDate: "28-12-2025",
    start_date: "01-01-2026",
    end_date: "31-03-2026",
    total_checkins: 2,
    lead_source: "referral",
    sales_rep_name: "amit",
    billType: "New",
    bill_amount: "12000.00",
    status: "ACTIVE",
  },
  {
    id: 3,
    club_id: 16,
    club_name: "DLF Summit Plaza",
    member_id: 2050143,
    member_name: "Priya Kapoor",
    mobile: "9988776655",
    serviceType: "Product",
    service_variation: "Protein Powder - Whey Gold 2kg",
    company_name: "Startup Hub",
    invoice_id: "dec30-2025",
    purchaseDate: "30-12-2025",
    start_date: "-",
    end_date: "-",
    total_checkins: 0,
    lead_source: "social media",
    sales_rep_name: "sneha",
    billType: "New",
    bill_amount: "3200.00",
    status: "ACTIVE",
  },
];

const formatIndianNumber = (num) => new Intl.NumberFormat("en-IN").format(num);

// Utility function to parse date from string
const parseDateString = (dateStr) => {
  try {
    return parse(dateStr, "dd-MM-yyyy", new Date());
  } catch {
    return null;
  }
};

// Utility function to get date range
const getDateRangeFromFilter = (filterValue) => {
  const today = new Date();

  switch (filterValue) {
    case "today":
      return { from: startOfDay(today), to: endOfDay(today) };
    case "last_7_days":
      return { from: startOfDay(subDays(today, 6)), to: endOfDay(today) };
    case "month_till_date":
      return { from: startOfDay(startOfMonth(today)), to: endOfDay(today) };
    default:
      return null;
  }
};

const NewJoineesReport = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Core state
  const [rawData] = useState(dummyData); // Keep original data immutable
  const [clubList, setClubList] = useState([]);

  // Filter state
  const [dateFilter, setDateFilter] = useState(dateFilterOptions[1]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);
  const [clubFilter, setClubFilter] = useState(null);
  const [itemBillType, setItemBillType] = useState(null);
  const [itemServiceType, setItemServiceType] = useState(null);

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [pendingFilters, setPendingFilters] = useState({
    club: null,
    billType: null,
    serviceType: null,
  });
  const panelRef = useRef(null);

  // Parse URL parameters
  const urlParams = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      date: params.get("date"),
      serviceType: params.get("serviceType"),
      billType: params.get("billType"),
      customFrom: params.get("customFrom"),
      customTo: params.get("customTo"),
      clubId: params.get("clubId"),
    };
  }, [location.search]);

  // Fetch club list
  const fetchClub = useCallback(async (search = "") => {
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
  }, []);

  useEffect(() => {
    fetchClub();
  }, [fetchClub]);

  // Club options memoized
  const clubOptions = useMemo(
    () => clubList.map((item) => ({ label: item.name, value: item.id })),
    [clubList]
  );

  // Auto-apply filter changes from URL params (when coming from external links)
  const isInitialMount = useRef(true);
  
  useEffect(() => {
    // Only auto-apply on initial mount when URL has params
    if (isInitialMount.current && (urlParams.billType || urlParams.serviceType || urlParams.clubId)) {
      isInitialMount.current = false;
      // Filters are already set from the previous useEffect, no need to navigate
    }
  }, [urlParams]);

  // Initialize filters from URL
  useEffect(() => {
    if (urlParams.date) {
      const matchedOption = dateFilterOptions.find(
        (option) => option.value === urlParams.date
      );
      if (matchedOption) setDateFilter(matchedOption);
    }

    if (urlParams.customFrom) {
      setCustomFrom(new Date(urlParams.customFrom));
    }

    if (urlParams.customTo) {
      setCustomTo(new Date(urlParams.customTo));
    }

    if (urlParams.billType) {
      const billTypeOption = BillTypeOptions.find(
        (opt) => opt.value.toLowerCase() === urlParams.billType.toLowerCase()
      );
      if (billTypeOption) setItemBillType(billTypeOption);
    }

    if (urlParams.serviceType) {
      const serviceTypeOption = ServiceTypeOptions.find(
        (opt) => opt.value.toLowerCase() === urlParams.serviceType.toLowerCase()
      );
      if (serviceTypeOption) setItemServiceType(serviceTypeOption);
    }

    if (urlParams.clubId) {
      setClubFilter(Number(urlParams.clubId));
    }
  }, [urlParams]);

  // Applied filters derived from state
  const appliedFilters = useMemo(() => {
    const filters = {};

    if (clubFilter) {
      const clubLabel = clubOptions.find((o) => o.value === clubFilter)?.label;
      if (clubLabel) filters.club_id = { label: clubLabel, value: clubFilter };
    }

    if (itemBillType) {
      filters.bill_type = itemBillType;
    }

    if (itemServiceType) {
      filters.service_type = itemServiceType;
    }

    return filters;
  }, [clubFilter, itemBillType, itemServiceType, clubOptions]);

  // Filter data based on all criteria
  const filteredData = useMemo(() => {
    let result = [...rawData];

    // Date filtering
    if (dateFilter?.value === "custom") {
      const from = customFrom ? startOfDay(customFrom) : null;
      const to = customTo ? endOfDay(customTo) : null;

      if (from && to) {
        result = result.filter((item) => {
          const purchaseDate = parseDateString(item.purchaseDate);
          return (
            purchaseDate &&
            isWithinInterval(purchaseDate, { start: from, end: to })
          );
        });
      }
    } else {
      const range = getDateRangeFromFilter(dateFilter?.value);
      if (range) {
        result = result.filter((item) => {
          const purchaseDate = parseDateString(item.purchaseDate);
          return (
            purchaseDate &&
            isWithinInterval(purchaseDate, {
              start: range.from,
              end: range.to,
            })
          );
        });
      }
    }

    // Service type filter
    if (itemServiceType?.value) {
      result = result.filter(
        (item) =>
          item.serviceType?.toLowerCase() ===
          itemServiceType.value.toLowerCase()
      );
    }

    // Bill type filter
    if (itemBillType?.value) {
      result = result.filter(
        (item) =>
          item.billType?.toLowerCase() === itemBillType.value.toLowerCase()
      );
    }

    // Club filter
    if (clubFilter) {
      result = result.filter((item) => item.club_id === clubFilter);
    }

    return result;
  }, [
    rawData,
    dateFilter,
    customFrom,
    customTo,
    itemServiceType,
    itemBillType,
    clubFilter,
  ]);

  // Calculate sales and service counts
  const { salesData, totalSales, serviceCounts } = useMemo(() => {
    const sales = { Membership: 0, Package: 0, Product: 0 };
    const counts = { Membership: 0, Package: 0, Product: 0 };

    filteredData.forEach((item) => {
      const type = item.serviceType;
      if (type && sales.hasOwnProperty(type)) {
        sales[type] += parseFloat(item.bill_amount) || 0;
        counts[type]++;
      }
    });

    const total = sales.Membership + sales.Package + sales.Product;

    return { salesData: sales, totalSales: total, serviceCounts: counts };
  }, [filteredData]);

  // Handle filter panel clicks outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setShowFilters(false);
        // Reset pending filters when closing without applying
        setPendingFilters({
          club: clubFilter,
          billType: itemBillType,
          serviceType: itemServiceType,
        });
      }
    };

    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showFilters, clubFilter, itemBillType, itemServiceType]);

  // Handle manual filter application
  const handleApplyFilters = useCallback(() => {
    const params = new URLSearchParams(location.search);

    // Apply pending filters
    if (pendingFilters.club) {
      params.set("clubId", pendingFilters.club);
      setClubFilter(pendingFilters.club);
    } else {
      params.delete("clubId");
      setClubFilter(null);
    }

    if (pendingFilters.billType?.value) {
      params.set("billType", pendingFilters.billType.value);
      setItemBillType(pendingFilters.billType);
    } else {
      params.delete("billType");
      setItemBillType(null);
    }

    if (pendingFilters.serviceType?.value) {
      params.set("serviceType", pendingFilters.serviceType.value);
      setItemServiceType(pendingFilters.serviceType);
    } else {
      params.delete("serviceType");
      setItemServiceType(null);
    }

    navigate(`?${params.toString()}`, { replace: true });
    setShowFilters(false);
  }, [pendingFilters, location.search, navigate]);

  // Initialize pending filters when opening filter panel
  useEffect(() => {
    if (showFilters) {
      setPendingFilters({
        club: clubFilter,
        billType: itemBillType,
        serviceType: itemServiceType,
      });
    }
  }, [showFilters, clubFilter, itemBillType, itemServiceType]);
  const handleCustomFromChange = useCallback((date) => {
    setCustomFrom(date);
    if (date && customTo) {
      const params = new URLSearchParams(location.search);
      params.set("date", "custom");
      params.set("customFrom", format(date, "yyyy-MM-dd"));
      params.set("customTo", format(customTo, "yyyy-MM-dd"));
      navigate(`?${params.toString()}`, { replace: true });
    }
  }, [customTo, location.search, navigate]);

  const handleCustomToChange = useCallback((date) => {
    setCustomTo(date);
    if (customFrom && date) {
      const params = new URLSearchParams(location.search);
      params.set("date", "custom");
      params.set("customFrom", format(customFrom, "yyyy-MM-dd"));
      params.set("customTo", format(date, "yyyy-MM-dd"));
      navigate(`?${params.toString()}`, { replace: true });
    }
  }, [customFrom, location.search, navigate]);

  // Remove individual filter
  const removeFilter = useCallback(
    (filterKey) => {
      const params = new URLSearchParams(location.search);

      switch (filterKey) {
        case "club_id":
          setClubFilter(null);
          params.delete("clubId");
          break;
        case "service_type":
          setItemServiceType(null);
          params.delete("serviceType");
          break;
        case "bill_type":
          setItemBillType(null);
          params.delete("billType");
          break;
        default:
          break;
      }

      navigate(`?${params.toString()}`, { replace: true });
    },
    [location.search, navigate]
  );

  // Handle date filter change - auto apply except for custom
  const handleDateFilterChange = useCallback((selected) => {
    setDateFilter(selected);
    if (selected?.value !== "custom") {
      setCustomFrom(null);
      setCustomTo(null);
      
      // Auto-apply non-custom date filters
      const params = new URLSearchParams(location.search);
      params.set("date", selected.value);
      params.delete("customFrom");
      params.delete("customTo");
      navigate(`?${params.toString()}`, { replace: true });
    }
  }, [location.search, navigate]);

  return (
    <div className="page--content">
      <div className="flex items-end justify-between gap-2 mb-2">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home >  Reports > Sales Reports > New Joinees Report`}</p>
          <h1 className="text-3xl font-semibold">New Joinees Report</h1>
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
              onChange={handleDateFilterChange}
              styles={customStyles}
              className="w-full"
            />
          </div>

          {dateFilter?.value === "custom" && (
            <>
              <div className="custom--date dob-format flex-1 max-w-[180px] w-full">
                <span className="absolute z-[1] mt-[11px] ml-[15px]">
                  <FaCalendarDays />
                </span>
                <DatePicker
                  selected={customFrom}
                  onChange={handleCustomFromChange}
                  placeholderText="From Date"
                  className="custom--input w-full input--icon"
                  minDate={subYears(new Date(), 20)}
                  maxDate={new Date()}
                  dateFormat="dd-MM-yyyy"
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
                  onChange={handleCustomToChange}
                  placeholderText="To Date"
                  className="custom--input w-full input--icon"
                  minDate={customFrom || subYears(new Date(), 20)}
                  maxDate={new Date()}
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  dateFormat="dd-MM-yyyy"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sales Summary Cards */}
      <div className="grid grid-cols-2 gap-5 mb-5 p-3 border bg-white shodow--box rounded-[10px]">
        <div className="border rounded-[5px] overflow-hidden w-full">
          <div className="flex gap-1 justify-between bg-[#F1F1F1] p-4 py-3">
            <div className="text-xl font-bold">Total Sales</div>
            <div className="text-xl font-bold">
              ₹{formatIndianNumber(totalSales)}
            </div>
          </div>
          <div className="grid grid-cols-3 h-full">
            {["Membership", "Package", "Product"].map((label, index) => (
              <div
                key={label}
                className={`flex flex-col ${
                  index !== 2 ? "border-r" : ""
                } text-center p-3 py-5 w-full`}
              >
                <div className="text-lg font-medium text-black">{label}</div>
                <div>
                  <span className="text-lg font-semibold">
                    ₹{formatIndianNumber(salesData[label])}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border rounded-[5px] overflow-hidden w-full">
          <div className="flex gap-1 justify-between bg-[#F1F1F1] p-4 py-3">
            <div className="text-xl font-bold">Services Sold</div>
            <div className="text-xl font-bold">
              {serviceCounts.Membership +
                serviceCounts.Package +
                serviceCounts.Product}
            </div>
          </div>

          <div className="grid grid-cols-3 h-full">
            <div className="flex flex-col border-r text-center p-3 py-5 w-full">
              <div className="text-lg font-medium text-black">Memberships</div>
              <div>
                <span className="text-lg font-semibold">
                  {serviceCounts.Membership}
                </span>
              </div>
            </div>

            <div className="flex flex-col border-r text-center p-3 py-5 w-full">
              <div className="text-lg font-medium text-black">Packages</div>
              <div>
                <span className="text-lg font-semibold">
                  {serviceCounts.Package}
                </span>
              </div>
            </div>

            <div className="flex flex-col text-center p-3 py-5 w-full">
              <div className="text-lg font-medium text-black">Products</div>
              <div>
                <span className="text-lg font-semibold">
                  {serviceCounts.Product}
                </span>
              </div>
            </div>
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
                            clubOptions.find((o) => o.value === pendingFilters.club) ||
                            null
                          }
                          options={clubOptions}
                          onChange={(option) => {
                            setPendingFilters(prev => ({
                              ...prev,
                              club: option?.value || null
                            }));
                          }}
                          styles={customStyles}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bill Type
                        </label>
                        <Select
                          value={pendingFilters.billType}
                          onChange={(option) => {
                            setPendingFilters(prev => ({
                              ...prev,
                              billType: option
                            }));
                          }}
                          options={BillTypeOptions}
                          placeholder="Select Type"
                          styles={customStyles}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Service Type
                        </label>
                        <Select
                          value={pendingFilters.serviceType}
                          onChange={(option) => {
                            setPendingFilters(prev => ({
                              ...prev,
                              serviceType: option
                            }));
                          }}
                          options={ServiceTypeOptions}
                          placeholder="Select Type"
                          styles={customStyles}
                        />
                      </div>
                    </div>

                    {/* Apply Button */}
                    <div className="flex justify-end pt-3">
                      <button
                        onClick={handleApplyFilters}
                        className="px-4 py-2 bg-black text-white rounded flex items-center gap-2 cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {Object.keys(appliedFilters).length > 0 && (
                <div className="flex gap-2 mt-4">
                  {Object.entries(appliedFilters).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between gap-1 border rounded-full bg-[#EEEEEE] min-h-[30px] px-3 text-sm"
                    >
                      <span>{value.label}</span>
                      <IoClose
                        onClick={() => removeFilter(key)}
                        className="cursor-pointer text-xl"
                      />
                    </div>
                  ))}
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
                  <th className="px-2 py-4 min-w-[50px]">S.no</th>
                  <th className="px-2 py-4 min-w-[150px]">Club Name</th>
                  <th className="px-2 py-4 min-w-[100px]">Member ID</th>
                  <th className="px-2 py-4 min-w-[150px]">Member Name</th>
                  <th className="px-2 py-4 min-w-[150px]">Service</th>
                  <th className="px-2 py-4 min-w-[150px]">Service Variation</th>
                  <th className="px-2 py-4 min-w-[130px]">Invoice ID</th>
                  <th className="px-2 py-4 min-w-[150px]">Purchase Date</th>
                  <th className="px-2 py-4 min-w-[120px]">Start Date</th>
                  <th className="px-2 py-4 min-w-[120px]">End Date</th>
                  <th className="px-2 py-4 min-w-[120px]">Total Check-ins</th>
                  <th className="px-2 py-4 min-w-[120px]">Lead Source</th>
                  <th className="px-2 py-4 min-w-[150px]">Sales Rep Name</th>
                  <th className="px-2 py-4 min-w-[100px]">Bill Type</th>
                  <th className="px-2 py-4 min-w-[100px]">Bill Amount</th>
                  <th className="px-2 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length ? (
                  filteredData.map((row, index) => (
                    <tr
                      key={row.id}
                      className="group bg-white border-b hover:bg-gray-50 transition duration-700"
                    >
                      <td className="px-2 py-4">{index + 1}</td>
                      <td className="px-2 py-4">{row.club_name || "-"}</td>
                      <td className="px-2 py-4">{row.member_id || "-"}</td>
                      <td className="px-2 py-4">{row.member_name || "-"}</td>
                      <td className="px-2 py-4">{row.serviceType || "-"}</td>
                      <td className="px-2 py-4">
                        {row.service_variation || "-"}
                      </td>
                      <td className="px-2 py-4">{row.invoice_id || "-"}</td>
                      <td className="px-2 py-4">{row.purchaseDate || "-"}</td>
                      <td className="px-2 py-4">{row.start_date || "-"}</td>
                      <td className="px-2 py-4">{row.end_date || "-"}</td>
                      <td className="px-2 py-4">{row.total_checkins || "-"}</td>
                      <td className="px-2 py-4">{row.lead_source || "-"}</td>
                      <td className="px-2 py-4">{row.sales_rep_name || "-"}</td>
                      <td className="px-2 py-4">{row.billType || "-"}</td>
                      <td className="px-2 py-4">₹{row.bill_amount || "-"}</td>
                      <td className="px-2 py-4">
                        <span
                          className={`flex items-center justify-between gap-1 rounded-full min-h-[30px] px-3 text-sm w-fit ${
                            row?.status !== "ACTIVE"
                              ? "bg-[#EEEEEE]"
                              : "bg-[#E8FFE6] text-[#138808]"
                          }`}
                        >
                          <FaCircle className="text-[10px]" /> {row?.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={16} className="text-center px-2 py-4">
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
  );
};

export default NewJoineesReport;