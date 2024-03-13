import React from "react";
import { Link, useLocation } from "react-router-dom";

import "./styles.css";
import { ROUTES } from "@utils";

export const SideBar = () => {
  const path = useLocation().pathname;

  return (
    <nav className="sidebar">
      <div className="sidebar-container">
        <div className="sidebar-logo-container">
          <img src="/images/logo.webp" alt="logo" />
        </div>

        <div className="sidebar-container">
          <div className="sidebar-items">
            <Link
              to={ROUTES.DASHBOARD}
              className={
                path === ROUTES.DASHBOARD
                  ? "sidebar-item-active"
                  : "sidebar-item"
              }
            >
              <img
                src="/icons/dashboard.svg"
                alt="All products"
                className="sidebar-item-icon"
              />
              <span className="sidebar-item-label">Tableau de board</span>
            </Link>
            <Link
              to={ROUTES.COMPETITORS}
              className={
                path === ROUTES.COMPETITORS
                  ? "sidebar-item-active"
                  : "sidebar-item"
              }
            >
              <img
                src="/icons/competitor.svg"
                alt="All products"
                className="sidebar-item-icon"
              />
              <span className="sidebar-item-label">Concurrents</span>
            </Link>
            <Link
              to={ROUTES.PRODUCTS}
              className={
                path === ROUTES.PRODUCTS
                  ? "sidebar-item-active"
                  : "sidebar-item"
              }
            >
              <img
                src="/icons/product.svg"
                alt="All products"
                className="sidebar-item-icon"
              />
              <span className="sidebar-item-label">Tous les produits</span>
            </Link>
            <Link
              to={ROUTES.NEWPRODUCTS}
              className={
                path === ROUTES.NEWPRODUCTS
                  ? "sidebar-item-active"
                  : "sidebar-item"
              }
            >
              <img
                src="/icons/add_product.svg"
                alt="All products"
                className="sidebar-item-icon"
              />
              <span className="sidebar-item-label">Nouveaux produits</span>
            </Link>
            <Link
              to={ROUTES.UPDATE}
              className={
                path === ROUTES.UPDATE
                  ? "sidebar-item-active"
                  : "sidebar-item"
              }
            >
              <img
                src="/icons/update.svg"
                alt="All products"
                className="sidebar-item-icon"
              />
              <span className="sidebar-item-label">Produits mis à jour</span>
            </Link>
           
          </div>

          <Link className="sidebar-footer" to={ROUTES.LOGIN}>
            <span className="sidebar-item-label">Se déconnecter</span>
            <img
              src="/icons/logout.svg"
              alt="icon-logout"
              className="sidebar-item-icon"
            />
          </Link>
        </div>
      </div>
    </nav>
  );
};
