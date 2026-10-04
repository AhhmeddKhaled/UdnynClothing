
import React, { useState } from "react";
import "./ExcelUpload.css";

// ======================================================
// رابط السيرفر على Back4App
// ======================================================


const API_URL = "https://udnyn.com";;"https://udnynclothing23-w873pt63.b4a.run";

export default function ExcelUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ======================================================
  // اختيار ملف Excel
  // ======================================================

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    setMessage("");
    setError("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const fileName = selectedFile.name.toLowerCase();

    const isExcel =
      fileName.endsWith(".xlsx") ||
      fileName.endsWith(".xls");

    if (!isExcel) {
      setFile(null);
      setError(
        "من فضلك اختر ملف Excel بصيغة XLSX أو XLS"
      );
      return;
    }

    setFile(selectedFile);
  };

  // ======================================================
  // رفع ملف Excel
  // ======================================================

  const handleUpload = async () => {
    if (!file) {
      setError("اختر ملف Excel أولًا");
      return;
    }

    try {
      setUploading(true);
      setMessage("");
      setError("");

      const formData = new FormData();

      // مهم جدًا:
      // لازم يكون اسم الحقل "file"
      // لأنه مطابق للسيرفر:
      // excelUpload.single("file")

      formData.append("file", file);

      const response = await fetch(
        `${API_URL}/api/products/import`,
        {
          method: "POST",
          body: formData,
        }
      );

      // محاولة قراءة الرد كـ JSON
      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "السيرفر أرسل ردًا غير صالح"
        );
      }

      // ==================================================
      // التعامل مع أخطاء السيرفر
      // ==================================================

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "حدث خطأ أثناء رفع الملف"
        );
      }

      // ==================================================
      // نجاح الاستيراد
      // ==================================================

      setMessage(
        `تم رفع الملف بنجاح — تم استيراد ${data.total} صنف`
      );

      setFile(null);

      // تصفير input
      const input =
        document.getElementById("excel-file");

      if (input) {
        input.value = "";
      }

      console.log(
        "Import result:",
        data
      );
    } catch (err) {
      console.error(
        "Excel upload error:",
        err
      );

      setError(
        err.message ||
          "حدث خطأ أثناء رفع ملف Excel"
      );
    } finally {
      setUploading(false);
    }
  };

  // ======================================================
  // الواجهة
  // ======================================================

  return (
    <div className="excel-upload">

      <div className="excel-upload-box">

        <h2>
          تحديث المنتجات
        </h2>

        <p className="excel-upload-hint">
          ارفع ملف Excel لتحديث قائمة المنتجات الحالية.
        </p>

        {/* اختيار الملف */}

        <label
          htmlFor="excel-file"
          className="excel-file-label"
        >
          اختر ملف Excel
        </label>

        <input
          id="excel-file"
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="excel-file-input"
        />

        {/* اسم الملف */}

        {file && (
          <div className="selected-file">
            <span>
              الملف المختار:
            </span>

            <strong>
              {file.name}
            </strong>
          </div>
        )}

        {/* زر الرفع */}

        <button
          type="button"
          className="excel-upload-button"
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading
            ? "جاري رفع الملف..."
            : "رفع الملف"}
        </button>

        {/* رسالة النجاح */}

        {message && (
          <div className="excel-success">
            {message}
          </div>
        )}

        {/* رسالة الخطأ */}

        {error && (
          <div className="excel-error">
            {error}
          </div>
        )}

      </div>

    </div>
  );
}