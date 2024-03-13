//src/layout/dashboard/index.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import { DashboardComponents } from "@components";
import {Dashboard } from "./Dashboard";
import Products from "./Products";
import { Competitors } from "./Competitors";
import  NewProducts  from "./NewProducts";
import  Update  from "./Update";

import styles from "./dashboard.module.css";

const DashboardPage: React.FC = () => {
  return (
    <div className={styles.dashboard_container}>
      <DashboardComponents.SideBar />
      <div className={styles.dashboard_body}>
        <div className={styles.dashboard_body_container}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="competitors" element={<Competitors />} />
            <Route path="newproduct" element={<NewProducts />} />
            <Route path="update" element={<Update />} />
          </Routes>
        </div>
        <DashboardComponents.Footer />
      </div>
    </div>
  );
};

export default DashboardPage;