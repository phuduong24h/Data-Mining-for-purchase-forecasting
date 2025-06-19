import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/index.css";
import { categories } from "../constants/categories";

const ProductSuggester = () => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

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

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(storedCart);
  }, []);

  useEffect(() => {
    const getSuggestions = async () => {
      let selectedCategories = [];

      if (cartItems.length > 0) {
        selectedCategories = getCategoriesFromCart(cartItems);
      } else {
        selectedCategories = categories.map((c) => c.title);
      }

      try {
        const response = await fetch("http://localhost:3000/api/suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selectedItems: selectedCategories }),
        });

        if (!response.ok) throw new Error("Failed to get suggestions");

        const data = await response.json();
        setSuggestions(data);

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

  const goToDetail = (product) => {
    navigate("/DetailPage", { state: { product } });
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
                    onClick={() => goToDetail(product)}
                    style={{ cursor: "pointer" }}
                  />
                  <span
                    className="product-suggester__product-name"
                    onClick={() => goToDetail(product)}
                    style={{ cursor: "pointer" }}
                  >
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

      <section className="product-suggester__suggestions">
        <h2 className="product-suggester__suggestions-title">
          Gợi ý mua thêm:
        </h2>
        <div className="product-suggester__suggestions-container product-suggester__products-list--horizontal">
          {suggestions.length === 0 &&
            (() => {
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
                    onClick={() => goToDetail(product)}
                    style={{ cursor: "pointer" }}
                  />
                  <span
                    className="product-suggester__product-name"
                    onClick={() => goToDetail(product)}
                    style={{ cursor: "pointer" }}
                  >
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

          {suggestions.length > 0 &&
            (() => {
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
                    onClick={() => goToDetail(product)}
                    style={{ cursor: "pointer" }}
                  />
                  <span
                    className="product-suggester__product-name"
                    onClick={() => goToDetail(product)}
                    style={{ cursor: "pointer" }}
                  >
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
                      onClick={() => goToDetail(product)}
                      style={{ cursor: "pointer" }}
                    />
                    <span
                      className="product-suggester__product-name"
                      onClick={() => goToDetail(product)}
                      style={{ cursor: "pointer" }}
                    >
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
