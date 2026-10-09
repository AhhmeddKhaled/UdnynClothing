
import { FaTelegramPlane, FaWhatsapp } from "react-icons/fa";
import "./FloatingSocial.css";

export default function FloatingSocial({
  whatsappNumber = "",
  telegramUrl = "",
}) {
  return (
    <div className="floating-social">
      {telegramUrl && (
        <a
          className="floating-social__button floating-social__telegram"
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact us on Telegram"
        >
          <FaTelegramPlane aria-hidden="true" />
        </a>
      )}

      {whatsappNumber && (
        <a
          className="floating-social__button floating-social__whatsapp"
          href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact us on WhatsApp"
        >
          <FaWhatsapp aria-hidden="true" />
        </a>
      )}
    </div>
  );
}