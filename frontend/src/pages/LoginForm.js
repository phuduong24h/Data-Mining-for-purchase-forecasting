import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

export default function LoginForm() {
  const [tenDangNhap, setTenDangNhap] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenDangNhap, matKhau }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ Đăng nhập thành công!");
        console.log("🔐 Thông tin người dùng:", data);
        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("token", data.token);
        navigate("/");
      } else {
        alert(data.message || "❌ Đăng nhập thất bại");
      }
    } catch (error) {
      console.error("🚫 Lỗi khi gọi API:", error);
      alert("⚠️ Có lỗi xảy ra khi đăng nhập");
    }
  };

  return (
    <div className="login">
      <form className="login__box" onSubmit={handleSubmit}>
        <h2 className="login__title">Đăng nhập</h2>
        <input
          type="text"
          placeholder="Tên đăng nhập"
          className="login__input"
          value={tenDangNhap}
          onChange={(e) => setTenDangNhap(e.target.value)}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          className="login__input"
          value={matKhau}
          onChange={(e) => setMatKhau(e.target.value)}
        />
        <button type="submit" className="login__button">
          Đăng nhập
        </button>
      </form>
    </div>
  );
}
