import React from "react";
import { Link } from "react-router-dom";

import styles from "./statcard.module.css";

interface StatCardProps {
  title: string;
  icon: string;
  link?: string;
  value: number | string;
}

export const StatCard = ({ title, value, link, icon }: StatCardProps) => {
  if (link) {
    return (
      <Link className={styles.stat_card_container} to={link}>
        <div className={styles.stat_card_text_container}>
          <span className={styles.stat_card_title}>{title}</span>
          <span className={styles.stat_card_value}>{value}</span>
        </div>
        <div className={styles.stat_card_icon_container}>
          <img src={icon} alt={title} className={styles.stat_card_icon} />
        </div>
      </Link>
    );
  }

  return (
    <div className={styles.stat_card_container}>
      <div className={styles.stat_card_text_container}>
        <span className={styles.stat_card_title}>{title}</span>
        <span className={styles.stat_card_value}>{value}</span>
      </div>
      <div className={styles.stat_card_icon_container}>
        <img src={icon} alt={title} className={styles.stat_card_icon} />
      </div>
    </div>
  );
};
