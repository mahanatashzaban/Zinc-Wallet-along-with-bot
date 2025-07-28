import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";

const CandlestickChartApex = ({ candleData }) => {
  const [chartType, setChartType] = useState("candlestick");

  const series = [
    {
      name: "Price",
      data: candleData.map((d) => ({
        x: new Date(d.x),
        y: [d.o, d.h, d.l, d.c],
      })),
    },
  ];

  const lineSeries = [
    {
      name: "Close Price",
      data: candleData.map((d) => [new Date(d.x), d.c]),
    },
  ];

  const options = {
    chart: {
      type: chartType,
      height: 500,
      background: "#000",
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
        autoSelected: "pan",
      },
      zoom: {
        enabled: true,
        type: "xy",
        autoScaleYaxis: true,
      },
      animations: {
        enabled: false,
      },
      pan: {
        enabled: true,
        type: "xy",
        cursor: "grab",
      },
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: "#00ff00",
          downward: "#ff0000",
        },
      },
    },
    xaxis: {
      type: "datetime",
      labels: {
        style: {
          colors: "#ccc",
        },
      },
    },
    yaxis: {
      tooltip: {
        enabled: true,
      },
      labels: {
        style: {
          colors: "#ccc",
        },
      },
    },
    theme: {
      mode: "dark",
    },
    grid: {
      borderColor: "#444",
    },
  };

  return (
    <div className="w-full">
      {/* Chart Type Switch */}
      <div className="flex gap-2 justify-end mb-2 text-white text-sm">
        <span>نوع نمودار:</span>
        <button
          onClick={() => setChartType("candlestick")}
          className={`px-2 py-1 rounded ${
            chartType === "candlestick" ? "bg-green-600" : "bg-gray-600"
          }`}
        >
          کندل
        </button>
        <button
          onClick={() => setChartType("line")}
          className={`px-2 py-1 rounded ${
            chartType === "line" ? "bg-green-600" : "bg-gray-600"
          }`}
        >
          خطی
        </button>
      </div>

      <ReactApexChart
        options={options}
        series={chartType === "line" ? lineSeries : series}
        type={chartType}
        height={500}
        width="100%"
      />
    </div>
  );
};

export default CandlestickChartApex;
