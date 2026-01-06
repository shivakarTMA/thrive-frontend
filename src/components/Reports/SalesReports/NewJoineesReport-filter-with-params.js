import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { subYears } from "date-fns";
import { FaCalendarDays } from "react-icons/fa6";
import { customStyles, filterActiveItems } from "../../../Helper/helper";
import Select from "react-select";
import { useLocation, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { FaCircle } from "react-icons/fa";
import { authAxios } from "../../../config/config";
import { toast } from "react-toastify";

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
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
    purchaseDate: "30-12-2025",
    start_date: "05-03-2025",
    end_date: "04-06-2025",
    total_checkins: 5,
    lead_source: "hoardings",
    sales_rep_name: "prerna",
    billType: "New",
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
    purchaseDate: "30-12-2025",
    start_date: "01-01-2026",
    end_date: "31-03-2026",
    total_checkins: 2,
    lead_source: "referral",
    sales_rep_name: "amit",
    billType: "Renewal",
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

  const filteredData = useMemo(() => {
    let data = [...rawData];

    // Filter by billType
    if (urlParams.billType) {
      data = data.filter(
        (item) =>
          item.billType?.toLowerCase() === urlParams.billType.toLowerCase()
      );
    }

    // Filter by serviceType
    if (urlParams.serviceType) {
      data = data.filter(
        (item) =>
          item.serviceType?.toLowerCase() ===
          urlParams.serviceType.toLowerCase()
      );
    }

    // Filter by club
    if (urlParams.clubId) {
      data = data.filter(
        (item) => String(item.club_id) === String(urlParams.clubId)
      );
    }

    // Date filter
    if (urlParams.date) {
      const today = new Date();

      data = data.filter((item) => {
        const purchaseDate = new Date(
          item.purchaseDate.split("-").reverse().join("-")
        );

        if (urlParams.date === "today") {
          return purchaseDate.toDateString() === today.toDateString();
        }

        if (urlParams.date === "last_7_days") {
          const last7 = new Date();
          last7.setDate(today.getDate() - 7);
          return purchaseDate >= last7 && purchaseDate <= today;
        }

        if (
          urlParams.date === "custom" &&
          urlParams.customFrom &&
          urlParams.customTo
        ) {
          const from = new Date(urlParams.customFrom);
          const to = new Date(urlParams.customTo);
          return purchaseDate >= from && purchaseDate <= to;
        }

        return true;
      });
    }

    return data;
  }, [rawData, urlParams]);

  // Fetch club list
  const fetchClub = useCallback(async (search = "") => {
    try {
      const response = await authAxios().get("/club/list", {
        params: search ? { search } : {},
      });
      const data = response.data?.data || [];
      const activeOnly = filterActiveItems(data);
      setClubList(activeOnly);
      if (activeOnly.length === 1) {
        setClubFilter(activeOnly[0].id);
      }
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

  const handleCustomFromChange = useCallback(
    (date) => {
      setCustomFrom(date);
      if (date && customTo) {
        const params = new URLSearchParams(location.search);
        params.set("date", "custom");
        params.set("customFrom", format(date, "yyyy-MM-dd"));
        params.set("customTo", format(customTo, "yyyy-MM-dd"));
        navigate(`?${params.toString()}`, { replace: true });
      }
    },
    [customTo, location.search, navigate]
  );

  const handleCustomToChange = useCallback(
    (date) => {
      setCustomTo(date);
      if (customFrom && date) {
        const params = new URLSearchParams(location.search);
        params.set("date", "custom");
        params.set("customFrom", format(customFrom, "yyyy-MM-dd"));
        params.set("customTo", format(date, "yyyy-MM-dd"));
        navigate(`?${params.toString()}`, { replace: true });
      }
    },
    [customFrom, location.search, navigate]
  );

  // Handle date filter change - auto apply except for custom
  const handleDateFilterChange = useCallback(
    (selected) => {
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
    },
    [location.search, navigate]
  );

  useEffect(() => {
  if (urlParams.date) {
    const option = dateFilterOptions.find(
      (d) => d.value === urlParams.date
    );
    if (option) setDateFilter(option);
  }

  if (urlParams.customFrom) {
    setCustomFrom(new Date(urlParams.customFrom));
  }

  if (urlParams.customTo) {
    setCustomTo(new Date(urlParams.customTo));
  }

  if (urlParams.clubId) {
    setClubFilter(Number(urlParams.clubId));
  }
}, [urlParams]);

  return (
    <div className="page--content">
      <div className="flex items-end justify-between gap-2 mb-5">
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

          <div className="w-fit min-w-[200px]">
            <Select
              placeholder="Filter by club"
              value={clubOptions.find((o) => o.value === clubFilter) || null}
              options={clubOptions}
              onChange={(option) => setClubFilter(option?.value)}
              styles={customStyles}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="w-full p-3 border bg-white shodow--box rounded-[10px]">
        <div className="table--data--bottom w-full">
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-2 py-4 min-w-[50px]">S.no</th>
                  <th className="px-2 py-4 min-w-[150px]">Club Name</th>
                  <th className="px-2 py-4 min-w-[100px]">Member ID</th>
                  <th className="px-2 py-4 min-w-[150px]">Member Name</th>
                  <th className="px-2 py-4 min-w-[150px]">Service Type</th>
                  <th className="px-2 py-4 min-w-[150px]">Sevice Name</th>
                  <th className="px-2 py-4 min-w-[130px]">Invoice ID</th>
                  <th className="px-2 py-4 min-w-[150px]">Purchase Date</th>
                  <th className="px-2 py-4 min-w-[120px]">Start Date</th>
                  <th className="px-2 py-4 min-w-[120px]">End Date</th>
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
