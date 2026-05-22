/**
 * Stokbar Umatis — Export laporan ke CSV (rapi, Excel-friendly)
 */

function escapeCsvCell(value) {
  const s = value == null ? "" : String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function rowsToCsv(columns, rows) {
  const header = columns.map((c) => escapeCsvCell(c.label)).join(",");
  const body = rows
    .map((row) => columns.map((c) => escapeCsvCell(c.getValue(row))).join(","))
    .join("\n");
  return "\uFEFF" + header + "\n" + body;
}

function downloadCsv(filename, csvContent) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportTransactionsCsv(transactions) {
  const columns = [
    { label: "No", getValue: (_, i) => i + 1 },
    { label: "Tanggal", getValue: (t) => formatDate(t.date) },
    { label: "Tipe", getValue: (t) => (t.type === "in" ? "Masuk" : "Keluar") },
    { label: "Nama Barang", getValue: (t) => t.itemName },
    { label: "Jumlah", getValue: (t) => t.quantity },
    { label: "Satuan", getValue: (t) => t.unit },
    { label: "Catatan", getValue: (t) => t.note || "-" },
    { label: "Petugas", getValue: (t) => t.userName },
    { label: "Waktu Input", getValue: (t) => formatDateTime(t.createdAt) },
  ];
  const rows = transactions.map((t, i) => {
    const row = { ...t };
    row._index = i;
    return row;
  });
  const csv = rowsToCsv(
    columns,
    transactions.map((t, idx) => {
      const proxy = { ...t, _i: idx };
      return proxy;
    })
  );
  // Fix No column
  const fixedColumns = columns;
  const header = fixedColumns.map((c) => escapeCsvCell(c.label)).join(",");
  const body = transactions
    .map((t, idx) =>
      fixedColumns
        .map((c) => {
          if (c.label === "No") return escapeCsvCell(idx + 1);
          return escapeCsvCell(c.getValue(t, idx));
        })
        .join(",")
    )
    .join("\n");
  const full = "\uFEFF" + header + "\n" + body;
  const date = new Date().toISOString().slice(0, 10);
  downloadCsv(`Laporan_Transaksi_${date}.csv`, full);
}

function exportInventoryCsv(items) {
  const columns = [
    { label: "No" },
    { label: "SKU" },
    { label: "Nama Barang" },
    { label: "Kategori" },
    { label: "Stok Saat Ini" },
    { label: "Satuan" },
    { label: "Stok Minimum" },
    { label: "Status" },
    { label: "Deskripsi" },
  ];
  const header = columns.map((c) => escapeCsvCell(c.label)).join(",");
  const body = items
    .map((item, idx) => {
      const status =
        item.stock <= item.minStock * 0.5
          ? "Kritis"
          : item.stock <= item.minStock
            ? "Menipis"
            : "Aman";
      return [
        idx + 1,
        item.sku || "-",
        item.name,
        item.category,
        item.stock,
        item.unit,
        item.minStock,
        status,
        item.description || "-",
      ]
        .map(escapeCsvCell)
        .join(",");
    })
    .join("\n");
  const full = "\uFEFF" + header + "\n" + body;
  const date = new Date().toISOString().slice(0, 10);
  downloadCsv(`Laporan_Stok_${date}.csv`, full);
}

function exportFullReportCsv(transactions, inventory) {
  const date = new Date().toISOString().slice(0, 10);
  const lines = [
    "LAPORAN STOKBAR UMATIS",
    `Tanggal Export,${date}`,
    `Total Barang Katalog,${inventory.length}`,
    `Total Transaksi,${transactions.length}`,
    "",
    "=== RINGKASAN STOK ===",
    "No,SKU,Nama,Kategori,Stok,Satuan,Min Stok,Status",
  ];
  inventory.forEach((item, idx) => {
    const status =
      item.stock <= item.minStock ? (item.stock <= item.minStock * 0.5 ? "Kritis" : "Menipis") : "Aman";
    lines.push(
      [idx + 1, item.sku || "-", item.name, item.category, item.stock, item.unit, item.minStock, status]
        .map(escapeCsvCell)
        .join(",")
    );
  });
  lines.push("");
  lines.push("=== RIWAYAT TRANSAKSI ===");
  lines.push("No,Tanggal,Tipe,Barang,Jumlah,Satuan,Catatan,Petugas");
  transactions.forEach((t, idx) => {
    lines.push(
      [
        idx + 1,
        formatDate(t.date),
        t.type === "in" ? "Masuk" : "Keluar",
        t.itemName,
        t.quantity,
        t.unit,
        t.note || "-",
        t.userName,
      ]
        .map(escapeCsvCell)
        .join(",")
    );
  });
  downloadCsv(`Laporan_Lengkap_${date}.csv`, "\uFEFF" + lines.join("\n"));
}
