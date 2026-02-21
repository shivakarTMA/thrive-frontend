// utils/dateTimeHelpers.js

/**
 * Returns true if two dates are same calendar day
 */
export const isSameDay = (date1, date2) => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

/**
 * Reusable filterTime function for react-datepicker
 * 
 * @param {Date} time - time option from datepicker
 * @param {Date|null} selectedDate - currently selected date
 * @param {Number} maxHour - optional max hour (default 22 = 10PM)
 */
export const createFilterTime = (
  selectedDate,
  maxHour = 22
) => {
  return (time) => {
    const now = new Date();

    const currentDate = selectedDate ? new Date(selectedDate) : now;

    const timeDate = new Date(time);

    // Block past time if selected date is today
    if (isSameDay(currentDate, now)) {
      if (timeDate.getTime() < now.getTime()) {
        return false;
      }
    }

    // Block time after maxHour (default 10PM)
    const maxTime = new Date(timeDate);
    maxTime.setHours(maxHour, 0, 0, 0);

    if (timeDate.getHours() > maxHour) {
      return false;
    }

    return true;
  };
};
