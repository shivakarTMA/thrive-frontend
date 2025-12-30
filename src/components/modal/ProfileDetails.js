import React, { useRef } from "react";
import { IoCloseCircle } from "react-icons/io5";
import { formatText } from "../../Helper/helper";

const ProfileDetails = ({ profile, setProfileModal }) => {
  console.log(profile, "profile");
  const leadBoxRef = useRef(null);

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setProfileModal(false);
    }
  };

  const handleProfileModal = () => {
    setProfileModal(false);
  };

  const clubNames = profile?.staff_club.map(item => item.club_name).join(", ");

  return (
    <div
      className="bg--blur create--lead--container fixed top-0 left-0 z-[999] w-full bg-black bg-opacity-60 h-full"
      onClick={handleOverlayClick}
    >
      <div
        className="max-w-[600px] w-full border shadow bg-white rounded-[10px] absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"
        ref={leadBoxRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-3 items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">{formatText(profile?.role)} Profile Details</h2>
          <div
            className="close--lead cursor-pointer"
            onClick={handleProfileModal}
          >
            <IoCloseCircle className="text-3xl" />
          </div>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-2 gap-2">
            <div className="border py-2 px-3 rounded">
              <label className="mb-1 block font-semibold text-sm">Name</label>
              <p>{profile?.name}</p>
            </div>
            <div className="border py-2 px-3 rounded">
              <label className="mb-1 block font-semibold text-sm">
                Email Id
              </label>
              <p>{profile?.email}</p>
            </div>
            <div className="border py-2 px-3 rounded">
              <label className="mb-1 block font-semibold text-sm">
                Phone Number
              </label>
              <p>{profile?.mobile}</p>
            </div>
            <div className="border py-2 px-3 rounded">
              <label className="mb-1 block font-semibold text-sm">
                Club Access
              </label>
              {clubNames}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails;
