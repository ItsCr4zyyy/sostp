const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error("Chyba při připojování k databázi:", err.message);
  } else {
    console.log("Připojeno k SQLite databázi.");
  }
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/items', (req, res) => {
  const searchQuery = req.query.q ? `%${req.query.q}%` : '%';
  const sql = `SELECT * FROM library_items WHERE name LIKE ?`;

  db.all(sql, [searchQuery], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.post('/api/checkout/:id', express.json(), (req, res) => {
  const itemId = req.params.id;
  const { dueDate } = req.body;

  const sql = `UPDATE library_items SET is_checked_out = 1, checked_out_until = ? WHERE id = ?`;

  db.run(sql, [dueDate, itemId], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: "Položka byla úspěšně vypůjčena." });
    }
  });
});

app.post('/api/return/:id', (req, res) => {
  const itemId = req.params.id;
  const sql = `UPDATE library_items SET is_checked_out = 0, checked_out_until = NULL WHERE id = ?`;

  db.run(sql, [itemId], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: "Položka byla úspěšně vrácena." });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Started on http://localhost:${PORT}`);
});
