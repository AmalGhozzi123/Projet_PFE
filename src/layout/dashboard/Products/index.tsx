import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../dashboard.module.css';
import { Input } from '@components';
import { DashboardComponents } from '@components';

interface Product {
  Image: string;
  Ref: string;
  Designation: string;
  Brand: string;
  Stock: string;
  Price: string;
  Link: string;
}

const Products: React.FC = () => {
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const formattedDate = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();

  const availableProducts = products.filter((product: Product) => product.Stock === 'En stock');
  const unavailableProducts = products.filter((product: Product) => product.Stock === 'Sur commande');

  useEffect(() => {
    fetchProducts();
  }, [page, pageSize]);

  const fetchProducts = useCallback(() => {
    setLoadingProducts(true);

    axios
      .get('http://localhost:5000/api/products', {
        params: {
          page,
          pageSize,
          // other query parameters...
        },
      })
      .then((response) => {
        const data: Product[] = response.data;

        console.log('All products:', data);

        setProducts((prevProducts) => [...prevProducts, ...data]);
        setLoadingProducts(false);
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
        setLoadingProducts(false);
      });
  }, [page, pageSize]);

  const handleSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setSearch(value);
      setPage(1);
      setProducts([]); // Clear the existing products when performing a new search

      if (value === '') {
        setPageSize(50);
      } else {
        setPageSize(Infinity); // Fetch all products for search
      }
    },
    []
  );

  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  return (
    <div className={styles.dashboard_content}>
      <div className={styles.dashboard_content_container}>
        <div className={styles.dashboard_content_header}>
          <h2>Produits</h2>
          <Input type="text" value={search} label="Search.." onChange={(e) => handleSearch(e)} />
        </div>

        <div className={styles.dashboard_content_cards}>
          <DashboardComponents.StatCard title="Tous Les Produits" value={products.length} icon="/icons/product.svg" />
          <DashboardComponents.StatCard title="Produits Disponibles" value={availableProducts.length} icon="/icons/product.svg" />
          <DashboardComponents.StatCard title="Produits Épuisés" value={unavailableProducts.length} icon="/icons/product.svg" />
          <DashboardComponents.StatCard title="Nouveaux Produits" value={0} icon="/icons/product.svg" />
        </div>

        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Ref</th>
              <th>Designation</th>
              <th>Marque</th>
              <th>Desponibilité</th>
              <th>Ancien Prix</th>
              <th>Date Ancien Prix</th>
              <th>Prix</th>
            </tr>
          </thead>
          {products.length > 0 ? (
            <tbody>
              {products.map((product: Product, index: number) => (
                <tr key={index}>
                  <td>
                    <img src={product.Image} alt={product.Designation} />
                  </td>
                  <td>{product.Ref}</td>
                  <td>
                    <a href={product.Link} target="_blank" rel="noopener noreferrer">
                      {product.Designation}
                    </a>
                  </td>
                  <td>{product.Brand}</td>
                  <td>
                    <span style={product.Stock === 'En stock' ? { color: 'green' } : { color: 'red' }}>
                      {product.Stock}
                    </span>
                  </td>
                  <td>{product.Price}</td>
                  <td>{formattedDate}</td>
                  <td>{product.Price}</td>
                </tr>
              ))}
            </tbody>
          ) : null}
        </table>

        {loadingProducts ? (
          <p style={{ textAlign: 'center' }}>Chargement en cours...</p>
        ) : null}

        {products.length === 0 ? (
          <p style={{ textAlign: 'center' }}>Aucun produit trouvé</p>
        ) : null}

        {products.length > 0 && products.length % pageSize === 0 ? (
          <span className={styles.handle_more_button} onClick={handleLoadMore}>
            Charger plus
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default Products;
