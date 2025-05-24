import React, { useState, useEffect } from "react";
import "../styles/cart.css";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(storedCart);

    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    if (storedToken) {
      fetch("http://localhost:3000/api/getUserIdByUsername", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storedToken}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Không thể lấy userId");
          return res.json();
        })
        .then((data) => setUserId(data.id))
        .catch((err) => console.error("Lỗi lấy userId:", err.message));
    }
  }, []);

  const handleRemoveItem = (indexToRemove) => {
    const updatedCart = cartItems.filter((_, idx) => idx !== indexToRemove);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleCheckout = async () => {
    if (!userId || !token) {
      alert("Bạn cần đăng nhập trước khi thanh toán.");
      return;
    }

    try {
      const itemsToSend = cartItems.map(({ name, quantity }) => ({
        name,
        quantity,
      }));
      const res = await fetch("http://localhost:3000/api/order/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, items: itemsToSend }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Thanh toán thất bại");
      }

      alert("Thanh toán thành công!");
      localStorage.removeItem("cart");
      setCartItems([]);
    } catch (err) {
      alert(`Lỗi khi thanh toán: ${err.message}`);
    }
  };

  const totalPrice = cartItems.reduce(
    (total, item) =>
      total + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0
  );

  const goHome = () => (window.location.href = "/");

  return (
    <div className="cart">
      <div className="cart__header">
        <h1 className="cart__title">Giỏ hàng của bạn</h1>
        <button
          onClick={goHome}
          className="cart__back-button"
          onMouseEnter={(e) =>
            e.target.classList.add("cart__back-button--hover")
          }
          onMouseLeave={(e) =>
            e.target.classList.remove("cart__back-button--hover")
          }
        >
          ← Quay lại trang chủ
        </button>
      </div>

      {cartItems.length === 0 ? (
        <p className="cart__empty">Giỏ hàng đang trống.</p>
      ) : (
        <>
          <table className="cart__table">
            <thead className="cart__thead">
              <tr className="cart__row">
                <th className="cart__th">Ảnh</th>
                <th className="cart__th">Tên sản phẩm</th>
                <th className="cart__th">Số lượng</th>
                <th className="cart__th">Giá (USD)</th>
                <th className="cart__th">Thành tiền (USD)</th>
                <th className="cart__th">Hành động</th>
              </tr>
            </thead>
            <tbody className="cart__tbody">
              {cartItems.map((item, idx) => {
                const price = Number(item.price) || 0;
                const quantity = Number(item.quantity) || 0;
                const total = price * quantity;

                return (
                  <tr key={idx} className="cart__row">
                    <td className="cart__img-cell">
                      <img
                        className="cart__img"
                        src={
                          item.image ||
                          "https://via.placeholder.com/60x60.png?text=No+Image"
                        }
                        alt={item.name}
                      />
                    </td>
                    <td className="cart__cell">{item.name}</td>
                    <td className="cart__cell cart__cell--center">
                      {quantity}
                    </td>
                    <td className="cart__cell cart__cell--right">
                      {price.toFixed(2)}
                    </td>
                    <td className="cart__cell cart__cell--right">
                      {total.toFixed(2)}
                    </td>
                    <td className="cart__cell">
                      <button
                        className="cart__remove-button"
                        onClick={() => handleRemoveItem(idx)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                );
              })}
              <tr className="cart__total-row">
                <td className="cart__total-label" colSpan="5">
                  Tổng cộng:
                </td>
                <td className="cart__total-value">
                  {totalPrice.toFixed(2)} USD
                </td>
              </tr>
            </tbody>
          </table>

          <button
            className="cart__checkout-button"
            onClick={handleCheckout}
            disabled={cartItems.length === 0 || !userId || !token}
            onMouseEnter={(e) => {
              if (!e.target.disabled)
                e.target.classList.add("cart__checkout-button--hover");
            }}
            onMouseLeave={(e) => {
              e.target.classList.remove("cart__checkout-button--hover");
            }}
          >
            Thanh toán
          </button>
        </>
      )}
    </div>
  );
};

export default CartPage;
