const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// GET semua meja
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('tables')
    .select('*')
    .order('table_number');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST tambah meja baru
router.post('/', async (req, res) => {
  const { table_number } = req.body;

  const { data, error } = await supabase
    .from('tables')
    .insert([{ table_number }])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

module.exports = router;