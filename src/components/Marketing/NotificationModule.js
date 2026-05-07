import React, { useState } from "react";
import NotificationCriteriaForm from "./NotificationCriteriaForm";
import { Link } from "react-router-dom";
import { MdOutlineKeyboardBackspace } from "react-icons/md";

const NotificationModule = () => {

  return (
    <div className="page--content">
      <div className=" flex items-end justify-between gap-2 mb-0">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > Marketing > Send Notification`}</p>
          <h1 className="text-3xl font-semibold">Send Notification</h1>
        </div>
      </div>
      <Link
        to="/reports/marketing-reports/notification-list"
        className="flex items-center gap-2 mt-5 mb-3 cursor-pointer border rounded-full w-fit border-black px-3 py-1 bg-black text-white"
      >
        <MdOutlineKeyboardBackspace /> <span>Back</span>
      </Link>
      <NotificationCriteriaForm />
    </div>
  );
};

export default NotificationModule;
