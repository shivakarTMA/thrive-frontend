import React, { useEffect, useRef, useState } from "react";
import NotificationIcon from "../../assets/images/icon-notification.png";
import ViewAll from "../../assets/images/all-notification.svg";
import { authAxios } from "../../config/config";

const NotificationDropdown = ({
  setNotificationList,
  setUnreadCount,
  todayNotifications,
  olderNotifications,
  handleShowMore,
  page,
  totalPage,
  loading,
}) => {
  const notificationRef = useRef(null);

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);

    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return "Just now";

    const minutes = Math.floor(diffInSeconds / 60);
    if (minutes < 60) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;

    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

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
        </div>
        <div className="max-h-[calc(100vh-115px)] overflow-auto">
          {todayNotifications.length > 0 && (
            <>
              <span className="font-[500] text-[#949494] text-sm block p-3 pb-0">
                Today
              </span>
              <div>
                {todayNotifications.map((item, index) => (
                  <div
                    key={index}
                    className={`flex gap-[10px] p-3 notification--item border-b border-[#D4D4D4]
              ${index === todayNotifications.length - 1 ? "border-b-0" : ""}`}
                  >
                    <div className="w-[36px]">
                      <img
                        src={NotificationIcon}
                        width={36}
                        height={36}
                        alt=""
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 justify-between w-full">
                        <span className="text-black font-[500] block text-md">
                          {item.subject}
                        </span>
                        <span className="text-[#949494] text-sm font-[400] block">
                          {getTimeAgo(item.createdAt)}
                        </span>
                      </div>

                      <p className="text-[#949494] leading-[normal] text-md">
                        {item.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {olderNotifications.length > 0 && (
            <>
              <span className="font-[500] text-[#949494] text-sm block p-3 pb-0">
                Earlier
              </span>
              <div>
                {olderNotifications.map((item, index) => (
                  <div
                    key={index}
                    className={`flex gap-[10px] p-3 notification--item border-b border-[#D4D4D4]
              ${index === olderNotifications.length - 1 ? "border-b-0" : ""}`}
                  >
                    <div className="w-[36px]">
                      <img
                        src={NotificationIcon}
                        width={36}
                        height={36}
                        alt=""
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 justify-between w-full">
                        <span className="text-black font-[500] block text-md">
                          {item.subject}
                        </span>
                        <span className="text-[#949494] text-sm font-[400] block">
                          {getTimeAgo(item.createdAt)}
                        </span>
                      </div>

                      <p className="text-[#949494] leading-[normal] text-md">
                        {item.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {page < totalPage && (
            <div className="p-3 text-center border-t border-[#D4D4D4]">
              <button
                onClick={handleShowMore}
                className="text-black text-sm font-medium underline"
                disabled={loading}
              >
                {loading ? "Loading..." : "Show More"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationDropdown;
