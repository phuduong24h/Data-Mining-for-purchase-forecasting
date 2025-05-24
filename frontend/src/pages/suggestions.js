import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/index.css";

const ProductSuggester = () => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  // Danh mục và sản phẩm
  const categories = [
    {
      title: "Laptop",
      items: [
        { name: "Laptop Dell", image: "/images/laptop.jpg", price: 1000 },
        { name: "Laptop HP", image: "/images/laptop.jpg", price: 1000 },
      ],
    },
    {
      title: "Mouse",
      items: [
        { name: "Mouse acs", image: "/images/mouse.jpg", price: 1000 },
        { name: "Keyboard", image: "/images/keyboard.jpg", price: 1000 },
        { name: "Headphones", image: "/images/headphone.jpg", price: 1000 },
      ],
    },
    {
      title: "Keyboard",
      items: [
        { name: "Keyboard LG", image: "/images/monitor.jpg", price: 1000 },
        { name: "Keyboard Samsung", image: "/images/monitor.jpg", price: 1000 },
      ],
    },
    {
      title: "Monitor",
      items: [
        { name: "Monitor LG", image: "/images/monitor.jpg", price: 1000 },
        { name: "Monitor Samsung", image: "/images/monitor.jpg", price: 1000 },
      ],
    },
  ];

  // Lấy danh mục dựa trên sản phẩm trong giỏ hàng
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
        // Nếu giỏ hàng trống, lấy tất cả danh mục làm mặc định
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

        // Tự động chọn checkbox các sản phẩm gợi ý
        const allSuggestedProducts = data.flatMap((sug) => sug.items);
        setSelectedItems(allSuggestedProducts);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    };

    getSuggestions();
  }, [cartItems]); // Chạy lại khi cartItems thay đổi

  // Toggle chọn sản phẩm trong danh sách chọn (checkbox)
  const toggleSelection = (productName) => {
    setSelectedItems((prev) =>
      prev.includes(productName)
        ? prev.filter((item) => item !== productName)
        : [...prev, productName]
    );
  };

  // Thêm sản phẩm vào giỏ hàng localStorage và cập nhật state cartItems
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

  return (
    <div className="product-suggester">
      <header className="product-suggester__header">
        <h1 className="product-suggester__title">Cửa hàng Thế Giới Sản Phẩm</h1>
        <div className="product-suggester__header-buttons">
          <button className="product-suggester__button">
            <Link to="/login">Đăng nhập</Link>
          </button>
          <button className="product-suggester__button">
            <Link to="/cart">🛒 Giỏ hàng</Link>
          </button>
        </div>
      </header>

      {/* Hiển thị sản phẩm trong giỏ hàng */}
      <div
        className="product-suggester__cart-items"
        style={{ marginTop: "120px" }}
      >
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
      </div>

      {/* Danh sách sản phẩm để chọn (checkbox) */}
      <div style={{ marginTop: "550px" }}>
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

      {/* Hiển thị danh sách gợi ý */}
      <section className="product-suggester__suggestions">
        <h2 className="product-suggester__suggestions-title">
          Gợi ý mua thêm:
        </h2>
        <div className="product-suggester__suggestions-container product-suggester__products-list--horizontal">
          {suggestions.length === 0 && (
            <p className="product-suggester__suggestions-empty">
              Chưa có gợi ý nào.
            </p>
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
    </div>
  );
};

export default ProductSuggester;
