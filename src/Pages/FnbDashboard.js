import React, { useCallback, useEffect, useState } from "react";
import SalesSummary from "../components/common/SalesSummary";
import totalSalesIcon from "../assets/images/icons/rupee-box.png";
import newClientIcon from "../assets/images/icons/clients.png";
import renewalIcon from "../assets/images/icons/renewal.png";
import enquiriesIcon from "../assets/images/icons/conversion.png";
import trialIcon from "../assets/images/icons/trial.png";
import checkInIcon from "../assets/images/icons/checkin.png";
import eyeIcon from "../assets/images/icons/eye.svg";
import PendingOrderTable from "../components/PendingOrderTable";
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
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import SummaryDashboard from "../components/common/SummaryDashboard";
import { LiaAngleLeftSolid, LiaAngleRightSolid } from "react-icons/lia";
import { authAxios } from "../config/config";
import { useSelector } from "react-redux";

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

Highcharts.setOptions({
  accessibility: {
    enabled: false,
  },
});

const FnbDashboard = () => {
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

  // Product Sold
  const [productSeries, setProductSeries] = useState([]);
  const [productCategories, setProductCategories] = useState([]);
  const [totalProductValue, setTotalProductValue] = useState(0);

  // Enquiry
  const [leadCategories, setLeadCategories] = useState([]);
  const [leadSeries, setLeadSeries] = useState([]);
  const [totalLeads, setTotalLeads] = useState(0);

  // Pending Orders
  const [orders, setOrders] = useState([]);

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



  const fetchPendingOrdersData = async () => {
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
        "/dashboard/product/pending/order/list?fulfilment_status=PLACED",
        { params },
      );
      let data = res.data?.data || res.data || [];

      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

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
      if (!clubFilter && activeOnly.length > 0) {
        setClubFilter({
          label: activeOnly[0].name,
          value: activeOnly[0].id,
        });
      }
    } catch (error) {
      console.log(error)
    }
  };

  useEffect(() => {
    fetchClub();
  }, []);


  useEffect(() => {
    if (dateFilter?.value !== "custom" || (customFrom && customTo)) {
      fetchPendingOrdersData();
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



  // End Product Sold Chart

  const currentDay = days[currentDayIndex].label;

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


      <div className="flex gap-3">
        <div className="w-[100%]">
          <div className="flex gap-2 justify-between items-end">
            <div className="flex gap-2 flex-1">
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

            <div className="rounded-[10px] p-3 w-fit box--shadow bg-white">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold">Total Sales: <Link to={generateUrl(`/reports/all-orders?package_type=PRODUCT`)}>₹{formatIndianNumber(dashboardData?.summary_cards?.total_sales?.breakup?.products)}</Link></h2>
              </div>
            </div>
          </div>

          {/* <div className="grid grid-cols-3 gap-3">
            <SalesSummary
              icon={totalSalesIcon}
              title="Total Sales"
              titleLink={generateUrl(`/reports/all-orders?`)}
              totalSales={`₹${formatIndianNumber(
                dashboardData?.summary_cards?.total_sales?.breakup?.products
              )}`}
              items={[

                ...(hasProductServices
                  ? [
                      {
                        label: "Nourish",
                        value: `₹${formatIndianNumber(
                          dashboardData?.summary_cards?.total_sales?.breakup?.products
                        )}`,
                        link: generateUrl(`/reports/all-orders?package_type=PRODUCT`),
                      },
                    ]
                  : []),
              ]}
            />

            <SalesSummary
              icon={newClientIcon}
              title="New Sales"
              titleLink={generateUrl(`/reports/all-orders?bill_type=NEW`)}
              totalSales={dashboardData?.summary_cards?.new_clients?.breakup?.products}
              items={[
                ...(hasProductServices
                  ? [
                      {
                        label: "Nourish",
                        value: dashboardData?.summary_cards?.new_clients?.breakup?.products,
                        link: generateUrl(
                          `/reports/all-orders?bill_type=NEW&package_type=PRODUCT`,
                        ),
                      },
                    ]
                  : []),
              ]}
            />
            <SalesSummary
              icon={renewalIcon}
              title="Renewal"
              titleLink={generateUrl(`/reports/all-orders?bill_type=RENEWAL`)}
              totalSales={dashboardData?.summary_cards?.renewals?.breakup?.products}
              items={[
                ...(hasProductServices
                  ? [
                      {
                        label: "Nourish",
                        value: dashboardData?.summary_cards?.renewals?.breakup?.products,
                        link: generateUrl(
                          `/reports/all-orders?bill_type=RENEWAL&package_type=PRODUCT`,
                        ),
                      },
                    ]
                  : []),
              ]}
            /> 
          </div> */}
        </div>
      </div>

      <div className="rounded-[15px] p-3 w-full mt-2 box--shadow bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">Pending Orders</h2>
          <a
            href={generateUrl(`/nourish-orders?`)}
            className="text-[#009EB2] underline text-sm"
          >
            View All
          </a>
        </div>
        <PendingOrderTable
          setOrders={setOrders}
          orders={orders}
          fetchOrders={fetchPendingOrdersData}
        />
      </div>
    </div>
  );
};

export default FnbDashboard;
