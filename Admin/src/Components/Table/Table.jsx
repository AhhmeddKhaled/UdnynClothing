import { useState, useCallback, useEffect, useRef } from "react";
import styles from "./Table.module.css";
import { useOrdersLogic } from "../../UI_Logic/OrdersLogic.jsx";

function getValue(obj, path) {
  return path.split(".").reduce((value, key) => value?.[key], obj);
}

function formatValue(value, key, formatMoney) {
  if (value == null) return "--";

  const normalizedKey = key.toLowerCase();

  if (
    normalizedKey.includes("date") ||
    normalizedKey.includes("createdat") ||
    normalizedKey.includes("updatedat")
  ) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "--";

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  }

  if (
    normalizedKey.includes("totalAmount") ||
    normalizedKey.includes("price")
  ) {
    return formatMoney(value);
  }

  if (Array.isArray(value)) return value.length;

  if (typeof value === "object") return JSON.stringify(value);

  return value;
}

export default function Table({ tableHeader, tableBody, actions = null }) {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const selectAllRef = useRef(null);
  const { formatMoney } = useOrdersLogic();

  const visibleIds = tableBody.map((item) => String(item.itemId ?? item._id));

  const allSelected =
    visibleIds.length > 0 &&
    visibleIds.every((id) => selectedProducts.includes(id));

  const someSelected = visibleIds.some((id) => selectedProducts.includes(id));

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected && !allSelected;
    }
  }, [someSelected, allSelected]);

  const handleSelectAll = useCallback(
    (event) => {
      const ids = tableBody.map((item) => String(item.itemId ?? item._id));

      if (event.target.checked) {
        setSelectedProducts((previous) => [...new Set([...previous, ...ids])]);
      } else {
        const visibleSet = new Set(ids);

        setSelectedProducts((previous) =>
          previous.filter((id) => !visibleSet.has(id)),
        );
      }
    },
    [tableBody],
  );

  const handleSelectProduct = useCallback((productId, checked) => {
    const id = String(productId);

    setSelectedProducts((previous) =>
      checked
        ? previous.includes(id)
          ? previous
          : [...previous, id]
        : previous.filter((selectedId) => selectedId !== id),
    );
  }, []);

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.productSelect}>
            <input
              ref={selectAllRef}
              type="checkbox"
              checked={allSelected}
              onChange={handleSelectAll}
              aria-label="Select all rows"
            />
          </th>

          {tableHeader.map((th) => (
            <th key={th.key}>{th.label}</th>
          ))}

          <th>actions</th>
        </tr>
      </thead>

      <tbody>
        {tableBody.map((item) => {
          const id = String(item.itemId ?? item._id);

          return (
            <tr key={item._id ?? item.itemId}>
              <td className={styles.productSelect}>
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(id)}
                  onChange={(event) =>
                    handleSelectProduct(id, event.target.checked)
                  }
                  aria-label={`Select row ${id}`}
                />
              </td>

              {tableHeader.map((th) => {
                const value = getValue(item, th.key);
                const formattedValue = formatValue(value, th.key, formatMoney);

                return (
                  <td key={th.key}>
                    {th.key === "status" ? (
                      <span
                        className={`order-status order-status-${String(
                          value ?? "",
                        )
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {formattedValue}
                      </span>
                    ) : (
                      <span>{formattedValue}</span>
                    )}
                  </td>
                );
              })}

              {actions && (
                <td className={styles.tableActions}>
                  {actions.map((action, i) => (
                    <span key={action.label ?? i}>
                      {typeof action.element === "function"
                        ? action.element(item)
                        : action.element}
                    </span>
                  ))}
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
