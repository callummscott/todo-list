import express from "express";
import pg from "pg";


function checkEnvVariables() {
  const requiredEnvVars = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASSWORD', 'DB_PORT'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length === 0) { return; }
  
  console.error(`Error: Missing required environment variables: ${missingVars.join(', ')}`);
  missingVars.forEach(varName => console.error(`  - ${varName}`));
  process.exit(1);
}

function logRequests(req, res, next) {
  console.log(`${req.method}  "${req.url}"`);
  if (req.method === 'POST') console.log(`  Body: ${JSON.stringify(req.body)}`);
  next();
}


// Initialize Express app and PostgreSQL client
const app = express();
const PORT = process.env.PORT || 3000;

checkEnvVariables();
const pool = new pg.Pool({
  user:      process.env.DB_USER,
  host:      process.env.DB_HOST,
  database:  process.env.DB_NAME,
  password:  process.env.DB_PASSWORD,
  port:      process.env.DB_PORT
});


try {
  await pool.query('SELECT 1;');
  console.log("Database connected");
} catch (err) {
  console.error("Database connection failed", err);
  process.exit(1);
}

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());
if (process.env.LOGGING == 'true') { app.use(logRequests); }


app.get("/api/items", async (req, res, next) => {
  try {
    const { rows: items } = await pool.query("SELECT * FROM items ORDER BY id ASC;");
    res.json(items);
  } catch (err) {
    next(err);
  }
});


app.post("/api/items", async (req, res, next) => {
  const { text } = req.body;

  if (!text || text.trim() === "") return res.status(400).json({ error: "Item text cannot be empty" });
  if (text.length > 100) return res.status(400).json({ error: "Item text cannot exceed 100 characters" });

  try {
    const { rows } = await pool.query("INSERT INTO items (text) VALUES ($1) RETURNING *;", [text]);
    res.status(201).json(rows[0]); // New resource created.
  } catch (err) {
    next(err);
  }
});


app.put("/api/items/:id", async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const { text } = req.body;

  if (isNaN(id)) return res.status(400).json({ error: "Invalid item ID" });

  if (!text || text.trim() === "") return res.status(400).json({ error: "Item text cannot be empty" });
  if (text.length > 100) return res.status(400).json({ error: "Item text cannot exceed 100 characters" });

  try {
    const result = await pool.query("UPDATE items SET text=$1 WHERE id=$2 RETURNING *;", [text, id]);
    if (result.rowCount === 0) {
      console.error(`Item ID '${id}' not found`);
      return res.status(404).json({ error: `Item ID not found` });
    }
    res.sendStatus(200); // Resource successfully updated.
  } catch (err) {
    next(err);
  }
});


app.delete("/api/items/:id", async (req, res, next) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) return res.status(400).json({ error: "Invalid item ID" });

  try {
    const result = await pool.query("DELETE FROM items WHERE id=$1;", [id]);

    if (result.rowCount === 0) {
      console.error(`Couldn't delete item '${id}'`);
      return res.status(404).json({ error: "Item ID not found" });
    }

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});


/**
 * Global catchall error handling.
 */
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error'
  });
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
