// src/components/CandlestickChartApex.jsx
import React from "react";
import ReactApexChart from "react-apexcharts";

const CandlestickChartApex = ({ candleData }) => {
  const options = {
    chart: {
      type: "candlestick",
      height: 350,
      background: "#000",
      toolbar: { show: true },
    },
    xaxis: {
      type: "datetime",
      labels: { style: { colors: "#ccc" } },
    },
    yaxis: {
      tooltip: { enabled: true },
      labels: { style: { colors: "#ccc" } },
    },
    theme: {
      mode: "dark",
    },
  };

  const series = [{ data: candleData }];

  return (
    <div>
      <ReactApexChart
        options={options}
        series={series}
        type="candlestick"
        height={350}
      />
    </div>
  );
};

export default CandlestickChartApex;
