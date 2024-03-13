//src/layout/dashboard/Competitors/index.tsx
import React, { useState } from "react";

import styles from "../dashboard.module.css";
import { competitors as all_competitors, products } from "@constants";
import { CompetitorRo } from "@models";
import { Link } from "react-router-dom";
import { ROUTES } from "@utils";

export const Competitors = () => {
  const [competitors, setCompetitors] =
    useState<CompetitorRo[]>(all_competitors);

  return (
    <div className={styles.dashboard_content}>
      <div className={styles.dashboard_content_container}>
        <div className={styles.dashboard_content_header}>
          <h2>Concurrents</h2>
        </div>

        <p>Tous les concurrents de votre entreprise sont listés ci-dessous.</p>

        <table>
          <thead>
            <th>Logo</th>
            <th>Nom du société</th>
            <th>Lien</th>
            <th>N° Produits</th>
          </thead>

          <tbody>
            {competitors.map((competitor) => (
              <tr key={competitor.id}>
                <td>
                  <Link to={ROUTES.PRODUCTS}>
                    <img
                      src={competitor.image}
                      alt={competitor.name}
                      style={{ height: 30, objectFit: "contain" }}
                    />
                  </Link>
                </td>
                <td>
                  <Link to={ROUTES.PRODUCTS}>{competitor.name}</Link>
                </td>
                <td>
                  <a href={competitor.link} target="_blank" rel="noreferrer">
                    {competitor.link}
                  </a>
                </td>
                <td>
                  <Link to={ROUTES.PRODUCTS}>{products.length}</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
