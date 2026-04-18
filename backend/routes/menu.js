const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// GET semua menu termasuk yang tidak available (untuk dashboard owner)
router.get('/all', async (req, res) => {
  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .order('category');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET semua menu (customer - hanya yang available)
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .order('category');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET menu by kategori
router.get('/category/:category', async (req, res) => {
  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .eq('category', req.params.category);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST tambah menu baru (untuk owner)
router.post('/', async (req, res) => {
  const { name, description, price, category, image_url } = req.body;
  const { data, error } = await supabase
    .from('menus')
    .insert([{ name, description, price, category, image_url }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

// PATCH toggle available
router.patch('/:id/toggle', async (req, res) => {
  const { is_available } = req.body;
  const { data, error } = await supabase
    .from('menus')
    .update({ is_available })
    .eq('id', req.params.id)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

module.exports = router;

