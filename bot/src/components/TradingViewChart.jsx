import React, { useEffect, useState } from "react";

const TradingViewChart = ({ showTrades, trades }) => {
  const [tvWidget, setTvWidget] = useState(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (window.TradingView) {
        const widget = new window.TradingView.widget({
          container_id: "tradingview_btc_chart",
          symbol: "BITFINEX:BTCUSD",
          interval: "15",
          theme: "dark",
          style: "1",
          width: "100%",
          height: 500,
          locale: "en",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          allow_symbol_change: true,
          hide_top_toolbar: false,
          hide_side_toolbar: false,
        });

        widget.onChartReady(() => {
          setTvWidget(widget);
        });
      }
    };

    document.body.appendChild(script);

    // Cleanup: remove script on unmount
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!tvWidget) return;

    // Clear previous shapes every time trades or showTrades changes
    tvWidget.chart().removeAllShapes();

    if (showTrades && trades.length > 0) {
      trades.forEach((trade) => {
        // Use trade.side if available, fallback to trade.type
        const side = trade.side || trade.type || "";

        tvWidget.chart().createShape(
          {
            time: Math.floor(new Date(trade.time).getTime() / 1000),
            price: trade.price,
          },
          {
            shape: side.toLowerCase() === "buy" ? "arrow_up" : "arrow_down",
            text: side.toLowerCase() === "buy" ? "خرید" : "فروش",
            color: side.toLowerCase() === "buy" ? "green" : "red",
            textColor: "#ffffff",
            size: 2,
            disableSelection: true,
            disableSave: true,
          }
        );
      });
    }
  }, [tvWidget, showTrades, trades]);

  return <div id="tradingview_btc_chart" />;
};

export default TradingViewChart;
