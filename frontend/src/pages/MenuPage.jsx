import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getMenus, createOrder } from '../api';
import { ShoppingCart, Plus, Minus, X, Search } from 'lucide-react';

export default function MenuPage() {
  const { tableId } = useParams();
  const [menus, setMenus] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getMenus().then(data => {
      setMenus(data);
      setLoading(false);
    });
  }, []);

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
    setCart([]);
    setCartOpen(false);
    setOrderSuccess(true);
  };

  if (orderSuccess) return (
    <div style={{ textAlign: 'center', padding: '5rem 2rem', fontFamily: 'sans-serif' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
      <h2 style={{ fontWeight: 500, marginBottom: '0.5rem' }}>Pesanan Berhasil!</h2>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Pesanan kamu sedang diproses oleh dapur.</p>
      <button onClick={() => setOrderSuccess(false)}
        style={{ padding: '0.75rem 2rem', background: '#16a34a', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 500 }}>
        Pesan Lagi
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', fontFamily: 'sans-serif', background: '#f9fafb', minHeight: '100vh', paddingBottom: '100px' }}>

      {/* Header */}
      <div style={{ background: 'white', padding: '16px', borderBottom: '1px solid #f3f4f6', position: 'sticky', top: 0, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>RestoMenu</h2>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6b7280' }}>
            Meja {tableId?.slice(0, 8)}... · {menus.length} item tersedia
          </p>
        </div>
        <button onClick={() => setCartOpen(true)}
          style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '20px', padding: '8px 16px', cursor: 'pointer', fontWeight: 500, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShoppingCart size={14} />
          Keranjang
          {totalItems > 0 && (
            <span style={{ background: 'white', color: '#16a34a', borderRadius: '50%', width: '18px', height: '18px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
              {totalItems}
            </span>
          )}
        </button>
      </div>

      {/* Search */}
      <div style={{ background: 'white', padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Cari menu..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Kategori */}
      <div style={{ background: 'white', display: 'flex', gap: '8px', padding: '12px 16px', overflowX: 'auto', borderBottom: '1px solid #f3f4f6' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            style={{ padding: '5px 14px', borderRadius: '20px', border: activeCategory === cat ? 'none' : '1px solid #e5e7eb', background: activeCategory === cat ? '#16a34a' : 'white', color: activeCategory === cat ? 'white' : '#6b7280', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '12px', fontWeight: 500 }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Menu List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>Loading...</div>
      ) : Object.keys(groupedMenus).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
          <p>Menu tidak ditemukan</p>
        </div>
      ) : (
        Object.entries(groupedMenus).map(([category, items]) => (
          <div key={category}>
            {/* Section Title */}
            <div style={{ padding: '14px 16px 8px', fontSize: '13px', fontWeight: 600, color: '#6b7280', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {category}
            </div>

            {/* Items */}
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {items.map(item => {
                const cartItem = cart.find(c => c.id === item.id);
                return (
                  <div key={item.id}
                    style={{ background: 'white', borderRadius: '12px', border: '1px solid #f3f4f6', padding: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>

                    {/* Gambar / Emoji placeholder */}
                    <div style={{ width: '64px', height: '64px', borderRadius: '10px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0 }}>
                      {item.category === 'Makanan' ? '🍽️' : item.category === 'Minuman' ? '🥤' : '🍿'}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#111827' }}>{item.name}</h3>
                      <p style={{ margin: '3px 0', fontSize: '12px', color: '#9ca3af', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.description}
                      </p>
                      <p style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: 600, color: '#16a34a' }}>
                        Rp {item.price.toLocaleString('id-ID')}
                      </p>
                    </div>

                    {/* Add / Qty Control */}
                    {cartItem ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <button onClick={() => removeFromCart(item.id)}
                          style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Minus size={14} />
                        </button>
                        <span style={{ fontSize: '14px', fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>{cartItem.qty}</span>
                        <button onClick={() => addToCart(item)}
                          style={{ width: '28px', height: '28px', borderRadius: '8px', border: 'none', background: '#16a34a', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Plus size={14} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(item)}
                        style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#16a34a', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Plus size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Cart Drawer */}
      {cartOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 20 }}>
          <div onClick={() => setCartOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', background: 'white', borderRadius: '20px 20px 0 0', padding: '20px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontWeight: 600 }}>Keranjang</h3>
              <button onClick={() => setCartOpen(false)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛒</div>
                <p>Keranjang masih kosong</p>
              </div>
            ) : (
              <>
                {cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 500, fontSize: '14px' }}>{item.name}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#9ca3af' }}>
                        Rp {item.price.toLocaleString('id-ID')} × {item.qty}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button onClick={() => removeFromCart(item.id)}
                        style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Minus size={12} />
                      </button>
                      <span style={{ fontWeight: 600, fontSize: '14px', minWidth: '16px', textAlign: 'center' }}>{item.qty}</span>
                      <button onClick={() => addToCart(item)}
                        style={{ width: '26px', height: '26px', borderRadius: '6px', border: 'none', background: '#16a34a', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Plus size={12} />
                      </button>
                    </div>
                    <p style={{ margin: '0 0 0 12px', fontWeight: 600, fontSize: '14px', minWidth: '80px', textAlign: 'right' }}>
                      Rp {(item.price * item.qty).toLocaleString('id-ID')}
                    </p>
                  </div>
                ))}

                {/* Total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0 0', fontWeight: 600, fontSize: '16px' }}>
                  <span>Total</span>
                  <span style={{ color: '#16a34a' }}>Rp {totalPrice.toLocaleString('id-ID')}</span>
                </div>

                <button onClick={handleOrder}
                  style={{ width: '100%', marginTop: '16px', padding: '14px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>
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