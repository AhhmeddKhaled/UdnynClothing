import { useState , useEffect } from "react";
import "./OrderDetailsModal.css";
import OrderItemImage from "./OrderItemImage.jsx";
import OrderStatus from "../OrderStatus/OrderStatus.jsx";

import { MdOutlineProductionQuantityLimits } from "react-icons/md";
import { TbBrandCashapp } from "react-icons/tb";
import { SlCalender } from "react-icons/sl";
import { BsTelephone } from "react-icons/bs";
import { RiGovernmentLine } from "react-icons/ri";
import { SiNamecheap } from "react-icons/si";
import { FaRegAddressCard } from "react-icons/fa";
import ChangeOrderStatus from "./ChangeOrderStatus/ChangeOrderStatus.jsx";

import Button from "../Button/Button";

export default function OrderDetailsModal({ order, logic }) {
  const [orderStatus, setOrderStatus] = useState(order?.status);

  useEffect(() => {
    setOrderStatus(order?.status);
  }, [order?._id, order?.status]);

  if (!order) return null;

  const {
    setSelectedOrder,

    changeOrderStatus,
    setChangeOderStatus,
    getCustomerName,
    getCustomerPhone,
    getCustomerEmail,
    getItemName,
    getItemLineTotal,
    getOrderSubtotal,
    getProductPrice,
    getOrderTotal,
    formatMoney,
    formatDate,
    statuses,
  } = logic;

  const onCloseOrder = () => setSelectedOrder(null);

  const onCloseChangeOrder = () => setChangeOderStatus(!changeOrderStatus)


  return (
    <div className="orders-modal-backdrop">
      <section
        className="orders-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-details-title"
      >
        <header className="orders-modal-header">
          <div className="orders-modal-header-top">
            <span className="orders-eyebrow">ORDER DETAILS</span>

          </div>

          <div className="orders-modal-header-bottom">
            <h2 className="order-details-id">
              order ID : {order.orderNumber || "Order details"}
            </h2>

            <div className="orders-modal-header-status">
              
              <OrderStatus 
              status={orderStatus} 
              change
              onClose={onCloseChangeOrder}
              />

              {changeOrderStatus &&
              <ChangeOrderStatus
                status={orderStatus}
                id={order._id}
                onStatusUpdated={setOrderStatus}
                onClose={onCloseChangeOrder}
              />}
              
            </div>

            <div className="orders-modal-header-date">
              <SlCalender />
              <span>{formatDate(order.createdAt)}</span>
            </div>
          </div>
        </header>

        <div className="orders-modal-content">
          <div className="orders-detail-grid">
            <div className="orders-detail-grid-name">
              <SiNamecheap />
              <strong>{getCustomerName(order)}</strong>
            </div>

            <div className="orders-detail-grid-phone">
              <BsTelephone />
              <strong>{getCustomerPhone(order) || "Not available"}</strong>
            </div>

            <div className="orders-detail-grid-governorate">
              <RiGovernmentLine />
              <strong>{order.governorate || "Not specified"}</strong>
            </div>

            <div className="orders-detail-grid-address">
              <FaRegAddressCard />
              <strong>
                {order.shippingAddress || "No shipping address provided"}
              </strong>
            </div>
          </div>

          <h3 className="orders-detail-section-title">Order items</h3>

          <div className="orders-detail-items">
            {(order.items || []).map((item, index) => (
              <div
                className="orders-detail-item"
                key={`${item.itemId || getItemName(item)}-${index}`}
              >
                <div className="order-detail-item-image">
                  <OrderItemImage item={item} />
                </div>

                <div className="orders-detail-item-info">
                  <strong>{getItemName(item)}</strong>
                  <span className="orders-detail-item-info-quantity">
                    <MdOutlineProductionQuantityLimits size={16} />
                    {item.quantity || 0}
                  </span>

                  <span className="orders-detail-item-info-unitPrice">
                    <TbBrandCashapp size={16} />{" "}
                    {formatMoney(getProductPrice(item,"retail"))}
                  </span>
                </div>

                <strong className="orders-detail-item-total">
                  {formatMoney(getItemLineTotal(item))}
                </strong>
              </div>
            ))}
          </div>

          <div className="orders-detail-total">
            <span>Products subtotal</span>
            <strong>{formatMoney(getOrderSubtotal(order))}</strong>
          </div>

          <div className="orders-detail-total">
            <span>Shipping cost</span>
            <strong>{formatMoney(order.shippingCost)}</strong>
          </div>

          <div className="orders-detail-total">
            <span>Total amount</span>
            <strong>{formatMoney(getOrderTotal(order))}</strong>
          </div>

          <h3 className="orders-detail-section-title">Customer note</h3>

          <p>{order.customerNote || "No customer note."}</p>
        </div>

        <footer className="orders-modal-footer">
          <button
            type="button"
            className="orders-close-button"
            onClick={onCloseOrder}
          >
            Close
          </button>
        </footer>
      </section>
    </div>
  );
}
