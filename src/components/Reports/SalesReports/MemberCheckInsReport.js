import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, subYears } from "date-fns";
import { FaCalendarDays } from "react-icons/fa6";
import Select from "react-select";
import { customStyles, filterActiveItems } from "../../../Helper/helper";
import { authAxios } from "../../../config/config";
import { toast } from "react-toastify";

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const attendanceDummyData = [
  {
    member_id: 2030657,
    club_name: "DLF Summit Plaza",
    name: "Avantika",
    profile_image: "https://i.pravatar.cc/150?img=47",
    mobile: "7681972497",
    service_name: "Personal Training",
    date: "14-05-2025",
    location: "DLF Thrive, Cyberpark",
    clock_in: "05:11 PM",
    clock_out: "05:11 PM",
    medium_staff: "White_Label",
    current_pt: "Rakhi Chauhan",
    conducted_by: "Rakhi Chauhan Accepted",
    pt_no_show: "No",
  },
  {
    member_id: 2030657,
    club_name: "DLF Summit Plaza",
    name: "Avantika",
    profile_image: "https://i.pravatar.cc/150?img=47",
    mobile: "7681972497",
    service_name: "Personal Training",
    date: "14-05-2025",
    location: "DLF Thrive, Cyberpark",
    clock_in: "05:11 PM",
    clock_out: "10:00 PM",
    medium_staff: "White_Label",
    current_pt: "Rakhi Chauhan",
    conducted_by: "Rakhi Chauhan Accepted",
    pt_no_show: "No",
  },
  {
    member_id: 2030657,
    club_name: "DLF Summit Plaza",
    name: "Avantika",
    profile_image: "https://i.pravatar.cc/150?img=47",
    mobile: "7681972497",
    service_name: "Personal Training",
    date: "06-05-2025",
    location: "DLF Thrive, Cyberpark",
    clock_in: "10:30 AM",
    clock_out: "10:00 PM",
    medium_staff: "White_Label",
    current_pt: "Rakhi Chauhan",
    conducted_by: "Rakhi Chauhan Accepted",
    pt_no_show: "No",
  },
  {
    member_id: 2030657,
    club_name: "DLF Summit Plaza",
    name: "Avantika",
    profile_image: "https://i.pravatar.cc/150?img=47",
    mobile: "7681972497",
    service_name: "Personal Training",
    date: "05-05-2025",
    location: "DLF Thrive, Cyberpark",
    clock_in: "10:38 AM",
    clock_out: "10:00 PM",
    medium_staff: "White_Label",
    current_pt: "Rakhi Chauhan",
    conducted_by: "Rakhi Chauhan Accepted",
    pt_no_show: "No",
  },
  {
    member_id: 2030657,
    club_name: "DLF Summit Plaza",
    name: "Avantika",
    profile_image: "https://i.pravatar.cc/150?img=47",
    mobile: "7681972497",
    service_name: "Personal Training",
    date: "01-05-2025",
    location: "DLF Thrive, Cyberpark",
    clock_in: "12:44 PM",
    clock_out: "10:00 PM",
    medium_staff: "White_Label",
    current_pt: "Rakhi Chauhan",
    conducted_by: "Rakhi Chauhan Accepted",
    pt_no_show: "No",
  },
  {
    member_id: 2030657,
    club_name: "DLF Summit Plaza",
    name: "Avantika",
    profile_image: "https://i.pravatar.cc/150?img=47",
    mobile: "7681972497",
    service_name: "Personal Training",
    date: "29-04-2025",
    location: "DLF Thrive, Cyberpark",
    clock_in: "10:19 AM",
    clock_out: "10:00 PM",
    medium_staff: "White_Label",
    current_pt: "Rakhi Chauhan",
    conducted_by: "Rakhi Chauhan Accepted",
    pt_no_show: "No",
  },
];
const MemberCheckInsReport = () => {
  const [data, setData] = useState(attendanceDummyData);

  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
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

  return (
    <div className="page--content">
      {/* Header */}
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">
            {`Home > Reports > Sales Reports > Member All Check-Ins`}
          </p>
          <h1 className="text-3xl font-semibold">Member All Check-Ins</h1>
        </div>

        <div className="w-fit bg-white shodow--box rounded-[10px] px-5 py-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 border-r">
              <div className="text-md font-medium text-gray-600 flex gap-2 items-center">
                Total Check-ins:
              </div>
              <div className="pr-2">
                <span className="text-md font-semibold">98</span>
              </div>
            </div>
            <div className="flex items-center gap-1 border-r">
              <div className="text-md font-medium text-gray-600 flex gap-2 items-center">
                Total Unique Check-ins:
              </div>
              <div className="pr-2">
                <span className="text-md font-semibold">90</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div className="text-md font-medium text-gray-600 flex gap-2 items-center">
                Total Unique Members:
              </div>
              <div className="pr-2">
                <span className="text-md font-semibold">90</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 items-center justify-between">
        <div className="flex gap-2 w-full">
          {/* Search Input */}
          <div className="max-w-[200px] w-full">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Name/ Mobile"
              className="custom--input w-full"
            />
          </div>
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
                <th className="px-2 py-4 min-w-[50px]">S.No</th>
                <th className="px-2 py-4 min-w-[150px]">Club Name</th>
                <th className="px-2 py-4 min-w-[100px]">Member ID</th>
                <th className="px-2 py-4 min-w-[120px]">Member Name</th>
                <th className="px-2 py-4 min-w-[150px]">Service Name</th>
                <th className="px-2 py-4 min-w-[100px]">Date</th>
                <th className="px-2 py-4 min-w-[160px]">Location</th>
                <th className="px-2 py-4 min-w-[100px]">Clock In</th>
                <th className="px-2 py-4 min-w-[100px]">Clock Out</th>

                <th className="px-2 py-4 min-w-[140px]">Current PT</th>
                <th className="px-2 py-4 min-w-[150px]">Conducted By</th>
                <th className="px-2 py-4 min-w-[120px]">PT No Show</th>
              </tr>
            </thead>

            <tbody>
              {data.length ? (
                data.map((row, index) => {
                  return (
                    <tr key={index}>
                      <td className="px-2 py-4">{index + 1}</td>
                      <td className="px-2 py-4">{row.club_name}</td>
                      <td className="px-2 py-4">{row.member_id}</td>
                      <td className="flex items-center gap-2 px-2 py-4">
                        <img
                          src={row.profile_image}
                          alt={row.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="text-black">{row.name}</span>
                      </td>
                      <td className="px-2 py-4">{row.service_name}</td>
                      <td className="px-2 py-4">{row.date}</td>
                      <td className="px-2 py-4">{row.location}</td>
                      <td className="text-green-600 px-2 py-4">
                        {row.clock_in}
                      </td>
                      <td className="text-orange-500 px-2 py-4">
                        {row.clock_out}
                      </td>
                      <td className="px-2 py-4">--</td>
                      <td className="px-2 py-4">--</td>
                      <td className="px-2 py-4">{row.pt_no_show}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={13} className="text-center px-2 py-4">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MemberCheckInsReport;
