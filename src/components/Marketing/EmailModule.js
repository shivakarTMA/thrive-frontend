import React, { useState } from "react";
import EmailCriteriaForm from "./EmailCriteriaForm";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { MdOutlineKeyboardBackspace } from "react-icons/md";

const EmailModule = () => {

  return (
    <div className="page--content">
      <div className=" flex items-end justify-between gap-2 mb-0">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > Marketing > Send Email`}</p>
          <h1 className="text-3xl font-semibold">Send Email</h1>
        </div>
      </div>
      <Link
        to="/reports/marketing-reports/email-list"
        className="flex items-center gap-2 mt-5 mb-3 cursor-pointer border rounded-full w-fit border-black px-3 py-1 bg-black text-white"
      >
        <MdOutlineKeyboardBackspace /> <span>Back</span>
      </Link>
      <EmailCriteriaForm />
    </div>
  );
};

export default EmailModule;
