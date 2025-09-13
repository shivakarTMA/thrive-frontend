import React, { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { GoPlusCircle } from "react-icons/go";
import { IoIosArrowDown, IoIosSearch } from "react-icons/io";
import { LuBell } from "react-icons/lu";
import { RiBarChartHorizontalLine } from "react-icons/ri";
import { LiaFileInvoiceSolid } from "react-icons/lia";
import ItemsList from "../ItemsList";
import {
  IoBarChartOutline,
  IoLogOutOutline,
  IoSettingsOutline,
} from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiUsers } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../Redux/Reducers/authSlice";
import DropdownMenu from "../DropdownMenu";
import CreateLeadForm from "../../Pages/CreateLeadForm";
import CreateMemberForm from "../../Pages/CreateMemberForm";
import CreateInvoice from "../../Pages/CreateInvoice";
import ProfileDetails from "../modal/ProfileDetails";
import ToggleMenu from "../../assets/images/togglemenu.svg";
import quickLinksImg from "../../assets/images/quicklinks.svg";
import notificationBell from "../../assets/images/bellnotification.svg";

const Topbar = ({ setToggleMenuBar, toggleMenuBar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [apiUsers, setApiUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchItem, setSearchItem] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [leadModal, setLeadModal] = useState(false);
  const [memberModal, setMemberModal] = useState(false);
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [profileModal, setProfileModal] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const toggleDropdown = (name) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  useEffect(() => {
    fetch("https://dummyjson.com/users")
      .then((response) => response.json())
      .then((data) => {
        setApiUsers(data.users);
        setFilteredUsers(data.users);
      })
      .catch((err) => {
        console.error(err);
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleToggleMenu = () => {
    setToggleMenuBar(!toggleMenuBar);
  };

  const handleInputChange = (e) => {
    const searchTerm = e.target.value;
    setSearchItem(searchTerm);

    const filteredItems = apiUsers.filter((user) =>
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredUsers(filteredItems);
  };

  return (
    <>
      <section className="top--bar p-3 border-b border-b-[#000]">
        <div className="inner--container flex justify-between gap-3">
          {/* Left Section */}
          <div className="topbar--left flex items-center gap-3 w-full">
            <div className="toggle--bar" onClick={handleToggleMenu}>
              {/* <RiBarChartHorizontalLine className="text-2xl cursor-pointer" /> */}
              <img src={ToggleMenu} className="cursor-pointer w-8" />
            </div>

            <div className="search--topbar relative w-full">
              <div className="flex items-center gap-2 border rounded px-2 bg-white rounded-[10px]">
                <IoIosSearch className="text-xl" />
                <input
                  type="text"
                  value={searchItem}
                  onChange={handleInputChange}
                  placeholder="Search"
                  className="outline-none py-1 min-h-[45px]"
                />
              </div>

              <div className="absolute bg-white mt-1 w-full max-h-60 overflow-y-auto z-10 shadow-lg rounded">
                {loading && (
                  <p className="p-2 text-sm text-gray-500">Loading...</p>
                )}
                {error && (
                  <p className="p-2 text-sm text-red-500">
                    Error loading users
                  </p>
                )}
                {!loading && !error && searchItem.trim() !== "" && (
                  <div className="p-3">
                    {filteredUsers.length > 0 ? (
                      <ItemsList items={filteredUsers} />
                    ) : (
                      <p className="p-2 text-sm text-gray-500">
                        No matching users found
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="top--bar--menu flex items-center gap-3">
            <div className="relative">
              <img
                src={quickLinksImg}
                className="cursor-pointer w-8"
                onClick={() => toggleDropdown("quicklinks")}
              />
              {user?.userType == "PT" ? null : (
                <DropdownMenu
                  isOpen={activeDropdown === "quicklinks"}
                  onClose={() => setActiveDropdown(null)}
                >
                  <div
                    onClick={() => setLeadModal(true)}
                    className="nav-link flex items-center gap-2 px-3 py-2 hover:bg-black hover:text-white transition border-b cursor-pointer"
                  >
                    <IoBarChartOutline className="menu--icon" />
                    <span className="nav-text">Add Lead</span>
                  </div>
                  <div
                    onClick={() => setMemberModal(true)}
                    className="nav-link flex items-center gap-2 px-3 py-2 hover:bg-black hover:text-white transition border-b cursor-pointer"
                  >
                    <FiUsers className="menu--icon" />
                    <span className="nav-text">Create Member</span>
                  </div>
                  <div
                    onClick={() => setInvoiceModal(true)}
                    className="nav-link flex items-center gap-2 px-3 py-2 hover:bg-black hover:text-white transition border-b cursor-pointer"
                  >
                    <LiaFileInvoiceSolid className="menu--icon" />
                    <span className="nav-text">Create Invoice</span>
                  </div>
                </DropdownMenu>
              )}
            </div>

            <img src={notificationBell} className="cursor-pointer w-8" />

            <div className="relative">

              <div className="flex items-center gap-1 cursor-pointer" onClick={() => toggleDropdown("profile")}>
                <div
                  className="profileview w-9 h-9 text-sm rounded-full flex items-center justify-center text-white"
                  
                  style={{
                    background:
                      "linear-gradient(161.54deg, #527DDD 0.51%, #001136 119.51%)",
                  }}
                >
                  <p>AM</p>
                </div>
                <IoIosArrowDown />
              </div>

              <DropdownMenu
                isOpen={activeDropdown === "profile"}
                onClose={() => setActiveDropdown(null)}
              >
                <div
                  onClick={() => setProfileModal(true)}
                  className="nav-link flex items-center gap-2 px-3 py-2 hover:bg-black hover:text-white transition border-b cursor-pointer"
                >
                  <FiUser className="menu--icon" />
                  <span className="nav-text">Profile</span>
                </div>
                <Link
                  to="#"
                  className="nav-link flex items-center gap-2 px-3 py-2 hover:bg-black hover:text-white transition border-b"
                >
                  <IoSettingsOutline className="menu--icon" />
                  <span className="nav-text">Setting</span>
                </Link>
                <div
                  onClick={handleLogout}
                  className="nav-link flex items-center cursor-pointer gap-2 px-3 py-2 hover:bg-black hover:text-white transition"
                >
                  <IoLogOutOutline className="menu--icon" />
                  <span className="nav-text">Logout</span>
                </div>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </section>

      {leadModal && <CreateLeadForm setLeadModal={setLeadModal} />}
      {memberModal && <CreateMemberForm setMemberModal={setMemberModal} />}
      {invoiceModal && <CreateInvoice setInvoiceModal={setInvoiceModal} />}
      {profileModal && (
        <ProfileDetails setProfileModal={setProfileModal} profile={user} />
      )}
    </>
  );
};

export default Topbar;
