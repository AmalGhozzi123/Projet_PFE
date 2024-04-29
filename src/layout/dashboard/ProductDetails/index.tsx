import React, { useEffect, useState } from 'react';
import Chart from 'chart.js/auto';
import './Productdetails.css'; 
import { FaTimes } from 'react-icons/fa';
Chart.defaults.font.family = 'Georgia, serif';


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
  Category: string;
  Subcategory: string;
}

interface Modification {
  dateModification: string;
  ancienPrix: string;
}

interface ProductDetailsProps {
  product: Product;
  onClose: () => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onClose }) => {
  const [priceData, setPriceData] = useState<{ date: Date, price: number }[]>([]);

  useEffect(() => {
    // Logique pour extraire les données de prix du produit et les définir dans priceData
    const prices: { date: Date, price: number }[] = [];

    product.Modifications?.sort((a, b) => new Date(a.dateModification).getTime() - new Date(b.dateModification).getTime())
      .forEach(mod => {
        prices.push({ date: new Date(mod.dateModification), price: parseFloat(mod.ancienPrix.split(' ')[0]) });
      });

    prices.push({ date: new Date(), price: parseFloat(product.Price.split(' ')[0]) });

    setPriceData(prices);
  }, [product]);

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
        options: {
          scales: {
            y: {
              title: {
                display: true,
                text: 'Prix (DT)' // Libellé pour l'axe y
              },
              beginAtZero: true, // Commencer à zéro
              ticks: {
                stepSize: 500, // Incrément de l'axe y
                callback: function(tickValue: string | number, index: number, ticks: any[]) {
                  if (typeof tickValue === 'number') {
                    return (tickValue).toString(); 
                  }
                  return tickValue;
                }
              }
            }
          }
        }
        
        
      });
    }
  };

  return (
    <div className="productDetails">
      {product ? (
        <div className="productContainer">
          <div className="productInfo">
            <br />
            <br />
            <div className="productContent">
              <div className="imageChartContainer">
                <img src={product.Image} alt={product.Designation} className="productImage" style={{width:'200px',height:'200px'}} />
                <div className="chartContainer">
                  <canvas id="priceChart" width="600" height="300"></canvas>
                </div>
              </div>
              <div className="details">
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
                <p>{product.Description}</p>
                <p>Disponibilité : <span style={{ color: product.Stock === "En stock" ? 'green' : 'red' }}>{product.Stock}</span></p>
                <div className="logos">
                  <img src={product.CompanyLogo} alt={product.Company} style={{width:'80px',height:'40px' ,backgroundColor: '#DCDCE7' }} />
                  <img src={product.BrandImage} alt={product.Brand} style={{ width: '80px',height:'40px' , marginLeft: '10px' }} />
                </div>
                <br />
                <div style={{ textAlign: "center" }}>
                  <button className="ConsulterButton">
                    <a href={product.Link} target="_blank" rel="noopener noreferrer">Voir sur site</a>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p>Chargement des détails du produit...</p>
      )}
      <div className="closeIcon" onClick={onClose}>
        <FaTimes size={20} />
      </div>
    </div>
  );
};

export default ProductDetails;
