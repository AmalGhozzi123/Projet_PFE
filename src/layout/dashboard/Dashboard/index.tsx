import React, { useState, useEffect } from "react";
import { DashboardComponents } from "@components";
import axios from 'axios';
import { ROUTES } from "@utils";
import styles from "../dashboard.module.css";

interface Product {
  Ref: string;
  Stock: string; 
  DateAjout?: Date;
  Modifications?: Modification[];
}
interface Modification {
  dateModification: Date;
}
export const Dashboard = () => {
  const [totalProducts, setTotalProducts] = useState(0);
  const [newProductsCount, setNewProductsCount] = useState(0);
  const [modifiedProductsCount, setModifiedProductsCount] = useState(0);
  const [deletedProductsCount, setDeletedProductsCount] = useState(0);
  const [initialProducts, setInitialProducts] = useState<Product[]>([]);


  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
    const products: Product[] = response.data;

    // Mettre à jour l'état initialProducts avec les données récupérées
    setInitialProducts(products);

    let allProductsSet = new Set<string>();
    let newProductsSet = new Set<string>();
    let modifiedProductsSet = new Set<string>();
    let deletedProductsSet = new Set<string>();

    const today = new Date().setHours(0, 0, 0, 0); 

      products.forEach((product: Product) => {
        allProductsSet.add(product.Ref);

        if (product.DateAjout) {
          const ajoutDate = new Date(product.DateAjout).setHours(0, 0, 0, 0);
          if (ajoutDate === today) {
            newProductsSet.add(product.Ref);
          }
        }

        if (product.Modifications && product.Modifications.length > 0) {
          product.Modifications.forEach(mod => {
            if (new Date(mod.dateModification).setHours(0, 0, 0, 0) === today) {
              modifiedProductsSet.add(product.Ref);
            }
          });
        }
        if (product.Stock === "Hors stock") {
          deletedProductsSet.add(product.Ref);
        }

      });

      setTotalProducts(allProductsSet.size);
      setNewProductsCount(newProductsSet.size);
      setModifiedProductsCount(modifiedProductsSet.size);
      setDeletedProductsCount(deletedProductsSet.size);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };
  const uniqueProducts: Product[] = [];
  const uniqueRefs = new Set<string>();
  for (const product of initialProducts) {
    if (!uniqueRefs.has(product.Ref)) {
      uniqueProducts.push(product);
      uniqueRefs.add(product.Ref);
    }
  }

  const availableProductsCount = uniqueProducts.filter(
    (product) => product.Stock === "En stock"
  ).length;
  const unavailableProductsCount = uniqueProducts.filter(
    (product) => product.Stock === "Sur commande"
  ).length;



  return (
    <div className={styles.dashboard_content}>
      <div className={styles.dashboard_content_container}>
        <div className={styles.dashboard_content_header}>
        </div>

        <div className={styles.dashboard_cards}>
          <DashboardComponents.StatCard
            title="Tous les Produits"
            link={ROUTES.PRODUCTS}
            value={totalProducts}
            icon="/icons/product.svg"
          />
           <DashboardComponents.StatCard
            title="Produits Disponibles"
            value={availableProductsCount}
            icon="/icons/product.svg"
          />
          <DashboardComponents.StatCard
            title="Produits sur commandes"
            value={unavailableProductsCount}
            icon="/icons/product.svg"
          />
          <DashboardComponents.StatCard
            title="Nouveaux Produits"
            link={ROUTES.NEWPRODUCTS}
            value={newProductsCount}
            icon="/icons/new.svg"
          />
          <DashboardComponents.StatCard
            title="Produits Modifiés"
            link={ROUTES.UPDATE}
            value={modifiedProductsCount}
            icon="/icons/update.svg"
          />
          <DashboardComponents.StatCard
            title="Produits Indisponibles"
            link={ROUTES.DELETEDPRODUCTS}
            value={deletedProductsCount}
            icon="/images/suppression.png"
          />
        </div>
      </div>
    </div>
  );
};
