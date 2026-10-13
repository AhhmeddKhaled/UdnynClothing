import {
  GOVERNORATES,
  normalizeArabic as na,
  normalizeDigits,
} from "./governorates.js";

export { normalizeDigits, normalizeArabic } from "./governorates.js";

// ---------------------------------------------------------------------------
// Phone helpers
// ---------------------------------------------------------------------------

// Keeps only digits/+, converts Arabic digits, and turns +20 / 0020 / 20 prefixes into 0.
export function normalizePhone(value) {
  let s = normalizeDigits(value).replace(/[^\d+]/g, "");
  if (s.startsWith("+20")) s = "0" + s.slice(3);
  else if (s.startsWith("0020")) s = "0" + s.slice(4);
  else if (/^20\d{10}$/.test(s)) s = "0" + s.slice(2);
  return s;
}

export const isValidPhone = (value) => /^01[0125]\d{8}$/.test(value);

// ---------------------------------------------------------------------------
// Parser configuration (all patterns run on the *normalized* line)
// ---------------------------------------------------------------------------

// A line starting with a title is very likely a person's name.
const TITLES =
  /^(دكتور|دكتوره|د\.|استاذ|استاذه|الاستاذ|الاستاذه|الدكتور|الدكتوره|مهندس|مهندسه|م\.|حاج|حاجه|الحاج|الحاجه|سيد|السيد|مدام|ست|الست|كابتن|شيخ)\s/;

// Words that signal an address line.
const ADDRESS_WORDS =
  /شارع|بجوار|بالقرب|متفرع|محافظه|(^|\s)(ال|ب)?(ش|حي|مول|نادي|دور|برج|خلف|امام|فيلا|بلوك|عماره|شقه|مدينه|منطقه|محور|ميدان|مركز|قريه|عزبه|نجع|طريق|كوبري|مجاوره|مربع|قطعه|كمبوند|مدرسه|مسجد|محطه)(\s|$)/;

// Words that mean "this line is NOT a name".
const NOT_A_NAME =
  /ممكن|بيانات|الاجمالي|الوزن|الطول|محيط|الشحن|رقم|تواصل|شكرا|اوردر|مقاس|:/;

// City / district -> governorate, used when no governorate is written.
// (Keep adding to this as you meet new messages; the test set will tell you what breaks.)
const DISTRICTS = [
  ["6 اكتوبر|السادس من اكتوبر|اكتوبر|الشيخ زايد|الهرم|فيصل|العمرانيه|الدقي|المهندسين|امبابه|حدائق الاهرام", "الجيزه"],
  ["التجمع|مدينه نصر|الرحاب|مدينتي|المعادي|الزاويه الحمراء|شبرا|مصر الجديده|عين شمس|المطريه|حلوان|الشروق", "القاهره"],
  ["العاشر من رمضان", "الشرقيه"],
  ["برج العرب|سيدي بشر|العجمي|المنتزه|سموحه|ميامي", "الاسكندريه"],
  ["العبور|شبرا الخيمه|بنها|الخانكه", "القليوبيه"],
];

const govIndexByNormalizedName = (name) =>
  GOVERNORATES.findIndex((g) => na(g.ar) === name);

