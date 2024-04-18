import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../dashboard.module.css';
import { Input } from '@components';
import { DashboardComponents } from '@components';
import { ROUTES } from "../../../utils/routes";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx"; 

interface newProduct {
  Ref: string;
  Designation: string;
  Price: string;
  Stock: string;
  Image: string;
  Brand: string;
  Company: string;
  DiscountAmount: string;
  BrandImage: string;
  Link: string;
  DateScrapping: Date;
  DateAjout?: Date;
  AncienPrix?: string;
  Modifications?: Modification[];
  Category :string;
  Subcategory:string;
}
interface Modification {
  dateModification: Date;
}

const NewProducts: React.FC = () => {
  const [initialProducts, setInitialProducts] = useState<newProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [products, setProducts] = useState<newProduct[]>([]);
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
const [dateFilter, setDateFilter] = useState<string | null>('jour');
const [totalProducts, setTotalProducts] = useState(0);
const [newProductsCount, setNewProductsCount] = useState(0);
const [modifiedProductsCount, setModifiedProductsCount] = useState(0);
const [deletedProductsCount, setDeletedProductsCount] = useState(0);

useEffect(() => {
  fetchProducts();
  setFetched(50);
}, [page, pageSize]);

useEffect(() => {
  const filteredNewProducts = filterNewProductsByDateRange(initialProducts);
  setProducts(filteredNewProducts);
}, [initialProducts, dateFilter]);


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
        const data: newProduct[] = response.data;
    
        setProducts(data.filter((product: newProduct) => product.DateAjout));
setInitialProducts(data.filter((product: newProduct) => product.DateAjout));
calculateStatistics(data);
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
          (product: newProduct) =>
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
  const calculateStatistics = (products: newProduct[]) => {
    let allProductsSet = new Set();
    let newProductsSet = new Set();
    let modifiedProductsSet = new Set();
    let outOfStockProductsSet = new Set();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    products.forEach((product) => {
        allProductsSet.add(product.Ref);
       
        if (product.DateAjout) {
            const ajoutDate = new Date(product.DateAjout);
            ajoutDate.setHours(0, 0, 0, 0);
            if (ajoutDate.getTime() === today.getTime()) {
                newProductsSet.add(product.Ref);
            }
        }

        if (product.Modifications && product.Modifications.length > 0) {
            product.Modifications.forEach((mod) => {
                const modDate = new Date(mod.dateModification);
                modDate.setHours(0, 0, 0, 0);
                if (modDate.getTime() === today.getTime()) {
                    modifiedProductsSet.add(product.Ref);
                }
            });
        }

        if (product.Stock === "Hors stock") {
            outOfStockProductsSet.add(product.Ref);
        }
    });
    setTotalProducts(allProductsSet.size);
    setNewProductsCount(newProductsSet.size);
    setModifiedProductsCount(modifiedProductsSet.size);
    setDeletedProductsCount(outOfStockProductsSet.size);
  };
  const handleCompanyChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const { value } = event.target;
      setSelectedCompany(value === "All" ? null : value);
    },
    []
  );
  const filterNewProductsByDateRange = (products: newProduct[]) => {
    const currentDate = new Date();
    let startDate = new Date();
    let endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59, 999);

    switch (dateFilter) {
        case 'jour':
            break;
        case 'semaine':
            startDate.setDate(currentDate.getDate() - 7);
            break;
        case 'mois':
            startDate.setMonth(currentDate.getMonth() - 1);
            break;
        default:
            return products;
    }

    return products.filter(product => {
      if (typeof product.DateAjout !== 'undefined') {
          const productDate = new Date(product.DateAjout);
          return productDate >= startDate && productDate <= endDate;
      }
      return false; // ou gérer d'une autre manière si DateAjout est undefined
  });
  
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
      BrandImage: product.BrandImage,
      Link: product.Link,
      DateAjout: product.DateAjout ? product.DateAjout.toString() : "",
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
  
  const uniqueProducts: newProduct[] = [];
  const uniqueRefs = new Set<string>();
  for (const product of initialProducts) {
    if (!uniqueRefs.has(product.Ref)) {
      uniqueProducts.push(product);
      uniqueRefs.add(product.Ref);
    }
  }




  
  const filterProducts = (min: string, max: string, filterType: 'min' | 'max') => {
    const minPriceValue = parseFloat(min.replace(/\s/g, '').replace(',', '.'));
    const maxPriceValue = parseFloat(max.replace(/\s/g, '').replace(',', '.'));

    const filteredProducts = initialProducts.filter((product: newProduct) => {
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
      setAvailabilityFilter(value); 
    },
    []
  );
  

  const applyPriceFilter = (filteredProducts: newProduct[]) => {
    const sortedProducts = [...filteredProducts];
    if (priceFilter === "asc") {
      return sortedProducts.sort((a, b) => parseFloat(a.Price.replace(/\s/g, '').replace(',', '.')) - parseFloat(b.Price.replace(/\s/g, '').replace(',', '.')));
    } else if (priceFilter === "desc") {
      return sortedProducts.sort((a, b) => parseFloat(b.Price.replace(/\s/g, '').replace(',', '.')) - parseFloat(a.Price.replace(/\s/g, '').replace(',', '.')));
    } else {
      return sortedProducts;
    }
  };

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
    ? availabilityFilter === "available"
      ? filteredProductsByPrice.filter(
          (product) => product.Stock === "En stock"
        )
      : availabilityFilter === "unavailable"
        ? filteredProductsByPrice.filter(
            (product) => product.Stock === "Sur commande"
          )
        : availabilityFilter === "horstock"
          ? filteredProductsByPrice.filter(
              (product) => product.Stock === "Hors stock"
            )
          : filteredProductsByPrice  // If no valid filter is selected or if the filter is reset
    : filteredProductsByPrice;
  
  const handleDisplayModeChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setDisplayMode(event.target.value as 'table' | 'box');
    },
    []
  );
  const resetFilters = useCallback(() => {
    setSearch("");
    setPage(1);
    setPageSize(50);
    setProducts(initialProducts);
    setPriceFilter(null);
    setMinPrice("");
    setMaxPrice("");
    setAvailabilityFilter(null);
    setDateFilter(null);
    setSelectedCompany(null);
  }, [initialProducts]);

  const handleResetFilters = () => {
    resetFilters();
  };
  const __handleLoadMore = () => {
    if (initialProducts.length > fetched) {
      const newFetched = fetched + 50;
      setFetched(newFetched);
    }
  };
  const filteredProducts = applyPriceFilter(filteredProductsByAvailability);
  const newProducts = filteredProducts.filter((product: newProduct) => product.DateAjout);
  
  
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + ' ...' : text;
  };
  const availableProductsCount = uniqueProducts.filter(
    (product) => product.Stock === "En stock"
  ).length;
  const unavailableProductsCount = uniqueProducts.filter(
    (product) => product.Stock === "Sur commande"
  ).length;
  
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
            title="Nouveaux Produits"
            link={ROUTES.NEWPRODUCTS}
            value={newProductsCount}
            icon="/icons/new.svg"
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
            title="Produits Indisponibles"
            link={ROUTES.DELETEDPRODUCTS}
            value={deletedProductsCount}
            icon="/images/suppression.png"
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
            <select value={dateFilter || ""} onChange={(e) => setDateFilter(e.target.value)}>
             <option value="jour">aujourd'hui</option>
             <option value="semaine"> cette semaine</option>
             <option value="mois">ce mois</option>
           </select>
         </div>
          <div className={styles.filter_group}>
            <input type="number" value={minPrice} onChange={handleMinPriceChange} placeholder='Prix min' />
          </div>
          
          <div className={styles.filter_group}>
            <input type="number" value={maxPrice} onChange={handleMaxPriceChange} placeholder='Prix max'/>
          </div>
          
          <div className={styles.filter_group}>
            <select value={priceFilter || ""} onChange={handlePriceFilterChange}>
              <option value="" style={{color:'gray'}}>Trier par prix </option>
              <option value="asc">Croissant</option>
              <option value="desc">Décroissant</option>
            </select>
          </div>

          <div className={styles.filter_group}>
            <span className={styles.filter_label}></span>
            <select
              value={availabilityFilter || ""}
              onChange={handleAvailabilityFilterChange}
            >
              <option value="" style={{color:'gray'}}>Filtrer par disponibilité</option>
              <option value="available">Disponibles</option>
              <option value="unavailable">Sur commandes</option>
              <option value="horstock">Hors stock</option>
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
  src="/images/xls.png"
  alt="Exporter en XLS"
  onClick={exportToXLS}
