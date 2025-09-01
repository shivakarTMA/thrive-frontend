import React, { useState, useMemo } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { customStyles } from "../../Helper/helper";
import { IoReceipt } from "react-icons/io5";
import Tooltip from "../common/Tooltip";
import { FaEye, FaFileInvoice, FaPrint, FaShareSquare } from "react-icons/fa";

const PaymentHistory = () => {
  const [category, setCategory] = useState({ value: "All", label: "All" });
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [sendModalOrder, setSendModalOrder] = useState(null);

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

  const paymentHistory = [
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
    tds: 472,
    pending: 0
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
    tds: 236,
    pending: 0
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
    tds: 18,
    pending: 0
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
    tds: 354,
    pending: 0
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
    tds: 59,
    pending: 0
  }
];

  const filteredOrders = useMemo(() => {
    return paymentHistory.filter((order) => {
      const [day, month, year] = order.date.split("/").map(Number);
      const orderDate = new Date(`20${year}`, month - 1, day);
      return (
        (category.value === "All" || order.category === category.value) &&
        (!dateFrom || orderDate >= dateFrom) &&
        (!dateTo || orderDate <= dateTo)
      );
    });
  }, [paymentHistory, category, dateFrom, dateTo]);

  const downloadFile = (type, order) => {
    const content = `${type} for ${order.name} - ${order.invoiceNumber}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${type}-${order.invoiceNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleViewInvoice = (order) => {
    setSelectedInvoice(order);
  };

  const handlePrintInvoice = (order) => {
    const content = `
      <html>
        <head>
          <title>Invoice ${order.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
          </style>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </head>
        <body>
          <h2>Invoice - ${order.invoiceNumber}</h2>
          <p><strong>Name:</strong> ${order.name}</p>
          <p><strong>Amount:</strong> ₹${order.amount}</p>
          <p><strong>Tax:</strong> ₹${order.tax}</p>
          <p><strong>Net:</strong> ₹${order.net}</p>
          <p><strong>Paid:</strong> ₹${order.paid}</p>
          <p><strong>Payment Mode:</strong> ${order.paymentMode}</p>
        </body>
      </html>
    `;
    const win = window.open("", "_blank");
    win.document.write(content);
    win.document.close();
  };

  const handleSendInvoice = (order) => {
    setSendModalOrder(order);
  };

  const confirmSend = (mode) => {
    alert(`Invoice sent to ${sendModalOrder.name} via ${mode}`);
    setSendModalOrder(null);
  };

  return (
    <div className="p-4 bg-white rounded shadow relative">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <Select
          options={categoryOptions}
          value={category}
          onChange={setCategory}
          styles={customStyles}
          placeholder="Category"
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
            className="custom--input w-full"
            placeholderText="From date"
            dropdownMode="select"
            dateFormat="dd MMM yyyy"
            showMonthDropdown
            showYearDropdown
          />
        </div>
        <div className="custom--date dob-format">
          <DatePicker
            isClearable
            selected={dateTo}
            onChange={(date) => setDateTo(date)}
            placeholderText="To date"
            showMonthDropdown
            showYearDropdown
            dateFormat="dd MMM yyyy"
            dropdownMode="select"
            className="custom--input w-full"
          />
        </div>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="border px-3 py-2">Purchased Date</th>
              <th className="border px-3 py-2">Invoice No.</th>
              <th className="border px-3 py-2">Amount</th>
              <th className="border px-3 py-2">Tax</th>
              <th className="border px-3 py-2">Net</th>
              <th className="border px-3 py-2">Paid</th>
              <th className="border px-3 py-2">TDS Amount</th>
              <th className="border px-3 py-2">Pending</th>
              <th className="border px-3 py-2">Mode</th>
              {/* <th className="border px-3 py-2">Paid Invoice & Receipt</th> */}
              <th className="border px-3 py-2">Action Items</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.orderId}>
                  <td className="border px-3 py-2">{order.date}</td>
                  <td className="border px-3 py-2">{order.invoiceNumber}</td>
                  <td className="border px-3 py-2">₹{order.amount}</td>
                  <td className="border px-3 py-2">₹{order.tax}</td>
                  <td className="border px-3 py-2">₹{order.net}</td>
                  <td className="border px-3 py-2">₹{order.paid}</td>
                  <td className="border px-3 py-2">₹{order.tds}</td>
                  <td className="border px-3 py-2">₹{order.pending}</td>
                  <td className="border px-3 py-2">{order.paymentMode}</td>
                  {/* <td className="border px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Tooltip content="Download Receipt">
                        <button
                          onClick={() => downloadFile("Receipt", order)}
                          className="text-xl"
                        >
                          <IoReceipt />
                        </button>
                      </Tooltip>
                      <Tooltip content="Download Invoice">
                        <button
                          onClick={() => downloadFile("Invoice", order)}
                          className="text-xl"
                        >
                          <FaFileInvoice />
                        </button>
                      </Tooltip>
                    </div>
                  </td> */}
                  <td className="border px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Tooltip content="View Invoice">
                        <button
                          onClick={() => handleViewInvoice(order)}
                          className="text-xl"
                        >
                          <FaEye />
                        </button>
                      </Tooltip>
                      <Tooltip content="Print Invoice">
                        <button
                          onClick={() => handlePrintInvoice(order)}
                          className="text-xl"
                        >
                          <FaPrint />
                        </button>
                      </Tooltip>
                      <Tooltip content="Send Invoice">
                        <button
                          onClick={() => handleSendInvoice(order)}
                          className="text-xl"
                        >
                          <FaShareSquare />
                        </button>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-4 text-gray-600">
                  No data found for selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[400px]">
            <h2 className="text-xl font-semibold mb-4">
              Invoice - {selectedInvoice.invoiceNumber}
            </h2>
            <p>
              <strong>Name:</strong> {selectedInvoice.name}
            </p>
            <p>
              <strong>Amount:</strong> ₹{selectedInvoice.amount}
            </p>
            <p>
              <strong>Tax:</strong> ₹{selectedInvoice.tax}
            </p>
            <p>
              <strong>Net:</strong> ₹{selectedInvoice.net}
            </p>
            <p>
              <strong>Paid:</strong> ₹{selectedInvoice.paid}
            </p>
            <p>
              <strong>Payment Mode:</strong> {selectedInvoice.paymentMode}
            </p>
            <div className="mt-4 text-right">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-red-600 hover:underline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {sendModalOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[300px]">
            <h2 className="text-lg font-semibold mb-4">
              Send Invoice to {sendModalOrder.name}
            </h2>
            <p className="mb-3">Select communication mode:</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => confirmSend("Email")}
                className="bg-blue-500 text-white px-3 py-2 rounded"
              >
                Email
              </button>
              <button
                onClick={() => confirmSend("SMS")}
                className="bg-green-500 text-white px-3 py-2 rounded"
              >
                SMS
              </button>
              <button
                onClick={() => confirmSend("WhatsApp")}
                className="bg-purple-500 text-white px-3 py-2 rounded"
              >
                WhatsApp
              </button>
            </div>
            <div className="mt-4 text-right">
              <button
                onClick={() => setSendModalOrder(null)}
                className="text-gray-600 hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
