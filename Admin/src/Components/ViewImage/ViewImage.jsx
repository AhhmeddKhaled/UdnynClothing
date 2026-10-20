import styles from "./ViewImage.module.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function ViewImage({
  imageSrc,
  openImage = false,
  onClose,
}) {
  if (!openImage || !imageSrc) return null;

  const imageUrl = imageSrc.startsWith("http")
    ? imageSrc
    : `${API_URL}${imageSrc}`;

  return (
    <div className={styles.ViewImageContainer}>
      <div
        className={styles.ViewImageLayer}
        onClick={onClose}
      />

      <img
        src={imageUrl}
        alt="Product preview"
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  );
}