import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, subYears } from "date-fns";
import { FaCalendarDays } from "react-icons/fa6";
import { customStyles } from "../../../Helper/helper";
import Select from "react-select";
import SalesReportPanel from "../../../components/FilterPanel/SalesReportPanel";
import { salesReportData } from "../../../DummyData/DummyData";
import viewIcon from "../../../assets/images/icons/eye.svg";
import printIcon from "../../../assets/images/icons/print-icon.svg";
import mailIcon from "../../../assets/images/icons/mail-icon.svg";
import { useLocation } from "react-router-dom";
import {
  parse,
  isWithinInterval,
  startOfToday,
  startOfMonth,
  subDays,
  startOfDay,
  endOfDay,
} from "date-fns";

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const formatIndianNumber = (num) => new Intl.NumberFormat("en-IN").format(num);
const SalesReportPage = () => {
  const [data, setData] = useState(salesReportData);
  const [dateFilter, setDateFilter] = useState(dateFilterOptions[1]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filterValue = params.get('date');
    const customFromValue = params.get('customFrom');
    const customToValue = params.get('customTo');

    // Set the date filter based on the URL
    if (filterValue) {
      const matchedOption = dateFilterOptions.find(
        (option) => option.value === filterValue
      );
      if (matchedOption) {
        setDateFilter(matchedOption);
      }
    }

    // Set customFrom and customTo from the URL query parameters
    if (customFromValue) {
      setCustomFrom(customFromValue);
    }
    if (customToValue) {
      setCustomTo(customToValue);
    }
  }, [location.search]);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      date: params.get("date"),
      service_type: params.get("serviceType"), // e.g., Memberships
      billType: params.get("billType"),
      customFrom: params.get('customFrom'),
      customTo: params.get('customTo'),
    };
  }, [location.search]);

  const salesData = {
    Membership: 0,
    Package: 0,
    Product: 0,
  };
  data.forEach((item) => {
    const t = item.serviceType;
    if (t && salesData.hasOwnProperty(t)) {
      salesData[t] += item.finalAmount || 0; // or whichever field (amount, subtotal) you want
    }
  });

  const totalSales =
    salesData.Membership + salesData.Package + salesData.Product;

  const [itemBillType, setItemBillType] = useState(null);
  const [itemServiceType, setItemServiceType] = useState(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);

    // Extract billType from URL if available
    const billTypeParam = searchParams.get("billType");
    if (billTypeParam) {
      setItemBillType({ value: billTypeParam, label: billTypeParam });
    }

    // Extract serviceType from URL if available
    const serviceTypeParam = searchParams.get("serviceType");
    if (serviceTypeParam) {
      setItemServiceType({ value: serviceTypeParam, label: serviceTypeParam });
    }
  }, [location.search]);

  const serviceCounts = {
    Membership: 0,
    Package: 0,
    Product: 0,
  };

  data.forEach((item) => {
    const type = item.serviceType;
    if (type && serviceCounts.hasOwnProperty(type)) {
      serviceCounts[type]++;
    }
  });

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

  useEffect(() => {
  let filteredData = [...salesReportData];

  // Handle custom date filter
  if (dateFilter?.value === "custom") {
    const from = customFrom ? startOfDay(customFrom) : null;
    const to = customTo ? endOfDay(customTo) : null;

    if (from && to) {
      filteredData = filteredData.filter((item) => {
        const purchaseDate = parse(item.purchaseDate, "dd/MM/yyyy", new Date());
        return isWithinInterval(purchaseDate, { start: from, end: to });
      });
    }
  } else {
    const range = getDateRangeFromFilter(dateFilter?.value);

    if (range) {
      filteredData = filteredData.filter((item) => {
        const purchaseDate = parse(item.purchaseDate, "dd/MM/yyyy", new Date());

        if (isNaN(purchaseDate)) return false;

        return isWithinInterval(purchaseDate, {
          start: range.from,
          end: range.to,
        });
      });
    }
  }

  // Filter by serviceType
  if (queryParams.service_type) {
    filteredData = filteredData.filter(
      (item) =>
        item.serviceType?.toLowerCase() === queryParams.service_type?.toLowerCase()
    );
  }

  // Filter by billType
  if (queryParams.billType) {
    filteredData = filteredData.filter(
      (item) =>
        item.billType?.toLowerCase() === queryParams.billType?.toLowerCase()
    );
  }

  setData(filteredData);
}, [dateFilter, queryParams.date, queryParams.service_type, queryParams.billType, customFrom, customTo]);



  console.log(data, "SHIVAKAR");

  return (
    <>
      <div className="page--content">
        <div className="flex items-end justify-between gap-2 mb-2">
          <div className="title--breadcrumbs">
            <p className="text-sm">{`Home >  Reports >  Finance > Sales Report`}</p>
            <h1 className="text-3xl font-semibold">Sales Report</h1>
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
                // isClearable
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
                    onChange={(date) => setCustomFrom(date)}
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
                    minDate={subYears(new Date(), 20)}
                    maxDate={addYears(new Date(), 0)}
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
                <div className="text-lg font-medium text-black">
                  Memberships
                </div>
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

        <div className="w-full p-3 border bg-white shodow--box rounded-[10px]">
          <div className="flex items-start gap-3 justify-between w-full mb-3 border-b border-b-[#D4D4D4] pb-3">
            <div>
              <SalesReportPanel
                itemBillType={itemBillType}
                setItemBillType={setItemBillType}
                itemServiceType={itemServiceType}
                setItemServiceType={setItemServiceType}
              />
            </div>
          </div>

          <div className="table--data--bottom w-full">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-2 py-4 min-w-[50px]">S.No.</th>
                    <th className="px-2 py-4 min-w-[140px] max-w-fit">
                      Purchase Date
                    </th>
                    <th className="px-2 py-4 min-w-[100px] max-w-fit">
                      Bill Type
                    </th>
                    <th className="px-2 py-4 min-w-[100px] max-w-fit">
                      Club Name
                    </th>
                    <th className="px-2 py-4 min-w-[100px] max-w-fit">
                      Member ID
                    </th>
                    <th className="px-2 py-4 min-w-[150px] max-w-fit">
                      Member Name
                    </th>
                    <th className="px-2 py-4 min-w-[100px] max-w-fit">
                      Invoice No.
                    </th>
                    <th className="px-2 py-4 min-w-[110px] max-w-fit">
                      Service Type
                    </th>
                    <th className="px-2 py-4 min-w-[120px] max-w-fit">
                      Service Name
                    </th>
                    <th className="px-2 py-4 min-w-[120px] max-w-fit">
                      Start Date
                    </th>
                    <th className="px-2 py-4 min-w-[120px] max-w-fit">
                      End Date
                    </th>
                    <th className="px-2 py-4 min-w-[140px] max-w-fit">
                      Lead Owner
                    </th>
                    <th className="px-2 py-4 min-w-[100px] max-w-fit">
                      Amount
                    </th>
                    <th className="px-2 py-4 min-w-[100px] max-w-fit">
                      Discount
                    </th>
                    <th className="px-2 py-4 min-w-[100px] max-w-fit">
                      Subtotal
                    </th>
                    <th className="px-2 py-4 min-w-[100px] max-w-fit">CGST</th>
                    <th className="px-2 py-4 min-w-[100px] max-w-fit">SGST</th>
                    <th className="px-2 py-4 min-w-[100px] max-w-fit">IGST</th>
                    <th className="px-2 py-4 min-w-[120px] max-w-fit">
                      Final Amount
                    </th>
                    <th className="px-2 py-4 min-w-[100px] max-w-fit">
                      Pay Mode
                    </th>
                    <th className="px-2 py-4 min-w-[200px] max-w-fit">
                      Pro Forma Invoice Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, idx) => (
                    <tr
                      key={row.id}
                      className="bg-white border-b hover:bg-gray-50 border-gray-200"
                    >
                      <td className="px-2 py-4">{row?.serialNumber}</td>
                      <td className="px-2 py-4">{row?.purchaseDate}</td>
                      <td className="px-2 py-4">{row?.billType}</td>
                      <td className="px-2 py-4">{row?.clubName}</td>
                      <td className="px-2 py-4">{row?.memberId}</td>
                      <td className="px-2 py-4">{row.memberName}</td>
                      <td className="px-2 py-4">{row.invoiceNumber}</td>
                      <td className="px-2 py-4">{row.serviceType}</td>
                      <td className="px-2 py-4">{row.serviceName}</td>
                      <td className="px-2 py-4">{row.startDate}</td>
                      <td className="px-2 py-4">{row.endDate}</td>
                      <td className="px-2 py-4">{row.leadOwner}</td>
                      <td className="px-2 py-4">₹{row.amount}</td>
                      <td className="px-2 py-4">₹{row.discount}</td>
                      <td className="px-2 py-4">₹{row.subtotal}</td>
                      <td className="px-2 py-4">₹{row.cgst}</td>
                      <td className="px-2 py-4">₹{row.sgst}</td>
                      <td className="px-2 py-4">₹{row.igst}</td>
                      <td className="px-2 py-4">₹{row.finalAmount}</td>
                      <td className="px-2 py-4">{row.payMode}</td>
                      <td className="px-2 py-4">
                        <div className="flex">
                          <div className="bg-[#F1F1F1] border border-[#D4D4D4] rounded-l-[5px] w-[32px] h-[32px] flex items-center justify-center cursor-pointer">
                            <img src={viewIcon} />
                          </div>
                          <div
                            className={`bg-[#F1F1F1] border border-[#D4D4D4] rounded-[0px] w-[32px] h-[32px] flex items-center justify-center  `}
                          >
                            <img src={printIcon} />
                          </div>
                          <div
                            className={`bg-[#F1F1F1] border border-[#D4D4D4] rounded-r-[5px] w-[32px] h-[32px] flex items-center justify-center  `}
                          >
                            <img src={mailIcon} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SalesReportPage;
