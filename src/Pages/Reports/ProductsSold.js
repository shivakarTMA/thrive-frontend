import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, subYears } from "date-fns";
import { FaCalendarDays, FaEye, FaPrint } from "react-icons/fa6";
import {
  customStyles,
  filterActiveItems,
  formatAutoDate,
  formatText,
} from "../../Helper/helper";
import Select from "react-select";
import ProductSoldPanel from "../../components/FilterPanel/ProductSoldPanel";
import { useLocation, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { authAxios } from "../../config/config";
import { toast } from "react-toastify";
import Pagination from "../../components/common/Pagination";
import { format } from "date-fns";
import { FaShareSquare } from "react-icons/fa";
import Tooltip from "../../components/common/Tooltip";
import { useSelector } from "react-redux";
import { IoEyeOutline } from "react-icons/io5";

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const ProductsSold = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [productSoldData, setProductSoldData] = useState([]);
  const [dateFilter, setDateFilter] = useState(dateFilterOptions[1]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const userRole = user.role;

  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);

  const [sendModalOrder, setSendModalOrder] = useState(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // const [stats, setStats] = useState({
  //   memberships: 0,
  //   products: 0,
  //   group_class_count: 0,
  //   recovery: 0,
  //   personal_training: 0,
  //   pilates: 0,
  // });

  const [stats, setStats] = useState({});

  const [filtersInitialized, setFiltersInitialized] = useState(false);

  // ✅ Single source of truth for applied filters
  const [appliedFilters, setAppliedFilters] = useState({
    bill_type: null,
    service_type: null,
    package_type: null,
    lead_source: null,
    lead_owner_id: null,
    payment_method: null,
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      filterBillType: null,
      filterServiceType: null,
      filterPackageType: null,
      filterLeadSource: null,
      filterLeadOwner: null,
      filterPayMode: null,
    },
    onSubmit: (values) => {
      console.log(values);
    },
  });

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

  // ---------------------------
  // UPDATE URL WITH PARAMS
  // ---------------------------
  const updateURLParams = (filters) => {
    const params = new URLSearchParams();

    // Date filter
    if (dateFilter?.value && dateFilter.value !== "custom") {
      params.set("dateFilter", dateFilter.value);
    }

    if (dateFilter?.value === "custom" && customFrom && customTo) {
      params.set("startDate", format(customFrom, "yyyy-MM-dd"));
      params.set("endDate", format(customTo, "yyyy-MM-dd"));
    }

    // Club filter
    if (clubFilter?.value) {
      params.set("club_id", clubFilter.value);
    }

    // Applied filters
    if (filters.service_type) {
      params.set("service_type", filters.service_type);
    }
    if (filters.package_type) {
      params.set("package_type", filters.package_type);
    }
    if (filters.bill_type) {
      params.set("bill_type", filters.bill_type);
    }
    // if (filters.service_name) {
    //   params.set("service_name", filters.service_name);
    // }

    navigate(`?${params.toString()}`, { replace: true });
  };

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

      // Club filter
      if (clubFilter?.value) {
        params.club_id = clubFilter.value;
      }

      // ✅ Applied Filters

      if (appliedFilters.bill_type) params.bill_type = appliedFilters.bill_type;
      if (appliedFilters.service_type)
        params.service_type = appliedFilters.service_type;
      if (appliedFilters.package_type)
        params.package_type = appliedFilters.package_type;
      if (appliedFilters.lead_source)
        params.lead_source = appliedFilters.lead_source;
      if (appliedFilters.lead_owner_id)
        params.lead_owner_id = appliedFilters.lead_owner_id;
      if (appliedFilters.payment_method)
        params.payment_method = appliedFilters.payment_method;

      console.log("🔍 API Request Params:", params);

      const res = await authAxios().get("/report/product/sold", { params });

      const responseData = res.data;
      const data = responseData?.data || [];


      setProductSoldData(data);
      setPage(responseData?.currentPage || 1);
      setTotalPages(responseData?.totalPage || 1);
      setTotalCount(responseData?.totalCount || data.length);

      // Update stats
      const statusCount = responseData?.counts || {};
      setStats({
        memberships: statusCount.membership_count,
        group_class_count: statusCount.group_class_count,
        personal_training: statusCount.pt_count,
        recovery: statusCount.recovery_count,
        pilates: statusCount.pilates_count,
        products: statusCount.products_count,
      });
    } catch (err) {
      console.error("❌ API Error:", err);
      toast.error("Failed to fetch product sold report");
    }
  };

  // ---------------------------
  // INITIALIZE FROM URL
  // ---------------------------

  useEffect(() => {
    // Wait for clubList to be loaded
    if (clubList.length === 0) return;

    // Only run initialization once
    if (filtersInitialized) return;

    const params = new URLSearchParams(location.search);

    // Date filter
    const dateFilterValue = params.get("dateFilter");
    if (dateFilterValue) {
      const matchedDate = dateFilterOptions.find(
        (opt) => opt.value === dateFilterValue
      );
      if (matchedDate) {
        setDateFilter(matchedDate);
      }
    }

    // Custom date filter
    const startDate = params.get("startDate");
    const endDate = params.get("endDate");
    if (startDate && endDate) {
      setDateFilter(dateFilterOptions.find((d) => d.value === "custom"));
      setCustomFrom(new Date(startDate));
      setCustomTo(new Date(endDate));
    }

    // Club filter - only set from URL if present, otherwise default to first club
    const clubId = params.get("club_id");
    if (clubId) {
      const club = clubList.find((c) => c.id === Number(clubId));
      if (club) {
        setClubFilter({ label: club.name, value: club.id });
      }
    } else {
      // Set default club only on initial load
      setClubFilter({
        label: clubList[0].name,
        value: clubList[0].id,
      });
    }

    // Applied filters from URL
    const urlFilters = {
      bill_type: params.get("bill_type") || null,
      service_type: params.get("service_type") || null,
      package_type: params.get("package_type") || null,
    };

    setAppliedFilters(urlFilters);

    // Sync with formik
    formik.setValues({
      filterBillType: urlFilters.bill_type,
      filterServiceType: urlFilters.service_type,
      filterPackageType: urlFilters.package_type,
      filterLeadSource: urlFilters.lead_source,
      filterLeadOwner: urlFilters.lead_owner_id,
      filterPayMode: urlFilters.payment_method,
    });

    setFiltersInitialized(true);
  }, [clubList]);

  // ---------------------------
  // FETCH WHEN FILTERS CHANGE
  // ---------------------------
  useEffect(() => {
    if (!filtersInitialized) return;

        // 🚫 Prevent API call until both dates are selected
    if (dateFilter?.value === "custom" && (!customFrom || !customTo)) {
      return;
    }

    setPage(1);
    fetchProductSold(1);
    updateURLParams(appliedFilters);
  }, [
    filtersInitialized,
    dateFilter?.value,
    customFrom,
    customTo,
    clubFilter?.value,
    appliedFilters.bill_type,
    appliedFilters.service_type,
    appliedFilters.package_type,
    appliedFilters.lead_owner_id,
    appliedFilters.lead_source,
    appliedFilters.payment_method,
  ]);

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
        <div className="flex items-end justify-between gap-2 mb-5">
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

            <div className="w-fit min-w-[180px]">
              <Select
                placeholder="Filter by club"
                value={clubFilter}
                options={clubOptions}
                onChange={(option) => setClubFilter(option)}
                isClearable={userRole === "ADMIN" ? true : false}
                styles={customStyles}
              />
            </div>
          </div>
        </div>

        {/* Dynamic Statistics */}
        <div className="grid grid-cols-6 gap-3 mb-5 p-3 border bg-white shodow--box rounded-[10px]">
          {stats?.memberships !== undefined && (
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
          )}
          {stats?.personal_training !== undefined && (
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
          )}
          {stats?.recovery !== undefined && (
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
          )}
          {stats?.products !== undefined && (
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
          )}
          {stats?.pilates !== undefined && (
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
          )}
          {stats?.group_class_count !== undefined && (
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
          )}
        </div>

        <div className="w-full p-3 border bg-white shodow--box rounded-[10px]">
          <div className="flex items-start gap-3 justify-between w-full mb-3 border-b border-b-[#D4D4D4] pb-3">
            <div>
              {/* ✅ Pass both appliedFilters and setAppliedFilters */}
              <ProductSoldPanel
                userRole={userRole}
                clubId={clubFilter?.value}
                filterBillType={formik.values.filterBillType}
                filterServiceType={formik.values.filterServiceType}
                filterPackageType={formik.values.filterPackageType}
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
                    <th className="px-2 py-4 min-w-[90px]">Bill Type</th>
                    <th className="px-2 py-4 min-w-[150px]">Club Name</th>
                    <th className="px-2 py-4 min-w-[120px]">Member ID</th>
                    <th className="px-2 py-4 min-w-[120px]">Member Name</th>
                    <th className="px-2 py-4 min-w-[130px]">Invoice No</th>
                    <th className="px-2 py-4 min-w-[120px]">Package Type</th>
                    <th className="px-2 py-4 min-w-[150px]">Service Type</th>
                    <th className="px-2 py-4 min-w-[120px]">Plan Type</th>
                    <th className="px-2 py-4 min-w-[200px]">Service Name</th>
                    <th className="px-2 py-4 min-w-[130px]">Variation</th>
                    <th className="px-2 py-4 min-w-[130px]">Trainer Name</th>
                    <th className="px-2 py-4 min-w-[120px]">Start Date</th>
                    <th className="px-2 py-4 min-w-[120px]">End Date</th>
                    <th className="px-2 py-4 min-w-[120px]">Lead Source</th>
                    <th className="px-2 py-4 min-w-[150px]">Lead Owner</th>
                    <th className="px-2 py-4 min-w-[100px]">Amount</th>
                    <th className="px-2 py-4 min-w-[100px]">CGST</th>
                    <th className="px-2 py-4 min-w-[100px]">SGST</th>
                    <th className="px-2 py-4 min-w-[100px]">IGST</th>
                    <th className="px-2 py-4 min-w-[130px]">Final Amount</th>
                    <th className="px-2 py-4 min-w-[120px]">Paid Amount</th>
                    <th className="px-2 py-4 min-w-[120px]">Pay Mode</th>
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
                          {formatAutoDate(row?.purchase_date)}
                        </td>
                        <td className="px-2 py-4">
                          {row?.bill_type ? formatText(row?.bill_type) : "--"}
                        </td>
                        <td className="px-2 py-4">
                          {row?.club_name ? row?.club_name : "--"}
                        </td>
                        <td className="px-2 py-4">
                          {row?.membership_number
                            ? row?.membership_number
                            : "--"}
                        </td>
                        <td className="px-2 py-4">
                          {row?.member_name ? row?.member_name : "--"}
                        </td>
                        <td className="px-2 py-4">
                          {row?.invoice_no ? row?.invoice_no : "--"}
                        </td>
                        <td className="px-2 py-4">
                          {row?.package_type === "SUBSCRIPTION"
                            ? "Membership"
                            : row?.package_type === "PRODUCT" ? "Nourish" : formatText(row?.package_type)}
                        </td>
                        <td className="px-2 py-4">
                          {row?.service_type === "SUBSCRIPTION"
                            ? "Membership"
                            : row?.service_type === "PRODUCT" ? "Nourish" : formatText(row?.service_type)}
                        </td>
                        <td className="px-2 py-4">
                          {row?.plan_type ? row?.plan_type : "--"}
                        </td>
                        <td className="px-2 py-4">
                          {row?.service_name ? row?.service_name : "--"}
                        </td>
                        <td className="px-2 py-4">
                          {row?.variation_name
                            ? formatText(row?.variation_name)
                            : "--"}
                        </td>
                        <td className="px-2 py-4">
                          {row?.trainer_name ? row?.trainer_name : "--"}
                        </td>
                        <td className="px-2 py-4">
                          {formatAutoDate(row?.start_date)}
                        </td>
                        <td className="px-2 py-4">
                          {formatAutoDate(row?.end_date)}
                        </td>
                        <td className="px-2 py-4">{row?.lead_source}</td>
                        <td className="px-2 py-4">
                          {row?.lead_owner ? row?.lead_owner : "--"}
                        </td>
                        <td className="px-2 py-4">
                          ₹{row?.amount ? row?.amount : 0}
                        </td>
                        <td className="px-2 py-4">
                          ₹{row?.cgst_amount ? row?.cgst_amount : 0}
                        </td>
                        <td className="px-2 py-4">
                          ₹{row?.sgst_amount ? row?.sgst_amount : 0}
                        </td>
                        <td className="px-2 py-4">
                          ₹{row?.igst_amount ? row?.igst_amount : 0}
                        </td>
                        <td className="px-2 py-4">
                          ₹{row?.booking_amount ? row?.booking_amount : 0}
                        </td>
                        <td className="px-2 py-4">
                          ₹{row?.paid_amount ? row?.paid_amount : 0}
                        </td>
                        <td className="px-2 py-4">
                          {row?.payment_method
                            ? formatText(row?.payment_method)
                            : "--"}
                        </td>
                        <td className="px-2 py-4">
                          <div className="flex items-center gap-2">
                            <Tooltip content="View Invoice">
                              <button className="text-xl">
                                <IoEyeOutline />
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
