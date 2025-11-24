export const multiRowStyles = {
  valueContainer: (base) => ({
    ...base,
    display: "flex",
    flexWrap: "wrap",       // allow multiple rows
    maxHeight: "40px",      // fixed height for scroll
    overflowY: "auto",      // vertical scroll
    overflowX: "hidden",
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
    minHeight: "45px",
    borderRadius: "10px",
    paddingLeft: "30px",
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
  if (!status) return '';

  // Replace underscores with spaces, split into words
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export const handleTextOnlyChange = (e, formik, fieldName) => {
  const regex = /^[A-Za-z\s]*$/; // only alphabets + spaces

  if (regex.test(e.target.value)) {
    formik.setFieldValue(fieldName, e.target.value);
  }
};