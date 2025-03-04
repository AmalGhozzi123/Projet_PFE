import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./styles.css";
import { ROUTES } from "@utils";

export const SideBar = () => {
  const [isOpen, setIsOpen] = useState(false); 
  const path = useLocation().pathname;
  const sidebarRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div>
      {!isOpen && (
        <div className="sidebar-toggle" onClick={toggleSidebar}>
          <img
            src="/images/menu.png"
            alt="Sidebar Toggle"
            className="sidebar-toggle-icon"
          />
        </div>
      )}

      {isOpen && (
        <nav ref={sidebarRef} className="sidebar open">
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
                  src="/icons/new.svg"
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
                <span className="sidebar-item-label">
                  Produits Modifiés
                </span>
              </Link>
              <Link
                to={ROUTES.DELETEDPRODUCTS}
                className={
                  path === ROUTES.DELETEDPRODUCTS
                    ? "sidebar-item-active"
                    : "sidebar-item"
                }
              >
                <img
                  src="/images/suppression.png"
                  alt="All products"
                  className="sidebar-item-icon"
                />
                <span className="sidebar-item-label">Produits supprimés</span>
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
      )}
    </div>
  );
};
