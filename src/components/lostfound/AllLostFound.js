import React, { useState, useEffect } from "react";
import { FaAngleLeft, FaAngleRight, FaCheck, FaCircle } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import { IoIosSearch } from "react-icons/io";
import Select from "react-select";
import { lostFoundData as initialData } from "../../DummyData/DummyData";
import AddNewItemModal from "./AddNewItemModal";
import MarkReturnedModal from "./MarkReturnedModal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, format, subYears } from "date-fns";
import {
  customStyles,
  filterActiveItems,
  formatAutoDate,
  formatText,
} from "../../Helper/helper";
import viewIcon from "../../assets/images/icons/eye.svg";
import returnIcon from "../../assets/images/icons/return.svg";
import { FaCalendarDays } from "react-icons/fa6";
import LostFoundPanel from "../FilterPanel/LostFoundPanel";
import { authAxios } from "../../config/config";
import { toast } from "react-toastify";
import Pagination from "../common/Pagination";
import Tooltip from "../common/Tooltip";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import { useLocation } from "react-router-dom";

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const AllLostFound = () => {
  const location = useLocation();
  const [data, setData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [returnedModalOpen, setReturnedModalOpen] = useState(false);
  const [markReturnedData, setMarkReturnedData] = useState([]);
  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);
  const [editingOption, setEditingOption] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const userRole = user.role;

  const [dateFilter, setDateFilter] = useState(dateFilterOptions[1]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [filtersInitialized, setFiltersInitialized] = useState(false);

  // ✅ Single source of truth for applied filters
  const [appliedFilters, setAppliedFilters] = useState({
    category: null,
    found_at_location: null,
    status: null,
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      filterCategory: null,
      filterLocation: null,
      filterStatus: null,
    },
    onSubmit: (values) => {
      console.log(values);
    },
  });

  // Function to fetch club list
  const fetchClub = async () => {
    try {
      const response = await authAxios().get("/club/list");
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

  const fetchLostFoundList = async (currentPage = page) => {
    try {
      // ✅ Always include date filter in params
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

      if (appliedFilters.category) params.category = appliedFilters.category;
      if (appliedFilters.found_at_location)
        params.found_at_location = appliedFilters.found_at_location;
      if (appliedFilters.status) params.status = appliedFilters.status;

      const res = await authAxios().get("/lost/found/list", { params });

      const responseData = res.data;
      const data = responseData?.data || [];

      setData(data);
      setPage(responseData?.currentPage || 1);
      setTotalPages(responseData?.totalPage || 1);
      setTotalCount(responseData?.totalCount || data.length);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch Data");
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
      // bill_type: params.get("bill_type") || null,
      // service_type: params.get("service_type") || null,
      // package_type: params.get("package_type") || null,
    };

    setAppliedFilters(urlFilters);

    // Sync with formik
    formik.setValues({
      filterCategory: urlFilters.category,
      filterLocation: urlFilters.found_at_location,
      filterStatus: urlFilters.status,
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
    fetchLostFoundList(1);
  }, [
    filtersInitialized,
    dateFilter?.value,
    customFrom,
    customTo,
    clubFilter?.value,
    appliedFilters.category,
    appliedFilters.found_at_location,
    appliedFilters.status,
  ]);

  return (
    <div className="page--content">
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">Home &gt; Lost &amp; Found</p>
          <h1 className="text-3xl font-semibold">Lost &amp; Found</h1>
        </div>
      </div>

      {/* Date Filter Dropdown */}
      <div className="flex gap-2 w-full mb-4">
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
              setPage(1); // Reset to first page
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
                  setPage(1);
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
                onChange={(date) => {
                  setCustomTo(date);
                  setPage(1);
                }}
                placeholderText="To Date"
                className="custom--input w-full input--icon"
                minDate={customFrom || subYears(new Date(), 20)}
                maxDate={addYears(new Date(), 0)}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                dateFormat="dd-MM-yyyy"
              />
            </div>
          </>
        )}

        <div className="w-fit min-w-[180px]">
          <Select
            placeholder="Filter by club"
            options={clubOptions}
            value={selectedClub}
            onChange={setClubFilter}
            isClearable={userRole === "ADMIN" ? true : false}
            styles={customStyles}
          />
        </div>
      </div>

      <div className="w-full p-3 border bg-white shodow--box rounded-[10px]">
        <div className="flex items-start gap-3 justify-between w-full mb-3 border-b border-b-[#D4D4D4] pb-3">
          <div>
            <LostFoundPanel
              filterCategory={formik.values.filterCategory}
              filterLocation={formik.values.filterLocation}
              filterStatus={formik.values.filterStatus}
              formik={formik}
              setFilterValue={(field, value) =>
                formik.setFieldValue(field, value)
              }
              appliedFilters={appliedFilters}
              setAppliedFilters={setAppliedFilters}
            />
          </div>
          <div>
            <button
              onClick={() => {
                setEditingOption(null);
                setModalOpen(true);
              }}
              type="button"
              className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
            >
              <FiPlus /> Add New Item
            </button>
          </div>
        </div>

        <div className="table--data--bottom w-full">
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-2 py-4">Club Name</th>
                  <th className="px-2 py-4">Item Name</th>
                  <th className="px-2 py-4">Category</th>
                  <th className="px-2 py-4">Found At</th>
                  <th className="px-2 py-4">Date & Time</th>
                  <th className="px-2 py-4">Status</th>
                  <th className="px-2 py-4">Logged By</th>
                  <th className="px-2 py-4">Claimant Name</th>
                  <th className="px-2 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.length ? (
                  data.map((row, idx) => (
                    <tr
                      key={row.id}
                      className="bg-white border-b hover:bg-gray-50 border-gray-200"
                    >
                      <td className="px-2 py-4">
                        {row?.club_name ? row?.club_name : "--"}
                      </td>
                      <td className="px-2 py-4">{row?.item_name}</td>
                      <td className="px-2 py-4">{row?.category}</td>
                      <td className="px-2 py-4">{row?.found_at_location}</td>
                      <td className="px-2 py-4">
                        {formatAutoDate(row?.found_date_time)}
                      </td>
                      <td className="px-2 py-4">
                        <span
                          className={`
                            flex items-center justify-between gap-1 rounded-full min-h-[30px] px-3 text-sm w-fit
                          ${
                            row?.status === "AVAILABLE"
                              ? "bg-[#E8FFE6] text-[#138808]"
                              : "bg-[#FFE7E7] text-[#C80000]"
                          }
                          `}
                        >
                          <FaCircle className="text-[10px]" />
                          {row?.status == null ? "--" : formatText(row?.status)}
                        </span>
                      </td>
                      <td className="px-2 py-4">
                        {row?.logged_by_name ? row?.logged_by_name : "--"}
                      </td>
                      <td className="px-2 py-4">
                        {row?.claimant_name == null ? "--" : row?.claimant_name}
                      </td>
                      <td className="px-2 py-4">
                        <div className="flex">
                          <Tooltip
                            id={`tooltip-edit-${row.id}`}
                            content="View Details"
                            place="left"
                          >
                            <div
                              className="bg-[#F1F1F1] border border-[#D4D4D4] rounded-l-[5px] w-[32px] h-[32px] flex items-center justify-center cursor-pointer"
                              onClick={() => {
                                setEditingOption(row.id);
                                setModalOpen(true);
                              }}
                            >
                              <img src={viewIcon} />
                            </div>
                          </Tooltip>
                          <Tooltip
                            id={`tooltip-return-${row.id}`}
                            content="Return Item"
                            place="left"
                          >
                            <div
                              className={`bg-[#F1F1F1] border border-[#D4D4D4] rounded-r-[5px] w-[32px] h-[32px] flex items-center justify-center ${
                                row.status !== "AVAILABLE"
                                  ? "cursor-not-allowed pointer-events-none opacity-[0.5]"
                                  : "cursor-pointer"
                              } `}
                              onClick={() => {
                                setReturnedModalOpen(true);
                                setMarkReturnedData(row?.id);
                              }}
                            >
                              <img src={returnIcon} />
                            </div>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-2 py-4">
                      <p className="text-center text-sm text-gray-500">
                        No data found.
                      </p>
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
            currentDataLength={data.length}
            onPageChange={(newPage) => {
              setPage(newPage);
            }}
          />
        </div>
      </div>

      {/* Modals */}
      {modalOpen && (
        <AddNewItemModal
          onClose={() => setModalOpen(false)}
          clubOptions={clubOptions}
          editingOption={editingOption}
          fetchLostFoundList={fetchLostFoundList}
        />
      )}

      {returnedModalOpen && (
        <MarkReturnedModal
          lostID={markReturnedData}
          onClose={() => setReturnedModalOpen(false)}
          clubOptions={clubOptions}
          fetchLostFoundList={fetchLostFoundList}
        />
      )}
    </div>
  );
};

export default AllLostFound;
