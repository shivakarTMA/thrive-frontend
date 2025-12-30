import React, { useEffect, useState } from "react";
import Select from "react-select";
import { authAxios } from "../../../config/config";
import { customStyles, filterActiveItems } from "../../../Helper/helper";
import { toast } from "react-toastify";

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

const RenewalReport = () => {
  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);

  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);

  const data = [
    {
      studio: "DLF Thrive - Cyberpark",
      totalExpiry: 135,
      totalRenewal: 16,
      renewalPercent: 12,
      attritionPercent: 88,
      oldExpiry: 1125,
      reinstatements: 28,
      reinstatementPercent: 2,
      renewedAdvance: 0,
    },
  ];

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
            {`Home > Reports > Operations Reports > Renewal Report`}
          </p>
          <h1 className="text-3xl font-semibold">Renewal Report</h1>
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
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th rowSpan="2" className="border px-3 py-2">
                  S.No
                </th>
                <th rowSpan="2" className="border px-3 py-2">
                  Studio
                </th>
                <th colSpan="6" className="border px-3 py-2">
                  This Month's Summary
                </th>
                <th colSpan="4" className="border px-3 py-2">
                  Old Expired Memberships
                </th>
                <th colSpan="2" className="border px-3 py-2">
                  Membership Renewed In Advance
                </th>
              </tr>
              <tr>
                <th className="border px-3 py-2">Total Expiry</th>
                <th className="border px-3 py-2">Total Renewal</th>
                <th className="border px-3 py-2">Renewal %</th>
                <th className="border px-3 py-2">Attrition %</th>
                <th className="border px-3 py-2">List</th>

                <th className="border px-3 py-2">Total Old Expiry</th>
                <th className="border px-3 py-2">Total Reinstatements</th>
                <th className="border px-3 py-2">Reinstatement %</th>
                <th className="border px-3 py-2">List</th>

                <th className="border px-3 py-2">Renewed In Advance</th>
                <th className="border px-3 py-2">List</th>
              </tr>
            </thead>

            <tbody>
              {data.map((row, index) => (
                <tr key={index} className="text-center">
                  <td className="border px-3 py-2">{index + 1}</td>
                  <td className="border px-3 py-2 text-left">{row.studio}</td>

                  <td className="border px-3 py-2">{row.totalExpiry}</td>
                  <td className="border px-3 py-2">{row.totalRenewal}</td>
                  <td className="border px-3 py-2">{row.renewalPercent}</td>
                  <td className="border px-3 py-2">{row.attritionPercent}</td>
                  <td className="border px-3 py-2">
                    <button className="bg-black text-white px-3 py-1 rounded">
                      View
                    </button>
                  </td>

                  <td className="border px-3 py-2">{row.oldExpiry}</td>
                  <td className="border px-3 py-2">{row.reinstatements}</td>
                  <td className="border px-3 py-2">
                    {row.reinstatementPercent}
                  </td>
                  <td className="border px-3 py-2">
                    <button className="bg-black text-white px-3 py-1 rounded">
                      View
                    </button>
                  </td>

                  <td className="border px-3 py-2">{row.renewedAdvance}</td>
                  <td className="border px-3 py-2">
                    <button className="bg-black text-white px-3 py-1 rounded">
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {/* Total Row */}
              <tr className="font-bold bg-gray-50 text-center">
                <td colSpan="2" className="border px-3 py-2 text-left">
                  Total
                </td>
                <td className="border px-3 py-2">135</td>
                <td className="border px-3 py-2">16</td>
                <td colSpan="3" className="border px-3 py-2"></td>
                <td className="border px-3 py-2">1125</td>
                <td className="border px-3 py-2">28</td>
                <td colSpan="3" className="border px-3 py-2"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RenewalReport;
