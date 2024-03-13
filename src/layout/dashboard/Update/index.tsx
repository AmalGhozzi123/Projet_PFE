import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Input } from '@components'; // Assurez-vous que l'import est correct

// Ajoutez un type pour les produits
interface Product {
  Image: string;
  Ref: string;
  Designation: string;
  Brand: string;
  Stock: string;
  Price: string;
  Link: string;
}

const Update: React.FC = () => {
  const [search, setSearch] = useState<string>('');
  const [fetched, setFetched] = useState<number>(0);
  const [products, setProducts] = useState<Product[]>([]); // Ajoutez un type pour les produits
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const formattedDate =
    date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();

  /*const availableProducts = all_products.filter(
    (product: ProductRo) => product.Stock === "Disponible"
  );

  const unavailableProducts = all_products.filter(
    (product: ProductRo) => product.Stock === "Épuisé"
  );*/
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = useCallback(() => {
    setLoadingProducts(true);

    axios
      .get('http://54.37.13.51:5000/api/products')
      .then((response) => {
        const data: Product[] = response.data;

        console.log('All products:', data);

        setProducts(data);
        setLoadingProducts(false);
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
        setLoadingProducts(false);
      });
  }, []);

  const handleSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setSearch(value);
      if (value === '') {
        setFetched(50);
        fetchProducts();
      } else {
        const filteredProducts = products.filter(
          (product) =>
            product.Ref
              .toString()
              .toLowerCase()
              .includes(value.toLowerCase()) ||
            product.Designation.toLowerCase().includes(value.toLowerCase())
        );
        setProducts(filteredProducts);
      }
    },
    [products, fetchProducts]
  );

  const handleLoadMore = () => {
    if (products.length > fetched) {
      const newFetched = fetched + 50;
      setFetched(newFetched);
    }
  };

  return (
    <div>
      <div>
        <Input
          type="text"
          value={search}
          label="Search.."
          onChange={handleSearch}
        />
      </div>
      {loadingProducts ? (
        <p style={{ textAlign: 'center' }}>Chargement en cours...</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Référence</th>
                <th>Désignation</th>
                <th>Marque</th>
                <th>Disponibilité</th>
                <th>Ancien Prix</th>
                <th>Date Ancien Prix</th>
                <th>Prix</th>
              </tr>
            </thead>
            <tbody>
              {products
                .slice(0, fetched)
                .map((product, index) => (
                  <tr key={index}>
                    <td>
                      <img src={product.Image} alt={product.Designation} />
                    </td>
                    <td>{product.Ref}</td>
                    <td>
                      <a
                        href={product.Link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {product.Designation}
                      </a>
                    </td>
                    <td>{product.Brand}</td>
                    <td>
                      <span
                        style={
                          product.Stock === 'En stock'
                            ? { color: 'green' }
                            : { color: 'red' }
                        }
                      >
                        {product.Stock}
                      </span>
                    </td>
                    <td>{product.Price}</td>
                    <td>{formattedDate}</td>
                    <td>{product.Price}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          {products.length === 0 ? (
            <p style={{ textAlign: 'center' }}>Aucun produit trouvé</p>
          ) : null}
          {products.length > fetched ? (
            <span
              className="handle_more_button" // Assurez-vous que cette classe correspond au style approprié
              onClick={handleLoadMore}
            >
              Charger plus
            </span>
          ) : null}
        </>
      )}
    </div>
  );
};

export default Update;
