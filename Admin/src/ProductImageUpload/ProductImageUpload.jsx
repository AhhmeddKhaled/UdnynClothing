import React, { useState } from "react";
import "./ProductImageUpload.css";

// ======================================================
// رابط السيرفر على Back4App
// ======================================================

  const API_URL = "http://72.62.37.66:5000";"https://udnynclothing23-w873pt63.b4a.run";
export default function ProductImageUpload() {
  const [itemId, setItemId] = useState("");
  const [file, setFile] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ======================================================
  // اختيار الصورة
  // ======================================================

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    setMessage("");
    setError("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    // التأكد أن الملف صورة
    if (!selectedFile.type.startsWith("image/")) {
      setFile(null);

      setError(
        "من فضلك اختر ملف صورة فقط"
      );

      return;
    }

    // الحد الأقصى 5 MB
    if (selectedFile.size > 5 * 1024 * 1024) {
      setFile(null);

      setError(
        "حجم الصورة يجب ألا يتجاوز 5 ميجابايت"
      );

      return;
    }

    setFile(selectedFile);
  };

  // ======================================================
  // رفع الصورة
  // ======================================================

  const handleUpload = async () => {
    setMessage("");
    setError("");

    // التأكد من رقم الصنف
    if (!itemId.trim()) {
      setError("اكتب رقم الصنف أولًا");
      return;
    }

    // التأكد من الصورة
    if (!file) {
      setError("اختر الصورة أولًا");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();

      // مهم جدًا:
      // اسم الحقل لازم يكون image
      // لأنه مطابق للسيرفر:
      // upload.single("image")
      formData.append("image", file);

      const response = await fetch(
        `${API_URL}/api/products/${itemId.trim()}/image`,
        {
          method: "POST",
          body: formData,
        }
      );

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "السيرفر أرسل ردًا غير صالح"
        );
      }

      // ==================================================
      // خطأ من السيرفر
      // ==================================================

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "حدث خطأ أثناء رفع الصورة"
        );
      }

      // ==================================================
      // نجاح
      // ==================================================

      setMessage(
        `تم رفع صورة الصنف ${itemId} بنجاح`
      );

      console.log(
        "Image upload result:",
        data
      );

      // تفريغ الاختيارات
      setFile(null);

      const input =
        document.getElementById(
          "product-image-file"
        );

      if (input) {
        input.value = "";
      }

    } catch (err) {
      console.error(
        "Image upload error:",
        err
      );

      setError(
        err.message ||
          "حدث خطأ أثناء رفع الصورة"
      );
    } finally {
      setUploading(false);
    }
  };

  // ======================================================
  // الواجهة
  // ======================================================

  return (
    <div className="product-image-upload">

      <div className="product-image-upload-box">

        <h2>
          رفع صورة منتج
        </h2>

        <p className="product-image-hint">
          اكتب رقم الصنف ثم اختر الصورة وارفعها.
        </p>

        {/* رقم الصنف */}

        <label
          htmlFor="product-item-id"
          className="product-image-label"
        >
          رقم الصنف
        </label>

        <input
          id="product-item-id"
          type="number"
          min="1"
          placeholder="مثال: 123"
          value={itemId}
          onChange={(e) => {
            setItemId(e.target.value);
            setMessage("");
            setError("");
          }}
          className="product-item-input"
        />

        {/* اختيار الصورة */}

        <label
          htmlFor="product-image-file"
          className="product-image-label"
        >
          صورة المنتج
        </label>

        <input
          id="product-image-file"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="product-image-input"
        />

        {/* اسم الصورة */}

        {file && (
          <div className="selected-image">
            <span>
              الصورة المختارة:
            </span>

            <strong>
              {file.name}
            </strong>
          </div>
        )}

        {/* زر الرفع */}

        <button
          type="button"
          className="product-image-upload-button"
          onClick={handleUpload}
          disabled={
            !itemId ||
            !file ||
            uploading
          }
        >
          {uploading
            ? "جاري رفع الصورة..."
            : "رفع الصورة"}
        </button>

        {/* نجاح */}

        {message && (
          <div className="product-image-success">
            {message}
          </div>
        )}

        {/* خطأ */}

        {error && (
          <div className="product-image-error">
            {error}
          </div>
        )}

      </div>

    </div>
  );
}
