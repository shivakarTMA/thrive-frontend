import React, { useState } from "react";
import { Link } from "react-router-dom";

const dummyData = [
  {
    id: 1,
    club_name: "DLF Summit Plaza",
    name: "Avantika",
    invoice_no: "Mar9-2025",
    new_sales: "New Sales",
    start_date: "05-03-2025",
    end_date: "02-07-2025",
    service: "36 - Sessions",
    total_sessions: "36",
    completed_sessions: "5",
    pending_sessions: "31",
    base_amount: "33040",
  },
  {
    id: 2,
    club_name: "DLF Summit Plaza",
    name: "Harneet Kaur",
    invoice_no: "Mar54-2025",
    new_sales: "Renewal",
    start_date: "18-03-2025",
    end_date: "01-05-2025",
    service: "12 - Sessions",
    total_sessions: "12",
    completed_sessions: "1",
    pending_sessions: "11",
    base_amount: "12036",
  },
  {
    id: 3,
    club_name: "DLF Summit Plaza",
    name: "Raina Sinha",
    invoice_no: "Mar49-2025",
    new_sales: "Renewal",
    start_date: "13-03-2025",
    end_date: "11-04-2025",
    service: "8 - Sessions",
    total_sessions: "8",
    completed_sessions: "3",
    pending_sessions: "5",
    base_amount: "8496",
  },
];

const PtRevenueListReport = () => {
  const [data] = useState(dummyData);

  return (
    <div className="page--content">
      {/* Header */}
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">
            {`Home > Reports > Sales Reports > PT Revenue Report`}
          </p>
          <h1 className="text-3xl font-semibold">Revenue Prerna</h1>
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
                <th className="px-2 py-4 min-w-[150px]">Member Name</th>
                <th className="px-2 py-4 min-w-[100px]">Invoice No</th>
                <th className="px-2 py-4 min-w-[150px]">New Sales/Renewal</th>
                <th className="px-2 py-4 min-w-[100px]">Start Date</th>
                <th className="px-2 py-4 min-w-[100px]">End Date</th>
                <th className="px-2 py-4 min-w-[120px]">Service</th>
                <th className="px-2 py-4 min-w-[120px]">Total Sessions</th>
                <th className="px-2 py-4 min-w-[150px]">Completed Sessions</th>
                <th className="px-2 py-4 min-w-[130px]">Pending Sessions</th>
                <th className="px-2 py-4 min-w-[170px]">Base Amount With Tax</th>
              </tr>
            </thead>

            <tbody>
              {data.length ? (
                data.map((row, index) => {
                  return (
                    <tr
                      key={index}
                      className="bg-white border-b hover:bg-gray-50 transition"
                    >
                      <td className="px-2 py-4">{index + 1}</td>
                      <td className="px-2 py-4">{row.club_name}</td>
                      <td className="px-2 py-4">{row.name}</td>
                      <td className="px-2 py-4">{row.invoice_no}</td>
                      <td className="px-2 py-4">{row.new_sales}</td>

                      <td className="px-2 py-4">{row.start_date}</td>
                      <td className="px-2 py-4">{row.end_date}</td>
                      <td className="px-2 py-4">{row.service}</td>
                      <td className="px-2 py-4">{row.total_sessions}</td>
                      <td className="px-2 py-4">
                        <div className="flex gap-2 items-center">
                          {row.completed_sessions}{" "}
                          <Link
                            to={`/reports/operations-reports/member-checkins-report/${row.id}`}
                            className="px-3 py-1 bg-black text-white rounded flex items-center gap-2 !text-[13px] w-fit"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                      <td className="px-2 py-4">{row.pending_sessions}</td>
                      <td className="px-2 py-4">{row.base_amount}</td>
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

export default PtRevenueListReport;
