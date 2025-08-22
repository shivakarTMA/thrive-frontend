export const customStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? "black" : "#ccc",
      boxShadow: state.isFocused ? "0 0 0 1px black" : "none",
      "&:hover": {
        borderColor: "black",
      },
      minHeight: "45px",
      borderRadius:"10px",
      paddingLeft:"3px"
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
      color: state.isFocused ? "#ffffff" : "#000000",           // Hover text color
      cursor: "pointer",
      fontSize:"14px"
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
      borderRadius:"10px",
       paddingLeft: '30px', 
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
      color: state.isFocused ? "#ffffff" : "#000000",           // Hover text color
      cursor: "pointer",
      fontSize:"14px"
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
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } else {
      return `${year}-${month}-${day}`;
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