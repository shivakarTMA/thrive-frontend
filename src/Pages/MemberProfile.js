import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { mockData } from "../DummyData/DummyData";
import ProfileDetails from "../components/memberprofile/ProfileDetails";
import ServiceCard from "../components/memberprofile/ServiceCard";
import OrderHistory from "../components/memberprofile/OrderHistory";
import Appointments from "../components/memberprofile/Appointments";
import Relations from "../components/memberprofile/Relations";
import AttendanceData from "../components/memberprofile/AttendanceData";
import WorkoutApp from "../components/memberprofile/WorkoutApp";
import PaymentHistory from "../components/memberprofile/PaymentHistory";
import KycForm from "../components/memberprofile/KycForm";

const MemberProfile = () => {
  const { id } = useParams();

  const tabs = [
    "Profile Details",
    "Service Card",
    "Order History",
    "Payment History",
    // "Call Logs",
    "Appointments",
    "Referrals",
    "Attendance",
    "Training",
    "Kyc Submission",
  ];
  const [activeTab, setActiveTab] = useState("Profile Details");
  const member = mockData.find((m) => m.id === parseInt(id));

  if (!member) return <p>Member not found</p>;

  console.log(member,'member')

  return (
    <div className="page--content">
      <div className=" flex items-end justify-between gap-2 mb-0">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > Members > ${member?.name} Profile`}</p>
          <h1 className="text-3xl font-semibold">{member?.name} Profile</h1>
        </div>
      </div>
      <div className="flexs">
        {/* Sidebar */}
        <aside className="w-full">
          {/* <h1 className="text-3xl font-semibold">Member Profile</h1> */}
          <div className="mt-6 flex flex-wrap items-center">
            <div className="mt-6 flex flex-wrap items-center">
              {tabs.map((item, index) => (
                <React.Fragment key={item}>
                  <div
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

                  {item === "Payment History" && (
                    <Link
                      to={`/member-follow-up/${member.id}`}
                      className="px-3 py-1.5 rounded hover:text-primarycolor transition"
                    >
                      Call Logs
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}

        <div className="bg-secondarycolor p-4 rounded mt-4 ">
          {activeTab === "Profile Details" && (
            <ProfileDetails member={member} />
          )}
          {activeTab === "Kyc Submission" && <KycForm member={member} />}
          {activeTab === "Service Card" && <ServiceCard member={member} />}
          {activeTab === "Order History" && <OrderHistory member={member} />}
          {activeTab === "Payment History" && (
            <PaymentHistory member={member} />
          )}
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
