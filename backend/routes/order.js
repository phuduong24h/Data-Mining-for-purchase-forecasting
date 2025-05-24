const express = require("express");
const sql = require("mssql/msnodesqlv8");
const authMiddleware = require("../middleware/auth");
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

// Xử lý checkout
router.post("/checkout", authMiddleware, async (req, res) => {
  const { items, userId } = req.body;

  if (!userId || !Array.isArray(items)) {
    return res.status(400).json({ message: "Thiếu thông tin" });
  }

  try {
    const pool = await sql.connect(dbConfig);

    for (const item of items) {
      await pool
        .request()
        .input("nguoiDungId", sql.Int, userId)
        .input("tenSanPham", sql.NVarChar, item.name)
        .input("soLuong", sql.Int, item.quantity).query(`
          INSERT INTO DaMua (nguoiDungId, tenSanPham, soLuong)
          VALUES (@nguoiDungId, @tenSanPham, @soLuong)
        `);
    }

    res.status(200).json({ message: "Thanh toán thành công!" });
  } catch (err) {
    console.error("Lỗi lưu vào DB:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
});

module.exports = router;
