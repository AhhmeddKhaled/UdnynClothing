import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode"; // npm i html5-qrcode
import { HiOutlineX } from "react-icons/hi";

const REGION_ID = "ao-scanner-region";
const SAME_CODE_COOLDOWN_MS = 1500;

/**
 * Continuous camera scanner (stays open so several items can be scanned in a row).
 *
 * Props:
 *  - onScan(code) -> { ok: boolean, message: string }   (called for every accepted read)
 *  - onClose()
 *  - summary: short text shown in the footer, e.g. "3 products · 1,240 EGP"
 *
 * Needs HTTPS + camera permission.
 */
export default function BarcodeScanner({ onScan, onClose, summary }) {
  const [error, setError] = useState("");
  const [last, setLast] = useState(null);

  // Always call the latest onScan without restarting the camera.
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  const lastRead = useRef({ code: "", at: 0 });

  useEffect(() => {
    const scanner = new Html5Qrcode(REGION_ID);
    let started = false;
    let cancelled = false;

    const stop = () =>
      scanner
        .stop()
        .then(() => scanner.clear())
        .catch(() => {});

    scanner
      .start(
        { facingMode: "environment" }, // rear camera
        {
          fps: 10,
          qrbox: (w, h) => ({
            width: Math.floor(w * 0.85),
            height: Math.floor(Math.min(w, h) * 0.6),
          }),
        },
        (decodedText) => {
          const code = decodedText.trim();
          const now = Date.now();

          // The camera reads the same label many times per second: ignore repeats.
          if (
            code === lastRead.current.code &&
            now - lastRead.current.at < SAME_CODE_COOLDOWN_MS
          ) {
            return;
          }
          lastRead.current = { code, at: now };

          const result = onScanRef.current(code) || {};
          setLast({ ok: Boolean(result.ok), message: result.message || code });
          if (result.ok) navigator.vibrate?.(60);
        },
        () => {} // per-frame "no code found" errors: ignore
      )
      .then(() => {
        started = true;
        if (cancelled) stop(); // closed before the camera finished starting
      })
      .catch(() =>
        setError(
          "Could not open the camera. Allow camera access for this site and make sure it is opened over HTTPS."
        )
      );

    return () => {
      cancelled = true;
      if (started) stop();
    };
  }, []);

  return (
    <div className="ao-scanner" role="dialog" aria-modal="true" aria-label="Scan products">
      <div className="ao-scanner-card">
        <header className="ao-scanner-header">
          <strong>Scan products</strong>
          <button type="button" onClick={onClose} aria-label="Close scanner">
            <HiOutlineX />
          </button>
        </header>

        {error ? (
          <p className="ao-scanner-error" role="alert">
            {error}
          </p>
        ) : (
          <div id={REGION_ID} className="ao-scanner-region" />
        )}

        {last && (
          <p
            className={`ao-scanner-result ${last.ok ? "is-ok" : "is-error"}`}
            role="status"
          >
            {last.ok ? "✓ " : "✕ "}
            {last.message}
          </p>
        )}

        <footer className="ao-scanner-footer">
          <span>{summary}</span>
          <button type="button" className="ao-scanner-done" onClick={onClose}>
            Done
          </button>
        </footer>
      </div>
    </div>
  );
}