import "./AvailableStock.css";

import { useEffect, useState } from "react";

import { authFetch } from "../Login/auth.js";

export default function AvailableStock() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await authFetch(
          "/api/availableStock"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load products"
          );
        }

        if (!Array.isArray(data.products)) {
          throw new Error(
            "Unexpected products data"
          );
        }

        setProducts(data.products);
      } catch (error) {
        console.error(
          "Available Stock error:",
          error
        );

        setError(
          error.message ||
            "Failed to load products"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="available-stock">
        <div className="available-stock-state">
          Loading products...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="available-stock">
        <div className="available-stock-state available-stock-error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="available-stock">
      <div className="available-stock-header">
        <div>
          <h1>Available Stock</h1>

          <p>
            {products.length.toLocaleString(
              "en-US"
            )}{" "}
            products currently available
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="available-stock-state">
          No products found.
        </div>
      ) : (
        <div className="available-stock-table-wrap">
          <table className="available-stock-table">
            <thead>
              <tr>
                <th>Item ID</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Category</th>
                <th>Manufacturer</th>
                <th>Barcode</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr
                  key={
                    product._id ||
                    product.itemId
                  }
                >
                  <td>
                    <span className="available-stock-item-id">
                      {product.itemId}
                    </span>
                  </td>

                  <td>
                    <div className="available-stock-product">
                      <div className="available-stock-image">
                        {product.imagePath ? (
                          <img
                            src={product.imagePath}
                            alt={product.name}
                          />
                        ) : (
                          <span>
                            No image
                          </span>
                        )}
                      </div>

                      <div className="available-stock-product-name">
                        {product.name}
                      </div>
                    </div>
                  </td>

                  <td>
                    <span
                      className={
                        product.qty > 0
                          ? "available-stock-qty"
                          : "available-stock-qty available-stock-qty-empty"
                      }
                    >
                      {Number(
                        product.qty || 0
                      ).toLocaleString("en-US")}
                    </span>
                  </td>

                  <td>
                    {product.category ||
                      "—"}
                  </td>

                  <td>
                    {product.manufacturer ||
                      "—"}
                  </td>

                  <td>
                    {product.barcode ||
                      "—"}
                  </td>

                  <td>
                    <span className="available-stock-status">
                      Available
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}