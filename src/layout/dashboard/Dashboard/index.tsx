import React, { useState, useEffect } from "react";
import axios from 'axios';
import Chart from 'chart.js/auto'; 
import { DashboardComponents } from "@components";
import { ROUTES } from "@utils";
import styles from "../dashboard.module.css";

interface Product {
  Ref: string;
  Designation: string;
  Price: string;
  Stock: string;
  Image: string;
  Brand: string;
  Company: string;
  CompanyLogo: string;
  DiscountAmount: string;
  Description: string;
  BrandImage: string;
  Link: string;
  DateScrapping: Date;
  DateAjout?: Date;
  AncienPrix?: string;
  DateModification?: Date;
  Modifications?: Modification[];
  supprime?: number;
  Category: string;
  Subcategory: string;
}

interface Modification {
  dateModification: Date;
  ancienPrix: string;
}

export const Dashboard = () => {
  const [totalProducts, setTotalProducts] = useState(0);
  const [newProductsCount, setNewProductsCount] = useState(0);
  const [modifiedProductsCount, setModifiedProductsCount] = useState(0);
  const [initialProducts, setInitialProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      const products: Product[] = response.data;
      setInitialProducts(products);
      
      const today = new Date().setHours(0, 0, 0, 0);
      let newProductsSet = new Set<string>();
      let modifiedProductsSet = new Set<string>();

      products.forEach((product: Product) => {
        if (product.DateAjout && new Date(product.DateAjout).setHours(0, 0, 0, 0) === today) {
          newProductsSet.add(product.Ref);
        }

        if (product.Modifications && product.Modifications.some(mod => new Date(mod.dateModification).setHours(0, 0, 0, 0) === today)) {
          modifiedProductsSet.add(product.Ref);
        }
      });

      setTotalProducts(products.length);
      setNewProductsCount(newProductsSet.size);
      setModifiedProductsCount(modifiedProductsSet.size);
      


      drawModifiedProductsChart(products);

      drawCharts(products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const drawCharts = (products: Product[]) => {

  };


 
 
  const drawModifiedProductsChart = (products: Product[]) => {
    const modifiedProductsPerDay: Record<string, number> = {};
    products.forEach((product: Product) => {
      if (product.Modifications && product.Modifications.length > 0) {
        product.Modifications.forEach(mod => {
          const modifDate = mod.dateModification ? new Date(mod.dateModification).toDateString() : "";
          modifiedProductsPerDay[modifDate] = (modifiedProductsPerDay[modifDate] || 0) + 1;
        });
      }
    });

    const ctx = document.getElementById('modifiedProductsChart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: Object.keys(modifiedProductsPerDay),
          datasets: [
            {
              label: 'Produits Modifiés ',
              data: Object.values(modifiedProductsPerDay),
              borderColor: 'purple',
              fill: false
            }
          ]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  };

 



  const availableProductsCount = initialProducts.filter(product => product.Stock === "En stock").length;
  const unavailableProductsCount = initialProducts.filter(product => product.Stock === "Sur commande").length;
  const horsstockProductsCount = initialProducts.filter(product => product.Stock === "Hors stock").length;

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
            title="Nouveaux Produits"
            value={newProductsCount}
            icon="/icons/new.svg"
          />
          <DashboardComponents.StatCard
            title="Produits Modifiés"
            value={modifiedProductsCount}
            icon="/icons/update.svg"
          />
          <DashboardComponents.StatCard
            title="Produits En Stock"
            value={availableProductsCount}
            icon="/icons/product.svg"
          />
          <DashboardComponents.StatCard
            title="Produits Hors stock"
            value={horsstockProductsCount}
            icon="/images/suppression.png"
          />
          <DashboardComponents.StatCard
            title="Produits sur commandes"
            value={unavailableProductsCount}
            icon="/icons/product.svg"
          />
          
   
          <div>
            <canvas id="modifiedProductsChart" width="400" height="200"></canvas>
          </div>
       
        </div>
      </div>
    </div>
  );
};
