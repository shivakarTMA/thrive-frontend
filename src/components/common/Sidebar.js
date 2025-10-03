import React, { useEffect, useState } from "react";
import { AiOutlineHome, AiOutlineProduct } from "react-icons/ai";
import { FiUsers, FiUserPlus } from "react-icons/fi";
import { FaAngleDown, FaCircle, FaRegBuilding } from "react-icons/fa6";
import { Link, useLocation } from "react-router-dom";
import { PiBowlFood, PiChartPieSlice, PiUserList } from "react-icons/pi";
import { SlCalender } from "react-icons/sl";
import { IoBarChartOutline, IoSettingsOutline } from "react-icons/io5";
import { GoTools } from "react-icons/go";
import { LuList } from "react-icons/lu";
import { CgGym } from "react-icons/cg";
import { useSelector } from "react-redux";
import { TbGymnastics } from "react-icons/tb";
import { FaLayerGroup } from "react-icons/fa";

const Sidebar = ({ toggleMenuBar, setToggleMenuBar, setLeadModal }) => {
  const location = useLocation();
  const { accessToken } = useSelector((state) => state.auth);
  const userType = useSelector((state) => state.auth?.user?.userType);

  const [dropdownToggles, setDropdownToggles] = useState({});

  const toggleMenu = (menuKey) => {
    setDropdownToggles((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
    setToggleMenuBar(false);
  };

  useEffect(() => {
    if (toggleMenuBar) {
      setDropdownToggles({});
    }
  }, [toggleMenuBar]);

  useEffect(() => {
    setToggleMenuBar(false);
    setDropdownToggles({});
  }, [location.pathname]);

  // const handleLeadModal = () => {
  //   setLeadModal(true);
  // };

  return (
    <div className={`sidebar ${toggleMenuBar ? "activetoggle" : ""}`}>
      <div className="sidebar-logo d-flex align-items-center">
        <Link to="/">
          <img
            src="https://themarcomavenue.com/thrive/assets/images/DLF-Thrive-New-Logo-1-White.png"
            alt="logo"
            width="180px"
            height="50px"
          />
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

        <Link
          to="/club-manager"
          className={`nav-link mb-2 ${
            location.pathname === "/club-manager" ? "active" : ""
          }`}
        >
          <AiOutlineHome className="menu--icon" />
          <span className="nav-text">Club Manager</span>
        </Link>
        <Link
          to="/sales-report"
          className={`nav-link mb-2 ${
            location.pathname === "/sales-report" ? "active" : ""
          }`}
        >
          <AiOutlineHome className="menu--icon" />
          <span className="nav-text">Sales Report</span>
        </Link>
        <Link
          to="/trainer-dashboard"
          className={`nav-link mb-2 ${
            location.pathname === "/trainer-dashboard" ? "active" : ""
          }`}
        >
          <AiOutlineHome className="menu--icon" />
          <span className="nav-text">Trainer Dashboard</span>
        </Link>
        <Link
          to="/all-leads"
          className={`nav-link mb-2 ${
            location.pathname === "/all-leads" ? "active" : ""
          }`}
        >
          <IoBarChartOutline className="menu--icon" />
          <span className="nav-text">My Leads</span>
        </Link>
        <Link to="#" className="nav-link mb-2">
          <SlCalender className="menu--icon" />
          <span className="nav-text">Bookings</span>
        </Link>

        <Link
          to="/all-members"
          className={`nav-link mb-2 ${
            location.pathname === "/all-members" ? "active" : ""
          }`}
        >
          <FiUsers className="menu--icon" />
          <span className="nav-text">Members</span>
        </Link>

        <Link
          to="/lost-found"
          className={`nav-link mb-2 ${
            location.pathname === "/lost-found" ? "active" : ""
          }`}
        >
          <GoTools className="menu--icon" />
          <span className="nav-text">Operational Tools</span>
        </Link>
        {/* <Link to="/services-list/" className="nav-link mb-2">
              <LuList className="menu--icon" />
              <span className="nav-text">Services</span>
            </Link> */}

        {/* Products Menu */}
        {/* <div
              className="nav-link d-flex justify-between align-items-center mb-2"
              onClick={() => toggleMenu("products")}
              style={{ cursor: "pointer" }}
            >
              <div className="flex items-center">
                <AiOutlineProduct className="menu--icon" />
                <span className="nav-text">Products</span>
              </div>
              <FaAngleDown
                className={`downmenu transition ${
                  dropdownToggles["products"] ? "rotate-[180deg]" : ""
                }`}
              />
            </div>

            {dropdownToggles["products"] && (
              <div className="mt-2 pl-5 relative">
                <div className="absolute h-[calc(100%-15px)] w-[2px] bg-white left-[23px] top-[8px]"></div>
                <Link
                  to="#"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[12px]" />
                  <span className="nav-text">All Products</span>
                </Link>
                <Link
                  to="/create-product"
                  className="text-white flex items-center gap-[5px] mb-2 text-sm"
                >
                  <FaCircle className="menu--icon !text-[12px]" />
                  <span className="nav-text">Create Product</span>
                </Link>
              </div>
            )} */}
        <Link to="/products" className="nav-link mb-2">
          <AiOutlineProduct className="menu--icon" />
          <span className="nav-text">Products</span>
        </Link>
        {/* <Link to="/services-addons" className="nav-link mb-2">
              <LuList className="menu--icon" />
              <span className="nav-text">Services</span>
            </Link> */}
        {/* <Link to="/companies" className="nav-link mb-2">
              <FaRegBuilding className="menu--icon" />
              <span className="nav-text">Companies</span>
            </Link> */}
        <Link to="/staff" className="nav-link mb-2">
          <FiUsers className="menu--icon" />
          <span className="nav-text">Staff</span>
        </Link>
        <Link to="/exercises" className="nav-link mb-2">
          <CgGym className="menu--icon" />
          <span className="nav-text">Exercises</span>
        </Link>
        <div
          className="nav-link d-flex justify-between align-items-center mb-2"
          onClick={() => toggleMenu("workoutplans")}
          style={{ cursor: "pointer" }}
        >
          <div className="flex items-center">
            <TbGymnastics className="menu--icon" />
            <span className="nav-text">Workout Plans</span>
          </div>
          <FaAngleDown
            className={`downmenu transition ${
              dropdownToggles["workoutplans"] ? "rotate-[180deg]" : ""
            }`}
          />
        </div>

        {dropdownToggles["workoutplans"] && (
          <div className="mt-2 pl-5 relative">
            <div className="absolute h-[calc(100%-15px)] w-[2px] bg-white left-[23px] top-[8px]"></div>
            <Link
              to="/workout-plans"
              className="text-white flex items-center gap-[5px] mb-2 text-sm"
            >
              <FaCircle className="menu--icon !text-[10px]" />
              <span className="nav-text">All Workout Plans</span>
            </Link>
            <Link
              to="/create-workout-plan"
              className="text-white flex items-center gap-[5px] mb-2 text-sm"
            >
              <FaCircle className="menu--icon !text-[10px]" />
              <span className="nav-text">Create Workout Plan</span>
            </Link>
          </div>
        )}
        <Link to="/diet-plan" className="nav-link mb-2">
          <PiBowlFood className="menu--icon" />
          <span className="nav-text">Diet Plan</span>
        </Link>
        <Link to="/group-classes" className="nav-link mb-2">
          <FaLayerGroup className="menu--icon" />
          <span className="nav-text">Group Classes</span>
        </Link>

        <div
          className="nav-link d-flex justify-between align-items-center mb-2"
          onClick={() => toggleMenu("marketing")}
          style={{ cursor: "pointer" }}
        >
          <div className="flex items-center">
            <TbGymnastics className="menu--icon" />
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
              to="/memssmail"
              className="text-white flex items-center gap-[5px] mb-2 text-sm"
            >
              <FaCircle className="menu--icon !text-[10px]" />
              <span className="nav-text">Email</span>
            </Link>
            <Link
              to="/memsssms"
              className="text-white flex items-center gap-[5px] mb-2 text-sm"
            >
              <FaCircle className="menu--icon !text-[10px]" />
              <span className="nav-text">SMS</span>
            </Link>
            <Link
              to="/memsswhatsapp"
              className="text-white flex items-center gap-[5px] mb-2 text-sm"
            >
              <FaCircle className="menu--icon !text-[10px]" />
              <span className="nav-text">WhatsApp</span>
            </Link>
            <Link
              to="#"
              className="text-white flex items-center gap-[5px] mb-2 text-sm"
            >
              <FaCircle className="menu--icon !text-[10px]" />
              <span className="nav-text">Offers</span>
            </Link>
            <Link
              to="#"
              className="text-white flex items-center gap-[5px] mb-2 text-sm"
            >
              <FaCircle className="menu--icon !text-[10px]" />
              <span className="nav-text">Discount Code</span>
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
              to="/option-list"
              className="text-white flex items-center gap-[5px] mb-2 text-sm"
            >
              <FaCircle className="menu--icon !text-[10px]" />
              <span className="nav-text">Options List</span>
            </Link>
            <Link
              to="/role-list"
              className="text-white flex items-center gap-[5px] mb-2 text-sm"
            >
              <FaCircle className="menu--icon !text-[10px]" />
              <span className="nav-text">Role List</span>
            </Link>
            <Link
              to="/module-list"
              className="text-white flex items-center gap-[5px] mb-2 text-sm"
            >
              <FaCircle className="menu--icon !text-[10px]" />
              <span className="nav-text">Module List</span>
            </Link>
            <Link
              to="/challenge-list"
              className="text-white flex items-center gap-[5px] mb-2 text-sm"
            >
              <FaCircle className="menu--icon !text-[10px]" />
              <span className="nav-text">Challenge List</span>
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
              to="/studio"
              className="text-white flex items-center gap-[5px] mb-2 text-sm"
            >
              <FaCircle className="menu--icon !text-[10px]" />
              <span className="nav-text">Studio</span>
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
              <span className="nav-text">Package Category</span>
            </Link>
            <Link
              to="/packages"
              className="text-white flex items-center gap-[5px] mb-2 text-sm"
            >
              <FaCircle className="menu--icon !text-[10px]" />
              <span className="nav-text">Packages</span>
            </Link>

            <Link
              to="/subscription-plan"
              className="text-white flex items-center gap-[5px] mb-2 text-sm"
            >
              <FaCircle className="menu--icon !text-[10px]" />
              <span className="nav-text">Subscription Plan</span>
            </Link>
          </div>
        )}

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
