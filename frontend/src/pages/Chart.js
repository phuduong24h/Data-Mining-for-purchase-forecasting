import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ChartPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [topMonth, setTopMonth] = useState(null);
  const [topProductByMonth, setTopProductByMonth] = useState({});
  const [selectedMonthProduct, setSelectedMonthProduct] = useState(null);

  const viLocale = {
    months: [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ],
    monthNumbers: {
      "Tháng 1": 1,
      "Tháng 2": 2,
      "Tháng 3": 3,
      "Tháng 4": 4,
      "Tháng 5": 5,
      "Tháng 6": 6,
      "Tháng 7": 7,
      "Tháng 8": 8,
      "Tháng 9": 9,
      "Tháng 10": 10,
      "Tháng 11": 11,
      "Tháng 12": 12,
    },
  };

  useEffect(() => {
    const processData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/data/cleaned_online_retail.csv");
        const text = await response.text();
        const rows = text.split("\n");

        const data = rows
          .slice(1)
          .filter((row) => row.trim())
          .map((row) => {
            const [invoiceNo, stockCode, description, quantity, invoiceDate] =
              row.split(",");
            return {
              date: invoiceDate ? invoiceDate.split(" ")[0] : null,
              description,
              quantity: parseInt(quantity),
            };
          })
          .filter((item) => item.date && !isNaN(item.quantity));

        const targetYear = 2024;

        const initialSalesByMonth = {};
        const productByMonth = {};

        viLocale.months.forEach((month) => {
          const key = `${month} ${targetYear}`;
          initialSalesByMonth[key] = 0;
          productByMonth[key] = {};
        });

        data.forEach((item) => {
          const date = new Date(item.date);
          if (date.getFullYear() === targetYear) {
            const monthKey = `${
              viLocale.months[date.getMonth()]
            } ${targetYear}`;
            initialSalesByMonth[monthKey] += item.quantity;

            const productName = item.description?.trim();
            if (productName) {
              productByMonth[monthKey][productName] =
                (productByMonth[monthKey][productName] || 0) + item.quantity;
            }
          }
        });

        const sortedMonths = Object.keys(initialSalesByMonth).sort(
          (a, b) =>
            viLocale.monthNumbers[a.split(" ")[0]] -
            viLocale.monthNumbers[b.split(" ")[0]]
        );

        const monthValues = sortedMonths.map(
          (month) => initialSalesByMonth[month]
        );

        // Tìm tháng bán nhiều nhất
        const maxQuantity = Math.max(...monthValues);
        const topSellingMonth = sortedMonths.find(
          (month) => initialSalesByMonth[month] === maxQuantity
        );

        // Tìm sản phẩm bán chạy nhất mỗi tháng
        const topProductMap = {};
        for (const month of sortedMonths) {
          const products = productByMonth[month];
          const topProduct = Object.entries(products).sort(
            (a, b) => b[1] - a[1]
          )[0];
          if (topProduct) {
            topProductMap[month] = {
              name: topProduct[0],
              quantity: topProduct[1],
            };
          }
        }

        setTopProductByMonth(topProductMap);
        setChartData({
          labels: sortedMonths,
          datasets: [
            {
              label: "Số lượng sản phẩm bán ra",
              data: monthValues,
              backgroundColor: "rgba(53, 162, 235, 0.5)",
              borderColor: "rgba(53, 162, 235, 1)",
              borderWidth: 1,
              hoverBackgroundColor: "rgba(53, 162, 235, 0.7)",
              barPercentage: 0.8,
              categoryPercentage: 0.9,
            },
          ],
        });
        setTopMonth(topSellingMonth);
      } catch (err) {
        console.error("Lỗi xử lý dữ liệu:", err);
        setError("Không thể xử lý dữ liệu CSV");
      } finally {
        setLoading(false);
      }
    };

    processData();
  }, []);

  const handleClick = (event, elements) => {
    if (elements.length === 0) return;
    const monthIndex = elements[0].index;
    const clickedMonth = chartData.labels[monthIndex];
    const topProduct = topProductByMonth[clickedMonth];
    if (topProduct) {
      setSelectedMonthProduct({
        month: clickedMonth,
        ...topProduct,
      });
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: handleClick,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Thống kê số lượng sản phẩm bán ra theo tháng năm 2024",
        font: { size: 18, weight: "bold" },
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `Số lượng: ${context.parsed.y.toLocaleString("vi-VN")} sản phẩm`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { display: true, color: "rgba(0, 0, 0, 0.1)" },
        ticks: {
          font: { size: 12 },
          callback: (value) => value.toLocaleString("vi-VN"),
        },
        title: {
          display: true,
          text: "Số lượng sản phẩm",
          font: { size: 14, weight: "bold" },
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 12 },
          maxRotation: 45,
          minRotation: 45,
        },
        title: {
          display: true,
          text: "Tháng",
          font: { size: 14, weight: "bold" },
        },
      },
    },
  };

  return (
    <div style={{ padding: "20px", marginBottom: "100px" }}>
      <div
        style={{
          height: "550px",
          width: "90%",
          margin: "0 auto",
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <Bar options={options} data={chartData} />
        {topMonth && (
          <p
            style={{ textAlign: "center", marginTop: "20px", fontSize: "16px" }}
          >
            ✅ <strong>{topMonth}</strong> là tháng bán được nhiều sản phẩm
            nhất.
          </p>
        )}
        {selectedMonthProduct && (
          <div
            style={{
              marginTop: "30px",
              textAlign: "center",
              fontSize: "16px",
            }}
          >
            📌 Sản phẩm bán chạy nhất trong{" "}
            <strong>{selectedMonthProduct.month}</strong>:<br />
            <strong>{selectedMonthProduct.name}</strong> (
            {selectedMonthProduct.quantity.toLocaleString("vi-VN")} sản phẩm)
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartPage;
