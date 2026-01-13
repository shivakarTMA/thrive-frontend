import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, subYears } from "date-fns";
import { FaCalendarDays } from "react-icons/fa6";
import { customStyles } from "../../Helper/helper";
import Select from "react-select";
import ProductSoldPanel from "../../components/FilterPanel/ProductSoldPanel";
import { productsSold } from "../../DummyData/DummyData";
import { useLocation } from "react-router-dom";
import {
  parse,
  isWithinInterval,
  startOfMonth,
  subDays,
  startOfDay,
  endOfDay,
} from "date-fns";
import { useFormik } from "formik";

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const ProductsSold = () => {
  const location = useLocation();
  const [dateFilter, setDateFilter] = useState(dateFilterOptions[1]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  const [appliedFilters, setAppliedFilters] = useState(null);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      filterClub: null,
      filterBillType: null,
      filterServiceType: null,
      filterServiceName: null,
      filterLeadSource: null,
    },
    onSubmit: (values) => {
      console.log(values);
    },
  });

  // Extract query params
  const queryParams = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      date: params.get("date"),
      status: params.get("status"),
      bill_type: params.get("bill_type"),
      customFrom: params.get("customFrom"),
      customTo: params.get("customTo"),
      club_id: params.get("club_id"),
      service_type: params.get("service_type"),
      service_name: params.get("service_name"),
      lead_source: params.get("lead_source"),
    };
  }, [location.search]);

  // Apply URL params on mount/change
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    // Date filter
    const dateValue = params.get("date");
    const matchedDate = dateFilterOptions.find(
      (opt) => opt.value === dateValue
    );
    if (matchedDate) {
      setDateFilter(matchedDate);
    }

    // Custom dates
    if (params.get("customFrom")) {
      setCustomFrom(new Date(params.get("customFrom")));
    }
    if (params.get("customTo")) {
      setCustomTo(new Date(params.get("customTo")));
    }

    // Apply all filter params to Formik
    formik.setValues({
      filterClub: params.get("club_id") ? Number(params.get("club_id")) : null,

      filterBillType: params.get("bill_type") || null,
      filterServiceType: params.get("service_type") || null,
      filterServiceName: params.get("service_name")
        ? Number(params.get("service_name"))
        : null,
      filterLeadSource: params.get("lead_source") || null,
    });
  }, [location.search]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (formik.values.filterClub) {
      params.set("club_id", formik.values.filterClub);
    } else {
      params.delete("club_id");
    }

    window.history.replaceState({}, "", `${location.pathname}?${params}`);
  }, [formik.values.filterClub]);

  // Single source of truth for filters
  const filters = useMemo(() => {
    if (!appliedFilters) return null;

    return {
      dateType: dateFilter?.value,
      customFrom,
      customTo,
      club_id: appliedFilters.club_id,
      billType: appliedFilters.bill_type,
      serviceType: appliedFilters.service_type,
      serviceName: appliedFilters.service_name,
      leadSource: appliedFilters.lead_source,
      status: queryParams.status,
    };
  }, [appliedFilters, dateFilter, customFrom, customTo, queryParams.status]);

  const handleApplyFilters = (filtersFromPanel) => {
    setAppliedFilters(filtersFromPanel);
  };

  // Single filtering function
  const applyAllFilters = (data, filters) => {
    return data.filter((item) => {
      const purchaseDate = parse(item.purchaseDate, "dd/MM/yyyy", new Date());

      // Check if date parsing failed
      if (isNaN(purchaseDate.getTime())) {
        console.warn("Invalid date:", item.purchaseDate);
        return false;
      }

      // DATE FILTER
      if (filters?.dateType) {
        let from = null;
        let to = null;

        const allDates = productsSold
          .map((i) => parse(i.purchaseDate, "dd/MM/yyyy", new Date()))
          .filter((d) => !isNaN(d));

        const baseDate = allDates.length
          ? new Date(Math.max(...allDates))
          : new Date();

        if (filters?.dateType === "today") {
          from = startOfDay(baseDate);
          to = endOfDay(baseDate);
        }

        if (filters?.dateType === "last_7_days") {
          from = startOfDay(subDays(baseDate, 6));
          to = endOfDay(baseDate);
        }

        if (filters?.dateType === "month_till_date") {
          from = startOfDay(startOfMonth(baseDate));
          to = endOfDay(baseDate);
        }

        if (filters?.dateType === "custom") {
          if (!filters?.customFrom || !filters?.customTo) return true;
          from = startOfDay(filters?.customFrom);
          to = endOfDay(filters?.customTo);
        }

        if (from && to) {
          if (!isWithinInterval(purchaseDate, { start: from, end: to })) {
            return false;
          }
        }
      }

      // CLUB FILTER
      if (filters?.club_id && item.club_id !== parseInt(filters?.club_id)) {
        return false;
      }

      // BILL TYPE FILTER
      if (
        filters?.billType &&
        item.billType?.toLowerCase() !== filters?.billType.toLowerCase()
      ) {
        return false;
      }

      // SERVICE TYPE FILTER (match by serviceType field)
      if (
        filters?.serviceType &&
        item.serviceType?.toLowerCase() !== filters?.serviceType.toLowerCase()
      ) {
        return false;
      }

      // SERVICE NAME FILTER (match by serviceId)
      if (
        filters?.serviceName &&
        Number(item.service_id) !== Number(filters?.serviceName)
      ) {
        return false;
      }

      // LEAD SOURCE FILTER
      if (
        filters?.leadSource &&
        item.lead_source?.toLowerCase() !== filters?.leadSource.toLowerCase()
      ) {
        return false;
      }

      // STATUS FILTER
      if (
        filters?.status &&
        item.status?.toLowerCase() !== filters?.status.toLowerCase()
      ) {
        return false;
      }

      return true;
    });
  };

  // Apply filters to get filtered data
  const filteredData = useMemo(() => {
    const result = applyAllFilters(productsSold, filters);
    console.log("Filtered Data:", result);
    console.log("Applied Filters:", filters);
    return result;
  }, [filters]);

  // Calculate statistics from filtered data
  const stats = useMemo(() => {
    const serviceCounts = {
      Membership: 0,
      "Personal Training": 0,
      Pilates: 0,
      Recovery: 0,
      Cafe: 0,
    };

    filteredData.forEach((item) => {
      const serviceName = item.servicesName;
      if (serviceCounts.hasOwnProperty(serviceName)) {
        serviceCounts[serviceName]++;
      }
    });

    return {
      totalRecords: filteredData.length,
      totalUniqueMembers: new Set(filteredData.map((i) => i.memberId)).size,
      serviceCounts,
    };
  }, [filteredData]);

  useEffect(() => {
    if (!Object.values(queryParams).some(Boolean)) return;

    const initialFilters = {
      club_id: queryParams.club_id ? Number(queryParams.club_id) : null,
      bill_type: queryParams.bill_type || null,
      service_type: queryParams.service_type || null,
      service_name: queryParams.service_name
        ? Number(queryParams.service_name)
        : null,
      lead_source: queryParams.lead_source || null,
    };

    setAppliedFilters(initialFilters);
  }, [queryParams]);

  return (
    <>
      <div className="page--content">
        <div className="flex items-end justify-between gap-2 mb-2">
          <div className="title--breadcrumbs">
            <p className="text-sm">{`Home > Reports > Products Sold`}</p>
            <h1 className="text-3xl font-semibold">Products Sold</h1>
          </div>
        </div>

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

            {dateFilter?.value === "custom" && (
              <>
                <div className="custom--date dob-format flex-1 max-w-[180px] w-full">
                  <span className="absolute z-[1] mt-[11px] ml-[15px]">
                    <FaCalendarDays />
                  </span>
                  <DatePicker
                    selected={customFrom}
                    onChange={(date) => {
                      setCustomFrom(date);
                      setCustomTo(null); // ✅ reset To Date if From Date changes
                    }}
                    placeholderText="From Date"
                    className="custom--input w-full input--icon"
                    minDate={subYears(new Date(), 20)}
                    maxDate={addYears(new Date(), 0)}
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
                    onChange={(date) => setCustomTo(date)}
                    placeholderText="To Date"
                    className="custom--input w-full input--icon"
                    minDate={customFrom || subYears(new Date(), 20)}
                    maxDate={addYears(new Date(), 0)}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    dateFormat="dd-MM-yyyy"
                    disabled={!customFrom}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Statistics */}
        <div className="grid grid-cols-5 gap-3 mb-5 p-3 border bg-white shodow--box rounded-[10px]">
          <div className="border rounded-[5px] overflow-hidden w-full">
            <div className="flex gap-1 justify-center bg-[#F1F1F1] p-4 py-3">
              <div className="text-lg font-bold">Memberships</div>
            </div>
            <div>
              <p className="text-3xl font-bold p-2 text-center py-5">
                {stats.serviceCounts.Membership}
              </p>
            </div>
          </div>
          <div className="border rounded-[5px] overflow-hidden w-full">
            <div className="flex gap-1 justify-center bg-[#F1F1F1] p-4 py-3">
              <div className="text-lg font-bold">Personal Training</div>
            </div>
            <div>
              <p className="text-3xl font-bold p-2 text-center py-5">
                {stats.serviceCounts["Personal Training"]}
              </p>
            </div>
          </div>
          <div className="border rounded-[5px] overflow-hidden w-full">
            <div className="flex gap-1 justify-center bg-[#F1F1F1] p-4 py-3">
              <div className="text-lg font-bold">Pilates</div>
            </div>
            <div>
              <p className="text-3xl font-bold p-2 text-center py-5">
                {stats.serviceCounts.Pilates}
              </p>
            </div>
          </div>
          <div className="border rounded-[5px] overflow-hidden w-full">
            <div className="flex gap-1 justify-center bg-[#F1F1F1] p-4 py-3">
              <div className="text-lg font-bold">Recovery</div>
            </div>
            <div>
              <p className="text-3xl font-bold p-2 text-center py-5">
                {stats.serviceCounts.Recovery}
              </p>
            </div>
          </div>
          <div className="border rounded-[5px] overflow-hidden w-full">
            <div className="flex gap-1 justify-center bg-[#F1F1F1] p-4 py-3">
              <div className="text-lg font-bold">Cafe</div>
            </div>
            <div>
              <p className="text-3xl font-bold p-2 text-center py-5">
                {stats.serviceCounts.Cafe}
              </p>
            </div>
          </div>
        </div>

        <div className="w-full p-3 border bg-white shodow--box rounded-[10px]">
          <div className="flex items-start gap-3 justify-between w-full mb-3 border-b border-b-[#D4D4D4] pb-3">
            <div>
              <ProductSoldPanel
                filterClub={formik.values.filterClub}
                filterBillType={formik.values.filterBillType}
                filterServiceType={formik.values.filterServiceType}
                filterServiceName={formik.values.filterServiceName}
                filterLeadSource={formik.values.filterLeadSource}
                formik={formik}
                setFilterValue={(field, value) =>
                  formik.setFieldValue(field, value)
                }
                queryParams={queryParams}
                onApply={handleApplyFilters}
              />
            </div>
          </div>

          <div className="table--data--bottom w-full">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-2 py-4 min-w-[50px]">S.No.</th>
                    <th className="px-2 py-4 min-w-[120px]">Purchase date</th>
                    <th className="px-2 py-4 min-w-[120px]">Bill Type</th>
                    <th className="px-2 py-4 min-w-[120px]">Club Name</th>
                    <th className="px-2 py-4 min-w-[120px]">Member ID</th>
                    <th className="px-2 py-4 min-w-[120px]">Member Name</th>
                    <th className="px-2 py-4 min-w-[120px]">Service Type</th>
                    <th className="px-2 py-4 min-w-[150px]">Service Name</th>
                    <th className="px-2 py-4 min-w-[130px]">Variation</th>
                    <th className="px-2 py-4 min-w-[120px]">Start Date</th>
                    <th className="px-2 py-4 min-w-[120px]">End Date</th>
                    <th className="px-2 py-4 min-w-[120px]">Lead Source</th>
                    <th className="px-2 py-4 min-w-[120px]">Lead Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((row, idx) => (
                      <tr
                        key={row.serialNumber}
                        className="bg-white border-b hover:bg-gray-50 border-gray-200"
                      >
                        <td className="px-2 py-4">{row?.serialNumber}</td>
                        <td className="px-2 py-4">{row?.purchaseDate}</td>
                        <td className="px-2 py-4">{row?.billType}</td>
                        <td className="px-2 py-4">{row?.clubName}</td>
                        <td className="px-2 py-4">{row?.memberId}</td>
                        <td className="px-2 py-4">{row?.memberName}</td>
                        <td className="px-2 py-4">{row?.serviceType}</td>
                        <td className="px-2 py-4">{row?.servicesName}</td>
                        <td className="px-2 py-4">{row?.variation}</td>
                        <td className="px-2 py-4">{row?.startDate}</td>
                        <td className="px-2 py-4">{row?.endDate}</td>
                        <td className="px-2 py-4">{row?.lead_source}</td>
                        <td className="px-2 py-4">{row?.leadOwner}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="13"
                        className="px-2 py-8 text-center text-gray-500"
                      >
                        No data found for the selected filters
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

export default ProductsSold;
