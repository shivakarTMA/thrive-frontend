import React, { useEffect, useRef, useState } from "react";
import { IoCloseCircle } from "react-icons/io5";
import { authAxios } from "../../config/config";
import { toast } from "react-toastify";

const ProfileDetails = ({ staffID, setProfileModal }) => {
  const [profileData, setProfileData] = useState("");

  useEffect(() => {
    if (!staffID) return;

    const fetchStaffById = async (id) => {
      try {
        const res = await authAxios().get(`/staff/${id}`);
        const data = res.data?.data || res.data || null;

        if (data) {
          setProfileData(data);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch module details");
      }
    };

    fetchStaffById(staffID);
  }, [staffID]);

  console.log(profileData, "profileData");

  const leadBoxRef = useRef(null);

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setProfileModal(false);
    }
  };

  const handleProfileModal = () => {
    setProfileModal(false);
  };

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
          <h2 className="text-xl font-semibold">
            {profileData?.role} Profile Details
          </h2>
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
              <p>{profileData?.name}</p>
            </div>
            <div className="border py-2 px-3 rounded">
              <label className="mb-1 block font-semibold text-sm">
                Email Id
              </label>
              <p>{profileData?.email}</p>
            </div>
            <div className="border py-2 px-3 rounded">
              <label className="mb-1 block font-semibold text-sm">
                Phone Number
              </label>
              <p>{profileData?.mobile}</p>
            </div>
            <div className="border py-2 px-3 rounded">
              <label className="mb-1 block font-semibold text-sm">
                Club Access
              </label>
              {profileData?.staff_clubs
                ?.map((club) => club.club_name)
                .join(", ")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails;
