import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../dashboard.module.css';
import { Input } from '@components';
import { DashboardComponents } from '@components';
import '../Products/productPage.css';

interface Product {
  Ref: string;
  Designation: string;
  Price: string;
  Stock: string;
  Image: string;
  Brand: string;
  Company: string;
  Link: string;
  AncienPrix?: string;
  DateModification?: Date;
  DateScrapping: Date;
  BrandImage:string;
  DiscountAmount:string;
}

const Update: React.FC = () => {
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [priceFilter, setPriceFilter] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<'table' | 'box'>('table');
  const [availabilityFilter, setAvailabilityFilter] = useState<string | null>(null);
  const [fetched, setFetched] = useState<number>(0);
  const [selectedCompany, setSelectedCompany] = useState<string | null>('All'); // Ajout de selectedCompany

  const [initialProducts, setInitialProducts] = useState<Product[]>([]);
  const [companyOptions, setCompanyOptions] = useState<string[]>([]); // Ajout de companyOptions

  useEffect(() => {
    fetchProducts();
    setFetched(50);
  }, [page, pageSize]);

  useEffect(() => {
    setCompanyOptions(Array.from(new Set(products.map(product => product.Company)))); // Mise à jour des options de concurrents
  }, [products]);

  const fetchProducts = useCallback(() => {
    setLoadingProducts(true);

    axios
      .get('http://localhost:5000/api/products', {
        params: {
          page,
          pageSize,
        },
      })
      .then((response) => {
        const data: Product[] = response.data;
        const uniqueProducts = removeDuplicates(data, 'Ref'); // Supprimer les produits en double
        setProducts(uniqueProducts.filter((product: Product) => product.DateModification));
        setInitialProducts(uniqueProducts.filter((product: Product) => product.DateModification));
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
      if (value === '') {
        setFetched(50);
        setProducts(initialProducts);
      } else {
        const filteredProducts = initialProducts.filter(
          (product: Product) =>
            product.Ref.toLowerCase().includes(value.toLowerCase()) ||
            product.Designation.toLowerCase().includes(value.toLowerCase()) ||
            product.Stock.toLowerCase().includes(value.toLowerCase()) ||
            product.Company.toLowerCase().includes(value.toLowerCase()) ||
            product.Brand.toLowerCase().includes(value.toLowerCase())
        );
        setProducts(filteredProducts);
      }
    },
    [initialProducts]
  );

  const countUniqueReferences = (products: Product[]) => {
    const uniqueReferences = new Set<string>();
    products.forEach((product) => {
      uniqueReferences.add(product.Ref);
    });
    return uniqueReferences.size;
  };

  const removeDuplicates = (arr: any[], key: string) => {
    const map = new Map();
    for (const item of arr) {
      map.set(item[key], item);
    }
    return Array.from(map.values());
  };
  
  
  const handleMinPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setMinPrice(value);
    filterProducts(value, maxPrice, 'min');
  };

  const handleMaxPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setMaxPrice(value);
    filterProducts(minPrice, value, 'max');
  };

  const filterProducts = (min: string, max: string, filterType: 'min' | 'max') => {
    const minPriceValue = parseFloat(min.replace(/\s/g, '').replace(',', '.'));
    const maxPriceValue = parseFloat(max.replace(/\s/g, '').replace(',', '.'));

    const filteredProducts = initialProducts.filter((product: Product) => {
      const price = parseFloat(product.Price.replace(/\s/g, '').replace(',', '.'));

      if (filterType === 'min') {
        return price >= minPriceValue;
      } else if (filterType === 'max') {
        return price <= maxPriceValue;
      }

      return true;
    });

    setProducts(filteredProducts);
  };

  const handlePriceFilterChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const { value } = event.target;
      setPriceFilter(value === 'asc' || value === 'desc' ? value : null);
    },
    []
  );

  const handleAvailabilityFilterChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const { value } = event.target;
      setAvailabilityFilter(value === 'available' || value === 'unavailable' ? value : null);
    },
    []
  );

  const applyPriceFilter = (filteredProducts: Product[]) => {
    const sortedProducts = [...filteredProducts];
    if (priceFilter === 'asc') {
      return sortedProducts.sort((a, b) => parseFloat(a.Price.replace(/\s/g, '').replace(',', '.')) - parseFloat(b.Price.replace(/\s/g, '').replace(',', '.')));
    } else if (priceFilter === 'desc') {
      return sortedProducts.sort((a, b) => parseFloat(b.Price.replace(/\s/g, '').replace(',', '.')) - parseFloat(a.Price.replace(/\s/g, '').replace(',', '.')));
    } else {
      return sortedProducts;
    }
  };

  const handleDisplayModeChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setDisplayMode(event.target.value as 'table' | 'box');
    },
    []
  );

  const __handleLoadMore = () => {
    if (products.length > fetched) {
      const newFetched = fetched + 50;
      setFetched(newFetched);
    }
  };

  const filteredProductsByAvailability = availabilityFilter
    ? availabilityFilter === 'available'
      ? products.filter((product: Product) => product.Stock === 'En stock')
      : products.filter((product: Product) => product.Stock === 'Sur commande')
    : products;

  const filteredProducts = applyPriceFilter(filteredProductsByAvailability);
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + ' ...' : text;
  };
  return (
    <div className={`${styles.dashboard_content} products_page product-page-inputs`}>
    <div className={styles.dashboard_content_container}>
      <div className={styles.dashboard_content_header}>
      <Input
            type="text"
            value={search}
            label="Chercher.."
            onChange={(e) => handleSearch(e)}
          />
           <img
      src="/icons/search.gif"
      className={styles.search_icon}/>
      </div>

        <div className={styles.dashboard_content_cards}>
        <DashboardComponents.StatCard
  title="Produits modifiés"
  value={countUniqueReferences(products)}
  icon="/icons/product.svg"
/>

              <DashboardComponents.StatCard
  title="Produits Disponibles"
  value={filteredProducts.filter(product => product.Stock === 'En stock').length}
  icon="/icons/product.svg"
/>
<DashboardComponents.StatCard
  title="Produits Épuisés"
  value={filteredProducts.filter(product => product.Stock === 'Sur commande').length}
  icon="/icons/product.svg"
/>
        </div>

        <div className={styles.filter_container}>
          <div className={styles.filter_group}>
            <span className={styles.filter_label}>Filtrer par concurrent :</span>
            <select value={selectedCompany || 'All'} onChange={(e) => setSelectedCompany(e.target.value)}>
              <option value="All">Tous</option>
              {companyOptions.map((company: string) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filter_group}>
            <span className={styles.filter_label}>Prix min :</span>
            <input type="number" value={minPrice} onChange={handleMinPriceChange} />
          </div>
          
          <div className={styles.filter_group}>
            <span className={styles.filter_label}>Prix max :</span>
            <input type="number" value={maxPrice} onChange={handleMaxPriceChange} />
          </div>
          
          <div className={styles.filter_group}>
            <span className={styles.filter_label}>Trier par prix :</span>
            <select value={priceFilter || ''} onChange={handlePriceFilterChange}>
              <option value="">Sélectionnez...</option>
              <option value="asc">Prix croissant</option>
              <option value="desc">Prix décroissant</option>
            </select>
          </div>

          <div className={styles.filter_group}>
            <span className={styles.filter_label}>Filtrer par disponibilité :</span>
            <select value={availabilityFilter || ''} onChange={handleAvailabilityFilterChange}>
              <option value="">Tous</option>
              <option value="available">Disponibles</option>
              <option value="unavailable">Épuisés</option>
            </select>
          </div>

         
        </div>
        <div>
    <img
      src="/icons/lister.svg"
      alt="Tableau"
      onClick={() => setDisplayMode('table')}
      className={displayMode === 'table' ? styles.selected_icon : styles.icon}
    />
    <img
      src="/icons/table-icon.svg"
      alt="Boîtes"
      onClick={() => setDisplayMode('box')}
      className={displayMode === 'box' ? styles.selected_icon : styles.icon}
    />
  </div><tr></tr>
  {loadingProducts ? (
  <p style={{ textAlign: "center" }}>Chargement...</p>
) : products.length === 0 ? (
  <p style={{ textAlign: "center" }}>Aucun produit trouvé</p>
) : displayMode === 'table' ? (
          <table>
            <thead>
                <th>Image</th>
                <th>Référence</th>
                <th>Désignation</th>
                <th>Marque</th>
                <th>Disponibilité</th>
                <th>Ancien Prix</th>
                <th>Date Ancien Prix</th>
                <th>Prix</th>
                <th>Concurrent</th>
            </thead>
            <tbody>
            {filteredProducts.map((product, index) => (
                <tr key={index}>
                  <td>
                  {product.DateModification && <img src="/images/updated-table.png" alt="Modified" style={{width: '35px',height: '35px',position:'absolute',marginLeft:'-15px'}}/>}
                    <img src={product.Image} alt={product.Designation} />
                    {product.DiscountAmount !== "Aucune remise" && (
            <p style={{color:'red',position:'absolute',marginLeft:'-50px',marginTop:'-70px'}}><b>{product.DiscountAmount}</b></p>
          )}</td>
                  <td>{product.Ref}</td>
                  <td>
  <a href={product.Link} target="_blank">
    {product.Designation.length > 30 ? product.Designation.slice(0, 30) + '...' : product.Designation}
  </a>
</td>

                  <td>{product.Brand}</td>
                  <td>
                        <span style={product.Stock === "En stock" ? { color: "green" } : { color: "red" }}>
                          {product.Stock}
                        </span>
                      </td>
                  <td>{product.AncienPrix}</td>
                  <td>{new Date(product.DateScrapping).toLocaleDateString()}</td>
                  <td>{product.Price}</td>
                  <td>{product.Company}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className={styles.dashboard_content_cards}>
            {filteredProducts.map((product, index) => (
              <div key={index} className={styles.product_box} style={{height: '490px',width: '200px'}}>
                <img className={styles.update_product_overlay} src="/images/upp.png" style={{width:'150px',height: '120px'}} alt="new" />
                <img src={product.Image} alt={product.Designation} />
                 <p>{product.DiscountAmount !== "Aucune remise" && (
            <p style={{color:'red',position:'absolute',marginLeft:'-16px',marginTop:'-195px'}}><b>{product.DiscountAmount}</b></p>
          )}</p>
                <div>
                <p>{product.Ref}</p>
                  <h3>
                      
                      <a href={product.Link} target="_blank" style={{color:'#140863'}}>
    {product.Designation.length > 30 ? product.Designation.slice(0, 30) + '...' : product.Designation}
  </a>
                      </h3>
         
                      <p>
                <img src={product.BrandImage}alt={product.Designation} style={{width:'50px',height: '50px'}}/>
</p>
                  <p> <span style={{ textDecoration: 'line-through',color:'gray'}}>{product.AncienPrix}</span></p>
                    <p> <span style={{color: 'red' }}><b>{product.Price}</b></span></p>
                    <p style={product.Stock === "En stock" ? { color: "green" } : { color: "red" }}>
              {product.Stock}</p>
                  <p>{product.Company}</p>
                  <a href={product.Link} target="_blank" rel="noopener noreferrer">Voir plus</a>
                </div>
              </div>
            ))}
          </div>
        )}

        

        {products.length > fetched ? (
          <span className={styles.handle_more_button} onClick={__handleLoadMore}>
            Charger plus
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default Update;
