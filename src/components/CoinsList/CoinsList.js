import React, { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import AddCoins from "./AddCoins";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { customStyles, formatAutoDate, formatText } from "../../Helper/helper";
import { authAxios } from "../../config/config";
import { toast } from "react-toastify";
import { addYears, format, subYears } from "date-fns";
import { FaCalendarDays } from "react-icons/fa6";
import Pagination from "../common/Pagination";

const coinsTypeOptions = [
  { value: "CREDIT", label: "Credit" },
  { value: "DEBIT", label: "Debit" },
];

const CoinsList = ({ details }) => {
  const [coinsList, setCoinsList] = useState([]);
  const [coinsTypeFilter, setCoinsTypeFilter] = useState([]);
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [coinsModal, setCoinsModal] = useState(false);
  const columns = ["Date", "Coins", "Source", "Remarks", "Transaction Type"];

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch coins with filters applied
  const fetchMemberCoins = async (currentPage = page) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };

      if (coinsTypeFilter?.value) {
        params.transaction_type = coinsTypeFilter.value;
      }

      if (dateFrom && dateTo) {
        params.startDate = format(dateFrom, "yyyy-MM-dd");
        params.endDate = format(dateTo, "yyyy-MM-dd");
      }

      // Make the API call with query parameters
      const res = await authAxios().get(
        `/coin/transaction/list/${details?.id}`,
        { params },
      );
      const responseData = res.data;
      const data = res.data?.data || [];
      setCoinsList(data);
      setPage(responseData?.currentPage || 1);
      setTotalPages(responseData?.totalPage || 1);
      setTotalCount(responseData?.totalCount || data.length);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch coins");
    }
  };

  // Fetch coins whenever the component mounts or filters change

  useEffect(() => {
    setPage(1);
    // ✅ If one date selected but not both → do nothing
    if ((dateFrom && !dateTo) || (!dateFrom && dateTo)) {
      return;
    }

    fetchMemberCoins(1);
  }, [coinsTypeFilter, dateFrom, dateTo]);

  const handleUpdateCoins = () => {
    fetchMemberCoins(coinsTypeFilter.value, dateFrom, dateTo); // Refreshes the coins list
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex gap-3 justify-between mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Select
            options={coinsTypeOptions}
            value={coinsTypeFilter}
            onChange={setCoinsTypeFilter}
            placeholder="Select Source"
            styles={customStyles}
            className="w-40"
            isClearable
          />

          <div className="custom--date dob-format">
            <span className="absolute z-[1] mt-[11px] ml-[15px]">
              <FaCalendarDays />
            </span>
            <DatePicker
              isClearable
              selected={dateFrom}
              onChange={(date) => {
                setDateFrom(date);
                setDateTo(null);
              }}
              showMonthDropdown
              showYearDropdown
              maxDate={new Date()}
              dateFormat="dd MMM yyyy"
              dropdownMode="select"
              placeholderText="From date"
              className="custom--input w-full input--icon"
            />
          </div>
          <div className="custom--date dob-format">
            <span className="absolute z-[1] mt-[11px] ml-[15px]">
              <FaCalendarDays />
            </span>
            <DatePicker
              isClearable
              selected={dateTo}
              onChange={(date) => setDateTo(date)}
              showMonthDropdown
              showYearDropdown
              minDate={dateFrom || subYears(new Date(), 20)}
              maxDate={addYears(new Date(), 0)}
              dateFormat="dd MMM yyyy"
              dropdownMode="select"
              placeholderText="To date"
              className="custom--input w-full input--icon"
              disabled={!dateFrom}
            />
          </div>
        </div>

        {/* Button to open the modal for adding coins */}
        <div>
          <div
            className="px-4 py-2 bg-black text-white rounded flex items-center gap-2 cursor-pointer"
            onClick={() => setCoinsModal(true)}
          >
            <FiPlus /> Add Coins
          </div>
        </div>
      </div>

      {/* Table displaying coins list */}
      <div className="overflow-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="border px-3 py-2">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {coinsList.length > 0 ? (
              coinsList.map((item, idx) => (
                <tr key={idx}>
                  <td className="border px-3 py-2">
                    {formatAutoDate(item?.createdAt)}
                  </td>
                  <td className="border px-3 py-2">
                    <span
                      className={`${
                        item?.transaction_type === "CREDIT"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {item?.coins}
                    </span>
                  </td>
                  <td className="border px-3 py-2">{item?.source}</td>
                  <td className="border px-3 py-2">{item?.remark}</td>
                  <td className="border px-3 py-2">
                    {formatText(item?.transaction_type)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-4 text-gray-500"
                >
                  No data found.
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
        currentDataLength={coinsList.length}
        onPageChange={(newPage) => {
          setPage(newPage);
          fetchMemberCoins(newPage);
        }}
      />

      {/* AddCoins modal */}
      {coinsModal && (
        <AddCoins
          setCoinsModal={setCoinsModal}
          details={details}
          handleUpdateCoins={handleUpdateCoins}
        />
      )}
    </div>
  );
};

export default CoinsList;
