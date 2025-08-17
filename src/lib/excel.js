const XLSX = require('xlsx');
const { readFile } = require('fs/promises');

async function readXlsxRows(filePath) {
  const buf = await readFile(filePath);
  const wb = XLSX.read(buf, { type: 'buffer' });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(ws);
  return rows;
}

module.exports = { readXlsxRows };