const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// MySQL database setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'nike_inventory'
});

// Connect to MySQL
db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

// API route to fetch all products
app.get('/api/products', (req, res) => {
  const sql = 'SELECT * FROM products';
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// API route to search products
app.get('/api/products/search', (req, res) => {
  const { q } = req.query;
  console.log('Search Query:', q); // Log the search query
  
  const sql = 'SELECT * FROM products WHERE name LIKE ? OR category LIKE ?';
  db.query(sql, [`%${q}%`, `%${q}%`], (err, results) => {
    if (err) {
      console.error('Error executing query:', err); // Log errors
      return res.status(500).json({ error: 'Database query failed' }); // Return proper error response
    }
    res.json(results); // Return the result as JSON
  });
});

// API route to add a new product
app.post('/api/products', (req, res) => {
  const { name, quantity, price, category, description } = req.body;
  const sql = 'INSERT INTO products (name, quantity, price, category, description) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [name, quantity, price, category, description], (err, result) => {
    if (err) throw err;
    res.json({ message: 'Product added successfully' });
  });
});

// API route to update a product
app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, quantity, price, category, description } = req.body;
  const sql = 'UPDATE products SET name = ?, quantity = ?, price = ?, category = ?, description = ? WHERE id = ?';
  db.query(sql, [name, quantity, price, category, description, id], (err, result) => {
    if (err) throw err;
    res.json({ message: 'Product updated successfully' });
  });
});

// API route to delete a product
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM products WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) throw err;
    res.json({ message: 'Product deleted successfully' });
  });
});

// API route to update only the quantity (status) of a product
app.put('/api/products/:id/status', (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  const sql = 'UPDATE products SET quantity = ? WHERE id = ?';
  db.query(sql, [quantity, id], (err, result) => {
    if (err) {
      console.error('Error updating product status:', err);
      return res.status(500).json({ message: 'Failed to update product status' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product status updated successfully' });
  });
});

// Serve index.html by default for the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
