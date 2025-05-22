import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  mockData,
  servicesData,
  slotAvailability,
} from "../DummyData/DummyData";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import BookingSuccessModal from "../components/BookingSuccessModal";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { GrPrevious, GrNext } from "react-icons/gr";
import { FaCircle } from "react-icons/fa";

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

  const weekStart = dayjs()
    .startOf("week")
    .add(1, "day")
    .add(weekOffset, "week");
  const weekDays = Array.from({ length: 7 }, (_, i) => weekStart.add(i, "day"));
  const isSelected = (date, time) =>
    selectedSlots.some((s) => s.key === `${date}_${time}`);

  const sliderSetting = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
  };

  const [selectedSlots, setSelectedSlots] = useState([]);

  console.log("Selected Slots:", selectedSlots);

  // const times = [
  //   "08:00",
  //   "08:30",
  //   "09:00",
  //   "09:30",
  //   "10:00",
  //   "10:30",
  //   "11:00",
  //   "11:30",
  //   "12:00",
  //   "12:30",
  //   "13:00",
  //   "13:30",
  //   "14:00",
  //   "14:30",
  //   "15:00",
  //   "15:30",
  //   "16:00",
  //   "16:30",
  // ];

  const allTimes = [
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

  const ptTimes = allTimes.filter((_, i) => i % 2 === 0); // every hour (skip every other index)

  const times = serviceItem?.type === "pt" ? ptTimes : allTimes;

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

  const getTimeIndex = (time) => times.indexOf(time);

  const toggleSlot = (date, time) => {
    const key = `${date}_${time}`;
    const index = getTimeIndex(time);

    const selectedForDate = selectedSlots.filter((s) => s.date === date);
    const alreadySelected = selectedForDate.some((s) => s.key === key);

    const sortedTimes = selectedForDate
      .map((s) => s.time)
      .sort((a, b) => getTimeIndex(a) - getTimeIndex(b));

    if (alreadySelected) {
      // Only allow removing the last one
      if (time === sortedTimes[sortedTimes.length - 1]) {
        setSelectedSlots(selectedSlots.filter((s) => s.key !== key));
      }
      return;
    }

    // Adding new slot
    if (selectedForDate.length === 0) {
      setSelectedSlots([...selectedSlots, { date, time, key }]);
      return;
    }

    const lastTime = sortedTimes[sortedTimes.length - 1];
    const expectedNextTime = times[getTimeIndex(lastTime) + 1];

    if (time === expectedNextTime && selectedForDate.length < 4) {
      setSelectedSlots([...selectedSlots, { date, time, key }]);
    }
  };

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

  return (
    <>
      <div className="page--content">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2 border rounded p-6 shadow-sm">
            <div className="flex mb-4 w-full gap-4">
              <div className="relative flex-1" ref={searchRef}>
                <h2 className="text-2xl font-semibold mb-4">Book Your Slots</h2>

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
              <div className="flex-1">
                {selectedMember && (
                  <div className="flex border rounded-[10px] p-3 bg-gray-100 items-center h-full">
                    <div>
                      <img
                        src={selectedMember?.profileImage}
                        alt="Member"
                        className="w-[80px] h-[80px] rounded-full mr-3"
                      />
                    </div>
                    <div>
                      <p className="">
                        <strong>Name:</strong> {selectedMember.name}
                      </p>
                      <p className="">
                        <strong>Type:</strong> {selectedMember.service}
                      </p>
                      <p className="">
                        <strong>Contact:</strong> {selectedMember.contact}
                      </p>
                    </div>
                  </div>
                )}

                {/* {console.log("Selected Member:", selectedMember)}
                {console.log("Service Item:", serviceItem)}
                {serviceItem?.category === "Trainers" &&
                  selectedMember &&
                  !selectedMember.trainersList?.some(
                    (trainer) => trainer.id === serviceItem?.trainerId
                  ) && (
                    <button className="mt-2 w-full bg-black text-white px-5 py-2 rounded">Book Trial</button>
                  )} */}
              </div>
            </div>

            {serviceItem?.category === "Trainers" && (
              <>
                {selectedMember && (
                  <div className="my-2 text-sm text-gray-700">
                    <span className="font-semibold">PT Sessions:</span>{" "}
                    {selectedMember.ptSessions}
                  </div>
                )}
              </>
            )}

            {serviceItem?.category === "Trainers" &&
            selectedMember?.ptSessions === 0 ? (
              <div>
                <div className="text-red-500">
                  No PT sessions available for this member.
                </div>

                <div className="grid grid-cols-4 gap-2 mb-4 mt-4">
                  <div className="border p-3 rounded">
                    <h2>1 Session</h2>
                    <p className="text-2xl font-semibold">₹5000</p>
                    <button className="mt-2 w-full bg-black text-white px-5 py-2 rounded">
                      Buy Now
                    </button>
                  </div>
                  <div className="border p-3 rounded">
                    <h2>1 Session</h2>
                    <p className="text-2xl font-semibold">₹5000</p>
                    <button className="mt-2 w-full bg-black text-white px-5 py-2 rounded">
                      Buy Now
                    </button>
                  </div>
                  <div className="border p-3 rounded">
                    <h2>1 Session</h2>
                    <p className="text-2xl font-semibold">₹5000</p>
                    <button className="mt-2 w-full bg-black text-white px-5 py-2 rounded">
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => {
                      setWeekOffset(0);
                      setSelectedDate(dayjs().format("YYYY-MM-DD"));
                    }}
                    className="mt-4 bg-black text-white px-5 py-2 rounded"
                  >
                    Today
                  </button>
                  <div className="text-xl font-bold flex">
                    {(() => {
                      const firstMonth = weekDays[0].format("MMMM");
                      const lastMonth = weekDays[6].format("MMMM");
                      const year = weekDays[0].format("YYYY");
                      const lastYear = weekDays[6].format("YYYY");

                      if (firstMonth !== lastMonth || year !== lastYear) {
                        // Different months or years
                        if (year === lastYear) {
                          // Same year, different months
                          return `${firstMonth} - ${lastMonth} ${year}`;
                        } else {
                          // Different years
                          return `${firstMonth} ${year} - ${lastMonth} ${lastYear}`;
                        }
                      }
                      // Same month and year
                      return `${firstMonth} ${year}`;
                    })()}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setWeekOffset((prev) => prev - 1)}
                      className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                    >
                      <GrPrevious />
                    </button>
                    <button
                      onClick={() => setWeekOffset((prev) => prev + 1)}
                      className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                    >
                      <GrNext />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-4 border p-3 rounded items-center">
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
                        className={`flex flex-col items-center px-3 py-2 rounded min-w-[50px] ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300"
                        } ${
                          isPast && !isToday
                            ? "opacity-40 cursor-not-allowed"
                            : ""
                        }`}
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
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold mb-2">
                        Available Time Slots
                      </h3>

                      <div className="flex gap-2 items-center">
                        <p className="flex gap-2 items-center text-sm">
                          <FaCircle className="text-blue-200" /> Available
                        </p>
                        <p className="flex gap-2 items-center text-sm">
                          <FaCircle className="text-red-400" /> Booked
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                      {times.map((time) => {
                        const slot = slotAvailability[selectedDate]?.[time] || {
                          status: "available",
                        };
                        const key = `${selectedDate}_${time}`;
                        const isBooked = slot.status === "booked";
                        const isPast = isPastTime(time);
                        const isSelected = selectedSlots.some(
                          (s) => s.key === key
                        );

                        const selectedForDate = selectedSlots.filter(
                          (s) => s.date === selectedDate
                        );
                        const sortedTimes = selectedForDate
                          .map((s) => s.time)
                          .sort((a, b) => getTimeIndex(a) - getTimeIndex(b));

                        const lastSelected =
                          sortedTimes[sortedTimes.length - 1];
                        const expectedNext =
                          times[getTimeIndex(lastSelected) + 1];

                        const isAddable =
                          selectedForDate.length === 0 ||
                          (selectedForDate.length < 4 && time === expectedNext);

                        const isLastSelected =
                          time === sortedTimes[sortedTimes.length - 1];

                        const disableBecauseNotNext = !isSelected && !isAddable;

                        const isDisabled =
                          isPast || isBooked || disableBecauseNotNext;

                        // Assign button classes
                        let btnClass = "bg-blue-200 hover:bg-blue-300"; // default available
                        if (isSelected) {
                          btnClass = "bg-green-500 text-white";
                        } else if (isBooked) {
                          btnClass = "bg-red-400 text-white cursor-not-allowed";
                        } else if (isDisabled) {
                          btnClass += " opacity-40 cursor-not-allowed";
                        }

                        return (
                          <button
                            key={time}
                            className={`w-full px-4 py-2 rounded text-sm ${btnClass}`}
                            onClick={() => toggleSlot(selectedDate, time)}
                            disabled={isDisabled && !isLastSelected}
                          >
                            {time}
                            {/* {isBooked && <div className="text-xs">Booked</div>} */}
                          </button>
                        );
                      })}
                    </div>
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
              {serviceItem?.clubName && (
                <p className="mb-2">
                  <strong>Club:</strong> {serviceItem?.clubName}
                </p>
              )}
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
