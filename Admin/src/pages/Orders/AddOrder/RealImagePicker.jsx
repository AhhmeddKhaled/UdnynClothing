
import { useEffect, useRef, useState } from "react";

export default function RealImagePicker({
  file,
  onChange,
  disabled = false,
}) {
  const cameraRef = useRef(null);
  const fileRef = useRef(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (!file) {
      setPreview("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleFile = (event) => {
    const selectedFile = event.target.files?.[0];

    // السماح باختيار نفس الصورة مرة أخرى بعد تغييرها أو حذفها.
    event.target.value = "";

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      window.alert("Please select an image file.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      window.alert("Image size must not exceed 5 MB.");
      return;
    }

    onChange(selectedFile);
  };

  return (
    <div className="real-image-picker">
      <div className="real-image-picker-heading">
        <strong>Actual Product Photo</strong>
        <span>Optional · Max 5 MB</span>
      </div>

      <input
        ref={cameraRef}
        className="real-image-picker-hidden-input"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        disabled={disabled}
        tabIndex={-1}
        aria-label="Take a product photo"
      />

      <input
        ref={fileRef}
        className="real-image-picker-hidden-input"
        type="file"
        accept="image/*"
        onChange={handleFile}
        disabled={disabled}
        tabIndex={-1}
        aria-label="Choose a product photo"
      />

      {preview ? (
        <div className="real-image-preview">
          <img src={preview} alt="Actual product preview" />

          <div className="real-image-preview-info">
            <strong>{file.name}</strong>
            <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
        </div>
      ) : (
        <div className="real-image-empty">
          No actual photo added yet.
        </div>
      )}

      <div className="real-image-actions">
        <button
          type="button"
          className="real-image-button"
          onClick={() => cameraRef.current?.click()}
          disabled={disabled}
        >
          Take Photo
        </button>

        <button
          type="button"
          className="real-image-button"
          onClick={() => fileRef.current?.click()}
          disabled={disabled}
        >
          {file ? "Change Photo" : "Choose Photo"}
        </button>

        {file && (
          <button
            type="button"
            className="real-image-button real-image-remove"
            onClick={() => onChange(null)}
            disabled={disabled}
          >
            Remove Photo
          </button>
        )}
      </div>
    </div>
  );
}
