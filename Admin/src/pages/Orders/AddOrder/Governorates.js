// ---------------------------------------------------------------------------
// Text helpers (shared by the parser and the page)
// ---------------------------------------------------------------------------

// Unify Arabic letters so "الإسم" / "الاسم" and "الجيزة" / "الجيزه" compare equal.
export const normalizeArabic = (s) =>
  String(s ?? "")
    .replace(/[\u064B-\u0652]/g, "") // diacritics
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي");

// Arabic-Indic and Persian digits -> English digits.
export const normalizeDigits = (s) =>
  String(s ?? "")
    .replace(/[٠-٩]/g, (d) => d.charCodeAt(0) - 1632)
    .replace(/[۰-۹]/g, (d) => d.charCodeAt(0) - 1776);

// Comparison key for governorate names: normalized, no leading "ال", lowercase.
// So "القاهرة", "قاهره" and "Cairo"-style variants all line up.
const govKey = (s) =>
  normalizeArabic(s).trim().toLowerCase().replace(/^ال(?=\S)/, "");

// ---------------------------------------------------------------------------
// Governorates
// `fee` = default shipping cost in EGP. `null` = not configured yet
// (shipping is then NOT auto-filled and must be entered manually).
// ---------------------------------------------------------------------------
export const GOVERNORATES = [
  { ar: "القاهرة", en: ["cairo"], fee: 70 },
  { ar: "الجيزة", en: ["giza"], fee: 70 },
  { ar: "الإسكندرية", en: ["alexandria"], fee: 85 },
  { ar: "القليوبية", en: ["qalyubia", "qalyubiyya", "kalyoubia"], fee: 90 },
  { ar: "الشرقية", en: ["sharqia", "sharkia", "sharqiyya"], fee: 90 },
  { ar: "الدقهلية", en: ["dakahlia", "daqahliyya"], fee: 90 },
  { ar: "الغربية", en: ["gharbia", "gharbiyya"], fee: 90 },
  { ar: "المنوفية", en: ["monufia", "menoufia", "minufiyya"], fee: 90 },
  { ar: "البحيرة", en: ["beheira", "behira", "buhayra"], fee: 90 },
  { ar: "كفر الشيخ", en: ["kafr el sheikh", "kafr el-sheikh", "kafr elsheikh"], fee: 90 },
  { ar: "دمياط", en: ["damietta"], fee: 90 },
  { ar: "بورسعيد", en: ["port said", "portsaid"], fee: 85 },
  { ar: "الإسماعيلية", en: ["ismailia"], fee: 85 },
  { ar: "السويس", en: ["suez"], fee: 85 },
  { ar: "شمال سيناء", en: ["north sinai"], fee: null }, // not in your price list yet
  { ar: "جنوب سيناء", en: ["south sinai"], fee: null }, // not in your price list yet
  { ar: "شرم الشيخ", en: ["sharm el sheikh", "sharm el-sheikh", "sharm elsheikh"], fee: 125 },
  { ar: "الفيوم", en: ["fayoum", "faiyum", "fayyum"], fee: 100 },
  { ar: "بني سويف", en: ["beni suef", "bani suef", "beni sweif"], fee: 100 },
  { ar: "المنيا", en: ["minya", "menia", "el minya"], fee: 100 },
  { ar: "أسيوط", en: ["assiut", "asyut", "assiout"], fee: 100 },
  { ar: "سوهاج", en: ["sohag", "suhag"], fee: 100 },
  { ar: "قنا", en: ["qena"], fee: 100 },
  { ar: "الأقصر", en: ["luxor"], fee: 100 },
  { ar: "أسوان", en: ["aswan"], fee: 100 },
  { ar: "البحر الأحمر", en: ["red sea"], fee: 110 },
  { ar: "الوادي الجديد", en: ["new valley"], fee: null }, // not in your price list yet
  { ar: "مطروح", en: ["matrouh", "matruh", "marsa matrouh"], fee: 110 },
];

// Map an <option> string from your `governorates` list (Arabic OR English, with
// or without "ال", any spelling variant) to an index in GOVERNORATES. -1 if unknown.
export function matchGovernorateIndex(option) {
  const n = govKey(option);
  if (!n) return -1;

  const exact = GOVERNORATES.findIndex(
    (g) => govKey(g.ar) === n || g.en.includes(n)
  );
  if (exact !== -1) return exact;

  // Loose match (e.g. "Giza Governorate"): the LONGEST matching name wins, so
  // "جنوب سيناء - شرم الشيخ" picks "شرم الشيخ" rather than "جنوب سيناء".
  let best = -1;
  let bestLen = 0;
  GOVERNORATES.forEach((g, i) => {
    [govKey(g.ar), ...g.en].forEach((name) => {
      if (name.length > bestLen && n.includes(name)) {
        best = i;
        bestLen = name.length;
      }
    });
  });
  return best;
}

// Index (from the parser) -> the exact string used in your <select> options.
export function findGovernorateOption(index, options = []) {
  if (index < 0) return null;
  return options.find((o) => matchGovernorateIndex(o) === index) ?? null;
}

// Default shipping fee for a <select> option, or null if not configured.
export function getShippingFeeFor(option) {
  const i = matchGovernorateIndex(option);
  return i >= 0 ? GOVERNORATES[i].fee : null;
}