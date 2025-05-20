// BookingService.jsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  mockData,
  servicesData,
  slotAvailability,
} from "../../DummyData/DummyData";
import dayjs from "dayjs";
import Select from "react-select";
import { customStyles } from "../../Helper/helper";
import { useRef, useEffect } from "react";
import { toast } from "react-toastify";
import BookingSuccessModal from "../../components/BookingSuccessModal";
import { CiCalendar } from "react-icons/ci";
import { IoCloseCircle, IoTimeOutline } from "react-icons/io5";

// import Slider from "react-slick";
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

const BookingService = () => {
  const { id } = useParams();
  const serviceItem = servicesData.find((item) => item.id === parseInt(id));
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [serviceBooked, setServiceBooked] = useState(false);
  const searchRef = useRef(null);

  //   const sliderSetting = {
  //     dots: true,
  //     infinite: true,
  //     speed: 500,
  //     slidesToShow: 1,
  //     slidesToScroll: 1,
  //     arrows: true,
  //   };

  const [selectedSlots, setSelectedSlots] = useState([]);
  const [view, setView] = useState("week");
  const [month, setMonth] = useState(dayjs().month());

  const memberOptions = mockData.map((member) => ({
    value: member.id,
    label: `${member.name} (${member.contact})`,
    member,
  }));

  const times = [
    "05:00",
    "06:00",
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
  ];

  const viewOptions = [
    { value: "week", label: "This Week" },
    { value: "next-week", label: "Next Week" },
    { value: "month", label: "Full Month" },
  ];

  const currentMonthIndex = dayjs().month();
  const monthOptions = Array.from({ length: 12 - currentMonthIndex }).map(
    (_, i) => {
      const month = dayjs().month(currentMonthIndex + i);
      return {
        value: month.month(),
        label: month.format("MMMM"),
      };
    }
  );

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

  const getDatesToShow = () => {
    if (view === "week" || view === "next-week") {
      let startDay = dayjs();
      if (view === "next-week") {
        startDay = startDay.add(7, "day");
      }
      return Array.from({ length: 7 }).map((_, i) => startDay.add(i, "day"));
    } else {
      const today = dayjs().month(month).startOf("month");
      const daysInMonth = today.daysInMonth();
      return Array.from({ length: daysInMonth }).map((_, i) =>
        today.add(i, "day")
      );
    }
  };

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

  return (
    <>
      <div className="page--content">
        <div className="flex gap-4 mb-5">
          {/* <div>
          {serviceItem?.images && (
            <div className="mb-6 max-w-xl">
              <Slider {...sliderSetting}>
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
            </div>
          )}
        </div> */}
          <div>
            <h1 className="text-3xl font-semibold">{serviceItem?.title}</h1>
            <p className="mb-3">
              <strong>Description</strong>: {serviceItem?.description}
            </p>
            <div className="mb-4 relative" ref={searchRef}>
              <div className="flex items-center gap-2">
                <label className="block font-medium mb-1">Member Name: </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Enter name or mobile"
                  className="custom--input w-full max-w-[200px]"
                />
              </div>

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
          </div>
        </div>

        {/* 
      {selectedMember && (
        <div className="mb-4 p-3 border rounded bg-gray-100">
          <p>
            <strong>Name:</strong> {selectedMember.name}
          </p>
          <p>
            <strong>Contact:</strong> {selectedMember.contact}
          </p>
        </div>
      )} */}

        <div className="flex items-center gap-4 mb-4">
          <div className="w-48">
            <Select
              options={viewOptions}
              value={viewOptions.find((o) => o.value === view)}
              onChange={(opt) => setView(opt.value)}
              styles={customStyles}
            />
          </div>

          {view === "month" && (
            <div className="w-48">
              <Select
                options={monthOptions}
                value={monthOptions.find((o) => o.value === month)}
                onChange={(opt) => setMonth(opt.value)}
                styles={customStyles}
              />
            </div>
          )}
        </div>
        <div className="overflow-x-auto border rounded mb-6">
          <table className="w-full border-collapse text-center">
            <thead>
              <tr>
                <th className="border p-2 min-w-[100px]">Time</th>
                {getDatesToShow().map((d) => (
                  <th
                    key={d.format("YYYY-MM-DD")}
                    className="border p-2 min-w-[150px]"
                  >
                    {d.format("DD MMM")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {times.map((time) => (
                <tr key={time}>
                  <td className="border p-2 font-medium">{time}</td>
                  {getDatesToShow().map((d) => {
                    const dateStr = d.format("YYYY-MM-DD");
                    const slot = slotAvailability[dateStr]?.[time] || {
                      status: "available",
                    };
                    const selected = isSelected(dateStr, time);

                    let cellClass = "bg-white";
                    let content = "";

                    if (slot.status === "booked") {
                      cellClass = "bg-red-500 text-white text-sm";
                      content = `Booked: ${slot.service}`;
                    } else if (selected) {
                      cellClass = "bg-green-400 text-white cursor-pointer";
                      content = `Selected`;
                    } else {
                      cellClass =
                        "bg-blue-200 hover:bg-blue-300 cursor-pointer";
                      content = `Available`;
                    }

                    return (
                      <td
                        key={`${dateStr}-${time}`}
                        className={`border p-1 ${cellClass}`}
                        onClick={() =>
                          slot.status !== "booked" && toggleSlot(dateStr, time)
                        }
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-5">
          <h2 className="font-semibold text-lg mb-2">Selected Slots:</h2>
          {selectedSlots.length === 0 ? (
            <p>No slots selected.</p>
          ) : (
            <ul className="flex flex-wrap gap-6">
              {selectedSlots.map((slot) => (
                <li key={slot.key} className="border py-2 px-4 rounded relative min-w-[150px]">
                  <p className="flex items-center gap-2">
                    <CiCalendar /> {slot.date}
                  </p>
                  <p className="flex items-center gap-2">
                    <IoTimeOutline /> {slot.time}
                  </p>
                  <button
                    className="text-black absolute top-[-10px] right-[-10px] text-2xl"
                    onClick={() => toggleSlot(slot.date, slot.time)}
                  >
                    <IoCloseCircle />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-4 text-lg font-bold">Total Price: ₹{totalPrice}</div>

        <button
          className={`mt-4 bg-black text-white px-5 py-2 rounded ${
            selectedSlots.length === 0 && "opacity-50 cursor-not-allowed"
          }`}
          onClick={handlePayment}
          disabled={selectedSlots.length === 0}
        >
          Make Payment
        </button>
      </div>

      <BookingSuccessModal
        isOpen={serviceBooked}
        onClose={() => setServiceBooked(false)}
      />
    </>
  );
};

export default BookingService;
