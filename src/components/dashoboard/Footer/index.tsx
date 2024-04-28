import React from "react";

import styles from "./footer.module.css";

export const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <div className={styles.dashboard_footer}>
      <span>
{/* ©{year} Scrapper developed by <a>TDISCOUNT</a> */}

      </span>
    </div>
  );
};
