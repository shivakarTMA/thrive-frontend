import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { mockData } from "../DummyData/DummyData";
import ProfileDetails from "../components/memberprofile/ProfileDetails";
import ServiceCard from "../components/memberprofile/ServiceCard";
import OrderHistory from "../components/memberprofile/OrderHistory";
import CreateCallLogs from "../components/CreateCallLogs";
import Appointments from "../components/memberprofile/Appointments";
import Relations from "../components/memberprofile/Relations";
import AttendanceData from "../components/memberprofile/AttendanceData";
import WorkoutApp from "../components/memberprofile/WorkoutApp";
import PaymentHistory from "../components/memberprofile/PaymentHistory";

const MemberProfile = () => {
  const { id } = useParams();

  const tabs = [
    "Profile Details",
    "Service Card",
    "Order History",
    "Payment History",
    "Call Logs",
    "Appointments",
    "Referrals",
    // "Family Members",
    // "Store",
    // "Documents",
    "Attendance",
    // "Trial History",
    "Training",
  ];
  const [activeTab, setActiveTab] = useState("Profile Details");
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
      <div className="flexs">
        {/* Sidebar */}
        <aside className="w-full">
          {/* <h1 className="text-3xl font-semibold">Member Profile</h1> */}
          <div className="mt-6 flex flex-wrap items-center">
            {tabs.map((item) => (
              <div
                key={item}
                onClick={() => setActiveTab(item)}
                className={`px-3 py-1.5 rounded cursor-pointer transition 
                ${
                  activeTab === item
                    ? "bg-primarycolor text-white"
                    : "hover:text-primarycolor"
                }`}
              >
                {item}
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content */}

        <div className="bg-secondarycolor p-4 rounded mt-4 ">
          {activeTab === "Profile Details" && (
            <ProfileDetails member={member} />
          )}
          {activeTab === "Service Card" && <ServiceCard member={member} />}
          {activeTab === "Order History" && <OrderHistory member={member} />}
          {activeTab === "Payment History" && (
            <PaymentHistory member={member} />
          )}
          {activeTab === "Call Logs" && <CreateCallLogs details={member} />}
          {activeTab === "Appointments" && <Appointments details={member} />}
          {activeTab === "Referrals" && <Relations details={member} />}
          {activeTab === "Attendance" && <AttendanceData details={member} />}
          {activeTab === "Training" && <WorkoutApp details={member} />}
        </div>
      </div>
    </div>
  );
};

export default MemberProfile;
