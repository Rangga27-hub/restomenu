const express = require('express');
const cors = require('cors');
require('dotenv').config();

const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const tableRoutes = require('./routes/tables');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'RestoMenu API berjalan!' });
});

app.listen(PORT, () => {
  console.log('Server berjalan di http://localhost:' + PORT);
});