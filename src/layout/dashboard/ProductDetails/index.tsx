import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../dashboard.module.css';
import { useParams } from 'react-router-dom';

interface Product {
  Ref: string;
  Designation: string;
  Price: string;
  Stock: string;
  Image: string;
  Brand: string;
  Company: string;
  Link: string;
  ancien_prix?: string;
  DateModification?: number;
  DateScrapping: Date;
}

const ProductDetails: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();

  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/${productId}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product details:', error);
        // Gérer l'erreur ici (par exemple, afficher un message d'erreur à l'utilisateur)
      }
    };
    
    fetchProductDetails();
  }, [productId]);
  

  return (
    <div className={styles.productDetails}>
      {product ? (
        <>
          <h2>{product.Designation}</h2>
          <div>
            <img src={product.Image} alt={product.Designation} />
          </div>
          <p>Référence: {product.Ref}</p>
          <p>Marque: {product.Brand}</p>
          <p>Prix: {product.Price}</p>
          <p>Disponibilité: {product.Stock}</p>
          <p>Compagnie: {product.Company}</p>
          <p>Date de mise à jour: {product.DateScrapping.toDateString()}</p>
          <a href={product.Link} target="_blank" rel="noopener noreferrer">Voir sur le site</a>
        </>
      ) : (
        <p>Chargement des détails du produit...</p>
      )}
    </div>
  );
};

export default ProductDetails;
