import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, subYears } from "date-fns";
import { FaCalendarDays, FaCircle, FaEye, FaPrint } from "react-icons/fa6";
import {
  customStyles,
  filterActiveItems,
  formatAutoDate,
  formatText,
  formatTimeAppointment,
} from "../../Helper/helper";
import Select from "react-select";
import GroupClassPanel from "../../components/FilterPanel/GroupClassPanel";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { authAxios } from "../../config/config";
import { toast } from "react-toastify";
import Pagination from "../../components/common/Pagination";
import { format } from "date-fns";
import Tooltip from "../../components/common/Tooltip";
import { useSelector } from "react-redux";
import { IoEyeOutline } from "react-icons/io5";
import CreateGroupClasses from "./CreateGroupClasses";
import { FiPlus } from "react-icons/fi";
import { LiaEdit } from "react-icons/lia";

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const GroupClassesList = () => {
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
  const [showModal, setShowModal] = useState(false);
  const [editingOption, setEditingOption] = useState(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [filtersInitialized, setFiltersInitialized] = useState(false);

  // ✅ Single source of truth for applied filters
  const [appliedFilters, setAppliedFilters] = useState({
    package_category_id: null,
    booking_type: null,
    trainer_id: null,
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      filterCategory: null,
      filterBookingType: null,
      filterTrainer: null,
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

    navigate(`?${params.toString()}`, { replace: true });
  };

  const fetchGroupClass = async (currentPage = page) => {
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

      if (appliedFilters.package_category_id)
        params.package_category_id = appliedFilters.package_category_id;
      if (appliedFilters.booking_type)
        params.booking_type = appliedFilters.booking_type;
      if (appliedFilters.trainer_id)
        params.trainer_id = appliedFilters.trainer_id;

      console.log("🔍 API Request Params:", params);

      const res = await authAxios().get("/package/group/class", { params });

      const responseData = res.data;
      const data = responseData?.data || [];

      setProductSoldData(data);
      setPage(responseData?.currentPage || 1);
      setTotalPages(responseData?.totalPage || 1);
      setTotalCount(responseData?.totalCount || data.length);
    } catch (err) {
      console.error("❌ API Error:", err);
      toast.error("Failed to fetch product sold report");
    }
  };

  // Create Group Class
  const validationSchema = Yup.object({
    image: Yup.mixed()
      .required("Image is required")
      .test("fileType", "Only JPG, PNG, or WEBP allowed", (value) => {
        if (!value || typeof value === "string") return true;
        return ["image/jpeg", "image/png", "image/webp"].includes(value.type);
      }),
    service_id: Yup.number().required("Service is required"),
    club_id: Yup.number().required("Club is required"),

    name: Yup.string().required("Name is required"),
    tags: Yup.string().required("Tags is required"),

    trainer_id: Yup.string().required("Trainer Name is required"),
    position: Yup.string().required("Position is required"),
    description: Yup.string().required("Description is required"),
    package_category_id: Yup.number().required("Category is required"),
    start_date: Yup.string().required("Start Date is required"),
    start_time: Yup.string().required("Start Time is required"),
    end_time: Yup.string().required("End Time is required"),
    max_capacity: Yup.string().required("Max Capacity is required"),
    earn_coin: Yup.number()
      .typeError("Earn Coins must be a number")
      .required("Earn Coins is required"),
    waitlist_capacity: Yup.string().required("Waitlist Capacity is required"),
    is_featured: Yup.string().required("Featured Event is required"),

    booking_type: Yup.string()
      .oneOf(["PAID", "FREE"])
      .required("Booking Type is required"),

    amount: Yup.number()
      .typeError("Amount must be a number")
      .when("booking_type", {
        is: "PAID",
        then: (schema) => schema.required("Amount is required"),
        otherwise: (schema) => schema.nullable(),
      }),

    discount: Yup.number()
      .typeError("Discount must be a number")
      .when("booking_type", {
        is: "PAID",
        then: (schema) => schema.required("Discount is required"),
        otherwise: (schema) => schema.nullable(),
      }),

    gst: Yup.number()
      .typeError("GST must be a number")
      .when("booking_type", {
        is: "PAID",
        then: (schema) => schema.required("GST is required"),
        otherwise: (schema) => schema.nullable(),
      }),
    studio_id: Yup.string().required("Studio is required"),
  });

  const initialValues = {
    name: "",
    service_id: "",
    trainer_id: "",
    club_id: null,
    studio_id: null,
    package_category_id: "",
    description: "",
    image: null,
    start_date: "",
    start_time: "",
    end_time: "",
    max_capacity: "",
    waitlist_capacity: "",
    tags: "",
    amount: "",
    discount: "",
    booking_type: "",
    gst: "",
    earn_coin: "",
    position: "",
    hsn_sac_code: "",
    is_featured: "",
    equipment: "",
    status: "",
  };

  const CreateFormik = useFormik({
    initialValues,
    validationSchema: validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { resetForm }) => {
      console.log(values, "values");
      try {
        const formData = new FormData();

        Object.keys(values).forEach((key) => {
          if (key === "imageFile") {
            // file upload
            if (values.imageFile instanceof File) {
              formData.append("image", values.imageFile);
            }
          } else if (typeof values[key] === "boolean") {
            formData.append(key, values[key] ? "true" : "false");
          } else {
            formData.append(key, values[key]);
          }
        });

        // -------------------------------------
        // ✅ CREATE PACKAGE
        // -------------------------------------
        if (!editingOption) {
          await authAxios().post("/package/create", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          toast.success("Package Created Successfully");
        }

        // -------------------------------------
        // ✅ UPDATE PACKAGE
        // -------------------------------------
        else {
          await authAxios().put(`/package/${editingOption}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          toast.success("Package Updated Successfully");
        }

        fetchGroupClass();
        resetForm();
        setEditingOption(null);
        setShowModal(false);
      } catch (err) {
        console.error("API Error:", err.response?.data || err.message);
        toast.error(err.response?.data.message);
      }
    },
  });
  // End Create Group Class

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
      // bill_type: params.get("bill_type") || null,
      // service_type: params.get("service_type") || null,
      // package_type: params.get("package_type") || null,
    };

    setAppliedFilters(urlFilters);

    // Sync with formik
    formik.setValues({
      filterCategory: urlFilters.package_category_id,
      filterBookingType: urlFilters.booking_type,
      filterTrainer: urlFilters.trainer_id,
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
    fetchGroupClass(1);
    updateURLParams(appliedFilters);
  }, [
    filtersInitialized,
    dateFilter?.value,
    customFrom,
    customTo,
    clubFilter?.value,
    appliedFilters.package_category_id,
    appliedFilters.booking_type,
    appliedFilters.trainer_id,
  ]);

  console.log(formik.errors, "SHIVAKAR ERRORS");

  return (
    <>
      <div className="page--content">
        <div className="flex items-end justify-between gap-2 mb-5">
          <div className="title--breadcrumbs">
            <p className="text-sm">{`Home > Group Classes`}</p>
            <h1 className="text-3xl font-semibold">Group Classes</h1>
          </div>
          <div className="flex items-end gap-2">
            <button
              type="button"
              className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
              onClick={() => {
                setEditingOption(null);
                setShowModal(true);
              }}
            >
              <FiPlus /> Create Class
            </button>
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
                    // minDate={subYears(new Date(), 20)}
                    // maxDate={addYears(new Date(), 0)}
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

        <div className="w-full p-3 border bg-white shodow--box rounded-[10px]">
          <div className="flex items-start gap-3 justify-between w-full mb-3 border-b border-b-[#D4D4D4] pb-3">
            <div>
              {/* ✅ Pass both appliedFilters and setAppliedFilters */}
              <GroupClassPanel
                userRole={userRole}
                clubId={clubFilter?.value}
                filterCategory={formik.values.filterCategory}
                filterBookingType={formik.values.filterBookingType}
                filterTrainer={formik.values.filterTrainer}
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
                    <th className="px-2 py-4">Image</th>
                    <th className="px-2 py-4 min-w-[150px]">Club Name</th>
                    <th className="px-2 py-4 min-w-[110px]">Category</th>
                    <th className="px-2 py-4 min-w-[150px]">Class Name</th>
                    <th className="px-2 py-4 min-w-[120px]">Booking Type</th>
                    <th className="px-2 py-4 min-w-[100px]">Amount</th>
                    <th className="px-2 py-4 min-w-[100px]">Discount</th>
                    <th className="px-2 py-4 min-w-[150px]">Total Amount</th>
                    <th className="px-2 py-4 min-w-[170px]">Scheduled At</th>
                    <th className="px-2 py-4 min-w-[100px]">Studio</th>
                    <th className="px-2 py-4 min-w-[150px]">Trainer Name</th>
                    <th className="px-2 py-4 min-w-[130px]">Max Capacity</th>
                    <th className="px-2 py-4 min-w-[110px]">Bookings</th>
                    <th className="px-2 py-4 min-w-[130px]">Active Bookings</th>
                    <th className="px-2 py-4 min-w-[110px]">No-Show</th>
                    <th className="px-2 py-4 min-w-[110px]">Waitings</th>
                    <th className="px-2 py-4 min-w-[110px]">Cancellations</th>
                    <th className="px-2 py-4 min-w-[110px]">Status</th>
                    <th className="px-2 py-4 min-w-[110px]">Participants</th>
                  </tr>
                </thead>
                <tbody>
                  {productSoldData.length > 0 ? (
                    productSoldData.map((row, idx) => (
                      <tr
                        key={row.serialNumber}
                        className="bg-white border-b hover:bg-gray-50 border-gray-200"
                      >
                        <td className="px-2 py-4">
                          <div className="bg-black rounded-lg w-14 h-14 overflow-hidden">
                            <img
                              src={row?.image}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </td>
                        <td className="px-2 py-4">
                          {row?.club_name ? row?.club_name : "--"}
                        </td>

                        <td className="px-2 py-4">
                          {row?.package_category ? row?.package_category : "--"}
                        </td>
                        <td className="px-2 py-4">
                          {row?.name ? row?.name : "--"}
                        </td>
                        <td className="px-2 py-4">
                          {row?.booking_type ? row?.booking_type : "--"}
                        </td>

                        <td className="px-2 py-4">
                          ₹{row?.amount ? row?.amount : 0}
                        </td>
                        <td className="px-2 py-4">
                          ₹{row?.discount ? row?.discount : 0}
                        </td>
                        <td className="px-2 py-4">
                          ₹{row?.total_amount ? row?.total_amount : 0}
                        </td>
                        <td className="px-2 py-4">
                          {formatAutoDate(row?.start_date)}{" "}
                          {formatTimeAppointment(row?.start_time)}
                        </td>
                        <td className="px-2 py-4">
                          {row?.studio_name ? row?.studio_name : "--"}
                        </td>
                        <td className="px-2 py-4">
                          {row?.trainer_name ? row?.trainer_name : "--"}
                        </td>
                        <td className="px-2 py-4">
                          {row?.max_capacity ? row?.max_capacity : 0}
                        </td>
                        <td className="px-2 py-4">
                          {row?.total_bookings ? row?.total_bookings : 0}
                        </td>
                        <td className="px-2 py-4">
                          {row?.active_bookings ? row?.active_bookings : 0}
                        </td>
                        <td className="px-2 py-4">
                          {row?.no_show_count ? row?.no_show_count : 0}
                        </td>
                        <td className="px-2 py-4">
                          {row?.waiting_count ? row?.waiting_count : 0}
                        </td>
                        <td className="px-2 py-4">
                          {row?.cancellation_count
                            ? row?.cancellation_count
                            : 0}
                        </td>
                        <td className="px-2 py-4">
                          <div
                            className={`flex gap-1 items-center ${
                              row?.status === "ACTIVE"
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            <FaCircle />
                            {row?.status
                              ? row.status.charAt(0) +
                                row.status.slice(1).toLowerCase()
                              : ""}
                          </div>
                        </td>

                        <td className="px-2 py-4">
                          <div className="flex items-center gap-2">
                            <Tooltip
                              id={`tooltip-view-${row.id}`}
                              content="View Participants"
                              place="left"
                            >
                              <Link
                                to={`/group-class/${row.id}`}
                                className="p-1 cursor-pointer block"
                              >
                                <IoEyeOutline className="text-[25px] text-black" />
                              </Link>
                            </Tooltip>
                            <Tooltip
                              id={`tooltip-edit-${row.id}`}
                              content="Edit Class"
                              place="left"
                            >
                              <div
                                className="p-1 cursor-pointer block"
                                onClick={() => {
                                  setEditingOption(row.id);
                                  setShowModal(true);
                                }}
                              >
                                <LiaEdit className="text-[25px] text-black" />
                              </div>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="19"
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
                fetchGroupClass(newPage);
              }}
            />
          </div>
        </div>
      </div>

      {showModal && (
        <CreateGroupClasses
          setShowModal={setShowModal}
          editingOption={editingOption}
          formik={CreateFormik}
        />
      )}
    </>
  );
};

export default GroupClassesList;
