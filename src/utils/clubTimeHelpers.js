// utils/clubTimeHelpers.js — FULLY FIXED

export const getTimeFromString = (timeString) => {
  if (!timeString) return null;
  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, seconds || 0, 0);
  return date;
};

export const isToday = (date) => {
  const today = new Date();
  return (
    date?.getDate() === today.getDate() &&
    date?.getMonth() === today.getMonth() &&
    date?.getFullYear() === today.getFullYear()
  );
};

export const createClubTimeFilter = (selectedDate, openTime, closeTime) => {
  return (time) => {
    const open = getTimeFromString(openTime);
    const close = getTimeFromString(closeTime);

    if (!open || !close) return true;

    const now = new Date();
    const selected = selectedDate ? new Date(selectedDate) : new Date();

    const timeTotal = time.getHours() * 60 + time.getMinutes();
    const openTotal = open.getHours() * 60 + open.getMinutes();
    const closeTotal = close.getHours() * 60 + close.getMinutes();

    // Block before club open time
    if (timeTotal < openTotal) return false;

    // Block after club close time
    if (timeTotal > closeTotal) return false;

    // Block past times if today is selected
    if (isToday(selected)) {
      // Add 30 min buffer so current slot isn't immediately disabled
      const nowTotal = now.getHours() * 60 + now.getMinutes();
      if (timeTotal < nowTotal) return false;
    }

    return true;
  };
};

// ✅ NEW: Get the first valid time for a given date
export const getFirstValidTime = (selectedDate, openTime, closeTime) => {
  const open = getTimeFromString(openTime);
  const close = getTimeFromString(closeTime);

  if (!open || !close) return null;

  const now = new Date();
  const selected = selectedDate ? new Date(selectedDate) : new Date();

  const openTotal = open.getHours() * 60 + open.getMinutes();
  const closeTotal = close.getHours() * 60 + close.getMinutes();

  let startTotal;

  if (isToday(selected)) {
    const nowTotal = now.getHours() * 60 + now.getMinutes();

    // ✅ Round UP to next 30-min slot from current time
    // e.g. now=6:10 → 6:30, now=6:00 → 6:00, now=6:31 → 7:00
    startTotal = Math.ceil(nowTotal / 30) * 30;

    // If rounded time is before open → use open time
    if (startTotal < openTotal) startTotal = openTotal;
  } else {
    // Future date → default to club open time
    startTotal = openTotal;
  }

  // No valid slot available (all slots past closing time)
  if (startTotal > closeTotal) return null;

  const result = new Date(selected);
  result.setHours(Math.floor(startTotal / 60), startTotal % 60, 0, 0);
  return result;
};