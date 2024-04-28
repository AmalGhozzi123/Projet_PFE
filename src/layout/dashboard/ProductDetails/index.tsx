import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Chart from 'chart.js/auto';
import styles from '../dashboard.module.css';
import { ROUTES } from "../../../utils/routes";
import { Link } from "react-router-dom";

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
  DateScrapping: string;
  Modifications?: Modification[];
  Category :string;
  Subcategory:string;

}

interface Modification {
  dateModification: string;
  ancienPrix: string;
}

const ProductDetails: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [priceData, setPriceData] = useState<{ date: Date, price: number }[]>([]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      const url = `http://localhost:5000/api/products-by-reference/${productId}`;
      try {
        const response = await axios.get(url);
        const productData: Product = response.data[0];
        setProduct(productData);

        const prices: { date: Date, price: number }[] = [];

        productData.Modifications?.sort((a, b) => new Date(a.dateModification).getTime() - new Date(b.dateModification).getTime())
          .forEach(mod => {
            prices.push({ date: new Date(mod.dateModification), price: parseFloat(mod.ancienPrix.split(' ')[0]) });
          });

        prices.push({ date: new Date(), price: parseFloat(productData.Price.split(' ')[0]) });

        setPriceData(prices);
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
    };

    fetchProductDetails();
  }, [productId]);

  useEffect(() => {
    if (priceData.length > 0) {
      drawPriceChart();
    }
  }, [priceData]);

  const drawPriceChart = () => {
    const ctx = document.getElementById('priceChart') as HTMLCanvasElement;
    if (ctx) {
      Chart.getChart(ctx)?.destroy();
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: priceData.map(data => data.date.toLocaleDateString()),
          datasets: [{ label: 'Prix', data: priceData.map(data => data.price), borderColor: '#041172', fill: false }],
        },
        options: { scales: { y: { beginAtZero: false } } }
      });
    }
  };
  return (
    <div className={styles.productDetails}>
      {product ? (
        <div className={styles.productContainer} >
          <div className={styles.productInfo}>
            <p className={styles.categoryInfo}>
              <Link to={`${ROUTES.PRODUCTS}`}>
                <img src="/images/home.png" className={styles.home_image} style={{width:"20px",height:"20px"}} />
              </Link>

              | {product.Category} | {product.Subcategory}
            </p>
            <br />
            <br />
            <div className={styles.imageChartContainer}>
            <img src={product.Image} alt={product.Designation} className="productImage" />
            <div className={styles.chartContainer} >
              <canvas id="priceChart" width="600" height="300"></canvas>
            </div>
          </div>
            <p>
              {product.DiscountAmount !== "Aucune remise" && (
                <div
                  className={styles.discount_rectangle}
                  style={{
                    backgroundColor: "red",
                    width:"120px",
                    padding:"10px 20px",
                    color: "white",
                    position: "absolute",
                    marginLeft: "-5px",
                    marginTop:"-220px",
                    borderRadius: "2px",
                  }}
                >
                  <b>{product.DiscountAmount}</b>
                </div>
              )}
            </p>
            <div>
              <h4>Référence : {product.Ref}</h4>
              <h2>{product.Designation}</h2>
              <div>
                <p style={{ display: 'inline-block', marginRight: '30px', color:"red" }}>
                  <b>
                    <span style={{ fontSize: '24px' }}>
                      {product.Price.split(',')[0]}
                    </span>
                    <span style={{ fontSize: '18px' }}>
                      {',' + product.Price.split(',')[1]}
                    </span>
                  </b>
                </p>
                {product.Modifications && product.Modifications.length > 0 && (
                  <p style={{ display: 'inline-block' }}>
                    <span style={{ textDecoration: "line-through", color: "gray" }}>
                      <span style={{ fontSize: '20px' }}>
                        {product.Modifications[product.Modifications.length - 1].ancienPrix.split(',')[0]}
                      </span>
                      <span style={{ fontSize: '14px' }}>
                        {',' + product.Modifications[product.Modifications.length - 1].ancienPrix.split(',')[1]}
                      </span>
                    </span>
                  </p>
                )}
              </div>
              <p> {product.Description}</p>
              <div>
                <p style={{ display: 'inline-block', marginRight: '6px' }}>
                  Disponibilité : 
                            <span style={{ color: product.Stock === "En stock" ? 'green' : 'red' }}>
                    {product.Stock}
                  </span>
                </p>
              </div>
              <div style={{ backgroundColor:'#DCDCE7', width:'120px', position:'absolute', marginTop: '-700px', right:'90px'}}>
                <img src={product.CompanyLogo} alt={product.Company} style={{ maxWidth: '120px' }} />
              </div>
              <div style={{ marginTop: '-40px', marginLeft:'310px'}}>
                <img src={product.BrandImage} alt={product.Brand} style={{ maxWidth: '80px' }} />
              </div>
              <br />
              <div style={{ textAlign:"center" }}>
                <button className={styles.ConsulterButton}>
                  <a href={product.Link} target="_blank" rel="noopener noreferrer">Voir sur site</a>
                </button>
              </div>
            </div>
           
          </div>
      
        </div>
        
      ) : (
        <p>Chargement des détails du produit...</p>
      )}
       
    </div>
  );
};

export default ProductDetails;
