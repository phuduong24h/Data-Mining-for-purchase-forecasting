const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config/config");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Thiếu token xác thực" });
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res
      .status(401)
      .json({ message: "Header authorization sai định dạng" });
  }

  // 👉 In ra token để kiểm tra
  console.log("Received Token:", token);

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    // 👉 In ra lỗi nếu token sai
    console.error("JWT Error:", err.name, err.message);
    return res.status(401).json({ message: "Token sai định dạng" });
  }
};

module.exports = authMiddleware;
