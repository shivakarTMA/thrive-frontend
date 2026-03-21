import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { FaCalendarDays } from "react-icons/fa6";
import Select from "react-select";
import { customStyles, filterActiveItems } from "../../../Helper/helper";
import { authAxios } from "../../../config/config";
import { toast } from "react-toastify";
import { LuDownload } from "react-icons/lu";

const RevenueRecognitionReport = () => {
  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);

  const [startMonth, setStartMonth] = useState(null);
  const [endMonth, setEndMonth] = useState(null);

  // Fetch Clubs
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

  useEffect(() => {
    fetchClub();
  }, []);

  const clubOptions = clubList.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  // Download report
  const downloadReport = async () => {
    if (!startMonth || !endMonth) {
      toast.error("Please select start and end date");
      return;
    }

    try {
      const response = await authAxios().get(
        "/invoice/download/revenue/recognition/report",
        {
          params: {
            club_id: clubFilter,
            start_date: startMonth,
            end_date: endMonth,
          },
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "revenue-recognition-report.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      setClubFilter(null);
      setStartMonth(null);
      setEndMonth(null);
      toast.success("Report download successfully!");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="page--content">
      {/* Header */}
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">
            Home {" > "} Reports {" > "} Finance Reports {" > "} Revenue
            Recognition Report
          </p>
          <h1 className="text-3xl font-semibold">Revenue Recognition Report</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 items-center justify-between">
        <div className="flex gap-2 w-full">
          {/* Start Date */}
          <div className="custom--date dob-format max-w-[200px] w-full">
            <span className="absolute z-[1] mt-[10px] ml-[15px]">
              <FaCalendarDays />
            </span>

            <DatePicker
              selected={startMonth}
              onChange={(date) => {
                const firstDay = startOfMonth(date);
                setStartMonth(firstDay);

                // Reset endMonth if it is before new startMonth
                if (endMonth && endMonth < firstDay) {
                  setEndMonth(null);
                }
              }}
              placeholderText="Start Date"
              className="custom--input w-full input--icon"
              dateFormat="dd-MM-yyyy"
              showMonthYearPicker
            />
          </div>

          {/* End Date */}
          <div className="custom--date dob-format max-w-[200px] w-full">
            <span className="absolute z-[1] mt-[10px] ml-[15px]">
              <FaCalendarDays />
            </span>

            <DatePicker
              selected={endMonth}
              onChange={(date) => setEndMonth(endOfMonth(date))}
              placeholderText="End Date"
              className="custom--input w-full input--icon"
              dateFormat="dd-MM-yyyy"
              showMonthYearPicker
              minDate={startMonth} // Prevent selecting month before startMonth
            />
          </div>

          {/* Club Filter */}
          <div className="w-full max-w-[220px]">
            <Select
              placeholder="Select club"
              value={clubOptions.find((o) => o.value === clubFilter) || null}
              options={clubOptions}
              onChange={(option) => setClubFilter(option?.value)}
              isClearable
              styles={customStyles}
            />
          </div>

          {/* Download Button */}
          <button
            onClick={downloadReport}
            disabled={!startMonth || !endMonth || !clubFilter}
            className={`px-4 py-2 rounded flex items-center gap-2
            ${
              !startMonth || !endMonth || !clubFilter
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            <LuDownload /> <span>Download Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RevenueRecognitionReport;
