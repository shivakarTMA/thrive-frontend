export const multiRowStyles = {
  valueContainer: (base, state) => ({
    ...base,
    display: "flex",
    flexWrap: "wrap", // allow multiple rows
    maxHeight: "44px", // fixed height for scroll
    overflowY: "auto", // vertical scroll
    overflowX: "hidden",
    borderRadius: "5px",
    paddingLeft: "3px",
    borderColor: state.isFocused ? "black" : "#ccc",
    boxShadow: state.isFocused ? "0 0 0 1px black" : "none",
    "&:hover": {
      borderColor: "black",
    },
  }),

  multiValue: (base) => ({
    ...base,
    whiteSpace: "nowrap",
    margin: "2px",
  }),

  multiValueLabel: (base) => ({
    ...base,
    whiteSpace: "nowrap",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
};

export const customStyles = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? "black" : "#ccc",
    boxShadow: state.isFocused ? "0 0 0 1px black" : "none",
    "&:hover": {
      borderColor: "black",
    },
    minHeight: "40px",
    borderRadius: "5px",
    paddingLeft: "3px",
    backgroundColor: state.isDisabled ? "#f3f4f6" : "#fff", // Added disabled background
    cursor: state.isDisabled ? "not-allowed" : "default", // Optional: change cursor
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "#f3f3f3",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "#333",
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "#666",
    ":hover": {
      backgroundColor: "#e2e2e2",
      color: "black",
    },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#000000" : "#ffffff", // Hover background
    color: state.isFocused ? "#ffffff" : "#000000", // Hover text color
    cursor: "pointer",
    fontSize: "14px",
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999, // Keeps the dropdown on top of other elements
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
};

export const dasboardStyles = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? "black" : "#ccc",
    boxShadow: state.isFocused ? "0 0 0 1px black" : "none",
    "&:hover": {
      borderColor: "black",
    },
    minHeight: "25px",
    borderRadius: "5px",
    paddingLeft: "3px",
    backgroundColor: state.isDisabled ? "#f3f4f6" : "#fff", // Added disabled background
    cursor: state.isDisabled ? "not-allowed" : "default", // Optional: change cursor
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "#f3f3f3",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "#333",
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "#666",
    ":hover": {
      backgroundColor: "#e2e2e2",
      color: "black",
    },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#000000" : "#ffffff", // Hover background
    color: state.isFocused ? "#ffffff" : "#000000", // Hover text color
    cursor: "pointer",
    fontSize: "14px",
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999, // Keeps the dropdown on top of other elements
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
};

export const selectIcon = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? "black" : "#ccc",
    boxShadow: state.isFocused ? "0 0 0 1px black" : "none",
    "&:hover": {
      borderColor: "black",
    },
    minHeight: "40px",
    borderRadius: "5px",
    paddingLeft: "30px",
    backgroundColor: state.isDisabled ? "#f3f4f6" : "#fff", // Added disabled background
    cursor: state.isDisabled ? "not-allowed" : "default", // Optional: change cursor
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "#f3f3f3",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "#333",
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "#666",
    ":hover": {
      backgroundColor: "#e2e2e2",
      color: "black",
    },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#000000" : "#ffffff", // Hover background
    color: state.isFocused ? "#ffffff" : "#000000", // Hover text color
    cursor: "pointer",
    fontSize: "14px",
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999, // Keeps the dropdown on top of other elements
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
};

export const formatDateTime = (date, withTime = false) => {
  if (!date) return null;

  const pad = (n) => String(n).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());

  if (withTime) {
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
  } else {
    return `${year}/${month}/${day}`;
  }
};

