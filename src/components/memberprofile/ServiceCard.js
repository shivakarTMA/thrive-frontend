import React, { useEffect, useState } from "react";
import { FaCamera } from "react-icons/fa";
import { FiEdit2, FiSave } from "react-icons/fi";
import { GoPlusCircle } from "react-icons/go";

const ServiceCard = ({ member }) => {
  const [profile, setProfile] = useState(member);

  useEffect(() => {
    setProfile(member);
  }, [member]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-primarylight p-4 rounded">
      <div className="flex gap-6">
        <div className="flex-1 flex">
          <div className="w-full max-w-[200px] h-[255px] bg-primarycolor rounded relative">
            <img
              src={profile.profileImage}
              alt="Profile"
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="p-3 bg-white rounded shadow text-sm w-full space-y-2">
            <p className="flex items-center gap-2 justify-between">
              <strong>Membership Name:</strong> JANANI SINGH
            </p>
            <p className="flex items-center gap-2 justify-between">
              <strong>Membership Duration:</strong> 6 Month
            </p>
            <p className="flex items-center gap-2 justify-between">
              <strong>Membership ID:</strong> 098567
            </p>
            <p className="flex items-center gap-2 justify-between">
              <strong>Duration:</strong> 6 Months
            </p>
            <p className="flex items-center gap-2 justify-between">
              <strong>Last Attendance:</strong> 24-04-2025
            </p>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-black mb-2 font-semibold">
                Membership Status
              </label>
              <div className="text-sm text-gray-800">Active</div>
            </div>
            <div>
              <label className="block text-sm text-black mb-2 font-semibold">
                Relationship Since
              </label>
              <div className="text-sm text-gray-800"> 24-04-2025</div>
            </div>
            <div>
              <label className="block text-sm text-black mb-2 font-semibold">
                Total Service Bookings
              </label>
              <div className="text-sm text-gray-800">5</div>
            </div>
            <div>
              <label className="block text-sm text-black mb-2 font-semibold">
                Total Service Expenditure
              </label>
              <div className="text-sm text-gray-800">₹5000</div>
            </div>
            <div>
              <label className="block text-sm text-black mb-2 font-semibold">
                Referrals
              </label>
              <div className="text-sm text-gray-800">10</div>
            </div>
            <div>
              <label className="block text-sm text-black mb-2 font-semibold">
                Products Purchased
              </label>
              <div className="text-sm text-gray-800">5</div>
            </div>
            <div>
              <label className="block text-sm text-black mb-2 font-semibold">
                Product Expenditure
              </label>
              <div className="text-sm text-gray-800">₹7000</div>
            </div>
            <div>
              <label className="block text-sm text-black mb-2 font-semibold">
                Member Id
              </label>
              <div className="text-sm text-gray-800">123456789</div>
            </div>
            <div>
              <label className="block text-sm text-black mb-2 font-semibold">
                Thrive Reward Points
              </label>
              <div className="text-sm text-gray-800 flex items-center gap-4">
                50{" "}
                <span className="flex items-center gap-1 text-sm text-white border bg-black border-black rounded px-2 py-1">
                    Add more <GoPlusCircle className="text-xl cursor-pointer text-white" />
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-black mb-2 font-semibold">
                Countdown of days left
              </label>
              <div className="text-sm text-gray-800">80 Days</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
