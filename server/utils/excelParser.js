const XLSX = require("xlsx");

function parseSheet(ws) {
  const all = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    defval: null,
  });

  const headIdx = all.findIndex((row) =>
    row.some(
      (cell) =>
        typeof cell === "string" &&
        cell.trim() === "اسم الصنف"
    )
  );

  if (headIdx === -1) {
    throw new Error(
      "مش لاقي عمود اسمه: اسم الصنف"
    );
  }

  const [head, ...body] = all.slice(headIdx);

  const keys = head.map((header, index) =>
    typeof header === "string"
      ? header.trim()
      : index === 0
      ? "م"
      : `col${index}`
  );

  return body
    // استبعاد الصفوف الفاضية
    .map((row) =>
      Object.fromEntries(
        keys.map((key, index) => [
          key,
          row[index] ?? null,
        ])
      )
    )
    .filter((row) => row["اسم الصنف"])
    .map((row) => ({
      itemId: Number(
        row["رقم الصنف"]
      ),

      name: row["اسم الصنف"],

      qty: Number(
        row["إجمالى الكمية"] ?? 0
      ),

      category:
        row["التصنيف"] ?? null,

      manufacturer:
        row["المصنع"] ?? null,

      barcode:
        row["باركود"] != null
          ? String(row["باركود"])
          : null,
    }));
}

module.exports = parseSheet;