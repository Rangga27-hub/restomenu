import { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from '../api';
import { exportToExcel } from '../utils/excelExport';
import { supabase } from '../supabase';

const STATUS_COLOR = {
  pending: { bg: '#fef3c7', color: '#d97706', label: 'Menunggu' },
  preparing: { bg: '#dbeafe', color: '#2563eb', label: 'Diproses' },
  done: { bg: '#dcfce7', color: '#16a34a', label: 'Selesai' },
  cancelled: { bg: '#fee2e2', color: '#dc2626', label: 'Dibatal' },
};

const NEXT_STATUS = { pending: 'preparing', preparing: 'done' };
const NEXT_LABEL = { pending: '👨‍🍳 Proses', preparing: '✅ Selesai' };
const NAVY = '#1e3a5f';

const today = () => new Date().toISOString().split('T')[0];

export default function DashboardPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('semua');
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState(today());
  const [exporting, setExporting] = useState(false);
  const [menuTab, setMenuTab] = useState('orders');
  const [menuList, setMenuList] = useState([]);

  const fetchOrders = async () => {
    const data = await getOrders();
    setOrders(data);
    setLoading(false);
  };

  const fetchMenus = async () => {
    const res = await fetch('http://localhost:3001/api/menu/all');
    const data = await res.json();
    setMenuList(data);
  };

  useEffect(() => {
    fetchOrders();
    fetchMenus();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch(`http://localhost:3001/api/orders?start=${startDate}&end=${endDate}`);
      const data = await res.json();
      if (data.length === 0) {
        alert('Tidak ada data order di rentang tanggal ini.');
        return;
      }
      exportToExcel(data, startDate, endDate);
    } catch (e) {
      alert('Gagal export: ' + e.message);
    } finally {
      setExporting(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    await updateOrderStatus(id, status);
    fetchOrders();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const toggleAvailable = async (id, currentStatus) => {
    await fetch(`http://localhost:3001/api/menu/${id}/toggle`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_available: !currentStatus }),
    });
    fetchMenus();
  };

  const filteredOrders = filter === 'semua'
    ? orders
    : orders.filter(o => o.status === filter);

  const countByStatus = (status) => orders.filter(o => o.status === status).length;
  const totalPendapatan = orders.filter(o => o.status === 'done').reduce((s, o) => s + o.total_price, 0);

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f8fafc' }}>

      {/* Header */}
      <div style={{ background: NAVY, color: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Dashboard Owner</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={fetchOrders}
            style={{ background: 'white', color: NAVY, border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
            🔄 Refresh
          </button>
          <button onClick={handleLogout}
            style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '13px' }}>
            Logout
          </button>
        </div>
      </div>

      {/* Tab */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: 'white', padding: '0 2rem' }}>
        {['orders', 'menu'].map(tab => (
          <button key={tab} onClick={() => setMenuTab(tab)}
            style={{ padding: '12px 16px', border: 'none', borderBottom: menuTab === tab ? `2px solid ${NAVY}` : '2px solid transparent', background: 'none', cursor: 'pointer', fontWeight: menuTab === tab ? 600 : 400, color: menuTab === tab ? NAVY : '#64748b', fontSize: '14px' }}>
            {tab === 'orders' ? '📋 Orders' : '🍽️ Kelola Menu'}
          </button>
        ))}
      </div>

      {menuTab === 'orders' ? (
        <>
          {/* Summary Cards */}
          <div style={{ display: 'flex', gap: '12px', padding: '1.5rem 2rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Semua Order', value: orders.length, bg: '#f1f5f9', color: '#1e293b' },
              { label: 'Menunggu', value: countByStatus('pending'), bg: '#fef3c7', color: '#d97706' },
              { label: 'Diproses', value: countByStatus('preparing'), bg: '#dbeafe', color: '#2563eb' },
              { label: 'Selesai', value: countByStatus('done'), bg: '#dcfce7', color: '#16a34a' },
              { label: 'Pendapatan', value: `Rp ${totalPendapatan.toLocaleString('id-ID')}`, bg: '#eff6ff', color: NAVY },
            ].map(card => (
              <div key={card.label} style={{ background: card.bg, borderRadius: '12px', padding: '1rem 1.5rem', minWidth: '120px', textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: card.color }}>{card.value}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>{card.label}</div>
              </div>
            ))}
          </div>

          {/* Export Section */}
          <div style={{ margin: '0 2rem 1.5rem', background: 'white', borderRadius: '12px', padding: '1rem 1.5rem', border: '1px solid #e2e8f0', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b' }}>📊 Export Excel</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1, flexWrap: 'wrap' }}>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#1e293b' }} />
              <span style={{ color: '#64748b', fontSize: '13px' }}>s/d</span>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#1e293b' }} />
              <button onClick={handleExport} disabled={exporting}
                style={{ padding: '7px 16px', background: NAVY, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', opacity: exporting ? 0.7 : 1 }}>
                {exporting ? 'Loading...' : '⬇️ Download'}
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', padding: '0 2rem 1rem' }}>
            {['semua', 'pending', 'preparing', 'done'].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                style={{ padding: '5px 14px', borderRadius: '20px', border: filter === s ? 'none' : `1px solid #e2e8f0`, background: filter === s ? NAVY : 'white', color: filter === s ? 'white' : '#64748b', cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}>
                {s === 'semua' ? 'Semua' : STATUS_COLOR[s].label}
              </button>
            ))}
          </div>

          {/* Order List */}
          <div style={{ padding: '0 2rem 2rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {loading ? <p style={{ color: '#64748b' }}>Loading...</p>
              : filteredOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  <div style={{ fontSize: '3rem' }}>📋</div>
                  <p>Belum ada order</p>
                </div>
              ) : filteredOrders.map(order => (
                <div key={order.id} style={{ background: 'white', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <strong style={{ color: '#1e293b' }}>Meja {order.tables?.table_number ?? '-'}</strong>
                      <span style={{ marginLeft: '8px', background: STATUS_COLOR[order.status].bg, color: STATUS_COLOR[order.status].color, padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                        {STATUS_COLOR[order.status].label}
                      </span>
                    </div>
                    <small style={{ color: '#94a3b8' }}>
                      {new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </small>
                  </div>
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginBottom: '10px' }}>
                    {order.items.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: '13px', color: '#475569' }}>
                        <span>{item.name} <span style={{ color: '#94a3b8' }}>x{item.qty}</span></span>
                        <span>Rp {(item.price * item.qty).toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: NAVY }}>Total: Rp {order.total_price.toLocaleString('id-ID')}</strong>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {NEXT_STATUS[order.status] && (
                        <button onClick={() => handleUpdateStatus(order.id, NEXT_STATUS[order.status])}
                          style={{ background: NAVY, color: 'white', border: 'none', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
                          {NEXT_LABEL[order.status]}
                        </button>
                      )}
                      {order.status === 'pending' && (
                        <button onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                          style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '13px' }}>
                          Batalkan
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </>
      ) : (
        /* Kelola Menu */
        <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h3 style={{ margin: '0 0 1rem', color: '#1e293b', fontSize: '16px' }}>Kelola Ketersediaan Menu</h3>
          {menuList.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center' }}>Loading...</p>
          ) : menuList.map(item => (
            <div key={item.id} style={{ background: 'white', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 500, fontSize: '14px', color: '#1e293b' }}>{item.name}</p>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                  {item.category} · Rp {item.price.toLocaleString('id-ID')}
                </p>
              </div>
              <button onClick={() => toggleAvailable(item.id, item.is_available)}
                style={{ padding: '6px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '12px', background: item.is_available ? '#dcfce7' : '#fee2e2', color: item.is_available ? '#16a34a' : '#dc2626' }}>
                {item.is_available ? '✅ Tersedia' : '❌ Habis'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}