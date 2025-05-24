import React from "react";
import { Routes, Route } from "react-router-dom";
import ProductSuggester from "./pages/suggestions";
import LoginForm from "./pages/LoginForm";
import Cart from "./pages/Cart";

function App() {
  return (
    <div className=" bg-gray-100">
      <Routes>
        <Route path="/" element={<ProductSuggester />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
    </div>
  );
}

export default App;
