import React, { useEffect, useMemo, useState } from "react";
import Coins from "../../assets/images/coins.svg";
import { FaCirclePlus } from "react-icons/fa6";
import DummyProfile from "../../assets/images/dummy-profile.png";
import { customStyles, formatText } from "../../Helper/helper";
import Select from "react-select";
import AddCoins from "../CoinsList/AddCoins";
import SuspendAndPause from "../common/SuspendAndPause";
import { authAxios } from "../../config/config";
import { toast } from "react-toastify";
import CreateNewInvoice from "../../Pages/CreateNewInvoice";
import MemberSendPaymentLink from "../../Pages/MemberSendPaymentLink";

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Expired" },
];

const statusMemberOptions = [
  { value: "UPCOMING", label: "Upcoming" },
  { value: "EXPIRED", label: "Expired" },
];

const tabs = ["Purchased Services", "Purchased Memberships"];

const ServiceCard = ({ details }) => {
  const clubId = details?.club_id;
  const [membershipData, setMembershipData] = useState([]);
  const [purchasedServicesCount, setPurchasedServicesCount] = useState(null);
  const [purchasedServices, setPurchasedServices] = useState([]);
  const [purchasedMembershipsCount, setPurchasedMembershipsCount] =
    useState(null);
  const [purchasedMemberships, setPurchasedMemberships] = useState([]);
  const [activeTab, setActiveTab] = useState("Purchased Services");

  const [renewPlanService, setRenewService] = useState(null);
  const [invoiceModal, setInvoiceModal] = useState(false);

  const [modalKey, setModalKey] = useState(0);
  const [renewPlanMembership, setRenewMembership] = useState(null);
  const [sendPaymentModal, setSendPaymentModal] = useState(false);

  // State to store selected status option, default is "active"
  const [selectedStatus, setSelectedStatus] = useState(statusOptions[0]);
  const [selectedMembershipStatus, setSelectedMembershipStatus] = useState(
    statusMemberOptions[0],
  );
  const [coinsModal, setCoinsModal] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedTrainerData, setSelectedTrainerData] = useState(null);

  const [suspendPauseModal, setSuspendPauseModal] = useState(false);
  const [membershipActionType, setMembershipActionType] = useState(null);
  const [trainerSelections, setTrainerSelections] = useState({});

  const fetchStaff = async (clubIdParam = null) => {
    try {
      const params = {};
      if (clubIdParam) params.club_id = clubIdParam;

      const res = await authAxios().get("/staff/list?role=TRAINER", { params });
      const data = res.data?.data || res?.data || [];
      setStaffList(data.filter((item) => item?.status === "ACTIVE"));
    } catch {
      toast.error("Failed to fetch staff");
    }
  };

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

  const fetchPurchasedMemberships = async () => {
    if (!details?.id) return;

    try {
      const params = {
        booking_status: selectedMembershipStatus?.value,
      };

      const res = await authAxios().get(
        `/member/subscription/booking/list/${details.id}`,
        { params },
      );

      const response = res?.data;

      if (!response) {
        setPurchasedMemberships([]);
        setPurchasedMembershipsCount(0);
        return;
      }

      setPurchasedMemberships(response?.data || []);
      setPurchasedMembershipsCount(response?.totalCount || 0);
    } catch (err) {
      console.error("Membership Fetch Error:", err);
      toast.error("Failed to fetch memberships");
      setPurchasedMemberships([]);
      setPurchasedMembershipsCount(0);
    }
  };

  // Fetch coins with filters applied
  const fetchPurchaseServices = async () => {
    try {
      const params = {};

      if (selectedStatus?.value) {
        params.package_status = selectedStatus.value;
      }

      const res = await authAxios().get(
        `/member/package/booking/list/${details?.id}`,
        { params },
      );

      const dataCount = res.data?.totalCount || null;
      const data = res.data?.data || [];

      console.log(data, "shivakar");

      setPurchasedServices(data);
      setPurchasedServicesCount(dataCount);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch services");
    }
  };

  const handleAssignTrainer = async (trainerId, packageBookingId) => {
    try {
      const payload = {
        trainer_id: trainerId,
        package_booking_id: packageBookingId,
      };

      await authAxios().put("/member/assign/trainer", payload);

      toast.success("Trainer assigned successfully");

      // ✅ clear select value after success
      setTrainerSelections((prev) => ({
        ...prev,
        [packageBookingId]: null,
      }));

      // Refresh purchased services list after update
      fetchPurchaseServices();
    } catch (error) {
      console.error(error);
      toast.error("Failed to assign trainer");
    }
  };

  useEffect(() => {
    if (details?.id) {
      fetchMemberServiceCard();
    }
  }, [details?.id]);

  useEffect(() => {
    if (!details?.id) return;

    if (activeTab === "Purchased Services") {
      fetchPurchaseServices();
    }
  }, [selectedStatus, activeTab, details?.id]);

  useEffect(() => {
    if (!details?.id) return;

    if (activeTab === "Purchased Memberships") {
      fetchPurchasedMemberships();
    }
  }, [selectedMembershipStatus, activeTab, details?.id]);

  useEffect(() => {
    // Fetch services and staff based on clubId if provided
    fetchStaff(clubId);
  }, [clubId]); // <-- dependency added

  const baseStaffOptions = useMemo(
    () =>
      staffList?.map((item) => ({
        label: item.name,
        value: item.id,
      })) || [],
    [staffList],
  );

  // This will be passed to AddCoins to update the list
  const handleUpdateCoins = () => {
    fetchMemberServiceCard(); // Refreshes the coins list
    fetchPurchaseServices();
  };

  const formatDate = (date) => {
    if (!date) return "";

    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleString("en-GB", { month: "short" });
    const year = d.getFullYear();

    return `${day} ${month}, ${year}`;
  };

  const formatDatePurchaseService = (dateString) => {
    if (!dateString) return { day: "", monthYear: "", weekday: "" };
    const date = new Date(dateString);
    return {
      day: String(date.getDate()).padStart(2, "0"),
      monthYear: date.toLocaleDateString("en-GB", {
        month: "short",
        year: "numeric",
      }),
      weekday: date.toLocaleDateString("en-GB", {
        weekday: "long",
      }),
    };
  };

  const formatDatePurchaseMembership = (dateString) => {
    if (!dateString) return { day: "", monthYear: "", weekday: "" };

    // ✅ Prevent timezone shifting issue
    const date = new Date(dateString + "T00:00:00");

    return {
      day: String(date.getDate()).padStart(2, "0"),
      monthYear: date.toLocaleDateString("en-GB", {
        month: "short",
        year: "numeric",
      }),
      weekday: date.toLocaleDateString("en-GB", {
        weekday: "long",
      }),
    };
  };

  const confirmAssignTrainer = (
    trainerId,
    trainerName,
    packageBookingId,
    hasTrainer,
  ) => {
    setSelectedTrainerData({
      trainerId,
      trainerName,
      packageBookingId,
      hasTrainer,
    });
    setConfirmModal(true);
  };

  const handleConfirmAssign = async () => {
    if (!selectedTrainerData) return;
    await handleAssignTrainer(
      selectedTrainerData.trainerId,
      selectedTrainerData.packageBookingId,
    );
    setConfirmModal(false);
    setSelectedTrainerData(null);
  };

  const handleCancelAssign = () => {
    if (selectedTrainerData?.packageBookingId) {
      setTrainerSelections((prev) => ({
        ...prev,
        [selectedTrainerData.packageBookingId]: null, // <-- clear select on NO
      }));
    }
    setConfirmModal(false);
    setSelectedTrainerData(null);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  console.log(purchasedServices, "asdfasdf");

  return (
    <>
      <div className="bg-white p-4 rounded-[10px] w-full box--shadow">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Membership Plan
              </h1>
              <p className="text-md text-[#6F6F6F] italic font-[300]">
                Relationship since:{" "}
                {formatDate(membershipData?.relationship_since)}
              </p>
            </div>
            <div
              className="flex items-center bg-white rounded-full px-2 py-1 border border-[#D4D4D4] border-[2px]"
              onClick={() => setCoinsModal(true)}
            >
              <img src={Coins} className="mr-1" />
              <span className="text-lg font-medium text-black mr-3">
                {membershipData?.earn_coins}
              </span>
              <FaCirclePlus className="text-black text-2xl cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Membership Card */}
        <div className={`grid grid-cols-4 gap-3 pb-3 mb-2`}>
          {/* <div className="grid grid-cols-4 gap-3 pb-5 mb-5"> */}
          <div className="bg-white rounded-lg shadow-sm border col-span-2">
            {/* Header with gradient */}
            <div className="bg--color p-2 py-3 rounded-t-lg">
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
                  <h3 className="text-lg font-bold text-gray-900 mb-0">
                    {formatDate(membershipData?.start_date)}
                  </h3>
                  <p className="text-md text-gray-500">Relationship since</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    className="px-3 py-2 bg-black text-white rounded flex items-center gap-2 border border-black text-sm"
                    onClick={() => {
                      setMembershipActionType("suspend");
                      setSuspendPauseModal(true);
                    }}
                  >
                    Cancel Membership
                  </button>
                  {/* <button
                    onClick={() => {
                      setMembershipActionType("pause");
                      setSuspendPauseModal(true);
                    }}
                    className="px-3 py-2 bg-white text-black rounded flex items-center gap-2 border border-black text-sm"
                  >
                    Pause Membership
                  </button> */}

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
                <p className="text-lg font-bold text-gray-900">
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
                <p className="text-lg font-bold text-gray-900">
                  {formatDate(membershipData?.end_date)}
                </p>
                {/* <p className="text-md text-[#6F6F6F]">
                  Next Billing Date: 16 Nov, 2025
                </p> */}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-1">
          {tabs.map((item, index) => (
            <div
              key={index}
              onClick={() => handleTabClick(item)}
              className={`w-fit min-w-[fit-content] cursor-pointer rounded-[5px] ${activeTab === item ? "bg--color text-white" : "bg-white text-black"}`}
            >
              <div className="px-3 py-2 z-[1] relative text-[14px]">{item}</div>
            </div>
          ))}
        </div>

        <div className="border p-3 rounded-[10px] mt-2">
          {/* Purchased Services */}
          {activeTab === "Purchased Services" && (
            <div className="bg-white rounded-lg">
              <div className="p-4 px-0 pt-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">
                    Total Services ({purchasedServicesCount})
                  </h2>
                  <Select
                    name="status"
                    value={selectedStatus} // Controlled value
                    options={statusOptions}
                    styles={customStyles}
                    className="!capitalize"
                    onChange={(selectedOption) =>
                      setSelectedStatus(selectedOption)
                    } // Update state on change
                  />
                </div>
              </div>
              {purchasedServices.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {purchasedServices.map((service) => {
                    const filteredStaffOptions = baseStaffOptions.filter(
                      (opt) => opt.value !== service?.assigned_staff_id,
                    );

                    return (
                      <div
                        key={service?.id}
                        className="border border-[#D4D4D4] rounded-lg overflow-hidden"
                      >
                        <div className="flex items-start justify-between bg-[#F1F1F1] p-4">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-1" />
                            <h3 className="font-medium text-gray-900">
                              {service?.package_name}
                            </h3>
                          </div>
                        </div>

                        <div className="flex gap-4 p-3 justify-between items-start">
                          <div className="space-y-2 w-full">
                            {service?.service_name === "RECOVERY" && (
                              <div>
                                <span className="text-sm text-black">
                                  Variation:
                                </span>
                                <span className="ml-2 text-sm text-[#6F6F6F]">
                                  {formatText(service?.package_variation_name)}
                                </span>
                              </div>
                            )}

                            <div>
                              <span className="text-sm text-black">
                                Sessions:
                              </span>
                              <span className="ml-2 text-sm text-[#6F6F6F]">
                                {service.no_of_sessions -
                                  service.available_no_of_sessions}
                                /{service?.no_of_sessions}
                              </span>
                            </div>

                            <div>
                              <span className="text-sm text-black">
                                Trainer Name:
                              </span>
                              <span className="ml-2 text-sm text-[#6F6F6F]">
                                {service?.assigned_staff_name || "--"}
                              </span>
                            </div>

                            <div className="w-fit min-w-[150px]">
                              <Select
                                options={filteredStaffOptions}
                                value={trainerSelections[service?.id] || null} // <-- controlled value
                                placeholder={
                                  service?.assigned_staff_name
                                    ? "Change trainer"
                                    : "Assign trainer"
                                }
                                onChange={(selectedOption) => {
                                  setTrainerSelections((prev) => ({
                                    ...prev,
                                    [service?.id]: selectedOption,
                                  }));

                                  confirmAssignTrainer(
                                    selectedOption.value,
                                    selectedOption.label,
                                    service?.id,
                                    !!service?.assigned_staff_name,
                                  );
                                }}
                                styles={{
                                  ...customStyles,
                                  menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 9999,
                                  }),
                                }}
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                isDisabled={
                                  service?.package_status !== "ACTIVE"
                                    ? true
                                    : false
                                }
                              />
                            </div>

                            {service?.package_status !== "ACTIVE" && (
                              <div>
                                <button
                                  className="px-3 py-2 bg-black text-white rounded flex items-center gap-2 border border-black text-sm"
                                  onClick={() => {
                                    setRenewService(service);
                                    setInvoiceModal(true);
                                  }}
                                >
                                  RENEW
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="rounded-lg bg--color p-[2px] w-full">
                            <div className="grid grid-cols-3 h-full rounded-lg bg-white overflow-hidden">
                              <div className="text-center border-r">
                                <p className="text-sm font-[500] text-black mb-1 border-b p-1 py-2">
                                  Countdown
                                </p>
                                <div className="p-1 py-2">
                                  <p className="text-xl font-bold text-gray-900 mb-1">
                                    {service?.remaining_days}
                                  </p>
                                  <p className="text-xs text-[#6F6F6F]">
                                    days remaining
                                  </p>
                                </div>
                              </div>

                              <div className="text-center border-r">
                                <p className="text-sm font-[500] text-black mb-1 border-b p-1 py-2">
                                  Start Date
                                </p>
                                <div className="p-1 py-2">
                                  {(() => {
                                    const { day, monthYear, weekday } =
                                      formatDatePurchaseService(
                                        service?.start_date,
                                      );
                                    return (
                                      <>
                                        <p className="text-xl font-bold text-gray-900 mb-1">
                                          {day}
                                        </p>
                                        <p className="text-xs text-[#6F6F6F]">
                                          {monthYear} {weekday}
                                        </p>
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>

                              <div className="text-center">
                                <p className="text-sm font-[500] text-black mb-1 border-b p-1 py-2">
                                  End Date
                                </p>
                                <div className="p-1 py-2">
                                  {(() => {
                                    const { day, monthYear, weekday } =
                                      formatDatePurchaseService(
                                        service?.end_date,
                                      );
                                    return (
                                      <>
                                        <p className="text-xl font-bold text-gray-900 mb-1">
                                          {day}
                                        </p>
                                        <p className="text-xs text-[#6F6F6F]">
                                          {monthYear} {weekday}
                                        </p>
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div>No purchased data</div>
              )}
            </div>
          )}
          {/* Purchased Memberships */}
          {activeTab === "Purchased Memberships" && (
            <div className="bg-white rounded-lg">
              <div className="p-4 px-0 pt-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">
                    Total Memberships ({purchasedMembershipsCount})
                  </h2>
                  <Select
                    name="status"
                    value={selectedMembershipStatus} // Controlled value
                    options={statusMemberOptions}
                    styles={customStyles}
                    className="!capitalize"
                    onChange={(selectedOption) =>
                      setSelectedMembershipStatus(selectedOption)
                    } // Update state on change
                  />
                </div>
              </div>

              {purchasedMemberships.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {purchasedMemberships.map((membership) => {
                    return (
                      <div
                        key={membership?.id}
                        className="border border-[#D4D4D4] rounded-lg overflow-hidden"
                      >
                        <div className="flex items-start justify-between bg-[#F1F1F1] p-4">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-1" />
                            <h3 className="font-medium text-gray-900">
                              {membership?.subscription_title}
                            </h3>
                          </div>
                        </div>

                        <div className="flex gap-4 p-4 justify-between items-start">
                          <div className="space-y-2 w-full">
                            <div>
                              <span className="text-sm text-black">
                                Duration:
                              </span>
                              <span className="ml-2 text-sm text-[#6F6F6F]">
                                {membership?.subscription_plan
                                  ? membership?.subscription_plan
                                  : "--"}
                              </span>
                            </div>

                            <div>
                              <span className="text-sm text-black">
                                Plan Type:
                              </span>
                              <span className="ml-2 text-sm text-[#6F6F6F]">
                                {membership?.plan_type}
                              </span>
                            </div>

                            {membership?.booking_status !== "UPCOMING" && (
                              <div>
                                <button
                                  className="px-3 py-2 bg-black text-white rounded flex items-center gap-2 border border-black text-sm"
                                  onClick={() => {
                                    setRenewMembership(membership);
                                    setModalKey((prev) => prev + 1); // ✅ always unique key
                                    setSendPaymentModal(true);
                                  }}
                                >
                                  RENEW
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="rounded-lg bg--color p-[2px] w-full">
                              <div className="grid grid-cols-3 h-full rounded-lg bg-white overflow-hidden">
                                <div className="text-center border-r">
                                  <p className="text-sm font-[500] text-black mb-1 border-b p-1 py-2">
                                    Countdown
                                  </p>
                                  <div className="p-1 py-2">
                                    <p className="text-xl font-bold text-gray-900 mb-1">
                                      {membership?.remaining_days}
                                    </p>
                                    <p className="text-xs text-[#6F6F6F]">
                                      days remaining
                                    </p>
                                  </div>
                                </div>

                                <div className="text-center border-r">
                                  <p className="text-sm font-[500] text-black mb-1 border-b p-1 py-2">
                                    Start Date
                                  </p>
                                  <div className="p-1 py-2">
                                    {(() => {
                                      const { day, monthYear, weekday } =
                                        formatDatePurchaseMembership(
                                          membership?.start_date,
                                        );
                                      return (
                                        <>
                                          <p className="text-xl font-bold text-gray-900 mb-1">
                                            {day}
                                          </p>
                                          <p className="text-xs text-[#6F6F6F]">
                                            {monthYear} {weekday}
                                          </p>
                                        </>
                                      );
                                    })()}
                                  </div>
                                </div>

                                <div className="text-center">
                                  <p className="text-sm font-[500] text-black mb-1 border-b p-1 py-2">
                                    End Date
                                  </p>
                                  <div className="p-1 py-2">
                                    {(() => {
                                      const { day, monthYear, weekday } =
                                        formatDatePurchaseMembership(
                                          membership?.end_date,
                                        );
                                      return (
                                        <>
                                          <p className="text-xl font-bold text-gray-900 mb-1">
                                            {day}
                                          </p>
                                          <p className="text-xs text-[#6F6F6F]">
                                            {monthYear} {weekday}
                                          </p>
                                        </>
                                      );
                                    })()}
                                  </div>
                                </div>
                              </div>
                            </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div>No memberships data</div>
              )}
            </div>
          )}
        </div>
      </div>

      {coinsModal && (
        <AddCoins
          setCoinsModal={setCoinsModal}
          handleUpdateCoins={handleUpdateCoins}
          details={details}
        />
      )}
      {suspendPauseModal && (
        <SuspendAndPause
          setSuspendPause={setSuspendPauseModal}
          actionType={membershipActionType} // ✅ pass action type
        />
      )}

      {invoiceModal && (
        <CreateNewInvoice
          setInvoiceModal={(val) => {
            setInvoiceModal(val);
            if (!val) setRenewService(null); // ✅ reset after close
          }}
          selectedLeadMember={details?.id}
          clubId={clubId}
          renewPlanService={renewPlanService}
        />
      )}

      {sendPaymentModal && (
        <MemberSendPaymentLink
          setSendPaymentModal={(val) => {
            setSendPaymentModal(val);
            if (!val) setRenewMembership(null);
          }}
          selectedLeadMember={details?.id}
          clubId={clubId}
          renewPlanMembership={renewPlanMembership}
          key={modalKey} // ✅ always forces full remount
        />
      )}

      {confirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg text-center max-w-sm w-full">
            <p className="mb-2 text-lg font-semibold">
              {selectedTrainerData?.hasTrainer
                ? "Change Trainer"
                : "Assign Trainer"}
            </p>
            <p className="mb-4 text-sm text-gray-600">
              {selectedTrainerData?.hasTrainer
                ? `Are you sure you want to change to ${selectedTrainerData?.trainerName}?`
                : `Are you sure you want to assign ${selectedTrainerData?.trainerName}?`}
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleConfirmAssign}
                className="bg-black text-white px-4 py-2 rounded w-full max-w-[100px]"
              >
                Yes
              </button>
              <button
                onClick={handleCancelAssign}
                className="bg-gray-300 text-black px-4 py-2 rounded w-full max-w-[100px]"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ServiceCard;
