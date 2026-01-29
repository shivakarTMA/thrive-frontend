import React, { useEffect, useState } from "react";

import { authAxios } from "../../config/config";
import { toast } from "react-toastify";
import Pagination from "../../components/common/Pagination";
import { useParams } from "react-router-dom";
import { formatAutoDate, formatTimeAppointment } from "../../Helper/helper";

const GroupClassParticipants = () => {
  const { id } = useParams();
  const [packageParticipats, setPackageParticipats] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [pendingId, setPendingId] = useState(null);
  const [pendingStatus, setPendingStatus] = useState(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchParticipatList = async (currentPage = page) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };

      const res = await authAxios().get(
        `/package/group/class/participant/${id}`,
        { params },
      );

      const responseData = res.data;
      const data = responseData?.data || [];

      setPackageParticipats(data);
      setPage(responseData?.currentPage || 1);
      setTotalPages(responseData?.totalPage || 1);
      setTotalCount(responseData?.totalCount || data.length);
    } catch (err) {
      console.error("❌ API Error:", err);
      toast.error("Failed to fetch participant");
    }
  };

  useEffect(() => {
    if (id) {
      fetchParticipatList();
    }
  }, [id]);

  const confirmStatusUpdate = async () => {
    try {
      // ❌ Require remarks ONLY for CANCELLED
      if (pendingStatus === "CANCELLED" && !remarks.trim()) {
        toast.error("Please enter cancellation reason");
        return;
      }

      const body = {
        booking_status: pendingStatus,
      };

      // ✅ Send remarks only if present
      if (remarks.trim()) {
        body.remarks = remarks.trim();
      }

      await authAxios().put(`/appointment/${pendingId}`, body);

      toast.success("Status updated successfully");
      setShowConfirmModal(false);
      setRemarks("");
      fetchParticipatList(page);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const getActionForStatus = (status) => {
    switch (status) {
      case "ACTIVE":
        return {
          label: "Cancel",
          nextStatus: "CANCELLED",
          disabled: false,
        };

      case "COMPLETED":
        return {
          label: "No Show",
          nextStatus: "NO_SHOW",
          disabled: false,
        };

      case "CANCELLED":
        return {
          label: "Cancelled",
          nextStatus: null,
          disabled: true,
        };

      case "NO_SHOW":
        return {
          label: "No Show",
          nextStatus: null,
          disabled: true,
        };

      default:
        return {
          label: "--",
          nextStatus: null,
          disabled: true,
        };
    }
  };

  return (
    <>
      <div className="page--content">
        <div className="flex items-end justify-between gap-2 mb-5">
          <div className="title--breadcrumbs">
            <p className="text-sm">{`Home > Group Classes > ZUMBA Class`}</p>
            <h1 className="text-3xl font-semibold">ZUMBA Class</h1>
          </div>
        </div>

        <div className="w-full p-3 border bg-white shodow--box rounded-[10px]">
          <div className="table--data--bottom w-full">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left ">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    {/* <th className="px-2 py-4 min-w-[50px]">S.No.</th> */}
                    <th className="px-2 py-4 min-w-[110px]">Booking Date</th>
                    <th className="px-2 py-4 min-w-[110px]">Booking Type</th>
                    <th className="px-2 py-4 min-w-[110px]">Category</th>
                    <th className="px-2 py-4 min-w-[110px]">Class Name</th>
                    <th className="px-2 py-4 min-w-[110px]">Scheduled At</th>
                    <th className="px-2 py-4 min-w-[130px]">Member Name</th>
                    <th className="px-2 py-4 min-w-[130px]">Trainer Name</th>
                    {/* <th className="px-2 py-4 min-w-[130px]">Booking Status</th> */}
                    <th className="px-2 py-4 min-w-[100px]">Cancel Booking</th>
                    <th className="px-2 py-4 min-w-[150px]">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {packageParticipats.length > 0 ? (
                    packageParticipats.map((row, idx) => (
                      <tr
                        key={row.serialNumber}
                        className="bg-white border-b hover:bg-gray-50 border-gray-200"
                      >
                        <td className="px-2 py-4">
                          {row?.booking_date
                            ? formatAutoDate(row?.booking_date)
                            : "--"}
                        </td>

                        <td className="px-2 py-4">
                          {row?.booking_channel ? row?.booking_channel : "--"}
                        </td>
                        <td className="px-2 py-4">
                          {row?.package_category ? row?.package_category : "--"}
                        </td>
                        <td className="px-2 py-4">
                          {row?.package_name ? row?.package_name : "--"}
                        </td>

                        <td className="px-2 py-4">
                          {formatAutoDate(row?.start_date)}{" "}
                          {formatTimeAppointment(row?.start_time)}
                        </td>
                        <td className="px-2 py-4">
                          {row?.member_name ? row?.member_name : "--"}
                        </td>
                        <td className="px-2 py-4">
                          {row?.assigned_staff_name
                            ? row?.assigned_staff_name
                            : "--"}
                        </td>
                        {/* <td className="px-2 py-4">{row?.booking_status}</td> */}

                        <td className="px-2 py-4">
                          {(() => {
                            const action = getActionForStatus(
                              row.booking_status,
                            );

                            return (
                              <div
                                className={`px-3 py-1 rounded !text-[13px] w-fit
                                  ${
                                    action.disabled
                                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                      : "bg-black text-white cursor-pointer hover:bg-gray-800"
                                  }
                                `}
                                onClick={() => {
                                  if (action.disabled) return;

                                  setPendingId(row.id);
                                  setPendingStatus(action.nextStatus);
                                  setShowConfirmModal(true);
                                }}
                              >
                                {action.label}
                              </div>
                            );
                          })()}
                        </td>
                        <td className="px-2 py-4">
                          {row?.remarks ? row?.remarks : "--"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="13"
                        className="px-2 py-8 text-center text-gray-500"
                      >
                        No data found for the selected filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              rowsPerPage={rowsPerPage}
              totalCount={totalCount}
              currentDataLength={packageParticipats.length}
              onPageChange={(newPage) => {
                fetchParticipatList(newPage);
              }}
            />
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-[10px] w-[400px] shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-center">
              Confirm Status Update
            </h3>

            <p className="text-center mb-4">
              Are you sure you want to mark this appointment as
              <span className="font-bold ml-1">
                {pendingStatus === "NO_SHOW" ? "No Show" : "Cancelled"}
              </span>
              ?
            </p>
            {pendingStatus === "CANCELLED" && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Remarks <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter cancellation reason"
                  rows="4"
                  className="w-full border border-gray-300 rounded-[5px] p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
                />
              </div>
            )}

            <div className="flex justify-between gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setRemarks("");
                }}
                className="w-1/2 border border-gray-400 rounded py-2 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={confirmStatusUpdate}
                className="w-1/2 bg-black text-white rounded py-2 hover:bg-gray-800"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GroupClassParticipants;
