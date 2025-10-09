import React, { useEffect, useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { customStyles } from "../../Helper/helper";
import { apiAxios } from "../../config/config";
import { toast } from "react-toastify";

const OrderHistory = ({details}) => {
  const [category, setCategory] = useState({ value: "All", label: "All" });
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [ordersList, setOrdersList] = useState([]);

  const orders = [
    {
      orderId: "ORD001",
      date: "15/5/25",
      name: "Alice",
      service: "Membership - 3 months",
      category: "Membership",
      centerName: "Downtown Center",
      amount: 4000,
      tax: 720,
      net: 4720,
      paid: 4720,
      rewardPoints: 40,
      paymentMode: "Credit Card",
      duration: "3 months",
      invoiceNumber: "INV001",
      orderStatus: "Paid",
    },
    {
      orderId: "ORD002",
      date: "10/4/25",
      name: "Bob",
      service: "Spa - Full Body Massage",
      category: "Spa",
      centerName: "Wellness Hub",
      amount: 2000,
      tax: 360,
      net: 2360,
      paid: 2360,
      rewardPoints: 20,
      paymentMode: "UPI",
      duration: "1 session",
      invoiceNumber: "INV002",
      orderStatus: "Paid",
    },
    {
      orderId: "ORD003",
      date: "5/4/25",
      name: "Charlie",
      service: "Cafe Items - Coffee",
      category: "Cafe Items",
      centerName: "Café Corner",
      amount: 150,
      tax: 27,
      net: 177,
      paid: 177,
      rewardPoints: 2,
      paymentMode: "Cash",
      duration: "N/A",
      invoiceNumber: "INV003",
      orderStatus: "Paid",
    },
    {
      orderId: "ORD004",
      date: "1/5/25",
      name: "Diana",
      service: "Physiotherapy - Back Pain",
      category: "Physiotherapy",
      centerName: "HealthFirst",
      amount: 3000,
      tax: 540,
      net: 3540,
      paid: 3540,
      rewardPoints: 30,
      paymentMode: "Credit Card",
      duration: "2 sessions",
      invoiceNumber: "INV004",
      orderStatus: "Paid",
    },
    {
      orderId: "ORD005",
      date: "12/5/25",
      name: "Eve",
      service: "Merchandise - Yoga Mat",
      category: "Merchandise",
      centerName: "FitStore",
      amount: 500,
      tax: 90,
      net: 590,
      paid: 590,
      rewardPoints: 5,
      paymentMode: "Debit Card",
      duration: "N/A",
      invoiceNumber: "INV005",
      orderStatus: "Paid",
    },
    {
      orderId: "ORD006",
      date: "2/3/25",
      name: "Frank",
      service: "NC - Nutrition Plan",
      category: "NC",
      centerName: "NutriCare",
      amount: 1800,
      tax: 324,
      net: 2124,
      paid: 2124,
      rewardPoints: 18,
      paymentMode: "UPI",
      duration: "4 weeks",
      invoiceNumber: "INV006",
      orderStatus: "Paid",
    },
    {
      orderId: "ORD007",
      date: "20/2/25",
      name: "Grace",
      service: "GX - Group Workout",
      category: "GX",
      centerName: "ActiveGym",
      amount: 1000,
      tax: 180,
      net: 1180,
      paid: 1180,
      rewardPoints: 10,
      paymentMode: "Credit Card",
      duration: "10 sessions",
      invoiceNumber: "INV007",
      orderStatus: "Paid",
    },
    {
      orderId: "ORD008",
      date: "5/5/25",
      name: "Hank",
      service: "Sports - Personal Coaching",
      category: "Sports",
      centerName: "ProAthlete",
      amount: 2500,
      tax: 450,
      net: 2950,
      paid: 2950,
      rewardPoints: 25,
      paymentMode: "Cash",
      duration: "6 sessions",
      invoiceNumber: "INV008",
      orderStatus: "Paid",
    },
    {
      orderId: "ORD009",
      date: "15/3/25",
      name: "Ivy",
      service: "Membership - 1 year",
      category: "Membership",
      centerName: "Downtown Center",
      amount: 10000,
      tax: 1800,
      net: 11800,
      paid: 11800,
      rewardPoints: 100,
      paymentMode: "Credit Card",
      duration: "1 year",
      invoiceNumber: "INV009",
      orderStatus: "Paid",
    },
    {
      orderId: "ORD010",
      date: "28/4/25",
      name: "Jack",
      service: "Cafe Items - Protein Shake",
      category: "Cafe Items",
      centerName: "Café Corner",
      amount: 300,
      tax: 54,
      net: 354,
      paid: 354,
      rewardPoints: 3,
      paymentMode: "UPI",
      duration: "N/A",
      invoiceNumber: "INV010",
      orderStatus: "Paid",
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
      (category.value === "All" || order.category === category.value) &&
      (!dateFrom || orderDate >= dateFrom) &&
      (!dateTo || orderDate <= dateTo)
    );
  });

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
                  <td className="border px-3 py-2">{order?.order_date}</td>
                  <td className="border px-3 py-2">{order?.order_type}</td>
                  <td className="border px-3 py-2">{order?.order_type}</td>
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
