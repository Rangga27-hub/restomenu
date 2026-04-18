const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// GET semua order (untuk dashboard owner)
router.get('/', async (req, res) => {
  const { start, end } = req.query;

  let query = supabase
    .from('orders')
    .select('*, tables (table_number)')
    .order('created_at', { ascending: false });

  if (start && end) {
    query = query
      .gte('created_at', new Date(start).toISOString())
      .lte('created_at', new Date(end + 'T23:59:59').toISOString());
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET order by status
router.get('/status/:status', async (req, res) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`*, tables (table_number)`)
    .eq('status', req.params.status)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST buat order baru (dari customer)
router.post('/', async (req, res) => {
  const { table_id, items, total_price } = req.body;

  const { data, error } = await supabase
    .from('orders')
    .insert([{ table_id, items, total_price, status: 'pending' }])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

// PATCH update status order (owner update: pending → preparing → done)
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  const validStatus = ['pending', 'preparing', 'done', 'cancelled'];

  if (!validStatus.includes(status)) {
    return res.status(400).json({ error: 'Status tidak valid' });
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', req.params.id)
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

module.exports = router;

