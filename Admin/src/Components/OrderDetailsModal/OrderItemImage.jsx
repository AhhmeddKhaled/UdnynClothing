import { getImageUrl } from '../../services/OrdersServices';
const API_URL = import.meta.env.VITE_API_URL;


export default function OrderItemImage({ item }) {
  const imagePath = getImageUrl(item.realImagePath);

  const imageUrl = `${API_URL}${imagePath}`

  if (!imagePath) {
    return (
      <div
        className="orders-detail-item-image-placeholder"
        aria-label="Product image unavailable"
      >
        No image
      </div>
    );
  }

  return (
    <img
      className="orders-detail-item-image"
      src={imageUrl}
      loading="lazy"
    />
  );
}