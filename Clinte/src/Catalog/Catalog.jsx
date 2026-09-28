import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import "./Catalog.css";

const PAGE = 24;

function parseSheet(ws) {
  const all = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

  const headIdx = all.findIndex((r) =>
    r.some((c) => typeof c === "string" && c.trim() === "اسم الصنف")
  );
  if (headIdx === -1) {
    console.log("أول 5 صفوف في الملف:", all.slice(0, 5));
    throw new Error("مش لاقي عمود اسمه: اسم الصنف");
  }

  const [head, ...body] = all.slice(headIdx);
  const keys = head.map((h, i) =>
    typeof h === "string" ? h.trim() : i === 0 ? "م" : `col${i}`
  );

  return body
    .map((r) => Object.fromEntries(keys.map((k, i) => [k, r[i] ?? null])))
    .filter((r) => r["اسم الصنف"]) // يشيل صف الإجمالي والصفوف الفاضية
    .map((r) => ({
      id: r["رقم الصنف"],
      name: r["اسم الصنف"],
      qty: r["إجمالى الكمية"] ?? 0,
      cat: r["التصنيف"],
      mfr: r["المصنع"],
      barcode: r["باركود"],
    }));
}

// صورة تجريبية بتظهر لو الصنف ملوش صورة حقيقية
function placeholder(cat) {
  let h = 0;
  for (const ch of String(cat || "x")) h = (h * 31 + ch.charCodeAt(0)) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400">
  <rect width="300" height="400" fill="hsl(${h} 28% 84%)"/>
  <path d="M112 178 82 204l14 150h108l14-150-30-26q-38 20-76 0Z" fill="hsl(${h} 30% 62%)" stroke="hsl(${h} 25% 40%)" stroke-width="6" stroke-linejoin="round"/>
  </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function ProductCard({ p }) {
  return (
    <article className="card">
      <div className="pic">
        <img
          src={`/images/${p.id}.jpg`}
          alt={p.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null; // عشان ميلفش في حلقة
            e.currentTarget.src = placeholder(p.cat);
          }}
        />
        {p.cat && <span className="chip">{p.cat}</span>}
      </div>
      <div className="info">
        <div className="name" title={p.name}>{p.name}</div>
        <div className={`qty ${p.qty < 0 ? "neg" : ""}`}>
          <span>الكمية</span>
          <b>{p.qty}</b>
        </div>
      </div>
    </article>
  );
}

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [shown, setShown] = useState(PAGE);

  // 1) المستخدم يختار الملف من جهازه
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]]; // أول شيت
      const list = parseSheet(ws);
      console.log("عدد الأصناف:", list.length, list[0]);
      if (list.length === 0) setError("قرأت الملف بس مفيش أصناف فيه.");
      else setError("");
      setProducts(list);
      setFileName(file.name);
      setShown(PAGE);
    } catch (err) {
      console.error(err);
      setError("مشكلة في قراءة الملف: " + err.message);
    }
    e.target.value = ""; // يسمح باختيار نفس الملف تاني
  };

  // 2) بديل: الملف موجود جوه الموقع نفسه (public/products.xlsx)
  const loadFromSite = async () => {
    try {
      const res = await fetch("/products.xlsx");
      const buffer = await res.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      setProducts(parseSheet(wb.Sheets[wb.SheetNames[0]]));
      setFileName("products.xlsx");
      setError("");
    } catch {
      setError("مقدرتش أحمل الملف من الموقع.");
    }
  };

  const cats = useMemo(
    () => [...new Set(products.map((p) => p.cat).filter(Boolean))].sort((a, b) => a.localeCompare(b, "ar")),
    [products]
  );

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return products.filter(
      (p) =>
        (!cat || p.cat === cat) &&
        (!s || p.name.toLowerCase().includes(s) || String(p.barcode ?? "").includes(s))
    );
  }, [products, q, cat]);

  return (
    <div className="wrap" dir="rtl">
      <h1>كتالوج المنتجات</h1>

      <div className="tools one">
        <input type="file" accept=".xlsx,.xls" onChange={handleFile} />
      </div>

      {error && <p className="error">{error}</p>}

      {products.length === 0 ? (
        <p className="hint">ارفع ملف الإكسيل علشان تظهر الأصناف.</p>
      ) : (
        <>
          <div className="tools">
            <input
              type="search"
              placeholder="ابحث باسم الصنف أو الباركود"
              value={q}
              onChange={(e) => { setQ(e.target.value); setShown(PAGE); }}
            />
            <select value={cat} onChange={(e) => { setCat(e.target.value); setShown(PAGE); }}>
              <option value="">كل التصنيفات</option>
              {cats.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <p className="count">{filtered.length} صنف {fileName && `من ${fileName}`}</p>

          <div className="grid">
            {filtered.slice(0, shown).map((p) => <ProductCard key={p.id} p={p} />)}
          </div>

          {filtered.length > shown && (
            <div className="morewrap">
              <button onClick={() => setShown((n) => n + PAGE)}>
                عرض المزيد ({filtered.length - shown})
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}