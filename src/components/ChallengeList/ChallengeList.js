import React, { useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Tooltip from "../common/Tooltip";
import { LiaEdit } from "react-icons/lia";
import ChallengeForm from "./ChallengeForm";
import { formatDate } from "../../Helper/helper";

const ChallengeList = () => {
  const [showModal, setShowModal] = useState(false);
  const [challenges, setChallenges] = useState([]);
  const [editingOption, setEditingOption] = useState(null);
  const leadBoxRef = useRef(null);

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setShowModal(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      image: "",
      name: "",
      shortDescription: "",
      description: "",
      goalTitle: "",
      goalDescription: "",
      totalParticipants: "",
      durationStart: "",
      durationEnd: "",
      challengeCondition: "",
      rewards: [
        { place: "First Prize", coins: "" },
        { place: "Second Prize", coins: "" },
        { place: "Third Prize", coins: "" },
      ],
      aboutChallenge: "",
    },
    validationSchema: Yup.object({
      image: Yup.mixed().required("Image is required"),
      name: Yup.string().required("Challenge name is required"),
      shortDescription: Yup.string().required("Short description is required"),
      description: Yup.string().required("Description is required"),
      goalTitle: Yup.string().required("Goal title is required"),
      goalDescription: Yup.string().required("Goal description is required"),
      totalParticipants: Yup.number()
        .typeError("Must be a number")
        .positive("Must be positive")
        .required("Total participants is required"),
      durationStart: Yup.date().required("Start date is required"),
      durationEnd: Yup.date()
        .min(Yup.ref("durationStart"), "End date can't be before start date")
        .required("End date is required"),
      challengeCondition: Yup.string().required(
        "Challenge condition is required"
      ),
      rewards: Yup.array().of(
        Yup.object({
          coins: Yup.number()
            .typeError("Must be a number")
            .positive("Must be positive")
            .required("Coin amount is required"),
        })
      ),
      aboutChallenge: Yup.string().required("About challenge is required"),
    }),
    onSubmit: (values, { resetForm }) => {
      const now = new Date().toISOString();

      if (editingOption) {
        setChallenges((prev) =>
          prev.map((c) =>
            c.id === editingOption.id ? { ...c, ...values, updated_at: now } : c
          )
        );
        toast.success("Updated Successfully");
      } else {
        const newChallenge = {
          id: Date.now(),
          ...values,
          created_at: now,
          updated_at: now,
        };
        setChallenges((prev) => [...prev, newChallenge]);
        toast.success("Created Successfully");
      }

      resetForm();
      setEditingOption(null);
      setShowModal(false);
    },
  });

  return (
    <div className="page--content">
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > All Challenges`}</p>
          <h1 className="text-3xl font-semibold">All Challenges</h1>
        </div>
        <button
          type="button"
          className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
          onClick={() => {
            setEditingOption(null);
            formik.resetForm();
            setShowModal(true);
          }}
        >
          <FiPlus /> Create Challenge
        </button>
      </div>
      <div className="box--shadow bg-white rounded-[15px] p-4">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-2 py-4">ID</th>
                <th className="px-2 py-4">Name</th>
                <th className="px-2 py-4">Goal</th>
                <th className="px-2 py-4">Participants</th>
                <th className="px-2 py-4">Start Dates</th>
                <th className="px-2 py-4">End Dates</th>
                <th className="px-2 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {challenges.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No challenge added yet.
                  </td>
                </tr>
              ) : (
                challenges.map((ch, index) => (
                  <tr
                    key={ch.id || index}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <td className="px-2 py-4">{ch.id}</td>
                    <td className="px-2 py-4">{ch.name}</td>
                    <td className="px-2 py-4">{ch.goalTitle}</td>
                    <td className="px-2 py-4">{ch.totalParticipants}</td>
                    <td className="px-2 py-4">
                      {formatDate(ch.durationStart)}
                    </td>
                    <td className="px-2 py-4">{formatDate(ch.durationEnd)}</td>
                    <td className="px-2 py-4">
                      <Tooltip
                        id={`tooltip-edit-${ch.id}`}
                        content="Edit Challenge"
                        place="left"
                      >
                        <div
                          className="p-1 cursor-pointer"
                          onClick={() => {
                            setEditingOption(ch);
                            formik.setValues({
                              ...formik.initialValues, // keep default structure
                              ...ch, // overwrite with challenge data
                              rewards:
                                ch.rewards ?? formik.initialValues.rewards, // keep rewards if missing
                            });
                            setShowModal(true);
                          }}
                        >
                          <LiaEdit className="text-[25px] text-black" />
                        </div>
                      </Tooltip>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ChallengeForm
          setShowModal={setShowModal}
          editingOption={editingOption}
          formik={formik}
          handleOverlayClick={handleOverlayClick}
          leadBoxRef={leadBoxRef}
        />
      )}
    </div>
  );
};

export default ChallengeList;
