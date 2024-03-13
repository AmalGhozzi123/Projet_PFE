//src/layout/dashboard/Dashboard/index.tsx
import React from "react";
import { DashboardComponents } from "@components";

import styles from "../dashboard.module.css";
import { competitors, products } from "@constants";
import { ROUTES } from "@utils";

export const Dashboard = () => {
  return (
    <div className={styles.dashboard_content}>
      <div className={styles.dashboard_content_container}>
        <div className={styles.dashboard_content_header}>
          <h2>Tableau de board</h2>
        </div>

        <div className={styles.dashboard_content_cards}>
          <DashboardComponents.StatCard
            title="Concurrents"
            link={ROUTES.COMPETITORS}
            value={competitors.length}
            icon="/icons/competitor.svg"
          />
          <DashboardComponents.StatCard
            title="Produits"
            link={ROUTES.PRODUCTS}
            value={products.length}
            icon="/icons/product.svg"
          />
          <DashboardComponents.StatCard
            title="Nouveaux Produits"
            link={ROUTES.PRODUCTS}
            value={30}
            icon="/icons/date.svg"
          />
          
        </div>
      </div>
    </div>
  );
};
