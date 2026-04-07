import React, { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, subYears } from "date-fns";
import { FaCalendarDays, FaEye, FaPrint } from "react-icons/fa6";
import {
  customStyles,
  filterActiveItems,
  formatAutoDate,
  formatIndianNumber,
  formatText,
  selectIcon,
} from "../../Helper/helper";
import Select from "react-select";
import ProductSoldPanel from "../../components/FilterPanel/ProductSoldPanel";
import { useLocation, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { authAxios } from "../../config/config";
import { toast } from "react-toastify";
import Pagination from "../../components/common/Pagination";
import { format } from "date-fns";
import Tooltip from "../../components/common/Tooltip";
import { useSelector } from "react-redux";
import { MdFileDownload } from "react-icons/md";
import { IoIosShareAlt } from "react-icons/io";
import IsLoadingHOC from "../../components/common/IsLoadingHOC";
import { LuDownload } from "react-icons/lu";
import { IoCloseCircle } from "react-icons/io5";
import { FaListUl } from "react-icons/fa";

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const ProductsSold = (props) => {
  const { setLoading } = props;
  const location = useLocation();
  const navigate = useNavigate();
  const [productSoldData, setProductSoldData] = useState([]);
  const [dateFilter, setDateFilter] = useState(dateFilterOptions[0]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const userRole = user.role;

  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);

  const [sendModalOrder, setSendModalOrder] = useState(null);
  const [exportShowModal, setExportShowModal] = useState(false);
  const leadBoxRef = useRef(null);

  const [clubIdExport, setClubIdExport] = useState("");
  const [dateExport, setDateExport] = useState(null);
  const [formatExport, setFormatExport] = useState("excel");

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

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
      console.error(error);
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

  const selectedClub =
    clubOptions.find((opt) => opt.value === clubFilter?.value) || null;

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
        (opt) => opt.value === dateFilterValue,
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
    // if (clubId) {
    //   const club = clubList.find((c) => c.id === Number(clubId));
    //   if (club) {
    //     setClubFilter({ label: club.name, value: club.id });
    //   }
    // } else {
    //   // Set default club only on initial load
    //   setClubFilter({
    //     label: clubList[0].name,
    //     value: clubList[0].id,
    //   });
    // }
    if (!clubFilter) {
      if (clubId) {
        const club = clubList.find((c) => c.id === Number(clubId));
        if (club) {
          setClubFilter({ label: club.name, value: club.id });
        }
      } else {
        setClubFilter({
          label: clubList[0].name,
          value: clubList[0].id,
        });
      }
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

  const handleSendInvoice = (row) => {
    setSendModalOrder({
      ...row, // copies all properties including id
    });
  };

  const confirmSend = async (mode) => {
    if (!sendModalOrder) return;

    if (mode !== "Email") {
      toast.info(`${mode} integration not implemented yet`);
      return;
    }

    if (!sendModalOrder.member_id) {
      toast.error("Member ID is missing. Cannot send invoice.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        invoice_no: sendModalOrder.invoice_no,
        order_type: sendModalOrder.order_type, // PACKAGE | SUBSCRIPTION | PRODUCT
      };

      console.log(payload, "payload");

      // Use dynamic id from sendModalOrder
      await authAxios().post(
        `/member/send/invoice/email/${sendModalOrder.member_id}`,
        payload,
      );

      toast.success(`Invoice sent successfully on Email`);
      setSendModalOrder(null);
    } catch (error) {
      console.error("Send invoice failed:", error);
      toast.error("Failed to send invoice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async (row) => {
    setLoading(true);
    try {
      const payload = {
        order_id: row.order_id, // ⚠️ confirm correct key (id / order_id)
        order_type: row.package_type, // SUBSCRIPTION | PACKAGE | PRODUCT
      };

      const res = await authAxios().post(
        "/invoice/download",
        payload,
        { responseType: "blob" }, // 👈 IMPORTANT
      );

      // Create blob URL
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      // Auto-download
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice_${payload.order_id}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
      setLoading(false);
    } catch (err) {
      console.error("Invoice download failed", err);
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setExportShowModal(false);
      setClubIdExport("");
      setDateExport(null);
      setFormatExport("excel");
    }
  };

  const handleDownload = async (e) => {
    e.preventDefault();

    if (!clubIdExport || !dateExport || !formatExport) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const response = await authAxios().get(
        `/report/prologic/export?date=${dateExport}&club_id=${clubIdExport}&format=${formatExport}`,
        { responseType: "blob" },
      );

      const blob = new Blob([response.data]);
      const link = document.createElement("a");

      const fileName = formatExport === "excel" ? "report.xlsx" : "report.xml";

      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();

      setExportShowModal(false);
      setClubIdExport("");
      setDateExport(null);
      setFormatExport("excel");
      toast.success("File downloaded successfully");
    } catch (error) {
      console.error(error);
    }
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
                  <span className="absolute z-[1] mt-[10px] ml-[15px]">
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
                  <span className="absolute z-[1] mt-[10px] ml-[15px]">
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
                value={selectedClub}
                options={clubOptions}
                onChange={(option) => setClubFilter(option)}
                isClearable={userRole === "ADMIN" ? true : false}
                styles={customStyles}
              />
            </div>
          </div>
          {(userRole === "FINANCE_MANAGER" || userRole === "ADMIN") && (
            <button
              onClick={() => setExportShowModal(true)}
              className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
            >
              <LuDownload /> <span>Export</span>
            </button>
          )}
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
                            : row?.package_type === "PRODUCT"
                              ? "Nourish"
                              : formatText(row?.package_type)}
                        </td>
                        <td className="px-2 py-4">
                          {row?.service_type === "SUBSCRIPTION"
                            ? "Membership"
                            : row?.service_type === "PRODUCT"
                              ? "Nourish"
                              : formatText(row?.service_type)}
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
                          ₹{row?.amount ? formatIndianNumber(row?.amount) : 0}
                        </td>
                        <td className="px-2 py-4">
                          ₹
                          {row?.cgst_amount
                            ? formatIndianNumber(row?.cgst_amount)
                            : 0}
                        </td>
                        <td className="px-2 py-4">
                          ₹
                          {row?.sgst_amount
                            ? formatIndianNumber(row?.sgst_amount)
                            : 0}
                        </td>
                        <td className="px-2 py-4">
                          ₹
                          {row?.igst_amount
                            ? formatIndianNumber(row?.igst_amount)
                            : 0}
                        </td>
                        <td className="px-2 py-4">
                          ₹
                          {row?.booking_amount
                            ? formatIndianNumber(row?.booking_amount)
                            : 0}
                        </td>
                        <td className="px-2 py-4">
                          ₹
                          {row?.paid_amount
                            ? formatIndianNumber(row?.paid_amount)
                            : 0}
                        </td>
                        <td className="px-2 py-4">
                          {row?.payment_method
                            ? formatText(row?.payment_method)
                            : "--"}
                        </td>
                        <td className="px-2 py-4">
                          <div className="flex">
                            <Tooltip
                              id={`tooltip-edit-${row.id}`}
                              content="Download Invoice"
                              place="left"
                            >
                              <div
                                className="bg-[#F1F1F1] border border-[#D4D4D4] rounded-l-[5px] w-[32px] h-[32px] flex items-center justify-center cursor-pointer"
                                onClick={() => downloadInvoice(row)}
                              >
                                <MdFileDownload className="text-[18px]" />
                              </div>
                            </Tooltip>
                            <Tooltip
                              id={`tooltip-return-${row.id}`}
                              content="Send Invoice"
                              place="left"
                            >
                              <div
                                className={`bg-[#F1F1F1] border border-[#D4D4D4] rounded-r-[5px] w-[32px] h-[32px] flex items-center justify-center cursor-pointer `}
                                onClick={() => handleSendInvoice(row)}
                              >
                                <IoIosShareAlt className="text-[18px]" />
                              </div>
                            </Tooltip>
                          </div>

                          {/* <div className="flex items-center gap-2">
                            <Tooltip content="View Invoice">
                              <button className="text-xl">
                                <IoEyeOutline />
                              </button>
                            </Tooltip>
                            <Tooltip content="Print Invoice">
                              <button
                                className="text-xl"
                                onClick={() => downloadInvoice(row)}
                              >
                                <MdFileDownload />
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
                          </div> */}
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
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[5]">
          <div className="bg-white p-6 rounded shadow-lg w-[300px]">
            <h2 className="text-lg font-semibold mb-4">
              Send Invoice to {sendModalOrder?.name}
            </h2>
            {/* <p className="mb-3">Select communication mode:</p> */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => confirmSend("Email")}
                className="bg-blue-500 text-white px-3 py-2 rounded"
              >
                Email
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

      {/* Export */}
      {exportShowModal && (
        <div
          className="bg--blur create--lead--container overflow-auto hide--overflow fixed top-0 left-0 z-[999] w-full bg-black bg-opacity-60 h-full"
          onClick={handleOverlayClick}
        >
          <div
            className="min-h-[70vh] w-[95%] max-w-[600px] mx-auto mt-[100px] mb-[100px] container--leadbox rounded-[10px] flex flex-col"
            ref={leadBoxRef}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-t-[10px] flex gap-3 items-center justify-between py-4 px-4 border-b">
              <h2 className="text-xl font-semibold">Export</h2>
              <div
                className="close--lead cursor-pointer"
                onClick={() => {
                  setExportShowModal(false);
                }}
              >
                <IoCloseCircle className="text-3xl" />
              </div>
            </div>

            <div className="flex-1">
              <form onSubmit={handleDownload} className="p-0 space-y-0">
                <div className="flex bg-white rounded-b-[10px]">
                  <div className="p-6 flex-1">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Date */}
                      <div>
                        <label className="mb-2 block">
                          Start Time<span className="text-red-500">*</span>
                        </label>
                        <div className="custom--date relative">
                          <span className="absolute z-[1] mt-[10px] ml-[15px]">
                            <FaCalendarDays />
                          </span>

                          <DatePicker
                            selected={dateExport}
                            onChange={(selectedDate) =>
                              setDateExport(selectedDate)
                            }
                            placeholderText="Select Date"
                            className="custom--input w-full input--icon"
                            maxDate={new Date()}
                            dropdownMode="select"
                            dateFormat="dd-MM-yyyy"
                          />
                        </div>
                      </div>

                      {/* Club */}
                      <div>
                        <label className="block mb-2">
                          Club<span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                            <FaListUl />
                          </span>
                          <Select
                            value={
                              clubOptions.find(
                                (o) => o.value === clubIdExport,
                              ) || null
                            }
                            options={clubOptions}
                            onChange={(option) => setClubIdExport(option.value)}
                            styles={selectIcon}
                          />
                        </div>
                      </div>

                      {/* Format */}
                      <div className="col-span-2">
                        <label className="block mb-2">
                          Format<span className="text-red-500">*</span>
                        </label>

                        <div className="flex gap-6">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="formatExport"
                              value="excel"
                              checked={formatExport === "excel"}
                              onChange={(e) => setFormatExport(e.target.value)}
                            />
                            Excel
                          </label>

                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="formatExport"
                              value="xml"
                              checked={formatExport === "xml"}
                              onChange={(e) => setFormatExport(e.target.value)}
                            />
                            XML
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 py-5 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setExportShowModal(false);
                      setClubIdExport("");
                      setDateExport(null);
                      setFormatExport("excel");
                    }}
                    className="px-4 py-2 bg-transparent border border-white text-white font-semibold rounded max-w-[150px] w-full"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-white text-black font-semibold rounded max-w-[150px] w-full"
                  >
                    Download
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Export End */}
    </>
  );
};

export default IsLoadingHOC(ProductsSold);
