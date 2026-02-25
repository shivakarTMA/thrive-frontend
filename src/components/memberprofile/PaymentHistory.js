import React, { useState, useEffect } from "react";
import {
  formatAutoDate,
  formatIndianNumber,
  formatText,
} from "../../Helper/helper";
import Tooltip from "../common/Tooltip";
import { FaShareSquare } from "react-icons/fa";
import { authAxios } from "../../config/config";
import { toast } from "react-toastify";
import { MdFileDownload } from "react-icons/md";
import IsLoadingHOC from "../common/IsLoadingHOC";

function toCapitalizedCase(inputString) {
  return inputString
    .replace(/_/g, " ") // Replace underscores with spaces
    .split(" ") // Split string by spaces
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
    .join(" "); // Join words back into a single string with spaces
}

const PaymentHistory = ({ details, setLoading }) => {
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [sendModalOrder, setSendModalOrder] = useState(null);

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

  const handleSendInvoice = (order) => {
    setSendModalOrder(order);
  };

  const confirmSend = async (mode) => {
    if (!sendModalOrder) return;

    if (mode !== "Email") {
      toast.info(`${mode} integration not implemented yet`);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        invoice_no: sendModalOrder.invoice_no,
        order_type: sendModalOrder.order_type, // PACKAGE | SUBSCRIPTION | PRODUCT
      };

      console.log(payload,'payload')

      await authAxios().post(`/member/send/invoice/email/${details?.id}`, payload);

      toast.success(
        `Invoice sent successfully on Email`,
      );
      setSendModalOrder(null);
    } catch (error) {
      console.error("Send invoice failed:", error);
      toast.error("Failed to send invoice");
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async (row) => {
    setLoading(true);
    try {
      const payload = {
        order_id: row.order_id, // ⚠️ confirm correct key (id / order_id)
        order_type: row.order_type, // SUBSCRIPTION | PACKAGE | PRODUCT
      };

      const res = await authAxios().post(
        "/invoice/download",
        payload,
        { responseType: "blob" }, // 👈 IMPORTANT
      );

      // Create blob URL
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      // Auto-download
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice_${payload.order_id}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
      setLoading(false);
    } catch (err) {
      console.error("Invoice download failed", err);
      toast.error("Failed to download invoice");
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow relative">
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
                  <td className="border px-3 py-2">
                    {formatAutoDate(order?.transaction_date)}
                  </td>
                  <td className="border px-3 py-2">{order?.invoice_no}</td>
                  <td className="border px-3 py-2">{order?.reference_no}</td>
                  <td className="border px-3 py-2">
                    ₹
                    {order?.transaction_amount
                      ? formatIndianNumber(order?.transaction_amount)
                      : 0}
                  </td>

                  <td className="border px-3 py-2">
                    {order?.payment_mode
                      ? formatText(order.payment_mode)
                      : "N/A"}
                  </td>
                  <td className="border px-3 py-2">
                    {formatText(order?.payment_status)}
                  </td>

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
                          onClick={() => downloadInvoice(order)}
                          className="text-xl"
                        >
                          <MdFileDownload />
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

      {sendModalOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-2">
          <div className="bg-white p-6 rounded shadow-lg w-[300px]">
            <h2 className="text-lg font-semibold mb-4">
              Send Invoice to {sendModalOrder.name}
            </h2>
            {/* <p className="mb-3">Select communication mode:</p> */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => confirmSend("Email")}
                className="bg-blue-500 text-white px-3 py-2 rounded"
              >
                Email
              </button>
              {/* <button
                onClick={() => confirmSend("WhatsApp")}
                className="bg-purple-500 text-white px-3 py-2 rounded"
              >
                WhatsApp
              </button> */}
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

export default IsLoadingHOC(PaymentHistory);
