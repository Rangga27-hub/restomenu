import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const exportToExcel = (orders, startDate, endDate) => {
  const workbook = XLSX.utils.book_new();

  // ==================
  // SHEET 1 — Rekap Harian
  // ==================
  const rekapByDate = {};

  orders.forEach(order => {
    const date = new Date(order.created_at).toLocaleDateString('id-ID');
    if (!rekapByDate[date]) {
      rekapByDate[date] = {
        tanggal: date,
        total_order: 0,
        total_pendapatan: 0,
        order_selesai: 0,
        order_dibatal: 0,
      };
    }
    rekapByDate[date].total_order += 1;
    rekapByDate[date].total_pendapatan += order.total_price;
    if (order.status === 'done') rekapByDate[date].order_selesai += 1;
    if (order.status === 'cancelled') rekapByDate[date].order_dibatal += 1;
  });

  const rekapData = [
    ['Tanggal', 'Total Order', 'Total Pendapatan (Rp)', 'Order Selesai', 'Order Dibatal'],
    ...Object.values(rekapByDate).map(r => [
      r.tanggal,
      r.total_order,
      r.total_pendapatan,
      r.order_selesai,
      r.order_dibatal,
    ]),
    [],
    ['TOTAL', 
      Object.values(rekapByDate).reduce((s, r) => s + r.total_order, 0),
      Object.values(rekapByDate).reduce((s, r) => s + r.total_pendapatan, 0),
      Object.values(rekapByDate).reduce((s, r) => s + r.order_selesai, 0),
      Object.values(rekapByDate).reduce((s, r) => s + r.order_dibatal, 0),
    ],
  ];

  const sheet1 = XLSX.utils.aoa_to_sheet(rekapData);

  // Style lebar kolom
  sheet1['!cols'] = [
    { wch: 15 }, { wch: 12 }, { wch: 22 }, { wch: 15 }, { wch: 15 }
  ];

  XLSX.utils.book_append_sheet(workbook, sheet1, 'Rekap Harian');

  // ==================
  // SHEET 2 — Menu Terlaris
  // ==================
  const menuStats = {};

  orders
    .filter(o => o.status !== 'cancelled')
    .forEach(order => {
      order.items.forEach(item => {
        if (!menuStats[item.name]) {
          menuStats[item.name] = {
            nama: item.name,
            qty: 0,
            pendapatan: 0,
          };
        }
        menuStats[item.name].qty += item.qty;
        menuStats[item.name].pendapatan += item.price * item.qty;
      });
    });

  const menuSorted = Object.values(menuStats).sort((a, b) => b.qty - a.qty);

  const menuData = [
    ['Nama Menu', 'Qty Terjual', 'Total Pendapatan (Rp)'],
    ...menuSorted.map(m => [m.nama, m.qty, m.pendapatan]),
  ];

  const sheet2 = XLSX.utils.aoa_to_sheet(menuData);
  sheet2['!cols'] = [{ wch: 25 }, { wch: 14 }, { wch: 22 }];

  XLSX.utils.book_append_sheet(workbook, sheet2, 'Menu Terlaris');

  // ==================
  // Generate & Download
  // ==================
  const fileName = `RestoMenu_${startDate}_${endDate}.xlsx`;
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, fileName);
};