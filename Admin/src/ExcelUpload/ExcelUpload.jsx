import React, { useState } from "react";
import "./ExcelUpload.css";

const API_URL = "http://localhost:5000";

export default function ExcelUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
      setError("من فضلك اختر ملف Excel بصيغة XLSX أو XLS");
      return;
    }

    setFile(selectedFile);
  };

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
      // اسم الحقل لازم يكون file
      // لأنه نفس الاسم الموجود في:
      // excelUpload.single("file")
      formData.append("file", file);

      const response = await fetch(
        `${API_URL}/api/products/import`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "حدث خطأ أثناء رفع الملف"
        );
      }

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

      console.log("Import result:", data);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "حدث خطأ أثناء رفع ملف Excel"
      );
    } finally {
      setUploading(false);
    }
  };

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
ExcelUpload.css