// ---------------------------------------------------------------------------
// The parser. Stages run from the MOST reliable signal to the weakest, and each
// stage marks the lines it consumed (`used`) so later stages can't steal them.
// ---------------------------------------------------------------------------
export function parseCustomerMessage(raw) {
  const lines = normalizeDigits(raw)
    .replace(/[\u064B-\u0652]/g, "")
    .split("\n")
    .map((l) => l.replace(/[✅✔️*•]/g, "").trim())
    .filter(Boolean);
  const norm = lines.map(na); // same length as `lines`, safe to index together
  const used = new Set();
  const result = {
    name: "",
    phones: [],
    address: "",
    notes: "",
    govIndex: -1,
    statedTotal: null,
    hints: [],
    warnings: [],
  };

  // 1) Phones: strongest signal.
  lines.forEach((line, i) => {
    const squeezed = line.replace(/(\d)[ -](?=\d)/g, "$1"); // "010 6136 2827" -> one number
    const found = squeezed.match(/(?<!\d)(?:\+?20)?0?1[0125]\d{8}(?!\d)/g);
    if (!found) return;
    found.forEach((p) => {
      const phone = normalizePhone(p);
      if (isValidPhone(phone) && !result.phones.includes(phone)) {
        result.phones.push(phone);
      }
    });
    used.add(i);
  });
  const phoneLines = new Set(used);

  // 2) Explicit labels: "الاسم: ..." / "اسم المرسل إليه ثلاثي: ..." / "العنوان: ..."
  lines.forEach((line, i) => {
    if (result.name || used.has(i)) return;
    const m = norm[i].match(
      /^(الاسم|اسم)(?=[\s:：-])(\s+(العميل|المستلم|المرسل اليه|ثلاثي))*\s*[:：-]?\s*/
    );
    if (m && line.length > m[0].length) {
      result.name = line.slice(m[0].length).trim();
      used.add(i);
    }
  });

  lines.forEach((line, i) => {
    if (used.has(i)) return;
    const m = norm[i].match(/^العنوان[^:：]*[:：]\s*/);
    if (m && line.length > m[0].length) {
      result.address = line.slice(m[0].length).trim();
      used.add(i);
    }
  });

  // 3) Weight / height / notes lines.
  const notes = [];
  lines.forEach((line, i) => {
    if (used.has(i) || !/^(الوزن|الطول|محيط|ملاحظ)/.test(norm[i])) return;
    used.add(i);
    const parts = line.split(/[:：]/);
    const value = parts.slice(1).join(":").trim();
    if (value) notes.push(`${parts[0].trim()}: ${value}`);
  });

  // 4) Address by keywords: take the WHOLE line whenever it contains one.
  //    (Must run before the name guess, otherwise an address line can become the name.)
  if (!result.address) {
    const parts = [];
    lines.forEach((line, i) => {
      if (!used.has(i) && ADDRESS_WORDS.test(norm[i])) {
        parts.push(line);
        used.add(i);
      }
    });
    result.address = parts.join("، ");
  }

  // 5) Name guess: weakest signal, so it only looks at what is left.
  if (!result.name) {
    const candidates = [];
    lines.forEach((line, i) => {
      if (used.has(i) || /\d/.test(line) || NOT_A_NAME.test(norm[i])) return;
      const words = line.split(/\s+/).length;
      if (words < 2 || words > 4) return; // names are 2-4 words
      let score = 0;
      if (TITLES.test(`${norm[i]} `)) score += 3;
      if (phoneLines.has(i - 1) || phoneLines.has(i + 1)) score += 2;
      candidates.push({ i, line, score });
    });

    if (candidates.length) {
      candidates.sort((a, b) => b.score - a.score || a.i - b.i);
      result.name = candidates[0].line;
      used.add(candidates[0].i);

      const others = candidates.slice(1).filter((c) => c.score >= 3);
      if (others.length) {
        others.forEach((c) => used.add(c.i));
        notes.push(`Other name: ${others.map((c) => c.line).join("، ")}`);
        result.warnings.push("multiple-names");
      }
    }
  }
  result.notes = notes.join(" | ");

  // 6) Governorate: an explicit name wins (LAST match, because the governorate
  //    is usually at the end: "العمرانية الشرقية الجيزة" -> الجيزة, not الشرقية).
  //    If none is written, fall back to the district dictionary.
  const haystack = na(result.address || normalizeDigits(raw));
  let bestPos = -1;
  GOVERNORATES.forEach((g, i) => {
    const pos = haystack.lastIndexOf(na(g.ar));
    if (pos > bestPos) {
      bestPos = pos;
      result.govIndex = i;
    }
  });
  if (bestPos === -1) {
    DISTRICTS.forEach(([words, govName]) =>
      words.split("|").forEach((word) => {
        const pos = haystack.lastIndexOf(word);
        if (pos > bestPos) {
          bestPos = pos;
          result.govIndex = govIndexByNormalizedName(govName);
        }
      })
    );
  }

  // 7) Total stated in the message (the LAST "الاجمالي ..." wins, e.g. "الاجمالي بالشحن 670").
  const totals = [...na(normalizeDigits(raw)).matchAll(/الاجمالي[^\d\n]*(\d+)/g)];
  if (totals.length) result.statedTotal = Number(totals[totals.length - 1][1]);

  // 8) Leftover lines ending with a number look like products: show them as hints only.
  lines.forEach((line, i) => {
    if (
      !used.has(i) &&
      /[\u0600-\u06FF]/.test(line) &&
      /\d+\s*$/.test(line) &&
      !/الاجمالي/.test(norm[i])
    ) {
      result.hints.push(line);
    }
  });

  return result;
}