export const formatTime = (date) => {
  if (!date) return null;

  const pad = (n) => String(n).padStart(2, "0");
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${hours}:${minutes}:${seconds}`;
};

export const formatTimeAppointment = (timeString) => {
  // timeString format: "HH:MM:SS"
  const [hour, minute] = timeString.split(":").map(Number);

  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12; // convert 0 -> 12, 13->1, etc.

  return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
}

export const convertToISODate = (dateString) => {
  if (dateString instanceof Date) {
    return dateString;
  }
  const [day, month, year] = dateString.split("-");
  return new Date(`${year}-${month}-${day}`);
};

export function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date)) return "";
  return date.toISOString().split("T")[0]; // yyyy-MM-dd
}

export function formatDateTimeLead(isoString) {
  const date = new Date(isoString);

  // Get values and pad with leading zero if needed
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12; // 0 => 12
  const hourStr = String(hours).padStart(2, "0");

  return `${day}/${month}/${year} ${hourStr}:${minutes} ${ampm}`;
}

export function formatAutoDate(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export const sanitizePayload = (obj) => {
  const cleaned = { ...obj };
  Object.keys(cleaned).forEach((key) => {
    if (cleaned[key] === "" || cleaned[key] === null) {
      delete cleaned[key];
    }
  });
  return cleaned;
};

// Convert company ID to company name
export const getCompanyNameById = (companies, companyId, otherCompanyName) => {
  if (companyId === "OTHER") {
    return otherCompanyName || "";
  }
  return companies.find((c) => c.value === companyId)?.label || "";
};

// Convert company name to company ID
export const getCompanyIdByName = (companies, companyName) => {
  if (companyName === "OTHER") {
    return "OTHER";
  }
  return companies.find((c) => c.label === companyName)?.value || "";
};

export function formatText(status) {
  if (!status) return "";

  // Replace underscores with spaces, split into words
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export const handleTextOnlyChange = (e, formik, fieldName) => {
  const regex = /^[A-Za-z\s]*$/; // only alphabets + spaces

  if (regex.test(e.target.value)) {
    formik.setFieldValue(fieldName, e.target.value);
  }
};

export const buildFormData = (values) => {
  const formData = new FormData();

  Object.keys(values).forEach((key) => {
    const value = values[key];

    // Skip null or undefined
    if (value === null || value === undefined) return;

    // Skip image URL strings (only send file)
    if (key === "image" && typeof value === "string") return;

    // If it's a file, append directly
    if (value instanceof File) {
      formData.append("file", value);
      return;
    }

    // If it's object/array (except File) → send JSON
    if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
      return;
    }

    // Primitive values
    formData.append(key, value);
  });

  return formData;
};

export const filterActiveItems = (data) => {
  if (!Array.isArray(data)) return [];

  return data.filter(
    (item) => String(item?.status || "").toUpperCase() === "ACTIVE"
  );
};

export const formatIndianNumber = (value) => {
  const number = Number(value);

  if (isNaN(number)) return 0; // or return "-" if you prefer

  return new Intl.NumberFormat("en-IN").format(number);
};

export const sanitizePositiveInteger = (value) => {
  if (value === "") return "";

  // Remove everything except digits
  const digitsOnly = value.replace(/[^0-9]/g, "");

  // Prevent values like 000, 00 → keep single 0
  return digitsOnly.replace(/^0+(?!$)/, "");
};

export const durationValueInteger = (value) => {
  if (value === "") return "";

  // Remove non-digits
  const digitsOnly = value.replace(/[^0-9]/g, "");

  // Remove leading zeros
  const cleaned = digitsOnly.replace(/^0+/, "");

  // ❌ Prevent 0
  if (cleaned === "" || cleaned === "0") {
    return "";
  }

  return cleaned;
};

export const blockInvalidNumberKeys = (e) => {
  const invalidKeys = ["-", "+", "e", "E", ".", ","];

  if (invalidKeys.includes(e.key)) {
    e.preventDefault();
  }
};

// Check Datetime past time
// Check if two dates are the same calendar day
export const isSameDay = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// Returns minimum selectable time
export const getMinSelectableTime = (selectedDate) => {
  const now = new Date();

  if (!selectedDate) return new Date(0, 0, 0, 0, 0); // 12:00 AM

  const selected = new Date(selectedDate);

  // If selected date is today → restrict past time
  if (isSameDay(selected, now)) {
    return now;
  }

  // Future date → allow full day
  return new Date(0, 0, 0, 0, 0); // 12:00 AM
};

// Returns maximum selectable time (example: 10:00 PM)
export const getMaxSelectableTime = (hour = 22, minute = 0) => {
  return new Date(0, 0, 0, hour, minute);
};