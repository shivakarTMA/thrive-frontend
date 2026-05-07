import React, { useCallback, useEffect, useState } from "react";
import SalesSummary from "../components/common/SalesSummary";
import totalSalesIcon from "../assets/images/icons/rupee-box.png";
import renewalIcon from "../assets/images/icons/renewal.png";
import trialIcon from "../assets/images/icons/trial.png";
import eyeIcon from "../assets/images/icons/eye.svg";
import { FaCircle } from "react-icons/fa";
import { FaCalendarDays } from "react-icons/fa6";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  customStyles,
  filterActiveItems,
  formatIndianNumber,
} from "../Helper/helper";
import { addYears, format, subYears, addDays } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import SummaryDashboard from "../components/common/SummaryDashboard";
import { LiaAngleLeftSolid, LiaAngleRightSolid } from "react-icons/lia";
import { authAxios } from "../config/config";
import CalendarView from "../components/TrainerDashboardChild/CalendarView";
import { useSelector } from "react-redux";

const routeMap = {
  FollowUps: "/my-follow-ups",
  "Tour/Trials": "/reports/appointments/all-trial-appointments",
  Appointments: "/reports/all-bookings",
  Classes: "/group-class",
  MembershipExpiry: "/reports/operations-reports/membership-expiry-report",
  ServiceExpiry: "/reports/operations-reports/service-expiry-report",
  ClientBirthdays: "/birthday-report",
  ClientAnniversaries: "/anniversary-report",
};

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const FitnessManagerDashboard = () => {
  const days = [
    { label: "Yesterday", value: "yesterday" },
    { label: "Today", value: "today" },
    { label: "Tomorrow", value: "tomorrow" },
  ];
  const [dashboardData, setDashboardData] = useState([]);
  const [currentDayIndex, setCurrentDayIndex] = useState(1); // Default to Today
  const [activeTab, setActiveTab] = useState("Snapshot");
  const [dateFilter, setDateFilter] = useState(dateFilterOptions[0]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);
  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);

  // Summary Data
  const [summaryData, setSummaryData] = useState({});

  // Class Performance
  const [classPerformance, setClassPerformance] = useState([]);

  const { user } = useSelector((state) => state.auth);
  const [profileData, setUserClubs] = useState("");
  const [hasProductServices, setHasProductServices] = useState(false);
  // const [hasRecoveryServices, setHasRecoveryServices] = useState(false);
  
  useEffect(() => {
    if (!user?.id) return;

    const fetchStaffById = async (id) => {
      try {
        const res = await authAxios().get(`/staff/${id}`);
        const data = res.data?.data || res.data || null;

        if (data) {
          setUserClubs(data?.staff_clubs);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchStaffById(user?.id);
  }, [user?.id]);

  // Function to fetch services
  const fetchServices = async () => {
    try {
      if (!profileData?.length) return;

      const productRequests = profileData.map((club) =>
        authAxios().get("/service/list", {
          params: { type: "PRODUCT", club_id: club.club_id },
        }),
      );

      const recoveryRequests = profileData.map((club) =>
        authAxios().get("/service/list", {
          params: { type: "RECOVERY", club_id: club.club_id },
        }),
      );

      const [productResponses, recoveryResponses] = await Promise.all([
        Promise.all(productRequests),
        Promise.all(recoveryRequests),
      ]);

      // ✅ Check PRODUCT
      const hasProduct = productResponses.some((res) => {
        const data = res.data?.data || res.data || [];
        return data.length > 0;
      });

      // ✅ Check RECOVERY
      const hasRecovery = recoveryResponses.some((res) => {
        const data = res.data?.data || res.data || [];
        return data.length > 0;
      });

      setHasProductServices(hasProduct);
      // setHasRecoveryServices(hasRecovery);
    } catch (err) {
      console.error(err);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchServices();
  }, [profileData]);

  const fetchClassPerformanceData = async () => {
    try {
      const params = {};
      // Date filter (non-custom)
      if (dateFilter?.value && dateFilter.value !== "custom") {
        params.dateFilter = dateFilter.value;
      }

      // Custom date filter
      if (dateFilter?.value === "custom" && customFrom && customTo) {
        params.startDate = format(customFrom, "yyyy-MM-dd");
        params.endDate = format(customTo, "yyyy-MM-dd");
      }

      // Club filter
      if (clubFilter?.value) {
        params.club_id = clubFilter.value;
      }

      const res = await authAxios().get(
        "/dashboard/class/performances/overview",
        { params },
      );
      const overview = res.data?.data?.overview;

      if (!overview) {
        setClassPerformance([]);
        return;
      }

      // 🔥 Transform object → array
      const formattedData = [
        {
          id: 1,
          classType: "Group Classes",
          scheduled: overview.group_classes?.scheduled || 0,
          active: overview.group_classes?.active || 0,
          canceled: overview.group_classes?.canceled || 0,
          url: "/group-class",
        },
        {
          id: 2,
          classType: "Sessions",
          scheduled: overview.sessions?.scheduled || 0,
          active: overview.sessions?.active || 0,
          canceled: overview.sessions?.canceled || 0,
          url: "/reports/all-bookings",
        },
      ];

      setClassPerformance(formattedData);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSummaryReport = useCallback(async () => {
    try {
      const params = {
        dateFilter: days[currentDayIndex].value, // today/yesterday/tomorrow
      };

      if (clubFilter?.value) {
        params.club_id = clubFilter.value;
      }

      const response = await authAxios().get("/dashboard/summary/report", {
        params,
      });

      const apiSummary = response.data?.data?.summary || {};

      // 🔥 Transform API response to match your UI format
      const formattedSummary = {
        FollowUps: `${apiSummary.follow_ups?.completed ?? 0}/${apiSummary.follow_ups?.total ?? 0}`,
        "Tour/Trials": `${apiSummary.tour_trials?.completed ?? 0}/${apiSummary.tour_trials?.total ?? 0}`,
        Appointments: `${apiSummary.appointments?.completed ?? 0}/${apiSummary.appointments?.total ?? 0}`,
        Classes: `${apiSummary.classes?.completed ?? 0}/${apiSummary.classes?.total ?? 0}`,
        MembershipExpiry: apiSummary.membership_expiry ?? 0,
        ServiceExpiry: apiSummary.service_expiry ?? 0,
        ClientBirthdays: apiSummary.client_birthdays ?? 0,
        ClientAnniversaries: apiSummary.client_anniversaries ?? 0,
      };

      setSummaryData(formattedSummary);
    } catch (error) {
      console.error("Failed to fetch summary report:", error);
    }
  }, [clubFilter, currentDayIndex]);

  const fetchDashboardData = async () => {
    try {
      const params = {};
      // Date filter (non-custom)
      if (dateFilter?.value && dateFilter.value !== "custom") {
        params.dateFilter = dateFilter.value;
      }

      // Custom date filter
      if (dateFilter?.value === "custom" && customFrom && customTo) {
        params.startDate = format(customFrom, "yyyy-MM-dd");
        params.endDate = format(customTo, "yyyy-MM-dd");
      }

      // Club filter
      if (clubFilter?.value) {
        params.club_id = clubFilter.value;
      }

      const res = await authAxios().get("/dashboard/overview", { params });
      let data = res.data?.data || res.data || [];

      setDashboardData(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Function to fetch club list
  const fetchClub = async () => {
    try {
      const response = await authAxios().get("/club/list");
      const data = response.data?.data || [];
      const activeOnly = filterActiveItems(data);
      setClubList(activeOnly);

      // if (activeOnly.length > 0) {
      //   setClubFilter({
      //     label: activeOnly[0].name,
      //     value: activeOnly[0].id,
      //   });
      // }
      if (!clubFilter && activeOnly.length > 0) {
        setClubFilter({
          label: activeOnly[0].name,
          value: activeOnly[0].id,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchClub();
  }, []);

  useEffect(() => {
    fetchSummaryReport();
  }, [fetchSummaryReport]);

  useEffect(() => {
    if (dateFilter?.value !== "custom" || (customFrom && customTo)) {
      fetchClassPerformanceData();
    }
  }, [dateFilter, customFrom, customTo, clubFilter]);

  useEffect(() => {
    if (dateFilter?.value !== "custom" || (customFrom && customTo)) {
      fetchDashboardData();
    }
  }, [dateFilter, customFrom, customTo, clubFilter]);

  const clubOptions = clubList.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  const selectedClub = clubOptions.find(
    (option) => option.value === clubFilter?.value,
  );

  // Handler to move to previous day
  const handlePrevious = () => {
    if (currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1);
    }
  };

  // Handler to move to next day
  const handleNext = () => {
    if (currentDayIndex < days.length - 1) {
      setCurrentDayIndex(currentDayIndex + 1);
    }
  };

  const currentDay = days[currentDayIndex].label;
  const currentData = summaryData;

  // Memoize the URL generation
  const generateUrl = useCallback(
    (baseUrl) => {
      const params = new URLSearchParams();

      // Club filter
      if (clubFilter?.value) {
        params.append("club_id", clubFilter.value);
      }

      // Date filter (non-custom)
      if (dateFilter?.value && dateFilter.value !== "custom") {
        params.append("dateFilter", dateFilter.value);
      }

      // Custom date filter
      if (dateFilter?.value === "custom" && customFrom && customTo) {
        params.append("startDate", format(customFrom, "yyyy-MM-dd"));
        params.append("endDate", format(customTo, "yyyy-MM-dd"));
      }

      const separator = baseUrl.includes("?") ? "&" : "?";

      return params.toString()
        ? `${baseUrl}${separator}${params.toString()}`
        : baseUrl;
    },
    [clubFilter, dateFilter, customFrom, customTo],
  );

  const buildFilteredUrl = useCallback(
    (baseUrl) => {
      const params = new URLSearchParams();

      // Add club filter
      if (clubFilter?.value) {
        params.append("club_id", clubFilter.value);
      }

      const selectedDay = days[currentDayIndex].value;

      if (selectedDay === "today") {
        // Today → use dateFilter
        params.append("dateFilter", "today");
      } else {
        // Yesterday / Tomorrow → use startDate & endDate
        const offset = selectedDay === "yesterday" ? -1 : 1;
        const targetDate = addDays(new Date(), offset);
        const formattedDate = format(targetDate, "yyyy-MM-dd");

        params.append("startDate", formattedDate);
        params.append("endDate", formattedDate);
      }

      const separator = baseUrl.includes("?") ? "&" : "?";
      return `${baseUrl}${separator}${params.toString()}`;
    },
    [clubFilter, currentDayIndex],
  );

  return (
    <div className="page--content">
      <div className=" flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > Dashboard`}</p>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
        </div>
        <div className="flex gap-3 items-center justify-between">
          <div className="w-fit min-w-[180px]">
            <Select
              placeholder="Filter by club"
              value={selectedClub || null}
              options={clubOptions}
              onChange={(option) => setClubFilter(option)}
              // isClearable
              styles={customStyles}
            />
          </div>
        </div>
      </div>

      {/* end title */}

      <div className="w-full bg-white box--shadow rounded-[10px] px-2 py-2 flex gap-3 justify-between items-center mb-4">
        <div className="flex gap-3">
          <div
            // type="button"
            className={`px-4 py-2 rounded text-sm ${
              activeTab === "Snapshot" ? "bg--color text-white" : ""
            }`}
            onClick={() => setActiveTab("Snapshot")}
          >
            Snapshot
          </div>
          {/* <button
            type="button"
            className={`px-4 py-2 rounded ${
              activeTab === "Leaderboard" ? "bg--color text-white" : ""
            }`}
            onClick={() => setActiveTab("Leaderboard")}
          >
            Leaderboard
          </button> */}
        </div>
        <div className="flex items-center">
          <div className="w-fit flex items-center gap-2 border-r">
            <div className="text-sm font-medium text-gray-600 flex gap-2 items-center">
              <FaCircle className="text-[10px] text-[#009EB2]" /> Total New
              Member
            </div>
            <div className="pr-2">
              <span className="text-sm font-semibold">
                {dashboardData?.snapshot?.total_new_member}
              </span>
            </div>
          </div>
          <div className="w-fit flex items-center gap-2 border-r pl-2">
            <div className="text-sm font-medium text-gray-600 flex gap-2 items-center">
              <FaCircle className="text-[10px] text-[#1F9254]" />
              Total Renewal Member
            </div>
            <div className="pr-2">
              <span className="text-sm font-semibold">
                {dashboardData?.snapshot?.total_renewal_member}
              </span>
            </div>
          </div>
          <div className="w-fit flex items-center gap-2 border-r pl-2">
            <div className="text-sm font-medium text-gray-600 flex gap-2 items-center">
              <FaCircle className="text-[10px] text-[#ff9900]" />
              Total Returning Member
            </div>
            <div className="pr-2">
              <span className="text-sm font-semibold">
                {dashboardData?.snapshot?.total_returning_member}
              </span>
            </div>
          </div>
          <div className="w-fit flex items-center gap-2 pl-2">
            <div className="text-sm font-medium text-gray-600 flex gap-2 items-center">
              <FaCircle className="text-[10px] text-[#FF0000]" />
              Total Advanced Renewal Member
            </div>
            <div>
              <span className="text-sm font-semibold">
                {dashboardData?.snapshot?.total_advanced_renewal_member}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="w-[75%]">
          <div className="rounded-[15px] p-3 box--shadow bg-white">
            <div className="flex gap-2 w-full mb-4">
              <div className="max-w-[180px] w-full">
                <Select
                  placeholder="Date Filter"
                  options={dateFilterOptions}
                  value={dateFilter}
                  onChange={(selected) => {
                    setDateFilter(selected);
                    if (selected?.value !== "custom") {
                      setCustomFrom(null);
                      setCustomTo(null);
                    }
                  }}
                  // isClearable
                  styles={customStyles}
                  className="w-full"
                />
              </div>

              {dateFilter?.value === "custom" && (
                <>
                  <div className="custom--date dob-format flex-1 max-w-[180px] w-full">
                    <span className="absolute z-[1] mt-[11px] ml-[15px]">
                      <FaCalendarDays />
                    </span>
                    <DatePicker
                      selected={customFrom}
                      onChange={(date) => {
                        setCustomFrom(date);
                        setCustomTo(null); // ✅ reset To Date if From Date changes
                      }}
                      placeholderText="From Date"
                      className="custom--input w-full input--icon"
                      minDate={subYears(new Date(), 20)}
                      maxDate={addYears(new Date(), 0)}
                      dateFormat="dd-MM-yyyy"
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                    />
                  </div>
                  <div className="custom--date dob-format flex-1 max-w-[180px] w-full">
                    <span className="absolute z-[1] mt-[11px] ml-[15px]">
                      <FaCalendarDays />
                    </span>
                    <DatePicker
                      selected={customTo}
                      onChange={(date) => setCustomTo(date)}
                      placeholderText="To Date"
                      className="custom--input w-full input--icon"
                      minDate={customFrom || subYears(new Date(), 20)}
                      maxDate={addYears(new Date(), 0)}
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      dateFormat="dd-MM-yyyy"
                      disabled={!customFrom}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <SalesSummary
                icon={totalSalesIcon}
                title="Total Sales"
                titleLink={generateUrl(`/reports/all-orders?`)}
                totalSales={`₹${formatIndianNumber(
                  dashboardData?.summary_cards?.total_sales?.amount,
                )}`}
                items={[
                  {
                    label: "Memberships",
                    value: `₹${formatIndianNumber(
                      dashboardData?.summary_cards?.total_sales?.breakup
                        ?.memberships,
                    )}`,
                    link: generateUrl(
                      `/reports/all-orders?package_type=SUBSCRIPTION`,
                    ),
                  },
                  {
                    label: "Packages",
                    value: `₹${formatIndianNumber(
                      dashboardData?.summary_cards?.total_sales?.breakup
                        ?.packages,
                    )}`,
                    link: generateUrl(
                      `/reports/all-orders?package_type=PACKAGE`,
                    ),
                  },
                  // {
                  //   label: "Nourish",
                    // value: `₹${formatIndianNumber(
                    //   dashboardData?.summary_cards?.total_sales?.breakup
                    //     ?.products,
                    // )}`,
                    // link: generateUrl(
                    //   `/reports/all-orders?package_type=PRODUCT`,
                    // ),
                  // },
                  ...(hasProductServices
                  ? [
                      {
                        label: "Nourish",
                        value: `₹${formatIndianNumber(dashboardData?.summary_cards?.total_sales?.breakup?.products)}`,
                        link: generateUrl(
                          `/reports/all-orders?package_type=PRODUCT`,
                        ),
                      },
                    ]
                  : []),
                ]}
              />

              <SalesSummary
                icon={renewalIcon}
                title="Membership Sold"
                titleLink={generateUrl(`/reports/all-orders?package_type=SUBSCRIPTION`)}
                totalSales={dashboardData?.summary_cards?.total_members?.total_count}
                items={[
                  {
                    label: "New Clients",
                    value: dashboardData?.summary_cards?.total_members?.newMember,
                    link:generateUrl(`/reports/all-orders?bill_type=NEW&package_type=SUBSCRIPTION`)
                  },
                  {
                    label: "Renewals",
                    value: dashboardData?.summary_cards?.total_members?.renewalMember,
                    link:generateUrl(`/reports/all-orders?bill_type=RENEWAL&package_type=SUBSCRIPTION`)
                  },
                                    {
                    label: "Advanced renewal",
                    value: dashboardData?.summary_cards?.total_members?.advanceRenewalMember,
                    link:generateUrl(`/reports/all-orders?bill_type=ADVANCED_RENEWAL&package_type=SUBSCRIPTION`)
                  },
                  {
                    label: "Returning User",
                    value: dashboardData?.summary_cards?.total_members?.returningMember,
                    link:generateUrl(`/reports/all-orders?bill_type=RETURNING&package_type=SUBSCRIPTION`)
                  },
                ]}
              />

              <SalesSummary
                icon={trialIcon}
                title="Trials"
                titleLink={generateUrl(
                  `/reports/appointments/all-trial-appointments?`,
                )}
                totalSales={dashboardData?.summary_cards?.trials?.total}
                items={[
                  {
                    label: "Scheduled",
                    value: dashboardData?.summary_cards?.trials?.scheduled,
                    link: generateUrl(
                      `/reports/appointments/all-trial-appointments?`,
                    ),
                  },
                  {
                    label: "Completed",
                    value: dashboardData?.summary_cards?.trials?.completed,
                    link: generateUrl(
                      `/reports/appointments/all-trial-appointments?booking_status=COMPLETED`,
                    ),
                  },
                  {
                    label: "No-Show",
                    value: dashboardData?.summary_cards?.trials?.no_show,
                    link: generateUrl(
                      `/reports/appointments/all-trial-appointments?booking_status=NO_SHOW`,
                    ),
                  },
                ]}
              />
            </div>

            <div className="border border-[#D4D4D4] rounded-[5px] bg-white p-3 pb-1 w-full relative mt-3">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold">Class Performances Overview</h2>
              </div>
              <div className="relative overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-[#F1F1F1]">
                    <tr>
                      <th className="p-2">Class Type</th>
                      <th className="p-2">Scheduled</th>
                      <th className="p-2">Bookings</th>
                      <th className="p-2">Cancellations</th>
                      <th className="p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classPerformance.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="p-2">{item?.classType}</td>

                        {/* Scheduled */}
                        <td className="p-2">{item?.scheduled}</td>

                        {/* Bookings (Active) */}
                        <td className="p-2">{item?.active}</td>

                        {/* Cancellations */}
                        <td className="p-2">{item?.canceled}</td>

                        <td className="p-2">
                          <Link
                            to={generateUrl(item?.url)}
                            className="bg-[#F1F1F1] border border-[#D4D4D4] rounded-[5px] w-[32px] h-[32px] flex items-center justify-center cursor-pointer"
                          >
                            <img src={eyeIcon} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Calender View */}
          <CalendarView clubId={clubFilter?.value} />
          {/* Calender View end */}
        </div>

        <div className="w-[25%]">
          <div className="rounded-[15px] p-3 box--shadow bg-white">
            <div>
              <p className="text-lg font-[600] mb-3 text-center">Summary </p>
              <div className="flex justify-between gap-3 items-center rounded-full bg-[#F1F1F1] px-3 py-2">
                <button
                  onClick={handlePrevious}
                  disabled={currentDayIndex === 0}
                  className={`${
                    currentDayIndex === 0 ? "opacity-0 invisible" : ""
                  }`}
                >
                  <LiaAngleLeftSolid />
                </button>
                <span>{currentDay}</span>
                <button
                  onClick={handleNext}
                  disabled={currentDayIndex === days.length - 1}
                  className={`${
                    currentDayIndex === days.length - 1
                      ? "opacity-0 invisible"
                      : ""
                  }`}
                >
                  <LiaAngleRightSolid />
                </button>
              </div>
              <SummaryDashboard
                data={currentData}
                routeMap={routeMap}
                generateUrl={buildFilteredUrl}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FitnessManagerDashboard;
