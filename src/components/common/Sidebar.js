import React, { useEffect, useState } from "react";
import { AiOutlineHome, AiOutlineProduct } from "react-icons/ai";
import { FiUsers, FiUserPlus } from "react-icons/fi";
import { FaAngleDown, FaCircle, FaRegBuilding } from "react-icons/fa6";
import { Link, useLocation } from "react-router-dom";
import { PiBowlFood, PiChartPieSlice, PiUserList } from "react-icons/pi";
import { SlCalender } from "react-icons/sl";
import { IoBarChartOutline, IoDocumentTextOutline, IoSettingsOutline } from "react-icons/io5";
import { GoTools } from "react-icons/go";
import { LuList } from "react-icons/lu";
import { CgGym } from "react-icons/cg";
import { useSelector } from "react-redux";
import { TbGymnastics } from "react-icons/tb";
import { FaLayerGroup } from "react-icons/fa";
import TopLogo from "../../assets/images/DLF-Thrive-New-Logo-1-White.png";
import { HiTemplate } from "react-icons/hi";
import { TfiAnnouncement } from "react-icons/tfi";

const Sidebar = ({ toggleMenuBar, setToggleMenuBar, setLeadModal }) => {
  const location = useLocation();
  const { accessToken } = useSelector((state) => state.auth);
  const userType = useSelector((state) => state.auth?.user?.userType);

  const [dropdownToggles, setDropdownToggles] = useState({});

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

        {/* <div
          className="nav-link d-flex justify-between align-items-center mb-2"
          onClick={toggleLeadsMenu}
          style={{ cursor: "pointer" }}
        >
          <div className="flex items-center gap-[10px]">
            <IoBarChartOutline className="menu--icon" />
            <span className="nav-text">My Leads</span>
          </div>
          <FaAngleDown
            className={`downmenu transition ${
              dropdownToggle ? "rotate-[180deg]" : ""
            }`}
          />
        </div> */}

        {/* {dropdownToggle && (
          <div className="mt-2 ">
            <div
              className="nav-link bg-black mb-1 cursor-pointer"
              onClick={handleLeadModal}
            >
              <FiUserPlus className="menu--icon" />
              <span className="nav-text">Create Leads</span>
            </div>
            <Link
              to="/all-leads"
              className={`nav-link bg-black mb-1 ${
                location.pathname === "/all-leads" ? "active" : ""
              }`}
            >
              <PiUserList className="menu--icon" />
              <span className="nav-text">All Leads</span>
            </Link>
          </div>
        )} */}

        <div
          className="nav-link d-flex justify-between align-items-center mb-2"
          onClick={() => toggleMenu("otherclubs")}
          style={{ cursor: "pointer" }}
        >
          <div className="flex items-center">
            <TbGymnastics className="menu--icon" />
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
          to="/reports/appointments/trial-appointments"
          className={`nav-link mb-2 ${
            location.pathname === "/reports/appointments/trial-appointments"
              ? "active"
              : ""
          }`}
        >
          <AiOutlineHome className="menu--icon" />
          <span className="nav-text">Trial Appointments</span>
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
              to="/send-sms-list"
              className="text-white flex items-center gap-[5px] mb-2 text-sm"
            >
              <FaCircle className="menu--icon !text-[10px]" />
              <span className="nav-text">Send SMS</span>
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
          onClick={() => toggleMenu("reports")}
          style={{ cursor: "pointer" }}
        >
          <div className="flex items-center">
            <IoDocumentTextOutline className="menu--icon" />
            <span className="nav-text">Reports</span>
          </div>
          <FaAngleDown
            className={`downmenu transition ${
              dropdownToggles["reports"] ? "rotate-[180deg]" : ""
            }`}
          />
        </div>

        {dropdownToggles["reports"] && (
          <div className="mt-2 pl-5 relative">
            <div className="absolute h-[calc(100%-15px)] w-[2px] bg-white left-[23px] top-[8px]"></div>
            <Link
              to="/reports/finance/sales-report"
              className="text-white flex items-center gap-[5px] mb-2 text-sm"
            >
              <FaCircle className="menu--icon !text-[10px]" />
              <span className="nav-text">Sales Report</span>
            </Link>
            <Link
              to="/reports/member-management/member-check-ins"
              className="text-white flex items-center gap-[5px] mb-2 text-sm"
            >
              <FaCircle className="menu--icon !text-[10px]" />
              <span className="nav-text">Member Check-ins</span>
            </Link>
            <Link
              to="/reports/products-sold/"
              className="text-white flex items-center gap-[5px] mb-2 text-sm"
            >
              <FaCircle className="menu--icon !text-[10px]" />
              <span className="nav-text">Products Sold</span>
            </Link>
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
          </div>
        )}

        {/* <Link to="/staff" className="nav-link mb-2">
          <FiUsers className="menu--icon" />
          <span className="nav-text">Staff</span>
        </Link>
        <Link to="/exercises" className="nav-link mb-2">
          <CgGym className="menu--icon" />
          <span className="nav-text">Exercises</span>
        </Link>

        <div
          className="nav-link d-flex justify-between align-items-center mb-2"
          onClick={() => toggleMenu("templatelist")}
          style={{ cursor: "pointer" }}
        >
          <div className="flex items-center">
            <HiTemplate className="menu--icon" />
            <span className="nav-text">Templates</span>
          </div>
          <FaAngleDown
            className={`downmenu transition ${
              dropdownToggles["templatelist"] ? "rotate-[180deg]" : ""
            }`}
          />
        </div>

        {dropdownToggles["templatelist"] && (
          <div className="mt-2 pl-5 relative">
            <div className="absolute h-[calc(100%-15px)] w-[2px] bg-white left-[23px] top-[8px]"></div>
            <Link
              to="/email-template-list"
              className="text-white flex items-center gap-[5px] mb-2 text-sm"
            >
              <FaCircle className="menu--icon !text-[10px]" />
              <span className="nav-text">Email Template</span>
            </Link>
          </div>
        )}

        <div
          className="nav-link d-flex justify-between align-items-center mb-2"
          onClick={() => toggleMenu("settingmodules")}
          style={{ cursor: "pointer" }}
        >
          <div className="flex items-center">
            <IoSettingsOutline className="menu--icon" />
            <span className="nav-text">Settings</span>
          </div>
          <FaAngleDown
            className={`downmenu transition ${
              dropdownToggles["settingmodules"] ? "rotate-[180deg]" : ""
            }`}
          />
        </div>

        {dropdownToggles["settingmodules"] && (
          <div className="mt-2 pl-5 relative">
            <div className="absolute h-[calc(100%-15px)] w-[2px] bg-white left-[23px] top-[8px]"></div>
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
              to="/option-list"
              className="text-white flex items-center gap-[5px] mb-2 text-sm"
            >
              <FaCircle className="menu--icon !text-[10px]" />
              <span className="nav-text">Options List</span>
            </Link>
            <Link
              to="/module-list"
              className="text-white flex items-center gap-[5px] mb-2 text-sm"
            >
              <FaCircle className="menu--icon !text-[10px]" />
              <span className="nav-text">Module List</span>
            </Link> 

            <Link
              to="/on-boarding-list"
              className="text-white flex items-center gap-[5px] mb-2 text-sm"
            >
              <FaCircle className="menu--icon !text-[10px]" />
              <span className="nav-text">On Boarding List</span>
            </Link>
            <Link
              to="/splash-screen"
              className="text-white flex items-center gap-[5px] mb-2 text-sm"
            >
              <FaCircle className="menu--icon !text-[10px]" />
              <span className="nav-text">Splash Screen</span>
            </Link>

            <Link
              to="/services"
              className="text-white flex items-center gap-[5px] mb-2 text-sm"
            >
              <FaCircle className="menu--icon !text-[10px]" />
              <span className="nav-text">Services</span>
            </Link>
            <Link
              to="/package-category"
              className="text-white flex items-center gap-[5px] mb-2 text-sm"
            >
              <FaCircle className="menu--icon !text-[10px]" />
              <span className="nav-text">Classes Category</span>
            </Link>
            <Link
              to="/packages"
              className="text-white flex items-center gap-[5px] mb-2 text-sm"
            >
              <FaCircle className="menu--icon !text-[10px]" />
              <span className="nav-text">Packages</span>
            </Link>

            <Link
              to="/product-category"
              className="text-white flex items-center gap-[5px] mb-2 text-sm"
            >
              <FaCircle className="menu--icon !text-[10px]" />
              <span className="nav-text">Product Category</span>
            </Link>
            <Link
              to="/products"
              className="text-white flex items-center gap-[5px] mb-2 text-sm"
            >
              <FaCircle className="menu--icon !text-[10px]" />
              <span className="nav-text">Products</span>
            </Link>

            <Link
              to="/subscription-plan"
              className="text-white flex items-center gap-[5px] mb-2 text-sm"
            >
              <FaCircle className="menu--icon !text-[10px]" />
              <span className="nav-text">Subscription Plan</span>
            </Link>
          </div>
        )} */}

        {accessToken && userType === "PT" && (
          <>
            <Link
              to="/my-clients"
              className={`nav-link mb-2 ${
                location.pathname === "/my-clients" ? "active" : ""
              }`}
            >
              <IoBarChartOutline className="menu--icon" />
              <span className="nav-text">My Clients</span>
            </Link>

            <Link
              to="/my-calendar"
              className={`nav-link mb-2 ${
                location.pathname === "/my-calendar" ? "active" : ""
              }`}
            >
              <FiUsers className="menu--icon" />
              <span className="nav-text">My Calendar</span>
            </Link>

            <Link
              to="/workout-plans"
              className={`nav-link mb-2 ${
                location.pathname === "/workout-plans" ? "active" : ""
              }`}
            >
              <GoTools className="menu--icon" />
              <span className="nav-text">Workout Plans</span>
            </Link>
            <Link
              to="/assessments-progress"
              className={`nav-link mb-2 ${
                location.pathname === "/assessments-progress" ? "active" : ""
              }`}
            >
              <GoTools className="menu--icon" />
              <span className="nav-text">Assessments & Progress</span>
            </Link>
            <Link
              to="/reports-incentives"
              className={`nav-link mb-2 ${
                location.pathname === "/reports-incentives" ? "active" : ""
              }`}
            >
              <GoTools className="menu--icon" />
              <span className="nav-text">Reports & Incentives</span>
            </Link>
            <Link
              to="/tasks-followups"
              className={`nav-link mb-2 ${
                location.pathname === "/tasks-followups" ? "active" : ""
              }`}
            >
              <GoTools className="menu--icon" />
              <span className="nav-text">Tasks / Follow-ups</span>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
