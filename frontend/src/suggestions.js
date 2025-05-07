import React, { useState } from "react";
import "./index.css";

const ProductSuggester = () => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const products = [
    { name: "Laptop", image: "/images/laptop.jpg" },
    { name: "Mouse", image: "/images/mouse.jpg" },
    { name: "Keyboard", image: "/images/keyboard.jpg" },
    { name: "Headphones", image: "/images/headphone.jpg" },
    { name: "Monitor", image: "/images/monitor.jpg" },
  ];

  const toggleSelection = (product) => {
    setSelectedItems((prev) =>
      prev.includes(product)
        ? prev.filter((p) => p !== product)
        : [...prev, product]
    );
  };

  const getSuggestions = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/suggest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ selectedItems }),
      });

      if (!response.ok) {
        throw new Error("Failed to get suggestions");
      }

      const data = await response.json();
      setSuggestions(data);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    }
  };

  return (
    <div className="product-suggester-container">
      <h1 className="title">Chọn sản phẩm để nhận gợi ý</h1>

      {/* Hiển thị sản phẩm nằm ngang và có thanh cuộn */}
      <div className="product-container">
        {products.map((product) => (
          <div
            key={product.name}
            className={`product-item ${
              selectedItems.includes(product.name) ? "selected" : ""
            }`}
          >
            <label>
              <input
                type="checkbox"
                checked={selectedItems.includes(product.name)}
                onChange={() => toggleSelection(product.name)}
                className="product-checkbox"
              />
              <img
                src={product.image}
                alt={product.name}
                className="product-image"
              />
              <span className="product-name">{product.name}</span>
            </label>
          </div>
        ))}
      </div>

      <div className="button-container">
        <button onClick={getSuggestions} className="suggest-button">
          Gợi ý sản phẩm
        </button>
      </div>

      <h2 className="suggestions-title">Gợi ý mua thêm:</h2>
      <div className="suggestions-container">
        {suggestions.length > 0 ? (
          <div className="suggestions-list">
            {suggestions.map((sug, index) => (
              <div key={index} className="suggestion-item">
                <h3 className="suggestion-name">
                  {sug.items.join(", ")}{" "}
                  <span className="support-text">
                    (Support: {(sug.support * 100).toFixed(2)}%)
                  </span>
                </h3>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-suggestions">Không có gợi ý.</p>
        )}
      </div>
    </div>
  );
};

export default ProductSuggester;
