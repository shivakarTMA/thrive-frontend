import React from "react"; // Import React library
import PropTypes from "prop-types"; // Import PropTypes for type checking
import { Link } from "react-router-dom"; // Import Link for navigation

// Functional component to display sales summary dynamically
const SalesSummary = ({ icon, title, totalSales, items, titleLink }) => {
  return (
    <div className="bg-white rounded-[5px] overflow-hidden border border-[#D4D4D4]">
      {/* Header with dynamic icon and total sales */}
      <div className="flex justify-between items-center bg-[#F1F1F1] border-b border-b-[#D4D4D4] p-2 px-3">
        <span className="flex items-center space-x-2">
          {/* Dynamic Icon */}
          <img src={icon} alt="sales-icon" className="w-6 h-6" />
          <span className="font-bold text-black text-md">{title}</span>
        </span>
        {/* Total Sales Value */}
        <Link to={titleLink} className="font-bold text-md text-black">{totalSales}</Link>
      </div>

      {/* Dynamically render all items */}
      <div className="py-4 px-3 space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span className="text-black">{item.label}</span>
            {/* Each item has its own unique link */}
            <Link to={item.link} className="font-bold text-black">
              {item.value}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

// PropTypes validation for component props
SalesSummary.propTypes = {
  icon: PropTypes.string.isRequired, // Dynamic icon image source
  title: PropTypes.string.isRequired, // Title text
  titleLink: PropTypes.string.isRequired, // Title text
  totalSales: PropTypes.string.isRequired, // Total sales value
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired, // Item label
      value: PropTypes.string.isRequired, // Item value
      link: PropTypes.string.isRequired, // Unique link for this item
    })
  ).isRequired, // Dynamic list of items
};

export default SalesSummary; // Export component for reuse
