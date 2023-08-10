require('dotenv').config() // load variables from .env file into the node environment
const express = require('express'); // Using express.js framework here
const { Pool } = require('pg'); // Using postgres, hence pg here. 
const cors = require('cors'); // enables Cross-Origin Resource Sharing (CORS) using the `cors` middleware. Allows my server to handle requests coming from different frontend apps running on other domains. Idk, there was this error and it seems the way to fix it is by adding this line :shrug:. My guess is this would allow my server to respond to requests coming from cloudflare, render.com (not necessarily from sirstandforraffles.sg)

const app = express(); // creates an intance of the Express app
// creates a connection pool to the PG DB. It's called pool because it manages a pool of database connections, which helps improve performance and scalability.

console.log('db host', process.env.DB_HOST)
const pool = new Pool({
  // abstracted these to .env file, so that the app will use different variables based on which environment it's running on. For prod, it's entered in render.com
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

// Enables CORS
app.use(cors());

// Define the API endpoint
app.get('/api/search', (req, res) => { // /api/search is the GET request path; `req` is the request object; `res` is the response object
  const { acronym } = req.query; // extracts the `acronym` from the request object i.e. `req` (see line 30 in script.js)

  // Query the database for exact matches
  pool.query(
    `SELECT * FROM known_initialisms WHERE initialism = $1`,
    [acronym.toUpperCase()], // actually the frontend already uppercases the string, so this is kinda redundant. but screw it, it works i don't want to touch.
    (error, results) => { // it either returns an error or result(s)
      if (error) { // if error
        console.error('Error:', error); // print the error in the console
        res.status(500).json({ error: 'Internal server error' }); // send 500 error as a response with 'Internal server error'
      } else {
        if (results.rows.length > 0) { // if got matches...
          // Return the array of matching rows
          res.json({ found: true, results: results.rows });
        } else {
          // if got no matches...
          res.json({ found: false, initialism: acronym }); // return found false and the acronym (so that the frontend can show it in the suggestionForm)
        }
      }
    }
  );
});

// Allows Express.js to serve static files from a directory. In my case, it serves my index.html that's in the root directory of my app.

app.use(express.static('.'))

app.use(express.json()); // It allows express to understand json payloads. Frontend sends requests with JSON (see line 204 of script.js for example)

app.post('/api/suggest', (req, res) => { // suggest endpoint for when no matches are found from the initial search.
  const { acronym, meaning, suggester } = req.body;

  // Insert the suggestion into the database
  pool.query(
    `INSERT INTO known_initialisms (initialism, meaning, suggester) VALUES ($1, $2, $3)`, // values in the array of the second argument (next line) to be inserted in this order into column headers of the table.
    [acronym.toUpperCase(), meaning, suggester], // i.e. value of `acronym.toUpperCase() --> initialism, value of `meaning` to `meaning`, and `suggester` to `suggester`.
    (error, results) => {
      if (error) {
        console.error('Error:', error); // print error in the console if shit happens
        res.status(500).json({ error: 'Internal server error' }); // return error in the response body so frontend can display it to the user
      } else {
        res.json({ success: true, initialism: acronym, meaning: meaning }); // if ok then return success true along with the added acronym and its meaning (we display it in the success message)
      }
    }
  );
});

const port = process.env.PORT || 3000; // note that I haven't specify PORT in prod environment variables yet

app.listen(port, () => {
  console.log(`Server started on port ${port}`); // references .env file when starting server. Logs it on console.
});
