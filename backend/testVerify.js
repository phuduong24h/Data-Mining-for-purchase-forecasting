const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("./config/config");

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInRlbkRhbmdOaGFwIjoidXNlcjEiLCJpYXQiOjE3NDc4MTUzMzEsImV4cCI6MTc0NzgxODkzMX0.4BRPcPk1xQY5pK5lOo83fEGnnVNB6XLQpvm_juK11CM";

try {
  const decoded = jwt.verify(token, SECRET_KEY);
  console.log("Token hợp lệ, payload:", decoded);
} catch (err) {
  console.error("Token lỗi:", err.message);
}
