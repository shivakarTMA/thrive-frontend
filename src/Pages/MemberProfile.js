import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GoPlusCircle } from "react-icons/go";
import { FiEdit2 } from "react-icons/fi";
import { membershipData, mockData } from "../DummyData/DummyData";
import ProfileDetails from "../components/memberprofile/ProfileDetails";
import { FaCrown } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import ServiceCard from "../components/memberprofile/ServiceCard";
import OrderHistory from "../components/memberprofile/OrderHistory";
import CreateCallLogs from "../components/CreateCallLogs";
import Appointments from "../components/memberprofile/Appointments";
import Relations from "../components/memberprofile/Relations";
import AttendanceData from "../components/memberprofile/AttendanceData";
import WorkoutApp from "../components/memberprofile/WorkoutApp";



const MemberProfile = () => {
  const { id } = useParams();
 
  //   const slider = scrollRef.current;

  //   const handleMouseDown = (e) => {
  //     isDragging.current = true;
  //     slider.classList.add("cursor-grabbing");
  //     startX.current = e.pageX - slider.offsetLeft;
  //     scrollLeft.current = slider.scrollLeft;
  //   };

  //   const handleMouseLeave = () => {
  //     isDragging.current = false;
  //     slider.classList.remove("cursor-grabbing");
  //   };

  //   const handleMouseUp = () => {
  //     isDragging.current = false;
  //     slider.classList.remove("cursor-grabbing");
  //   };

  //   const handleMouseMove = (e) => {
  //     if (!isDragging.current) return;
  //     e.preventDefault();
  //     const x = e.pageX - slider.offsetLeft;
  //     const walk = (x - startX.current) * 1.5; // scroll-fastness
  //     slider.scrollLeft = scrollLeft.current - walk;
  //   };

  //   slider.addEventListener("mousedown", handleMouseDown);
  //   slider.addEventListener("mouseleave", handleMouseLeave);
  //   slider.addEventListener("mouseup", handleMouseUp);
  //   slider.addEventListener("mousemove", handleMouseMove);

  //   return () => {
  //     slider.removeEventListener("mousedown", handleMouseDown);
  //     slider.removeEventListener("mouseleave", handleMouseLeave);
  //     slider.removeEventListener("mouseup", handleMouseUp);
  //     slider.removeEventListener("mousemove", handleMouseMove);
  //   };
  // }, []);

  const tabs = [
    "Profile Details",
    "Service Card",
    "Order History",
    "Payment History",
    "Call Logs",
    "Appointments",
    "Relations",
    // "Family Members",
    // "Store",
    // "Documents",
    "Attendance",
    // "Trial History",
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
           <h1 className="text-3xl font-semibold">Member Profile</h1>
        </div>
      </div>
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-full max-w-[250px]">
          {/* <h1 className="text-3xl font-semibold">Member Profile</h1> */}
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
          {/* <div className="flex items-center gap-2">
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
          </div> */}

          <div className="bg-secondarycolor p-4 rounded mt-6 ">
            {activeTab === "Profile Details" && (
              <ProfileDetails member={member} />
            )}
            {activeTab === "Service Card" && (
              <ServiceCard member={member} />
            )}
            {activeTab === "Order History" && (
              <OrderHistory member={member} />
            )}
            {activeTab === "Payment History" && (
              <OrderHistory member={member} />
            )}
            {activeTab === "Call Logs" && (
              <CreateCallLogs details={member} />
            )}
            {activeTab === "Appointments" && (
              <Appointments details={member} />
            )}
            {activeTab === "Relations" && (
              <Relations details={member} />
            )}
            {activeTab === "Attendance" && (
              <AttendanceData details={member} />
            )}
            {activeTab === "Training" && (
              <WorkoutApp details={member} />
            )}
          </div>

          {/* History */}
        </main>
      </div>
    </div>
  );
};

export default MemberProfile;
