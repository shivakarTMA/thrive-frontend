import React, { useCallback, useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { LuCalendarDays } from "react-icons/lu";
import Select from "react-select";
import { customStyles } from "../../Helper/helper";
import { authAxios } from "../../config/config";
import { useSelector } from "react-redux";

const localizer = momentLocalizer(moment);

const viewOptions = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

// const EVENT_COLORS = {
//   personal: { bg: "#F0FDFA", border: "#0D9488" },
//   group: { bg: "#F0FDFA", border: "#0D9488" },
//   trial: { bg: "#E7F0FF", border: "#2563EB" },
// };
const EVENT_COLORS = {
  personal: { bg: "#F0FDFA", border: "#0D9488" }, // green
  pilates: { bg: "#FFF7ED", border: "#F97316" },  // orange
  trial: { bg: "#E7F0FF", border: "#2563EB" },    // blue
  group: { bg: "#F3F4F6", border: "#6B7280" },    // gray fallback
};

const CalendarView = ({ clubId }) => {
  const [view, setView] = useState("week");
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const { data } = useSelector((state) => state.clubTiming);

  const openMinutes = data?.openMinutes ?? 360;   // fallback 6 AM
  const closeMinutes = data?.closeMinutes ?? 1200; // fallback 8 PM
  const timeIntervals = data?.timeIntervals ?? 30;

  const minutesToDate = (minutes) => {
    const d = new Date();
    d.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
    return d;
  };

  const fetchTrainerBookings = async () => {
    try {
      if (!clubId) return;

      setLoading(true);

      const res = await authAxios().get(
        `/appointment/trainer/upcoming/bookings?club_id=${clubId}`
      );

      const apiData = res.data?.data || [];

      const typeMap = {
        trial: "trial",
        "Personal Training": "personal",
      };

      // const formattedEvents = apiData.map((item) => {
      //   const startDateTime = moment(
      //     `${item.start_date} ${item.start_time}`,
      //     "YYYY-MM-DD HH:mm:ss"
      //   ).toDate();

      //   const endDateTime = moment(
      //     `${item.start_date} ${item.end_time}`,
      //     "YYYY-MM-DD HH:mm:ss"
      //   ).toDate();

      //   return {
      //     id: item.id,
      //     title: item.package_name || item.type,
      //     subTitle:item.member_name,
      //     start: startDateTime,
      //     end: endDateTime,
      //     trainer: item.trainer_name,
      //     type:
      //       typeMap[item.type?.toLowerCase()] || "group",
      //   };
      // });
      const formattedEvents = apiData.map((item) => {
        const startDateTime = moment(
          `${item.start_date} ${item.start_time}`,
          "YYYY-MM-DD HH:mm:ss"
        ).toDate();

        const endDateTime = moment(
          `${item.start_date} ${item.end_time}`,
          "YYYY-MM-DD HH:mm:ss"
        ).toDate();

        const rawType = item.type?.toLowerCase() || "";

        let mappedType = "group";

        if (rawType.includes("trial")) {
          mappedType = "trial";
        } else if (rawType.includes("pilates")) {
          mappedType = "pilates";
        } else if (rawType.includes("personal")) {
          mappedType = "personal";
        }

        return {
          id: item.id,
          title: item.package_name || item.type,
          subTitle: item.member_name,
          start: startDateTime,
          end: endDateTime,
          trainer: item.trainer_name,
          type: mappedType,
        };
      });

      setEvents(formattedEvents);
    } catch (error) {
      console.error(
        "Error fetching bookings:",
        error?.response || error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clubId) {
      fetchTrainerBookings();
    }
  }, [clubId]);

  const eventStyleGetter = useCallback((event) => {
    const colors = EVENT_COLORS[event.type] || EVENT_COLORS.group;
    return {
      style: {
        backgroundColor: colors.bg,
        borderLeft: `4px solid ${colors.border}`,
        borderRadius: "0px",
        color: "#000",
        padding: "8px",
      },
    };
  }, []);

  const CustomEvent = ({ event }) => {
    const formatTime = (date) => moment(date).format("h:mm A");

    return (
      <div className="h-full">
        {view === "month" ? (
          <div className="text-xs font-medium truncate">
            {event.title}
          </div>
        ) : (
          <>
            <div className="font-medium text-[12px] leading-tight mb-1">
              {event.title}
            </div>
            <div className="font-medium text-[10px] leading-tight mb-1">
              {event.subTitle}
            </div>
            <div className="text-[10px] text-gray-600">
              {formatTime(event.start)} – {formatTime(event.end)}
            </div>
            <div className="text-[10px] text-gray-600 truncate">
              {event.trainer}
            </div>
          </>
        )}
      </div>
    );
  };

  const navigatePrevious = () => {
    const newDate = new Date(date);
    if (view === "month") newDate.setMonth(date.getMonth() - 1);
    else if (view === "week") newDate.setDate(date.getDate() - 7);
    else newDate.setDate(date.getDate() - 1);
    setDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(date);
    if (view === "month") newDate.setMonth(date.getMonth() + 1);
    else if (view === "week") newDate.setDate(date.getDate() + 7);
    else newDate.setDate(date.getDate() + 1);
    setDate(newDate);
  };

  return (
    <div className="rounded-[15px] p-4 bg-white mt-3">
      {/* Header */}
      <div className="pb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">My Calendar</h2>
          <div className="flex items-center gap-3">
            <LuCalendarDays className="w-5 h-5 text-gray-600" />
            <div className="w-40">
              <Select
                options={viewOptions}
                value={viewOptions.find((o) => o.value === view)}
                onChange={(e) => setView(e.value)}
                styles={customStyles}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={navigatePrevious}>
              <FaChevronLeft />
            </button>
            <span className="text-sm font-medium text-gray-600">
              {view === "week" ? "This Week" : ""}
            </span>
            <button onClick={navigateNext}>
              <FaChevronRight />
            </button>
          </div>
          <h2 className="text-xl font-semibold">
            {moment(date).format("MMMM YYYY")}
          </h2>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center text-sm text-gray-500 mb-2">
          Loading bookings...
        </div>
      )}

      {/* Calendar */}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={view}
        date={date}
        onView={setView}
        onNavigate={setDate}
        eventPropGetter={eventStyleGetter}
        components={{
          event: CustomEvent,
          header: ({ date }) => (
            <div>
              <div className="text-xs uppercase text-gray-500">
                {moment(date).format("ddd")}
              </div>
              {view !== "month" && (
                <div className="text-lg">{moment(date).format("DD")}</div>
              )}
            </div>
          ),
        }}
        showNow={false}
        min={minutesToDate(openMinutes)}     // ✅ dynamic open time
        max={minutesToDate(closeMinutes)}   // ✅ dynamic close time
        step={timeIntervals}                // ✅ dynamic interval (30 / 60)
        timeslots={1}
        toolbar={false}
        views={["month", "week", "day"]}
      />
    </div>
  );
};

export default CalendarView;