import React, { useState, useEffect } from "react";
import { DashboardComponents } from "@components";
import axios from 'axios'; // Importez axios si nécessaire
import { ROUTES } from "@utils";
import styles from "../dashboard.module.css";

interface Product {
  Ref:string;
  new: boolean;
  update: boolean;
  supprime: boolean;
  // Autres propriétés...
}

export const Dashboard = () => {
  const [totalProducts, setTotalProducts] = useState(0);
  const [newProductsCount, setNewProductsCount] = useState(0);
  const [modifiedProductsCount, setModifiedProductsCount] = useState(0);
  const [deletedProductsCount, setDeletedProductsCount] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      const products: Product[] = response.data;
  
      // Utilisez un ensemble pour stocker les références uniques de tous les produits
      let allProductsSet = new Set<string>();

      let newProductsSet = new Set<string>();
      let modifiedProductsSet = new Set<string>();
      let deletedProductsSet = new Set<string>();
  
      products.forEach((product: Product) => {
        // Ajoutez la référence du produit à l'ensemble de tous les produits
        allProductsSet.add(product.Ref);

        // Vérifiez si la référence du produit n'existe pas déjà dans l'ensemble
        if (product.new && !newProductsSet.has(product.Ref)) {
          newProductsSet.add(product.Ref);
        }
        if (product.update && !modifiedProductsSet.has(product.Ref)) {
          modifiedProductsSet.add(product.Ref);
        }
        if (product.supprime && !deletedProductsSet.has(product.Ref)) {
          deletedProductsSet.add(product.Ref);
        }
      });
  
      setTotalProducts(allProductsSet.size); // Utilisez la taille de l'ensemble de tous les produits
      setNewProductsCount(newProductsSet.size);
      setModifiedProductsCount(modifiedProductsSet.size);
      setDeletedProductsCount(deletedProductsSet.size);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };
  

  return (
    <div className={styles.dashboard_content}>
      <div className={styles.dashboard_content_container}>
        <div className={styles.dashboard_content_header}>
        </div>

        <div className={styles.dashboard_content_cards}>
          <DashboardComponents.StatCard
            title="Tous les Produits"
            link={ROUTES.PRODUCTS}
            value={totalProducts}
            icon="/icons/product.svg"
          />
          <DashboardComponents.StatCard
            title="Nouveaux Produits"
            link={ROUTES.PRODUCTS}
            value={newProductsCount}
            icon="/icons/product.svg"
          />
          <DashboardComponents.StatCard
            title="Produits Modifiés"
            link={ROUTES.PRODUCTS}
            value={modifiedProductsCount}
            icon="/icons/product.svg"
          />
          <DashboardComponents.StatCard
            title="Produits hors stock"
            link={ROUTES.PRODUCTS}
            value={deletedProductsCount}
            icon="/icons/product.svg"
          />
        </div>
      </div>
    </div>
  );
};
