import { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from '../api';

const STATUS_COLOR = {
  pending: { bg: '#fef3c7', color: '#d97706', label: 'Menunggu' },
  preparing: { bg: '#dbeafe', color: '#2563eb', label: 'Diproses' },
  done: { bg: '#dcfce7', color: '#16a34a', label: 'Selesai' },
  cancelled: { bg: '#fee2e2', color: '#dc2626', label: 'Dibatal' },
};

const NEXT_STATUS = {
  pending: 'preparing',
  preparing: 'done',
};

const NEXT_LABEL = {
  pending: '👨‍🍳 Proses',
  preparing: '✅ Selesai',
};

export default function DashboardPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('semua');

  const fetchOrders = async () => {
    const data = await getOrders();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    // Auto refresh tiap 10 detik
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (id, status) => {
    await updateOrderStatus(id, status);
    fetchOrders();
  };

  const filteredOrders = filter === 'semua'
    ? orders
    : orders.filter(o => o.status === filter);

  const countByStatus = (status) => orders.filter(o => o.status === status).length;

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f9fafb' }}>
      {/* Header */}
      <div style={{ background: '#16a34a', color: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>🍽️ Dashboard Owner</h2>
        <button onClick={fetchOrders} style={{ background: 'white', color: '#16a34a', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 'bold' }}>
          🔄 Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: '1rem', padding: '1.5rem 2rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Semua Order', value: orders.length, bg: '#f3f4f6', color: '#111827' },
          { label: 'Menunggu', value: countByStatus('pending'), bg: '#fef3c7', color: '#d97706' },
          { label: 'Diproses', value: countByStatus('preparing'), bg: '#dbeafe', color: '#2563eb' },
          { label: 'Selesai', value: countByStatus('done'), bg: '#dcfce7', color: '#16a34a' },
        ].map(card => (
          <div key={card.label} style={{ background: card.bg, borderRadius: '12px', padding: '1rem 1.5rem', minWidth: '120px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: card.color }}>{card.value}</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', padding: '0 2rem 1rem' }}>
        {['semua', 'pending', 'preparing', 'done'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding: '0.4rem 1rem', borderRadius: '50px', border: '1px solid #16a34a', background: filter === s ? '#16a34a' : 'white', color: filter === s ? 'white' : '#16a34a', cursor: 'pointer', textTransform: 'capitalize' }}>
            {s === 'semua' ? 'Semua' : STATUS_COLOR[s].label}
          </button>
        ))}
      </div>

      {/* Order List */}
      <div style={{ padding: '0 2rem 2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? <p>Loading...</p> : filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            <div style={{ fontSize: '3rem' }}>📋</div>
            <p>Belum ada order</p>
          </div>
        ) : filteredOrders.map(order => (
          <div key={order.id} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            {/* Order Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <strong>Meja {order.tables?.table_number ?? '-'}</strong>
                <span style={{ marginLeft: '0.75rem', background: STATUS_COLOR[order.status].bg, color: STATUS_COLOR[order.status].color, padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  {STATUS_COLOR[order.status].label}
                </span>
              </div>
              <small style={{ color: '#6b7280' }}>
                {new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </small>
            </div>

            {/* Item List */}
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '0.75rem', marginBottom: '0.75rem' }}>
              {order.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', fontSize: '0.9rem' }}>
                  <span>{item.name} <span style={{ color: '#6b7280' }}>x{item.qty}</span></span>
                  <span>Rp {(item.price * item.qty).toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>

            {/* Total & Action */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ color: '#16a34a' }}>Total: Rp {order.total_price.toLocaleString('id-ID')}</strong>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {NEXT_STATUS[order.status] && (
                  <button onClick={() => handleUpdateStatus(order.id, NEXT_STATUS[order.status])}
                    style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 'bold' }}>
                    {NEXT_LABEL[order.status]}
                  </button>
                )}
                {order.status === 'pending' && (
                  <button onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                    style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer' }}>
                    Batalkan
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}