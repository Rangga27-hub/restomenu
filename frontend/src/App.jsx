import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MenuPage from './pages/MenuPage';
import DashboardPage from './pages/DashboardPage';
import QRPage from './pages/QRPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/menu/:tableId" element={<MenuPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/qr" element={<QRPage />} />
        <Route path="/" element={
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>RestoMenu</h1>
            <p>Scan QR code di meja untuk memesan</p>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;