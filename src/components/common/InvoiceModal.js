import React, { useRef } from "react";
import { formatIndianNumber } from "../../Helper/helper";

const InvoiceModal = ({ isOpen, onClose, data }) => {
  const leadBoxRef = useRef(null);
  if (!isOpen || !data) return null;

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      onClose();
    }
  };

  console.log(data,'data')

  return (
    <div
      className="bg--blur create--lead--container overflow-auto hide--overflow fixed top-0 left-0 z-[999] w-full bg-black bg-opacity-60 h-full"
      onClick={handleOverlayClick}
    >
      <div
        className="min-h-[70vh]  w-[95%] max-w-5xl mx-auto mt-[100px] mb-[100px] container--leadbox rounded-[10px] flex flex-col"
        ref={leadBoxRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-[10px] p-5">
          {/* Header */}
          <div className="flex justify-between items-center mb-5">
            <div className="text-3xl uppercase text-gray-900">Invoice</div>
            <img
              src="https://crmuat.dlfthrive.com/logo-invoice.png"
              alt="Logo"
              className="h-8"
            />
          </div>

          {/* Invoice Info */}
          <div className="flex items-center justify-end mb-5">
            <div className="flex space-x-5">
              <p>
                Invoice No: <b className="text-gray-900">{data.invoice_no}</b>
              </p>
              <p>
                Date: <b className="text-gray-900">{data.invoice_date}</b>
              </p>
            </div>
          </div>

          {/* Customer & Company Info */}
          <div className="flex justify-between mb-5">
            <div className="space-y-1 text-sm">
              <p>
                <strong>Customer Name:</strong> {data.member_full_name}
              </p>
              <p>
                <strong>Customer GSTIN:</strong> N/A
              </p>
              <p>
                <strong>Address:</strong> {data.member_address || "--"}
              </p>
              <p>
                <strong>Pincode:</strong> {data.member_pincode || "--"}
              </p>
              <p>
                <strong>Email:</strong> {data.member_email}
              </p>
              <p>
                <strong>Mobile:</strong> {data.member_mobile}
              </p>
            </div>
            <div className="text-right text-sm space-y-1">
              <p>
                <strong>Company Name:</strong> {data.club_name}
              </p>
              <p className="mb-4">
                <strong>Company Address:</strong> {data.club_address}
                <br />
                {data.club_city}, {data.club_state} - {data.club_zipcode}
                <br />
                {data.club_country}
              </p>
              <p>
                <strong>Site Name:</strong> {data.club_name}
              </p>
              <p className="mb-4">
                <strong>Site Address:</strong> {data.club_address}
                <br />
                {data.club_city}, {data.club_state} - {data.club_zipcode}
                <br />
                {data.club_country}
              </p>
              <p>
                <strong>Email:</strong> {data.club_email}
              </p>
              <p>
                <strong>Phone:</strong> {data.club_phone}
              </p>
              <p>
                <strong>GSTIN:</strong> {data.club_gstno}
              </p>
              <p>
                <strong>Sales Rep:</strong> {data?.sales_rep_name ? data?.sales_rep_name : "--"}
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="mb-5 border rounded-md overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse">
              <thead>
                <tr>
                  <th className="border px-4 py-2 text-left font-semibold text-gray-900">
                    #
                  </th>
                  <th className="border px-4 py-2 text-left font-semibold text-gray-900">
                    Description
                  </th>
                  <th className="border px-4 py-2 text-left font-semibold text-gray-900">
                    HSN/SAC Code
                  </th>
                  <th className="border px-4 py-2 text-left font-semibold text-gray-900">
                    Validity
                  </th>
                  <th className="border px-4 py-2 text-left font-semibold text-gray-900">
                    Start Date
                  </th>
                  <th className="border px-4 py-2 text-left font-semibold text-gray-900">
                    End Date
                  </th>
                  {data?.order_type === "PRODUCT" && (
                    <th className="border px-4 py-2 text-right font-semibold text-gray-900">
                        Qty.
                    </th>
                  )}
                  <th className="border px-4 py-2 text-right font-semibold text-gray-900">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.items.map((item, index) => (
                  <tr key={index}>
                    <td className="border px-4 py-2">{index + 1}</td>
                    <td className="border px-4 py-2">{item?.name}</td>
                    <td className="border px-4 py-2">{item?.hsn_sac ? item?.hsn_sac : "--"}</td>
                    <td className="border px-4 py-2">{item?.validity ? item?.validity : "--"}</td>
                    <td className="border px-4 py-2">{item?.start_date ? item?.start_date : "--"}</td>
                    <td className="border px-4 py-2">{item?.end_date ? item?.end_date : "--"}</td>
                    {data?.order_type === "PRODUCT" && (
                    <td className="border px-4 py-2 text-right">
                      {item?.quantity}
                    </td>
                    )}
                    <td className="border px-4 py-2 text-right">
                      ₹{formatIndianNumber(item?.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer / Totals */}
          <div className="flex justify-between mb-5 text-sm">
            <div className="w-full">
              <p>
                <b className="text-gray-900">Payment mode:</b> Online
              </p>
            </div>
            <div className="text-right space-y-1 w-full">
              <div className="flex gap-2 justify-between">
                <span className="font-bold">Subtotal:</span>
                <span className="font-bold">₹{formatIndianNumber(data.subtotal)}</span>
              </div>
              {data.discount && (
                <div className="flex gap-2 justify-between">
                    <span className="font-bold">Discount:</span>
                    <span className="font-bold">- ₹{formatIndianNumber(data.discount)}</span>
                </div>
              )}
              <div className="flex gap-2 justify-between">
                <span className="font-bold">CGST @2.5%:</span>
                <span className="font-bold">₹{data?.cgst_amount ? formatIndianNumber(data?.cgst_amount) : "--"}</span>
              </div>
              <div className="flex gap-2 justify-between">
                <span className="font-bold">SGST @2.5%:</span>
                <span className="font-bold">₹{data?.sgst_amount ? formatIndianNumber(data?.sgst_amount) : "--"}</span>
              </div>
              <div className="flex gap-2 justify-between">
                <span className="font-bold">IGST @5%:</span>
                <span className="font-bold">₹{data?.igst_amount ? formatIndianNumber(data?.igst_amount) : "--"}</span>
              </div>
              <div className="flex gap-2 justify-between">
                <span className="font-bold">Grand Total:</span>
                <span className="font-bold">₹{formatIndianNumber(data?.grand_total)}</span>
              </div>
              {/* {data?.redeemed_coin && (
                <div className="flex gap-2 justify-between">
                    <span className="font-bold">Thrive Coins:</span>
                    <span className="font-bold">- ₹{formatIndianNumber(data?.redeemed_coin)}</span>
                </div>
              )} */}

              <div className="flex gap-2 justify-between border-y py-2">
                <span className="font-bold text-lg">Total Amount:</span>
                <span className="font-bold text-lg">₹{formatIndianNumber(data?.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="border rounded-md mb-5 p-5">
            <p className="mb-1 text-sm text-center">
                If you have any questions about this bill, please contact Mail : <a href="mailto:thrive@dlf.in">thrive@dlf.in</a>, Phone : 84482 85864
              </p>
            <p className="mb-1 text-lg font-[600] text-center">
                Thank You For Your Business!
              </p>
            <p className="text-sm text-center">
                This is a computer generated invoice. No signature is required.
              </p>
          </div>
        </div>

        {/* Close Button */}

        <div className={`flex gap-4 py-5 justify-end`}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-transparent border border-white text-white font-semibold rounded max-w-[150px] w-full"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
