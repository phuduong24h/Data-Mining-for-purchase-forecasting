import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import React from "react";

const Layout = () => (
  <div className="layout">
    <Header />
    <main>
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default Layout;
