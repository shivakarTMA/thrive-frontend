import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, subYears } from "date-fns";
import { FaCalendarDays } from "react-icons/fa6";
import Select from "react-select";
import { customStyles, filterActiveItems } from "../../../Helper/helper";
import { authAxios } from "../../../config/config";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const monthOptions = [
  { value: 0, label: "January" },
  { value: 1, label: "February" },
  { value: 2, label: "March" },
  { value: 3, label: "April" },
  { value: 4, label: "May" },
  { value: 5, label: "June" },
  { value: 6, label: "July" },
  { value: 7, label: "August" },
  { value: 8, label: "September" },
  { value: 9, label: "October" },
  { value: 10, label: "November" },
  { value: 11, label: "December" },
];

const yearOptions = Array.from({ length: 10 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { value: year, label: year.toString() };
});

const dummyData = [
  {
    id: 1,
    staff_name: "Prerna",
    club_name: "DLF Summit Plaza",
    sales_target: 60000,
    sales_achieved: 53572,
    new_sales: 33040,
    renewals: 20532,
  },
  {
    id: 2,
    staff_name: "Swati Singh",
    club_name: "DLF Summit Plaza",
    sales_target: 75000,
    sales_achieved: 68250,
    new_sales: 45000,
    renewals: 23250,
  },
  {
    id: 3,
    staff_name: "Rahul Verma",
    club_name: "DLF Summit Plaza",
    sales_target: 50000,
    sales_achieved: 41200,
    new_sales: 29000,
    renewals: 12200,
  },
];

const PtRevenueReport = () => {
  const [data] = useState(dummyData);
  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [staffFilter, setStaffFilter] = useState(null);

  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);

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

  const fetchStaff = async (search = "") => {
    try {
      const res = await authAxios().get("/staff/list", {
        params: search ? { search } : {},
      });
      const data = res.data?.data || [];
      const activeStaff = data.filter((item) => item.status === "ACTIVE");
      setStaffList(activeStaff);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch staff");
    }
  };

  useEffect(() => {
    fetchClub();
    fetchStaff();
  }, []);

  const clubOptions = clubList.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  const staffOptions = staffList.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  return (
    <div className="page--content">
      {/* Header */}
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">
            {`Home > Reports > Sales Reports > PT Revenue Report`}
          </p>
          <h1 className="text-3xl font-semibold">PT Revenue Report</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 items-center justify-between">
        <div className="flex gap-2 w-full">
          <div className="max-w-[160px] w-full">
            <Select
              placeholder="Month"
              options={monthOptions}
              value={selectedMonth}
              onChange={setSelectedMonth}
              isClearable
              styles={customStyles}
            />
          </div>

          <div className="w-full max-w-[140px]">
            <Select
              placeholder="Year"
              options={yearOptions}
              value={selectedYear}
              onChange={setSelectedYear}
              isClearable
              styles={customStyles}
            />
          </div>

          <div className="w-full max-w-[200px]">
            <Select
              placeholder="Filter by staff"
              value={staffOptions.find((o) => o.value === staffFilter) || null}
              options={staffOptions}
              onChange={(option) => setStaffFilter(option?.value)}
              isClearable
              styles={customStyles}
            />
          </div>
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
                <th className="px-2 py-4 ">S.No</th>
                <th className="px-2 py-4 ">Club Name</th>
                <th className="px-2 py-4 ">Staff Name</th>
                <th className="px-2 py-4 ">Sales Target</th>
                <th className="px-2 py-4 ">Sales Achieved</th>
                <th className="px-2 py-4 ">Achieved(%)</th>
                <th className="px-2 py-4 ">New Sales</th>
                <th className="px-2 py-4 ">Renewals</th>
                <th className="px-2 py-4 ">Action</th>
              </tr>
            </thead>

            <tbody>
              {data.length ? (
                data.map((row, index) => {
                  const achievedPercent = row.sales_target
                    ? ((row.sales_achieved / row.sales_target) * 100).toFixed(2)
                    : 0;

                  return (
                    <tr
                      key={index}
                      className="bg-white border-b hover:bg-gray-50 transition"
                    >
                      <td className="px-2 py-4">{index + 1}</td>
                      <td className="px-2 py-4">{row.club_name}</td>
                      <td className="px-2 py-4">{row.staff_name}</td>
                      <td className="px-2 py-4">{row.sales_target}</td>
                      <td className="px-2 py-4">{row.sales_achieved}</td>
                      <td className="px-2 py-4">{achievedPercent}%</td>
                      <td className="px-2 py-4">{row.new_sales}</td>
                      <td className="px-2 py-4">{row.renewals}</td>
                      <td className="px-2 py-4">
                        <Link
                          to={`/reports/sales-reports/pt-revenue-report-list/${row.id}`}
                          className="px-3 py-1 bg-black text-white rounded flex items-center gap-2 !text-[13px] w-fit"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="text-center px-2 py-4">
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

export default PtRevenueReport;
