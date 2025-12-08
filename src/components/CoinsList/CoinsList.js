import React, { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import AddCoins from "./AddCoins";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { customStyles, formatAutoDate } from "../../Helper/helper";
import { authAxios } from "../../config/config";
import { toast } from "react-toastify";

const coinsTypeOptions = [
  { value: "All", label: "All" },
  { value: "Referral", label: "Referral" },
  { value: "Compensation", label: "Compensation" },
  { value: "Challenges", label: "Challenges" },
];

const CoinsList = ({ details }) => {
  const [coinsList, setCoinsList] = useState([]);
  const [coinsTypeFilter, setCoinsTypeFilter] = useState(coinsTypeOptions[0]);
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [coinsModal, setCoinsModal] = useState(false);
  const columns = ["Date", "Coins", "Source", "Remarks"];

  // Fetch coins with filters applied
  const fetchMemberCoins = async (source = "", startDate = "", endDate = "") => {
    try {
      // Prepare query parameters based on the selected filters
      const params = {
        source: source !== "All" ? source : "", // Exclude 'All' in the query
        startDate: startDate ? startDate.toISOString().split("T")[0] : "",
        endDate: endDate ? endDate.toISOString().split("T")[0] : "",
      };

      // Make the API call with query parameters
      const res = await authAxios().get(`/coin/transaction/list/${details?.id}`, {
        params: params,
      });
      const data = res.data?.data || [];
      setCoinsList(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch coins");
    }
  };

  // Fetch coins whenever the component mounts or filters change
  useEffect(() => {
    fetchMemberCoins(coinsTypeFilter.value, dateFrom, dateTo);
  }, [coinsTypeFilter, dateFrom, dateTo,]);

const handleUpdateCoins = () => {
  fetchMemberCoins(coinsTypeFilter.value, dateFrom, dateTo);  // Refreshes the coins list
};

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex gap-3 justify-between">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {/* Filter by source */}
          <Select
            options={coinsTypeOptions}
            value={coinsTypeFilter}
            onChange={setCoinsTypeFilter}
            placeholder="Select Source"
            styles={customStyles}
            className="w-40"
          />
          
          {/* Filter by date from */}
          <div className="custom--date dob-format">
            <DatePicker
              selected={dateFrom}
              onChange={(date) => {
                setDateFrom(date);
                if (!date) setDateTo(null); // Reset 'To' date when 'From' is cleared
              }}
              isClearable
              showMonthDropdown
              showYearDropdown
              maxDate={new Date()}
              dateFormat="dd MMM yyyy"
              dropdownMode="select"
              placeholderText="From date"
              className="custom--input w-full"
            />
          </div>

          {/* Filter by date to */}
          <div className="custom--date dob-format">
            <DatePicker
              selected={dateTo}
              onChange={(date) => setDateTo(date)}
              isClearable
              minDate={dateFrom || null}
              maxDate={new Date()}
              showMonthDropdown
              showYearDropdown
              dateFormat="dd MMM yyyy"
              dropdownMode="select"
              placeholderText="End date"
              className="custom--input w-full"
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
                  <td className="border px-3 py-2">{formatAutoDate(item?.createdAt)}</td>
                  <td className="border px-3 py-2">{item?.coins}</td>
                  <td className="border px-3 py-2">{item?.source}</td>
                  <td className="border px-3 py-2">{item?.remark}</td>
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
