import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, subYears } from "date-fns";
import { FaCalendarDays, FaEye, FaPrint } from "react-icons/fa6";
import { customStyles, formatAutoDate, formatText } from "../../Helper/helper";
import Select from "react-select";
import ProductSoldPanel from "../../components/FilterPanel/ProductSoldPanel";
import { useLocation } from "react-router-dom";
import { useFormik } from "formik";
import { authAxios } from "../../config/config";
import { toast } from "react-toastify";
import Pagination from "../../components/common/Pagination";
import { format } from "date-fns";
import { FaShareSquare } from "react-icons/fa";
import Tooltip from "../../components/common/Tooltip";

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const ProductsSold = () => {
  const location = useLocation();
  const [productSoldData, setProductSoldData] = useState([]);
  const [dateFilter, setDateFilter] = useState(dateFilterOptions[1]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  const [sendModalOrder, setSendModalOrder] = useState(null);

  const [filtersInitialized, setFiltersInitialized] = useState(false);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [stats, setStats] = useState({
    memberships: 0,
    products: 0,
    group_class_count: 0,
    recovery: 0,
    personal_training: 0,
    pilates: 0,
  });

  // ✅ Single source of truth for applied filters
  const [appliedFilters, setAppliedFilters] = useState({
    club_id: null,
    bill_type: null,
    service_type: null,
    lead_source: null,
    lead_owner: null,
    pay_mode: null,
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      filterClub: null,
      filterBillType: null,
      filterServiceType: null,
      filterLeadSource: null,
      filterLeadOwner: null,
      filterPayMode: null,
    },
    onSubmit: (values) => {
      console.log(values);
    },
  });

  const normalizeProductSold = (item, index) => ({
    serialNumber: (page - 1) * rowsPerPage + index + 1,
    purchaseDate: item.purchase_date,
    clubName: item.club_name,
    memberId: item.membership_number,
    memberName: item.member_name,
    serviceType: item.service_type,
    service_name: item.service_name,
    variation_name: item.variation_name,
    startDate: item.start_date,
    endDate: item.end_date,
    billType: item.bill_type,
    lead_source: item.lead_source,
    lead_owner: item.lead_owner,
  });

  const fetchProductSold = async (currentPage = page) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };

      // Date Filter
      if (dateFilter?.value && dateFilter.value !== "custom") {
        params.dateFilter = dateFilter.value;
      }

      if (dateFilter?.value === "custom" && customFrom && customTo) {
        const formatDate = (d) => format(d, "yyyy-MM-dd");
        params.startDate = formatDate(customFrom);
        params.endDate = formatDate(customTo);
      }

      // ✅ Applied Filters
      if (appliedFilters.club_id) params.club_id = appliedFilters.club_id;
      if (appliedFilters.bill_type) params.bill_type = appliedFilters.bill_type;
      if (appliedFilters.service_type)
        params.service_type = appliedFilters.service_type;
      if (appliedFilters.lead_source)
        params.lead_source = appliedFilters.lead_source;

      console.log("🔍 API Request Params:", params);
      console.log("📊 Applied Filters:", appliedFilters);

      const res = await authAxios().get("/report/product/sold", { params });

      const responseData = res.data;
      const data = responseData?.data || [];

      console.log("✅ API Response:", {
        totalCount: responseData.totalCount,
        dataLength: responseData.data?.length,
      });

      const normalizedData = responseData.data?.map(normalizeProductSold) || [];

      setProductSoldData(normalizedData);
      setPage(responseData?.currentPage || 1);
      setTotalPages(responseData?.totalPage || 1);
      setTotalCount(responseData?.totalCount || data.length);
    } catch (err) {
      console.error("❌ API Error:", err);
      toast.error("Failed to fetch product sold report");
    }
  };

  const fetchProductSoldStats = async () => {
    try {
      let params = {};

      if (dateFilter?.value === "custom") {
        if (customFrom && customTo) {
          params.startDate = format(customFrom, "yyyy-MM-dd");
          params.endDate = format(customTo, "yyyy-MM-dd");
        } else {
          return; // don't fetch until both dates selected
        }
      } else {
        params.dateFilter = dateFilter?.value || "last_7_days";
      }

      const res = await authAxios().get("/report/product/sold/count", {
        params,
      });
      const data = res.data?.data || {};

      setStats({
        memberships: Number(data.memberships) || 0,
        products: Number(data.products) || 0,
        group_class_count: Number(data.group_class_count) || 0,
        recovery: Number(data.recovery) || 0,
        personal_training: Number(data.personal_training) || 0,
        pilates: Number(data.pilates) || 0,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch appointment stats");
    }
  };

  // ✅ Fetch data when filters change
  useEffect(() => {
    if (!filtersInitialized) return;

    fetchProductSold(1);
    fetchProductSoldStats();
  }, [
    filtersInitialized,
    dateFilter?.value,
    customFrom,
    customTo,
    appliedFilters.club_id,
    appliedFilters.bill_type,
    appliedFilters.service_type,
    appliedFilters.lead_source,
  ]);

  // ✅ Apply URL params on mount (automatic filtering)
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (!params.toString()) {
      setFiltersInitialized(true);
      return;
    }

    // Date
    const dateValue = params.get("date");
    const matchedDate = dateFilterOptions.find(
      (opt) => opt.value === dateValue
    );
    if (matchedDate) setDateFilter(matchedDate);

    if (params.get("customFrom"))
      setCustomFrom(new Date(params.get("customFrom")));
    if (params.get("customTo")) setCustomTo(new Date(params.get("customTo")));

    // URL → appliedFilters
    const urlFilters = {
      club_id: params.get("club_id"),
      bill_type: params.get("bill_type"),
      service_type: params.get("service_type"),
      lead_source: params.get("lead_source"),
    };

    setAppliedFilters(urlFilters);

    // Sync Formik
    formik.setValues({
      filterClub: urlFilters.club_id,
      filterBillType: urlFilters.bill_type,
      filterServiceType: urlFilters.service_type,
      filterLeadSource: urlFilters.lead_source,
      filterLeadOwner: urlFilters.lead_owner,
      filterPayMode: urlFilters.pay_mode,
    });

    setFiltersInitialized(true);
  }, [location.search]);

  const handleSendInvoice = (order) => {
    setSendModalOrder(order);
  };

  const confirmSend = (mode) => {
    alert(`Invoice sent to ${sendModalOrder.name} via ${mode}`);
    setSendModalOrder(null);
  };

  return (
    <>
      <div className="page--content">
        <div className="flex items-end justify-between gap-2 mb-2">
          <div className="title--breadcrumbs">
            <p className="text-sm">{`Home > Reports > All Orders`}</p>
            <h1 className="text-3xl font-semibold">All Orders</h1>
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
                      setCustomTo(null);
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
        <div className="grid grid-cols-6 gap-3 mb-5 p-3 border bg-white shodow--box rounded-[10px]">
          <div className="border rounded-[5px] overflow-hidden w-full">
            <div className="flex gap-1 justify-center bg-[#F1F1F1] p-4 py-3">
              <div className="text-lg font-bold">Memberships</div>
            </div>
            <div>
              <p className="text-3xl font-bold p-2 text-center py-5">
                {stats?.memberships}
              </p>
            </div>
          </div>
          <div className="border rounded-[5px] overflow-hidden w-full">
            <div className="flex gap-1 justify-center bg-[#F1F1F1] p-4 py-3">
              <div className="text-lg font-bold">Personal Training</div>
            </div>
            <div>
              <p className="text-3xl font-bold p-2 text-center py-5">
                {stats?.personal_training}
              </p>
            </div>
          </div>
          <div className="border rounded-[5px] overflow-hidden w-full">
            <div className="flex gap-1 justify-center bg-[#F1F1F1] p-4 py-3">
              <div className="text-lg font-bold">Recovery</div>
            </div>
            <div>
              <p className="text-3xl font-bold p-2 text-center py-5">
                {stats?.recovery}
              </p>
            </div>
          </div>
          <div className="border rounded-[5px] overflow-hidden w-full">
            <div className="flex gap-1 justify-center bg-[#F1F1F1] p-4 py-3">
              <div className="text-lg font-bold">Nourish</div>
            </div>
            <div>
              <p className="text-3xl font-bold p-2 text-center py-5">
                {stats?.products}
              </p>
            </div>
          </div>
          <div className="border rounded-[5px] overflow-hidden w-full">
            <div className="flex gap-1 justify-center bg-[#F1F1F1] p-4 py-3">
              <div className="text-lg font-bold">Pilates</div>
            </div>
            <div>
              <p className="text-3xl font-bold p-2 text-center py-5">
                {stats?.pilates}
              </p>
            </div>
          </div>
          <div className="border rounded-[5px] overflow-hidden w-full">
            <div className="flex gap-1 justify-center bg-[#F1F1F1] p-4 py-3">
              <div className="text-lg font-bold">Group Classes</div>
            </div>
            <div>
              <p className="text-3xl font-bold p-2 text-center py-5">
                {stats?.group_class_count}
              </p>
            </div>
          </div>
        </div>

        <div className="w-full p-3 border bg-white shodow--box rounded-[10px]">
          <div className="flex items-start gap-3 justify-between w-full mb-3 border-b border-b-[#D4D4D4] pb-3">
            <div>
              {/* ✅ Pass both appliedFilters and setAppliedFilters */}
              <ProductSoldPanel
                filterClub={formik.values.filterClub}
                filterBillType={formik.values.filterBillType}
                filterServiceType={formik.values.filterServiceType}
                filterLeadSource={formik.values.filterLeadSource}
                filterLeadOwner={formik.values.filterLeadOwner}
                filterPayMode={formik.values.filterPayMode}
                formik={formik}
                setFilterValue={(field, value) =>
                  formik.setFieldValue(field, value)
                }
                appliedFilters={appliedFilters}
                setAppliedFilters={setAppliedFilters}
              />
            </div>
          </div>

          <div className="table--data--bottom w-full">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left ">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    {/* <th className="px-2 py-4 min-w-[50px]">S.No.</th> */}
                    <th className="px-2 py-4 min-w-[120px]">Purchase date</th>
                    <th className="px-2 py-4 min-w-[120px]">Bill Type</th>
                    <th className="px-2 py-4 min-w-[150px]">Club Name</th>
                    <th className="px-2 py-4 min-w-[120px]">Member ID</th>
                    <th className="px-2 py-4 min-w-[120px]">Member Name</th>
                    <th className="px-2 py-4 min-w-[120px]">Invoice No</th>
                    <th className="px-2 py-4 min-w-[120px]">Service Type</th>
                    <th className="px-2 py-4 min-w-[120px]">Plan Type</th>
                    <th className="px-2 py-4 min-w-[150px]">Service Name</th>
                    <th className="px-2 py-4 min-w-[130px]">Variation</th>
                    <th className="px-2 py-4 min-w-[120px]">Start Date</th>
                    <th className="px-2 py-4 min-w-[120px]">End Date</th>
                    <th className="px-2 py-4 min-w-[120px]">Lead Source</th>
                    <th className="px-2 py-4 min-w-[150px]">Lead Owner</th>
                    <th className="px-2 py-4 min-w-[100px]">Amount</th>
                    <th className="px-2 py-4 min-w-[100px]">CGST</th>
                    <th className="px-2 py-4 min-w-[100px]">SGST</th>
                    <th className="px-2 py-4 min-w-[100px]">IGST</th>
                    <th className="px-2 py-4 min-w-[110px]">Final Amount</th>
                    <th className="px-2 py-4 min-w-[80px]">Paid</th>
                    <th className="px-2 py-4 min-w-[100px]">Pay Mode</th>
                    <th className="px-2 py-4 min-w-[120px]">Invoice Details</th>
                  </tr>
                </thead>
                <tbody>
                  {productSoldData.length > 0 ? (
                    productSoldData.map((row, idx) => (
                      <tr
                        key={row.serialNumber}
                        className="bg-white border-b hover:bg-gray-50 border-gray-200"
                      >
                        {/* <td className="px-2 py-4">{row?.serialNumber}</td> */}
                        <td className="px-2 py-4">
                          {formatAutoDate(row?.purchaseDate)}
                        </td>
                        <td className="px-2 py-4">
                          {row?.billType ? row?.billType : "--"}
                        </td>
                        <td className="px-2 py-4">
                          {row?.clubName ? row?.clubName : "--"}
                        </td>
                        <td className="px-2 py-4">
                          {row?.memberId ? row?.memberId : "--"}
                        </td>
                        <td className="px-2 py-4">{row?.memberName}</td>
                        <td className="px-2 py-4">
                          {row?.invoice_number ? row?.invoice_number : "--"}
                        </td>
                        <td className="px-2 py-4">
                          {row?.serviceType === "SUBSCRIPTION"
                            ? "Membership"
                            : formatText(row?.serviceType)}
                        </td>
                        <td className="px-2 py-4">
                          {row?.plan_type ? row?.plan_type : "--"}
                        </td>
                        <td className="px-2 py-4">
                          {row?.service_name ? row?.service_name : "--"}
                        </td>
                        <td className="px-2 py-4">
                          {row?.variation_name ? formatText(row?.variation_name) : "--"}
                        </td>
                        <td className="px-2 py-4">
                          {formatAutoDate(row?.startDate)}
                        </td>
                        <td className="px-2 py-4">
                          {formatAutoDate(row?.endDate)}
                        </td>
                        <td className="px-2 py-4">{row?.lead_source}</td>
                        <td className="px-2 py-4">
                          {row?.lead_owner ? row?.lead_owner : "--"}
                        </td>
                        <td className="px-2 py-4">
                          ₹{row?.amount ? row?.amount : 0}
                        </td>
                        <td className="px-2 py-4">
                          ₹{row?.cgst ? row?.cgst : 0}
                        </td>
                        <td className="px-2 py-4">
                          ₹{row?.sgst ? row?.sgst : 0}
                        </td>
                        <td className="px-2 py-4">
                          ₹{row?.igst ? row?.igst : 0}
                        </td>
                        <td className="px-2 py-4">
                          ₹{row?.final_amount ? row?.final_amount : 0}
                        </td>
                        <td className="px-2 py-4">
                          ₹{row?.paid ? row?.paid : 0}
                        </td>
                        <td className="px-2 py-4">
                          {row?.payment_mode ? row?.payment_mode : "--"}
                        </td>
                        <td className="px-2 py-4">
                          <div className="flex items-center gap-2">
                            <Tooltip content="View Invoice">
                              <button className="text-xl">
                                <FaEye />
                              </button>
                            </Tooltip>
                            <Tooltip content="Print Invoice">
                              <button className="text-xl">
                                <FaPrint />
                              </button>
                            </Tooltip>
                            <Tooltip content="Send Invoice">
                              <button
                                onClick={() => handleSendInvoice(row)}
                                className="text-xl"
                              >
                                <FaShareSquare />
                              </button>
                            </Tooltip>
                          </div>
                        </td>
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
            <Pagination
              page={page}
              totalPages={totalPages}
              rowsPerPage={rowsPerPage}
              totalCount={totalCount}
              currentDataLength={productSoldData.length}
              onPageChange={(newPage) => {
                fetchProductSold(newPage);
              }}
            />
          </div>
        </div>
      </div>

      {sendModalOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[300px]">
            <h2 className="text-lg font-semibold mb-4">
              Send Invoice to {sendModalOrder.name}
            </h2>
            <p className="mb-3">Select communication mode:</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => confirmSend("Email")}
                className="bg-blue-500 text-white px-3 py-2 rounded"
              >
                Email
              </button>
              <button
                onClick={() => confirmSend("SMS")}
                className="bg-green-500 text-white px-3 py-2 rounded"
              >
                SMS
              </button>
              <button
                onClick={() => confirmSend("WhatsApp")}
                className="bg-purple-500 text-white px-3 py-2 rounded"
              >
                WhatsApp
              </button>
            </div>
            <div className="mt-4 text-right">
              <button
                onClick={() => setSendModalOrder(null)}
                className="text-gray-600 hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductsSold;
