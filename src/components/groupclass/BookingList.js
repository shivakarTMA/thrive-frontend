import React, { useRef } from "react";
import { IoClose, IoCloseCircle } from "react-icons/io5";

const BookingList = ({ bookings, classId, classTitle, onClose }) => {
  const filteredBookings = bookings.filter((b) => b.classId === classId);

  const leadBoxRef = useRef(null);

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    <div
      className="bg--blur create--lead--container overflow-auto hide--overflow fixed top-0 left-0 z-[999] w-full bg-black bg-opacity-60 h-full"
      onClick={handleOverlayClick}
    >
      <div
        className="w-[95%] max-w-5xl mx-auto mt-[100px] mb-[100px] container--leadbox rounded-[10px] flex flex-col"
        ref={leadBoxRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-t-[10px] flex gap-3 items-center justify-between py-4 lg:px-6 px-2 border-b">
          <h2 className="text-xl font-semibold">Bookings for: {classTitle}</h2>
          <div className="close--lead cursor-pointer" onClick={onClose}>
            <IoCloseCircle className="text-3xl" />
          </div>
        </div>

        <div className="flex-1s flexs">
          <div className="flex bg-white rounded-b-[10px] overflow-hidden">
            <div className="flex-1">
              
              {filteredBookings.length === 0 ? (
                <div className="text-sm text-gray-600 lg:px-6 px-2 py-4">
                  No bookings found for <strong>{classTitle}</strong>.
                </div>
              ) : (
                <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="lg:px-6 px-2 py-4">Member ID</th>
                      <th className="lg:px-6 px-2 py-4">Status</th>
                      <th className="lg:px-6 px-2 py-4">Channel</th>
                      <th className="lg:px-6 px-2 py-4">Booked On</th>
                      <th className="lg:px-6 px-2 py-4">Cancelled On</th>
                      <th className="lg:px-6 px-2 py-4">Booking Date</th>
                      <th className="lg:px-6 px-2 py-4">Start Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking, idx) => (
                      <tr key={idx}  className="group bg-white border-b hover:bg-gray-50 transition duration-700">
                        <td className="lg:px-6 px-2 py-4">{booking.memberId}</td>
                        <td className="lg:px-6 px-2 py-4">{booking.bookingStatus}</td>
                        <td className="lg:px-6 px-2 py-4">{booking.bookingChannel}</td>
                        <td className="lg:px-6 px-2 py-4">{booking.bookedOn}</td>
                        <td className="lg:px-6 px-2 py-4">
                          {booking.cancelledOn || "-"}
                        </td>
                        <td className="lg:px-6 px-2 py-4">{booking.booking_date}</td>
                        <td className="lg:px-6 px-2 py-4">
                          {booking.booking_start_time}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingList;
