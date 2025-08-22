import React, { useEffect, useState } from "react";
import { IoCloseCircle } from "react-icons/io5";
import { FaListUl, FaHashtag } from "react-icons/fa";
import { LuCalendar } from "react-icons/lu";
import { FiImage } from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { RiMedalLine } from "react-icons/ri";


const ChallengeForm = ({
  setShowModal,
  editingOption,
  formik,
  handleOverlayClick,
  leadBoxRef,
}) => {
  const [rewards, setRewards] = useState([
    { place: "First Prize", coins: "" },
    { place: "Second Prize", coins: "" },
    { place: "Third Prize", coins: "" },
  ]);

  const handleRewardChange = (index, value) => {
    const updated = [...rewards];
    updated[index].coins = value;
    setRewards(updated);
    formik.setFieldValue("rewards", updated); // keep in Formik values
  };

  useEffect(() => {
    if (formik.values.rewards && formik.values.rewards.length > 0) {
      setRewards(formik.values.rewards);
    }
  }, [formik.values.rewards]);

  return (
    <div
      className="bg--blur create--lead--container overflow-auto hide--overflow fixed top-0 left-0 z-[999] w-full bg-black bg-opacity-60 h-full"
      onClick={handleOverlayClick}
    >
      <div
        className="min-h-[70vh] w-[95%] max-w-5xl mx-auto mt-[100px] mb-[100px] container--leadbox rounded-[10px] flex flex-col"
        ref={leadBoxRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-t-[10px] flex gap-3 items-center justify-between py-4 px-4 border-b">
          <h2 className="text-xl font-semibold">
            {editingOption ? "Edit Challenge" : "Create Challenge"}
          </h2>
          <IoCloseCircle
            className="text-3xl cursor-pointer"
            onClick={() => {
              formik.resetForm({ values: formik.initialValues });
              setShowModal(false);
            }}
          />
        </div>

        <div className="flex-1">
          <form onSubmit={formik.handleSubmit} className="p-0 space-y-0">
            <div className="flex bg-white rounded-b-[10px]">
              <div className="p-6 flex-1">
                <div className="grid grid-cols-3 gap-4">
                  {/* Image */}
                  <div>
                    <label className="mb-2 block">
                      Image<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FiImage />
                      </span>
                      <input
                        type="file"
                        name="image"
                        onChange={(e) =>
                          formik.setFieldValue(
                            "image",
                            e.currentTarget.files[0]
                          )
                        }
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.image && formik.errors.image && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.image}
                      </p>
                    )}
                  </div>

                  {/* Name */}
                  <div>
                    <label className="mb-2 block">
                      Challenge Name<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FaListUl />
                      </span>
                      <input
                        type="text"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.name && formik.errors.name && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.name}
                      </p>
                    )}
                  </div>

                  {/* Goal */}
                  <div>
                    <label className="mb-2 block">
                      Goal Title<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FaListUl />
                      </span>
                      <input
                        type="text"
                        name="goalTitle"
                        value={formik.values.goalTitle}
                        onChange={formik.handleChange}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.goalTitle && formik.errors.goalTitle && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.goalTitle}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block">
                      Goal Description<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FaListUl />
                      </span>
                      <input
                        name="goalDescription"
                        value={formik.values.goalDescription}
                        onChange={formik.handleChange}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.goalDescription &&
                      formik.errors.goalDescription && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.goalDescription}
                        </p>
                      )}
                  </div>

                  {/* Duration */}

                  <div>
                    <label className="mb-2 block">
                      Start Date<span className="text-red-500">*</span>
                    </label>
                    <div className="custom--date relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <LuCalendar />
                      </span>
                      <DatePicker
                        selected={
                          formik.values.durationStart
                            ? new Date(formik.values.durationStart)
                            : null
                        }
                        onChange={(date) =>
                          formik.setFieldValue(
                            "durationStart",
                            date ? date.toISOString() : ""
                          )
                        }
                        onBlur={() =>
                          formik.setFieldTouched("durationStart", true)
                        }
                        className="input--icon"
                        dateFormat="yyyy-MM-dd"
                        minDate={new Date()}
                      />
                    </div>
                    {formik.touched.durationStart &&
                      formik.errors.durationStart && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.durationStart}
                        </p>
                      )}
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="mb-2 block">
                      End Date<span className="text-red-500">*</span>
                    </label>
                    <div className="custom--date relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <LuCalendar />
                      </span>
                      <DatePicker
                        selected={
                          formik.values.durationEnd
                            ? new Date(formik.values.durationEnd)
                            : null
                        }
                        onChange={(date) =>
                          formik.setFieldValue(
                            "durationEnd",
                            date ? date.toISOString() : ""
                          )
                        }
                        onBlur={() =>
                          formik.setFieldTouched("durationEnd", true)
                        }
                        className="input--icon"
                        dateFormat="yyyy-MM-dd"
                        minDate={
                          formik.values.durationStart
                            ? new Date(formik.values.durationStart)
                            : new Date()
                        }
                      />
                    </div>
                    {formik.touched.durationEnd &&
                      formik.errors.durationEnd && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.durationEnd}
                        </p>
                      )}
                  </div>

                  {/* Rewards */}
                  <div className="col-span-3">
                    <label className="block mb-2">
                      Rewards<span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {rewards.map((reward, index) => (
                        <div key={index}>
                          <div>
                          <div className="relative">
                            <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                              <RiMedalLine />
                            </span>
                            <input
                              type="number"
                              value={reward.coins}
                              onChange={(e) =>
                                handleRewardChange(index, e.target.value)
                              }
                              onBlur={() =>
                                formik.setFieldTouched(
                                  `rewards.${index}.coins`,
                                  true
                                )
                              }
                              // placeholder={`${reward.place} Coins`}
                              className="custom--input w-full input--icon"
                            />
                          </div>
                            <span className="text-sm text-gray-500">
                              {reward.place}
                            </span>
                          </div>
                          {formik.touched.rewards &&
                            formik.touched.rewards[index] &&
                            formik.touched.rewards[index].coins &&
                            formik.errors.rewards &&
                            formik.errors.rewards[index] &&
                            formik.errors.rewards[index].coins && (
                              <p className="text-red-500 text-sm">
                                {formik.errors.rewards[index].coins}
                              </p>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Participants */}
                  <div>
                    <label className="mb-2 block">
                      Total Participants <span className="text-red-500">*</span>
                    </label>
                     <div className="relative">
                            <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                              <FaHashtag />
                            </span>
                    <input
                      type="number"
                      name="totalParticipants"
                      value={formik.values.totalParticipants}
                      onChange={formik.handleChange}
                      className="custom--input w-full input--icon"
                    />
                    </div>
                    {formik.touched.totalParticipants &&
                      formik.errors.totalParticipants && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.totalParticipants}
                        </p>
                      )}
                  </div>

                  {/* Challenge Condition */}
                  <div>
                    <label className="mb-2 block">
                      Challenge Condition<span className="text-red-500">*</span>
                    </label>
                     <div className="relative">
                            <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                              <FaListUl />
                            </span>
                    <input
                      name="challengeCondition"
                      value={formik.values.challengeCondition}
                      onChange={formik.handleChange}
                      className="custom--input w-full input--icon"
                    />
                    </div>
                    {formik.touched.challengeCondition &&
                      formik.errors.challengeCondition && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.challengeCondition}
                        </p>
                      )}
                  </div>

                  {/* Short Description */}
                  <div>
                    <label className="mb-2 block">
                      Short Description<span className="text-red-500">*</span>
                    </label>
                      <div className="relative">
                            <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                              <FaListUl />
                            </span>
                    <input
                      name="shortDescription"
                      value={formik.values.shortDescription}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="custom--input w-full input--icon"
                    />
                    </div>
                    {formik.touched.shortDescription &&
                      formik.errors.shortDescription && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.shortDescription}
                        </p>
                      )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="mb-2 block">
                      Description<span className="text-red-500">*</span>
                    </label>
                        <div className="relative">
                            <span className="absolute top-[15px] left-[15px] z-[1]">
                              <FaListUl />
                            </span>
                    <textarea
                      name="description"
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="custom--input w-full input--icon"
                    />
                    </div>
                    {formik.touched.description &&
                      formik.errors.description && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.description}
                        </p>
                      )}
                  </div>

                  {/* About Challenge */}
                  <div className="col-span-2">
                    <label className="mb-2 block">
                      About the Challenge<span className="text-red-500">*</span>
                    </label>
                      <div className="relative">
                            <span className="absolute top-[15px] left-[15px] z-[1]">
                              <FaListUl />
                            </span>
                    <textarea
                      name="aboutChallenge"
                      value={formik.values.aboutChallenge}
                      onChange={formik.handleChange}
                      className="custom--input w-full input--icon"
                    />
                    </div>
                    {formik.touched.aboutChallenge &&
                      formik.errors.aboutChallenge && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.aboutChallenge}
                        </p>
                      )}
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 py-5 justify-end">
              <button
                type="button"
                onClick={() => {
                  formik.resetForm({ values: formik.initialValues });
                  setShowModal(false);
                }}
                className="px-4 py-2 bg-transparent border border-white text-white font-semibold rounded max-w-[150px] w-full"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-white text-black font-semibold rounded max-w-[150px] w-full"
              >
                {editingOption ? "Update" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChallengeForm;
