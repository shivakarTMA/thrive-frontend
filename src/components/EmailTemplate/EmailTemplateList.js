import React, { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import Tooltip from "../common/Tooltip";
import { FaCircle } from "react-icons/fa6";
import { authAxios } from "../../config/config";
import { Link } from "react-router-dom";
import editIcon from "../../assets/images/icons/edit.svg";
import deleteIcon from "../../assets/images/icons/delete.svg";

const emailtemlateOption = [
  {
    id: "01",
    templateName: "Gym Offer",
    subject: "Your Fitness Journey Starts Here — Special Deal",
    dateCreated: "18 Oct, 2025",
  },
  {
    id: "02",
    templateName: "Renewal",
    subject: "Your Membership is About to Expire — Renew & Stay Consistent",
    dateCreated: "18 Oct, 2025",
  },
  {
    id: "03",
    templateName: "New Year Offer",
    subject: "Kick Off the New Year Right — Limited-Time Fitness Offer",
    dateCreated: "17 Oct, 2025",
  },
  {
    id: "04",
    templateName: "Important Updates",
    subject: "Please Review: Important Membership Information",
    dateCreated: "16 Oct, 2025",
  },
];

const EmailTemplateList = () => {
  const [packages, setPackages] = useState(emailtemlateOption);

  // const fetchProductList = async () => {
  //   try {
  //     const res = await authAxios().get("/product/list");
  //     const responseData = res.data;
  //     const data = responseData?.data || [];

  //     setPackages(data);
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Package not found");
  //   }
  // };

  // // Initial fetch
  // useEffect(() => {
  //   fetchProductList();
  // }, []);

  return (
    <div className="page--content">
      <div className="flex items-end justify-between gap-2 mb-6">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home >  Marketing >  Templates > Email Templates`}</p>
          <h1 className="text-3xl font-semibold">Email Templates</h1>
        </div>
        <div className="flex items-end gap-2">
          <Link
            to="/email-template/"
            className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
          >
            <FiPlus /> Create Template
          </Link>
        </div>
      </div>

      <div className="box--shadow bg-white rounded-[15px] p-4">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                {/* <th className="px-2 py-4">Module ID</th> */}
                <th className="px-2 py-4">S.No.</th>
                <th className="px-2 py-4">Template Name</th>
                <th className="px-2 py-4">Subject</th>
                <th className="px-2 py-4">Date Created</th>
                <th className="px-2 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {packages.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    No packages added yet.
                  </td>
                </tr>
              ) : (
                packages.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className="group bg-white border-b hover:bg-gray-50 relative transition duration-700"
                  >
                    <td className="px-2 py-4">{item?.id || "—"}</td>
                    <td className="px-2 py-4">{item?.templateName}</td>
                    <td>{item?.subject}</td>
                    <td>{item?.dateCreated}</td>
                    <td className="px-2 py-4">
                      <div className="flex">
                        <Tooltip
                          id={`tooltip-edit-${item.id}`}
                          content="Edit Template"
                          place="left"
                        >
                        <Link to={`/email-template/${item?.id}`} className="bg-[#F1F1F1] border border-[#D4D4D4] rounded-l-[5px] w-[32px] h-[32px] flex items-center justify-center cursor-pointer">
                          <img src={editIcon} />
                        </Link>
                        </Tooltip>
                        <Tooltip
                          id={`tooltip-delete-${item.id}`}
                          content="Delete Template"
                          place="left"
                        >
                        <div
                          className={`bg-[#F1F1F1] border border-[#D4D4D4] rounded-r-[5px] w-[32px] h-[32px] flex items-center justify-center cursor-pointer`}
                        >
                          <img src={deleteIcon} />
                        </div>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateList;
