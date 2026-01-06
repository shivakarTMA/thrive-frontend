import React, { useEffect, useState } from "react";
import { AiOutlineHome, AiOutlineProduct } from "react-icons/ai";
import { FiUsers, FiUserPlus } from "react-icons/fi";
import { FaAngleDown, FaCircle, FaRegBuilding } from "react-icons/fa6";
import { Link, useLocation } from "react-router-dom";
import { PiBowlFood, PiChartPieSlice, PiUserList } from "react-icons/pi";
import { SlCalender } from "react-icons/sl";
import {
  IoBarChartOutline,
  IoDocumentTextOutline,
  IoSettingsOutline,
} from "react-icons/io5";
import { GoTools } from "react-icons/go";
import { LuList } from "react-icons/lu";
import { CgGym } from "react-icons/cg";
import { useSelector } from "react-redux";
import { TbGymnastics } from "react-icons/tb";
import { FaLayerGroup } from "react-icons/fa";
import TopLogo from "../../assets/images/DLF-Thrive-New-Logo-1-White.png";
import { HiTemplate } from "react-icons/hi";
import { TfiAnnouncement } from "react-icons/tfi";
import { MdOutlineDashboardCustomize } from "react-icons/md";

const Sidebar = ({ toggleMenuBar, setToggleMenuBar, setLeadModal }) => {
  const location = useLocation();
  const { accessToken } = useSelector((state) => state.auth);
  const userType = useSelector((state) => state.auth?.user?.role);

  const [dropdownToggles, setDropdownToggles] = useState({});

  const [reportsOpen, setReportsOpen] = useState(false);
  const [salesReportsOpen, setSalesReportsOpen] = useState(false);
  const [financeReportsOpen, setFinanceReportsOpen] = useState(false);
  const [operationsReportsOpen, setOperationsReportsOpen] = useState(false);

  const toggleReports = () => setReportsOpen(!reportsOpen);
  const toggleSalesReports = () => setSalesReportsOpen(!salesReportsOpen);
  const toggleFinanceReports = () => setFinanceReportsOpen(!financeReportsOpen);
  const toggleOperationsReports = () =>
    setOperationsReportsOpen(!operationsReportsOpen);

  const toggleMenu = (menuKey) => {
    setDropdownToggles((prev) => {
      const newState = {};

      // If the same menu is clicked, toggle it; otherwise, open the new one only
      if (!prev[menuKey]) {
        newState[menuKey] = true;
      }

      return newState;
    });

    setToggleMenuBar(false);
  };

  useEffect(() => {
    if (toggleMenuBar) {
      setDropdownToggles({});
    }
  }, [toggleMenuBar]);

  // useEffect(() => {
  //   setToggleMenuBar(false);
  //   setDropdownToggles({});
  // }, [location.pathname]);

  // const handleLeadModal = () => {
  //   setLeadModal(true);
  // };

  return (
    <div className={`sidebar ${toggleMenuBar ? "activetoggle" : ""}`}>
      <div className="sidebar-logo d-flex align-items-center">
        <Link to="/">
          <img src={TopLogo} alt="logo" width="180px" height="50px" />
        </Link>
      </div>

      <div className="mt-5 px-3 sidebar--menu--list">
        <p className="text-white text-uppercase menu--head mb-5">Overview</p>
        <Link
          to="/"
          className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
        >
          <AiOutlineHome className="menu--icon" />
          <span className="nav-text">Dashboard</span>
        </Link>

        <p className="text-white mt-5 text-uppercase menu--head mb-5">
          General settings
        </p>

        {accessToken && userType === "ADMIN" && (
          <>
            <div
              className="nav-link d-flex justify-between align-items-center mb-2"
              onClick={() => toggleMenu("otherclubs")}
              style={{ cursor: "pointer" }}
            >
              <div className="flex items-center">
                <MdOutlineDashboardCustomize className="menu--icon" />
                <span className="nav-text">Other Dashboard</span>
              </div>
              <FaAngleDown
                className={`downmenu transition ${
                  dropdownToggles["otherclubs"] ? "rotate-[180deg]" : ""
                }`}
              />
            </div>

            {dropdownToggles["otherclubs"] && (
              <div className="mt-2 pl-5 relative">
                <div className="absolute h-[calc(100%-15px)] w-[2px] bg-white left-[23px] top-[8px]"></div>
                <Link
                  to="/club-manager"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">Club Manager</span>
                </Link>
                <Link
                  to="/trainer-dashboard"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">Trainer Dashboard</span>
                </Link>
                <Link
                  to="/foh-dashboard"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">FOH Dashboard</span>
                </Link>
                <Link
                  to="/marketing-manager/"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">Marketing Dashboard</span>
                </Link>
              </div>
            )}

            <Link
              to="/all-leads"
              className={`nav-link mb-2 ${
                location.pathname === "/all-leads" ? "active" : ""
              }`}
            >
              <IoBarChartOutline className="menu--icon" />
              <span className="nav-text">My Leads</span>
            </Link>

            <Link
              to="/all-members"
              className={`nav-link mb-2 ${
                location.pathname === "/all-members" ? "active" : ""
              }`}
            >
              <FiUsers className="menu--icon" />
              <span className="nav-text">All Members</span>
            </Link>

            <Link
              to="/workout-plans"
              className={`nav-link mb-2 ${
                location.pathname === "/workout-plans" ? "active" : ""
              }`}
            >
              <TbGymnastics className="menu--icon" />
              <span className="nav-text">Workout Plans</span>
            </Link>

            <Link
              to="/lost-found"
              className={`nav-link mb-2 ${
                location.pathname === "/lost-found" ? "active" : ""
              }`}
            >
              <GoTools className="menu--icon" />
              <span className="nav-text">Lost & Found</span>
            </Link>

            <div
              className="nav-link d-flex justify-between align-items-center mb-2"
              onClick={() => toggleMenu("marketing")}
              style={{ cursor: "pointer" }}
            >
              <div className="flex items-center">
                <TfiAnnouncement className="menu--icon" />
                <span className="nav-text">Marketing</span>
              </div>
              <FaAngleDown
                className={`downmenu transition ${
                  dropdownToggles["marketing"] ? "rotate-[180deg]" : ""
                }`}
              />
            </div>

            {dropdownToggles["marketing"] && (
              <div className="mt-2 pl-5 relative">
                <div className="absolute h-[calc(100%-15px)] w-[2px] bg-white left-[23px] top-[8px]"></div>
                <Link
                  to="/send-mail-list"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">Send Email</span>
                </Link>
                <Link
                  to="/reports/marketing-reports/send-sms-list"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">Send SMS</span>
                </Link>
                <Link
                  to="/reports/marketing-reports/send-notification"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">Send Notifications</span>
                </Link>
                <Link
                  to="/marketing-banner"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">App Banner</span>
                </Link>
                <Link
                  to="/coupons"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">Discount Coupons</span>
                </Link>
                <Link
                  to="/challenge-list"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">Challenges</span>
                </Link>
              </div>
            )}

            <div
              className="nav-link d-flex justify-between align-items-center mb-2"
              onClick={toggleReports}
              style={{ cursor: "pointer" }}
            >
              <div className="flex items-center">
                <IoDocumentTextOutline className="menu--icon" />
                <span className="nav-text">All Reports</span>
              </div>
              <FaAngleDown
                className={`downmenu transition ${
                  reportsOpen ? "rotate-[180deg]" : ""
                }`}
              />
            </div>

            {reportsOpen && (
              <div className="mt-2 pl-5 relative">
                <div className="absolute h-[calc(100%-15px)] w-[2px] bg-white left-[23px] top-[8px]"></div>

                {/* SALES REPORTS */}
                <div
                  className="text-white flex justify-between items-center cursor-pointer text-sm mb-2"
                  onClick={toggleSalesReports}
                >
                  <div className="flex gap-[5px] items-center cursor-pointer">
                    <FaCircle className="menu--icon !text-[10px]" />
                    <span className="nav-text">Sales Reports</span>
                  </div>
                  <FaAngleDown
                    className={`downmenu transition ${
                      salesReportsOpen ? "rotate-[180deg]" : ""
                    }`}
                  />
                </div>

                {salesReportsOpen && (
                  <div className="pl-[5px] flex flex-col gap-1 mb-3">
                    <Link
                      to="/reports/products-sold"
                      className="submenu-link text-white text-sm"
                    >
                      Products Sold
                    </Link>
                    <Link
                      to="/reports/sales-reports/new-joinees-report"
                      className="submenu-link text-white text-sm"
                    >
                      New Joinees Report
                    </Link>
                    <Link
                      to="/reports/sales-reports/all-enquiries-report"
                      className="submenu-link text-white text-sm"
                    >
                      All Enquiries Report
                    </Link>
                    <Link
                      to="/reports/appointments/all-appointments"
                      className="submenu-link text-white text-sm"
                    >
                      Appointments Report
                    </Link>
                    <Link
                      to="/reports/sales-reports/active-member-report"
                      className="submenu-link text-white text-sm"
                    >
                      Active Member Report
                    </Link>
                    <Link
                      to="/reports/sales-reports/pt-revenue-report"
                      className="submenu-link text-white text-sm"
                    >
                      PT Revenue Report
                    </Link>
                    <Link
                      to="/reports/sales-reports/lead-source-report/"
                      className="submenu-link text-white text-sm"
                    >
                      Lead Source Report
                    </Link>
                    <Link
                      to="/reports/sales-reports/group-classes-report/"
                      className="submenu-link text-white text-sm"
                    >
                      Group Classes Report
                    </Link>
                  </div>
                )}

                {/* FINANCE REPORTS */}
                <div
                  className="text-white flex justify-between items-center cursor-pointer text-sm mb-2"
                  onClick={toggleFinanceReports}
                >
                  <div className="flex gap-[5px] items-center cursor-pointer">
                    <FaCircle className="menu--icon !text-[10px]" />
                    <span className="nav-text">Finance Reports</span>
                  </div>
                  <FaAngleDown
                    className={`downmenu transition ${
                      financeReportsOpen ? "rotate-[180deg]" : ""
                    }`}
                  />
                </div>

                {financeReportsOpen && (
                  <div className="pl-[5px] flex flex-col gap-1 mb-3">
                    <Link
                      to="/reports/finance-reports/all-invoice-report"
                      className="submenu-link text-white text-sm"
                    >
                      All Invoice Report
                    </Link>
                    <Link
                      to="/reports/finance-reports/pending-collection"
                      className="submenu-link text-white text-sm"
                    >
                      Pending Collection
                    </Link>
                    <Link
                      to="/reports/finance-reports/cancelled-paid-invoice"
                      className="submenu-link text-white text-sm"
                    >
                      Cancelled Paid Invoice
                    </Link>
                    <Link
                      to="/reports/finance-reports/collection-report"
                      className="submenu-link text-white text-sm"
                    >
                      Collection Report
                    </Link>
                    <Link
                      to="/reports/finance-reports/tds-report"
                      className="submenu-link text-white text-sm"
                    >
                      TDS Report
                    </Link>
                    <Link
                      to="/reports/finance-reports/advance-payments-report"
                      className="submenu-link text-white text-sm"
                    >
                      Advance Payments Report
                    </Link>
                  </div>
                )}

                {/* OPERATIONS REPORTS */}
                <div
                  className="text-white flex justify-between items-center cursor-pointer text-sm mb-2"
                  onClick={toggleOperationsReports}
                >
                  <div className="flex gap-[5px] items-center cursor-pointer">
                    <FaCircle className="menu--icon !text-[10px]" />
                    <span className="nav-text">Operations Reports</span>
                  </div>
                  <FaAngleDown
                    className={`downmenu transition ${
                      operationsReportsOpen ? "rotate-[180deg]" : ""
                    }`}
                  />
                </div>

                {operationsReportsOpen && (
                  <div className="pl-[5px] flex flex-col gap-1 mb-3">
                    <Link
                      to="/reports/operations-reports/renewal-report"
                      className="submenu-link text-white text-sm"
                    >
                      Renewal Report
                    </Link>
                    <Link
                      to="/reports/operations-reports/member-checkins-report"
                      className="submenu-link text-white text-sm"
                    >
                      Member Check-ins
                    </Link>
                    <Link
                      to="/reports/operations-reports/memberships-report"
                      className="submenu-link text-white text-sm"
                    >
                      Memberships Report
                    </Link>
                    <Link
                      to="/reports/operations-reports/membership-expiry-report"
                      className="submenu-link text-white text-sm"
                    >
                      Membership Expiry
                    </Link>
                    <Link
                      to="/reports/operations-reports/pt-expiry-report"
                      className="submenu-link text-white text-sm"
                    >
                      PT Expiry Report
                    </Link>
                    <Link
                      to="/reports/operations-reports/irregular-members-report"
                      className="submenu-link text-white text-sm"
                    >
                      Irregular Members Report
                    </Link>
                    <Link
                      to="/reports/operations-reports/active-client-summary-report"
                      className="submenu-link text-white text-sm"
                    >
                      Active Client Report
                    </Link>
                    <Link
                      to="/reports/operations-reports/inactive-client-summary-report"
                      className="submenu-link text-white text-sm"
                    >
                      Inactive Client Report
                    </Link>
                    <Link
                      to="/reports/operations-reports/membership-frozen-report"
                      className="submenu-link text-white text-sm"
                    >
                      Membership Frozen Report
                    </Link>
                    <Link
                      to="/reports/operations-reports/attendance-heatmap-report"
                      className="submenu-link text-white text-sm"
                    >
                      Attendance Heatmap Report
                    </Link>
                    <Link
                      to="/reports/operations-reports/referral-report"
                      className="submenu-link text-white text-sm"
                    >
                      Referral Report
                    </Link>
                  </div>
                )}
              </div>
            )}

            <div
              className="nav-link d-flex justify-between align-items-center mb-2"
              onClick={() => toggleMenu("configure")}
              style={{ cursor: "pointer" }}
            >
              <div className="flex items-center">
                <IoSettingsOutline className="menu--icon" />
                <span className="nav-text">Configure</span>
              </div>
              <FaAngleDown
                className={`downmenu transition ${
                  dropdownToggles["configure"] ? "rotate-[180deg]" : ""
                }`}
              />
            </div>

            {dropdownToggles["configure"] && (
              <div className="mt-2 pl-5 relative">
                <div className="absolute h-[calc(100%-15px)] w-[2px] bg-white left-[23px] top-[8px]"></div>
                <Link
                  to="/staff"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">Add User</span>
                </Link>
                <Link
                  to="/exercises"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">Exercises</span>
                </Link>
                <Link
                  to="/email-template-list"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">Email Template</span>
                </Link>
                <Link
                  to="/package-category"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">Classes Category</span>
                </Link>
                <Link
                  to="/on-boarding-list"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">On Boarding List</span>
                </Link>
                <Link
                  to="/companies"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">Companies</span>
                </Link>
                <Link
                  to="/club"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">Club</span>
                </Link>
                <Link
                  to="/studio"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">Studio</span>
                </Link>
                <Link
                  to="/club-gallery"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">Club Gallery</span>
                </Link>
                <Link
                  to="/services"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">Club Services</span>
                </Link>
                <Link
                  to="/recovery-services"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">Recovery Services</span>
                </Link>
                <Link
                  to="/product-category"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">Nourish Category</span>
                </Link>
                <Link
                  to="/subscription-plan"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">Membership Plans</span>
                </Link>
                <Link
                  to="/products"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">Nourish Products</span>
                </Link>
                <Link
                  to="/packages"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">Packages</span>
                </Link>
                <Link
                  to="/option-list"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">Options List</span>
                </Link>
                <Link
                  to="/faq-category"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">FAQ Category</span>
                </Link>
                <Link
                  to="/faq-list"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">FAQ List</span>
                </Link>
              </div>
            )}
          </>
        )}

        {accessToken && userType === "MARKETING_MANAGER" && (
          <>
            <div
              className="nav-link d-flex justify-between align-items-center mb-2"
              onClick={() => toggleMenu("marketing")}
              style={{ cursor: "pointer" }}
            >
              <div className="flex items-center">
                <TfiAnnouncement className="menu--icon" />
                <span className="nav-text">Marketing</span>
              </div>
              <FaAngleDown
                className={`downmenu transition ${
                  dropdownToggles["marketing"] ? "rotate-[180deg]" : ""
                }`}
              />
            </div>

            {dropdownToggles["marketing"] && (
              <div className="mt-2 pl-5 relative">
                <div className="absolute h-[calc(100%-15px)] w-[2px] bg-white left-[23px] top-[8px]"></div>
                <Link
                  to="/reports/marketing-reports/email-list"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">Email</span>
                </Link>
                <Link
                  to="/reports/marketing-reports/sms-list"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">SMS</span>
                </Link>
                <Link
                  to="/reports/marketing-reports/notification-list"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">Notifications</span>
                </Link>
                <Link
                  to="/email-template-list"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">Email Templates</span>
                </Link>
                <Link
                  to="/marketing-banner"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">App Banner</span>
                </Link>
                <Link
                  to="/coupons"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">Discount Coupons</span>
                </Link>
                <Link
                  to="/challenge-list"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">Challenges</span>
                </Link>
              </div>
            )}

            <div
              className="nav-link d-flex justify-between align-items-center mb-2"
              onClick={() => toggleMenu("marketingreports")}
              style={{ cursor: "pointer" }}
            >
              <div className="flex items-center">
                <IoDocumentTextOutline className="menu--icon" />
                <span className="nav-text">Reports</span>
              </div>
              <FaAngleDown
                className={`downmenu transition ${
                  dropdownToggles["marketingreports"] ? "rotate-[180deg]" : ""
                }`}
              />
            </div>

            {dropdownToggles["marketingreports"] && (
              <div className="mt-2 pl-5 relative">
                <div className="absolute h-[calc(100%-15px)] w-[2px] bg-white left-[23px] top-[8px]"></div>

                <Link
                  to="/reports/products-sold"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">Products Sold</span>
                </Link>

                <Link
                  to="/reports/sales-reports/new-joinees-report"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">New Joinees Report</span>
                </Link>
                <Link
                  to="/reports/sales-reports/all-enquiries-report"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">All Enquiries Report</span>
                </Link>
                <Link
                  to="/reports/marketing-reports/lead-source-performance"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">Lead Source Performance</span>
                </Link>
                <Link
                  to="/reports/sales-reports/group-classes-report/"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">Group Classes Report</span>
                </Link>
                <Link
                  to="/reports/operations-reports/attendance-heatmap-report/"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">Attendance Heatmap</span>
                </Link>
                <Link
                  to="/reports/marketing-reports/customer-segmentation-report"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">Customer Segmentation</span>
                </Link>
                <Link
                  to="/reports/marketing-reports/discount-codes-performance"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">Discount Codes Performance</span>
                </Link>
                <Link
                  to="/reports/marketing-reports/engagement-tracking-report"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">Engagement Tracking</span>
                </Link>
                <Link
                  to="/reports/marketing-reports/email-automation-report"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">Email Delivery</span>
                </Link>
                <Link
                  to="/reports/marketing-reports/sms-delivery-report"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">SMS Delivery</span>
                </Link>
                {/* <Link
                  to="/reports/marketing-reports/event-community-engagement"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">Event & Community Engagement</span>
                </Link> */}
                <Link
                  to="/reports/marketing-reports/thrive-coins-usage"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">Thrive Coins Usage</span>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
