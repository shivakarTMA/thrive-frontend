import React, { useState } from "react";
import WhatsappCriteriaForm from "./WhatsappCriteriaForm";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { MdOutlineKeyboardBackspace } from "react-icons/md";

const WhatsappModule = () => {

  return (
    <div className="page--content">
      <div className=" flex items-end justify-between gap-2 mb-0">
        <div className="title--breadcrumbs">
          <h1 className="text-3xl font-semibold">Send Whatsapp</h1>
        </div>
      </div>
      <Link
        to="/whatsapp-template-list"
        className="flex items-center gap-2 mt-5 mb-3 cursor-pointer border rounded-full w-fit border-black px-3 py-1 bg-black text-white"
      >
        <MdOutlineKeyboardBackspace /> <span>Back</span>
      </Link>
      <WhatsappCriteriaForm />
    </div>
  );
};

export default WhatsappModule;
