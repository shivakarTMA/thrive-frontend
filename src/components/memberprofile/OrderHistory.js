import React, { useEffect, useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { customStyles, formatAutoDate } from "../../Helper/helper";
import { apiAxios } from "../../config/config";
import { toast } from "react-toastify";

const OrderHistory = ({details}) => {
  const [category, setCategory] = useState({ value: "All", label: "All" });
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [ordersList, setOrdersList] = useState([]);


  const categoryOptions = [
    { value: "All", label: "All" },
    { value: "Membership", label: "Membership" },
    { value: "Cafe Items", label: "Cafe Items" },
    { value: "Merchandise", label: "Merchandise" },
    { value: "Spa", label: "Spa" },
    { value: "Physiotherapy", label: "Physiotherapy" },
    { value: "NC", label: "NC" },
    { value: "GX", label: "GX" },
    { value: "Sports", label: "Sports" },
  ];


  // Fetch coins with filters applied
  const fetchMemberOrders = async () => {
    try {
      // Make the API call with query parameters
      const res = await apiAxios().get(`/member/order/${details?.id}`);
      const data = res.data?.data || [];
      setOrdersList(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch coins");
    }
  };

  useEffect(() => {
    fetchMemberOrders();
  }, [ordersList]);

  return (
    <div className="p-4 bg-white rounded shadow">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Select
          options={categoryOptions}
          value={category}
          onChange={setCategory}
          placeholder="Select Category"
          styles={customStyles}
            className="w-40"
        />
        <div className="custom--date dob-format">
          <DatePicker
            isClearable
            selected={dateFrom}
            onChange={(date) => {
              setDateFrom(date);
              if (!date) setDateTo(null);
            }}
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
            isClearable
            selected={dateTo}
            onChange={(date) => setDateTo(date)}
            showMonthDropdown
            showYearDropdown
            maxDate={new Date()}
            dateFormat="dd MMM yyyy"
            dropdownMode="select"
            placeholderText="To date"
            className="custom--input w-full"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="border px-3 py-2">Order ID</th>
              <th className="border px-3 py-2">Date</th>
              <th className="border px-3 py-2">Product/Service</th>
              <th className="border px-3 py-2">Category</th>
              <th className="border px-3 py-2">Duration</th>
              <th className="border px-3 py-2">Amount</th>
              <th className="border px-3 py-2">Tax</th>
              <th className="border px-3 py-2">Net Paid</th>
              <th className="border px-3 py-2">Status</th>
              <th className="border px-3 py-2">Payment Mode</th>
              <th className="border px-3 py-2">Invoice No.</th>
            </tr>
          </thead>
          <tbody>
            {ordersList.length > 0 ? (
              ordersList.map((order) => (
                <tr key={order.orderId} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{order?.order_no}</td>
                  <td className="border px-3 py-2">{formatAutoDate(order?.order_date)}</td>
                  <td className="border px-3 py-2">{order?.order_type}</td>
                  <td className="border px-3 py-2">{order?.category}</td>
                  <td className="border px-3 py-2">{order?.duration || "-"}</td>
                  <td className="border px-3 py-2">₹{order?.total_amount ? order?.total_amount : 0}</td>
                  <td className="border px-3 py-2">₹{order?.tax ? order?.tax : 0}</td>
                  <td className="border px-3 py-2">₹{order?.net ? order?.net : 0}</td>
                  <td className="border px-3 py-2">{order?.payment_status}</td>
                  <td className="border px-3 py-2">{order?.paymentMode}</td>
                  <td className="border px-3 py-2">{order?.invoiceNumber}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center py-4 text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderHistory;
