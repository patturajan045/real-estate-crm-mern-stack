/**
 * Export tabular data directly to an Excel-compatible CSV file with UTF-8 BOM
 * @param {string} filename - Download file name (e.g. 'Leads_Report.csv')
 * @param {Array<string>} headers - Column titles array
 * @param {Array<Array<any>>} rows - 2D data matrix
 */
export function exportToCsv(filename, headers, rows) {
  if (!rows || !rows.length) {
    return false;
  }

  const escapeCell = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    // Escape double quotes by doubling them
    return `"${str.replace(/"/g, '""')}"`;
  };

  const headerLine = headers.map(escapeCell).join(',');
  const rowLines = rows.map((row) => row.map(escapeCell).join(','));
  const csvContent = '\uFEFF' + [headerLine, ...rowLines].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
}
