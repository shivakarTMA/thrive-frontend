import React, { useState } from "react";
import { FiPlus } from "react-icons/fi";
import CreateService from "./CreateService";

const ServicesAddons = () => {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
    <div className="page--content">
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > All Services`}</p>
          <h1 className="text-3xl font-semibold">All Services</h1>
        </div>
        <div className="flex items-end gap-2">
          <button
            type="button"
            className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
            onClick={() => setShowModal(true)}
          >
            <FiPlus /> Create Service
          </button>
        </div>
      </div>
    </div>
    {showModal && <CreateService setShowModal={setShowModal} showModal={showModal} />}
    </>
  );
};

export default ServicesAddons;
