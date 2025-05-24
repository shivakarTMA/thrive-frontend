import React from "react";

const StepProgressBar = ({ currentStep, totalSteps }) => {
  const percentage = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <div className="mb-0">
      {/* <div className="flex justify-between text-sm mb-1">
        <span>
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span>{percentage}%</span>
      </div> */}
      <div className="w-full bg-gray-200 h-2">
        <div
          className="h-2 bg-black transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default StepProgressBar;
