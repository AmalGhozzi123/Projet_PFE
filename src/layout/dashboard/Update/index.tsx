import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../dashboard.module.css';
import { Input } from '@components';
import { DashboardComponents } from '@components';
import '../Products/productPage.css';
import { ROUTES } from "../../../utils/routes";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx"; 



interface Product {
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
  const [selectedCompany, setSelectedCompany] = useState<string | null>('All'); 
  const [totalProducts, setTotalProducts] = useState(0);
  const [newProductsCount, setNewProductsCount] = useState(0);
  const [modifiedProductsCount, setModifiedProductsCount] = useState(0);
  const [availableProductsSet, setAvailableProductsCount] = useState(0);
  const [onOrderProductsSet, setOnOrderProductsCount] = useState(0);
  const [deletedProductsCount, setDeletedProductsCount] = useState(0);
  const [initialProducts, setInitialProducts] = useState<Product[]>([]);
  const [companyOptions, setCompanyOptions] = useState<string[]>([]); 
  const [dateFilter, setDateFilter] = useState<string | null>('jour');
 

  useEffect(() => {
    fetchProducts();
    setFetched(50);
  }, [page, pageSize]);

  useEffect(() => {
    setCompanyOptions(Array.from(new Set(products.map(product => product.Company)))); 
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
        const uniqueProducts = removeDuplicates(data, 'Ref'); 
        setProducts(uniqueProducts.filter((product: Product) => product.Modifications && product.Modifications.length > 0));
        setInitialProducts(uniqueProducts.filter((product: Product) => product.Modifications && product.Modifications.length > 0));
        setLoadingProducts(false);
         calculateStatistics(data);
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
      AncienPrix: product.AncienPrix || "",
      DateModification: product.Modifications && product.Modifications.length > 0
      ? product.Modifications.reduce((latest, current) => 
          new Date(latest.dateModification) > new Date(current.dateModification) ? latest : current
        ).dateModification.toString()
      : "",
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
      setAvailabilityFilter(value); 
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

 

  const __handleLoadMore = () => {
    if (products.length > fetched) {
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

  const handleResetFilters = () => {
    resetFilters();
  };
  const calculateStatistics = (products: Product[]) => {
    let allProductsSet = new Set();
    let newProductsSet = new Set();
    let modifiedProductsSet = new Set();
    let outOfStockProductsSet = new Set();
    let onOrderProductsSet =new Set();
    let availableProductsSet =new Set();
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
        switch (product.Stock) {
          case "En stock":
            availableProductsSet.add(product.Ref);
            break;
          case "Sur commande":
            onOrderProductsSet.add(product.Ref);
            break;
          case "Hors stock":
            outOfStockProductsSet.add(product.Ref);
            break;
        }
      });
  
      setTotalProducts(allProductsSet.size);
      setAvailableProductsCount(availableProductsSet.size);
      setOnOrderProductsCount(onOrderProductsSet.size);
      setDeletedProductsCount(outOfStockProductsSet.size);
      setNewProductsCount(newProductsSet.size);
      setModifiedProductsCount(modifiedProductsSet.size);
      setDeletedProductsCount(outOfStockProductsSet.size);
  
  };

  const filteredProductsByAvailability = availabilityFilter
      ? availabilityFilter === "available"
        ? products.filter(
            (product) => product.Stock === "En stock"
          )
        : availabilityFilter === "unavailable"
          ? products.filter(
              (product) => product.Stock === "Sur commande"
            )
          : availabilityFilter === "horstock"
            ? products.filter(
                (product) => product.Stock === "Hors stock"
              )
            : products  // If no valid filter is selected or if the filter is reset
       : products;


    
  const filteredProducts = applyPriceFilter(filteredProductsByAvailability);
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + ' ...' : text;
  };

  const filterProductsByDateRange = (filteredProducts: Product[]) => {
    if (!dateFilter) return filteredProducts;
    
    const currentDate = new Date();
    
    const startDate = new Date(currentDate);
    let endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 23, 59, 59, 999); 
  
    switch (dateFilter) {
      case 'jour':
        break;
      case 'semaine':
        startDate.setDate(currentDate.getDate() - 7);
        endDate = new Date();
        break;
      case 'mois':
        startDate.setMonth(currentDate.getMonth() - 1);
        endDate = new Date(); 
        break;
      default:
        return filteredProducts; 
    }
  
    return filteredProducts.filter(product => {
      // Vérifie si le produit a des modifications et prend la date de la dernière modification.
      if (product.Modifications && product.Modifications.length > 0) {
        const lastModification = product.Modifications[product.Modifications.length - 1];
        const lastModificationDate = new Date(lastModification.dateModification);
        return lastModificationDate >= startDate && lastModificationDate <= endDate;
      }
      return false;  // Si aucun enregistrement de modification n'existe, le produit n'est pas inclus.
    });
    
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

      <div className={styles.dashboard_cards}>
      <DashboardComponents.StatCard
            title="Produits Modifiés"
            link={ROUTES.UPDATE}
            value={modifiedProductsCount}
            icon="/icons/update.svg"
          />
           <DashboardComponents.StatCard
            title="Produits Disponibles"
            value={availableProductsSet}
            icon="/icons/product.svg"
          />
          <DashboardComponents.StatCard
            title="Produits sur commandes"
            value={onOrderProductsSet}
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
            <select value={selectedCompany || 'All'} onChange={(e) => setSelectedCompany(e.target.value)}>
              <option value="All" style={{color:'gray'}}>Filtrer par concurrent</option>
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
            <input type="number" value={minPrice} onChange={handleMinPriceChange} placeholder='Prix min'/>
          </div>
          
          <div className={styles.filter_group}>
            <input type="number" value={maxPrice} onChange={handleMaxPriceChange} placeholder='Prix max'/>
          </div>
          
          <div className={styles.filter_group}>
            <select value={priceFilter || ''} onChange={handlePriceFilterChange}>
              <option value="" style={{color:'gray'}}>Trier par prix</option>
              <option value="asc">Croissant</option>
              <option value="desc">Décroissant</option>
            </select>
          </div>

          <div className={styles.filter_group}>
            <select value={availabilityFilter || ""}
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
                <th>Ancien Prix</th>
                <th>Date Ancien Prix</th>
                <th>Prix</th>
            </thead>
            <tbody>
            {filteredProducts.map((product, index) => (
                <tr key={index}>
                  <td>
                {product.Modifications && product.Modifications.length > 0 && 
  <img src="/images/updated-table.png" alt="Modified" style={{width: '35px', height: '35px', position: 'absolute', marginLeft: '-15px'}}/>
}
 <img src={product.Image} alt={product.Designation} />
                    {product.DiscountAmount !== "Aucune remise" && (
            <p style={{  backgroundColor: "red",
            color: "white",
            position: "absolute",
            marginLeft: "-15px",
            marginTop:"-60px",
            borderRadius: "2px",}}><b>{product.DiscountAmount}</b></p>
          )}</td>
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
                          {product.Stock}
                        </span>
                      </td>
                  <td>{product.AncienPrix}</td>
                  <td>
  {product.Modifications && product.Modifications.length > 0
    ? new Date(product.Modifications[product.Modifications.length - 1].dateModification).toLocaleDateString()
    : 'Pas de modifications'}
</td>
 <td>{product.Price}</td>
     
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
            <p style={{   backgroundColor: "red",
            color: "white",
            position: "absolute",
            top: "180px",
            left: "65px",
            padding: "5px",
            borderRadius: "5px",}}><b>{product.DiscountAmount}</b></p>
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
