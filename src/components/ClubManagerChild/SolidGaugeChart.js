import React, { useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsMore from "highcharts/highcharts-more.js";
import SolidGauge from "highcharts/modules/solid-gauge.js";
import { LiaAngleLeftSolid, LiaAngleRightSolid } from "react-icons/lia";

// Initialize Highcharts modules
if (typeof HighchartsMore === "function") HighchartsMore(Highcharts);
if (typeof SolidGauge === "function") SolidGauge(Highcharts);

// Sample monthly data
const monthlyData = {
  "2025-09": { overallTarget: 400000, achieved: 160000 },
  "2025-08": { overallTarget: 350000, achieved: 250000 },
  "2025-07": { overallTarget: 200000, achieved: 100000 },
  "2025-06": { overallTarget: 350000, achieved: 250000 },
  "2025-05": { overallTarget: 350000, achieved: 250000 },
};

const formatMonth = (monthKey) => {
  const [year, month] = monthKey.split("-");
  const date = new Date(year, month - 1); // month is zero-based in JS Date
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
};

export default function SolidGaugeChart() {
  const sortedMonths = Object.keys(monthlyData).sort((a, b) =>
    a < b ? 1 : -1
  ); // Most recent first
  const [currentIndex, setCurrentIndex] = useState(0); // Index of selected month
  const selectedMonth = sortedMonths[currentIndex]; // Get selected month key

  const { overallTarget, achieved } = monthlyData[selectedMonth];
  const completionPercent = overallTarget
    ? Math.round((achieved / overallTarget) * 100)
    : 0;

  const chartOptions = {
    chart: {
      type: "solidgauge",
      height: 180, 
      spacingBottom: 0,
      margin: [0, 0, 0, 0],
    },
    credits: {
      enabled: false,
    },
    title: null,
    pane: {
     center: ["50%", "80%"], 
      size: "130%",  
      startAngle: -90,
      endAngle: 90,
      background: {
        backgroundColor: "#EEE",
        innerRadius: "60%",
        outerRadius: "100%",
        shape: "arc",
      },
    },
    yAxis: {
      min: 0,
      max: 100,
      stops: [
        [
          1,
          {
            linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
            stops: [
              [0, "#009EB2"], // Gradient start color
              [1, "#EC71BC"], // Gradient end color
            ],
          },
        ],
      ],
      lineWidth: 0,
      tickWidth: 0,
      minorTickInterval: null,
      tickAmount: null,
      labels: { enabled: false },
    },
    series: [
      {
        name: "Completion",
        data: [completionPercent],
        dataLabels: {
          format:
            "<div style='text-align:center'><span style='font-size:35px'>{y}%</span></div>",
          borderWidth: 0,
          y: -18,
        },
      },
    ],
  };

  // Handle previous/next month navigation
  const handleMonthChange = (direction) => {
    if (direction === "prev" && currentIndex < sortedMonths.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    if (direction === "next" && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="text-center w-full">
      <p className="text-lg font-[600] mb-3 text-center">Target Completion </p>

      {/* Month navigation */}
      <div className="flex justify-between gap-3 items-center rounded-full bg-[#F1F1F1] px-3 py-2">
        <button
          onClick={() => handleMonthChange("prev")}
          className={`${
            currentIndex === sortedMonths.length - 1
              ? "opacity-0 invisible"
              : ""
          }`}
        >
          <LiaAngleLeftSolid />
        </button>
        <span>{formatMonth(selectedMonth)}</span>
        <button
          onClick={() => handleMonthChange("next")}
          className={`${currentIndex === 0 ? "opacity-0 invisible" : ""}`}
        >
          <LiaAngleRightSolid />
        </button>
      </div>

      {/* Solid gauge chart */}
      <HighchartsReact highcharts={Highcharts} options={chartOptions} />

      {/* Display target information */}
      <div className="flex justify-between mt-0">
        <div className="w-full border-r border-r-[#D4D4D4]">
          <div className="font-[500] text-black text-sm">Overall Target</div>
          <div className="font-[700] text-black text-2xl">{overallTarget.toLocaleString()}</div>
        </div>
        <div className="w-full">
          <div className="font-[500] text-black text-sm">Target Achieved</div>
          <div className="font-[700] text-black text-2xl">{achieved.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
