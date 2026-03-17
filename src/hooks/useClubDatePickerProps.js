import { useSelector } from "react-redux";

const DEFAULT_OPEN_MINUTES  = 360;
const DEFAULT_CLOSE_MINUTES = 1200;
const DEFAULT_INTERVALS     = 30;

const minutesToDate = (totalMinutes) => {
  const d = new Date();
  d.setHours(Math.floor(totalMinutes / 60), totalMinutes % 60, 0, 0);
  return d;
};

// ✅ Snap to next slot on the club's interval grid starting from openMinutes
// e.g. open=360(6AM), interval=45 → grid: 360,405,450... 
// current=378(6:18AM) → next grid slot = 405(6:45AM)
const getNextGridSlot = (nowMinutes, openMinutes, intervalMins) => {
  if (nowMinutes <= openMinutes) return openMinutes; // before open → first slot
  const slotsElapsed = Math.ceil((nowMinutes - openMinutes) / intervalMins);
  return openMinutes + slotsElapsed * intervalMins;
};

export const useClubDatePickerProps = (selectedDate) => {
  const { data } = useSelector((state) => state.clubTiming);

  const now = new Date();

  const openMinutes        = data?.openMinutes        ?? DEFAULT_OPEN_MINUTES;
  const maxBookableMinutes = data?.maxBookableMinutes  ?? DEFAULT_CLOSE_MINUTES;
  const timeIntervals      = data?.timeIntervals       ?? DEFAULT_INTERVALS;

  const nowInMinutes = now.getHours() * 60 + now.getMinutes();

  // Next valid slot on club grid
  const nextGridSlotMinutes = getNextGridSlot(nowInMinutes, openMinutes, timeIntervals);

  // Today expired if next grid slot exceeds maxBookable
  const isTodayExpired = nextGridSlotMinutes >= maxBookableMinutes;

  const isToday =
    selectedDate &&
    new Date(selectedDate).toDateString() === now.toDateString();

  const getMinDate = () => {
    if (isTodayExpired) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      return tomorrow;
    }
    return now;
  };

  const getMinTime = () => {
    if (isToday) {
      // ✅ minTime = next grid slot (e.g. 6:45 PM not 6:15 PM)
      return minutesToDate(nextGridSlotMinutes);
    }
    return minutesToDate(openMinutes);
  };

  const getMaxTime = () => minutesToDate(maxBookableMinutes);

  const getDefaultTimeForDate = (date) => {
    if (!date) return null;

    const d = new Date(date);
    const isPickedToday = d.toDateString() === now.toDateString();

    if (isPickedToday) {
      // ✅ No valid slots left today
      if (isTodayExpired) return null;

      // ✅ Auto-select = next grid slot (e.g. 6:45 PM)
      d.setHours(
        Math.floor(nextGridSlotMinutes / 60),
        nextGridSlotMinutes % 60,
        0, 0,
      );
    } else {
      // Future date → first slot = open time
      d.setHours(Math.floor(openMinutes / 60), openMinutes % 60, 0, 0);
    }

    return d;
  };

  return {
    timeIntervals,
    minTime: getMinTime(),
    maxTime: getMaxTime(),
    minDate: getMinDate(),
    showTimeSelect: true,
    timeFormat: "hh:mm aa",
    dateFormat: "dd/MM/yyyy hh:mm aa",
    getDefaultTimeForDate,
  };
};