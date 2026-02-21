// hooks/useDateTimePicker.js
import { useState } from "react";

// ✅ WITH FORMIK
export const useDateTimePicker = (formik, fieldName, filterTime = null) => {
  const [timeSelected, setTimeSelected] = useState(false);

  const handleDateTime = (date) => {
    if (!date) {
      formik.setFieldValue(fieldName, null);
      setTimeSelected(false);
      return;
    }

    const currentValue = formik.values[fieldName];
    const currentDate = currentValue ? new Date(currentValue) : null;

    const dateChanged =
      !currentDate ||
      date.getDate() !== currentDate.getDate() ||
      date.getMonth() !== currentDate.getMonth() ||
      date.getFullYear() !== currentDate.getFullYear();

    if (dateChanged) {
      setTimeSelected(false);
      const dateOnly = new Date(date);
      dateOnly.setHours(0, 0, 0, 0);
      formik.setFieldValue(fieldName, dateOnly);
    } else {
      // ✅ Validate typed time against filterTime before storing
      if (filterTime && !filterTime(date)) {
        formik.setFieldValue(fieldName, null);
        setTimeSelected(false);
        return;
      }
      setTimeSelected(true);
      formik.setFieldValue(fieldName, date);
    }
  };

  // ✅ Handles manual typing — fires on raw input blur
  const handleChangeRaw = (e) => {
    const raw = e?.target?.value;
    if (!raw) return;

    const parsed = new Date(raw);
    if (isNaN(parsed.getTime())) return; // invalid date string, ignore

    const now = new Date();

    // Block past datetime
    if (parsed < now) {
      formik.setFieldValue(fieldName, null);
      setTimeSelected(false);
      return;
    }

    // Block if filterTime says invalid
    if (filterTime && !filterTime(parsed)) {
      formik.setFieldValue(fieldName, null);
      setTimeSelected(false);
      return;
    }
  };

  const selectedValue = () => {
    if (!formik.values[fieldName]) return null;
    const d = new Date(formik.values[fieldName]);
    if (!timeSelected) d.setHours(0, 0, 0, 0);
    return d;
  };

  const reset = () => {
    setTimeSelected(false);
    formik.setFieldValue(fieldName, null);
  };

  return {
    selected: selectedValue(),
    handleDateTime,
    handleChangeRaw, // ← add this to DatePicker
    timeSelected,
    dateFormat: timeSelected ? "dd/MM/yyyy hh:mm aa" : "dd/MM/yyyy",
    reset,
  };
};

// ✅ WITHOUT FORMIK
export const useDateTimePickerStandalone = (initialValue = null, filterTime = null) => {
  const [value, setValue] = useState(initialValue);
  const [timeSelected, setTimeSelected] = useState(false);

  const handleDateTime = (date) => {
    if (!date) {
      setValue(null);
      setTimeSelected(false);
      return;
    }

    const currentDate = value ? new Date(value) : null;

    const dateChanged =
      !currentDate ||
      date.getDate() !== currentDate.getDate() ||
      date.getMonth() !== currentDate.getMonth() ||
      date.getFullYear() !== currentDate.getFullYear();

    if (dateChanged) {
      setTimeSelected(false);
      const dateOnly = new Date(date);
      dateOnly.setHours(0, 0, 0, 0);
      setValue(dateOnly);
    } else {
      if (filterTime && !filterTime(date)) {
        setValue(null);
        setTimeSelected(false);
        return;
      }
      setTimeSelected(true);
      setValue(date);
    }
  };

  const handleChangeRaw = (e) => {
    const raw = e?.target?.value;
    if (!raw) return;

    const parsed = new Date(raw);
    if (isNaN(parsed.getTime())) return;

    const now = new Date();

    if (parsed < now) {
      setValue(null);
      setTimeSelected(false);
      return;
    }

    if (filterTime && !filterTime(parsed)) {
      setValue(null);
      setTimeSelected(false);
      return;
    }
  };

  const selectedValue = () => {
    if (!value) return null;
    const d = new Date(value);
    if (!timeSelected) d.setHours(0, 0, 0, 0);
    return d;
  };

  const reset = () => {
    setValue(null);
    setTimeSelected(false);
  };

  return {
    value,
    selected: selectedValue(),
    handleDateTime,
    handleChangeRaw, // ← add this to DatePicker
    timeSelected,
    dateFormat: timeSelected ? "dd/MM/yyyy hh:mm aa" : "dd/MM/yyyy",
    reset,
  };
};