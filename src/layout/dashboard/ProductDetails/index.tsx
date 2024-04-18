import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../dashboard.module.css';
import { useParams } from 'react-router-dom';
import "./Productdetails.css";
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
  CompanyLogo:string;
  DiscountAmount: string;
  Description: string;
  BrandImage: string;
  Link: string;
  DateScrapping: Date;
  DateAjout?: Date;
  AncienPrix?: string;
  DateModification?: Date;
  supprime?: number;
  Category: string;
  Subcategory: string;
}

const ProductDetails: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();

  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
        const url = `http://localhost:5000/api/products-by-reference/${productId}`;
        console.log("Fetching URL:", url);  // Afficher l'URL dans la console
        try {
            const response = await axios.get(url);
            console.log('API Response:', response.data); // Affichez les données reçues
            if (response.data && response.data.length > 0) {
                const productData = response.data[0];
                if (productData.DateScrapping) {
                    productData.DateScrapping = new Date(productData.DateScrapping);
                }
                setProduct(productData);
            } else {
                console.log("No data received or data format is incorrect");
                setProduct(null);
            }
        } catch (error) {
            console.error('Error fetching product details:', error);
            setProduct(null);
        }
    };

    fetchProductDetails();
}, [productId]);


return (
  <div className={styles.productDetails}  >
    {product ? (
      <div className={styles.productContainer} style={{display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      maxWidth: "1200px",
      marginTop: "10px",
      backgroundColor: "white",
      padding: "20px",
      borderRadius: "5px",
      boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",}}>
        <div className={styles.productImage} >
        <p className={styles.categoryInfo}>


<Link
to={`${ROUTES.PRODUCTS}`}
>
<img src="/images/home.png"  className={styles.home_image}  style={{width:"20px",height:"20px"}}  />
</Link>
  | {product.Category} | {product.Subcategory}
</p><br></br><br></br>
          <img src={product.Image} alt={product.Designation} style={{ maxWidth: '800px', maxHeight: '800px',position:"absolute",marginLeft:"60px",marginTop:"100px" }} />
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
                        marginLeft: "-310px",
                        marginTop:"200px",
                        borderRadius: "2px",

                      }}
                    >
                      <b>{product.DiscountAmount}</b>
                    </div>
                  )}
                </p>
        <div className={styles.productInfo} >
      
          <h4>Référence : {product.Ref}</h4>
          <h2>{product.Designation}</h2>
<div>


  <p style={{ display: 'inline-block', marginRight: '30px',color:"red"  }}>
   <b><span style={{ fontSize: '24px' }}>
      {product.Price.split(',')[0]}
    </span>
    <span style={{ fontSize: '18px' }}>
      {',' + product.Price.split(',')[1]}
    </span></b> 
  </p>
  {product.AncienPrix && (
    <p style={{ display: 'inline-block'}}>
      <span style={{ textDecoration: "line-through", color: "gray" }}>
        <span style={{ fontSize: '20px' }}>
          {product.AncienPrix.split(',')[0]}
        </span>
        <span style={{ fontSize: '14px' }}>
          {',' + product.AncienPrix.split(',')[1]}
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
</p></div>

          <div style={{ backgroundColor:'#041172',width:'150px',position:'absolute',marginTop: '-330px',right:'40px'}}>
            <img src={product.CompanyLogo} alt={product.Company} style={{ maxWidth: '150px' }} />
          </div>
          <div style={{ marginTop: '-40px',marginLeft:'310px'}}>
            <img src={product.BrandImage} alt={product.Brand} style={{ maxWidth: '80px' }} />
          </div><br></br>
<div style={{textAlign:"center"}} >
          <button className={styles.ConsulterButton} >
            <a href={product.Link} target="_blank" rel="noopener noreferrer">Consulter sur site</a>
          </button></div>
        </div>
      </div>
    ) : (
      <p>Chargement des détails du produit...</p>
    )}
  </div>
);



};

export default ProductDetails;
