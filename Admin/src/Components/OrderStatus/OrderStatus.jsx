import "./orderStatus.css";

export default function OrderStatus({ status }) {
  console.log("Order status:", status);

  return (
    <span className={`order-status order-status-${status}`}>
      {status}
    </span>
  );
}