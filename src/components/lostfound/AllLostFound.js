import React, { useState, useEffect } from "react";
import { FaAngleLeft, FaAngleRight, FaCheck, FaCircle } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import { IoIosSearch } from "react-icons/io";
import Select from "react-select";
import { lostFoundData as initialData } from "../../DummyData/DummyData";
import AddNewItemModal from "./AddNewItemModal";
import MarkReturnedModal from "./MarkReturnedModal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, format, subYears } from "date-fns";
import { customStyles } from "../../Helper/helper";
import viewIcon from "../../assets/images/icons/eye.svg";
import returnIcon from "../../assets/images/icons/return.svg";
import { FaCalendarDays } from "react-icons/fa6";
import LostFoundPanel from "../FilterPanel/LostFoundPanel";


const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const AllLostFound = () => {
  const [data, setData] = useState(initialData);
  const [modalOpen, setModalOpen] = useState(false);
  const [returnedModalOpen, setReturnedModalOpen] = useState(false);
  const [markReturnedData, setMarkReturnedData] = useState([]);

  const [dateFilter, setDateFilter] = useState(dateFilterOptions[1]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  const [itemStatus, setItemStatus] = useState(null);
  const [itemCategory, setItemCategory] = useState(null);
  const [itemLocation, setItemLocation] = useState(null);
  const [itemFloor, setItemFloor] = useState(null);
  const [itemFoundFrom, setItemFoundFrom] = useState(null);
  const [itemFoundTo, setItemFoundTo] = useState(null);
  const [itemReturnedFrom, setItemReturnedFrom] = useState(null);
  const [itemReturnedTo, setItemReturnedTo] = useState(null);

  return (
    <div className="page--content">
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">Home &gt; Lost &amp; Found</p>
          <h1 className="text-3xl font-semibold">Lost &amp; Found</h1>
        </div>
      </div>
      <div className="flex gap-2 w-full mb-4">
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
            // isClearable
            styles={customStyles}
            className="w-full"
          />
        </div>

        {dateFilter?.value === "custom" && (
          <>
            <div className="custom--date flex-1 max-w-[180px] w-full">
              <span className="absolute z-[1] mt-[15px] ml-[15px]">
                <FaCalendarDays />
              </span>
              <DatePicker
                selected={customFrom}
                onChange={(date) => setCustomFrom(date)}
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
            <div className="custom--date flex-1 max-w-[180px] w-full">
              <span className="absolute z-[1] mt-[15px] ml-[15px]">
                <FaCalendarDays />
              </span>
              <DatePicker
                selected={customTo}
                onChange={(date) => setCustomTo(date)}
                placeholderText="To Date"
                className="custom--input w-full input--icon"
                minDate={subYears(new Date(), 20)}
                maxDate={addYears(new Date(), 0)}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                dateFormat="dd-MM-yyyy"
              />
            </div>
          </>
        )}
      </div>

      <div className="w-full p-3 border bg-white shodow--box rounded-[10px]">
        <div className="flex items-start gap-3 justify-between w-full mb-3 border-b border-b-[#D4D4D4] pb-3">
          <div>
            <LostFoundPanel
              itemStatus={itemStatus}
              setItemStatus={setItemStatus}
              itemCategory={itemCategory}
              setItemCategory={setItemCategory}
              itemLocation={itemLocation}
              setItemLocation={setItemLocation}
              itemFloor={itemFloor}
              setItemFloor={setItemFloor}
              itemFoundFrom={itemFoundFrom}
              setItemFoundFrom={setItemFoundFrom}
              itemFoundTo={itemFoundTo}
              setItemFoundTo={setItemFoundTo}
              itemReturnedFrom={itemReturnedFrom}
              setItemReturnedFrom={setItemReturnedFrom}
              itemReturnedTo={itemReturnedTo}
              setItemReturnedTo={setItemReturnedTo}
            />
          </div>
          <div>
            <button
              onClick={() => setModalOpen(true)}
              type="button"
              className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
            >
              <FiPlus /> Add New Item
            </button>
          </div>
        </div>

        <div className="table--data--bottom w-full">
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-2 py-4">Item Name</th>
                  <th className="px-2 py-4">Category</th>
                  <th className="px-2 py-4">Found At</th>
                  <th className="px-2 py-4">Date & Time</th>
                  <th className="px-2 py-4">Status</th>
                  <th className="px-2 py-4">Logged By</th>
                  <th className="px-2 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr
                    key={row.id}
                    className="bg-white border-b hover:bg-gray-50 border-gray-200"
                  >
                    <td className="px-2 py-4">{row?.itemName}</td>
                    <td className="px-2 py-4">{row?.category}</td>
                    <td className="px-2 py-4">{row?.foundAt}</td>
                    <td className="px-2 py-4">
                      {/* {row?.dateTime} */}
                      {format(new Date(row?.dateTime), 'dd/MM/yyyy hh:mm a')}
                      </td>
                    <td className="px-2 py-4">
                      <span
                        className={`
                            flex items-center justify-between gap-1 rounded-full min-h-[30px] px-3 text-sm w-fit
                          ${
                            row?.status === "Available"
                              ? "bg-[#FFE7E7] text-[#C80000]"
                              : "bg-[#E8FFE6] text-[#138808]"
                          }
                          `}
                      >
                        <FaCircle className="text-[10px]" />
                        {row?.status == null ? "--" : row?.status}
                      </span>
                    </td>
                    <td className="px-2 py-4">{row.loggedBy}</td>
                    <td className="px-2 py-4">
                      <div className="flex">
                        <div className="bg-[#F1F1F1] border border-[#D4D4D4] rounded-l-[5px] w-[32px] h-[32px] flex items-center justify-center cursor-pointer">
                          <img src={viewIcon} />
                        </div>
                        <div
                          className={`bg-[#F1F1F1] border border-[#D4D4D4] rounded-r-[5px] w-[32px] h-[32px] flex items-center justify-center ${
                            row.status !== "Available"
                              ? "cursor-not-allowed pointer-events-none opacity-[0.5]"
                              : "cursor-pointer"
                          } `}
                          onClick={() => {
                            setReturnedModalOpen(true);
                            setMarkReturnedData(row?.id);
                          }}
                        >
                          <img src={returnIcon} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      {modalOpen && <AddNewItemModal onClose={() => setModalOpen(false)} />}

      {returnedModalOpen && (
        <MarkReturnedModal
          data={markReturnedData}
          onClose={() => setReturnedModalOpen(false)}
        />
      )}
    </div>
  );
};

export default AllLostFound;
