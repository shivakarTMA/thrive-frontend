import React, { useRef } from "react";
import NotificationIcon from "../../assets/images/icon-notification.png";
import ViewAll from "../../assets/images/all-notification.svg";

const notifications = [
  {
    title: "New Lead Assigned",
    time: "2 mins ago",
    description:
      "A new lead has been assigned to you. Reach out to get started.",
  },
  {
    title: "Meeting Scheduled",
    time: "10 mins ago",
    description: "Your meeting with the client has been scheduled.",
  },
  {
    title: "Lead Updated",
    time: "1 hour ago",
    description: "Lead information has been updated successfully.",
  },
];

const NotificationDropdown = ({ setNotificationList }) => {
  const notificationRef = useRef(null);

  const handleOverlayClick = (e) => {
    if (
      notificationRef.current &&
      !notificationRef.current.contains(e.target)
    ) {
      setNotificationList(false);
    }
  };

  return (
    <div
      onClick={handleOverlayClick}
      className="w-full h-full fixed top-0 left-0 z-[999]"
    >
      <div
        className="nofication--dropdown  bg-white w-full max-w-[390px] absolute top-[70px] right-0 mt-[1px] shadow-lg"
        ref={notificationRef}
      >
        <div className="border-b border-[#D4D4D4] p-3 flex items-center gap-2 justify-between">
          <div className="font-semibold text-black">
            <span>Notifications</span>
          </div>
          <div className="cursor-pointer bg-[#F1F1F1] rounded-[5px] w-[28px] h-[28px] flex items-center justify-center">
            <img src={ViewAll} width={15} height={15} alt="" />
          </div>
        </div>
        <div>
          <span className="font-[500] text-[#949494] text-sm block p-3 pb-0">
            Today
          </span>

          <div>
            {notifications.map((item, index) => (
              <div
                key={index}
                className={`flex gap-[10px] p-3 notification--item border-b border-[#D4D4D4]
              ${index === notifications.length - 1 ? "border-b-0" : ""}`}
              >
                <div className="w-[36px]">
                  <img src={NotificationIcon} width={36} height={36} alt="" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 justify-between w-full">
                    <span className="text-black font-[500] block text-md">
                      {item.title}
                    </span>
                    <span className="text-[#949494] text-sm font-[400] block">
                      {item.time}
                    </span>
                  </div>

                  <p className="text-[#949494] leading-[normal] text-md">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDropdown;
