import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/index.css";
import { categories } from "../constants/categories";

const ProductSuggester = () => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const getCategoriesFromCart = (cartItems) => {
    const categoriesSet = new Set();

    categories.forEach((category) => {
      const hasProductInCart = category.items.some((item) =>
        cartItems.some((cartItem) => cartItem.name === item.name)
      );
      if (hasProductInCart) {
        categoriesSet.add(category.title);
      }
    });

    return Array.from(categoriesSet);
  };

  // Lấy sản phẩm trong giỏ hàng từ localStorage, cập nhật state khi component mount
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(storedCart);
  }, []);

  // Tự động gọi API gợi ý mỗi khi cartItems thay đổi
  useEffect(() => {
    const getSuggestions = async () => {
      let selectedCategories = [];

      if (cartItems.length > 0) {
        selectedCategories = getCategoriesFromCart(cartItems);
      } else {
        selectedCategories = categories.map((c) => c.title);
      }

      console.log("Selected categories for suggestion:", selectedCategories);

      try {
        const response = await fetch("http://localhost:3000/api/suggest", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ selectedItems: selectedCategories }),
        });

        if (!response.ok) {
          throw new Error("Failed to get suggestions");
        }

        const data = await response.json();
        setSuggestions(data);

        // Lấy tất cả item từ nhiều gợi ý
        const allItems = data.flatMap((sug) => sug.items);

        // Đếm tần suất từng item
        const itemCount = {};
        allItems.forEach((item) => {
          itemCount[item] = (itemCount[item] || 0) + 1;
        });

        // Tìm item có tần suất cao nhất
        const topItem = Object.entries(itemCount).reduce(
          (max, curr) => (curr[1] > max[1] ? curr : max),
          ["", 0]
        );

        console.log("🎯 Item gợi ý nhiều nhất:", topItem[0]);

        // Nếu bạn muốn lưu lại để sử dụng:
        // setTopSuggestedItem(topItem[0]);

        const allSuggestedProducts = data.flatMap((sug) => sug.items);
        setSelectedItems(allSuggestedProducts);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    };

    getSuggestions();
  }, [cartItems]);

  const toggleSelection = (productName) => {
    setSelectedItems((prev) =>
      prev.includes(productName)
        ? prev.filter((item) => item !== productName)
        : [...prev, productName]
    );
  };

  const handleAddToCart = (product) => {
    const cart = [...cartItems];
    const isExist = cart.find((item) => item.name === product.name);

    if (!isExist) {
      cart.push({ ...product, quantity: 1 });
      localStorage.setItem("cart", JSON.stringify(cart));
      setCartItems(cart);
      alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
    } else {
      alert(`"${product.name}" đã có trong giỏ hàng.`);
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="product-suggester">
      <div className="product-suggester__search-bar">
        <input
          type="text"
          placeholder="Tìm sản phẩm..."
          value={searchTerm}
          onChange={handleInputChange}
          className="product-suggester__search-input"
        />
        <button
          className="product-suggester_btn-clear"
          onClick={() => setSearchTerm("")}
        >
          Xoá
        </button>
      </div>

      {searchTerm && (
        <div className="product-suggester__search-results">
          <h2 className="product-suggester__search-title">Kết quả tìm kiếm:</h2>
          <div className="product-suggester__products-list product-suggester__products-list--horizontal">
            {categories
              .flatMap((cat) => cat.items)
              .filter((item) =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((product) => (
                <div
                  key={product.name}
                  className="product-suggester__product-item"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-suggester__product-image"
                  />
                  <span className="product-suggester__product-name">
                    {product.name}
                  </span>
                  <button
                    className="product-suggester__add-button"
                    onClick={() => handleAddToCart(product)}
                  >
                    Thêm vào giỏ hàng
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/*   
      <div className="product-suggester__cart-items">
        <h2 className="product-suggester__cart-title">
          Sản phẩm trong giỏ hàng:
        </h2>
        {cartItems.length > 0 ? (
          <ul className="product-suggester__cart-list">
            {cartItems.map((item, idx) => (
              <li key={idx} className="product-suggester__cart-item">
                {item.name} (x{item.quantity})
              </li>
            ))}
          </ul>
        ) : (
          <p className="product-suggester__cart-empty">
            Giỏ hàng hiện đang trống.
          </p>
        )}
      </div> */}

      {/* Hiển thị danh sách gợi ý */}
      <section className="product-suggester__suggestions">
        <h2 className="product-suggester__suggestions-title">
          Gợi ý mua thêm:
        </h2>
        <div className="product-suggester__suggestions-container product-suggester__products-list--horizontal">
          {suggestions.length === 0 && (
            <>
              {(() => {
                const defaultCategory = categories.find(
                  (c) => c.title === "Tablet"
                );
                if (!defaultCategory) return null;

                return defaultCategory.items.map((product) => (
                  <div
                    key={product.name}
                    className="product-suggester__product-item"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="product-suggester__product-image"
                    />
                    <span className="product-suggester__product-name">
                      {product.name}
                    </span>
                    <button
                      className="product-suggester__add-button"
                      onClick={() => handleAddToCart(product)}
                    >
                      Thêm vào giỏ hàng
                    </button>
                  </div>
                ));
              })()}
            </>
          )}

          {suggestions.length > 0 &&
            (() => {
              // Gom các sản phẩm duy nhất từ suggestions
              const productMap = new Map();

              suggestions.forEach((sug) => {
                sug.items.forEach((itemOrCategory) => {
                  const categoryMatch = categories.find(
                    (cat) => cat.title === itemOrCategory
                  );

                  if (categoryMatch) {
                    categoryMatch.items.forEach((prod) => {
                      if (!productMap.has(prod.name)) {
                        productMap.set(prod.name, prod);
                      }
                    });
                  } else {
                    let foundProduct = null;
                    for (const cat of categories) {
                      foundProduct = cat.items.find(
                        (item) => item.name === itemOrCategory
                      );
                      if (foundProduct) break;
                    }

                    if (!foundProduct) {
                      foundProduct = {
                        name: itemOrCategory,
                        image: "/images/default-product.jpg",
                      };
                    }

                    if (!productMap.has(foundProduct.name)) {
                      productMap.set(foundProduct.name, foundProduct);
                    }
                  }
                });
              });

              const uniqueProducts = Array.from(productMap.values());
              return uniqueProducts.map((product) => (
                <div
                  key={product.name}
                  className="product-suggester__product-item"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-suggester__product-image"
                  />
                  <span className="product-suggester__product-name">
                    {product.name}
                  </span>
                  <button
                    className="product-suggester__add-button"
                    onClick={() => handleAddToCart(product)}
                  >
                    Thêm vào giỏ hàng
                  </button>
                </div>
              ));
            })()}
        </div>
      </section>

      {/* Danh sách sản phẩm để chọn (checkbox) */}
      <div>
        {categories.map((category) => (
          <div key={category.title} className="product-suggester__category">
            <h2 className="product-suggester__category-title">
              {category.title}
            </h2>
            <div className="product-suggester__products-list product-suggester__products-list--horizontal">
              {category.items.map((product) => (
                <div
                  key={product.name}
                  className={`product-suggester__product-item ${
                    selectedItems.includes(product.name)
                      ? "product-suggester__product-item--selected"
                      : ""
                  }`}
                >
                  <label className="product-suggester__product-label">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(product.name)}
                      onChange={() => toggleSelection(product.name)}
                      className="product-suggester__product-checkbox"
                    />
                    <img
                      src={product.image}
                      alt={product.name}
                      className="product-suggester__product-image"
                    />
                    <span className="product-suggester__product-name">
                      {product.name}
                    </span>
                  </label>

                  <button
                    className="product-suggester__add-button"
                    onClick={() => handleAddToCart(product)}
                  >
                    Thêm vào giỏ hàng
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductSuggester;
