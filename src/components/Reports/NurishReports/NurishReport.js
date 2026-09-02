import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, format, subYears } from "date-fns";
import { FaCalendarDays, FaCircle } from "react-icons/fa6";
import Select from "react-select";
import {
  ALLOWED_ROLES,
  customStyles,
  filterActiveItems,
  formatIndianNumber,
  formatText,
} from "../../../Helper/helper";
import { authAxios } from "../../../config/config";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Pagination from "../../common/Pagination";
import { FiEye } from "react-icons/fi";
import { IoSearchOutline } from "react-icons/io5";
// import KycDocumentsModal from "./KycDocumentsModal";
import IsLoadingHOC from "../../common/IsLoadingHOC";
import { LuDownload } from "react-icons/lu";
import { FaSortUp, FaSortDown } from "react-icons/fa";

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const statusFilterOptions = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

const formatDate = (date) => format(date, "yyyy-MM-dd");

const KycDocumentsList = (props) => {
  const { setLoading } = props;
  const [kycDocumentsData, setKycDocumentsData] = useState([]);
  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [kycDataCount, setKycDataCount] = useState([]);

  const { user } = useSelector((state) => state.auth);
  const userRole = user.role;

  const [dateFilter, setDateFilter] = useState(dateFilterOptions[0]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [categoryList, setCategoryList] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState(null);
const [sortBy, setSortBy] = useState("quantity_sold");

const [sortOrders, setSortOrders] = useState({
  quantity_sold: "ASC",
  selling_price: "ASC",
  total_sales: "ASC",
});
  // Function to fetch club list

  const fetchCategories = async () => {
  try {
    const response = await authAxios().get("/product/category/list");

    const data = response.data?.data || [];

    // Only ACTIVE categories
    const activeCategories = data.filter(
      (item) => item.status === "ACTIVE"
    );

    setCategoryList(activeCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
};
  const fetchClub = async (search = "") => {
    try {
      const response = await authAxios().get("/club/list", {
        params: search ? { search } : {},
      });
      const data = response.data?.data || [];
      const activeOnly = filterActiveItems(data);
      setClubList(activeOnly);

      // ✅ Set default club (index 0) ONLY if not already set
      if (!clubFilter && activeOnly.length > 0) {
        setClubFilter(activeOnly[0].id);
      }
    } catch (error) {
      console.error(error);
    }
  };
  // Function to fetch role list

  useEffect(() => {
    fetchClub();
    fetchCategories();
  }, []);

  const clubOptions = clubList.map((item) => ({
    label: item.name,
    value: item.id,
  }));
  const categoryOptions = categoryList.map((item) => ({
  label: item.title,
  value: item.id,
}));

  const fetchMemberKycDocuments = async (search = "", currentPage = page) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
        ...(search ? { search } : {}),
      };

      // Club filter
      if (clubFilter) {
        params.club_id = clubFilter;
      }
if (categoryFilter) {
  params.product_category_id = categoryFilter;
}
if (sortBy) {
  params.sort_by = sortBy;
  params.sort_order = sortOrders[sortBy];
}
      // Status filter
      if (statusFilter) {
        params.status = statusFilter;
      }

      // Date filter
      if (dateFilter?.value === "custom") {
        if (customFrom && customTo) {
          params.startDate = formatDate(customFrom);
          params.endDate = formatDate(customTo);
        }
      } else if (dateFilter?.value) {
        params.dateFilter = dateFilter.value;
      }

      const res = await authAxios().get("/report/nourish/list", {
        params,
      });
      const responseData = res.data;
      const data = responseData?.data || [];
      setKycDataCount(responseData?.product_summary);

      setKycDocumentsData(data);
      setPage(responseData?.currentPage || 1);
      setTotalPages(responseData?.totalPage || 1);
      setTotalCount(responseData?.totalCount || data.length);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setPage(1);
      fetchMemberKycDocuments(searchTerm, 1);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, statusFilter, clubFilter,categoryFilter, dateFilter, customFrom, customTo,sortBy]);

  // Fetch data
  useEffect(() => {
    // Prevent API call until both dates selected
    if (dateFilter?.value === "custom") {
      if (!(customFrom && customTo)) return;
    }

    fetchMemberKycDocuments(searchTerm, page);
  }, [
   page,
  searchTerm,
  statusFilter,
  clubFilter,
  categoryFilter,
  dateFilter,
  customFrom,
  customTo,
  sortBy,
  sortOrders,
  ]);

 const handleSort = (column) => {
  const newOrder =
    sortOrders[column] === "ASC" ? "DESC" : "ASC";

  setSortOrders((prev) => ({
    ...prev,
    [column]: newOrder,
  }));

  setSortBy(column);
  setPage(1);
};

const handleExportKycDocuments = async () => {
  try {
    setLoading(true);

    const params = {};

    // Search
    if (searchTerm?.trim()) {
      params.search = searchTerm.trim();
    }

    // Club filter
    if (clubFilter) {
      params.club_id = clubFilter;
    }

    // Category filter
    if (categoryFilter) {
      params.product_category_id = categoryFilter;
    }

    // Status filter
    if (statusFilter) {
      params.status = statusFilter;
    }

    // Date filter
    if (dateFilter?.value === "custom") {
      if (customFrom && customTo) {
        params.startDate = formatDate(customFrom);
        params.endDate = formatDate(customTo);
      }
    } else if (dateFilter?.value) {
      params.dateFilter = dateFilter.value;
    }

    // Sorting
    if (sortBy) {
      params.sort_by = sortBy;
      params.sort_order = sortOrders[sortBy];
    }

    console.log("Download Params:", params);

    const response = await authAxios().get(
      "/report/nourish/list/download",
      {
        params,
        responseType: "blob",
      }
    );

    const blob = new Blob([response.data]);

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Item-wise-report.xlsx");

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);

    toast.success("Report downloaded successfully!");
  } catch (error) {
    console.error("Download error:", error);
    toast.error("Failed to download report.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="page--content">
      {/* Header */}
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > KYC Documents`}</p>
          <h1 className="text-3xl font-semibold">Item-wise Report</h1>
        </div>
        {/* {!ALLOWED_ROLES.includes(userRole) && ( */}
          <div className="w-full max-w-[200px]">
            <button
              onClick={handleExportKycDocuments}
              disabled={kycDocumentsData.length === 0 || (dateFilter?.value === "custom" && (!customFrom || !customTo))}
              className={`px-4 py-2 rounded flex items-center gap-2 w-full
              ${
                kycDocumentsData.length === 0 || (dateFilter?.value === "custom" && (!customFrom || !customTo))
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              <LuDownload /> <span>Download Report</span>
            </button>
          </div>
        {/* )} */}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 items-center justify-between">
        <div className="flex gap-2 w-full">
          {/* Search */}
          {/* <div className="w-full max-w-[170px] relative">
            <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
              <IoSearchOutline />
            </span>
            <input
              type="text"
              placeholder="Search Member..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="custom--input w-full input--icon"
            />
          </div> */}
          <div className="max-w-[150px] w-full">
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
            />
          </div>

          {dateFilter?.value === "custom" && (
            <>
              <div className="custom--date dob-format flex-1 max-w-[150px] w-full">
                <span className="absolute z-[1] mt-[10px] ml-[15px]">
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
              <div className="custom--date dob-format flex-1 max-w-[150px] w-full">
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

          <div className="w-fit min-w-[150px]">
            <Select
              placeholder="Filter by club"
              value={clubOptions.find((o) => o.value === clubFilter) || null}
              options={clubOptions}
              onChange={(option) => setClubFilter(option?.value)}
              styles={customStyles}
              className="w-full"
              isClearable={userRole === "ADMIN" ? true : false}
            />
          </div>
            <div className="w-fit min-w-[150px]">
  <Select
    placeholder="Filter by category"
    value={
      categoryOptions.find(
        (option) => option.value === categoryFilter
      ) || null
    }
    options={categoryOptions}
    onChange={(option) => setCategoryFilter(option?.value || null)}
    styles={customStyles}
    className="w-full"
    isClearable
  />
</div>
        </div>
        
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5 p-3 border bg-white shodow--box rounded-[10px]">
        <div className="border rounded-[5px] overflow-hidden w-full">
          <div className="flex justify-center bg-[#F1F1F1] p-4 py-3">
            <div className="text-lg font-bold">Total Items Sold</div>
          </div>
          <p className="text-3xl font-bold text-center py-5">
            {kycDataCount?.total_item_sold }
          </p>
        </div>

        <div className="border rounded-[5px] overflow-hidden w-full">
          <div className="flex justify-center bg-[#F1F1F1] p-4 py-3">
            <div className="text-lg font-bold">Total Sales</div>
          </div>
          <p className="text-3xl font-bold text-center py-5">
           ₹ {kycDataCount?.total_sales }
          </p>
        </div>
        
      </div>

      {/* Table */}
      <div className="w-full p-3 border bg-white shodow--box rounded-[10px]">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-2 py-4 min-w-[150px]">Item Name</th>
                <th className="px-2 py-4 min-w-[120px]">Category</th>
                <th className="px-2 py-4 min-w-[120px]">Current Stocks</th>
               <th
  className="px-2 py-4 min-w-[150px] cursor-pointer select-none"
  onClick={() => handleSort("quantity_sold")}
>
  <div className="flex items-center gap-1">
    Quantity Sold
    {sortOrders.quantity_sold === "ASC" ? (
      <FaSortUp />
    ) : (
      <FaSortDown />
    )}
  </div>
</th>

<th
  className="px-2 py-4 min-w-[200px] cursor-pointer select-none"
  onClick={() => handleSort("selling_price")}
>
  <div className="flex items-center gap-1">
    Selling Price
    {sortOrders.selling_price === "ASC" ? (
      <FaSortUp />
    ) : (
      <FaSortDown />
    )}
  </div>
</th>

<th
  className="px-2 py-4 min-w-[150px] cursor-pointer select-none"
  onClick={() => handleSort("total_sales")}
>
  <div className="flex items-center gap-1">
    Total Sales
    {sortOrders.total_sales === "ASC" ? (
      <FaSortUp />
    ) : (
      <FaSortDown />
    )}
  </div>
</th>
              </tr>
            </thead>

            <tbody>
              {kycDocumentsData.length ? (
                kycDocumentsData.map((row, index) => (
                  <tr
                    key={index}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <td className="px-2 py-4">{row?.product_name || "--"}</td>
                    <td className="px-2 py-4">{row?.product_category_name}</td>
                    <td className="px-2 py-4">{row?.current_stocks}</td>
                    <td className="px-2 py-4">{row?.quantity_sold}</td>
                    <td className="px-2 py-4">
                     ₹ {row?.selling_price || "--"}
                    </td>
                    <td className="px-2 py-4">₹ {row?.total_sales}</td>
                   
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="text-center py-4">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Component */}
        <Pagination
          page={page}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          currentDataLength={kycDocumentsData.length}
          onPageChange={(newPage) => {
            setPage(newPage);
          }}
        />
      </div>
    </div>
  );
};

export default IsLoadingHOC(KycDocumentsList);
