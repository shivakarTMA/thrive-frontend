import React, { useState } from "react";
import CreateDietPlan from "./CreateDietPlan";
import ConfirmPopup from "../common/ConfirmPopup";
import { FiPlus } from "react-icons/fi";
import Tooltip from "../common/Tooltip";
import { LiaEdit } from "react-icons/lia";
import { RiDeleteBin6Fill } from "react-icons/ri";

const DietPlanList = () => {
  const [showModal, setShowModal] = useState(false);
  const [dietPlans, setDietPlans] = useState([]);
  const [editPlan, setEditPlan] = useState(null);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);

  const handleAddOrUpdatePlan = (newPlan) => {
    setDietPlans((prevPlans) => {
      const existingIndex = prevPlans.findIndex((p) => p.id === newPlan.id);
      if (existingIndex !== -1) {
        const updated = [...prevPlans];
        updated[existingIndex] = newPlan;
        return updated;
      }
      return [...prevPlans, newPlan];
    });
    setEditPlan(null);
  };

  const handleEdit = (plan) => {
    setEditPlan(plan);
    setShowModal(true);
  };

  const handleDeleteClick = (plan) => {
    setPlanToDelete(plan);
    setShowConfirmPopup(true);
  };

  const handleConfirmDelete = () => {
    setDietPlans((prevPlans) =>
      prevPlans.filter((plan) => plan.id !== planToDelete.id)
    );
    setPlanToDelete(null);
    setShowConfirmPopup(false);
  };

  const handleCancelDelete = () => {
    setPlanToDelete(null);
    setShowConfirmPopup(false);
  };

  return (
    <div className="page--content">
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > All Diet Plan`}</p>
          <h1 className="text-3xl font-semibold">All Diet Plan</h1>
        </div>
        <button
          type="button"
          className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
          onClick={() => {
            setEditPlan(null);
            setShowModal(true);
          }}
        >
          <FiPlus /> Add Exercise
        </button>
      </div>

      <div className="box--shadow bg-white rounded-[15px] p-4">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-2 py-4">S.NO</th>
                <th className="px-2 py-4">Plan Name</th>
                <th className="px-2 py-4">File</th>
                <th className="px-2 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dietPlans.map((plan, index) => (
                <tr
                  key={plan.id}
                  className="group bg-white border-b hover:bg-gray-50 transition duration-700 relative"
                >
                  <td className="px-2 py-4">{index + 1}</td>
                  <td className="px-2 py-4">{plan.dietPlanName}</td>
                  <td className="px-2 py-4">
                    {plan.dietPlanFile?.name || "N/A"}
                  </td>
                  <td className="px-2 py-4">
                    <div className="flex">
                      <Tooltip
                        id={`edit-diet-plan-${plan.id}`}
                        content="Edit Diet Plan"
                        place="top"
                      >
                        <div
                          onClick={() => handleEdit(plan)}
                          className="p-1 cursor-pointer"
                        >
                          <LiaEdit className="text-[25px] text-black" />
                        </div>
                      </Tooltip>
                      <Tooltip
                        id={`delete-diet-plan-${plan.id}`}
                        content="Delete Diet Plan"
                        place="top"
                      >
                        <div
                          onClick={() => handleDeleteClick(plan)}
                          className="p-1 cursor-pointer"
                        >
                          <RiDeleteBin6Fill className="text-[25px] text-black" />
                        </div>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <CreateDietPlan
          setShowModal={setShowModal}
          onDietPlanCreated={handleAddOrUpdatePlan}
          initialData={editPlan}
        />
      )}

      {/* Confirm Delete Popup */}
      {showConfirmPopup && planToDelete && (
        <ConfirmPopup
          message={`Are you sure you want to delete "${planToDelete.dietPlanName}"?`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
};

export default DietPlanList;
