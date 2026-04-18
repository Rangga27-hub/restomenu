import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const BASE_URL = 'http://localhost:5174';

export default function QRPage() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/tables')
      .then(res => res.json())
      .then(data => {
        setTables(data);
        setLoading(false);
      });
  }, []);

  const handlePrint = () => window.print();

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      {/* Header - disembunyikan saat print */}
      <div className="no-print" style={{ background: '#16a34a', color: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>🖨️ QR Code Meja</h2>
        <button onClick={handlePrint}
          style={{ background: 'white', color: '#16a34a', border: 'none', borderRadius: '8px', padding: '0.5rem 1.5rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
          🖨️ Print Semua
        </button>
      </div>

      {/* CSS Print */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .qr-card { page-break-inside: avoid; }
          body { background: white; }
        }
      `}</style>

      {/* QR Grid */}
      {loading ? <p style={{ textAlign: 'center', padding: '2rem' }}>Loading...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem', padding: '2rem' }}>
          {tables.map(table => (
            <div key={table.id} className="qr-card"
              style={{ border: '2px solid #16a34a', borderRadius: '16px', padding: '2rem', textAlign: 'center', background: 'white' }}>
              <h3 style={{ margin: '0 0 0.5rem', color: '#16a34a', fontSize: '1.5rem' }}>
                🍽️ RestoMenu
              </h3>
              <p style={{ margin: '0 0 1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                Scan untuk memesan
              </p>
              <QRCodeSVG
                value={`${BASE_URL}/menu/${table.id}`}
                size={180}
                bgColor="white"
                fgColor="#16a34a"
                level="H"
              />
              <h2 style={{ margin: '1rem 0 0', fontSize: '2rem' }}>
                Meja {table.table_number}
              </h2>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}