import React, { useEffect, useState } from "react";
import { HiChevronDown } from "react-icons/hi2";
import Coins from "../../assets/images/coins.svg";
import { FaCirclePlus } from "react-icons/fa6";
import DummyProfile from "../../assets/images/dummy-profile.png";
import { customStyles } from "../../Helper/helper";
import Select from "react-select";
import RenewUpgradeService from "../../Pages/RenewUpgradeService";
import AddCoins from "../CoinsList/AddCoins";
import CreateMemberAppointment from "../Appointment/CreateMemberAppointment";
import SuspendAndPause from "../common/SuspendAndPause";
import { authAxios } from "../../config/config";
import { toast } from "react-toastify";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
];

const ServiceCard = ({ details }) => {
  console.log(details, "details");

  const [membershipData, setMembershipData] = useState([]);

  // const membershipData = {
  //   membershipId: "TL317432",
  //   relationshipSince: "19 Apr, 2024",
  //   planStarted: "15 Jun, 2025",
  //   expiryDate: "15 Nov, 2025",
  //   nextBillingDate: "16 Nov, 2025",
  //   daysRemaining: 120,
  //   duration: "6 months",
  //   status: "Active",
  //   coins: 250,
  // };

  const purchasedServices = [
    {
      id: 1,
      name: "Membership",
      variation: "Personal Training",
      duration: "3 months",
      sessions: "10/12",
      lastVisited: "24 Aug, 2025",
      status: "expired",
      startDate: {
        day: 15,
        month: "Jul, 2025",
        dayName: "Tuesday",
      },
      endDate: {
        day: 15,
        month: "Oct, 2025",
        dayName: "Wednesday",
      },
      countdown: 0,
    },
    {
      id: 2,
      name: "Beginner's Strength",
      variation: "Personal Training",
      duration: "3 months",
      sessions: "10/12",
      lastVisited: "24 Aug, 2025",
      status: "active",
      startDate: {
        day: 15,
        month: "Jul, 2025",
        dayName: "Tuesday",
      },
      endDate: {
        day: 15,
        month: "Oct, 2025",
        dayName: "Wednesday",
      },
      countdown: 30,
    },
  ];

  // State to store selected status option, default is "active"
  const [selectedStatus, setSelectedStatus] = useState(statusOptions[0]);
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [coinsList, setCoinsList] = useState([]);
  const [coinsModal, setCoinsModal] = useState(false);
  const [appointmentModal, setAppointmentModal] = useState(false);

  const [upgradePlan, setUpgradePlan] = useState(null);
  const [renewPlan, setRenewPlan] = useState(null);

  const [suspendPauseModal, setSuspendPauseModal] = useState(false);
  const [membershipActionType, setMembershipActionType] = useState(null);

  // Filter purchased services based on selected status
  const filteredServices = purchasedServices.filter(
    (service) => service.status === selectedStatus.value
  );

  // Fetch coins with filters applied
  const fetchMemberServiceCard = async () => {
    try {
      // Make the API call with query parameters
      const res = await authAxios().get(`/member/service/card/${details?.id}`);
      const data = res.data?.data || [];
      setMembershipData(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch coins");
    }
  };

  useEffect(() => {
    fetchMemberServiceCard();
  }, []);

  // This will be passed to AddCoins to update the list
  const handleUpdateCoins = () => {
    fetchMemberServiceCard(); // Refreshes the coins list
  };

  const formatDate = (date) => {
    if (!date) return "";

    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleString("en-GB", { month: "short" });
    const year = d.getFullYear();

    return `${day} ${month}, ${year}`;
  };

  return (
    <>
      <div className="bg-white p-4 rounded-[10px] w-full box--shadow">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Membership Plan
              </h1>
              <p className="text-lg text-[#6F6F6F] italic font-[300]">
                Relationship since:{" "}
                {formatDate(membershipData?.relationship_since)}
              </p>
            </div>
            <div
              className="flex items-center bg-white rounded-full px-2 py-1 border border-[#D4D4D4] border-[2px]"
              onClick={() => setCoinsModal(true)}
            >
              <img src={Coins} className="mr-1" />
              <span className="text-xl font-medium text-black mr-3">
                {membershipData?.earn_coins}
              </span>
              <FaCirclePlus className="text-black text-2xl cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Membership Card */}
        <div className="grid grid-cols-4 gap-3 border-b border-b-[#D4D4D4] pb-5 mb-5">
          {/* <div className="grid grid-cols-4 gap-3 pb-5 mb-5"> */}
          <div className="bg-white rounded-lg shadow-sm border col-span-2">
            {/* Header with gradient */}
            <div className="bg--color p-4 py-3 rounded-t-lg">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white rounded-full mr-3 flex items-center justify-center overflow-hidden">
                    <img
                      src={membershipData?.profile_pic || DummyProfile}
                      className="object-cover object-center h-full w-full"
                    />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      Membership ID: {membershipData.membership_number}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="rounded-full text-white border border-white px-3 py-1 text-sm">
                    {membershipData?.membership_duration}
                  </span>
                  <div className="bg-[#E3F2E8] rounded-full text-white border border-[#E3F2E8] px-3 py-1 text-sm flex gap-1 items-center">
                    <div className="w-3 h-3 bg-[#498366] rounded-full mr-1"></div>
                    <span className="text-[#498366]">
                      {membershipData?.booking_status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Plan Started */}
              <div className="flex items-end gap-2 justify-between flex-wrap">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {formatDate(membershipData?.start_date)}
                  </h3>
                  <p className="text-sm text-gray-500">Relationship since</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    className="px-4 py-2 bg-black text-white rounded flex items-center gap-2 border border-black text-sm"
                    onClick={() => {
                      setMembershipActionType("suspend");
                      setSuspendPauseModal(true);
                    }}
                  >
                    Suspend Membership
                  </button>
                  <button
                    onClick={() => {
                      setMembershipActionType("pause");
                      setSuspendPauseModal(true);
                    }}
                    className="px-3 py-2 bg-white text-black rounded flex items-center gap-2 border border-black text-sm"
                  >
                    Pause Membership
                  </button>

                  {/* <button
                    className="px-4 py-2 bg-black text-white rounded flex items-center gap-2 border border-black text-sm"
                    onClick={() => {
                      setUpgradePlan(membershipData.membershipId);
                      setInvoiceModal(true);
                    }}
                  >
                    UPGRADE PLAN
                  </button> */}
                </div>
              </div>
            </div>
          </div>

          {/* Countdown */}
          <div className=" rounded-lg bg--color p-[2px]">
            <div className="bg-white rounded-lg h-full flex flex-col justify-between gap-2 p-4">
              <p className="text-lg text-black font-[500]">Countdown</p>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {membershipData?.countdown}
                </p>
                <p className="text-md text-[#6F6F6F]">
                  Number of days remaining
                </p>
              </div>
            </div>
          </div>

          {/* Expiry */}
          <div className=" rounded-lg bg--color p-[2px]">
            <div className="bg-white rounded-lg h-full flex flex-col justify-between gap-2 p-4">
              <p className="text-lg text-black font-[500]">Expiry On</p>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatDate(membershipData?.end_date)}
                </p>
                {/* <p className="text-md text-[#6F6F6F]">
                  Next Billing Date: 16 Nov, 2025
                </p> */}
              </div>
            </div>
          </div>
        </div>

        {/* Purchased Services */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 px-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Purchased Services (0{filteredServices.length})
              </h2>
              <Select
                name="status"
                value={selectedStatus} // Controlled value
                options={statusOptions}
                styles={customStyles}
                className="!capitalize"
                onChange={(selectedOption) => setSelectedStatus(selectedOption)} // Update state on change
              />
            </div>
          </div>

          <div className="divide-y">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="border border-[#D4D4D4] rounded-lg overflow-hidden mb-3"
              >
                <div className="flex items-start justify-between bg-[#F1F1F1] p-4">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-1"></div>
                    <h3 className="font-medium text-gray-900">
                      {service.name}
                    </h3>
                  </div>
                  <p className="text-sm text-[#6F6F6F] italic">
                    Last visited on: {service.lastVisited}
                  </p>
                </div>

                <div className="flex gap-4 p-4 justify-between">
                  <div className="space-y-1">
                    <div>
                      <span className="text-sm text-black">Variation:</span>
                      <span className="ml-2 text-sm text-[#6F6F6F]">
                        {service.variation}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-black">Duration:</span>
                      <span className="ml-2 text-sm text-[#6F6F6F]">
                        {service.duration}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-black">Sessions:</span>
                      <span className="ml-2 text-sm text-[#6F6F6F]">
                        {service.sessions}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {service.status === "active" ? (
                        <>
                          <button
                            className="px-3 py-2 bg-white text-black rounded flex items-center gap-2 border border-black text-sm"
                            onClick={() => setAppointmentModal(true)}
                          >
                            Add Appontment
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="px-3 py-2 bg-black text-white rounded flex items-center gap-2 border border-black text-sm"
                            onClick={() => {
                              setRenewPlan(membershipData.membershipId);
                              setInvoiceModal(true);
                            }}
                          >
                            RENEW
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg bg--color p-[2px]">
                    <div className="flex gap-0 h-full rounded-lg bg-white overflow-hidden">
                      <div className="text-center border-r">
                        <p className="text-md font-[500] text-black mb-1 border-b p-3">
                          Countdown
                        </p>
                        <div className="p-2">
                          <p className="text-2xl font-bold text-gray-900 mb-1">
                            {service.countdown}
                          </p>
                          <p className="text-xs text-[#6F6F6F]">
                            days remaining
                          </p>
                        </div>
                      </div>

                      <div className="text-center border-r">
                        <p className="text-md font-[500] text-black mb-1 border-b p-3">
                          Start Date
                        </p>
                        <div className="p-2">
                          <p className="text-2xl font-bold text-gray-900 mb-1">
                            {service.startDate.day}
                          </p>
                          <p className="text-xs text-[#6F6F6F]">
                            {service.startDate.month}{" "}
                            {service.startDate.dayName}
                          </p>
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="text-md font-[500] text-black mb-1 border-b p-3">
                          End Date
                        </p>
                        <div className="p-2">
                          <p className="text-2xl font-bold text-gray-900 mb-1">
                            {service.endDate.day}
                          </p>
                          <p className="text-xs text-[#6F6F6F]">
                            {service.endDate.month} {service.endDate.dayName}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {invoiceModal && (
        <RenewUpgradeService
          setInvoiceModal={setInvoiceModal}
          upgradePlan={upgradePlan}
          renewPlan={renewPlan}
        />
      )}
      {coinsModal && (
        <AddCoins
          setCoinsModal={setCoinsModal}
          handleUpdateCoins={handleUpdateCoins}
          details={details}
        />
      )}
      {appointmentModal && (
        <CreateMemberAppointment
          setAppointmentModal={setAppointmentModal}
          memberID={details?.id}
        />
      )}
      {suspendPauseModal && (
        <SuspendAndPause
          setSuspendPause={setSuspendPauseModal}
          actionType={membershipActionType} // ✅ pass action type
        />
      )}
    </>
  );
};

export default ServiceCard;
