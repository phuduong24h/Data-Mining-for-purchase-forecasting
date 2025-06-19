import React from "react";
import { Routes, Route } from "react-router-dom";
import ProductSuggester from "./pages/suggestions";
import LoginForm from "./pages/LoginForm";
import Cart from "./pages/Cart";
import Layout from "./components/Layout";
import ChartPage from "./pages/Chart";
import DetailPage from "./pages/DetailPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<ProductSuggester />} />
        <Route path="cart" element={<Cart />} />
        <Route path="chart" element={<ChartPage />} />
        <Route path="/DetailPage" element={<DetailPage />} />
      </Route>
      <Route path="login" element={<LoginForm />} />
    </Routes>
  );
}

export default App;
