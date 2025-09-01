import React, { useEffect, useState } from "react";
import { FaCamera } from "react-icons/fa";
import { FiEdit2, FiSave } from "react-icons/fi";
import { GoPlusCircle } from "react-icons/go";
import { dummyServices } from "../../DummyData/DummyData";

const ServiceCard = ({ member }) => {
  const [profile, setProfile] = useState(member);
  const [activeTab, setActiveTab] = useState("Active");

  const filteredServices = dummyServices.filter(
    (service) => service.status === activeTab
  );

  useEffect(() => {
    setProfile(member);
  }, [member]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-primarylight p-4 rounded">
      <div className="flex flex-col gap-6">
        <div className="flex-1 flex w-full gap-5">
          <div className="w-full max-w-[50px] h-[50px] bg-primarycolor relative rounded-[100%]">
            <img
              src={profile.profileImage}
              alt="Profile"
              className="w-full h-full object-cover object-center rounded-[100%]"
            />
          </div>
          <div className="p-0 text-sm w-full flex gap-5 items-center">
            <p className="flex items-center gap-2 justify-between gap-3">
              <strong>Current Status:</strong>{" "}
              <span className="bg-green-500 text-white w-auto flex items-center justify-center max-w-fit px-3 py-1 rounded">
                Active
              </span>
            </p>
            <p className="flex items-center gap-2 justify-between gap-3">
              <strong>Member Since:</strong> 24-04-2025
            </p>
            <p className="flex items-center gap-2 justify-between gap-3">
              <strong>Member ID:</strong> 098567
            </p>
          </div>
        </div>

        <div>
          {/* Tabs */}
          <div className="flex gap-4 mb-4 pl-2">
            <button
              type="button"
              onClick={() => setActiveTab("Active")}
              className={`flex items-center gap-1 ${
                activeTab == "Active"
                  ? "text-black underline"
                  : "text-gray-500"
              }`}
            >
              Active
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("Expired")}
              className={`flex items-center gap-1 ${
                activeTab == "Expired"
                  ? "text-black underline"
                  : "text-gray-500"
              }`}
            >
              Expired
            </button>
          </div>

          {/* Service Cards */}
          {filteredServices.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="border rounded-2xl p-6 shadow-lg bg-white hover:shadow-2xl transition-all relative"
                >
                  {/* Service header */}
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">
                      {service.serviceName}
                    </h3>
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium ${
                        service.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {service.status}
                    </span>
                  </div>

                  {/* Grid for details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-black font-semibold">Variation</p>
                      <p className="text-gray-800">
                        {service.serviceVariation}
                      </p>
                    </div>
                    <div>
                      <p className="text-black font-semibold">Service ID</p>
                      <p className="text-gray-800">{service.serviceId}</p>
                    </div>
                    <div>
                      <p className="text-black font-semibold">Duration</p>
                      <p className="text-gray-800">{service.duration}</p>
                    </div>
                    <div>
                      <p className="text-black font-semibold">Price</p>
                      <p className="text-gray-800">{service.price}</p>
                    </div>
                    <div>
                      <p className="text-black font-semibold">Sessions</p>
                      <p className="text-gray-800">
                        {service.sessionsTaken}/{service.sessions}
                      </p>
                    </div>
                    <div>
                      <p className="text-black font-semibold">Countdown</p>
                      <p className="text-gray-800">{service.countdown}</p>
                    </div>
                    <div>
                      <p className="text-black font-semibold">Start Date</p>
                      <p className="text-gray-800">{service.startDate}</p>
                    </div>
                    <div>
                      <p className="text-black font-semibold">End Date</p>
                      <p className="text-gray-800">{service.endDate}</p>
                    </div>
                  </div>

                  {/* Thrive Coins */}
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-black font-semibold">Thrive Coins</p>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-800 font-semibold">
                        {service.thriveCoins}
                      </span>
                      <button className="flex items-center gap-1 text-sm text-white border bg-black rounded-full px-3 py-1 hover:bg-gray-800 transition">
                        Add more
                        <GoPlusCircle className="text-lg cursor-pointer text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Footer info */}
                  <div className="mt-6 border-t pt-3 flex justify-between text-xs text-black">
                    <span>Last Visited: {service.lastVisited}</span>
                    <span>ID: {service.serviceId}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-black">No {activeTab} services available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
