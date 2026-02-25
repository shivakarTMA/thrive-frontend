import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, subYears, format } from "date-fns";
import { FaCalendarDays } from "react-icons/fa6";
import Select from "react-select";
import {
  customStyles,
  filterActiveItems,
  formatDateTimeLead,
  formatText,
} from "../Helper/helper";
import { authAxios } from "../config/config";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import Pagination from "../components/common/Pagination";
import { useSelector } from "react-redux";

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const formatDate = (date) => {
  if (!date) return null;
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
};

const NourishOrders = () => {
  const [nourishOrders, setNourishOrders] = useState([]);
  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const [filtersInitialized, setFiltersInitialized] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const userRole = user.role;

  const [dateFilter, setDateFilter] = useState(dateFilterOptions[1]);
  const [placeOrderFilter, setPlaceOrderFilter] = useState(null);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

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

  const selectedClub =
    clubOptions.find((opt) => opt.value === clubFilter?.value) || null;

  // ---------------------------
  // UPDATE URL WITH PARAMS
  // ---------------------------
  const updateURLParams = () => {
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

    navigate(`?${params.toString()}`, { replace: true });
  };

  const fetchOrdersList = async (currentPage = page) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };

      // Club filter
      if (clubFilter?.value) {
        params.club_id = clubFilter.value;
      }

      // Status
      if (placeOrderFilter?.value) {
        params.fulfilment_status = placeOrderFilter.value;
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

      const res = await authAxios().get(
        "/dashboard/product/pending/order/list",
        {
          params,
        },
      );
      const responseData = res.data;
      const data = responseData?.data || [];

      setNourishOrders(data);
      setPage(responseData?.currentPage || 1);
      setTotalPages(responseData?.totalPage || 1);
      setTotalCount(responseData?.totalCount || data.length);
    } catch (err) {
      console.error(err);
      toast.error("data not found");
    }
  };

  // ---------------------------
  // INITIALIZE FROM URL
  // ---------------------------

  useEffect(() => {
    if (clubList.length === 0) return;
    if (filtersInitialized) return;

    const params = new URLSearchParams(location.search);

    // ---- Date filter ----
    const dateFilterValue = params.get("dateFilter");
    if (dateFilterValue) {
      const matchedDate = dateFilterOptions.find(
        (opt) => opt.value === dateFilterValue,
      );
      if (matchedDate) {
        setDateFilter(matchedDate);
      }
    }

    // ---- Custom date ----
    const startDate = params.get("startDate");
    const endDate = params.get("endDate");
    if (startDate && endDate) {
      setDateFilter(dateFilterOptions.find((d) => d.value === "custom"));
      setCustomFrom(new Date(startDate));
      setCustomTo(new Date(endDate));
    }

    // ---- Club filter ----
    const clubId = params.get("club_id");

    // if (clubId) {
    //   const club = clubList.find((c) => c.id === Number(clubId));
    //   if (club) {
    //     setClubFilter({ label: club.name, value: club.id });
    //   }
    // } else {
    //   // ✅ default only when URL does NOT have club_id
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

    setFiltersInitialized(true);
  }, [clubList, location.search]);

  // ---------------------------
  // FETCH WHEN FILTERS CHANGE
  // ---------------------------
  useEffect(() => {
    if (!filtersInitialized) return;

    // 🚫 wait until both dates are selected for custom range
    if (dateFilter?.value === "custom" && (!customFrom || !customTo)) {
      return;
    }

    setPage(1);
    fetchOrdersList(1);
    updateURLParams();
  }, [
    filtersInitialized,
    dateFilter?.value,
    customFrom,
    customTo,
    clubFilter?.value,
    placeOrderFilter
  ]);

  // Open confirmation popup
  const handleMarkDeliveredClick = (orderId) => {
    setSelectedOrderId(orderId);
    setShowConfirmPopup(true);
  };

  // Cancel popup
  const handleCancel = () => {
    setShowConfirmPopup(false);
    setSelectedOrderId(null);
  };

  // Confirm delivery and call API
  const handleConfirmDelivery = async () => {
    if (!selectedOrderId) return;

    try {
      await authAxios().put(
        `/dashboard/product/pending/order/markdone/${selectedOrderId}`,
      );
      setShowConfirmPopup(false);
      setSelectedOrderId(null);
      fetchOrdersList(); // Refresh orders after marking delivered
    } catch (error) {
      console.error("Failed to mark delivered:", error);
      alert("Something went wrong while marking the order as delivered.");
    }
  };

  return (
    <div className="page--content">
      {/* Header */}
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > Nourish Orders`}</p>
          <h1 className="text-3xl font-semibold">Nourish Orders</h1>
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
              styles={customStyles}
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
                  // maxDate={addYears(new Date(), 0)}
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  dateFormat="dd-MM-yyyy"
                  disabled={!customFrom}
                />
              </div>
            </>
          )}

          <div className="w-fit min-w-[200px]">
            <Select
              placeholder="Filter by club"
              value={selectedClub}
              options={clubOptions}
              onChange={(option) => setClubFilter(option)}
              styles={customStyles}
              isClearable={userRole === "ADMIN" ? true : false}
              className="w-full"
            />
          </div>
          <div className="w-fit min-w-[200px]">
            <Select
              placeholder="Filter by Status"
              options={[
                { value: "PLACED", label: "Placed" },
                { value: "DELIVERED", label: "Delivered" },
              ]}
              value={placeOrderFilter}
              onChange={(option) => setPlaceOrderFilter(option)}
              isClearable
              styles={customStyles}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="w-full p-3 border bg-white shodow--box rounded-[10px]">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-2 py-4 min-w-[100px]">Order ID</th>
                <th className="px-2 py-4 min-w-[170px]">Placed On</th>
                <th className="px-2 py-4 min-w-[150px]">Club</th>
                <th className="px-2 py-4 min-w-[150px]">Member</th>
                <th className="px-2 py-4 min-w-[150px]">Items Ordered</th>
                <th className="px-2 py-4 min-w-[150px]">Final Amount</th>
                <th className="px-2 py-4 min-w-[150px]">Payment Status</th>
                <th className="px-2 py-4 min-w-[150px]">Fulfilment Status</th>
                <th className="px-2 py-4 min-w-[150px]">Delivered By</th>
                <th className="px-2 py-4 min-w-[170px]">Delivered At</th>
                <th className="px-2 py-4 min-w-[150px]">Action</th>
              </tr>
            </thead>

            <tbody>
              {nourishOrders.length ? (
                nourishOrders.map((order, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-2 py-4">
                      {order?.order_id ? order?.order_id : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {order?.createdAt
                        ? formatDateTimeLead(order?.createdAt)
                        : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {order?.club_name ? order?.club_name : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {order?.member_name ? order?.member_name : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {order?.name ? order?.name : "--"}
                    </td>
                    <td className="px-2 py-4">₹{order?.booking_amount ?? 0}</td>
                    <td className="px-2 py-4">
                      {order?.payment_status
                        ? formatText(order?.payment_status)
                        : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {order?.fulfilment_status
                        ? formatText(order?.fulfilment_status)
                        : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {order?.delivered_by_name
                        ? order?.delivered_by_name
                        : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {order?.delivered_at
                        ? formatDateTimeLead(order?.delivered_at)
                        : "--"}
                    </td>
                    <td className="px-2 py-4">
                      <button
                        className={` ${order?.fulfilment_status === "PLACED" ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-black text-white cursor-pointer"}  px-3 py-1 rounded `}
                        onClick={() => handleMarkDeliveredClick(order.id)}
                        disabled={
                          order?.fulfilment_status === "PLACED" ? true : false
                        }
                      >
                        Mark Delivered
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="text-center py-4">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          currentDataLength={nourishOrders.length}
          onPageChange={(newPage) => {
            setPage(newPage);
            fetchOrdersList(newPage);
          }}
        />
      </div>

      {/* Confirmation Popup */}
      {showConfirmPopup && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-[350px] text-center">
            <h3 className="text-lg font-semibold mb-4">Confirm Delivery</h3>
            <p className="mb-6">
              Have you verified the correct member before marking this order as
              delivered?
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                onClick={handleCancel}
              >
                No
              </button>
              <button
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                onClick={handleConfirmDelivery}
              >
                Mark Delivered
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NourishOrders;
