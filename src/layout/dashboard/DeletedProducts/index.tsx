import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../dashboard.module.css';
import { Input } from '@components';
import { DashboardComponents } from '@components';
import { ROUTES } from "../../../utils/routes";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx"; 


interface DeletedProduct {
  Ref: string;
  Designation: string;
  Price: string;
  Stock: string;
  Image: string;
  Brand: string;
  Company: string;
  Link: string;
  DateScrapping: Date;
  supprime: boolean;
  DiscountAmount:string;
  BrandImage:string;
  Category :string;
  Subcategory:string;

}

const DeletedProducts: React.FC = () => {
  const [initialProducts, setInitialProducts] = useState<DeletedProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [products, setProducts] = useState<DeletedProduct[]>([]);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);
  const [fetched, setFetched] = useState<number>(0);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const companyOptions = Array.from(new Set(initialProducts.map(product => product.Company)));
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [priceFilter, setPriceFilter] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<'table' | 'box'>('table');
  const [availabilityFilter, setAvailabilityFilter] = useState<string | null>(null);
const [totalAvailableNewProducts, setTotalAvailableNewProducts] = useState<number>(0);
const [totalUnavailableNewProducts, setTotalUnavailableNewProducts] = useState<number>(0);
  useEffect(() => {
    fetchProducts();
    setFetched(50);
  }, [page, pageSize]);

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
        const data: DeletedProduct[] = response.data;

        console.log('All products:', data);

        setInitialProducts(data);
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
          (product: DeletedProduct) =>
            product.Ref.toLowerCase().includes(value.toLowerCase()) ||
            product.Designation.toLowerCase().includes(value.toLowerCase()) ||
            product.Stock.toLowerCase().includes(value.toLowerCase()) ||
            product.Company.toLowerCase().includes(value.toLowerCase()) ||
            product.Brand.toLowerCase().includes(value.toLowerCase())
        );
        setInitialProducts(filteredProducts);
      }
    },
    [initialProducts]
  );
  

  const handleCompanyChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const { value } = event.target;
      setSelectedCompany(value === "All" ? null : value);
    },
    []
  );

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

    const filteredProducts = initialProducts.filter((product: DeletedProduct) => {
      const price = parseFloat(product.Price.replace(/\s/g, '').replace(',', '.'));

      if (filterType === 'min') {
        return price >= minPriceValue;
      } else if (filterType === 'max') {
        return price <= maxPriceValue;
      }

      return true;
    });

    setInitialProducts(filteredProducts);
  };

  const handlePriceFilterChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const { value } = event.target;
      setPriceFilter(value === "asc" || value === "desc" ? value : null);
    },
    []
  );

  const handleAvailabilityFilterChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const { value } = event.target;
      setAvailabilityFilter(value === "available" || value === "unavailable" ? value : null);
    },
    []
  );

  const applyPriceFilter = (filteredProducts: DeletedProduct[]) => {
    const sortedProducts = [...filteredProducts];
    if (priceFilter === "asc") {
      return sortedProducts.sort((a, b) => parseFloat(a.Price.replace(/\s/g, '').replace(',', '.')) - parseFloat(b.Price.replace(/\s/g, '').replace(',', '.')));
    } else if (priceFilter === "desc") {
      return sortedProducts.sort((a, b) => parseFloat(b.Price.replace(/\s/g, '').replace(',', '.')) - parseFloat(a.Price.replace(/\s/g, '').replace(',', '.')));
    } else {
      return sortedProducts;
    }
  };


  const exportToXLS = useCallback(() => {
    const data = initialProducts.map((product) => ({
      Ref: product.Ref,
      Designation: product.Designation,
      Price: product.Price,
      Stock: product.Stock,
      Image: product.Image,
      Brand: product.Brand,
      Company: product.Company,
      DiscountAmount: product.DiscountAmount,
      BrandImage: product.BrandImage,
      Link: product.Link,
      DateScrapping: product.DateScrapping.toString(), 
      supprime: product.supprime || 0,
      Category: product.Category,
      Subcategory: product.Subcategory,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Produits");

    const today = new Date();
    const filename = `Products_${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}.xlsx`;

    XLSX.writeFile(wb, filename);
  }, [initialProducts]);

  const filteredProductsByCompany = selectedCompany
    ? initialProducts.filter(product => product.Company === selectedCompany)
    : initialProducts;

  const filteredProductsByPrice = minPrice !== '' && maxPrice !== ''
    ? filteredProductsByCompany.filter(product => {
      const price = parseFloat(product.Price.replace(/\s/g, '').replace(',', '.'));
      const min = parseFloat(minPrice.replace(/\s/g, '').replace(',', '.'));
      const max = parseFloat(maxPrice.replace(/\s/g, '').replace(',', '.'));
      return price >= min && price <= max;
    })
    : filteredProductsByCompany;

    const filteredProductsByAvailability = availabilityFilter
    ? availabilityFilter === 'available'
      ? filteredProductsByPrice.filter((product) => product.Stock === 'En stock')
      : filteredProductsByPrice.filter((product) => product.Stock === 'Sur commande')
    : filteredProductsByPrice;
  
  const handleDisplayModeChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setDisplayMode(event.target.value as 'table' | 'box');
    },
    []
  );

  const __handleLoadMore = () => {
    if (initialProducts.length > fetched) {
      const newFetched = fetched + 50;
      setFetched(newFetched);
    }
  };
  const resetFilters = useCallback(() => {
    setSearch("");
    setPage(1);
    setPageSize(50);
    setProducts(initialProducts);
    setPriceFilter(null);
    setMinPrice("");
    setMaxPrice("");
    setAvailabilityFilter(null);
    setSelectedCompany(null);
  }, [initialProducts]);

  // Appeler la fonction resetFilters lorsque le bouton est cliqué
  const handleResetFilters = () => {
    resetFilters();
  };
  const filteredProducts = applyPriceFilter(filteredProductsByAvailability);
  const newProducts = filteredProducts.filter((product: DeletedProduct) => product.supprime);
  
  const newAvailableProducts = newProducts.filter(product => product.Stock === 'En stock').length;
  const newUnavailableProducts = newProducts.filter(product => product.Stock === 'Sur commande').length;
  

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

        <div className={styles.dashboard_cards}>
        <DashboardComponents.StatCard
            title="Produits Hors stock"
            value={newProducts.length}
            icon="/icons/product.svg"
          />



  
        </div>

        <div className={styles.filter_container}>
          <div className={styles.filter_group}>
            <select value={selectedCompany || "All"} onChange={handleCompanyChange}>
              <option value="All" style={{color:'gray'}}>Filtrer par concurrent </option>
              {companyOptions.map((company: string) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filter_group}>
            <input type="number" value={minPrice} onChange={handleMinPriceChange} placeholder='Prix min'/>
          </div>
          
          <div className={styles.filter_group}>
            <input type="number" value={maxPrice} onChange={handleMaxPriceChange} placeholder='Prix max'/>
          </div>
          
          <div className={styles.filter_group}>
            <select value={priceFilter || ""} onChange={handlePriceFilterChange}>
              <option value="" style={{color:'gray'}}>Trier par prix</option>
              <option value="asc">Croissant</option>
              <option value="desc">Décroissant</option>
            </select>
          </div>

          <button className={styles.reset_button} onClick={handleResetFilters}><b>X</b></button>


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
  </div>
  <img
      className={styles.xls_image}
  src="/images/xls.jpg"
  alt="Exporter en XLS"
  onClick={exportToXLS}
/><tr></tr>
  {loadingProducts ? (
  <p style={{ textAlign: "center" }}><b>Chargement...</b></p>
) : newProducts.length === 0 ? (
  <p style={{ textAlign: "center",color:'red' }}><b>Aucun produit trouvé</b></p>
) : displayMode === 'table' ? (
          <table>
            <thead>
                <th>Image</th>
                <th>Référence</th>
                <th>Désignation</th>
                <th>Marque</th>
                <th>Prix</th>
         
            </thead>
            {newProducts.length > 0 ? (
              <tbody>
                {newProducts
                  .slice(0, fetched)
                  .map((product: DeletedProduct, index: number) => (
                    <tr key={index}>
                      <td>
                {product.supprime && <img src="/images/delete-image.png" alt="New" style={{width: '32px',height: '32px',position:'absolute',marginLeft:'-15px'}} />}

                        <img src={product.Image} alt={product.Designation} />
                        {product.DiscountAmount !== "Aucune remise" && (
            <p style={{color:'red',position:'absolute',marginLeft:'-35px',marginTop:'-63px'}}><b>{product.DiscountAmount}</b></p>
          )}
                      </td>
                      <td>{product.Ref}</td>
                      <td>

                      <Link
    className="product-details-link"
    to={`${ROUTES.PRODUCTDETAILS}/${product.Ref}`}
  >
    <a
      href={product.Link}
      target="_blank"
      style={{ textDecoration: "none", color: "black" }}
    >
      {product.Designation.length > 30
        ? product.Designation.slice(0, 30) + "..."
        : product.Designation}
    </a>
  </Link>
</td>
                      <td>{product.Brand}</td>

                      <td>{product.Price}</td>
                     
                    </tr>
                  ))}
              </tbody>
            ) : null}
          </table>
        ) : (
          <div className={styles.dashboard_content_cards}>
            {newProducts.map((product: DeletedProduct, index: number) => (
              <div key={index} className={styles.product_box} style={{height: '490px',width: '200px'}}>
                <img className={styles.sold_out_overlay} src="/images/out-of-stock.png" alt="new" />
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
                  <p style={{color:'red'}}>{product.Price}</p>
                  <p>{product.Company}</p>
                  <Link
  className="product-details-link"
  to={`${ROUTES.PRODUCTDETAILS}/${product.Ref}`}
>
  Voir plus
</Link>
                </div>
              </div>
            ))}
          </div>
        )}



        {newProducts.length > fetched ? (
          <span
            className={styles.handle_more_button}
            onClick={__handleLoadMore}
          >
              Charger plus
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default DeletedProducts;