const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const pool = new Pool({
  user: 'donyadajan',
  host: 'localhost',
  database: 'known_initialisms',
  password: '',
  port: 5432,
});

// Enable CORS
app.use(cors());

// Define the API endpoint
app.get('/api/search', (req, res) => {
  const { acronym } = req.query;

  // Query the database for exact matches
  pool.query(
    `SELECT * FROM known_initialisms WHERE initialism = $1`,
    [acronym.toUpperCase()],
    (error, results) => {
      if (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        if (results.rows.length > 0) {
          // Return the matching rows
          res.json({ found: true, results: results.rows });
        } else {
          // No match found
          res.json({ found: false, initialism: acronym });
        }
      }
    }
  );
});

app.use(express.static('.'))

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
