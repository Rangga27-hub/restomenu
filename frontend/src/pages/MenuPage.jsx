import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getMenus, createOrder } from '../api';
import { ShoppingCart, Plus, Minus, X, Search } from 'lucide-react';

const NAVY = '#1e3a5f';
const NAVY_LIGHT = '#eff6ff';

const getCartKey = (tableId) => `cart_${tableId}`;
const loadCart = (tableId) => {
  try {
    const saved = localStorage.getItem(getCartKey(tableId));
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
};
const saveCart = (tableId, cart) => {
  localStorage.setItem(getCartKey(tableId), JSON.stringify(cart));
};

export default function MenuPage() {
  const { tableId } = useParams();
  const [menus, setMenus] = useState([]);
  const [cart, setCart] = useState(() => loadCart(tableId));
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('http://localhost:3001/api/menu/all')
      .then(res => res.json())
      .then(data => {
        setMenus(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (tableId) saveCart(tableId, cart);
  }, [cart, tableId]);

  const categories = ['Semua', ...new Set(menus.map(m => m.category))];

  const filteredMenus = menus.filter(m => {
    const matchCat = activeCategory === 'Semua' || m.category === activeCategory;
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const groupedMenus = filteredMenus.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const addToCart = (item) => {
    if (!item.is_available) return;
    setCart(prev => {
      const exists = prev.find(c => c.id === item.id);
      if (exists) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => {
      const exists = prev.find(c => c.id === id);
      if (exists.qty === 1) return prev.filter(c => c.id !== id);
      return prev.map(c => c.id === id ? { ...c, qty: c.qty - 1 } : c);
    });
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleOrder = async () => {
    const orderData = {
      table_id: tableId,
      items: cart.map(c => ({ id: c.id, name: c.name, qty: c.qty, price: c.price })),
      total_price: totalPrice,
    };
    await createOrder(orderData);
    localStorage.removeItem(getCartKey(tableId));
    setCart([]);
    setCartOpen(false);
    setOrderSuccess(true);
  };

  if (orderSuccess) return (
    <div style={{ textAlign: 'center', padding: '5rem 2rem', fontFamily: 'sans-serif' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
      <h2 style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b' }}>Pesanan Berhasil!</h2>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>Pesanan kamu sedang diproses oleh dapur.</p>
      <button onClick={() => setOrderSuccess(false)}
        style={{ padding: '0.75rem 2rem', background: NAVY, color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600 }}>
        Pesan Lagi
      </button>
    </div>
  );

  return (
    <div style={{
      width: '100vw',
      maxWidth: '480px',
      margin: '0 auto',
      fontFamily: 'sans-serif',
      background: '#f8fafc',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxSizing: 'border-box',
      position: 'relative'
    }}>

      {/* Header */}
      <div style={{ background: NAVY, padding: '16px', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'white' }}>RestoMenu</h2>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#93c5fd' }}>
            Meja {tableId?.slice(0, 8)}... · {menus.filter(m => m.is_available).length} item tersedia
          </p>
        </div>
        <button onClick={() => setCartOpen(true)}
          style={{ background: 'white', color: NAVY, border: 'none', borderRadius: '20px', padding: '7px 14px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <ShoppingCart size={14} />
          Keranjang
          {totalItems > 0 && (
            <span style={{ background: NAVY, color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
              {totalItems}
            </span>
          )}
        </button>
      </div>

      {/* Search */}
      <div style={{ background: 'white', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Cari menu..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f1f5f9', fontSize: '13px', outline: 'none', boxSizing: 'border-box', color: '#1e293b' }}
          />
        </div>
      </div>

      {/* Kategori */}
      <div style={{ background: 'white', display: 'flex', gap: '8px', padding: '10px 16px', overflowX: 'auto', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            style={{ padding: '5px 14px', borderRadius: '20px', border: activeCategory === cat ? 'none' : '1px solid #e2e8f0', background: activeCategory === cat ? NAVY : 'white', color: activeCategory === cat ? 'white' : '#64748b', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '12px', fontWeight: 500 }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Menu List - SCROLLABLE */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', width: '100%', boxSizing: 'border-box' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading...</div>
        ) : Object.keys(groupedMenus).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
            <p>Menu tidak ditemukan</p>
          </div>
        ) : (
          <div style={{ paddingBottom: '16px' }}>
            {Object.entries(groupedMenus).map(([category, items]) => (
              <div key={category}>
                <div style={{ padding: '14px 16px 6px', fontSize: '11px', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {category}
                </div>
                <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '8px' }}>
                  {items.map(item => {
                    const cartItem = cart.find(c => c.id === item.id);
                    const habis = !item.is_available;
                    return (
                      <div key={item.id} style={{
                        background: 'white',
                        borderRadius: '10px',
                        border: '0.5px solid #e2e8f0',
                        padding: '10px',
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'center',
                        width: '100%',
                        boxSizing: 'border-box',
                        opacity: habis ? 0.65 : 1
                      }}>

                        {/* Gambar */}
                        <div style={{ width: '56px', height: '56px', borderRadius: '8px', background: habis ? '#f1f5f9' : NAVY_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
                          {item.category === 'Makanan' ? '🍽️' : item.category === 'Minuman' ? '🥤' : '🍿'}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{item.name}</h3>
                          <p style={{ margin: '2px 0', fontSize: '11px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.description}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: habis ? '#94a3b8' : NAVY }}>
                              Rp {item.price.toLocaleString('id-ID')}
                            </p>
                            {habis && (
                              <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: '10px', fontWeight: 600, padding: '2px 7px', borderRadius: '4px' }}>
                                Stok Habis
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Tombol */}
                        {habis ? (
                          <button disabled style={{ width: '30px', height: '30px', borderRadius: '8px', border: 'none', background: '#e2e8f0', color: '#94a3b8', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Plus size={15} />
                          </button>
                        ) : cartItem ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                            <button onClick={() => removeFromCart(item.id)}
                              style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Minus size={12} />
                            </button>
                            <span style={{ fontSize: '13px', fontWeight: 600, minWidth: '18px', textAlign: 'center', color: '#1e293b' }}>{cartItem.qty}</span>
                            <button onClick={() => addToCart(item)}
                              style={{ width: '26px', height: '26px', borderRadius: '6px', border: 'none', background: NAVY, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Plus size={12} />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => addToCart(item)}
                            style={{ width: '30px', height: '30px', borderRadius: '8px', border: 'none', background: NAVY, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Plus size={15} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Drawer */}
      {cartOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 20 }}>
          <div onClick={() => setCartOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', background: 'white', borderRadius: '20px 20px 0 0', padding: '20px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontWeight: 600, color: '#1e293b' }}>Keranjang</h3>
              <button onClick={() => setCartOpen(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛒</div>
                <p>Keranjang masih kosong</p>
              </div>
            ) : (
              <>
                {cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 500, fontSize: '14px', color: '#1e293b' }}>{item.name}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                        Rp {item.price.toLocaleString('id-ID')} × {item.qty}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button onClick={() => removeFromCart(item.id)}
                        style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Minus size={12} />
                      </button>
                      <span style={{ fontWeight: 600, fontSize: '14px', minWidth: '16px', textAlign: 'center', color: '#1e293b' }}>{item.qty}</span>
                      <button onClick={() => addToCart(item)}
                        style={{ width: '26px', height: '26px', borderRadius: '6px', border: 'none', background: NAVY, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Plus size={12} />
                      </button>
                    </div>
                    <p style={{ margin: '0 0 0 12px', fontWeight: 600, fontSize: '14px', minWidth: '80px', textAlign: 'right', color: '#1e293b' }}>
                      Rp {(item.price * item.qty).toLocaleString('id-ID')}
                    </p>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0 0', fontWeight: 600, fontSize: '16px' }}>
                  <span style={{ color: '#1e293b' }}>Total</span>
                  <span style={{ color: NAVY }}>Rp {totalPrice.toLocaleString('id-ID')}</span>
                </div>
                <button onClick={handleOrder}
                  style={{ width: '100%', marginTop: '16px', padding: '14px', background: NAVY, color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>
                  Pesan Sekarang
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}