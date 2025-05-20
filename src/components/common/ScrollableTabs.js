import React, { useRef } from "react";

const ScrollableTabs = ({ tabs, selectedTab, setSelectedTab,className }) => {
  const tabRefs = useRef({});

  const handleTabClick = (tab) => {
    setSelectedTab(tab);
    tabRefs.current[tab]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  return (
    <div className={`flex overflow-x-auto whitespace-nowrap gap-2 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab}
          ref={(el) => (tabRefs.current[tab] = el)}
          onClick={() => handleTabClick(tab)}
          className={`px-5 py-3 text-sm rounded shrink-0 ${
            selectedTab === tab
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default ScrollableTabs;
