import React, { useState, useEffect } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { customStyles, formatAutoDate, formatText } from "../../Helper/helper";
import Tooltip from "../common/Tooltip";
import { FaEye, FaPrint, FaShareSquare } from "react-icons/fa";
import { authAxios } from "../../config/config";
import { toast } from "react-toastify";

function toCapitalizedCase(inputString) {
  return inputString
    .replace(/_/g, ' ')  // Replace underscores with spaces
    .split(' ')          // Split string by spaces
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())  // Capitalize each word
    .join(' ');          // Join words back into a single string with spaces
}

const PaymentHistory = ({ details }) => {
  const [paymentHistory, setPaymentHistory] = useState([]);
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

  const fetchMemberPayment = async () => {
    try {
      // Make the API call with query parameters
      const res = await authAxios().get(`/member/payment/${details?.id}`);
      const data = res.data?.data || [];
      setPaymentHistory(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch coins");
    }
  };

  useEffect(() => {
    fetchMemberPayment();
  }, []);


  const handleViewInvoice = (order) => {
    setSelectedInvoice(order);
  };

  const handlePrintInvoice = (order) => {
    const content = `
      <html>
        <head>
          <title>Invoice ${order?.invoiceNumber}</title>
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
          <h2>Invoice - ${order?.invoiceNumber}</h2>
          <p><strong>Amount:</strong> ₹${order?.total_amount}</p>
          <p><strong>Tax:</strong> ₹${order?.tax}</p>
          <p><strong>Net:</strong> ₹${order?.net}</p>
          <p><strong>Paid:</strong> ₹${order?.total_amount}</p>
          <p><strong>Payment Mode:</strong> ${order?.payment_mode ? toCapitalizedCase(order.payment_mode) : 'N/A'}</p>
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
      {/* <div className="flex flex-wrap items-center gap-4 mb-4">
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
      </div> */}

      <div className="overflow-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="border px-3 py-2">Transaction Date</th>
              <th className="border px-3 py-2">Invoice No.</th>
              <th className="border px-3 py-2">Order No.</th>
              <th className="border px-3 py-2">Amount</th>

              <th className="border px-3 py-2">Mode</th>
              <th className="border px-3 py-2">Status</th>
              <th className="border px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {paymentHistory.length > 0 ? (
              paymentHistory.map((order) => (
                <tr key={order.orderId}>
                  <td className="border px-3 py-2">{formatAutoDate(order?.transaction_date)}</td>
                  <td className="border px-3 py-2">{order?.invoiceNumber}</td>
                  <td className="border px-3 py-2">{order?.reference_no}</td>
                  <td className="border px-3 py-2">₹{order?.transaction_amount ? order?.transaction_amount : 0}</td>

                  <td className="border px-3 py-2">{order?.payment_mode ? formatText(order.payment_mode) : 'N/A'}</td>
                  <td className="border px-3 py-2">{formatText(order?.payment_status)}</td>
                 
                  <td className="border px-3 py-2">
                    <div className="flex items-center gap-2">
                      {/* <Tooltip content="View Invoice">
                        <button
                          onClick={() => handleViewInvoice(order)}
                          className="text-xl"
                        >
                          <FaEye />
                        </button>
                      </Tooltip> */}
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
              Invoice - {selectedInvoice?.invoiceNumber}
            </h2>
            <p>
              <strong>Amount:</strong> ₹{selectedInvoice?.total_amount}
            </p>
            <p>
              <strong>Tax:</strong> ₹{selectedInvoice?.tax}
            </p>
            <p>
              <strong>Net:</strong> ₹{selectedInvoice?.net}
            </p>
            <p>
              <strong>Paid:</strong> ₹{selectedInvoice?.total_amount}
            </p>
            <p>
              <strong>Payment Mode:</strong> {selectedInvoice?.payment_mode ? toCapitalizedCase(selectedInvoice?.payment_mode) : 'N/A'}
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
