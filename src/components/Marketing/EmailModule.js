import React, { useState } from "react";
import EmailCriteriaForm from "./EmailCriteriaForm";

const EmailModule = () => {
  const [activeTab, setActiveTab] = useState("Member");

  const tabs = ["Member", "Enquiries"];

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="page--content">
      <div className=" flex items-end justify-between gap-2 mb-0">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > Members > All Members > Send Mail`}</p>
          <h1 className="text-3xl font-semibold">Send Mail</h1>
        </div>
      </div>
      <div className="flexs">
        <aside className="w-full">
          <div className="mt-6 flex flex-wrap items-center ">
            <div className="mt-0 flex items-center border-b border-b-[#D4D4D4] overflow-auto buttons--overflow pr-6 w-full">
              {tabs.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleTabClick(item)}
                  className={`w-fit min-w-[fit-content] cursor-pointer
                      ${activeTab === item ? "btn--tab" : ""}`}
                >
                  <div className="px-5 py-3 z-[1] relative text-[15px] font-[500]">
                    {item}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}

        <div className="mt-4 ">
          <EmailCriteriaForm />
        </div>
      </div>
    </div>
  );
};

export default EmailModule;
