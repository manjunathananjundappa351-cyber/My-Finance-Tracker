import writeExcelFile from "write-excel-file/browser";

type Row = Record<string, string | number>;

export async function exportToExcel(filename: string, rows: Row[]): Promise<void> {
  if (rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const columns = headers.map((header) => {
    const isNumeric = typeof rows[0][header] === "number";
    return {
      header,
      cell: (row: Row) =>
        isNumeric ? { type: Number, value: row[header] as number } : { type: String, value: row[header] as string },
    };
  });

  await writeExcelFile(rows, { columns }).toFile(filename);
}

export function exportToJson(filename: string, rows: Row[]): void {
  const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
