import React, { useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { customStyles } from "../../Helper/helper";

const OrderHistory = () => {
  const [category, setCategory] = useState({ value: "All", label: "All" });
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);

  const orders = [
    {
      date: "15/5/25",
      name: "Alice",
      service: "Membership - 3 months",
      amount: 4000,
      tax: 720,
      net: 4720,
      paid: 4720,
      rewardPoints: 40,
      paymentMode: "Credit Card",
    },
    {
      date: "10/4/25",
      name: "Bob",
      service: "Spa - Full Body Massage",
      amount: 2000,
      tax: 360,
      net: 2360,
      paid: 2360,
      rewardPoints: 20,
      paymentMode: "UPI",
    },
    {
      date: "5/4/25",
      name: "Charlie",
      service: "Cafe Items - Coffee",
      amount: 150,
      tax: 27,
      net: 177,
      paid: 177,
      rewardPoints: 2,
      paymentMode: "Cash",
    },
    {
      date: "1/5/25",
      name: "Diana",
      service: "Physiotherapy - Back Pain",
      amount: 3000,
      tax: 540,
      net: 3540,
      paid: 3540,
      rewardPoints: 30,
      paymentMode: "Credit Card",
    },
    {
      date: "12/5/25",
      name: "Eve",
      service: "Merchandise - Yoga Mat",
      amount: 500,
      tax: 90,
      net: 590,
      paid: 590,
      rewardPoints: 5,
      paymentMode: "Debit Card",
    },
    {
      date: "2/3/25",
      name: "Frank",
      service: "NC - Nutrition Plan",
      amount: 1800,
      tax: 324,
      net: 2124,
      paid: 2124,
      rewardPoints: 18,
      paymentMode: "UPI",
    },
    {
      date: "20/2/25",
      name: "Grace",
      service: "GX - Group Workout",
      amount: 1000,
      tax: 180,
      net: 1180,
      paid: 1180,
      rewardPoints: 10,
      paymentMode: "Credit Card",
    },
    {
      date: "5/5/25",
      name: "Hank",
      service: "Sports - Personal Coaching",
      amount: 2500,
      tax: 450,
      net: 2950,
      paid: 2950,
      rewardPoints: 25,
      paymentMode: "Cash",
    },
    {
      date: "15/3/25",
      name: "Ivy",
      service: "Membership - 1 year",
      amount: 10000,
      tax: 1800,
      net: 11800,
      paid: 11800,
      rewardPoints: 100,
      paymentMode: "Credit Card",
    },
    {
      date: "28/4/25",
      name: "Jack",
      service: "Cafe Items - Protein Shake",
      amount: 300,
      tax: 54,
      net: 354,
      paid: 354,
      rewardPoints: 3,
      paymentMode: "UPI",
    },
  ];

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

  const filteredOrders = orders.filter((order) => {
    const [day, month, year] = order.date.split("/").map(Number);
    const orderDate = new Date(`20${year}`, month - 1, day);

    return (
      (category.value === "All" || order.service.includes(category.value)) &&
      (!dateFrom || orderDate >= dateFrom) &&
      (!dateTo || orderDate <= dateTo)
    );
  });

  return (
    <div className="p-4 bg-white rounded shadow">
      {/* Filter section */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <Select
          options={categoryOptions}
          value={category}
          onChange={setCategory}
          placeholder="Select Category"
          styles={customStyles}
          className="w-40"
        />
        <div className="custom--date">
          <DatePicker
            selected={dateFrom}
            onChange={(date) => setDateFrom(date)}
            className="border px-3 py-2 rounded"
            placeholderText="From date"
          />
        </div>
        <span>to</span>
        <div className="custom--date">
          <DatePicker
            selected={dateTo}
            onChange={(date) => setDateTo(date)}
            className="border px-3 py-2 rounded"
            placeholderText="To date"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="border px-3 py-2">Date</th>
              <th className="border px-3 py-2">Name</th>
              <th className="border px-3 py-2">Product/Service</th>
              <th className="border px-3 py-2">Amount</th>
              <th className="border px-3 py-2">Tax</th>
              <th className="border px-3 py-2">Net</th>
              <th className="border px-3 py-2">Paid</th>
              <th className="border px-3 py-2">Thrive Reward Points</th>
              <th className="border px-3 py-2">Payment Mode</th>
              <th className="border px-3 py-2">Paid Receipt</th>
              <th className="border px-3 py-2">Invoice</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order, idx) => (
              <tr key={idx}>
                <td className="border px-3 py-2">{order.date}</td>
                <td className="border px-3 py-2">{order.name}</td>
                <td className="border px-3 py-2">{order.service}</td>
                <td className="border px-3 py-2">₹{order.amount}</td>
                <td className="border px-3 py-2">₹{order.tax}</td>
                <td className="border px-3 py-2">₹{order.net}</td>
                <td className="border px-3 py-2">₹{order.paid}</td>
                <td className="border px-3 py-2">{order.rewardPoints}</td>
                <td className="border px-3 py-2">{order.paymentMode}</td>
                <td className="border px-3 py-2 text-blue-500 underline cursor-pointer">
                  <button className="px-4 py-2 bg-black text-white font-semibold rounded max-w-[150px] w-full">
                    View
                  </button>
                </td>
                <td className="border px-3 py-2 text-blue-500 underline cursor-pointer">
                  <button className="px-4 py-2 bg-black text-white font-semibold rounded max-w-[150px] w-full">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderHistory;
