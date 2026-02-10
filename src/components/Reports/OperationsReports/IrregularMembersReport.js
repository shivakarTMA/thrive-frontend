import React, { useEffect, useState } from "react";
import Select from "react-select";
import {
  customStyles,
  filterActiveItems,
  formatAutoDate,
} from "../../../Helper/helper";
import { authAxios } from "../../../config/config";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Pagination from "../../common/Pagination";

const noOfDaysOptions = [
  { value: 7, label: "Last 7 Days" },
  { value: 15, label: "Last 15 Days" },
  { value: 30, label: "Last 30 Days" },
  { value: 60, label: "Last 60 Days" },
  { value: 90, label: "Last 90 Days" },
];

const IrregularMembersReport = () => {
  const [irregularMember, setIrregularMember] = useState([]);
  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);

  const { user } = useSelector((state) => state.auth);
  const userRole = user.role;

  const [noOfDays, setNoOfDays] = useState(noOfDaysOptions[1]);

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

      // ✅ Set default club (index 0) ONLY if not already set
      if (!clubFilter && activeOnly.length > 0) {
        setClubFilter(activeOnly[0].id);
      }
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

  const fetchIrregularMembersReport = async (currentPage = page) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };

      // Club filter
      if (clubFilter) {
        params.club_id = clubFilter;
      }

      // noOfDays filter
      if (noOfDays?.value) {
        params.no_of_days = noOfDays.value;
      }

      const res = await authAxios().get("/report/irregular/list", {
        params,
      });
      const responseData = res.data;
      const data = responseData?.data || [];

      console.log(responseData, "responseData");

      setIrregularMember(data);
      setPage(responseData?.currentPage || 1);
      setTotalPages(responseData?.totalPage || 1);
      setTotalCount(responseData?.totalCount || data.length);
    } catch (err) {
      console.error(err);
      toast.error("data not found");
    }
  };

  useEffect(() => {
    setPage(1);
    fetchIrregularMembersReport(1);
  }, [clubFilter, noOfDays]);

  return (
    <div className="page--content">
      {/* Header */}
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">
            {`Home > Reports > Operations Reports > Irregular Members Report`}
          </p>
          <h1 className="text-3xl font-semibold">Irregular Members Report</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 items-center justify-between">
        <div className="flex gap-2 w-full">
          <div className="max-w-[200px] w-full">
            <Select
              placeholder="Irregular Since"
              options={noOfDaysOptions}
              value={noOfDays}
              onChange={(selected) => setNoOfDays(selected)}
              styles={customStyles}
            />
          </div>

          <div className="w-fit min-w-[200px]">
            <Select
              placeholder="Filter by club"
              value={clubOptions.find((o) => o.value === clubFilter) || null}
              options={clubOptions}
              onChange={(option) => setClubFilter(option?.value)}
              styles={customStyles}
              className="w-full"
              isClearable={userRole === "ADMIN" ? true : false}
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
                <th className="px-2 py-4 min-w-[120px]">Member Name</th>
                <th className="px-2 py-4 min-w-[150px]">Plan Name</th>
                <th className="px-2 py-4 min-w-[150px]">Last visited on</th>
                <th className="px-2 py-4 min-w-[120px]">Sales Rep</th>
              </tr>
            </thead>

            <tbody>
              {irregularMember.length ? (
                irregularMember.map((row, index) => (
                  <tr
                    key={index}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <td className="px-2 py-4">{row.club_name || "-"}</td>
                    <td className="px-2 py-4">{row.full_name}</td>
                    <td className="px-2 py-4">{row.plan_name}</td>
                    <td className="px-2 py-4">
                      {row.last_visited_on
                        ? formatAutoDate(row.last_visited_on)
                        : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {row.sales_rep_name ? row.sales_rep_name : "--"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Component */}
        <Pagination
          page={page}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          currentDataLength={irregularMember.length}
          onPageChange={(newPage) => {
            setPage(newPage);
            fetchIrregularMembersReport(newPage);
          }}
        />
      </div>
    </div>
  );
};

export default IrregularMembersReport;
