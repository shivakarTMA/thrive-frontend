import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { authAxios } from "../../../config/config";
import { formatAutoDate, formatText } from "../../../Helper/helper";
import Pagination from "../../../components/common/Pagination";

const SalesMemberCallLog = ({ filters }) => {
  const { customFrom, customTo, clubFilter, leadOwner, callStatus, callType } = filters;

  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchData = async (currentPage = 1) => {
    try {
      const params = { page: currentPage, limit: rowsPerPage };
      if (customFrom && customTo) {
        params.start_date = format(customFrom, "yyyy-MM-dd");
        params.end_date = format(customTo, "yyyy-MM-dd");
      }
      if (clubFilter?.value) params.club_id = clubFilter.value;
      if (leadOwner?.value) params.created_by = leadOwner.value;
      if (callType?.value) params.call_type = callType.value;
      if (callStatus?.value) params.call_status = callStatus.value;

      // ✅ Different endpoint from enquiry
      const res = await authAxios().get("/leaderboard/sales/calllog/leadmember?entity_type=MEMBER", { params });
      const resData = res.data;
      setData(resData?.data || []);
      setPage(resData?.currentPage || 1);
      setTotalPages(resData?.totalPage || 1);
      setTotalCount(resData?.totalCount || 0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchData(1);
  }, [customFrom, customTo, clubFilter?.value, leadOwner?.value, callStatus?.value, callType?.value]);

  return (
    <div className="w-full p-3 border bg-white shadow--box rounded-[10px]">
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-2 py-4 min-w-[120px]">Member Id</th>
              <th className="px-2 py-4 min-w-[90px]">Member Name</th>
              <th className="px-2 py-4 min-w-[150px]">Mobile</th>
              <th className="px-2 py-4 min-w-[120px]">Schedule For</th>
              <th className="px-2 py-4 min-w-[130px]">Call Type</th>
              <th className="px-2 py-4 min-w-[120px]">Call Status</th>
              <th className="px-2 py-4 min-w-[150px]">Updated By</th>
              <th className="px-2 py-4 min-w-[150px]">Created on</th>
              <th className="px-2 py-4 min-w-[150px]">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row) => (
                <tr key={row.id} className="bg-white border-b hover:bg-gray-50 border-gray-200">
                  <td className="px-2 py-4">{row?.membership_number || "--"}</td>
                  <td className="px-2 py-4">{row?.member_name || "--"}</td>
                  <td className="px-2 py-4">{row?.member_mobile || "--"}</td>
                  <td className="px-2 py-4">{row?.schedule_for || "--"}</td>
                  <td className="px-2 py-4">{row?.call_type|| "--"}</td>
                  <td className="px-2 py-4">{row?.call_status|| "--"}</td>
                  <td className="px-2 py-4">{row?.updated_by || "--"}</td>
                  <td className="px-2 py-4">{row?.created_on ? formatAutoDate(row.created_on) : "--"}</td>
                  <td className="px-2 py-4">{row?.remarks || "--"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="px-2 py-8 text-center text-gray-500">
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
        currentDataLength={data.length}
        onPageChange={(newPage) => {
          setPage(newPage);
          fetchData(newPage);
        }}
      />
    </div>
  );
};

export default SalesMemberCallLog;