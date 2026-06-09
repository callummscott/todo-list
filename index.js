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
const db = new pg.Pool({
  user:      process.env.DB_USER,
  host:      process.env.DB_HOST,
  database:  process.env.DB_NAME,
  password:  process.env.DB_PASSWORD,
  port:      process.env.DB_PORT
})


db.connect().catch(err => {
  console.error("Failed to connect to the database:", err);
  process.exit(1);
});

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());
if (process.env.LOGGING == 'true') { app.use(logRequests); }


app.get("/api/items", async (req, res) => {
  const { rows: items } = await db.query("SELECT * FROM items ORDER BY id ASC;");

  return res.status(200).json(items);
});


app.post("/api/items", async (req, res) => {
  const { text } = req.body;

  // Skip trying to submit empty strings.
  if (!text || text.trim() === "") {
    return res.status(400).json({ error: "Text cannot be empty" });
  }
  const { rows } = await db.query("INSERT INTO items (text) VALUES ($1) RETURNING *;", [text]);
  
  return res.status(201).json(rows[0]); // New resource created.
});


app.put("/api/items/:id", async (req, res, next) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).json({ error: "Text cannot be empty" });
  };
  if (text.length > 100) {
    return res.status(400).json({ error: "Text cannot exceed 100 characters" });
  };
  // Ideally send feedback to the user if the above conditions aren't met.
  await db.query("UPDATE items SET text=$1 WHERE id=$2;", [text, id]);

  res.sendStatus(200); // Resource successfully updated.
});


app.delete("/api/items/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM items WHERE id=$1;", [id]);
    res.sendStatus(200); // Resource successfully deleted.
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
