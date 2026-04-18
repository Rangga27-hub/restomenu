const BASE_URL = 'http://localhost:3001/api';

export const getMenus = async () => {
  const res = await fetch(`${BASE_URL}/menu`);
  return res.json();
};

export const getMenuByCategory = async (category) => {
  const res = await fetch(`${BASE_URL}/menu/category/${category}`);
  return res.json();
};

export const createOrder = async (orderData) => {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  return res.json();
};

export const getOrders = async () => {
  const res = await fetch(`${BASE_URL}/orders`);
  return res.json();
};

export const updateOrderStatus = async (id, status) => {
  const res = await fetch(`${BASE_URL}/orders/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return res.json();
};

export const getOrdersByDateRange = async (startDate, endDate) => {
  const res = await fetch(`${BASE_URL}/orders?start=${startDate}&end=${endDate}`);
  return res.json();
};