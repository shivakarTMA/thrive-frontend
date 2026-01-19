import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, subYears } from "date-fns";
import { FaCalendarDays } from "react-icons/fa6";
import Select from "react-select";
import { customStyles, filterActiveItems } from "../../../Helper/helper";
import { authAxios } from "../../../config/config";
import { toast } from "react-toastify";
import SetMonthlyTargetsModal from "./SetMonthlyTargetsModal";
import { useFormik } from "formik";
import { FiPlus } from "react-icons/fi";
import Tooltip from "../../common/Tooltip";
import { LiaEdit } from "react-icons/lia";
import { BsEye } from "react-icons/bs";

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
    month: "01/2026",
    target_type: "Revenue",
    target: "4,000,000",
    achieved: "3,520,000",
    achievement_percent: "88%",
    status: "Locked",
    effective_from: "01/01/2026",
    effective_to: "31/01/2026",
    last_updated_on: "19/12/2025",
    last_updated_by: "Prerna",
  },
  {
    id: 2,
    club_id: 16,
    club_name: "DLF Summit Plaza",
    month: "02/2026",
    target_type: "Revenue",
    target: "3,000,000",
    achieved: "3,450,000",
    achievement_percent: "115%",
    status: "Active",
    effective_from: "01/01/2026",
    effective_to: "31/01/2026",
    last_updated_on: "01/01/2026",
    last_updated_by: "Shivakar",
  },
  {
    id: 3,
    club_id: 16,
    club_name: "DLF Summit Plaza",
    month: "02/2026",
    target_type: "Collection",
    target: "5,000,000",
    achieved: "4,100,000",
    achievement_percent: "82%",
    status: "Inactive",
    effective_from: "01/01/2026",
    effective_to: "31/01/2026",
    last_updated_on: "03/01/2026",
    last_updated_by: "Prerna",
  },
  {
    id: 4,
    club_id: 16,
    club_name: "DLF Summit Plaza",
    month: "12/2025",
    target_type: "Revenue",
    target: "4,800,000",
    achieved: "5,600,000",
    achievement_percent: "117%",
    status: "Locked",
    effective_from: "01/12/2025",
    effective_to: "31/12/2025",
    last_updated_on: "31/12/2025",
    last_updated_by: "Prerna",
    actions: ["View"],
  },
];

const formatMonth = (value) => {
  const [mm, yyyy] = value.split("/");
  const date = new Date(`${yyyy}-${mm}-01`);
  return date.toLocaleString("en-US", {
    month: "short",
    year: "numeric",
  });
};

const MonthlyTargetsReport = () => {
  const [data] = useState(dummyData);
  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const [viewOption, setViewOption] = useState(false);

  const [dateFilter, setDateFilter] = useState(dateFilterOptions[1]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

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

  const formik = useFormik({
    initialValues: {
      club_id: null,
      month: "",
      target_type: "",
      target_amount: "",
      status: "",
    },
    onSubmit: (values, { resetForm }) => {
      toast.success("Updated Successfully");
      resetForm();
      setEditingOption(null);
      setShowModal(false);
    },
  });

  return (
    <div className="page--content">
      {/* Header */}
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">
            {`Home > Reports > Finance Reports > Set Monthly Targets`}
          </p>
          <h1 className="text-3xl font-semibold">Set Monthly Targets</h1>
        </div>
        <div className="flex items-end gap-2">
          <button
            type="button"
            className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
            onClick={() => {
              setEditingOption(null);
              formik.resetForm();
              setShowModal(true);
              setViewOption(false);
            }}
          >
            <FiPlus /> Set Target
          </button>
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
                  onChange={setCustomFrom}
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
                  onChange={setCustomTo}
                  placeholderText="To Date"
                  className="custom--input w-full input--icon"
                  minDate={subYears(new Date(), 20)}
                  maxDate={addYears(new Date(), 0)}
                  dateFormat="dd-MM-yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
              </div>
            </>
          )}

          <div className="w-full max-w-[200px]">
            <Select
              placeholder="Filter by club"
              value={clubOptions.find((o) => o.value === clubFilter) || null}
              options={clubOptions}
              onChange={(option) => setClubFilter(option?.value)}
              // isClearable
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
                <th className="px-2 py-4 min-w-[150px]">Club Name</th>
                <th className="px-2 py-4 min-w-[100px]">Month</th>
                <th className="px-2 py-4 min-w-[130px]">Target Type</th>
                <th className="px-2 py-4 min-w-[120px]">Target (₹)</th>
                <th className="px-2 py-4 min-w-[120px]">Achieved (₹)</th>
                <th className="px-2 py-4 min-w-[110px]">Achievement %</th>
                <th className="px-2 py-4 min-w-[100px]">Status</th>
                <th className="px-2 py-4 min-w-[120px]">Last Updated On</th>
                <th className="px-2 py-4 min-w-[130px]">Last Updated By</th>
                <th className="px-2 py-4 min-w-[100px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.length ? (
                data.map((row, index) => (
                  <tr
                    key={index}
                    className="bg-white  border-b hover:bg-gray-50"
                  >
                    <td className="px-2 py-4">{row.club_name}</td>
                    <td className="px-2 py-4">{formatMonth(row.month)}</td>
                    <td className="px-2 py-4">{row.target_type}</td>
                    <td className="px-2 py-4">₹{row.target}</td>
                    <td className="px-2 py-4">₹{row.achieved}</td>
                    <td className="px-2 py-4">{row.achievement_percent}</td>
                    <td className="px-2 py-4">{row.status}</td>
                    <td className="px-2 py-4">{row.last_updated_on}</td>
                    <td className="px-2 py-4">{row.last_updated_by}</td>
                    <td className="px-2 py-4 space-x-2">
                      <div className="flex items-center gap-1">
                        {row?.status !== "Locked" && (
                          <Tooltip
                            id={`tooltip-edit-${row.id || index}`}
                            content="Edit Target"
                            place="left"
                          >
                            <div
                              className="p-1 cursor-pointer"
                              onClick={() => {
                                setEditingOption(row?.id);
                                setShowModal(true);
                                setViewOption(false);
                              }}
                            >
                              <LiaEdit className="text-[25px] text-black" />
                            </div>
                          </Tooltip>
                        )}

                        <Tooltip
                          id={`tooltip-view-${row.id || index}`}
                          content="View Target"
                          place="left"
                        >
                          <div
                            className="p-1 cursor-pointer"
                            onClick={() => {
                              setEditingOption(row?.id);
                              setShowModal(true);
                              setViewOption(true);
                            }}
                          >
                            <BsEye className="text-[25px] text-black" />
                          </div>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="text-center py-4">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <SetMonthlyTargetsModal
          setShowModal={setShowModal}
          editingOption={editingOption}
          viewOption={viewOption}
          clubOptions={clubOptions}
          formik={formik}
        />
      )}
    </div>
  );
};

export default MonthlyTargetsReport;
