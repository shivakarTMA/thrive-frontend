import React, { useState } from "react";
import { FiPlus } from "react-icons/fi";
import AddCoins from "./AddCoins";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { customStyles } from "../../Helper/helper";

const coinsList = [
  {
    date: "2025-01-15",
    coins_added: 50,
    reason: "Referral",
    remarks: "Successful referral",
  },
  {
    date: "2025-02-01",
    coins_added: 30,
    reason: "Challenges",
    remarks: "Lead referred",
  },
  {
    date: "2025-02-20",
    coins_added: 40,
    reason: "Referral",
    remarks: "Member signed up",
  },
  {
    date: "2025-03-05",
    coins_added: 60,
    reason: "Challenges",
    remarks: "Lead referred",
  },
  {
    date: "2025-03-22",
    coins_added: 50,
    reason: "Compensation",
    remarks: "Member referred",
  },
  {
    date: "2025-04-10",
    coins_added: 35,
    reason: "Referral",
    remarks: "Lead conversion",
  },
  {
    date: "2025-04-18",
    coins_added: 70,
    reason: "Compensation",
    remarks: "Member sign-up",
  },
  {
    date: "2025-05-01",
    coins_added: 25,
    reason: "Referral",
    remarks: "Lead referred",
  },
  {
    date: "2025-05-12",
    coins_added: 45,
    reason: "Challenges",
    remarks: "Lead conversion",
  },
  {
    date: "2025-06-01",
    coins_added: 55,
    reason: "Compensation",
    remarks: "Member signed up",
  },
];

const coinsTypeOptions = [
  { value: "All", label: "All" },
  { value: "Referral", label: "Referral" },
  { value: "Compensation", label: "Compensation" },
  { value: "Challenges", label: "Challenges" },
];

const CoinsList = () => {
  const [coinsTypeFilter, setCoinsTypeFilter] = useState({
    value: "All",
    label: "All",
  });
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);

  const [coinsModal, setCoinsModal] = useState(false);
  const columns = ["Date", "Coins Added", "Reason", "Remarks"];

  const filteredCoins = coinsList.filter((appt) => {
    const apptDate = new Date(appt.date); // ✅ Correct parsing

    return (
      (coinsTypeFilter.value === "All" ||
        appt.reason === coinsTypeFilter.value) && // ✅ Check against reason, not appointmentType
      (!dateFrom || apptDate >= dateFrom) &&
      (!dateTo || apptDate <= dateTo)
    );
  });

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex gap-3 justify-between">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Select
            options={coinsTypeOptions}
            value={coinsTypeFilter}
            onChange={setCoinsTypeFilter}
            placeholder="Select Appointment Type"
            styles={customStyles}
            className="w-40"
          />
          <div className="custom--date dob-format">
            <DatePicker
              selected={dateFrom}
              onChange={(date) => {
                setDateFrom(date);
                if (!date) setDateTo(null);
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
        <div>
          <div
            className="px-4 py-2 bg-black text-white rounded flex items-center gap-2 cursor-pointer"
            onClick={() => setCoinsModal(true)}
          >
            <FiPlus /> Add Coins
          </div>
        </div>
      </div>

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
            {filteredCoins.length > 0 ? (
              filteredCoins.map((item, idx) => (
                <tr key={idx}>
                  <td className="border px-3 py-2">{item?.date}</td>
                  <td className="border px-3 py-2">{item?.coins_added}</td>
                  <td className="border px-3 py-2">{item?.reason}</td>
                  <td className="border px-3 py-2">{item?.remarks}</td>
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

      {coinsModal && <AddCoins setCoinsModal={setCoinsModal} />}
    </div>
  );
};

export default CoinsList;