/>
  <tr></tr>
  {loadingProducts ? (
  <p style={{ textAlign: "center" }}><b>Veuillez patienter...</b></p>
) : products.length === 0 ? (
  <p style={{ textAlign: "center", color: "red" }}><b>Aucun produit trouvé</b></p>
) : displayMode === 'table' ? (
          <table>
            <thead>
                <th>Image</th>
                <th>Référence</th>
                <th>Désignation</th>
                <th>Marque</th>
                <th>Disponibilité</th>
                <th>Date </th>
                <th>Prix</th>
        
            </thead>
            {newProducts.length > 0 ? (
              <tbody>
              {filterNewProductsByDateRange(newProducts).slice(0, fetched).map((product: newProduct, index: number) => (
                    <tr key={index}>
                      <td>
                {product.DateAjout && <img src="/images/sign.png" alt="New" style={{width: '35px',height: '35px',position:'absolute',marginLeft:'-15px'}} />}

                        <img src={product.Image} alt={product.Designation} />
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
                      <td>
                      <span style={product.Stock === "En stock" ? { color: "green" } : { color: "red" }}>
                          {product.Stock}</span>
                      </td>

                      <td>
  {product.DateAjout ? new Date(product.DateAjout).toLocaleDateString() : 'Date non disponible'}
</td>
 <td>{product.Price}</td>
  
                    </tr>
                  ))}
              </tbody>
            ) : null}
          </table>
        ) : (
          <div className={styles.dashboard_content_cards}>
            {filterNewProductsByDateRange(newProducts).map((product: newProduct, index: number) => (
              <div key={index} className={styles.product_box}>
                <img className={styles.sold_out_overlay} src="/images/new.png" alt="new" />
                <img src={product.Image} alt={product.Designation} />
                <div>
                <h3>
                  <a
                    href={product.Link}
                    target="_blank"
                    style={{ color: "#140863" }}
                  >
                    {product.Designation.length > 30
                      ? product.Designation.slice(0, 30) + "..."
                      : product.Designation}
                  </a>
                </h3>
                  <p>
                  <img
                    src={product.BrandImage}
                    alt={product.Designation}
                    style={{ width: "50px", height: "50px" }}
                  />
                </p>
                  <p> Prix : {product.Price}</p>
                  <p>Disponibilté : {product.Stock}</p>
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

      
{!dateFilter || loadingProducts ? null : (
  newProducts.length > fetched ? (
    <span
      className={styles.handle_more_button}
      onClick={__handleLoadMore}
    >
      Charger plus
    </span>
  ) : null
)}

      </div>
    </div>
  );
};

export default NewProducts;