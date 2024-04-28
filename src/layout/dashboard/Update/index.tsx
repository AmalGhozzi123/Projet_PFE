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
  Modifications?: Modification[];
  Category :string;
  Subcategory:string;


}
interface Modification {
  dateModification: Date;
  ancienPrix:string;
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


  useEffect(() => {
        setCompanyOptions(Array.from(new Set(products.map(product => product.Company)))); 
    const filteredNewProducts = filterProductsByDateRange(initialProducts);
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
        const data: Product[] = response.data;
        const uniqueProducts = removeDuplicates(data, 'Ref'); 
        setProducts(uniqueProducts.filter((product: Product) => product.Modifications && product.Modifications.length > 0));
        setInitialProducts(uniqueProducts.filter((product: Product) => product.Modifications && product.Modifications.length > 0));
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


  const exportToXLS = useCallback(() => {
    // Filtrer les produits selon les critères sélectionnés
    let filteredProducts = initialProducts.filter(product => {
      const priceValid = parseFloat(product.Price.replace(/\s/g, '').replace(',', '.'));
      const meetsPriceCriteria = (!minPrice || priceValid >= parseFloat(minPrice.replace(/\s/g, '').replace(',', '.'))) &&
                           (!maxPrice || priceValid <= parseFloat(maxPrice.replace(/\s/g, '').replace(',', '.')));

      const meetsStockCriteria = !availabilityFilter || 
        (availabilityFilter === "available" && product.Stock === "En stock") ||
        (availabilityFilter === "unavailable" && product.Stock === "Sur commande") ||
        (availabilityFilter === "horstock" && product.Stock === "Hors stock");
      const meetsCompanyCriteria = !selectedCompany || selectedCompany === "All" || product.Company === selectedCompany;
  
      return meetsPriceCriteria && meetsStockCriteria && meetsCompanyCriteria;
    });
  
    if (priceFilter === 'asc') {
      filteredProducts.sort((a, b) => parseFloat(a.Price.replace(/\s/g, '').replace(',', '.')) - parseFloat(b.Price.replace(/\s/g, '').replace(',', '.')));
    } else if (priceFilter === 'desc') {
      filteredProducts.sort((a, b) => parseFloat(b.Price.replace(/\s/g, '').replace(',', '.')) - parseFloat(a.Price.replace(/\s/g, '').replace(',', '.')));
    }
  
    const data = filteredProducts.map(product => {
      const lastModification = product.Modifications && product.Modifications[product.Modifications.length - 1];
      return {
        Ref: product.Ref,
        Image: product.Image,
        Designation: product.Designation,
        DateAjout: product.DateAjout ? new Date(product.DateAjout).toLocaleDateString() : 'N/A', // Ensures DateAjout is treated as a Date
        Price: product.Price,
        DiscountAmount: product.DiscountAmount,
        Stock: product.Stock,
        Brand: product.Brand,
        BrandImage: product.BrandImage,
        Company: product.Company,
        Category: product.Category,
        Subcategory: product.Subcategory,
        Link: product.Link,
        AncienPrix: lastModification ? lastModification.ancienPrix : 'N/A',
        DateModification: lastModification ? new Date(lastModification.dateModification).toLocaleDateString() : 'N/A'
      };
    });
    
  
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "FilteredProducts");
    XLSX.writeFile(wb, `FilteredProducts_${new Date().toISOString().split('T')[0]}.xlsx`);
  }, [initialProducts, minPrice, maxPrice, selectedCompany, availabilityFilter, priceFilter]);
  
  

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
      
      let filteredProducts = initialProducts; 
      if (value === "available") {
        filteredProducts = initialProducts.filter(product => product.Stock === "En stock");
      } else if (value === "unavailable") {
        filteredProducts = initialProducts.filter(product => product.Stock === "Sur commande");
      } else if (value === "horstock") {
        filteredProducts = initialProducts.filter(product => product.Stock === "Hors stock");
      }
  
      setProducts(filteredProducts); 
    },
    [initialProducts]
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
    setDateFilter('jour'); 
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
            : products  
       : products;


       const modifiedProductsCount = products.length;
       const availableProductsCount = products.filter(product => product.Stock === "En stock").length;
       const unavailableProductsCount = products.filter(product => product.Stock === "Sur commande").length;
       const deletedProductsCount = products.filter(product => product.Stock === "Hors stock").length;
    
  const filteredProducts = applyPriceFilter(filteredProductsByAvailability);
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + ' ...' : text;
  };

 const filterProductsByDateRange = (products: Product[]): Product[] => {
  if (!dateFilter) return products;
  
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); 
  let endDate = new Date(currentDate.getTime());
  endDate.setHours(23, 59, 59, 999); 

  switch (dateFilter) {
    case 'jour':
      break;
    case 'semaine':
      currentDate.setDate(currentDate.getDate() - 7); 
      break;
    case 'mois':
      currentDate.setMonth(currentDate.getMonth() - 1); 
      break;
    default:
      return products; 
  }

  return products.filter(product => {
    if (product.Modifications && product.Modifications.length > 0) {
      const lastModificationDate = new Date(product.Modifications[product.Modifications.length - 1].dateModification);
      return lastModificationDate >= currentDate && lastModificationDate <= endDate;
    }
    return false; 
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
            title="Produits en stock"
            value={availableProductsCount}
            icon="/icons/product.svg"
          />
              <DashboardComponents.StatCard
            title="Produits Hors stock"
            link={ROUTES.DELETEDPRODUCTS}
            value={deletedProductsCount}
            icon="/images/suppression.png"
          />
          <DashboardComponents.StatCard
            title="Produits sur commandes"
            value={unavailableProductsCount}
            icon="/icons/product.svg"
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
              <option value="available">En stock</option>
              <option value="horstock">Hors stock</option>
              <option value="unavailable">Sur commande</option>
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
/><img
      className={styles.xls_image}
  src="/images/telecharger.png"
  alt="Exporter en XLS"
  onClick={exportToXLS}
  style={{width:'15px',height:'15px',marginLeft:'7px'}}
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
                <th>Date Nouveau Prix</th>
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
  <span
  style={{ textDecoration: "none", color: "black" }}
>
  {product.Designation.length > 30
    ? product.Designation.slice(0, 30) + "..."
    : product.Designation}
</span>

  </Link>
</td>

                  <td>{product.Brand}</td>
                  <td>
                        <span style={product.Stock === "En stock" ? { color: "green" } : { color: "red" }}>
                          {product.Stock}
                        </span>
                      </td>
                  <td>
  {product.Modifications && product.Modifications.length > 0
    ? product.Modifications[product.Modifications.length - 1].ancienPrix
    : 'Pas de modifications'}
</td>
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




  <p><span style={{ textDecoration: 'line-through',color:'gray'}}>{product.Modifications && product.Modifications.length > 0
    ? product.Modifications[product.Modifications.length - 1].ancienPrix
    : 'Pas de modifications'}</span></p>
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
