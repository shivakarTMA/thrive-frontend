import React, { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { GoPlusCircle } from "react-icons/go";
import { IoIosSearch } from "react-icons/io";
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
        <div className="inner--container flex justify-between">
          {/* Left Section */}
          <div className="topbar--left flex items-center gap-3">
            <div className="toggle--bar" onClick={handleToggleMenu}>
              <RiBarChartHorizontalLine className="text-2xl cursor-pointer" />
            </div>

            <div className="search--topbar relative">
              <div className="flex items-center gap-2 border rounded px-2 bg-white">
                <IoIosSearch className="text-xl" />
                <input
                  type="text"
                  value={searchItem}
                  onChange={handleInputChange}
                  placeholder="Type to search"
                  className="outline-none py-1"
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
              <GoPlusCircle
                className="text-2xl cursor-pointer"
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
            <LuBell className="text-2xl cursor-pointer" />

            <div className="relative">
              <FaUserCircle
                className="text-2xl cursor-pointer"
                onClick={() => toggleDropdown("profile")}
              />

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
      {profileModal && <ProfileDetails setProfileModal={setProfileModal} profile={user} />}
    </>
  );
};

export default Topbar;
