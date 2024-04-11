import axios from "axios";
import styles from "../dashboard.module.css";
import { Input } from "@components";
import { DashboardComponents } from "@components";
import "./productPage.css";
import React, { useCallback, useEffect, useState, useMemo } from "react";
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
  DiscountAmount: string;
  BrandImage: string;
  Link: string;
  DateScrapping: Date;
  DateAjout?: Date;
  AncienPrix?: string;
  DateModification?: Date;
  supprime?: number;
  Category :string;
  Subcategory:string;
}

const Products: React.FC = () => {
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);
  const [products, setProducts] = useState<Product[]>([]);
  const [initialProducts, setInitialProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [fetched, setFetched] = useState<number>(0);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const companyOptions = Array.from(
    new Set(initialProducts.map((product) => product.Company))
  );
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [priceFilter, setPriceFilter] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<"table" | "box">("table");
  const [availabilityFilter, setAvailabilityFilter] = useState<string | null>(
    null
  );
  const [newProductsCount, setNewProductsCount] = useState<number>(0);
  const [arrivalDateFilter, setArrivalDateFilter] = useState<string | null>(
    null
  );

  const today = useMemo(() => new Date(), []);

  const filterProductsByArrivalDate = (filterType: "new" | "old") => {
    const filteredProducts = initialProducts.filter((product: Product) => {
      const productDate = new Date(product.DateScrapping);
      const todayDate = today.getTime();
      const productDateTime = productDate.getTime();

      if (filterType === "new") {
        return productDateTime >= todayDate;
      } else {
        return productDateTime < todayDate;
      }
    });
    setProducts(filteredProducts);
  };

  const uniqueProducts: Product[] = [];
  const uniqueRefs = new Set<string>();
  for (const product of initialProducts) {
    if (!uniqueRefs.has(product.Ref)) {
      uniqueProducts.push(product);
      uniqueRefs.add(product.Ref);
    }
  }

  // Calcul des statistiques de disponibilité
  const availableProductsCount = uniqueProducts.filter(
    (product) => product.Stock === "En stock"
  ).length;
  const unavailableProductsCount = uniqueProducts.filter(
    (product) => product.Stock === "Sur commande"
  ).length;

  const filterModifiedProducts = (products: Product[]) => {
    const filteredProducts: Product[] = [];
    const productsMap: Map<string, Product> = new Map();

    for (const product of products) {
      if (!productsMap.has(product.Ref)) {
        productsMap.set(product.Ref, product);
      } else {
        const existingProduct = productsMap.get(product.Ref)!;
        // Comparaison des dates de mise à jour pour déterminer la version la plus récente
        if (
          existingProduct.DateModification &&
          product.DateModification &&
          existingProduct.DateModification < product.DateModification
        ) {
          productsMap.set(product.Ref, product);
        }
      }
    }

    productsMap.forEach((value) => {
      filteredProducts.push(value);
    });

    return filteredProducts;
  };

  useEffect(() => {
    fetchProducts();
    setFetched(50);
    if (
      arrivalDateFilter &&
      (arrivalDateFilter === "new" || arrivalDateFilter === "old")
    ) {
      filterProductsByArrivalDate(arrivalDateFilter);
    } else {
      filterModifiedProducts(initialProducts); // Ajoutez cette ligne pour filtrer les produits modifiés
    }
  }, [page, pageSize, arrivalDateFilter, today]);

  const extractCategories = (products: Product[]) => {
    const categories: { [key: string]: string[] } = {};

    products.forEach((product) => {
      if (!categories[product.Category]) {
        categories[product.Category] = [product.Subcategory];
      } else {
        if (!categories[product.Category].includes(product.Subcategory)) {
          categories[product.Category].push(product.Subcategory);
        }
      }
    });

    return categories;
  };

  const categories = useMemo(() => extractCategories(initialProducts), [
    initialProducts,
  ]);

  const handleCategoryChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const { value } = event.target;
      if (value === "") {
        setProducts(initialProducts);
      } else {
        const [selectedCategory, selectedSubcategory] = value.split("-");
        const filteredProducts = initialProducts.filter(
          (product) =>
            product.Category === selectedCategory &&
            product.Subcategory === selectedSubcategory
        );
        setProducts(filteredProducts);
      }
    },
    [initialProducts]
  );

  const fetchProducts = useCallback(() => {
    setLoadingProducts(true);

    axios
      .get("http://localhost:5000/api/products", {
        params: {
          page,
          pageSize,
        },
      })
      .then((response) => {
        const data: Product[] = response.data;

        console.log("All products:", data);

        const updatedProducts = data.map((product) => {
          const initialProduct = initialProducts.find(
            (p) => p.Ref === product.Ref
          );

          if (initialProduct && initialProduct.Price !== product.Price) {
            return {
              ...product,
              ancien_prix: initialProduct.Price,
              update: 1,
            };
          }

          return {
            ...product,
            ancien_prix: product.DateAjout ? "" : product.Price,
          };
        });

        setProducts(updatedProducts);
        setInitialProducts(data);

        const newProducts = data.filter((product) => product.DateAjout);
        setNewProductsCount(newProducts.length);

        setLoadingProducts(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setLoadingProducts(false);
      });
  }, [page, pageSize, initialProducts]);



  const handleSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setSearch(value);
      if (value === "") {
        setFetched(50);
        setProducts(initialProducts);
      } else {
        const filteredProducts = initialProducts.filter(
          (product: Product) =>
            product.Ref.toString()
              .toLowerCase()
              .includes(value.toLowerCase()) ||
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
    filterProducts(value, maxPrice, "min");
  };

  const handleMaxPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setMaxPrice(value);
    filterProducts(minPrice, value, "max");
  };

  const filterProducts = (
    min: string,
    max: string,
    filterType: "min" | "max"
  ) => {
    const minPriceValue = parseFloat(min.replace(/\s/g, "").replace(",", "."));
    const maxPriceValue = parseFloat(max.replace(/\s/g, "").replace(",", "."));

    const filteredProducts = initialProducts.filter((product: Product) => {
      const price = parseFloat(
        product.Price.replace(/\s/g, "").replace(",", ".")
      );

      if (filterType === "min") {
        return price >= minPriceValue;
      } else if (filterType === "max") {
        return price <= maxPriceValue;
      }

      return true;
    });

    setProducts(filteredProducts);
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
      setAvailabilityFilter(
        value === "available" || value === "unavailable" ? value : null
      );
    },
    []
  );

  const applyPriceFilter = (filteredProducts: Product[]) => {
    const sortedProducts = [...filteredProducts];
    if (priceFilter === "asc") {
      return sortedProducts.sort(
        (a, b) =>
          parseFloat(a.Price.replace(/\s/g, "").replace(",", ".")) -
          parseFloat(b.Price.replace(/\s/g, "").replace(",", "."))
      );
    } else if (priceFilter === "desc") {
      return sortedProducts.sort(
        (a, b) =>
          parseFloat(b.Price.replace(/\s/g, "").replace(",", ".")) -
          parseFloat(a.Price.replace(/\s/g, "").replace(",", "."))
      );
    } else {
      return sortedProducts;
    }
  };

  const filteredProductsByCompany = selectedCompany
    ? products.filter((product) => product.Company === selectedCompany)
    : products;

  const filteredProductsByPrice =
    minPrice !== "" && maxPrice !== ""
      ? filteredProductsByCompany.filter((product) => {
          const price = parseFloat(
            product.Price.replace(/\s/g, "").replace(",", ".")
          );
          const min = parseFloat(minPrice.replace(/\s/g, "").replace(",", "."));
          const max = parseFloat(maxPrice.replace(/\s/g, "").replace(",", "."));
          return price >= min && price <= max;
        })
      : filteredProductsByCompany;

  const filteredProductsByAvailability = availabilityFilter
    ? availabilityFilter === "available"
      ? filteredProductsByPrice.filter(
          (product) => product.Stock === "En stock"
        )
      : filteredProductsByPrice.filter(
          (product) => product.Stock === "Sur commande"
        )
    : filteredProductsByPrice;

  const filteredProducts = applyPriceFilter(filteredProductsByAvailability);

  const __handleLoadMore = () => {
    if (products.length > fetched) {
      const newFetched = fetched + 50;
      setFetched(newFetched);
    }
  };

  const handleDisplayModeChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setDisplayMode(event.target.value as "table" | "box");
    },
    []
  );

  return (
    <div
      className={`${styles.dashboard_content} products_page product-page-inputs`}
    >
      <div className={styles.dashboard_content_container}>
        <div className={styles.dashboard_content_header}>
          <Input
            type="text"
            value={search}
            label="Chercher.."
            onChange={(e) => handleSearch(e)}
          />
          <img src="/icons/search.gif" className={styles.search_icon} />
        </div>

        <div className={styles.dashboard_content_cards}>
          <DashboardComponents.StatCard
            title="Tous Les Produits"
            value={uniqueProducts.length}
            icon="/icons/product.svg"
          />
          <DashboardComponents.StatCard
            title="Produits Disponibles"
            value={availableProductsCount}
            icon="/icons/product.svg"
          />
          <DashboardComponents.StatCard
            title="Produits Épuisés"
            value={unavailableProductsCount}
            icon="/icons/product.svg"
          />
        </div>

        <div className={styles.filter_container}>
          <div className={styles.filter_group}>
            <span className={styles.filter_label}>
              Filtrer par concurrent :
            </span>
            <select
              value={selectedCompany || "All"}
              onChange={handleCompanyChange}
            >
              <option value="All">Tous</option>
              {companyOptions.map((company: string) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.filter_group}>
            <span className={styles.filter_label}>
              Filtrer par catégorie :
            </span>
            <select onChange={handleCategoryChange}>
              <option value="">Toutes les catégories</option>
              {Object.keys(categories).map((category) => (
                <optgroup label={category} key={category}>
                  {categories[category].map((subcategory) => (
                    <option key={subcategory} value={`${category}-${subcategory}`}>
                      {subcategory}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div className={styles.filter_group}>
            <span className={styles.filter_label}>Prix min :</span>
            <input
              type="number"
              value={minPrice}
              onChange={handleMinPriceChange}
            />
          </div>

          <div className={styles.filter_group}>
            <span className={styles.filter_label}>Prix max :</span>
            <input
              type="number"
              value={maxPrice}
              onChange={handleMaxPriceChange}
            />
          </div>

          <div className={styles.filter_group}>
            <span className={styles.filter_label}>Trier par prix :</span>
            <select
              value={priceFilter || ""}
              onChange={handlePriceFilterChange}
            >
              <option value="">Sélectionnez...</option>
              <option value="asc">Prix croissant</option>
              <option value="desc">Prix décroissant</option>
            </select>
          </div>

          <div className={styles.filter_group}>
            <span className={styles.filter_label}>
              Filtrer par disponibilité :
            </span>
            <select
              value={availabilityFilter || ""}
              onChange={handleAvailabilityFilterChange}
            >
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
            onClick={() => setDisplayMode("table")}
            className={
              displayMode === "table" ? styles.selected_icon : styles.icon
            }
          />
          <img
            src="/icons/table-icon.svg"
            alt="Boîtes"
            onClick={() => setDisplayMode("box")}
            className={
              displayMode === "box" ? styles.selected_icon : styles.icon
            }
          />
        </div>
        <tr></tr>
        {loadingProducts ? (
          <p style={{ textAlign: "center" }}>
            <b>Chargement...</b>
          </p>
        ) : products.length === 0 ? (
          <p style={{ textAlign: "center", color: "red" }}>
            <b>Aucun produit trouvé</b>
          </p>
        ) : displayMode === "table" ? (
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
              <th>Détails</th>
            </thead>

            {filteredProducts.length > 0 ? (
              <tbody>
                {filteredProducts
                  .slice(0, fetched)
                  .map((product: Product, index: number) => (
                    <tr key={index}>
                      <td>
                        {product.DateAjout && (
                          <>
                            {new Date(
                              product.DateAjout
                            ).toLocaleDateString() ===
                            new Date().toLocaleDateString() ? (
                              <img
                                src="/images/sign.png"
                                alt="New"
                                style={{
                                  width: "35px",
                                  height: "35px",
                                  position: "absolute",
                                  marginLeft: "-15px",
                                }}
                              />
                            ) : null}
                          </>
                        )}
                        {product.DateModification && (
                          <img
                            src="/images/updated-table.png"
                            alt="Modified"
                            style={{
                              width: "35px",
                              height: "35px",
                              position: "absolute",
                              marginLeft: "-15px",
                            }}
                          />
                        )}
                        {product.supprime === 1 && (
                          <img
                            src="/images/delete-image.png"
                            alt="Out of Stock"
                            style={{
                              width: "35px",
                              height: "35px",
                              position: "absolute",
                              marginLeft: "-15px",
                            }}
                          />
                        )}
                        <img src={product.Image} alt={product.Designation} />
                        <p>
                  {product.DiscountAmount !== "Aucune remise" && (
                    <div
                      className={styles.discount_rectangle}
                      style={{
                        backgroundColor: "red",
                        color: "white",
                        position: "absolute",
                        top: "468px",
                        left: "15px",
                        padding: "5px",
                        borderRadius: "2px",
                      }}
                    >
                      <b>{product.DiscountAmount}</b>
                    </div>
                  )}
                </p>
            
                        
                      </td>
                      <td>{product.Ref}</td>
                      <td>
                        <a href={product.Link} target="_blank">
                          {product.Designation.length > 30
                            ? product.Designation.slice(0, 30) + "..."
                            : product.Designation}
                        </a>
                      </td>
                      <td>{product.Brand}</td>
                      <td>
                        <span
                          style={
                            product.Stock === "En stock"
                              ? { color: "green" }
                              : { color: "red" }
                          }
                        >
                          {product.Stock}
                        </span>
                      </td>

                      <td>
                        {product.DateAjout &&
                        new Date(product.DateAjout).toLocaleDateString() ===
                          new Date().toLocaleDateString()
                          ? "-"
                          : product.AncienPrix}
                      </td>
                      <td>
                        {product.DateAjout &&
                        new Date(product.DateAjout).toLocaleDateString() ===
                          new Date().toLocaleDateString()
                          ? "-"
                          : new Date(
                              product.DateScrapping
                            ).toLocaleDateString()}
                      </td>

                      <td>{product.Price}</td>
                      <td>{product.Company}</td>
                      <td>
                        <Link
                          className="product-details-link"
                          to={`${ROUTES.PRODUCTDETAILS}/${product.Ref}`}
                        >
                          Voir plus
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            ) : null}
          </table>
        ) : (
          <div className={styles.dashboard_content_cards}>
            {filteredProducts.map((product: Product, index: number) => (
              <div key={index} className={styles.product_box}>
              {product.Stock === "Sur commande" && (
                <img
                  className={styles.sold_out_overlay}
                  src="/images/pre-order.png"
                  alt="Sold Out"
                  style={{
                    position: "absolute",
                    top: "-60px",
                    left: "-30px",
                  }}
                />
              )}
              {product.DateAjout && (
                <img
                  className={styles.new_product_overlay}
                  src="/images/new.png"
                  alt="New Product"
                />
              )}
              {product.DateModification && (
                <img
                  className={styles.update_product_overlay}
                  src="/images/upp.png"
                  style={{
                    width: "150px",
                    height: "120px",
                    position: "absolute",
                  }}
                  alt="Updated Product"
                />
              )}
            
              {product.supprime && (
                <img
                  className={styles.new_product_overlay}
                  src="/images/out-of-stock.png"
                  alt="New Product"
                />
              )}
              <img src={product.Image} alt={product.Designation} />
              <div>
                <p>
                  {product.DiscountAmount !== "Aucune remise" && (
                    <div
                      className={styles.discount_rectangle}
                      style={{
                        backgroundColor: "red",
                        color: "white",
                        position: "absolute",
                        top: "1.60px",
                        left: "5px",
                        padding: "5px",
                        borderRadius: "5px",
                      }}
                    >
                      <b>{product.DiscountAmount}</b>
                    </div>
                  )}
                </p>
            
                <p> {product.Ref}</p>
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
                {product.DateModification && (
                  <div>
                    <p>
                      {" "}
                      <span
                        style={{
                          textDecoration: "line-through",
                          color: "gray",
                        }}
                      >
                        {product.AncienPrix}
                      </span>
                    </p>
                    <p>
                      {" "}
                      <span style={{ color: "red" }}>
                        <b>{product.Price}</b>
                      </span>
                    </p>
                  </div>
                )}
                {!product.DateModification && (
                  <p style={{ color: "red" }}> {product.Price}</p>
                )}
                <p>{product.Company}</p>
                <a
                  href={product.Link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Voir plus
                </a>
              </div>
            </div>
            
           
            ))}
          </div>
        )}

        {products.length > fetched ? (
          <span
            className={styles.handle_more_button}
            onClick={__handleLoadMore}
          >
            Charger plus
          </span>
        ) : null}
        <div className={styles.notification_bell}>
          <img src="/icons/notification-bell.gif" alt="Notification Bell" />
          {newProductsCount > 0 && (
            <span className={styles.notification_counter}>
              {newProductsCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
