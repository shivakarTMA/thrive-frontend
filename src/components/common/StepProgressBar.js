import React from "react";
import { FaCheck } from "react-icons/fa";

const StepProgressBar = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex flex-col items-center relative max-w-[180px] mx-auto w-full p-6 border-r">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <div key={index} className="flex flex-col items-end relative">
            {/* Line above */}
            {/* {index !== 0 && (
              <div
                className={`w-1 h-6 ${
                  isCompleted ? "bg-black" : "bg-gray-300"
                }`}
              />
            )} */}

            <div className="flex items-center gap-2">
              {/* Step label */}
              <span
                className={`text-lg font-semibold ${
                  isActive
                    ? "text-black"
                    : isCompleted
                    ? "text-black"
                    : "text-gray-300"
                }`}
              >
                {/* Step */}
              </span>

              {/* Step circle */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-extrabold ${
                  isActive || isCompleted
                    ? "bg-black text-white"
                    : "bg-gray-300 text-white"
                }`}
              >
                {/* {index + 1} */}
                {isActive || isCompleted ? <FaCheck /> : index + 1}
                {/* <FaCheck /> */}
              </div>
            </div>

            {/* Line below */}
            {index !== totalSteps - 1 && (
              <div
                className={`mr-[21px] w-1 h-10 ${
                  index < currentStep ? "bg-black" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepProgressBar;
