const express = require("express");
const sql = require("mssql/msnodesqlv8");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/auth");
const { SECRET_KEY } = require("../config/config");
const dbConfig = require("../config/db");
const router = express.Router();

/* const dbConfig = {
  server: "MSI\\MSSQLSERVER01",
  database: "QL_BuonBan",
  driver: "msnodesqlv8",
  options: {
    trustedConnection: true,
  },
}; */

router.post("/register", async (req, res) => {
  const { tenDangNhap, matKhau } = req.body;

  if (!tenDangNhap || !matKhau) {
    return res
      .status(400)
      .json({ message: "Thiếu tên đăng nhập hoặc mật khẩu" });
  }

  try {
    const pool = await sql.connect(dbConfig);

    const check = await pool
      .request()
      .input("tenDangNhap", sql.NVarChar, tenDangNhap)
      .query("SELECT * FROM NguoiDung WHERE TenDangNhap = @tenDangNhap");

    if (check.recordset.length > 0) {
      return res.status(409).json({ message: "Tên đăng nhập đã tồn tại" });
    }

    await pool
      .request()
      .input("tenDangNhap", sql.NVarChar, tenDangNhap)
      .input("matKhau", sql.NVarChar, matKhau)
      .query(
        "INSERT INTO NguoiDung (TenDangNhap, MatKhau) VALUES (@tenDangNhap, @matKhau)"
      );

    res.status(201).json({ message: "Đăng ký thành công" });
  } catch (err) {
    console.error("Lỗi đăng ký:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// API ĐĂNG NHẬP
router.post("/login", async (req, res) => {
  let { tenDangNhap, matKhau } = req.body;

  if (!tenDangNhap || !matKhau) {
    return res
      .status(400)
      .json({ message: "Thiếu tên đăng nhập hoặc mật khẩu" });
  }

  tenDangNhap = tenDangNhap.trim();
  matKhau = matKhau.trim();

  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool
      .request()
      .input("tenDangNhap", sql.NVarChar, tenDangNhap)
      .input("matKhau", sql.NVarChar, matKhau).query(`
        SELECT * FROM NguoiDung 
        WHERE RTRIM(TenDangNhap) = RTRIM(@tenDangNhap) 
          AND RTRIM(MatKhau) = RTRIM(@matKhau)
      `);

    if (result.recordset.length > 0) {
      const user = result.recordset[0];

      const token = jwt.sign(
        { userId: user.MaNguoiDung, tenDangNhap: user.TenDangNhap },
        SECRET_KEY,
        { expiresIn: "1h" }
      );

      res.status(200).json({
        message: "Đăng nhập thành công",
        user: {
          id: user.MaNguoiDung || null,
          tenDangNhap: user.TenDangNhap,
        },
        token,
      });
    } else {
      res.status(401).json({ message: "Sai tên đăng nhập hoặc mật khẩu" });
    }
  } catch (err) {
    console.error("Lỗi đăng nhập:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

router.post("/getUserIdByUsername", authMiddleware, async (req, res) => {
  // Lấy từ token đã giải mã
  const tenDangNhap = req.user.tenDangNhap;

  if (!tenDangNhap) {
    return res.status(400).json({ message: "Thiếu tên đăng nhập trong token" });
  }

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("tenDangNhap", sql.NVarChar, tenDangNhap)
      .query(
        "SELECT MaNguoiDung FROM NguoiDung WHERE TenDangNhap = @tenDangNhap"
      );

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    res.json({ id: result.recordset[0].MaNguoiDung });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
