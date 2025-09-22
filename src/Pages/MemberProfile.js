import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { mockData } from "../DummyData/DummyData";
import ProfileDetails from "../components/memberprofile/ProfileDetails";
import ServiceCard from "../components/memberprofile/ServiceCard";
import OrderHistory from "../components/memberprofile/OrderHistory";
import Appointments from "../components/memberprofile/Appointments";
import Relations from "../components/memberprofile/Relations";
import AttendanceData from "../components/memberprofile/AttendanceData";
import WorkoutApp from "../components/memberprofile/WorkoutApp";
import PaymentHistory from "../components/memberprofile/PaymentHistory";
import KYCSubmission from "../components/memberprofile/KYCSubmission";
import { apiAxios } from "../config/config";
import { toast } from "react-toastify";
import HealthProfile from "../components/memberprofile/HealthProfile";
import { FiPlus } from "react-icons/fi";
import MemberCallLogs from "./MemberCallLogs";
import CoinsList from "../components/CoinsList/CoinsList";

const MemberProfile = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Profile Details");
  const [memberDetails, setMemberDetails] = useState([]);
  const member = memberDetails.find((m) => m.id === parseInt(id));
  const location = useLocation();
  const tabRefs = useRef({});

  const navigate = useNavigate();
  const tabs = [
    "Profile Details",
    "Service Card",
    "Order History",
    "Payment History",
    "Call Logs",
    "Appointments",
    "Referrals",
    "Attendance",
    "Training",
    "Kyc Submission",
    "Health Profile",
    "Coins",
  ];
  const fetchMemberList = async (search = "") => {
    try {
      const res = await apiAxios().get("/member/list", {
        params: search ? { search } : {},
      });
      let data = res.data?.data || res.data || [];
      setMemberDetails(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch member");
    }
  };

  useEffect(() => {
    fetchMemberList();
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const view = queryParams.get("view");
    if (view === "call-logs") {
      setActiveTab("Call Logs");
    }
  }, [location.search]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    tabRefs.current[tab]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    // Remove the `view` query parameter when switching tabs
    navigate(`/member/${id}`, { replace: true });
    setActiveTab(tab);
  };

  if (!member) return <p>Member not found</p>;

  return (
    <div className="page--content">
      <div className=" flex items-end justify-between gap-2 mb-0">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > Members > ${member?.full_name} Profile`}</p>
          <h1 className="text-3xl font-semibold">
            {member?.full_name} Profile
          </h1>
        </div>
      </div>
      <div className="flexs">
        {/* Sidebar */}
        <aside className="w-full">
          {/* <h1 className="text-3xl font-semibold">Member Profile</h1> */}
          <div className="mt-6 flex flex-wrap items-center ">
            <div className="mt-0 flex items-center border-b border-b-[#D4D4D4] overflow-auto buttons--overflow pr-6">
              {tabs.map((item, index) => (
                <div
                  key={item}
                  ref={(el) => (tabRefs.current[item] = el)}
                  onClick={() => handleTabClick(item)}
                  className={`w-fit min-w-[fit-content] cursor-pointer
                      ${activeTab === item ? "btn--tab" : ""}`}
                >
                  <div className="px-4 py-3 z-[1] relative text-[14px]">
                    {item}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}

        <div className="mt-4 ">
          {activeTab === "Profile Details" && (
            <ProfileDetails member={member} />
          )}
          {activeTab === "Kyc Submission" && <KYCSubmission member={member} />}
          {activeTab === "Service Card" && <ServiceCard member={member} />}
          {activeTab === "Order History" && <OrderHistory member={member} />}
          {activeTab === "Payment History" && (
            <PaymentHistory member={member} />
          )}
          {activeTab === "Call Logs" && <MemberCallLogs details={member} />}
          {activeTab === "Appointments" && <Appointments details={member} />}
          {activeTab === "Referrals" && <Relations details={member} />}
          {activeTab === "Attendance" && <AttendanceData details={member} />}
          {activeTab === "Training" && <WorkoutApp details={member} />}
          {activeTab === "Health Profile" && <HealthProfile details={member} />}
          {activeTab === "Coins" && <CoinsList details={member} />}
        </div>
      </div>
    </div>
  );
};

export default MemberProfile;
