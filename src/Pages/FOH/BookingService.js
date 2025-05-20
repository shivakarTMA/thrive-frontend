import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  mockData,
  servicesData,
  slotAvailability,
} from "../../DummyData/DummyData";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import BookingSuccessModal from "../../components/BookingSuccessModal";
import { CiCalendar } from "react-icons/ci";
import { IoCloseCircle, IoTimeOutline } from "react-icons/io5";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { GrPrevious, GrNext } from "react-icons/gr";

const BookingService = () => {
  const { id } = useParams();
  const serviceItem = servicesData.find((item) => item.id === parseInt(id));
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [serviceBooked, setServiceBooked] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  const searchRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month()); // 0-11
  const [selectedYear, setSelectedYear] = useState(dayjs().year());

  const daysInMonth = dayjs()
    .year(selectedYear)
    .month(selectedMonth)
    .daysInMonth();

  const firstDayOfMonth = dayjs()
    .year(selectedYear)
    .month(selectedMonth)
    .date(1);

  const startWeekdayIndex =
    firstDayOfMonth.day() === 0 ? 6 : firstDayOfMonth.day() - 1;
  const today = dayjs();

  const monthDays = Array.from({ length: daysInMonth }, (_, i) => {
    const date = dayjs()
      .year(selectedYear)
      .month(selectedMonth)
      .date(i + 1);
    return date;
  });

  const sliderSetting = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
  };

  const [selectedSlots, setSelectedSlots] = useState([]);

  const times = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
  ];

  const now = dayjs();

  const isPastTime = (time) => {
    if (selectedDate !== now.format("YYYY-MM-DD")) return false;
    const [hour, minute] = time.split(":");
    const slotTime = dayjs(selectedDate).hour(hour).minute(minute);
    return slotTime.isBefore(now);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setFilteredMembers([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleSlot = (date, time) => {
    const key = `${date}_${time}`;
    if (selectedSlots.some((s) => s.key === key)) {
      setSelectedSlots(selectedSlots.filter((s) => s.key !== key));
    } else {
      setSelectedSlots([...selectedSlots, { date, time, key }]);
    }
  };

  const isSelected = (date, time) =>
    selectedSlots.some((s) => s.key === `${date}_${time}`);

  const totalPrice = selectedSlots.length * serviceItem.price;

  const handleSearchChange = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term.trim() === "") {
      setFilteredMembers([]);
      return;
    }

    const filtered = mockData.filter(
      (m) =>
        m.name.toLowerCase().includes(term) ||
        m.contact.toLowerCase().includes(term)
    );
    setFilteredMembers(filtered);
  };

  const selectMember = (member) => {
    setSelectedMember(member);
    setSearchTerm(member.name);
    setFilteredMembers([]);
  };

  const weekdaysInMonth = monthDays.filter((day) => {
    const dayOfWeek = day.day(); // 0=Sun, 1=Mon, ..., 6=Sat
    return dayOfWeek !== 0 && dayOfWeek !== 6; // only Mon-Fri
  });

  const startOfWeek = dayjs(selectedDate).startOf("week").add(1, "day"); // Monday of selectedDate's week
  // const weekDays = Array.from({ length: 7 }).map((_, i) =>
  //   startOfWeek.add(i, "day")
  // );

  const weekStart = dayjs()
    .startOf("week")
    .add(1, "day")
    .add(weekOffset, "week"); // start from Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => weekStart.add(i, "day"));

  const handlePayment = () => {
    if (!selectedMember || !selectedMember.name || !selectedMember.contact) {
      toast.error("Please select a member before making payment.");
      return;
    }

    console.log("Booking Details:", {
      service: serviceItem,
      selectedSlots,
      totalPrice,
      member: {
        name: selectedMember.name,
        contact: selectedMember.contact,
      },
    });

    toast.success("Booking details logged in console.");

    setServiceBooked(true);
    setSelectedSlots([]);
    setSelectedMember(null);
    setSearchTerm("");
    setFilteredMembers([]);
  };

  console.log("Selected Slots:", selectedMember);

  useEffect(() => {
    const d = dayjs(selectedDate);
    setSelectedMonth(d.month());
    setSelectedYear(d.year());
  }, [selectedDate]);

  return (
    <>
      <div className="page--content">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2 border rounded p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Book Your Slots</h2>

            <div className="mb-4 relative" ref={searchRef}>
              <label className="block font-medium mb-1">Member Name:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Enter name or mobile"
                className="custom--input w-full max-w-md"
              />
              {filteredMembers.length > 0 && (
                <ul className="absolute w-full border rounded mt-1 max-h-40 overflow-y-auto bg-white shadow-md z-10">
                  {filteredMembers.map((m) => (
                    <li
                      key={m.id}
                      className="p-2 hover:bg-blue-100 cursor-pointer"
                      onClick={() => selectMember(m)}
                    >
                      {m.name} - {m.contact}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {serviceItem?.type === "pt" && (
              <>
                {selectedMember && (
                  <div className="my-2 text-sm text-gray-700">
                    <span className="font-semibold">PT Sessions:</span>{" "}
                    {selectedMember.ptSessions}
                  </div>
                )}
              </>
            )}

            {serviceItem?.type === "pt" && selectedMember?.ptSessions === 0 ? (
              <div className="text-red-500">
                No PT sessions available for this member.
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xl font-bold mb-4">
                    {dayjs(selectedDate).format("dddd, MMMM D, YYYY")}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setWeekOffset(weekOffset - 1)}
                      className="px-3 py-1 rounded"
                    >
                      <GrPrevious />
                    </button>
                    <div className="text-lg font-bold">
                      {weekStart.format("MMMM YYYY")}
                    </div>
                    <button
                      onClick={() => setWeekOffset(weekOffset + 1)}
                      className="px-3 py-1 rounded"
                    >
                      <GrNext />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center font-semibold text-gray-700 mb-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (d) => (
                      <div key={d}>{d}</div>
                    )
                  )}
                </div>

                <div className="grid grid-cols-7 gap-2 mb-4 border p-3 rounded">
                  {weekDays.map((day) => {
                    const dateStr = day.format("YYYY-MM-DD");
                    const isPast = day.isBefore(dayjs(), "day");
                    const isToday = dateStr === dayjs().format("YYYY-MM-DD");
                    const isSelected = selectedDate === dateStr;

                    return (
                      <button
                        key={dateStr}
                        onClick={() => setSelectedDate(dateStr)}
                        disabled={isPast && !isToday}
                        className={`flex flex-col items-center px-3 py-2 rounded min-w-[50px]
          ${
            isSelected
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }
          ${isPast && !isToday ? "opacity-40 cursor-not-allowed" : ""}`}
                      >
                        <span className="text-sm font-medium">
                          {day.format("ddd")}
                        </span>
                        <span className="text-base">{day.format("D")}</span>
                      </button>
                    );
                  })}
                </div>

                {selectedDate && (
                  <div className="mb-4 border p-3 rounded">
                    <h3 className="text-lg font-semibold mb-2">
                      Available Time Slots
                    </h3>

                    {times.filter((time) => {
                      const slot = slotAvailability[selectedDate]?.[time] || {
                        status: "available",
                      };
                      const isPast = isPastTime(time);
                      return slot.status === "available" && !isPast;
                    }).length === 0 ? (
                      <div className="text-gray-500 italic">
                        No available slots
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-[5px]">
                        {times
                          .filter((time) => {
                            const slot = slotAvailability[selectedDate]?.[
                              time
                            ] || { status: "available" };
                            const isPast = isPastTime(time);
                            return slot.status === "available" && !isPast;
                          })
                          .map((time) => {
                            const selected = isSelected(selectedDate, time);
                            let btnClass = "bg-blue-200 hover:bg-blue-300";
                            if (selected) btnClass = "bg-green-400 text-white";

                            return (
                              <button
                                key={time}
                                className={`w-[calc(20%-5px)] px-4 py-2 rounded ${btnClass}`}
                                onClick={() => toggleSlot(selectedDate, time)}
                              >
                                {time}
                              </button>
                            );
                          })}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="border rounded shadow-sm">
            {serviceItem?.images && (
              <Slider {...sliderSetting} className="custom--slider">
                {serviceItem.images.map((img, idx) => (
                  <div key={idx}>
                    <img
                      src={img}
                      alt={`${serviceItem.title} ${idx + 1}`}
                      className="w-full h-60 object-cover rounded"
                    />
                  </div>
                ))}
              </Slider>
            )}

            <div className="p-4">
              <h1 className="text-2xl font-semibold mb-2">
                {serviceItem?.title}
              </h1>
              <p className="mb-3 text-gray-700">{serviceItem?.description}</p>
              <p className="text-gray-900 font-medium mb-2">
                Price: ₹{serviceItem?.price}
              </p>

              <div className="mt-4 text-lg font-bold">
                Total Price: ₹{totalPrice}
              </div>

              <button
                className={`mt-4 bg-black text-white px-5 py-2 rounded w-full ${
                  selectedSlots.length === 0 && "opacity-50 cursor-not-allowed"
                }`}
                onClick={handlePayment}
                disabled={selectedSlots.length === 0}
              >
                Make Payment
              </button>
            </div>
          </div>
        </div>
      </div>

      <BookingSuccessModal
        isOpen={serviceBooked}
        onClose={() => setServiceBooked(false)}
      />
    </>
  );
};

export default BookingService;
