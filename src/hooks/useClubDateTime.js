// hooks/useClubDateTime.js — FIXED

import { useMemo } from "react";
import { createClubTimeFilter, getFirstValidTime } from "../utils/clubTimeHelpers";

export const useClubDateTime = (selectedDate, clubData) => {
  const openTime = clubData?.open_time || clubData?.opening_time || clubData?.start_time;
  const closeTime = clubData?.close_time || clubData?.closing_time || clubData?.end_time;

  const filterTime = useMemo(() => {
    if (!openTime || !closeTime) return () => true;
    return createClubTimeFilter(selectedDate, openTime, closeTime);
  }, [selectedDate, openTime, closeTime]);

  // ✅ Returns first valid time for the selected date
  const getDefaultTime = useMemo(() => {
    if (!openTime || !closeTime) return null;
    return getFirstValidTime(selectedDate, openTime, closeTime);
  }, [selectedDate, openTime, closeTime]);

  return {
    minDate: new Date(),
    filterTime,
    getDefaultTime, // ← use this as openToDate in DatePicker
  };
};