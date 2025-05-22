import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GoPlusCircle } from "react-icons/go";
import { FiEdit2 } from "react-icons/fi";
import { membershipData, mockData } from "../DummyData/DummyData";
import ProfileDetails from "../components/memberprofile/ProfileDetails";
import { FaCrown } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";

const MemberProfile = () => {
  const { id } = useParams();
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  useEffect(() => {
    const slider = scrollRef.current;

    const handleMouseDown = (e) => {
      isDragging.current = true;
      slider.classList.add("cursor-grabbing");
      startX.current = e.pageX - slider.offsetLeft;
      scrollLeft.current = slider.scrollLeft;
    };

    const handleMouseLeave = () => {
      isDragging.current = false;
      slider.classList.remove("cursor-grabbing");
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      slider.classList.remove("cursor-grabbing");
    };

    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX.current) * 1.5; // scroll-fastness
      slider.scrollLeft = scrollLeft.current - walk;
    };

    slider.addEventListener("mousedown", handleMouseDown);
    slider.addEventListener("mouseleave", handleMouseLeave);
    slider.addEventListener("mouseup", handleMouseUp);
    slider.addEventListener("mousemove", handleMouseMove);

    return () => {
      slider.removeEventListener("mousedown", handleMouseDown);
      slider.removeEventListener("mouseleave", handleMouseLeave);
      slider.removeEventListener("mouseup", handleMouseUp);
      slider.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const tabs = [
    "Profile Details",
    "Service Card",
    "Order History",
    "Call Logs",
    "Appointments",
    "Referrals",
    "Family Members",
    "Store",
    "Documents",
    "Attendance",
    "Trial History",
    "Training",
  ];
  const [activeTab, setActiveTab] = useState("Profile Details");
  const navigate = useNavigate();
  const member = mockData.find((m) => m.id === parseInt(id));

  if (!member) return <p>Member not found</p>;

  

  return (
    <div className="page--content">
      <div className=" flex items-end justify-between gap-2 mb-0">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > Members > Member Profile`}</p>
        </div>
      </div>
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-full max-w-[250px]">
          <h1 className="text-3xl font-semibold">Member Profile</h1>
          <div className="bg-secondarycolor p-4 rounded mt-6 space-y-1">
            {tabs.map((item) => (
              <div
                key={item}
                onClick={() => setActiveTab(item)}
                className={`px-4 py-1.5 rounded cursor-pointer transition 
                ${
                  activeTab === item
                    ? "bg-primarycolor text-white"
                    : "bg-primarylight hover:text-white hover:bg-primarycolor"
                }`}
              >
                {item}
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-5 pt-0 pb-0">
          <div className="flex items-center gap-2">
            <div className="flex flex-wrap bg-primarylight items-center border rounded p-2 seprator-horizontal gap-y-2">
              <button className="text-[14px] text-black seprator-item px-3">
                Inter branch transfer
              </button>
              <button className="text-[14px] text-black seprator-item px-3">
                Print profile
              </button>
              <button className="text-[14px] text-black seprator-item px-3">
                Add Advance Payment
              </button>
              <button className="text-[14px] text-black seprator-item px-3">
                New Invoice
              </button>
              <button className="text-[14px] text-black seprator-item px-3">
                New Call
              </button>
              <button className="text-[14px] text-black seprator-item px-3">
                New appointment
              </button>
              <button className="text-[14px] text-black seprator-item px-3">
                Send Payment Link
              </button>
            </div>
            <div>
              <GoPlusCircle className="text-3xl cursor-pointer text-primarycolor" />
            </div>
          </div>

          <div className="bg-secondarycolor p-4 rounded mt-6 h-[calc(100%-65px)]">
            {activeTab === "Profile Details" && (
              <ProfileDetails member={member} />
            )}
          </div>

          {/* History */}
        </main>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-3">History</h3>
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-auto pr-5 cursor-grab select-none hide--overflow"
        >
          {membershipData.map((membership, idx) => (
            <div
              key={idx}
              className="bg-white border border-[5px] border-gray-300 p-4 rounded flex justify-between w-full min-w-[28%]"
            >
              <div className="flex w-full gap-2">
                <div className="text-lg border rounded-sm h-[30px] w-[40px] flex items-center justify-center cursor-pointer">
                  {membership.icon}
                </div>
                <div className="w-full">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{membership.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600 border-b pb-2 mb-2 w-full">
                    {membership.duration}
                  </p>
                  <ul className="text-xs mt-1 text-black space-y-2">
                    {membership.features.map((feature, fIdx) => (
                      <li key={fIdx}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="border rounded-sm h-[30px] w-[35px] flex items-center justify-center cursor-pointer">
                <BsThreeDotsVertical />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemberProfile;
