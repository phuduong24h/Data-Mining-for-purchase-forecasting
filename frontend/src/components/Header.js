import { Link } from "react-router-dom";
import "../styles/Header.css";

const Header = () => {
  return (
    <header className="store-header">
      <h1 className="store-header__title">Cửa hàng Thế Giới Sản Phẩm</h1>
      <div className="store-header__buttons">
        <button className="store-header__button">
          <Link to="/login">Đăng nhập</Link>
        </button>
        <button className="store-header__button">
          <Link to="/cart">🛒 Giỏ hàng</Link>
        </button>
        <button className="store-header__button">
          <Link to="/chart">Thống kê</Link>
        </button>
      </div>
    </header>
  );
};

export default Header;
