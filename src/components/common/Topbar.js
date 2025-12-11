import React, { useEffect, useRef, useState } from "react";
import Papa from "papaparse";
import { IoIosArrowDown, IoIosList, IoIosSearch } from "react-icons/io";
import { LiaFileInvoiceSolid } from "react-icons/lia";
import ItemsList from "../ItemsList";
import {
  IoBarChartOutline,
  IoLogOutOutline,
  IoSettingsOutline,
} from "react-icons/io5";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiPlus, FiUser, FiUsers } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../Redux/Reducers/authSlice";
import DropdownMenu from "../DropdownMenu";
import CreateLeadForm from "../../Pages/CreateLeadForm";
import CreateInvoice from "../../Pages/CreateInvoice";
import ProfileDetails from "../modal/ProfileDetails";
import ToggleMenu from "../../assets/images/togglemenu.svg";
import quickLinksImg from "../../assets/images/quicklinks.svg";
import notificationBell from "../../assets/images/bellnotification.svg";
import CreateMemberForm from "../../Pages/CreateMemberForm";
import { useDropzone } from "react-dropzone";
import { authAxios } from "../../config/config";

const Topbar = ({ setToggleMenuBar, toggleMenuBar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchItem, setSearchItem] = useState("");
  const [filteredUsers, setFilteredUsers] = useState({
    leads: [],
    members: [],
  });
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const [hasSearched, setHasSearched] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [leadModal, setLeadModal] = useState(false);
  const [memberModal, setMemberModal] = useState(false);
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [profileModal, setProfileModal] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const [allLeads, setAllLeads] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewNewLeads, setPreviewNewLeads] = useState([]);
  const [previewDuplicateLeads, setPreviewDuplicateLeads] = useState([]);

  const toggleDropdown = (name) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleToggleMenu = () => {
    setToggleMenuBar(!toggleMenuBar);
  };

  const fetchSearchResults = async (searchTerm) => {
    try {
      const res = await authAxios().get(
        `/member/lead/list?search=${searchTerm}`
      );
      const response = res.data;

      if (response.status) {
        const leads = response.data.rows.filter(
          (item) => item.entity_type === "LEAD"
        );
        const members = response.data.rows.filter(
          (item) => item.entity_type === "MEMBER"
        );
        setFilteredUsers({ leads, members });
      } else {
        setFilteredUsers({ leads: [], members: [] });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchItem.trim()) {
      fetchSearchResults(searchItem);
      setHasSearched(true);
    } else {
      setFilteredUsers({ leads: [], members: [] });
      setHasSearched(false);
    }
  };

  // Outside click detection
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside both the search input and the dropdown
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        // Close dropdown and reset filtered data when clicked outside
        setFilteredUsers({ leads: [], members: [] });
        setHasSearched(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // 🔄 Reset dropdown on route change
    setFilteredUsers({ leads: [], members: [] });
    setHasSearched(false);
    setSearchItem("");
  }, [location.pathname]);

  const handleBulkUpload = (acceptedFiles) => {
    const file = acceptedFiles[0];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const existingPhones = new Set(
          allLeads.map((lead) => lead.phoneNumber)
        );
        const newLeads = [];
        const duplicates = [];
        const errors = [];

        results.data.forEach((row, idx) => {
          const name = row["Name"]?.trim();
          const phone = row["Phone Number"]?.trim();
          const email = row["Email"]?.trim();

          // Check required fields
          if (!name || !phone || !email) {
            errors.push({
              row: idx + 2,
              reason: "Missing Name, Phone, or Email",
            });
            return;
          }

          const isDuplicatePhone = existingPhones.has(phone);

          const leadObj = {
            id: allLeads.length + newLeads.length + 1,
            enquiryId: `ENQ${allLeads.length + newLeads.length + 1000}`,
            createdOn: new Date().toLocaleDateString("en-GB"),
            name,
            phoneNumber: phone,
            email,
            leadType: row["Lead Type"] || "Phone",
            leadSource: row["Lead Source"] || "Unknown",
            leadStatus: row["Lead Status"] || "New",
            lastUpdated: new Date().toLocaleDateString("en-GB"),
            callTag: "Not Called",
            staff: row["Staff"] || "Unassigned",
          };

          if (isDuplicatePhone) {
            duplicates.push(leadObj); // Only duplicates by phone
          } else {
            newLeads.push(leadObj);
          }
        });

        setPreviewNewLeads(newLeads);
        setPreviewDuplicateLeads(duplicates);
        setShowUploadModal(true);
      },
    });
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleBulkUpload,
    accept: ".csv",
  });

  return (
    <>
      <section className="top--bar p-3 border-b border-b-[#000]">
        <div className="inner--container flex justify-between gap-3">
          {/* Left Section */}
          <div className="topbar--left flex items-center gap-3 w-full flex-1">
            <div className="toggle--bar" onClick={handleToggleMenu}>
              {/* <RiBarChartHorizontalLine className="text-2xl cursor-pointer" /> */}
              <img src={ToggleMenu} className="cursor-pointer w-8" />
            </div>

            <div ref={searchRef} className="search--topbar relative w-fit">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <div className="w-[350px]">
                  <input
                    type="text"
                    value={searchItem}
                    onChange={(e) => setSearchItem(e.target.value)}
                    placeholder="Search"
                    className="outline-none py-1 min-h-[45px] w-full bg-white rounded-[10px] px-3"
                  />
                </div>

                <button
                  type="submit"
                  className="text-white bg-black rounded-[10px] w-10 h-10 flex items-center justify-center cursor-pointer"
                >
                  <IoIosSearch className="text-xl" />
                </button>
              </form>

              {(filteredUsers?.leads?.length > 0 ||
                filteredUsers?.members?.length > 0) && (
                <div
                  ref={dropdownRef}
                  className="absolute bg-white mt-1 w-full max-h-60 overflow-y-auto z-10 shadow-lg rounded min-w-[500px]"
                >
                  {filteredUsers?.members?.length > 0 && (
                    <div className="members-list">
                      <h3 className="font-bold border-b border-t px-3 py-2">
                        By Member
                      </h3>
                      {filteredUsers.members.map((member) => (
                        <Link
                          key={member.id}
                          to={`/all-members/${member.id}`}
                          className="block w-full py-2 px-3  text-sm [&:not(:last-child)]:border-b hover:bg-black hover:text-white cursor-pointer"
                        >
                          <p>
                            {member.full_name} - {member.email} -{" "}
                            {member.mobile}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}
                  {filteredUsers?.leads?.length > 0 && (
                    <div className="leads-list">
                      <h3 className="font-bold border-b border-t px-3 py-2">
                        By Lead
                      </h3>
                      {filteredUsers.leads.map((lead) => (
                        <Link
                          key={lead.id}
                          to={`/all-leads/${lead.id}`}
                          className="block w-full py-2 px-3 [&:not(:last-child)]:border-b text-sm hover:bg-black hover:text-white cursor-pointer"
                        >
                          <p>
                            {lead.full_name} - {lead.email} - {lead.mobile}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {hasSearched &&
                filteredUsers.leads.length === 0 &&
                filteredUsers.members.length === 0 && (
                  <div className="absolute bg-white mt-1 w-full max-h-60 overflow-y-auto z-10 shadow-lg rounded p-3">
                    <p className="text-sm text-gray-500">No results found.</p>
                  </div>
                )}
            </div>
          </div>

          {/* Right Section */}
          <div className="top--bar--menu flex items-center gap-3">
            <div className="relative">
              <img
                src={quickLinksImg}
                className="cursor-pointer w-6"
                onClick={() => toggleDropdown("quicklinks")}
              />

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
                <div
                  {...getRootProps()}
                  className="nav-link flex items-center gap-2 px-3 py-2 hover:bg-black hover:text-white transition border-b cursor-pointer"
                >
                  <input {...getInputProps()} />
                  <IoIosList className="menu--icon" />
                  <span className="nav-text">Bulk Lead Upload</span>
                </div>
              </DropdownMenu>
            </div>

            <img src={notificationBell} className="cursor-pointer w-6" />

            <div className="relative">
              <div
                className="flex items-center gap-1 cursor-pointer"
                onClick={() => toggleDropdown("profile")}
              >
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
                {/* <Link
                  to="#"
                  className="nav-link flex items-center gap-2 px-3 py-2 hover:bg-black hover:text-white transition border-b"
                >
                  <IoSettingsOutline className="menu--icon" />
                  <span className="nav-text">Setting</span>
                </Link> */}
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
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">CSV Upload Preview</h2>

            {previewDuplicateLeads.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-red-600 mb-1">
                  ❗ Duplicate Phone Numbers Found:
                </h3>
                <table className="w-full text-sm border">
                  <thead className="bg-red-100">
                    <tr>
                      <th className="p-2 border">Name</th>
                      <th className="p-2 border">Phone Number</th>
                      <th className="p-2 border">Email</th>
                      <th className="p-2 border">Lead Type</th>
                      <th className="p-2 border">Lead Source</th>
                      <th className="p-2 border">Lead Status</th>
                      <th className="p-2 border">Staff</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewDuplicateLeads.map((lead, idx) => (
                      <tr key={idx}>
                        <td className="p-2 border">{lead?.name}</td>
                        <td className="p-2 border">{lead?.phone}</td>
                        <td className="p-2 border">{lead?.email}</td>
                        <td className="p-2 border">{lead?.leadType}</td>
                        <td className="p-2 border">{lead?.leadSource}</td>
                        <td className="p-2 border">{lead?.leadStatus}</td>
                        <td className="p-2 border">{lead?.staff}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {previewNewLeads.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-green-700 mb-1">
                  ✅ Leads Ready to Import:
                </h3>
                <table className="w-full text-sm border">
                  <thead className="bg-green-100">
                    <tr>
                      <th className="p-2 border">Name</th>
                      <th className="p-2 border">Phone Number</th>
                      <th className="p-2 border">Email</th>
                      <th className="p-2 border">Lead Type</th>
                      <th className="p-2 border">Lead Source</th>
                      <th className="p-2 border">Lead Status</th>
                      <th className="p-2 border">Staff</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewNewLeads.map((lead, idx) => (
                      <tr key={idx}>
                        <td className="p-2 border">{lead?.name}</td>
                        <td className="p-2 border">{lead?.phone}</td>
                        <td className="p-2 border">{lead?.email}</td>
                        <td className="p-2 border">{lead?.leadType}</td>
                        <td className="p-2 border">{lead?.leadSource}</td>
                        <td className="p-2 border">{lead?.leadStatus}</td>
                        <td className="p-2 border">{lead?.staff}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setPreviewNewLeads([]);
                  setPreviewDuplicateLeads([]);
                }}
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Cancel
              </button>
              {previewDuplicateLeads.length > 0 ? null : (
                <button
                  onClick={() => {
                    setAllLeads((prev) => [...prev, ...previewNewLeads]);
                    setShowUploadModal(false);
                    setPreviewNewLeads([]);
                    setPreviewDuplicateLeads([]);
                  }}
                  className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800"
                >
                  Confirm Upload
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Topbar;
