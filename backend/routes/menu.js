const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// GET semua menu
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .eq('is_available', true)
    .order('category');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET menu by kategori
router.get('/category/:category', async (req, res) => {
  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .eq('category', req.params.category)
    .eq('is_available', true);

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

module.exports = router;